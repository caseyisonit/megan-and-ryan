// RSVP endpoint: browser form → Turnstile check → Notion Guests (insert only).
export interface Env {
  NOTION_RSVP_TOKEN: string;
  NOTION_GUESTS_DATA_SOURCE_ID: string;
  TURNSTILE_SECRET: string;
  ALLOWED_ORIGINS: string;
}

const DIETARY = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Shellfish allergy', 'Other'];
const MAX_BODY = 8_000;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const count = (v: unknown) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : 0;
};
const rt = (s: string) => (s ? [{ type: 'text', text: { content: s } }] : []);

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  return origin && allowed.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }
    : {};
}

const json = (status: number, body: unknown, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

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

    const household = str(d.household, 120);
    const response = d.response === 'accept' ? 'Joyfully accepts' : d.response === 'decline' ? 'Regretfully declines' : '';
    const email = str(d.email, 200);
    if (!household || !response || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { ok: false, error: 'invalid' }, h);

    const accepting = response === 'Joyfully accepts';
    const dietary = Array.isArray(d.dietary) ? d.dietary.filter((x): x is string => typeof x === 'string' && DIETARY.includes(x)).slice(0, 8) : [];
    const phone = str(d.phone, 40);

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.NOTION_RSVP_TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent: { type: 'data_source_id', data_source_id: env.NOTION_GUESTS_DATA_SOURCE_ID },
        properties: {
          Household: { title: rt(household) },
          'Guest names': { rich_text: rt(str(d.names, 500)) },
          Email: { email },
          Phone: { phone_number: phone || null },
          'Mailing address': { rich_text: rt(str(d.address, 500)) },
          Response: { select: { name: response } },
          'Ceremony count': { number: accepting ? count(d.ceremony) : 0 },
          'Reception count': { number: accepting ? count(d.reception) : 0 },
          Dietary: { multi_select: accepting ? dietary.map((name) => ({ name })) : [] },
          'Dietary notes': { rich_text: rt(accepting ? str(d.dietaryNotes, 500) : '') },
          'Note to the couple': { rich_text: rt(str(d.note, 1500)) },
          Source: { select: { name: 'Website' } },
        },
      }),
    });
    if (!res.ok) {
      console.error('notion', res.status, (await res.text()).slice(0, 300));
      return json(502, { ok: false, error: 'store' }, h);
    }
    return json(200, { ok: true }, h);
  },
};
