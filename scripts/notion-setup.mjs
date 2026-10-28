// One-time Notion setup: Guests + Site Copy databases, Questions page, How-to-edit callout.
// Idempotent: reuses databases/pages that already exist under the HQ page.
// Usage: node --env-file=.env.local scripts/notion-setup.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const TOKEN = process.env.NOTION_SITE_TOKEN;
if (!TOKEN) throw new Error('NOTION_SITE_TOKEN missing in .env.local');
const API = 'https://api.notion.com/v1';
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Notion-Version': '2025-09-03',
  'Content-Type': 'application/json',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) {
      await sleep(Number(res.headers.get('retry-after') ?? 1) * 1000);
      continue;
    }
    const json = await res.json();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json.code}: ${json.message}`);
    await sleep(340);
    return json;
  }
  throw new Error(`${method} ${path} rate-limited`);
}

const text = (s) => [{ type: 'text', text: { content: s } }];
const OPEN = /⟨[^⟩]*⟩/;

// 1. Find HQ page
const search = await api('POST', '/search', { query: 'Megan & Ryan — Wedding HQ', filter: { property: 'object', value: 'page' } });
const hq = search.results.find((p) => Object.values(p.properties).some((v) => v.type === 'title' && v.title.map((t) => t.plain_text).join('') === 'Megan & Ryan — Wedding HQ'));
if (!hq) throw new Error('HQ page not found. Is Wedding Site connected to it?');
console.log('HQ page found');

// Existing children
const kids = [];
let cursor;
do {
  const r = await api('GET', `/blocks/${hq.id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
  kids.push(...r.results);
  cursor = r.has_more ? r.next_cursor : undefined;
} while (cursor);
const existingDb = (title) => kids.find((b) => b.type === 'child_database' && b.child_database.title === title);
const existingPage = (title) => kids.find((b) => b.type === 'child_page' && b.child_page.title === title);

async function ensureDatabase(title, icon, properties) {
  const found = existingDb(title);
  if (found) {
    const db = await api('GET', `/databases/${found.id}`);
    console.log(`${title}: already exists`);
    return { dbId: db.id, dsId: db.data_sources[0].id, created: false };
  }
  const db = await api('POST', '/databases', {
    parent: { type: 'page_id', page_id: hq.id },
    title: text(title),
    icon: { type: 'emoji', emoji: icon },
    initial_data_source: { properties },
  });
  console.log(`${title}: created`);
  return { dbId: db.id, dsId: db.data_sources[0].id, created: true };
}

// 2. Callout on HQ (first run only)
if (!kids.some((b) => b.type === 'callout')) {
  await api('PATCH', `/blocks/${hq.id}/children`, {
    children: [
      {
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '🕯️' },
          color: 'gray_background',
          rich_text: text('How to edit the website'),
          children: [
            { type: 'numbered_list_item', numbered_list_item: { rich_text: text('Open Site Copy below. Each row is one piece of text on the site; "What this is" says where it appears.') } },
            { type: 'numbered_list_item', numbered_list_item: { rich_text: text('Change the words in "Working copy". Bold, italic, and links work.') } },
            { type: 'numbered_list_item', numbered_list_item: { rich_text: text('When it reads right, set Status to Approved. Within about 15 minutes it is live on the site and Status changes to Live.') } },
            { type: 'numbered_list_item', numbered_list_item: { rich_text: text('Editing a Live row changes nothing until you set it to Approved again, so half-finished edits never show.') } },
            { type: 'numbered_list_item', numbered_list_item: { rich_text: text('Anything inside ⟨angle brackets⟩ is a question for you. Rows with brackets never publish; replace the bracket with your answer.') } },
            { type: 'paragraph', paragraph: { rich_text: text('Please don\'t rename the Key column. It is how the site finds each piece of text.') } },
          ],
        },
      },
    ],
  });
  console.log('How-to-edit callout: added');
}

// 3. Databases
const guests = await ensureDatabase('Guests', '🧂', {
  Household: { title: {} },
  'Guest names': { rich_text: {} },
  Email: { email: {} },
  Phone: { phone_number: {} },
  'Mailing address': { rich_text: {} },
  Response: { select: { options: [{ name: 'Joyfully accepts', color: 'default' }, { name: 'Regretfully declines', color: 'gray' }] } },
  'Ceremony count': { number: { format: 'number' } },
  'Reception count': { number: { format: 'number' } },
  Dietary: {
    multi_select: {
      options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Shellfish allergy', 'Other'].map((name) => ({ name, color: 'default' })),
    },
  },
  'Dietary notes': { rich_text: {} },
  'Note to the couple': { rich_text: {} },
  Source: { select: { options: [{ name: 'Website', color: 'default' }, { name: 'Manual', color: 'gray' }] } },
  'Save the date sent': { checkbox: {} },
  'Invitation mailed': { checkbox: {} },
  Submitted: { created_time: {} },
});

