/** 画像 URL の組み立てと、記事データの整形をまとめたユーティリティ。 */

export type GalleryImage = {
  id: string;
  photoId: number;
  v: number;
  w: number;
  h: number;
  widths: number[];
  color: string;
  alt: string;
  caption?: string;
};

/** 配信元のベース URL。テストや別 CDN へ移すときはここを差し替える。 */
export const IMAGE_BASE = 'https://picsum.photos';

/** 画像の縦横比を CSS の aspect-ratio 用文字列にする。 */
export function aspectRatio(image: Pick<GalleryImage, 'w' | 'h'>): string {
  return `${image.w} / ${image.h}`;
}

/**
 * 指定幅の画像 URL を作る。高さは元画像の縦横比から計算するので、
 * 幅を変えても構図が崩れない。`v` は差し替え時のキャッシュ避け。
 */
export function imageUrl(
  image: Pick<GalleryImage, 'photoId' | 'v' | 'w' | 'h'>,
  width: number,
  format: 'webp' | 'jpeg' = 'webp',
): string {
  const ext = format === 'webp' ? '.webp' : '.jpg';
  const height = Math.max(1, Math.round((width * image.h) / image.w));
  return `${IMAGE_BASE}/id/${image.photoId}/${width}/${height}${ext}?v=${image.v}`;
}

/** srcset 用の候補。元画像より大きい幅は切り捨てる。 */
export function imageSrcSet(image: GalleryImage): string {
  return image.widths
    .filter((w) => w <= image.w)
    .map((w) => `${imageUrl(image, w)} ${w}w`)
    .join(', ');
}

/** 一覧用のサムネイル。最小幅を使う。 */
export function thumbUrl(image: GalleryImage): string {
  return imageUrl(image, Math.min(...image.widths));
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
 * GitHub Pages のサブパス配信に対応するためのリンク組み立て。
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
