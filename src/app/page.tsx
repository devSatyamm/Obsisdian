'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  FileText,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Layers,
  ShieldCheck,
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { EntityProfile, CommunitySubmission } from '@/lib/types';
import { ClaimDiffModal, ClaimDiffData } from '@/components/ClaimDiffModal';

// Static claim comparisons matching the editorial design in index.html
const RECENT_CLAIM_CHANGES: ClaimDiffData[] = [
  {
    id: 'byjus-users',
    orgName: "Byju's",
    title: "Byju's revised user count from 100 million to 150 million.",
    date: '3 hours ago',
    status: 'Under review',
    prevStatement: "Over 100 million registered learners trust Byju's for personalized K-12 learning.",
    currStatement: "Over 150 million registered learners trust Byju's for personalized K-12 learning worldwide.",
    summary: "Byju's updated their marketing press release and homepage claim stating user base expanded to 150M.",
    source: 'Corporate Press Release & Wayback Snapshot #202409',
    sourceUrl: 'https://web.archive.org'
  },
  {
    id: 'paytm-kyc',
    orgName: 'Paytm',
    title: 'Paytm updated KYC compliance statement.',
    date: '6 hours ago',
    status: 'Verified',
    prevStatement: "Paytm Payments Bank account services operate seamlessly with instant onboarding.",
    currStatement: "Paytm wallet and UPI services transition to partner banks under RBI transition guidelines.",
    summary: "Updated statutory compliance disclosure following Reserve Bank regulatory circular.",
    source: 'Paytm Corporate Exchange Filing',
    sourceUrl: 'https://bseindia.com'
  },
  {
    id: 'adani-green',
    orgName: 'Adani Group',
    title: 'Adani clarified renewable capacity target.',
    date: '1 day ago',
    status: 'Updated',
    prevStatement: "Adani Green Energy on track to achieve 45 GW renewable portfolio by 2030 without external debt.",
    currStatement: "Adani Green Energy targets 45 GW capacity by 2030 through balanced equity deployment and international capital partnerships.",
    summary: "Clarified debt structuring and international consortium equity commitments.",
    source: 'Adani Green Energy Investor Presentation Q1 2024',
    sourceUrl: 'https://adanigreenenergy.com'
  },
  {
    id: 'ola-subsidy',
    orgName: 'Ola Electric',
    title: 'Ola Electric added statement on government subsidy.',
    date: '2 days ago',
    status: 'Under review',
    prevStatement: "Ola S1 pricing reflects direct retail prices inclusive of state EV subsidies.",
    currStatement: "Ola S1 pricing excludes optional off-board charger cost under updated EMPS subsidy framework.",
    summary: "Added explicit breakdown of charger billing in response to Ministry of Heavy Industries notices.",
    source: 'Ministry of Heavy Industries Filing',
    sourceUrl: 'https://mhi.gov.in'
  },
  {
    id: 'rbi-rupee',
    orgName: 'Reserve Bank of India',
    title: 'RBI updated FAQ on digital rupee.',
    date: '3 days ago',
    status: 'Verified',
    prevStatement: "Central Bank Digital Currency (e₹) pilot operates on closed invitation token system.",
    currStatement: "e₹-R is interoperable with existing UPI QR codes across participating commercial banks.",
    summary: "Updated retail CBDC technical architecture for widespread QR interoperability.",
    source: 'RBI Department of Payment & Settlement Systems',
    sourceUrl: 'https://rbi.org.in'
  }
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [entities, setEntities] = useState<EntityProfile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<CommunitySubmission[]>([]);
  const [selectedClaimDiff, setSelectedClaimDiff] = useState<ClaimDiffData | null>(null);

  useEffect(() => {
    setEntities(repository.getEntities());
    setRecentSubmissions(repository.getSubmissions().slice(0, 3));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const executeSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ==================== HERO SECTION ==================== */}
      <section className="max-w-4xl mx-auto text-center pt-4 pb-4 space-y-6">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider text-[#637068] uppercase">
          <span className="text-[#044C4C] text-[10px]">◆</span>
          <span>REAL-TIME INTERNET CLAIM INTELLIGENCE</span>
          <span className="text-[#044C4C] text-[10px]">◆</span>
        </div>

        {/* Main Headline with Editorial Serif Typography */}
        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-serif-headline font-bold text-[#141A17] tracking-tight leading-[1.05]">
          Every claim has a <span className="text-[#044C4C]">history.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#525C56] leading-relaxed max-w-xl mx-auto font-normal">
          Search any public incident, breaking statement, company, or policy.<br className="hidden sm:inline" />
          VERITY crawls the live web, extracts factual claims, and audits source evidence in real time.
        </p>

        {/* Central Search Box */}
        <div className="relative max-w-2xl mx-auto pt-1">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full border border-[#D0E5E5] p-2 pl-5 shadow-sm hover:border-[#044C4C] focus-within:border-[#044C4C] focus-within:shadow-md transition-all"
          >
            <Search className="w-5 h-5 text-[#8A958E] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any incident, person, or claim (e.g. 'Smith Dubai airline incident')..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#181F1B] placeholder-[#9CA7A0]"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="px-5 py-2.5 rounded-full bg-[#044C4C] hover:bg-[#034343] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 ml-2 shadow-xs cursor-pointer text-xs font-semibold gap-1.5"
            >
              <span>Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#5D6761] mt-4">
            <span className="text-[#8B968F] font-mono text-[11px]">Live Search:</span>
            <button
              onClick={() => executeSearch("Smith Dubai airline incident")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E0E7E2] hover:border-[#044C4C] hover:text-[#044C4C] transition-all text-[11px] shadow-2xs cursor-pointer font-medium text-[#044C4C]"
            >
              Smith Dubai airline incident ★
            </button>
            <button
              onClick={() => executeSearch("Ola Electric subsidy charger notice")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E0E7E2] hover:border-[#044C4C] hover:text-[#044C4C] transition-all text-[11px] shadow-2xs cursor-pointer"
            >
              Ola Electric subsidy
            </button>
            <button
              onClick={() => executeSearch("Byju user count")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E0E7E2] hover:border-[#044C4C] hover:text-[#044C4C] transition-all text-[11px] shadow-2xs cursor-pointer"
            >
              Byju&apos;s user count
            </button>
            <button
              onClick={() => executeSearch("SEBI algorithmic trading advisory")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E0E7E2] hover:border-[#044C4C] hover:text-[#044C4C] transition-all text-[11px] shadow-2xs cursor-pointer"
            >
              Algo trading advisory
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 4-PILLAR FEATURE HIGHLIGHTS ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#D0E5E5] flex items-center justify-center text-[#044C4C] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#141A17] leading-tight">Track Statements</div>
            <div className="text-[11px] text-[#69746E] mt-0.5">See how claims evolve over time</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#D0E5E5] flex items-center justify-center text-[#044C4C] shrink-0">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#141A17] leading-tight">Compare Changes</div>
            <div className="text-[11px] text-[#69746E] mt-0.5">View differences between versions</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#D0E5E5] flex items-center justify-center text-[#044C4C] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#141A17] leading-tight">Explore Evidence</div>
            <div className="text-[11px] text-[#69746E] mt-0.5">Read original sources & filings</div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#D0E5E5] flex items-center justify-center text-[#044C4C] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#141A17] leading-tight">Community Driven</div>
            <div className="text-[11px] text-[#69746E] mt-0.5">Contribute and verify public records</div>
          </div>
        </div>
      </section>

      {/* ==================== AUTONOMOUS DISCOVERY & CLAIM INTELLIGENCE BANNER ==================== */}
      <section className="bg-gradient-to-r from-[#044C4C] via-[#034343] to-[#0A2E22] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#065A5A]">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                Autonomous Web Intelligence Engine
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-emerald-100 border border-white/20">
                Phase 5 Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Continuously crawling statutory feeds (RBI, SEBI, regulatory notices & press releases), extracting attributable factual statements, and staging versioned claims with immutable diffs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/discovery"
            className="px-5 py-2.5 rounded-xl bg-white text-[#044C4C] hover:bg-emerald-50 text-xs font-semibold transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Inspect Discovery Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ==================== THREE-COLUMN SECTION ==================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Recently updated organisations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E7E3] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F1]">
            <h2 className="text-sm font-bold text-[#141A17]">Recently updated organisations</h2>
            <Link href="/explore" className="text-xs font-semibold text-[#044C4C] hover:underline">
              View all →
            </Link>
          </div>

          <div className="space-y-3.5 divide-y divide-[#F5F7F5]">
            {entities.map((ent, idx) => (
              <Link
                key={ent.id}
                href={`/entity/${ent.slug}`}
                className={`pt-3 first:pt-0 group flex items-center justify-between gap-3 text-xs block hover:bg-[#F9FAF9] p-1.5 rounded-xl transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      idx === 0
                        ? 'bg-[#5B237E] text-white'
                        : idx === 1
                        ? 'bg-[#002E6E] text-[#00BAF2]'
                        : idx === 2
                        ? 'bg-[#044C4C] text-white'
                        : 'bg-[#1E5799] text-white'
                    }`}
                  >
                    {ent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#141A17] group-hover:text-[#044C4C] transition-colors leading-tight">
                      {ent.name}
                    </h4>
                    <span className="text-[11px] text-[#717C76]">{ent.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-semibold text-[#141A17]">
                    {ent.revisions.length + ent.evidence.length} records
                  </div>
                  <div className="text-[10px] text-[#86928C]">
                    {new Date(ent.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Recent claim changes (4 cols) */}
        <div id="recent-changes" className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E7E3] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F1]">
            <h2 className="text-sm font-bold text-[#141A17]">Recent claim changes</h2>
            <span className="text-xs font-semibold text-[#044C4C]">Click to diff →</span>
          </div>

          <div className="space-y-4 text-xs">
            {RECENT_CLAIM_CHANGES.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedClaimDiff(item)}
                className="cursor-pointer group flex items-start justify-between gap-2.5 p-1.5 rounded-xl hover:bg-[#F9FAF9] transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      item.status === 'Verified'
                        ? 'bg-[#2E7D5B]'
                        : item.status === 'Under review'
                        ? 'bg-[#D97706]'
                        : 'bg-[#1D4ED8]'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-[#141A17] group-hover:text-[#044C4C] leading-snug">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-[#86928C]">
                      {item.orgName} · {item.date}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    item.status === 'Verified'
                      ? 'bg-[#E5F7EB] text-[#166534]'
                      : item.status === 'Under review'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#EBF3FF] text-[#1D4ED8]'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Explore by sector (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E7E3] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F1]">
            <h2 className="text-sm font-bold text-[#141A17]">Explore by sector</h2>
            <Link href="/explore" className="text-xs font-semibold text-[#044C4C] hover:underline">
              →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => router.push('/explore?category=Algorithmic+Trading')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🤖</span>
                <span className="font-medium group-hover:text-[#044C4C]">Algorithmic Trading</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>

            <button
              onClick={() => router.push('/explore?category=Forex+%26+CFD+Broker')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">💱</span>
                <span className="font-medium group-hover:text-[#044C4C]">Forex & CFD Brokers</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>

            <button
              onClick={() => router.push('/explore?category=Crypto+Yield+%26+Staking')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🪙</span>
                <span className="font-medium group-hover:text-[#044C4C]">Crypto Yield & Staking</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>

            <button
              onClick={() => router.push('/explore?category=P2P+Lending')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🤝</span>
                <span className="font-medium group-hover:text-[#044C4C]">P2P Lending</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>

            <button
              onClick={() => router.push('/explore?category=Advisory+%26+Telegram+Tipster')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">📱</span>
                <span className="font-medium group-hover:text-[#044C4C]">Advisory & Tipsters</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>

            <button
              onClick={() => router.push('/explore?category=Regulated+Depository+%26+Broker')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7F5] transition-colors group text-[#2A332E] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🏛️</span>
                <span className="font-medium group-hover:text-[#044C4C]">Regulated Depositories</span>
              </div>
              <span className="text-[#A2ADA6] group-hover:text-[#141A17]">›</span>
            </button>
          </div>
        </div>
      </section>

      {/* Claim Diff Modal */}
      <ClaimDiffModal claim={selectedClaimDiff} onClose={() => setSelectedClaimDiff(null)} />
    </div>
  );
}
