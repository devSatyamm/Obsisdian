'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  RefreshCw,
  Server,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
  Info,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { DiscoverySource, IngestionJobReport, ExtractedClaimCandidate } from '@/lib/ingestion/types';

import { STATIC_DISCOVERY_SOURCES, STATIC_INGESTION_JOBS } from '@/lib/data/discoveryData';
import { getExternalApiUrl } from '@/lib/db/repository';

export default function DiscoveryPage() {
  const [sources, setSources] = useState<DiscoverySource[]>(STATIC_DISCOVERY_SOURCES);
  const [jobs, setJobs] = useState<IngestionJobReport[]>(STATIC_INGESTION_JOBS);
  const [selectedCandidate, setSelectedCandidate] = useState<ExtractedClaimCandidate | null>(
    STATIC_INGESTION_JOBS[0]?.extractedCandidates?.[0] || null
  );
  const [isRunningJob, setIsRunningJob] = useState(false);
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'memory' | 'supabase' | 'loading'>('memory');
  const [dbConfigured, setDbConfigured] = useState<boolean>(false);

  const loadData = async () => {
    const apiUrl = getExternalApiUrl();
    if (!apiUrl) {
      setDataSource('memory');
      return;
    }

    try {
      // 1. Load Sources from external API
      const srcRes = await fetch(`${apiUrl}/api/discovery/sources`);
      if (srcRes.ok) {
        const srcData = await srcRes.json();
        if (srcData.sources) setSources(srcData.sources);
      }

      // 2. Load Jobs from external API
      const jobsRes = await fetch(`${apiUrl}/api/discovery/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.jobs) {
          setJobs(jobsData.jobs);
          setDataSource(jobsData.source || 'supabase');
          const allCandidates = jobsData.jobs.flatMap((j: IngestionJobReport) => j.extractedCandidates || []);
          if (allCandidates.length > 0 && !selectedCandidate) {
            setSelectedCandidate(allCandidates[0]);
          }
        }
      }

      // 3. Check DB Health Status
      const healthRes = await fetch(`${apiUrl}/api/health/db`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setDbConfigured(!!healthData.configured);
      }
    } catch (e: any) {
      console.debug('External discovery API check skipped:', e);
    }
  };

  useEffect(() => {
    loadData();
    const apiUrl = getExternalApiUrl();
    if (apiUrl) {
      const interval = setInterval(loadData, 15000);
      return () => clearInterval(interval);
    }
  }, []);

  const triggerDiscoveryRun = async (sourceId?: string) => {
    setIsRunningJob(true);
    setRunningSourceId(sourceId || 'all');
    setActionSuccess(null);
    setActionError(null);

    const apiUrl = getExternalApiUrl();
    if (!apiUrl) {
      // Frontend-first demonstration mode
      setTimeout(() => {
        setIsRunningJob(false);
        setRunningSourceId(null);
        setActionSuccess('Static Simulation: Verified recent discovery cycle refreshed. Live autonomous scraping runs via external worker.');
        setTimeout(() => setActionSuccess(null), 6000);
      }, 900);
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
        setActionSuccess(
          data.message || (sourceId ? `Crawl completed for source ${sourceId}.` : 'All discovery sources crawled successfully.')
        );
        await loadData();
      } else {
        setActionError(`Discovery crawl failed: ${data.error || 'Server error'}`);
      }
    } catch (e: any) {
      setActionError(`Network error executing discovery: ${e.message}`);
    } finally {
      setIsRunningJob(false);
      setRunningSourceId(null);
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 7000);
    }
  };

  const toggleSourceActive = async (sourceId: string) => {
    const apiUrl = getExternalApiUrl();
    if (!apiUrl) {
      // Toggle locally in state
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, isActive: !s.isActive } : s))
      );
      setActionSuccess(`Toggled source ${sourceId} locally.`);
      setTimeout(() => setActionSuccess(null), 3000);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/discovery/sources/${encodeURIComponent(sourceId)}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error('Failed to toggle source active status', e);
    }
  };

  const totalDiscovered = jobs.reduce((acc, j) => acc + (j.itemsDiscovered || 0), 0);
  const totalExtracted = jobs.reduce((acc, j) => acc + (j.claimsIdentified || 0), 0);
  const totalFiltered = jobs.reduce((acc, j) => acc + (j.boilerplateFiltered || 0), 0);
  const allCandidates = jobs.flatMap((j) => j.extractedCandidates || []);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="pb-6 border-b border-[#E8ECE9] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
            <Link href="/" className="hover:text-[#044C4C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#141A17] font-medium">Autonomous Intelligence Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17] tracking-tight flex items-center gap-2.5">
              <span>Web Discovery & Claim Intelligence Monitor</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#E6F2F2] text-[#044C4C] border border-[#D5E2D9] font-semibold">
              Phase 5 Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#525C56] mt-1 max-w-3xl">
            Autonomous surveillance engine that continuously crawls registered public sources, extracts attributable factual claims, tracks statement revisions with diffs, and stages evidence for moderator review.
          </p>
        </div>

        {/* Quick Links / Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/moderator"
            className="text-xs font-medium text-[#044C4C] hover:text-[#034343] bg-[#E6F2F2] hover:bg-[#D8E7DF] border border-[#C5D9CE] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Open Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ==================== SYSTEM STATUS & ENVIRONMENT BANNER ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-[#E1E8E3] bg-[#FAFBF9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <div>
              <div className="font-semibold text-[#141A17]">Discovery Surveillance Engine</div>
              <div className="text-[11px] text-[#69746E]">RSS Feeds, Sitemaps & Registries active</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold">
            ONLINE
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E1E8E3] bg-[#FAFBF9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#044C4C]" />
            <div>
              <div className="font-semibold text-[#141A17]">Database Storage Layer</div>
              <div className="text-[11px] text-[#69746E]">
                {dbConfigured ? 'Remote Supabase connected' : 'Local In-Memory Repository Fallback'}
              </div>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              dbConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {dbConfigured ? 'SUPABASE' : 'LOCAL FALLBACK'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E1E8E3] bg-[#FAFBF9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#044C4C]" />
            <div>
              <div className="font-semibold text-[#141A17]">Autonomous Scheduler</div>
              <div className="text-[11px] text-[#69746E]">Hourly cron via /api/discovery/cron</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-semibold">
            HOURLY
          </span>
        </div>
      </div>

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-[#E5F7EB] border border-[#A7F3D0] text-xs font-medium text-[#166534] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#166534]" />
            <span>{actionSuccess}</span>
          </div>
          <span className="text-[11px] text-emerald-700">Updated just now</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ==================== 4 METRICS CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
          <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Active Sources</div>
          <div className="text-3xl font-bold font-serif-headline text-[#044C4C]">
            {sources.filter((s) => s.isActive).length} <span className="text-sm font-normal text-[#86928C]">/ {sources.length}</span>
          </div>
          <div className="text-[11px] text-[#525C56] mt-1">Official RBI, SEBI & market feeds</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
          <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Articles Discovered</div>
          <div className="text-3xl font-bold font-serif-headline text-[#141A17]">
            {totalDiscovered}
          </div>
          <div className="text-[11px] text-[#525C56] mt-1">Fetched and parsed via SSRF guard</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
          <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Claims Extracted</div>
          <div className="text-3xl font-bold font-serif-headline text-emerald-700">
            {totalExtracted}
          </div>
          <div className="text-[11px] text-[#525C56] mt-1">Attributable factual assertions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E1E8E3] shadow-xs">
          <div className="text-xs font-mono text-[#86928C] uppercase mb-1">Routine Boilerplate Filtered</div>
          <div className="text-3xl font-bold font-serif-headline text-[#525C56]">
            {totalFiltered}
          </div>
          <div className="text-[11px] text-[#525C56] mt-1">Administrative calendar notices dropped</div>
        </div>
      </div>

      {/* ==================== ACTION BAR: TRIGGER DISCOVERY ==================== */}
      <div className="p-5 rounded-2xl bg-[#FAFBF9] border border-[#E1E8E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#D5DFD8] flex items-center justify-center text-[#044C4C] shrink-0 shadow-2xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#141A17]">Autonomous Surveillance Crawler</h3>
            <p className="text-xs text-[#525C56]">
              Polite crawling enabled with robots.txt check, 500ms domain throttling, SSRF IP filtering, and SHA-256 change detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isRunningJob}
            onClick={() => triggerDiscoveryRun()}
            className="bg-[#044C4C] hover:bg-[#16563F] disabled:opacity-50 text-white text-xs font-medium py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs hover:shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin' : ''}`} />
            <span>{isRunningJob ? 'Running Autonomous Crawl...' : 'Run All Sources Now'}</span>
          </button>
        </div>
      </div>

      {/* ==================== CONFIGURED SOURCES TABLE ==================== */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E8ECE9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold font-serif-headline text-[#141A17]">
              Configured Discovery Sources & Registries
            </h3>
            <p className="text-xs text-[#525C56] mt-0.5">
              Monitored public regulatory feeds and corporate disclosure portals.
            </p>
          </div>
          <span className="text-xs font-mono text-[#86928C]">
            {sources.length} Registered Sources
          </span>
        </div>

        {sources.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#86928C]">
            Loading discovery sources...
          </div>
        ) : (
          <div className="divide-y divide-[#E8ECE9]">
            {sources.map((src) => (
              <div key={src.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFBF9] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#141A17]">{src.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F4F1] text-[#044C4C] border border-[#D5DFD8]">
                      {src.targetRegulator || 'Market'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Type: {src.sourceType}
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
                    className="text-xs font-mono text-[#525C56] hover:text-[#044C4C] flex items-center gap-1 break-all"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  <div className="flex items-center gap-4 text-xs text-[#86928C] pt-1">
                    <span>Poll Interval: Every {src.pollIntervalMinutes}m</span>
                    <span>•</span>
                    <span>Last Polled: {src.lastPolledAt ? new Date(src.lastPolledAt).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
                    className="text-xs px-3.5 py-1.5 rounded-lg bg-[#044C4C] hover:bg-[#16563F] text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${runningSourceId === src.id ? 'animate-spin' : ''}`} />
                    <span>Poll Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== RECENT INGESTION RUNS TABLE ==================== */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E8ECE9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold font-serif-headline text-[#141A17]">
              Recent Ingestion Job History
            </h3>
            <p className="text-xs text-[#525C56] mt-0.5">
              Live crawler execution logs showing articles parsed, claims extracted, and routine boilerplate filtered.
            </p>
          </div>
          <span className="text-xs font-mono text-[#86928C]">
            {jobs.length} Runs Logged
          </span>
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
                  <td colSpan={6} className="py-10 text-center text-[#86928C]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-semibold text-[#141A17]">No crawler execution history yet</p>
                      <p className="text-xs text-[#525C56]">
                        Click the <span className="font-semibold text-[#044C4C]">"Run All Sources Now"</span> button above to trigger an autonomous crawl of public regulatory feeds.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.slice(0, 10).map((job) => (
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

      {/* ==================== EXTRACTED CLAIM CANDIDATES & PROVENANCE INSPECTOR ==================== */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden shadow-xs space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8ECE9]">
          <div>
            <h3 className="text-lg font-semibold font-serif-headline text-[#141A17] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>Extracted Claim Candidates & Provenance Inspector</span>
            </h3>
            <p className="text-xs text-[#525C56] mt-0.5">
              Inspect why discovered assertions were accepted, filtered, or flagged for statement revision and contradiction analysis.
            </p>
          </div>
          <div className="text-xs font-mono text-[#86928C]">
            {allCandidates.length} Candidates Staged
          </div>
        </div>

        {allCandidates.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#CBD7D0] rounded-2xl bg-[#FAFBF9] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E6F2F2] text-[#044C4C] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#141A17]">No Staged Claim Candidates Yet</h4>
            <p className="text-xs text-[#525C56] max-w-md mx-auto">
              When the autonomous crawler runs, attributable factual assertions are identified and staged here with full provenance traces before being published.
            </p>
            <button
              disabled={isRunningJob}
              onClick={() => triggerDiscoveryRun()}
              className="mt-2 bg-[#044C4C] hover:bg-[#16563F] text-white text-xs font-medium py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin' : ''}`} />
              <span>Trigger Initial Crawl Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Candidates (Left Column) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-[#525C56] uppercase tracking-wider font-mono">
                Discovered Assertions ({allCandidates.length})
              </div>

              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {allCandidates.map((cand) => {
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

                      <h4 className="text-xs font-semibold text-[#141A17] line-clamp-2 mb-1">
                        {cand.claimTitle}
                      </h4>
                      <p className="text-[11px] text-[#525C56] line-clamp-2 mb-2 italic">
                        "{cand.relevantExcerpt}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#86928C] pt-2 border-t border-[#F0F4F1]">
                        <span>{cand.publisher}</span>
                        <span className="font-mono">Confidence: {(cand.confidenceScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidate Detail Inspector (Right Column) */}
            <div className="lg:col-span-6">
              {selectedCandidate ? (
                <div className="p-6 rounded-xl border border-[#044C4C] bg-[#FAFBF9] space-y-4 sticky top-24">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E1E8E3]">
                    <span className="text-xs font-mono text-[#86928C]">
                      Candidate ID: {selectedCandidate.id}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold">
                      Staged for Review
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold font-serif-headline text-[#141A17] mb-1">
                      {selectedCandidate.claimTitle}
                    </h4>
                    <div className="text-xs text-[#525C56]">
                      Target Organisation: <span className="font-semibold text-[#141A17]">{selectedCandidate.targetEntityName}</span>
                    </div>
                    <div className="text-xs text-[#525C56] mt-0.5">
                      Attributed Authority: <span className="font-semibold text-[#141A17]">{selectedCandidate.speakerOrSource || 'Official Release'}</span>
                    </div>
                  </div>

                  {/* Contradiction Warning Alert */}
                  {selectedCandidate.isContradiction && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-700" />
                        <span>Potential Claim Contradiction Detected</span>
                      </div>
                      <p className="text-[11px] text-red-800">
                        {selectedCandidate.contradictionNote || 'This assertion presents factual discrepancies compared to historical disclosures.'}
                      </p>
                      <p className="text-[10px] text-red-700 italic pt-1 border-t border-red-200/60">
                        Policy Note: Contradiction detection flags items for human moderator scrutiny and does not constitute proof of misinformation.
                      </p>
                    </div>
                  )}

                  {/* Diff Snippet */}
                  {selectedCandidate.diffSnippet && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono font-semibold text-slate-700">Statement Change Comparison:</span>
                      <pre className="text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {selectedCandidate.diffSnippet}
                      </pre>
                    </div>
                  )}

                  {/* Supporting Excerpt */}
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#525C56] uppercase">Exact Supporting Passage:</span>
                    <blockquote className="mt-1 p-3.5 bg-white border border-[#E1E8E3] rounded-lg text-xs italic text-[#2A342E] leading-relaxed">
                      "{selectedCandidate.relevantExcerpt}"
                    </blockquote>
                  </div>

                  {/* Extraction Rationale */}
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-semibold">Extraction Rationale:</span> {selectedCandidate.extractionRationale}
                    <div className="text-[10px] text-emerald-800 pt-1">
                      Signals: {selectedCandidate.detectionSignals.join(' • ')}
                    </div>
                  </div>

                  {/* Transparency Notice */}
                  <div className="text-[11px] text-[#86928C] bg-white p-3 rounded-lg border border-[#E1E8E3] space-y-1">
                    <div className="font-semibold text-[#525C56]">
                      Algorithmic Signal Score: {(selectedCandidate.confidenceScore * 100).toFixed(0)}%
                    </div>
                    <p className="text-[10px] text-[#86928C]">
                      Confidence scores reflect internal parsing certainty and are never presented or treated as proof of factual truth.
                    </p>
                  </div>

                  {/* External Link & Stage Action */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <a
                      href={selectedCandidate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#044C4C] hover:underline flex items-center gap-1 font-medium break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>View Primary Source ({selectedCandidate.publisher})</span>
                    </a>

                    <Link
                      href="/moderator"
                      className="bg-[#044C4C] hover:bg-[#16563F] text-white text-xs font-medium py-2 px-3.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>Review in Moderation Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#CBD7D0] rounded-xl text-xs text-[#86928C]">
                  Select any discovered assertion from the list to inspect supporting passages, extraction rationale, and change detection signals.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
