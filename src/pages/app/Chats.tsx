import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Check, X, UserPlus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner, ModeBadge } from '../../components/ui';
import type { Connection, Profile, Message } from '../../types';

type Tab = 'chats' | 'requests';

interface ConnectionWithProfile extends Connection {
  other_user: Profile;
  last_message?: Message;
  unread_count?: number;
}

export const Chats = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    setIsLoading(true);

    const { data: connectionsData } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (connectionsData) {
      const accepted: ConnectionWithProfile[] = [];
      const pending: ConnectionWithProfile[] = [];

      for (const conn of connectionsData) {
        const isRequester = conn.requester_id === user.id;
        const otherUser = isRequester ? conn.receiver : conn.requester;

        const connectionWithProfile: ConnectionWithProfile = {
          ...conn,
          other_user: otherUser,
        };

        if (conn.status === 'accepted') {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('connection_id', conn.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('connection_id', conn.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          connectionWithProfile.last_message = lastMessage || undefined;
          connectionWithProfile.unread_count = count || 0;
          accepted.push(connectionWithProfile);
        } else if (conn.status === 'pending' && conn.receiver_id === user.id) {
          pending.push(connectionWithProfile);
        }
      }

      accepted.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.updated_at;
        const bTime = b.last_message?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConnections(accepted);
      setPendingRequests(pending);
    }

    setIsLoading(false);
  };

  const handleAccept = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);

    if (!error) {
      fetchConnections();
    }
  };

  const handleReject = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);

    if (!error) {
      fetchConnections();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('chats')}
          className={`
            flex-1 py-2.5 rounded-xl font-medium text-sm transition-all
            ${activeTab === 'chats'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
          `}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`
            flex-1 py-2.5 rounded-xl font-medium text-sm transition-all relative
            ${activeTab === 'requests'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
          `}
        >
          Requests
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'chats' ? (
        connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No conversations yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              Connect with students to start chatting!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map((conn) => (
              <button
                key={conn.id}
                onClick={() => navigate(`/app/chats/${conn.id}`)}
                className="w-full card-hover p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      src={conn.other_user.avatar_url}
                      name={conn.other_user.full_name}
                      size="md"
                    />
                    {conn.unread_count && conn.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conn.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {conn.other_user.full_name}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {conn.last_message
                          ? formatDistanceToNow(new Date(conn.last_message.created_at), { addSuffix: false })
                          : formatDistanceToNow(new Date(conn.updated_at), { addSuffix: false })
                        }
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conn.unread_count ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {conn.last_message?.content || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No pending requests</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((conn) => (
              <div key={conn.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={conn.other_user.avatar_url}
                    name={conn.other_user.full_name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {conn.other_user.full_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {conn.other_user.major}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ModeBadge mode={conn.mode_context} />
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(conn.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {conn.request_message && (
                      <p className="mt-2 text-sm text-slate-600 italic">
                        "{conn.request_message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleReject(conn.id)}
                    className="btn-secondary flex-1 py-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(conn.id)}
                    className="btn-primary flex-1 py-2"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
