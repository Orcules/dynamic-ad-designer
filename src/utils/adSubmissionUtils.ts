export const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

export async function fetchWithRetry(url: string): Promise<Response> {
  let lastError;
  
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      console.log('Attempting to fetch with proxy:', proxyUrl);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error('Proxy fetch failed:', error);
      lastError = error;
    }
  }

  try {
    const response = await fetch(url, { mode: 'no-cors' });
    return response;
  } catch (error) {
    lastError = error;
  }

  throw lastError || new Error('Failed to fetch image after all attempts');
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

