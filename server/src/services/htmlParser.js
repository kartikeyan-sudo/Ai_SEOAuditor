import * as cheerio from 'cheerio';

/**
 * Service to parse HTML content using Cheerio and extract structured SEO elements.
 */
export const parseHtml = (html, finalUrl) => {
  if (!html) {
    throw new Error('No HTML content provided for parsing');
  }

  const $ = cheerio.load(html);

  // Helper to safely resolve relative URLs against page finalUrl
  const resolveUrl = (relative) => {
    if (!relative || typeof relative !== 'string') return null;
    const trimmed = relative.trim();
    if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return trimmed;
    }
    try {
      return new URL(trimmed, finalUrl).href;
    } catch {
      return trimmed;
    }
  };

  // 1. Extract Title
  const title = $('title').first().text().trim() || '';

  // 2. Extract Meta Description
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || 
                           $('meta[property="og:description" i]').attr('content')?.trim() || null;

  // 3. Extract Headings (H1, H2, H3)
  const h1 = [];
  $('h1').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1.push(text);
  });

  const h2 = [];
  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2.push(text);
  });

  const h3 = [];
  $('h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3.push(text);
  });

  // 4. Extract Images with src and alt
  const images = [];
  $('img').each((_, el) => {
    const rawSrc = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt'); // Could be undefined, string, or empty string
    images.push({
      src: resolveUrl(rawSrc) || rawSrc,
      alt: typeof alt === 'string' ? alt.trim() : null,
    });
  });

  // 5. Extract Links with href and text
  const links = [];
  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href');
    const text = $(el).text().trim();
    const resolvedHref = resolveUrl(rawHref);
    if (resolvedHref && !resolvedHref.startsWith('javascript:')) {
      links.push({
        href: resolvedHref,
        text,
      });
    }
  });

  // 6. Extract Canonical Link
  const rawCanonical = $('link[rel="canonical" i]').attr('href')?.trim() || null;
  const canonical = rawCanonical ? resolveUrl(rawCanonical) : null;

  // 7. Extract Language tag
  const lang = $('html').attr('lang')?.trim() || null;

  // 8. Extract Viewport meta tag
  const viewport = $('meta[name="viewport" i]').attr('content')?.trim() || null;

  // 9. Detect potential JavaScript rendering requirement
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const noscriptText = $('noscript').text().toLowerCase();
  const isJsRendered = bodyText.length < 150 || noscriptText.includes('enable javascript') || noscriptText.includes('javascript is required');

  return {
    title,
    metaDescription,
    h1,
    h2,
    h3,
    images,
    links,
    canonical,
    lang,
    viewport,
    isJsRendered,
  };
};
