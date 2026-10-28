# Megan & Ryan — A Rite in the Hill Country
Wedding website, digital save the date, and printed invitation

## Problem & approach
**Ownership:** I handle everything I can reach. Casey gets a checkpoint, with step-by-step instructions, only for account logins, payments, sends, and approvals (see "Casey checkpoints").
Build a responsive one-page site for Megan Reddick & Ryan Erwin. It should feel minimalist, surreal (Dalí), timeless, and a little cultish. It needs to:
1. Tell guests the details: ceremony, reception, salt bowl ritual, attire, and lodging.
2. Collect household RSVPs and contact info into Notion.
3. Share one design system with a digital save the date (image + QR) and a 2-sided 5×7 printed invitation.

**Pipeline:** visual research → design in Paper (via Paper MCP) → build in Astro → deploy to GitHub Pages from `caseyisonit` → RSVP form → Cloudflare Worker → Notion Guests database.
**Copy:** every word on the site comes from a Notion **Site Copy** database. The couple edits copy and sets a row to **Approved**; a sync job publishes it within about 15 minutes. Drafts never leak, and the review never blocks implementation.

## Confirmed decisions
| Topic | Decision |
|---|---|
| Couple | Megan Reddick & Ryan Erwin. Both artists, with a very high bar for style |
| Ceremony | Sat Dec 12, 2026, 2–5 pm, The Lincoln Chapel, 2100 County Road 176, Georgetown, TX 78628 (Leander border; GPS must say "County Road") |
| Reception | 5–10 pm, La Villa Rosa Estate, 20601 Oak Canyon St, Leander, TX 78641 (address from one source; **verify**) |
| Ritual | Salt bowl at the reception: guests share wisdom and add a small offering |
| Guests | About 30. One RSVP per household |
| RSVP deadline | Sunday, November 22, 2026 |
| Vibe | Minimalist, surreal, timeless, cult on purpose (ritual, secret society, a little eerie) |
| Palette | Off-black + off-white base; pure #000 and #FFF used only as accents |
| Dress code | Black, white, or both. No color |
| Photos | 3 wet-plate portraits (Megan, Ryan, the couple with calla lilies). Crop out the "Lumiere" watermark |
| Privacy | No gate. Public, unlisted URL, `noindex`. Turnstile on the form |
| RSVP store | Custom on-brand form → Cloudflare Worker → Notion "Guests" database |
| Stack | Astro + GSAP (ScrollTrigger, SplitText) + Lenis + SVG filters |
| Hosting | GitHub Pages from `caseyisonit`. Domain undecided; plan supports both |
| Save the date | Static image for phone + email, with QR code and link |
| Invitation | 5×7 flat, 2-sided (text front, portrait back), print-ready PDF with bleed |
| Fonts | Free only. No system fonts unless research justifies them |
| Content gaps | Casey answers them as we go. Couple reviews copy in Notion |

## Assets on hand
- Portraits: `~/.copilot/attachments/*-008-940pm.jpg` (Megan, 1071×1500), `*-009-940pmB.jpg` (Ryan, 1071×1500), `*-0010-940pm.jpg` (couple, 1500×1200)
- Earlier Adobe Express draft (placeholder "Mara & Elias"): `~/Downloads/Mara & Elias — A Rite in the Hill Country/index.html`
  - Keep: "A rite in the Hill Country", "witnesses", "Plate I —" photo captions, "Light moves; so do we", "Dress in the dark and the pale", "Questions, answered quietly", "will you stand with us?", "Joyfully accept / Regretfully decline"
  - Drop: Acumin Pro (Adobe-licensed, not free). Cormorant Garamond is free (Google Fonts, OFL) and stays a candidate.

### Image resolution note
A 5×7 card at 300 dpi needs 1500×2100 px plus bleed. The portraits fall short, and cropping the watermark loses more. Wet-plate grain hides some softness, but two fixes are available:
- Upscale 2× with Upscayl (free) and soft-proof at 100%.
- Ask Lumiere for the originals, which also settles usage permission.

---

