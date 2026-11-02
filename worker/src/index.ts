// RSVP endpoint: browser form → Turnstile check → Notion Guests (insert, or update a matching household).
export interface Env {
  NOTION_RSVP_TOKEN: string;
  NOTION_GUESTS_DATA_SOURCE_ID: string;
  TURNSTILE_SECRET: string;
  ALLOWED_ORIGINS: string;
}

const DIETARY = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Shellfish allergy', 'Other'];
const MAX_BODY = 8_000;
const NOT_YET = 'Not yet';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const count = (v: unknown) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : 0;
};
const rt = (s: string) => (s ? [{ type: 'text', text: { content: s } }] : []);
const normEmail = (s: string) => s.trim().toLowerCase();
const normPhone = (s: string) => {
  const d = s.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
};

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  return origin && allowed.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }
    : {};
}

const json = (status: number, body: unknown, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const notion = (env: Env, path: string, init: RequestInit) =>
  fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.NOTION_RSVP_TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
  });

type Page = { id: string; properties: Record<string, any> };
const plain = (p: any): string => (Array.isArray(p?.rich_text) ? p.rich_text.map((x: any) => x.plain_text).join('') : '');

// Find a saved household by normalized email or phone. The guest list is tiny, so one query is enough.
async function findMatch(env: Env, email: string, phone: string): Promise<Page | null> {
  const res = await notion(env, `data_sources/${env.NOTION_GUESTS_DATA_SOURCE_ID}/query`, { method: 'POST', body: JSON.stringify({ page_size: 100 }) });
  if (!res.ok) {
    console.error('notion query', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const { results } = (await res.json()) as { results: Page[] };
  const e = normEmail(email);
  const p = normPhone(phone);
  return (
    results.find((row) => {
      const rowEmail = normEmail(row.properties?.Email?.email ?? '');
      const rowPhone = normPhone(row.properties?.Phone?.phone_number ?? '');
      return (!!e && rowEmail === e) || (p.length >= 10 && rowPhone === p);
    }) ?? null
  );
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin');
    const h = cors(origin, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: h['Access-Control-Allow-Origin'] ? 204 : 403, headers: h });
    if (req.method !== 'POST') return json(405, { ok: false }, h);
    if (!h['Access-Control-Allow-Origin']) return json(403, { ok: false }, h);

    const raw = await req.text();
    if (raw.length > MAX_BODY) return json(413, { ok: false }, h);
    let d: Record<string, unknown>;
    try {
      d = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: 'invalid' }, h);
    }

    // Honeypot: pretend success so bots learn nothing.
    if (str(d.website, 200)) return json(200, { ok: true }, h);

    const verify = (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: str(d.token, 2048), remoteip: req.headers.get('CF-Connecting-IP') ?? '' }),
    }).then((r) => r.json())) as { success: boolean };
    if (!verify.success) return json(400, { ok: false, error: 'challenge' }, h);

    const contactPhase = d.mode !== 'full';
    const household = str(d.household, 120);
    const email = str(d.email, 200);
    const phone = str(d.phone, 40);
    const address = str(d.address, 500);
    const names = str(d.names, 500);
    const note = str(d.note, 1500);
    const dietaryNotes = str(d.dietaryNotes, 500);
    const replied = d.response === 'accept' || d.response === 'decline';
    const response = d.response === 'accept' ? 'Joyfully accepts' : d.response === 'decline' ? 'Regretfully declines' : NOT_YET;

    if (!household || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { ok: false, error: 'invalid' }, h);
    // The full form always carries a reply; the contact form may not.
    if (!contactPhase && !replied) return json(400, { ok: false, error: 'invalid' }, h);

    const accepting = response === 'Joyfully accepts';
    const dietary = Array.isArray(d.dietary) ? d.dietary.filter((x): x is string => typeof x === 'string' && DIETARY.includes(x)).slice(0, 8) : [];

    // Blank fields never erase what is already saved.
    const props: Record<string, unknown> = {
      Household: { title: rt(household) },
      Email: { email },
      Response: { select: { name: response } },
      Source: { select: { name: 'Website' } },
    };
    if (names) props['Guest names'] = { rich_text: rt(names) };
    if (phone) props.Phone = { phone_number: phone };
    if (address) props['Mailing address'] = { rich_text: rt(address) };
    if (note) props['Note to the couple'] = { rich_text: rt(note) };
    if (replied) {
      props['Ceremony count'] = { number: accepting ? count(d.ceremony) : 0 };
      props['Reception count'] = { number: accepting ? count(d.reception) : 0 };
      props.Dietary = { multi_select: accepting ? dietary.map((name) => ({ name })) : [] };
      if (accepting && dietaryNotes) props['Dietary notes'] = { rich_text: rt(dietaryNotes) };
    }

    const existing = await findMatch(env, email, phone);
    if (existing) {
      const saved = existing.properties?.Response?.select?.name ?? '';
      // A real reply already on file outranks a later "Not yet".
      if (!replied && saved && saved !== NOT_YET) delete props.Response;
      // Keep the first note rather than overwriting it.
      if (note && plain(existing.properties?.['Note to the couple'])) delete props['Note to the couple'];
      const res = await notion(env, `pages/${existing.id}`, { method: 'PATCH', body: JSON.stringify({ properties: props }) });
      if (!res.ok) {
        console.error('notion update', res.status, (await res.text()).slice(0, 300));
        return json(502, { ok: false, error: 'store' }, h);
      }
      return json(200, { ok: true, updated: true }, h);
    }

    const res = await notion(env, 'pages', {
      method: 'POST',
      body: JSON.stringify({ parent: { type: 'data_source_id', data_source_id: env.NOTION_GUESTS_DATA_SOURCE_ID }, properties: props }),
    });
    if (!res.ok) {
      console.error('notion', res.status, (await res.text()).slice(0, 300));
      return json(502, { ok: false, error: 'store' }, h);
    }
    return json(200, { ok: true }, h);
  },
};
