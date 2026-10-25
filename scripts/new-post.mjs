#!/usr/bin/env node
// 記事の雛形を作る。写真のメタデータは手で埋める前提で、枠だけ出す。

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const rl = createInterface({ input: stdin, output: stdout });

const ask = async (question, fallback = '') => {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
};

const today = new Date().toISOString().slice(0, 10);
const title = await ask('タイトル: ');
if (!title) {
  console.error('タイトルは必須です。');
  rl.close();
  process.exit(1);
}
const slug = await ask('スラッグ (例: quiet-morning): ', 'untitled');
const date = await ask(`日付 (YYYY-MM-DD) [${today}]: `, today);
const category = await ask('カテゴリ (例: nature): ', 'nature');
const tags = await ask('タグ (カンマ区切り): ');
rl.close();

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`日付の形式が不正です: ${date}`);
  process.exit(1);
}

const [year, month] = date.split('-');
const dir = join('src', 'content', 'posts', year, month);
const file = join(dir, `${date}-${slug}.md`);

try {
  await access(file);
  console.error(`すでに存在します: ${file}`);
  process.exit(1);
} catch {
  // 存在しない = そのまま作る
}

const tagList = tags
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean)
  .map((t) => `  - ${t}`)
  .join('\n');

const body = `---
title: ${title}
date: ${date}
category: ${category}
tags:
${tagList || '  - sample'}
description: 一覧に出す短い説明を書く。
images:
  - id: 0000000000000000
    photoId: 0
    v: 1
    w: 2400
    h: 1600
    widths:
      - 320
      - 640
      - 1280
    color: "#888888"
    alt: 写真の内容を書く
    caption: "Photo: 撮影者名"
---

本文をここに書く。
`;

await mkdir(dirname(file), { recursive: true });
await writeFile(file, body, 'utf8');

console.log(`作成しました: ${file}`);
console.log('images の id / photoId / w / h / color / alt を実際の写真に合わせて埋めてください。');
