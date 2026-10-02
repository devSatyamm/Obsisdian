export type PlatformType =
  | 'news'
  | 'reddit'
  | 'youtube'
  | 'x'
  | 'instagram'
  | 'official'
  | 'forums'
  | 'public_records';

export type SourceCategory =
  | 'news'
  | 'social_media'
  | 'forums'
  | 'official'
  | 'public_records';

export type SocialContentType =
  | 'firsthand_eyewitness'
  | 'official_statement'
  | 'user_speculation'
  | 'repost'
  | 'satire'
  | 'unverified_allegation'
  | 'corroborated_evidence'
  | 'news_reporting';

export interface ContentProvenance {
  platform: PlatformType;
  originalUrl: string;
  author?: string;
  publishedAt?: string;
  retrievedAt: string;
  contentType: SocialContentType;
  isOriginal: boolean;
  isRepost: boolean;
  isDuplicate: boolean;
  canonicalSourceUrl?: string;
  accessRestrictions?: string;
  engagementNote?: string;
}

export interface PlatformRetrievalStatus {
  platform: PlatformType;
  name: string;
  status: 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error';
  itemCount: number;
  message?: string;
  documentationUrl?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  publishedAt?: string;
  sourceProvider: 'google_news' | 'duckduckgo' | 'tavily' | 'brave' | 'direct_fetch' | 'reddit' | 'youtube' | 'x' | 'instagram' | 'forums' | 'official';
  platform?: PlatformType;
  sourceCategory?: SourceCategory;
  contentType?: SocialContentType;
  provenance?: ContentProvenance;
  author?: string;
  extractedBody?: string;
  contentFetched?: boolean;
  relevanceScore?: number;
  relevanceRationale?: string;
  entityMatched?: boolean;
  predicateMatched?: boolean;
  supportsPart?: string;
  directlyAnswers?: boolean;
  publisherDomain?: string;
  isWireSyndicated?: boolean;
  wireService?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  event: string;
  source: string;
  sourceUrl: string;
}

export type ClaimVerificationCategory =
  | 'confirmed_fact'
  | 'reported_statement'
  | 'disputed_claim'
  | 'inference_or_prediction'
  | 'unverified_rumor';

export interface EvidenceLinkedClaim {
  id: string;
  statement: string;
  speakerOrSource: string;
  category: ClaimVerificationCategory;
  supportingExcerpt: string;
  sourceUrl: string;
  publisher: string;
  publishedAt?: string;
  confidenceScore: number;
  isContradiction?: boolean;
  contradictionNote?: string;
}

export interface DiscrepancyItem {
  id: string;
  topic: string;
  claimA: string;
  sourceA: string;
  claimB: string;
  sourceB: string;
  analysis: string;
}

export interface FactVerificationBreakdown {
  confirmed: string[];
  reported: string[];
  disputed: string[];
  unknown: string[];
}

export interface DatabaseCrossReference {
  isNewIncident: boolean;
  matchedEntity?: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  matchedClaims: Array<{
    id: string;
    statement: string;
    version: string;
    similarity: number;
  }>;
  comparisonNotes: string;
  stagedCandidateId?: string;
}

export type AssessmentLabel =
  | 'Supported'
  | 'Likely supported'
  | 'Mixed evidence'
  | 'Likely unsupported'
  | 'Unsupported'
  | 'Insufficient evidence';

export type EvidenceSupportBand =
  | 'Very strong supporting evidence (90–100)'
  | 'Strong supporting evidence (75–89)'
  | 'Moderate supporting evidence (60–74)'
  | 'Mixed or inconclusive evidence (40–59)'
  | 'Limited supporting evidence (20–39)'
  | 'Very little supporting evidence (0–19)'
  | 'Insufficient evidence (Unable to assess)';

export interface DataCompletenessIndicator {
  score: number; // 0 to 100%
  rating: 'Complete' | 'Substantial' | 'Partial' | 'Sparse';
  retrievedDimensions: string[];
  missingDimensions: string[];
}

export interface SubClaimAssessment {
  id: string;
  claimType: 'occurrence' | 'cause_or_trigger' | 'institutional_action' | 'specific_statement';
  claimStatement: string;
  assessmentLabel: AssessmentLabel;
  supportScore: number | null;
  statusSummary: string;
  officialConfirmation: boolean;
}

export interface EvidencePassage {
  passage: string;
  sourceTitle: string;
  publisher: string;
  url: string;
  publicationDate?: string;
}

export interface ScoringFactorContribution {
  factor?: string;
  factorKey?: string;
  name?: string;
  factorName?: string;
  pointsAwarded?: number;
  pointsContributed?: number;
  maxPoints: number;
  rationale: string;
  contributingSourceIds?: string[];
}

export interface OriginAuditItem {
  origin?: string;
  publisher?: string;
  publisherName?: string;
  domain?: string;
  isWireService?: boolean;
  isSyndicatedWire?: boolean;
  wireService?: string;
  articleCount?: number;
  sampleTitle?: string;
  effectiveContribution?: number;
}

