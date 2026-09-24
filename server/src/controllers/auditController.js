import { validateAndNormalizeUrl } from '../utils/urlValidator.js';
import { fetchWebpage } from '../services/pageFetcher.js';
import { parseHtml } from '../services/htmlParser.js';
import { runBasicAnalyzer } from '../analyzers/basicAnalyzer.js';
import { runSeoRuleEngine } from '../analyzers/seo/seoRuleEngine.js';

/**
 * POST /api/audit
 * Triggers URL validation, fetching, Cheerio parsing, basic stats, and Phase 3 Deterministic SEO Rule Engine audit.
 */
export const createAudit = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Website URL is required' });
    }

    // 1. Validate and normalize input URL with SSRF guards
    const normalizedUrl = validateAndNormalizeUrl(url);

    // 2. Fetch page HTML
    const pageData = await fetchWebpage(normalizedUrl);

    // 3. Parse HTML with Cheerio
    const parsedData = parseHtml(pageData.html, pageData.finalUrl);

    // 4. Run basic SEO analyzer for extracted metrics
    const seoFacts = runBasicAnalyzer(parsedData, pageData.finalUrl);

    // 5. Run Phase 3 Deterministic SEO Rule Engine & Scoring
    const auditReport = await runSeoRuleEngine(parsedData, pageData);

    // 6. Return response
    return res.status(200).json({
      success: true,
      data: {
        requestedUrl: url,
        normalizedUrl,
        finalUrl: pageData.finalUrl,
        page: {
          statusCode: pageData.statusCode,
          contentType: pageData.contentType,
          responseTime: pageData.responseTime,
          redirectCount: pageData.redirectCount,
          isJsRendered: seoFacts.isJsRendered,
        },
        seo: seoFacts,
        audit: {
          score: auditReport.score,
          interpretation: auditReport.interpretation,
          summary: auditReport.summary,
          categories: auditReport.categories,
          issues: auditReport.issues,
          passedChecks: auditReport.passedChecks,
          crawlData: auditReport.crawlData,
        }
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Unable to complete SEO audit'
    });
  }
};

// GET /api/audit/:id - Fetch single audit report
export const getAuditById = async (req, res, next) => {
  try {
    const { id } = req.params;
    return res.status(200).json({
      success: true,
      data: { id, message: 'Audit details stub' }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/audits - List recent audits
export const getAllAudits = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/audit/:id - Delete an audit report
export const deleteAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    return res.status(200).json({
      success: true,
      message: `Audit ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
