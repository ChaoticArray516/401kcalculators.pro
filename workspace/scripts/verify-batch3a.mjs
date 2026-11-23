import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import dates from '../src/data/pages/dates.json' with { type: 'json' };

const pages = {
  '/': {
    file: 'index.html',
    title: '401k Calculator — Project Your Balance and Match',
    description: 'Estimate your 401k balance year by year, including employer match and IRS 2027 limits. Free, no sign-up, nothing stored.',
    h1: '401k Calculator', inputs: 9, types: ['WebSite', 'Organization', 'WebPage', 'WebApplication'], words: [900, 1200],
  },
  '/retirement-calculator/': {
    file: 'retirement-calculator/index.html',
    title: 'Retirement Calculator — Withdrawal and Savings',
    description: 'Model retirement income from your 401k balance, yearly contributions and the withdrawal rate you choose. Every assumption is shown. Free, no sign-up.',
    h1: 'Retirement Calculator', inputs: 10, types: ['WebPage', 'BreadcrumbList', 'WebApplication'], words: [900, 1200],
  },
  '/methodology/': {
    file: 'methodology/index.html',
    title: 'Methodology and Assumptions',
    description: 'Every formula this site uses, the default values behind it, and the IRS figure each calculator cites. Written so you can check the math yourself.',
    h1: 'Methodology and Assumptions', types: ['WebPage', 'BreadcrumbList'], words: [1200, 1600],
  },
  '/about/': {
    file: 'about/index.html',
    title: 'About This Site and How It Is Maintained',
    description: 'Who runs this site, how each calculator is reviewed before publishing, when figures are updated, and how to report an error.',
    h1: 'About', types: ['WebPage', 'BreadcrumbList'], words: [400, 600],
  },
  '/privacy/': {
    file: 'privacy/index.html',
    title: 'Privacy Policy',
    description: 'What this site does and does not collect. Calculators run in your browser; we never ask for a Social Security number, account number or login.',
    h1: 'Privacy Policy', types: ['WebPage', 'BreadcrumbList'], words: [450, 700],
  },
  '/terms/': {
    file: 'terms/index.html',
    title: 'Terms of Use and Disclaimer',
    description: 'This site provides educational estimates, not financial, tax or investment advice. Read what these calculators can and cannot tell you before relying on one.',
    h1: 'Terms of Use', types: ['WebPage', 'BreadcrumbList'], words: [500, 800],
  },
};

const allowedInternal = new Set([...Object.keys(pages), '#content', '/favicon-32x32.png']);
const forbiddenSchema = new Set(['aggregateRating', 'review', 'HowTo', 'SearchAction', 'FAQPage']);
const faviconLink = '<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">';
const html = Object.fromEntries(Object.entries(pages).map(([route, page]) => {
  const full = path.join('dist', page.file);
  if (!fs.existsSync(full)) throw new Error(`Missing ${full}`);
  return [route, fs.readFileSync(full, 'utf8')];
}));
let failures = 0;
function check(id, condition, detail = '') {
  if (!condition) {
    failures += 1;
    console.error(`FAIL ${id} ${detail}`);
  } else {
    console.log(`OK ${id}`);
  }
}
function jsonBlocks(source) {
  return [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}
function scanKeys(value, visit) {
  if (Array.isArray(value)) return value.forEach((child) => scanKeys(child, visit));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    visit(key, child);
    if (key !== '@id') scanKeys(child, visit);
  }
}
function words(source) {
  const main = source.match(/<main[\s\S]*?<\/main>/)?.[0] || source;
  const text = main.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<[^>]+>/g, ' ');
  return (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;
}
function gzip(file) {
  return zlib.gzipSync(fs.readFileSync(file)).length;
}
function scriptsFor(source) {
  return [...source.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((match) => match[1]);
}

check('routes', Object.keys(html).length === 6);
for (const [route, page] of Object.entries(pages)) {
  const source = html[route];
  check(`${route} title`, source.includes(`<title>${page.title}</title>`));
  check(`${route} description`, source.includes(`<meta name="description" content="${page.description}"`));
  check(`${route} h1`, (source.match(/<h1>.*?<\/h1>/g) || []).length === 1 && source.includes(`<h1>${page.h1}</h1>`));
  check(`${route} canonical`, source.includes(`<link rel="canonical" href="https://401kcalculators.pro${route}"`));
  check(`${route} og`, source.includes('<meta property="og:image" content="https://401kcalculators.pro/og/og-default.png"'));
  check(`${route} modifiedOn`, source.includes(dates[route].modifiedOn));
  check(`${route} no-placeholder`, !source.includes('{{DEPLOY_DATE}}') && !source.includes('{{MODIFIED_DATE}}') && !source.includes('datePublished'));
  const contentImages = source.match(/<img\b[^>]*>/g) || [];
  if (route === '/') {
    check('home-icon', contentImages.length === 1 && ['class="home-title-icon"', 'src="/favicon-64x64.png"', 'alt=""', 'aria-hidden="true"', 'width="64"', 'height="64"'].every((attribute) => contentImages[0].includes(attribute)));
  } else {
    check(`${route} no-img`, contentImages.length === 0);
  }
  check(`${route} favicon`, source.split(faviconLink).length - 1 === 1);
  const parsed = jsonBlocks(source).flat();
  const types = parsed.map((node) => node['@type']);
  page.types.forEach((type) => check(`${route} schema-${type}`, types.includes(type)));
  parsed.forEach((node) => scanKeys(node, (key) => check(`${route} schema-safe-${key}`, !forbiddenSchema.has(key))));
  if (route !== '/') {
    check(`${route} no-site-definitions`, !types.includes('WebSite') && !types.includes('Organization'));
  }
  if (page.inputs) {
    check(`${route} inputs`, (source.match(/<input\b/g) || []).length === page.inputs);
    check(`${route} default-results`, /<tbody>\s*<tr>/.test(source));
    check(`${route} noscript`, source.includes('<noscript>'));
    check(`${route} grouped-inputs`, source.includes('<legend>'));
    check(`${route} full-table-disclosure`, source.includes('<summary>View the full year-by-year table</summary>'));
    check(`${route} preview-caption`, source.includes('First 3 years'));
    const previewAttribute = route === '/' ? 'data-projection-preview' : 'data-withdrawal-preview';
    const previewBlock = source.split(`${previewAttribute}="true"`)[1]?.split('</table>')[0] || '';
    const previewBody = previewBlock.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0] || '';
    check(`${route} preview-rows`, (previewBody.match(/<tr>/g) || []).length === 3);
  } else {
    const executable = [...source.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>/g)];
    check(`${route} no-executable-js`, executable.length === 0);
  }
  if (page.words) {
    const count = words(source);
    check(`${route} words`, count >= page.words[0] && count <= page.words[1], `received ${count}`);
  }
}

