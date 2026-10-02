import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions } from './types';
import { SearchResultItem, PlatformRetrievalStatus, SocialEvidenceAnalysis, PlatformType } from '../types';
import { NewsWebSourceAdapter } from './newsWebAdapter';
import { OfficialSourcesAdapter } from './officialSourcesAdapter';
import { RedditSourceAdapter } from './redditAdapter';
import { YouTubeSourceAdapter } from './youtubeAdapter';
import { ForumsSourceAdapter } from './forumsAdapter';
import { XTwitterSourceAdapter } from './xTwitterAdapter';
import { InstagramSourceAdapter } from './instagramAdapter';

export class MultiPlatformAdapterRegistry {
  private adapters: Map<string, PlatformSourceAdapter> = new Map();

  constructor() {
    this.register(new NewsWebSourceAdapter());
    this.register(new OfficialSourcesAdapter());
    this.register(new RedditSourceAdapter());
    this.register(new YouTubeSourceAdapter());
    this.register(new ForumsSourceAdapter());
    this.register(new XTwitterSourceAdapter());
    this.register(new InstagramSourceAdapter());
  }

  register(adapter: PlatformSourceAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  getAdapter(platform: string): PlatformSourceAdapter | undefined {
    return this.adapters.get(platform);
  }

  getAllAdapters(): PlatformSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  async retrieveAll(
    query: string,
    options: AdapterQueryOptions = {}
  ): Promise<{
    items: SearchResultItem[];
    platformStatuses: PlatformRetrievalStatus[];
    socialAnalysis: SocialEvidenceAnalysis;
  }> {
    const promises: Promise<AdapterExecutionResult>[] = [];
    const adapters = this.getAllAdapters().filter((a) => a.isEnabled());

    for (const adapter of adapters) {
      promises.push(adapter.search(query, options));
    }

    const settled = await Promise.allSettled(promises);
    const rawItems: SearchResultItem[] = [];
    const platformStatuses: PlatformRetrievalStatus[] = [];
    const platformsSearched: PlatformType[] = [];

    for (const res of settled) {
      if (res.status === 'fulfilled') {
        const val = res.value;
        rawItems.push(...val.items);
        platformStatuses.push(val.status);
        platformsSearched.push(val.platform);
      }
    }

    // 2. Cross-platform Deduplication & Syndication Analysis
    const seenTitles = new Map<string, SearchResultItem>();
    const seenUrls = new Set<string>();
    const deduplicatedItems: SearchResultItem[] = [];
    let duplicatesCount = 0;

    for (const item of rawItems) {
      const cleanUrl = item.url.split('?')[0].toLowerCase();
      const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (seenUrls.has(cleanUrl)) {
        continue;
      }
      seenUrls.add(cleanUrl);

      // Check title similarity for cross-platform reposts
      if (normTitle.length > 20 && seenTitles.has(normTitle)) {
        const original = seenTitles.get(normTitle)!;
        duplicatesCount++;
        // Keep item but mark as duplicate/repost with reference to canonical original
        if (item.provenance) {
          item.provenance.isDuplicate = true;
          item.provenance.isRepost = true;
          item.provenance.canonicalSourceUrl = original.url;
        }
      } else {
        if (normTitle.length > 20) {
          seenTitles.set(normTitle, item);
        }
      }

      deduplicatedItems.push(item);
    }

    // 3. Social Evidence & Provenance Breakdown
    let eyewitnessCount = 0;
    let officialCount = 0;
    let speculationCount = 0;
    let allegationsCount = 0;
    let newsCount = 0;

    for (const item of deduplicatedItems) {
      switch (item.contentType) {
        case 'firsthand_eyewitness':
          eyewitnessCount++;
          break;
        case 'official_statement':
          officialCount++;
          break;
        case 'user_speculation':
          speculationCount++;
          break;
        case 'unverified_allegation':
          allegationsCount++;
          break;
        case 'news_reporting':
        case 'corroborated_evidence':
          newsCount++;
          break;
      }
    }

    const hasOnlySocialMedia =
      (eyewitnessCount > 0 || speculationCount > 0) &&
      newsCount === 0 &&
      officialCount === 0;

    const socialExclusivityWarning = hasOnlySocialMedia
      ? 'Evidence Limitation: This dossier relies exclusively on social media posts and community discussions. No institutional news or official government corroboration has confirmed these statements.'
      : undefined;

    const socialAnalysis: SocialEvidenceAnalysis = {
      eyewitnessAccountsCount: eyewitnessCount,
      officialStatementsCount: officialCount,
      userSpeculationCount: speculationCount,
      unverifiedAllegationsCount: allegationsCount,
      repostsAndDuplicatesCount: duplicatesCount,
      socialPlatformsSearched: platformsSearched,
      socialExclusivityWarning,
      provenanceSummary: `Multi-platform audit: ${deduplicatedItems.length} sources identified (${newsCount} news reports, ${officialCount} official bulletins, ${eyewitnessCount} eyewitness accounts, ${speculationCount} community discussions). Detected ${duplicatesCount} cross-platform syndications/reposts.`
    };

    return {
      items: deduplicatedItems,
      platformStatuses,
      socialAnalysis
    };
  }
}

// Global registry singleton
export const platformAdapterRegistry = new MultiPlatformAdapterRegistry();
