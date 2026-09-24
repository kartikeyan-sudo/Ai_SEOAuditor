PHASE 3 — DETERMINISTIC SEO RULE ENGINE + SCORING

Phase 2 is complete. We can now fetch a webpage, parse its HTML with Cheerio, and extract basic SEO information.

Now implement Phase 3.

The goal is to transform the extracted page data into a proper deterministic SEO audit with:

- SEO checks
- Pass / warning / fail status
- Severity
- Explanations
- Recommendations
- Category scores
- Overall score out of 100

IMPORTANT:
Do NOT use an LLM in this phase.
Do NOT use OpenRouter.
Do NOT allow AI to calculate the score.

Everything in this phase must be deterministic and reproducible.

==================================================
1. ARCHITECTURE
==================================================

Create a dedicated SEO rule engine.

Recommended structure:

server/src/
  analyzers/
    basicAnalyzer.js
    seo/
      titleRules.js
      metaRules.js
      headingRules.js
      imageRules.js
      linkRules.js
      canonicalRules.js
      technicalRules.js
      socialRules.js
      crawlabilityRules.js
      seoRuleEngine.js
      scoringEngine.js

Keep individual rules modular.

Do NOT put all SEO logic into one giant file.

==================================================
2. RULE RESULT FORMAT
==================================================

Every SEO rule should return a consistent structure:

{
  id: "title-length",
  category: "on-page",
  name: "Title length",
  status: "pass",
  severity: "info",
  score: 5,
  maxScore: 5,
  message: "Title length is within the recommended range.",
  recommendation: null
}

Possible statuses:

- pass
- warning
- fail
- info

Possible severities:

- critical
- high
- medium
- low
- info

Use "score" and "maxScore" for every scored rule.

==================================================
3. TITLE RULES
==================================================

Create rules for:

A. Missing title

Fail if no title exists.

Recommendation:

"Add a unique, descriptive title element to the page."

B. Very short title

Flag titles that are suspiciously short.

C. Recommended title length

Use a practical heuristic rather than claiming an exact Google requirement.

For example:

30–60 characters = good

61–70 = warning

>70 = warning

Do NOT state that Google strictly requires these exact limits.

D. Empty title

Fail if title exists but contains no meaningful text.

==================================================
4. META DESCRIPTION RULES
==================================================

Check:

A. Missing meta description

Fail.

B. Empty description

Fail.

C. Description length

Use practical heuristics:

~120–160 characters = good

Very short = warning

Very long = warning

Again, describe these as practical guidelines rather than Google's strict requirements.

D. Duplicate title/description if data is available.

==================================================
5. HEADING RULES
==================================================

Check:

A. H1 exists

Fail if missing.

B. Multiple H1s

Warning if more than one H1 exists.

Do NOT claim that multiple H1s automatically cause a ranking penalty.

Explain that a clear primary heading is generally easier to maintain and interpret.

C. Empty H1

Fail.

D. Heading hierarchy

Look for obvious issues such as:

H1 → H3 without H2

H2 → H4 without H3

Do not treat every skipped heading level as a guaranteed SEO failure.

Use "warning" with explanatory language.

E. Empty headings

Detect empty H1/H2/H3 elements.

==================================================
6. IMAGE RULES
==================================================

Check:

A. Total images.

B. Missing alt attributes.

C. Empty alt attributes.

Important distinction:

Missing alt attribute:
<img src="image.jpg">

Empty alt:
<img src="image.jpg" alt="">

Do not automatically mark empty alt as an error because decorative images can legitimately use alt="".

Score meaningful images without alt more seriously where possible.

Report:

totalImages
imagesWithAlt
imagesWithoutAlt
emptyAltImages

==================================================
7. LINK RULES
==================================================

Analyze:

- Internal links
- External links
- Empty href
- Fragment-only links
- Obvious javascript: links

Do NOT claim that having a particular number of links is inherently good or bad.

Focus on technical quality.

If anchor text is available, detect obviously empty anchor text.

==================================================
8. CANONICAL RULES
==================================================

Check:

A. Canonical exists.

B. Canonical is absolute URL.

C. Canonical uses HTTP vs HTTPS consistently with the current page.

D. Multiple canonical tags.

E. Empty canonical.

Return useful findings.

Do NOT assume that missing canonical always means the page is broken.

Use appropriate severity.

==================================================
9. TECHNICAL SEO RULES
==================================================

Check:

A. HTTPS

Pass if HTTPS.

Warning if HTTP.

B. HTML lang attribute

Fail/warning if missing.

C. Viewport meta tag

Fail/warning if missing.

D. Charset

Check whether charset is declared.

E. HTTP status

Pass for normal successful HTML response.

Flag problematic responses.

F. Response time

Record response time.

Do not claim that your server-side fetch time equals Google's real-world Core Web Vitals.

IMPORTANT:

Do NOT calculate:

- LCP
- INP
- CLS

from this basic HTTP request.

Those require browser/user-experience measurement.

==================================================
10. ROBOTS.TXT
==================================================

Use the final URL's origin to check:

/robots.txt

Return:

{
  exists: true,
  statusCode: 200,
  content: "...",
  sitemapReferences: []
}

Rules:

- robots.txt exists → pass/info
- missing → warning

Do NOT say that missing robots.txt automatically prevents indexing.

Also identify:

- User-agent directives
- Disallow directives
- Allow directives
- Sitemap references

==================================================
11. SITEMAP
==================================================

Check:

/sitemap.xml

If unavailable, report warning.

If available:

