import { SearchResultItem, PlatformType, PlatformRetrievalStatus, SocialContentType } from '../types';
import { QueryIntent } from '../intentClassifier';

export interface AdapterQueryOptions {
  limit?: number;
  timeRangeDays?: number;
  intent?: QueryIntent;
}

export interface AdapterExecutionResult {
  platform: PlatformType;
  items: SearchResultItem[];
  status: PlatformRetrievalStatus;
  executionTimeMs: number;
}

export interface PlatformSourceAdapter {
  platform: PlatformType;
  name: string;
  sourceCategory: 'news' | 'social_media' | 'forums' | 'official' | 'public_records';
  isEnabled(): boolean;
  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error';
  getAccessLimitations(): string;
  search(query: string, options?: AdapterQueryOptions): Promise<AdapterExecutionResult>;
}

export {
  cleanText,
  cleanSnippet,
  cleanHeadline,
  cleanTimelineEventText
} from '../../utils/textSanitizer';

