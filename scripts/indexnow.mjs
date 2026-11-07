#!/usr/bin/env node
// デプロイ後にサイトマップの全 URL を IndexNow に通知する。

import { readFile, readdir } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const dryRun = args.includes('--dry-run');

// サイトマップ内の XML エンティティを URL に戻す。
function decodeXml(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity.startsWith('#')) {
      const hex = entity[1].toLowerCase() === 'x';
      return String.fromCodePoint(Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return entities[entity.toLowerCase()];
  });
}

async function main() {
  if (args.some((arg) => arg !== '--dry-run')) {
    throw new Error('使い方: bun run indexnow -- --dry-run（実際に送信するときは引数なし）');
  }

  let sitemap;
  try {
    sitemap = await readFile(new URL('dist/sitemap-0.xml', root), 'utf8');
  } catch (error) {
    throw new Error('dist/sitemap-0.xml を読めません。先に bun run build を実行してください。', { cause: error });
  }
  const urlList = [...sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/g)]
    .map((match) => decodeXml(match[1].trim()));
  if (urlList.length === 0) {
    throw new Error('dist/sitemap-0.xml に <loc> がありません。サイトマップを確認してください。');
  }

  const site = new URL(process.env.SITE_URL ?? 'https://yohaku.je-ta-gallery.workers.dev');
  if (site.protocol !== 'https:') {
    throw new Error('SITE_URL は https:// で指定してください。');
  }
  for (const url of urlList) {
    if (new URL(url).origin !== site.origin) {
      throw new Error(`サイトマップの URL と SITE_URL のオリジンが一致しません: ${url} / ${site.origin}`);
    }
  }

  // キーの定義元は public/ のファイルだけにし、二重管理しない。
  const keyFiles = (await readdir(new URL('public/', root)))
    .filter((name) => /^[a-f0-9]{32}\.txt$/.test(name));
  if (keyFiles.length !== 1) {
    throw new Error(`public/ に 32 桁の小文字 hex キー .txt が 1 つ必要です（現在 ${keyFiles.length} 個）。`);
  }
  const key = keyFiles[0].slice(0, -4);
  if (await readFile(new URL(`public/${keyFiles[0]}`, root), 'utf8') !== key) {
    throw new Error(`public/${keyFiles[0]} の内容はキー文字列のみ（改行なし）にしてください。`);
  }

  const keyLocation = new URL(`/${key}.txt`, site).href;
  const payload = { host: site.host, key, keyLocation, urlList };
  if (dryRun) {
    // 未デプロイのキーでも確認できるよう、ドライランでは GET も POST もしない。
    console.log('IndexNow dry-run（通信なし）');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  // デプロイ直後のエッジ反映遅延を考慮し、5 秒おきに最大 6 回確認する。
  let verified = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await fetch(keyLocation, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      });
      const body = await response.text();
      if (response.status === 200 && body === key) {
        verified = true;
        break;
      }
      console.warn(`キー確認 ${attempt}/6: HTTP ${response.status}、キーの内容が一致しません。`);
    } catch (error) {
      console.warn(`キー確認 ${attempt}/6: ${error.message}`);
    }
    if (attempt < 6) await wait(5_000);
  }
  if (!verified) {
    throw new Error(`公開キーを 6 回確認しても取得・照合できませんでした: ${keyLocation}。IndexNow には送信していません。`);
  }

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  console.log(`IndexNow: HTTP ${response.status}`);
  console.log(body || '（レスポンス本文なし）');
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow への通知が失敗しました（HTTP ${response.status}）。`);
  }
}

main().catch((error) => {
  console.error(`IndexNow: ${error.message}`);
  process.exitCode = 1;
});
