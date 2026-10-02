'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Radio,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  GitPullRequest,
  Database,
  Calendar,
  User,
  Quote,
  Flame,
  Info,
  Vote,
  Users,
  Check,
  XCircle,
  LogIn,
  Lock,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Activity,
  FileText,
  History,
  Sliders,
  Home,
  FolderClosed,
  BarChart2,
  BookOpen,
  Settings,
  Share2,
  Download,
  Bell,
  Filter,
  Globe,
  Landmark,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  LiveIntelligenceReport,
  EvidenceLinkedClaim,
  CommunityVoteOption,
  ClaimPollData,
  AssessmentLabel
} from '@/lib/search/types';
import {
  cleanText,
  cleanSnippet,
  cleanHeadline,
  cleanTimelineEventText
} from '@/lib/utils/textSanitizer';


const SAMPLE_QUERIES = [
  'Smith Dubai airline incident',
  'OLA Electric subsidy charge',
  'SEBI algorithmic trading',
  'RBI digital rupee pilot',
  'Apollo 11 moon landing July 1969',
  'IIT Bombay suicide case'
];

interface SearchClientProps {
  initialQuery?: string;
  initialReport?: LiveIntelligenceReport | null;
}

export default function SearchClient({
  initialQuery = '',
  initialReport = null
}: SearchClientProps) {
  const router = useRouter();
  const { language, t, voiceLang } = useLanguage();

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Initiating multi-source intelligence search...');
  const [report, setReport] = useState<LiveIntelligenceReport | null>(initialReport);
  const [error, setError] = useState<string | null>(null);

  // Text-To-Speech (TTS) state
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'playing' | 'paused'>('idle');

  // Cancel speech synthesis on query change or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [report]);

  const handleToggleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (ttsStatus === 'playing') {
      window.speechSynthesis.pause();
      setTtsStatus('paused');
      return;
    }

    if (ttsStatus === 'paused') {
      window.speechSynthesis.resume();
      setTtsStatus('playing');
      return;
    }

    if (!report) return;

    window.speechSynthesis.cancel();

    const claimText = report.query;
    const verdictText = report.aiAssessment.assessmentLabel;
    const summaryText = report.aiAssessment.directAnswer;

    let textToSpeak = '';
    if (language === 'hi') {
      textToSpeak = `जांचा जा रहा दावा: ${claimText}। आधिकारिक मूल्यांकन: ${verdictText}। वास्तविकता और साक्ष्य सारांश: ${summaryText}`;
    } else if (language === 'bn') {
      textToSpeak = `মূল্যায়ন করা দাবি: ${claimText}। সিদ্ধান্ত: ${verdictText}। বাস্তব তথ্যের সারসংক্ষেপ: ${summaryText}`;
    } else if (language === 'te') {
      textToSpeak = `పరిశీలించబడుతున్న దావా: ${claimText}। నిర్ణయం: ${verdictText}। వాస్తవ సారాంశం: ${summaryText}`;
    } else if (language === 'ta') {
      textToSpeak = `ஆய்வு செய்யப்படும் கூற்று: ${claimText}। முடிவு: ${verdictText}। உண்மை மற்றும் யதார்த்த சுருக்கம்: ${summaryText}`;
    } else if (language === 'mr') {
      textToSpeak = `तपासला जाणारा दावा: ${claimText}। अधिकृत निष्कर्ष: ${verdictText}। वास्तविकता आणि साक्ष्य सारांश: ${summaryText}`;
    } else if (language === 'gu') {
      textToSpeak = `તપાસવામાં આવી રહેલો દાવો: ${claimText}। સત્તાવાર નિર્ણય: ${verdictText}। વાસ્તવિકતા અને પુરાવા સારાંશ: ${summaryText}`;
    } else {
      textToSpeak = `Assessing claim: ${claimText}. Official assessment: ${verdictText}. Reality and evidence analysis: ${summaryText}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === voiceLang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(voiceLang.split('-')[0].toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setTtsStatus('playing');
    utterance.onend = () => setTtsStatus('idle');
    utterance.onerror = () => setTtsStatus('idle');

    window.speechSynthesis.speak(utterance);
  };

  const handleStopTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTtsStatus('idle');
    }
  };

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    'quick_verify' | 'multi_source' | 'timeline' | 'entity_explorer' | 'generate_report'
  >('quick_verify');

  // Source category filter
  const [sourceFilter, setSourceFilter] = useState<'all' | 'news' | 'social' | 'forums' | 'official' | 'public_records'>('all');

  // Authenticated user session
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPendingVote, setAuthPendingVote] = useState<CommunityVoteOption | null>(null);

  // Voting state
  const [votingLoading, setVotingLoading] = useState(false);
  const [votingFeedback, setVotingFeedback] = useState<string | null>(null);

  // Selected claim in claims inspector
  const [selectedClaim, setSelectedClaim] = useState<EvidenceLinkedClaim | null>(
    initialReport?.keyClaims?.[0] || null
  );

  // Audit & Monitoring expansion drawers
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);

  // UI state for share/copy link
  const [shareCopied, setShareCopied] = useState(false);

  // Login modal input states
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Check authenticated session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSessionUser(data.user);
        } else {
          setSessionUser(null);
        }
      })
      .catch(() => setSessionUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Update initial report if passed from server
  useEffect(() => {
    if (initialReport && !report) {
      setReport(initialReport);
      if (initialReport.keyClaims && initialReport.keyClaims.length > 0) {
        setSelectedClaim(initialReport.keyClaims[0]);
      }
    }
  }, [initialReport]);

  const executeSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setActiveQuery(q);
    setInputQuery(q);
    setLoading(true);
    setError(null);
    setSelectedClaim(null);
    setVotingFeedback(null);
    setShowAuditTrail(false);
    setShowRevisionHistory(false);

    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });

    const stageTimer1 = setTimeout(() => setLoadingStage('1/4 Discovering live articles & regulatory notices across global web...'), 200);
    const stageTimer2 = setTimeout(() => setLoadingStage('2/4 Fetching source content & extracting factual assertions...'), 700);
    const stageTimer3 = setTimeout(() => setLoadingStage('3/4 Cross-referencing VERITY historical claim database...'), 1200);
    const stageTimer4 = setTimeout(() => setLoadingStage('4/4 Synthesizing evidentiary chronology & AI assessment...'), 1600);

    try {
      const res = await fetch(`/api/search/live?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.report) {
        setReport(data.report);
        if (data.report.keyClaims && data.report.keyClaims.length > 0) {
          setSelectedClaim(data.report.keyClaims[0]);
        }
      } else {
        setError(data.error || 'Failed to complete real-time intelligence search.');
      }
    } catch (err: any) {
      setError(`Search error: ${err.message || 'Unable to connect to search service'}`);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputQuery);
  };

  // Vote Submission Handler
  const handleVote = async (option: CommunityVoteOption) => {
    if (!report?.claimPoll) return;

    if (!sessionUser) {
      setAuthPendingVote(option);
      setShowAuthModal(true);
      return;
    }

    setVotingLoading(true);
    setVotingFeedback(null);

    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(report.claimPoll.claimId)}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteOption: option,
          claimVersion: report.claimPoll.claimVersion,
          claimStatement: report.claimPoll.claimStatement
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.poll) {
        setReport((prev) => (prev ? { ...prev, claimPoll: data.poll } : prev));
        setVotingFeedback(`Your vote "${formatOptionLabel(option)}" has been securely recorded.`);
      } else {
        setVotingFeedback(data.error || 'Failed to record vote.');
      }
    } catch (err: any) {
      setVotingFeedback(`Voting failed: ${err.message}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Withdraw Vote Handler
  const handleWithdrawVote = async () => {
    if (!report?.claimPoll || !sessionUser) return;
    setVotingLoading(true);

    try {
      const res = await fetch(
        `/api/claims/${encodeURIComponent(report.claimPoll.claimId)}/poll?version=${report.claimPoll.claimVersion}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok && data.success && data.poll) {
        setReport((prev) => (prev ? { ...prev, claimPoll: data.poll } : prev));
        setVotingFeedback('Your vote has been withdrawn.');
      }
    } catch (err: any) {
      setVotingFeedback(`Failed to withdraw vote: ${err.message}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: modalEmail, password: modalPassword })
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setSessionUser(data.user);
        setShowAuthModal(false);
        if (authPendingVote) {
          const pending = authPendingVote;
          setAuthPendingVote(null);
          setTimeout(() => handleVote(pending), 300);
        }
      } else {
        setModalError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Login network error.');
    } finally {
      setModalLoading(false);
    }
  };

  // Export dossier report as downloadable text/json
  const handleDownloadReport = () => {
    if (!report) return;
    const exportData = {
      query: report.query,
      timestamp: report.searchedAt,
      verdict: report.aiAssessment.assessmentLabel,
      evidenceSupportScore: report.aiAssessment.evidenceSupportScore,
      analyticalConfidence: report.aiAssessment.aiConfidenceIndicator,
      directAnswer: report.aiAssessment.directAnswer,
      methodology: report.aiAssessment.methodologyNotes,
      independentSourcesCount: report.aiAssessment.independentSourceCount,
      sources: report.sources.map((s) => ({
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        relevanceScore: s.relevanceScore
      })),
      auditTrail: report.aiAssessment.auditTrail
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERITY_Intelligence_Report_${report.query.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share link handler
  const handleShareAnalysis = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  const formatOptionLabel = (opt: CommunityVoteOption) => {
    switch (opt) {
      case 'true': return 'Supported by Evidence';
      case 'false': return 'Refuted / False';
      case 'partially_true': return 'Partially True / Nuanced';
      case 'insufficient_evidence': return 'Insufficient Evidence';
    }
  };

  // Filter sources by selected category
  const filteredSources = (report?.sources || []).filter((s) => {
    if (sourceFilter === 'all') return true;
    const publisherLower = (s.publisher || '').toLowerCase();
    const urlLower = (s.url || '').toLowerCase();
    const platform = s.platform || '';
    const category = s.sourceCategory || '';

    if (sourceFilter === 'official') {
      return (
        category === 'official' ||
        platform === 'official' ||
        urlLower.includes('.gov') ||
        urlLower.includes('.nic.in') ||
        urlLower.includes('pib.gov.in') ||
        urlLower.includes('who.int') ||
        publisherLower.includes('government') ||
        publisherLower.includes('ministry') ||
        publisherLower.includes('official')
      );
    }
    if (sourceFilter === 'public_records') {
      return (
        category === 'public_records' ||
        platform === 'public_records' ||
        urlLower.includes('gazette') ||
        urlLower.includes('court') ||
        urlLower.includes('judgement') ||
        urlLower.includes('registry')
      );
    }
    if (sourceFilter === 'social') {
      return (
        category === 'social_media' ||
        platform === 'reddit' ||
        platform === 'youtube' ||
        platform === 'x' ||
        platform === 'instagram' ||
        urlLower.includes('reddit.com') ||
        urlLower.includes('youtube.com') ||
        urlLower.includes('youtu.be') ||
        urlLower.includes('x.com') ||
        urlLower.includes('twitter.com') ||
        urlLower.includes('instagram.com')
      );
    }
    if (sourceFilter === 'forums') {
      return (
        category === 'forums' ||
        platform === 'forums' ||
        urlLower.includes('reddit.com') ||
        urlLower.includes('ycombinator.com') ||
        urlLower.includes('forum')
      );
    }
    if (sourceFilter === 'news') {
      return (
        category === 'news' ||
        platform === 'news' ||
        (!platform &&
          !urlLower.includes('.gov') &&
          !urlLower.includes('.nic.in') &&
          !urlLower.includes('reddit.com') &&
          !urlLower.includes('youtube.com') &&
          !urlLower.includes('x.com'))
      );
    }
    return true;
  });

  // Calculate circular gauge parameters
  const scoreValue = report?.aiAssessment.evidenceSupportScore;
  const normalizedGaugeScore = scoreValue !== null && scoreValue !== undefined ? Math.min(100, Math.max(0, scoreValue)) : 0;
  const strokeDashoffset = 251.2 - (251.2 * normalizedGaugeScore) / 100;

  // Determine gauge color and short label
  const isFalseVerdict =
    report?.aiAssessment.assessmentLabel === 'Unsupported' ||
    report?.aiAssessment.assessmentLabel === 'Likely unsupported';
  const isSupportedVerdict =
    report?.aiAssessment.assessmentLabel === 'Supported' ||
    report?.aiAssessment.assessmentLabel === 'Likely supported';

  const gaugeStrokeColor = isSupportedVerdict ? '#10B981' : isFalseVerdict ? '#00C49F' : '#F59E0B';
  const gaugeDisplayLabel =
    report?.aiAssessment.assessmentLabel === 'Unsupported'
      ? 'Likely False'
      : report?.aiAssessment.assessmentLabel === 'Likely unsupported'
      ? 'Questionable'
      : report?.aiAssessment.assessmentLabel === 'Supported'
      ? 'Supported'
      : report?.aiAssessment.assessmentLabel === 'Likely supported'
      ? 'Likely True'
      : report?.aiAssessment.assessmentLabel === 'Mixed evidence'
      ? 'Mixed'
      : 'Insufficient';

  return (
    <div className="w-full flex-1 flex flex-col min-w-0">
      {/* ======================================================================= */}
      {/* HERO BANNER (Verify. Investigate. Report.)                             */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-6 pb-2 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#044C4C] via-[#034343] to-[#022E2E] text-white p-6 sm:p-8 relative overflow-hidden shadow-sm border border-[#065A5A]">
          {/* Subtle Map / Grid Background Texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(#38B2AC 1px, transparent 1px), radial-gradient(#38B2AC 1px, #044C4C 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column Text & Search Form */}
            <div className="lg:col-span-8 space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                {t('hero.badge', 'INTELLIGENCE ANALYSIS HUB')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold tracking-tight text-white">
                {t('hero.headline', 'Verify. Investigate. Report.')}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
                {t(
                  'hero.subtitle',
                  'Get deeper insights with multi-source intelligence and AI-powered analysis for high-stakes claims, corporate disclosures, and breaking events.'
                )}
              </p>

              {/* Primary Search Input */}
              <form onSubmit={handleSubmit} className="pt-2">
                <div className="bg-white rounded-full p-1.5 pl-5 flex items-center gap-3 shadow-lg max-w-2xl border border-white/20">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={t(
                      'hero.search_placeholder',
                      'Search any factual claim, breaking incident, or event...'
                    )}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm text-[#141A17] placeholder-gray-400 bg-transparent outline-none"
                  />
                  {inputQuery && (
                    <button
                      type="button"
                      onClick={() => setInputQuery('')}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !inputQuery.trim()}
                    className="bg-[#044C4C] hover:bg-[#034343] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t('hero.analyzing', 'Analyzing...')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('hero.analyze', 'Analyze →')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Try Suggestions Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-emerald-200/90 font-mono">
                <span className="text-[11px] text-emerald-300 font-bold">{t('hero.try', 'Try:')}</span>
                {SAMPLE_QUERIES.map((sq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInputQuery(sq);
                      executeSearch(sq);
                    }}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] text-white transition-all cursor-pointer truncate max-w-xs"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column Inside Banner (Floating Analysis Insights Card) */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white space-y-2.5 shadow-lg ml-auto max-w-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 uppercase">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{t('hero.badge', 'ANALYSIS INSIGHTS')}</span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Use advanced multi-source telemetry, cross-check canonical publisher origins, and verify timeline assertions for deeper factual grounding.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white pt-1 transition-colors"
                >
                  <span>Learn methodology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. SUB-TAB NAVIGATION BAR                                               */}
      {/* ======================================================================= */}
      <div className="px-6 pt-2 border-b border-[#E2E8E4] bg-[#F4F6F4] flex items-center gap-6 text-xs font-semibold text-[#525C56] select-none overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('quick_verify')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer border-b-2 transition-all shrink-0 ${
            activeTab === 'quick_verify'
              ? 'border-[#044C4C] text-[#044C4C] font-bold'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('tab.quick_verify', 'Quick Verify')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('multi_source')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer border-b-2 transition-all shrink-0 ${
            activeTab === 'multi_source'
              ? 'border-[#044C4C] text-[#044C4C] font-bold'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('tab.multi_source', 'Multi-Source Analysis')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer border-b-2 transition-all shrink-0 ${
            activeTab === 'timeline'
              ? 'border-[#044C4C] text-[#044C4C] font-bold'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('tab.timeline', 'Timeline View')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entity_explorer')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer border-b-2 transition-all shrink-0 ${
            activeTab === 'entity_explorer'
              ? 'border-[#044C4C] text-[#044C4C] font-bold'
              : 'border-transparent text-[#69746E] hover:text-[#141A17]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('tab.entity_explorer', 'Entity Explorer')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownloadReport()}
          className="pb-3 flex items-center gap-1.5 cursor-pointer border-b-2 border-transparent text-[#69746E] hover:text-[#044C4C] transition-all ml-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{t('tab.generate_report', 'Generate Report')}</span>
        </button>
      </div>

        {/* ======================================================================= */}
        {/* 5. LOADING / ERROR STATES                                               */}
        {/* ======================================================================= */}
        {loading && (
          <div className="p-8 max-w-2xl mx-auto text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-[#E6F2F2] text-[#044C4C] flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin text-[#044C4C]" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-serif-headline text-[#141A17]">
                Conducting Live Multi-Source Intelligence Discovery
              </h3>
              <p className="text-xs text-[#525C56] mt-1 font-mono">{loadingStage}</p>
            </div>
            <div className="w-full bg-[#E2E8E4] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#044C4C] h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="m-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-semibold">Analysis Failed</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 6. MAIN DOSSIER CONTENT GRID                                            */}
        {/* ======================================================================= */}
        {!loading && report && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* --------------------------------------------------------------- */}
              {/* LEFT MAIN COLUMN (~68%)                                         */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-8 space-y-6">
                {/* A. Verification Overview Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1] flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-[#141A17] font-serif-headline">
                        {t('overview.title', 'Verification Overview')}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                        PRIMARY AI EVIDENCE ASSESSMENT
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Text-To-Speech (TTS) Voice Readout Pill */}
                      <button
                        type="button"
                        onClick={handleToggleTTS}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                          ttsStatus === 'playing'
                            ? 'bg-[#044C4C] text-white animate-pulse'
                            : ttsStatus === 'paused'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-[#E6F2F2] hover:bg-[#D5EAEA] text-[#044C4C] border border-[#B2D8D8]'
                        }`}
                        title={t('tts.listen_summary', 'Listen AI Audio Summary')}
                      >
                        {ttsStatus === 'playing' ? (
                          <>
                            <Volume2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                            <span>{t('tts.playing', 'Speaking Summary...')}</span>
                            <span className="flex gap-0.5 items-center ml-1">
                              <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                              <span className="w-1 h-4 bg-emerald-200 rounded-full animate-pulse delay-75" />
                              <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
                            </span>
                          </>
                        ) : ttsStatus === 'paused' ? (
                          <>
                            <Play className="w-3.5 h-3.5 text-amber-800" />
                            <span>{t('tts.resume', 'Resume')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#044C4C]" />
                            <span>{t('tts.listen_summary', 'Listen AI Audio Summary')}</span>
                          </>
                        )}
                      </button>

                      {ttsStatus !== 'idle' && (
                        <button
                          type="button"
                          onClick={handleStopTTS}
                          className="p-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                          title={t('tts.stop', 'Stop')}
                        >
                          <Square className="w-3 h-3 fill-current" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowHealthMonitor(!showHealthMonitor)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-50 text-emerald-800 border-emerald-200"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>HEALTH: {report.healthMonitoring?.status.toUpperCase() || 'HEALTHY'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Overview Internal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Circular Score Gauge */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center p-1">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E2E8E4"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={gaugeStrokeColor}
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset={scoreValue !== null ? strokeDashoffset : 251.2}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-bold font-mono text-[#044C4C]">
                            {scoreValue !== null ? `${scoreValue}%` : 'N/A'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-tight text-[#69746E]">
                            {gaugeDisplayLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Headline and Narrative Explanation */}
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="text-[11px] font-mono uppercase font-bold text-[#69746E]">
                        Direct Answer
                      </div>
                      <h4 className="font-bold text-base text-[#141A17] font-serif-headline leading-snug">
                        {report.aiAssessment.assessmentLabel === 'Unsupported'
                          ? `No credible evidence found to confirm ${report.query}.`
                          : report.aiAssessment.assessmentLabel === 'Supported'
                          ? `Verified reporting and records corroborate ${report.query}.`
                          : report.aiAssessment.assessmentLabel === 'Insufficient evidence'
                          ? `Unable to find relevant evidence addressing ${report.query}.`
                          : `Mixed or disputed reporting discovered for ${report.query}.`}
                      </h4>
                      <p className="text-xs text-[#525C56] leading-relaxed">
                        {report.aiAssessment.directAnswer}
                      </p>

                      <div className="pt-2 border-t border-[#F0F4F1] space-y-1">
                        <div className="text-[11px] font-mono uppercase font-bold text-[#044C4C]">
                          Why the AI Reached this Assessment
                        </div>
                        <p className="text-xs text-[#525C56] leading-relaxed">
                          {report.aiAssessment.conciseExplanation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAuditTrail(!showAuditTrail)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#044C4C] hover:underline pt-1 cursor-pointer"
                      >
                        <span>{showAuditTrail ? 'Hide Detailed Analysis' : t('overview.view_detailed', 'View Detailed Analysis →')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Confidence Breakdown Progress Bars */}
                    <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-[#F0F4F1] pt-4 md:pt-0 md:pl-5 text-xs font-mono">
                      <div className="text-[11px] font-bold text-[#69746E] uppercase flex items-center justify-between">
                        <span>{t('overview.confidence_breakdown', 'Confidence Breakdown')}</span>
                        <Info className="w-3.5 h-3.5 text-[#86928C]" />
                      </div>

                      <div className="space-y-2 pt-1 text-[11px]">
                        <div>
                          <div className="flex justify-between text-[#525C56] pb-0.5">
                            <span>{t('overview.metric.verified_sources', 'Verified Sources')}</span>
                            <span className="font-bold text-[#044C4C]">{Math.min(100, (report.aiAssessment.independentSourceCount || 1) * 15)}%</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#044C4C] h-1.5 rounded-full" style={{ width: `${Math.min(100, (report.aiAssessment.independentSourceCount || 1) * 15)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#525C56] pb-0.5">
                            <span>{t('overview.metric.cross_source', 'Cross-source Match')}</span>
                            <span className="font-bold text-[#044C4C]">{report.sourceDiversityScore || 50}%</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#044C4C] h-1.5 rounded-full" style={{ width: `${report.sourceDiversityScore || 50}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#525C56] pb-0.5">
                            <span>{t('overview.metric.credibility', 'Credibility of Sources')}</span>
                            <span className="font-bold text-[#044C4C]">{report.aiAssessment.aiConfidenceIndicator.score}%</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#044C4C] h-1.5 rounded-full" style={{ width: `${report.aiAssessment.aiConfidenceIndicator.score}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#525C56] pb-0.5">
                            <span>{t('overview.metric.consistency', 'Content Consistency')}</span>
                            <span className="font-bold text-[#044C4C]">{report.discrepancies.length === 0 ? '90%' : '35%'}</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#044C4C] h-1.5 rounded-full" style={{ width: report.discrepancies.length === 0 ? '90%' : '35%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#525C56] pb-0.5">
                            <span>{t('overview.metric.anomaly', 'AI Anomaly Detection')}</span>
                            <span className="font-bold text-[#044C4C]">{report.aiAssessment.relevanceGatePassed ? '95%' : '20%'}</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#044C4C] h-1.5 rounded-full" style={{ width: `${report.aiAssessment.relevanceGatePassed ? 95 : 20}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Hard Relevance Gate Rejection Banner (When Gate Fails) */}
                {(report.aiAssessment.relevanceGatePassed === false || report.aiAssessment.assessmentLabel === 'Insufficient evidence') && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-amber-900 font-bold font-serif-headline text-base">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Unable to find relevant evidence for this claim</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                      The search engine retrieved candidate sources, but none of the articles address or substantiate the specific claim being asked. Unrelated articles (such as entertainment news, unrelated legal cases, or generic entity mentions) were rejected by the strict relevance gate to prevent false or misleading corroboration.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-amber-900">
                      <span className="bg-white/90 px-2.5 py-1 rounded-md border border-amber-200">
                        Candidate sources inspected: {report.sources.length}
                      </span>
                      <span className="bg-white/90 px-2.5 py-1 rounded-md border border-amber-200">
                        Sources passing relevance: 0
                      </span>
                      <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md border border-rose-300 font-bold">
                        Relevance Gate: REJECTED (Score withheld)
                      </span>
                    </div>
                  </div>
                )}

                {/* C. Evidence Audit Trail Drawer (Expandable) */}
                {showAuditTrail && report.aiAssessment.auditTrail && (
                  <div className="bg-white rounded-2xl border border-[#D5E0D8] p-5 space-y-4 shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#044C4C] uppercase">
                          <Sliders className="w-4 h-4 text-[#044C4C]" />
                          <span>Detailed Evidence Scoring Audit Trail</span>
                        </div>
                        <p className="text-xs text-[#525C56]">
                          Mathematical point contributions across independent origins, official documentation, consistency, and direct relevance.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAuditTrail(false)}
                        className="text-xs font-mono text-[#69746E] hover:text-[#044C4C] p-1 rounded-md cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Contributing Scoring Factors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {(report.aiAssessment.auditTrail.scoringFactors || []).map((fac: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E2E8E4] space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-[#141A17]">{fac.factorName || fac.name}</span>
                            <span className="font-bold text-[#044C4C] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              +{fac.pointsContributed ?? fac.pointsAwarded ?? 0} / {fac.maxPoints} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#525C56] leading-relaxed">{fac.rationale}</p>
                        </div>
                      ))}
                    </div>

                    {/* Canonical Origins Table */}
                    {(report.aiAssessment.auditTrail.independentOriginsList || []).length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-mono uppercase text-[#69746E] font-bold">
                          Verified Canonical Publisher Origins ({(report.aiAssessment.auditTrail.independentOriginsList || []).length})
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs bg-white rounded-xl border border-[#E2E8E4]">
                            <thead className="bg-[#F0F4F1] font-mono text-[10px] text-[#525C56] uppercase">
                              <tr>
                                <th className="p-2.5">Publisher Domain</th>
                                <th className="p-2.5">Outlet</th>
                                <th className="p-2.5">Syndication Status</th>
                                <th className="p-2.5 text-right">Corroboration Weight</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8E4]">
                              {(report.aiAssessment.auditTrail.independentOriginsList || []).map((ori: any, i: number) => (
                                <tr key={i} className="hover:bg-[#FAFBF9]">
                                  <td className="p-2.5 font-mono text-[11px] text-[#044C4C] font-semibold">{ori.domain}</td>
                                  <td className="p-2.5 text-[#2C3531]">{ori.publisherName || ori.publisher}</td>
                                  <td className="p-2.5">
                                    {ori.isSyndicatedWire ? (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                        Wire Copy ({ori.wireService || 'Wire'})
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        Original Newsroom
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-bold text-[#2C3531]">
                                    {ori.effectiveContribution === 1.0 ? '1.0 (Full)' : '0.33 (Discounted)'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* B. COMMUNITY EVIDENCE POLL Card */}
                {report.claimPoll && (
                  <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                        <Vote className="w-4 h-4 text-[#044C4C]" />
                        <span>COMMUNITY EVIDENCE POLL</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#86928C]">
                        {report.claimPoll.totalVotes} Community Votes
                      </span>
                    </div>

                    <p className="text-xs text-[#525C56]">
                      Cast your analytical vote on whether public evidence substantiates this claim. Votes are cryptographically bound to authenticated user accounts.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {(
                        [
                          { key: 'true', label: 'Supported by Evidence', color: 'emerald' },
                          { key: 'false', label: 'Refuted / False', color: 'rose' },
                          { key: 'partially_true', label: 'Partially True / Nuanced', color: 'blue' },
                          { key: 'insufficient_evidence', label: 'Insufficient Evidence', color: 'amber' }
                        ] as const
                      ).map(({ key, label, color }) => {
                        const opt = report.claimPoll.options[key];
                        const isUserVote = report.claimPoll.userVote === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleVote(key)}
                            disabled={votingLoading}
                            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isUserVote
                                ? 'bg-emerald-50/70 border-[#044C4C] ring-1 ring-[#044C4C]'
                                : 'bg-[#FAFBF9] border-[#E2E8E4] hover:border-[#C5DDD0]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-[#141A17] pb-2">
                              <span>{label}</span>
                              <span className="font-mono text-xs font-bold text-[#044C4C]">
                                {opt.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-[#E2E8E4] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#044C4C] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {votingFeedback && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
                        {votingFeedback}
                      </div>
                    )}
                  </div>
                )}

                {/* C. 4-QUADRANT VERIFICATION BREAKDOWN Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <Layers className="w-4 h-4 text-[#044C4C]" />
                      <span>4-QUADRANT VERIFICATION BREAKDOWN</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#86928C]">
                      Attributable Fact Clusters
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Quadrant 1: Confirmed Facts */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-mono uppercase">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Confirmed Facts ({report.breakdown.confirmed.length})</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-950 list-disc list-inside">
                        {report.breakdown.confirmed.length > 0 ? (
                          report.breakdown.confirmed.map((fact, idx) => (
                            <li key={idx} className="leading-relaxed">{fact}</li>
                          ))
                        ) : (
                          <li className="text-[#69746E] italic list-none">No publicly corroborated facts on statutory record.</li>
                        )}
                      </ul>
                    </div>

                    {/* Quadrant 2: Reported Statements */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900 font-mono uppercase">
                        <Quote className="w-4 h-4 text-blue-700" />
                        <span>Reported Statements ({report.breakdown.reported.length})</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-blue-950 list-disc list-inside">
                        {report.breakdown.reported.length > 0 ? (
                          report.breakdown.reported.map((stmt, idx) => (
                            <li key={idx} className="leading-relaxed">{stmt}</li>
                          ))
                        ) : (
                          <li className="text-[#69746E] italic list-none">No press releases or secondary statements identified.</li>
                        )}
                      </ul>
                    </div>

                    {/* Quadrant 3: Disputed Claims */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-mono uppercase">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>Disputed Claims ({report.breakdown.disputed.length})</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-amber-950 list-disc list-inside">
                        {report.breakdown.disputed.length > 0 ? (
                          report.breakdown.disputed.map((disp, idx) => (
                            <li key={idx} className="leading-relaxed">{disp}</li>
                          ))
                        ) : (
                          <li className="text-[#69746E] italic list-none">Zero open factual contradictions detected between reporting sources.</li>
                        )}
                      </ul>
                    </div>

                    {/* Quadrant 4: Unknowns & Limitations */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800 font-mono uppercase">
                        <HelpCircle className="w-4 h-4 text-gray-600" />
                        <span>Unknowns & Limitations ({report.breakdown.unknown.length})</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                        {report.breakdown.unknown.map((unk, idx) => (
                          <li key={idx} className="leading-relaxed">{unk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* D. CHRONOLOGICAL INCIDENT TIMELINE Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <Clock className="w-4 h-4 text-[#044C4C]" />
                      <span>CHRONOLOGICAL INCIDENT TIMELINE</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#86928C]">
                      {report.timeline.length} Documented Milestones
                    </span>
                  </div>

                  <div className="space-y-3.5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8E4] pl-6 text-xs">
                    {report.timeline.length > 0 ? (
                      report.timeline.map((tItem, idx) => (
                        <div key={idx} className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#044C4C] absolute -left-[23px] top-1 border-2 border-white" />
                          <div className="font-mono text-[10px] text-[#86928C]">
                            {(tItem.time ? `${cleanText(tItem.date)} ${cleanText(tItem.time)}` : cleanText(tItem.date)) || 'Chronology Marker'}
                          </div>
                          <div className="font-bold text-[#141A17] text-[12px] leading-snug">
                            {cleanTimelineEventText(tItem.event, tItem.source)}
                          </div>
                          {tItem.source && (
                            <div className="text-[11px] text-[#525C56]">
                              Attributable source: <span className="font-medium text-[#044C4C]">{cleanText(tItem.source)}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-[#69746E] italic">
                        Real-time chronological events indexed directly across retrieved source timestamps.
                      </div>
                    )}
                  </div>
                </div>

                {/* E. SOURCE REPOSITORY & EVIDENCE INSPECTOR Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#044C4C]" />
                      <h3 className="font-bold text-base text-[#141A17] font-serif-headline">
                        SOURCE REPOSITORY & EVIDENCE INSPECTOR
                      </h3>
                      <span className="text-xs font-mono text-[#86928C]">({report.sources.length})</span>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setSourceFilter('all')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'all'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.all', 'All Sources')} ({report.sources.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceFilter('news')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'news'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.news', 'News')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceFilter('social')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'social'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.social', 'Social Media')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceFilter('forums')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'forums'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.forums', 'Forums')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceFilter('official')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'official'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.official', 'Official Sources')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSourceFilter('public_records')}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          sourceFilter === 'public_records'
                            ? 'bg-[#044C4C] text-white border-[#044C4C] font-bold'
                            : 'bg-white text-[#525C56] border-[#E2E8E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {t('sources.filter.public_records', 'Public Records')}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="p-1.5 rounded-lg border border-[#E2E8E4] text-[#69746E] hover:text-[#044C4C] ml-1 cursor-pointer"
                        title="Download Sources"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Platform Retrieval & Adapter Status */}
                  <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E2E8E4] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#044C4C]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#044C4C]" />
                        Multi-Platform Intelligence & Retrieval Status
                      </span>
                      <span className="text-[11px] text-[#69746E] font-normal">
                        {report.platformStatuses?.length || 7} Platform Adapters Queried
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      {(report.platformStatuses || [
                        { platform: 'news', name: 'News Outlets', status: 'live', itemCount: report.sources.filter(s => s.platform === 'news').length },
                        { platform: 'official', name: 'Official Portals', status: 'live', itemCount: report.sources.filter(s => s.platform === 'official').length },
                        { platform: 'reddit', name: 'Reddit Discussions', status: 'live', itemCount: report.sources.filter(s => s.platform === 'reddit').length },
                        { platform: 'youtube', name: 'YouTube Video Metadata', status: 'live', itemCount: report.sources.filter(s => s.platform === 'youtube').length },
                        { platform: 'forums', name: 'Discussion Forums', status: 'live', itemCount: report.sources.filter(s => s.platform === 'forums').length },
                        { platform: 'x', name: 'X / Twitter', status: 'auth_required', itemCount: 0, message: 'Requires X API v2 Bearer Token; unauthenticated scraping prevented per terms' },
                        { platform: 'instagram', name: 'Instagram', status: 'restricted', itemCount: 0, message: 'Requires Meta Graph API OAuth credentials per platform access controls' }
                      ]).map((plat, pIdx) => {
                        const isLive = plat.status === 'live' || plat.status === 'connected';
                        const isAuth = plat.status === 'auth_required';

                        return (
                          <div
                            key={pIdx}
                            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                              isLive
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                : isAuth
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-purple-50 text-purple-900 border-purple-200'
                            }`}
                            title={plat.message || `${plat.name}: ${plat.status}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLive ? 'bg-emerald-600' : isAuth ? 'bg-amber-600' : 'bg-purple-600'
                              }`}
                            />
                            <span className="font-semibold">{plat.name}</span>
                            <span className="opacity-80">
                              {isLive ? `(${plat.itemCount})` : isAuth ? '• Auth Required' : '• Restricted'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {report.socialAnalysis?.socialExclusivityWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{report.socialAnalysis.socialExclusivityWarning}</span>
                      </div>
                    )}
                  </div>

                  {/* Sources Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {filteredSources.slice(0, 8).map((src, idx) => {
                      const platformName = src.platform === 'reddit' ? 'Reddit'
                        : src.platform === 'youtube' ? 'YouTube'
                        : src.platform === 'forums' ? 'Forum'
                        : src.platform === 'official' ? 'Official Gov'
                        : src.platform === 'public_records' ? 'Public Record'
                        : src.platform === 'x' ? 'X (Twitter)'
                        : 'News Outlet';

                      const contentTypeLabel =
                        src.contentType === 'firsthand_eyewitness' ? 'Eyewitness Account'
                        : src.contentType === 'official_statement' ? 'Official Statement'
                        : src.contentType === 'user_speculation' ? 'User Speculation'
                        : src.contentType === 'satire' ? 'Satire / Parody'
                        : src.contentType === 'unverified_allegation' ? 'Unverified Allegation'
                        : src.contentType === 'corroborated_evidence' ? 'Corroborated Evidence'
                        : 'News Reporting';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E2E8E4] flex flex-col justify-between space-y-3 hover:border-[#C5DDD0] transition-colors shadow-2xs"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#044C4C] px-2 py-0.5 rounded bg-white border border-[#E2E8E4]">
                                  {cleanText(src.publisher)}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#E6F2F2] text-[#044C4C] font-semibold border border-[#B2D8D8]">
                                  {platformName}
                                </span>
                              </div>
                              <span className="text-[#86928C]">
                                {src.publishedAt ? new Date(src.publishedAt).toLocaleDateString() : 'Live index'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                {contentTypeLabel}
                              </span>
                              {src.provenance?.isDuplicate && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  Syndicated Copy
                                </span>
                              )}
                              {src.relevanceScore !== undefined && (
                                <span className="text-[10px] font-mono text-[#044C4C] font-semibold ml-auto">
                                  Relevance: {Math.round(src.relevanceScore * 100)}%
                                </span>
                              )}
                            </div>

                            <h5 className="font-bold text-xs text-[#141A17] line-clamp-2 leading-snug">
                              {cleanHeadline(src.title, src.publisher)}
                            </h5>

                            <p className="text-[11px] text-[#525C56] line-clamp-2 leading-relaxed">
                              {cleanSnippet(src.snippet || src.extractedBody, src.title, src.publisher) || 'No text snippet available.'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#E8ECE9] flex items-center justify-between text-[11px] font-mono">
                            {src.directlyAnswers ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                                ⚠ Background Context
                              </span>
                            )}

                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#044C4C] hover:underline"
                            >
                              <span>View source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* F. VERITY ARCHIVE CROSS-REFERENCE Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <Database className="w-4 h-4 text-[#044C4C]" />
                      <span>VERITY ARCHIVE CROSS-REFERENCE</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#86928C]">
                      Historical Intelligence Database
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {report.databaseComparison?.matchedEntity ? (
                      <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E2E8E4] space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-[#044C4C]">
                            Matched Entity: {report.databaseComparison.matchedEntity.name}
                          </span>
                          <span className="text-[#86928C]">
                            Category: {report.databaseComparison.matchedEntity.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#525C56]">
                          {report.databaseComparison.comparisonNotes}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E2E8E4] space-y-1">
                        <div className="font-mono text-[11px] font-bold text-[#044C4C]">
                          New Incident Dossier
                        </div>
                        <p className="text-[11px] text-[#525C56]">
                          {report.databaseComparison?.comparisonNotes || 'Query does not duplicate an existing historical database incident. Staged as a candidate claim.'}
                        </p>
                      </div>
                    )}

                    {report.databaseComparison?.matchedClaims && report.databaseComparison.matchedClaims.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-[#69746E] uppercase font-bold">
                          Related Verified Archive Records:
                        </div>
                        {report.databaseComparison.matchedClaims.map((mc, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-[#E2E8E4] flex items-center justify-between text-[11px]">
                            <span className="text-[#141A17] font-medium">{mc.statement}</span>
                            <span className="font-mono text-[#044C4C] shrink-0 font-bold ml-2">
                              Match: {Math.round(mc.similarity * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* G. Related Searches & Entities Card */}
                <div className="bg-white rounded-2xl border border-[#E2E8E4] p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E6F2F2] text-[#044C4C] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#141A17]">Related Searches & Entities</h4>
                      <p className="text-[11px] text-[#69746E]">Explore related entities for broader geopolitical and factual context.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      report.query,
                      'Official Government Statements',
                      'Fact Check Registry',
                      'Misinformation Alert'
                    ].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setInputQuery(tag);
                          executeSearch(tag);
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#FAFBF9] hover:bg-[#E6F2F2] border border-[#E2E8E4] text-[11px] text-[#044C4C] font-medium transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------------------- */}
              {/* RIGHT SIDEBAR COLUMN (~32%)                                     */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. AI Insights Card (Matching Reference Design) */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{t('insights.title', 'AI Insights')}</span>
                    </div>
                    <ChevronUp className="w-4 h-4 text-[#86928C]" />
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Insight 1: Official Records */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-[#141A17]">{t('insights.no_records', 'No official records found')}</h5>
                        <p className="text-[#525C56] leading-relaxed text-[11px]">
                          {t('insights.no_records_desc', 'Zero confirmation from official government portals, gazettes, or accredited international press agencies.')}
                        </p>
                      </div>
                    </div>

                    {/* Insight 2: Origin Context */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-[#141A17]">{t('insights.origin', 'Origin of the claim')}</h5>
                        <p className="text-[#525C56] leading-relaxed text-[11px]">
                          {t('insights.origin_desc', 'The claim circulated primarily on social networks or satire forums without verifiable primary corroboration.')}
                        </p>
                      </div>
                    </div>

                    {/* Insight 3: Similar Incidents */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-[#141A17]">{t('insights.similar', 'Similar past incidents')}</h5>
                        <p className="text-[#525C56] leading-relaxed text-[11px]">
                          {t('insights.similar_desc', 'Shares characteristics with recurring viral celebrity satire and synthetic political hoaxes.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F0F4F1]">
                    <button
                      type="button"
                      onClick={() => setShowAuditTrail(true)}
                      className="text-xs font-semibold text-[#044C4C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('insights.view_full', 'View full analysis →')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Evidence Timeline Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <Clock className="w-4 h-4 text-[#044C4C]" />
                      <span>{t('timeline.title', 'Evidence Timeline')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('timeline')}
                      className="text-xs font-mono text-[#044C4C] hover:underline cursor-pointer"
                    >
                      {t('timeline.view_all', 'View all →')}
                    </button>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="space-y-3.5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8E4] pl-6 text-xs">
                    {report.timeline.length > 0 ? (
                      report.timeline.slice(0, 4).map((tItem, idx) => (
                        <div key={idx} className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#044C4C] absolute -left-[23px] top-1 border-2 border-white" />
                          <div className="font-mono text-[10px] text-[#86928C]">
                            {(tItem.time ? `${cleanText(tItem.date)} ${cleanText(tItem.time)}` : cleanText(tItem.date)) || 'Recent Analysis'}
                          </div>
                          <div className="font-bold text-[#141A17] text-[11px] leading-snug">
                            {cleanTimelineEventText(tItem.event, tItem.source)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#044C4C] absolute -left-[23px] top-1 border-2 border-white" />
                          <div className="font-mono text-[10px] text-[#86928C]">Discovery Phase</div>
                          <div className="font-bold text-[#141A17] text-[11px]">Multi-engine web retrieval completed</div>
                        </div>
                        <div className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -left-[23px] top-1 border-2 border-white" />
                          <div className="font-mono text-[10px] text-[#86928C]">Relevance Gating</div>
                          <div className="font-bold text-[#141A17] text-[11px]">Strict predicate & entity anchors evaluated</div>
                        </div>
                        <div className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 absolute -left-[23px] top-1 border-2 border-white" />
                          <div className="font-mono text-[10px] text-[#86928C]">Synthesis</div>
                          <div className="font-bold text-[#141A17] text-[11px]">Dossier compiled with factor breakdown</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Export / Share Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-3.5 shadow-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#141A17] font-serif-headline">{t('export.title', 'Export / Share')}</h4>
                    <p className="text-xs text-[#525C56]">{t('export.subtitle', 'Generate a detailed intelligence report or share with your research team.')}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#044C4C] hover:bg-[#034343] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('export.download', 'Download Report')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareAnalysis}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D5DFD8] hover:bg-[#FAFBF9] text-[#044C4C] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{shareCopied ? 'Link Copied!' : t('export.share', 'Share Analysis')}</span>
                    </button>
                  </div>

                  {shareCopied && (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-mono text-center">
                      Public live link copied to clipboard.
                    </div>
                  )}
                </div>

                {/* 4. Assessment Revisions Card (Transparent Versioning) */}
                <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#044C4C] uppercase">
                      <History className="w-4 h-4 text-[#044C4C]" />
                      <span>Revision Tracking</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      v{(report.aiAssessment.revisionHistory?.length || 1)}.0
                    </span>
                  </div>
                  <p className="text-xs text-[#525C56]">
                    Every assessment change is version-controlled and preserved when new evidence or official contradictions emerge.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRevisionHistory(!showRevisionHistory)}
                    className="text-xs font-semibold text-[#044C4C] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>{showRevisionHistory ? 'Hide Revisions' : 'Inspect Revision History'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Revision Drawer inside card */}
                  {showRevisionHistory && (
                    <div className="space-y-2 pt-2 border-t border-[#E8ECE9]">
                      {(report.aiAssessment.revisionHistory || []).map((rev: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8E4] text-[11px] space-y-1">
                          <div className="flex justify-between font-mono">
                            <span className="font-bold text-[#044C4C]">v{rev.versionNumber ?? (idx + 1)}.0: {rev.newAssessmentLabel}</span>
                            <span className="text-[#86928C]">{new Date(rev.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[#525C56]">{rev.whatChangedRationale}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* 7. AUTHENTICATION MODAL                                                    */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D5DFD8] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE9]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#044C4C] uppercase">
                <Lock className="w-4 h-4 text-[#044C4C]" />
                <span>Analyst Authentication</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#525C56]">
              Sign in with your verified analyst credentials to cast authenticated votes and contribute to community dossiers.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-[#69746E] uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="analyst@verity.org"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8E4] text-xs outline-none focus:border-[#044C4C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#69746E] uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8E4] text-xs outline-none focus:border-[#044C4C]"
                />
              </div>

              {modalError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  {modalError}
                </div>
              )}

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-2.5 rounded-xl bg-[#044C4C] hover:bg-[#1B5E20] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Authenticate</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
