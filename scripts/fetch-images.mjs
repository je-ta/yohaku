#!/usr/bin/env node
// 記事の frontmatter から写真を取得し、配信サイズを生成して public/media に置く。
//
// 元データは Lorem Picsum から借りている。picsum は毎回 302 で別ドメインへ
// 飛ばすため、そのまま <img src> にすると 1 枚あたり往復が 2 回になる。
// ここでローカルに複製しておけば、配信は同一オリジン・1 リクエストで済む。
//
// 出力は AVIF と WebP。AVIF は WebP より 4〜5 割小さく、対応ブラウザも
// 主要どころは揃っているが、<picture> で WebP をフォールバックに残す。

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'public', 'media');
const MANIFEST = join(ROOT, 'src', 'content', 'image-manifest.json');
const WIDTHS = [320, 640, 860, 1280];

/** AVIF は effort 2 で十分小さく、生成も速い（effort 6 と 1% 差で 20 倍遅い）。 */
const AVIF = { quality: 40, effort: 2 };
const WEBP = { quality: 66, effort: 6 };

/** 取得元の最大幅。ここから各サイズへ縮小する。 */
const SOURCE_WIDTH = 1280;
/** エンコードは CPU 依存なので、コア数の半分ほどまで並列化する。 */
const CONCURRENCY = Math.max(2, Math.min(8, Math.floor((process.env.NUM_CPUS ?? 4) / 2)));

/** 記事ファイルを再帰的に集める。 */
function findPosts(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findPosts(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

/** frontmatter の images から photoId と縦横比を拾う。 */
function extractPhotos(markdown) {
  const photos = new Map();
  const pattern = /- id: [0-9a-f]+\n\s+photoId: (\d+)\n(?:.*\n)*?\s+w: (\d+)\n\s+h: (\d+)\n/g;
  for (const match of markdown.matchAll(pattern)) {
    const [, photoId, w, h] = match;
    if (!photos.has(photoId)) photos.set(photoId, { w: Number(w), h: Number(h) });
  }
  return photos;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** 1 枚ぶんの画像を取得して各サイズ・各形式を書き出す。 */
async function buildOne(photoId, { w, h }, { force }) {
  const dir = join(OUT, photoId);
  await mkdir(dir, { recursive: true });

  const targets = WIDTHS.flatMap((width) => [
    { width, path: join(dir, `${width}.avif`) },
    { width, path: join(dir, `${width}.webp`) },
  ]);

  if (!force && (await Promise.all(targets.map((t) => exists(t.path)))).every(Boolean)) {
    return { photoId, skipped: true };
  }

  const sourceHeight = Math.max(1, Math.round((SOURCE_WIDTH * h) / w));
  const url = `https://picsum.photos/id/${photoId}/${SOURCE_WIDTH}/${sourceHeight}.jpg`;
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${photoId}: ${response.status} ${url}`);
  const source = Buffer.from(await response.arrayBuffer());

  /** 元画像 1 枚から、幅ぶんだけ縮小したバッファを作る（縮小は 1 回で済ませる）。 */
  const resized = new Map();
  for (const width of WIDTHS) {
    resized.set(width, await sharp(source).resize({ width }).toBuffer());
  }

  const bytes = {};
  for (const width of WIDTHS) {
    const base = resized.get(width);
    const avifPath = join(dir, `${width}.avif`);
    const webpPath = join(dir, `${width}.webp`);
    await sharp(base).avif(AVIF).toFile(avifPath);
    await sharp(base).webp(WEBP).toFile(webpPath);
    bytes[width] = { avif: (await stat(avifPath)).size, webp: (await stat(webpPath)).size };
  }

  return { photoId, bytes };
}

const force = process.argv.includes('--force');
const postsDir = join(ROOT, 'src', 'content', 'posts');
const photos = new Map();
for (const file of findPosts(postsDir)) {
  for (const [id, size] of extractPhotos(await readFile(file, 'utf8'))) photos.set(id, size);
}

console.log(`${photos.size} 枚を処理します (force=${force}, concurrency=${CONCURRENCY})`);
await mkdir(OUT, { recursive: true });

const queue = [...photos.entries()];
const manifest = {};
let avifTotal = 0;
let webpTotal = 0;
let index = 0;

async function worker() {
  while (queue.length) {
    const [photoId, size] = queue.shift();
    try {
      const result = await buildOne(photoId, size, { force });
      if (!result.skipped) {
        for (const sizes of Object.values(result.bytes)) {
          avifTotal += sizes.avif;
          webpTotal += sizes.webp;
        }
        index += 1;
        console.log(`  ✓ ${photoId} (${index}/${photos.size})`);
      }
      manifest[photoId] = WIDTHS;
    } catch (error) {
      console.error(`  ✗ ${photoId}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

await writeFile(
  MANIFEST,
  JSON.stringify({ widths: WIDTHS, formats: ['avif', 'webp'], photos: manifest }, null, 2) + '\n',
  'utf8',
);

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(`完了: avif ${mb(avifTotal)}MB / webp ${mb(webpTotal)}MB（合計 ${mb(avifTotal + webpTotal)}MB）`);
