PHASE 2 — WEBSITE FETCHING AND HTML EXTRACTION

Now implement Phase 2 of the AI SEO Auditor.

The goal of this phase is to make the application actually fetch and analyze the HTML of a user-provided public webpage.

DO NOT implement the LLM/OpenRouter integration yet.
DO NOT implement MongoDB persistence yet.
DO NOT build advanced SEO scoring yet.

Focus only on reliable URL validation, webpage fetching, and HTML extraction.

1. URL VALIDATION
-----------------

Create a reusable URL validation utility.

Requirements:

- Accept only http:// and https:// URLs.
- Automatically normalize URLs where appropriate.
- Reject malformed URLs.
- Reject localhost.
- Reject 127.0.0.1.
- Reject 0.0.0.0.
- Reject private IP addresses.
- Reject link-local addresses.
- Reject cloud metadata endpoints.
- Prevent obvious SSRF attempts.

Return useful errors instead of crashing.

2. WEBSITE FETCHING
-------------------

Create a dedicated service:

server/src/services/pageFetcher.js

Use native fetch or Axios.

Requirements:

- Request timeout: 10 seconds.
- Follow only a limited number of redirects.
- Maximum response size: 2–5 MB.
- Send a reasonable User-Agent.
- Only accept HTML responses for this phase.
- Capture:
  - final URL
  - HTTP status
  - content type
  - response time
  - HTML
  - redirect information if available

Example result:

{
  "requestedUrl": "https://example.com",
  "finalUrl": "https://example.com/",
  "statusCode": 200,
  "contentType": "text/html",
  "responseTime": 423,
  "html": "..."
}

Handle:

- timeout
- DNS failure
- connection failure
- 403
- 404
- 500
- non-HTML response
- oversized response

gracefully.

3. CHEERIO PARSER
-----------------

Create:

server/src/services/htmlParser.js

Use Cheerio.

Given the fetched HTML, extract the following basic information:

{
  "title": "...",
  "metaDescription": "...",
  "h1": [],
  "h2": [],
  "h3": [],
  "images": [],
  "links": [],
  "canonical": null,
  "lang": null,
  "viewport": null
}

For images extract:

{
  "src": "...",
  "alt": "..."
}

For links extract:

{
  "href": "...",
  "text": "..."
}

Resolve relative URLs against the final page URL where appropriate.

4. BASIC ANALYZER
------------------

Create:

server/src/analyzers/basicAnalyzer.js

It should calculate basic facts from the parsed page:

- title exists
- title length
- meta description exists
- meta description length
- H1 count
- H2 count
- H3 count
- image count
- images with alt
- images without alt
- internal link count
- external link count
- canonical exists
- lang exists
- viewport exists

Example:

{
  "title": {
    "value": "Example Website",
    "exists": true,
    "length": 16
  },
  "metaDescription": {
    "exists": true,
    "length": 120
  },
  "headings": {
    "h1Count": 1,
    "h2Count": 4,
    "h3Count": 6
  },
  "images": {
    "total": 10,
    "withAlt": 8,
    "withoutAlt": 2
  },
  "links": {
    "internal": 12,
    "external": 3
  },
  "canonical": {
    "exists": true,
    "url": "https://example.com/"
  },
  "lang": "en",
  "viewport": true
}

5. API ENDPOINT
---------------

Implement:

POST /api/audit

Request:

{
  "url": "https://example.com"
}

Flow:

validate URL
↓
fetch webpage
↓
parse HTML
↓
run basic analyzer
↓
return JSON

Example response:

{
  "success": true,
  "data": {
    "url": "https://example.com",
    "page": {
      "statusCode": 200,
      "responseTime": 423
    },
    "seo": {
      ...
    }
  }
}

6. FRONTEND
-----------

Connect the existing "Audit Website" button to:

POST /api/audit

Show a loading state:

"Fetching website..."
"Parsing HTML..."
"Analyzing page..."

Then display the returned information.

Create a simple temporary analysis page showing:

- HTTP status
- response time
- title
- meta description
- H1 count
- H2 count
- image count
- missing alt count
- internal links
- external links
- canonical
- language
- viewport

Do NOT worry about making this dashboard beautiful yet.

7. ERROR HANDLING
-----------------

Display useful errors such as:

"Invalid URL"

"Website could not be reached"

"Website returned HTTP 403"

"Website returned non-HTML content"

"Request timed out"

"Unable to analyze this website"

Never expose stack traces to the frontend.

8. TESTING
----------

Test with at least:

https://example.com

and 2–3 other publicly accessible websites.

Verify that:

- title is extracted
- meta description is extracted when present
- headings are extracted
- images are counted
- alt attributes are detected
- links are detected
- canonical is detected
- HTTP status is detected

IMPORTANT:

Do not pretend that this analyzes JavaScript-rendered content.

At this stage we are fetching server-returned HTML only.

If a website requires client-side JavaScript to render its content, clearly report:

"JavaScript-rendered content may not be fully analyzed."

9. CODE QUALITY
---------------

Keep fetching, parsing and analysis as separate services.

Do not put everything inside the Express route.

Use async/await.

Add comments only where they explain non-obvious logic.

After implementation, tell me:

1. Which files you created/modified.
2. How to start the backend.
3. How to start the frontend.
4. The API endpoint.
5. An example curl request.
6. Any limitations encountered.

Do not proceed to Phase 3 until Phase 2 works successfully.