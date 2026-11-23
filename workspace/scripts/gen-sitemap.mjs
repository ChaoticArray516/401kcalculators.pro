import { mkdir, writeFile } from 'node:fs/promises';
import dates from '../src/data/pages/dates.json' with { type: 'json' };

const origin = 'https://401kcalculators.pro';
const routes = Object.keys(dates).sort((a, b) => a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b));
const body = routes.map((route) => `  <url>\n    <loc>${origin}${route}</loc>\n    <lastmod>${dates[route].modifiedOn}</lastmod>\n  </url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
await mkdir('dist', { recursive: true });
await writeFile('dist/sitemap.xml', xml, 'utf8');
