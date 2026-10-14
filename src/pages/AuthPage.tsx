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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center px-4 sm:px-6 text-slate-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Demo &amp; Production Ready
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {mode === 'signin'
              ? 'Access your Creovate AI dashboard and collaborations'
              : 'Join the next generation of creative AI production'}
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Instant Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('brand')}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs shadow-xs"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> As Brand
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Post briefs, shortlist</div>
            </button>
            <button
              onClick={() => handleDemoLogin('creator')}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs shadow-xs"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> As Creator
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Manage portfolio, invites</div>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {/* Sign In vs Sign Up Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If Sign Up: Select Role */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('brand')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      role === 'brand'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mb-1.5 text-blue-600" />
                    <span className="text-xs font-bold">Brand / Agency</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Hire AI Creators</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      role === 'creator'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-5 h-5 mb-1.5 text-blue-600" />
                    <span className="text-xs font-bold">AI Creator</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Offer Services</span>
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
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            {(error || authError) && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error || authError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm shadow-md shadow-blue-500/20"
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
