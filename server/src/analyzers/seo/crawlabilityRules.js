import axios from 'axios';

/**
 * Crawlability & Indexability Rules (robots.txt & sitemap.xml checks)
 */
export const checkCrawlabilityRules = async (finalUrl) => {
  const rules = [];
  
  let origin = '';
  try {
    const urlObj = new URL(finalUrl);
    origin = urlObj.origin;
  } catch {
    rules.push({
      id: 'crawl-robots-error',
      category: 'crawlability',
      name: 'robots.txt Accessibility',
      status: 'warning',
      severity: 'low',
      score: 2,
      maxScore: 5,
      message: 'Could not determine domain origin to check /robots.txt.',
      recommendation: null
    });
    return { rules, crawlData: { robotsTxt: null, sitemapXml: null } };
  }

  const robotsUrl = `${origin}/robots.txt`;
  let robotsTxtData = { exists: false, statusCode: 0, sitemaps: [] };

  // 1. Fetch robots.txt
  try {
    const res = await axios.get(robotsUrl, {
      timeout: 5000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-SEO-Auditor/1.0)'
      }
    });

    if (res.status === 200 && typeof res.data === 'string' && res.data.length > 0) {
      robotsTxtData.exists = true;
      robotsTxtData.statusCode = 200;

      // Scan for Sitemap: directives inside robots.txt
      const sitemapMatches = res.data.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
      if (sitemapMatches) {
        robotsTxtData.sitemaps = sitemapMatches.map(s => s.replace(/Sitemap:\s*/i, '').trim());
      }

      rules.push({
        id: 'crawl-robots-present',
        category: 'crawlability',
        name: 'robots.txt Availability',
        status: 'pass',
        severity: 'info',
        score: 5,
        maxScore: 5,
        message: `robots.txt is available at ${robotsUrl}.`,
        recommendation: null
      });
    } else {
      robotsTxtData.statusCode = res.status;
      rules.push({
        id: 'crawl-robots-missing',
        category: 'crawlability',
        name: 'robots.txt Availability',
        status: 'warning',
        severity: 'low',
        score: 2,
        maxScore: 5,
        message: `No active robots.txt file detected at ${robotsUrl} (HTTP ${res.status}).`,
        recommendation: 'Creating a /robots.txt file clarifies crawling instructions for search engine bots.'
      });
    }
  } catch (err) {
    rules.push({
      id: 'crawl-robots-unreachable',
      category: 'crawlability',
      name: 'robots.txt Availability',
      status: 'warning',
      severity: 'low',
      score: 2,
      maxScore: 5,
      message: `Could not fetch robots.txt (${err.message}).`,
      recommendation: 'Ensure your server resolves /robots.txt requests cleanly.'
    });
  }

  // 2. Fetch sitemap.xml
  const targetSitemapUrl = robotsTxtData.sitemaps.length > 0 ? robotsTxtData.sitemaps[0] : `${origin}/sitemap.xml`;
  let sitemapData = { exists: false, statusCode: 0, url: targetSitemapUrl };

  try {
    const sitemapRes = await axios.get(targetSitemapUrl, {
      timeout: 5000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-SEO-Auditor/1.0)'
      }
    });

    if (sitemapRes.status === 200) {
      sitemapData.exists = true;
      sitemapData.statusCode = 200;

      rules.push({
        id: 'crawl-sitemap-present',
        category: 'crawlability',
        name: 'XML Sitemap Availability',
        status: 'pass',
        severity: 'info',
        score: 5,
        maxScore: 5,
        message: `XML Sitemap detected at ${targetSitemapUrl}.`,
        recommendation: null
      });
    } else {
      sitemapData.statusCode = sitemapRes.status;
      rules.push({
        id: 'crawl-sitemap-missing',
        category: 'crawlability',
        name: 'XML Sitemap Availability',
        status: 'warning',
        severity: 'medium',
        score: 1,
        maxScore: 5,
        message: `XML Sitemap was not found at ${targetSitemapUrl} (HTTP ${sitemapRes.status}).`,
        recommendation: 'Generate and register an XML sitemap (e.g. /sitemap.xml) to assist search engines in discovering all key URLs.'
      });
    }
  } catch (err) {
    rules.push({
      id: 'crawl-sitemap-error',
      category: 'crawlability',
      name: 'XML Sitemap Availability',
      status: 'warning',
      severity: 'medium',
      score: 1,
      maxScore: 5,
      message: `Could not reach XML sitemap at ${targetSitemapUrl}.`,
      recommendation: 'Provide a valid XML sitemap and reference it inside your robots.txt file.'
    });
  }

  return { rules, crawlData: { robotsTxt: robotsTxtData, sitemapXml: sitemapData } };
};
