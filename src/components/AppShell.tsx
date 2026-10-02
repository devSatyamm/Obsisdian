'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  FileText,
  FolderClosed,
  BarChart2,
  Radio,
  BookOpen,
  Settings,
  Users,
  PlusCircle,
  Bell,
  ChevronDown,
  Sparkles,
  Check,
  ShieldCheck,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { UserPersona } from '@/lib/types';
import { DEMO_PERSONAS } from '@/lib/data/mockData';
import { Footer } from './Footer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t, languagesList, currentLanguageObj } = useLanguage();

  const [topSearch, setTopSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.contributor);
  const [pendingCount, setPendingCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setCurrentUser(repository.getActiveUser());
      setPendingCount(repository.getSubmissions('pending').length);
    };
    update();

    window.addEventListener('verity_data_updated', update);
    window.addEventListener('verity_user_changed', update);
    return () => {
      window.removeEventListener('verity_data_updated', update);
      window.removeEventListener('verity_user_changed', update);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const handleSelectPersona = (role: 'guest' | 'contributor' | 'moderator') => {
    const user = repository.setActiveUser(role);
    setCurrentUser(user);
    setUserDropdownOpen(false);
  };

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(topSearch.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const navItems = [
    { label: t('nav.home', 'Home'), href: '/', icon: Home, exact: true },
    { label: t('nav.search', 'Search'), href: '/search', icon: Search },
    { label: t('nav.investigations', 'Investigations'), href: '/explore', icon: FileText },
    { label: t('nav.evidence_library', 'Evidence Library'), href: '/research', icon: FolderClosed },
    { label: t('nav.reports', 'Reports'), href: '/dashboard', icon: BarChart2 },
    { label: t('nav.monitoring', 'Monitoring'), href: '/discovery', icon: Radio, isPulse: true },
    { label: t('nav.knowledge_hub', 'Knowledge Hub'), href: '/about', icon: BookOpen },
    { label: t('nav.settings', 'Settings'), href: '/moderator', icon: Settings },
  ];

  const secondaryNavItems = [
    { label: t('nav.community', 'Community'), href: '/community', icon: Users },
    { label: t('nav.submit_claim', 'Submit Claim'), href: '/submit', icon: PlusCircle },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = () => (
    <div className="space-y-6">
      {/* Primary Navigation List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = isItemActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                active
                  ? 'font-bold bg-[#E6F2F2] text-[#044C4C] shadow-2xs'
                  : 'font-semibold text-[#525C56] hover:bg-[#F0F7F7] hover:text-[#044C4C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-[#044C4C]' : 'text-[#6A7670]'}`} />
                <span>{item.label}</span>
              </div>
              {item.isPulse && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#044C4C]"></span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Additional Features Section */}
      <div className="pt-2 border-t border-[#E8ECE9]">
        <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#8A9690] font-semibold">
          Platform Workspace
        </div>
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                  active
                    ? 'font-bold bg-[#E6F2F2] text-[#044C4C]'
                    : 'font-medium text-[#525C56] hover:bg-[#F0F7F7] hover:text-[#044C4C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-[#6A7670]" />
                  <span>{item.label}</span>
                </div>
                {item.label === 'Submit Claim' && pendingCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#044C4C] text-white font-bold">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#141A17] flex font-sans antialiased">
      {/* ==================== DESKTOP LEFT SIDEBAR ==================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E2E8E4] flex-col justify-between shrink-0 p-4 sticky top-0 h-screen z-40 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Logo & Tag */}
          <Link href="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-[#044C4C] transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2.5L5 9.5V20.5L16 29.5L27 20.5V9.5L16 2.5ZM16 6.8L23.5 11.5L16 16.2L8.5 11.5L16 6.8ZM7.5 13.6L14.5 18V25.2L7.5 19.5V13.6ZM17.5 25.2V18L24.5 13.6V19.5L17.5 25.2Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#141A17] leading-none">VERITY</span>
              <span className="text-[9px] font-mono text-[#044C4C] uppercase tracking-wider font-semibold mt-0.5">Truth. Verified.</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {renderNavLinks()}
        </div>

        {/* Bottom Platform Capabilities Card (Clean Analyst Hub, No Tier 3) */}
        <div className="space-y-4 pt-4 border-t border-[#E8ECE9]">
          <div className="p-3.5 bg-[#FAFBF9] rounded-2xl border border-[#E2E8E4] space-y-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#044C4C] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#044C4C]" />
              <span>{t('nav.analyst_platform', 'Analyst Platform')}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#525C56]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#044C4C] shrink-0" />
                <span>{t('nav.capabilities.search', 'Advanced multi-source search')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#044C4C] shrink-0" />
                <span>{t('nav.capabilities.analysis', 'AI-assisted analysis')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#044C4C] shrink-0" />
                <span>{t('nav.capabilities.verification', 'Cross-platform verification')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#044C4C] shrink-0" />
                <span>{t('nav.capabilities.export', 'Export & share reports')}</span>
              </li>
            </ul>
          </div>

          <div className="px-2 text-[11px] text-[#86928C] font-mono leading-tight flex items-center justify-between">
            <div>
              <span className="font-bold text-[#141A17]">VERITY</span>
              <div>{t('nav.version', 'Truth. Verified. v3.2.0')}</div>
            </div>
            <span className="text-[10px] bg-[#E6F2F2] text-[#044C4C] font-mono px-2 py-0.5 rounded-full font-bold">
              v3.2.0
            </span>
          </div>
        </div>
      </aside>

      {/* ==================== MOBILE SLIDEOUT SIDEBAR ==================== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE9]">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-[#044C4C]" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 2.5L5 9.5V20.5L16 29.5L27 20.5V9.5L16 2.5ZM16 6.8L23.5 11.5L16 16.2L8.5 11.5L16 6.8ZM7.5 13.6L14.5 18V25.2L7.5 19.5V13.6ZM17.5 25.2V18L24.5 13.6V19.5L17.5 25.2Z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#141A17]">VERITY</span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[#6A7670] hover:bg-[#F0F7F7] hover:text-[#044C4C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavLinks()}
            </div>

            <div className="pt-4 border-t border-[#E8ECE9] text-[11px] text-[#86928C] font-mono">
              <div className="font-bold text-[#141A17]">VERITY Analyst Console</div>
              <div>{t('nav.version', 'Truth. Verified. v3.2.0')}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RIGHT MAIN COLUMN ==================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8E4] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl border border-[#E0E5E2] hover:bg-[#F0F7F7] text-[#141A17]"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#044C4C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2.5L5 9.5V20.5L16 29.5L27 20.5V9.5L16 2.5ZM16 6.8L23.5 11.5L16 16.2L8.5 11.5L16 6.8ZM7.5 13.6L14.5 18V25.2L7.5 19.5V13.6ZM17.5 25.2V18L24.5 13.6V19.5L17.5 25.2Z" />
              </svg>
              <span className="font-bold tracking-tight text-sm text-[#141A17]">VERITY</span>
            </Link>
          </div>

          {/* Universal Header Search Input */}
          <form onSubmit={handleTopSearchSubmit} className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-[#86928C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              placeholder={t('header.search_placeholder', 'Search people, organizations, events...')}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAFBF9] rounded-xl border border-[#E0E5E2] focus:border-[#044C4C] focus:bg-white focus:outline-none transition-all placeholder:text-[#86928C]"
            />
          </form>

          {/* Right Actions: Language Selector, Live Status, Notifications & User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Indian Multilingual Selector Button */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E2E8E4] bg-white hover:bg-[#F0F7F7] text-xs font-medium text-[#141A17] transition-all cursor-pointer shadow-2xs hover:border-[#044C4C]"
                title="Change Language (भाषा)"
              >
                <Globe className="w-3.5 h-3.5 text-[#044C4C]" />
                <span className="font-bold text-[#044C4C]">{currentLanguageObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-[#86928C]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E2E8E4] shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3.5 py-1.5 border-b border-[#F0F3F1] mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A9690] font-bold">
                      {t('header.language', 'Language')} (India)
                    </span>
                    <Globe className="w-3.5 h-3.5 text-[#044C4C]" />
                  </div>
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#F0F7F7] transition-colors cursor-pointer ${
                        language === lang.code ? 'font-bold text-[#044C4C] bg-[#E6F2F2]' : 'text-[#4B534E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{lang.nativeName}</span>
                        <span className="text-[10px] text-[#86928C] font-mono">({lang.name})</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-[#044C4C]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F2F2] border border-[#B2D8D8] text-[11px] font-mono font-bold text-[#044C4C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#044C4C] animate-pulse"></span>
              <span>{t('header.live_system', 'LIVE SYSTEM')}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl hover:bg-[#F0F7F7] text-[#525C56] relative border border-[#E2E8E4] transition-colors"
                aria-label="View system alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#044C4C] rounded-full border border-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E2E8E4] shadow-xl p-3 z-50 text-xs space-y-2">
                  <div className="font-bold text-[#141A17] pb-2 border-b border-[#E8ECE9] flex items-center justify-between">
                    <span>Intelligence Alerts</span>
                    <span className="text-[10px] font-mono text-[#044C4C] bg-[#E6F2F2] px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8E4]">
                      <div className="font-bold text-[#141A17]">Multi-engine crawler synchronized</div>
                      <div className="text-[#6A7670] mt-0.5">Live index refreshed across 12 canonical domains.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8E4]">
                      <div className="font-bold text-[#141A17]">Relevance validation active</div>
                      <div className="text-[#6A7670] mt-0.5">Strict multi-token entity matching enabled.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill / Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-[#E2E8E4] bg-white hover:bg-[#F0F7F7] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#044C4C] text-white text-xs font-mono flex items-center justify-center font-bold shadow-2xs">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#141A17] leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#044C4C] font-mono font-medium capitalize mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#86928C]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#E2E8E4] shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#F0F3F1] mb-1">
                    <div className="font-bold text-[#141A17]">{currentUser.name}</div>
                    <div className="text-[10px] text-[#86928C] font-mono">{currentUser.email}</div>
                  </div>

                  <div className="px-4 py-1 text-[10px] font-mono text-[#86928C] uppercase tracking-wider font-semibold">
                    Switch Active Role
                  </div>

                  <button
                    onClick={() => handleSelectPersona('guest')}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-[#F0F7F7] transition-colors ${
                      currentUser.role === 'guest' ? 'font-bold text-[#044C4C] bg-[#E6F2F2]' : 'text-[#4B534E]'
                    }`}
                  >
                    <span>Public Guest</span>
                    {currentUser.role === 'guest' && <span>✓</span>}
                  </button>

                  <button
                    onClick={() => handleSelectPersona('contributor')}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-[#F0F7F7] transition-colors ${
                      currentUser.role === 'contributor' ? 'font-bold text-[#044C4C] bg-[#E6F2F2]' : 'text-[#4B534E]'
                    }`}
                  >
                    <span>Contributor</span>
                    {currentUser.role === 'contributor' && <span>✓</span>}
                  </button>

                  <button
                    onClick={() => handleSelectPersona('moderator')}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-[#F0F7F7] transition-colors ${
                      currentUser.role === 'moderator' ? 'font-bold text-[#044C4C] bg-[#E6F2F2]' : 'text-[#4B534E]'
                    }`}
                  >
                    <span>Moderator</span>
                    {currentUser.role === 'moderator' && <span>✓</span>}
                  </button>

                  <div className="border-t border-[#F0F3F1] my-1"></div>

                  <Link
                    href="/submit"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F0F7F7]"
                  >
                    Submit New Claim
                  </Link>
                  <Link
                    href="/moderator"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F0F7F7]"
                  >
                    Moderation Console
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  );
};
