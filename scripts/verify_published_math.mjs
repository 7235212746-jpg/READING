import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const siteBase = process.env.SITE_BASE || 'https://7235212746-jpg.github.io/READING';
const contentFolders = ['physics', 'calculation', 'methods'];

function collectMarkdown(folder) {
  const absolute = path.join(root, folder);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const value = path.join(absolute, entry.name);
    if (entry.isDirectory()) return collectMarkdown(path.relative(root, value));
    return entry.isFile() && entry.name.endsWith('.md') ? [value] : [];
  });
}

function publishablePages() {
  return contentFolders.flatMap(collectMarkdown).flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    const match = source.match(/^permalink:\s*(\S+)\s*$/m);
    if (!match) return [];
    const expectsMath = source.includes('\\\\(') || source.includes('\\\\[');
    return [{ route: match[1], expectsMath, file: path.relative(root, file) }];
  });
}

async function checkPage(page, item) {
  const url = `${siteBase}${item.route}?published-math-check=${Date.now()}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  return page.evaluate(({ url, expectsMath, file }) => {
    const content = document.querySelector('.article-body') || document.querySelector('main') || document.body;
    const text = content.innerText || '';
    const formulas = content.querySelectorAll('mjx-container').length;
    const rawDollars = text.includes('$$');
    const rawCommands = /\\(?:sqrt|circ|Delta|sum|mathbf|langle|mathrm)/.test(text);
    const rawBoundaries = text.includes('\\(') || text.includes('\\[');
    const problems = [];
    if (rawDollars) problems.push('literal $$ remains visible');
    if (rawCommands) problems.push('raw LaTeX command remains visible');
    if (rawBoundaries) problems.push('raw formula boundary remains visible');
    if (expectsMath && formulas === 0) problems.push('source contains math but page rendered no formula');
    return { file, url, formulas, problems };
  }, { url, expectsMath: item.expectsMath, file: item.file });
}

const pages = publishablePages();
if (!pages.length) throw new Error('No publishable pages found for formula verification.');

const browser = await chromium.launch({ headless: true });
const tab = await browser.newPage();
let results = [];
try {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    results = [];
    for (const item of pages) results.push(await checkPage(tab, item));
    const failures = results.filter((item) => item.problems.length);
    if (!failures.length) break;
    if (attempt < 4) await tab.waitForTimeout(30000);
  }
} finally {
  await browser.close();
}

const failures = results.filter((item) => item.problems.length);
for (const result of results) {
  console.log(`${result.file}: ${result.formulas} rendered formula(s)${result.problems.length ? `; ${result.problems.join('; ')}` : ''}`);
}
if (failures.length) {
  throw new Error(`Published formula verification failed for ${failures.length} page(s).`);
}
