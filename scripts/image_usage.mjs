import fs from 'node:fs/promises';
import path from 'node:path';
import { collections } from '../src/collections.mjs';
const root = path.resolve(import.meta.dirname, '..');
const assets = JSON.parse(await fs.readFile(path.join(root, 'src/assets.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'src/asset-manifest.json'), 'utf8'));
const keyOf = file => path.basename(file, '.webp');
let output = '# 画像使用マップ — URBAN RIDER TOKYO\n\n自動生成: `node scripts/image_usage.mjs`\n\n';
for (const collection of collections) {
  const group = assets[collection.slug];
  output += `## ${collection.number}. ${collection.name}\n\n`;
  for (const [slot, label] of [['top', 'TOPカード'], ['hero', 'ヒーロー'], ['gallery', 'ギャラリー']]) {
    output += `### ${label}（${group[slot].length}枚）\n\n`;
    if (!group[slot].length) { output += 'なし\n\n'; continue; }
    output += '| # | 配信キー | 元ファイル |\n|---|---|---|\n';
    group[slot].forEach((file, index) => { const key = keyOf(file); output += `| ${index + 1} | \`${key}\` | \`${manifest[key]?.source ?? '(?)'}\` |\n`; });
    output += '\n';
  }
}
await fs.mkdir(path.join(root, 'docs'), { recursive: true });
await fs.writeFile(path.join(root, 'docs/image-usage.md'), output);
console.log('wrote docs/image-usage.md');
