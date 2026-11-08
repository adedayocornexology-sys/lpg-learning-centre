# -*- coding: utf-8 -*-
"""
LPG site build.

Each page is written as its own document. That is the point: a page cannot
inherit the previous page's scroll offset if it is a different document, and
every view gets a real URL a parent can be sent or can find on Google.

Run:  python build.py
"""
import io, os, json, re, datetime
import login_template

OUT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- fragments
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
         'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>')
PANEL = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" '
         'stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="3"/>'
         '<path class="leaf" d="M9.4 4.5v15"/></svg>')
TEL = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
       '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 '
       '014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 '
       '1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>')
WA = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
      '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.5 8.5 0 01-3.9-.9L3 20l1.1-4.9A8.4 8.4 0 1121 11.5z"/></svg>')
MAIL = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M4 5h16v14H4zM4 7l8 6 8-6"/></svg>')
PIN = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
       '<path d="M12 21s-7-5.7-7-11a7 7 0 1114 0c0 5.3-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>')
IG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
      '<path d="M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z"/>'
      '<circle cx="12" cy="12" r="3.2"/><circle cx="17.2" cy="6.8" r="1"/></svg>')

QUICK = ('<div class="quick">'
  '<a href="tel:08088924790">%s Call admissions</a>'
  '<a href="https://wa.me/2348088924790">%s WhatsApp</a>'
  '<a href="https://www.instagram.com/lpg_learn_play_grow/">%s Instagram</a></div>' % (TEL, WA, IG))

# ---------------------------------------------------------------- helpers
def sect(inner, band=False, id=None):
    return '\n      <div class="sect%s"%s><div class="wrap">%s\n      </div></div>' % (
        " band" if band else "", ' id="%s"' % id if id else "", inner)

def head(kick, h2, sub=None):
    out = '\n        <div class="kick">%s</div><h2>%s</h2>' % (kick, h2)
    if sub: out += '\n        <p class="sub">%s</p>' % sub
    return out

def cta(label, href=None):
    if href:
        return '\n        <a class="cta" href="%s" style="margin-top:22px">%s %s</a>' % (href, label, ARROW)
    return '\n        <button class="cta" data-sheet style="margin-top:22px">%s %s</button>' % (label, ARROW)

def card(colour, title, body, shape="r1"):
    return ('<div class="card %s"><div class="tag" style="background:var(--%s)"></div>'
            '<h3>%s</h3><p>%s</p></div>' % (shape, colour, title, body))

def grid(*c):
    return '\n        <div class="grid">%s</div>' % "".join(c)

def ph(ratio, title, note, cls=""):
    """A photo slot. The note is the brief for the school - it doubles as a shot list."""
    return ('<div class="ph %s" data-ratio="%s"><div class="note"><b>%s</b>%s</div></div>'
            % (cls, ratio, title, note))

def bento(*tiles):
    return '\n        <div class="bento">%s</div>' % "".join(tiles)

def tile(span, kicker, title, body, shape="r1"):
    k = '<div class="k">%s</div>' % kicker if kicker else ''
    return '<div class="%s %s">%s<h3>%s</h3><p>%s</p></div>' % (span, shape, k, title, body)

def split(left, right, flip=False):
    return '\n        <div class="split%s">%s%s</div>' % (" flip" if flip else "", left, right)

def rowlist(*rows):
    return '\n        <div class="rowlist">%s</div>' % "".join(rows)

def row(title, body, end=None):
    e = '<div class="end">%s</div>' % end if end else '<div></div>'
    return '<div class="row"><div class="num"></div><div><h3>%s</h3><p>%s</p></div>%s</div>' % (title, body, e)

def stats(*s):
    return '\n        <div class="stats">%s</div>' % "".join(
        '<div class="stat"><div class="big">%s</div><div class="lab">%s</div></div>' % x for x in s)

def poster(kicker, title, body, button=None):
    b = ('<a class="cta" href="%s">%s %s</a>' % (button[1], button[0], ARROW)) if button else ''
    return ('\n        <div class="poster"><div class="k">%s</div><h3>%s</h3><p>%s</p>%s</div>'
            % (kicker, title, body, b))

def stack(*items):
    return '\n        <div class="stack">%s</div>' % "".join(
        '<div class="%s"><div class="n" style="background:var(--%s)">%s</div><h3>%s</h3><p>%s</p></div>'
        % (sh, col, n, t, b) for n, col, t, b, sh in items)

def steps(*s):
    return '\n        <div class="steps">%s</div>' % "".join(
        '<div class="step"><div><h4>%s</h4><p>%s</p></div></div>' % x for x in s)

# Questions asked on a page are also the questions asked into a search box, so
# every FAQ block is registered here and emitted again as FAQPage structured
# data. One source, two outputs - they cannot drift apart.
FAQS = {}

def faq(pairs, key=None):
    if key:
        FAQS[key] = pairs
    return '\n        <div class="faq">%s</div>' % "".join(
        '<details><summary>%s</summary><p>%s</p></details>' % p for p in pairs)

def know(text, tail=None):
    out = ('\n        <div class="know"><span class="lbl">&#128161; Did you know?</span>'
           '<p>%s</p></div>' % text)
    if tail: out += '\n        <p class="sub" style="margin-top:18px">%s</p>' % tail
    return out

def FAQ_KEYED(key, pairs):
    """Registers the pairs under `key` and hands them straight back to faq()."""
    FAQS[key] = pairs
    return pairs

TBD = '<span class="tbd">%s</span>' 

# ---------------------------------------------------------------- shell
SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="LPG Learning Centre">
<meta property="og:locale" content="en_NG">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{site}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="LPG Learning Centre — Learn, Play &amp; Grow. The future ready school, Festac Town, Lagos">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/img/og.jpg">
<meta name="theme-color" content="#FFFBF2">
<link rel="icon" href="assets/img/lpg-mark.svg">{schema}
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="assets/layouts.css">
</head>
<body data-page="{id}">

