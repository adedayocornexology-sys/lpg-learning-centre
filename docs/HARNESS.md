# The school harness

Written 2026-09-07, at the founder's instruction, *before* the backend is built —
which is the entire point of writing it.

Sits on `docs/ONTOLOGY.md` (the nouns) and `desktop/reference/house-doctrine-2026-08.md`
(how the pieces fit). The build plan it sequences is at
artifact `77fe4c26-08cd-4245-a0ec-6514522ec700`.

---

## The idea, in one line

> **A school harness is everything a school needs to function, modelled once, so that
> a screen and an agent are two callers of the same thing.**

The website is not the harness. The dashboard is not the harness. **The harness is the
ontology, the actions, and the guards.** The website is a client of it. An agent, when a
model is connected, is another client of it. Neither is privileged.

That is the whole architectural bet, and it is worth stating plainly because it is the
one decision that cannot be retrofitted cheaply.

---

## Why this is being written now, with nothing built

Because of what it costs at each moment.

| | Cost to do it now | Cost to add later |
|---|---|---|
| Actions with schemas | a few hours of discipline | rewrite every write path |
| Actor + reason on every write | one column and a habit | the history is simply gone |
| Guards in the database | where they belong anyway | audit every page that ever wrote |
| Typed links, not foreign keys | naming things carefully | re-model live data |

None of the left column requires a model, an agent, or a budget. All of it is the
difference between phase 6 being *a phase* and phase 6 being *a second project*.

**This is the lesson their current system already taught us today.** Its `SubmittedBy`
column is blank on every row. It records that something happened and never who did it.
That is not a bug someone can fix now — the information was never captured, so it does
not exist. An agent operating on that database could never explain itself, because the
data cannot support an explanation.

---

## The three layers

### 1. Semantic — the nouns and the graph

Already written, in `docs/ONTOLOGY.md`. Worth noting how far ahead it is:

- **`person` and `consent` are load-bearing from line one.** The house doctrine names
  "no `people` object" as our biggest ontology gap and lists *"modelling `person`
  casually"* under what we say no to. LPG is where that got done properly.
- **Sixteen typed link types**, against Ajasin's effectively one. The doctrine's note
  that *"Palantir's power comes from many typed links"* is answered here.

What makes it a knowledge graph rather than a schema is that the links are *named and
walkable*: `guardian_of`, `teaches`, `depicts`, `authorises`, `converted_to`. An agent
asked "can this photo go on Instagram?" walks `depicts → person → consent → scope`
rather than being told the answer by a human who checked.

**Still missing, and needed for a harness:** `term` has no real dates, `attendance` is
deliberately unmodelled until the school asks, and there is no `observation` object even
though Teachers Note is one of the seven things their current system already has.

### 2. Kinetic — the actions, which are also the agent's tools

This is the layer that makes agents possible, and it is the layer that does not exist yet.

**Every change to the school's data goes through a named action.** Not a page writing
SQL. Not an API route doing whatever it likes. A named, bounded, validated action.

Each one carries, without exception:

- **bounded input**, validated against a JSON schema
- **schema-validated output**, so a caller never parses free text
- **exactly one job** (graph-engineering rule 1: *a node without a contract cannot be
  safely parallelised*)
- **the actor**, the timestamp, and where it matters, the reason
- **a permission check that fails closed**

Write it once and you get both callers for free:

```
                    ┌─────────────────┐
   dashboard  ──────▶                 │
                    │  action layer   │──────▶  database + audit log
   agent      ──────▶  (contracts)    │
                    └─────────────────┘
```

The dashboard renders a form over the action. The agent calls it as a tool. **There is no
second implementation, so the two cannot drift**, and anything the agent is not allowed to
do is something the dashboard cannot do either.

The starting set is already listed in `ONTOLOGY.md` §3: `request_visit`, `confirm_visit`,
`record_enrolment`, `grant_consent`, `withdraw_consent`, `publish_media`, `publish_post`,
`open_cohort`, `submit_application`.