## How we'll work
I do everything I can reach from here: research, Paper design through the Paper MCP, writing copy, creating and configuring the repo, building the Notion databases through the API, writing code, deploying, exporting files, and QA. You step in only at the checkpoints below. When one comes up, I'll stop, post the exact instructions, and wait.
- 🤖 **Agent:** I do it. No action from you.
- 🙋 **Casey action:** needs your account, a browser login, money, or a person-to-person send. Full instructions are included.
- ✅ **Casey approval:** a decision or sign-off. I present options or a proof, you choose.
- **Secrets never pass through chat.** You paste tokens into a gitignored `.env.local` that I create. I push them to GitHub and Cloudflare secrets straight from that file and never print them.
- **Commits:** each change set is shown for approval before `git commit` (your standing rule). I batch changes by milestone to keep approvals few.
- **Content gaps:** when a ⟨bracket⟩ blocks something, I ask you one short question. Nothing else waits on it.

## Casey checkpoints, in order
| # | When | Type | What |
|---|---|---|---|
| C1 | Start | 🙋 | Open Paper; confirm the `caseyisonit` gh login |
| C2 | Start | 🙋 | Create the Notion HQ page + 2 integrations; paste tokens |
| C3 | Before the RSVP build | 🙋 | Cloudflare login + Turnstile widget; paste keys |
| A1 | After research | ✅ | Pick design direction A, B, or C, plus the font pairing |
| A2 | After the Paper website design | ✅ | Sign off the website design |
| C4 | After the Notion databases are seeded | 🙋 | Invite Megan & Ryan to Notion; send them the drafted note |
| C5 | Optional | 🙋 | Notion views I can't create through the API |
| A3 | After QA | ✅ | Approve launch + save the date art |
| C6 | After A3 | 🙋 | Send the save the date (message drafted for you) |
| C7 | Before print | ✅🙋 | Decide the domain; buy it and add DNS if custom |
| A4 | After the invitation proof | ✅ | Approve the print PDF |
| C8 | After A4 | 🙋 | Order prints (specs and printer options provided) |
| — | Throughout | ✅ | Approve each commit change set; answer occasional fact questions |

### C1 — Kickoff 🙋
1. Open the **Paper** desktop app and sign in. Leave it running; I drive it through the Paper MCP.
2. In Terminal, run `gh auth status`. Confirm `caseyisonit` is listed as logged in. If it isn't, run `gh auth login`, choose GitHub.com, then browser login, and sign in as **caseyisonit**.
3. Tell me "C1 done." I then 🤖 create `caseyisonit/megan-and-ryan` (public), clone it to `~/Desktop/Code/megan-and-ryan`, register it in the app, turn on Pages (source: GitHub Actions) through `gh api`, and create `.env.local` (gitignored) with blank keys.

### C2 — Notion access 🙋
1. In Notion, create an empty page named **Megan & Ryan — Wedding HQ**.
2. Go to **notion.so/profile/integrations**, then **New integration**:
   - Name: **Wedding Site**. Type: Internal. Workspace: your personal one.
   - Capabilities: **Read**, **Update**, and **Insert content**. No user information.
   - Click Save, then **Show** → copy the *Internal Integration Secret*.
3. Open `~/Desktop/Code/megan-and-ryan/.env.local` and paste the secret after `NOTION_SITE_TOKEN=`. Save.
4. Create a second integration named **Wedding RSVP**, with **Insert content only**. Paste its secret after `NOTION_RSVP_TOKEN=`.
5. On the HQ page, open **•••** → **Connections** → add **Wedding Site**. Don't add Wedding RSVP yet.
6. Tell me "C2 done." I then 🤖:
   - Create the Guests and Site Copy databases, the Questions page, and the How to edit callout through the API.
   - Seed every copy row and record the data source IDs in `.env.local`.
   - Send you a 3-click follow-up to tighten access: connect **Wedding RSVP** to Guests only, and move **Wedding Site** from the HQ page to Site Copy only.

