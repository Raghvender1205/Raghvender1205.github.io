import { profile, projectGroups, sections, site, type ProjectGroupKey, type SectionKey } from '../data/site';
import { education, experience, publications } from '../data/experience';
import { formatDate, formatMonth, getProjects, getSection, hasBody, writingHref } from './content';
import { getLanguageCounts, getRepo, getRepos } from './github';

// The home page network. It is generated from the same content and data files as the rest of
// the site, so a new project or post shows up as a node without touching this file.

export type NetColor = 'blue' | 'green' | 'orange' | 'purple' | 'red';

export interface NetLink {
  label: string;
  href: string;
}

export interface NetNode {
  id: string;
  label: string;
  icon: string;
  // Category colour for a top-level branch; its descendants inherit it.
  color?: NetColor;
  title: string;
  meta?: string;
  text?: string[];
  facts?: { term: string; detail: string }[];
  list?: string[];
  links?: NetLink[];
  children?: NetNode[];
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function backgroundNode(): NetNode {
  const roles: NetNode[] = experience.map((role) => ({
    id: slug(`${role.title} ${role.org} ${role.start}`),
    label: `${role.title}, ${role.org}`,
    icon: 'briefcase',
    title: `${role.title}, ${role.org}`,
    meta: `${role.start} – ${role.end}`,
    list: role.highlights.slice(0, 4),
    links: [{ label: 'Full history', href: '/about/' }],
  }));

  const papers: NetNode[] = publications.map((paper) => ({
    id: slug(paper.title),
    label: `Paper: ${paper.venue}, ${paper.year}`,
    icon: 'book-open',
    title: paper.title,
    meta: `${paper.venue} · ${paper.year}`,
    links: [{ label: 'Read the paper', href: paper.url }],
  }));

  const degrees: NetNode[] = education.map((item) => ({
    id: slug(item.school),
    label: item.school,
    icon: 'graduation-cap',
    title: item.degree,
    meta: `${item.school} · ${item.start} – ${item.end}`,
  }));

  return {
    id: 'background',
    label: 'Background',
    icon: 'briefcase',
    color: 'purple',
    title: 'Background',
    text: ['Where I have worked, what I studied and what I have published. Pick a role for the detail.'],
    links: [{ label: 'Full history', href: '/about/' }],
    children: [...roles, ...papers, ...degrees],
  };
}

async function projectsNode(): Promise<NetNode> {
  const projects = await getProjects();

  const groups: NetNode[] = [];
  for (const key of Object.keys(projectGroups) as ProjectGroupKey[]) {
    const inGroup = projects.filter((project) => project.data.group === key);
    if (inGroup.length === 0) continue;

    const children: NetNode[] = [];
    for (const project of inGroup) {
      const { title, summary, stack, repo, demo, paper } = project.data;
      const github = await getRepo(repo);
      const meta = [...stack];
      if (github?.stars) meta.push(`★ ${github.stars}`);
      if (github) meta.push(`updated ${formatMonth(github.pushedAt)}`);

      const links: NetLink[] = [];
      if (hasBody(project)) links.push({ label: 'Read the case study', href: `/projects/${project.id}/` });
      if (repo) links.push({ label: 'Code', href: `https://github.com/${repo}` });
      if (demo) links.push({ label: 'Demo', href: demo });
      if (paper) links.push({ label: 'Paper', href: paper });

      children.push({
        id: project.id,
        label: title,
        icon: 'code',
        title,
        meta: meta.join(' · '),
        text: [summary],
        links,
      });
    }

    groups.push({
      id: key,
      label: projectGroups[key].label,
      icon: 'stack',
      title: projectGroups[key].label,
      text: [projectGroups[key].blurb],
      children,
    });
  }

  return {
    id: 'projects',
    label: 'Projects',
    icon: 'cube',
    color: 'blue',
    title: 'Projects',
    text: ['Things I have built, mostly to understand how something works. Pick a group.'],
    links: [{ label: 'All projects', href: '/projects/' }],
    children: groups,
  };
}

const sectionIcons: Record<SectionKey, string> = {
  blog: 'article',
  notes: 'flask',
  maths: 'function',
};

async function writingNode(): Promise<NetNode> {
  const children: NetNode[] = [];
  for (const key of Object.keys(sections) as SectionKey[]) {
    const entries = await getSection(key);
    children.push({
      id: key,
      label: sections[key].label,
      icon: sectionIcons[key],
      title: sections[key].label,
      text: [sections[key].blurb, ...(entries.length === 0 ? ['Nothing published here yet.'] : [])],
      links: [{ label: `All ${sections[key].label.toLowerCase()}`, href: `/${key}/` }],
      children: entries.slice(0, 6).map((entry) => ({
        id: entry.id,
        label: entry.data.title,
        icon: 'file-text',
        title: entry.data.title,
        meta: formatDate(entry.data.date),
        text: [entry.data.description],
        links: [{ label: 'Read it', href: writingHref(entry) }],
      })),
    });
  }

  return {
    id: 'writing',
    label: 'Writing',
    icon: 'pencil-simple',
    color: 'orange',
    title: 'Writing',
    text: ['Essays, notes on papers, and the maths behind the machine learning.'],
    children,
  };
}

async function githubNode(): Promise<NetNode> {
  const repos = await getRepos();
  const languages = await getLanguageCounts();
  const profileUrl = `https://github.com/${site.githubUser}`;

  return {
    id: 'github',
    label: 'GitHub',
    icon: 'github-logo',
    color: 'green',
    title: 'On GitHub',
    text:
      repos.length > 0
        ? [`${repos.length} public repositories. The next layer shows the ones I touched most recently.`]
        : [],
    facts: languages.map(({ language, count }) => ({ term: language, detail: `${count} repositories` })),
    links: [{ label: `github.com/${site.githubUser}`, href: profileUrl }],
    children: repos.slice(0, 6).map((repo) => ({
      id: slug(repo.name),
      label: repo.name,
      icon: 'code',
      title: repo.name,
      meta: [repo.language, `updated ${formatMonth(repo.pushedAt)}`].filter(Boolean).join(' · '),
      text: repo.description ? [repo.description] : [],
      links: [{ label: 'Open repository', href: repo.url }],
    })),
  };
}

function contactNode(): NetNode {
  return {
    id: 'contact',
    label: 'Contact',
    icon: 'envelope-simple',
    color: 'red',
    title: 'Get in touch',
    text: ['Email is the best way to reach me.'],
    links: [
      { label: profile.email, href: `mailto:${profile.email}` },
      ...(profile.resumeUrl ? [{ label: 'Resume (PDF)', href: profile.resumeUrl }] : []),
      ...profile.links,
    ],
  };
}

export async function buildNetwork(): Promise<NetNode> {
  return {
    id: 'root',
    label: profile.name,
    icon: 'user',
    title: `${profile.role}, ${profile.company}`,
    meta: profile.location,
    facts: profile.glance,
    links: [
      { label: profile.email, href: `mailto:${profile.email}` },
      ...(profile.resumeUrl ? [{ label: 'Resume (PDF)', href: profile.resumeUrl }] : []),
      ...profile.links.slice(0, 2),
    ],
    children: [backgroundNode(), await projectsNode(), await writingNode(), await githubNode(), contactNode()],
  };
}

// Every icon name the network uses, so the page can inline just those.
export function iconNames(node: NetNode, names = new Set<string>()): Set<string> {
  names.add(node.icon);
  node.children?.forEach((child) => iconNames(child, names));
  return names;
}
