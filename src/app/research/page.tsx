'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  ShieldCheck,
  Database,
  ExternalLink,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2,
  FileCode
} from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8ECE9]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
          <Link href="/" className="hover:text-[#044C4C] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#141A17] font-medium">Research Methodology</span>
        </div>

        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider mb-2">
          <span>Standards & Hygiene</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight">
          Evidentiary Standards & Research Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-[#525C56] mt-2 max-w-3xl leading-relaxed">
          VERITY applies a rigorous evidentiary hierarchy inspired by institutional compliance and intelligence analysis. We do not use arbitrary risk scores or unverified user ratings.
        </p>
      </div>

      {/* 4-Tier Source Hierarchy */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-serif-headline font-bold text-[#141A17]">
            Source Verification Hierarchy
          </h2>
          <p className="text-xs text-[#525C56] leading-relaxed mt-1">
            Every statement published on an organisation&apos;s profile is assigned to an evidence tier. High-consequence regulatory warnings require Tier 1 or Tier 2 verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#166534] bg-[#E5F7EB] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                Tier 1: Statutory Regulatory Orders
              </span>
              <span className="text-[11px] font-mono text-[#86928C]">Primary Authority</span>
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed">
              Official gazettes, caution lists, and adjudication orders issued directly by SEBI, RBI, MCA, or High Courts. These constitute statutory public records.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#1D4ED8] bg-[#EBF3FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                Tier 2: Public Corporate Filings
              </span>
              <span className="text-[11px] font-mono text-[#86928C]">Corporate Registry</span>
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed">
              Ministry of Corporate Affairs (MCA21) master data, exchange membership rosters (NSE/BSE/MCX), and audited annual financial statements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#141A17] bg-[#F0F4F1] px-2.5 py-0.5 rounded-full border border-[#D5DFD8]">
                Tier 3: Investigative Financial Press
              </span>
              <span className="text-[11px] font-mono text-[#86928C]">Attributed Media</span>
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed">
              Reports from accredited business newsrooms (The Economic Times, Mint, Reuters, Bloomberg) covering enforcement orders or court proceedings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                Tier 4: Corroborated Community Evidence
              </span>
              <span className="text-[11px] font-mono text-[#86928C]">Peer-Reviewed</span>
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed">
              Contract terms, marketing screenshots, and bank extracts submitted by retail investors, verified by our peer moderation team before inclusion.
            </p>
          </div>
        </div>
      </section>

      {/* Modular Source Adapters Architecture */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-serif-headline font-bold text-[#141A17]">
            Modular Data Pipeline & Traceable Storage Architecture
          </h2>
          <p className="text-xs text-[#525C56] leading-relaxed mt-1">
            VERITY implements a decoupled adapter architecture. Each regulatory source is ingested, deduplicated, and linked to entity records.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#044C4C] text-emerald-100 font-mono text-xs overflow-x-auto shadow-xs space-y-3">
          <div className="text-emerald-300 text-[11px] border-b border-[#1C533F] pb-2 flex items-center justify-between">
            <span>REPOSITORY DATA FLOW: VERITY ARCHITECTURE</span>
            <span className="text-emerald-400 font-bold">Active Pipeline</span>
          </div>
          <pre className="text-xs text-emerald-200 leading-relaxed">
{`[SEBI Public Notices API / Circulars]  ──┐
[RBI Unauthorized Forex Alert List]   ──┼──> [Source Ingestion & Deduplication Adapter]
[MCA Corporate Master Data Portal]     ──┤                   │
[Community Submissions Portal]        ──┘                   ▼
                                            [Moderation Review Queue]
                                                    │ (Approval)
                                                    ▼
                                            [Public Entity Dossier]
                                                    │
                                                    ▼
                                            [Versioned Revision History & Diffs]`}
          </pre>
        </div>
      </section>

      {/* Non-Defamation & Neutrality Notice */}
      <section className="p-6 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-[#141A17] text-sm">
          <ShieldCheck className="w-5 h-5 text-[#044C4C]" />
          <span>Objective Neutrality & Legal Compliance Protocol</span>
        </div>
        <p className="text-xs text-[#525C56] leading-relaxed">
          VERITY is committed to evidentiary fairness. We strictly avoid speculative language, clickbait scam scores, or subjective commentary. If an official notice is vacated or an entity secures regulatory registration, the revision history documents the change transparently.
        </p>
      </section>
    </div>
  );
}
