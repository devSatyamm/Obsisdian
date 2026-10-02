import React from 'react';

export interface ContributorData {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  bio: string;
  contributions: string;
  socials: { name: string; url: string; label: string }[];
}

export const CONTRIBUTORS_LIST: ContributorData[] = [
  {
    id: 'aditya',
    name: 'Aditya Rahul Joshi',
    role: 'Research & Core Architecture',
    initials: 'ARJ',
    avatarBg: 'bg-[#044C4C]',
    avatarColor: 'text-emerald-300',
    bio: 'Core contributor at VERITY focused on research architecture, primary source verification, and developing structured methodologies for tracking corporate and institutional statements.',
    contributions: 'Research & Evidence Framework, Repository Schema Design, Source Provenance Auditing.',
    socials: [
      { name: 'LinkedIn', url: '#', label: 'LinkedIn Profile' },
      { name: 'GitHub', url: '#', label: 'GitHub Profile' },
      { name: 'X / Twitter', url: '#', label: 'X / Twitter Profile' }
    ]
  },
  {
    id: 'kanak',
    name: 'Kanak Pant',
    role: 'Product Engineering & Design',
    initials: 'KP',
    avatarBg: 'bg-[#143D30]',
    avatarColor: 'text-teal-300',
    bio: 'Core contributor at VERITY specializing in product experience, interactive claim diff systems, and intuitive design workflows for transparent auditing.',
    contributions: 'Interactive Diff Engine, Interface Design Systems, Public Timeline Workflows.',
    socials: [
      { name: 'LinkedIn', url: '#', label: 'LinkedIn Profile' },
      { name: 'GitHub', url: '#', label: 'GitHub Profile' },
      { name: 'X / Twitter', url: '#', label: 'X / Twitter Profile' }
    ]
  },
  {
    id: 'satyam',
    name: 'Satyam Mishra',
    role: 'Systems & Intelligence Protocols',
    initials: 'SM',
    avatarBg: 'bg-[#1B3B2F]',
    avatarColor: 'text-green-300',
    bio: 'Core contributor at VERITY leading data systems, cryptographic evidence hashing, and timeline integrity protocols for verified public records.',
    contributions: 'Evidence Vault Architecture, Data Models, Community Review Pipeline.',
    socials: [
      { name: 'LinkedIn', url: '#', label: 'LinkedIn Profile' },
      { name: 'GitHub', url: '#', label: 'GitHub Profile' },
      { name: 'X / Twitter', url: '#', label: 'X / Twitter Profile' }
    ]
  }
];

interface ContributorModalProps {
  contributor: ContributorData | null;
  onClose: () => void;
}

export const ContributorModal: React.FC<ContributorModalProps> = ({ contributor, onClose }) => {
  if (!contributor) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#D8DFDA] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8ECE9] flex items-center justify-between bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#044C4C]"></span>
            <span className="font-bold text-[#141A17] text-sm">Contributor Profile</span>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Header Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#F0F3F1]">
            <div
              className={`w-16 h-16 rounded-2xl ${contributor.avatarBg} ${contributor.avatarColor} font-mono font-bold text-xl flex items-center justify-center border border-[#1C533F] shadow-xs shrink-0`}
            >
              {contributor.initials}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#141A17] leading-tight">
                {contributor.name}
              </h3>
              <div className="text-xs text-[#044C4C] font-semibold mt-0.5">
                {contributor.role}
              </div>
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F7F7] text-[#044C4C] border border-[#D5E2D9]">
                Verified Contributor
              </span>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#86928C]">
              Biography & Background
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed bg-[#F8FAF9] border border-[#E8ECE9] rounded-xl p-3.5">
              {contributor.bio}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#86928C]">
              Focus & Responsibilities
            </div>
            <p className="text-xs text-[#4B534E] leading-relaxed bg-[#F8FAF9] border border-[#E8ECE9] rounded-xl p-3.5">
              {contributor.contributions}
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-mono uppercase font-bold text-[#86928C]">
              Social & Professional Links
            </div>
            <div className="space-y-1.5 text-xs">
              {contributor.socials.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E8ECE9]"
                >
                  <span className="font-bold text-[#141A17]">{s.name}</span>
                  <span className="text-[11px] text-[#044C4C] font-mono">
                    {s.label} ↗
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F8FAF9] border-t border-[#E8ECE9] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#86928C] font-mono">
            VERITY Core Research Team
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#044C4C] hover:bg-[#034343] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
