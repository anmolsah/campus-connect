import { useState, useEffect } from 'react';
import { Bell, Image, Link2, Heart, MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../../components/ui';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { CommentsModal } from '../../components/feed/CommentsModal';
import type { Post, Profile, Mode } from '../../types';

interface PostWithAuthor extends Post {
  author: Profile;
  is_liked: boolean;
  is_saved: boolean;
}

export const Feed = () => {
  const { user, currentMode, setMode, showOwnCampusOnly, setShowOwnCampusOnly, updateProfile } = useUserStore();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, currentMode, showOwnCampusOnly]);

  const fetchPosts = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*)
        `)
        .eq('moderation_status', 'approved')
        .eq('mode_context', currentMode)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsData) {
        let filteredPosts = postsData as PostWithAuthor[];

        if (showOwnCampusOnly && user.college_name) {
          filteredPosts = filteredPosts.filter((post) =>
            post.author?.college_name === user.college_name
          );
        }

        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const { data: saves } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
        const savedPostIds = new Set(saves?.map((s) => s.post_id) || []);

        const postsWithFlags = filteredPosts.map((post) => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
          is_saved: savedPostIds.has(post.id),
        }));

        setPosts(postsWithFlags);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = async (mode: Mode) => {
    setMode(mode);
    if (user) {
      await supabase
        .from('profiles')
        .update({ current_mode: mode })
        .eq('id', user.id);
      updateProfile({ current_mode: mode });
    }
  };

  const handleCampusToggle = async () => {
    const newValue = !showOwnCampusOnly;
    setShowOwnCampusOnly(newValue);
    if (user) {
      await supabase
        .from('profiles')
        .update({ show_own_campus_only: newValue })
        .eq('id', user.id);
      updateProfile({ show_own_campus_only: newValue });
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: !isLiked,
              likes_count: post.likes_count + (isLiked ? -1 : 1),
            }
          : post
      )
    );
  };

  const getModeColor = (mode: Mode) => {
    switch (mode) {
      case 'study': return 'text-blue-500 bg-blue-50';
      case 'social': return 'text-emerald-500 bg-emerald-50';
      case 'project': return 'text-amber-500 bg-amber-50';
    }
  };

  const getModeLabel = (mode: Mode) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">Campus Connect</span>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(['study', 'social', 'project'] as Mode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {getModeLabel(mode)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-slate-600">Own Campus Only</span>
            <button
              onClick={handleCampusToggle}
              className={`w-11 h-6 rounded-full transition-colors ${
                showOwnCampusOnly ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  showOwnCampusOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-slate-100">
        <div
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Avatar src={user?.avatar_url} name={user?.full_name} size="md" />
          <div className="flex-1">
            <p className="text-slate-400">Share a thought, ask a question...</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <Image className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <Link2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      <main className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <p className="text-slate-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <article key={post.id} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <Avatar src={post.author.avatar_url} name={post.author.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {post.author.full_name}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: false })} ago
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{post.author.major}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getModeColor(post.mode_context)}`}>
                        {getModeLabel(post.mode_context)}
                      </span>
                    </div>

                    {post.content && (
                      <p className="mt-3 text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    )}

                    {post.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full max-h-80 object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-6 mt-3">
                      <button
                        onClick={() => handleLike(post.id, post.is_liked)}
                        className={`flex items-center gap-1.5 ${
                          post.is_liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className="w-5 h-5"
                          fill={post.is_liked ? 'currentColor' : 'none'}
                        />
                        <span className="text-sm">{post.likes_count}</span>
                      </button>

                      <button
                        onClick={() => setSelectedPostId(post.id)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.comments_count}</span>
                      </button>

                      <button className="text-slate-400 hover:text-slate-600">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchPosts();
          }}
        />
      )}

      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onCommentAdded={fetchPosts}
        />
      )}
    </div>
  );
};
