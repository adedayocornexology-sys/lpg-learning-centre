/* The LPG portal, as a prototype.

   Claude's signed-in shape: a sidebar of the things you work on, a conversation
   in the middle. The difference is that the sidebar belongs to the school, it
   changes with whoever signed in, and the assistant can run any of it for you.
   Ask for "a note for Adaeze" and the same action runs that the sidebar would
   have run. That is the point of the whole design: one set of actions, two ways
   in, a screen and an agent.

   No model is connected. The assistant matches on keywords and then performs a
   real action in the prototype's own state, so the interaction is honest about
   what it does even though the language understanding is not real yet. The strip
   at the top of the page says so.

   Everything lives in this browser. No child here is a real LPG pupil. */
(function () {
  'use strict';

  var KEY = 'lpg_portal_v2';

  var CHILDREN = [
    { id: 'c1', name: 'Adaeze Okafor',   ini: 'AO', guardian: 'Mrs Folake Okafor', here: true  },
    { id: 'c2', name: 'Tunde Bakare',    ini: 'TB', guardian: 'Mr Segun Bakare',   here: true  },
    { id: 'c3', name: 'Zainab Musa',     ini: 'ZM', guardian: 'Mrs Halima Musa',   here: false },
    { id: 'c4', name: 'Chidi Nwosu',     ini: 'CN', guardian: 'Mrs Ngozi Nwosu',   here: true  },
    { id: 'c5', name: 'Ololade Adeyemi', ini: 'OA', guardian: 'Mr Kunle Adeyemi',  here: true  }
  ];
  var MY_CHILD = 'c1';

  var PEOPLE = {
    teacher: { name: 'Mrs Grace Ilesanmi', ini: 'GI', role: 'Teacher, Nursery 2', colour: '#1B9E6E', first: 'Grace' },
    parent:  { name: 'Mrs Folake Okafor',  ini: 'FO', role: 'Parent of Adaeze',   colour: '#F2742D', first: 'Folake' },
    admin:   { name: 'Mrs Funke Adeyanju', ini: 'FA', role: 'Head teacher',       colour: '#2C7FB8', first: 'Funke' }
  };

  var ICON = {
    chat:  'M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.9-.4L4 21l1.4-4.2A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z',
    class: 'M3 7l9-4 9 4-9 4-9-4zM7 10.5V16c0 1.1 2.2 2 5 2s5-.9 5-2v-5.5',
    reg:   'M9 11l3 3 6-6M3.5 5.5h17v14h-17z',
    note:  'M15.5 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V7.5zM15 3.5V8h4.5M8.5 13h7M8.5 16.5h4',
    plan:  'M4.5 4.5h15v15h-15zM4.5 9.5h15M9.5 9.5v10',
    time:  'M12 7.5V12l3 2M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z',
    kid:   'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0',
    report:'M7 15.5V11M12 15.5V8.5M17 15.5v-3M4.5 4.5h15v15h-15z',
    msg:   'M20.5 11.5a7.9 7.9 0 0 1-8.5 8 9 9 0 0 1-2.7-.4L4 21l1.3-4A7.9 7.9 0 0 1 12 3.5a7.9 7.9 0 0 1 8.5 8z',
    money: 'M12 3.5v17M16 7.5c0-1.7-1.8-2.5-4-2.5s-4 .8-4 2.5 1.8 2.4 4 3 4 1.3 4 3-1.8 2.5-4 2.5-4-.8-4-2.5',
    cal:   'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 3.5v4M15.5 3.5v4',
    people:'M9 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 20.5a6.5 6.5 0 0 1 13 0M17 5.5a3.5 3.5 0 0 1 0 7M18 20.5a6 6 0 0 0-3-5.2',
    send:  'M4 12h13M12 6l6 6-6 6',
    lock:  'M6.5 10.5h11v9h-11zM9 10.5V8a3 3 0 0 1 6 0v2.5',
    ask:   'M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.2-1.2.9-1.2 1.6v.5M12 17h.01M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z'
  };

  var NAV = {
    teacher: [
      { grp: 'Teaching' },
      { id: 'chat',  label: 'Ask LPG',        icon: 'chat' },
      { id: 'class', label: 'My class',       icon: 'class', tail: 'Nursery 2' },
      { id: 'reg',   label: "Today's register", icon: 'reg' },
      { id: 'notes', label: 'Notes on children', icon: 'note' },
      { grp: 'Planning' },
      { id: 'plans', label: 'Lesson notes',   icon: 'plan' },
      { id: 'time',  label: 'Timetable',      icon: 'time' },
      { id: 'msg',   label: 'Messages',       icon: 'msg' }
    ],
    parent: [
      { grp: 'My child' },
      { id: 'chat',  label: 'Ask LPG',        icon: 'chat' },
      { id: 'child', label: 'Adaeze',         icon: 'kid', tail: 'Nursery 2' },
      { id: 'rep',   label: 'Reports',        icon: 'report' },
      { grp: 'The school' },
      { id: 'msg',   label: 'Messages',       icon: 'msg' },
      { id: 'fees',  label: 'School fees',    icon: 'money' },
      { id: 'pta',   label: 'Calendar & PTA', icon: 'cal' }
    ],
    admin: [
      { grp: 'The school' },
      { id: 'chat',   label: 'Ask LPG',       icon: 'chat' },
      { id: 'people', label: 'People',        icon: 'people', tail: '7' },
      { id: 'classes',label: 'Classes',       icon: 'class', tail: '8' },
      { id: 'enq',    label: 'Enquiries',     icon: 'msg' },
      { grp: 'Running it' },
      { id: 'cast',   label: 'Send a message to all', icon: 'send' },
      { id: 'rights', label: 'Roles & rights', icon: 'lock' },
      { id: 'fees',   label: 'Fees',          icon: 'money' }
    ]
  };

  var CHIPS = {
    teacher: ['Write a note for Adaeze', 'Who is absent today?', 'Show me my class'],
    parent:  ['How did Adaeze do this week?', 'Message her teacher', 'What do I owe?'],
    admin:   ['Who has not signed in yet?', 'Send a message to all parents', 'Show me the classes']
  };

  var seed = [
    { id: 'n1', child: 'c1', body: 'Adaeze settled in very well this morning and led the song at circle time.', shared: true,  at: Date.now() - 172800000 },
    { id: 'n2', child: 'c1', body: 'She is still finding scissors difficult. We will keep practising this week.', shared: true,  at: Date.now() - 86400000 },
    { id: 'n3', child: 'c2', body: 'Watch Tunde at lunch, he has been quiet since Monday.', shared: false, at: Date.now() - 18000000 }
  ];

  function load() {
    try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {}
    return seed.slice();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {} }

  var notes = load();
  var role = 'teacher';
  var view = 'chat';
  var convo = [];

  var el = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function icon(k) {
    return '<svg viewBox="0 0 24 24"><path d="' + ICON[k] + '"/></svg>';
  }
  function when(ts) {
    var d = Math.floor((Date.now() - ts) / 86400000);
    return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago';
  }
  function child(id) {
    for (var i = 0; i < CHILDREN.length; i++) if (CHILDREN[i].id === id) return CHILDREN[i];
    return null;
  }
  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  /* ---------------- sidebar ---------------- */
  function renderSide() {
    var p = PEOPLE[role];
    el('meAv').textContent = p.ini;
    el('meAv').className = 'av av-' + role;
    el('meName').textContent = p.name;
    el('meRole').textContent = p.role;
    el('sideRole').textContent = role === 'teacher' ? 'Nursery 2'
      : role === 'parent' ? 'Parent access' : 'Head teacher';

    el('nav').innerHTML = NAV[role].map(function (it) {
      if (it.grp) return '<div class="grp">' + esc(it.grp) + '</div>';
      return '<button type="button" data-view="' + it.id + '"' +
        (it.id === view ? ' class="on"' : '') + '>' + icon(it.icon) +
        '<span>' + esc(it.label) + '</span>' +
        (it.tail ? '<span class="tail">' + esc(it.tail) + '</span>' : '') +
        '</button>';
    }).join('');
  }

  /* ---------------- the conversation ---------------- */
  function renderChat() {
    var p = PEOPLE[role];
    if (!convo.length) {
      el('pane').innerHTML =
        '<div class="hello">' +
          '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M12 2l1.9 6.2L20 10l-6.1 1.8L12 18l-1.9-6.2L4 10l6.1-1.8z" fill="#F2742D"/>' +
          '</svg>' +
          '<h1>' + greeting() + ', ' + esc(p.first) + '</h1>' +
          '<p>Ask me anything, or tell me to do it and I will.</p>' +
          '<div class="chips">' + CHIPS[role].map(function (c) {
            return '<button class="chip" type="button" data-say="' + esc(c) + '">' + esc(c) + '</button>';
          }).join('') + '</div>' +
        '</div>';
      return;
    }
    el('pane').innerHTML = '<div class="msgs">' + convo.map(function (m) {
      var av = m.who === 'me' ? PEOPLE[role].ini : 'LPG';
      return '<div class="msg ' + m.who + '"><span class="av">' + esc(av) + '</span>' +
        '<div class="bub">' + m.html + '</div></div>';
    }).join('') + '</div>';
    var sa = el('scrollarea');
    sa.scrollTop = sa.scrollHeight;
  }

  function say(who, html) { convo.push({ who: who, html: html }); }

  function didThis(text) {
    return '<div class="did"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-11"/></svg>' +
      '<span>' + text + '</span></div>';
  }

  /* The assistant. Keyword matching, then a real action on real prototype state.
     Honest about what it is: the banner says no model is connected. */
  function answer(q) {
    var t = q.toLowerCase();

    // write a note about a named child
    var named = null;
    for (var i = 0; i < CHILDREN.length; i++) {
      if (t.indexOf(CHILDREN[i].name.split(' ')[0].toLowerCase()) > -1) named = CHILDREN[i];
    }
    if (/note|observ|wrote|write/.test(t) && named) {
      var body = 'Worked well today and joined in with the group.';
      notes.push({ id: 'n' + Date.now(), child: named.id, body: body, shared: false, at: Date.now() });
      save();
      return '<p>I have started a note for <b>' + esc(named.name) + '</b>. It is a draft, ' +
        'so her parent cannot see it until you share it.</p>' +
        '<p>&ldquo;' + esc(body) + '&rdquo;</p>' +
        didThis('<b>Draft note created</b> on ' + esc(named.name) + '. Say <b>share it</b> to send it to her parent.');
    }
    if (/share it|share that|send it to her parent|send to parent/.test(t)) {
      var last = null;
      for (var j = notes.length - 1; j >= 0; j--) if (!notes[j].shared) { last = notes[j]; break; }
      if (last) {
        last.shared = true; save();
        return '<p>Shared with ' + esc(child(last.child).guardian) + '.</p>' +
          didThis('<b>Note shared.</b> It now appears in the parent&rsquo;s portal.');
      }
      return '<p>There is no draft waiting to be shared.</p>';
    }
    if (/absent|attend|register|who is not here|missing/.test(t)) {
      var away = CHILDREN.filter(function (c) { return !c.here; });
      return '<p>' + (away.length
        ? esc(away.map(function (c) { return c.name; }).join(', ')) +
          ' ' + (away.length === 1 ? 'is' : 'are') + ' not in today. Everyone else is here.'
        : 'Everyone is in today.') + '</p>' +
        didThis('Opened <b>Today&rsquo;s register</b> in the sidebar.');
    }
    if (/this week|how did|report|progress/.test(t)) {
      var shared = notes.filter(function (n) { return n.child === MY_CHILD && n.shared; });
      return '<p>Adaeze has <b>' + shared.length + '</b> ' +
        (shared.length === 1 ? 'note' : 'notes') + ' shared by her teacher this week.</p>' +
        (shared.length ? '<p>&ldquo;' + esc(shared[shared.length - 1].body) + '&rdquo;</p>' : '') +
        didThis('Opened <b>Reports</b> in the sidebar.');
    }
    if (/message|tell her teacher|contact/.test(t)) {
      return '<p>I can send that to Mrs Grace Ilesanmi. Type what you would like to say ' +
        'and I will pass it on.</p>' + didThis('Opened <b>Messages</b>.');
    }
    if (/owe|fee|pay|school fees/.test(t)) {
      return '<p>Fees are not connected yet. When they are, this is where you would see ' +
        'the term&rsquo;s bill, what has been paid and what is outstanding, and pay it here.</p>';
    }
    if (/class|children|pupils|nursery/.test(t)) {
      show('class');
      return '<p>Nursery 2 has <b>' + CHILDREN.length + '</b> children.</p>' +
        didThis('Opened <b>My class</b> in the sidebar.');
    }
    if (/all parents|broadcast|send a message to all|announce/.test(t)) {
      return '<p>I can send one message to every parent in the school, or to one class. ' +
        'Which would you like?</p>' + didThis('Opened <b>Send a message to all</b>.');
    }
    if (/signed in|not signed|who has/.test(t)) {
      return '<p>Nobody has signed in yet, because accounts have not been created. ' +
        'That is stage two of the build.</p>';
    }
    return '<p>I can help with your class, notes on children, the register, reports, ' +
      'messages and the timetable. Tell me what you want done and I will do it, ' +
      'or use the sidebar.</p>';
  }

  function ask(q) {
    say('me', '<p>' + esc(q) + '</p>');
    view = 'chat';
    el('crumb').textContent = 'Ask LPG';
    renderSide();
    renderChat();
    setTimeout(function () {
      say('ai', answer(q));
      renderChat();
    }, 320);
  }

  /* ---------------- the plain views ---------------- */
  function show(id) {
    view = id;
    renderSide();
    var pane = el('pane'), c;

    if (id === 'chat') { el('crumb').textContent = 'Ask LPG'; renderChat(); return; }

    if (id === 'class' || id === 'reg') {
      el('crumb').textContent = id === 'class' ? 'My class' : "Today's register";
      pane.innerHTML = '<h2>Nursery 2</h2><p class="sub">' +
        (id === 'reg' ? 'Who is in today.' : 'Five children. Tap one to see their notes.') +
        '</p><div class="rows">' + CHILDREN.map(function (k) {
          var n = notes.filter(function (x) { return x.child === k.id; }).length;
          return '<button class="row" type="button" data-child="' + k.id + '">' +
            '<span class="av">' + k.ini + '</span><span class="tx"><b>' + esc(k.name) +
            '</b><span>' + esc(k.guardian) + '</span></span><span class="end">' +
            (id === 'reg' ? (k.here ? 'Here' : 'Away') : (n ? n + (n === 1 ? ' note' : ' notes') : 'No notes')) +
            '</span></button>';
        }).join('') + '</div>';
      return;
    }

    if (id === 'notes') {
      el('crumb').textContent = 'Notes on children';
      var all = notes.slice().sort(function (a, b) { return b.at - a.at; });
      pane.innerHTML = '<h2>Notes on children</h2><p class="sub">A note stays a draft ' +
        'until you share it with the parent.</p>' + (all.length
        ? all.map(function (n) {
            c = child(n.child);
            return '<div class="card"><span class="tag ' + (n.shared ? 'shared">Shared' : 'draft">Draft, only you') +
              '</span><h3>' + esc(c.name) + '</h3><p>' + esc(n.body) +
              '</p><p>' + when(n.at) + '</p></div>';
          }).join('')
        : '<div class="empty">Nothing written yet.</div>');
      return;
    }

    if (id === 'child' || id === 'rep') {
      el('crumb').textContent = id === 'child' ? 'Adaeze' : 'Reports';
      var mine = notes.filter(function (n) { return n.child === MY_CHILD && n.shared; })
                      .sort(function (a, b) { return b.at - a.at; });
      pane.innerHTML = '<h2>Adaeze</h2><p class="sub">Nursery 2 &middot; Mrs Grace Ilesanmi</p>' +
        (mine.length ? mine.map(function (n) {
            return '<div class="card"><p>' + esc(n.body) + '</p><p>' + when(n.at) +
              ' &middot; Mrs Grace Ilesanmi</p></div>';
          }).join('')
        : '<div class="empty">Her teacher has not shared anything yet.</div>');
      return;
    }

    var titles = {
      plans: 'Lesson notes', time: 'Timetable', msg: 'Messages', fees: 'School fees',
      pta: 'Calendar & PTA', people: 'People', classes: 'Classes', enq: 'Enquiries',
      cast: 'Send a message to all', rights: 'Roles & rights'
    };
    el('crumb').textContent = titles[id] || 'LPG';
    pane.innerHTML = '<h2>' + esc(titles[id] || 'LPG') + '</h2>' +
      '<div class="empty">This part is not built yet. It is in the plan, and the ' +
      'assistant will be able to do it for you here as well as the sidebar.</div>';
  }

  /* ---------------- wiring ---------------- */
  el('nav').addEventListener('click', function (e) {
    var b = e.target.closest('[data-view]');
    if (b) { show(b.getAttribute('data-view')); closeSide(); }
  });

  el('pane').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-say]');
    if (chip) { ask(chip.getAttribute('data-say')); return; }
    var row = e.target.closest('[data-child]');
    if (row) { show(role === 'parent' ? 'child' : 'notes'); }
  });

  var input = el('input');
  input.addEventListener('input', function () {
    el('send').disabled = !input.value.trim();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); }
  });
  el('send').addEventListener('click', fire);
  function fire() {
    var v = input.value.trim();
    if (!v) return;
    input.value = ''; el('send').disabled = true;
    ask(v);
  }

  el('newChat').addEventListener('click', function () {
    convo = []; show('chat'); closeSide();
  });

  el('switch').addEventListener('click', function () {
    role = role === 'teacher' ? 'parent' : role === 'parent' ? 'admin' : 'teacher';
    convo = []; show('chat');
  });

  function closeSide() {
    if (window.matchMedia('(max-width:820px)').matches) {
      el('side').classList.add('hide'); el('scrim').hidden = true;
    }
  }
  el('burger').addEventListener('click', function () {
    var s = el('side'), hidden = s.classList.toggle('hide');
    if (window.matchMedia('(max-width:820px)').matches) el('scrim').hidden = hidden;
  });
  el('scrim').addEventListener('click', closeSide);

  if (window.matchMedia('(max-width:820px)').matches) el('side').classList.add('hide');

  show('chat');
})();
