import React, { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#044C4C] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-[#69746E]">Loading VERITY Claim Intelligence Engine...</p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