check('home-app-id', html['/'].includes('"@id":"https://401kcalculators.pro/#app"'));
check('retirement-app-id', html['/retirement-calculator/'].includes('"@id":"https://401kcalculators.pro/retirement-calculator/#app"'));
check('future-assumption', html['/'].includes('IRS 2027 limits are held flat for illustration; later years are not official figures.') && html['/retirement-calculator/'].includes('IRS 2027 limits are held flat for illustration; later years are not official figures.'));
check('about-no-fake-channel', !html['/about/'].includes('mailto:') && !html['/about/'].includes('the contact channel will be listed here'));
check('about-no-fake-credentials', !/CFA|CPA|CFP|certified financial|years of experience/i.test(html['/about/']));

for (const [route, source] of Object.entries(html)) {
  const links = [...source.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  const bad = links.filter((href) => (href.startsWith('/') || href.startsWith('#')) && !href.startsWith('/_astro/') && !allowedInternal.has(href));
  check(`${route} links`, bad.length === 0, bad.join(','));
  for (const src of scriptsFor(source)) check(`${route} script-local-${src}`, src.startsWith('/_astro/'));
}

const notFound = fs.readFileSync('dist/404.html', 'utf8');
const notFoundMain = notFound.match(/<main[\s\S]*?<\/main>/)?.[0] || notFound;
check('404-no-schema', !notFound.includes('application/ld+json'));
check('404-links', [...notFoundMain.matchAll(/href="([^"]+)"/g)].length === 4);
check('404-no-meta-refresh', !/http-equiv="refresh"/i.test(notFound));
check('404-favicon', notFound.split(faviconLink).length - 1 === 1);

const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
check('sitemap-count', (sitemap.match(/<url>/g) || []).length === 6);
for (const route of Object.keys(pages)) {
  check(`sitemap-${route}`, sitemap.includes(`<loc>https://401kcalculators.pro${route}</loc>`) && sitemap.includes(`<lastmod>${dates[route].modifiedOn}</lastmod>`));
}
check('robots', fs.readFileSync('dist/robots.txt', 'utf8').includes('Sitemap: https://401kcalculators.pro/sitemap.xml'));
const png = fs.readFileSync('dist/og/og-default.png');
check('og-png', png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630);
const favicon = fs.readFileSync('dist/favicon-32x32.png');
check('favicon-png', favicon.readUInt32BE(16) === 32 && favicon.readUInt32BE(20) === 32);
const homeIcon = fs.readFileSync('dist/favicon-64x64.png');
check('home-icon-png', homeIcon.readUInt32BE(16) === 64 && homeIcon.readUInt32BE(20) === 64 && homeIcon.byteLength <= 2048);

const cssFiles = fs.existsSync('dist/_astro') ? fs.readdirSync('dist/_astro').filter((file) => file.endsWith('.css')).map((file) => path.join('dist/_astro', file)) : [];
const externalCssBytes = cssFiles.reduce((sum, file) => sum + gzip(file), 0);
const inlineCssBytes = Math.max(...Object.values(html).map((source) => {
  const css = [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('');
  return zlib.gzipSync(css).length;
}));
const cssBytes = externalCssBytes + inlineCssBytes;
check('css-budget', cssBytes <= 15 * 1024, `received ${cssBytes} bytes gzip`);
for (const route of ['/', '/retirement-calculator/']) {
  const bytes = scriptsFor(html[route]).filter((src) => src.startsWith('/_astro/')).reduce((sum, src) => sum + gzip(path.join('dist', src.slice(1))), 0);
  check(`${route} js-budget`, bytes <= 30 * 1024, `received ${bytes} bytes gzip`);
}

for (const directory of ['src/engine', 'src/layouts', 'src/components']) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(directory);
  for (const file of files) check(`no-time-${file}`, !/Date\.now\(\)|new Date\(\)/.test(fs.readFileSync(file, 'utf8')));
}

if (failures) {
  console.error(`${failures} verification checks failed`);
  process.exit(1);
}
console.log('All batch 3a verification checks passed');
