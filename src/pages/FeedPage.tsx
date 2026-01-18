import { useState, useEffect } from "react";
import {
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreVertical,
  BookOpen,
  Users,
  Rocket,
  Image as ImageIcon,
  Lightbulb,
  Calendar,
  BookMarked,
  HelpCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  author_id: string;
  post_type: string;
  mode_context: string;
  content: string;
  image_url: string | null;
  project_title: string | null;
  event_title: string | null;
  event_date: string | null;
  event_location: string | null;
  resource_title: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    major: string;
  };
}

export default function FeedPage() {
  const { user } = useUserStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (
            full_name,
            avatar_url,
            major
          )
        `,
        )
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      if (filter !== "all") {
        query = query.eq("mode_context", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Campus Feed</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <FilterTab
              label="All Posts"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterTab
              label="📖 Study"
              active={filter === "study"}
              onClick={() => setFilter("study")}
            />
            <FilterTab
              label="🤝 Social"
              active={filter === "social"}
              onClick={() => setFilter("social")}
            />
            <FilterTab
              label="🚀 Project"
              active={filter === "project"}
              onClick={() => setFilter("project")}
            />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share something!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-primary-600 text-white shadow-lg"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "study":
        return "text-blue-600 bg-blue-50";
      case "social":
        return "text-green-600 bg-green-50";
      case "project":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "study":
        return <BookOpen className="w-4 h-4" />;
      case "social":
        return <Users className="w-4 h-4" />;
      case "project":
        return <Rocket className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <ImageIcon className="w-4 h-4" />;
      case "project":
        return <Rocket className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "resource":
        return <BookMarked className="w-4 h-4" />;
      case "question":
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      // TODO: Remove like from database
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      // TODO: Add like to database
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          {post.profiles.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {post.profiles.full_name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {post.profiles.full_name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getModeColor(post.mode_context)}`}
              >
                {getModeIcon(post.mode_context)}
                {post.mode_context}
              </span>
            </div>
            <p className="text-sm text-gray-600">{post.profiles.major}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Project Post */}
        {post.post_type === "project" && post.project_title && (
          <div className="mb-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-900">PROJECT POST</span>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {post.project_title}
            </h4>
            <p className="text-gray-700">{post.content}</p>
          </div>
        )}

        {/* Event Post */}
        {post.post_type === "event" && post.event_title && (
          <div className="mb-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">EVENT</span>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {post.event_title}
            </h4>
            {post.event_date && (
              <p className="text-sm text-gray-600 mb-1">
                📅{" "}
                {new Date(post.event_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {post.event_location && (
              <p className="text-sm text-gray-600 mb-2">
                📍 {post.event_location}
              </p>
            )}
            <p className="text-gray-700">{post.content}</p>
          </div>
        )}

        {/* Regular Content */}
        {post.post_type !== "project" && post.post_type !== "event" && (
          <p className="text-gray-900 mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-2xl mb-3 object-cover max-h-96"
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            liked ? "bg-red-50 text-red-600" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span className="font-medium">{likesCount}</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.comments_count}</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2 rounded-xl transition-all ${
            saved
              ? "bg-primary-50 text-primary-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>

        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [postType, setPostType] = useState<string>("thought");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<string>("social");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <h2 className="font-bold text-lg">Create Post</h2>
          <button className="text-primary-600 hover:text-primary-700 font-semibold">
            Post
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Post Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <PostTypeButton
                icon="💭"
                label="Thought"
                active={postType === "thought"}
                onClick={() => setPostType("thought")}
              />
              <PostTypeButton
                icon="📸"
                label="Photo"
                active={postType === "photo"}
                onClick={() => setPostType("photo")}
              />
              <PostTypeButton
                icon="🚀"
                label="Project"
                active={postType === "project"}
                onClick={() => setPostType("project")}
              />
              <PostTypeButton
                icon="📅"
                label="Event"
                active={postType === "event"}
                onClick={() => setPostType("event")}
              />
              <PostTypeButton
                icon="📚"
                label="Resource"
                active={postType === "resource"}
                onClick={() => setPostType("resource")}
              />
              <PostTypeButton
                icon="❓"
                label="Question"
                active={postType === "question"}
                onClick={() => setPostType("question")}
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("study")}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  mode === "study"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                📖 Study
              </button>
              <button
                onClick={() => setMode("social")}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  mode === "social"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                🤝 Social
              </button>
              <button
                onClick={() => setMode("project")}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  mode === "project"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                🚀 Project
              </button>
            </div>
          </div>

          {/* Content Input */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-4 bg-gray-50 rounded-2xl resize-none focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/500
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <span className="text-amber-600">⚠️</span>
            <p className="text-sm text-amber-800">
              Photos are scanned for inappropriate content before posting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostTypeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
        active
          ? "bg-primary-600 text-white shadow-lg"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
