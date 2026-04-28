<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NSpace,
  NButton,
  zhCN,
  dateZhCN,
  darkTheme,
  type GlobalThemeOverrides,
} from 'naive-ui';
import Converter from './views/Converter.vue';
import About from './views/About.vue';

type View = 'converter' | 'about';

function viewFromHash(): View {
  return window.location.hash.replace(/^#\/?/, '') === 'about' ? 'about' : 'converter';
}

const currentView = ref<View>(viewFromHash());
const isDark = ref<boolean>(
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
);

function onHashChange() {
  currentView.value = viewFromHash();
}
function navigate(view: View) {
  window.location.hash = `#/${view}`;
}
onMounted(() => window.addEventListener('hashchange', onHashChange));
onUnmounted(() => window.removeEventListener('hashchange', onHashChange));

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
  },
};

const theme = computed(() => (isDark.value ? darkTheme : null));
function toggleDark() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-message-provider>
      <n-layout style="min-height: 100vh">
        <n-layout-header bordered class="app-header">
          <div class="brand">
            <a href="#/converter" class="brand-link">CNKI <span>→</span> BibTeX</a>
          </div>
          <n-space :size="8" align="center">
            <n-button
              :type="currentView === 'converter' ? 'primary' : 'default'"
              quaternary
              size="small"
              @click="navigate('converter')"
            >
              转换
            </n-button>
            <n-button
              :type="currentView === 'about' ? 'primary' : 'default'"
              quaternary
              size="small"
              @click="navigate('about')"
            >
              关于
            </n-button>
            <n-button quaternary size="small" @click="toggleDark">
              {{ isDark ? '☀' : '☾' }}
            </n-button>
            <n-button
              tag="a"
              href="https://github.com/YoungForest/CNKI2BIB_web"
              target="_blank"
              rel="noopener"
              quaternary
              size="small"
            >
              GitHub
            </n-button>
          </n-space>
        </n-layout-header>

        <n-layout-content content-style="padding: 24px; max-width: 960px; margin: 0 auto;">
          <Converter v-if="currentView === 'converter'" />
          <About v-else />
        </n-layout-content>

        <n-layout-footer bordered class="app-footer">
          <span> 纯前端实现，所有数据在浏览器本地处理，不上传任何信息。 </span>
        </n-layout-footer>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}
.brand {
  font-size: 18px;
  font-weight: 700;
}
.brand-link {
  text-decoration: none;
  color: inherit;
}
.brand-link span {
  color: #18a058;
  margin: 0 4px;
}
.app-footer {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  opacity: 0.7;
}
</style>
