import React from 'react';

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyDocument {
  title: string;
  category: string;
  summary: string;
  sections: PolicySection[];
}

export const POLICIES_DATA: Record<string, PolicyDocument> = {
  terms: {
    title: 'Terms & Conditions',
    category: 'Legal & Usage Agreement',
    summary: 'Governs access to VERITY repositories, data extraction, citation protocols, and platform conduct.',
    sections: [
      {
        heading: '1. Public Data & Open Attribution',
        body: 'All statement records, timeline revisions, and diff analyses published on VERITY are accessible under open data licensing (CC-BY-4.0). When referencing, citing, or republishing records, users must attribute the relevant primary source exhibits and VERITY repository identifiers.'
      },
      {
        heading: '2. Permitted Use & Disclaimers',
        body: 'VERITY is an open intelligence and archival research service. Platform records represent verbatim historical documentation and do not constitute formal legal counsel, investment advice, or judicial determination.'
      },
      {
        heading: '3. Platform Conduct & Integrity',
        body: 'Users and community contributors agree not to submit fraudulent, malicious, or intentionally tampered evidence archives. Repeated bad-faith proposals result in review suspension.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    category: 'Data Protection & Telemetry',
    summary: 'Explains how contributor data, anonymous submissions, and platform telemetry are collected and safeguarded.',
    sections: [
      {
        heading: '1. Zero-Tracking Philosophy',
        body: 'VERITY is designed with privacy-preserving principles. Browsing and querying repositories requires no account registration, tracking cookies, or commercial ad telemetry.'
      },
      {
        heading: '2. Contribution Anonymity',
        body: 'Contributors may elect to submit statement amendments anonymously. In such cases, only the cryptographic proof hash and submission timestamp are logged on the public timeline.'
      },
      {
        heading: '3. Data Security & Storage',
        body: 'We do not sell, rent, or commercialize user data. All stored records are protected using modern cryptographic standards and encrypted communication protocols.'
      }
    ]
  },
  contribution: {
    title: 'Contribution Guidelines',
    category: 'Editorial & Submission Standards',
    summary: 'Standards and criteria required for proposing new claim statements, historical revisions, and source exhibits.',
    sections: [
      {
        heading: '1. Verbatim Accuracy Mandatory',
        body: 'Submissions must record the exact text, figures, and dates published by the entity without editorial commentary, subjective embellishment, or paraphrasing.'
      },
      {
        heading: '2. Primary Source Mandatory',
        body: 'Every submitted claim must cite an accessible, authoritative primary source. Preferred sources include official filings, Wayback Machine permanent URLs, court documents, or direct corporate press releases.'
      },
      {
        heading: '3. Peer Review Protocol',
        body: 'Submissions enter the public review queue. Two independent contributors must inspect the primary source and confirm wording accuracy before the revision is merged into the public timeline.'
      }
    ]
  },
  source: {
    title: 'Source and Evidence Policy',
    category: 'Evidence Standards & Archival Hygiene',
    summary: 'Requirements for acceptable archival snapshots, regulatory filings, and cryptographic digests.',
    sections: [
      {
        heading: '1. Hierarchy of Evidence',
        body: 'VERITY ranks evidence based on statutory authenticity: Tier 1 comprises government gazettes, court filings, and regulatory circulars; Tier 2 comprises verified corporate exchange filings; Tier 3 comprises authenticated press releases and web archive snapshots.'
      },
      {
        heading: '2. Cryptographic Proof Hashes',
        body: 'Archived exhibits are tagged with unique SHA-256 digests to prevent silent tampering or retrofitted evidence replacement.'
      },
      {
        heading: '3. Redaction of Personal Identifiers',
        body: 'Submissions must redact sensitive private personal data (PII) such as personal phone numbers, physical residential addresses, and private identification numbers.'
      }
    ]
  },
  corrections: {
    title: 'Corrections Policy',
    category: 'Disputes & Rectifications',
    summary: 'Transparent, accountable protocol for handling disputed claims, factual errors, and formal retractions.',
    sections: [
      {
        heading: '1. Transparent Correction Ledger',
        body: 'VERITY never silently deletes or overwrites previous statements. When an error or clarification occurs, a formal revision event is appended with a detailed change summary explaining the rectification.'
      },
      {
        heading: '2. Formal Dispute Submission',
        body: 'Represented organizations or researchers may submit dispute notices accompanied by verifiable documentary evidence. Inquiries receive transparent logging within 48 business hours.'
      },
      {
        heading: '3. Independent Review Board',
        body: 'Disputed records undergo assessment by peer moderators to verify whether the contested text represents a factual transcription error or a legitimate historical statement revision.'
      }
    ]
  }
};

interface PolicyModalProps {
  policyKey: string | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyKey, onClose }) => {
  if (!policyKey) return null;
  const policy = POLICIES_DATA[policyKey] || POLICIES_DATA.terms;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#D8DFDA] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8ECE9] flex items-center justify-between bg-[#F8FAF9] shrink-0">
          <div>
            <span className="text-[10px] font-mono text-[#044C4C] font-bold uppercase tracking-wider">
              {policy.category}
            </span>
            <h3 className="text-base font-bold text-[#141A17]">{policy.title}</h3>
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
          {/* Summary Callout */}
          <div className="bg-[#F0F7F7] border border-[#D5E2D9] rounded-xl p-3.5 space-y-1">
            <div className="font-bold text-[#044C4C] text-[11px] uppercase tracking-wider font-mono">
              Policy Overview:
            </div>
            <p className="text-[#36423C] leading-relaxed">{policy.summary}</p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-4">
            {policy.sections.map((s, idx) => (
              <div
                key={idx}
                className="space-y-1.5 bg-[#FAFBF9] border border-[#E8ECE9] rounded-xl p-4"
              >
                <h4 className="font-bold text-xs text-[#141A17]">{s.heading}</h4>
                <p className="text-xs text-[#525C56] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Governance Notice */}
          <div className="p-3 bg-[#FAFBF9] border border-[#E8ECE9] rounded-xl text-[11px] text-[#637068] font-mono">
            ℹ️ <strong>Governance Notice:</strong> All policies reflect open-access standards and verifiable archival principles.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F8FAF9] border-t border-[#E8ECE9] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#86928C] font-mono">
            VERITY Governance Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#044C4C] hover:bg-[#034343] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
