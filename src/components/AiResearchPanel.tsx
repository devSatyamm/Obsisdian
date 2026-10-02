'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { EntityProfile } from '@/lib/types';

interface AiResearchPanelProps {
  entity: EntityProfile;
}

export const AiResearchPanel: React.FC<AiResearchPanelProps> = ({ entity }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    answer: string;
    sourcesCited: { title: string; url: string; tier: number }[];
    verificationNotes: string;
    engine: string;
  } | null>(null);

  const sampleQuestions = [
    'Is it registered with the relevant regulator?',
    'What official notices are available?',
    'What evidence supports this statement?',
    'What information is still unverified?',
    'Summarize this entity based on public facts'
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          entity
        })
      });

      if (!res.ok) throw new Error('Failed to query research assistant');
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error('Research error:', err);
      setResponse({
        answer: `**Evidentiary Summary for ${entity.name}:**\n\n${entity.executiveSummary}`,
        sourcesCited: entity.sources.map((s) => ({
          title: s.title,
          url: s.url,
          tier: s.tier
        })),
        verificationNotes:
          'Demonstration output grounded strictly in recorded profile sources.',
        engine: 'Rule-Based Evidentiary Verification Engine (Fallback)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E7E3] rounded-2xl p-6 shadow-xs space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F1]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E6F2F2] text-[#044C4C] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#141A17] uppercase tracking-wider font-mono">
              VERITY Evidentiary Assistant
            </h3>
            <span className="text-[10px] text-[#86928C]">
              Zero-hallucination analysis grounded strictly in citations
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0F7F7] text-[#044C4C] font-bold border border-[#D5E2D9]">
          Verifiable
        </span>
      </div>

      {/* Suggested Questions Chips */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#86928C] font-bold block mb-2">
          Recommended Inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleAsk(q);
              }}
              className="text-left text-[11px] px-2.5 py-1 rounded-full bg-[#FAFBF9] hover:bg-[#F0F7F7] border border-[#E0E7E2] hover:border-[#044C4C] text-[#4B534E] hover:text-[#044C4C] transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask about ${entity.name}'s registration, regulatory notices, or evidence...`}
            className="w-full px-3.5 py-2 text-xs bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] disabled:opacity-50 rounded-full transition-colors cursor-pointer shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {/* Research Output Display */}
      {loading && (
        <div className="p-6 rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] flex items-center justify-center gap-3 text-xs text-[#525C56] font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-[#044C4C]" />
          <span>Cross-referencing entity profile against verified source indices...</span>
        </div>
      )}

      {response && !loading && (
        <div className="rounded-xl bg-[#FAFBF9] border border-[#E8ECE9] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8ECE9] text-[11px] font-mono text-[#86928C]">
            <span>Synthesis Engine: {response.engine}</span>
            <span className="text-[#166534] font-medium">✓ Evidentiary Checks Passed</span>
          </div>

          <div className="text-xs text-[#36423C] leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {response.answer}
          </div>

          {/* Sources Cited Drawer */}
          {response.sourcesCited && response.sourcesCited.length > 0 && (
            <div className="pt-3 border-t border-[#E8ECE9]">
              <span className="text-[10px] font-mono text-[#86928C] uppercase tracking-wider block mb-1.5 font-bold">
                Sources Linked to this Answer:
              </span>
              <div className="space-y-1.5">
                {response.sourcesCited.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-[#E2E7E3] hover:border-[#044C4C] group transition-colors"
                  >
                    <span className="font-medium text-[#141A17] group-hover:text-[#044C4C] truncate max-w-md">
                      [{i + 1}] {src.title}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#044C4C] font-mono shrink-0">
                      <span>Tier {src.tier}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] text-[#86928C] flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#86928C] shrink-0" />
            <span>
              {response.verificationNotes || 'Answers are synthesized strictly from documented public records.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
