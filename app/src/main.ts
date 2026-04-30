import { createApp } from 'vue';
import App from './App.vue';
import { initJieba } from './lib/cnki2bib';
import { initAnalytics } from './lib/analytics';

// Kick off the WASM jieba init eagerly so the first conversion is instant.
// Errors during init are non-fatal — the converter falls back gracefully.
void initJieba().catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('jieba initialisation failed; ID generation will throw on use:', err);
});

// VITE_GA_ID is injected at build time by the GitHub Pages workflow.
// It's intentionally NOT a secret (Measurement IDs are public).
initAnalytics(import.meta.env.VITE_GA_ID);

createApp(App).mount('#app');
