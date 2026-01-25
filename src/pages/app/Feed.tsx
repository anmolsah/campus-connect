import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { LoadingSpinner } from '../../components/ui';
import { PostCard } from '../../components/feed/PostCard';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import type { Post, Profile, Mode, PostType } from '../../types';

type FilterType = 'all' | Mode | PostType;

interface PostWithAuthor extends Post {
  author: Profile;
  is_liked: boolean;
  is_saved: boolean;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'study', label: 'Study' },
  { value: 'social', label: 'Social' },
  { value: 'project', label: 'Project' },
];

export const Feed = () => {
  const { user } = useUserStore();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, activeFilter]);

  const fetchPosts = async () => {
    if (!user) return;

    setIsLoading(true);

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (activeFilter !== 'all') {
      if (['study', 'social', 'project'].includes(activeFilter)) {
        query = query.eq('mode_context', activeFilter);
      } else {
        query = query.eq('post_type', activeFilter);
      }
    }

    const { data: postsData } = await query;

    if (postsData) {
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

      const postsWithFlags = postsData.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      }));

      setPosts(postsWithFlags);
    }

    setIsLoading(false);
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

  const handleSave = async (postId: string, isSaved: boolean) => {
    if (!user) return;

    if (isSaved) {
      await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('saved_posts')
        .insert({ post_id: postId, user_id: user.id });
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, is_saved: !isSaved } : post
      )
    );
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-slate-900">Campus Feed</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary py-2 px-3 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${activeFilter === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No posts yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              Be the first to share something with your campus!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary mt-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onRefresh={fetchPosts}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
};