### C3 — Cloudflare 🙋
1. Sign up at **dash.cloudflare.com** (free plan).
2. When I run `npx wrangler login`, a browser tab opens. Click **Allow**.
3. In the dashboard, open **Turnstile** → **Add widget**:
   - Name: Wedding RSVP. Mode: **Managed**.
   - Hostnames: `localhost`, `caseyisonit.github.io`, plus the custom domain later.
   - Create it, then paste the **Site key** after `TURNSTILE_SITE_KEY=` and the **Secret key** after `TURNSTILE_SECRET=` in `.env.local`.
4. Tell me "C3 done." I then 🤖 deploy the Worker, push its secrets from `.env.local`, create a Cloudflare API token for CI if possible (otherwise one more short step), and set the GitHub Actions secrets through `gh secret set`.

### A1 / A2 — Design approvals ✅
- **A1:** I post screenshots of directions A, B, and C (hero + one interior section, desktop + mobile) and 3 font pairings, with my recommendation. Reply with a letter and a pairing, plus any notes.
- **A2:** I post full-page screenshots at desktop, tablet, and mobile, plus the motion notes. Reply "approved" or list changes; I revise and repost.

### C4 — Bring in the couple 🙋
1. Open the HQ page → **Share** → enter Megan's and Ryan's emails → **Can edit** → Invite. They join as guests; the free plan allows this.
2. Send them the note I draft. It covers what to answer, how to edit `Working copy`, and how setting **Approved** publishes within about 15 minutes.

### C5 — Notion views (optional) 🙋
The Notion API can't create database views, so I'll do it if a newer API version allows; otherwise use these steps. In **Guests**, choose **+ Add view** → Table, then:
- **Caterer:** filter Response = Joyfully accepts. Calculate the Reception count column as **Sum**. Group by Dietary.
- **Ceremony:** same filter; Sum of Ceremony count.
- **Missing address:** filter Mailing address **is empty**.
In **Site Copy**, add a **Board** view grouped by Status.

### A3 / C6 — Launch + save the date ✅🙋
- **A3:** I post the live URL, the QA results, and the save the date image. Reply "approved."
- **C6:** I give you the image file in `~/Desktop/Code/megan-and-ryan/exports/` plus a short text message and an email version. Send them from your phone or email, then tell me. I check off **Save the date sent** in Notion for each household you name.

### C7 — Domain ✅🙋
- **Stay on github.io:** reply "github.io." Done.
- **Custom domain:**
  1. Buy it (Cloudflare Registrar is at cost, about $10/yr; Porkbun or Namecheap also work).
  2. Add DNS records: 4× `A` on `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` `www` → `caseyisonit.github.io`. On Cloudflare DNS, set them to **DNS only** (grey cloud).
  3. Tell me the domain. I then 🤖 add the CNAME, switch the base path, enable HTTPS through `gh api`, add the hostname to Turnstile and the Worker origins, and redeploy. Old github.io links and QR codes redirect.

### A4 / C8 — Print ✅🙋
- **A4:** I post the front and back proof PDF. Reply "approved."
- **C8:** upload `exports/invitation-5x7-print.pdf` to a printer. I'll include 2–3 options (online and Austin-local) with the exact settings: 5×7 in, 0.125 in bleed, 2-sided, uncoated around 110 lb+, black-only if offered. Order 1 proof first if time allows. For addressing, I export a CSV of mailing addresses from Guests.

## Phase 0 — Setup 🤖 (after C1–C3)
- Create the repo, Pages, and Actions secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NOTION_COPY_TOKEN`, `NOTION_COPY_DATA_SOURCE_ID`).
- Domain support:
  - **github.io:** `https://caseyisonit.github.io/megan-and-ryan/`, with `base: '/megan-and-ryan'`.
  - **Custom domain:** handled in C7.
  - `SITE_URL` / `BASE_PATH` come from env, so switching is one change.
- Prepare the photos:
  - Crop the Lumiere watermark with `sips` or ImageMagick.
  - Upscale 2× with the Real-ESRGAN CLI (the engine behind Upscayl).
  - Export web masters and print masters.
  - If the CLI won't run, fallback 🙋: install Upscayl (free), drag in the 3 cropped files from `assets/plates/cropped/`, pick "Real-ESRGAN" at 2×, and save to `assets/plates/upscaled/`.
