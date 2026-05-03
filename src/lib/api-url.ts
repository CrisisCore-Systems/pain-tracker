function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function isLocalPreviewHost(location: Location): boolean {
  const isLocalHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return isLocalHost && location.port === '4173';
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof globalThis.location !== 'undefined' && isLocalPreviewHost(globalThis.location)) {
    return `${globalThis.location.protocol}//${globalThis.location.hostname}:3001/api`;
  }

  return '/api';
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function getApiRequestCredentials(): RequestCredentials {
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')
    ? 'include'
    : 'same-origin';
}