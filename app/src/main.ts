import { createApp } from 'vue';
import App from './App.vue';
import { initJieba } from './lib/cnki2bib';

// Kick off the WASM jieba init eagerly so the first conversion is instant.
// Errors during init are non-fatal — the converter falls back gracefully.
void initJieba().catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('jieba initialisation failed; ID generation will throw on use:', err);
});

createApp(App).mount('#app');
