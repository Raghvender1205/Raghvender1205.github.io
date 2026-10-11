# Raghvender's portfolio

Personal portfolio of Raghvender (Machine Learning Engineer II at HealthKart), live at <https://raghvender1205.github.io>. It is an Astro static site deployed to GitHub Pages. The home page is a navigable "neural network" generated from the content files.

## Working rules from the owner

These are instructions Raghvender has given. Follow them unless he says otherwise.

### Git and deployment

- **Work locally. Do not touch the remote unless asked.** Never push, and never delete or change anything on GitHub, without an explicit request in that message.
- **Commit only when asked.** Leave finished work uncommitted for him to look at first, and say that it is uncommitted.
- **New designs and larger changes go on a local branch.** He reviews on the dev server, then asks for a commit, then for a merge to `master` and a push.
- **Pushing to `master` deploys the live site.** After any push, watch the workflow run (`gh run watch`) and check the live URL. Do not report a deploy as done until the run has succeeded.

### Design

- **Nothing flashy.** No heavy animation, gradients or attention-seeking effects. Motion is limited to short fades.
- **The home page is the network.** Visitors move through the portfolio layer by layer. Keep that idea central when adding features.
- **Light theme only.** He does not want a black or dark site. Do not add `prefers-color-scheme: dark` styles back.
- **Reference for look and feel: <https://fanout.sh/daily>.** Fonts, icons and the neutral palette follow it: Overused Grotesk, IBM Plex Mono, Departure Mono, Phosphor icons.
- **A little colour, used sparingly.** The five category colours mark the network's branches. Everything else stays neutral grey.

### Content

- **Structure before content.** Adding a project, post or note must stay a matter of adding one Markdown file. Do not introduce a design that needs code changes per item.
- **Main audience: recruiters hiring ML/AI engineers.** He also wants the site to speak to backend/systems, ML-systems and research readers, but ML/AI engineering leads.
- **Ask him rather than guess.** For anything about his career, roles or opinions that is not in the repo, ask. He has offered to answer questions and to write up his MLE-2 work in detail.
- **Never invent facts or numbers.** Case studies are drafted from the actual repo code, README and commit history. Measurements must come from running the code; if there are none, say so in the text.
- **HealthKart work:** the resume bullets may be used as written. Beyond that, show public repositories only. Do not name private repos, internal code, data or metrics.
- **Contact:** show the email address. Do not publish his phone number.
- **LinkedIn cannot be read automatically** and he does not want it scraped. If profile data is needed, ask him.

### Known facts

- Roles at HealthKart: AI Intern (Sep 2023), SDE-1 (Aug 2024), MLE-2 (Apr 2026 to present), promoted straight from SDE-1.
- As MLE-2 he leads LLM and agent work, built the agent systems and their architecture inside the organisation, and mentors and reviews.
- His resume PDF is out of date (it still says SDE-1), so `profile.resumeUrl` is empty and the site shows no resume link.

## Commands

```bash
npm install
npm run dev      # dev server; drafts are visible
npm run build    # production build into dist/
```

There is no test suite or linter. `npm run build` is the check: it validates every content file against its schema.

## Layout

| Path | What it holds |
| ---- | ------------- |
| `src/content/projects/` | One Markdown file per project |
| `src/content/blog/`, `notes/`, `maths/` | Writing, one file per piece |
| `src/content.config.ts` | Frontmatter schemas for the above |
| `src/data/site.ts` | Profile, intro, links, navigation, project groups, writing sections |
| `src/data/experience.ts` | Work history, education, publications |
| `src/lib/network.ts` | Builds the home page network and the forward-pass tour from content and data |
| `src/lib/github.ts` | Fetches public repos from the GitHub API at build time |
| `src/lib/content.ts` | Collection queries, draft filtering, date formatting |
| `src/components/NetworkNav.astro` | The network: markup, client script and styles |
| `src/styles/global.css` | Colour tokens, fonts, `.label` and `.link`, Markdown prose styles |
| `public/fonts/` | Overused Grotesk and Departure Mono, with their licences |
| `.github/workflows/deploy.yml` | Build and deploy on push to `master`, plus a weekly rebuild |

## Adding content

Copy the `_template.md` in the relevant folder. The file name becomes the URL, and files starting with `_` are ignored.

- **Projects:** frontmatter alone makes a card. A body under it creates a case-study page at `/projects/<name>/`. `featured: true` puts it in the forward-pass tour (the first featured project by `order`). `group` must be a key of `projectGroups` in `src/data/site.ts`.
- **Writing:** `draft: true` shows a piece in dev and leaves it out of the build. LaTeX (`$...$`, `$$...$$`) and fenced code work in every section.
- **Quote frontmatter strings** that contain a colon, or the YAML will not parse.
- New content appears in the network automatically. Edit `src/lib/network.ts` only to change what the layers contain.

## Things that will trip you up

- **Markdown processor:** Astro 7 defaults to Sätteri, which does not run remark/rehype plugins. `astro.config.mjs` sets `processor: unified(...)` from `@astrojs/markdown-remark` so that `remark-math` and `rehype-katex` work. Keep it.
- **Lock file:** after adding or removing packages, the lock file has gone out of sync before and broken `npm ci` in the deploy. If that happens, delete `node_modules` and `package-lock.json`, run `npm install`, and commit the new lock file.
- **Network styles are global:** the nodes are created by script, so their CSS is in a `<style is:global>` block with a `net-` prefix. Scoped styles will not reach them.
- **Colours:** use the tokens (`--paper`, `--surface`, `--ink`, `--muted`, `--rule`, `--accent`, `--cat-*`), not raw hex values, in components.
- **GitHub data:** comes from the unauthenticated public API, so it can only ever contain public repos. If the fetch fails the build still succeeds and the stats are simply left out.
- **Empty collections:** the build warns that `notes` and `maths` are empty until they have a published file. That is expected.
- **No browser in the terminal session:** layout cannot be checked visually from here. Say so plainly and ask him to look, rather than claiming a design looks right.

## Writing style for site copy

First person, plain and specific. State what was built and what was measured. Include what is unfinished: he prefers an honest "not done yet" section to overclaiming.
