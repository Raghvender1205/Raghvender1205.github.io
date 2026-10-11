# Raghvender's portfolio

Source of <https://raghvender1205.github.io>, built with [Astro](https://astro.build) and deployed to GitHub Pages on every push to `master`.

```bash
npm install
npm run dev      # local preview, drafts included
npm run build    # production build into dist/
```

## Adding content

Each kind of content is a Markdown file in a folder. Copy the `_template.md` in that folder, rename it, and fill it in. The file name becomes the URL.

| To add | Create a file in | It appears at |
| ------ | ---------------- | ------------- |
| A project | `src/content/projects/` | `/projects/` |
| A blog post | `src/content/blog/` | `/blog/<file-name>/` |
| A research note | `src/content/notes/` | `/notes/<file-name>/` |
| A maths write-up | `src/content/maths/` | `/maths/<file-name>/` |

- **Projects:** frontmatter alone gives a card. Write a body under it and the card links to a case-study page at `/projects/<file-name>/`. Set `featured: true` to put it on the home page. Set `repo` and the card picks up stars and last-updated date from GitHub.
- **Writing:** `draft: true` keeps a piece out of the published site while still showing it in `npm run dev`. LaTeX maths (`$...$` and `$$...$$`) and highlighted code blocks work everywhere.

The network on the home page is generated from these same files, so new projects and posts appear in it as nodes automatically (`src/lib/network.ts` decides what goes in each layer).

## Editing the rest

| What | Where |
| ---- | ----- |
| Intro, "at a glance" facts, links, navigation, resume link | `src/data/site.ts` |
| Work history, education, publications | `src/data/experience.ts` |
| Project groups and writing sections | `src/data/site.ts` |
| Colours and fonts | `src/styles/global.css` (font files are in `public/fonts/`) |
| Icons | Phosphor, by name, through `src/components/Icon.astro` |

The "On GitHub" section and project stats come from the public GitHub API at build time, so only public repositories can appear. The site also rebuilds weekly to keep them current.
