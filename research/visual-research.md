# Visual research — Megan & Ryan, a rite in the Hill Country

Internal only. Reference works are cited by title, never reproduced on the site.

## 1. Themes → design moves
| Thread | References | What we take | Design move |
|---|---|---|---|
| Surrealism | Dalí, *The Persistence of Memory* (1931), *The Elephants* (1948), *Spellbound* dream sequence (1945); Magritte, *The Son of Man*, *Not to Be Reproduced*; Man Ray solarization; Leonora Carrington, *The Giantess* | Objects that behave wrongly but calmly. Long low shadows on empty plains. Things stretched past their natural length. Watching eyes | Type that is too tall (condensed display stretched vertically). A low horizon line with long shadows. One melt per page, never more |
| Cult & ritual | Kubrick, *Eyes Wide Shut* (symmetry, masks, candle-lit order); *Midsommar* (daylight dread, white garments, flower rites); Shaker furniture and meeting houses; monastic manuscripts; secret-society ephemera (wax seals, numbered membership cards, lodge diplomas) | Order, repetition, numbering, plain materials, and the feeling of being *admitted* to something | Numbered sections ("Article I", "Plate III"). Strict centred axes. RSVP treated as signing the book. A sigil (salt circle) as the only ornament |
| Wet-plate photography | Collodion and tintype plates: uneven poured edges, silver halation, scratches, plate numbers etched in the corner | The couple's portraits *are* this medium, so the site borrows its conventions instead of inventing new ones | Plate captions in mono ("Plate I — Megan"). A develop reveal: black → silver → image. Grain as an SVG noise overlay, under 3% opacity |
| Fashion | Yohji Yamamoto and Ann Demeulemeester lookbooks; Comme des Garçons *Six* magazine; Rick Owens editorial | Black on black, off-white on off-white, tailoring, asymmetry, huge margins, tiny captions | Generous whitespace, small mono captions far from big type, and black/white dress code stated plainly |
| Botanical | Calla lilies in the couple's plate; O'Keeffe's *Calla Lilies* series (1920s; she taught in Canyon, Texas) | The calla is sculptural: one curve, one long stem | A single drawn calla stem used as a section divider that stretches (the "stilt stem") |
| Place | Hill Country limestone, live oak silhouettes, December light (sunset 5:31 pm on Dec 12, 2026, just as the reception starts) | Pale chalky stone and late, raking light | The off-white is limestone and collodion silver, not cream. Shadows lengthen with scroll, as the afternoon does |
| Halloween first date | Eclipse, candle smoke | A wink, not a theme | An eclipse-moon dot for the 10 pm row. Nothing orange, no pumpkins |

## 2. Palette (from the brief, mapped to objects)
| Token | Hex | Object |
|---|---|---|
| `ink` | `#131211` | Collodion shadow, black wool suiting |
| `bone` | `#ECE8E0` | Limestone dust, the silver highlight of a plate |
| `ash` | `#8E8B85` | Plate scratches, smoke |
| `mist` | `#C8C4BB` | Chapel concrete |
| `smoke` | `#6B6862` | Candle smoke; muted text on light grounds |
| `void` | `#000000` | Accent only: the deepest plate black, focus rings on light |
| `pure` | `#FFFFFF` | Accent only: calla petals, halation highlights |

Contrast (WCAG): `ink`/`bone` 15.3:1. `ash` on `bone` is only 2.8:1, so on light grounds ash is decoration only and muted text uses `smoke` (4.5:1, AA). On dark grounds `ash` is 5.5:1 and `mist` is 10.8:1, both fine for body text.

## 3. Type research (free only)
| Font | License | Notes | Verdict |
|---|---|---|---|
| Cormorant Garamond | OFL 1.1 (Google Fonts) | Display-cut Garamond with sharp, high-contrast light weights and a beautiful italic. Timeless, legible | ✅ Pairing 1 |
| Instrument Serif | OFL 1.1 | Condensed, contemporary editorial serif; one weight + italic | ✅ Pairing 2 (support) |
| Le Murmure | OFL 1.1 (Velvetyne), **Reserved Font Name** | Ultra-condensed, unnerving, alternates that look slightly *off* (the surreal brief in one font). Only one weight. RFN means we ship Velvetyne's own WOFF2 unmodified, no subsetting | ✅ Pairing 2 (display) |
| Bodoni Moda | OFL 1.1 | Optical-size Didone, extreme contrast. Ceremonial, diploma-like, lodge-certificate energy | ✅ Pairing 3 |
| Gambetta, Zodiak (Fontshare) | ITF FFL 2.0 (Aug 2026) | **Rejected.** FFL 2.0 forbids subsetting/format conversion and forbids making the files available via public repositories. Our repo is public | ❌ |
| Switzer, General Sans (Fontshare) | ITF FFL 2.0 | Same license problem | ❌ |
| Hanken Grotesk | OFL 1.1 | Quiet grotesk with a warm, slightly old shape; good at 15–17px body | ✅ text |
| Geist / Geist Mono | OFL 1.1 | Neutral, precise. Mono reads as "plate number / catalogue entry" | ✅ labels, times |
| IBM Plex Mono | OFL 1.1 | More mechanical than Geist Mono | Backup |

