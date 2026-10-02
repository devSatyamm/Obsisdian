'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { CommunitySubmission } from '@/lib/types';

export default function CommunityPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);

  useEffect(() => {
    setSubmissions(repository.getSubmissions());
  }, []);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8ECE9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
            <Link href="/" className="hover:text-[#044C4C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#141A17] font-medium">Community Watch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight">
            Collaborative Public Intelligence Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#525C56] mt-1">
            Real-time feed of evidence items, public regulatory alerts, and community-contributed statements.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Contribute Evidence</span>
        </Link>
      </div>

      {/* Community Standards Banner */}
      <div className="p-5 rounded-2xl bg-[#F0F7F7] border border-[#D5E2D9] text-xs text-[#044C4C] space-y-1.5">
        <div className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#044C4C]" />
          <span>Peer-Reviewed Evidentiary Standards</span>
        </div>
        <p className="text-[#4B534E] leading-relaxed">
          VERITY community contributions follow a strict non-defamatory verification standard. Every entry requires a verifiable primary URL (SEBI order, RBI circular, corporate exchange filing, or permanent web archive snapshot).
        </p>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#86928C] font-bold">
          Recent Community Submissions ({submissions.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#044C4C]"></span>
                    <span className="font-bold text-sm text-[#141A17]">{sub.entityName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      sub.status === 'approved'
                        ? 'bg-[#E5F7EB] text-[#166534] border border-[#A7F3D0]'
                        : sub.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                    }`}
                  >
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#044C4C] font-medium">
                  {sub.category} • {sub.evidenceCategory}
                </div>

                <h3 className="text-xs font-bold text-[#141A17] leading-snug">{sub.title}</h3>

                <p className="text-xs text-[#525C56] leading-relaxed line-clamp-3">
                  {sub.factualDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F5F7F5] flex items-center justify-between text-[11px] text-[#86928C]">
                <span>By {sub.submittedBy.name}</span>

                <a
                  href={sub.primarySourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#044C4C] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Primary source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
