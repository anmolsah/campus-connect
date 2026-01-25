import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, BadgeCheck, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner, ModeBadge } from '../../components/ui';
import { ProfileModal } from '../../components/discovery/ProfileModal';
import type { Profile, Connection } from '../../types';

export const Discovery = () => {
  const { user, currentMode } = useUserStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchConnections();
    }
  }, [user, currentMode]);

  const fetchProfiles = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('current_mode', currentMode)
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .neq('id', user.id)
      .order('last_active', { ascending: false })
      .limit(50);

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

  const filteredProfiles = profiles.filter((profile) => {
    const connection = getConnectionStatus(profile.id);
    return !connection || connection.status !== 'rejected';
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No one here yet</h3>
        <p className="mt-2 text-slate-500 max-w-sm">
          Be the first to explore! Try switching modes or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="grid gap-4">
        {filteredProfiles.map((profile) => {
          const connection = getConnectionStatus(profile.id);
          const isPending = connection?.status === 'pending';
          const isConnected = connection?.status === 'accepted';
          const isRequester = connection?.requester_id === user?.id;

          return (
            <div
              key={profile.id}
              className="card-hover p-4 cursor-pointer"
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {profile.full_name}
                    </h3>
                    {profile.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-primary-600 flex-shrink-0" />
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
                <ModeBadge mode={profile.current_mode} />

                {isConnected ? (
                  <span className="text-sm text-social font-medium flex items-center gap-1">
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
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
