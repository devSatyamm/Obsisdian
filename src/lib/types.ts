export type EntityCategory =
  | 'Algorithmic Trading'
  | 'Forex & CFD Broker'
  | 'Crypto Yield & Staking'
  | 'P2P Lending'
  | 'Advisory & Telegram Tipster'
  | 'Chit Fund & Multi-Level Marketing'
  | 'Regulated Depository & Broker'
  | 'Edtech'
  | 'Financial services'
  | 'Conglomerate'
  | 'Automotive'
  | 'Investment platform'
  | 'Government & regulation'
  | 'Other';

export type RegistrationStatus =
  | 'SEBI Registered'
  | 'RBI Authorized'
  | 'Unregistered'
  | 'Caution Listed by Regulator'
  | 'Revoked / Barred';

export type EvidenceCategory =
  | 'Official Regulatory Order'
  | 'Regulatory Alert List'
  | 'Corporate Registry Record'
  | 'Reputable News Investigation'
  | 'Deceptive Marketing Screenshot'
  | 'Withdrawal Refusal Evidence'
  | 'Contractual Mismatch';

export type VerificationState =
  | 'Official Record Verified'
  | 'Regulatory Action Active'
  | 'Community Corroborated'
  | 'Under Active Investigation'
  | 'Uncorroborated Allegation';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'clarification_needed';

export interface SourceRecord {
  id: string;
  entityId: string;
  title: string;
  sourceName: string;
  sourceType: 'Regulator (SEBI/RBI/MCA)' | 'Corporate Filing' | 'Investigative Press' | 'Court Document' | 'Official Platform Terms';
  url: string;
  publicationDate: string;
  retrievalDate: string;
  archiveUrl?: string;
  snippet: string;
  tier: 1 | 2 | 3 | 4;
}

export interface EvidenceItem {
  id: string;
  entityId: string;
  title: string;
  category: EvidenceCategory;
  description: string;
  sourceId?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  submittedBy: string;
  submittedAt: string;
  verifiedAt?: string;
  verificationState: VerificationState;
  supportingFileUrl?: string;
}

export interface OfficialNotice {
  id: string;
  entityId: string;
  regulator: 'SEBI' | 'RBI' | 'MCA' | 'State Police / EOW';
  orderNumber?: string;
  noticeType: 'Caution Notice' | 'Interim Order' | 'Advisory Warning' | 'Enforcement Action';
  dateIssued: string;
  headline: string;
  summary: string;
  officialPdfUrl?: string;
}

export interface ProfileRevision {
  id: string;
  entityId: string;
  versionNumber: number;
  authorName: string;
  authorRole: 'Senior Moderator' | 'Research Analyst' | 'Verified Contributor';
  timestamp: string;
  summaryOfChange: string;
  moderatedBy: string;
  diffSnippet?: string;
}

/**
 * Claim Version representation
 * Represents an immutable historical statement snapshot.
 */
export interface ClaimVersion {
  id: string;
  claimId: string;
  versionNumber: number;
  statementText: string;
  changeSummary?: string;
  diffSnippet?: string;
  sourceId?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  publicationDate?: string;
  recordedAt: string;
  contributorId?: string;
  contributorName?: string;
  contributorRole?: string;
  moderatedBy?: string;
  reviewState: 'draft' | 'pending' | 'published' | 'rejected';
}

/**
 * Claim representation
 * A claim represents a tracked public assertion made by an organisation.
 */
export interface Claim {
  id: string;
  organisationId: string;
  organisationName?: string;
  organisationSlug?: string;
  title: string;
  category?: string;
  status: 'Verified' | 'Under review' | 'Updated' | 'Clarified' | 'Retracted' | 'Active';
  createdAt: string;
  updatedAt: string;
  currentVersion?: ClaimVersion;
  versions?: ClaimVersion[];
}

export interface EntityProfile {
  id: string;
  slug: string;
  name: string;
  category: EntityCategory;
  aliases: string[];
  website?: string;
  identifiers: {
    cin?: string;
    sebiRegNo?: string;
    rbiRef?: string;
    pan?: string;
    telegramHandles?: string[];
    domainAge?: string;
  };
  registrationStatus: RegistrationStatus;
  verificationBadge: 'Verified Regulatory Record' | 'Official Regulatory Caution' | 'Unregistered Entity' | 'Community Watchlist';
  shortDescription: string;
  executiveSummary: string;
  lastUpdated: string;
  isDemoEntity?: boolean;
  notices: OfficialNotice[];
  sources: SourceRecord[];
  evidence: EvidenceItem[];
  revisions: ProfileRevision[];
  claims?: Claim[];
  timeline: {
    date: string;
    title: string;
    description: string;
    type: 'regulatory' | 'incorporation' | 'allegation' | 'evidence';
  }[];
}

export interface CommunitySubmission {
  id: string;
  entityId?: string;
  claimId?: string;
  entityName: string;
  category: EntityCategory;
  evidenceCategory: EvidenceCategory;
  title: string;
  factualDescription: string;
  proposedStatementText?: string;
  diffSnippet?: string;
  primarySourceUrl: string;
  sourcePublicationDate?: string;
  submittedBy: {
    id: string;
    name: string;
    role: 'Contributor' | 'Researcher';
  };
  submittedAt: string;
  status: ModerationStatus;
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Review & Audit History representation
 * Records formal moderator decisions and audit events.
 */
export interface ModerationAudit {
  id: string;
  submissionId: string;
  reviewerName: string;
  reviewerRole: string;
  action: 'approve' | 'reject' | 'clarification_requested';
  notes?: string;
  resultingRevisionId?: string;
  resultingClaimVersionId?: string;
  timestamp: string;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'contributor' | 'moderator';
  avatarInitials: string;
}