export interface PassageAuditItem {
  sourceId?: string;
  sourceTitle?: string;
  passage?: string;
  passageSnippet?: string;
  publisher?: string;
  domain?: string;
  weight?: 'primary_corroboration' | 'secondary_context' | 'discrepancy_signal';
  relevanceToQuery?: number;
  attributedSubClaim?: string;
}

export interface EvidenceAuditTrail {
  assessedAt?: string;
  factorContributions?: ScoringFactorContribution[];
  scoringFactors?: ScoringFactorContribution[];
  rawScoreBeforeCaps?: number;
  totalRawScore?: number;
  appliedCapsOrPenalties?: string[];
  capsApplied?: string[];
  penaltiesApplied?: string[];
  finalScore: number | null;
  independentOriginBreakdown?: OriginAuditItem[];
  independentOriginsList?: OriginAuditItem[];
  primaryPassagesUsed?: PassageAuditItem[];
  primaryPassages?: PassageAuditItem[];
  scoringFormulaExplanation?: string;
}

export interface AssessmentRevision {
  revisionId: string;
  claimId?: string;
  versionNumber?: number;
  timestamp: string;
  previousAssessmentLabel: AssessmentLabel | null;
  newAssessmentLabel: AssessmentLabel;
  previousScore: number | null;
  newScore: number | null;
  previousIndependentOrigins: number;
  newIndependentOrigins: number;
  sourcesAddedCount: number;
  whatChangedRationale: string;
  triggerEvent: 'initial_synthesis' | 'new_sources_discovered' | 'contradiction_detected' | 'official_statement_added';
}

export interface EvidenceHealthMonitoring {
  status: 'healthy' | 'warning' | 'degraded';
  warnings: string[];
  staleSourceCount: number;
  providerFailures: string[];
  missingEvidenceDimensions: string[];
  attributionConfidence: number; // 0-100%
}

export interface AIEvidenceAssessment {
  originalQuestion?: string;
  assessmentLabel: AssessmentLabel;
  evidenceSupportScore: number | null; // 0 to 100, or null if Insufficient evidence
  evidenceSupportBand?: EvidenceSupportBand;
  aiConfidenceIndicator: {
    score: number; // 0 to 100
    rating: 'High' | 'Moderate' | 'Low' | 'Insufficient';
    rationale: string;
  };
  dataCompleteness?: DataCompletenessIndicator;
  subClaimAssessments?: SubClaimAssessment[];
  wireSyndicationDetails?: {
    syndicatedCount: number;
    originalReportingCount: number;
    identifiedWires: string[];
  };
  auditTrail?: EvidenceAuditTrail;
  revisionHistory?: AssessmentRevision[];
  directAnswer: string;
  conciseExplanation: string;
  strongestSupportingEvidence: EvidencePassage[];
  strongestContradictingEvidence: EvidencePassage[];
  unknownsAndLimitations?: string[];
  detectedIntent?: string;
  relevanceGatePassed?: boolean;
  sourceCount: number;
  independentSourceCount: number;
  lastAnalysisTimestamp: string;
  methodologyNotes: string;
}

export type CommunityVoteOption = 'true' | 'false' | 'partially_true' | 'insufficient_evidence';

export interface ClaimPollOptionStats {
  count: number;
  percentage: number;
}

export interface ClaimPollData {
  pollId: string;
  claimId: string;
  claimVersion: number;
  claimStatement: string;
  totalVotes: number;
  options: {
    true: ClaimPollOptionStats;
    false: ClaimPollOptionStats;
    partially_true: ClaimPollOptionStats;
    insufficient_evidence: ClaimPollOptionStats;
  };
  userVote?: CommunityVoteOption | null;
  status: 'active' | 'archived' | 'superseded';
  policyNote: string;
}

export interface SocialEvidenceAnalysis {
  eyewitnessAccountsCount: number;
  officialStatementsCount: number;
  userSpeculationCount: number;
  unverifiedAllegationsCount: number;
  repostsAndDuplicatesCount: number;
  socialPlatformsSearched: PlatformType[];
  socialExclusivityWarning?: string;
  provenanceSummary: string;
}

export interface LiveIntelligenceReport {
  query: string;
  searchedAt: string;
  aiAssessment: AIEvidenceAssessment;
  claimPoll: ClaimPollData;
  topicSummary: string;
  incidentStatus: 'developing' | 'confirmed' | 'reported' | 'disputed' | 'historical';
  timeline: TimelineEvent[];
  keyClaims: EvidenceLinkedClaim[];
  discrepancies: DiscrepancyItem[];
  breakdown: FactVerificationBreakdown;
  evidenceStrength: 'High (Multiple Corroborating Primary Outlets)' | 'Moderate (Reputable Media Reports)' | 'Developing / Limited (Few Single Sources)';
  sourceDiversityScore: number; // 0 to 100
  sources: SearchResultItem[];
  platformStatuses?: PlatformRetrievalStatus[];
  socialAnalysis?: SocialEvidenceAnalysis;
  databaseComparison: DatabaseCrossReference;
  searchDurationMs: number;
  healthMonitoring?: EvidenceHealthMonitoring;
}
