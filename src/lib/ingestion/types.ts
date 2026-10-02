export type SourceType = 'rss_feed' | 'api' | 'html_registry' | 'press_feed' | 'sitemap';

export interface DiscoverySource {
  id: string;
  slug: string;
  name: string;
  sourceType: SourceType;
  url: string;
  targetRegulator?: 'SEBI' | 'RBI' | 'MCA' | 'General Market';
  organisationId?: string;
  pollIntervalMinutes: number;
  lastPolledAt?: string;
  lastEtag?: string;
  lastModifiedHeader?: string;
  isActive: boolean;
  errorCount: number;
  lastError?: string;
  createdAt: string;
}

export interface IngestedFeedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  url: string;
  canonicalUrl: string;
  title: string;
  author?: string;
  publisher: string;
  publicationDate: string;
  rawExcerpt: string;
  cleanText: string;
  contentHash: string;
}

export interface ExtractedClaimCandidate {
  id: string;
  feedItemId: string;
  sourceUrl: string;
  publisher: string;
  publicationDate: string;
  originalHeadline: string;
  relevantExcerpt: string;
  extractionRationale: string;
  speakerOrSource?: string;
  targetEntitySlug?: string;
  targetEntityName: string;
  targetClaimId?: string;
  claimTitle: string;
  factualStatement: string;
  contextExcerpt: string;
  confidenceScore: number; // 0.0 to 1.0 (internal heuristic signal, NOT proof of truth)
  detectionSignals: string[];
  isPotentialUpdate: boolean;
  isDuplicate: boolean;
  isSyndication?: boolean;
  isContradiction?: boolean;
  contradictionNote?: string;
  similarityToExistingClaim?: number;
  diffSnippet?: string;
  status: 'pending_review' | 'needs_review' | 'rejected_as_boilerplate' | 'approved';
}

export interface IngestionJobReport {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  itemsDiscovered: number;
  itemsExtracted: number;
  claimsIdentified: number;
  duplicatesSkipped: number;
  boilerplateFiltered: number;
  extractedCandidates: ExtractedClaimCandidate[];
  errorLog?: string;
  startedAt: string;
  completedAt?: string;
}
