# LPG Learning Centre — Ontology

Written 2026-09-03. Follows `desktop/reference/house-doctrine-2026-08.md`:
**ontology is the nouns, graph engineering is the verbs.** Object types,
properties, link types, actions.

The house rule is *model the nouns before you write the agent*. The site is
static today. This document is what it gets modelled onto when it stops being
static — and it is written now, while nothing is built, precisely so the
structure is deliberate rather than arrived at.

The doctrine notes that the Ajasin ontology's biggest weakness is having **no
`person` object**, and that this is the gap carrying the most privacy weight.
LPG is a school full of minors. Here `person` and `consent` are load-bearing
from line one, not retrofitted.

---

## 0. What LPG actually is

Three businesses under one roof, and the model has to hold all three or it will
keep describing only the first:

1. **A school** — Crèche, Preschool, Nursery, Primary, in Festac Town.
2. **A training centre** — free six-month ECCD certification for Nigerian youth,
   with the Federal Ministry of Education and the World Bank under IDEAS-TVET.
3. **A parent community** — seminars, recurring content series, live events.

Two distinct audiences (parents; aspiring early-years teachers) and therefore two
funnels. A model with only `student` in it cannot represent the second business.

---

## 1. Semantic layer — object types

### `person`
The one object everything else hangs off. **Not** split into separate tables per
kind of human; one object with a `role` set, because the same human is often two
things at once (a staff member who is also a parent; a trainee who becomes staff).

| property | notes |
|---|---|
| `id` | |
| `given_name` | |
| `family_name` | **never rendered publicly for a minor** |
| `roles` | set of: `child`, `guardian`, `staff`, `trainee`, `applicant`, `partner_contact` |
| `is_minor` | derived; drives every publication guard |
| `phone`, `email` | guardians and adults only |
| `notes` | internal |

**Privacy invariant:** for any `person` where `is_minor` is true, the only
attributes any public surface may render are `given_name` and the class they are
in. No surname, no age, no date of birth, no photograph, no contact detail. This
is already the stated rule on the Games Corner page; the ontology is where it
becomes enforceable instead of promised.

### `programme`
Unifies the school stages and the training, because both are "a thing a person
enrols on" and splitting them duplicates every downstream link.

| property | notes |
|---|---|
| `kind` | `school_stage` \| `training` \| `seminar` |
| `name` | Crèche, Preschool, Nursery, Primary, ECCD Certification, Lagos to the World |
| `age_band` | **to confirm with the school** |
| `duration` | e.g. six months for ECCD |
| `fee_model` | `tuition` \| `free` \| `scholarship_funded` |

### `term`
`name`, `starts_on`, `ends_on`. **Dates to confirm.** Three a year.

### `class`
An instance of a `programme` in a `term`, in a room, with staff. This is the
object that actually has a register.

### `enrolment`
The join that carries state: `person` × `class` × `term`, plus `status`
(`enquiring`, `offered`, `settling`, `active`, `left`) and `started_on`.
Deliberately an object, not a link, because it has its own lifecycle and history.

### `enquiry`
What the Book-a-visit sheet creates. `name`, `phone`, `stage_of_interest`,
`source` (`site`, `whatsapp`, `instagram`, `walk_in`, `referral`), `created_at`.
The single most commercially important object on the site and currently the one
the site cannot store.

### `visit`
A confirmed tour: `enquiry`, `scheduled_for`, `outcome`.

### `cohort`
An ECCD intake: `programme`, `opens_on`, `closes_on`, `seats`. Applications are
announced by post, so a cohort is what a `post` announces.

### `application`
`person` × target, where target is a `vacancy`, a `cohort`, or a `scholarship`.
One object, three targets — otherwise three near-identical tables.

### `vacancy`
`title`, `stage`, `requirements[]`, `closes_on`, `apply_to`.
Live now: Mathematics Teacher (Upper Primary), closes **7 Sept 2026**.

### `scholarship_award`
Future Leaders Scholarship. `person`, `covers_from`, `covers_to`, `criteria_met[]`.
Three full tuition awards, Year 1 → Year 4.

### `series` and `post`
The Learning Corner. `series` is the recurring format — **Did You Know?**,
**Tongue Twister**, **Trivia Tuesday**, **What's Your Child's Learning Style?**,
**Preschool Projects**. A `post` belongs to a series, has a `body`, a
`published_on`, and an optional `source_url` back to the original Instagram post.

This is the object that turns their feed from something that evaporates into an
asset. 724 posts exist; roughly none of them are addressable today.

### `event`
Father's Day at LPG, Orientation Day, live showcases, parent seminars.
`name`, `date`, `audience` (`parents`, `children`, `public`), `recap_post`.

