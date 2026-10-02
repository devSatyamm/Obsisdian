'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { CommunitySubmission, UserPersona } from '@/lib/types';
import { DEMO_PERSONAS } from '@/lib/data/mockData';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.contributor);
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);

  useEffect(() => {
    const update = () => {
      const user = repository.getActiveUser();
      setCurrentUser(user);
      const all = repository.getSubmissions();
      setSubmissions(all);
    };
    update();

    window.addEventListener('verity_data_updated', update);
    window.addEventListener('verity_user_changed', update);
    return () => {
      window.removeEventListener('verity_data_updated', update);
      window.removeEventListener('verity_user_changed', update);
    };
  }, []);

  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

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
            <span className="text-[#141A17] font-medium">Contributor Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight">
              My Evidence Contributions
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#E6F2F2] text-[#044C4C] border border-[#D5E2D9] font-semibold">
              Active Persona: {currentUser.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#525C56] mt-1">
            Track peer-review progress, verification statuses, and approved public timeline merges.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs">
          <span className="text-xs font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
            Total Submissions
          </span>
          <div className="text-2xl font-bold font-serif-headline text-[#141A17]">{submissions.length}</div>
          <span className="text-[11px] text-[#525C56] mt-1 block">Logged to public ledger</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs">
          <span className="text-xs font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
            Approved & Merged
          </span>
          <div className="text-2xl font-bold font-serif-headline text-[#166534]">{approvedCount}</div>
          <span className="text-[11px] text-[#525C56] mt-1 block">Published on public profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs">
          <span className="text-xs font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
            Pending Moderation
          </span>
          <div className="text-2xl font-bold font-serif-headline text-[#92400E]">{pendingCount}</div>
          <span className="text-[11px] text-[#525C56] mt-1 block">In peer review queue</span>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#86928C] font-bold">
          Contribution History
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E2E7E3] rounded-2xl p-8 text-xs text-[#86928C] space-y-3">
            <p>You have not logged any evidence submissions yet.</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full"
            >
              Submit First Finding
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E7E3] rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-[#F0F3F1]">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-5 hover:bg-[#FAFBF9] transition-colors space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#141A17] text-sm">{sub.entityName}</span>
                      <span className="text-[#C1CBC5]">•</span>
                      <span className="text-[11px] font-mono text-[#044C4C]">{sub.category}</span>
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

                  <h3 className="font-semibold text-[#141A17]">{sub.title}</h3>
                  <p className="text-[#525C56] leading-relaxed">{sub.factualDescription}</p>

                  <div className="pt-2 border-t border-[#F5F7F5] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#86928C]">
                    <span className="font-mono">
                      Ref: {sub.id} • Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>

                    <a
                      href={sub.primarySourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#044C4C] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
