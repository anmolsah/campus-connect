import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";
import {
  Upload,
  User,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "ID Card", icon: Upload },
  { id: 2, title: "Profile", icon: User },
  { id: 3, title: "College", icon: GraduationCap },
  { id: 4, title: "Major", icon: BookOpen },
  { id: 5, title: "Bio", icon: MessageSquare },
  { id: 6, title: "Avatar", icon: Camera },
  { id: 7, title: "Mode", icon: Check },
];

const MAJORS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Psychology",
  "Biology",
  "Economics",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Political Science",
  "History",
  "Art",
  "Music",
  "Other",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState("");
  const [fullName, setFullName] = useState("");
  const [collegeName] = useState("Partner College"); // MVP: Single campus
  const [major, setMajor] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedMode, setSelectedMode] = useState<
    "study" | "social" | "project"
  >("social");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "avatar"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > (type === "id" ? 5 : 2) * 1024 * 1024) {
      setError(`File size must be less than ${type === "id" ? "5" : "2"}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "id") {
        setIdCard(file);
        setIdCardPreview(reader.result as string);
      } else {
        setAvatar(file);
        setAvatarPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  };

  const handleComplete = async () => {
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload ID card
      let idCardUrl = "";
      if (idCard) {
        const idPath = `${user.id}/id-card-${Date.now()}.${idCard.name
          .split(".")
          .pop()}`;
        idCardUrl = await uploadFile(idCard, "id-cards", idPath);
      }

      // Upload avatar
      let avatarUrl = "";
      if (avatar) {
        const avatarPath = `${user.id}/avatar-${Date.now()}.${avatar.name
          .split(".")
          .pop()}`;
        avatarUrl = await uploadFile(avatar, "avatars", avatarPath);
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          college_name: collegeName,
          major: major === "Other" ? customMajor : major,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          bio,
          id_card_url: idCardUrl,
          avatar_url: avatarUrl,
          current_mode: selectedMode,
          is_verified: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      setUser(profile as any);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return idCard !== null;
      case 2:
        return fullName.length >= 2;
      case 3:
        return true; // College pre-selected
      case 4:
        return major !== "" && (major !== "Other" || customMajor !== "");
      case 5:
        return true; // Bio optional
      case 6:
        return true; // Avatar optional
      case 7:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
    else handleComplete();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? "bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-1 transition-all ${
                      currentStep > step.id ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
          {/* Step 1: ID Card */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload ID Card
                </h2>
                <p className="text-gray-600">
                  For verification and accountability. Your ID is kept private.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "id")}
                  className="hidden"
                  id="id-upload"
                />
                <label htmlFor="id-upload" className="cursor-pointer">
                  {idCardPreview ? (
                    <img
                      src={idCardPreview}
                      alt="ID Card"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Click to upload ID card
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG or WEBP (max 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Full Name */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your name?
                </h2>
                <p className="text-gray-600">
                  This will be visible to other students
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-lg transition-colors"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {fullName.length}/50 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: College */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your College
                </h2>
                <p className="text-gray-600">Verified from your email domain</p>
              </div>

              <div className="p-6 bg-primary-50 rounded-xl border-2 border-primary-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {collegeName}
                    </h3>
                    <p className="text-sm text-gray-600">Verified ✓</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Major */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your major?
                </h2>
                <p className="text-gray-600">Help others find you</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MAJORS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMajor(m)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      major === m
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {major === "Other" && (
                <input
                  type="text"
                  value={customMajor}
                  onChange={(e) => setCustomMajor(e.target.value)}
                  placeholder="Enter your major"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year (Optional)
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2025"
                  min="2024"
                  max="2030"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 5: Bio */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-gray-600">
                  Optional, but helps make connections
                </p>
              </div>

              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I'm interested in..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  rows={5}
                  maxLength={300}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {bio.length}/300 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Avatar */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Add a profile photo
                </h2>
                <p className="text-gray-600">Optional, but recommended</p>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "avatar")}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-40 h-40 rounded-full object-cover border-4 border-primary-500"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">Max 2MB</p>
            </div>
          )}

          {/* Step 7: Mode Selection */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose your starting mode
                </h2>
                <p className="text-gray-600">You can switch anytime</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setSelectedMode("study")}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedMode === "study"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">📖 Study Mode</h3>
                      <p className="text-sm text-gray-600">
                        Find study partners and academic help
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMode("social")}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedMode === "social"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">🤝 Social Mode</h3>
                      <p className="text-sm text-gray-600">
                        Meet new friends and hang out
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMode("project")}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedMode === "project"
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">🚀 Project Mode</h3>
                      <p className="text-sm text-gray-600">
                        Collaborate on projects and ideas
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className="flex-1 btn-primary py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : currentStep === 7 ? (
                <>
                  Complete
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
