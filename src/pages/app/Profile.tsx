import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, BadgeCheck, GraduationCap, MapPin, Edit2, LogOut,
  BookOpen, Users, Rocket, Bookmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner, ModeBadge } from '../../components/ui';
import { PostCard } from '../../components/feed/PostCard';
import type { Post, Profile as ProfileType } from '../../types';

type Tab = 'posts' | 'saved';

interface PostWithAuthor extends Post {
  author: ProfileType;
  is_liked: boolean;
  is_saved: boolean;
}

export const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout: clearUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ connections: 0, posts: 0 });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);

    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

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

    if (postsData) {
      const postsWithFlags = postsData.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      }));
      setPosts(postsWithFlags);
    }

    if (savedPostIds.size > 0) {
      const { data: savedPostsData } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*)
        `)
        .in('id', Array.from(savedPostIds))
        .order('created_at', { ascending: false });

      if (savedPostsData) {
        const savedWithFlags = savedPostsData.map((post) => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
          is_saved: true,
        }));
        setSavedPosts(savedWithFlags);
      }
    }

    setStats({
      connections: connectionsCount || 0,
      posts: postsData?.length || 0,
    });

    setIsLoading(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }

    const updatePosts = (list: PostWithAuthor[]) =>
      list.map((post) =>
        post.id === postId
          ? { ...post, is_liked: !isLiked, likes_count: post.likes_count + (isLiked ? -1 : 1) }
          : post
      );

    setPosts(updatePosts);
    setSavedPosts(updatePosts);
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    if (!user) return;

    if (isSaved) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
    }

    const updatePosts = (list: PostWithAuthor[]) =>
      list.map((post) => (post.id === postId ? { ...post, is_saved: !isSaved } : post));

    setPosts(updatePosts);

    if (isSaved) {
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setSavedPosts((prev) => [{ ...post, is_saved: true }, ...prev]);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const modeStats = {
    study: posts.filter((p) => p.mode_context === 'study').length,
    social: posts.filter((p) => p.mode_context === 'social').length,
    project: posts.filter((p) => p.mode_context === 'project').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Profile</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/settings')}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="flex items-start gap-4">
            <Avatar src={user.avatar_url} name={user.full_name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  {user.full_name}
                </h2>
                {user.is_verified && (
                  <BadgeCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {user.major}
                  {user.graduation_year && ` '${String(user.graduation_year).slice(-2)}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.college_name}
                </span>
              </div>
              <div className="mt-2">
                <ModeBadge mode={user.current_mode} />
              </div>
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-slate-600">{user.bio}</p>
          )}

          <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{stats.connections}</p>
              <p className="text-xs text-slate-500">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{stats.posts}</p>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/settings')}
            className="btn-secondary w-full mt-4"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              You haven't posted anything yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  onRefresh={fetchUserData}
                />
              ))}
            </div>
          )
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            You haven't saved any posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onRefresh={fetchUserData}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
