// Decide whether the site needs a rebuild: fingerprint the Notion Site Copy (key, status, Working copy)
// and compare it with the fingerprint published at <site>/copy-hash.txt.
// Writes public/copy-hash.txt for the next build and sets changed=true|false in $GITHUB_OUTPUT.
// Usage: node --env-file=.env.local scripts/check-copy.mjs
import { createHash } from 'node:crypto';
import { appendFileSync, writeFileSync } from 'node:fs';

const TOKEN = process.env.NOTION_COPY_TOKEN ?? process.env.NOTION_SITE_TOKEN;
const DS = process.env.NOTION_COPY_DATA_SOURCE_ID;
if (!TOKEN || !DS) throw new Error('NOTION_COPY_TOKEN and NOTION_COPY_DATA_SOURCE_ID are required');
const site = `${process.env.SITE_URL ?? 'https://caseyisonit.github.io'}${process.env.BASE_PATH ?? '/megan-and-ryan'}`;

const rows = [];
let cursor;
do {
  const res = await fetch(`https://api.notion.com/v1/data_sources/${DS}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`);
  const json = await res.json();
  for (const p of json.results) {
    const key = p.properties.Key.title.map((t) => t.plain_text).join('');
    const removed = p.properties.Status?.select?.name === 'Remove';
    const copy = (p.properties['Working copy']?.rich_text ?? []).map((t) => [t.plain_text, t.href, t.annotations?.bold, t.annotations?.italic]);
    rows.push([key, removed, copy]);
  }
  cursor = json.has_more ? json.next_cursor : undefined;
} while (cursor);
rows.sort((a, b) => a[0].localeCompare(b[0]));

const hash = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
writeFileSync(new URL('../public/copy-hash.txt', import.meta.url), hash + '\n');

const live = await fetch(`${site}/copy-hash.txt`, { cache: 'no-store' })
  .then((r) => (r.ok ? r.text() : ''))
  .catch(() => '');
const changed = live.trim() !== hash;
console.log(`${rows.length} rows · ${changed ? 'copy changed since last deploy' : 'no copy changes'}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
