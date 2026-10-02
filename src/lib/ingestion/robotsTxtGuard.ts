import { URL } from 'url';
import { safeFetchPublicContent } from './ssrfGuard';

interface RobotsRules {
  disallowedPaths: string[];
  crawlDelayMs: number;
  fetchedAt: number;
}

// In-memory cache for robots.txt rules by origin (e.g. 'https://www.rbi.org.in')
const robotsCache = new Map<string, RobotsRules>();

// Domain request throttle timestamps to enforce polite crawling
const domainLastRequest = new Map<string, number>();

const ROBOTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_DOMAIN_DELAY_MS = 500; // 500ms between consecutive requests to same host
const MAX_URLS_PER_DOMAIN_CYCLE = 15; // Max URLs crawled per domain per ingestion cycle

/**
 * Parses raw robots.txt content into disallow rules and crawl delay for VERITY crawler.
 */
export function parseRobotsTxt(content: string): { disallowedPaths: string[]; crawlDelayMs: number } {
  const lines = content.split('\n');
  const disallowedPaths: string[] = [];
  let crawlDelayMs = 0;
  let appliesToVerity = false;
  let inRelevantBlock = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const lower = line.toLowerCase();

    if (lower.startsWith('user-agent:')) {
      const agent = line.substring(11).trim().toLowerCase();
      if (agent === '*' || agent === 'verity' || agent.includes('verity-claim-intelligence')) {
        inRelevantBlock = true;
        appliesToVerity = true;
      } else {
        inRelevantBlock = false;
      }
      continue;
    }

    if (inRelevantBlock) {
      if (lower.startsWith('disallow:')) {
        const path = line.substring(9).trim();
        if (path) {
          disallowedPaths.push(path);
        }
      } else if (lower.startsWith('crawl-delay:')) {
        const sec = parseFloat(line.substring(12).trim());
        if (!isNaN(sec) && sec > 0) {
          crawlDelayMs = Math.min(sec * 1000, 10000); // cap at 10s
        }
      }
    }
  }

  return { disallowedPaths, crawlDelayMs };
}

/**
 * Checks if a specific target URL is allowed to be crawled according to robots.txt.
 */
export async function isUrlAllowedByRobots(targetUrl: string): Promise<{ isAllowed: boolean; reason?: string }> {
  try {
    const parsed = new URL(targetUrl);
    const origin = parsed.origin;
    const path = parsed.pathname || '/';

    const now = Date.now();
    let rules = robotsCache.get(origin);

    if (!rules || now - rules.fetchedAt > ROBOTS_CACHE_TTL_MS) {
      // Fetch robots.txt safely
      const robotsUrl = `${origin}/robots.txt`;
      const res = await safeFetchPublicContent(robotsUrl, { timeoutMs: 5000 });

      if (res.ok && res.data) {
        const parsedRules = parseRobotsTxt(res.data);
        rules = {
          disallowedPaths: parsedRules.disallowedPaths,
          crawlDelayMs: parsedRules.crawlDelayMs || DEFAULT_DOMAIN_DELAY_MS,
          fetchedAt: now
        };
      } else {
        // If 404 or missing, treat as allowed
        rules = {
          disallowedPaths: [],
          crawlDelayMs: DEFAULT_DOMAIN_DELAY_MS,
          fetchedAt: now
        };
      }
      robotsCache.set(origin, rules);
    }

    // Check path against disallow rules
    for (const disallow of rules.disallowedPaths) {
      if (disallow === '/' || path.startsWith(disallow)) {
        return {
          isAllowed: false,
          reason: `Path disallowed by robots.txt directive: "${disallow}"`
        };
      }
    }

    return { isAllowed: true };
  } catch (err: any) {
    // If URL is invalid, block safely
    return { isAllowed: false, reason: `URL evaluation error: ${err.message}` };
  }
}

/**
 * Polite domain throttling: enforces crawl delay between requests to the same domain.
 */
export async function throttleDomainRequest(targetUrl: string): Promise<void> {
  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.hostname;
    const now = Date.now();

    const lastReq = domainLastRequest.get(domain) || 0;
    const cachedRules = robotsCache.get(parsed.origin);
    const delay = cachedRules?.crawlDelayMs || DEFAULT_DOMAIN_DELAY_MS;

    const timeSinceLast = now - lastReq;
    if (timeSinceLast < delay) {
      const waitTime = delay - timeSinceLast;
      await new Promise((r) => setTimeout(r, waitTime));
    }

    domainLastRequest.set(domain, Date.now());
  } catch {
    // Continue if URL parsing fails
  }
}

export function getDomainCrawlLimit(): number {
  return MAX_URLS_PER_DOMAIN_CYCLE;
}
