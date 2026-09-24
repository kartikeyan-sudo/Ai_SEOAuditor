/**
 * SEO Rules for Links & Technical Link Hygiene
 */
export const checkLinkRules = (parsedData, finalUrl) => {
  const { links = [] } = parsedData;
  const rules = [];

  const total = links.length;

  if (total === 0) {
    rules.push({
      id: 'links-none',
      category: 'mediaLinks',
      name: 'Page Link Structure',
      status: 'warning',
      severity: 'medium',
      score: 2,
      maxScore: 5,
      message: 'No <a> hyperlinks were detected on the page.',
      recommendation: 'Add relevant internal navigation links to connect this page with other pages on your site.'
    });
    return rules;
  }

  let emptyAnchorCount = 0;
  let javascriptLinkCount = 0;
  let fragmentLinkCount = 0;

  links.forEach((link) => {
    const href = link.href || '';
    const text = link.text || '';

    if (!text || text.length === 0) {
      emptyAnchorCount++;
    }

    if (href.startsWith('javascript:')) {
      javascriptLinkCount++;
    } else if (href === '#' || href.startsWith('#')) {
      fragmentLinkCount++;
    }
  });

  // Empty Anchor Text Rule
  if (emptyAnchorCount > 0) {
    rules.push({
      id: 'links-empty-anchor',
      category: 'mediaLinks',
      name: 'Link Anchor Text Quality',
      status: 'warning',
      severity: 'low',
      score: Math.max(0, 3 - Math.min(3, Math.ceil(emptyAnchorCount / 5))),
      maxScore: 3,
      message: `${emptyAnchorCount} link(s) on the page lack visible anchor text or accessible labels.`,
      recommendation: 'Ensure all hyperlinks contain descriptive anchor text rather than generic phrasing or unlabelled icons.'
    });
  } else {
    rules.push({
      id: 'links-anchor-text-ok',
      category: 'mediaLinks',
      name: 'Link Anchor Text Quality',
      status: 'pass',
      severity: 'info',
      score: 3,
      maxScore: 3,
      message: 'All detected hyperlinks contain descriptive anchor text or labels.',
      recommendation: null
    });
  }

  // Javascript Pseudo-Links Rule
  if (javascriptLinkCount > 0) {
    rules.push({
      id: 'links-javascript-href',
      category: 'mediaLinks',
      name: 'Technical Link Quality (javascript: href)',
      status: 'warning',
      severity: 'low',
      score: 0,
      maxScore: 2,
      message: `Detected ${javascriptLinkCount} link(s) using "javascript:" pseudo-protocols in href attributes.`,
      recommendation: 'Use standard relative/absolute URLs in href attributes for link navigation and handle interactive behavior with JavaScript event listeners.'
    });
  } else {
    rules.push({
      id: 'links-technical-hygiene',
      category: 'mediaLinks',
      name: 'Technical Link Hygiene',
      status: 'pass',
      severity: 'info',
      score: 2,
      maxScore: 2,
      message: 'All links use clean, standard destination URLs.',
      recommendation: null
    });
  }

  return rules;
};
