import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { GraduationCap, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";

const ALLOWED_DOMAINS = ["partnercollege.edu"]; // MVP: Single campus

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);

  const validateEmail = (email: string) => {
    const domain = email.split("@")[1];
    return ALLOWED_DOMAINS.includes(domain);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please use a valid .edu email from a supported college");
      return;
    }

    setStep("password");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.identities?.length === 0) {
            setError(
              "This email is already registered. Please sign in instead."
            );
            setIsSignUp(false);
          } else {
            navigate("/onboarding");
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() =>
            step === "password" ? setStep("email") : navigate("/")
          }
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Campus Connect
            </span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-600">
              {step === "email"
                ? "Enter your college email to get started"
                : "Create a secure password for your account"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@partnercollege.edu"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only @partnercollege.edu emails accepted for MVP
                </p>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-xl text-white font-semibold"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                    minLength={8}
                    required
                  />
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum 8 characters, include uppercase and number
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Toggle Sign In/Up */}
          {step === "password" && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
