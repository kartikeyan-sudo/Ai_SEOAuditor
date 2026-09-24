/**
 * SEO Rules for Heading Hierarchy (H1, H2, H3)
 */
export const checkHeadingRules = (parsedData) => {
  const { h1 = [], h2 = [], h3 = [] } = parsedData;
  const rules = [];

  // 1. H1 Tag Existence & Count
  const h1Count = h1.length;

  if (h1Count === 0) {
    rules.push({
      id: 'h1-missing',
      category: 'content',
      name: 'H1 Primary Heading',
      status: 'fail',
      severity: 'high',
      score: 0,
      maxScore: 10,
      message: 'No <h1> heading element was found on the page.',
      recommendation: 'Include exactly one clear <h1> heading at the top of the main body content to define the page topic.'
    });
  } else if (h1Count === 1) {
    const text = h1[0].trim();
    if (!text) {
      rules.push({
        id: 'h1-empty',
        category: 'content',
        name: 'H1 Heading Content',
        status: 'fail',
        severity: 'high',
        score: 2,
        maxScore: 10,
        message: 'An <h1> tag exists but contains empty or whitespace-only text.',
        recommendation: 'Ensure your <h1> tag contains descriptive, readable text representing the main title of the page.'
      });
    } else {
      rules.push({
        id: 'h1-optimal',
        category: 'content',
        name: 'H1 Primary Heading',
        status: 'pass',
        severity: 'info',
        score: 10,
        maxScore: 10,
        message: `Page has a single clear <h1> heading: "${text}".`,
        recommendation: null
      });
    }
  } else {
    rules.push({
      id: 'h1-multiple',
      category: 'content',
      name: 'Multiple H1 Headings',
      status: 'warning',
      severity: 'medium',
      score: 6,
      maxScore: 10,
      message: `Page contains ${h1Count} separate <h1> headings.`,
      recommendation: 'While HTML5 permits multiple H1 elements, using a single primary <h1> heading per page helps maintain clear document hierarchy and ease of interpretation.'
    });
  }

  // 2. Heading Hierarchy Structure (H1 -> H3 without H2)
  if (h1Count > 0 && h3.length > 0 && h2.length === 0) {
    rules.push({
      id: 'heading-hierarchy-skipped-h2',
      category: 'content',
      name: 'Heading Structure Hierarchy',
      status: 'warning',
      severity: 'low',
      score: 6,
      maxScore: 10,
      message: 'Heading levels jump directly from H1 to H3 without any H2 subheadings.',
      recommendation: 'Nest subheadings logically (H1 -> H2 -> H3) to present a clean outline structure for screen readers and search crawlers.'
    });
  } else {
    rules.push({
      id: 'heading-hierarchy-structure',
      category: 'content',
      name: 'Subheading Hierarchy (H2 / H3)',
      status: 'pass',
      severity: 'info',
      score: 10,
      maxScore: 10,
      message: `Found ${h2.length} H2 subheadings and ${h3.length} H3 subheadings for content organization.`,
      recommendation: null
    });
  }

  return rules;
};
