'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PolicyModal } from './PolicyModal';

export const Footer = () => {
  const pathname = usePathname();
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  if (pathname === '/search') {
    return null;
  }

  return (
    <>
      <footer className="w-full border-t border-[#E8ECE9] bg-white text-xs text-[#6B7570] mt-20 pt-12 pb-8">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand & Tagline */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#044C4C]" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 2.5L5 9.5V20.5L16 29.5L27 20.5V9.5L16 2.5ZM16 6.8L23.5 11.5L16 16.2L8.5 11.5L16 6.8ZM7.5 13.6L14.5 18V25.2L7.5 19.5V13.6ZM17.5 25.2V18L24.5 13.6V19.5L17.5 25.2Z" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-[#141A17]">VERITY</span>
              </div>
              <p className="text-xs text-[#525C56] max-w-sm leading-relaxed">
                Open Intelligence for a Safer Information Space. Documenting the immutable history of public corporate statements, evidence, and verified revisions.
              </p>
              <div className="text-[11px] text-[#86928C] font-mono">
                Open Access CC-BY-4.0 • Zero tracking
              </div>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#141A17] text-xs uppercase tracking-wider font-mono">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/explore" className="hover:text-[#044C4C] transition-colors">
                    Explore Claims
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-[#044C4C] transition-colors">
                    Tracked Organisations
                  </Link>
                </li>
                <li>
                  <Link href="/#recent-changes" className="hover:text-[#044C4C] transition-colors">
                    Claim History & Diffs
                  </Link>
                </li>
                <li>
                  <Link href="/research" className="hover:text-[#044C4C] transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-[#044C4C] transition-colors">
                    Community Feed
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: About & Team */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#141A17] text-xs uppercase tracking-wider font-mono">About</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-[#044C4C] transition-colors font-medium text-[#141A17]">
                    About VERITY
                  </Link>
                </li>
                <li>
                  <Link href="/about#contributors" className="hover:text-[#044C4C] transition-colors">
                    Meet the Contributors
                  </Link>
                </li>
                <li>
                  <Link href="/about#why-verity" className="hover:text-[#044C4C] transition-colors">
                    Why VERITY Exists
                  </Link>
                </li>
                <li>
                  <Link href="/about#how-it-works" className="hover:text-[#044C4C] transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Policies & Governance */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#141A17] text-xs uppercase tracking-wider font-mono">Policies & Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActivePolicy('terms')}
                    className="hover:text-[#044C4C] transition-colors text-left cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('privacy')}
                    className="hover:text-[#044C4C] transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('contribution')}
                    className="hover:text-[#044C4C] transition-colors text-left cursor-pointer"
                  >
                    Contribution Guidelines
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('source')}
                    className="hover:text-[#044C4C] transition-colors text-left cursor-pointer"
                  >
                    Source & Evidence Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('corrections')}
                    className="hover:text-[#044C4C] transition-colors text-left cursor-pointer"
                  >
                    Corrections Policy
                  </button>
                </li>
                <li className="pt-1 text-[#86928C] text-[11px]">
                  Contact: <span className="font-mono text-[#4B534E]">contact@verity.network</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[#E8ECE9] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86928C]">
            <div>
              © 2024–2026 VERITY Public Claim Intelligence. SANGYAN Hackathon Track A.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setActivePolicy('terms')} className="hover:underline cursor-pointer">
                Terms
              </button>
              <span>•</span>
              <button onClick={() => setActivePolicy('privacy')} className="hover:underline cursor-pointer">
                Privacy
              </button>
              <span>•</span>
              <button onClick={() => setActivePolicy('corrections')} className="hover:underline cursor-pointer">
                Corrections
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modal Viewer */}
      <PolicyModal policyKey={activePolicy} onClose={() => setActivePolicy(null)} />
    </>
  );
};