### `media_asset`
A photograph or video. `file`, `kind`, `taken_on`, `caption`, `alt_text`,
`publish_state` (`held`, `published`, `withdrawn`).

**Default `publish_state` is `held`.** Nothing is publishable by omission.

### `consent`
The object the whole school depends on and does not yet have.

| property | notes |
|---|---|
| `granted_by` | the `person` with role `guardian` |
| `covers` | the `person` who is depicted (usually a minor) |
| `scope` | set of: `website`, `instagram`, `facebook`, `print`, `press` |
| `evidence` | scan or signed form reference |
| `granted_on`, `expires_on` | |
| `withdrawn_on` | nullable; presence revokes |

Scope is a **set, not a boolean**. A parent who agrees to a photograph in a
printed brochure has not agreed to Instagram, and treating consent as one yes/no
is the most common way schools get this wrong.

### `partner`
Federal Ministry of Education, The World Bank, IDEAS-TVET.
`name`, `relationship`, `programme`. Named in type only — **their marks are not
ours to reproduce.**

### `page`
A real URL on the site. Since the rebuild each page is its own document, so
`page` maps one-to-one onto a file and can carry `title`, `description`, `slug`.

---

## 2. Link types

Palantir's power comes from *many typed links*; the doctrine notes we currently
lean on one. So these are named individually rather than collapsed into a generic
`related_to`:

| link | from → to |
|---|---|
| `guardian_of` | person(guardian) → person(child) |
| `enrolled_in` | enrolment → class |
| `instance_of` | class → programme |
| `runs_in` | class → term |
| `teaches` | person(staff) → class |
| `trained_under` | person(trainee) → cohort |
| `accredited_by` | programme → partner |
| `applies_for` | application → vacancy \| cohort \| scholarship |
| `awarded` | scholarship_award → person(child) |
| `depicts` | media_asset → person |
| `authorises` | consent → media_asset |
| `belongs_to_series` | post → series |
| `announces` | post → cohort \| event \| vacancy |
| `published_on` | post → page |
| `enquired_about` | enquiry → programme |
| `converted_to` | enquiry → enrolment |

`depicts` + `authorises` are the pair that matter. Everything else is
administration; those two are a legal position.

---

## 3. Kinetic layer — actions

Bounded input, schema-validated, one write, logged with who decided it.

| action | guard |
|---|---|
| `request_visit(name, phone, stage)` | rate-limited; creates `enquiry` |
| `confirm_visit(enquiry, when)` | staff only |
| `record_enrolment(child, class, term)` | staff only |
| `grant_consent(guardian, child, scope[], evidence)` | requires evidence reference |
| `withdraw_consent(consent)` | **cascades**: every `media_asset` it authorises returns to `held` immediately |
| `publish_media(asset)` | **refuses** unless every person the asset `depicts` is covered by an unwithdrawn, unexpired consent whose `scope` includes the target surface |
| `publish_post(series, body)` | staff only |
| `open_cohort(programme, dates, seats)` | staff only |
| `submit_application(person, target)` | validates target is open |

`publish_media` is the important one. Written this way, "no child's face goes on a
public page without written consent" stops being a sentence on the A Day page and
becomes something the system physically cannot do. A withdrawal at 9pm unpublishes
by 9:01 without anyone remembering to.

---

## 4. Where the site sits against this today

| Object | Status |
|---|---|
| `page` | **Real.** 11 documents, real URLs, own titles and descriptions. |
| `programme` | Content exists; not data. Age bands unconfirmed. |
| `series`, `post` | Learning Corner is built as static copy. Four posts hard-coded. |
| `vacancy` | Two, hard-coded, one with a live deadline. |
| `media_asset`, `consent` | **Neither exists.** 11 photo slots stand empty, holding briefs. |
| `enquiry` | The sheet collects it and **throws it away** — there is no backend. |
| everything else | Not modelled. |

The honest read: the site is a **projection of an ontology that does not exist
yet**. That is fine and it is the right order — but two of those rows are doing
real damage right now, and they are what section 5 of the next-steps list is about.

---

## 5. Deliberately out of scope

- **No child-facing accounts, ever.** The Games Corner is play-only: no profiles,
  no comments, no messaging. There is no `user` object in this model on purpose.
- **No fee or payment objects yet.** Fees are discussed on a visit. Modelling
  money before the school has asked for it would be inventing a requirement.
- **No attendance/register** until the school says they want it. It is the
  obvious next object, and it is also the one most likely to be a spreadsheet
  they already like.

NDPA applies to all of the above. Guardian contact details are personal data;
a minor's photograph is sensitive personal data.
