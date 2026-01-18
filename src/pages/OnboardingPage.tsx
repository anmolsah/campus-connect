import { useState } from "react";
import {
  Upload,
  Camera,
  User,
  GraduationCap,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState("");
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("Partner College");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [mode, setMode] = useState<"study" | "social" | "project">("social");

  const { setUser } = useUserStore();

  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setIdCard(file);
      setIdCardPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleNext = () => {
    setError("");

    if (step === 1 && !idCard) {
      setError("Please upload your ID card");
      return;
    }
    if (step === 2 && fullName.length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (step === 4 && !major) {
      setError("Please select your major");
      return;
    }

    if (step < 7) {
      setStep((step + 1) as OnboardingStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as OnboardingStep);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let idCardUrl = "";
      let avatarUrl = "";

      // Upload ID card
      if (idCard) {
        const idCardPath = `${user.id}/id-card-${Date.now()}.${idCard.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("id-cards")
          .upload(idCardPath, idCard);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("id-cards").getPublicUrl(idCardPath);
        idCardUrl = publicUrl;
      }

      // Upload avatar
      if (avatar) {
        const avatarPath = `${user.id}/avatar-${Date.now()}.${avatar.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, avatar);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
        avatarUrl = publicUrl;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        college_name: college,
        major,
        bio,
        id_card_url: idCardUrl,
        avatar_url: avatarUrl,
        current_mode: mode,
        is_verified: true,
      });

      if (profileError) throw profileError;

      // Fetch the created profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  const progress = (step / 7) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex-1" />
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 7
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Step 1: ID Card */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload ID Card
                </h2>
                <p className="text-gray-600">
                  For accountability and safety. Your ID is kept private.
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardUpload}
                    className="hidden"
                  />
                  {idCardPreview ? (
                    <div className="relative">
                      <img
                        src={idCardPreview}
                        alt="ID Card"
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">
                          Change Photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">
                        Tap to upload
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG or WEBP (max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Full Name */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your name?
                </h2>
                <p className="text-gray-600">This is how others will see you</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: College */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <GraduationCap className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your College
                </h2>
                <p className="text-gray-600">Verified from your email domain</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-2xl">
                  <GraduationCap className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{college}</p>
                    <p className="text-sm text-gray-600">Verified ✓</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Major */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your major?
                </h2>
                <p className="text-gray-600">
                  Help others find common interests
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">Select your major</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Bio */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <MessageSquare className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-gray-600">
                  Optional, but helps make connections
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  placeholder="Share your interests, hobbies, or what you're looking for..."
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  rows={5}
                />
                <p className="text-sm text-gray-500 text-right mt-2">
                  {bio.length}/300
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Avatar */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <Camera className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Add a profile photo
                </h2>
                <p className="text-gray-600">
                  Optional, but profiles with photos get 3x more connections
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-48 h-48 object-cover rounded-full mx-auto"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">
                          Change Photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center hover:border-primary-400 transition-colors">
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">Tap to upload</p>
                      <p className="text-sm text-gray-500 mt-1">Max 2MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 7: Mode Selection */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose your starting mode
                </h2>
                <p className="text-gray-600">You can switch anytime</p>
              </div>

              <div className="space-y-3">
                <ModeCard
                  icon="📖"
                  title="Study Mode"
                  description="Find study partners and academic help"
                  color="blue"
                  selected={mode === "study"}
                  onClick={() => setMode("study")}
                />
                <ModeCard
                  icon="🤝"
                  title="Social Mode"
                  description="Make friends and hang out"
                  color="green"
                  selected={mode === "social"}
                  onClick={() => setMode("social")}
                />
                <ModeCard
                  icon="🚀"
                  title="Project Mode"
                  description="Collaborate on projects and ideas"
                  color="amber"
                  selected={mode === "project"}
                  onClick={() => setMode("project")}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200 transition-all"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {step === 7 ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Skip Button (for optional steps) */}
          {(step === 5 || step === 6) && (
            <button
              onClick={() => setStep((step + 1) as OnboardingStep)}
              className="w-full text-gray-600 hover:text-gray-900 font-medium py-3 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  color,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  color: "blue" | "green" | "amber";
  selected: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: selected
      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500"
      : "bg-white border-gray-200 hover:border-blue-300",
    green: selected
      ? "bg-green-50 border-green-500 ring-2 ring-green-500"
      : "bg-white border-gray-200 hover:border-green-300",
    amber: selected
      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500"
      : "bg-white border-gray-200 hover:border-amber-300",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full border-2 rounded-2xl p-5 text-left transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {selected && (
          <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
