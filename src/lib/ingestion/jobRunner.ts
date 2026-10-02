import { DiscoverySource, IngestionJobReport, ExtractedClaimCandidate, IngestedFeedItem } from './types';
import { safeFetchPublicContent } from './ssrfGuard';
import { parseFeedContent } from './feedParser';
import { parseSitemapXml, discoverUrlsFromHtml, extractArticleFromHtml } from './contentExtractor';
import { isUrlAllowedByRobots, throttleDomainRequest, getDomainCrawlLimit } from './robotsTxtGuard';
import { extractClaimsFromFeedItem } from './claimExtractor';
import { getDiscoverySources, updateDiscoverySourceStatus } from './discoveryRegistry';
import { repository } from '../db/repository';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '../supabaseServer';

// Concurrency lock tracker: sourceId -> timestamp
const activeJobLocks = new Map<string, number>();

// In-memory job history for monitoring
const inMemoryJobHistory: IngestionJobReport[] = [];

// Content hash cache by canonical URL: canonicalUrl -> contentHash (for changed-page detection)
const knownDocumentHashes = new Map<string, string>();

export function getJobHistory(): IngestionJobReport[] {
  return [...inMemoryJobHistory].reverse();
}

/**
 * Executes safe fetch with exponential backoff retry.
 */
async function fetchWithRetry(
  url: string,
  options: { timeoutMs?: number; etag?: string; lastModified?: string },
  maxRetries = 2
) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await safeFetchPublicContent(url, options);
      if (res.ok || res.notModified || res.status === 400 || res.status === 404) {
        return res;
      }
    } catch {
      // Continue to retry on network exception
    }
    attempt++;
    if (attempt <= maxRetries) {
      const delay = Math.pow(2, attempt) * 400;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return safeFetchPublicContent(url, options);
}

/**
 * Runs an autonomous ingestion job for a configured discovery source.
 * Supports RSS/Atom feeds, Sitemaps, and HTML Registries.
 * Includes robots.txt enforcement, SSRF protections, concurrency locking, and change detection.
 */
