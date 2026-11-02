# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Guests (~30 households):** close friends and family of Megan Reddick & Ryan Erwin. Most arrive from a text or email on their phone (save the date link or QR on the printed invitation). Job: understand when and where, what to wear, and reply once per household by Mon Nov 9, 2026 (moved from Nov 22 so printed invitations can go out by Nov 12).
- **Megan & Ryan:** both artists with a very high bar for style. They review and edit every word in Notion; they never touch code.
- **Casey (builder, maid-of-honor-level friend):** runs the build and the sends; needs head counts and mailing addresses in Notion.

## Product Purpose
One responsive page, a digital save the date, and a printed 5×7 invitation that share one design system. Success: every household replies by Nov 9, the caterer count is right, and the couple feel the site is *theirs*: something they'd have made.

## Positioning
Not a wedding template. A small, private rite with a cult-on-purpose tone: ritual, numbered plates, witnesses, a salt bowl. The couple's own wet-plate collodion portraits are the visual source.

## Operating Context
- Ceremony: Sat Dec 12, 2026, guests arrive 3:30–3:50, ceremony 4:05–4:45 pm, The Lincoln Chapel, 2100 County Road 176, Georgetown, TX 78628 (Leander border; GPS must say "County Road"). Indoor, 30 seats.
- Reception: guests arrive 5:30, dinner + salt bowl 6:00, guests depart by 9:45 pm, La Villa Rosa Estate, 20601 Oak Canyon St, Leander, TX 78641 (~25 min drive). Sunset 5:31 pm.
- Salt bowl ritual at the reception (salt provided; guests bring a small totem and may speak). Dress code: black. Plus-ones only if named. Pool + roaming horse and goat at the reception.
- Copy lives in a Notion Site Copy database; RSVPs go to a Notion Guests database through a Cloudflare Worker with Turnstile.

## Capabilities and Constraints
- Astro static site on GitHub Pages (`caseyisonit`), unlisted + `noindex`. Base path from env.
- Fonts must be free; no system fonts unless research justifies it. Fontshare (ITF FFL 2.0) excluded: public repo + no subsetting.
- Budget: ~80 KB JS gzipped, LCP < 2.5 s on 4G. Motion must have a reduced-motion fallback.
- Open: custom domain (C7); several content gaps answered by the couple in Notion.

## Brand Commitments
- Dress code changed to black only (couple, Oct 31). Palette: off-black `#131211` + off-white `#ECE8E0` base; pure `#000`/`#FFF` only as accents. No color.
- Mood: minimalist, surreal (Dalí), timeless, cult on purpose. Never campy, no Halloween kitsch.
- Voice: hushed, ritual, wry, a little uncanny; ceremonial language with warmth underneath.
- Phrases to keep: "A rite in the Hill Country", "witnesses", "Plate I —" captions, "Dress in the dark and the pale", "Questions, answered quietly", "will you stand with us?", "Joyfully accept / Regretfully decline".
- The Adobe Express draft is a starting point to improve on, not the design.

## Evidence on Hand
- Portraits (watermark cropped, greyscale web masters): `src/assets/plates/cropped/{megan,ryan,couple}.png`. Hi-res originals for print: Casey will request from Lumiere.
- Verified facts: `research/venue-facts.md`. Research: `research/visual-research.md`. Plan: `research/plan.md`.
- No officiant, photographer, story details, or registry yet; never invent them.

## Product Principles
1. Reply is the job: the RSVP is reachable from every viewport in one tap.
2. Facts are sacred: times, addresses, and the deadline are verified and never stylized into ambiguity.
3. Strange, not confusing: surreal effects decorate; they never hide information.
4. Their work, not a template: every atom is authored for this couple.

## Accessibility & Inclusion
WCAG 2.2 AA: contrast, visible focus, labelled fields, errors announced, full keyboard use, `prefers-reduced-motion` honored. Guests include older relatives on phones.
