import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal, Rocket, Calendar,
  BookOpen, HelpCircle, ExternalLink, MapPin, Clock
} from 'lucide-react';
import { Avatar, ModeBadge } from '../ui';
import { CommentsModal } from './CommentsModal';
import type { Post, Profile, PostType } from '../../types';

interface PostWithAuthor extends Post {
  author: Profile;
  is_liked: boolean;
  is_saved: boolean;
}

interface PostCardProps {
  post: PostWithAuthor;
  onLike: (postId: string, isLiked: boolean) => void;
  onSave: (postId: string, isSaved: boolean) => void;
  onRefresh: () => void;
}

const postTypeIcons: Record<PostType, typeof Heart> = {
  thought: MessageCircle,
  photo: Heart,
  project: Rocket,
  event: Calendar,
  resource: BookOpen,
  question: HelpCircle,
};

export const PostCard = ({ post, onLike, onSave, onRefresh }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLike = () => {
    setIsLikeAnimating(true);
    onLike(post.id, post.is_liked);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const Icon = postTypeIcons[post.post_type];

  return (
    <>
      <div className="card overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={post.author.avatar_url}
                name={post.author.full_name}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-slate-900">
                  {post.author.full_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  <span>-</span>
                  <ModeBadge mode={post.mode_context} />
                </div>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {post.post_type === 'project' && post.project_title && (
            <div className="mt-4 p-4 bg-project-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-project-dark" />
                <span className="font-semibold text-project-dark">PROJECT</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{post.project_title}</h4>
              {post.content && (
                <p className="mt-2 text-slate-700">{post.content}</p>
              )}
              {post.roles_needed && post.roles_needed.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-600 mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {post.roles_needed.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-white rounded-full text-xs font-medium text-project-dark"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {post.post_type === 'event' && post.event_title && (
            <div className="mt-4 p-4 bg-study-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-study-dark" />
                <span className="font-semibold text-study-dark">EVENT</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{post.event_title}</h4>
              {post.content && (
                <p className="mt-2 text-slate-700">{post.content}</p>
              )}
              <div className="mt-3 space-y-2 text-sm">
                {post.event_date && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(post.event_date).toLocaleString()}</span>
                  </div>
                )}
                {post.event_location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{post.event_location}</span>
                  </div>
                )}
              </div>
              {post.event_rsvp_link && (
                <a
                  href={post.event_rsvp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-study-dark font-medium hover:underline"
                >
                  RSVP <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {post.post_type === 'resource' && post.resource_title && (
            <div className="mt-4 p-4 bg-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-600">RESOURCE</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{post.resource_title}</h4>
              {post.content && (
                <p className="mt-2 text-slate-700">{post.content}</p>
              )}
              {post.resource_tags && post.resource_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.resource_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {post.resource_link && (
                <a
                  href={post.resource_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-primary-600 font-medium hover:underline"
                >
                  View Resource <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {post.post_type === 'question' && (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-600">QUESTION</span>
              </div>
              {post.content && (
                <p className="text-slate-900 font-medium">{post.content}</p>
              )}
            </div>
          )}

          {(post.post_type === 'thought' || post.post_type === 'photo') && post.content && (
            <p className="mt-4 text-slate-700 whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        {post.image_url && (
          <div className="relative">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`
                  flex items-center gap-1.5 transition-all duration-200
                  ${post.is_liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}
                  ${isLikeAnimating ? 'scale-125' : 'scale-100'}
                `}
              >
                <Heart
                  className="w-5 h-5"
                  fill={post.is_liked ? 'currentColor' : 'none'}
                />
                <span className="text-sm font-medium">{post.likes_count}</span>
              </button>

              <button
                onClick={() => setShowComments(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments_count}</span>
              </button>
            </div>

            <button
              onClick={() => onSave(post.id, post.is_saved)}
              className={`
                transition-colors
                ${post.is_saved ? 'text-primary-600' : 'text-slate-500 hover:text-primary-600'}
              `}
            >
              <Bookmark
                className="w-5 h-5"
                fill={post.is_saved ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={onRefresh}
        />
      )}
    </>
  );
};
