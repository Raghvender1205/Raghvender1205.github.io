import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Phosphor icons (regular weight), read from the package at build time and inlined as SVG.
// Browse names at https://phosphoricons.com
const cache = new Map<string, string>();

export function icon(name: string): string {
  let svg = cache.get(name);
  if (!svg) {
    const file = join(process.cwd(), 'node_modules/@phosphor-icons/core/assets/regular', `${name}.svg`);
    svg = readFileSync(file, 'utf8').replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
    cache.set(name, svg);
  }
  return svg;
}
