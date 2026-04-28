/**
 * Loader that picks the right jieba-wasm entry point depending on environment.
 *
 * - In Node (and Vitest's happy-dom env, which still runs in Node) we use the
 *   nodejs target which exposes `cut(...)` synchronously. Loaded via top-level
 *   await + createRequire so the rest of the module stays synchronous.
 * - In the browser bundle `initJieba()` must be awaited once before use.
 */
type CutFn = (text: string, hmm?: boolean) => string[];
interface JiebaApi {
  cut: CutFn;
}

const isNode =
  typeof process !== 'undefined' &&
  typeof process.versions !== 'undefined' &&
  typeof process.versions.node === 'string';

const api: JiebaApi = {
  cut: (_t: string, _h?: boolean) => {
    throw new Error('jieba not initialised; call initJieba() before generating IDs.');
  },
};

if (isNode) {
  const { createRequire } = await import('node:module');
  const req = createRequire(import.meta.url);
  const m = req('jieba-wasm/node') as { cut: CutFn };
  api.cut = m.cut;
}

export const jieba: JiebaApi = api;

let browserInitPromise: Promise<void> | null = null;
/**
 * Initialise jieba in browser environments. Resolves immediately in Node.
 * Safe to call multiple times.
 */
export function initJieba(): Promise<void> {
  if (isNode) return Promise.resolve();
  if (browserInitPromise) return browserInitPromise;
  browserInitPromise = (async () => {
    const m = (await import('jieba-wasm/web')) as {
      default: () => Promise<unknown>;
      cut: CutFn;
    };
    await m.default();
    api.cut = m.cut;
  })();
  return browserInitPromise;
}
