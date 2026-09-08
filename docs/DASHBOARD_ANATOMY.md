# The anatomy of a dashboard

Written 8 September 2026, answering the founder's note of the same morning
(`FOUNDER_NOTE_2026-09-08_dashboard_anatomy.md`).

Sits under `HARNESS.md`. Where the two disagree, HARNESS.md wins — this document is
the *why*, that one is the *contract*.

---

## 1. The one-line definition

> **A dashboard is not a place where you see things. It is a place where you do things,
> and seeing is how you decide which.**

This is the whole distinction, and it is worth holding on to. A report shows you numbers
and leaves you to go and act somewhere else. A dashboard puts the action next to the
number that justifies it. Every design decision below follows from that sentence.

It is also the most useful thing to say to Aunty Funke, because it explains what we are
building without criticising what she already has.

---

## 2. Where the shape came from

Short, because the history only matters where it explains a rule we still obey.

- **The car dashboard.** The metaphor is literal. A driver cannot study instruments; they
  glance. Everything that survived into software dashboards survived because it works at
  a glance. *Rule it left us: if it needs reading, it is not on the dashboard.*
- **Executive Information Systems, 1980s.** Built so one executive could see the whole
  company on one screen. They mostly failed, for a reason worth knowing: they were built
  from what the database happened to contain, not from what the executive had to decide.
  *Rule: start from the decision, never from the table.*
- **BI dashboards, late 1990s.** The screen filled up with everything anyone might want,
  which is how "dashboard" came to mean "wall of charts". This is the failure mode we are
  most likely to repeat.
- **Stephen Few, mid 2000s.** Pushed it back to a single screen you do not scroll, with
  the ink spent on the data rather than the decoration. *Rule: one screen, one job.*
- **The application dashboard, now.** The thing you live inside — sidebar, routing, work
  in the middle. Gmail, Stripe, Linear, Notion, and the Claude interface we copied
  yesterday. The dashboard stopped being a view of the business and became the place the
  business is run from.

LPG is the last kind. Not a wall of charts. A workplace.

---

## 3. The founder's "offices" model

His framing, and it is the correct one:

> *"several offices need access to a portion of the dashboard, this is why roles are
> created. these roles can be called the offices represented."*

A role is an office. An office is defined by the **decisions taken in it**, and its
furniture is whatever those decisions need — nothing more. So the design sequence is
fixed, and it never runs the other way:

```
   who is this person  →  what must they decide  →  what do they need in front of them
        (role)                 (function)                    (the screen)
```

Get this backwards — start from the screen, then invent reasons for it — and you rebuild
the 1990s wall of charts.

### The four offices at LPG

| Office | Decides | Therefore needs |
|---|---|---|
| **Teacher** | is this child alright, and what do I tell the parent | class list, observations, attendance, an editor, term calendar |
| **Parent** | is my child alright, and what is expected of me | their child only, notes shared with them, fees, dates |
| **Head** | is the school alright | enrolment, enquiries, staff activity, consent status, money |
| **Admin / office** | who is coming in, who has paid, who consented | enquiries, records, fees, the consent register |

**A child is not an office.** No child accounts — settled on the call of 6 September, and
it removes an entire class of safeguarding problem at the same time. Where the note says
"student", read *parent of that student*.

⚠️ **This table cannot be finished by us.** Which rows a parent may see is a decision the
school makes, not one we make. That is the access matrix, it is still outstanding from
Aunty Funke, and it is the single thing blocking the parent office.

---

## 4. The physical anatomy

The founder's description is right, and it is what we shipped yesterday at `/portal`:

```
┌──────────────┬─────────────────────────────────────┬──────────────┐
│              │                                     │              │
│   ASIDE      │           MAIN                      │   CONTEXT    │
│              │                                     │  (optional)  │
│  identity    │   the work itself                   │              │
│  navigation  │   one job at a time                 │  detail of   │
│  role switch │   input → action → result           │  what is     │
│              │                                     │  selected    │
└──────────────┴─────────────────────────────────────┴──────────────┘
     fixed              flexible                        appears
     ~240–280px         takes the rest                  on demand
```

Four rules that are not style preferences:

1. **The aside is the only thing that never moves.** It is how someone knows they have not
   fallen out of the system. Its *content* changes with the role; its *position* never does.
2. **The main region shows one job.** Two jobs side by side means neither gets finished.
   If a second thing is genuinely needed at the same time, that is the third column.
3. **The third column is optional and always secondary.** The moment it carries something
   the user must act on, it should have been the main region.
