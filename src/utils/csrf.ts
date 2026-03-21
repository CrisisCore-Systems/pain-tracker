export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith('csrfToken='));

  if (!match) return null;
  const value = match.slice('csrfToken='.length);
  return value.length > 0 ? decodeURIComponent(value) : null;
}
