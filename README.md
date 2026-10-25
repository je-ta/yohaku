# 余白 / Yohaku

写真を主役にした、静的なフォトギャラリーのサンプルサイト。Astro で組み立てていて、ビルド後は完全な静的ファイル（JS ゼロ・CSS 約 11KB）になる。

## 特徴

- **速い** — クライアント JS なし。Web フォントも読まない。CSS は 2 ファイル合計約 11KB。
- **画像はローカル配信** — `scripts/fetch-images.mjs` が webp を 320/640/1280 で生成し `public/media` に置く。同一オリジンなのでリダイレクトも外部接続もなく、CDN キャッシュがそのまま効く。`srcset` で出し分け、読み込み中は平均色を敷き、記事の先頭画像は `preload` する。
- **記事は Markdown** — frontmatter に画像メタデータを書くだけで一覧・タグ・RSS・サイトマップに反映される。
- **スキーマ検証** — Content Collections の Zod スキーマが frontmatter の書き間違いをビルド時に落とす。
- **ライト/ダーク** — OS 設定に追従（`prefers-color-scheme`）。

## はじめかた

```bash
bun install
bun run dev        # http://localhost:4321
```

Node 22.23.4 以上が必要（Astro 7 の要件）。パッケージマネージャは bun を想定しているけど、npm / pnpm でも動く。

## コマンド

| コマンド | 内容 |
|---|---|
| `bun run dev` | 開発サーバー |
| `bun run build` | `dist/` に静的ファイルを出力 |
| `bun run preview` | ビルド結果をローカルで確認 |
| `bun run check` | 型チェック（`astro check`） |
| `bun run new-post` | 記事の雛形を作る |
| `bun run add-photos` | 手持ちの写真を取り込む（frontmatter も出力） |
| `bun run images` | サンプル画像を再生成する（`--force` で作り直し） |

## 記事を追加する

書き方の詳細は [CLAUDE.md](./CLAUDE.md) にある。

```bash
bun run new-post
bun run add-photos ~/Pictures/*.jpg   # 自分の写真を使うとき
```

`src/content/posts/YYYY/MM/YYYY-MM-DD-slug.md` が生成される。手で書く場合の frontmatter はこう。

```yaml
---
title: 空の色をたどって
date: 2026-10-16
category: nature
tags:
  - sky
  - mountain
description: 一覧に出る短い説明。
images:
  - id: 7d19fab2a31f4142      # 記事内で一意な ID（16 桁の hex）
    photoId: 60               # 配信元の写真 ID
    v: 1                      # 差し替え時のキャッシュ避け
    w: 1920                   # 元画像の幅
    h: 1200                   # 元画像の高さ
    widths: [320, 640, 1280]  # srcset に並べる幅
    color: "#545556"          # 読み込み中に敷く平均色
    alt: サンプル写真 1
    caption: "Photo: Vadim Sherbakov / Unsplash"
---

本文をここに書く。
```

`cover` に画像 `id` を指定すると、一覧のサムネイルをその写真にできる（未指定なら先頭）。

## 構成

```
src/
├── components/
│   ├── GalleryImage.astro   # 記事内の 1 枚（srcset・キャプション・アンカー）
│   └── PostCard.astro       # 一覧のカード
├── content/
│   └── posts/YYYY/MM/*.md   # 記事本体
├── content.config.ts        # コレクションとスキーマ
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
```

## デプロイ

### Cloudflare Pages（推奨）

`wrangler.toml` の `[assets] directory` が `./dist` を指している。`bun run build` の前に画像生成が走るので、`public/media` をコミットする必要はない。

```bash
bun run build
npx wrangler deploy
```

初回は `npx wrangler login` が必要。独自ドメインや本番 URL が決まったら、ビルド時に `SITE_URL` を渡す。

```bash
SITE_URL=https://gallery.example.com bun run build
```

### その他のホスティング

`dist/` をそのまま置けば動く。Netlify・Vercel・GitHub Pages いずれもビルドコマンド `bun run build`、出力先 `dist`。

GitHub Pages のサブパス配信（`https://<user>.github.io/<repo>/`）にするときは `base` も渡す。

```bash
BASE_PATH=/<repo> SITE_URL=https://<user>.github.io bun run build
```

## 写真について

掲載写真は [Lorem Picsum](https://picsum.photos/) が配信する [Unsplash](https://unsplash.com/) の写真で、[Unsplash License](https://unsplash.com/license) に従って利用している。クレジットは各写真の下に表示される。自分の写真に差し替えるときは `src/lib/gallery.ts` の `imageUrl()` / `imageSrcSet()` を自分のストレージに合わせて書き換える。

## ライセンス

コードは MIT。写真の権利は各撮影者に帰属する。
