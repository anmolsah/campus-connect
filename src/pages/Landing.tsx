import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate("/auth", { state: { email } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Campus Connect
            </span>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign In
          </button>
        </header>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">
              Genesis 50 Launch • First 50 Verified Students
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent">
              Beyond Dating.
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Built for Real Student Connections.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Verified, intent-based campus networking. Connect for study
            sessions, social hangouts, or project collaborations.
          </p>

          {/* Email Form */}
          <form onSubmit={handleGetStarted} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your .edu email"
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-base transition-colors"
                required
              />
              <button
                type="submit"
                className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Only verified .edu emails accepted
            </p>
          </form>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Verified Students Only
              </h3>
              <p className="text-gray-600 text-sm">
                ID card verification ensures authentic campus connections
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Intent-Based Networking
              </h3>
              <p className="text-gray-600 text-sm">
                Switch between Study, Social, and Project modes
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Privacy-First</h3>
              <p className="text-gray-600 text-sm">
                Connect only when both parties accept. No random DMs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>© 2026 Campus Connect • Phase 1 MVP</p>
        </div>
      </footer>
    </div>
  );
}
