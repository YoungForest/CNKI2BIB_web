<script setup lang="ts">
import { NCard, NSpace, NA, NUl, NLi, NText, NCode, NDivider } from 'naive-ui';
</script>

<template>
  <n-space vertical :size="24">
    <n-card title="如何使用" embedded>
      <p>
        把中国知网导出的 NoteExpress 格式（<n-code>.net</n-code>）参考文献一键转换为 BibTeX
        格式（<n-code>.bib</n-code>），方便在
        <n-code>LaTeX</n-code> /
        <n-a href="https://www.mendeley.com/" target="_blank" rel="noopener">Mendeley</n-a>
        /
        <n-a href="https://www.zotero.org/" target="_blank" rel="noopener">Zotero</n-a>
        中使用。
      </p>

      <h3>步骤</h3>
      <n-ul>
        <n-li>在「中国知网」搜索结果页选中目标文献。</n-li>
        <n-li>点击 <strong>导出/参考文献</strong>，选择 <strong>NoteExpress (.net)</strong>。</n-li>
        <n-li>点击 <strong>复制到剪贴板</strong>。</n-li>
        <n-li>回到本页，把内容粘贴到「转换」页的上方输入框，点击「转换为 BibTeX」。</n-li>
        <n-li>「复制到剪贴板」或「下载 .bib 文件」。</n-li>
      </n-ul>
    </n-card>

    <n-card title="技术说明" embedded>
      <p>
        本工具完全在浏览器本地完成转换，<strong>不会上传任何文献内容</strong>。 中文分词使用
        <n-code>jieba-wasm</n-code>（jieba 算法的 WASM 移植）， 汉字转拼音使用
        <n-code>pinyin-pro</n-code>。
      </p>
      <p>
        BibTeX cite key 的生成算法与
        <n-a href="https://github.com/YoungForest/CNKI2BIB_Backend" target="_blank" rel="noopener">
          原 Python 后端
        </n-a>
        保持一致，旧的 <n-code>.bib</n-code> 文件可继续使用。
      </p>
    </n-card>

    <n-card title="链接" embedded>
      <n-ul>
        <n-li>
          源代码：
          <n-a href="https://github.com/YoungForest/CNKI2BIB_web" target="_blank" rel="noopener">
            CNKI2BIB_web
          </n-a>
        </n-li>
        <n-li>
          灵感来源：
          <n-a href="https://github.com/Vopaaz/CNKI_2_BibTeX" target="_blank" rel="noopener">
            Vopaaz/CNKI_2_BibTeX
          </n-a>
        </n-li>
      </n-ul>
    </n-card>

    <n-divider />

    <n-text depth="3" style="text-align: center; display: block; font-size: 12px">
      MIT License · 遇到问题或建议，欢迎到 GitHub 提 issue 🙏
    </n-text>
  </n-space>
</template>
