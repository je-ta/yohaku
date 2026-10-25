import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { mediaUrl, postUrl } from '../lib/gallery';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: 'Image Gallery Samples',
    description: '写真で見るサンプルギャラリー。',
    site: context.site ?? context.url.origin,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post.id),
      enclosure: {
        url: new URL(mediaUrl(post.data.images[0], 1280, 'webp'), context.site ?? context.url).href,
        type: 'image/webp',
        // 正確なバイト数は生成時に確定しないので 0（不明）として扱う
        length: 0,
      },
      categories: post.data.tags,
    })),
    customData: '<language>ja</language>',
  });
}
