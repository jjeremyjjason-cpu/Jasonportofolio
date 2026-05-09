import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

// Find next available index
let idx = 1;
while (fs.existsSync(path.join(screenshotDir, `screenshot-${idx}${label}.png`))) idx++;
const outPath = path.join(screenshotDir, `screenshot-${idx}${label}.png`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Force all scroll-triggered animations to their visible state
await page.evaluate(() => {
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('vis'));
});
await new Promise(r => setTimeout(r, 200));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
