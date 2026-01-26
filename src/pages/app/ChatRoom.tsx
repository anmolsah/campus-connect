import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../../components/ui';
import type { Message, Profile, Connection, UserPresence } from '../../types';

interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
}

export const ChatRoom = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [otherUserPresence, setOtherUserPresence] = useState<UserPresence | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const updateMyPresence = useCallback(async (isTyping: boolean) => {
    if (!user || !connectionId) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: true,
          current_chat_id: connectionId,
          is_typing: isTyping,
          last_seen: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user, connectionId]);

  const clearMyPresence = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          current_chat_id: null,
          is_typing: false,
          last_seen: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error clearing presence:', error);
    }
  }, [user]);

  const fetchConnection = useCallback(async () => {
    if (!connectionId || !user) return;

    const { data } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*)
      `)
      .eq('id', connectionId)
      .single();

    if (data) {
      setConnection(data);
      const other = data.requester_id === user.id ? data.receiver : data.requester;
      setOtherUser(other);

      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', other.id)
        .maybeSingle();

      if (presenceData) {
        setOtherUserPresence(presenceData);
        setIsOtherTyping(
          presenceData.is_typing && presenceData.current_chat_id === connectionId
        );
      }
    }
  }, [connectionId, user]);

  const fetchMessages = useCallback(async () => {
    if (!connectionId) return;

    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        markMessagesAsRead(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId]);

  const markMessagesAsRead = async (msgs: Message[]) => {
    if (!user) return;

    const unreadIds = msgs
      .filter((m) => m.sender_id !== user.id && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  };

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!connectionId || !otherUser) return;

    channelsRef.current.forEach(ch => supabase.removeChannel(ch));
    channelsRef.current = [];

    const messagesChannel = supabase
      .channel(`chat-messages-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            const filtered = prev.filter(m => !m.isOptimistic || m.content !== newMsg.content);
            if (filtered.some(m => m.id === newMsg.id)) return filtered;
            return [...filtered, newMsg];
          });

          if (newMsg.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel(`chat-presence-${otherUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${otherUser.id}`,
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          setOtherUserPresence(presence);
          setIsOtherTyping(
            presence.is_typing && presence.current_chat_id === connectionId
          );
        }
      )
      .subscribe();

    channelsRef.current = [messagesChannel, presenceChannel];
  }, [connectionId, otherUser, user?.id]);

  useEffect(() => {
    if (connectionId && user) {
      fetchConnection();
      fetchMessages();
      updateMyPresence(false);
    }

    return () => {
      clearMyPresence();
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
    };
  }, [connectionId, user]);

  useEffect(() => {
    if (otherUser) {
      setupRealtimeSubscriptions();
    }
  }, [otherUser, setupRealtimeSubscriptions]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearMyPresence();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearMyPresence]);

  const handleTyping = useCallback(() => {
    updateMyPresence(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateMyPresence(false);
    }, 2000);
  }, [updateMyPresence]);

  const handleSend = async () => {
    if (!newMessage.trim() || !connectionId || !user || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    updateMyPresence(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: OptimisticMessage = {
      id: optimisticId,
      connection_id: connectionId,
      sender_id: user.id,
      content,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { error } = await supabase.from('messages').insert({
        connection_id: connectionId,
        sender_id: user.id,
        content,
        message_type: 'text',
      });

      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setNewMessage(content);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setNewMessage(content);
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupMessagesByDate = (msgs: OptimisticMessage[]) => {
    const groups: { date: string; messages: OptimisticMessage[] }[] = [];

    msgs.forEach((msg) => {
      const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
      const existingGroup = groups.find((g) => g.date === dateKey);

      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ date: dateKey, messages: [msg] });
      }
    });

    return groups;
  };

  const getOnlineStatus = () => {
    if (!otherUserPresence) return null;

    if (otherUserPresence.is_online) {
      const lastSeen = new Date(otherUserPresence.last_seen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

      if (diffMinutes < 5) {
        return 'online';
      }
    }

    return 'offline';
  };

  const onlineStatus = getOnlineStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/chats')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          {otherUser && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  src={otherUser.avatar_url}
                  name={otherUser.full_name}
                  size="sm"
                />
                {onlineStatus === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {otherUser.full_name}
                </h2>
                <p className="text-xs text-slate-500">
                  {isOtherTyping ? (
                    <span className="text-blue-500 font-medium">typing...</span>
                  ) : onlineStatus === 'online' ? (
                    <span className="text-green-500">Active now</span>
                  ) : (
                    otherUser.major
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar
              src={otherUser?.avatar_url}
              name={otherUser?.full_name}
              size="xl"
            />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Start a conversation
            </h3>
            <p className="mt-1 text-slate-500">
              Say hello to {otherUser?.full_name?.split(' ')[0]}!
            </p>
          </div>
        ) : (
          <>
            {messageGroups.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-slate-200 rounded-full text-xs font-medium text-slate-600">
                    {formatDateHeader(group.messages[0].created_at)}
                  </span>
                </div>

                {group.messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar =
                    !isOwn &&
                    (index === 0 ||
                      group.messages[index - 1].sender_id !== message.sender_id);

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="w-8">
                          {showAvatar && (
                            <Avatar
                              src={otherUser?.avatar_url}
                              name={otherUser?.full_name}
                              size="xs"
                            />
                          )}
                        </div>
                      )}
                      <div
                        className={`
                          max-w-[75%] px-4 py-2.5 rounded-2xl
                          ${isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-slate-900 rounded-bl-md shadow-sm border border-slate-100'
                          }
                          ${message.isOptimistic ? 'opacity-70' : ''}
                        `}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {isOtherTyping && (
              <div className="flex items-end gap-2 mb-2">
                <div className="w-8">
                  <Avatar
                    src={otherUser?.avatar_url}
                    name={otherUser?.full_name}
                    size="xs"
                  />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
