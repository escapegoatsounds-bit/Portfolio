/* The phone's apps, dressed as the real apps.

   Each entry in NX.apps builds one screen in three parts: the app's own top
   bar, a scrolling body (.app-body, which the feeds in index.html fill), and
   the app's tab bar. index.html's buildAppScreens() asks NX.screen(key) for
   any app listed here and falls back to its plain screen for the rest.

   Loaded before index.html's main script; everything it reads from there
   (B, BRANDS, brandLink, logoOverlay, TRACKS, showHome, openApp) is looked up
   when a screen is built, by which time it exists. */
(function (root) {
  var NX = root.NX = {};

  /* ---- icons: 24px outline set, drawn to match iOS / the apps' own ---- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    homeFill: '<path fill="currentColor" stroke="none" d="M12 2.6 2.4 10.6a1 1 0 0 0-.4.8V20a2 2 0 0 0 2 2h5v-6.5h6V22h5a2 2 0 0 0 2-2v-8.6a1 1 0 0 0-.4-.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    plusSquare: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
    plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    reels: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8.5h18M8.5 3l3 5.5M14.5 3l3 5.5"/><path d="m10.5 12 4 2.5-4 2.5z"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.2-9.2C1.6 7.5 3.8 4.5 7 4.5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 3.2 0 5.4 3 4.2 6.3C19.5 15.4 12 20 12 20z"/>',
    heartFill: '<path fill="currentColor" stroke="none" d="M12 21s-8.2-5-10-10C.7 7.3 3.2 4 6.8 4c2.2 0 3.7 1.3 5.2 3.2C13.5 5.3 15 4 17.2 4c3.6 0 6.1 3.3 4.8 7-1.8 5-10 10-10 10z"/>',
    comment: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/>',
    commentFill: '<path fill="currentColor" stroke="none" d="M12 2.5c5.5 0 10 3.9 10 8.8s-4.5 8.8-10 8.8c-1.2 0-2.3-.2-3.3-.5L3.5 21.5l1.6-4.2C3.2 15.7 2 13.6 2 11.3 2 6.4 6.5 2.5 12 2.5z"/>',
    send: '<path d="M21.5 3 10.2 14.3M21.5 3l-7 18.5-4.3-7.2L3 10z"/>',
    bookmark: '<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/>',
    bookmarkFill: '<path fill="currentColor" stroke="none" d="M5 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v18.2l-7-5-7 5z"/>',
    shareFill: '<path fill="currentColor" stroke="none" d="M13 3.5 22.5 12 13 20.5v-5c-5.5 0-8.8 1.6-11 5 .8-5.8 3.6-10.3 11-11.2z"/>',
    more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    moreV: '<circle cx="12" cy="5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/>',
    bell: '<path d="M18 16V11a6 6 0 0 0-12 0v5l-1.5 2h15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    cast: '<path d="M3 17a4 4 0 0 1 4 4M3 13a8 8 0 0 1 8 8M3 9.2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/>',
    shorts: '<path d="M15.5 3.5 7 8a4 4 0 0 0 1.4 7.3L8.5 15l-1 .5a4 4 0 0 0 4 7 0 0 0 0 0 0 0L16.5 16a4 4 0 0 0-1.4-7.3L15 9l1-.5a4 4 0 0 0-.5-5z"/><path d="m10.5 10 3.5 2-3.5 2z" fill="currentColor"/>',
    subs: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M6 4h12M10 11l4 2.5-4 2.5z"/>',
    library: '<path d="M4 3v18M9 3v18M14 4l6 16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6.5 6.5 0 0 1 3.5 6.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 13h18"/>',
    back: '<path d="M15 4 7 12l8 8"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    menu2: '<path d="M4 8h16M4 16h10"/>',
    newChat: '<path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    wave: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/>',
    phone: '<path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    emoji: '<circle cx="12" cy="12" r="9"/><path d="M8 14.5a4.5 4.5 0 0 0 8 0"/><circle cx="9" cy="10" r=".6" fill="currentColor"/><circle cx="15" cy="10" r=".6" fill="currentColor"/>',
    attach: '<path d="m20 11.5-8.5 8.5a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
    share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    move: '<path d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
    select: '<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 2.5"/>',
    brush: '<path d="M19.5 3.5 10 13l1.5 1.5L21 5a1 1 0 0 0-1.5-1.5z"/><path d="M9.5 13.5c-2 0-3.5 1.5-3.5 3.5 0 1.5-1 2.5-2.5 2.5 1 1.5 3 2 4.5 2a4 4 0 0 0 4-4.5z"/>',
    eraser: '<path d="m7 21-4-4a1.5 1.5 0 0 1 0-2L14 4a1.5 1.5 0 0 1 2 0l5 5a1.5 1.5 0 0 1 0 2L11 21z"/><path d="M8.5 10.5l7 7M7 21h14"/>',
    type: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
    wand: '<path d="m4 20 11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.6 1.4L21 13l-1.4.6L19 15l-.6-1.4L17 13l1.4-.6z"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    play: '<path fill="currentColor" stroke="none" d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
    shuffle: '<path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 3.6c1.1 1.7 2.3 2.7 4.3 2.7H21M18 13l3 3-3 3M3 17h3.5c1.4 0 2.5-.5 3.4-1.4M14 8.4c.9-.9 2-1.4 3.5-1.4H21M18 4l3 3-3 3"/>',
    flash: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    flip: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><path d="M9 13a3 3 0 0 1 5.3-2M15 13a3 3 0 0 1-5.3 2M14.5 9.5v1.7h-1.7M9.5 16.5v-1.7h1.7"/>',
    live: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6" stroke-dasharray="1.5 2"/><circle cx="12" cy="12" r="9.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    tabs: '<rect x="3" y="7" width="13" height="13" rx="2"/><path d="M8 4h11a2 2 0 0 1 2 2v11"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    fwd: '<path d="m9 4 8 8-8 8"/>',
    toc: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.5 4 3 7 6 8.5M11 5c-.5 3.5-3 6.5-6.5 8"/><path d="m12 21 4.5-10L21 21M13.5 18h6"/>',
    feather: '<path d="M20 4c-8 0-14 5-14 13v3M6 17l7-7M9 14h6l3-4h-4.5"/>',
    grok: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 16 8-8"/>',
    note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    photos: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="m21 16-5-5L5 21"/>',
    albums: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    heartCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5s-4-2.4-4-5.2A2.2 2.2 0 0 1 12 10a2.2 2.2 0 0 1 4 1.3c0 2.8-4 5.2-4 5.2z"/>',
    hash: '<path d="M5 9h15M4 15h15M10 3 8 21M16 3l-2 18"/>',
    at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    present: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M10.5 7.5 14 10l-3.5 2.5z"/>',
    file: '<path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v5h5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };
  function icon(name, cls) {
    return '<svg class="nx-i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }
  NX.icon = icon;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  NX.esc = esc;

  var ME_PHOTO = 'assets/photos/WhatsApp_Image_2026-03-22_at_06.38.10.jpeg';
  function me(size) {
    return '<span class="nx-av nx-me" style="width:' + size + 'px;height:' + size + 'px"><img src="' + ME_PHOTO + '" alt="Abdelaziz Askar" onerror="this.remove()">AA</span>';
  }
  function brandAv(b, size) {
    return '<span class="nx-av" style="width:' + size + 'px;height:' + size + 'px;background:' + b.c + ';color:' + b.t + '">' + b.i + logoOverlay(b, '50%') + '</span>';
  }
  function tabbar(items, cls) {
    return '<div role="navigation" class="nx-tabs ' + (cls || '') + '">' + items.map(function (t) {
      var inner = t.html || icon(t.on && t.onIcon ? t.onIcon : t.icon);
      var label = t.label ? '<span>' + t.label + '</span>' : '';
      var attrs = ' class="nx-tab' + (t.on ? ' on' : '') + (t.cls ? ' ' + t.cls : '') + '" aria-label="' + esc(t.aria || t.label || t.icon) + '"';
      return t.href ? '<a href="' + t.href + '"' + attrs + '>' + inner + label + '</a>'
        : '<button type="button"' + attrs + (t.onclick ? ' onclick="' + t.onclick + '"' : '') + '>' + inner + label + '</button>';
    }).join('') + '</div>';
  }
  // B and TRACKS are top-level consts in index.html: global, but not on window
  function hasB() { return typeof B !== 'undefined'; }
  function tracks() { return typeof TRACKS !== 'undefined' ? TRACKS : []; }
  function b4(slug) { return (hasB() && B[slug]) || { s: slug, n: slug.replace(/-/g, ' '), c: '#333', t: '#fff', i: slug.slice(0, 2).toUpperCase() }; }
  function driveImg(id, w) { return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w' + (w || 800); }
  function itemSrc(it, w) { return it.drive ? driveImg(it.drive, w) : it.src; }
  function getJSON(url) {
    return fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now())
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  /* ---- the screen frame ---- */
  NX.apps = {};
  NX.screen = function (key) {
    var a = NX.apps[key];
    return '<div class="screen hidden app-screen nx nx-' + key + '" id="screen-' + key + '">' +
      (a.top ? a.top() : '') +
      '<div class="app-body">' + a.body() + '</div>' +
      (a.tabs ? a.tabs() : '') +
      '<button type="button" class="nx-home" onclick="showHome()" aria-label="Go to the home screen" title="Home"><i></i></button>' +
      '</div>';
  };
  // Escape closes any app, as swiping up does on the phone
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.nx-sheet.open');
    if (open) { open.classList.remove('open'); return; }
    var s = document.querySelector('.app-screen:not(.hidden)');
    if (s && typeof showHome === 'function') showHome();
  });
  // an overlay sheet inside an app (Photoshop's editor, PowerPoint's viewer, ...)
  NX.sheet = function (appKey, html, cls) {
    var scr = document.getElementById('screen-' + appKey); if (!scr) return null;
    var sh = scr.querySelector('.nx-sheet');
    if (!sh) { sh = document.createElement('div'); sh.className = 'nx-sheet'; scr.appendChild(sh); }
    sh.className = 'nx-sheet ' + (cls || '');
    sh.innerHTML = html;
    setTimeout(function () { sh.classList.add('open'); }, 20);
    return sh;
  };
  NX.closeSheet = function (el) { var sh = el.closest('.nx-sheet'); if (sh) { sh.classList.remove('open'); var f = sh.querySelector('iframe'); if (f) setTimeout(function () { if (!sh.classList.contains('open')) sh.innerHTML = ''; }, 300); } };

  /* ================= Instagram ================= */
  NX.apps.instagram = {
    top: function () {
      return '<header class="nx-top ig-top"><span class="ig-word">Instagram</span>' + icon('chevronDown', 'ig-chev') +
        '<span class="nx-grow"></span>' + icon('heart') + '<span class="ig-dm">' + icon('send') + '</span></header>';
    },
    body: function () {
      var slugs = ['Subway-Oman', 'Snapchat', 'Bazooka-Candy', 'Glow', 'The-Center', 'Carina', 'Ruby-Pasta', 'Oppa-App', 'Em-Sherif-Cafe', 'Deraya', 'Molfix', 'Audi'];
      var stories = '<div class="ig-story ig-mine"><span class="ig-ring none">' + me(58) + '<i class="ig-add">+</i></span><span>Your story</span></div>' +
        slugs.filter(function (s) { return hasB() && B[s]; }).map(function (s) {
          var b = B[s];
          return '<a class="ig-story" href="' + brandLink(s) + '"><span class="ig-ring">' + brandAv(b, 58) + '</span><span>' + esc(b.n) + '</span></a>';
        }).join('');
      return '<div class="ig-stories">' + stories + '</div><div id="screen-instagram-feed"></div>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, aria: 'Home' }, { icon: 'search', aria: 'Search' },
        { icon: 'plusSquare', aria: 'New post' }, { icon: 'reels', aria: 'Reels', onclick: "openApp('tiktok')" },
        { html: me(24), aria: 'Profile', onclick: "openApp('wikipedia')" }], 'ig-tabs');
    }
  };

  /* ================= YouTube ================= */
  var SERIES = [
    ['Land of Rebirth', 'Original YouTube series · storytelling'],
    ['Learn English with Skippy', 'Edutainment series for kids'],
    ['Escape Code', 'Tech and creativity series']
  ];
  NX.ytChip = function (el, which) {
    var scr = el.closest('.app-screen');
    scr.querySelectorAll('.yt-chip').forEach(function (c) { c.classList.toggle('on', c === el); });
    scr.querySelector('#screen-youtube-feed').hidden = which === 'series';
    scr.querySelector('.yt-series').hidden = which !== 'series' && which !== 'all';
    if (typeof fvSchedule === 'function') fvSchedule();
  };
  NX.apps.youtube = {
    top: function () {
      return '<header class="nx-top yt-top"><span class="yt-logo"><svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><rect width="28" height="20" rx="5.5" fill="#FF0033"/><path d="M11.2 5.8v8.4l7.3-4.2z" fill="#fff"/></svg><b>YouTube</b></span><span class="nx-grow"></span>' +
        icon('cast') + icon('bell') + icon('search') + '</header>';
    },
    body: function () {
      return '<div class="yt-chips">' +
        '<button type="button" class="yt-chip yt-explore" aria-label="Explore">' + icon('compass') + '</button>' +
        '<button type="button" class="yt-chip on" onclick="NX.ytChip(this,\'all\')">All</button>' +
        '<button type="button" class="yt-chip" onclick="NX.ytChip(this,\'films\')">Campaign films</button>' +
        '<button type="button" class="yt-chip" onclick="NX.ytChip(this,\'series\')">Original series</button></div>' +
        '<div id="screen-youtube-feed"></div>' +
        '<section class="yt-series"><h3>Original series</h3>' + SERIES.map(function (s, i) {
          return '<div class="yt-series-row"><span class="yt-series-art" style="background:' + ['#7a3cff', '#f0a020', '#0a8f6a'][i] + '">' + icon('play') + '</span><div><b>' + s[0] + '</b><span>Abdelaziz Askar · ' + s[1] + '</span></div></div>';
        }).join('') + '</section>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'shorts', label: 'Shorts', onclick: "openApp('tiktok')" },
        { icon: 'plusCircle', aria: 'Create', cls: 'yt-create' }, { icon: 'subs', label: 'Subscriptions' },
        { html: me(24), label: 'You', onclick: "openApp('wikipedia')" }], 'yt-tabs');
    }
  };

  /* ================= TikTok ================= */
  NX.apps.tiktok = {
    top: function () {
      return '<header class="nx-top tk-top">' + icon('live') + '<span class="nx-grow tk-feeds"><span>Following</span><b>For You</b></span>' + icon('search') + '</header>';
    },
    body: function () { return '<div id="screen-tiktok-feed"></div>'; },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'people', label: 'Friends' },
        { html: '<span class="tk-plus">' + icon('plus') + '</span>', aria: 'Create' }, { icon: 'chat', label: 'Inbox' },
        { icon: 'user', label: 'Profile', onclick: "openApp('wikipedia')" }], 'tk-tabs');
    }
  };

  /* ================= X ================= */
  var X_LOGO = '<svg viewBox="0 0 24 24" width="22" height="22" aria-label="X"><path fill="currentColor" d="M18.2 2.5h3.4l-7.4 8.4L23 21.5h-6.8l-5.3-6.9-6.1 6.9H1.4l7.9-9L1 2.5h7l4.8 6.3zm-1.2 17h1.9L7.1 4.4H5.1z"/></svg>';
  var X_POSTS = [
    ['"You earned the drive. We built the ride."', 'Geely UAE launch TVC'],
    ['"Ramadan tastes different when it\'s made right."', 'Kappa Egypt'],
    ['"Taste the boldness. Every single bite."', 'Subway Oman']
  ];
  NX.apps.x = {
    top: function () {
      return '<header class="nx-top x-top">' + me(30) + '<span class="nx-grow x-logo">' + X_LOGO + '</span><span class="x-up">Upgrade</span></header>' +
        '<div class="x-feeds"><button type="button" class="on"><span>For you</span></button><button type="button"><span>Following</span></button></div>';
    },
    body: function () {
      return '<div id="screen-x-feed"></div>' + X_POSTS.map(function (p) {
        return '<article class="x-post">' + me(38) + '<div class="x-main"><div class="x-hd"><b>Abdelaziz Askar</b><span>@AbdelazizAskar · ' + esc(p[1]) + '</span></div>' +
          '<p>' + esc(p[0]) + '</p><div class="x-acts">' + icon('comment') + icon('shuffle') + icon('heart') + icon('bookmark') + icon('share') + '</div></div></article>';
      }).join('') + '<button type="button" class="x-fab" aria-label="Post">' + icon('feather') + '</button>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, aria: 'Home' }, { icon: 'search', aria: 'Search' },
        { icon: 'grok', aria: 'Grok' }, { icon: 'people', aria: 'Communities' }, { icon: 'bell', aria: 'Notifications' },
        { icon: 'mail', aria: 'Messages', onclick: "openApp('messages')" }], 'x-tabs');
    }
  };

  /* ================= LinkedIn ================= */
  var EXP = [
    ['Head of Social & AI', 'Tonic International', 'Dubai, UAE', '2024 – Present', 'Directed the Geely Coolray national launch: ATL, TVC direction, OOH. Built the first AI-animated TVC pitch in MENA for Warba Bank.'],
    ['Creative Content Director', 'Nineteen84', 'Cairo, Egypt', '2018 – 2024', '50+ brands, team of 12. Kappa, Subway Oman, Molfix, AXE, Snapchat Gulf. Full ATL campaigns and TVC direction.'],
    ['Social Media Specialist', 'Al Siddiqi Holding', 'Doha, Qatar', '2016 – 2017', 'In-house social lead for 8+ brands at once across Qatar.'],
    ['Digital Marketing & Content', 'Deraya Real Estate', 'Cairo, Egypt', '2015 – 2016', "Built the brand's digital presence as Egypt shifted to digital-first."],
    ['Creative Content Specialist', 'Imagine Creative Studio', 'Alexandria, Egypt', '2011 – 2014', 'Co-founded a creative studio. Photography, design, branding, video.'],
    ['PR Specialist', 'Bibliotheca Alexandrina', 'Alexandria, Egypt', '2007 – 2009', 'PR and communications for international cultural events.']
  ];
  var LI_SKILLS = ['Creative Direction', 'Social Media Strategy', 'AI Production', 'Photography', 'Music Production', 'Brand Strategy', 'Copywriting', 'Team Leadership'];
  NX.apps.linkedin = {
    top: function () {
      return '<header class="nx-top li-top">' + me(30) + '<span class="li-search">' + icon('search') + 'Search</span>' + icon('chat') + '</header>';
    },
    body: function () {
      return '<section class="li-card li-profile"><div class="li-cover"></div>' + me(84) +
        '<h2>Abdelaziz Askar</h2><p class="li-head">Head of Social & AI · Creative Director · Music Producer</p>' +
        '<p class="li-loc">Tonic International · Dubai, United Arab Emirates</p>' +
        '<div class="li-btns"><a class="li-btn pri" href="#" onclick="openApp(\'phone\');return false">Contact info</a><a class="li-btn" href="about.html">About</a><span class="li-btn icon">' + icon('more') + '</span></div></section>' +
        '<section class="li-card"><h3>About</h3><p>Since 2007, building brand voices across Egypt, Qatar and the UAE. Among the first in MENA to put AI into real creative production.</p></section>' +
        '<section class="li-card"><h3>Experience</h3>' + EXP.map(function (e) {
          return '<div class="li-exp"><span class="li-logo">' + esc(e[1].slice(0, 2).toUpperCase()) + '</span><div><b>' + esc(e[0]) + '</b><span>' + esc(e[1]) + '</span><span class="li-dim">' + e[3] + ' · ' + esc(e[2]) + '</span><p>' + esc(e[4]) + '</p></div></div>';
        }).join('') + '</section>' +
        '<section class="li-card"><h3>Skills</h3>' + LI_SKILLS.map(function (s) { return '<div class="li-skill">' + esc(s) + '</div>'; }).join('') + '</section>' +
        '<section class="li-card li-activity"><h3>Activity</h3><div id="screen-linkedin-feed"></div></section>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', label: 'Home' }, { icon: 'people', label: 'My Network' },
        { icon: 'plusSquare', label: 'Post' }, { icon: 'bell', label: 'Notifications' }, { icon: 'briefcase', label: 'Jobs' }], 'li-tabs');
    }
  };

  /* ================= Spotify ================= */
  var sp = { audio: null, i: -1 };
  function spTrack(i) { return tracks()[i] || null; }
  function spUI() {
    var scr = document.getElementById('screen-spotify'); if (!scr) return;
    var playing = sp.audio && !sp.audio.paused;
    scr.querySelectorAll('.sp-row').forEach(function (r, k) { r.classList.toggle('now', k === sp.i); });
    var mini = scr.querySelector('.sp-mini'); if (!mini) return;
    mini.hidden = sp.i < 0;
    var t = spTrack(sp.i); if (!t) return;
    mini.querySelector('.sp-mini-t').textContent = t[0];
    mini.querySelector('.sp-mini-play').innerHTML = icon(playing ? 'pause' : 'play');
    var big = scr.querySelector('.sp-bigplay'); if (big) big.innerHTML = icon(playing ? 'pause' : 'play');
  }
  NX.spPlay = function (i) {
    var t = spTrack(i); if (!t) return;
    if (!sp.audio) {
      sp.audio = new Audio();
      sp.audio.addEventListener('ended', function () { NX.spPlay((sp.i + 1) % tracks().length); });
      sp.audio.addEventListener('timeupdate', function () {
        var bar = document.querySelector('#screen-spotify .sp-mini-bar i');
        if (bar && sp.audio.duration) bar.style.width = (sp.audio.currentTime / sp.audio.duration * 100) + '%';
      });
      ['play', 'pause'].forEach(function (ev) { sp.audio.addEventListener(ev, spUI); });
    }
    if (i === sp.i && sp.audio.src) { if (sp.audio.paused) sp.audio.play().catch(function () {}); else sp.audio.pause(); return; }
    sp.i = i; sp.audio.src = 'assets/tracks/' + t[1] + '.mp3';
    // music and the lock-screen player don't overlap, and films go quiet
    if (typeof egPlaying !== 'undefined' && egPlaying && typeof toggleEgMusic === 'function') toggleEgMusic();
    if (typeof fvMusicStarted === 'function') fvMusicStarted();
    sp.audio.play().catch(function () {});
    spUI();
  };
  NX.spToggle = function () { NX.spPlay(sp.i < 0 ? 0 : sp.i); };
  NX.stopMusic = function () { if (sp.audio && !sp.audio.paused) sp.audio.pause(); };
  NX.apps.spotify = {
    top: function () {
      return '<header class="nx-top sp-top">' + me(30) + '<span class="sp-chip on">All</span><span class="sp-chip">Music</span><span class="sp-chip">Podcasts</span></header>';
    },
    body: function () {
      var rows = tracks().map(function (t, i) {
        return '<button type="button" class="sp-row" onclick="NX.spPlay(' + i + ')"><span class="sp-n">' + (i + 1) + '</span><img src="assets/photos/escapegoat-album.jpg" alt="" onerror="this.src=\'assets/photos/escapegoat-logo.png\'"><span class="sp-rt"><b>' + esc(t[0]) + '</b><span>Escapegoat</span></span>' + icon('moreV') + '</button>';
      }).join('');
      return '<section class="sp-hero"><img src="assets/photos/escapegoat-album.jpg" alt="Escapegoat" onerror="this.src=\'assets/photos/escapegoat-logo.png\'"><div><h1>Escapegoat</h1></div></section>' +
        '<div class="sp-bar"><span class="sp-follow">Follow</span>' + icon('more') + '<span class="nx-grow"></span>' + icon('shuffle', 'sp-shuf') +
        '<button type="button" class="sp-bigplay" onclick="NX.spToggle()" aria-label="Play">' + icon('play') + '</button></div>' +
        '<h3 class="sp-h">Popular</h3>' + rows +
        '<h3 class="sp-h">Music production</h3><div class="sp-cards">' +
        [['Custom DJ tracks', 'Made to order, exclusive licensing', '#8c1bab'], ['Lyrics and toplines', 'Arabic and English hooks, verses, toplines', '#1e3264'], ['Brand jingles', 'Audio logos and TVC scores', '#e8115b']].map(function (c) {
          return '<a class="sp-card" href="#" onclick="openApp(\'escapegoat\');return false"><span style="background:' + c[2] + '">' + esc(c[0]) + '</span><b>' + esc(c[0]) + '</b><small>' + esc(c[1]) + '</small></a>';
        }).join('') + '</div><div style="height:64px"></div>';
    },
    tabs: function () {
      return '<div class="sp-mini" hidden><img src="assets/photos/escapegoat-album.jpg" alt="" onerror="this.remove()"><span class="sp-mini-txt"><b class="sp-mini-t"></b><span>Escapegoat</span></span>' +
        '<button type="button" class="sp-mini-play" onclick="NX.spToggle()" aria-label="Play or pause">' + icon('play') + '</button><div class="sp-mini-bar"><i></i></div></div>' +
        tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'search', label: 'Search' },
          { icon: 'library', label: 'Your Library' }, { icon: 'plus', label: 'Create' }], 'sp-tabs');
    }
  };

  /* ================= Messages (WhatsApp) ================= */
  // From the About page: what collaborators say, as they said it.
  var QUOTES = [
    ['Arnaud Verchere', 'Group CEO · Tonic International Dubai', "Working with Abdelaziz is a masterclass in efficiency. He didn't just improve our workflow; he genuinely changed how we collaborate daily. He took the time to build an autonomous system that actually works for people. He's a critical thinker who doesn't just find flaws — he builds the solutions to fix them.", '#53bdeb'],
    ['Mohamed Shafei', 'Founder · Deraya Real Estate', "Abdelaziz clearly played a pivotal role in Deraya's history. Launching a real estate brand's social presence in 2015 — right as the Egyptian market was shifting heavily toward digital — was a massive undertaking.", '#ffd279'],
    ['Amina Rashad', 'Vice Chairman & Founder · Glow', 'Abdelaziz brought a level of creative edge to Glow that we were missing, seamlessly integrating AI tools and modern video trends to keep us at the top of our customers\' feeds.', '#ff72a1'],
    ['Sherry ElKilany', 'Managing Partner · Nineteen84', 'I worked with Abdelaziz for several years, and his strength has always been his creative judgment and deep sense of ownership. He approached our brands with the care and loyalty of someone who genuinely believed in what we were building, and his creative thinking consistently elevated the work beyond execution.', '#06cf9c'],
    ['Ismail Drouby', 'Founder & CEO · Delight Pastries & Scoop Empire', "Abdelaziz owned our entire operational and digital presence. He didn't just launch our social media; he built our inbound and outbound call center, directed all brand photography, and quality assurance. His ability to masterfully juggle creative direction with complex operations makes him the ultimate multi-tasker and an invaluable asset to any growing brand.", '#fc9775'],
    ['Mikey MTM', 'Music Artist · MTM', "Abdelaziz has been an incredible partner and friend throughout our musical journey. On so many occasions, he's stepped up to handle everything from our branding to our cover art with a level of care that's hard to find. He doesn't just 'do' the work; he lives the project with you.", '#a791ff'],
    ['Sherif ElSersy', 'Chairman · No Limits Furniture', 'I had the pleasure of working with Abdelaziz at Nolimits, where he managed our social media accounts. He was highly professional, reliable, and consistently delivered strong results. His understanding of social media strategy, attention to detail, and ability to manage accounts efficiently made a real difference to our online presence.', '#7ad0ff'],
    ['Shehab Kassem', 'Chairman · DEFARM FOODS', "It's rare to find someone who can handle the entire creative spectrum, but Abdelaziz does it effortlessly. Whether it's art direction, animation, or full-scale social marketing, the output is always world-class. He's a multi-talented force who brings a level of dedication that is truly priceless. Any team would be lucky to have him.", '#9de1a2']
  ];
  NX.apps.messages = {
    top: function () {
      return '<header class="nx-top wa-top"><button type="button" class="wa-back" onclick="showHome()" aria-label="Back">' + icon('back') + '</button>' +
        '<span class="nx-av wa-gav" style="width:36px;height:36px">' + icon('people') + '</span>' +
        '<span class="wa-title"><b>Clients & collaborators</b><span>' + QUOTES.map(function (q) { return q[0].split(' ')[0]; }).join(', ') + '</span></span>' +
        icon('video') + icon('phone') + '</header>';
    },
    body: function () {
      return '<div class="wa-wall"><div class="wa-chip">What collaborators say</div>' +
        '<div class="wa-sys">' + icon('lock') + 'Taken word for word from the About page.</div>' +
        QUOTES.map(function (q) {
          var ini = q[0].split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2);
          return '<div class="wa-msg"><span class="wa-av" style="background:' + q[3] + '">' + ini + '</span><div class="wa-bub"><b style="color:' + q[3] + '">' + esc(q[0]) + '</b><small>' + esc(q[1]) + '</small><p>' + esc(q[2]) + '</p><time>✓✓</time></div></div>';
        }).join('') + '</div>';
    },
    tabs: function () {
      return '<footer class="wa-input"><span class="wa-field">' + icon('emoji') + '<span class="nx-grow">Message</span>' + icon('attach') + icon('camera') + '</span>' +
        '<a class="wa-mic" href="https://wa.me/201099197988" target="_blank" rel="noopener" aria-label="Message Abdelaziz on WhatsApp">' + icon('mic') + '</a></footer>';
    }
  };

  /* ================= ChatGPT ================= */
  var AI = [
    ['Furniture', 'AI that sells sofas while you sleep.', 'Content-and-sales automation for the furniture trade: photoreal room visualisation, auto-generated catalogues, and lead pipelines that qualify, nurture and follow up on their own.'],
    ['Medical', 'Bedside manner, automated.', 'Automation for medical practices: patient communication, smart scheduling and content workflows that keep clinics responsive without burning out the front desk.'],
    ['Music production', 'A studio engineer that never sleeps.', 'AI-assisted production pipelines: stem separation, mastering chains and release automation. The same systems that power the Escapegoat releases.'],
    ['Security systems', "AI on watch, so humans don't have to.", 'Monitoring and alert automation: anomaly detection and smart alerts that only ping a human when it matters.']
  ];
  NX.apps.chatgpt = {
    top: function () {
      return '<header class="nx-top gpt-top">' + icon('menu2') + '<span class="nx-grow gpt-title">ChatGPT' + icon('chevronRight', 'gpt-chev') + '</span>' + icon('newChat') + '</header>';
    },
    body: function () {
      return '<div class="gpt-thread"><div class="gpt-user">What AI systems has Abdelaziz built and put into production?</div>' +
        '<div class="gpt-bot"><p>He was among the first in MENA to put AI into real production work, as the engine rather than a gimmick. Four systems he built and runs:</p><ol>' +
        AI.map(function (a) { return '<li><b>' + esc(a[0]) + '.</b> ' + esc(a[1]) + ' ' + esc(a[2]) + '</li>'; }).join('') +
        '</ol><p><b>Proof on air:</b> the first AI-assisted TVC pitch in MENA, for <a href="' + brandLink('Warba-Bank') + '">Warba Bank</a>.</p>' +
        '<div class="gpt-tools">' + icon('bookmark') + icon('heart') + icon('share') + icon('undo') + '</div></div>' +
        '<div class="gpt-sugs"><a href="' + brandLink('Warba-Bank') + '">Show me the Warba Bank pitch</a><a href="#" onclick="openApp(\'spotify\');return false">Play the Escapegoat tracks</a></div></div>';
    },
    tabs: function () {
      return '<footer class="gpt-input"><span class="gpt-field"><span class="gpt-ph">Ask anything</span><span class="gpt-row">' + icon('plus') + '<span class="nx-grow"></span>' + icon('mic') +
        '<span class="gpt-voice">' + icon('wave') + '</span></span></span></footer>';
    }
  };

  /* ================= Camera ================= */
  var cam = { items: [], i: 0 };
  function camShow() {
    var scr = document.getElementById('screen-camera'); if (!scr || !cam.items.length) return;
    var it = cam.items[cam.i], b = b4(it.brand);
    var img = scr.querySelector('.cam-view img');
    img.src = itemSrc(it, 1200); img.alt = it.title;
    scr.querySelector('.cam-label').textContent = b.n;
    var th = scr.querySelector('.cam-thumb');
    th.style.backgroundImage = 'url("' + itemSrc(cam.items[(cam.i + cam.items.length - 1) % cam.items.length], 200) + '")';
  }
  NX.camShoot = function () {
    var scr = document.getElementById('screen-camera'); if (!scr || !cam.items.length) return;
    var fl = scr.querySelector('.cam-flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    cam.i = (cam.i + 1) % cam.items.length; camShow();
  };
  NX.camRoll = function () {
    var groups = {};
    cam.items.forEach(function (it, i) { (groups[it.brand] = groups[it.brand] || []).push([it, i]); });
    var html = '<header class="nx-top ph-top"><button type="button" class="ph-back" onclick="NX.closeSheet(this)">' + icon('back') + 'Camera</button><span class="nx-grow"></span><span class="ph-sel">Select</span></header>' +
      '<div class="ph-scroll"><h1 class="ph-big">Recents</h1><p class="ph-count">' + cam.items.length + ' photos</p>' +
      Object.keys(groups).map(function (s) {
        return '<h3 class="ph-group"><a href="' + brandLink(s) + '">' + esc(b4(s).n) + ' ›</a></h3><div class="ph-grid">' + groups[s].map(function (p) {
          return '<button type="button" style="background-image:url(\'' + itemSrc(p[0], 400) + '\')" onclick="NX.camPick(' + p[1] + ',this)" aria-label="' + esc(p[0].title) + '"></button>';
        }).join('') + '</div>';
      }).join('') + '</div>';
    NX.sheet('camera', html, 'ph-sheet');
  };
  NX.camPick = function (i, el) { cam.i = i; camShow(); NX.closeSheet(el); };
  NX.apps.camera = {
    top: function () {
      return '<header class="nx-top cam-top">' + icon('flash') + '<span class="nx-grow cam-caret">' + icon('chevronDown') + '</span>' + icon('live') + '</header>';
    },
    body: function () {
      return '<div class="cam-view"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" onclick="NX.camShoot()"><span class="cam-flash"></span>' +
        '<div class="cam-zoom"><span>.5</span><span class="on">1×</span><span>2</span></div></div>' +
        '<p class="cam-label">Photography</p>' +
        '<div class="cam-modes"><span>TIME-LAPSE</span><span>SLO-MO</span><span>VIDEO</span><span class="on">PHOTO</span><span>PORTRAIT</span><span>PANO</span></div>';
    },
    tabs: function () {
      return '<div class="cam-ctl"><button type="button" class="cam-thumb" onclick="NX.camRoll()" aria-label="Open the photo library"></button>' +
        '<button type="button" class="cam-shutter" onclick="NX.camShoot()" aria-label="Next photo"><i></i></button>' +
        '<span class="cam-flip">' + icon('flip') + '</span></div>';
    },
    load: function () {
      return getJSON('photos.json').then(function (d) { cam.items = d || []; cam.i = 0; camShow(); });
    }
  };

  /* ================= Photoshop ================= */
  var ps = { items: [], group: 'All' };
  function psName(it) { return it.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '.psd'; }
  function psGrid() {
    var scr = document.getElementById('screen-photoshop'); if (!scr) return;
    var list = ps.items.map(function (it, i) { return [it, i]; }).filter(function (p) { return ps.group === 'All' || p[0].group === ps.group; });
    scr.querySelector('.ps-count').textContent = list.length + ' files';
    scr.querySelector('.ps-files').innerHTML = list.map(function (p) {
      var it = p[0], b = b4(it.brand);
      return '<button type="button" class="ps-file" onclick="NX.psOpen(' + p[1] + ')"><span class="ps-thumb"><img src="' + itemSrc(it, 500) + '" alt="' + esc(it.title) + '" loading="lazy" onerror="this.closest(\'.ps-file\').remove()"></span>' +
        '<b>' + esc(psName(it)) + '</b><small>' + esc(b.n) + ' · PSD</small></button>';
    }).join('');
  }
  NX.psFilter = function (el, g) {
    ps.group = g;
    el.parentNode.querySelectorAll('.ps-chip').forEach(function (c) { c.classList.toggle('on', c === el); });
    psGrid();
  };
  NX.psOpen = function (i) {
    var it = ps.items[i]; if (!it) return;
    var b = b4(it.brand), n = ps.items.length;
    var html = '<header class="nx-top ps-ed-top"><button type="button" onclick="NX.closeSheet(this)" aria-label="Back to files">' + icon('back') + '</button>' +
      '<span class="ps-ed-name">' + esc(psName(it)) + '</span><span class="nx-grow"></span>' + icon('undo') + icon('redo') +
      '<a class="ps-export" href="' + brandLink(it.brand) + '">' + icon('share') + '</a></header>' +
      '<div class="ps-ed"><div class="ps-rail">' + ['move', 'select', 'wand', 'brush', 'eraser', 'type', 'crop', 'sliders'].map(function (t, k) { return '<span class="' + (k ? '' : 'on') + '">' + icon(t) + '</span>'; }).join('') + '</div>' +
      '<div class="ps-canvas"><img src="' + itemSrc(it, 1600) + '" alt="' + esc(it.title) + '"></div>' +
      '<button type="button" class="ps-nav prev" onclick="NX.psOpen(' + ((i + n - 1) % n) + ')" aria-label="Previous file">‹</button><button type="button" class="ps-nav next" onclick="NX.psOpen(' + ((i + 1) % n) + ')" aria-label="Next file">›</button></div>' +
      '<footer class="ps-ed-bar"><span class="ps-layer"><img src="' + itemSrc(it, 120) + '" alt=""><span><b>' + esc(b.n) + '</b><small>' + esc(it.group) + '</small></span></span><span class="nx-grow"></span>' +
      '<a class="ps-case" href="' + brandLink(it.brand) + '">Case study</a>' + icon('layers') + '</footer>';
    NX.sheet('photoshop', html, 'ps-sheet');
  };
  NX.apps.photoshop = {
    top: function () {
      return '<header class="nx-top ps-top"><span class="ps-badge">Ps</span><b class="ps-title">Photoshop</b><span class="nx-grow"></span>' + icon('bell') + me(28) + '</header>';
    },
    body: function () {
      return '<div class="ps-hero"><button type="button" class="ps-new">' + icon('plus') + 'Create new</button><button type="button" class="ps-import">' + icon('photos') + 'Import image</button></div>' +
        '<label class="ps-search">' + icon('search') + '<span>Search your files</span></label>' +
        '<div class="ps-chips">' + ['All', 'Social posts', 'Characters', 'Key visuals', 'Branding', 'Storyboards'].map(function (g, k) {
          return '<button type="button" class="ps-chip' + (k ? '' : ' on') + '" onclick="NX.psFilter(this,\'' + g + '\')">' + g + '</button>';
        }).join('') + '</div>' +
        '<div class="ps-sec"><b>Your files</b><span class="ps-count"></span>' + icon('grid') + '</div><div class="ps-files"></div>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'folder', label: 'Files' },
        { html: '<span class="ps-fab">' + icon('plus') + '</span>', aria: 'Create' }, { icon: 'compass', label: 'Discover' }, { icon: 'book', label: 'Learn' }], 'ps-tabs');
    },
    load: function () { return getJSON('design.json').then(function (d) { ps.items = d || []; psGrid(); }); }
  };

  /* ================= PowerPoint ================= */
  var pp = { decks: [] };
  NX.ppOpen = function (i) {
    var d = pp.decks[i]; if (!d) return;
    var html = '<header class="nx-top pp-ed-top"><button type="button" onclick="NX.closeSheet(this)" aria-label="Back">' + icon('back') + '</button>' +
      '<span class="pp-ed-name"><b>' + esc(d.title) + '</b><small>' + esc(d.brand) + '</small></span><span class="nx-grow"></span>' +
      '<a href="' + esc(d.url) + '" target="_blank" rel="noopener" aria-label="Present">' + icon('present') + '</a></header>' +
      '<div class="pp-stage"><div class="pp-slide"><iframe src="' + esc(d.embed) + '" title="' + esc(d.title) + '" allow="fullscreen" allowfullscreen></iframe></div>' +
      '<p class="pp-note">Swipe through the slides in the frame, or tap Present to open the deck full screen.</p>' +
      '<a class="pp-case" href="' + brandLink(d.slug) + '">Open the ' + esc(d.brand) + ' case study →</a></div>';
    NX.sheet('powerpoint', html, 'pp-sheet');
  };
  function ppList() {
    var scr = document.getElementById('screen-powerpoint'); if (!scr) return;
    scr.querySelector('.pp-files').innerHTML = pp.decks.length ? pp.decks.map(function (d, i) {
      return '<button type="button" class="pp-row" onclick="NX.ppOpen(' + i + ')"><span class="pp-ico">P</span><span class="pp-rt"><b>' + esc(d.title) + '</b><small>' + esc(d.brand) + ' · Canva</small></span>' + icon('moreV') + '</button>';
    }).join('') : '<p class="pp-empty">No decks yet.</p>';
  }
  NX.apps.powerpoint = {
    top: function () {
      return '<header class="nx-top pp-top">' + me(30) + '<span class="pp-search">' + icon('search') + 'Search</span>' + icon('bell') + '</header>';
    },
    body: function () {
      return '<h2 class="pp-h">Recent</h2><div class="pp-files"><p class="pp-empty">Loading…</p></div>' +
        '<button type="button" class="pp-fab" aria-label="New presentation">' + icon('plus') + '</button>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'people', label: 'Shared' }, { icon: 'folder', label: 'Open' }], 'pp-tabs');
    },
    load: function () {
      return Promise.all([getJSON('content.json'), getJSON('projects.json')]).then(function (r) {
        var decks = [], seen = {};
        var brands = (r[0] && r[0].brands) || {};
        Object.keys(brands).forEach(function (s) {
          (brands[s].links || []).forEach(function (l) {
            if (l.provider === 'canva' && !l.video && l.embed && !seen[l.embed]) { seen[l.embed] = 1; decks.push({ slug: s, brand: b4(s).n, title: l.title, embed: l.embed, url: l.url }); }
          });
        });
        Object.keys(r[1] || {}).forEach(function (s) {
          ((r[1][s] || {}).projects || []).forEach(function (p) {
            (p.media || []).forEach(function (m) {
              if (m.kind === 'canva' && m.src && !seen[m.src]) { seen[m.src] = 1; decks.push({ slug: s, brand: b4(s).n, title: m.label || p.name, embed: m.src, url: String(m.src).replace(/\?embed$/, '') }); }
            });
          });
        });
        pp.decks = decks; ppList();
      });
    }
  };

  /* ================= Wikipedia ================= */
  NX.apps.wikipedia = {
    top: function () {
      return '<header class="nx-top wk-top"><button type="button" onclick="showHome()" aria-label="Back">' + icon('back') + '</button><span class="nx-grow wk-word">W<small>IKIPEDIA</small></span>' + icon('search') + '</header>';
    },
    body: function () {
      var careers = EXP.map(function (e) { return '<li><b>' + esc(e[3]) + '</b> ' + esc(e[0]) + ', ' + esc(e[1]) + ' (' + esc(e[2]) + ')</li>'; }).join('');
      return '<article class="wk-art"><h1>Abdelaziz Askar</h1><p class="wk-desc">Creative director, social media lead and music producer</p>' +
        '<figure class="wk-lead"><img src="assets/photos/img-12.jpg" alt="Abdelaziz Askar" onerror="this.parentNode.remove()"></figure>' +
        '<table class="wk-box"><tr><th>Known for</th><td>Social and AI production, TVC direction</td></tr><tr><th>Current role</th><td>Head of Social & AI, Tonic International</td></tr>' +
        '<tr><th>Years active</th><td>2007 – present</td></tr><tr><th>Markets</th><td>Egypt, Qatar, United Arab Emirates</td></tr><tr><th>Label</th><td>Escapegoat Sounds</td></tr></table>' +
        '<p><b>Abdelaziz Askar</b> is a creative director who has built brand voices and campaigns across Egypt, Qatar and the UAE since 2007, from PR at the Bibliotheca Alexandrina to Head of Social & AI at Tonic International. He is also a songwriter, photographer and music producer.</p>' +
        '<h2>Early life</h2><p>Askar was born in Kuwait and raised in Alexandria.</p>' +
        '<h2>Career</h2><ul>' + careers + '</ul>' +
        '<h2>Music</h2><p>He writes, produces and sells original music, custom DJ tracks and lyrics under the Escapegoat name through his own label, <a href="#" onclick="openApp(\'escapegoat\');return false">Escapegoat Sounds</a>.</p>' +
        '<h2>See also</h2><ul><li><a href="#" onclick="openApp(\'brands\');return false">Brands he has worked with</a></li><li><a href="about.html">Full biography and achievements</a></li></ul></article>';
    },
    tabs: function () {
      return '<div role="navigation" class="nx-tabs wk-tabs">' + icon('toc') + icon('lang') + icon('bookmark') + icon('share') + icon('search') + '</div>';
    }
  };

  /* ================= Browser (Safari) ================= */
  var sf = { i: 0 };
  function sfPages() { var s = document.getElementById('screen-browser'); return s ? Array.prototype.slice.call(s.querySelectorAll('.sf-page')) : []; }
  function sfShow(i) {
    var pages = sfPages(), scr = document.getElementById('screen-browser'); if (!scr) return;
    if (!pages.length) { scr.querySelector('.sf-start').hidden = false; scr.querySelector('.sf-addr b').textContent = 'Search or enter website name'; return; }
    sf.i = (i + pages.length) % pages.length;
    pages.forEach(function (p, k) { p.hidden = k !== sf.i; });
    scr.querySelector('.sf-start').hidden = true;
    scr.querySelector('.sf-addr b').textContent = pages[sf.i].dataset.site;
    scr.querySelector('.sf-count').textContent = pages.length;
    scr.querySelector('.app-body').scrollTop = 0;
  }
  NX.sfStep = function (d) { sfShow(sf.i + d); };
  NX.sfTabs = function () {
    var pages = sfPages();
    var html = '<div class="sf-grid">' + pages.map(function (p, k) {
      return '<button type="button" class="sf-tab" onclick="NX.sfPick(' + k + ',this)"><span class="sf-tab-hd">' + esc(p.dataset.title) + '</span><span class="sf-tab-pg">' + p.querySelector('.sf-hd').outerHTML + '<span class="sf-tab-copy">' + esc((p.querySelector('.sf-body').textContent || '').trim().slice(0, 160)) + '</span></span></button>';
    }).join('') + '</div><footer class="sf-tabbar"><span>' + icon('plus') + '</span><b>' + pages.length + ' Tabs</b><button type="button" onclick="NX.closeSheet(this)">Done</button></footer>';
    NX.sheet('browser', html, 'sf-sheet');
  };
  NX.sfPick = function (k, el) { sfShow(k); NX.closeSheet(el); };
  NX.apps.browser = {
    body: function () {
      return '<div class="sf-start"><h2>Favourites</h2><p>Website copy I wrote for brands, page by page. It opens here once it loads.</p></div><div id="screen-browser-feed"></div>';
    },
    tabs: function () {
      return '<footer class="sf-bottom"><div class="sf-addr">' + icon('lock') + '<b>Loading…</b></div>' +
        '<div class="sf-tools"><button type="button" onclick="NX.sfStep(-1)" aria-label="Back">' + icon('back') + '</button><button type="button" onclick="NX.sfStep(1)" aria-label="Forward">' + icon('fwd') + '</button>' +
        '<span>' + icon('share') + '</span><span>' + icon('book') + '</span><button type="button" class="sf-tabsbtn" onclick="NX.sfTabs()" aria-label="Show all tabs"><span class="sf-count">0</span></button></div></footer>';
    }
  };

  /* ================= Gallery (Photos) ================= */
  NX.apps.gallery = {
    body: function () {
      return '<div class="ph-scroll"><div class="ph-libhd"><h1 class="ph-big">Library</h1><span class="ph-sel">Select</span></div><div data-gal="photos"></div></div>';
    },
    tabs: function () {
      return '<div class="ph-seg"><span>Years</span><span>Months</span><span>Days</span><span class="on">All Photos</span></div>' +
        tabbar([{ icon: 'photos', label: 'Library', on: true }, { icon: 'heartCircle', label: 'For You' }, { icon: 'albums', label: 'Albums' }, { icon: 'search', label: 'Search' }], 'ph-tabs');
    }
  };
  // Photos grid for gallery.json posts: stills and films as square tiles, a
  // text-only post as a tile of its own words.
  NX.galleryGrid = function (posts) {
    if (!posts.length) return '<div class="ph-empty">' + icon('photos') + '<b>No Photos or Videos</b><span>Moments from my life outside work will show up here.</span></div>';
    return '<div class="ph-grid ph-lib">' + posts.map(function (p) {
      var bg = p.thumb || (p.youtube ? 'https://i.ytimg.com/vi/' + encodeURIComponent(p.youtube) + '/hqdefault.jpg' : '');
      var link = p.videoSrc || (p.youtube ? 'https://www.youtube.com/watch?v=' + encodeURIComponent(p.youtube) : 'gallery.html');
      return '<a href="' + esc(link) + '" target="_blank" rel="noopener"' + (bg ? ' style="background-image:url(\'' + esc(bg) + '\')"' : ' class="ph-text"') + ' aria-label="' + esc(p.title || 'Post') + '">' +
        (bg ? '' : '<span>' + esc(p.title || p.body || '') + '</span>') + (p.type === 'video' ? '<i class="ph-vid">' + icon('video') + '</i>' : '') + '</a>';
    }).join('') + '</div>';
  };

  /* ================= Contacts ================= */
  NX.apps.phone = {
    top: function () {
      return '<header class="nx-top ct-top"><button type="button" onclick="showHome()">' + icon('back') + 'Contacts</button><span class="nx-grow"></span><span class="ct-edit">Edit</span></header>';
    },
    body: function () {
      function act(ic, label, href) { return '<a class="ct-act" href="' + href + '"' + (/^https/.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>'; }
      function field(label, value, href) { return '<a class="ct-field" href="' + href + '"><small>' + label + '</small><span>' + esc(value) + '</span></a>'; }
      return '<div class="ct-card"><span class="ct-photo">' + me(96) + '</span><h1>Abdelaziz Askar</h1><p>Head of Social & AI · Tonic International</p>' +
        '<div class="ct-acts">' + act('chat', 'message', 'https://wa.me/201099197988') + act('phone', 'call', 'tel:+01099197988') + act('mail', 'mail', 'mailto:Escapegoatssounds@gmail.com') + act('globe', 'about', 'about.html') + '</div>' +
        '<div class="ct-group">' + field('mobile', '+01099197988', 'tel:+01099197988') + '</div>' +
        '<div class="ct-group">' + field('work', 'Escapegoatssounds@gmail.com', 'mailto:Escapegoatssounds@gmail.com') + field('personal', 'azaskar@yahoo.com', 'mailto:azaskar@yahoo.com') + '</div>' +
        '<div class="ct-group">' + field('contact page', 'Open the full contact page', 'contact.html') + '</div></div>';
    }
  };

  /* ================= Slack ================= */
  var CHANNELS = [
    ['imagine-studio', 'Imagine-Studio', 'Imagine Creative Studio', 'Co-founded and ran a creative studio in Alexandria, 2011 to 2014: photography, graphic design, branding and video production for regional clients.'],
    ['escapegoat-sounds', null, 'Escapegoat Sounds', 'My own music label. I write, produce and sell original music, custom DJ tracks and lyrics under the Escapegoat name.', 'escapegoat'],
    ['the-center', 'The-Center', 'The Center', 'A brand I co-created. Social content on mental health, in Arabic and English.'],
    ['escapegoat-arcade', null, 'Escapegoat Arcade', 'Retro games starring Escapegoat and Skippy, built for this site.', 'skills']
  ];
  NX.slOpen = function (i) {
    var c = CHANNELS[i];
    var go = c[1] ? '<a class="sl-link" href="' + brandLink(c[1]) + '">Open the case study →</a>' : '<a class="sl-link" href="#" onclick="openApp(\'' + c[4] + '\');return false">Open ' + esc(c[2]) + ' →</a>';
    var html = '<header class="nx-top sl-ch-top"><button type="button" onclick="NX.closeSheet(this)" aria-label="Back">' + icon('back') + '</button><b># ' + c[0] + '</b><span class="nx-grow"></span>' + icon('people') + '</header>' +
      '<div class="sl-msgs"><div class="sl-intro"><b># ' + c[0] + '</b><span>This is the very beginning of the <b>#' + c[0] + '</b> channel.</span></div>' +
      '<div class="sl-msg">' + me(36) + '<div><b>Abdelaziz Askar</b><p><b>' + esc(c[2]) + '.</b> ' + esc(c[3]) + '</p>' + go + '</div></div></div>' +
      '<footer class="sl-input"><span>Message #' + c[0] + '</span></footer>';
    NX.sheet('slack', html, 'sl-sheet');
  };
  NX.apps.slack = {
    top: function () {
      return '<header class="nx-top sl-top"><span class="sl-ws">AA</span><b>Abdelaziz Askar</b><span class="nx-grow"></span></header><div class="sl-jump">' + icon('search') + 'Jump to or search…</div>';
    },
    body: function () {
      return '<div class="sl-sec">Channels</div>' + CHANNELS.map(function (c, i) {
        return '<button type="button" class="sl-row" onclick="NX.slOpen(' + i + ')">' + icon('hash') + '<span>' + c[0] + '</span></button>';
      }).join('') +
        '<div class="sl-sec">Direct messages</div><button type="button" class="sl-row" onclick="openApp(\'messages\')">' + me(22) + '<span>Abdelaziz Askar <small>you</small></span></button>';
    },
    tabs: function () {
      return tabbar([{ icon: 'home', onIcon: 'homeFill', on: true, label: 'Home' }, { icon: 'chat', label: 'DMs' }, { icon: 'bell', label: 'Activity' }, { icon: 'more', label: 'More' }], 'sl-tabs');
    }
  };

  /* ---- after the screens exist, and after the feeds fill them ---- */
  NX.loadAll = function () {
    Object.keys(NX.apps).forEach(function (k) { if (NX.apps[k].load) NX.apps[k].load(); });
  };
  NX.feedReady = function () { sfShow(0); };
})(window);
