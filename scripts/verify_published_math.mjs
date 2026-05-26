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

function inspectionFunction({ url, expectsMath, file, requiresRenderedMath }) {
  const content = document.querySelector('.article-body') || document.querySelector('main') || document.body;
  const visibleCopy = content.cloneNode(true);
  visibleCopy.querySelectorAll('.math-render-source').forEach((element) => element.remove());
  const visibleText = visibleCopy.textContent || '';
  const formulas = content.querySelectorAll('mjx-container').length;
  const fallbackCount = content.querySelectorAll('.math-render-fallback').length;
  const rawDollars = visibleText.includes('$$');
  const rawCommands = /\\(?:sqrt|circ|Delta|sum|mathbf|langle|mathrm|times|mu)/.test(visibleText);
  const rawBoundaries = visibleText.includes('\\(') || visibleText.includes('\\[');
  const problems = [];
  if (rawDollars) problems.push('literal $$ remains visible');
  if (rawCommands) problems.push('raw LaTeX command remains visible');
  if (rawBoundaries) problems.push('raw formula boundary remains visible');
  if (expectsMath && requiresRenderedMath && formulas === 0) problems.push('source contains math but page rendered no formula');
  if (expectsMath && !requiresRenderedMath && fallbackCount === 0) problems.push('MathJax failure exposes no readable fallback');
  return { file, url, formulas, fallbackCount, problems };
}

async function checkPage(page, item, requiresRenderedMath) {
  const url = `${siteBase}${item.route}?published-math-check=${Date.now()}-${requiresRenderedMath ? 'rendered' : 'fallback'}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  return page.evaluate(inspectionFunction, {
    url,
    expectsMath: item.expectsMath,
    file: item.file,
    requiresRenderedMath
  });
}

const pages = publishablePages();
if (!pages.length) throw new Error('No publishable pages found for formula verification.');

const launchOptions = { headless: true };
if (process.env.BROWSER_EXECUTABLE_PATH) launchOptions.executablePath = process.env.BROWSER_EXECUTABLE_PATH;
const browser = await chromium.launch(launchOptions);
const renderedTab = await browser.newPage();
const fallbackTab = await browser.newPage();
await fallbackTab.route('**/tex-mml-chtml.js', (route) => route.abort());
let renderedResults = [];
let fallbackResults = [];
try {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    renderedResults = [];
    fallbackResults = [];
    for (const item of pages) {
      renderedResults.push(await checkPage(renderedTab, item, true));
      fallbackResults.push(await checkPage(fallbackTab, item, false));
    }
    const failures = [...renderedResults, ...fallbackResults].filter((item) => item.problems.length);
    if (!failures.length) break;
    if (attempt < 4) await renderedTab.waitForTimeout(30000);
  }
} finally {
  await browser.close();
}

for (const result of renderedResults) {
  console.log(`rendered ${result.file}: ${result.formulas} formula(s)${result.problems.length ? `; ${result.problems.join('; ')}` : ''}`);
}
for (const result of fallbackResults) {
  console.log(`fallback ${result.file}: ${result.fallbackCount} readable substitute(s)${result.problems.length ? `; ${result.problems.join('; ')}` : ''}`);
}
const failures = [...renderedResults, ...fallbackResults].filter((item) => item.problems.length);
if (failures.length) throw new Error(`Published formula verification failed for ${failures.length} page-state check(s).`);
