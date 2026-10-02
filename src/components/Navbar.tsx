'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Users,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { UserPersona } from '@/lib/types';
import { DEMO_PERSONAS } from '@/lib/data/mockData';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.contributor);
  const [pendingCount, setPendingCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleSelectPersona = (role: 'guest' | 'contributor' | 'moderator') => {
    const user = repository.setActiveUser(role);
    setCurrentUser(user);
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Live Search', href: '/search' },
    { label: 'Explore', href: '/explore' },
    { label: 'Claim History', href: '/#recent-changes' },
    { label: 'Discovery', href: '/discovery', isPulse: true },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' }
  ];

  if (pathname === '/search') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8ECE9] bg-[#FAFBF9]/95 backdrop-blur-md">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-[#044C4C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2.5L5 9.5V20.5L16 29.5L27 20.5V9.5L16 2.5ZM16 6.8L23.5 11.5L16 16.2L8.5 11.5L16 6.8ZM7.5 13.6L14.5 18V25.2L7.5 19.5V13.6ZM17.5 25.2V18L24.5 13.6V19.5L17.5 25.2Z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1F1C]">VERITY</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-[#4B534E]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#E6F2F2] text-[#044C4C] font-semibold'
                      : 'hover:text-[#1A1F1C] hover:bg-[#F0F4F1]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isPulse && (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Search Box, Persona Selector, Contribute */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Pill */}
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D8DFDA] bg-white text-xs text-[#6B7570] hover:border-[#044C4C] transition-all shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[#86928C]" />
            <span className="font-normal text-[#86928C] pr-1">Live Search...</span>
            <kbd className="hidden sm:inline-block font-mono text-[9px] text-[#86928C] bg-[#F2F5F3] px-1.5 py-0.5 rounded border border-[#E0E5E2]">
              Ctrl K
            </kbd>
          </Link>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#2E3632] hover:text-[#1A1F1C] rounded-full border border-[#E0E5E2] bg-white hover:bg-[#F8FAF9] transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-[#044C4C] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {currentUser.avatarInitials}
              </div>
              <span className="hidden sm:inline font-mono capitalize text-[11px] text-[#4B534E]">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-[#86928C]" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#D8DFDA] shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-[#F0F3F1] mb-1">
                  <div className="font-semibold text-[#141A17]">{currentUser.name}</div>
                  <div className="text-[10px] text-[#86928C] font-mono">{currentUser.email}</div>
                </div>

                <div className="px-3 py-1 text-[10px] font-mono text-[#86928C] uppercase tracking-wider">
                  Switch Active Role
                </div>

                <button
                  onClick={() => handleSelectPersona('guest')}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F4F7F5] transition-colors ${
                    currentUser.role === 'guest' ? 'font-bold text-[#044C4C]' : 'text-[#4B534E]'
                  }`}
                >
                  <span>Public Guest</span>
                  {currentUser.role === 'guest' && <span>✓</span>}
                </button>

                <button
                  onClick={() => handleSelectPersona('contributor')}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F4F7F5] transition-colors ${
                    currentUser.role === 'contributor' ? 'font-bold text-[#044C4C]' : 'text-[#4B534E]'
                  }`}
                >
                  <span>Verified Contributor</span>
                  {currentUser.role === 'contributor' && <span>✓</span>}
                </button>

                <button
                  onClick={() => handleSelectPersona('moderator')}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F4F7F5] transition-colors ${
                    currentUser.role === 'moderator' ? 'font-bold text-[#044C4C]' : 'text-[#4B534E]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Senior Moderator</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  {currentUser.role === 'moderator' && <span>✓</span>}
                </button>

                <div className="border-t border-[#F0F3F1] mt-1 pt-1">
                  <Link
                    href="/search"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-1.5 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F4F7F5] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-[#044C4C]">
                      <span>Live Intelligence Search</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Real-Time
                    </span>
                  </Link>
                  <Link
                    href="/discovery"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-1.5 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F4F7F5] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>Discovery Engine</span>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Phase 5
                    </span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-1.5 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F4F7F5]"
                  >
                    My Submissions
                  </Link>
                  <Link
                    href="/moderator"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-1.5 text-[#4B534E] hover:text-[#044C4C] hover:bg-[#F4F7F5] flex items-center justify-between"
                  >
                    <span>Moderation Queue</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Contribute Button */}
          <Link
            href="/submit"
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs hover:shadow-sm transition-all shrink-0 inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Contribute</span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#4B534E] hover:bg-[#F0F4F1] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-b border-[#E8ECE9] space-y-2 text-xs font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#2E3632] hover:bg-[#F0F4F1]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#F0F3F1] space-y-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#044C4C] font-medium bg-[#E6F2F2] hover:bg-[#D5E4DC]"
            >
              Live Intelligence Search (Web)
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#4B534E] hover:bg-[#F0F4F1]"
            >
              Contributor Dashboard
            </Link>
            <Link
              href="/moderator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#4B534E] hover:bg-[#F0F4F1]"
            >
              Moderator Queue ({pendingCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
