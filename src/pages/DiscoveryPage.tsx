import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Rocket,
  Settings,
  Search,
  MapPin,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  college_name: string;
  major: string;
  bio: string;
  current_mode: "study" | "social" | "project";
}

export default function DiscoveryPage() {
  const { user, currentMode, setMode } = useUserStore();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, [currentMode]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("current_mode", currentMode)
        .eq("is_verified", true)
        .neq("id", user?.id)
        .order("last_active", { ascending: false })
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
            <button
              onClick={() => navigate("/settings")}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <ModeButton
              icon={<BookOpen className="w-4 h-4" />}
              label="Study"
              active={currentMode === "study"}
              onClick={() => setMode("study")}
              color="blue"
            />
            <ModeButton
              icon={<Users className="w-4 h-4" />}
              label="Social"
              active={currentMode === "social"}
              onClick={() => setMode("social")}
              color="green"
            />
            <ModeButton
              icon={<Rocket className="w-4 h-4" />}
              label="Project"
              active={currentMode === "project"}
              onClick={() => setMode("project")}
              color="amber"
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, major, or interests..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
            />
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
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : `Be the first in ${currentMode} mode!`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onConnect={() => navigate(`/profile/${profile.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  icon,
  label,
  active,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: "blue" | "green" | "amber";
}) {
  const colorClasses = {
    blue: active
      ? "bg-blue-500 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
    green: active
      ? "bg-green-500 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
    amber: active
      ? "bg-amber-500 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${colorClasses[color]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProfileCard({
  profile,
  onConnect,
}: {
  profile: Profile;
  onConnect: () => void;
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
    <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 text-2xl">
              {getModeIcon(profile.current_mode)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {profile.full_name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{profile.major}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{profile.college_name}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            "{profile.bio}"
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConnect}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={onConnect}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary-200"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
