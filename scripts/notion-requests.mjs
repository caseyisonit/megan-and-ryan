// Adds the "Requests & additions" database to the HQ page and updates the how-to callout.
// Idempotent. Usage: node --env-file=.env.local scripts/notion-requests.mjs
const TOKEN = process.env.NOTION_ADMIN_TOKEN;
const HQ = process.env.NOTION_HQ_PAGE_ID;
if (!TOKEN || !HQ) throw new Error('NOTION_ADMIN_TOKEN and NOTION_HQ_PAGE_ID are required');
const headers = { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' };
const api = async (method, path, body) => {
  const res = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json.message}`);
  return json;
};
const text = (s, extra = {}) => [{ type: 'text', text: { content: s }, ...extra }];

const kids = (await api('GET', `/blocks/${HQ}/children?page_size=100`)).results;

let db = kids.find((b) => b.type === 'child_database' && b.child_database.title === 'Requests & additions');
if (!db) {
  const where = ['Anywhere', 'Hero', 'Story', 'The Day', 'The Rite', 'What to Expect', 'Stay', 'Questions', 'RSVP form', 'Footer', 'New section', 'Photos', 'Save the Date', 'Invitation'];
  db = await api('POST', '/databases', {
    parent: { type: 'page_id', page_id: HQ },
    title: text('Requests & additions'),
    icon: { type: 'emoji', emoji: '🪶' },
    initial_data_source: {
      properties: {
        Request: { title: {} },
        'Where on the site': { select: { options: where.map((name) => ({ name, color: 'default' })) } },
        Details: { rich_text: {} },
        Files: { files: {} },
        From: { select: { options: [{ name: 'Megan', color: 'default' }, { name: 'Ryan', color: 'default' }, { name: 'Both', color: 'default' }] } },
        Status: { select: { options: [{ name: 'New', color: 'blue' }, { name: 'In progress', color: 'yellow' }, { name: 'Done', color: 'green' }, { name: "Won't do", color: 'gray' }] } },
        "Casey's reply": { rich_text: {} },
        Added: { created_time: {} },
      },
    },
  });
  const full = await api('GET', `/databases/${db.id}`);
  await api('POST', '/pages', {
    parent: { type: 'data_source_id', data_source_id: full.data_sources[0].id },
    properties: {
      Request: { title: text('Example: add our song to the story') },
      'Where on the site': { select: { name: 'Story' } },
      Details: { rich_text: text('Delete this example row. One row per idea: what you want, where it goes, and any photo or link (drop files into Files).') },
      Status: { select: { name: 'Done' } },
    },
  });
  console.log('Requests & additions: created');
} else {
  console.log('Requests & additions: already exists');
}

const callout = kids.find((b) => b.type === 'callout');
if (callout) {
  const inner = (await api('GET', `/blocks/${callout.id}/children?page_size=100`)).results;
  const flat = JSON.stringify(inner);
  if (!flat.includes('Requests & additions')) {
    await api('PATCH', `/blocks/${callout.id}/children`, {
      children: [
        { type: 'paragraph', paragraph: { rich_text: text('Want something new: a section, a photo, a link, a different order? Add a row to Requests & additions with Status = New. Casey picks it up from there and replies in the row.') } },
        { type: 'paragraph', paragraph: { rich_text: text('Questions only you can answer live in "Questions for Megan & Ryan". Answer inside each toggle.') } },
      ],
    });
    console.log('How-to callout: updated');
  }
}
