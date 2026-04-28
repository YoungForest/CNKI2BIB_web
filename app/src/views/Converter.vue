<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NCard,
  NSpace,
  NButton,
  NInput,
  NText,
  NAlert,
  NSelect,
  NDivider,
  useMessage,
} from 'naive-ui';
import { cnkiToBib, type IdFormat } from '@/lib/cnki2bib';

const SAMPLE_INPUT = `{Reference Type}: Journal Article
{Title}: 计算机辅助导航技术在脊柱外科中的应用
{Author}: 潘紫麟;刘庆鹏;
{Journal}: 医学综述
{Year}: 2021
{Issue}: 11
{Pages}: 2184-2188
{ISBN/ISSN}: 1006-2084
{Database Provider}: CNKI
`;

const input = ref<string>('');
const output = ref<string>('');
const errorMessage = ref<string>('');
const isConverting = ref<boolean>(false);
const idFormat = ref<IdFormat>('title');
const message = useMessage();

const idFormatOptions = [
  { label: '标题拼音 (默认，与原 Python 后端一致)', value: 'title' },
  { label: '作者+年份 (例如 ZhangSan2020)', value: 'nameyear' },
];

const inputCharCount = computed(() => input.value.length);
const entryCount = computed(() => {
  if (!output.value) return 0;
  // Each BibTeX entry starts with `@`
  return (output.value.match(/^@/gm) ?? []).length;
});

async function convert() {
  errorMessage.value = '';
  output.value = '';
  if (!input.value.trim()) {
    errorMessage.value = '请粘贴 NoteExpress 文本，或点击「填充示例」试用。';
    return;
  }
  isConverting.value = true;
  try {
    // Yield to the event loop so the loading state shows on small inputs too.
    await new Promise((r) => setTimeout(r, 0));
    output.value = cnkiToBib(input.value, { idFormat: idFormat.value });
    message.success(`转换成功，共 ${entryCount.value} 条记录`);
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
    message.error('转换失败');
  } finally {
    isConverting.value = false;
  }
}

function fillSample() {
  input.value = SAMPLE_INPUT;
  errorMessage.value = '';
}

function clearAll() {
  input.value = '';
  output.value = '';
  errorMessage.value = '';
}

async function copyOutput() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    message.success('已复制到剪贴板');
  } catch {
    message.error('复制失败，请手动选中复制');
  }
}

function downloadOutput() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'citation.bib';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <n-space vertical :size="20">
    <n-card title="① 粘贴 NoteExpress 文本" embedded>
      <template #header-extra>
        <n-text depth="3" style="font-size: 12px">{{ inputCharCount }} 字符</n-text>
      </template>

      <n-input
        v-model:value="input"
        type="textarea"
        :rows="12"
        placeholder="在「中国知网」点击「导出/参考文献」→ 选择 NoteExpress(.net) → 复制全部内容到此处"
        clearable
        data-testid="input-textarea"
      />

      <template #action>
        <n-space>
          <n-button data-testid="fill-sample-btn" @click="fillSample">填充示例</n-button>
          <n-button data-testid="clear-btn" @click="clearAll">清空</n-button>
          <n-select
            v-model:value="idFormat"
            :options="idFormatOptions"
            style="min-width: 320px; max-width: 100%"
            size="small"
          />
        </n-space>
      </template>
    </n-card>

    <n-space justify="center">
      <n-button
        type="primary"
        size="large"
        :loading="isConverting"
        :disabled="isConverting"
        data-testid="convert-btn"
        @click="convert"
      >
        转换为 BibTeX ↓
      </n-button>
    </n-space>

    <n-alert
      v-if="errorMessage"
      type="error"
      :title="errorMessage"
      closable
      @close="errorMessage = ''"
    />

    <n-card title="② BibTeX 结果" embedded>
      <template #header-extra>
        <n-text depth="3" style="font-size: 12px">
          {{ entryCount > 0 ? `${entryCount} 条记录` : '尚未转换' }}
        </n-text>
      </template>

      <n-input
        :value="output"
        type="textarea"
        :rows="10"
        readonly
        placeholder="结果将显示在这里..."
        data-testid="output-textarea"
      />

      <template #action>
        <n-space>
          <n-button :disabled="!output" data-testid="copy-btn" @click="copyOutput">
            复制到剪贴板
          </n-button>
          <n-button
            :disabled="!output"
            type="primary"
            data-testid="download-btn"
            @click="downloadOutput"
          >
            下载 .bib 文件
          </n-button>
        </n-space>
      </template>
    </n-card>

    <n-divider />

    <n-text depth="3" style="font-size: 12px; text-align: center; display: block">
      💡 提示：所有转换在浏览器本地完成，不会上传任何文献信息。
    </n-text>
  </n-space>
</template>
