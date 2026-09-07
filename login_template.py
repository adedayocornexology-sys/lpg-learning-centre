# -*- coding: utf-8 -*-
"""The sign-in page.

Shape follows Claude's own sign-in, at the founder's request: wordmark top left,
a large headline, the sign-in card beneath it, and a rounded panel on the right
that drops lower than the headline. Palette, type and roundness come from the
rest of the LPG site.

The right panel is DRAWN, not photographed. LPG's pupils cannot appear on a
public page without signed parental consent and none exists. The children are
seen from behind watching an interactive board, which is the school's own claim
about itself, made twice in their own copy.

CSS and JS live in assets/. The site sends `style-src 'self'; script-src 'self'`,
so a browser discards inline blocks and the page arrives unstyled and dead. The
SVG below uses presentation attributes only, never style=, for the same reason.

Substitution is plain token replacement so the markup can use braces freely.
"""

TOKENS = ("__CANONICAL__", "__PHONE__")

LOGIN = u"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Sign in &mdash; LPG Learning Centre</title>
<meta name="description" content="Sign in to the LPG Learning Centre portal.">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="__CANONICAL__">
<meta name="theme-color" content="#FFFBF2">
<link rel="icon" href="assets/img/lpg-mark.svg">
<link rel="stylesheet" href="assets/login.css?v=__ASSETV__">
</head>
<body>

<div class="page">

  <a class="brand" href="/">
    <img src="assets/img/lpg-logo.svg" alt="LPG Learn Play Grow">
    <span class="loc">Festac Town, Lagos</span>
  </a>

  <div class="grid">

    <div class="left">
      <h1>See how <em>today</em> went.</h1>
      <p class="lede">The portal for LPG parents and staff.</p>

      <div class="card">
        <button class="btn google" type="button" id="google">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3h-4a12 12 0 0 0 0 10.7l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.7l4 3.1A7.2 7.2 0 0 1 12 4.8z"/></svg>
          Continue with Google
        </button>

        <div class="or">or</div>

        <form id="signin" novalidate>
          <div>
            <label for="email">Your email</label>
            <input id="email" name="email" type="email" autocomplete="email"
                   placeholder="you@example.com" required>
          </div>
          <button class="btn go" type="submit">Email me a sign-in link</button>
          <p class="note" id="note" role="status" aria-live="polite"></p>
        </form>

        <p class="fine"><b>Parents sign in here too.</b> Children do not get
          accounts of their own. A child is reached through their parent.</p>
      </div>

      <p class="under">Trouble signing in? Call the school on
        <a href="tel:__PHONE__">0808 892 4790</a>.</p>
    </div>

    <div class="art">
      <svg viewBox="0 0 520 360" role="img"
           aria-label="Three children watching an interactive board in a classroom">
        <!-- wall -->
        <rect x="0" y="0" width="520" height="360" rx="22" fill="#FFFDF6"/>

        <!-- the interactive board, the thing the school says twice about itself -->
        <rect x="96" y="34" width="330" height="196" rx="16" fill="#1E1B16"/>
        <rect x="108" y="46" width="306" height="172" rx="10" fill="#12604A"/>
        <!-- what is on the board: the play mark from the LPG logo -->
        <circle cx="261" cy="132" r="52" fill="#F5C81F"/>
        <path d="M245 108 L292 132 L245 156 Z" fill="#12604A"/>
        <!-- little marks either side, so the board reads as a lesson -->
        <rect x="132" y="74" width="52" height="9" rx="4.5" fill="#2E8A6E"/>
        <rect x="132" y="94" width="34" height="9" rx="4.5" fill="#2E8A6E"/>
        <rect x="132" y="170" width="66" height="9" rx="4.5" fill="#2E8A6E"/>
        <circle cx="366" cy="82" r="13" fill="#EC5B8D"/>
        <rect x="344" y="160" width="46" height="9" rx="4.5" fill="#2E8A6E"/>
        <rect x="344" y="178" width="28" height="9" rx="4.5" fill="#2E8A6E"/>
        <!-- stand -->
        <rect x="252" y="230" width="18" height="26" fill="#1E1B16"/>
        <rect x="214" y="254" width="94" height="10" rx="5" fill="#1E1B16"/>

        <!-- floor -->
        <rect x="0" y="286" width="520" height="74" rx="0" fill="#FFF4D6"/>
        <path d="M0 286 H520" stroke="#F0E2BE" stroke-width="2"/>

        <!-- three children, from behind: no faces, and none of them is anyone's child -->
        <!-- left, green -->
        <g>
          <path d="M92 336 v-40 a30 30 0 0 1 60 0 v40 z" fill="#1B9E6E"/>
          <circle cx="122" cy="268" r="25" fill="#8A5A3B"/>
          <path d="M99 262 a23 23 0 0 1 46 0 a30 30 0 0 0 -46 0 z" fill="#3A2418"/>
          <circle cx="99" cy="256" r="7" fill="#3A2418"/>
          <circle cx="145" cy="256" r="7" fill="#3A2418"/>
        </g>
        <!-- middle, orange, hand up -->
        <g>
          <path d="M232 336 v-46 a32 32 0 0 1 64 0 v46 z" fill="#F2742D"/>
          <path d="M290 296 l26 -58 a9 9 0 0 1 16 8 l-24 54 z" fill="#F2742D"/>
          <circle cx="336" cy="232" r="10" fill="#8A5A3B"/>
          <circle cx="264" cy="258" r="27" fill="#8A5A3B"/>
          <path d="M239 250 a25 25 0 0 1 50 0 a34 34 0 0 0 -50 0 z" fill="#241610"/>
          <circle cx="243" cy="268" r="8" fill="#241610"/>
          <circle cx="285" cy="268" r="8" fill="#241610"/>
        </g>
        <!-- right, yellow -->
        <g>
          <path d="M380 336 v-36 a28 28 0 0 1 56 0 v36 z" fill="#F5C81F"/>
          <circle cx="408" cy="276" r="23" fill="#8A5A3B"/>
          <path d="M387 271 a21 21 0 0 1 42 0 a28 28 0 0 0 -42 0 z" fill="#3A2418"/>
          <circle cx="408" cy="252" r="9" fill="#3A2418"/>
        </g>

        <!-- a few marks in the air, because it is a school and not an office -->
        <circle cx="56" cy="66" r="9" fill="#EC5B8D"/>
        <circle cx="470" cy="122" r="7" fill="#2C7FB8"/>
        <path d="M60 150 l7 14 15 2 -11 11 3 15 -14 -7 -14 7 3 -15 -11 -11 15 -2 z" fill="#F5C81F"/>
        <path d="M462 44 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2 z" fill="#1B9E6E"/>
      </svg>

      <div class="cap">
        <b>&ldquo;We meet kids at their level, regardless of their age.&rdquo;</b>
        <span>LPG Learning Centre, in their own words.</span>
      </div>
    </div>

  </div>
</div>

<footer>
  &copy; LPG Learning Centre, Festac Town, Lagos &middot;
  <a href="/">Back to the website</a>
</footer>

<script src="assets/login.js?v=__ASSETV__"></script>
</body>
</html>
"""


def render(canonical, phone, assetv=""):
    """assetv busts the one-hour cache on /assets so a deploy is seen at once."""
    return (LOGIN.replace("__CANONICAL__", canonical)
                 .replace("__PHONE__", phone)
                 .replace("__ASSETV__", assetv))
