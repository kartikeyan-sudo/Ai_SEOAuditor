import net from 'net';

/**
 * Normalizes and validates a URL to prevent SSRF and handle malformed inputs.
 */
export const validateAndNormalizeUrl = (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  let rawUrl = inputUrl.trim();

  // Prepend https:// if no protocol is supplied
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (err) {
    throw new Error('Invalid URL format. Please provide a valid web address (e.g. https://example.com)');
  }

  // Enforce protocol restriction
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // SSRF Protection: Blacklist forbidden hostnames
  const forbiddenHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '0000:0000:0000:0000:0000:0000:0000:0001',
    '169.254.169.254', // AWS/Cloud metadata
    'metadata.google.internal'
  ];

  if (forbiddenHosts.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Access to local, internal, or cloud metadata addresses is forbidden');
  }

  // Check IP range restrictions if hostname is an IP address
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error('Access to private IP addresses is forbidden');
    }
  }

  return parsedUrl.toString();
};

/**
 * Helper to check if an IP address belongs to a private/reserved range.
 */
function isPrivateIP(ip) {
  // IPv4 private & link-local ranges
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 10.0.0.0 – 10.255.255.255
    if (parts[0] === 10) return true;
    // 172.16.0.0 – 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0 – 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0 – 127.255.255.255 (Loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0 – 169.254.255.255 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0
    if (parts[0] === 0) return true;
  }
  
  // IPv6 private & loopback
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc00:') || normalized.startsWith('fd00:')) {
      return true;
    }
  }

  return false;
}
