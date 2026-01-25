import { X, BadgeCheck, MapPin, GraduationCap, UserPlus, Check, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, ModeBadge } from '../ui';
import { useUserStore } from '../../stores/userStore';
import type { Profile, Connection } from '../../types';

interface ProfileModalProps {
  profile: Profile;
  connection?: Connection;
  onClose: () => void;
  onConnect: (profileId: string) => void;
}

export const ProfileModal = ({ profile, connection, onClose, onConnect }: ProfileModalProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const isPending = connection?.status === 'pending';
  const isConnected = connection?.status === 'accepted';
  const isRequester = connection?.requester_id === user?.id;

  const handleChat = () => {
    if (connection) {
      navigate(`/app/chats/${connection.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size="xl"
            />

            <div className="mt-4 flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                {profile.full_name}
              </h3>
              {profile.is_verified && (
                <BadgeCheck className="w-5 h-5 text-primary-600" />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {profile.major}
                {profile.graduation_year && ` '${String(profile.graduation_year).slice(-2)}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.college_name}
              </span>
            </div>

            <div className="mt-3">
              <ModeBadge mode={profile.current_mode} />
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-slate-700 text-center">{profile.bio}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {isConnected ? (
              <button
                onClick={handleChat}
                className="btn-primary flex-1 py-3"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </button>
            ) : isPending ? (
              <div className="flex-1 text-center py-3 text-slate-500">
                {isRequester ? 'Connection request sent' : 'Connection request pending'}
              </div>
            ) : (
              <button
                onClick={() => onConnect(profile.id)}
                className="btn-primary flex-1 py-3"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
