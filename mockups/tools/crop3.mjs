// Crop the SAME fractional rect from N PNGs and stack them at 2x (labelled), for
// zoom-comparing the same region across renders — e.g. a headline weight across
// ref / 600 / 700, or a nav across variants. Fractions are 0..1 of each image.
// Usage: node mockups/tools/crop3.mjs <png1> <png2> ... <fx> <fy> <fw> <fh>  → /tmp/crop3.png
import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';
// crop the same fractional rect from N pngs, stack vertically at 2x, label
const imgs = process.argv.slice(2); // list of png paths; last 4 args are fx fy fw fh
const [fx, fy, fw, fh] = imgs.splice(-4).map(Number);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
const dataUrls = imgs.map(p => 'data:image/png;base64,' + readFileSync(p).toString('base64'));
await page.evaluate(async ({ dataUrls, fx, fy, fw, fh }) => {
  document.body.style.margin = '0'; document.body.style.background = '#333';
  const out = document.createElement('div');
  document.body.appendChild(out);
  for (const src of dataUrls) {
    const img = new Image(); img.src = src; await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const sx = Math.round(fx*W), sy = Math.round(fy*H), sw = Math.round(fw*W), sh = Math.round(fh*H);
    const scale = 2;
    const cv = document.createElement('canvas'); cv.width = sw*scale; cv.height = sh*scale;
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw*scale, sh*scale);
    cv.style.display = 'block'; cv.style.margin = '6px'; cv.style.outline = '1px solid #666';
    out.appendChild(cv);
  }
}, { dataUrls, fx, fy, fw, fh });
await page.waitForTimeout(200);
const el = await page.$('body');
await el.screenshot({ path: '/tmp/crop3.png' });
console.log('ok');
await browser.close();
