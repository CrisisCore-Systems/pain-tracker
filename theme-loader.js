(function() {
  var stored = null;
  try { stored = localStorage.getItem('pain-tracker:theme-mode'); } catch(e) {}
  
  // Priority: 1) saved pref, 2) system pref, 3) dark (our default)
  var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark' || theme === 'high-contrast') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Update theme-color meta tag for browser chrome
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
})();