**System fonts: not used.** No research reason to: the brand depends on display type, and the weight budget is fine (≈ 25–60 KB per family in WOFF2).

**Delivery:** self-host WOFF2 from `@fontsource/*` packages (already subset by Unicode range, OFL-compliant), plus Le Murmure's official WOFF2 as-is. No Google Fonts CDN.

### The three pairings
1. **Plate** — Cormorant Garamond 300 / 300 italic (display + body) · Geist Mono 400 (labels, times, plate numbers).
2. **Persistence** — Le Murmure (display) · Instrument Serif 400 italic (ledes, quotes) · Geist Mono 400 (labels).
3. **Order** — Bodoni Moda 400 + small caps (display) · Hanken Grotesk 400 (body) · Geist Mono (numbers).

## 4. Motion research → techniques
| Effect | Reference | Technique |
|---|---|---|
| Melt / displacement | *Persistence of Memory* | SVG `feTurbulence` + `feDisplacementMap` on the name SVG; GSAP tweens `scale` from ~18 → 0 over the first 40% of hero scroll |
| Slow, weighted scroll | Kubrick's slow dolly | Lenis `lerp: 0.08`, `wheelMultiplier: 0.8` |
| Long shadows | Dalí's Catalan plains, Dec 5:31 pm sun | Duplicated heading in `ink` at 12% opacity, `skewX` + `scaleY` driven by ScrollTrigger progress |
| Plate develop | Collodion in the fixer bath | CSS filter tween: `brightness(0) → brightness(1.4) contrast(0.6) → none`, 1.6 s, `power2.out` |
| Stilt stems | *The Elephants* | SVG calla stem path; `scaleY` 0.2 → 1 scrubbed between sections |
| Clock hands | Melting clock | SVG hands rotate to 2:00 / 5:00 / 10:00 as each row enters; the face has a slight displacement |
| Reduced motion | — | `prefers-reduced-motion`: final states, no Lenis, no scrub |

## 5. Directions (for A1)
- **A · Collodion.** Light (bone) ground, centred plates with poured-edge vignettes, Cormorant display, mono captions. Quiet, timeless, closest to the photographs. Motion: plates develop.
- **B · Persistence.** Dark (ink) ground, enormous condensed names stretched to the full viewport height, a low horizon with one long shadow, Instrument Serif italic voice. The most surreal and fashion-forward. Motion: melt + long shadows.
- **C · The Order.** Light ground, strict bilateral symmetry, Bodoni caps, numbered *Articles*, a salt-circle sigil, and the RSVP as a membership card. The most "cult on purpose." Motion: iris (eye) reveal + clock hands.

**Recommendation:** **B**, with the plates and captions from A. It's the only direction that makes the site feel like *their* work rather than a wedding template, and Le Murmure's condensed forms echo the stilt-legged Dalí figures without illustrating them.

## 6. Decision (A1, approved by Casey, Oct 28)
**Direction D · The Order at dusk** = C's structure and content order + B's ink palette + A's difference-blend names over the plate.
- Hero: almond eye with eyelids that part; MEGAN above / RYAN below, stacked at every size, inverting where they cross the eye. "A rite in the Hill Country" kept.
- Schedule: Roman hour + clock time in column 1, details in column 2, rows stacked; single column on mobile.
- Accept: plain, obviously clickable bone button with "Reply by 22 November" (no wax seal, no sigil mark in the header).
- Type: **Imbue** (OFL, condensed Didone, opsz 100, weight 600) for display only · **Libre Caslon Text** (OFL) for voice and body · **Hanken Grotesk** (OFL) for small UI. Le Murmure dropped for legibility at small sizes.
- Motion: transform/opacity only (WebKit measured 17 ms p50 / 18 ms p95). No SVG displacement on load or scroll.