4. **Navigation switches the main region, not the page.** This is what makes it feel like
   an application rather than a website, and it is what the note means by *"routing from
   one route to another"*.

---

## 5. Schema, agent, and where identity actually comes from

This is the question the note asked to have answered once and properly.

### They are three different things, and the classic mistake is merging any two

| | What it is | Does it act? |
|---|---|---|
| **Schema** | the shape of what exists, and the rules about who may touch what | **no** — it is declarative, it only permits and refuses |
| **Identity** | who is making this request, right now | **no** — it is a fact carried on the request |
| **Agent** | a loop that decides which action to call next | **yes** — and it is the only one that does |

### The direct answer

> **No — an agent's identity is not derived from the schema.**

The schema has no idea who anyone is. It knows what a *teacher* may do. It cannot know
that you are one.

Identity comes from **authentication**, at the moment of sign-in. It is attached to the
session as a claim — *this request is being made by person `p_412`, whose role is
`teacher`* — and it rides along with every call afterwards, including every call the agent
makes on that person's behalf.

So the sentence to keep:

> **Identity comes from auth. Permission comes from the schema. Action comes from the
> agent.** Three layers, and the agent is the only one that gets to decide anything.

An agent with no session is nobody, and should be able to read nothing. That is the
correct default, and it should be the failing state.

### What this means for "one agent per role"

The note asks whether to build one agent per role, or one that splits into subagents.

**Neither. The role is not a different agent — it is a different credential the same agent
runs under.**

Same code, same tools, same prompt. What differs per role is only:

1. **the token it holds** — which decides what the database will return,
2. **which tools are exposed** to it,
3. **which documents retrieval is allowed to see.**

That is configuration, not four agents. Four agents means four copies of the same bug and
four places to fix it, and it spends model tokens on plumbing that plain code should do
(graph-engineering rule 3: never spend model tokens on plumbing).

### The rule that makes it sellable

> **If permission lives in the agent's prompt, it is not permission.**

A prompt can be argued with. A row-level policy in the database cannot. So the parent
scoping — *this parent sees this child and no other* — is enforced **in the database**,
under the signed-in person's own identity, and the agent simply never receives rows it is
not entitled to. It does not decide to withhold them. It never had them.

This is the same argument as the consent guard in `HARNESS.md` §3, and it is the thing to
show a head teacher when she asks the obvious frightened question about an AI touching her
pupils' records.

**Settled 8 September:** the database stays **Supabase, its own project, free tier**,
precisely because of this section — Supabase supplies both halves, the row-level policies
*and* the authenticated-caller plumbing those policies check against. Row-level security is
a Postgres feature, not a Supabase one, so it survives a later move; the `auth.uid()`
plumbing is what you would have to rebuild. Reasoning and the alternatives priced in
`DATABASE_DECISION_2026-09-08.md`.

---

## 6. CRUD, tools, skills, workflows

The note is right that the agent's hands are CRUD. One important correction:

**Do not expose raw CRUD.** `update(table, row, values)` cannot be meaningfully
permission-checked, cannot be audited, and cannot be explained afterwards. An agent holding
generic UPDATE on a table of children is precisely the proposition no head teacher will
ever sign.

Expose **named actions** instead — `write_observation`, `share_with_guardian`,
`record_attendance`, `grant_consent`. Each with bounded input, validated output, one job,
the actor recorded, and a permission check that fails closed. That is `HARNESS.md` §2, and
the dashboard renders forms over exactly the same actions, so the two callers cannot drift
apart.

The progression in the note is correct and worth keeping as written:

```
   action        one named, validated thing the system can do
     ↓
   skill         an action performed so often it earns a shortcut
     ↓
   workflow      a fixed sequence, run with predefined prompts
```

Each step down that ladder removes a decision from the model, which is why it cuts tokens.
The end state of a well-understood workflow is that it stops needing a model at all — and
when that happens, it should stop using one.

---

## 7. What this changes about the plan

Nothing structural. It confirms the shape already committed on 7 September, which is the
good outcome — the note arrived at the harness independently.

Three things it adds:

1. **The access matrix is now the critical path**, not a loose end. The parent office
   cannot be designed, let alone built, until the school says what it will and will not
   share. Ask her for that on its own, not as one item in a list of eight.
2. **`observation` needs to exist in the ontology.** The teacher's core act — writing a
   note about a child — has no object modelled for it. `HARNESS.md` already flagged the
   gap; the vertical slice hits it first.
3. **The database question is closed** (§5), so the slice is no longer blocked on it. What
   it is still blocked on is a Supabase project, which only the founder can create.
