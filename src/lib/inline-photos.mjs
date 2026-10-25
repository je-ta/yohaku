/**
 * Markdown 本文に写真を差し込むための satteri プラグイン。
 *
 * `![alt](photo:<photoId>)` を、public/media に生成済みの AVIF / WebP を
 * 使う <picture> に置き換える。frontmatter の images と同じ写真を本文の
 * 好きな位置に置ける。
 *
 * 幅はその記事の frontmatter にある `widths` を読む。public/media/ は
 * git 管理外で、CI の型チェック時点ではまだ生成されていないため、
 * ディスクを見に行くと本番ビルドが落ちる。frontmatter が唯一の正で、
 * 実際に書き出される幅と一致している。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineHastPlugin } from 'satteri';

const SIZES = '(min-width: 1000px) 860px, (min-width: 680px) 90vw, 100vw';

/** frontmatter から、その photoId の `widths` を読む。 */
function widthsFromFrontmatter(source, id) {
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!front) return [];
  const fm = front[1];

  const entry = fm.search(new RegExp(`^\\s*-\\s*id:\\s*["']?${id}["']?\\s*$`, 'm'));
  if (entry < 0) return [];

  const rest = fm.slice(entry);
  const key = rest.match(/^\s*widths:\s*(.*)$/m);
  if (!key) return [];

  // インライン配列: widths: [320, 640, 860]
  const inline = key[1].trim();
  if (inline.startsWith('[')) {
    return inline
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((v) => Number.parseInt(v.trim(), 10))
      .filter(Number.isInteger);
  }

  // ブロック配列: widths:\n  - 320\n  - 640
  const widths = [];
  for (const line of rest.slice(key.index + key[0].length).split(/\r?\n/)) {
    const item = line.match(/^\s+-\s*(\d+)\s*$/);
    if (item) {
      widths.push(Number.parseInt(item[1], 10));
      continue;
    }
    if (line.trim() === '') continue;
    break;
  }
  return widths;
}

/** public/media/<photoId>/ を実際に見て幅を拾う（ローカル用の保険）。 */
function widthsFromDisk(mediaRoot, id) {
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

  /** 記事ごとに「本文の最初の画像か」を数えるためのカウンタ。 */
  const seen = new Map();

  return defineHastPlugin({
    name: 'inline-photos',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const raw = node.properties?.src;
        if (typeof raw !== 'string' || !raw.startsWith('photo:')) return;
        const id = raw.slice('photo:'.length);
        const alt = typeof node.properties?.alt === 'string' ? node.properties.alt : '';

        // 本文の最初の 1 枚は LCP になりやすいので、遅延させずに先に取らせる。
        // 2 枚目以降は lazy のまま（画面外の画像で帯域を使わない）。
        // fileURL は毎回別インスタンスで来ることがあるので、文字列にして数える。
        const key = ctx.fileURL?.href ?? 'unknown';
        const index = seen.get(key) ?? 0;
        seen.set(key, index + 1);
        const priority = index === 0;

        // ctx.source は frontmatter が除かれた本文だけなので、元ファイルを読む
        let sourceText = '';
        if (ctx.fileURL) {
          try {
            sourceText = readFileSync(fileURLToPath(ctx.fileURL), 'utf8');
          } catch {
            sourceText = '';
          }
        }
        const widths = widthsFromFrontmatter(sourceText, id).sort((a, b) => a - b);
        const resolved = widths.length > 0 ? widths : widthsFromDisk(mediaRoot, id);
        if (resolved.length === 0) {
          throw new Error(
            `本文の画像 photo:${id} が frontmatter の images にありません。add-photos の出力を frontmatter に貼ってください。`,
          );
        }
        // 表示幅 860px を超える最大のものをフォールバックにする
        const fallback = resolved.find((w) => w >= 860) ?? resolved[resolved.length - 1];

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
                srcSet: srcset(id, resolved, 'avif'),
                sizes: SIZES,
              },
              children: [],
            },
            {
              type: 'element',
              tagName: 'source',
              properties: {
                type: 'image/webp',
                srcSet: srcset(id, resolved, 'webp'),
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
                loading: priority ? 'eager' : 'lazy',
                fetchpriority: priority ? 'high' : 'auto',
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
