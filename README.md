# LPG Learning Centre — website

Rebuild of [welearnplaygrow.com](https://welearnplaygrow.com) for **LPG Learning
Centre**, a crèche / preschool / nursery / primary school in Festac Town, Amuwo
Odofin, Lagos.

## Build

Thirteen real HTML documents. There is **no build step** — the committed
`.html` files are the source of truth. Edit them directly.

Each page is its own document on purpose. A page cannot inherit the previous
page's scroll offset if it is a different document, and every view gets a real
URL a parent can be sent — or can find on Google, which is how a school is
actually discovered.

Deploy by pushing to `main`; Vercel builds from the repository. Do not use the
dashboard upload or `vercel deploy` — that bypasses Git, and the live site would
then serve something no commit describes.

The old generator lives in `legacy/` and is not used. See `legacy/README.md`.

```
*.html                the pages (source of truth, hand-maintained)
assets/app.css        design tokens, shell, components
assets/layouts.css    layout set (bento, split, rowlist, stats, poster, stack),
                      photo slots, sidebar rail, tooltips
assets/app.js         nav, breadcrumb, sidebar collapse, visit sheet, canvas hero
assets/img/           the real logo, taken from the live site
docs/ONTOLOGY.md      the nouns: object types, links, actions
legacy/build.py       old generator — reference only, not used
```

Serve it — do not open the files directly:

```
python -m http.server 8781
```

## Content

Copy is taken from the school's own Instagram (`@lpg_learn_play_grow`) and their
live site, not invented. Their own framing is used throughout — "The LPG
Advantage", "the future ready school", "Raising intelligent and creative
children". Anything not sourced is marked with a dashed **to confirm** chip
rather than guessed: age bands, class sizes, fees, term dates, deadlines.

## Rules

- **No child's face on a public page without written parental consent.** The
  eleven photo slots hold briefs, not photographs, until the consent pack exists.
  See `docs/ONTOLOGY.md` §3 — `publish_media` is designed to refuse.
- Partner institutions (Federal Ministry of Education, The World Bank,
  IDEAS-TVET) are named **in type only**. Their marks are not ours to reproduce.
- No child-facing accounts anywhere, ever. The Games Corner is play-only: no
  profiles, no comments, no messaging.

## Contact

Admissions 0808 892 4790 · admin@welearnplaygrow.com · 112 Road, Festac Town
