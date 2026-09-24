You are a senior full-stack engineer and AI automation architect.

Build a production-quality MVP called "AI SEO Auditor".

GOAL
----
Create a web application where a user enters a public website URL. The application crawls/analyzes that page, performs deterministic SEO checks, sends the structured findings to an LLM through OpenRouter, and displays an actionable SEO audit report.

IMPORTANT ARCHITECTURE PRINCIPLE
---------------------------------
DO NOT send the entire website HTML to the LLM.

The application must first extract structured SEO data using deterministic code. The LLM should only receive the structured findings and provide interpretation, prioritization, explanations, and recommendations.

TECH STACK
----------
Frontend:
- React
- Vite
- Tailwind CSS
- Modern responsive dashboard UI

Backend:
- Node.js
- Express.js
- JavaScript
- Cheerio for HTML parsing
- Axios or native fetch for HTTP requests

Database:
- NeonDB

AI:
- OpenRouter API
- Use model: "openrouter/free"
- API key must be stored in environment variables
- NEVER expose OPENROUTER_API_KEY to the frontend

Do NOT use Next.js unless there is a strong architectural reason. Keep the project simple enough to run locally easily.

CORE USER FLOW
--------------
1. User opens the application.
2. User enters a website URL.
3. User clicks "Audit Website".
4. Frontend sends the URL to the backend.
5. Backend validates and normalizes the URL.
6. Backend fetches the website HTML.
7. Cheerio parses the HTML.
8. Backend performs deterministic SEO analysis.
9. Backend calculates a technical SEO score.
10. Backend creates a structured JSON representation of the findings.
11. Backend sends ONLY that structured JSON to OpenRouter.
12. LLM analyzes the findings.
13. Backend validates the LLM response.
14. Audit result is stored in MongoDB.
15. Frontend displays the complete report.

SEO CHECKS
----------
Implement these checks:

1. Title
   - Does title exist?
   - Title length
   - Empty title
   - Extremely long title
   - Extremely short title

2. Meta description
   - Does it exist?
   - Character length
   - Missing description
   - Too short/long description

3. Headings
   - H1 exists
   - Number of H1 tags
   - Empty H1
   - H2/H3 hierarchy
   - Detect obvious heading structure problems

4. Images
   - Count images
   - Images with alt attributes
   - Images missing alt attributes
   - Empty alt attributes
   - Report percentage of images with alt text

5. Links
   - Internal links
   - External links
   - Links without useful anchor text where detectable
   - Detect obvious broken internal links where practical

6. Canonical
   - Canonical tag exists
   - Canonical URL
   - Detect obvious malformed canonical URL

7. Robots
   - Check /robots.txt
   - Detect whether robots.txt exists
   - Extract relevant directives

8. Sitemap
   - Check /sitemap.xml
   - Detect whether sitemap exists
   - Report its availability

9. URL
   - HTTPS
   - URL structure
   - Detect obvious unnecessary query parameters

10. HTML/semantic structure
   - lang attribute
   - viewport meta tag
   - semantic HTML elements such as header, nav, main, article, footer where detectable

11. Open Graph
   - og:title
   - og:description
   - og:image
   - og:url

12. Basic technical signals
   - HTTP status code
   - redirect information
   - response time
   - content type

IMPORTANT:
The application should clearly distinguish between:
- checks that can be reliably determined from fetched HTML/HTTP
- checks that require browser rendering or deeper crawling

Do not pretend to measure things that cannot actually be measured.

SCORING SYSTEM
--------------
Create a transparent rule-based score.

For example:

Technical SEO: 30 points
On-page SEO: 30 points
Content/structure: 20 points
Social/metadata: 10 points
Crawlability: 10 points

Total = 100.

Every deduction must have a reason.

Do not let the LLM determine the numerical score.

The numerical score must come from deterministic application logic.

AI ANALYSIS
-----------
After deterministic analysis, send a compact JSON object to OpenRouter.

Example:

{
  "url": "...",
  "score": 78,
  "title": {
    "value": "...",
    "length": 58,
    "status": "good"
  },
  "metaDescription": {
    "exists": true,
    "length": 92,
    "status": "short"
  },
  "headings": {
    "h1Count": 2,
    "h2Count": 6
  },
  "images": {
    "total": 15,
    "missingAlt": 7
  },
  "canonical": {
    "exists": false
  },
  "robots": {
    "exists": true
  },
  "sitemap": {
    "exists": false
  }
}

The AI should NOT recalculate the score.

Ask the AI to produce:

- executive summary
- top 5 issues
- issue severity
- explanation
- recommendation
- implementation suggestion
- quick wins
- longer-term improvements

Require structured JSON output.

Example desired AI output:

{
  "summary": "...",
  "topIssues": [
    {
      "issue": "...",
      "severity": "high",
      "whyItMatters": "...",
      "recommendation": "...",
      "implementation": "..."
    }
  ],
  "quickWins": [],
  "longTermImprovements": []
}

Validate the AI response before displaying it.

