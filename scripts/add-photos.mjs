#!/usr/bin/env node
// 手持ちの写真を取り込み、配信用のサイズを生成して frontmatter を出力する。
//
//   node scripts/add-photos.mjs photo1.jpg photo2.jpg ...
//   node scripts/add-photos.mjs ./trip/*.jpg --quality 70
//
// 生成物は public/media/<id>/<width>.{avif,webp}。標準出力に貼り付け可能な
// frontmatter の images: ブロックを出すので、記事の frontmatter にそのまま入れる。

import { mkdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'public', 'media');
const WIDTHS = [320, 640, 860, 1280];
const AVIF = { quality: 40, effort: 2 };
const WEBP = { quality: 66, effort: 6 };

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
const qualityFlag = args.indexOf('--quality');
const quality = qualityFlag >= 0 ? Number(args[qualityFlag + 1]) : null;
if (quality) {
  AVIF.quality = Math.max(20, quality - 26);
  WEBP.quality = quality;
}

if (files.length === 0) {
  console.error('使い方: node scripts/add-photos.mjs <画像ファイル...> [--quality 70]');
  process.exit(1);
}

/** ファイル内容から決定的な ID を作る。同じ写真を二度取り込んでも同じ場所に収まる。 */
function photoId(buffer) {
  return createHash('sha1').update(buffer).digest('hex').slice(0, 16);
}

/** 平均色を #rrggbb で返す。読み込み中に敷くプレースホルダ。 */
async function averageColor(image) {
  const { data } = await sharp(image).resize({ width: 1, height: 1, fit: 'fill' }).raw().toBuffer({
    resolveWithObject: true,
  });
  const [r, g, b] = data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const blocks = [];
let totalBytes = 0;

for (const file of files) {
  try {
    const source = await readFileSync(file);
    const id = photoId(source);
    const dir = join(OUT, id);
    await mkdir(dir, { recursive: true });

    const meta = await sharp(source).metadata();
    if (!meta.width || !meta.height) throw new Error('画像サイズが読めません');

    // 元画像より大きい幅は生成しない（拡大しても意味がない）
    const widths = WIDTHS.filter((w) => w <= meta.width);
    if (widths.length === 0) widths.push(Math.min(meta.width, WIDTHS[0]));

    for (const width of widths) {
      const base = await sharp(source).resize({ width }).toBuffer();
      const avifPath = join(dir, `${width}.avif`);
      const webpPath = join(dir, `${width}.webp`);
      await sharp(base).avif(AVIF).toFile(avifPath);
      await sharp(base).webp(WEBP).toFile(webpPath);
      totalBytes += (await stat(avifPath)).size + (await stat(webpPath)).size;
    }

    const color = await averageColor(source);
    const alt = basename(file, extname(file)).replace(/[-_]/g, ' ');

    blocks.push(
      [
        `  - id: ${id}`,
        `    photoId: "${id}"`,
        `    v: 1`,
        `    w: ${meta.width}`,
        `    h: ${meta.height}`,
        `    widths:`,
        ...widths.map((w) => `      - ${w}`),
        `    color: "${color}"`,
        `    alt: ${alt}`,
      ].join('\n'),
    );

    console.log(`✓ ${basename(file)} → ${id} (${widths.join('/')}px)`);
  } catch (error) {
    console.error(`✗ ${basename(file)}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (blocks.length === 0) process.exit(1);

await writeFile('/tmp/yohaku-images.txt', `images:\n${blocks.join('\n')}\n`, 'utf8');

console.log(`\n${blocks.length} 枚を書き出しました（${(totalBytes / 1024 / 1024).toFixed(2)} MB）`);
console.log('--- 以下を記事の frontmatter に貼り付けてください ---\n');
console.log(`images:\n${blocks.join('\n')}`);
console.log('\n（同じ内容を /tmp/yohaku-images.txt にも保存しました）');