- status
- content type
- basic XML validity if possible
- number of URLs if easily extractable

Do not claim that every website must have exactly /sitemap.xml.

Some sites may expose sitemaps through robots.txt or other locations.

==================================================
12. OPEN GRAPH
==================================================

Check:

og:title
og:description
og:image
og:url

Return pass/warning information.

Explain that these primarily affect social sharing/previews rather than directly being a general Google ranking factor.

==================================================
13. SOCIAL METADATA
==================================================

Also check:

twitter:card
twitter:title
twitter:description
twitter:image

These should be informational checks.

==================================================
14. SEMANTIC HTML
==================================================

Detect whether the page contains:

<header>
<nav>
<main>
<article>
<section>
<footer>

Do not penalize heavily for missing semantic elements.

Treat them as informational/low severity signals.

==================================================
15. URL QUALITY
==================================================

Analyze the URL.

Check for:

- HTTPS
- excessive query parameters
- obviously malformed URL
- fragment
- very long URL
- encoded characters

Do not claim that long URLs automatically cause ranking penalties.

Use practical warnings.

==================================================
16. SCORE SYSTEM
==================================================

Create a transparent scoring system worth exactly 100 points.

Suggested categories:

Technical SEO       25 points
On-page SEO         30 points
Content Structure   20 points
Images & Links      10 points
Crawlability        10 points
Social Metadata      5 points

Total = 100.

Make this configurable rather than hardcoding random deductions throughout the code.

For example:

const CATEGORY_WEIGHTS = {
  technical: 25,
  onPage: 30,
  content: 20,
  mediaLinks: 10,
  crawlability: 10,
  social: 5
};

Each rule should have a maxScore.

The scoring engine should calculate:

categoryScore
categoryMaxScore
overallScore

Do NOT simply subtract arbitrary points without documenting why.

==================================================
17. SCORE INTERPRETATION
==================================================

Create a score summary.

Example:

90–100:
"Strong technical foundation"

75–89:
"Good foundation with some improvements needed"

50–74:
"Several SEO improvements recommended"

0–49:
"Significant issues detected"

IMPORTANT:

These are YOUR application's internal interpretations.

Do not claim that Google uses these score ranges.

==================================================
18. PRIORITY SYSTEM
==================================================

Each finding should have:

priority:

- critical
- high
- medium
- low
- informational

Prioritize issues based on their practical impact.

Examples:

Missing title → high

Missing H1 → high

Missing alt on one decorative image → low

Missing Open Graph image → low/medium

Missing robots.txt → low/medium

Missing canonical → medium

Do not overstate SEO consequences.

==================================================
19. AUDIT SUMMARY
==================================================

After running all rules, produce:

{
  "score": 82,
  "summary": {
    "passed": 18,
    "warnings": 6,
    "failed": 3,
    "informational": 4
  },
  "categories": {
    "technical": {
      "score": 22,
      "maxScore": 25
    },
    "onPage": {
      "score": 25,
      "maxScore": 30
    }
  },
  "issues": [],
  "passedChecks": []
}

==================================================
20. API RESPONSE
==================================================

Update:

POST /api/audit

The API should now return:

{
  "success": true,
  "data": {
    "page": {...},
    "seo": {...},
    "audit": {
      "score": 82,
      "summary": {...},
      "categories": {...},
      "issues": [...],
      "passedChecks": [...]
    }
  }
}

Keep the raw page extraction separate from the SEO audit.

==================================================
21. FRONTEND DASHBOARD
==================================================

Update the frontend.

Display:

--------------------------------
SEO AUDIT
example.com

82 / 100
Good foundation with some improvements needed
--------------------------------

CATEGORY SCORES

Technical SEO       22/25
On-Page SEO         25/30
Content Structure   17/20
Images & Links       8/10
Crawlability         7/10
Social Metadata      3/5

--------------------------------

CRITICAL / HIGH PRIORITY

❌ Missing meta description
⚠ Multiple H1 elements
⚠ 7 images missing alt text

--------------------------------

PASSED CHECKS

✓ HTTPS enabled
✓ Title exists
✓ H1 exists
✓ Canonical exists
✓ Viewport configured

--------------------------------

DETAILED CHECKS

Use expandable cards or sections.

Each issue should show:

Issue
Severity
Why it matters
Recommendation

==================================================
22. TESTING
==================================================

Test the auditor against at least 3 different websites.

Prefer websites with different SEO structures.

Verify:

- Missing title detection
- Meta description detection
- H1 detection
- Multiple H1 detection
- Missing alt detection
- Canonical detection
- HTTPS detection
- Lang detection
- Viewport detection
- robots.txt
- sitemap
- Open Graph
- Internal/external links
- Score calculation

Also create at least a few small unit tests for individual rules.

==================================================
23. IMPORTANT ACCURACY RULES
==================================================

The auditor must NOT make unsupported claims.

Do NOT say:

"Google penalizes this."

unless there is a strong documented basis.

Prefer:

"This may make the page harder to interpret/share/maintain."

Do not pretend to measure:

- Core Web Vitals
- Google rankings
- backlinks
- keyword rankings
- search volume
- domain authority
- real Google indexing status

Those require additional data sources.

Clearly distinguish:

DETECTED FACT
from
SEO RECOMMENDATION.

==================================================
24. FINAL OUTPUT
==================================================

When Phase 3 is complete, tell me:

1. Files created/modified.
2. All SEO rules implemented.
3. Scoring formula.
4. Example audit response.
5. How to test it.
6. Known limitations.

Do NOT implement OpenRouter yet.

Stop after Phase 3.