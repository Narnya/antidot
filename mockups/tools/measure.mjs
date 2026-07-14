// Measure element boxes + computed type styles of a template, for pixel-accurate
// matching against a reference (per the design-mockup-analysis rule: compare
// proportions/sizes/spacing/line-height/letter-spacing/weight, not just text).
// Usage: node mockups/tools/measure.mjs <htmlPath> [width=393] [height=852] [selectors csv]
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';

const [, , htmlPath, w, h, selCsv] = process.argv;
const width = Number(w) || 393;
const height = Number(h) || 852;
const selectors = (selCsv || '.brand,.headline,.accent,.subtitle,.cta,.login').split(',');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1000);
const out = {};
for (const s of selectors) {
  const el = await page.$(s);
  if (!el) continue;
  const box = await el.boundingBox();
  const cs = await el.evaluate((n) => {
    const c = getComputedStyle(n);
    return { fs: c.fontSize, fw: c.fontWeight, lh: c.lineHeight, ls: c.letterSpacing, mt: c.marginTop };
  });
  out[s] = {
    x: Math.round(box.x), y: Math.round(box.y),
    w: Math.round(box.width), h: Math.round(box.height),
    centerX: Math.round(box.x + box.width / 2),
    pctW: Math.round((box.width / width) * 100), ...cs,
  };
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
