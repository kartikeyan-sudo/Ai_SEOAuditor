import { checkTitleRules } from './titleRules.js';
import { checkMetaRules } from './metaRules.js';
import { checkHeadingRules } from './headingRules.js';
import { checkImageRules } from './imageRules.js';
import { checkLinkRules } from './linkRules.js';
import { checkCanonicalRules } from './canonicalRules.js';
import { checkTechnicalRules } from './technicalRules.js';
import { checkSocialRules } from './socialRules.js';
import { checkCrawlabilityRules } from './crawlabilityRules.js';
import { computeAuditScore } from './scoringEngine.js';

/**
 * Main SEO Rule Engine Orchestrator
 * Executes all modular deterministic rules and computes final score.
 */
export const runSeoRuleEngine = async (parsedData, pageData) => {
  const allRules = [];

  // 1. Run Title Rules
  allRules.push(...checkTitleRules(parsedData));

  // 2. Run Meta Description Rules
  allRules.push(...checkMetaRules(parsedData));

  // 3. Run Heading Rules
  allRules.push(...checkHeadingRules(parsedData));

  // 4. Run Image Rules
  allRules.push(...checkImageRules(parsedData));

  // 5. Run Link Rules
  allRules.push(...checkLinkRules(parsedData, pageData.finalUrl));

  // 6. Run Canonical Rules
  allRules.push(...checkCanonicalRules(parsedData, pageData.finalUrl));

  // 7. Run Technical SEO Rules
  allRules.push(...checkTechnicalRules(parsedData, pageData));

  // 8. Run Social & Open Graph Rules
  allRules.push(...checkSocialRules(pageData.html));

  // 9. Run Crawlability Rules (Async robots.txt & sitemap checks)
  const { rules: crawlRules, crawlData } = await checkCrawlabilityRules(pageData.finalUrl);
  allRules.push(...crawlRules);

  // 10. Calculate Weighted Audit Score and Categorization
  const auditResult = computeAuditScore(allRules);

  return {
    ...auditResult,
    crawlData,
  };
};
