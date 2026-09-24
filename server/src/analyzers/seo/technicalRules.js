/**
 * SEO Rules for Technical HTML & Page Delivery Signals
 */
export const checkTechnicalRules = (parsedData, pageData) => {
  const { lang, viewport } = parsedData;
  const { finalUrl, statusCode } = pageData;
  const rules = [];

  // 1. HTTPS Protocol Check
  const isHttps = finalUrl.toLowerCase().startsWith('https://');
  if (isHttps) {
    rules.push({
      id: 'tech-https-enabled',
      category: 'technical',
      name: 'HTTPS Security Encryption',
      status: 'pass',
      severity: 'info',
      score: 7,
      maxScore: 7,
      message: 'The website is securely delivered over an encrypted HTTPS connection.',
      recommendation: null
    });
  } else {
    rules.push({
      id: 'tech-https-missing',
      category: 'technical',
      name: 'HTTPS Security Encryption',
      status: 'fail',
      severity: 'high',
      score: 0,
      maxScore: 7,
      message: 'The webpage is delivered over an insecure HTTP connection.',
      recommendation: 'Migrate your website to HTTPS by installing an SSL/TLS certificate to ensure secure user communication.'
    });
  }

  // 2. Viewport Meta Tag (Mobile Responsiveness Signal)
  if (viewport) {
    rules.push({
      id: 'tech-viewport-present',
      category: 'technical',
      name: 'Viewport Mobile Optimization',
      status: 'pass',
      severity: 'info',
      score: 6,
      maxScore: 6,
      message: `Viewport meta tag is configured ("${viewport}").`,
      recommendation: null
    });
  } else {
    rules.push({
      id: 'tech-viewport-missing',
      category: 'technical',
      name: 'Viewport Mobile Optimization',
      status: 'fail',
      severity: 'high',
      score: 0,
      maxScore: 6,
      message: 'Missing <meta name="viewport"> tag.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> so the page renders appropriately on mobile devices.'
    });
  }

  // 3. HTML lang Attribute
  if (lang && lang.trim().length > 0) {
    rules.push({
      id: 'tech-lang-attribute',
      category: 'technical',
      name: 'HTML Language Declaration',
      status: 'pass',
      severity: 'info',
      score: 6,
      maxScore: 6,
      message: `HTML lang attribute is specified ("${lang}").`,
      recommendation: null
    });
  } else {
    rules.push({
      id: 'tech-lang-missing',
      category: 'technical',
      name: 'HTML Language Declaration',
      status: 'warning',
      severity: 'medium',
      score: 0,
      maxScore: 6,
      message: 'The <html> element is missing a lang attribute (e.g. lang="en").',
      recommendation: 'Specify the primary language in your HTML tag (e.g., <html lang="en">) to assist screen readers and language identification.'
    });
  }

  // 4. HTTP Status Code Check
  if (statusCode === 200) {
    rules.push({
      id: 'tech-http-status-200',
      category: 'technical',
      name: 'HTTP Response Status',
      status: 'pass',
      severity: 'info',
      score: 6,
      maxScore: 6,
      message: 'Server responded with HTTP 200 OK success status.',
      recommendation: null
    });
  } else {
    rules.push({
      id: 'tech-http-status-non200',
      category: 'technical',
      name: 'HTTP Response Status',
      status: 'warning',
      severity: 'medium',
      score: 2,
      maxScore: 6,
      message: `Server returned HTTP status code ${statusCode}.`,
      recommendation: 'Ensure your target pages resolve directly with a clean HTTP 200 OK response without unnecessary redirect chains.'
    });
  }

  return rules;
};
