'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signUpWithEmail } from '@/lib/firebase/auth';
import { useAuth } from './auth-provider';
import { UserPlus, Sparkles, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { continueAsGuest } = useAuth();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(email, password, name);
      router.push('/chat');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/chat');
    } catch (err: any) {
      setError(err?.message || 'Google sign-up was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoGuestLogin = () => {
    continueAsGuest();
    router.push('/chat');
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 transition-all">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Token Optimization Middleware
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
        <p className="text-slate-400 text-sm mt-2">Get started with TokenFlow AI Token Optimizer</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Google OAuth Option */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 font-medium text-sm border border-slate-700 hover:border-slate-600 transition-all shadow-sm group disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{googleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
      </button>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          or sign up with email
        </span>
      </div>

      {/* Email & Password Form */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name (Optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Dev"
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
        </button>
      </form>

      {/* Guest Mode fallback */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 text-center">
        <button
          type="button"
          onClick={handleDemoGuestLogin}
          className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Explore Demo Mode without signing in <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Switch to Login */}
      <p className="text-center text-xs text-slate-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald-400 hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}
