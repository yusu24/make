// Shared by ErrorBoundary (render errors) and the global window listeners
// (errors outside React's render tree — event handlers, async code, promise
// rejections) so both funnel into the same /error page with the same shape.
export function reportError(error, extra = {}) {
  try {
    sessionStorage.setItem('umkm_last_error', JSON.stringify({
      message: error?.message || String(error),
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
