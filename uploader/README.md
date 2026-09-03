# LPG photo intake — deploy in five minutes

A Google Apps Script web app. **It runs as you**, so every file the school
uploads lands in *your* Drive. They need no Google account, there is no server,
and it costs nothing.

## Why this shape

Three things had to be true at once: Aunty Funke gets a single link she can open
on a phone, the files arrive in your Drive rather than as WhatsApp compressions,
and nothing arrives untagged. A plain Google Form would force her to sign in and
would give you a folder of `IMG_2431.jpg` with no idea what any of them are for.

So the form is built around **the eleven empty photo slots on the site**. She
picks what the picture shows before she picks the file, and it is filed into
`LPG website uploads / <page> — <slot>` on arrival. What lands is already sorted
into what it is for.

Consent is a **required checkbox**, not a footnote, and each upload is written to
a running `LPG upload log` sheet with who confirmed it and when. That is the whole
reason the eleven slots on the site are still empty — this is the door it has to
come through.

## Deploy

1. Go to **script.google.com** → **New project**
2. Rename it `LPG photo intake`
3. Paste `Code.gs` over the default `Code.gs`
4. **File → New → HTML file**, name it exactly `Index`, paste `Index.html`
5. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**  ← this is what makes files land in your Drive
   - *Who has access:* **Anyone**
6. Authorise when prompted (it asks for Drive access — that is the point)
7. Copy the web app URL. **That is the link you send her.**

First upload creates `LPG website uploads` in your Drive root, plus the log sheet.

## Sending it to her

Something like:

> Good afternoon ma. Here is the link for sending photographs for the new website:
> `<url>`
>
> It works on your phone — no login needed. It shows the eleven pictures we still
> need and describes each one, so you can just pick the one you have and send it.
>
> One thing: it asks you to confirm that parents have given written permission for
> any child in the photo. If you are not sure about a particular picture, please
> hold that one back and send the rest.

## Pulling them down

Once photos are in, they come down the same way the Ajasin Cohort 1 set did:

```
rclone lsjson --drive-root-folder-id <folder id> gdrive:
rclone copy --drive-root-folder-id <folder id> gdrive: ./incoming
```

Then resize, **strip EXIF** (phone photos carry GPS, and these are taken at a
school), and drop them into the matching slot in `build.py`.

## Adding a slot later

Add one entry to `SLOTS` in `Code.gs` and redeploy. The page builds itself from
that array, so the form and the shot list can never drift apart.