<div id="app">

  <aside class="side" id="side">
   <div class="sidein">
    <a class="brand" href="index.html" aria-label="LPG Learning Centre, home">
      <img class="lock" src="assets/img/lpg-logo.svg" alt="LPG Learn Play Grow">
      <img class="mk" src="assets/img/lpg-mark.svg" alt="LPG">
      <span class="loc">Festac Town, Lagos</span>
    </a>
    <div id="sidenav"></div>
    <div class="foot">
      <button class="cta" data-sheet><span>Book a visit</span>{arrow}</button>
    </div>
   </div>
  </aside>

  <div class="main">
  <header class="bar" id="bar"><div class="wrap">
    <button class="sidetoggle tip below" id="burger" data-tip="Hide sidebar" aria-label="Hide sidebar">{panel}</button>
    <div class="divider"></div>
    <a class="brand" href="index.html" aria-label="LPG Learning Centre, home">
      <img class="lock" src="assets/img/lpg-logo.svg" alt="LPG Learn Play Grow">
    </a>
    <div class="trail" id="trail"></div>
    <button class="cta" data-sheet>Book a visit {arrow}</button>
  </div></header>

  <main id="view">
    <div class="trailbar"><div class="wrap"><div class="trail" id="trailm"></div></div></div>
    <section class="page">
{body}
    </section>
  </main>

  <nav class="tabs" id="tabs"></nav>
  </div>
</div>

<aside class="sheet" id="sheet" role="dialog" aria-label="Book a visit">
  <div class="handle"></div>
  <div class="wrap">
    <h2 style="font-size:24px">Come and see us.</h2>
    <p class="sub" style="margin-bottom:20px;font-size:14.5px">Tell us when suits and we will
      have someone show you round. No commitment &mdash; most parents visit twice before deciding.</p>
    <form id="visitForm" data-wa="{wa}" data-email="{email}" novalidate>
    <div class="f"><label for="vName">Your name</label>
      <input id="vName" name="name" required placeholder="e.g. Mrs Adebayo"></div>
    <div class="f"><label for="vPhone">Phone or WhatsApp</label>
      <input id="vPhone" name="phone" inputmode="tel" required placeholder="e.g. 0803 000 0000"></div>
    <div class="f"><label for="vWhen">When suits you?</label>
      <input id="vWhen" name="when" placeholder="e.g. Tuesday morning"></div>
    <div class="f"><label for="vStage">Which stage?</label>
      <select id="vStage" name="stage"><option>Cr&egrave;che</option><option>Preschool</option><option>Nursery</option><option>Primary</option><option>Not sure yet</option></select></div>
    <button class="cta" type="submit">Send request {arrow}</button>
    <p class="fine" id="visitNote">We reply on WhatsApp, usually the same day.</p>
    </form>
  </div>
</aside>
<div class="scrim" id="scrim"></div>

