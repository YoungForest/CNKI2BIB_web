# CNKI2BIB_web

把中国知网导出的 NoteExpress 格式（`.net`）参考文献一键转换为 BibTeX（`.bib`），方便在 LaTeX / Mendeley / Zotero 中使用。

🌐 在线使用：<https://youngforest.github.io/CNKI2BIB_web/>（部署在 GitHub Pages）

## 特点

- ✅ **纯前端**：所有转换在浏览器本地完成，**不上传任何文献内容**
- ✅ **离线可用**：首次加载后无需网络
- ✅ **与原 Python 后端完全兼容**：cite key 生成算法保持一致，旧的 `.bib` 文件无需重新生成
- ✅ **支持的实体类型**：`Article`、`Book`、`MastersThesis`、`PhdThesis`、`InProceedings`、`Misc`
- ✅ **现代 UI**：基于 [Naive UI](https://www.naiveui.com/)，支持深色模式

## 技术栈

- **构建**：Vite 5 + Vue 3 + TypeScript
- **UI**：Naive UI
- **中文分词**：[`jieba-wasm`](https://github.com/fengkx/jieba-wasm)（jieba 算法的 WASM 移植）
- **拼音转换**：[`pinyin-pro`](https://github.com/zh-lx/pinyin-pro)
- **测试**：Vitest + @vue/test-utils（含与原 Python 后端的 byte-exact 一致性测试）
- **CI**：GitHub Actions（lint → format → typecheck → test → build）

## 本地开发

```sh
cd app
npm install
npm run dev          # 开发服务器
npm test             # 单元测试 + 组件测试 + 一致性测试
npm run typecheck    # TypeScript 严格模式
npm run lint         # ESLint
npm run build        # 生产构建
```

跑单个测试：

```sh
npx vitest run src/lib/cnki2bib/parser.test.ts
```

## 项目结构

```
app/
├── src/
│   ├── App.vue                  # 顶层布局 + 路由
│   ├── main.ts
│   ├── views/
│   │   ├── Converter.vue        # 主转换页面
│   │   ├── Converter.test.ts
│   │   └── About.vue
│   └── lib/cnki2bib/            # 转换核心库（纯逻辑，无 UI 依赖）
│       ├── index.ts             # 公开 API: cnkiToBib()
│       ├── parser.ts            # NoteExpress → 结构化 Entry[]
│       ├── serializer.ts        # Entry[] → BibTeX 文本
│       ├── id-generator.ts      # cite key 生成（拼音 / 作者+年份）
│       ├── jieba-loader.ts      # 浏览器/Node 双环境 jieba 适配
│       ├── __fixtures__/        # 与 Python 后端的对照样本
│       └── *.test.ts
├── vite.config.ts
└── tsconfig.json
```

## 一致性保证

`src/lib/cnki2bib/golden.test.ts` 用真实 CNKI 输入跑全套转换流程，与原
[CNKI2BIB_Backend](https://github.com/YoungForest/CNKI2BIB_Backend) Python 实现的输出做
**byte-exact** 比对，覆盖：

- 解析逻辑（多行合并、字段顺序）
- 序列化逻辑（字段名归一化、`&`/`_` 转义、author 拆分）
- cite key（jieba 分词 + pinyin 转换）

均与原后端完全一致，旧的 `.bib` 文件不会因前端化而失效。

## 致谢

- [Vopaaz/CNKI_2_BibTeX](https://github.com/Vopaaz/CNKI_2_BibTeX) — 转换算法的最初灵感
- [YoungForest/CNKI2BIB_Backend](https://github.com/YoungForest/CNKI2BIB_Backend) — Python 后端实现（已迁移到本仓库前端）

## License

MIT
