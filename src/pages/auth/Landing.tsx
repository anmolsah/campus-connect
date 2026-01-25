import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, Users, Target, ArrowRight, Mail } from 'lucide-react';
import { validateEmailDomain } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui';

export const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validateEmailDomain(trimmedEmail)) {
      setError('Please use your college email address (.edu)');
      setIsLoading(false);
      return;
    }

    navigate('/signup', { state: { email: trimmedEmail } });
    setIsLoading(false);
  };

  const features = [
    {
      icon: Shield,
      title: 'Verified Students Only',
      description: 'Every member is verified with their college email',
    },
    {
      icon: Target,
      title: 'Intent-Based Networking',
      description: 'Connect based on what you need: study, social, or projects',
    },
    {
      icon: Users,
      title: 'Meaningful Connections',
      description: 'Built for real relationships, not superficial interactions',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Campus Connect</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost"
          >
            Sign In
          </button>
        </nav>

        <main className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              Beyond Dating.
              <br />
              <span className="text-primary-600">Built for Real Student Connections.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto text-balance">
              Connect with verified students from your campus for studying, socializing, or collaborating on projects. No games, no gimmicks.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your .edu email"
                  className="input pl-12 pr-4 py-4 text-base"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="mt-2 text-sm text-red-600 text-left">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-4 py-4 text-base"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="link"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-24 grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="py-8 border-t border-slate-100">
          <p className="text-center text-sm text-slate-500">
            Campus Connect - Connecting students, one campus at a time.
          </p>
        </footer>
      </div>
    </div>
  );
};