<script src="assets/app.js"></script>
</body>
</html>
"""

ADVANTAGE = bento(
  tile("lead", "The LPG advantage", "Nurturing curiosity",
       "Hands-on, project-based lessons that make learning an exciting adventure. "
       "Children here are asked to build the thing, not just hear about it.", "r4"),
  tile("half", None, "Tech-forward mindset",
       "A modern curriculum building the essential skills a child needs for a digital future.", "r2"),
  tile("half", None, "World-class comfort",
       "Secure, fully air-conditioned spaces where children safely learn, laugh and lead.", "r3"))

PURPOSE = sect(
  head("Our purpose", "Education goes beyond textbooks and classrooms.",
       "To carve a distinctive niche recognised for fostering a dynamic and innovative environment that empowers students with a robust foundation in technology and a holistic approach to education.")
  + '<p class="sub">At the heart of our mission is the belief that education goes beyond textbooks and classrooms. We are committed to providing a comprehensive education that not only equips students with technical prowess but also nurtures their creativity, communication skills and character.</p>'
  + '<p class="sub">Our goal is to produce well rounded individuals who are not only competent in their chosen fields but also possess the resilience and adaptability needed to thrive in an ever-evolving world.</p>'
  + '<p class="sub">We shall remain steadfast in our pursuit of excellence, combining technical proficiency with a holistic educational approach, to shape the future leaders and innovators of tomorrow</p>'
  + grid(card("learn", "Our Mission", "To raise adaptable learners — grounded in technology, rich in creativity and strong in character — ready to thrive in an ever-changing world.", "r2"),
         card("play", "Our Vision", "To be recognised as a distinctive, dynamic and innovative learning centre shaping confident future leaders and innovators of tomorrow.", "r3")),
  band=True)

PAGES = {}

# ================================================================= HOME
PAGES['index.html'] = dict(id='home',
  title="LPG Learning Centre — The Future Ready School, Festac",
  desc="Crèche, preschool, nursery and primary school in Festac Town, Lagos. "
       "Raising intelligent and creative children through project-based learning.",
  body="""
      <div class="hero"><div class="wrap">
        <div>
          <div class="eyebrow"><span>Cr&egrave;che</span><span>Preschool</span><span>Nursery</span><span>Primary</span></div>
          <div class="spine"><i class="l">Learn</i>, <i class="p">Play</i> &amp; <i class="g">Grow</i>.</div>
          <h1><span class="swipe">The future ready school.</span></h1>
          <p class="lede">Raising adaptable learners &mdash; grounded in technology, rich in creativity
            and strong in character, ready to thrive in an ever-changing world.</p>
          <div class="actions">
            <button class="cta" data-sheet>Book a visit """ + ARROW + """</button>
            <a class="ghost" href="programmes.html">See our programmes</a>
          </div>
          <div class="pills">
            <span class="pill"><em style="background:var(--learn)"></em>Unlocking hidden talent</span>
            <span class="pill"><em style="background:var(--play)"></em>Teamwork from day one</span>
            <span class="pill"><em style="background:var(--sky)"></em>Interactive-board classrooms</span>
          </div>
        </div>
        <div class="scene"><canvas id="play"></canvas></div>
      </div></div>

      <div class="trust"><div class="wrap">
        <div class="lbl">Early childhood development training delivered in partnership with</div>
        <div class="orgs">
          <b>Federal Ministry of Education</b><span class="sep"></span>
          <b>The World Bank</b><span class="sep"></span>
          <b>Ideas-TVET</b>
        </div>
      </div></div>"""
  + PURPOSE
  + sect(head("The LPG advantage", "Give them the best start.<br>Watch them lead the way.",
              "Three things every child here gets, in the school&rsquo;s own words.") + ADVANTAGE, band=True)
  + sect(split(
        '<div><h3>Admissions are open for Preschool &amp; Primary.</h3>'
        '<p>Spaces for the coming term are limited, and the classes are kept small on purpose &mdash; '
        'small enough that no child is a number.</p>'
        '<p>Come and see a normal school day before you decide anything.</p>'
        + QUICK + cta("Book a visit") + '</div>',
        ph("4:3", "Children at work",
           "A wide shot of a full classroom mid-lesson &mdash; children busy, teacher among them, "
           "not posed to camera.", "r5"))
    )
  + sect(head("Learning corner", "Not just a brochure.",
              "LPG publishes something useful for parents almost every week. Here it stays put "
              "instead of disappearing down a feed.")
         + know("Colouring can help children develop fine motor skills. Holding and controlling "
                "crayons helps strengthen the muscles in their hands and develop the finger skills "
                "they later use for writing.")
         + cta("Read the learning corner", "parents.html"), band=True)
  + sect(head("Two ways in", "Who are you here for?")
         + '\n        <div class="doors">'
           '<a class="door r2" href="programmes.html"><div class="k">For parents</div>'
           '<h3>A school for my child</h3><p>Cr&egrave;che through Primary in Festac Town, with small '
           'classes and project-based lessons.</p><span class="arw">See the programmes ' + ARROW + '</span></a>'
           '<a class="door r3" href="eccd.html"><div class="k">For future teachers</div>'
           '<h3>Training to work with children</h3><p>A free six-month ECCD certification with the '
           'Federal Ministry of Education and the World Bank.</p><span class="arw">See the training '
           + ARROW + '</span></a></div>'))

# ================================================================= PROGRAMMES
def stage(chip, colour, name, body, facts):
    return ('<div class="panel%s" id="pan-%s"><div class="detail">'
            '<div class="chip" style="background:var(--%s)">%s</div>'
            '<div><h3 style="font-family:var(--display);font-size:22px;margin-bottom:8px">%s</h3>'
            '<p style="color:var(--ink-soft);line-height:1.6">%s</p>'
            '<div class="facts">%s</div></div></div></div>'
            % (' on' if name == 'Cr&egrave;che' else '', name.split(';')[-1].lower().replace('&egrave;che','reche').strip(),
               colour, chip, name, body, "".join('<span>%s</span>' % f for f in facts)))

PAGES['programmes.html'] = dict(id='programmes',
  title="Programmes — Crèche to Primary | LPG Learning Centre, Festac",
  desc="Four stages at LPG Learning Centre, Festac Town: crèche, preschool, nursery and primary.",
  body=sect(head("Programmes", "Four stages, one approach.",
              "Each stage has its own room, its own rhythm and its own teachers &mdash; and the same "
              "belief about how children learn.")
    + """
        <div class="seg" data-seg="prog">
          <button class="on" data-panel="creche">Cr&egrave;che</button>
          <button data-panel="preschool">Preschool</button>
          <button data-panel="nursery">Nursery</button>
          <button data-panel="primary">Primary</button>
        </div>

        <div class="panel on" id="pan-creche"><div class="detail">
          <div class="chip" style="background:var(--pink)">C</div>
          <div><h3 style="font-family:var(--display);font-size:22px;margin-bottom:8px">Cr&egrave;che</h3>
            <p style="color:var(--ink-soft);line-height:1.6">Settling in, safely. The first room a child
              meets &mdash; warm, small and unhurried, with the same faces every day.</p>
            <div class="facts"><span>Ages to confirm</span><span>Mon&ndash;Fri</span><span>Festac Town</span></div></div>
        </div></div>

        <div class="panel" id="pan-preschool"><div class="detail">
          <div class="chip" style="background:var(--play)">P</div>
          <div><h3 style="font-family:var(--display);font-size:22px;margin-bottom:8px">Preschool</h3>
            <p style="color:var(--ink-soft);line-height:1.6">Play that teaches. Hands-on making and
              team activity, where hidden talent starts to show itself.</p>
            <div class="facts"><span>Ages to confirm</span><span>Mon&ndash;Fri</span><span>Lego creativity</span></div></div>
        </div></div>

        <div class="panel" id="pan-nursery"><div class="detail">
          <div class="chip" style="background:var(--grow)">N</div>
          <div><h3 style="font-family:var(--display);font-size:22px;margin-bottom:8px">Nursery</h3>
            <p style="color:var(--ink-soft);line-height:1.6">Getting ready to read, write and ask better
              questions &mdash; with circle time still at the centre of the day.</p>
            <div class="facts"><span>Ages to confirm</span><span>Mon&ndash;Fri</span><span>Circle time</span></div></div>
        </div></div>

        <div class="panel" id="pan-primary"><div class="detail">
          <div class="chip" style="background:var(--learn)">1</div>
          <div><h3 style="font-family:var(--display);font-size:22px;margin-bottom:8px">Primary</h3>
            <p style="color:var(--ink-soft);line-height:1.6">Future-ready learning: project-based work on
              interactive boards, making abstract ideas real.</p>
            <div class="facts"><span>Year 1&ndash;Year 4</span><span>Mon&ndash;Fri</span><span>Project based</span></div></div>
        </div></div>""")
  + sect(head("Every term", "What a term actually looks like.",
              "Three terms a year, each ending with something the children have made rather than "
              "only something they have been marked on.")
         + rowlist(
             row("Term projects", "Every class works toward something real &mdash; a build, a performance, "
                 "a presentation &mdash; and the term is planned backwards from it.", "Ends in a showcase"),
             row("Reports parents can read", "Written in plain language, about your child rather than "
                 "about the class average.", "Once a term"),
             row("Show and tell", "Parents are invited in to see the work, not just hear about it. "
                 "The child does the explaining.", "Open to parents")), band=True)
  + sect(head("Class sizes", "Small enough to be known.",
              "Individual attention is the thing parents ask about most, so here is how it works "
              "in practice.")
         + stats(("Small", "Classes kept deliberately small &mdash; exact numbers confirmed on a visit"),
                 ("Y1&ndash;Y4", "Primary runs Year 1 through Year 4"),
                 ("5 days", "Monday to Friday, term time"),
                 ("1 week", "New children are settled in gradually over their first week"))
         + '\n        ' + TBD % "Exact class sizes and staff ratios to confirm with the school")
  + sect(head("Enrolling", "How to join.", "Four steps, and the first one costs nothing.")
         + steps(("Come and see the school",
                  "A short visit during the school day, with children in the rooms. No appointment pressure."),
                 ("Meet the teacher",
                  "Not a salesperson &mdash; the person who would actually be teaching your child."),
                 ("Complete the forms",
                  "Details, medical information and consent, all in one sitting."),
                 ("Settle in gradually",
                  "New children are eased in over their first week rather than dropped into a full day."))
         + '\n        ' + QUICK + cta("Book a visit"), band=True)
  + sect(head("Questions", "Before you ask.")
         + faq(FAQ_KEYED("programmes", [("What ages do you take?",
                 "Cr&egrave;che through Primary, up to Year 4. Age bands shift slightly by room, so they are "
                 "confirmed on a visit."),
                ("How big are the classes?",
                 "Deliberately small, so every child is known by name rather than by average."),
                ("What does it cost?",
                 "Fees are discussed on a visit, so you get the figure for your child&rsquo;s stage rather "
                 "than a range that turns out not to apply."),
                ("Are the classrooms air-conditioned?",
                 "Yes. Fully air-conditioned, secure spaces are part of what LPG calls world-class comfort."),
                ("Do you use technology in lessons?",
                 "Every day &mdash; interactive boards and digital tools, used to teach rather than to "
                 "impress visitors.")]))))

# ================================================================= A DAY
PAGES['a-day.html'] = dict(id='day',
  title="A Day at LPG — circle time to home time | Festac Town",
  desc="The shape of a school day at LPG Learning Centre, Festac: circle time, lessons on "
       "interactive boards, Lego creativity, team activities and handover.",
  body=sect(head("A day at LPG", "Circle time to home time.",
              "The day has the same shape every day, so children always know what is coming next.")
    + '\n        <div class="rail">'
    + "".join('<div class="slot"><div class="t">%s</div><h4>%s</h4><p>%s</p></div>' % x for x in [
        ("First thing", "Arrival &amp; settling",
         "Bags away, names called, a soft start rather than straight into work."),
        ("Circle time", "The day starts together",
         "Everyone sits, everyone is greeted, and the day ahead is talked through out loud. "
         "It is the anchor of the whole timetable."),
        ("Morning", "Core lessons on the board",
         "Literacy and numeracy on interactive boards, in short focused blocks &mdash; a child at the "
         "board working through it, not watching someone else do it."),
        ("Midday", "Break, lunch and outside",
         "Time to run about and eat together. Eating together is part of the teaching."),
        ("Afternoon", "Lego creativity &amp; preschool projects",
         "Building, testing and rebuilding. This is where hidden talent tends to show itself first."),
        ("Later", "Experiments &amp; team activities",
         "Hands-on science, sport and group games: coordination, resilience and working with others."),
        ("Home time", "Handover",
         "A word with whoever collects, about how the day actually went.")])
    + '</div>')
  + sect(head("In pictures", "Real rooms, real children.",
              "Photography from LPG classrooms belongs here &mdash; it is the most persuasive thing the "
              "school has, and right now it only exists on Instagram.")
         + '\n        <div class="mosaic">'
         + ph("", "Circle time", "The whole class sitting together at the start of the day. The single most "
              "recognisable LPG image.", "a")
         + ph("", "At the interactive board", "A child at the board working a problem, teacher seated to "
              "one side.", "b")
         + ph("", "Lego creativity", "Hands and bricks, close in. No faces needed.", "c")
         + ph("", "Outside", "Break time, movement, the yard.", "c")
         + ph("", "An experiment", "The lab-coat science session &mdash; concentration on one child&rsquo;s face.", "d")
         + '</div>'
         + '\n        <p class="cap">Held back until written parental consent is in place. No child&rsquo;s '
           'face goes on a public page without it. ' + TBD % "Consent pack needed before publishing" + '</p>',
         band=True)
  + sect(head("The rooms", "Built for how children learn.")
         + stack(("1", "sky", "Interactive boards", "Digital lessons children walk up to and use themselves.", "r2"),
                 ("2", "play", "Room to make a mess", "Space to build, spill and start again &mdash; art, blocks and construction sets.", "r3"),
                 ("3", "learn", "The world on the wall", "Flags and a world corner: children here are taught to look outward from Festac.", "r2"),
                 ("4", "pink", "Fully air-conditioned", "Secure, comfortable rooms &mdash; a practical thing that makes a long Lagos day workable.", "r3")))
  + poster("Beyond lessons", "The year has landmarks.",
           "Trivia Tuesday every week. Father&rsquo;s Day, when fathers actually come in and take part. "
           "Orientation day before term. Live events where children present their own work to a room "
           "of parents and neighbours. A school year here is not only terms and tests.",
           ("See what parents get", "parents.html")))

# ================================================================= PARENTS
STYLES = bento(
  tile("lead", "Learning styles", "&ldquo;Your child may be learning differently.&rdquo;",
       "What looks like a lack of focus can be a child trying to understand the world in their own "
       "way. Six ways children take information in &mdash; and most children are a mix of several.", "r4"),
  tile("half", None, "Visual", "Learns by seeing &mdash; pictures, diagrams, demonstrations.", "r2"),
  tile("half", None, "Auditory", "Learns by hearing &mdash; explanations, songs, being read to.", "r3"),
  tile("third", None, "Reading &amp; writing", "Learns by words &mdash; lists, labels, writing it down.", "r3"),
  tile("third", None, "Kinaesthetic", "Learns by doing &mdash; hands on it, moving while thinking.", "r2"),
  tile("third", None, "Social", "Learns with others &mdash; talking it through, working in a group.", "r5"))

PAGES['parents.html'] = dict(id='parents',
  title="Learning Corner — for parents | LPG Learning Centre, Festac",
  desc="Learning styles, fine motor development, tongue twisters and parent seminars from "
       "LPG Learning Centre, Festac Town, Lagos.",
  body=sect(head("Learning corner", "For parents, not for marketing.",
              "LPG publishes something useful for parents almost every week. This is where it lives "
              "permanently, instead of scrolling away after a day."))
  + sect(STYLES + '\n        ' + TBD % "Six-type set to check against LPG&rsquo;s own carousel", band=True)
  + sect(head("Did you know?", "Small things that are actually developmental.")
         + know("Colouring can help children develop fine motor skills. Holding and controlling "
                "crayons helps strengthen the muscles in their hands and develop the finger skills "
                "they later use for writing.",
                "So when a child spends twenty minutes colouring in, they are not being kept busy. "
                "They are building the hand they will write with."))
  + sect(head("Say it five times fast", "Tongue twister.",
              "Speech, rhythm and confidence &mdash; disguised as a game. Try it on the drive home.")
         + '\n        <div class="tile r2"><div class="lbl">Tongue twister</div>'
           '<blockquote>Betty Botter bought some butter, but the butter Betty bought was bitter, '
           'so Betty bought some better butter to make the bitter butter better.</blockquote>'
           '<cite>From LPG&rsquo;s tongue twister series</cite></div>', band=True)
  + sect(split(
        '<div><div class="kick">Parent seminars</div>'
        '<h3>Lagos to the World: raising AI-literate children.</h3>'
        '<p>A premium parent empowerment seminar, held in Festac Town &mdash; a session for parents '
        'only, on bringing up children who can hold their own in a digital world.</p>'
        '<p>Not a school tour and not a sales pitch. A working session for adults, with limited '
        'slots each time it runs.</p>'
        '<p class="sub">Call the admissions office on <b>0808 892 4790</b> to be told when the next '
        'one runs. ' + TBD % "Next date to confirm" + '</p>'
        + QUICK + '</div>',
        ph("3:2", "The seminar room", "Parents seated, presenter at the board. The tea-and-coffee shot "
           "from the last one works well here.", "r5"), flip=True))
  + sect(head("Questions", "What parents ask us.")
         + faq(FAQ_KEYED("parents", [("My child struggles to sit still and focus. Should I worry?",
                 "Not necessarily. What looks like a lack of focus is often a child trying to understand "
                 "the world in their own way. We look at how a child learns before anyone calls it a problem."),
                ("Why does colouring matter so much here?",
                 "Because it is fine motor development. Holding and controlling a crayon strengthens the "
                 "exact muscles a child later uses to write."),
                ("How do you communicate with parents?",
                 "Directly. A word at handover, WhatsApp on 0808 892 4790 for anything that will not wait, "
                 "and Instagram for what the children are actually doing."),
                ("Can I visit before deciding?",
                 "Yes, and we would rather you did. Most parents visit twice before they enrol.")])), band=True))

# ================================================================= FIND US
PAGES['find-us.html'] = dict(id='visit',
  title="Find us — 112 Road, Festac Town | LPG Learning Centre",
  desc="LPG Learning Centre, 112 Road, Festac Town, Amuwo Odofin, Lagos. Monday to Friday, "
       "9:00am to 5:00pm. Call 0808 892 4790.",
  body=sect(head("Find us", "Come and see the school.",
              "112 Road, Festac Town, Amuwo Odofin, Lagos. Monday to Friday, 9:00am &ndash; 5:00pm.")
    + '\n        ' + QUICK + cta("Book a visit"))
  + sect(head("On the day", "What a visit actually looks like.",
              "About forty minutes. Nothing to prepare, and no obligation at the end of it.")
         + steps(("Meet someone who teaches",
                  "Not a salesperson &mdash; somebody who is in the rooms every day."),
                 ("See the classrooms in use",
                  "During the school day, with children in them. A quiet empty school tells you nothing."),
                 ("Ask the awkward questions",
                  "Fees, class sizes, and what happens when a child struggles. Ask them."),
                 ("Take your time",
                  "Most parents visit twice before deciding. That is normal and we would rather you did.")),
         band=True)
  + sect(split(
        ph("4:3", "The gate and the building", "How the school looks from the road, so a parent "
           "recognises it on approach. A map screenshot goes here too.", "r4"),
        '<div><h3>Getting here.</h3>'
        '<p><b>112 Road, Festac Town</b>, Amuwo Odofin, Lagos.</p>'
        '<p>Open Monday to Friday, 9:00am to 5:00pm. Parking is on site. Call ahead if you can, '
        'but you are welcome either way.</p>'
        '<div class="quick" style="margin-top:18px">'
        '<a href="https://maps.google.com/?q=112+Road+Festac+Town+Lagos">' + PIN + 'Directions</a>'
        '<a href="tel:08088924790">' + TEL + 'Call</a>'
        '<a href="https://wa.me/2348088924790">' + WA + 'WhatsApp</a></div></div>'))
  + sect(head("Questions", "Practical things.")
         + faq(FAQ_KEYED("find-us", [("Is there parking?", "Yes, on site."),
                ("Can I bring my child along?",
                 "Please do. How they react to the rooms will tell you more than we can."),
                ("What if I can only come after work?",
                 "Say so when you call and we will arrange something that works."),
                ("Can I just message instead?",
                 "Yes &mdash; WhatsApp 0808 892 4790, or send a message on Instagram.")])), band=True))

# ================================================================= WHY LPG
PAGES['why-lpg.html'] = dict(id='why',
  title="Why LPG — raising adaptable learners | Festac",
  desc="Why parents choose LPG Learning Centre in Festac Town: nurturing curiosity, a "
       "tech-forward mindset and world-class comfort.",
  body=poster("Why LPG", "Raising intelligent and creative children.",
              "LPG calls itself the future ready school. In a normal week that means hands-on "
              "projects, technology used to teach rather than to impress, and a room small enough "
              "that a child cannot hide at the back of it.")
  + PURPOSE
  + sect(ADVANTAGE, band=True)
  + sect(head("Beyond the classroom", "Well-rounded, not just well-taught.",
              "From sports and creativity to project-based lessons, LPG works on the parts of a "
              "child that a test does not measure.")
         + rowlist(
             row("Creativity &amp; hands-on skill", "Unlocking hidden talent and self expression."),
             row("Team sports &amp; activities", "Building coordination, resilience and team work from day one."),
             row("Project-based learning", "Making abstract learning real, and finishable."),
             row("Interactive-board classrooms", "Technology used to teach, not to impress visitors."),
             row("Qualified, dedicated staff", "Teachers who know each child by name and by need."),
             row("Individual attention", "Small enough that no child is a number.")))
  + sect(split(
        '<div><div class="kick">Recognised</div><h3>Held to a standard someone else sets.</h3>'
        '<p>LPG delivers Early Childhood Care and Development training in partnership with the '
        'Federal Ministry of Education and the World Bank, under the IDEAS-TVET initiative.</p>'
        '<p>A school trusted to train other people&rsquo;s teachers is being measured by somebody '
        'other than itself. That is worth more than any claim a school makes about itself.</p>'
        + cta("See the ECCD programme", "eccd.html") + '</div>',
        ph("1:1", "The training room", "An ECCD session in progress &mdash; adults learning, materials "
           "on the table.", "r5")), band=True))

# ================================================================= ECCD
PAGES['eccd.html'] = dict(id='eccd',
  title="Free ECCD Training — Federal Ministry of Education & World Bank | LPG",
  desc="A free six-month Early Childhood Care and Development certification at LPG Learning "
       "Centre, Festac, under the IDEAS-TVET initiative.",
  body=sect(split(
        '<div><div class="kick">Free training</div>'
        '<h3>Early Childhood Care &amp; Development.</h3>'
        '<p>LPG Learning Centre, in partnership with the Federal Ministry of Education and the '
        'World Bank under the IDEAS-TVET initiative, invites applications from eligible Nigerian '
        'youths for a <b>free six-month</b> skills acquisition programme in Early Childhood Care '
        'and Development.</p>'
        '<p>It is designed to equip you with practical skills and nationally recognised '
        'competencies for work in nurseries, preschools, daycare centres, NGOs and other early '
        'childhood learning environments.</p></div>',
        ph("3:4", "A trainee at work", "One of the trainees with a small group of children &mdash; "
           "the green ECCD polo is the recognisable detail.", "r4")))
  + sect(stats(("6", "months, start to certification"),
               ("&#8358;0", "no application fee and no tuition"),
               ("4", "parts: classroom, practical, internship, certification"),
               ("NIN", "plus a BVN, and Nigerian youth")), band=True)
  + sect(head("What you will learn", "Practical, not theoretical.")
         + rowlist(
             row("Play-based learning", "How children actually learn, before they can be formally taught."),
             row("Classroom management", "Holding a room of small children without raising your voice."),
             row("Practical hands-on learning", "Working with real children, not case studies."),
             row("Creative art, music &amp; storytelling", "The everyday tools of an early-years room."))
         + '\n        ' + TBD % "Full module list to confirm from the flyer")
  + sect(head("How it runs", "Four parts.")
         + steps(("Classroom training", "The taught foundation of the programme."),
                 ("Practical sessions", "Applying it with children, supervised."),
                 ("Internship", "Real placement experience in a working early-years setting."),
                 ("Certification preparation", "Getting you ready to sit and pass the certification.")),
         band=True)
  + sect(head("Who can apply", "Eligibility.")
         + grid(card("learn", "Nigerian youth", "Open to eligible Nigerian young people.", "r2"),
                card("sky", "A valid NIN", "National Identification Number required.", "r3"),
                card("play", "A BVN", "Bank Verification Number required.", "r2"),
                card("pink", "Especially encouraged",
                     "Female applicants and persons with disabilities are particularly encouraged "
                     "to apply." + TBD % "Exact wording to confirm", "r3"))
         + '\n        <p class="sub" style="margin-top:22px"><b>Applications and deadlines are announced '
           'on LPG&rsquo;s Instagram.</b> Call the office to ask when the next cohort opens.</p>'
         + '\n        ' + QUICK))

# ================================================================= SCHOLARSHIP
PAGES['scholarship.html'] = dict(id='scholarship',
  title="Future Leaders Scholarship — three full tuition awards | LPG",
  desc="Three fully funded tuition awards, Year 1 to Year 4, at LPG Learning Centre, Festac Town.",
  body=poster("Fully funded", "The Future Leaders Scholarship.",
              "Three full tuition awards, Year 1 through Year 4, for children who show academic "
              "excellence, leadership and character. Not a discount and not a bursary &mdash; full "
              "tuition coverage for the whole of Primary.")
  + sect(head("What we look for", "Three things, weighted equally.",
              "A scholarship that only rewarded marks would keep finding the same kind of child.")
         + stack(("1", "grow", "Academic excellence", "Consistent effort and real understanding &mdash; not one good test.", "r2"),
                 ("2", "play", "Leadership development", "Children other children choose to follow, and who use it well.", "r3"),
                 ("3", "pink", "Character &amp; values", "How a child treats people when nobody is marking them.", "r2")),
         band=True)
  + sect(head("The programme", "What an award actually covers.")
         + steps(("Full tuition coverage", "Tuition covered for the full Year 1 to Year 4 run."),
                 ("Academic excellence support", "The academic side held to the same standard throughout."),
                 ("Leadership development", "Deliberate work on leading, presenting and taking responsibility."),
                 ("Character &amp; values", "The part of the report card that does not have a number.")))
  + sect(head("Applying", "How to put a child forward.",
              "Applications open by announcement. The fastest way to know when is to call the "
              "office or follow the school on Instagram.")
         + '\n        <p class="sub"><b>Application window and deadline are announced by LPG.</b> '
           + TBD % "Next deadline to confirm with the school" + '</p>'
         + '\n        ' + QUICK + cta("Ask about the scholarship"), band=True))

# ================================================================= GAMES
PAGES['games.html'] = dict(id='games',
  title="Games Corner — made by the children | LPG Learning Centre",
  desc="Games built by children at LPG Learning Centre, Festac. No accounts, no comments, "
       "first names only.",
  body=sect(bento(
        tile("lead", "Games corner", "Made by the children here.",
             "Children at LPG do not only play games &mdash; they make them. Everything a child builds "
             "gets its own place here, with their name on it.", "r4"),
        tile("half", None, "Play what they made", "Tap a game and it opens. No download and no account.", "r2"),
        tile("half", None, "Their name on it", "First name and class. The credit stays with the work.", "r3")))
  + sect(head("Why it exists", "A child who has shipped something is different.",
              "Making a game turns a screen from something you consume into something you control. "
              "That is the whole tech-forward mindset, in one activity.")
         + rowlist(
             row("It is a real skill", "Sequencing, logic and testing &mdash; taught through something a child wants to finish."),
             row("It is theirs", "A child who can show a parent something they built has evidence, not a report."),
             row("It ends in an audience", "The work gets played by other children, which is the part that motivates.")),
         band=True)
  + sect(head("Safety", "How this is kept safe.", "This page shows children&rsquo;s work, never children.")
         + faq(FAQ_KEYED("games", [("What is shown about a child?",
                 "First name and class only. No photograph, no surname, no age and no contact details."),
                ("Can anyone message my child through this?",
                 "No. There are no accounts, no comments and no messaging anywhere on this page."),
                ("Can we opt out?",
                 "Yes, at any time, and the game comes down. Nothing is published without a parent "
                 "saying yes first.")]))
         + '\n        <p class="sub" style="margin-top:22px">Ready once the first group of children '
           'has something to show.</p>'))

# ================================================================= STORY
PAGES['story.html'] = dict(id='story',
  title="Our Story — the future ready school | LPG Learning Centre, Festac",
  desc="LPG Learning Centre is a dynamic and innovative learning centre in Festac Town, Lagos, grounded in technology, creativity and character.",
  body=sect(split(
        '<div><div class="kick">Our story</div><h3>The future ready school.</h3>'
        '<p>LPG Learning Centre is a preschool and primary school in Festac Town, Amuwo Odofin, '
        'Lagos, built on one idea: children learn best when they are met at their own level and '
        'given something real to make.</p>'
        '<p>&ldquo;Raising intelligent and creative children&rdquo; is the school&rsquo;s own '
        'description of its job &mdash; and the test it holds itself to.</p></div>',
        ph("4:3", "The building", "The school from outside, in daylight, with the sign legible.", "r5")))
  + PURPOSE
  + sect(head("More than a school", "Three things happen here.",
              "Most schools do the first one. LPG does all three, which is why the building is "
              "busy outside class hours.")
         + rowlist(
             row("A school", "Cr&egrave;che, Preschool, Nursery and Primary, in Festac Town.", "Mon&ndash;Fri"),
             row("A training centre", "Free ECCD certification for Nigerian youths, with the Federal "
                 "Ministry of Education and the World Bank.", "Six months"),
             row("A parent community", "Seminars, live events and a weekly stream of things worth knowing.",
                 "Ongoing")), band=True)
  + poster("Recognised", "Measured by somebody other than itself.",
           "LPG delivers Early Childhood Care and Development training in partnership with the "
           "Federal Ministry of Education and the World Bank, under the IDEAS-TVET initiative.",
           ("See the ECCD programme", "eccd.html"))
  + sect(head("Find us", "In Festac, and online.",
              "The school posts most days &mdash; the classrooms, the projects and the children&rsquo;s work.")
         + '\n        ' + QUICK, band=True))

# ================================================================= CAREERS
PAGES['careers.html'] = dict(id='careers',
  title="Careers — we are hiring | LPG Learning Centre, Festac",
  desc="Teaching vacancies at LPG Learning Centre, Festac, Lagos. Mathematics Teacher "
       "(Upper Primary) and Primary School Teacher.",
  body=sect(head("Careers", "Join us in developing tomorrow&rsquo;s leaders.",
              "LPG is looking for enthusiastic, experienced teachers who are passionate about "
              "technology and learning, and who can build engaging lessons that use it well.")
    + rowlist(
        row("Mathematics Teacher &mdash; Upper Primary",
            "Festac, Lagos. Strong subject knowledge, experience teaching Upper Primary pupils, "
            "excellent communication and classroom management, and comfort with digital teaching tools.",
            '<span data-deadline="2026-09-07">Deadline 7 Sept 2026</span>'),
        row("Primary School Teacher",
            "Festac, Lagos. Teaching a class of pupils, responsible for creating engaging lesson "
            "plans that incorporate technology to enhance student learning.",
            "Open")))
  + sect(head("Mathematics Teacher", "What the role asks for.",
              "Upper Primary, at a school that describes itself as future-ready &mdash; so the tools "
              "matter as much as the subject.")
         + grid(card("learn", "Strong subject knowledge", "Confident across the Upper Primary mathematics curriculum.", "r2"),
                card("play", "Upper Primary experience", "You have taught pupils at this stage before.", "r3"),
                card("sky", "Classroom management", "Excellent communication, and a room you can hold.", "r2"),
                card("grow", "Tech-savvy", "Comfortable with digital teaching tools and interactive boards.", "r3"))
         + '\n        <p class="sub" style="margin-top:22px" data-deadline="2026-09-07">'
           '<b>Deadline: 7 September 2026.</b> Send a CV to '
           '<b>admin@welearnplaygrow.com</b>.</p>'
         + '\n        <p class="sub" style="margin-top:22px;display:none" data-deadline-passed>'
           '<b>Applications for this role have closed.</b> If you teach mathematics and would '
           'like to be considered when the school next recruits, send a CV to '
           '<b>admin@welearnplaygrow.com</b> anyway.</p>'
         + '\n        <div class="quick">'
           '<a href="mailto:admin@welearnplaygrow.com">' + MAIL + 'Email your CV</a>'
           '<a href="https://wa.me/2348088924790">' + WA + 'WhatsApp</a>'
           '<a href="tel:08088924790">' + TEL + 'Call</a></div>', band=True)
  + sect(head("Primary School Teacher", "Also open.",
              "Teaching a class of pupils, responsible for creating engaging lesson plans that "
              "incorporate technology to enhance student learning.")
         + '\n        <p class="sub">Send a CV to <b>admin@welearnplaygrow.com</b> or WhatsApp '
           '<b>0808 892 4790</b>.</p>'
         + '\n        <p class="sub" style="margin-top:14px">LPG is an equal opportunity employer.</p>'))

# ================================================================= SEO surface
# One place to change when welearnplaygrow.com is pointed at Vercel.
SITE  = "https://lpg-learning-centre.vercel.app"
PHONE = "+2348088924790"
EMAIL = "admin@welearnplaygrow.com"
# wa.me wants digits only, no plus, no spaces.
WA    = PHONE.lstrip("+")

# The school described once. Every page references it by @id rather than
# repeating it, which is what lets a search engine read eleven pages as one
# organisation instead of eleven unrelated documents.
SCHOOL = {
    "@type": "School",
    "@id": SITE + "/#school",
    "name": "LPG Learning Centre",
    "alternateName": "Learn Play Grow Learning Centre",
    "description": "Cr\u00e8che, preschool, nursery and primary school in Festac Town, "
                   "Amuwo Odofin, Lagos.",
    "url": SITE + "/",
    "logo": SITE + "/assets/img/lpg-logo.svg",
    "image": SITE + "/assets/img/og.jpg",
    "telephone": PHONE,
    "email": EMAIL,
    "address": {"@type": "PostalAddress", "streetAddress": "112 Road, Festac Town",
                "addressLocality": "Amuwo Odofin", "addressRegion": "Lagos",
                "addressCountry": "NG"},
    "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00", "closes": "17:00"}],
    "sameAs": ["https://www.instagram.com/lpg_learn_play_grow/",
               "https://www.facebook.com/Learnplaygrow"],
    "areaServed": {"@type": "Place", "name": "Festac Town, Lagos"},
}
SCHOOL_REF = {"@id": SITE + "/#school"}

def strip_tags(t):
    t = re.sub(r"<[^>]+>", "", t)
    for a, b in [("&rsquo;", "\u2019"), ("&mdash;", "\u2014"), ("&ndash;", "\u2013"),
                 ("&egrave;", "\u00e8"), ("&amp;", "&"), ("&ldquo;", "\u201c"),
                 ("&rdquo;", "\u201d"), ("&#8358;", "\u20a6")]:
        t = t.replace(a, b)
    return t.strip()

def faq_block(key):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip_tags(q),
         "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}}
        for q, a in FAQS[key]]}

def path_of(fname):
    return "" if fname == "index.html" else fname[:-5]   # cleanUrls is on

def breadcrumb(fname, label):
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}]
    if fname != "index.html":
        items.append({"@type": "ListItem", "position": 2, "name": strip_tags(label),
                      "item": SITE + "/" + path_of(fname)})
    return {"@type": "BreadcrumbList", "itemListElement": items}

def job(title, desc, closes, extra=None):
    d = {"@type": "JobPosting", "title": title, "description": desc,
         "datePosted": "2026-08-01", "employmentType": "FULL_TIME",
         "hiringOrganization": SCHOOL_REF,
         "jobLocation": {"@type": "Place", "address": SCHOOL["address"]},
         "applicantLocationRequirements": {"@type": "Country", "name": "Nigeria"},
         "directApply": False}
    if closes: d["validThrough"] = closes
    if extra: d.update(extra)
    return d

# Extra structured data, per page, beyond the school + breadcrumb every page gets.
EXTRA = {
    "programmes.html": lambda: [faq_block("programmes")],
    "parents.html":    lambda: [faq_block("parents")],
    "find-us.html":    lambda: [faq_block("find-us")],
    "games.html":      lambda: [faq_block("games")],
    "eccd.html":       lambda: [{
        "@type": "Course",
        "name": "Early Childhood Care and Development (ECCD) Certification",
        "description": "A free six-month skills acquisition programme in Early Childhood "
                       "Care and Development, delivered with the Federal Ministry of "
                       "Education and the World Bank under the IDEAS-TVET initiative.",
        "provider": SCHOOL_REF,
        "isAccessibleForFree": True,
        "educationalCredentialAwarded": "ECCD certification",
        "hasCourseInstance": [{"@type": "CourseInstance",
            "courseMode": "Onsite", "courseWorkload": "P6M",
            "location": {"@type": "Place", "address": SCHOOL["address"]}}],
        "offers": [{"@type": "Offer", "price": 0, "priceCurrency": "NGN",
                    "category": "Free", "availability": "https://schema.org/LimitedAvailability"}],
    }],
    "careers.html":    lambda: [
        job("Mathematics Teacher — Upper Primary",
            "Festac, Lagos. Strong knowledge of the Upper Primary mathematics curriculum, "
            "experience teaching pupils at this stage, excellent communication and classroom "
            "management, and comfort with digital teaching tools and interactive boards.",
            "2026-09-07"),
        job("Primary School Teacher",
            "Festac, Lagos. Teaching a class of pupils and creating engaging lesson plans "
            "that incorporate technology to enhance student learning.", None),
    ],
}

# ---------------------------------------------------------------- write
if __name__ == "__main__":
    today = datetime.date.today().isoformat()
    for fname, p in PAGES.items():
        blocks = [SCHOOL, breadcrumb(fname, p["title"].split("—")[0].split("|")[0])]
        if fname in EXTRA:
            blocks += EXTRA[fname]()
        graph = {"@context": "https://schema.org", "@graph": blocks}
        schema = ('\n<script type="application/ld+json">%s</script>'
                  % json.dumps(graph, ensure_ascii=False, separators=(",", ":")))
        canonical = SITE + "/" + path_of(fname)
        html = SHELL.format(title=p["title"], desc=p["desc"], id=p["id"],
                            body=p["body"], arrow=ARROW, panel=PANEL,
                            canonical=canonical, site=SITE, schema=schema,
                            wa=WA, email=EMAIL)
        io.open(os.path.join(OUT, fname), "w", encoding="utf-8").write(html)
        print("%-22s %6d bytes" % (fname, len(html)))

    # The dashboard door. Its own shell, noindex, and deliberately kept out
    # of the sitemap: a sign-in page has no business in search results.
    login = login_template.render(SITE + "/login", PHONE,
                                 datetime.datetime.now().strftime("%Y%m%d%H%M"))
    io.open(os.path.join(OUT, "login.html"), "w", encoding="utf-8").write(login)
    print("%-22s %6d bytes" % ("login.html", len(login)))

    # Home first, then the pages a parent deciding on a school actually needs.
    PRIORITY = {"index.html": "1.0", "programmes.html": "0.9", "find-us.html": "0.9",
                "a-day.html": "0.8", "parents.html": "0.8", "eccd.html": "0.8",
                "why-lpg.html": "0.7", "careers.html": "0.7",
                "scholarship.html": "0.6", "story.html": "0.5", "games.html": "0.4"}
    urls = "".join(
        "  <url><loc>%s/%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>\n"
        % (SITE, path_of(f), today, PRIORITY.get(f, "0.5"))
        for f in sorted(PAGES, key=lambda f: -float(PRIORITY.get(f, "0.5"))))
    io.open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % urls)

    io.open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8").write(
        "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE)

    print("%d pages + sitemap.xml + robots.txt" % len(PAGES))