If AI output is invalid, handle the error gracefully and still show the deterministic SEO report.

SECURITY
--------
Implement basic security from the beginning.

1. Never expose OpenRouter API key to frontend.
2. Store secrets in .env.
3. Add .env to .gitignore.
4. Validate user-provided URLs.
5. Prevent obvious SSRF attacks.

IMPORTANT SSRF PROTECTION:
The server fetches user-provided URLs, so do NOT blindly allow requests to:
- localhost
- 127.0.0.1
- 0.0.0.0
- private IP ranges
- link-local addresses
- cloud metadata endpoints
- internal network addresses

Only allow http/https URLs.

Limit:
- response size
- request timeout
- redirect count
- crawl depth

Do not implement unrestricted crawling.

DATABASE
--------
Create an Audit model containing:

- URL
- normalized URL
- score
- deterministic findings
- AI analysis
- createdAt
- audit status

Create API endpoints:

POST /api/audit
GET /api/audit/:id
GET /api/audits
DELETE /api/audit/:id

The POST endpoint should start an audit and return the audit ID/result.

UI
--
Create a modern professional dashboard.

Landing page:
- Application name: AI SEO Auditor
- Short explanation
- URL input
- "Audit Website" button

Audit page:
- Overall SEO score
- Score breakdown
- Critical issues
- Warnings
- Passed checks
- AI recommendations
- Quick wins
- Technical SEO section
- On-page SEO section
- Content/heading section
- Images section
- Links section
- Crawlability section
- Social metadata section

Use cards, progress indicators, badges and tables where appropriate.

Example:

SEO SCORE
78 / 100

Technical SEO
24 / 30

On-Page SEO
22 / 30

Content Structure
17 / 20

Social Metadata
8 / 10

Crawlability
7 / 10

Use a clean developer/SaaS-style UI.

LOADING STATES
--------------
During auditing show stages such as:

[✓] Fetching website
[✓] Parsing HTML
[✓] Running SEO checks
[→] AI analysis
[ ] Generating report

Handle:
- invalid URL
- website unavailable
- timeout
- HTTP errors
- robots restrictions where relevant
- OpenRouter errors
- rate limits
- malformed AI output
- MongoDB connection failure

Do not crash the entire application because one audit step fails.

PROJECT STRUCTURE
-----------------
Use a clean structure similar to:

client/
  src/
    components/
    pages/
    services/
    hooks/
    utils/

server/
  src/
    controllers/
    routes/
    services/
    models/
    middleware/
    utils/
    analyzers/
    ai/

Create a dedicated SEO analyzer service rather than putting all logic inside the Express route.

For example:

analyzers/
  titleAnalyzer.js
  metaAnalyzer.js
  headingAnalyzer.js
  imageAnalyzer.js
  linkAnalyzer.js
  canonicalAnalyzer.js
  robotsAnalyzer.js
  sitemapAnalyzer.js
  technicalAnalyzer.js

Then combine the results into:

seoAnalyzer.js

AI service:

ai/
  openrouter.js
  prompt.js
  responseValidator.js

DEVELOPMENT APPROACH
--------------------
Build the application incrementally.

PHASE 1:
Set up project structure and frontend/backend.

PHASE 2:
Implement URL validation and website fetching.

PHASE 3:
Implement Cheerio HTML parsing.

PHASE 4:
Implement deterministic SEO analyzers.

PHASE 5:
Implement scoring engine.

PHASE 6:
Implement OpenRouter integration.

PHASE 7:
Implement MongoDB persistence.

PHASE 8:
Build dashboard.

PHASE 9:
Add error handling and security.

PHASE 10:
Test with multiple public websites.

Do not generate the entire application blindly in one step.

After completing each phase:
- explain what was created
- show the important files
- tell me how to run/test it
- identify any limitations
- then continue to the next phase when appropriate.

ENVIRONMENT VARIABLES
---------------------
Create a .env.example:

PORT=5000
MONGODB_URI=
OPENROUTER_API_KEY=

Never hardcode credentials.

README
------
Create a detailed README containing:

- project overview
- architecture
- features
- tech stack
- installation
- environment variables
- how to run frontend
- how to run backend
- API documentation
- security considerations
- limitations
- future improvements

FUTURE FEATURES
---------------
Keep the architecture extensible for:

- multi-page crawling
- scheduled audits
- PDF reports
- email reports
- Google Search Console integration
- PageSpeed Insights integration
- competitor comparison
- keyword analysis
- historical score tracking
- automated SEO monitoring

IMPORTANT PRODUCT PRINCIPLE
---------------------------
This is an AI-assisted SEO auditing tool, not an "AI magically knows SEO" application.

The system should demonstrate:

Web crawling
+
HTML parsing
+
Deterministic SEO analysis
+
Rule-based scoring
+
LLM reasoning
+
Structured AI output
+
Database persistence
+
Dashboard visualization

The final application should be something I can demonstrate in an internship interview and explain technically.

Start with PHASE 1 only.