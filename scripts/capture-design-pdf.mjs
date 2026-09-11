/**
 * Capture ArchiveX public pages into a design-review PDF.
 * Requires local client (5173) + API (5001) running.
 *
 * Usage: node scripts/capture-design-pdf.mjs
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs/design-review');
const SHOTS_DIR = join(OUT_DIR, 'shots');
const BASE = process.env.ARCHIVEX_REVIEW_URL || 'http://localhost:5173';
const API = process.env.ARCHIVEX_API_URL || 'http://localhost:5001/api/v1';

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) return null;
  return res.json();
}

async function resolvePages() {
  const products = await fetchJson('/products?limit=1&featured=true');
  const brands = await fetchJson('/brands');
  const articles = await fetchJson('/articles?limit=1');
  const categories = await fetchJson('/categories?limit=1');

  const productSlug = products?.data?.[0]?.slug || 'ferrari-f40';
  const brandSlug = brands?.data?.[0]?.slug || 'ferrari';
  const articleSlug = articles?.data?.[0]?.slug;
  const categorySlug = categories?.data?.[0]?.slug;

  const pages = [
    { id: '01-home', title: 'Home', path: '/', note: 'First viewport + landing composition' },
    { id: '02-discover', title: 'Discover', path: '/discover', note: 'Filters, search, grid' },
    {
      id: '03-discover-cars',
      title: 'Discover — Cars',
      path: '/discover?domain=car',
      note: 'Primary domain chamber',
    },
    {
      id: '04-product',
      title: 'Product detail',
      path: `/products/${productSlug}`,
      note: 'Gallery, identity, specs, related',
    },
    { id: '05-brands', title: 'Brands index', path: '/brands', note: 'A–Z houses' },
    {
      id: '06-brand-detail',
      title: 'Brand chamber',
      path: `/brands/${brandSlug}`,
      note: 'House page + linked objects',
    },
    { id: '07-categories', title: 'Categories', path: '/categories', note: 'Taxonomy chambers' },
  ];

  if (categorySlug) {
    pages.push({
      id: '08-category-detail',
      title: 'Category detail',
      path: `/categories/${categorySlug}`,
      note: 'Category chamber',
    });
  }

  pages.push(
    { id: '09-journal', title: 'Journal', path: '/journal', note: 'Editorial index' },
    { id: '10-search', title: 'Search', path: '/search?q=ferrari', note: 'Query + recommendations' },
    { id: '11-compare', title: 'Compare', path: '/compare', note: 'Empty tray / compare desk' },
    { id: '12-login', title: 'Login', path: '/login', note: 'Collector auth' },
    { id: '13-register', title: 'Register', path: '/register', note: 'Collector signup' }
  );

  if (articleSlug) {
    pages.splice(9, 0, {
      id: '09b-article',
      title: 'Journal essay',
      path: `/journal/${articleSlug}`,
      note: 'Long-form + related objects',
    });
  }

  return pages;
}

async function capture() {
  await mkdir(SHOTS_DIR, { recursive: true });
  const pages = await resolvePages();

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const captured = [];

  for (const entry of pages) {
    const url = `${BASE}${entry.path}`;
    process.stdout.write(`Capturing ${entry.id} → ${url}\n`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(800);
      // Dismiss any overlay if present (none expected)
      const file = join(SHOTS_DIR, `${entry.id}.png`);
      await page.screenshot({ path: file, fullPage: true });
      captured.push({ ...entry, file });
    } catch (error) {
      process.stderr.write(`  skip ${entry.id}: ${error.message}\n`);
    }
  }

  // Mobile home + discover for responsive review
  await page.setViewportSize({ width: 390, height: 844 });
  for (const entry of [
    { id: '14-home-mobile', title: 'Home (mobile)', path: '/', note: '390×844 first viewport' },
    {
      id: '15-discover-mobile',
      title: 'Discover (mobile)',
      path: '/discover',
      note: 'Mobile filters / grid',
    },
  ]) {
    const url = `${BASE}${entry.path}`;
    process.stdout.write(`Capturing ${entry.id} → ${url}\n`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(800);
      const file = join(SHOTS_DIR, `${entry.id}.png`);
      await page.screenshot({ path: file, fullPage: true });
      captured.push({ ...entry, file });
    } catch (error) {
      process.stderr.write(`  skip ${entry.id}: ${error.message}\n`);
    }
  }

  await browser.close();
  return captured;
}

async function buildPdf(captured) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Cover
  {
    const cover = pdf.addPage([612, 792]);
    cover.drawText('ArchiveX', { x: 56, y: 700, size: 28, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    cover.drawText('Design review pack', {
      x: 56,
      y: 660,
      size: 18,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    cover.drawText('Auto-captured from the local Ivory Museum website.', {
      x: 56,
      y: 620,
      size: 11,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    cover.drawText(`Generated: ${new Date().toISOString().slice(0, 10)}`, {
      x: 56,
      y: 590,
      size: 11,
      font,
    });
    cover.drawText(`Base URL: ${BASE}`, { x: 56, y: 570, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    cover.drawText('Pages captured:', { x: 56, y: 530, size: 12, font: fontBold });
    let y = 505;
    for (const entry of captured) {
      cover.drawText(`• ${entry.title}  (${entry.path})`, { x: 64, y, size: 10, font });
      y -= 16;
      if (y < 60) break;
    }
  }

  for (const entry of captured) {
    const bytes = await readFile(entry.file);
    const image = await pdf.embedPng(bytes);
    const maxW = 540;
    const maxH = 680;
    const scale = Math.min(maxW / image.width, maxH / image.height, 1);
    const w = image.width * scale;
    const h = image.height * scale;

    const page = pdf.addPage([612, 792]);
    page.drawText(entry.title, { x: 36, y: 760, size: 14, font: fontBold });
    page.drawText(`${entry.path}  —  ${entry.note || ''}`, {
      x: 36,
      y: 742,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawImage(image, {
      x: (612 - w) / 2,
      y: 742 - 20 - h,
      width: w,
      height: h,
    });
  }

  const outPath = join(OUT_DIR, 'ArchiveX-Design-Review.pdf');
  await writeFile(outPath, await pdf.save());
  return outPath;
}

const captured = await capture();
if (!captured.length) {
  console.error('No screenshots captured. Is the client running on', BASE, '?');
  process.exit(1);
}
const pdfPath = await buildPdf(captured);
console.log(`\nWrote ${captured.length} shots → ${pdfPath}`);
