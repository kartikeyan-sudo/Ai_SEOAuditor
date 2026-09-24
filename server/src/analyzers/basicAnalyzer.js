/**
 * Basic SEO Analyzer
 * Computes deterministic statistics and key metrics from parsed page data.
 */
export const runBasicAnalyzer = (parsedData, finalUrl) => {
  const {
    title,
    metaDescription,
    h1 = [],
    h2 = [],
    h3 = [],
    images = [],
    links = [],
    canonical,
    lang,
    viewport,
    isJsRendered = false,
  } = parsedData;

  // 1. Title Analysis
  const titleExists = Boolean(title && title.length > 0);
  const titleLength = title ? title.length : 0;

  // 2. Meta Description Analysis
  const metaDescExists = Boolean(metaDescription && metaDescription.length > 0);
  const metaDescLength = metaDescription ? metaDescription.length : 0;

  // 3. Headings Analysis
  const h1Count = h1.length;
  const h2Count = h2.length;
  const h3Count = h3.length;

  // 4. Images Analysis
  const totalImages = images.length;
  let withAlt = 0;
  let withoutAlt = 0;

  images.forEach((img) => {
    if (img.alt !== null && img.alt !== undefined && img.alt !== '') {
      withAlt++;
    } else {
      withoutAlt++;
    }
  });

  // 5. Links Analysis (Internal vs External)
  let baseUrlHost = '';
  try {
    baseUrlHost = new URL(finalUrl).hostname.toLowerCase();
  } catch {
    baseUrlHost = '';
  }

  let internalLinks = 0;
  let externalLinks = 0;

  links.forEach((link) => {
    try {
      const linkHost = new URL(link.href).hostname.toLowerCase();
      if (linkHost === baseUrlHost || linkHost.endsWith(`.${baseUrlHost}`)) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      // If href relative or unparseable host, treat as internal if starting with /
      if (link.href && link.href.startsWith('/')) {
        internalLinks++;
      }
    }
  });

  // 6. Canonical Tag Analysis
  const canonicalExists = Boolean(canonical);
  let isCanonicalMatch = false;
  if (canonicalExists && finalUrl) {
    try {
      const cleanCanonical = new URL(canonical).href.replace(/\/$/, '');
      const cleanFinal = new URL(finalUrl).href.replace(/\/$/, '');
      isCanonicalMatch = cleanCanonical === cleanFinal;
    } catch {
      isCanonicalMatch = canonical === finalUrl;
    }
  }

  return {
    title: {
      value: title || null,
      exists: titleExists,
      length: titleLength,
    },
    metaDescription: {
      value: metaDescription || null,
      exists: metaDescExists,
      length: metaDescLength,
    },
    headings: {
      h1Count,
      h2Count,
      h3Count,
      h1List: h1.slice(0, 10), // Limit array preview size
      h2List: h2.slice(0, 10),
    },
    images: {
      total: totalImages,
      withAlt,
      withoutAlt,
      altPercentage: totalImages > 0 ? Math.round((withAlt / totalImages) * 100) : 100,
    },
    links: {
      total: links.length,
      internal: internalLinks,
      external: externalLinks,
    },
    canonical: {
      exists: canonicalExists,
      url: canonical,
      isMatch: isCanonicalMatch,
    },
    lang: lang || null,
    viewport: Boolean(viewport),
    viewportContent: viewport || null,
    isJsRendered,
  };
};
