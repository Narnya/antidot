// Measure a reference screenshot PNG by pixel-scanning: find text bands (dark on
// ivory), coral elements, and the green CTA block. Reports both native px and
// fractions of width/height so it maps onto any render size.
// Usage: node measure-ref.mjs <pngPath>
import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';

const [, , pngPath] = process.argv;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const url = 'data:image/png;base64,' + readFileSync(pngPath).toString('base64');
const data = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i+1], px[i+2]]; };
  const luma = (r, g, b) => 0.299*r + 0.587*g + 0.114*b;
  const isCoral = (r, g, b) => r > 170 && g > 60 && g < 150 && b < 110 && (r - b) > 70 && (r - g) > 45;
  const isGreen = (r, g, b) => r > 10 && r < 60 && g > 40 && g < 90 && b > 30 && b < 80 && g > r && g > b;
  const isDark = (r, g, b) => luma(r, g, b) < 110;

  // Per-row counts across the width
  const rows = [];
  for (let y = 0; y < H; y++) {
    let dark = 0, coral = 0, green = 0, darkMinX = W, darkMaxX = 0, coralMinX = W, coralMaxX = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b] = at(x, y);
      if (isCoral(r, g, b)) { coral++; if (x < coralMinX) coralMinX = x; if (x > coralMaxX) coralMaxX = x; }
      if (isGreen(r, g, b)) green++;
      if (isDark(r, g, b) && !isCoral(r, g, b)) { dark++; if (x < darkMinX) darkMinX = x; if (x > darkMaxX) darkMaxX = x; }
    }
    rows.push({ y, dark, coral, green, darkMinX, darkMaxX, coralMinX, coralMaxX });
  }

  // Band segmentation helper: contiguous rows where count>thresh
  const bands = (key, thresh) => {
    const out = []; let cur = null;
    for (const rw of rows) {
      if (rw[key] > thresh) {
        if (!cur) cur = { top: rw.y, bot: rw.y, minX: W, maxX: 0, maxCount: 0 };
        cur.bot = rw.y;
        cur.maxCount = Math.max(cur.maxCount, rw[key]);
        if (key === 'dark') { cur.minX = Math.min(cur.minX, rw.darkMinX); cur.maxX = Math.max(cur.maxX, rw.darkMaxX); }
        if (key === 'coral') { cur.minX = Math.min(cur.minX, rw.coralMinX); cur.maxX = Math.max(cur.maxX, rw.coralMaxX); }
      } else {
        if (cur && (cur.bot - cur.top) >= 2) out.push(cur);
        cur = null;
      }
    }
    if (cur && (cur.bot - cur.top) >= 2) out.push(cur);
    return out;
  };

  return {
    W, H,
    darkBands: bands('dark', Math.round(W * 0.02)),
    coralBands: bands('coral', 3),
    greenBands: bands('green', Math.round(W * 0.3)),
  };
}, url);

const { W, H } = data;
const fmt = (b) => ({
  top: b.top, bot: b.bot, h: b.bot - b.top,
  cy: Math.round((b.top + b.bot) / 2),
  x: b.minX, xr: b.maxX, w: (b.maxX >= b.minX ? b.maxX - b.minX : null),
  cx: (b.maxX >= b.minX ? Math.round((b.minX + b.maxX) / 2) : null),
  topPct: +(b.top / H * 100).toFixed(1), cyPct: +((b.top + b.bot) / 2 / H * 100).toFixed(1),
  wPct: (b.maxX >= b.minX ? +((b.maxX - b.minX) / W * 100).toFixed(1) : null),
});
console.log(JSON.stringify({
  size: { W, H },
  dark: data.darkBands.map(fmt),
  coral: data.coralBands.map(fmt),
  green: data.greenBands.map(fmt),
}, null, 1));
await browser.close();
