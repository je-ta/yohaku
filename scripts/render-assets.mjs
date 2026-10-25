#!/usr/bin/env node
// src/content/posts/_assets/ に置かれた原本から、配信用の画像を生成する。
//
// 生成物（public/media/）は git 管理外なので、CI ではここが空になる。
// 原本をリポジトリに残しておくことで、どの環境でも同じ画像を作り直せる。
//
//   node scripts/render-assets.mjs           # 未生成のものだけ
//   node scripts/render-assets.mjs --force   # 全部作り直す

import { mkdir, stat, readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src', 'content', 'posts', '_assets');
const OUT = join(ROOT, 'public', 'media');
const WIDTHS = [320, 640, 860, 1280];
const AVIF = { quality: 40, effort: 2 };
const WEBP = { quality: 66, effort: 6 };
const CONCURRENCY = Math.max(2, Math.min(8, Math.floor((process.env.NUM_CPUS ?? 4) / 2)));

const force = process.argv.includes('--force');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** 原本 1 枚から全サイズを生成する。ファイル名（拡張子なし）が ID。 */
async function renderOne(name) {
  const id = parse(name).name;
  const dir = join(OUT, id);
  await mkdir(dir, { recursive: true });

  const paths = WIDTHS.flatMap((w) => [join(dir, `${w}.avif`), join(dir, `${w}.webp`)]);
  if (!force && (await Promise.all(paths.map(exists))).every(Boolean)) {
    return { id, skipped: true };
  }

  const source = await sharp(join(SRC, name));
  const meta = await source.metadata();
  // 元画像より大きい幅は生成しない
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (widths.length === 0) widths.push(Math.min(meta.width, WIDTHS[0]));

  for (const width of widths) {
    const base = await sharp(join(SRC, name)).resize({ width }).toBuffer();
    await sharp(base).avif(AVIF).toFile(join(dir, `${width}.avif`));
    await sharp(base).webp(WEBP).toFile(join(dir, `${width}.webp`));
  }

  return { id, widths };
}

let names;
try {
  names = (await readdir(SRC)).filter((n) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(n));
} catch {
  console.log('原本がありません（src/content/posts/_assets/）。スキップします。');
  process.exit(0);
}

if (names.length === 0) {
  console.log('原本がありません。スキップします。');
  process.exit(0);
}

console.log(`原本 ${names.length} 枚を処理します (force=${force}, concurrency=${CONCURRENCY})`);
await mkdir(OUT, { recursive: true });

const queue = [...names];
let done = 0;

async function worker() {
  while (queue.length) {
    const name = queue.shift();
    try {
      const result = await renderOne(name);
      if (!result.skipped) {
        done += 1;
        console.log(`  ✓ ${result.id}`);
      }
    } catch (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, names.length) }, worker));
console.log(`完了: ${done} 枚を生成しました`);
