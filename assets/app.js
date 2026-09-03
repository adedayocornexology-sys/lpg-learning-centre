/* ============================================================================
   LPG - shared shell
   Every page is its own document now. That is deliberate: each one gets its own
   scroll position by construction, so switching pages can never inherit the last
   page's offset and animate up to the top. It also means every page has a real,
   linkable, indexable URL - which matters more than SPA cleverness for a school
   that lives on parents searching "nursery Festac".
   The chrome is re-rendered per page, but view transitions hold it still.
   ========================================================================= */

const PAGES = [
  { id:'home',       file:'index.html',      label:'Home',       icon:'M3 11l9-8 9 8M5 10v10h14V10' },
  { id:'programmes', file:'programmes.html', label:'Programmes', icon:'M4 5h16v14H4zM4 10h16M9 5v14' },
  { id:'day',        file:'a-day.html',      label:'A Day',      icon:'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'parents',    file:'parents.html',    label:'Parents',    icon:'M4 19V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z' },
  { id:'visit',      file:'find-us.html',    label:'Find us',    icon:'M12 21s-7-5.7-7-11a7 7 0 1114 0c0 5.3-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' }
];

const MORE = [
  { id:'why',         file:'why-lpg.html',     label:'Why LPG',                    icon:'M12 3l2.4 6.2L21 11l-6.6 1.8L12 19l-2.4-6.2L3 11l6.6-1.8z' },
  { id:'eccd',        file:'eccd.html',        label:'Free ECCD Training',         icon:'M12 4L2 9l10 5 10-5-10-5zM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5' },
  { id:'scholarship', file:'scholarship.html', label:'Future Leaders Scholarship', icon:'M12 3a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM8.6 11.6L7 21l5-2.6L17 21l-1.6-9.4' },
  { id:'games',       file:'games.html',       label:'Games Corner',               icon:'M7.5 12h3.5M9.2 10.2v3.6M15.4 11.4h.01M18 13.2h.01M3 12a5 5 0 015-5h8a5 5 0 010 10H8a5 5 0 01-5-5z' },
  { id:'story',       file:'story.html',       label:'Our Story',                  icon:'M12 6.4C10.5 5 8.5 4.5 6 4.5v13c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2v-13c-2.5 0-4.5.5-6 1.9zM12 6.4v13' },
  { id:'careers',     file:'careers.html',     label:'Careers',                    icon:'M4 8h16v11H4zM9 8V6a2 2 0 012-2h2a2 2 0 012 2v2M4 12.5h16' }
];

const ALL  = PAGES.concat(MORE);
const HERE = document.body.dataset.page || 'home';
const TITLES = { home:'Home', programmes:'Programmes', day:'A Day at LPG',
                 parents:'Parents', visit:'Find us' };
MORE.forEach(m => TITLES[m.id] = m.label);

const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" `
  + `stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

/* ---------- bottom tabs (mobile) ----------
   There is no top nav any more. On desktop the sidebar is the navigation and
   repeating it in the bar only produced dead space next to the call to action. */
const tabs = document.getElementById('tabs');
PAGES.forEach(p => {
  tabs.insertAdjacentHTML('beforeend',
    `<a href="${p.file}"${p.id === HERE ? ' class="on"' : ''}>`
    + `${icon(p.icon)}<span>${p.label}</span></a>`);
});

/* ---------- sidebar ---------- */
const sidenav = document.getElementById('sidenav');
function group(name, list) {
  sidenav.insertAdjacentHTML('beforeend', `<div class="grp">${name}</div>`);
  list.forEach(p => sidenav.insertAdjacentHTML('beforeend',
    `<a href="${p.file}" title="${p.label}"${p.id === HERE ? ' class="on"' : ''}>`
    + `${icon(p.icon)}<span class="lb">${p.label}</span></a>`));
}
group('The school', PAGES);
group('More', MORE);

/* ---------- the trail: a breadcrumb a five year old can read ----------
   It lives in the top bar on desktop (where it replaced a nav that only
   duplicated the sidebar) and under the bar on mobile. Same markup, two homes. */
const gold = getComputedStyle(document.documentElement).getPropertyValue('--grow').trim();
const STAR = `<svg class="star" viewBox="-12 -12 24 24"><path fill="${gold}" `
  + `d="M0-11 3.2-3.6 11-2.9 5.1 2.1 6.9 9.7 0 5.8-6.9 9.7-5.1 2.1-11-2.9-3.2-3.6Z"/></svg>`;
if (HERE !== 'home') {
  const crumb = `<a class="stop" href="index.html">Home</a><span class="dash"></span>`
    + `<span class="stop here">${TITLES[HERE]}</span>${STAR}`;
  ['trail', 'trailm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = crumb;
  });
  requestAnimationFrame(() =>
    document.querySelectorAll('.star').forEach(s => s.classList.add('hop')));
} else {
  document.querySelector('.trailbar').classList.add('hide');
}

/* ---------- sidebar collapse, remembered across pages ---------- */
const appEl = document.getElementById('app');
try { if (localStorage.getItem('lpg_rail') === 'closed') appEl.classList.add('narrow'); } catch (e) {}
const burger = document.getElementById('burger');
function labelToggle() {
  const shut = appEl.classList.contains('narrow');
  const t = shut ? 'Show sidebar' : 'Hide sidebar';
  burger.dataset.tip = t;
  burger.setAttribute('aria-label', t);
  burger.setAttribute('aria-expanded', String(!shut));
}
if (burger) {
  labelToggle();
  burger.addEventListener('click', () => {
    appEl.classList.toggle('narrow');
    labelToggle();
    try { localStorage.setItem('lpg_rail', appEl.classList.contains('narrow') ? 'closed' : 'open'); } catch (e) {}
  });
}

/* ---------- the visit sheet ---------- */
const sheet = document.getElementById('sheet');
const scrim = document.getElementById('scrim');
function openSheet(on) {
  sheet.classList.toggle('on', on);
  scrim.classList.toggle('on', on);
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-sheet]')) openSheet(true);
  if (e.target.closest('[data-close]')) openSheet(false);
});
scrim.addEventListener('click', () => openSheet(false));
addEventListener('keydown', e => { if (e.key === 'Escape') openSheet(false); });

/* ---------- the bar only earns its call to action once the hero has gone ---------- */
const view = document.getElementById('view');
const bar = document.getElementById('bar');
view.addEventListener('scroll', () => bar.classList.toggle('stuck', view.scrollTop > 40));

/* ---------- segmented sub-nav (programmes) ---------- */
document.querySelectorAll('[data-seg]').forEach(seg => {
  seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.panel').forEach(p =>
      p.classList.toggle('on', p.id === 'pan-' + b.dataset.panel));
  });
});

/* ============================================================================
   The hero toys. Home only.
   A nursery site should behave like play, so the hero is not a picture - it is a
   handful of toys with a little physics. 2D canvas, no library: flat bright
   shapes match their Instagram graphics better than muted 3D, and it holds frame
   rate on the cheap Android phones Festac parents actually browse on.
   ========================================================================= */
const cv = document.getElementById('play');
if (cv) {
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = getComputedStyle(document.documentElement);
  const col = n => C.getPropertyValue(n).trim();
  let W, H, S, toys = [], ptr = { x: -999, y: -999, down: false };

  const SPEC = [
    { k:'block', t:'L', c:col('--learn'), r:.115, x:.30, y:.30 },
    { k:'block', t:'P', c:col('--play'),  r:.125, x:.55, y:.20 },
    { k:'block', t:'G', c:col('--grow'),  r:.115, x:.78, y:.33 },
    { k:'ball',  c:col('--pink'), r:.085, x:.22, y:.62 },
    { k:'ball',  c:col('--sky'),  r:.065, x:.86, y:.62 },
    { k:'star',  c:col('--grow'), r:.095, x:.45, y:.74 },
    { k:'crayon',c:col('--play'), r:.10,  x:.68, y:.80 },
    { k:'ring',  c:col('--learn'),r:.075, x:.34, y:.86 }
  ];

  function size() {
    const b = cv.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = b.width; H = b.height; S = Math.min(W, H);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    toys = SPEC.map(s => {
      const home = { x: s.x * W, y: s.y * H };
      return { ...s, R: s.r * S, home, x: home.x, y: home.y, vx: 0, vy: 0,
               a: (Math.random() - .5) * .5, va: 0 };
    });
  }

  function draw(o) {
    ctx.save();
    ctx.translate(o.x, o.y); ctx.rotate(o.a);
    ctx.fillStyle = o.c;
    ctx.shadowColor = 'rgba(30,27,22,.16)'; ctx.shadowBlur = o.R * .5; ctx.shadowOffsetY = o.R * .18;
    if (o.k === 'block') {
      const s = o.R;
      ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, s * .30); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.fillStyle = '#fff';
      ctx.font = `800 ${s * 1.15}px 'Baloo 2', system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.t, 0, s * .06);
    } else if (o.k === 'ball') {
      ctx.beginPath(); ctx.arc(0, 0, o.R, 0, 7); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(255,255,255,.42)';
      ctx.beginPath(); ctx.ellipse(-o.R * .3, -o.R * .34, o.R * .32, o.R * .22, -.6, 0, 7); ctx.fill();
    } else if (o.k === 'ring') {
      ctx.lineWidth = o.R * .42; ctx.strokeStyle = o.c;
      ctx.beginPath(); ctx.arc(0, 0, o.R * .78, 0, 7); ctx.stroke();
    } else if (o.k === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? o.R * .46 : o.R, an = (Math.PI / 5) * i - Math.PI / 2;
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rad, Math.sin(an) * rad);
      }
      ctx.closePath(); ctx.fill();
    } else if (o.k === 'crayon') {
      const w = o.R * .62, h = o.R * 1.7;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2 + h * .18, w, h * .82, w * .3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * .2);
      ctx.lineTo(0, -h / 2); ctx.lineTo(w / 2, -h / 2 + h * .2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const o of toys) {
      if (!reduce) {
        const dx = o.x - ptr.x, dy = o.y - ptr.y, d = Math.hypot(dx, dy) || 1;
        const reach = o.R + S * (ptr.down ? .22 : .15);
        if (d < reach) {
          const f = (1 - d / reach) * (ptr.down ? 2.6 : 1.4);
          o.vx += (dx / d) * f; o.vy += (dy / d) * f; o.va += (dx / d) * .012;
        }
        o.vx += (o.home.x - o.x) * .012;
        o.vy += (o.home.y - o.y) * .012;
        o.vx *= .90; o.vy *= .90;
        o.x += o.vx; o.y += o.vy;
        o.va += (0 - o.a) * .004; o.va *= .93; o.a += o.va;
      }
      draw(o);
    }
    requestAnimationFrame(tick);
  }

  function at(e) {
    const b = cv.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    ptr.x = p.clientX - b.left; ptr.y = p.clientY - b.top;
  }
  cv.addEventListener('pointermove', at);
  cv.addEventListener('pointerdown', e => { ptr.down = true; at(e); });
  addEventListener('pointerup', () => ptr.down = false);
  cv.addEventListener('pointerleave', () => { ptr.x = ptr.y = -999; });
  addEventListener('resize', size);
  size(); tick();
}
