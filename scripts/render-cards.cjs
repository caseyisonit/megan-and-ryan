const { chromium } = require('playwright');
const path = require('path');

const jobs = [
  { file: 'save-the-date.html', out: 'save-the-date-1080x1920.png', w: 1080, h: 1920 },
  { file: 'og.html', out: 'og-1200x630.png', w: 1200, h: 630 },
];

(async () => {
  const browser = await chromium.launch();
  for (const j of jobs) {
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.resolve(__dirname, '..', 'design', j.file), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.locator('.card').screenshot({ path: path.resolve(__dirname, '..', 'exports', j.out) });
    console.log(j.out);
    await page.close();
  }
  await browser.close();
})();
