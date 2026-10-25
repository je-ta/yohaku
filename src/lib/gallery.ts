/** 画像 URL の組み立てと、記事データの整形をまとめたユーティリティ。 */

export type GalleryImage = {
  id: string;
  photoId: number | string;
  v: number;
  w: number;
  h: number;
  widths: number[];
  color: string;
  alt: string;
  caption?: string;
};

/**
 * 画像はビルド前に `scripts/fetch-images.mjs` が public/media へ生成する。
 * 配信は同一オリジンなので、リダイレクトも別ドメインへの接続も発生しない。
 */
export const MEDIA_DIR = 'media';

/** 画像の縦横比を CSS の aspect-ratio 用文字列にする。 */
export function aspectRatio(image: Pick<GalleryImage, 'w' | 'h'>): string {
  return `${image.w} / ${image.h}`;
}

/**
 * 生成済みサイズの別名。記事の最大表示幅は 860px なので、
 * 1280 は高解像度端末向けの 1.5x 相当として扱う。
 */
const FILE_WIDTHS: Record<number, number> = { 320: 320, 640: 640, 860: 860, 1280: 1280 };

/** 配信フォーマット。AVIF を先に、WebP をフォールバックにする。 */
export type ImageFormat = 'avif' | 'webp';

/** 指定幅・形式の画像 URL。生成済みのサイズだけを指す。 */
export function imageUrl(
  image: Pick<GalleryImage, 'photoId'>,
  width: number,
  format: ImageFormat = 'avif',
): string {
  const file = FILE_WIDTHS[width] ?? width;
  return `${MEDIA_DIR}/${image.photoId}/${file}.${format}`;
}

/** public/ 配下なので base を前置した URL。 */
export function mediaUrl(
  image: Pick<GalleryImage, 'photoId'>,
  width: number,
  format: ImageFormat = 'avif',
): string {
  return url(imageUrl(image, width, format));
}

/** 指定形式の srcset 候補。 */
export function imageSrcSet(image: GalleryImage, format: ImageFormat = 'avif'): string {
  return image.widths.map((w) => `${mediaUrl(image, w, format)} ${w}w`).join(', ');
}

/** 一覧用のサムネイル。最小幅を使う。 */
export function thumbUrl(image: GalleryImage, format: ImageFormat = 'avif'): string {
  return imageUrl(image, Math.min(...image.widths), format);
}

/** 記事の表紙画像を決める。cover 指定がなければ先頭の画像。 */
export function coverImage<T extends GalleryImage>(images: T[], cover?: string | null): T {
  if (!cover) return images[0]!;
  return images.find((img) => img.id === cover) ?? images[0]!;
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** ISO 形式 (YYYY-MM-DD)。<time datetime> 用。 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** タグの表示名。スラッグをそのまま出したくないものはここで吸収する。 */
export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ');
}

/**
 * サブパス配信（GitHub Pages など）に対応するためのリンク組み立て。
 * BASE_URL は末尾スラッシュ付き（'/' か '/repo/'）で渡ってくる。
 */
const BASE = import.meta.env.BASE_URL;

export function url(path: string): string {
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  return base + path.replace(/^\//, '');
}

/** 記事の ID から記事 URL を作る。 */
export function postUrl(id: string): string {
  return url(`posts/${id}/`);
}
