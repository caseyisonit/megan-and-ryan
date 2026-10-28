import { chromium } from 'playwright';
const [out, path] = process.argv.slice(2);
const origin = process.env.ORIGIN ?? 'http://127.0.0.1:4321/megan-and-ryan';
const browser = await chromium.launch();
for (const v of [{ n: 'desktop', w: 1440, h: 900, s: 1 }, { n: 'mobile', w: 390, h: 844, s: 2 }]) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.s });
  await page.goto(`${origin}/${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  for (const t of ['1', '2', '3', '0']) {
    await page.evaluate((t) => { document.documentElement.dataset.type = t; window.scrollTo(0, 0); }, t);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/d-type${t}-${v.n}.png` });
  }
  await page.evaluate(() => { document.documentElement.dataset.type = '1'; document.querySelector('#day').scrollIntoView(); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/d-day-${v.n}.png` });
  await page.close();
}
await browser.close();
console.log('ok');
