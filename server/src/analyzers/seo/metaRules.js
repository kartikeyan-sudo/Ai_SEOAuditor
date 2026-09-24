/**
 * SEO Rules for Meta Description
 */
export const checkMetaRules = (parsedData) => {
  const { metaDescription } = parsedData;
  const rules = [];

  const metaText = metaDescription ? metaDescription.trim() : '';
  const metaExists = Boolean(metaText.length > 0);
  const len = metaText.length;

  if (!metaExists) {
    rules.push({
      id: 'meta-description-missing',
      category: 'onPage',
      name: 'Meta Description Existence',
      status: 'fail',
      severity: 'high',
      score: 0,
      maxScore: 10,
      message: 'The page is missing a meta description tag.',
      recommendation: 'Add a concise <meta name="description"> tag summarizing the page contents to encourage click-throughs from search snippet results.'
    });
    return rules;
  }

  // Meta Description Length Heuristics (120–160 chars recommended)
  if (len < 100) {
    rules.push({
      id: 'meta-description-short',
      category: 'onPage',
      name: 'Meta Description Length',
      status: 'warning',
      severity: 'medium',
      score: 6,
      maxScore: 10,
      message: `Meta description is short (${len} characters). It may not fully summarize page value.`,
      recommendation: 'Expand description to 120–160 characters with clear call-to-actions and targeted keywords.'
    });
  } else if (len >= 100 && len <= 160) {
    rules.push({
      id: 'meta-description-optimal',
      category: 'onPage',
      name: 'Meta Description Length',
      status: 'pass',
      severity: 'info',
      score: 10,
      maxScore: 10,
      message: `Meta description length is in the optimal range (${len} characters).`,
      recommendation: null
    });
  } else {
    rules.push({
      id: 'meta-description-long',
      category: 'onPage',
      name: 'Meta Description Length',
      status: 'warning',
      severity: 'low',
      score: 7,
      maxScore: 10,
      message: `Meta description is long (${len} characters). Search engines may cut off text after 160 characters.`,
      recommendation: 'Keep your description concise (under 160 characters) to ensure the full summary is visible in search snippets.'
    });
  }

  return rules;
};
