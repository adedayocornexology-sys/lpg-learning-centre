# LPG — the brief, decoded

Source: the founder's own note `Aunty Funke.txt`, emailed to himself 7 Sept 2026,
09:20. It records a discussion held with Aunty Funke "yesterday" (6 Sept 2026)
about **the remaining job for LPG**.

This file is the note turned into requirements. Where the note is a wish, it is
marked as a wish. Where it collides with something, the collision is named rather
than smoothed over.

---

## Part 1 — the website

| # | What he wrote | What it means to build |
|---|---|---|
| 1 | It must "contain their language and their words so the taste is exactly how they want it" | Already the rule. Copy is sourced from their Instagram and live site; nothing invented. Keep it. |
| 2 | Take into account "the things that she mentioned which had to do with backend and the logic of this website" | Part 2 below. This is the actual remaining job. |
| 3 | "She wants the website to have games and where the students can find a place to play their games" | **Confirmed as her requirement, not our idea.** The Games Corner exists. It stays play-only: no accounts, no profiles, no comments. |
| 4 | Hero section | Needs rework. Ours is a canvas hero; theirs is "Trial Nanny Free On First Day" over an unscrimmed photo. |
| 5 | "Find out what their colour is and what they intend to use" | **Open question for her.** Do not guess. Their live site runs teal `#4E8E99` + orange `#E07B33`; unknown whether that is chosen or inherited from the template. |
| 6 | Disney Junior cartoons — "rich animations and some nice colors"; design should "appeal to kids… more like a cartoon so that they get that feel" | A direction, not a spec. Note the tension in §Collisions. |
| 7 | Observe "their programmes and how they run activities" | Needs a real conversation or a visit. Age bands, class sizes, fees and term dates are all still `to confirm` chips on our build. |
| 8 | "Direct you to the instagram and also the facebook account of this school" | **Owed by him.** We have `@lpg_learn_play_grow`; the Facebook page is `facebook.com/Learnplaygrow`. Confirm both are the live ones. |
| 9 | "How many pages the website should carry… break the website into sections" | Ours is 11 pages today. Section-by-section sign-off is the right way to get her to actually respond. |
| 10 | "What each color of the website and also the fonts for each" | A design system doc she signs off, per section. |
| 11 | "A place where she can upload all the pictures she wants… our agent who will then pick this up and make use of it on the website based on its judgement of what it thinks fits the design" | Admin photo upload + agent-assisted placement. **This is the one that collides hardest with consent. See below.** |
| 12 | "We want a website they can engage with and not something that will just be there… able to raise a community on the website — that is the end goal" | The strategic point. Engagement is the goal, not a brochure. |

---

## Part 2 — the login page and the dashboard

His own heading: **"NOW THIS IS FOR THE LOGIN PAGE TO THE DASHBOARD"**.

### What she asked for
She wants to **improve her dashboard** for **parents, teachers, admin and students**.

### What he decided, and he is right
> "in this case the children are minors so i do not think there will be need to
> create a seperate account for them so they have to share with their parents"

**No child accounts.** This already matches `docs/ONTOLOGY.md` §5, written before
this conversation: *"No child-facing accounts, ever."* A child is represented in
the system as a `person` with role `child`, reached through their guardian. So the
four roles she named become **three login roles** — admin, staff, guardian — plus
`child` as a subject, never an account holder.

### The requirements he set out
1. **The type of information the dashboard carries matters more than the screens.**
   "so that everyone is carried along."
2. **Build it on the ontology** — "this dashboard should be something like what i
   want describing about ontology so that everyone knows their roles and can
   function in that capacity." `docs/ONTOLOGY.md` is the spec.
3. **A per-role access matrix, stated explicitly.** "what should each role have
   access to and what should they not have access to." He wants both halves
   written down. This is the first deliverable, and it is a document, not code.
4. **What the school will share with parents.** "what type of information does the
   website need from the school as regarding the student and what information is
   it willing to share with parents." **Open question for her.**
5. **Lose nothing.** "we do not want any form of information to be lost… capture
   every bit of data the school generates."
6. **An LPG agent role.** An agent that attends to each role, runs routine tasks
   for people who will not log in, automates against a known schedule, and reports
   back to the school on what is happening and how it can improve. With
   **continuous learning and memory**. This is a later phase, and it only works
   once the data underneath it exists.
7. **Upfront cost, asked professionally.** "i also want to get upfront cost so that
   i can stay guided… how should i get that from her professionally so that it is
   transparent and clear… so that i do not anger any party."

---

## Collisions to resolve before building

**1. Photo upload vs. consent — the important one.**
She wants to upload "all the pictures she wants" and have an agent place them.
Our standing rule is that no child's face goes on a public page without written
parental consent, and `publish_media` in the ontology is designed to *refuse*.

These are not actually in conflict if the upload path is built correctly: she
uploads freely into a **held** state, and publication is gated on a `consent`
record whose `scope` covers the target surface. She never has to think about it;
the system simply cannot publish an unconsented face. Build it this way and the
guardrail becomes a feature — it is the thing that protects *her*, not us.

Do not build a free-for-all uploader that writes straight to a public page.

**2. "Appeal to kids" vs. who actually uses the site.**
The people who read a school website are parents choosing a school, and staff.
Children do not select schools. The cartoon direction belongs in the **Games
Corner** and in illustration accents, not in the admissions path. Worth saying to
her plainly, because getting this wrong produces a site that charms nobody and
loses parents.

**3. "Students" as a dashboard role.**
She named students. He removed them, correctly. This needs to be said back to her
as a decision with a reason — minors, NDPA, no child accounts — rather than
quietly dropped, or it will come back.

---

## Still owed by him

- Their **brand colour** and font intent — ask, do not guess.
- The **Instagram and Facebook** handles confirmed.
- **What the school will and will not share with parents** — the access matrix
  cannot be finished without this.
- Age bands, class sizes, fees, term dates — every `to confirm` chip on the build.
- **Signed parental consent** before a single photograph is published.
- The **number**, and how he puts it to her.

---

## Note on provenance

The note is a stream of thought, written to himself. Nothing in it has been
agreed with Aunty Funke except what it reports from the 6 Sept discussion, and
that report is one-sided. Every "open question for her" above is genuinely open.
