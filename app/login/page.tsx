'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, AlertCircle, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });

        if (error) throw error;
        
        if (data.user && !data.session) {
          setSuccessMsg('Account created! Please check your email for confirmation.');
        } else {
          router.push('/dashboard');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect to dashboard or previous page
        const redirectTo = searchParams.get('redirectedFrom') || '/dashboard';
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0F1116]/80 glass-panel border-white/5 rounded-xl p-8 shadow-2xl relative">
      {/* Top and Bottom Accent Border Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-black font-mono tracking-wider text-white flex justify-center items-center gap-1 hover:opacity-85 transition-opacity">
          ⚡ CLIP<span className="text-[#00FFA3]">FLOW</span>
        </Link>
        <h2 className="text-xl font-bold mt-4 font-sans tracking-tight">
          {isSignUp ? 'Create your account' : 'Welcome back, creator'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          {isSignUp ? 'Get 30 minutes of free AI video clipping' : 'Log in to manage and edit your viral clips'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="bg-[#FF0055]/10 border border-[#FF0055] text-[#FF0055] text-xs p-3 rounded flex items-start gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#00FFA3]/10 border border-[#00FFA3] text-[#00FFA3] text-xs p-3 rounded flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-black/50 border border-white/5 focus:border-[#00E5FF] p-3 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-black/50 border border-white/5 focus:border-[#00E5FF] p-3 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 btn-premium-purple text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span className="uppercase tracking-wider text-xs font-mono">{isSignUp ? 'Get Started' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs">
        <span className="text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
        </span>{' '}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="text-[#00E5FF] hover:underline font-bold"
        >
          {isSignUp ? 'Sign In' : 'Create an account'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-[#050505] text-white items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative Glow Orbs */}
      <div className="glow-orb bg-[#9945FF] w-[400px] h-[400px] -top-20 -left-20" />
      <div className="glow-orb bg-[#00E5FF] w-[400px] h-[400px] -bottom-20 -right-20" style={{ animationDelay: '-6s' }} />

      <Suspense fallback={
        <div className="flex items-center justify-center p-8 bg-[#0F1116] border border-white/5 rounded-xl min-h-[300px] w-full max-w-md shadow-2xl">
          <Loader2 className="w-8 h-8 text-[#00FFA3] animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
