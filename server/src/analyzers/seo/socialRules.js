import * as cheerio from 'cheerio';

/**
 * SEO Rules for Open Graph & Social Sharing Metadata
 */
export const checkSocialRules = (html) => {
  const rules = [];
  if (!html) return rules;

  const $ = cheerio.load(html);

  // Open Graph Tag Checks
  const ogTitle = $('meta[property="og:title" i]').attr('content')?.trim();
  const ogDesc = $('meta[property="og:description" i]').attr('content')?.trim();
  const ogImage = $('meta[property="og:image" i]').attr('content')?.trim();

  const ogPresent = Boolean(ogTitle || ogDesc || ogImage);

  if (!ogPresent) {
    rules.push({
      id: 'social-og-missing',
      category: 'social',
      name: 'Open Graph Social Metadata',
      status: 'warning',
      severity: 'low',
      score: 1,
      maxScore: 3,
      message: 'No Open Graph social tags (og:title, og:image, og:description) were found.',
      recommendation: 'Add Open Graph meta tags to control visual card previews when your link is shared on social media and chat platforms.'
    });
  } else {
    const missingOgProps = [];
    if (!ogTitle) missingOgProps.push('og:title');
    if (!ogDesc) missingOgProps.push('og:description');
    if (!ogImage) missingOgProps.push('og:image');

    if (missingOgProps.length > 0) {
      rules.push({
        id: 'social-og-partial',
        category: 'social',
        name: 'Open Graph Tag Completeness',
        status: 'warning',
        severity: 'low',
        score: 2,
        maxScore: 3,
        message: `Open Graph metadata is partially present (missing ${missingOgProps.join(', ')}).`,
        recommendation: `Include all core Open Graph tags (${missingOgProps.join(', ')}) for rich social snippet cards.`
      });
    } else {
      rules.push({
        id: 'social-og-complete',
        category: 'social',
        name: 'Open Graph Social Metadata',
        status: 'pass',
        severity: 'info',
        score: 3,
        maxScore: 3,
        message: 'Core Open Graph social tags (og:title, og:description, og:image) are configured.',
        recommendation: null
      });
    }
  }

  // Twitter Card Meta Checks
  const twitterCard = $('meta[name="twitter:card" i]').attr('content')?.trim() ||
                      $('meta[property="twitter:card" i]').attr('content')?.trim();

  if (twitterCard) {
    rules.push({
      id: 'social-twitter-card',
      category: 'social',
      name: 'Twitter Card Metadata',
      status: 'pass',
      severity: 'info',
      score: 2,
      maxScore: 2,
      message: `Twitter Card meta tag is configured ("${twitterCard}").`,
      recommendation: null
    });
  } else {
    rules.push({
      id: 'social-twitter-missing',
      category: 'social',
      name: 'Twitter Card Metadata',
      status: 'info',
      severity: 'info',
      score: 1,
      maxScore: 2,
      message: 'No explicit twitter:card meta tag was found.',
      recommendation: 'Add <meta name="twitter:card" content="summary_large_image"> for enhanced Twitter previews.'
    });
  }

  return rules;
};
