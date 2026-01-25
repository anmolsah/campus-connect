import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, BadgeCheck, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../../components/ui';
import { ProfileModal } from '../../components/discovery/ProfileModal';
import type { Profile, Connection, Mode } from '../../types';

export const Discovery = () => {
  const { user, currentMode, setMode, showOwnCampusOnly, setShowOwnCampusOnly, updateProfile } = useUserStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchConnections();
    }
  }, [user, currentMode, showOwnCampusOnly]);

  const fetchProfiles = async () => {
    if (!user) return;

    setIsLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('current_mode', currentMode)
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .neq('id', user.id)
      .order('last_active', { ascending: false })
      .limit(50);

    if (showOwnCampusOnly && user.college_name) {
      query = query.eq('college_name', user.college_name);
    }

    const { data, error } = await query;

    if (!error && data) {
      setProfiles(data);
    }
    setIsLoading(false);
  };

  const fetchConnections = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('connections')
      .select('*')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (data) {
      setConnections(data);
    }
  };

  const getConnectionStatus = (profileId: string) => {
    const connection = connections.find(
      (c) =>
        (c.requester_id === user?.id && c.receiver_id === profileId) ||
        (c.receiver_id === user?.id && c.requester_id === profileId)
    );
    return connection;
  };

  const handleConnect = async (profileId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: user.id,
        receiver_id: profileId,
        mode_context: currentMode,
        request_message: `Hey! I'd like to connect in ${currentMode} mode`,
      })
      .select()
      .single();

    if (!error && data) {
      setConnections([...connections, data]);
    }
  };

  const handleModeChange = async (mode: Mode) => {
    setMode(mode);
    if (user) {
      await supabase
        .from('profiles')
        .update({ current_mode: mode })
        .eq('id', user.id);
      updateProfile({ current_mode: mode });
    }
  };

  const handleCampusToggle = async () => {
    const newValue = !showOwnCampusOnly;
    setShowOwnCampusOnly(newValue);
    if (user) {
      await supabase
        .from('profiles')
        .update({ show_own_campus_only: newValue })
        .eq('id', user.id);
      updateProfile({ show_own_campus_only: newValue });
    }
  };

  const getModeLabel = (mode: Mode) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const getModeColor = (mode: Mode) => {
    switch (mode) {
      case 'study': return 'text-blue-500 bg-blue-50';
      case 'social': return 'text-emerald-500 bg-emerald-50';
      case 'project': return 'text-amber-500 bg-amber-50';
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    const connection = getConnectionStatus(profile.id);
    if (connection?.status === 'rejected') return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        profile.full_name?.toLowerCase().includes(query) ||
        profile.major?.toLowerCase().includes(query) ||
        profile.college_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-900 mb-3">Explore</h1>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1">
            {(['study', 'social', 'project'] as Mode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {getModeLabel(mode)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-slate-600">Own Campus Only</span>
            <button
              onClick={handleCampusToggle}
              className={`w-11 h-6 rounded-full transition-colors ${
                showOwnCampusOnly ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  showOwnCampusOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No one here yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              {showOwnCampusOnly
                ? 'No students from your campus in this mode yet.'
                : 'Try switching modes or check back later.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProfiles.map((profile) => {
              const connection = getConnectionStatus(profile.id);
              const isPending = connection?.status === 'pending';
              const isConnected = connection?.status === 'accepted';
              const isRequester = connection?.requester_id === user?.id;

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar
                        src={profile.avatar_url}
                        name={profile.full_name}
                        size="lg"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {profile.full_name}
                        </h3>
                        {profile.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {profile.major} {profile.graduation_year && `'${String(profile.graduation_year).slice(-2)}`}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span>{profile.college_name}</span>
                      </div>
                      {profile.bio && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getModeColor(profile.current_mode)}`}>
                      {getModeLabel(profile.current_mode)}
                    </span>

                    {isConnected ? (
                      <span className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Connected
                      </span>
                    ) : isPending ? (
                      <span className="text-sm text-slate-500">
                        {isRequester ? 'Request Sent' : 'Pending'}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(profile.id);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          connection={getConnectionStatus(selectedProfile.id)}
          onClose={() => setSelectedProfile(null)}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
};
