async function test() {
  const query = 'Smith Dubai airline incident';
  console.log('Query:', query);

  // 1. Google News Search
  const gNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const gRes = await fetch(gNewsUrl);
  const gXml = await gRes.text();
  const gItems = [...gXml.matchAll(/<item>[\s\S]*?<\/item>/g)].map(m => m[0]);
  console.log('Google News results:', gItems.length);
  if (gItems.length > 0) {
    const first = gItems[0];
    const title = first.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const source = first.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1];
    const date = first.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
    const link = first.match(/<link>([\s\S]*?)<\/link>/)?.[1];
    console.log({ title, source, date, link });
  }

  // 2. DuckDuckGo HTML
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const ddgRes = await fetch(ddgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const ddgHtml = await ddgRes.text();
  const snippets = [...ddgHtml.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const titles = [...ddgHtml.matchAll(/class="result__title"[\s\S]*?<a[^>]*class="result__url"[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('DDG snippets found:', snippets.length);
  if (snippets.length > 0) {
    console.log('First DDG snippet:', snippets[0]);
  }
}

test().catch(console.error);