const sections = ['Hero', 'Story', 'The Day', 'The Rite', 'What to Expect', 'Stay', 'Questions', 'RSVP', 'Footer', 'Save the Date', 'Invitation'];
const copy = await ensureDatabase('Site Copy', '✒️', {
  Key: { title: {} },
  Section: { select: { options: sections.map((name) => ({ name, color: 'default' })) } },
  Order: { number: { format: 'number' } },
  'What this is': { rich_text: {} },
  'Working copy': { rich_text: {} },
  'Live copy': { rich_text: {} },
  Status: {
    select: {
      options: [
        { name: 'Draft', color: 'gray' },
        { name: 'In review', color: 'yellow' },
        { name: 'Approved', color: 'blue' },
        { name: 'Live', color: 'green' },
      ],
    },
  },
  'Notes / questions': { rich_text: {} },
  'Published at': { date: {} },
});

// 4. Seed Site Copy (skip keys that already exist)
const { rows } = JSON.parse(readFileSync(new URL('../src/content/copy.fallback.json', import.meta.url), 'utf8'));
const have = new Set();
cursor = undefined;
do {
  const r = await api('POST', `/data_sources/${copy.dsId}/query`, { page_size: 100, start_cursor: cursor });
  r.results.forEach((p) => have.add(p.properties.Key.title.map((t) => t.plain_text).join('')));
  cursor = r.has_more ? r.next_cursor : undefined;
} while (cursor);

let seeded = 0;
for (const [i, row] of rows.entries()) {
  if (have.has(row.key)) continue;
  const reviewOnly = row.section === 'Save the Date' || row.section === 'Invitation';
  const open = OPEN.test(row.copy);
  const status = open ? 'Draft' : reviewOnly ? 'In review' : 'Approved';
  const note = open ? 'Needs your answer: replace the ⟨bracket⟩, then set Approved.' : reviewOnly ? 'For review only: this text is printed, not on the website.' : '';
  await api('POST', '/pages', {
    parent: { type: 'data_source_id', data_source_id: copy.dsId },
    properties: {
      Key: { title: text(row.key) },
      Section: { select: { name: row.section } },
      Order: { number: (i + 1) * 10 },
      'What this is': { rich_text: text(row.what) },
      'Working copy': { rich_text: text(row.copy) },
      Status: { select: { name: status } },
      'Notes / questions': { rich_text: note ? text(note) : [] },
    },
  });
  seeded++;
}
console.log(`Site Copy: ${seeded} rows seeded, ${have.size} already present`);

// 5. Questions page
if (!existingPage('Questions for Megan & Ryan')) {
  const q = (title, items) => ({
    type: 'toggle',
    toggle: {
      rich_text: [{ type: 'text', text: { content: title }, annotations: { bold: true } }],
      children: [
        ...items.map((s) => ({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: text(s) } })),
        { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'Your answer:' }, annotations: { italic: true, color: 'gray' } }] } },
        { type: 'paragraph', paragraph: { rich_text: [] } },
      ],
    },
  });
  await api('POST', '/pages', {
    parent: { type: 'page_id', page_id: hq.id },
    icon: { type: 'emoji', emoji: '🗝️' },
    properties: { title: { title: text('Questions for Megan & Ryan') } },
    children: [
      { type: 'paragraph', paragraph: { rich_text: text('Answer inside each toggle whenever you like. Nothing here blocks the site: it launches on drafts, and your answers fill in the ⟨brackets⟩ in Site Copy.') } },
      q('1. Your story', ['How many years since you met in college?', 'One line in your own words for the pull quote.', 'Anything from the Halloween first date you want told (or never told)?']),
      q('2. The day', ['What happens between 2 and 5 pm (ceremony length, cocktail hour, photos)?', 'What time should guests arrive at the chapel?', 'Is the ceremony unplugged (phones away)?', 'Who is your photographer? Officiant (optional)?']),
      q('3. The salt bowl', ['Is salt provided, or do guests bring their own offering?', 'Any specific instructions?', 'Spoken aloud, or silent?']),
      q('4. Reception', ['Food style: plated, family style, or buffet?', 'Bar? Dancing?', 'Any shuttle or transportation between venues?', 'Parking and accessibility at La Villa Rosa?']),
      q('5. Policies', ['Children welcome?', 'Plus-ones only if named on the invitation?', 'Gifts or a registry?', 'Which email should guests write to with questions?']),
      q('6. Lodging', ['Any room blocks?', 'Which of the suggested hotels should stay on the site?']),
      q('7. Copy sign-off', ['Dress code line: "Wear what you would want to be remembered in" or "Wear what you would be buried in"?', 'Read every row in Site Copy. Edit Working copy and set Approved to publish.']),
    ],
  });
  console.log('Questions page: created');
} else {
  console.log('Questions page: already exists');
}

// 6. Record IDs in .env.local (values are IDs, not secrets)
const envPath = new URL('../.env.local', import.meta.url);
let env = readFileSync(envPath, 'utf8');
const set = (k, v) => {
  env = env.match(new RegExp(`^${k}=.*$`, 'm')) ? env.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`) : `${env.trimEnd()}\n${k}=${v}\n`;
};
set('NOTION_HQ_PAGE_ID', hq.id);
set('NOTION_GUESTS_DATA_SOURCE_ID', guests.dsId);
set('NOTION_COPY_DATA_SOURCE_ID', copy.dsId);
writeFileSync(envPath, env);
console.log('IDs written to .env.local');
