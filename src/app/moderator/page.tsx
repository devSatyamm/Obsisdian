'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Clock,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Radio,
  FileCheck2,
  Sparkles,
  Server
} from 'lucide-react';
import { repository, getExternalApiUrl } from '@/lib/db/repository';
import { CommunitySubmission, ModerationStatus, UserPersona } from '@/lib/types';
import { DEMO_PERSONAS } from '@/lib/data/mockData';
import { DiscoverySource, IngestionJobReport, ExtractedClaimCandidate } from '@/lib/ingestion/types';
import { STATIC_DISCOVERY_SOURCES, STATIC_INGESTION_JOBS } from '@/lib/data/discoveryData';

export default function ModeratorPage() {
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.moderator);
  const [activeTab, setActiveTab] = useState<'queue' | 'ingestion'>('queue');
  const [filter, setFilter] = useState<ModerationStatus | 'all'>('pending');
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<CommunitySubmission | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ExtractedClaimCandidate | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Ingestion monitor state
  const [sources, setSources] = useState<DiscoverySource[]>(STATIC_DISCOVERY_SOURCES);
  const [jobs, setJobs] = useState<IngestionJobReport[]>(STATIC_INGESTION_JOBS);
  const [isRunningJob, setIsRunningJob] = useState(false);
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);

  const loadSubmissions = () => {
    const list = repository.getSubmissions();
    setSubmissions(list);
    if (!selectedSub && list.length > 0) {
      setSelectedSub(list[0]);
    }
  };

  const loadIngestionData = async () => {
    const apiUrl = getExternalApiUrl();
    if (!apiUrl) return;

    try {
      const srcRes = await fetch(`${apiUrl}/api/discovery/sources`);
      if (srcRes.ok) {
        const { sources: s } = await srcRes.json();
        if (s) setSources(s);
      }
      const jobsRes = await fetch(`${apiUrl}/api/discovery/jobs`);
      if (jobsRes.ok) {
        const { jobs: j } = await jobsRes.json();
        if (j) setJobs(j);
      }
    } catch (e) {
      console.debug('Ingestion data fetch skipped:', e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'ingestion') {
        setActiveTab('ingestion');
      }
    }

    loadSubmissions();
    loadIngestionData();
    setCurrentUser(repository.getActiveUser());

    window.addEventListener('verity_data_updated', loadSubmissions);
    window.addEventListener('verity_user_changed', () => {
      setCurrentUser(repository.getActiveUser());
    });
    return () => {
      window.removeEventListener('verity_data_updated', loadSubmissions);
    };
  }, []);

  const filtered = submissions.filter((s) => (filter === 'all' ? true : s.status === filter));
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  const handleApprove = (subId: string) => {
    repository.approveSubmission(
      subId,
      currentUser.name,
      moderatorNotes || 'Source corroborated against primary filings. Approved for public dossier.'
    );
    setActionSuccess(`Submission ${subId} approved! Profile dossier updated with versioned revision.`);
    setModeratorNotes('');
    loadSubmissions();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (subId: string) => {
    repository.rejectSubmission(
      subId,
      currentUser.name,
      moderatorNotes || 'Insufficient corroborating primary documentation.'
    );
    setActionSuccess(`Submission ${subId} rejected.`);
    setModeratorNotes('');
    loadSubmissions();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const triggerDiscoveryRun = async (sourceId?: string) => {
    setIsRunningJob(true);
    setRunningSourceId(sourceId || 'all');

    const apiUrl = getExternalApiUrl();
    if (!apiUrl) {
      setTimeout(() => {
        setIsRunningJob(false);
        setRunningSourceId(null);
        setActionSuccess('Static Simulation: Discovery cycle refreshed locally.');
        setTimeout(() => setActionSuccess(null), 5000);
      }, 800);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/discovery/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceId ? { sourceId } : {})
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message || 'Discovery run completed successfully.');
        loadSubmissions();
        loadIngestionData();
      } else {
        setActionSuccess(`Discovery failed: ${data.error || 'Server error'}`);
      }
    } catch (e: any) {
      setActionSuccess(`Discovery run failed: ${e.message}`);
    } finally {
      setIsRunningJob(false);
      setRunningSourceId(null);
      setTimeout(() => setActionSuccess(null), 6000);
    }
  };

  const toggleSourceActive = async (sourceId: string) => {
    const apiUrl = getExternalApiUrl();
    if (!apiUrl) {
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, isActive: !s.isActive } : s))
      );
      setActionSuccess(`Source status toggled.`);
      setTimeout(() => setActionSuccess(null), 3000);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/discovery/sources/${encodeURIComponent(sourceId)}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        loadIngestionData();
      }
    } catch (e) {
      console.error('Failed to toggle source', e);
    }
  };

  const totalDiscovered = jobs.reduce((acc, j) => acc + (j.itemsDiscovered || 0), 0);
  const totalExtracted = jobs.reduce((acc, j) => acc + (j.claimsIdentified || 0), 0);
  const totalFiltered = jobs.reduce((acc, j) => acc + (j.boilerplateFiltered || 0), 0);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8ECE9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
            <Link href="/" className="hover:text-[#044C4C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#141A17] font-medium">Moderation Desk</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] tracking-tight">
              Evidence Moderation & Intelligence Desk
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#E6F2F2] text-[#044C4C] border border-[#D5E2D9] font-semibold">
              Role: {currentUser.role === 'moderator' ? 'Senior Reviewer' : 'Contributor Preview'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#525C56] mt-1">
            Validate primary source links, verify autonomous feed claims, and maintain verifiable research integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              repository.resetToDefaults();
              loadSubmissions();
            }}
            className="text-xs text-[#525C56] hover:text-[#141A17] px-4 py-2 rounded-full border border-[#D5DFD8] bg-white hover:bg-[#FAFBF9] transition-colors cursor-pointer"
          >
            Reset Demo Submissions
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E8ECE9] pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'queue'
              ? 'bg-[#044C4C] text-white shadow-sm'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Evidence Review Queue</span>
          {pendingCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'queue' ? 'bg-[#1E5C45] text-white' : 'bg-[#E6F2F2] text-[#044C4C]'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ingestion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'ingestion'
              ? 'bg-[#044C4C] text-white shadow-sm'
              : 'text-[#525C56] hover:text-[#141A17] hover:bg-[#F0F4F1]'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Autonomous Ingestion Monitor</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-[#E5F7EB] border border-[#A7F3D0] text-xs font-medium text-[#166534] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#166534]" />
            <span>{actionSuccess}</span>
          </div>
          <Link href="/explore" className="underline font-semibold">
            View Updated Profile Directory →
          </Link>
        </div>
      )}

      {/* VIEW 1: Evidence Review Queue */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Submissions List (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#525C56]">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-medium">Filter by Status:</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F0F4F1] p-1 rounded-lg border border-[#E1E8E3]">
                <button
                  onClick={() => setFilter('pending')}
                  className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
                    filter === 'pending'
                      ? 'bg-white text-[#044C4C] shadow-xs'
                      : 'text-[#525C56] hover:text-[#141A17]'
                  }`}
                >
                  Pending ({submissions.filter((s) => s.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
                    filter === 'approved'
                      ? 'bg-white text-[#044C4C] shadow-xs'
                      : 'text-[#525C56] hover:text-[#141A17]'
                  }`}
                >
                  Approved ({submissions.filter((s) => s.status === 'approved').length})
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
                    filter === 'rejected'
                      ? 'bg-white text-[#044C4C] shadow-xs'
                      : 'text-[#525C56] hover:text-[#141A17]'
                  }`}
                >
                  Rejected ({submissions.filter((s) => s.status === 'rejected').length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E1E8E3] rounded-xl text-xs text-[#86928C]">
                  No submissions found matching filter "{filter}".
                </div>
              ) : (
                filtered.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  const isAutonomous = sub.submittedBy?.name?.includes('Autonomous Ingestion Engine');

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-[#044C4C] bg-[#FAFBF9] shadow-xs'
                          : 'border-[#E1E8E3] bg-white hover:border-[#CBD7D0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F0F4F1] text-[#525C56] border border-[#E1E8E3]">
                          {sub.evidenceCategory}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isAutonomous && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Auto-Extracted
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize font-semibold ${
                              sub.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : sub.status === 'rejected'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-[#141A17] line-clamp-1 mb-1">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-[#525C56] line-clamp-2 mb-3">
                        {sub.factualDescription}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#86928C] pt-2 border-t border-[#F0F4F1]">
                        <span className="font-medium text-[#141A17]">{sub.entityName}</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Submission Details & Review Actions (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="bg-white border border-[#E1E8E3] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8ECE9]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-[#86928C]">
                        ID: {selectedSub.id}
                      </span>
                      {selectedSub.submittedBy?.name?.includes('Autonomous') && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          Autonomous Source Intelligence
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold font-serif-headline text-[#141A17]">
                      {selectedSub.title}
                    </h2>
                    <div className="text-xs text-[#525C56] mt-1">
                      Target Entity: <span className="font-semibold text-[#141A17]">{selectedSub.entityName}</span>
                    </div>
                  </div>
                </div>

                {/* Proposed Statement Diff Snippet if present */}
                {selectedSub.diffSnippet && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <div className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>Git-Style Proposed Statement Diff:</span>
                    </div>
                    <pre className="text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {selectedSub.diffSnippet}
                    </pre>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[#86928C] mb-1 font-semibold">
                      Factual Assertion / Excerpt
                    </h4>
                    <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] text-xs text-[#2A342E] leading-relaxed">
                      {selectedSub.factualDescription}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase text-[#86928C] mb-1 font-semibold">
                      Primary Source Verification Link
                    </h4>
                    <a
                      href={selectedSub.primarySourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#044C4C] hover:underline flex items-center gap-1 font-medium break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedSub.primarySourceUrl}</span>
                    </a>
                  </div>

                  {selectedSub.moderationNotes && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-semibold">Provenance & Signals:</span> {selectedSub.moderationNotes}
                    </div>
                  )}
                </div>

                {/* Moderator Decision Action Box */}
                {selectedSub.status === 'pending' ? (
                  <div className="pt-6 border-t border-[#E8ECE9] space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#141A17] mb-1.5">
                        Moderation Decision Notes & Corroboration Rationale
                      </label>
                      <textarea
                        value={moderatorNotes}
                        onChange={(e) => setModeratorNotes(e.target.value)}
                        placeholder="State primary registry verified (e.g. SEBI caution list, RBI alert, or gazette notice)..."
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-[#D5DFD8] focus:border-[#044C4C] focus:ring-1 focus:ring-[#044C4C] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(selectedSub.id)}
                        className="flex-1 bg-[#044C4C] hover:bg-[#16563F] text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Approve & Merge into Dossier</span>
                      </button>

                      <button
                        onClick={() => handleReject(selectedSub.id)}
                        className="bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F0F4F1] border border-[#E1E8E3] text-xs text-[#525C56]">
                    Reviewed by <span className="font-semibold text-[#141A17]">{selectedSub.reviewedBy || 'Moderation Desk'}</span> on{' '}
                    {selectedSub.reviewedAt ? new Date(selectedSub.reviewedAt).toLocaleString() : 'N/A'}.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-[#E1E8E3] rounded-2xl text-xs text-[#86928C]">
                Select a submission from the list to review details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Autonomous Ingestion Monitor */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
              <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Active Sources</div>
              <div className="text-2xl font-bold font-serif-headline text-[#044C4C]">
                {sources.filter((s) => s.isActive).length} / {sources.length}
              </div>
              <div className="text-[11px] text-[#525C56] mt-1">RBI, SEBI & Statutory RSS feeds</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
              <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Items Discovered</div>
              <div className="text-2xl font-bold font-serif-headline text-[#141A17]">
                {totalDiscovered}
              </div>
              <div className="text-[11px] text-[#525C56] mt-1">Parsed from public feeds</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
              <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Claims Extracted</div>
              <div className="text-2xl font-bold font-serif-headline text-emerald-700">
                {totalExtracted}
              </div>
              <div className="text-[11px] text-[#525C56] mt-1">Attributable factual assertions</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
              <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Routine Notices Filtered</div>
              <div className="text-2xl font-bold font-serif-headline text-[#525C56]">
                {totalFiltered}
              </div>
              <div className="text-[11px] text-[#525C56] mt-1">Administrative/calendar boilerplate filtered</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E1E8E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-[#044C4C]" />
              <div>
                <h3 className="text-sm font-semibold text-[#141A17]">Surveillance Poller & Scheduler</h3>
                <p className="text-xs text-[#525C56]">
                  Hourly schedule configured via Vercel Cron & GitHub Actions. SSRF guard and polite backoff enabled.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isRunningJob}
                onClick={() => triggerDiscoveryRun()}
                className="bg-[#044C4C] hover:bg-[#16563F] disabled:opacity-50 text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin' : ''}`} />
                <span>{isRunningJob ? 'Running Discovery...' : 'Run All Sources Now'}</span>
              </button>
            </div>
          </div>

          {/* Registered Sources Table */}
          <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E8ECE9]">
              <h3 className="text-base font-semibold font-serif-headline text-[#141A17]">
                Configured Public Intelligence Feeds
              </h3>
              <p className="text-xs text-[#525C56] mt-0.5">
                Official statutory channels monitored with per-source polling intervals.
              </p>
            </div>

            <div className="divide-y divide-[#E8ECE9]">
              {sources.map((src) => (
                <div key={src.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#141A17]">{src.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F4F1] text-[#044C4C] border border-[#D5DFD8]">
                        {src.targetRegulator || 'Market'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          src.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {src.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#525C56] hover:text-[#044C4C] flex items-center gap-1"
                    >
                      <span>{src.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-4 text-xs text-[#86928C] pt-1">
                      <span>Poll Interval: Every {src.pollIntervalMinutes}m</span>
                      <span>•</span>
                      <span>Last Polled: {src.lastPolledAt ? new Date(src.lastPolledAt).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSourceActive(src.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#D5DFD8] hover:bg-[#F0F4F1] text-[#525C56] hover:text-[#141A17] transition-colors flex items-center gap-1.5"
                    >
                      {src.isActive ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                      <span>{src.isActive ? 'Pause' : 'Resume'}</span>
                    </button>

                    <button
                      disabled={isRunningJob}
                      onClick={() => triggerDiscoveryRun(src.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#044C4C] hover:bg-[#16563F] text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${runningSourceId === src.id ? 'animate-spin' : ''}`} />
                      <span>Poll Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ingestion Job History Table */}
          <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E8ECE9]">
              <h3 className="text-base font-semibold font-serif-headline text-[#141A17]">
                Recent Ingestion Job History
              </h3>
              <p className="text-xs text-[#525C56] mt-0.5">
                Audit logs showing items discovered, claims extracted, and routine boilerplate filtered.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBF9] border-b border-[#E8ECE9] text-[#86928C] font-mono uppercase">
                  <tr>
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6">Source Name</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Discovered</th>
                    <th className="py-3 px-6">Extracted Claims</th>
                    <th className="py-3 px-6">Filtered Routine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECE9]">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#86928C]">
                        No ingestion runs on record yet. Click "Run All Sources Now" to trigger live discovery.
                      </td>
                    </tr>
                  ) : (
                    jobs.slice(0, 8).map((job) => (
                      <tr key={job.id} className="hover:bg-[#FAFBF9] transition-colors">
                        <td className="py-3 px-6 font-mono text-[#525C56]">
                          {new Date(job.startedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-6 font-semibold text-[#141A17]">{job.sourceName}</td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                              job.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-mono text-[#141A17]">{job.itemsDiscovered}</td>
                        <td className="py-3 px-6 font-mono font-semibold text-emerald-700">
                          {job.claimsIdentified}
                        </td>
                        <td className="py-3 px-6 font-mono text-[#525C56]">
                          {job.boilerplateFiltered || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extracted Claim Candidates & Provenance Inspector */}
          <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8ECE9]">
              <div>
                <h3 className="text-base font-semibold font-serif-headline text-[#141A17] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Extracted Claim Candidates & Provenance Inspector</span>
                </h3>
                <p className="text-xs text-[#525C56] mt-0.5">
                  Inspect why crawled articles were accepted, filtered, or flagged for change detection and contradiction analysis.
                </p>
              </div>
              <div className="text-xs font-mono text-[#86928C]">
                {jobs.reduce((acc, j) => acc + (j.extractedCandidates?.length || 0), 0)} Total Candidates Discovered
              </div>
            </div>

            {/* List of candidates from jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-3">
                <div className="text-xs font-semibold text-[#525C56] uppercase tracking-wider font-mono">
                  Discovered Assertions
                </div>
                {jobs.flatMap((j) => j.extractedCandidates || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#86928C] border border-[#E1E8E3] rounded-xl bg-[#FAFBF9]">
                    No candidates discovered in recent runs. Routine administrative notices are automatically filtered.
                  </div>
                ) : (
                  jobs
                    .flatMap((j) => j.extractedCandidates || [])
                    .slice(0, 10)
                    .map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      return (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#044C4C] bg-[#FAFBF9] shadow-xs'
                              : 'border-[#E1E8E3] bg-white hover:border-[#CBD7D0]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F4F1] text-[#044C4C] font-medium">
                              {cand.targetEntityName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {cand.isContradiction && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold border border-red-200">
                                  Contradiction Flag
                                </span>
                              )}
                              {cand.isPotentialUpdate && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                  Revision Update
                                </span>
                              )}
                              {cand.isSyndication && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                                  Syndicated
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="text-xs font-semibold text-[#141A17] line-clamp-1 mb-1">
                            {cand.claimTitle}
                          </h4>
                          <p className="text-[11px] text-[#525C56] line-clamp-2 mb-2">
                            "{cand.relevantExcerpt}"
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-[#86928C] pt-2 border-t border-[#F0F4F1]">
                            <span>{cand.publisher}</span>
                            <span className="font-mono">Confidence: {(cand.confidenceScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Candidate Detail Inspector */}
              <div className="lg:col-span-6">
                {selectedCandidate ? (
                  <div className="p-6 rounded-xl border border-[#044C4C] bg-[#FAFBF9] space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E1E8E3]">
                      <span className="text-xs font-mono text-[#86928C]">
                        ID: {selectedCandidate.id}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold">
                        Staged for Review
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold font-serif-headline text-[#141A17] mb-1">
                        {selectedCandidate.claimTitle}
                      </h4>
                      <div className="text-xs text-[#525C56]">
                        Speaker / Authority: <span className="font-semibold text-[#141A17]">{selectedCandidate.speakerOrSource || 'Unspecified'}</span>
                      </div>
                    </div>

                    {/* Contradiction Warning Alert */}
                    {selectedCandidate.isContradiction && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                          <span>Potential Claim Contradiction Detected</span>
                        </div>
                        <p className="text-[11px] text-red-800">
                          {selectedCandidate.contradictionNote || 'This assertion presents factual discrepancies compared to historical disclosures.'}
                        </p>
                        <p className="text-[10px] text-red-700 italic">
                          Note: Contradiction detection flags items for moderator scrutiny and does not constitute proof of misinformation.
                        </p>
                      </div>
                    )}

                    {/* Diff Snippet */}
                    {selectedCandidate.diffSnippet && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono font-semibold text-slate-700">Statement Change Comparison:</span>
                        <pre className="text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap">
                          {selectedCandidate.diffSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Supporting Excerpt */}
                    <div>
                      <span className="text-xs font-mono font-semibold text-[#525C56] uppercase">Exact Supporting Passage:</span>
                      <blockquote className="mt-1 p-3 bg-white border border-[#E1E8E3] rounded-lg text-xs italic text-[#2A342E] leading-relaxed">
                        "{selectedCandidate.relevantExcerpt}"
                      </blockquote>
                    </div>

                    {/* Extraction Rationale */}
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-semibold">Extraction Rationale:</span> {selectedCandidate.extractionRationale}
                      <div className="text-[10px] text-emerald-800 pt-1">
                        Signals: {selectedCandidate.detectionSignals.join(' • ')}
                      </div>
                    </div>

                    {/* Transparency notice on confidence score */}
                    <div className="text-[11px] text-[#86928C] bg-white p-3 rounded-lg border border-[#E1E8E3] space-y-1">
                      <div className="font-semibold text-[#525C56]">
                        Algorithmic Signal Score: {(selectedCandidate.confidenceScore * 100).toFixed(0)}%
                      </div>
                      <p className="text-[10px] text-[#86928C]">
                        Confidence scores represent internal heuristic parsing strength and are never displayed or treated as proof of truth.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={selectedCandidate.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#044C4C] hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Original Article ({selectedCandidate.publisher})</span>
                      </a>

                      <button
                        onClick={() => setActiveTab('queue')}
                        className="bg-[#044C4C] hover:bg-[#16563F] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
                      >
                        Review in Queue →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-[#CBD7D0] rounded-xl text-xs text-[#86928C]">
                    Select any discovered assertion from the list to inspect supporting passages, extraction rationale, and change detection signals.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
