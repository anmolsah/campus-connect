import { useState, useEffect } from "react";
import { Search, MessageCircle, ArrowLeft, Send, Smile } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ChatPreview {
  connection_id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    current_mode: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export default function ChatsPage() {
  const { connectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      // Get all accepted connections
      const { data: connections, error: connError } = await supabase
        .from("connections")
        .select(
          `
          id,
          requester_id,
          receiver_id,
          requester:requester_id (id, full_name, avatar_url, current_mode),
          receiver:receiver_id (id, full_name, avatar_url, current_mode)
        `,
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`);

      if (connError) throw connError;

      // For each connection, get the last message
      const chatPreviews: ChatPreview[] = await Promise.all(
        (connections || []).map(async (conn) => {
          const otherUser =
            conn.requester_id === user?.id ? conn.receiver : conn.requester;

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("*")
            .eq("connection_id", conn.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("connection_id", conn.id)
            .eq("is_read", false)
            .neq("sender_id", user?.id);

          return {
            connection_id: conn.id,
            other_user: otherUser!,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        }),
      );

      // Sort by last message time
      chatPreviews.sort((a, b) => {
        const aTime = a.last_message?.created_at || "0";
        const bTime = b.last_message?.created_at || "0";
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(chatPreviews);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (connectionId) {
    return <ChatRoom connectionId={connectionId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start connecting to begin conversations
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Discover People
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <ChatPreviewCard
                key={chat.connection_id}
                chat={chat}
                currentUserId={user?.id || ""}
                onClick={() => navigate(`/chat/${chat.connection_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPreviewCard({
  chat,
  currentUserId,
  onClick,
}: {
  chat: ChatPreview;
  currentUserId: string;
  onClick: () => void;
}) {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "study":
        return "📖";
      case "social":
        return "🤝";
      case "project":
        return "🚀";
      default:
        return "👤";
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white hover:bg-gray-50 rounded-2xl p-4 transition-all text-left"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {chat.other_user.avatar_url ? (
            <img
              src={chat.other_user.avatar_url}
              alt={chat.other_user.full_name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {chat.other_user.full_name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 text-lg">
            {getModeIcon(chat.other_user.current_mode)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {chat.other_user.full_name}
            </h3>
            {chat.last_message && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatDistanceToNow(new Date(chat.last_message.created_at), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-sm truncate ${
                chat.unread_count > 0
                  ? "text-gray-900 font-medium"
                  : "text-gray-600"
              }`}
            >
              {chat.last_message
                ? chat.last_message.sender_id === currentUserId
                  ? `You: ${chat.last_message.content}`
                  : chat.last_message.content
                : "No messages yet"}
            </p>
            {chat.unread_count > 0 && (
              <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {chat.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatRoom({ connectionId }: { connectionId: string }) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnection();
    fetchMessages();
    subscribeToMessages();
  }, [connectionId]);

  const fetchConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(
          `
          *,
          requester:requester_id (id, full_name, avatar_url, current_mode),
          receiver:receiver_id (id, full_name, avatar_url, current_mode)
        `,
        )
        .eq("id", connectionId)
        .single();

      if (error) throw error;

      const other =
        data.requester_id === user?.id ? data.receiver : data.requester;
      setOtherUser(other);
    } catch (err) {
      console.error("Error fetching connection:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("connection_id", connectionId)
        .neq("sender_id", user?.id);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert({
        connection_id: connectionId,
        sender_id: user?.id,
        content: newMessage.trim(),
        message_type: "text",
      });

      if (error) throw error;
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/chats")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        {otherUser && (
          <>
            {otherUser.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                {otherUser.full_name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {otherUser.full_name}
              </h2>
              <p className="text-xs text-green-600">● Online</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500">Say hi! 👋</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <Smile className="w-6 h-6 text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary-600 text-white rounded-br-sm"
            : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p
          className={`text-xs mt-1 ${isOwn ? "text-primary-100" : "text-gray-500"}`}
        >
          {new Date(message.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
