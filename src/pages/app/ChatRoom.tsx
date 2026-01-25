import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../../components/ui';
import type { Message, Profile, Connection } from '../../types';

export const ChatRoom = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (connectionId && user) {
      fetchConnection();
      fetchMessages();
      subscribeToMessages();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [connectionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConnection = async () => {
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
    }
  };

  const fetchMessages = async () => {
    if (!connectionId) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead(data);
    }
    setIsLoading(false);
  };

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

  const subscribeToMessages = () => {
    if (!connectionId) return;

    const channel = supabase
      .channel(`chat:${connectionId}`)
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
          setMessages((prev) => [...prev, newMsg]);

          if (newMsg.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !connectionId || !user || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      connection_id: connectionId,
      sender_id: user.id,
      content,
      message_type: 'text',
    });

    if (error) {
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

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];

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
              <Avatar
                src={otherUser.avatar_url}
                name={otherUser.full_name}
                size="sm"
              />
              <div>
                <h2 className="font-semibold text-slate-900">
                  {otherUser.full_name}
                </h2>
                <p className="text-xs text-slate-500">{otherUser.major}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
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
          messageGroups.map((group) => (
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
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-slate-900 rounded-bl-md shadow-sm border border-slate-100'
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-2xs mt-1 ${isOwn ? 'text-primary-200' : 'text-slate-400'}`}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
