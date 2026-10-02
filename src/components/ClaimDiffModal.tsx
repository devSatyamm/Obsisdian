import React, { useState } from 'react';

export interface ClaimDiffData {
  id: string;
  orgName: string;
  title: string;
  date: string;
  prevStatement: string;
  currStatement: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  status?: string;
}

interface ClaimDiffModalProps {
  claim: ClaimDiffData | null;
  onClose: () => void;
}

export const ClaimDiffModal: React.FC<ClaimDiffModalProps> = ({ claim, onClose }) => {
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');

  if (!claim) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#D8DFDA] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8ECE9] flex items-center justify-between bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F2] text-[#044C4C] flex items-center justify-center font-bold text-sm">
              ⇄
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#141A17]">{claim.title}</h3>
              <span className="text-[11px] text-[#69746E]">
                {claim.orgName} • Recorded {claim.date}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-[#EAEFEA] hover:bg-[#DDE5E0] text-[#141A17] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Summary */}
          <div className="bg-[#FAFBF9] border border-[#E8ECE9] rounded-xl p-4 space-y-1 font-mono">
            <div className="text-[10px] text-[#86928C] uppercase font-bold tracking-wider">
              Summary of alteration:
            </div>
            <p className="text-[#36423C] text-xs leading-relaxed">{claim.summary}</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#141A17]">Statement Comparison</div>
            <div className="flex items-center gap-1 bg-[#F0F4F1] p-1 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-[#044C4C] font-bold shadow-2xs'
                    : 'text-[#69746E] hover:text-[#141A17]'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('inline')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'inline'
                    ? 'bg-white text-[#044C4C] font-bold shadow-2xs'
                    : 'text-[#69746E] hover:text-[#141A17]'
                }`}
              >
                Unified Diff
              </button>
            </div>
          </div>

          {/* Diff View Box */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Previous Version */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-[#F0F3F1]">
                  <span className="font-bold text-[#991B1B]">Previous Statement (Recorded)</span>
                  <span className="text-[#86928C]">Prior</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#7F1D1D] leading-relaxed font-mono">
                  &ldquo;{claim.prevStatement}&rdquo;
                </div>
              </div>

              {/* Revised Version */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-[#F0F3F1]">
                  <span className="font-bold text-[#166534]">Revised Statement (Active)</span>
                  <span className="text-[#86928C]">Current</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-[#14532D] leading-relaxed font-mono">
                  &ldquo;{claim.currStatement}&rdquo;
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-[#F0F3F1]">
                <span className="font-bold text-[#141A17]">Unified Revision Walkthrough</span>
                <span className="text-[#86928C]">Word Highlights</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] text-[#141A17] space-y-2 leading-relaxed font-mono">
                <div className="text-[#991B1B] bg-[#FEE2E2] p-2.5 rounded-lg border border-[#FECACA]">
                  <span className="font-bold text-[10px] uppercase block mb-0.5 tracking-wider text-[#991B1B]">
                    – Deleted prior wording:
                  </span>
                  &ldquo;{claim.prevStatement}&rdquo;
                </div>
                <div className="text-[#166534] bg-[#DCFCE7] p-2.5 rounded-lg border border-[#BBF7D0]">
                  <span className="font-bold text-[10px] uppercase block mb-0.5 tracking-wider text-[#166534]">
                    + Inserted replacement statement:
                  </span>
                  &ldquo;{claim.currStatement}&rdquo;
                </div>
              </div>
            </div>
          )}

          {/* Primary Evidence & Source Footnote */}
          <div className="pt-2 border-t border-[#F0F3F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#044C4C]"></span>
              <span className="text-[#69746E]">
                Primary Source:{' '}
                <strong className="text-[#141A17]">{claim.source}</strong>
              </span>
            </div>
            {claim.sourceUrl && (
              <a
                href={claim.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#044C4C] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Inspect Source Archive</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F8FAF9] border-t border-[#E8ECE9] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#86928C] font-mono">
            VERITY Verified Record Audit
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#044C4C] hover:bg-[#034343] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
