'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Scale,
  Layers,
  Info,
  AlertTriangle
} from 'lucide-react';
import {
  CONTRIBUTORS_LIST,
  ContributorData,
  ContributorModal
} from '@/components/ContributorModal';
import { PolicyModal } from '@/components/PolicyModal';

export default function AboutPage() {
  const [selectedContributor, setSelectedContributor] = useState<ContributorData | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  return (
    <div className="w-full flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. PAGE HEADER */}
      <section className="space-y-3 pb-6 border-b border-[#E8ECE9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider mb-2">
              <span>Platform Mission</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-headline font-bold text-[#141A17] tracking-tight">
              About VERITY
            </h1>
            <p className="text-base sm:text-lg text-[#044C4C] font-serif-headline italic mt-1">
              &ldquo;Built on transparency. Driven by evidence. Open to everyone.&rdquo;
            </p>
          </div>

          <Link
            href="/explore"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D5DFD8] bg-white text-xs font-semibold text-[#4B534E] hover:text-[#141A17] hover:border-[#044C4C] transition-all shadow-2xs"
          >
            <span>← Explore Directory</span>
          </Link>
        </div>

        <p className="text-xs sm:text-sm text-[#525C56] max-w-3xl leading-relaxed">
          VERITY is a public claim intelligence platform dedicated to recording, tracking, and comparing statements made by organizations, corporations, and institutions over time.
        </p>
      </section>

      {/* 2. CONTRIBUTORS SECTION */}
      <section id="contributors" className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider">
            <span>Team & Leadership</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] mt-0.5">
            Meet the Contributors
          </h2>
          <p className="text-xs sm:text-sm text-[#637068] mt-1 max-w-2xl">
            The people building a more transparent way to explore public claims and evidence.
          </p>
        </div>

        {/* 3 Contributor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTRIBUTORS_LIST.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContributor(c)}
              className="bg-white rounded-2xl border border-[#DDE4E0] p-6 shadow-xs hover:shadow-md hover:border-[#044C4C] transition-all cursor-pointer group flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl ${c.avatarBg} ${c.avatarColor} font-mono font-bold text-lg flex items-center justify-center border border-[#1C533F] shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    {c.initials}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0F7F7] text-[#044C4C] font-semibold border border-[#D5E2D9]">
                    Core Contributor
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                    {c.name}
                  </h3>
                  <div className="text-xs text-[#044C4C] font-medium mt-0.5">{c.role}</div>
                </div>

                <p className="text-xs text-[#525C56] leading-relaxed line-clamp-2">
                  {c.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0F3F1] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1">
                  <span>View Profile</span>
                  <span>→</span>
                </span>
                <div className="flex items-center gap-2 text-[#8A958E]">
                  <span className="hover:text-[#044C4C] font-mono text-[11px]">in</span>
                  <span className="hover:text-[#044C4C] font-mono text-[11px]">gh</span>
                  <span className="hover:text-[#044C4C] font-mono text-[11px]">𝕏</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHY VERITY EXISTS */}
      <section id="why-verity" className="bg-white rounded-2xl border border-[#E2E7E3] p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Problem & Mission */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider">
              <span>Platform Purpose</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] leading-tight">
              Why VERITY exists
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#4B534E] leading-relaxed">
              <p>
                In the digital era, public statements made by companies, financial institutions, and platforms change constantly. Marketing headlines are revised, critical disclaimers disappear from terms of service, and statistical claims are walked back without transparent notice.
              </p>
              <p>
                Traditional search engines and news cycles often capture only the latest version, leaving the public and researchers with fragmented records and no reliable way to verify what was originally promised.
              </p>
              <p>
                VERITY solves this by building an immutable, version-controlled public claim ledger. Every statement is documented verbatim alongside timestamped evidence, allowing anyone to inspect historical revisions side by side.
              </p>
            </div>

            {/* Mission Callout */}
            <div className="border-l-3 border-[#044C4C] pl-4 py-2 bg-[#F6FAF7] rounded-r-xl">
              <div className="text-[10px] font-mono font-bold uppercase text-[#044C4C]">Our Core Mission</div>
              <blockquote className="font-serif-headline text-sm sm:text-base font-semibold text-[#141A17] italic mt-0.5">
                &ldquo;Make the history of public claims accessible, traceable, and open to scrutiny.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Right Column: Statement Evolution Timeline */}
          <div className="lg:col-span-6 bg-[#FAFBF9] border border-[#E0E7E2] rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE9]">
              <span className="text-xs font-mono font-bold text-[#141A17]">Statement Evolution Timeline</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#D5DFD8] text-[#637068]">
                Audit Ref: CLM-8492
              </span>
            </div>

            {/* Step 1 */}
            <div className="relative pl-6 pb-4 border-l-2 border-[#D5DFD8] space-y-1">
              <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-[#D97706] border-2 border-white" />
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#141A17]">v1.0 • Initial Marketing Guarantee</span>
                <span className="text-[#8A958E]">14 Jan 2021</span>
              </div>
              <div className="bg-white border border-[#E0E7E2] rounded-lg p-2.5 text-xs text-[#1F2937] font-mono">
                &ldquo;Guaranteed <span className="diff-del">12% annual return</span> with <span className="diff-del">zero capital risk</span>.&rdquo;
              </div>
              <div className="text-[10px] text-[#86928C]">Source: Official Landing Page (Archived Snapshot #01)</div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-6 pb-4 border-l-2 border-[#D5DFD8] space-y-1">
              <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-[#2563EB] border-2 border-white" />
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#141A17]">v1.2 • Terms of Service Amendment</span>
                <span className="text-[#8A958E]">18 Nov 2021</span>
              </div>
              <div className="bg-white border border-[#E0E7E2] rounded-lg p-2.5 text-xs text-[#1F2937] font-mono">
                &ldquo;Targeting up to 12% annual returns, <span className="diff-ins">subject to counterparty liquidity</span>.&rdquo;
              </div>
              <div className="text-[10px] text-[#86928C]">Source: Revised Terms Clause 8.1 (Hash: b49e1f)</div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-6 space-y-1">
              <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white" />
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#141A17]">v2.0 • Court Restructuring Notice</span>
                <span className="text-[#8A958E]">04 Jul 2022</span>
              </div>
              <div className="bg-white border border-[#E0E7E2] rounded-lg p-2.5 text-xs text-[#1F2937] font-mono">
                &ldquo;<span className="diff-ins">All withdrawals suspended</span> pending court moratorium.&rdquo;
              </div>
              <div className="text-[10px] text-[#86928C]">Source: High Court Affidavit & Notice HC/OA 351</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW VERITY WORKS */}
      <section id="how-it-works" className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider">
            <span>Methodology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] mt-0.5">
            How VERITY Works
          </h2>
          <p className="text-xs sm:text-sm text-[#637068] mt-1">
            A three-step verification pipeline turning ephemeral statements into verifiable public history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-white rounded-2xl border border-[#E2E7E3] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#DEE8E2] text-[#044C4C] flex items-center justify-center font-bold text-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141A17]">Record</h3>
              <p className="text-xs text-[#525C56] mt-1.5 leading-relaxed">
                Public statements and their original sources are documented verbatim with SHA-256 evidence digests and archive snapshots.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E7E3] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#DEE8E2] text-[#044C4C] flex items-center justify-center font-bold text-sm">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141A17]">Compare</h3>
              <p className="text-xs text-[#525C56] mt-1.5 leading-relaxed">
                Historical versions are preserved so users can inspect what changed and when using side-by-side and inline diffs.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E7E3] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F7F7] border border-[#DEE8E2] text-[#044C4C] flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141A17]">Verify</h3>
              <p className="text-xs text-[#525C56] mt-1.5 leading-relaxed">
                Evidence, corrections, and community contributions are reviewed transparently through an open peer review process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UNDERSTANDING VERITY'S AI EVIDENCE SCORE */}
      <section id="ai-evidence-score" className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider">
            <span>Methodology & Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] mt-0.5">
            Understanding VERITY's AI Evidence Score
          </h2>
          <p className="text-xs sm:text-sm text-[#637068] mt-1 max-w-3xl leading-relaxed">
            VERITY's AI Evidence Assessment evaluates public reporting and official records using deterministic scoring bands. The score measures the strength, corroboration, and independence of available public evidence — not a mathematical probability of truth.
          </p>
        </div>

        {/* Score Bands Table */}
        <div className="bg-white rounded-2xl border border-[#DDE4E0] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#E8ECE9] bg-[#FAFBF9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold font-serif-headline text-[#141A17]">
                Evidence-Support Bands
              </h3>
              <p className="text-xs text-[#525C56] mt-0.5">
                Standardized ranges describing the degree of empirical backing discovered across web sources.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#E6F2F2] text-[#044C4C] font-semibold border border-[#C5DDD0] self-start sm:self-auto">
              Transparent 6-Tier Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F4F7F5] text-[#525C56] font-mono text-[11px] uppercase border-b border-[#E2E8E4]">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#044C4C]">Score Range</th>
                  <th className="py-3 px-4 font-bold">Evidence Meaning</th>
                  <th className="py-3 px-4 font-bold">Typical Epistemological State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF0ED] font-sans">
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#044C4C]">
                    <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-900 border border-emerald-200">
                      90–100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Very strong supporting evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Corroborated by multiple premier independent newsrooms and primary official or statutory records. Consistent accounts across all reporting outlets with zero unresolved factual refutations.
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#044C4C]">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      75–89
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Strong supporting evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Reported consistently across multiple reputable media organizations with direct attributable statements, but may lack a finalized statutory audit or formal court adjudication.
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#425247]">
                    <span className="px-2 py-0.5 rounded bg-[#EDF3EF] text-[#2F4738] border border-[#CCDCD2]">
                      60–74
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Moderate supporting evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Substantial public reporting exists, but coverage relies on fewer independent primary origins, or investigative details remain actively developing.
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      40–59
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Mixed or inconclusive evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Discrepancies, conflicting statements between differing outlets, or single uncorroborated primary reports. Requires ongoing moderation and investigative updates.
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-orange-800">
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-900 border border-orange-200">
                      20–39
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Limited supporting evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Sparse, speculative, or uncorroborated mentions. Available accounts lack primary documentation, official confirmation, or institutional attribution.
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-800">
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-900 border border-red-200">
                      0–19
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#141A17]">
                    Very little supporting evidence
                  </td>
                  <td className="py-3.5 px-4 text-[#525C56] text-xs">
                    Debunked rumors, unverified viral claims, or assertions directly contradicted by credible primary records and fact-checking authorities.
                  </td>
                </tr>
                <tr className="bg-[#FAFBF9]/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#86928C]">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      N/A
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#637068]">
                    Insufficient evidence (Unable to assess)
                  </td>
                  <td className="py-3.5 px-4 text-[#637068] text-xs">
                    Assigned whenever search results are completely unrelated to the query, the query is ambiguous, or no reliable public documents can be retrieved. VERITY never forces an artificial score when evidence is lacking.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Essential Epistemological Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-[#DDE4E0] space-y-2">
            <h4 className="font-bold font-serif-headline text-sm text-[#141A17] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#044C4C]" />
              <span>Evidence Strength vs. Guaranteed Truth</span>
            </h4>
            <p className="text-[#525C56] leading-relaxed">
              VERITY's numerical score measures the breadth, independence, and directness of retrieved public evidence. It is not a mathematical probability that an event took place. A high score means available public records provide overwhelming corroboration; it does not replace statutory judicial verdicts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDE4E0] space-y-2">
            <h4 className="font-bold font-serif-headline text-sm text-[#141A17] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#044C4C]" />
              <span>AI Confidence vs. Factual Grounding</span>
            </h4>
            <p className="text-[#525C56] leading-relaxed">
              AI Analytical Confidence measures how reliably the system parsed the user's intent and verified entity/predicate matches across retrieved sources. It indicates the rigor of the linguistic and retrieval analysis, not whether the external world agrees with the claim.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDE4E0] space-y-2">
            <h4 className="font-bold font-serif-headline text-sm text-[#141A17] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#044C4C]" />
              <span>Source Volume vs. Independent Origins</span>
            </h4>
            <p className="text-[#525C56] leading-relaxed">
              Dozens of websites often republish the same wire dispatch (e.g. PTI, ANI, Reuters, AP). VERITY detects wire syndication and treats repeated verbatim syndication as a single primary reporting origin. True high scores require multiple independent newsrooms conducting distinct investigations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDE4E0] space-y-2">
            <h4 className="font-bold font-serif-headline text-sm text-[#141A17] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Separation of Sub-Claims & Dynamic Updating</span>
            </h4>
            <p className="text-[#525C56] leading-relaxed">
              For complex incidents (e.g. accidents, university investigations), the occurrence of the event is evaluated separately from unresolved debates concerning underlying causes, motives, or legal culpability. As new official findings emerge, live searches dynamically reflect updated evidence.
            </p>
          </div>
        </div>

        {/* Methodology & Limitations Note */}
        <div className="p-5 rounded-2xl bg-[#F0F7F7] border border-[#D5E2D9] text-xs text-[#2C3531] space-y-2">
          <div className="font-mono font-bold uppercase text-[11px] text-[#044C4C] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#044C4C]" />
            <span>Scoring Weighting & System Limitations</span>
          </div>
          <p className="leading-relaxed">
            The Evidence Support Score combines four weighted factors: <strong>Independent Reporting Origins (35%)</strong>, <strong>Official & Statutory Records (25%)</strong>, <strong>Inter-Outlet Consistency (20%)</strong>, and <strong>Direct Relevance Specificity (20%)</strong>, with deductions for conflicting accounts and single-source caps.
          </p>
          <p className="leading-relaxed text-[#525C56]">
            <strong>Calibration Transparency:</strong> While our scoring formula uses strict deterministic heuristic weighting, VERITY does not describe the engine as empirically calibrated because it has not yet been benchmarked against a formal academic labelled corpus. An automated AI synthesis is an intelligence aid and does not constitute human editorial endorsement.
          </p>
        </div>
      </section>

      {/* 6. POLICIES & GUIDELINES */}
      <section className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider">
            <span>Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] mt-0.5">
            Policies & Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-[#637068] mt-1">
            Transparent protocols governing data use, evidence integrity, and public retractions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div
            onClick={() => setSelectedPolicy('terms')}
            className="bg-white rounded-xl border border-[#E2E7E3] p-5 shadow-xs hover:border-[#044C4C] cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#044C4C] font-bold uppercase">Legal & Terms</div>
              <h3 className="font-bold text-sm text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                Terms & Conditions
              </h3>
              <p className="text-xs text-[#637068] leading-relaxed">
                Rules governing repository access, public data use, and platform terms.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1 pt-1">
              <span>Read Terms</span>
              <span>→</span>
            </span>
          </div>

          <div
            onClick={() => setSelectedPolicy('privacy')}
            className="bg-white rounded-xl border border-[#E2E7E3] p-5 shadow-xs hover:border-[#044C4C] cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#044C4C] font-bold uppercase">Privacy & Data</div>
              <h3 className="font-bold text-sm text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                Privacy Policy
              </h3>
              <p className="text-xs text-[#637068] leading-relaxed">
                How user information, telemetry, and anonymous contributions are handled.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1 pt-1">
              <span>Read Policy</span>
              <span>→</span>
            </span>
          </div>

          <div
            onClick={() => setSelectedPolicy('contribution')}
            className="bg-white rounded-xl border border-[#E2E7E3] p-5 shadow-xs hover:border-[#044C4C] cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#044C4C] font-bold uppercase">Community</div>
              <h3 className="font-bold text-sm text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                Contribution Guidelines
              </h3>
              <p className="text-xs text-[#637068] leading-relaxed">
                Criteria for submitting new statements, required archive links, and review rules.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1 pt-1">
              <span>Read Guidelines</span>
              <span>→</span>
            </span>
          </div>

          <div
            onClick={() => setSelectedPolicy('source')}
            className="bg-white rounded-xl border border-[#E2E7E3] p-5 shadow-xs hover:border-[#044C4C] cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#044C4C] font-bold uppercase">Evidence</div>
              <h3 className="font-bold text-sm text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                Source and Evidence Policy
              </h3>
              <p className="text-xs text-[#637068] leading-relaxed">
                Standards for acceptable archival snapshots, regulatory filings, and notarized exhibits.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1 pt-1">
              <span>Read Policy</span>
              <span>→</span>
            </span>
          </div>

          <div
            onClick={() => setSelectedPolicy('corrections')}
            className="bg-white rounded-xl border border-[#E2E7E3] p-5 shadow-xs hover:border-[#044C4C] cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#044C4C] font-bold uppercase">Integrity</div>
              <h3 className="font-bold text-sm text-[#141A17] group-hover:text-[#044C4C] transition-colors">
                Corrections Policy
              </h3>
              <p className="text-xs text-[#637068] leading-relaxed">
                Transparent procedure for amending disputed records and auditing retractions.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#044C4C] group-hover:underline flex items-center gap-1 pt-1">
              <span>Read Policy</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ContributorModal
        contributor={selectedContributor}
        onClose={() => setSelectedContributor(null)}
      />
      <PolicyModal
        policyKey={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}
