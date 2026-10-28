// Usage: node scripts/shoot.mjs <outDir> <path...>
import { chromium } from 'playwright';
const [out, ...paths] = process.argv.slice(2);
const origin = process.env.ORIGIN ?? 'http://127.0.0.1:4321/megan-and-ryan';
const views = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
];
const browser = await chromium.launch();
for (const v of views) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.deviceScaleFactor ?? 1, isMobile: v.isMobile ?? false });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(`${origin}/${p}`, { waitUntil: 'load' });
    await page.waitForTimeout(3200);
    const slug = p.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';
    await page.screenshot({ path: `${out}/${slug}-${v.name}-fold.png` });
    // scroll through so scroll-triggered states settle, then capture full page
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${slug}-${v.name}-full.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log('ok');
