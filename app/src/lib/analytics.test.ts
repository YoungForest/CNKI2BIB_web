import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initAnalytics, trackPageview, __test } from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    __test.reset();
    delete (window as unknown as Record<string, unknown>).dataLayer;
    delete (window as unknown as Record<string, unknown>).gtag;
    document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((n) => n.remove());
  });

  afterEach(() => {
    __test.reset();
  });

  it('does nothing when id is empty/null/undefined', () => {
    initAnalytics(undefined);
    initAnalytics(null);
    initAnalytics('');
    expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect((window as unknown as Record<string, unknown>).gtag).toBeUndefined();
  });

  it('injects the gtag script and sets up dataLayer when id is given', () => {
    initAnalytics('G-TEST123');
    const script = document.head.querySelector<HTMLScriptElement>(
      'script[src*="googletagmanager.com/gtag/js"]',
    );
    expect(script).not.toBeNull();
    expect(script!.src).toContain('id=G-TEST123');
    expect(script!.async).toBe(true);
    expect((window as unknown as { dataLayer: unknown[] }).dataLayer).toBeInstanceOf(Array);
    expect((window as unknown as { gtag?: () => void }).gtag).toBeTypeOf('function');
  });

  it('does not double-initialise on repeated calls', () => {
    initAnalytics('G-TEST123');
    initAnalytics('G-OTHER');
    const scripts = document.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    expect(scripts).toHaveLength(1);
  });

  it('sends an initial page_view on init (so the first paint is tracked)', () => {
    initAnalytics('G-TEST123');
    const dl = (window as unknown as { dataLayer: unknown[][] }).dataLayer;
    const events = dl.filter((entry) => Array.isArray(entry) && entry[0] === 'event');
    expect(events).toHaveLength(1);
    expect((events[0] as unknown[])[1]).toBe('page_view');
  });

  it('trackPageview is a no-op until initAnalytics has been called', () => {
    trackPageview('#/before-init');
    expect((window as unknown as { dataLayer?: unknown[] }).dataLayer).toBeUndefined();
  });

  it('trackPageview pushes a page_view event after init', () => {
    initAnalytics('G-TEST123');
    const dl = (window as unknown as { dataLayer: unknown[][] }).dataLayer;
    const before = dl.length;
    trackPageview('#/about');
    expect(dl.length).toBe(before + 1);
    const last = dl[dl.length - 1] as unknown[];
    expect(last[0]).toBe('event');
    expect(last[1]).toBe('page_view');
    expect((last[2] as { page_path: string }).page_path).toBe('#/about');
  });
});
