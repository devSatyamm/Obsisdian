import { URL } from 'url';

const DISALLOWED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254' // Cloud instance metadata service
]);

/**
 * Validates a target URL against SSRF vulnerabilities before fetching.
 * Disallows private networks, localhost, metadata endpoints, and non-web protocols.
 */
export function validateUrlForScraping(targetUrl: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  try {
    const parsed = new URL(targetUrl);

    // 1. Protocol check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: `Disallowed protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Disallowed hostnames check
    if (DISALLOWED_HOSTNAMES.has(hostname)) {
      return { isValid: false, error: `Access to localhost, loopback, or metadata services is strictly blocked.` };
    }

    // 3. IPv4 Private Range Checks
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const [, o1, o2] = ipMatch.map(Number);
      if (
        o1 === 10 || // 10.0.0.0/8
        o1 === 127 || // 127.0.0.0/8
        (o1 === 172 && o2 >= 16 && o2 <= 31) || // 172.16.0.0/12
        (o1 === 192 && o2 === 168) || // 192.168.0.0/16
        (o1 === 169 && o2 === 254) // 169.254.0.0/16 (link-local)
      ) {
        return { isValid: false, error: `Access to private or local IP ranges (${hostname}) is blocked.` };
      }
    }

    return { isValid: true, parsedUrl: parsed };
  } catch (err: any) {
    return { isValid: false, error: `Malformed URL: ${err.message}` };
  }
}

/**
 * Safe fetch wrapper with SSRF validation, polite User-Agent, timeout, and max-size protection.
 */
export async function safeFetchPublicContent(
  targetUrl: string,
  options: {
    timeoutMs?: number;
    maxBytes?: number;
    etag?: string;
    lastModified?: string;
  } = {}
): Promise<{
  ok: boolean;
  status: number;
  data?: string;
  notModified?: boolean;
  etag?: string;
  lastModified?: string;
  contentType?: string;
  error?: string;
}> {
  const { timeoutMs = 10000, maxBytes = 2.5 * 1024 * 1024, etag, lastModified } = options;

  const validation = validateUrlForScraping(targetUrl);
  if (!validation.isValid) {
    return { ok: false, status: 400, error: validation.error };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'User-Agent': 'VERITY-Claim-Intelligence/1.0 (+https://verity-intel.org/bot; contact: transparency@verity-intel.org)',
    Accept: 'application/rss+xml, application/xml, text/xml, text/html, application/xhtml+xml, */*;q=0.8'
  };

  if (etag) headers['If-None-Match'] = etag;
  if (lastModified) headers['If-Modified-Since'] = lastModified;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 304 Not Modified
    if (res.status === 304) {
      return { ok: true, status: 304, notModified: true };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const contentType = res.headers.get('content-type') || '';
    const newEtag = res.headers.get('etag') || undefined;
    const newLastModified = res.headers.get('last-modified') || undefined;

    // Stream length limit check
    const text = await res.text();
    if (text.length > maxBytes) {
      return { ok: false, status: 413, error: `Payload exceeded maximum allowed size of ${maxBytes} bytes.` };
    }

    return {
      ok: true,
      status: res.status,
      data: text,
      etag: newEtag,
      lastModified: newLastModified,
      contentType
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { ok: false, status: 408, error: `Request timed out after ${timeoutMs}ms.` };
    }
    return { ok: false, status: 500, error: err.message || 'Fetch failed' };
  }
}