- In Paper, create the file **Megan & Ryan — Rite** with pages `00 Research`, `01 Tokens & Type`, `02 Website` (1440 / 834 / 390), `03 Save the Date` (1080×1350), and `04 Invitation` (5.25×7.25 in, front and back).

### Notion schema (I create it in C2)
**Guests** database:
- `Household` (title)
- `Guest names`, `Mailing address`, `Dietary notes`, `Note to the couple` (text)
- `Email` (email), `Phone` (phone)
- `Response` (select: Joyfully accepts / Regretfully declines)
- `Ceremony count`, `Reception count` (number)
- `Dietary` (multi-select: None, Vegetarian, Vegan, Gluten-free, Dairy-free, Nut allergy, Shellfish allergy, Other)
- `Source` (select: Website / Manual)
- `Save the date sent`, `Invitation mailed` (checkbox)
- `Submitted` (created time)

**Site Copy** database (every word on the site):
- `Key` (title, e.g. `hero.lede`, `day.ceremony.time`, `faq.3.a`, `stay.2.name`). Never renamed.
- `Section` (select), `Order` (number)
- `What this is` (text; a plain-language label)
- `Working copy` (rich text; the couple edits this)
- `Live copy` (rich text; written only by the sync job; the site reads this)
- `Status` (select: Draft / In review / **Approved** / Live)
- `Notes / questions` (text)
- `Published at` (date)

The save the date and invitation text get rows too, for review only.

**Questions for Megan & Ryan** page: toggles (see the questionnaire section), plus a **How to edit** callout.

Integrations: **Wedding Site** (read/update/insert) → Site Copy only, after setup. **Wedding RSVP** (insert only) → Guests only. Notion API `2025-09-03` uses `data_source_id`.

## Phase 1 — Visual research (informs design)
Output: a moodboard on Paper page `00 Research`, plus `research/visual-research.md` in the session folder. Reference images stay internal and are never published.
- **Surrealism:** Dalí (*Persistence of Memory* melting clocks, *Elephants* on stilt legs, long Catalan shadows, *Spellbound* eyes), Magritte (bowler-hat anonymity, mirrors), Man Ray solarization, Leonora Carrington (ritual and occult)
- **Cult and ritual:** Kubrick symmetry (*Eyes Wide Shut*), *Midsommar* daylight eeriness, Shaker and monastic minimalism, secret-society ephemera (wax seals, membership cards, numbered plates)
- **Photography:** wet-plate collodion and tintype edges, silver halation, plate numbering. This motif becomes the site's "Plate I / II / III" system
- **Fashion:** Yohji Yamamoto, Ann Demeulemeester, and Comme des Garçons lookbooks; Rick Owens editorial layouts
- **Botanical:** calla lilies, including O'Keeffe's 1920s callas (she taught in Canyon, Texas), as a Texas thread
- **Place:** Hill Country limestone, live oak silhouettes, and December light (sunset around 5:30 pm, which lines up with the reception)
- **Halloween first date:** quiet nods only (an eclipse moon, candle smoke). Nothing kitschy

### Type research
Free fonts only, with licenses checked:
- **Display shortlist:** Cormorant Garamond (OFL), Instrument Serif (OFL), Le Murmure (Velvetyne, OFL; condensed and surreal), Bodoni Moda (OFL), Gambetta and Zodiak (Fontshare, free commercial)
- **Text or utility shortlist:** Hanken Grotesk, Geist, Switzer or General Sans (Fontshare), and Geist Mono or IBM Plex Mono for plate numbers, times, and labels
- Produce 3 pairings and test each on the hero, a schedule row, and the form at desktop and mobile sizes. Pick one with the couple.
- Self-host as WOFF2 subsets. No Google Fonts CDN.

### Motion research
Gather references for melt and displacement, slow weighted scroll, long-shadow stretch, and photo "develop" reveals. Note each as a GSAP technique.

**Exit criteria:** a moodboard, 3 directions (A/B/C) each with a palette, type pairing, and motion idea, and a recommendation.

