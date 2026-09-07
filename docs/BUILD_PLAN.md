# LPG: how we actually build it

Written 7 Sept 2026. Sits on `SCOPE_FROM_CALL_2026-09-06.md` (what she asked for),
`HARNESS.md` (the architecture) and `ONTOLOGY.md` (the data model). The phased
pricing is in artifact `77fe4c26-08cd-4245-a0ec-6514522ec700`.

---

## The strategy, in one line

> **Stop describing it. Ship one thin slice that works, put it in her hand, and let
> the thing itself ask for the money.**

The evidence supports this. On Friday he asked her directly what the next step should
be and got back a single word: "Okay". She does not respond to open questions. She
responded to a phone call where she could point at a screen, and she handed over login
access the same day. **She is a see-it person.** So the next thing she receives should
be a URL, not a paragraph.

---

## Step 0 — The first version. This is the whole play.

**Build one vertical slice: a teacher writes a note about a child, and that child's
parent sees it.**

Nothing else. Not the fee payments, not the PTA video, not the admin console.

### Why this exact slice

- It answers **the thing she complained about most**: teachers do not use the system.
  We already proved why, on her live system: the Teachers Note screen has **no create
  button**, so a teacher literally cannot write a note from the page named after her.
  Fixing precisely that is the sharpest possible reply.
- It is the **smallest thing that demonstrates the whole platform**. If a teacher can
  write and a parent can read, then roles work, permissions work, the database works,
  and the parent portal is real. Everything else after that is more screens on proven
  foundations.
- It is **emotionally legible**. A head teacher does not get excited by a schema. She
  gets excited seeing a parent open their phone and read what the teacher wrote about
  their child this morning.
- It is honest. It is a slice, and we say so.

### What is in it

| | |
|---|---|
| Sign in | The login page already built, three roles: admin, staff, guardian. No child accounts. |
| Teacher view | See my class. Pick a child. Write a note. Save it. Choose whether the parent sees it. |
| Parent view | See my child. Read the notes the school has shared. On a phone. |
| Admin view | See who has an account. Nothing more, this round. |

**Seed it with invented children and invented parents.** Do not put a single real pupil
from their database into a demo. Their six real records stay where they are. This is
both an NDPA point and a trust point, and it is worth saying to her out loud.

### The one feature that sells it

The teacher's note has a **draft state**. A teacher writes freely, then decides whether
to share it with the parent. Their current system has nothing like this, and it is the
difference between a teacher trusting the tool and never opening it again.

---

## The build order after the demo

Straight from the priced plan. Each stage ends with something she can open.

1. **The written plan** — roles, the access matrix, design sign-off, the consent form.
2. **Sign in, roles and permissions** — real accounts for real staff.
3. **The teachers' workspace** — lesson notes, curriculum, templates. The tools she
   asked for, in a shape that feels like WhatsApp rather than software.
4. **The parents' portal** — reports with daily / weekly / monthly subscription,
   messaging back to the school, the child's page.
5. **School fees online** — Paystack. Same integration already proven at Ajasin.
6. **The principal's console** — broadcast, and granting everyone's rights.
7. **Photographs, consent enforced** — bulk upload, held by default, published only
   where consent covers it.

Then, and only then, the per-role agents.

---

## What we need from her before each stage

- **Now:** her brand colours and fonts. The Instagram and Facebook handles confirmed.
- **Before stage 1 ends:** what the school will and will not share with parents. This
  is the one question the whole access matrix hangs on and she has not answered it.
- **Before stage 3:** two of her teachers, for twenty minutes each. Her answer for why
  teachers do not engage and theirs will not be the same answer, and theirs is the one
  that matters.
- **Before stage 4:** age bands, class sizes, term dates.
- **Before stage 5:** the school's account details and the real fee amounts.
- **Before stage 7:** signed parental consent. Nothing visual ships without it.

---

## The honest blocker: the machines

This matters more than any of the above, and it is not about LPG.

**The laptop cannot run this build.** It is a Celeron N3060 with 3.9GB of RAM and a
5400rpm drive. Running the Ajasin site's dev server on it today took 65 seconds to
boot, never finished compiling a page inside four minutes, and then Windows killed it
for running out of memory, taking three other processes with it. A Next.js app with a
database is not going to be developed on it comfortably.

**The Dell is the better machine** (i5-3320M, two to three times the speed) and it is
the machine he intends to use. But there is currently **no shell access to it** from
here. SSH does not answer, so everything on the Dell has to be typed by hand.

So before the first line of the demo is written, one of these has to be true:

1. **SSH back onto the Dell**, so builds and deploys can be driven directly. This is
   the unblock with the highest leverage in the whole project.
2. Or accept that he runs every command on the Dell himself, with guidance.
3. Or build on the laptop and accept it will be slow and will crash.

Option 1 is worth an hour of setup. It pays for itself in the first afternoon.

---

## Sequencing, plainly

1. Get the Dell reachable, or decide we are typing everything by hand.
2. Build the slice. Teacher writes, parent reads. Seeded with invented people.
3. Deploy it to a URL.
4. Send her the URL with two logins: one teacher, one parent. Tell her to open the
   parent one on her phone.
5. **Then** the proposal lands on a desk where something is already working.

The money conversation gets easier at step 5 than it is at step 4, and much easier
than it was on Friday.
