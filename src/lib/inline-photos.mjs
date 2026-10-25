/**
 * Markdown 本文に写真を差し込むための satteri プラグイン。
 *
 * `![alt](photo:<photoId>)` を、public/media に生成済みの AVIF / WebP を
 * 使う <picture> に置き換える。frontmatter の images と同じ写真を本文の
 * 好きな位置に置ける。
 *
 * 生成済みの幅は public/media/<photoId>/ を実際に見て決める。元画像が
 * 768px のように小さいと 860 は書き出されないため、決め打ちにすると 404 になる。
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineHastPlugin } from 'satteri';

const SIZES = '(min-width: 1000px) 860px, (min-width: 680px) 90vw, 100vw';

/** public/media/<photoId>/ にある数値ファイル名から、生成済みの幅を拾う。 */
function widthsFor(mediaRoot, id) {
  try {
    return readdirSync(join(mediaRoot, id))
      .map((name) => Number.parseInt(name, 10))
      .filter((w) => Number.isInteger(w) && w > 0)
      .filter((w, i, all) => all.indexOf(w) === i)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function inlinePhotos(options = {}) {
  const base = options.base ?? '/';
  const mediaRoot = options.mediaRoot ?? 'public/media';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const src = (id, w, ext) => `${prefix}media/${id}/${w}.${ext}`;
  const srcset = (id, widths, ext) => widths.map((w) => `${src(id, w, ext)} ${w}w`).join(', ');

  return defineHastPlugin({
    name: 'inline-photos',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const raw = node.properties?.src;
        if (typeof raw !== 'string' || !raw.startsWith('photo:')) return;
        const id = raw.slice('photo:'.length);
        const alt = typeof node.properties?.alt === 'string' ? node.properties.alt : '';

        const widths = widthsFor(mediaRoot, id);
        if (widths.length === 0) {
          throw new Error(
            `本文の画像 photo:${id} が見つかりません。bun run add-photos で取り込むか、bun run assets で再生成してください。`,
          );
        }
        // 表示幅 860px を超える最大のものをフォールバックにする
        const fallback = widths.find((w) => w >= 860) ?? widths[widths.length - 1];

        ctx.replaceNode(node, {
          type: 'element',
          tagName: 'picture',
          properties: { className: ['post__inline-photo'] },
          children: [
            {
              type: 'element',
              tagName: 'source',
              properties: {
                type: 'image/avif',
                srcSet: srcset(id, widths, 'avif'),
                sizes: SIZES,
              },
              children: [],
            },
            {
              type: 'element',
              tagName: 'source',
              properties: {
                type: 'image/webp',
                srcSet: srcset(id, widths, 'webp'),
                sizes: SIZES,
              },
              children: [],
            },
            {
              type: 'element',
              tagName: 'img',
              properties: {
                src: src(id, fallback, 'webp'),
                alt,
                loading: 'lazy',
                decoding: 'async',
              },
              children: [],
            },
          ],
        });
      },
    },
  });
}