## Phase 2 — Design system & direction (Paper)
### Tokens (starting point)
| Role | Token | Value |
|---|---|---|
| Base | `ink` | `#131211` (off-black) |
| Base | `bone` | `#ECE8E0` (off-white, collodion silver) |
| Accent | `void` | `#000000` |
| Accent | `pure` | `#FFFFFF` |
| Mid | `ash` | `#8E8B85` |
| Mid | `mist` | `#C8C4BB` |

- Type scale: fluid `clamp()`.
- Spacing: a 4/8 base.
- Optional tintype grain overlay as an SVG noise texture.
- Push the tokens to Paper with `create_tokens` / `set_tokens`.

### Direction
Design the hero and one interior section for each of the 3 directions, at desktop and mobile. → **A1 ✅** Casey picks one. Sharing it with the couple is optional and async; it doesn't block the build.

### Full website layout
Desktop, tablet, and mobile. Sections:
1. **Hero:** names, date, "A rite in the Hill Country", CTA "Accept the invitation", Plate III (couple)
2. **Story:** Plates I & II (Megan, Ryan) and the chapter copy
3. **The Day:** schedule with a melting-clock motif at 2:00, 5:00, and 10:00; both venues with map links; travel between them
4. **The Salt Bowl:** the ritual explained, with a drifting bowl illustration
5. **What to Expect:** attire, December weather, phones/unplugged, accessibility
6. **Stay:** lodging cards
7. **Questions:** FAQ accordion
8. **RSVP:** household form with success and error states
9. **Footer:** names, date, contact
- Navigation: sticky minimal index (Story · The Day · The Rite · Stay · Attend), with a full-screen overlay menu on mobile.

### Motion spec (Dalí without the kitsch)
- **Hero:** the names "melt" slightly (SVG `feTurbulence` + `feDisplacementMap`) and harden as the user scrolls.
- **Plates "develop":** the photos fade from black through silver to the image, like a wet plate.
- **Long shadows:** headings cast shadows that stretch with scroll progress.
- **Stilt stems:** calla lily stems stretch into section dividers.
- **Melting clock:** the schedule's clock hands sit on 2:00, 5:00, and 10:00 as each row enters.
- **Lenis:** slow, weighted scrolling.
- **Reduced motion:** with `prefers-reduced-motion`, show the static final states and turn Lenis off.
- **Budget:** about 80 KB of JS gzipped, LCP under 2.5 s on 4G.

**A2 ✅:** Casey signs off on the Paper designs before the build starts. Phase 4b and the Phase 5 Worker can start before A2.

## Phase 3 — Copy
These drafts seed the Notion Site Copy database, one row per Key. The tone is hushed, ritual, wry, and a little uncanny: ceremonial language with warmth underneath, and never campy. ⟨Brackets⟩ mark gaps for Casey or the couple; rows with brackets never publish.

**Hero**
- Eyebrow: A rite in the Hill Country · Texas
- Names: Megan & Ryan
- Lede: Two artists, one long December afternoon, and a small circle of witnesses. You are invited to stand with them.
- Date: Saturday, the twelfth of December, 2026 · Leander, Texas
- CTA: Accept the invitation
- Caption: Plate III — The two of them, and the lilies

**Story — "Chapter one: Two of a kind, and no kind at all"**
- Pull quote: "⟨one line in their own words⟩"
- Body: They met in college and became best friends, the kind who trade records, sketchbooks, and unsolicited opinions. Somewhere between the music and the art, the thing they shared most turned out to be a refusal to be anyone but themselves. Their first date fell on or around Halloween, which explains a great deal. Now, ⟨X⟩ years later, they would like to make it official. In black and white, naturally.
- Captions: Plate I — Megan · Plate II — Ryan

**The Day — "Light moves; so do we"**
- **2:00 pm · The Ceremony.** Lincoln Chapel, 2100 County Road 176, Georgetown (Leander). Doors open at ⟨1:30⟩. Find a seat; the rite begins at two. ⟨What fills 2–5? Ceremony length, cocktail hour, photos?⟩
- **5:00 pm · The Reception.** La Villa Rosa Estate, Leander. Supper, toasts, music, and the salt bowl. ⟨Drive time between venues: verify, about 15–20 min⟩
- **10:00 pm · Release.** The night is yours again.
- Note: GPS needs "County Road," not "Country Road." Map links for both venues.

