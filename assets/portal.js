/* A prototype, deliberately with no server. Everything lives in this browser.
   The point is not the storage, it is the flow: a teacher writes a note, decides
   whether to share it, and the parent sees only what was shared. That single
   loop is the thing their current system cannot do at all, because its Teachers
   Note screen has no create button. */
(function () {
  var KEY = 'lpg_portal_v1';
  var CHILDREN = [
    { id: 'c1', name: 'Adaeze Okafor',   initials: 'AO', guardian: 'Mrs Folake Okafor' },
    { id: 'c2', name: 'Tunde Bakare',    initials: 'TB', guardian: 'Mr Segun Bakare' },
    { id: 'c3', name: 'Zainab Musa',     initials: 'ZM', guardian: 'Mrs Halima Musa' },
    { id: 'c4', name: 'Chidi Nwosu',     initials: 'CN', guardian: 'Mrs Ngozi Nwosu' },
    { id: 'c5', name: 'Ololade Adeyemi', initials: 'OA', guardian: 'Mr Kunle Adeyemi' }
  ];
  var PARENT_CHILD = 'c1';
  var TEACHER = 'Mrs Grace Ilesanmi';

  var seed = [
    { id: 'n1', child: 'c1', body: 'Adaeze settled in very well this morning and led the song at circle time.', shared: true,  at: Date.now() - 86400000 * 2 },
    { id: 'n2', child: 'c1', body: 'She is still finding scissors difficult. We will keep practising this week.', shared: true,  at: Date.now() - 86400000 },
    { id: 'n3', child: 'c2', body: 'Watch Tunde at lunch, he has been quiet since Monday.', shared: false, at: Date.now() - 3600000 * 5 }
  ];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seed.slice();
  }
  function save(notes) {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
  }

  var notes = load();
  var role = null, openChild = null;

  var el = function (id) { return document.getElementById(id); };
  var views = ['vSignin', 'vClass', 'vChild', 'vParent'];

  function show(id) {
    views.forEach(function (v) { el(v).hidden = (v !== id); });
    el('bar').hidden = (id === 'vSignin');
    window.scrollTo(0, 0);
  }

  function when(ts) {
    var d = Math.floor((Date.now() - ts) / 86400000);
    if (d <= 0) return 'Today';
    if (d === 1) return 'Yesterday';
    return d + ' days ago';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function noteHtml(n, forParent) {
    var tag = n.shared
      ? '<span class="tag shared">Shared with parent</span>'
      : '<span class="tag draft">Draft, only you</span>';
    return '<div class="note"><div class="top">' + (forParent ? '' : tag) +
      '<span class="when">' + when(n.at) + '</span></div><p>' + esc(n.body) +
      '</p><div class="by">' + TEACHER + '</div></div>';
  }

  function renderClass() {
    el('kidList').innerHTML = CHILDREN.map(function (c) {
      var n = notes.filter(function (x) { return x.child === c.id; }).length;
      return '<button class="kid" type="button" data-child="' + c.id + '">' +
        '<span class="av">' + c.initials + '</span><span class="tx"><b>' +
        esc(c.name) + '</b><span>' + esc(c.guardian) + '</span></span>' +
        '<span class="cnt">' + (n ? n + (n === 1 ? ' note' : ' notes') : 'No notes') +
        '</span></button>';
    }).join('');
  }

  function renderChild() {
    var c = CHILDREN.filter(function (x) { return x.id === openChild; })[0];
    el('childName').textContent = c.name;
    var mine = notes.filter(function (n) { return n.child === openChild; })
                    .sort(function (a, b) { return b.at - a.at; });
    el('childNotes').innerHTML = mine.length
      ? mine.map(function (n) { return noteHtml(n, false); }).join('')
      : '<div class="empty">Nothing written yet. What you write here is a draft until you tick the box to share it.</div>';
  }

  function renderParent() {
    var mine = notes.filter(function (n) { return n.child === PARENT_CHILD && n.shared; })
                    .sort(function (a, b) { return b.at - a.at; });
    el('parentNotes').innerHTML = mine.length
      ? mine.map(function (n) { return noteHtml(n, true); }).join('')
      : '<div class="empty">Her teacher has not shared anything yet. You will see notes here as they are shared.</div>';
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  // sign in
  document.querySelectorAll('.role').forEach(function (b) {
    b.addEventListener('click', function () {
      role = b.getAttribute('data-as');
      if (role === 'teacher') {
        el('whoName').textContent = TEACHER;
        el('whoRole').textContent = 'Teacher, Nursery 2';
        renderClass(); show('vClass');
      } else {
        el('whoName').textContent = 'Mrs Folake Okafor';
        el('whoRole').textContent = 'Parent of Adaeze';
        renderParent(); show('vParent');
      }
    });
  });

  el('signOut').addEventListener('click', function () {
    role = null; openChild = null; show('vSignin');
  });

  el('kidList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-child]');
    if (!b) return;
    openChild = b.getAttribute('data-child');
    el('body').value = ''; el('shareIt').checked = false;
    el('saveNote').disabled = true;
    renderChild(); show('vChild');
  });

  el('backClass').addEventListener('click', function () {
    renderClass(); show('vClass');
  });

  el('body').addEventListener('input', function () {
    el('saveNote').disabled = !el('body').value.trim();
  });

  el('saveNote').addEventListener('click', function () {
    var text = el('body').value.trim();
    if (!text) return;
    var shared = el('shareIt').checked;
    notes.push({ id: 'n' + Date.now(), child: openChild, body: text,
                 shared: shared, at: Date.now() });
    save(notes);
    el('body').value = ''; el('shareIt').checked = false;
    el('saveNote').disabled = true;
    renderChild();
    toast(shared ? 'Saved and shared with the parent' : 'Saved as a draft');
  });

  show('vSignin');
})();
