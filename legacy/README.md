# legacy

Not part of the live site. Nothing in this folder is served or built.

## `build.py` + `login_template.py`

These were the original page generator. They are **not** the source of truth and
**must not** be run to update the site.

The committed `.html` files at the repository root are maintained by hand. The
generator no longer reproduces them: running it writes a different set of pages
into this folder, which would diverge from production.

Kept for reference only. To bring a generator back you would first have to make
it reproduce the committed HTML byte for byte, and enforce that check in CI.

## Rule

Deploy only by pushing to `main`. Do not use the Vercel dashboard upload or
`vercel deploy` for this project — both bypass Git, and the public domain would
then serve something that no commit describes.
