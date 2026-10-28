// Usage: node scripts/fps.mjs <path>  — reports frame stats during load animation and scroll
import { chromium, webkit } from 'playwright';
const origin = process.env.ORIGIN ?? 'http://127.0.0.1:4321/megan-and-ryan';
const engine = process.env.ENGINE === 'webkit' ? webkit : chromium;
const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.__frames = [];
  let last = performance.now();
  const tick = (t) => { window.__frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const stats = (f) => { const s = [...f].sort((a,b)=>a-b); const p = (q)=>s[Math.floor(q*(s.length-1))]?.toFixed(1); return { frames: f.length, p50: p(.5), p95: p(.95), max: s.at(-1)?.toFixed(1), janky: f.filter(x=>x>33).length }; };
await page.goto(`${origin}/${process.argv[2]}`, { waitUntil: 'load' });
await page.waitForTimeout(3000);
const load = await page.evaluate(() => window.__frames.splice(0));
await page.mouse.move(700, 450);
for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(50); }
await page.waitForTimeout(800);
const scroll = await page.evaluate(() => window.__frames.splice(0));
console.log(process.argv[2], 'load', JSON.stringify(stats(load)), 'scroll', JSON.stringify(stats(scroll)));
await browser.close();
