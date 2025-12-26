// Robust Service Worker registration for dev + E2E.
// Try multiple candidate paths (base-relative, module-relative and root) so dev server
// differences don't break automated tests. We also log errors for easier debug.
if ('serviceWorker' in navigator) {
  // Listen for readiness message from the service worker and set a global
  // flag that tests can observe (window.__pwa_sw_ready).
  navigator.serviceWorker.addEventListener('message', (e) => {
    try {
      if (e && e.data && e.data.type === 'SW_READY') {
        window.__pwa_sw_ready = true;
        window.__pwa_sw_version = e.data.version || null;
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
        console.warn('[SW] registration failed for', url, e && e.message ? e.message : e);
        return null;
      }
    };

    // Compute a base candidate from current path (ensures /pain-tracker/ works)
    const locBase = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
    // Prefer base-relative registration. When running under a non-root base,
    // only attempt the base-relative path to avoid registering a root-scoped SW.
    // Prefer base-relative registration, but also try a module-relative
    // candidate if the base-relative registration fails in some dev setups.
    // We try base first to avoid accidentally registering a root-scoped SW.
    const candidates = locBase === '/' ? [locBase + 'sw.js', './sw.js', '/sw.js'] : [locBase + 'sw.js', './sw.js'];

    for (const candidate of candidates) {
      const reg = await tryRegister(candidate);
      if (reg) break; // stop on first successful registration
    }
  });
}