export async function runIngestionJobForSource(source: DiscoverySource): Promise<IngestionJobReport> {
  const startedAt = new Date().toISOString();
  const jobId = `job_${Date.now()}_${source.slug}`;

  // 1. Concurrency Lock Protection
  const lockTime = activeJobLocks.get(source.id);
  const now = Date.now();
  if (lockTime && now - lockTime < 3 * 60 * 1000) {
    return {
      id: jobId,
      sourceId: source.id,
      sourceName: source.name,
      status: 'failed',
      itemsDiscovered: 0,
      itemsExtracted: 0,
      claimsIdentified: 0,
      duplicatesSkipped: 0,
      boilerplateFiltered: 0,
      extractedCandidates: [],
      errorLog: `Job execution skipped: Source "${source.name}" is already being processed (concurrency lock active).`,
      startedAt,
      completedAt: new Date().toISOString()
    };
  }

  // Acquire lock
  activeJobLocks.set(source.id, now);

  const report: IngestionJobReport = {
    id: jobId,
    sourceId: source.id,
    sourceName: source.name,
    status: 'running',
    itemsDiscovered: 0,
    itemsExtracted: 0,
    claimsIdentified: 0,
    duplicatesSkipped: 0,
    boilerplateFiltered: 0,
    extractedCandidates: [],
    startedAt
  };

  try {
    // 2. Robots.txt Compliance Check on Root Source URL
    const robotsCheck = await isUrlAllowedByRobots(source.url);
    if (!robotsCheck.isAllowed) {
      report.status = 'failed';
      report.errorLog = `Robots.txt Block: ${robotsCheck.reason}`;
      report.completedAt = new Date().toISOString();
      activeJobLocks.delete(source.id);
      inMemoryJobHistory.push(report);
      return report;
    }

    // 3. Safe fetch with SSRF protection, caching, and retry
    await throttleDomainRequest(source.url);
    const fetchRes = await fetchWithRetry(source.url, {
      timeoutMs: 12000,
      etag: source.lastEtag,
      lastModified: source.lastModifiedHeader
    });

    if (fetchRes.notModified) {
      report.status = 'completed';
      report.completedAt = new Date().toISOString();
      await updateDiscoverySourceStatus(source.id, {
        lastPolledAt: report.completedAt
      });
      activeJobLocks.delete(source.id);
      inMemoryJobHistory.push(report);
      return report;
    }

    if (!fetchRes.ok || !fetchRes.data) {
      report.status = 'failed';
      report.errorLog = fetchRes.error || `Fetch failed with status ${fetchRes.status}`;
      report.completedAt = new Date().toISOString();

      await updateDiscoverySourceStatus(source.id, {
        lastPolledAt: report.completedAt,
        errorCount: (source.errorCount || 0) + 1,
        lastError: report.errorLog
      });

      activeJobLocks.delete(source.id);
      inMemoryJobHistory.push(report);
      return report;
    }

    // 4. Source-Specific Ingestion & Discovery Dispatch
    const feedItems: IngestedFeedItem[] = [];

    if (source.sourceType === 'sitemap') {
      // Parse XML sitemap and discover article URLs
      const sitemapEntries = parseSitemapXml(fetchRes.data);
      report.itemsDiscovered = sitemapEntries.length;

      // Crawl individual discovered URLs with domain limits & polite throttle
      const limit = Math.min(sitemapEntries.length, getDomainCrawlLimit());
      for (let i = 0; i < limit; i++) {
        const entry = sitemapEntries[i];
        const pageAllowed = await isUrlAllowedByRobots(entry.loc);
        if (!pageAllowed.isAllowed) continue;

        await throttleDomainRequest(entry.loc);
        const pageRes = await fetchWithRetry(entry.loc, { timeoutMs: 8000 });
        if (pageRes.ok && pageRes.data) {
          const article = extractArticleFromHtml(pageRes.data, entry.loc, source.name);
          feedItems.push({
            id: `item_${article.contentHash.substring(0, 16)}`,
            sourceId: source.id,
            sourceName: source.name,
            url: article.url,
            canonicalUrl: article.canonicalUrl,
            title: article.headline,
            author: article.author,
            publisher: article.publisher,
            publicationDate: article.publishedDate || entry.lastmod || new Date().toISOString(),
            rawExcerpt: article.rawExcerpt,
            cleanText: article.cleanText,
            contentHash: article.contentHash
          });
        }
      }
    } else if (source.sourceType === 'html_registry') {
      // Discover article URLs from an HTML registry page
      const discoveredUrls = discoverUrlsFromHtml(fetchRes.data, source.url);
      report.itemsDiscovered = discoveredUrls.length;

      const limit = Math.min(discoveredUrls.length, getDomainCrawlLimit());
      for (let i = 0; i < limit; i++) {
        const targetPageUrl = discoveredUrls[i];
        const pageAllowed = await isUrlAllowedByRobots(targetPageUrl);
        if (!pageAllowed.isAllowed) continue;

        await throttleDomainRequest(targetPageUrl);
        const pageRes = await fetchWithRetry(targetPageUrl, { timeoutMs: 8000 });
        if (pageRes.ok && pageRes.data) {
          const article = extractArticleFromHtml(pageRes.data, targetPageUrl, source.name);
          feedItems.push({
            id: `item_${article.contentHash.substring(0, 16)}`,
            sourceId: source.id,
            sourceName: source.name,
            url: article.url,
            canonicalUrl: article.canonicalUrl,
            title: article.headline,
            author: article.author,
            publisher: article.publisher,
            publicationDate: article.publishedDate || new Date().toISOString(),
            rawExcerpt: article.rawExcerpt,
            cleanText: article.cleanText,
            contentHash: article.contentHash
          });
        }
      }
    } else {
      // Default: RSS 2.0 or Atom XML Feed
      const parsedItems = parseFeedContent(fetchRes.data, source.id, source.name);
      report.itemsDiscovered = parsedItems.length;
      feedItems.push(...parsedItems);
    }

    // 5. Extract claims, check for changed content, and filter boilerplate
    const extractedCandidates: ExtractedClaimCandidate[] = [];

    for (const item of feedItems) {
      report.itemsExtracted++;

      // Change detection: compare with known hash for same canonical URL
      const previousHash = knownDocumentHashes.get(item.canonicalUrl || item.url);
      const isChangedContent = previousHash !== undefined && previousHash !== item.contentHash;
      knownDocumentHashes.set(item.canonicalUrl || item.url, item.contentHash);

      const claims = extractClaimsFromFeedItem(item);

      if (claims.length === 0) {
        // Correctly classified as administrative/calendar notice or non-claim text
        report.boilerplateFiltered++;
        continue;
      }

      for (const candidate of claims) {
        if (isChangedContent) {
          candidate.isPotentialUpdate = true;
          candidate.detectionSignals.push('Changed Document Content (Hash Mismatch)');
        }

        if (candidate.isDuplicate && !candidate.isPotentialUpdate) {
          report.duplicatesSkipped++;
        } else {
          report.claimsIdentified++;
          extractedCandidates.push(candidate);

          // 6. Register candidate into staging queue as pending submission for review
          repository.createSubmission({
            entityId: candidate.targetEntitySlug,
            claimId: candidate.targetClaimId,
            entityName: candidate.targetEntityName,
            category: 'Financial services',
            evidenceCategory: candidate.isContradiction
              ? 'Official Regulatory Order'
              : 'Reputable News Investigation',
            title: candidate.claimTitle,
            factualDescription: candidate.factualStatement,
            proposedStatementText: candidate.factualStatement,
            diffSnippet: candidate.diffSnippet,
            primarySourceUrl: candidate.sourceUrl,
            sourcePublicationDate: candidate.publicationDate ? candidate.publicationDate.split('T')[0] : undefined,
            submittedBy: {
              id: 'usr_autonomous_engine',
              name: 'VERITY Autonomous Ingestion Engine',
              role: 'Contributor'
            },
            moderationNotes: `[Autonomous Extraction] Rationale: ${candidate.extractionRationale}. Speaker: ${candidate.speakerOrSource || 'Unspecified'}. Signals: ${candidate.detectionSignals.join(', ')}. Context: ${candidate.contextExcerpt}${candidate.contradictionNote ? ` | Contradiction Note: ${candidate.contradictionNote}` : ''}`
          });

          // Also persist directly to Supabase if connected
          if (isSupabaseServerConfigured) {
            const client = getSupabaseServerClient();
            if (client) {
              try {
                let resolvedOrgId: string | null = null;
                if (candidate.targetEntitySlug) {
                  const { data: orgData } = await client
                    .from('organisations')
                    .select('id')
                    .eq('slug', candidate.targetEntitySlug)
                    .maybeSingle();
                  if (orgData?.id) resolvedOrgId = orgData.id;
                }

                await client.from('community_submissions').insert({
                  organisation_id: resolvedOrgId,
                  claim_id: candidate.targetClaimId && /^[0-9a-f-]{36}$/i.test(candidate.targetClaimId) ? candidate.targetClaimId : null,
                  organisation_name: candidate.targetEntityName || 'Financial Entity',
                  category: 'Financial services',
                  evidence_category: candidate.isContradiction
                    ? 'Official Regulatory Order'
                    : 'Reputable News Investigation',
                  title: candidate.claimTitle,
                  factual_description: candidate.factualStatement,
                  proposed_statement_text: candidate.factualStatement,
                  diff_snippet: candidate.diffSnippet || null,
                  primary_source_url: candidate.sourceUrl,
                  source_publication_date: candidate.publicationDate ? candidate.publicationDate.split('T')[0] : null,
                  submitted_by_id: 'usr_autonomous_engine',
                  submitted_by_name: 'VERITY Autonomous Ingestion Engine',
                  submitted_by_role: 'Contributor',
                  status: candidate.status === 'needs_review' ? 'clarification_needed' : 'pending',
                  moderation_notes: `[Autonomous Extraction] Rationale: ${candidate.extractionRationale}. Speaker: ${candidate.speakerOrSource || 'Unspecified'}. Signals: ${candidate.detectionSignals.join(', ')}. Context: ${candidate.contextExcerpt}${candidate.contradictionNote ? ` | Contradiction Note: ${candidate.contradictionNote}` : ''}`
                });
              } catch (subErr) {
                console.warn('Persist candidate submission to Supabase failed:', subErr);
              }
            }
          }
        }
      }
    }

    report.extractedCandidates = extractedCandidates;
    report.status = 'completed';
    report.completedAt = new Date().toISOString();

    // 7. Update source metadata
    await updateDiscoverySourceStatus(source.id, {
      lastPolledAt: report.completedAt,
      lastEtag: fetchRes.etag,
      lastModifiedHeader: fetchRes.lastModified,
      errorCount: 0,
      lastError: undefined
    });

    // 8. Record in Supabase if configured
    if (isSupabaseServerConfigured) {
      const client = getSupabaseServerClient();
      if (client) {
        try {
          await client.from('ingestion_jobs').insert({
            source_id: source.id,
            source_name: source.name,
            status: 'completed',
            items_discovered: report.itemsDiscovered,
            items_extracted: report.itemsExtracted,
            claims_identified: report.claimsIdentified,
            duplicates_skipped: report.duplicatesSkipped,
            boilerplate_filtered: report.boilerplateFiltered,
            started_at: report.startedAt,
            completed_at: report.completedAt
          });
        } catch (err) {
          console.warn('Record ingestion job in Supabase failed:', err);
        }
      }
    }

    activeJobLocks.delete(source.id);
    inMemoryJobHistory.push(report);
    return report;
  } catch (err: any) {
    report.status = 'failed';
    report.errorLog = err.message || 'Unknown processing error';
    report.completedAt = new Date().toISOString();
    activeJobLocks.delete(source.id);
    inMemoryJobHistory.push(report);
    return report;
  }
}

/**
 * Runs discovery for all active configured sources.
 */
export async function runAllActiveDiscoverySources(): Promise<IngestionJobReport[]> {
  const sources = await getDiscoverySources();
  const activeSources = sources.filter((s) => s.isActive);
  const reports: IngestionJobReport[] = [];

  for (const src of activeSources) {
    const rep = await runIngestionJobForSource(src);
    reports.push(rep);
  }

  return reports;
}
