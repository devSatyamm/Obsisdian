'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-[#E6F2F2] border border-[#B2D8D8] text-[#044C4C] flex items-center justify-center shadow-xs">
        <Compass className="w-8 h-8 text-[#044C4C] animate-pulse" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#044C4C] bg-[#F0F7F7] px-3 py-1 rounded-full border border-[#D0E5E5]">
          HTTP 404 • Resource Not Located
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight pt-2">
          Claim Dossier or Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#525C56] leading-relaxed">
          The requested verification record, entity dossier, or address does not exist in the public repository or may have been consolidated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#044C4C] hover:bg-[#034343] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F8FAF9] text-[#141A17] border border-[#D5DFD8] text-xs font-semibold shadow-2xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#044C4C]" />
          <span>Live Claim Search</span>
        </Link>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F8FAF9] text-[#141A17] border border-[#D5DFD8] text-xs font-semibold shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#69746E]" />
          <span>Organisation Directory</span>
        </Link>
      </div>
    </div>
  );
}
