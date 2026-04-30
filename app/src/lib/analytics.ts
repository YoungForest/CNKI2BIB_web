/**
 * Google Analytics 4 integration.
 *
 * GA is opt-in via the VITE_GA_ID build-time env var so dev builds and forks
 * never report to your production analytics. The Measurement ID itself is
 * public (it's embedded in the served HTML), so it lives in the Pages
 * workflow as a plain env var, not a secret.
 *
 * Pageview tracking is manual (send_page_view: false) so hash-route changes
 * are also reported. Otherwise gtag would only see the very first navigation.
 */

interface GtagWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

let measurementId: string | null = null;

export function initAnalytics(id: string | undefined | null): void {
  if (!id) return;
  if (measurementId) return; // already initialised
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  measurementId = id;

  const w = window as GtagWindow;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  };
  w.gtag('js', new Date());
  // We send page_view ourselves so hash-route changes are also tracked.
  w.gtag('config', id, { send_page_view: false });

  trackPageview(window.location.hash || '#/');
}

export function trackPageview(path: string): void {
  if (!measurementId) return;
  if (typeof window === 'undefined') return;
  const w = window as GtagWindow;
  if (!w.gtag) return;
  w.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
  });
}

// Test-only helper to reset module state between tests.
export const __test = {
  reset() {
    measurementId = null;
  },
};
