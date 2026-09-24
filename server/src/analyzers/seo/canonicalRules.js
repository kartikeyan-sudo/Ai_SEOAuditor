/**
 * SEO Rules for Canonical Link Tag (<link rel="canonical">)
 */
export const checkCanonicalRules = (parsedData, finalUrl) => {
  const { canonical } = parsedData;
  const rules = [];

  if (!canonical) {
    rules.push({
      id: 'canonical-missing',
      category: 'onPage',
      name: 'Canonical Tag Existence',
      status: 'warning',
      severity: 'medium',
      score: 5,
      maxScore: 10,
      message: 'No <link rel="canonical"> tag was detected on the page.',
      recommendation: 'Add a self-referencing <link rel="canonical" href="..."> tag to prevent potential duplicate content issues across URL variations.'
    });
    return rules;
  }

  // Check if canonical URL is absolute
  const isAbsolute = /^https?:\/\//i.test(canonical);
  if (!isAbsolute) {
    rules.push({
      id: 'canonical-relative',
      category: 'onPage',
      name: 'Canonical URL Format',
      status: 'warning',
      severity: 'low',
      score: 7,
      maxScore: 10,
      message: `Canonical tag specifies a relative path ("${canonical}").`,
      recommendation: 'Use a full, absolute URL (including https:// domain) in canonical link tags.'
    });
    return rules;
  }

  // Check protocol match (HTTPS page should have HTTPS canonical)
  let pageProtocol = 'https:';
  try {
    pageProtocol = new URL(finalUrl).protocol;
  } catch {}

  let canonicalProtocol = 'https:';
  try {
    canonicalProtocol = new URL(canonical).protocol;
  } catch {}

  if (pageProtocol === 'https:' && canonicalProtocol === 'http:') {
    rules.push({
      id: 'canonical-protocol-mismatch',
      category: 'onPage',
      name: 'Canonical Protocol Consistency',
      status: 'warning',
      severity: 'medium',
      score: 6,
      maxScore: 10,
      message: 'Canonical tag points to insecure http:// while page is served over secure https://.',
      recommendation: 'Update your canonical URL to use https:// to match the secure protocol of the live page.'
    });
    return rules;
  }

  rules.push({
    id: 'canonical-valid',
    category: 'onPage',
    name: 'Canonical Tag Configuration',
    status: 'pass',
    severity: 'info',
    score: 10,
    maxScore: 10,
    message: `Canonical tag correctly points to absolute URL: "${canonical}".`,
    recommendation: null
  });

  return rules;
};
