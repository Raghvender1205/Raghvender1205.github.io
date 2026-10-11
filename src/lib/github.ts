import { site } from '../data/site';

// Public repositories, fetched once per build from the public GitHub API.
// The endpoint only ever returns public repos, so private work cannot leak onto the site.

export interface Repo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  pushedAt: Date;
}

let cached: Promise<Repo[]> | undefined;

async function fetchRepos(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': site.githubUser,
  };
  // Optional: only raises the rate limit.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const repos: Repo[] = [];
  try {
    for (let page = 1; ; page++) {
      const res = await fetch(
        `https://api.github.com/users/${site.githubUser}/repos?type=owner&sort=pushed&per_page=100&page=${page}`,
        { headers },
      );
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      const batch: any[] = await res.json();
      for (const r of batch) {
        if (r.fork || r.private) continue;
        repos.push({
          name: r.name,
          fullName: r.full_name,
          description: r.description ?? '',
          url: r.html_url,
          stars: r.stargazers_count,
          language: r.language,
          pushedAt: new Date(r.pushed_at),
        });
      }
      if (batch.length < 100) break;
    }
  } catch (error) {
    // The site still builds without GitHub data; cards just omit their stats.
    console.warn(`[github] Could not load repositories: ${(error as Error).message}`);
    return [];
  }
  return repos;
}

export function getRepos(): Promise<Repo[]> {
  cached ??= fetchRepos();
  return cached;
}

export async function getRepo(fullName: string | undefined): Promise<Repo | undefined> {
  if (!fullName) return undefined;
  const repos = await getRepos();
  return repos.find((r) => r.fullName.toLowerCase() === fullName.toLowerCase());
}

export async function getLanguageCounts(limit = 6): Promise<{ language: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const repo of await getRepos()) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
