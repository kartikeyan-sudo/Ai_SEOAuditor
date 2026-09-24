/**
 * SEO Rules for Page Title (<title>)
 */
export const checkTitleRules = (parsedData) => {
  const { title } = parsedData;
  const rules = [];

  const titleExists = Boolean(title && title.trim().length > 0);
  const titleText = title ? title.trim() : '';
  const len = titleText.length;

  if (!titleExists) {
    rules.push({
      id: 'title-missing',
      category: 'onPage',
      name: 'Page Title Existence',
      status: 'fail',
      severity: 'critical',
      score: 0,
      maxScore: 10,
      message: 'The webpage is missing a <title> element.',
      recommendation: 'Add a unique, descriptive <title> tag in the HTML <head> section to help search engines and users identify your page content.'
    });
    return rules;
  }

  // Title Length Heuristic Rule
  if (len < 30) {
    rules.push({
      id: 'title-length-short',
      category: 'onPage',
      name: 'Title Tag Length',
      status: 'warning',
      severity: 'medium',
      score: 6,
      maxScore: 10,
      message: `Title is short (${len} characters: "${titleText}").`,
      recommendation: 'Expand your title tag to 30–60 characters to include relevant target keywords and clear branding.'
    });
  } else if (len >= 30 && len <= 60) {
    rules.push({
      id: 'title-length-optimal',
      category: 'onPage',
      name: 'Title Tag Length',
      status: 'pass',
      severity: 'info',
      score: 10,
      maxScore: 10,
      message: `Title length is within the recommended 30–60 character range (${len} characters).`,
      recommendation: null
    });
  } else if (len > 60 && len <= 70) {
    rules.push({
      id: 'title-length-slightly-long',
      category: 'onPage',
      name: 'Title Tag Length',
      status: 'warning',
      severity: 'low',
      score: 8,
      maxScore: 10,
      message: `Title is slightly long (${len} characters). It may be truncated in search results on smaller screens.`,
      recommendation: 'Consider shortening the title to under 60 characters so the full title remains visible in search snippets.'
    });
  } else {
    rules.push({
      id: 'title-length-too-long',
      category: 'onPage',
      name: 'Title Tag Length',
      status: 'warning',
      severity: 'medium',
      score: 5,
      maxScore: 10,
      message: `Title is excessively long (${len} characters). Most search engines truncate titles longer than 60–70 characters.`,
      recommendation: 'Trim unnecessary filler words while keeping core keywords near the beginning of the title tag.'
    });
  }

  return rules;
};
