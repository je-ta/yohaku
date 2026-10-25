import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// サイトの URL。GitHub Pages で <user>.github.io/<repo>/ に出す場合は
// site に https://<user>.github.io、base に '/<repo>' を入れる。
const site = process.env.SITE_URL ?? 'https://yohaku.je-ta-gallery.workers.dev';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  // v7 の既定は 'jsx' だが、日本語の文中の改行が空白に化けるので HTML 準拠に戻す
  compressHTML: true,
  build: {
    format: 'directory',
    // ページ内の画像はほぼ全部 <img> 直書きなので、ビルド時に最適化せず素直に配る
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
  },
});