**The Salt Bowl — "An offering, an inheritance"**
Salt preserves. For as long as people have made promises, it has sealed them. At the reception, a bowl will be waiting. Add a pinch of salt ⟨provided / bring your own?⟩, and with it a piece of wisdom for the marriage: a line, a warning, a recipe, a blessing. The bowl goes home with them and keeps.

**What to Expect**
- **Dress in the dark and the pale.** Black, white, or both. No color, no pattern. Wear what you would want to be remembered in. ⟨Alternative from the earlier draft: "Wear what you would be buried in."⟩
- **December in the hills.** Evenings fall into the 40s. Bring a layer you won't mind being photographed in.
- **Phones away during the rite.** ⟨Unplugged ceremony? Photographer?⟩
- **Small by design.** About thirty witnesses. ⟨Plus-ones only if named?⟩

**Stay — "Where to rest your head"**
All options below need verification of distance, rates, and whether a room block exists.
- **Georgetown:** Sheraton Austin Georgetown (on the San Gabriel River, near the historic square); The Summit at Rivery Park. Closest to the chapel.
- **Cedar Park / Leander:** Hyatt Place Austin/Cedar Park. Practical, minutes from both venues.
- **North Austin, with character:** Lone Star Court (The Domain; motor-court style); Hotel Granduca Austin (west Austin; quiet, old-world).
- **From San Marcos:** the couple's home base is about an hour south. Note for local guests driving back that night.

**Questions — "Questions, answered quietly"**
When should I arrive? · Are children welcome? ⟨⟩ · What about gifts? ⟨Draft: "Your presence is the gift. If you insist, a note for the bowl."⟩ · Parking? · Is it accessible? · How do I get between venues? · Who do I contact? ⟨email⟩

**RSVP — "Reply by the twenty-second of November. Will you stand with us?"**
- Fields: Household name · Names of those attending · Email · Phone · Mailing address · Response (Joyfully accept / Regretfully decline) · Ceremony count · Reception count · Dietary needs + notes · A note for the couple
- Accept confirmation: *It is done. Your name is in the book. We'll see you at the chapel.*
- Decline confirmation: *You'll be missed. We'll keep a pinch of salt in your name.*

**Save the date (1080×1350)**
SAVE THE DATE · Megan Reddick & Ryan Erwin · 12 · 12 · 26 · Leander, Texas · A rite in the Hill Country · Kindly reply by November 22 · [QR] [short URL]

**Invitation, 5×7 front**
Together with a small circle of witnesses / Megan Reddick / & / Ryan Erwin / request your presence at the rite of their marriage / Saturday, the twelfth of December / two thousand twenty-six / at two o'clock in the afternoon / Lincoln Chapel · Leander, Texas / Reception to follow at La Villa Rosa Estate / Dress in black and white / Kindly reply by the twenty-second of November / [QR] [URL]

**Invitation, back:** Plate III, full bleed, with a small caption "Plate III — M & R, MMXXVI".

## Couple questionnaire (Notion "Questions for Megan & Ryan"), async and non-blocking
The couple's review runs in parallel and never blocks design, build, or launch. Their edits publish themselves (see Phase 4b).
- 🤖 I seed every Site Copy row with the drafts above and set those whose facts are verified to Approved, so the first sync publishes them. The site launches on drafts.
- **The couple's loop:** edit `Working copy`, set Status to **Approved**. Within about 15 minutes it's live and Status flips to **Live**. Editing a Live row changes nothing on the site until they set Approved again, so half-finished edits never leak.
- Rows containing an open ⟨bracket⟩ are never published; the site shows that key's fallback or hides the item. A raw placeholder never renders.
- Fact rows (times, addresses, deadline): 🤖 I verify them through research and ✅ ask Casey only when a source conflicts or something can't be found.