**Address objects by handle, not by hidden state.** MCP went stateless in the 2026-07-28
revision (`desktop/reference/mcp-spec-2026-07-28.md`), so an action returns a
server-minted id the caller passes back as an ordinary argument — `enquiry_id`,
`consent_id`, `child_id`. It survives statelessness and the model can reason about it.

### 3. Guards — the part that makes a school agent sellable at all

`publish_media` **refuses** unless every person the asset depicts is covered by an
unwithdrawn, unexpired consent whose scope includes the target surface.

That refusal lives in the action layer and in the database, **never in the UI**. So it
holds when a page has a bug, when a new developer arrives, and — the case that matters
here — **when an agent is driving.**

This is not a compliance checkbox. It is the commercial argument:

> Every private school in Nigeria has the same NDPA problem and the same pile of
> children's photographs. An agent with write access to a school's data is a terrifying
> proposition to a head teacher, right up until the moment you can show her the thing it
> physically cannot do.

The guard is what makes the agent sellable. Build it first, not last.

---

## When a model is connected

Not yet, and deliberately. The agent is phase 6 of the plan, after the school is actually
using phases 2–5, because an agent over an empty database has nothing to reason about —
which is exactly the state their current system is in today.

When it happens, the house rules apply:

- **A parent asking a question is a loop, not a graph.** Someone is waiting; latency is
  the product. The doctrine is explicit: *do not convert working loops into graphs for
  fashion.*
- **The unattended work is where a graph earns its keep** — the weekly note to parents,
  enquiry triage, the photo-placement pass she asked for. Nobody is waiting, so fan out →
  reduce in code → synthesise with one agent.
- **Put a verifier on the edge that touches a child.** Perspective-diverse, the same
  pattern chosen for Moya because it teaches minors: correctness, age-appropriateness,
  consent. This is more leverage than adding agents.
- **Tier the models.** Subagents inherit the session model unless overridden. The
  Anthropic key runs on a small balance with auto-reload off.
- **"And then" is not an edge.** Cut every wait where the next step does not read the
  previous step's output.

### On "continuous learning and memory"

From the founder's own brief. Worth being precise, because a parent will eventually ask:
this means **the agent keeps a record it reads back**, not a model that trains itself on
the school's children. Nothing about a child ever leaves the harness to become weights.
Say it in those words to Aunty Funke — it is both true and reassuring, and the vaguer
version is neither.

---

## What this is worth beyond LPG

The doctrine's next-moves list, written 28 August, item 3:

> *Second customer for the harness. One more institution on the Ajasin stack is what
> turns a favour into a product.*

**LPG is that second institution.** Ajasin proved the shape on an archive; LPG proves it
on an operating institution with minors, consent, roles and a daily rhythm — which is a
harder and more valuable case. What is genuinely reusable afterwards is the ontology and
the action layer, not the pages.

Ties to ecosystem exchange **E4 (Schools ↔ MoyaCode)**, currently stage 0.

---

## The honest warning

By the doctrine's own three lanes, this document is **Platform** work, and the rule is
that Platform is *"only built when it serves a paying job"* and must never displace
**Rent**.

So, plainly:

- **Corrected 7 Sept 2026, later the same day:** the work IS commissioned. Aunty
  Funke phoned him, walked him through their existing dashboard, handed over login
  access and showed him what she wants worked on. He has started. What still does
  not exist is anything **in writing** and any **money**, so the immediate job is a
  written scope confirmation and a commencement deposit, not a pitch.
- The founder needs **₦248,000 a month** he does not currently earn. A school harness is
  the more interesting thing to think about and the enquiry capture in phase 2 is the
  thing that gets paid for.
- Everything above costs nothing extra **as long as it is applied while building phases
  1–5 anyway**. The moment it becomes a separate workstream ahead of a signed scope, it
  has stopped serving Rent and the doctrine says stop.

Build phases 1–5 for LPG's money. Build them in this shape so phase 6 is a phase.
