import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Upload,
  User,
  Building,
  BookOpen,
  FileText,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpenCheck,
  Users,
  Rocket,
} from "lucide-react";
import { supabase, uploadFile } from "../../lib/supabase";
import { useUserStore } from "../../stores/userStore";
import { LoadingSpinner, Avatar } from "../../components/ui";
import type { Mode } from "../../types";
import { COLLEGES } from "../../data/colleges";

const MAJORS = [
  "Computer Science",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Biology",
  "Communications",
  "Economics",
  "Political Science",
  "Mathematics",
  "English",
  "Art & Design",
  "Other",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
}

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [customCollegeName, setCustomCollegeName] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState<number>(
    CURRENT_YEAR + 2,
  );
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>("social");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigate("/app");
      }
    };

    checkSession();
  }, [navigate]);

  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setIdCardFile(file);
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
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");

      let idCardUrl = null;
      let avatarUrl = null;

      if (idCardFile) {
        idCardUrl = await uploadFile("id-cards", idCardFile, authUser.id);
      }

      if (avatarFile) {
        avatarUrl = await uploadFile("avatars", avatarFile, authUser.id);
      }

      const finalCollegeName =
        collegeName === "Other" ? customCollegeName : collegeName;

      const { data: profile, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          college_name: finalCollegeName,
          major,
          graduation_year: graduationYear,
          bio,
          id_card_url: idCardUrl,
          avatar_url: avatarUrl,
          current_mode: selectedMode,
          is_verified: true,
          onboarding_completed: true,
        })
        .eq("id", authUser.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUser(profile);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return idCardFile !== null;
      case 2:
        return fullName.trim().length >= 2;
      case 3:
        return (
          collegeName !== "" &&
          (collegeName !== "Other" || customCollegeName.trim().length >= 2)
        );
      case 4:
        return major !== "";
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Campus Connect
              </p>
              <p className="text-xs text-slate-500">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                Upload your ID card
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                This helps us verify you're a real student. It won't be shown to
                others.
              </p>

              <div className="mt-8">
                <label className="block">
                  <div
                    className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${idCardPreview ? "border-primary-300 bg-primary-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
                  `}
                  >
                    {idCardPreview ? (
                      <div className="relative">
                        <img
                          src={idCardPreview}
                          alt="ID Card preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">
                            Change image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-slate-400" />
                        <p className="mt-4 text-sm font-medium text-slate-900">
                          Click to upload your student ID
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          JPG, PNG, or WebP (max 5MB)
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleIdCardUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                What's your name?
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                This is how other students will see you.
              </p>

              <div className="mt-8">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="input pl-12 text-lg"
                    maxLength={50}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-slate-500">
                  {fullName.length}/50 characters
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                Where do you study?
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                Select your college or university.
              </p>

              <div className="mt-8 space-y-4">
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={collegeName}
                    onChange={(e) => {
                      setCollegeName(e.target.value);
                      if (e.target.value !== "Other") {
                        setCustomCollegeName("");
                      }
                    }}
                    className="input pl-12 appearance-none cursor-pointer"
                  >
                    <option value="">Select your college</option>
                    {COLLEGES.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>

                {collegeName === "Other" && (
                  <div className="relative animate-fade-in">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={customCollegeName}
                      onChange={(e) => setCustomCollegeName(e.target.value)}
                      placeholder="Enter your college name"
                      className="input pl-12"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                What's your major?
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                Tell us what you're studying.
              </p>

              <div className="mt-8 space-y-4">
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="input pl-12 appearance-none cursor-pointer"
                  >
                    <option value="">Select your major</option>
                    {MAJORS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected graduation year
                  </label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="input appearance-none cursor-pointer"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                Tell us about yourself
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                A short bio helps others know you better (optional).
              </p>

              <div className="mt-8">
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I'm interested in..."
                    className="input pl-12 min-h-32 resize-none"
                    maxLength={300}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-slate-500">
                  {bio.length}/300 characters
                </p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                Add a profile photo
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                Help others recognize you (optional).
              </p>

              <div className="mt-8 flex flex-col items-center">
                <label className="block cursor-pointer">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar name={fullName} size="xl" />
                    )}
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-4 text-sm text-slate-500">
                  Click to upload (max 2MB)
                </p>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                How do you want to start?
              </h2>
              <p className="mt-2 text-slate-600 text-center">
                Choose your primary mode. You can change this anytime.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {
                    value: "study" as Mode,
                    icon: BookOpenCheck,
                    title: "Study",
                    description: "Find study partners and academic help",
                    color: "study",
                  },
                  {
                    value: "social" as Mode,
                    icon: Users,
                    title: "Social",
                    description: "Meet new friends and hang out",
                    color: "social",
                  },
                  {
                    value: "project" as Mode,
                    icon: Rocket,
                    title: "Project",
                    description: "Collaborate on projects and ideas",
                    color: "project",
                  },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setSelectedMode(mode.value)}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${
                          isSelected
                            ? `border-${mode.color} bg-${mode.color}-light`
                            : "border-slate-200 hover:border-slate-300"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${isSelected ? `bg-${mode.color}` : "bg-slate-100"}
                        `}
                        >
                          <Icon
                            className={`w-6 h-6 ${isSelected ? "text-white" : "text-slate-500"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {mode.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {mode.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className={`w-5 h-5 text-${mode.color}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || isLoading}
                className="btn-primary flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>

          {step === 5 || step === 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Skip for now
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
};
