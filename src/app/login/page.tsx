'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Check, ArrowRight, Lock, Key, Mail, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { repository } from '@/lib/db/repository';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentSessionUser, setCurrentSessionUser] = useState<any>(null);

  useEffect(() => {
    // Check if already authenticated via real server session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentSessionUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      setSuccessMessage(`Signed in as ${data.user.fullName} (${data.user.role}). Redirecting...`);
      setCurrentSessionUser(data.user);

      // Also sync local repository persona for legacy UI components
      if (data.user.role === 'moderator') {
        repository.setActiveUser('moderator');
      } else {
        repository.setActiveUser('contributor');
      }

      setTimeout(() => {
        if (data.user.role === 'moderator') {
          router.push('/moderator');
        } else {
          router.push('/search');
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage('Full name, email, and password are required.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed.');
        return;
      }

      setSuccessMessage(`Account created! Welcome, ${data.user.fullName}. Redirecting...`);
      setCurrentSessionUser(data.user);
      repository.setActiveUser('contributor');

      setTimeout(() => {
        router.push('/search');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentSessionUser(null);
    repository.setActiveUser('guest');
    setSuccessMessage('Logged out successfully.');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 w-full">
      <div className="text-center mb-6">
        <div className="w-11 h-11 rounded-2xl bg-[#044C4C] flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif-headline font-bold text-[#141A17] tracking-tight">
          VERITY Authentication
        </h1>
        <p className="text-xs text-[#525C56] mt-1">
          Cryptographically signed sessions required for community voting & research contributions.
        </p>
      </div>

      {/* Active Session Status if already signed in */}
      {currentSessionUser && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Active Server Session Verified</span>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {currentSessionUser.role}
            </span>
          </div>
          <div className="text-[#2C3531]">
            Signed in as <strong>{currentSessionUser.fullName}</strong> ({currentSessionUser.email}).
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/search"
              className="px-3 py-1.5 rounded-lg bg-[#044C4C] text-white font-medium text-xs hover:bg-[#034343]"
            >
              Go to Live Search
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#D5DFD8] text-[#525C56] hover:bg-[#FAFBF9] text-xs font-medium cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* One-Click Evaluator Credentials */}
      <div className="bg-white border border-[#E2E7E3] rounded-2xl p-5 shadow-xs mb-6 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0F3F1]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#69746E] font-bold">
            One-Click Verified Access (Evaluators & Testers)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6F2F2] text-[#044C4C] font-semibold">
            Server Auth
          </span>
        </div>
        <p className="text-xs text-[#525C56]">
          Generates authentic server-signed session tokens and HTTP-only cookies without manual typing:
        </p>

        <div className="space-y-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin('priya@verity.org', 'password123')}
            className="w-full p-3 rounded-xl border border-[#D5DFD8] hover:border-[#044C4C] bg-[#FAFBF9] hover:bg-white text-left flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs text-[#141A17]">Priya Sharma (Verified Contributor)</div>
              <div className="text-[11px] text-[#69746E] font-mono">priya@verity.org • Can vote in community polls</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#044C4C]" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin('vikram@verity.org', 'password123')}
            className="w-full p-3 rounded-xl border border-[#D5DFD8] hover:border-[#044C4C] bg-[#FAFBF9] hover:bg-white text-left flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs text-[#141A17]">Vikram Rao, CFA (Senior Moderator)</div>
              <div className="text-[11px] text-[#69746E] font-mono">vikram@verity.org • Moderator privileges</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#044C4C]" />
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-[#F0F3F1]">
          <button
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'signin'
                ? 'border-[#044C4C] text-[#044C4C]'
                : 'border-transparent text-[#69746E] hover:text-[#141A17]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'register'
                ? 'border-[#044C4C] text-[#044C4C]'
                : 'border-transparent text-[#69746E] hover:text-[#141A17]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {tab === 'signin' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#86928C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#86928C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#044C4C] hover:bg-[#034343] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Anand Patel"
                className="w-full px-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anand@example.com"
                className="w-full px-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#044C4C] hover:bg-[#034343] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Account...' : 'Create Contributor Account'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
