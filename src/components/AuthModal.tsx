import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithDemo } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials or create a new account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please switch to sign in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // On success, modal will auto close via useEffect or here
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by browser. Please allow popups, or use Demo/Email sign-in below.');
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithDemo();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to start demo session. Please try email sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 backdrop-blur-md border border-white/[0.08] text-white mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signin' ? 'Welcome to VibeScribe' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {mode === 'signin' 
              ? 'Access scheduled queues, verified accounts, and enterprise-grade post dispatch.'
              : 'Join top creators scheduling and sending automated posts across channels.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700/80 border border-white/[0.08] text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.99] mb-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* 1-Click Instant Demo Creator Account */}
        <button
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-indigo-500/15 backdrop-blur-md hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-sm active:scale-[0.99] mb-3"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>⚡ Instant Pro Demo (1-Click Preview)</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-zinc-800/80" />
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-zinc-800/80" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center text-xs text-zinc-400">
          {mode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-white hover:underline font-semibold"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className="text-white hover:underline font-semibold"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
