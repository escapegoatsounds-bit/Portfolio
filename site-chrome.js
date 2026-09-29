/* Shared site chrome for every page except index.html.

   Puts the phone navigator in a fixed rail on the left and a standard header
   across the top, so the phone sits in the same place on every page. Tapping an
   app here opens that app on the home page, which is where the panels live.

   Include after apps-data.js:
     <link rel="stylesheet" href="site-chrome.css">
     <script src="apps-data.js"></script>
     <script src="site-chrome.js"></script>
*/
(function () {
  if (window.__pnavReady) return;
  window.__pnavReady = true;

  var PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (PAGE === 'index.html' || PAGE === '') return;   // home builds its own phone

  var LINKS = [
    { href: 'index.html', label: 'Work' },
    { href: 'clients.html', label: 'Brands' },
    { href: 'about.html', label: 'About' },
    { href: 'resume.html', label: 'Resume' },
    { href: 'tools.html', label: 'Skills' },
    { href: 'news.html', label: 'My Everyday' },
    { href: 'contact.html', label: 'Contact' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(key) {
    if (typeof icoMarkup === 'function') return icoMarkup(key);
    var v = (typeof ICO !== 'undefined' && ICO[key]) || '';
    if (v.indexOf('__IMG__') === 0) return '<img src="' + esc(v.slice(7)) + '" alt="">';
    return '<svg viewBox="0 0 54 54">' + v + '</svg>';
  }

  function clock() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function appButton(key, withLabel) {
    var a = (typeof APPS !== 'undefined' && APPS[key]) || { label: key };
    var title = a.blurb ? a.label + ' — ' + a.blurb : a.label;
    return '<button class="pnav-app" data-app="' + esc(key) + '" title="' + esc(title) + '">' +
      '<span class="pnav-app-face">' + icon(key) + '</span>' +
      (withLabel ? '<span class="pnav-app-label">' + esc(a.label) + '</span>' : '') +
      '</button>';
  }

  function buildHeader() {
    // A page may already have its own <nav>; keep it, but shift it clear of the rail.
    var existing = document.querySelector('body > nav');
    if (existing) existing.setAttribute('data-pnav-shifted', '1');

    var head = document.createElement('header');
    head.className = 'pnav-head';
    head.innerHTML =
      '<a class="pnav-home" href="index.html" title="Back to the home page">' +
        '<img src="assets/photos/escapegoat-logo.webp" alt="">' +
        '<span>Abdelaziz Askar</span>' +
      '</a>' +
      '<ul class="pnav-links">' +
        LINKS.map(function (l) {
          var on = l.href.toLowerCase() === PAGE ? ' class="on"' : '';
          return '<li><a href="' + l.href + '"' + on + '>' + esc(l.label) + '</a></li>';
        }).join('') +
      '</ul>' +
      '<a class="pnav-cta" href="index.html">← Home</a>';
    document.body.insertBefore(head, document.body.firstChild);

    // A page's own fixed header would now sit under ours, so push it down.
    if (existing) {
      var cs = getComputedStyle(existing);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        existing.style.top = 'var(--pnav-head)';
      }
    }
  }

  function buildRail() {
    var grid = (typeof GRID !== 'undefined' && GRID) || [];
    var dock = (typeof DOCK !== 'undefined' && DOCK) || [];

    var rail = document.createElement('aside');
    rail.className = 'pnav-rail';
    rail.setAttribute('aria-label', 'Portfolio navigator');
    rail.innerHTML =
      '<div class="pnav-rail-inner">' +
        '<div class="pnav-phone">' +
          '<div class="pnav-screen">' +
            '<div class="pnav-bar"><span data-pnav-clock>' + clock() + '</span><span>●●●</span></div>' +
            '<div class="pnav-widget"><b>ZIZO — Abdelaziz Askar</b><span>Social Media &amp; Creative Director</span></div>' +
            '<div class="pnav-grid">' + grid.map(function (k) { return appButton(k, true); }).join('') + '</div>' +
            '<div class="pnav-dock">' + dock.map(function (k) { return appButton(k, false); }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<p class="pnav-caption">Tap an app to open it on the <a href="index.html">home page</a>.</p>' +
      '</div>';
    document.body.insertBefore(rail, document.body.firstChild);

    rail.addEventListener('click', function (e) {
      var btn = e.target.closest('.pnav-app');
      if (!btn) return;
      location.href = 'index.html#' + encodeURIComponent(btn.dataset.app);
    });

    setInterval(function () {
      var el = rail.querySelector('[data-pnav-clock]');
      if (el) el.textContent = clock();
    }, 30000);
  }

  function init() {
    if (document.querySelector('.pnav-rail')) return;
    document.body.classList.add('has-pnav');
    buildRail();
    buildHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
