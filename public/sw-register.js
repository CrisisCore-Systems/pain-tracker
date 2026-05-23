// Robust Service Worker registration for dev + E2E.
// Try multiple candidate paths (base-relative, module-relative and root) so dev server
// differences don't break automated tests. We also log errors for easier debug.
if ('serviceWorker' in navigator) {
  const getServiceWorkerBasePath = () => {
    const pathname = location.pathname || '/';

    if (pathname === '/pain-tracker' || pathname.startsWith('/pain-tracker/')) {
      return '/pain-tracker/';
    }

    if (pathname === '/app' || pathname.startsWith('/app/')) {
      return '/app/';
    }

    return '/';
  };

  // Listen for readiness message from the service worker and set a global
  // flag that tests can observe (window.__pwa_sw_ready).
  navigator.serviceWorker.addEventListener('message', (e) => {
    try {
      if (e?.data?.type === 'SW_READY') {
        globalThis.__pwa_sw_ready = true;
        globalThis.__pwa_sw_version = e.data.version || null;
      }
    } catch {
      /* ignore */
    }
  });

  window.addEventListener('load', async () => {
    const tryRegister = async (url) => {
      try {
        const reg = await navigator.serviceWorker.register(url);
        console.log('[SW] registered', url, reg);
        return reg;
      } catch (e) {
        console.warn('[SW] registration failed for', url, e?.message || e);
        return null;
      }
    };

    const swBasePath = getServiceWorkerBasePath();
    const candidates = swBasePath === '/'
      ? ['/sw.js']
      : [`${swBasePath}sw.js`, '/sw.js'];

    for (const candidate of candidates) {
      const reg = await tryRegister(candidate);
      if (reg) break; // stop on first successful registration
    }
  });
}
