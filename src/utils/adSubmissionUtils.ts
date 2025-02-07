import { format } from 'date-fns';

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

export function generateAdName(adData: any) {
  const date = format(new Date(), 'ddMMyy');
  const name = adData.name.toLowerCase().replace(/\s+/g, '-');
  const platform = adData.platform || 'unknown';
  const language = adData.language || 'en';
  const templateStyle = adData.template_style || 'modern';
  const accentColor = adData.accent_color.replace('#', '');
  const font = adData.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, '-').toLowerCase() || 'default';
  
  const adName = `${date}-${name}-${platform}-${language}-${templateStyle}-${accentColor}-${font}`;
  
  return adName
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const validTemplateStyles = [
  'modern', 'elegant', 'dynamic', 'spotlight', 'wave', 
  'cinematic', 'minimal-fade', 'duotone', 'vignette', 'luxury',
  'overlay-bottom-clean', 'overlay-bottom-gradient', 'overlay-bottom-glass',
  'overlay-bottom-neon', 'overlay-bottom-minimal', 'neon', 'split',
  'gradient', 'outline', 'stacked', 'minimal', 'retro', 'glassmorphism',
  '3d', 'vintage', 'tech', 'nature', 'urban', 'artistic'
];