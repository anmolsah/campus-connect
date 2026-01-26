import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, ArrowLeft, ShieldCheck, Check,
  BookOpen, Users, Rocket
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { useDataStore } from '../../stores/dataStore';
import { Avatar, LoadingSpinner } from '../../components/ui';
import type { Mode } from '../../types';

const modes: { value: Mode; icon: typeof BookOpen; title: string; description: string }[] = [
  {
    value: 'study',
    icon: BookOpen,
    title: 'Study Mode',
    description: 'Looking for a study group or library partner.',
  },
  {
    value: 'social',
    icon: Users,
    title: 'Social Mode',
    description: 'Open to hanging out, events, and parties.',
  },
  {
    value: 'project',
    icon: Rocket,
    title: 'Project Mode',
    description: 'Seeking collaborators for hackathons & projects.',
  },
];

export const Profile = () => {
  const navigate = useNavigate();
  const { user, currentMode, setMode, updateProfile } = useUserStore();
  const { profileStats, setProfileStats, shouldRefetchProfileStats } = useDataStore();
  const [stats, setStats] = useState(profileStats || { connections: 0, posts: 0 });
  const [isLoading, setIsLoading] = useState(!profileStats);

  const fetchStats = useCallback(async (forceRefetch = false) => {
    if (!user) return;

    if (!forceRefetch && profileStats && !shouldRefetchProfileStats()) {
      setStats(profileStats);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id);

    const newStats = {
      connections: connectionsCount || 0,
      posts: postsCount || 0,
    };

    setStats(newStats);
    setProfileStats(newStats);
    setIsLoading(false);
  }, [user, profileStats, shouldRefetchProfileStats, setProfileStats]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Profile</h1>
          <button
            onClick={() => navigate('/app/settings')}
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </header>

      <main className="px-6 pb-24">
        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            <Avatar src={user.avatar_url} name={user.full_name} size="xl" />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            {user.full_name}
          </h2>
          <p className="mt-1 text-slate-500">{user.major} Major</p>

          {user.is_verified && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">Verified Student</span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Identity Secured</p>
              <p className="text-sm text-slate-500">University ID verified</p>
            </div>
          </div>
          <button className="text-blue-500 font-medium text-sm hover:text-blue-600">
            View
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Intent Settings</h3>
          <div className="space-y-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.value;
              const bgColor = mode.value === 'study' ? 'bg-blue-50' : mode.value === 'social' ? 'bg-emerald-50' : 'bg-amber-50';
              const iconColor = mode.value === 'study' ? 'text-blue-500' : mode.value === 'social' ? 'text-emerald-500' : 'text-amber-500';
              const borderColor = isActive ? (mode.value === 'study' ? 'border-blue-400' : mode.value === 'social' ? 'border-emerald-400' : 'border-amber-400') : 'border-slate-200';

              return (
                <button
                  key={mode.value}
                  onClick={() => handleModeChange(mode.value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${borderColor} ${isActive ? bgColor : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{mode.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{mode.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-5 text-center">
            {isLoading ? (
              <div className="h-9 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{stats.connections}</p>
            )}
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wide">Connections</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 text-center">
            {isLoading ? (
              <div className="h-9 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{stats.posts}</p>
            )}
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wide">Posts</p>
          </div>
        </div>
      </main>
    </div>
  );
};
