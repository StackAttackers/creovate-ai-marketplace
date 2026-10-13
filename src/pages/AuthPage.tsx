import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  User,
  Briefcase,
  ArrowRight,
  Zap,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { UserRole } from '../types/user';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, isLoading, error, isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [role, setRole] = useState<UserRole>('brand');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/brand-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (mode === 'signup') {
        await signUp(email, password, role, displayName || email.split('@')[0]);
        navigate(role === 'creator' ? '/creator-dashboard' : '/brand-dashboard');
      } else {
        await signIn(email, password);
        // If signIn succeeded
        navigate('/brand-dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = async (demoRole: UserRole) => {
    if (demoRole === 'brand') {
      await signUp(
        'brand@creovate.ai',
        'demo123',
        'brand',
        'StyleVerse Studios'
      );
      navigate('/brand-dashboard');
    } else {
      await signUp(
        'maya.chen@creovate.ai',
        'demo123',
        'creator',
        'Maya Chen (AI Director)'
      );
      navigate('/creator-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 pt-28 pb-20 flex items-center justify-center px-4 sm:px-6 text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Demo & Production Ready
          </div>
          <h1 className="text-3xl font-black text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            {mode === 'signin'
              ? 'Access your Creovate AI dashboard and collaborations'
              : 'Join the next generation of creative AI production'}
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-6 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Click Instant Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('brand')}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-left hover:border-violet-500/50 hover:bg-violet-600/20 transition-all text-xs"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> As Brand
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Post briefs, shortlist</div>
            </button>
            <button
              onClick={() => handleDemoLogin('creator')}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-left hover:border-violet-500/50 hover:bg-violet-600/20 transition-all text-xs"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" /> As Creator
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Manage portfolio, invites</div>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-white/[0.08] bg-midnight-800/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          {/* Sign In vs Sign Up Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If Sign Up: Select Role */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('brand')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      role === 'brand'
                        ? 'border-violet-500 bg-violet-600/20 text-white shadow-md shadow-violet-600/20'
                        : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mb-1.5 text-blue-400" />
                    <span className="text-xs font-bold">Brand / Agency</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Hire AI Creators</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      role === 'creator'
                        ? 'border-violet-500 bg-violet-600/20 text-white shadow-md shadow-violet-600/20'
                        : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5 mb-1.5 text-violet-400" />
                    <span className="text-xs font-bold">AI Creator</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Offer Services</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <Input
                label="Full Name / Brand Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Maya Chen or Studio Aura"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@creovate.ai"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {(error || authError) && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {error || authError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm shadow-xl shadow-violet-600/30"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Sign In to Creovate' : 'Create Free Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
