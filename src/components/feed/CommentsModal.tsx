import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../ui';
import type { PostComment, Profile } from '../../types';

interface CommentWithAuthor extends PostComment {
  author: Profile;
  is_liked: boolean;
  likes_count: number;
  replies?: CommentWithAuthor[];
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
  onCommentAdded: () => void;
}

export const CommentsModal = ({ postId, onClose, onCommentAdded }: CommentsModalProps) => {
  const { user } = useUserStore();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentWithAuthor | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!post_comments_author_id_fkey(*)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (!commentsData) {
        setComments([]);
        return;
      }

      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);

      const likedIds = new Set(userLikes?.map(l => l.comment_id) || []);

      const { data: repliesData } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!post_comments_author_id_fkey(*)
        `)
        .eq('post_id', postId)
        .not('parent_comment_id', 'is', null)
        .order('created_at', { ascending: true });

      const repliesMap = new Map<string, CommentWithAuthor[]>();
      (repliesData || []).forEach((reply) => {
        const parentId = reply.parent_comment_id!;
        const existing = repliesMap.get(parentId) || [];
        existing.push({
          ...reply,
          is_liked: likedIds.has(reply.id),
          likes_count: reply.likes_count || 0,
        });
        repliesMap.set(parentId, existing);
      });

      const commentsWithReplies: CommentWithAuthor[] = commentsData.map((comment) => ({
        ...comment,
        is_liked: likedIds.has(comment.id),
        likes_count: comment.likes_count || 0,
        replies: repliesMap.get(comment.id) || [],
      }));

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchComments]);

  const handleSend = async () => {
    if (!newComment.trim() || !user || isSending) return;

    setIsSending(true);
    const content = newComment.trim();
    setNewComment('');

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          parent_comment_id: replyingTo?.id || null,
        });

      if (!error) {
        onCommentAdded();
        setReplyingTo(null);
        if (replyingTo) {
          setExpandedReplies(prev => new Set([...prev, replyingTo.id]));
        }
      } else {
        setNewComment(content);
      }
    } catch (error) {
      setNewComment(content);
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleLikeComment = async (comment: CommentWithAuthor) => {
    if (!user) return;

    const isLiked = comment.is_liked;

    setComments(prev => prev.map(c => {
      if (c.id === comment.id) {
        return {
          ...c,
          is_liked: !isLiked,
          likes_count: c.likes_count + (isLiked ? -1 : 1),
        };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === comment.id
              ? { ...r, is_liked: !isLiked, likes_count: r.likes_count + (isLiked ? -1 : 1) }
              : r
          ),
        };
      }
      return c;
    }));

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert({ comment_id: comment.id, user_id: user.id });
      }
    } catch (error) {
      setComments(prev => prev.map(c => {
        if (c.id === comment.id) {
          return {
            ...c,
            is_liked: isLiked,
            likes_count: c.likes_count + (isLiked ? 1 : -1),
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === comment.id
                ? { ...r, is_liked: isLiked, likes_count: r.likes_count + (isLiked ? 1 : -1) }
                : r
            ),
          };
        }
        return c;
      }));
    }
  };

  const handleReply = (comment: CommentWithAuthor) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CommentWithAuthor; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}>
      <Avatar
        src={comment.author.avatar_url}
        name={comment.author.full_name}
        size={isReply ? 'xs' : 'sm'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="font-semibold text-sm text-slate-900">
              {comment.author.full_name}
            </span>
            <span className="text-sm text-slate-700 ml-1.5">{comment.content}</span>
          </div>
          <button
            onClick={() => handleLikeComment(comment)}
            className="flex-shrink-0 p-1"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                comment.is_liked ? 'fill-red-500 text-red-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false })}
          </span>
          {comment.likes_count > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {comment.likes_count} {comment.likes_count === 1 ? 'like' : 'likes'}
            </span>
          )}
          {!isReply && (
            <button
              onClick={() => handleReply(comment)}
              className="text-xs text-slate-500 font-medium hover:text-slate-700"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <CommentItem comment={comment} />

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-10 mt-2">
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 font-medium hover:text-slate-700"
                      >
                        <div className="w-6 h-px bg-slate-300" />
                        {expandedReplies.has(comment.id) ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Hide replies
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                          </>
                        )}
                      </button>

                      {expandedReplies.has(comment.id) && (
                        <div className="mt-3 space-y-3">
                          {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} isReply />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 safe-bottom">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-xs text-slate-600">
                Replying to <span className="font-medium">{replyingTo.author.full_name}</span>
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-0.5 hover:bg-slate-200 rounded"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name}
              size="sm"
            />
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={replyingTo ? `Reply to ${replyingTo.author.full_name?.split(' ')[0]}...` : 'Add a comment...'}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!newComment.trim() || isSending}
              className="p-2.5 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
