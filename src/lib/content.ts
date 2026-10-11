import { getCollection, type CollectionEntry } from 'astro:content';
import { sections, type SectionKey } from '../data/site';

// Drafts show up in `npm run dev` and are left out of the built site.
const visible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

export type WritingEntry = CollectionEntry<SectionKey> & { section: SectionKey };
export type ProjectEntry = CollectionEntry<'projects'>;

export async function getSection(section: SectionKey): Promise<WritingEntry[]> {
  const entries = await getCollection(section, visible);
  return entries
    .map((entry) => ({ ...entry, section }))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getWriting(): Promise<WritingEntry[]> {
  const all = await Promise.all((Object.keys(sections) as SectionKey[]).map(getSection));
  return all.flat().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects', visible);
  return entries.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

// A project with only frontmatter is a card; one with a body also gets a case-study page.
export const hasBody = (entry: { body?: string }) => Boolean(entry.body?.trim());

export const writingHref = (entry: WritingEntry) =>
  entry.data.external ?? `/${entry.section}/${entry.id}/`;

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatMonth = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
