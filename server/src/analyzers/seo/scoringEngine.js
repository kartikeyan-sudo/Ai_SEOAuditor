/**
 * Configurable Scoring Engine for Deterministic SEO Audit
 * Weights:
 * - Technical SEO: 25 points
 * - On-Page SEO: 30 points
 * - Content Structure: 20 points
 * - Images & Links: 10 points
 * - Crawlability: 10 points
 * - Social Metadata: 5 points
 * Total = 100 points
 */

export const CATEGORY_WEIGHTS = {
  technical: 25,
  onPage: 30,
  content: 20,
  mediaLinks: 10,
  crawlability: 10,
  social: 5
};

export const computeAuditScore = (allRules) => {
  const categoryRawScores = {
    technical: { earned: 0, max: 0 },
    onPage: { earned: 0, max: 0 },
    content: { earned: 0, max: 0 },
    mediaLinks: { earned: 0, max: 0 },
    crawlability: { earned: 0, max: 0 },
    social: { earned: 0, max: 0 },
  };

  // Accumulate raw rule points per category
  allRules.forEach((rule) => {
    const cat = rule.category || 'onPage';
    if (categoryRawScores[cat]) {
      categoryRawScores[cat].earned += rule.score;
      categoryRawScores[cat].max += rule.maxScore;
    }
  });

  // Calculate weighted category scores out of allocated category weight
  const categories = {};
  let overallScore = 0;

  Object.keys(CATEGORY_WEIGHTS).forEach((catKey) => {
    const weight = CATEGORY_WEIGHTS[catKey];
    const raw = categoryRawScores[catKey];

    let score = weight;
    if (raw.max > 0) {
      score = Math.round((raw.earned / raw.max) * weight);
    }

    categories[catKey] = {
      score,
      maxScore: weight,
      rawEarned: raw.earned,
      rawMax: raw.max,
    };

    overallScore += score;
  });

  // Clamp overall score between 0 and 100
  overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

  // Interpretation string
  let interpretation = '';
  if (overallScore >= 90) {
    interpretation = 'Strong technical foundation';
  } else if (overallScore >= 75) {
    interpretation = 'Good foundation with some improvements needed';
  } else if (overallScore >= 50) {
    interpretation = 'Several SEO improvements recommended';
  } else {
    interpretation = 'Significant issues detected';
  }

  // Group rules into passed checks vs prioritized issues
  const passedChecks = allRules.filter(r => r.status === 'pass');
  const issues = allRules.filter(r => r.status === 'warning' || r.status === 'fail');

  // Sort issues by severity priority (critical -> high -> medium -> low)
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  issues.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

  const summaryStats = {
    passed: passedChecks.length,
    warnings: allRules.filter(r => r.status === 'warning').length,
    failed: allRules.filter(r => r.status === 'fail').length,
    informational: allRules.filter(r => r.status === 'info').length,
  };

  return {
    score: overallScore,
    interpretation,
    summary: summaryStats,
    categories,
    issues,
    passedChecks,
  };
};
