# log

このリポジトリは、写真と文章を置くための静的サイト。Astro で作っていて、ビルド後は完全な静的ファイルになる。

## 記事を書く手順

### 1. 記事ファイルを作る

```bash
bun run new-post
```

`src/content/posts/YYYY/MM/YYYY-MM-DD-slug.md` が生成される。手で作る場合は同じ場所・同じ命名で。

### 2. 写真を用意する

**自分の写真を使う場合:**

```bash
bun run add-photos ~/Pictures/trip/*.jpg
```

これが以下をやる:

- `src/content/posts/_assets/<id>.<ext>` に**原本をコピー**（これがリポジトリに入る）
- `public/media/<id>/` に AVIF と WebP を 320/640/860/1280 の4サイズで生成
- 平均色（プレースホルダ用）を計算
- 貼り付け可能な `images:` ブロックを標準出力に出す

`public/media/` は git 管理外なので、原本が無いと CI でビルドしても画像が作られない。`add-photos` が原本を残すのはそのため。

出力されたブロックを記事の frontmatter に貼るだけ。

**既存のアセットを流用する場合:** `src/content/posts/_assets/` にある原本のファイル名（拡張子なし）がそのまま `photoId` になる。`bun run assets` で `public/media/` を再生成できる。記事を書くだけなら何もしなくてよい。

### 3. frontmatter を書く

```yaml
---
title: 朝の海
date: 2026-10-25
category: nature
tags:
  - sea
  - morning
description: 一覧に出る短い説明。120字くらいまで。
cover: f22f75eb82157555   # 任意。一覧サムネに使う画像の id
images:
  - id: f22f75eb82157555
    photoId: "f22f75eb82157555"
    v: 1
    w: 3000
    h: 2000
    widths:
      - 320
      - 640
      - 860
      - 1280
    color: "#4c648a"
    alt: 海に沈む夕日
    caption: "2026年10月、湘南"
---

本文をここに書く。Markdown がそのまま使える。
```

#### 各項目の意味

| キー | 必須 | 説明 |
|---|---|---|
| `title` | ✓ | 記事タイトル。一覧とページ見出しに出る |
| `date` | ✓ | `YYYY-MM-DD`。並び順と `formatDate` に使う |
| `category` | ✓ | 1つの分類。`nature` / `city` / `still-life` / `landscape` など |
| `tags` | | 複数可。`/tags/` ページで自動的にまとめられる |
| `description` | | 一覧カードと OGP の説明。空でも動く |
| `cover` | | 一覧サムネに使う画像の `id`。省略時は先頭の画像 |
| `images` | ✓ | 1枚以上 |

#### `images` の各項目

| キー | 説明 |
|---|---|
| `id` | 記事内で一意な識別子。16桁 hex。アンカーリンク `#photo-<id>` にも使う |
| `photoId` | `public/media/<photoId>/` のディレクトリ名。`add-photos` が出す値 |
| `v` | キャッシュ避けのバージョン。写真を差し替えたら上げる |
| `w` / `h` | 元画像の実寸。縦横比の計算に使う（表示はこの比率で固定される） |
| `widths` | 生成したサイズの一覧。`add-photos` が出す値 |
| `color` | 読み込み中に敷く平均色。`#rrggbb` |
| `alt` | 代替テキスト。**必ず書く**（空文字はスキーマで弾かれる） |
| `caption` | 任意。写真の下に出るクレジットや一言 |

### 4. 確認してデプロイ

```bash
bun run dev      # http://localhost:4321 で確認
bun run check    # frontmatter の検証（スキーマ違反はここで落ちる）
```

`main` に push すれば GitHub Actions がビルドして Cloudflare へデプロイする。

## よくある失敗

**`images.N.alt: String must contain at least 1 character(s)`**
`alt` が空。写真の内容を書く。

**`images.N.photoId: Invalid input`**
`photoId` の形式違い。数値（旧 picsum 記事の名残）か 16桁 hex（`add-photos` 由来）のみ。

**写真が表示されない（本番だけ404）**
`src/content/posts/_assets/` に原本が入っているか確認する。`public/media/` は git 管理外なので、原本が無いと CI で生成できない。`bun run assets` で再生成できる。

**写真を差し替えたのに古いのが出る**
`v` を 1 上げる。URL のキャッシュキーになっている。

## 構成

```
src/
├── components/
│   ├── GalleryImage.astro   # 記事内の1枚（picture・srcset・キャプション）
│   └── PostCard.astro       # 一覧のカード
├── content/
│   └── posts/YYYY/MM/*.md   # 記事本体
├── content.config.ts        # スキーマ（ここを変えると全記事が再検証される）
├── layouts/BaseLayout.astro # head・ヘッダー・フッター
├── lib/gallery.ts           # 画像 URL の組み立てと日付整形
├── pages/
│   ├── index.astro          # 一覧
│   ├── posts/[...id].astro  # 記事ページ
│   ├── tags/index.astro     # タグ別インデックス
│   ├── about.astro
│   ├── 404.astro
│   └── rss.xml.ts
└── styles/global.css        # デザイントークンと共通スタイル

scripts/
├── fetch-images.mjs   # picsum 由来の写真を生成（既存記事用）
├── render-assets.mjs  # _assets/ の原本から配信用画像を生成
├── add-photos.mjs     # 手持ちの写真を取り込む（原本も保存）
└── new-post.mjs       # 記事の雛形

worker/
├── index.ts           # 計測ビーコン（/__a.gif）と /admin
├── admin.ts           # 集計画面と SVG グラフ
└── schema.sql         # D1 のテーブル定義
```

## アクセス解析

自前の軽量解析。外部サービスもクライアント JS も使わない。

- `BaseLayout.astro` の末尾に 1×1 の `<img src="/__a.gif?p=<path>">` を置いている。これが計測のすべて。
- `wrangler.toml` の `run_worker_first` で `/__a.gif` と `/admin` だけ Worker に通す。**それ以外の静的アセットは Worker を通らない**ので、表示速度は落ちない。ここを触るときは必ずこの前提を守る。
- Worker は D1（`yohaku-analytics`）に 1 行書いてから GIF を返す。ボット（UA 判定）と `Sec-Purpose: prefetch` は数えない。
- `/admin` は Basic 認証。パスワードは Worker のシークレット `ADMIN_PASS`。
- ローカルの D1 は空なので `/admin` は「データなし」から始まる。見た目を確認するときはダミーを入れる。

```bash
bun run worker                       # ローカルで Worker を起動
bun run db:local                     # ローカル D1 にスキーマ
bun run db:schema                    # 本番 D1 にスキーマ
wrangler secret put ADMIN_PASS       # 管理画面のパスワード
```

## 技術的な前提

- **Astro 7** / Node 22.23.4 以上
- クライアント JS ゼロ、Web フォントなし、CSS 約 11KB
- 画像は AVIF + WebP の `<picture>`。1x は 860px、Retina は 1280px を選ぶ
- デプロイ先は Cloudflare Workers の静的アセット（`wrangler.toml`）
