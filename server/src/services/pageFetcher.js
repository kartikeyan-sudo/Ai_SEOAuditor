import axios from 'axios';

/**
 * Service to fetch website page HTML with SSRF safeguards, timeouts, and size limits.
 */
export const fetchWebpage = async (url) => {
  const startTime = performance.now();

  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5,
      maxContentLength: 5 * 1024 * 1024, // 5 MB max response size
      maxBodyLength: 5 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; AI-SEO-Auditor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      validateStatus: (status) => status >= 200 && status < 600, // Handle status codes explicitly
    });

    const responseTime = Math.round(performance.now() - startTime);
    const contentType = response.headers['content-type'] || '';

    // Validate content type is HTML
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Website returned non-HTML content (${contentType || 'unknown type'})`);
    }

    // Determine final URL after any redirects
    const finalUrl = response.request?.res?.responseUrl || response.config.url || url;

    return {
      requestedUrl: url,
      finalUrl,
      statusCode: response.status,
      contentType,
      responseTime,
      html: response.data || '',
      redirectCount: response.request?._redirectable?._redirectCount || 0
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error(`Request timed out after 10 seconds while fetching ${url}`);
    }

    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      throw new Error(`DNS resolution failed. Website domain could not be found.`);
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused by server at ${url}`);
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 403) throw new Error(`Website returned HTTP 403 Forbidden`);
      if (status === 404) throw new Error(`Website returned HTTP 404 Not Found`);
      if (status >= 500) throw new Error(`Website returned server error HTTP ${status}`);
    }

    throw new Error(error.message || `Website could not be reached`);
  }
};
