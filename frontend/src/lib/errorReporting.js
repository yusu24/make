// Shared by ErrorBoundary (render errors) and the global window listeners
// (errors outside React's render tree — event handlers, async code, promise
// rejections) so both funnel into the same /error page with the same shape.
export function reportError(error, extra = {}) {
  const msg = error?.message || String(error);

  // Auto-reload on stale chunk (common when user has older tab open during new deployment)
  if (/Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(msg)) {
    const lastReload = sessionStorage.getItem('chunk_reload_retry');
    if (!lastReload || Date.now() - Number(lastReload) > 10000) {
      sessionStorage.setItem('chunk_reload_retry', String(Date.now()));
      window.location.reload();
      return;
    }
  }

  try {
    sessionStorage.setItem('umkm_last_error', JSON.stringify({
      message: msg,
      stack: error?.stack || null,
      path: window.location.pathname,
      time: Date.now(),
      ...extra,
    }))
  } catch {
    // sessionStorage unavailable (private mode, quota) — the error page
    // will just fall back to its generic message.
  }

  if (window.location.pathname !== '/error') {
    window.location.href = '/error'
  }
}