Each item is a toggle; they answer inline. Their answers fill the ⟨brackets⟩ above.
1. **Story:** How long since college? One line in your own words for the pull quote. Any detail from the Halloween first date you'd want told (or never told)?
2. **The day:** What happens between 2 and 5 pm? What time should guests arrive? Is the ceremony unplugged? Who is the photographer? Officiant (optional)?
3. **Salt bowl:** Is salt provided, or do guests bring an offering? Any specific instructions? Spoken aloud or silent?
4. **Reception:** Food style (plated, family, buffet)? Bar? Dancing? Any transportation or shuttle?
5. **Policies:** Children? Plus-ones? Gifts or registry? Contact email for guests?
6. **Lodging:** Any room blocks? Which recommendations to keep?
7. **Copy sign-off:** In Site Copy, edit any `Working copy` and set it to Approved to publish. Pick the attire line ("remembered in" or "buried in").

## Phase 4 — Build (Astro)
### Repo layout
```
src/
  pages/
    index.astro              # one-page site
    save-the-date.astro      # 1080×1350 render target for the STD image
    invitation.astro         # print CSS, 5.25×7.25in, renders the 5×7 PDF
  components/
    Hero, Plate, Story, Schedule, SaltBowl, Expect, Stay, Faq, RsvpForm, Nav, Footer
  content.config.ts          # Astro content loader: reads Notion Site Copy "Live copy" at build
  content/copy.fallback.json # seed drafts; used only if Notion is unreachable or a key is missing
  lib/notion-richtext.ts     # rich text → safe HTML (bold, italic, links, line breaks only)
scripts/sync-copy.ts         # promote Approved → Live in Notion, then build
  styles/tokens.css          # same tokens as Paper
  scripts/motion.ts          # GSAP + Lenis; reduced-motion guard
  assets/plates/             # cropped, upscaled portraits (astro:assets → AVIF/WebP srcset)
public/fonts/                # self-hosted WOFF2
public/robots.txt            # Disallow: /
worker/                      # Cloudflare Worker (wrangler.toml, src/index.ts)
.github/workflows/
  deploy.yml                 # on push, every 15 min (cron), and on manual dispatch: sync-copy → build → Pages
  worker.yml                 # wrangler deploy on worker/** changes
```

### Steps
1. `npm create astro@latest`, add `gsap` and `lenis`, configure `site` and `base` from env, add `<meta name="robots" content="noindex">`.
2. Implement components from Paper. Use `get_jsx` and `get_computed_styles` from the Paper MCP for exact values.
3. Responsive pass at 360, 390, 768, 1024, 1440, and 1920. The nav collapses to an overlay on mobile.
4. Accessibility: WCAG AA contrast (off-black on off-white passes), visible focus, labelled fields, errors announced through `aria-live`, alt text for each plate, full keyboard navigation, and the reduced-motion fallbacks.
5. Add Open Graph metadata and an image (the save-the-date art) so shared links preview well.

## Phase 4b — Notion → site copy sync
The site is static, but its words come from Notion.
1. **Promote** (`scripts/sync-copy.ts`, runs in `deploy.yml`):
   - Query Site Copy for Status = Approved.
   - For each row: if `Working copy` contains a ⟨bracket⟩ or is empty, skip it and write a note in `Notes / questions`. Otherwise copy Working copy → `Live copy`, set Status = Live and `Published at` = now.
   - If nothing was promoted and the run is a cron run, **exit early with no deploy**. This keeps scheduled runs cheap.
2. **Build:** the Astro content loader reads `Live copy` for every Key and renders it through `notion-richtext.ts` (allow-listed marks only; output escaped). Components get copy by key, for example `copy('hero.lede')`.
3. **Fallbacks:** a key missing from Notion uses `copy.fallback.json` and logs a build warning. If the Notion API fails, the build fails and Pages keeps serving the last good deploy. The live site never breaks or goes blank.
4. **Triggers:**
   - cron `*/15 * * * *`; GitHub may delay scheduled runs by a few minutes.
   - `workflow_dispatch`: a "Publish now" button in the Actions tab for Casey.
   - Pushes to `main`.
   - Optional faster path: a Notion integration webhook on Site Copy property changes → Worker `/notion-hook` (verifies the signature) → GitHub `repository_dispatch`. Add it only if 15 minutes feels slow.
