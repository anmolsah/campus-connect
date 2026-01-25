import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../ui';
import type { PostComment, Profile } from '../../types';

interface CommentWithAuthor extends PostComment {
  author: Profile;
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles!post_comments_author_id_fkey(*)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!newComment.trim() || !user || isSending) return;

    setIsSending(true);
    const content = newComment.trim();
    setNewComment('');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
      })
      .select(`
        *,
        author:profiles!post_comments_author_id_fkey(*)
      `)
      .single();

    if (!error && data) {
      setComments([...comments, data]);
      onCommentAdded();
    } else {
      setNewComment(content);
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-slide-up">
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
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.author.avatar_url}
                    name={comment.author.full_name}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="font-semibold text-sm text-slate-900">
                        {comment.author.full_name}
                      </p>
                      <p className="text-slate-700 text-sm mt-0.5">{comment.content}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 safe-bottom">
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
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!newComment.trim() || isSending}
              className="p-2.5 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
