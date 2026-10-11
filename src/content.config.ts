import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { projectGroups, type ProjectGroupKey } from './data/site';

// Files starting with an underscore (the _template.md files) are ignored.
const markdownIn = (folder: string) =>
  glob({ base: `./src/content/${folder}`, pattern: '**/[^_]*.md' });

const groupKeys = Object.keys(projectGroups) as [ProjectGroupKey, ...ProjectGroupKey[]];

const projects = defineCollection({
  loader: markdownIn('projects'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    group: z.enum(groupKeys),
    // "owner/name" on GitHub. Stars, language and last update are filled in from it at build time.
    repo: z.string().optional(),
    demo: z.url().optional(),
    paper: z.url().optional(),
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

const writingSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  // Paper or source being discussed (mainly for research notes).
  source: z.object({ title: z.string(), url: z.url() }).optional(),
  // Set when the piece lives elsewhere; the listing then links straight out.
  external: z.url().optional(),
  draft: z.boolean().default(false),
});

const writing = (folder: string) =>
  defineCollection({ loader: markdownIn(folder), schema: writingSchema });

export const collections = {
  projects,
  blog: writing('blog'),
  notes: writing('notes'),
  maths: writing('maths'),
};
