// Generate golden fixtures from the live Python backend.
// Run: node scripts/generate-fixtures.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'src', 'lib', 'cnki2bib', '__fixtures__');
const BACKEND = 'https://cnki2bib.azurewebsites.net/api/httptrigger1';

mkdirSync(FIXTURES_DIR, { recursive: true });

const samples = {
  'journal-article-zh': `{Reference Type}: Journal Article
{Title}: 计算机辅助导航技术在脊柱外科中的应用
{Author}: 潘紫麟;刘庆鹏;
{Author Address}: 哈尔滨医科大学附属第二医院骨科;
{Journal}: 医学综述
{Year}: 2021
{Issue}: 11
{Pages}: 2184-2188
{Keywords}: 脊柱疾病;计算机辅助;导航技术
{Abstract}: 随着当代计算机技术的不断发展，计算机辅助导航技术逐渐应用于脊柱外科手术中。
{ISBN/ISSN}: 1006-2084
{Notes}: 11-3553/R
{Database Provider}: CNKI
`,
  'journal-article-en': `{Reference Type}: Journal Article
{Title}: A Survey on Deep Learning for Image Classification
{Author}: Smith, John;Doe, Jane;
{Journal}: Nature Machine Intelligence
{Year}: 2022
{Issue}: 3
{Pages}: 100-120
{Keywords}: deep learning;image classification
{ISBN/ISSN}: 2522-5839
{Database Provider}: CNKI
`,
  'masters-thesis': `{Reference Type}: Thesis
{Type of Work}: 硕士
{Title}: 基于深度学习的图像识别研究
{Author}: 张三
{Publisher}: 清华大学
{Year}: 2020
{Keywords}: 深度学习;图像识别
{Database Provider}: CNKI
`,
  'phd-thesis': `{Reference Type}: Thesis
{Type of Work}: 博士
{Title}: 分布式系统中的一致性算法研究
{Author}: 李四
{Publisher}: 北京大学
{Year}: 2019
{Database Provider}: CNKI
`,
  'conference': `{Reference Type}: Conference Proceedings
{Title}: 一种新的图像分割算法
{Author}: 王五;赵六;
{Tertiary Title}: 中国计算机学会全国学术年会
{Year}: 2021
{Pages}: 50-55
{Database Provider}: CNKI
`,
  'book': `{Reference Type}: Book
{Title}: 算法导论
{Author}: 科尔曼
{Publisher}: 机械工业出版社
{Date}: 2013-01
{图书印刷版ISBN}: 978-7-111-40701-0
{Database Provider}: CNKI
`,
  'multi-entry': `{Reference Type}: Journal Article
{Title}: First Paper
{Author}: Author A
{Journal}: Journal A
{Year}: 2020

{Reference Type}: Journal Article
{Title}: Second Paper
{Author}: Author B
{Journal}: Journal B
{Year}: 2021
`,
  'special-chars': `{Reference Type}: Journal Article
{Title}: Test_Title with & ampersand
{Author}: Smith_J;Doe&Jane;
{Journal}: A_Journal & Co
{Year}: 2022
{Database Provider}: CNKI
`,
  'multiline-abstract': `{Reference Type}: Journal Article
{Title}: Multiline Test
{Author}: 测试作者
{Journal}: 测试期刊
{Year}: 2023
{Abstract}: This is line one.
This is continuation line two.
And line three.
{Database Provider}: CNKI
`,
};

async function fetchBib(input) {
  const res = await fetch(BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnki: input }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.text();
}

const manifest = {};
for (const [name, input] of Object.entries(samples)) {
  process.stdout.write(`Fetching ${name}... `);
  try {
    const output = await fetchBib(input);
    writeFileSync(join(FIXTURES_DIR, `${name}.cnki.txt`), input, 'utf8');
    writeFileSync(join(FIXTURES_DIR, `${name}.bib`), output, 'utf8');
    manifest[name] = { input: `${name}.cnki.txt`, expected: `${name}.bib` };
    console.log('ok');
  } catch (e) {
    console.error('FAIL:', e.message);
  }
}
writeFileSync(join(FIXTURES_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\nWrote ${Object.keys(manifest).length} fixtures to ${FIXTURES_DIR}`);
