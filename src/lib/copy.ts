// Site copy by key. Source order: Notion "Working copy" (build time) → copy.fallback.json.
// Status is the couple's review checklist; only "Remove" (or an emptied Working copy) changes the site.
// Text with an open ⟨bracket⟩ is hidden on the site and marked in dev.
import fallback from '../content/copy.fallback.json';

type Rich = { plain_text: string; href: string | null; annotations: { bold: boolean; italic: boolean } };

const OPEN = /⟨[^⟩]*⟩/;
const DEV = import.meta.env.DEV;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const safeHref = (h: string) => (/^(https?:|mailto:|tel:)/i.test(h) ? h : null);

function richToHtml(parts: Rich[]): string {
  return parts
    .map((p) => {
      let s = esc(p.plain_text).replace(/\n/g, '<br>');
      if (p.annotations.bold) s = `<strong>${s}</strong>`;
      if (p.annotations.italic) s = `<em>${s}</em>`;
      const href = p.href && safeHref(p.href);
      if (href) s = `<a href="${esc(href)}"${href.startsWith('http') ? ' rel="noopener"' : ''}>${s}</a>`;
      return s;
    })
    .join('');
}

async function loadNotion() {
  const token = import.meta.env.NOTION_COPY_TOKEN ?? import.meta.env.NOTION_SITE_TOKEN ?? process.env.NOTION_COPY_TOKEN;
  const ds = import.meta.env.NOTION_COPY_DATA_SOURCE_ID ?? process.env.NOTION_COPY_DATA_SOURCE_ID;
  const copy = new Map<string, string>();
  const hidden = new Set<string>();
  if (!token || !ds) {
    console.warn('[copy] Notion not configured; using copy.fallback.json');
    return { copy, hidden };
  }
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/data_sources/${ds}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    // A failed Notion call fails the build, so Pages keeps serving the last good deploy.
    if (!res.ok) throw new Error(`[copy] Notion query failed: ${res.status}`);
    const json = await res.json();
    for (const page of json.results) {
      const key = page.properties.Key.title.map((t: Rich) => t.plain_text).join('');
      if (!key) continue;
      const parts: Rich[] = page.properties['Working copy']?.rich_text ?? [];
      const plain = parts.map((p) => p.plain_text).join('');
      const removed = page.properties.Status?.select?.name === 'Remove' || !plain.trim();
      if (removed || (OPEN.test(plain) && !DEV)) hidden.add(key);
      else copy.set(key, OPEN.test(plain) ? markGaps(richToHtml(parts)) : richToHtml(parts));
    }
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return { copy, hidden };
}

function markGaps(html: string) {
  return html.replace(/⟨([^⟩]*)⟩/g, '<mark class="gap" title="Waiting on Megan &amp; Ryan">⟨$1⟩</mark>');
}

const notion = await loadNotion();
const seed = new Map(fallback.rows.map((r) => [r.key, r.copy]));

/** HTML for a copy key, or null when it shouldn't render (removed, unanswered, or missing). */
export function t(key: string): string | null {
  if (notion.hidden.has(key)) return null;
  const fromNotion = notion.copy.get(key);
  if (fromNotion) return fromNotion;
  const draft = seed.get(key);
  if (draft === undefined) {
    console.warn(`[copy] missing key: ${key}`);
    return null;
  }
  if (!OPEN.test(draft)) return esc(draft);
  return DEV ? markGaps(esc(draft)) : null;
}

/** Whether a key exists in Notion or the seed file (no warning). */
export function has(key: string): boolean {
  return notion.copy.has(key) || notion.hidden.has(key) || seed.has(key);
}

/** Plain text (for attributes, alt text, meta). */
export function tp(key: string): string | null {
  const h = t(key);
  return h === null ? null : h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}
