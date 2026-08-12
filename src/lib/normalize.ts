export function normalizeUrl(input: string): string {
  // Accept inputs like example.com and add https scheme by default
  let urlStr = input.trim();
  if (!urlStr.includes('://')) {
    urlStr = 'https://' + urlStr;
  }
  const url = new URL(urlStr);

  // Only allow http/https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Unsupported protocol');
  }

  // Normalize host
  url.hostname = url.hostname.toLowerCase();

  // Remove credentials and fragment
  url.username = '';
  url.password = '';
  url.hash = '';

  // Remove default ports
  if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }

  // Ensure pathname is normalized (URL does basic normalization)
  return url.toString();
}

export function normalizeBaseUrl(input: string): string {
  let s = (input || '').trim();
  if (!s) throw new Error('Empty base URL');
  if (!s.includes('://')) s = 'https://' + s;
  const url = new URL(s);
  // remove auth, query, hash
  url.username = '';
  url.password = '';
  url.hash = '';
  url.search = '';
  // strip trailing slash
  let out = url.toString();
  if (out.endsWith('/')) out = out.slice(0, -1);
  return out;
}
