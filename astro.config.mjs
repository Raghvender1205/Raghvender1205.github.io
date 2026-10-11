import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://raghvender1205.github.io',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    // remark/rehype pipeline, for LaTeX maths rendered with KaTeX
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  // URLs of the old hand-written pages
  redirects: {
    '/blogs/blog.html': '/blog/',
    '/projects/projects.html': '/projects/',
    '/research-notes/research.html': '/notes/',
    '/maths/maths.html': '/maths/',
  },
});
