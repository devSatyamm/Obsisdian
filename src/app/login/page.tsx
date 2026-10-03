'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  Check,
  ArrowRight,
  Lock,
  Key,
  Mail,
  AlertCircle,
  LogIn,
  UserPlus,
  Server,
  Info,
  Sparkles
} from 'lucide-react';
import { repository, getExternalApiUrl } from '@/lib/db/repository';
import { DEMO_PERSONAS } from '@/lib/data/mockData';
import { UserPersona } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'personas' | 'external'>('personas');
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.contributor);
  const [externalApiUrl, setExternalApiUrl] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(repository.getActiveUser());
    const apiUrl = getExternalApiUrl();
    if (apiUrl) {
      setExternalApiUrl(apiUrl);
    }
  }, []);

  const handleSelectPersona = (role: 'guest' | 'contributor' | 'moderator') => {
    const user = repository.setActiveUser(role);
    setCurrentUser(user);
    setSuccessMessage(`Switched active persona to ${user.name} (${user.role.toUpperCase()}).`);
    setTimeout(() => {
      if (role === 'moderator') {
        router.push('/moderator');
      } else {
        router.push('/search');
      }
    }, 600);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const cleanUrl = externalApiUrl.trim().replace(/\/+$/, '');
      if (cleanUrl) {
        localStorage.setItem('verity_custom_api_url', cleanUrl);
        setSuccessMessage(`External API configured: ${cleanUrl}`);
      } else {
        localStorage.removeItem('verity_custom_api_url');
        setSuccessMessage('Cleared external API URL. Running in offline demonstration mode.');
      }
    }
  };

  const handleExternalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = externalApiUrl.trim() || getExternalApiUrl();
    if (!apiUrl) {
      setErrorMessage('No external backend configured. Please use the Instant Persona Switcher for offline demonstration mode.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed on external server.');
        return;
      }

      setSuccessMessage(`Authenticated with server as ${data.user.fullName} (${data.user.role}).`);
      if (data.user.role === 'moderator') {
        repository.setActiveUser('moderator');
        router.push('/moderator');
      } else {
        repository.setActiveUser('contributor');
        router.push('/search');
      }
    } catch (err: any) {
      setErrorMessage(`External connection error: ${err.message || 'Unable to reach backend service'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#044C4C] flex items-center justify-center text-white mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] tracking-tight">
          VERITY Access & Identity
        </h1>
        <p className="text-xs text-[#525C56] max-w-sm mx-auto">
          Manage your role, simulation persona, or connect to an external verification service.
        </p>
      </div>

      {/* Honest Architecture Notice */}
      <div className="p-4 rounded-2xl bg-[#F0F7F7] border border-[#D0E5E5] text-xs text-[#044C4C] space-y-1.5">
        <div className="flex items-center gap-2 font-bold font-mono text-[11px] uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#044C4C] shrink-0" />
          <span>Static Frontend Architecture</span>
        </div>
        <p className="text-[#36423C] text-[11px] leading-relaxed">
          This platform is deployed statically to GitHub Pages. All persona switching and evidence staging operate locally in your browser session. Cryptographically verified multi-node voting and server sessions require a connected external API service.
        </p>
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-[#E2E8E4]">
        <button
          type="button"
          onClick={() => setTab('personas')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            tab === 'personas'
              ? 'border-[#044C4C] text-[#044C4C]'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Instant Persona Switcher</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('external')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            tab === 'external'
              ? 'border-[#044C4C] text-[#044C4C]'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>External Backend (Optional)</span>
        </button>
      </div>

      {/* Tab 1: Instant Persona Switcher */}
      {tab === 'personas' && (
        <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold font-serif-headline text-[#141A17]">
              Select Active Operating Role
            </h2>
            <p className="text-[11px] text-[#69746E] mt-0.5">
              Instantly toggle application permissions and interfaces for evaluation:
            </p>
          </div>

          <div className="space-y-3">
            {/* Contributor Persona */}
            <button
              type="button"
              onClick={() => handleSelectPersona('contributor')}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                currentUser.role === 'contributor'
                  ? 'border-[#044C4C] bg-[#F0F7F7] shadow-xs'
                  : 'border-[#DDE4E0] hover:border-[#044C4C] bg-[#FAFBF9] hover:bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#141A17]">
                    Priya Sharma (Verified Contributor)
                  </span>
                  {currentUser.role === 'contributor' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#044C4C] text-white font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#525C56]">
                  priya.research@financialwatch.org • Contributor Dashboard, Community Poll Voting & Evidence Submission
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#044C4C] shrink-0 ml-2" />
            </button>

            {/* Moderator Persona */}
            <button
              type="button"
              onClick={() => handleSelectPersona('moderator')}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                currentUser.role === 'moderator'
                  ? 'border-[#044C4C] bg-[#F0F7F7] shadow-xs'
                  : 'border-[#DDE4E0] hover:border-[#044C4C] bg-[#FAFBF9] hover:bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#141A17]">
                    Vikram Rao, CFA (Senior Moderator)
                  </span>
                  {currentUser.role === 'moderator' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#044C4C] text-white font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#525C56]">
                  v.rao@verity-moderation.org • Moderator Queue, Evidence Approval/Rejection, Ingestion Console
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#044C4C] shrink-0 ml-2" />
            </button>

            {/* Public Guest Persona */}
            <button
              type="button"
              onClick={() => handleSelectPersona('guest')}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                currentUser.role === 'guest'
                  ? 'border-[#044C4C] bg-[#F0F7F7] shadow-xs'
                  : 'border-[#DDE4E0] hover:border-[#044C4C] bg-[#FAFBF9] hover:bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#141A17]">
                    Anonymous Visitor (Public Guest)
                  </span>
                  {currentUser.role === 'guest' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#044C4C] text-white font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#525C56]">
                  guest@verity.network • Public Read-Only Access across dossiers, search, and directory
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#044C4C] shrink-0 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: External Backend Configuration & Live Login */}
      {tab === 'external' && (
        <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold font-serif-headline text-[#141A17]">
              External API Server Connection
            </h2>
            <p className="text-[11px] text-[#69746E] mt-0.5">
              If you have deployed the VERITY Node.js / Vercel API backend, connect its endpoint here:
            </p>
          </div>

          <form onSubmit={handleSaveApiUrl} className="space-y-2">
            <label className="block text-[11px] font-mono text-[#525C56] font-bold uppercase">
              Backend Endpoint URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={externalApiUrl}
                onChange={(e) => setExternalApiUrl(e.target.value)}
                placeholder="https://api.verity.network or http://localhost:3000"
                className="flex-1 px-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#044C4C] hover:bg-[#034343] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-[#F0F3F1]">
            <h3 className="text-xs font-bold font-mono text-[#36423C] mb-3 uppercase tracking-wider">
              Authenticate via External Backend
            </h3>
            <form onSubmit={handleExternalLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#525C56] font-semibold uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:bg-white focus:outline-none focus:border-[#044C4C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#525C56] font-semibold uppercase mb-1">
                  Password
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
                className="w-full py-2.5 px-4 bg-[#044C4C] hover:bg-[#034343] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{loading ? 'Connecting...' : 'Sign In via External Server'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
