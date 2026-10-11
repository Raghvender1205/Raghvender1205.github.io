import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getWriting, writingHref } from '../lib/content';

export async function GET(context: APIContext) {
  const entries = await getWriting();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: writingHref(entry),
    })),
  });
}
