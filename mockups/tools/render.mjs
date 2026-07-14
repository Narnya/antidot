// Render a template HTML to a PNG at a given mobile size (drives system Chrome
// headless via playwright-core). Usage:
//   node mockups/tools/render.mjs <htmlPath> <outPng> [width=393] [height=852]
// Setup (once): from repo root, `mkdir -p /tmp/wf && cd /tmp/wf && npm i playwright-core`
//   then run with:  node --experimental-vm-modules ... OR just `node mockups/tools/render.mjs`
//   after `export NODE_PATH=/tmp/wf/node_modules`.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';

const [, , htmlPath, outPng, w, h] = process.argv;
const width = Number(w) || 393;
const height = Number(h) || 852;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
try {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 60000 });
} catch (e) {
  console.log('nav warn:', e.message);
}
await page.waitForTimeout(1200); // let webfonts + images settle
await page.screenshot({ path: outPng });
console.log('rendered', outPng, `${width}x${height}`);
await browser.close();