5. **Guardrails:**
   - Keys are the contract between Notion and the components. Never rename a Key; add new ones instead.
   - Before the build, the job validates that every key the components use exists. A missing key is a warning, not a failure, because the fallback covers it.
   - The Copy token can't touch Guests, and the RSVP token can't read copy.
6. **Test:**
   - Edit a test row, set Approved, run `workflow_dispatch`: the site updates and the row flips to Live.
   - Edit a Live row without approving it: the site does not change.
   - Put a ⟨bracket⟩ in a row and approve it: the row is skipped and noted.

## Phase 5 — RSVP pipeline
**Worker** (`worker/src/index.ts`, about 60 lines):
1. Allow CORS only from `ALLOWED_ORIGINS` and accept `POST` only.
2. Verify the Turnstile token against `challenges.cloudflare.com/turnstile/v0/siteverify`.
3. Validate and clamp the payload: counts between 0 and 10, string lengths, a honeypot field.
4. `POST https://api.notion.com/v1/pages` with `parent: { data_source_id }` and `Notion-Version: 2025-09-03`, mapping fields to properties.
5. Return `{ ok: true }`, or a generic error with no secrets in the response.

**Form:** progressive enhancement. When a guest declines, hide the counts. Inline validation, a disabled submit while sending, and the confirmation copy from Phase 3.

**Test:** run `wrangler dev` with a test Notion database, submit accept, decline, and invalid cases, then switch to the real database.

**Fallback:** if the Worker fails, the error message gives the contact email.

## Phase 6 — Save the date & invitation 🤖 (sends and prints are C6 / C8)
1. Design both in Paper (`03`, `04`) using the same tokens, type, and plates.
2. **Save the date:** export a 1080×1350 PNG or JPG from Paper (`export`). Generate the QR code with the `qrcode` npm package, in off-black on off-white with high error correction. Check it by decoding the exported image. → A3 ✅ → **C6 🙋** send. I mark `Save the date sent` in Notion.
3. **Invitation:** 5.25×7.25 in with 0.125 in bleed and a 0.25 in safe zone. Export the front and back as a combined PDF (`export_combined_pdf`) to `exports/invitation-5x7-print.pdf`.
   - Check: the 300 dpi rule (see the resolution note), a rich-black decision with the printer, and fonts embedded or outlined.
   - Paper stock: uncoated cotton (around 110 lb or heavier) suits the tintype look. → **A4 ✅** → **C8 🙋** order.
4. 🤖 Export a mailing-address CSV from Guests for envelopes, and mark `Invitation mailed` once Casey confirms.

## Phase 7 — QA & launch 🤖 → A3 ✅
- 🤖 Automated checks: Playwright screenshots in WebKit, Chromium, and Firefox at mobile, tablet, and desktop sizes; Lighthouse 90+ for Performance, Accessibility, and Best Practices; axe accessibility scan; an end-to-end RSVP against a test Notion database; the Phase 4b sync tests.
- 🙋 One 2-minute check by Casey: open the live URL on your own phone and submit a test RSVP. I confirm it reached Notion, then delete it.
- 🤖 Proofread all copy. Check every date, time, and address against the venue sites. Make sure no raw ⟨placeholder⟩ text renders. Couple approval is not a launch gate.
- 🤖 Confirm the QR code on the save the date and the invitation opens the live URL.
- Launch order: site live with a working RSVP → A3 → C6 send the save the date → C7 domain → A4 / C8 print.

## Notes & constraints
- **Timing is tight:** the wedding is Dec 12 and RSVPs are due Nov 22. The critical path is a live site with a working RSVP, then the save the date. Motion polish can ship after launch.
- **Repo rules:** commits need Casey's approval of each change set, and nothing in commits or PRs carries AI attribution.
- **Data:** guest data lives only in Notion, never in the public repo. Notion tokens live only in Worker or Actions secrets, with separate least-privilege integrations for RSVPs and copy.
- **Scheduled runs:** GitHub turns off cron workflows after 60 days with no repo activity. That's well past Dec 12, but worth knowing if the site stays up afterward.
- **Verify before publishing:** the La Villa Rosa address, drive time between venues, and lodging details.
- **Photos:** watermark cropped per Casey. Check usage permission with Lumiere if possible.
