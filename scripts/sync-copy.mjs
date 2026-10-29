// Promote Approved → Live in the Notion Site Copy database.
// Rows with an open ⟨bracket⟩ or empty Working copy are skipped, set back to Draft, and noted.
// Usage: node --env-file=.env.local scripts/sync-copy.mjs [--dry-run]
// In CI: NOTION_COPY_TOKEN + NOTION_COPY_DATA_SOURCE_ID; writes promoted=N to $GITHUB_OUTPUT.
import { appendFileSync } from 'node:fs';

const TOKEN = process.env.NOTION_COPY_TOKEN ?? process.env.NOTION_SITE_TOKEN;
const DS = process.env.NOTION_COPY_DATA_SOURCE_ID;
const DRY = process.argv.includes('--dry-run');
if (!TOKEN || !DS) throw new Error('NOTION_COPY_TOKEN and NOTION_COPY_DATA_SOURCE_ID are required');

const OPEN = /⟨[^⟩]*⟩/;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429 || res.status >= 500) {
      await sleep(Number(res.headers.get('retry-after') ?? 2) * 1000);
      continue;
    }
    const json = await res.json();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json.code}: ${json.message}`);
    await sleep(340);
    return json;
  }
  throw new Error(`${method} ${path} failed after retries`);
}

// Keep only the formatting the site renders: bold, italic, links.
const clean = (parts) =>
  parts.map((p) => ({
    type: 'text',
    text: { content: p.plain_text, link: p.href ? { url: p.href } : null },
    annotations: { bold: !!p.annotations?.bold, italic: !!p.annotations?.italic },
  }));

const approved = [];
let cursor;
do {
  const r = await api('POST', `/data_sources/${DS}/query`, {
    page_size: 100,
    start_cursor: cursor,
    filter: { property: 'Status', select: { equals: 'Approved' } },
  });
  approved.push(...r.results);
  cursor = r.has_more ? r.next_cursor : undefined;
} while (cursor);

let promoted = 0;
let skipped = 0;
const now = new Date().toISOString();
for (const page of approved) {
  const key = page.properties.Key.title.map((t) => t.plain_text).join('');
  const parts = page.properties['Working copy'].rich_text;
  const plain = parts.map((p) => p.plain_text).join('');
  if (!plain.trim() || OPEN.test(plain)) {
    skipped++;
    console.log(`skip  ${key}: ${plain.trim() ? 'has a ⟨bracket⟩' : 'empty'}`);
    if (!DRY)
      await api('PATCH', `/pages/${page.id}`, {
        properties: {
          Status: { select: { name: 'Draft' } },
          'Notes / questions': {
            rich_text: [{ type: 'text', text: { content: `Not published ${now.slice(0, 10)}: ${plain.trim() ? 'replace the ⟨bracket⟩ with your answer' : 'Working copy is empty'}, then set Approved again.` } }],
          },
        },
      });
    continue;
  }
  promoted++;
  console.log(`live  ${key}`);
  if (!DRY)
    await api('PATCH', `/pages/${page.id}`, {
      properties: {
        'Live copy': { rich_text: clean(parts) },
        Status: { select: { name: 'Live' } },
        'Published at': { date: { start: now } },
        'Notes / questions': { rich_text: [] },
      },
    });
}

console.log(`${DRY ? '[dry run] ' : ''}promoted ${promoted}, skipped ${skipped}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `promoted=${promoted}\n`);
