import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, MessageCircle, UserPlus, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/userStore";
import { formatDistanceToNow } from "date-fns";

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  mode_context: string;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string;
    avatar_url: string;
    major: string;
    college_name: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url: string;
    major: string;
    college_name: string;
  };
}

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<"connections" | "pending">(
    "connections",
  );
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(
          `
          *,
          requester:requester_id (id, full_name, avatar_url, major, college_name),
          receiver:receiver_id (id, full_name, avatar_url, major, college_name)
        `,
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(
          `
          *,
          requester:requester_id (id, full_name, avatar_url, major, college_name)
        `,
        )
        .eq("status", "pending")
        .eq("receiver_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      // Refresh both lists
      fetchConnections();
      fetchPendingRequests();
    } catch (err) {
      console.error("Error accepting connection:", err);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", connectionId);

      if (error) throw error;
      fetchPendingRequests();
    } catch (err) {
      console.error("Error rejecting connection:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connections</h1>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("connections")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === "connections"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all relative ${
                activeTab === "pending"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending ({pendingRequests.length})
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "connections" ? (
          connections.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <UserPlus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No connections yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start connecting with verified students
              </p>
              <button
                onClick={() => navigate("/discover")}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Discover People
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => {
                const otherUser =
                  connection.requester_id === user?.id
                    ? connection.receiver
                    : connection.requester;
                return (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    otherUser={otherUser!}
                    onMessage={() => navigate(`/chat/${connection.id}`)}
                  />
                );
              })}
            </div>
          )
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No pending requests
            </h3>
            <p className="text-gray-600">
              You're all caught up! Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onAccept={() => handleAccept(request.id)}
                onReject={() => handleReject(request.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionCard({
  connection,
  otherUser,
  onMessage,
}: {
  connection: Connection;
  otherUser: NonNullable<Connection["requester"]>;
  onMessage: () => void;
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
    <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all p-6">
      <div className="flex gap-4 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.full_name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {otherUser.full_name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 text-xl">
            {getModeIcon(connection.mode_context)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            {otherUser.full_name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{otherUser.major}</p>
          <p className="text-xs text-gray-500">{otherUser.college_name}</p>
        </div>
      </div>

      {/* Connected Info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-green-800">
          ✓ Connected in{" "}
          <span className="font-semibold">{connection.mode_context}</span> mode
        </p>
        <p className="text-xs text-green-600 mt-1">
          {formatDistanceToNow(new Date(connection.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onMessage}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Message
        </button>
        <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
}

function PendingRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: Connection;
  onAccept: () => void;
  onReject: () => void;
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
    <div className="bg-white rounded-3xl shadow-md p-6 border-2 border-primary-200">
      <div className="flex gap-4 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {request.requester?.avatar_url ? (
            <img
              src={request.requester.avatar_url}
              alt={request.requester.full_name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {request.requester?.full_name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 text-xl">
            {getModeIcon(request.mode_context)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            {request.requester?.full_name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {request.requester?.major}
          </p>
          <p className="text-xs text-gray-500">
            {request.requester?.college_name}
          </p>
        </div>
      </div>

      {/* Request Message */}
      {request.request_message && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-700">"{request.request_message}"</p>
        </div>
      )}

      {/* Mode Context */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-primary-800">
          Wants to connect in{" "}
          <span className="font-semibold">{request.mode_context}</span> mode
        </p>
        <p className="text-xs text-primary-600 mt-1">
          {formatDistanceToNow(new Date(request.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Decline
        </button>
      </div>
    </div>
  );
}
