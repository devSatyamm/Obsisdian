'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { EntityCategory, EvidenceCategory, UserPersona } from '@/lib/types';
import { DEMO_PERSONAS } from '@/lib/data/mockData';

const CATEGORIES: EntityCategory[] = [
  'Algorithmic Trading',
  'Forex & CFD Broker',
  'Crypto Yield & Staking',
  'P2P Lending',
  'Advisory & Telegram Tipster',
  'Chit Fund & Multi-Level Marketing',
  'Regulated Depository & Broker'
];

const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  'Official Regulatory Order',
  'Regulatory Alert List',
  'Corporate Registry Record',
  'Reputable News Investigation',
  'Deceptive Marketing Screenshot',
  'Withdrawal Refusal Evidence',
  'Contractual Mismatch'
];

function SubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEntityId = searchParams.get('entityId') || '';
  const prefilledName = searchParams.get('name') || '';
  const isCorrection = searchParams.get('correction') === 'true';

  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.contributor);
  const [entityName, setEntityName] = useState(prefilledName);
  const [selectedEntityId, setSelectedEntityId] = useState(prefilledEntityId);
  const [category, setCategory] = useState<EntityCategory>('Algorithmic Trading');
  const [evidenceCategory, setEvidenceCategory] = useState<EvidenceCategory>('Withdrawal Refusal Evidence');
  const [title, setTitle] = useState('');
  const [factualDescription, setFactualDescription] = useState('');
  const [primarySourceUrl, setPrimarySourceUrl] = useState('');
  const [sourceDate, setSourceDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(repository.getActiveUser());
    const handler = () => setCurrentUser(repository.getActiveUser());
    window.addEventListener('verity_user_changed', handler);
    return () => window.removeEventListener('verity_user_changed', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim()) {
      setError('Please provide the entity or platform name.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive title for this evidence.');
      return;
    }
    if (!factualDescription.trim() || factualDescription.trim().length < 20) {
      setError('Please provide a factual description of at least 20 characters.');
      return;
    }
    if (!primarySourceUrl.trim() || !primarySourceUrl.startsWith('http')) {
      setError('Please provide a valid primary source URL (http:// or https://).');
      return;
    }

    try {
      const submission = repository.createSubmission({
        entityId: selectedEntityId || undefined,
        entityName: entityName.trim(),
        category,
        evidenceCategory,
        title: title.trim(),
        factualDescription: factualDescription.trim(),
        primarySourceUrl: primarySourceUrl.trim(),
        sourcePublicationDate: sourceDate,
        submittedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role === 'moderator' ? 'Researcher' : 'Contributor'
        }
      });

      setSubmittedSuccess(submission.id);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#E5F7EB] flex items-center justify-center mx-auto text-[#166534]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-headline font-bold text-[#141A17]">
          Evidence Submitted to Moderation Queue
        </h1>
        <p className="text-xs sm:text-sm text-[#525C56] max-w-md mx-auto leading-relaxed">
          Your submission has been recorded under Reference ID{' '}
          <code className="font-mono bg-[#E6F2F2] text-[#044C4C] px-2 py-0.5 rounded font-bold">
            {submittedSuccess}
          </code>
          . A peer moderator will verify the primary source link before merging it into the public dossier.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/moderator"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs transition-all"
          >
            <span>Review in Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium text-[#2E3632] bg-white hover:bg-[#FAFBF9] border border-[#D8DFDA] rounded-full shadow-2xs transition-all"
          >
            <span>View Submissions Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
          <Link href="/" className="hover:text-[#044C4C] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#141A17] font-medium">
            {isCorrection ? 'Report a Correction' : 'Submit Evidence'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight">
          {isCorrection ? `Report Correction for ${prefilledName}` : 'Contribute Statement or Evidence'}
        </h1>
        <p className="text-xs sm:text-sm text-[#525C56] mt-1 leading-relaxed">
          All submissions must be supported by verifiable public source links. Every submission is peer-reviewed before appearing on public profiles.
        </p>
      </div>

      {/* Submitter Persona Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E7E3] flex items-center justify-between text-xs text-[#525C56] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#044C4C] text-white font-mono text-xs font-bold flex items-center justify-center">
            {currentUser.avatarInitials}
          </div>
          <div>
            <span className="font-bold text-[#141A17]">{currentUser.name}</span>
            <span className="text-[#86928C] block text-[11px]">
              Submitting as: {currentUser.role === 'moderator' ? 'Senior Research Moderator' : 'Verified Contributor'}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#86928C]">
          Contributor ID: {currentUser.id}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E7E3] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
        {/* Entity Name */}
        <div>
          <label className="block text-xs font-bold text-[#141A17] mb-1.5">
            Platform or Organisation Name *
          </label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="e.g., Byju's, Paytm, TradeGenius AI, OctaFX"
            className="w-full px-3.5 py-2.5 bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] transition-all"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#141A17] mb-1.5">
              Sector / Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#141A17] mb-1.5">
              Evidence Classification *
            </label>
            <select
              value={evidenceCategory}
              onChange={(e) => setEvidenceCategory(e.target.value as any)}
              className="w-full p-2.5 bg-[#FAFBF9] rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17]"
            >
              {EVIDENCE_CATEGORIES.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Evidence Title */}
        <div>
          <label className="block text-xs font-bold text-[#141A17] mb-1.5">
            Statement Title or Summary of Alteration *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Revised guaranteed return disclosure from marketing flyer"
            className="w-full px-3.5 py-2.5 bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] transition-all"
          />
        </div>

        {/* Primary Source URL & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#141A17] mb-1.5">
              Primary Source URL *
            </label>
            <input
              type="url"
              value={primarySourceUrl}
              onChange={(e) => setPrimarySourceUrl(e.target.value)}
              placeholder="https://sebi.gov.in/orders/... or https://web.archive.org/..."
              className="w-full px-3.5 py-2.5 bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] font-mono text-xs transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#141A17] mb-1.5">
              Source Publication Date
            </label>
            <input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17]"
            />
          </div>
        </div>

        {/* Factual Description / Exact Statement */}
        <div>
          <label className="block text-xs font-bold text-[#141A17] mb-1.5">
            Exact Statement Wording & Factual Notes *
          </label>
          <textarea
            rows={4}
            value={factualDescription}
            onChange={(e) => setFactualDescription(e.target.value)}
            placeholder="Quote the exact statement wording, figure, or clause and explain the context or change..."
            className="w-full px-3.5 py-2.5 bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] leading-relaxed transition-all"
          />
          <span className="text-[11px] text-[#86928C] block mt-1">
            Quote primary sources verbatim without subjective defamation or speculation.
          </span>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-[#F0F3F1] flex items-center justify-between">
          <Link
            href="/"
            className="px-4 py-2 text-xs text-[#69746E] hover:text-[#141A17] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit for Peer Review</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-[#69746E] font-mono">Loading form...</div>}>
      <SubmitContent />
    </Suspense>
  );
}
