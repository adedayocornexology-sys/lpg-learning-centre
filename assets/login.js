/* There is no password field on the sign-in page, and that is a decision rather
   than an omission. A school this size cannot staff a password reset desk, and
   whoever built the site becomes that desk by default. A link sent to an address
   the school already holds removes the whole category, and a parent locked out at
   6am is a parent who stops checking on their child.

   Nothing authenticates yet; the portal is still being built. The page says so
   plainly instead of spinning a fake loader. A door that pretends to open is
   worse than one that admits it is not fitted.

   This file is separate from the page because the site sends
   script-src 'self'. An inline block is discarded by the browser. */
(function () {
  var LIVE = false;                       // flip when the backend lands
  var form = document.getElementById('signin');
  var mail = document.getElementById('email');
  var note = document.getElementById('note');
  var goog = document.getElementById('google');
  if (!form) return;

  function say(msg, kind) {
    note.textContent = msg;
    note.className = 'note' + (kind ? ' ' + kind : '');
  }

  function notYet() {
    say('The portal is still being built. The school will send sign-in details '
      + 'when it opens.');
  }

  goog.addEventListener('click', notYet);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = mail.value.trim();
    if (!v) {
      say('Enter the email address the school has for you.', 'bad');
      mail.focus(); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@][^\s@]+$/.test(v)) {
      say('That does not look like an email address.', 'bad');
      mail.focus(); return;
    }
    if (!LIVE) { notYet(); return; }
    say('Check your email for the sign-in link.', 'ok');
  });
})();
