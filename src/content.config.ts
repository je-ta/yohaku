import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const imageSchema = z.object({
  /** 画像を一意に識別する ID（例: 7d19fab2a31f4142） */
  id: z.string().regex(/^[0-9a-f]{8,32}$/),
  /**
   * 画像ファイルの識別子。public/media/<photoId>/ のディレクトリ名になる。
   * picsum から取り込む既存記事は数値、自分で撮った写真はファイル由来の hex 文字列。
   */
  photoId: z.union([z.number().int().nonnegative(), z.string().regex(/^[0-9a-f]{8,32}$/)]),
  /** 画像のバージョン。URL のキャッシュキーとして使う。 */
  v: z.number().int().nonnegative().default(1),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  widths: z.array(z.number().int().positive()).min(1),
  /** 読み込み中に敷くプレースホルダ色 (#rrggbb) */
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    /** 記事の分類。一覧の絞り込みに使う。 */
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    description: z.string().default(''),
    /** 一覧・OGP に使う表紙。省略時は先頭の画像。 */
    cover: z.string().optional(),
    images: z.array(imageSchema).min(1),
  }),
});

export const collections = { posts };
