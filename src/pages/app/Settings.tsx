import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogOut, User, FileText, Mail, Building, BookOpen } from 'lucide-react';
import { supabase, uploadFile } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import { Avatar, LoadingSpinner } from '../../components/ui';

const COLLEGES = [
  'Partner College',
  'State University',
  'Tech Institute',
  'Liberal Arts College',
  'Community College',
];

const MAJORS = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Psychology',
  'Biology',
  'Communications',
  'Economics',
  'Political Science',
  'Mathematics',
  'English',
  'Art & Design',
  'Other',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

export const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser, logout: clearUser } = useUserStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [collegeName, setCollegeName] = useState(user?.college_name || '');
  const [major, setMajor] = useState(user?.major || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduation_year || CURRENT_YEAR + 2);
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = user.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadFile('avatars', avatarFile, user.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          college_name: collegeName,
          major,
          graduation_year: graduationYear,
          bio: bio.trim(),
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUser(data);
      setSuccess('Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/profile')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        </div>
      </header>

      <main className="px-4 py-6 pb-20">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex flex-col items-center">
            <label className="cursor-pointer relative">
              <Avatar
                src={avatarPreview || user.avatar_url}
                name={fullName || user.full_name}
                size="xl"
              />
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-sm text-slate-500">Tap to change photo</p>
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="font-semibold text-slate-900">Profile Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input pl-10 bg-slate-50 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                College
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="input pl-10 appearance-none cursor-pointer"
                >
                  <option value="">Select college</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Major
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="input pl-10 appearance-none cursor-pointer"
                >
                  <option value="">Select major</option>
                  {MAJORS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="input appearance-none cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input pl-10 min-h-24 resize-none"
                  placeholder="Tell others about yourself..."
                  maxLength={300}
                />
              </div>
              <p className="mt-1 text-right text-xs text-slate-500">
                {bio.length}/300
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm">
              {success}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : 'Save Changes'}
          </button>

          <div className="card p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Account</h2>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
