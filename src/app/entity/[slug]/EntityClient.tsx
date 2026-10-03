'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  History,
  Clock,
  Layers,
  FileText,
  Bookmark,
  Share2,
  CheckCircle2,
  HelpCircle,
  Globe,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { EntityProfile } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { AiResearchPanel } from '@/components/AiResearchPanel';

export default function EntityClient({ initialSlug }: { initialSlug?: string }) {
  const params = useParams();
  const router = useRouter();
  const slug = initialSlug || (params?.slug as string);

  const [entity, setEntity] = useState<EntityProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'evidence' | 'timeline' | 'revisions'>('overview');
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const load = () => {
      if (slug) {
        const found = repository.getEntityBySlug(slug);
        if (found) {
          setEntity(found);
        }
      }
    };
    load();

    window.addEventListener('verity_data_updated', load);
    return () => window.removeEventListener('verity_data_updated', load);
  }, [slug]);

  if (!entity) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif-headline text-[#141A17]">Organisation Profile Not Found</h2>
        <p className="text-xs text-[#525C56]">
          The requested platform is not currently indexed in the public intelligence directory.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#86928C]">
        <Link href="/" className="hover:text-[#044C4C] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-[#044C4C] transition-colors">
          Organisations
        </Link>
        <span>/</span>
        <span className="text-[#141A17] font-medium truncate max-w-xs">{entity.name}</span>
      </div>

      {/* Profile Header Dossier */}
      <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#F0F3F1]">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#69746E] font-semibold">
                {entity.category}
              </span>
              <span className="text-[#C1CBC5]">•</span>
              <StatusBadge status={entity.verificationBadge} size="md" />
              {entity.isDemoEntity && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6F2F2] text-[#044C4C] border border-[#D5E2D9] font-semibold">
                  Verified Case Study
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-headline font-bold text-[#141A17] tracking-tight">
              {entity.name}
            </h1>

            {entity.aliases.length > 0 && (
              <div className="text-xs font-mono text-[#717C76]">
                Known Operating Aliases:{' '}
                <span className="text-[#141A17] font-medium">{entity.aliases.join(' • ')}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#525C56] leading-relaxed pt-1">
              {entity.shortDescription}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
            <Link
              href={`/submit?entityId=${entity.id}&name=${encodeURIComponent(entity.name)}`}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Contribute Evidence</span>
            </Link>

            <Link
              href={`/submit?entityId=${entity.id}&correction=true&name=${encodeURIComponent(entity.name)}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#2E3632] bg-white hover:bg-[#FAFBF9] border border-[#D8DFDA] rounded-full shadow-2xs transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#69746E]" />
              <span>Report Correction</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#4B534E] hover:text-[#141A17] border border-[#D8DFDA] hover:bg-[#FAFBF9] rounded-full transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Public Identifiers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div>
            <span className="text-[10px] font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
              Registration Status
            </span>
            <span className="font-semibold text-[#141A17]">{entity.registrationStatus}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
              Corporate / SEBI Reg ID
            </span>
            <span className="font-mono text-[#36423C]">
              {entity.identifiers.sebiRegNo || entity.identifiers.cin || 'Unregistered / None'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
              Official Website / Domain
            </span>
            {entity.website ? (
              <a
                href={entity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#044C4C] font-semibold hover:underline flex items-center gap-1 truncate"
              >
                <span>{entity.website.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-[#86928C]">Not Disclosed</span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#86928C] uppercase tracking-wider block mb-1 font-bold">
              Last Verified Update
            </span>
            <span className="font-mono text-[#4B534E]">
              {new Date(entity.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Official Regulatory Alerts Callout (if active) */}
      {entity.notices.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-red-900 uppercase font-mono tracking-wider">
                  Active {entity.notices[0].regulator} Regulatory Warning
                </span>
                <span className="text-[11px] font-mono text-red-700">
                  Issued: {entity.notices[0].dateIssued}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#141A17]">
                {entity.notices[0].headline}
              </h3>
              <p className="text-xs text-red-950/80 leading-relaxed">
                {entity.notices[0].summary}
              </p>
              {entity.notices[0].officialPdfUrl && (
                <div className="pt-1">
                  <a
                    href={entity.notices[0].officialPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 hover:underline"
                  >
                    <span>Read official regulatory circular (PDF)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8ECE9] overflow-x-auto text-xs font-medium pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#E6F2F2] text-[#044C4C] font-bold shadow-2xs'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Research Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`py-2.5 px-4 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-[#E6F2F2] text-[#044C4C] font-bold shadow-2xs'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sources ({entity.sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-2.5 px-4 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'evidence'
              ? 'bg-[#E6F2F2] text-[#044C4C] font-bold shadow-2xs'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Corroborated Evidence ({entity.evidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 px-4 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-[#E6F2F2] text-[#044C4C] font-bold shadow-2xs'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Activity Timeline ({entity.timeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('revisions')}
          className={`py-2.5 px-4 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'revisions'
              ? 'bg-[#E6F2F2] text-[#044C4C] font-bold shadow-2xs'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Revision Audit Trail (v{entity.revisions.length}.0)</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-[#044C4C] uppercase font-mono tracking-wider">
                Executive Evidentiary Summary
              </h2>
              <p className="text-xs sm:text-sm text-[#4B534E] leading-relaxed">
                {entity.executiveSummary}
              </p>

              <div className="pt-4 border-t border-[#F0F3F1] flex items-center justify-between text-xs text-[#86928C]">
                <span>Sources cited in dossier:</span>
                <button
                  onClick={() => setActiveTab('sources')}
                  className="text-[#044C4C] hover:underline font-semibold cursor-pointer"
                >
                  View full source index ({entity.sources.length}) →
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-[#044C4C] uppercase font-mono tracking-wider">
                Documented Public Identifiers & Registry Footprint
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] font-mono">
                  <span className="text-[#69746E]">Corporate Identity (CIN):</span>
                  <span className="font-semibold text-[#141A17]">
                    {entity.identifiers.cin || 'Unregistered in India'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] font-mono">
                  <span className="text-[#69746E]">SEBI / RBI Registration:</span>
                  <span className="font-semibold text-[#141A17]">
                    {entity.identifiers.sebiRegNo || entity.identifiers.rbiRef || 'None on record'}
                  </span>
                </div>

                {entity.identifiers.telegramHandles && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] font-mono">
                    <span className="text-[#69746E]">Telegram Channels:</span>
                    <span className="font-semibold text-[#044C4C]">
                      {entity.identifiers.telegramHandles.join(', ')}
                    </span>
                  </div>
                )}

                {entity.identifiers.domainAge && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] font-mono">
                    <span className="text-[#69746E]">Domain Whois Registration:</span>
                    <span className="font-semibold text-[#141A17]">
                      {entity.identifiers.domainAge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Research Assistant */}
          <div className="lg:col-span-5">
            <AiResearchPanel entity={entity} />
          </div>
        </div>
      )}

      {/* Tab 2: Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-serif-headline font-bold text-[#141A17]">
              Primary and Secondary Source Repository
            </h2>
            <p className="text-xs text-[#525C56]">
              Every fact on this profile links to verifiable regulatory databases or reputable publications.
            </p>
          </div>

          <div className="space-y-3">
            {entity.sources.map((src, index) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#044C4C] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-[#141A17]">
                      {src.sourceName}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0F7F7] text-[#044C4C] border border-[#D5E2D9] font-bold">
                    Tier {src.tier} • {src.sourceType}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#141A17]">{src.title}</h3>

                <p className="text-xs text-[#4B534E] leading-relaxed font-mono bg-[#FAFBF9] p-3.5 rounded-xl border border-[#E8ECE9]">
                  &ldquo;{src.snippet}&rdquo;
                </p>

                <div className="pt-2 border-t border-[#F5F7F5] flex items-center justify-between text-xs text-[#86928C]">
                  <span className="text-[11px] font-mono">
                    Published: {src.publicationDate} • Retrieved: {src.retrievalDate}
                  </span>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#044C4C] hover:underline"
                  >
                    <span>Open Verified Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Corroborated Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-serif-headline font-bold text-[#141A17]">
                Corroborated Community & Moderator Evidence Items
              </h2>
              <p className="text-xs text-[#525C56]">
                Submissions that have passed moderation review and evidentiary checks.
              </p>
            </div>
            <Link
              href={`/submit?entityId=${entity.id}&name=${encodeURIComponent(entity.name)}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Evidence</span>
            </Link>
          </div>

          <div className="space-y-3">
            {entity.evidence.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.verificationState} size="sm" />
                    <span className="text-xs font-mono text-[#717C76]">{item.category}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#86928C]">
                    Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#141A17]">{item.title}</h3>
                <p className="text-xs text-[#4B534E] leading-relaxed">{item.description}</p>

                <div className="pt-2 border-t border-[#F5F7F5] flex items-center justify-between text-xs text-[#86928C]">
                  <span className="font-mono text-[11px]">Contributor: {item.submittedBy}</span>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#044C4C] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Supporting File / Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Chronological Timeline */}
      {activeTab === 'timeline' && (
        <div className="max-w-3xl space-y-6">
          <div className="mb-2">
            <h2 className="text-lg font-serif-headline font-bold text-[#141A17]">
              Chronological Statement & Regulatory Timeline
            </h2>
            <p className="text-xs text-[#525C56]">
              Key verifiable milestones, regulatory notices, and community reports.
            </p>
          </div>

          <div className="relative border-l-2 border-[#D5DFD8] ml-4 space-y-8 pb-4">
            {entity.timeline.map((event, i) => (
              <div key={i} className="relative pl-6">
                <div
                  className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    event.type === 'regulatory'
                      ? 'bg-[#DC2626]'
                      : event.type === 'incorporation'
                      ? 'bg-[#044C4C]'
                      : 'bg-[#2563EB]'
                  }`}
                />

                <div className="text-[11px] font-mono text-[#86928C] mb-0.5 uppercase tracking-wider font-bold">
                  {event.date}
                </div>
                <h3 className="text-sm font-bold text-[#141A17] mb-1">{event.title}</h3>
                <p className="text-xs text-[#525C56] leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Revisions */}
      {activeTab === 'revisions' && (
        <div className="max-w-4xl space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-serif-headline font-bold text-[#141A17]">
              Traceable Profile Revision History
            </h2>
            <p className="text-xs text-[#525C56]">
              Every profile modification is tracked in a transparent audit ledger with contributor and moderator signatures.
            </p>
          </div>

          <div className="space-y-3">
            {entity.revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E7E3] font-mono text-xs shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F3F1]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#044C4C]">v{rev.versionNumber}.0</span>
                    <span className="text-[#C1CBC5]">•</span>
                    <span className="text-[#141A17] font-sans font-semibold">
                      {rev.authorName} ({rev.authorRole})
                    </span>
                  </div>
                  <span className="text-[#86928C] text-[11px]">
                    {new Date(rev.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-[#2E3632] font-sans font-medium text-xs pt-1">
                  {rev.summaryOfChange}
                </div>

                {rev.diffSnippet && (
                  <div className="p-3 bg-[#FAFBF9] rounded-xl text-[#044C4C] border border-[#E8ECE9] overflow-x-auto text-[11px]">
                    {rev.diffSnippet}
                  </div>
                )}

                <div className="text-[11px] text-[#86928C] pt-1">
                  Moderator Sign-Off: <span className="text-[#141A17] font-semibold">{rev.moderatedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
