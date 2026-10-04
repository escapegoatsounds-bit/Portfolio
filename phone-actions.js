/* Every control in the phone apps does something.

   apps-native.js draws the apps the way the real ones look, so they carry
   icons and tabs that had nothing behind them: Search, Create, the bell, the
   share arrow, filter chips and so on. This file gives each of them a job.
   Icons name themselves through data-i (see NX.icon); tabs and chips go by
   their label. One delegated click handler covers the screens, the sheets
   they open and the feed posts, so controls added later work too. */
(function () {
  if (!window.NX) return;
  var NX = window.NX, icon = NX.icon, esc = NX.esc;
  var SITE = location.origin + location.pathname.replace(/[^/]*$/, '');

  function store(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function keep(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---- small helpers ---- */
  NX.toast = function (msg) {
    var t = document.getElementById('nx-toast');
    if (!t) { t = document.createElement('div'); t.id = 'nx-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2200);
  };
  function shareUrl(url, title) {
    url = url || location.href;
    if (navigator.share) { navigator.share({ title: title || document.title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { NX.toast('Link copied'); }, function () { NX.toast(url); });
    else NX.toast(url);
  }
  NX.share = shareUrl;
  function postUrl(el) {
    var head = el.closest('[data-pid],.fp,.tk-item,.yt-card,.x-post');
    var a = head && head.querySelector('a[href*="clients/"]');
    return a ? new URL(a.getAttribute('href'), SITE).href : location.href;
  }
  function screenOf(el) { return el.closest('.app-screen'); }
  function body(el) { var s = screenOf(el); return s && s.querySelector('.app-body'); }
  function toTop(el) { var b = body(el); if (b) b.scrollTo({ top: 0, behavior: 'smooth' }); }
  function setOn(el, sel) {
    var group = el.parentNode; if (!group) return;
    group.querySelectorAll(sel).forEach(function (c) { c.classList.toggle('on', c === el); });
  }
  function go(url) { location.href = url; }
  function app(key) { if (typeof openApp === 'function') openApp(key); }
  var WA = 'https://wa.me/201099197988';
  function wa(text) { window.open(WA + (text ? '?text=' + encodeURIComponent(text) : ''), '_blank', 'noopener'); }

  /* Saved posts: the bookmark keeps a post for the visitor, as in the app. */
  var saved = store('nx-saved', {});
  function saveKey(el) { var p = el.closest('[data-pid]'); return p ? p.dataset.pid : (el.closest('.app-screen') || {}).id + ':' + [].indexOf.call(document.querySelectorAll('svg[data-i^="bookmark"]'), el); }
  function toggleSave(el) {
    var k = saveKey(el), on = !saved[k];
    if (on) saved[k] = 1; else delete saved[k];
    keep('nx-saved', saved);
    el.classList.toggle('nx-on', on);
    NX.toast(on ? 'Saved' : 'Removed from saved');
  }
  var liked = store('nx-liked', {});
  function toggleLike(el) {
    var k = saveKey(el), on = !liked[k];
    if (on) liked[k] = 1; else delete liked[k];
    keep('nx-liked', liked);
    el.classList.toggle('nx-liked', on);
  }

  /* ---- search: brands and pages, filtered as you type ---- */
  var PAGES = [['About', 'about.html'], ['Brands', 'clients.html'], ['Resume', 'resume.html'], ['My Everyday', 'news.html'],
    ['Gallery', 'gallery.html'], ['Tools I use', 'tools.html'], ['Testimonials', 'testimonials.html'], ['Contact', 'contact.html'], ['Arcade', 'game.html']];
  NX.search = function (el, appKey) {
    var key = appKey || ((screenOf(el) || {}).id || 'screen-instagram').slice(7);
    var list = (typeof BRANDS !== 'undefined' ? BRANDS : []).map(function (b) { return [b.n, brandLink(b.s), 'Brand']; })
      .concat(PAGES.map(function (p) { return [p[0], p[1], 'Page']; }));
    var html = '<header class="nx-top nx-search-top"><label class="nx-search-field">' + icon('search') +
      '<input type="search" placeholder="Search brands and pages" aria-label="Search brands and pages" autocomplete="off"></label>' +
      '<button type="button" class="nx-search-x" onclick="NX.closeSheet(this)">Cancel</button></header>' +
      '<div class="nx-search-list">' + list.map(function (r) {
        return '<a class="nx-search-row" href="' + esc(r[1]) + '" data-q="' + esc(r[0].toLowerCase()) + '"><b>' + esc(r[0]) + '</b><small>' + r[2] + '</small></a>';
      }).join('') + '<p class="nx-search-none" hidden>Nothing matches. Try a brand name.</p></div>';
    var sh = NX.sheet(key, html, 'nx-search-sheet');
    if (!sh) { go('clients.html'); return; }
    var inp = sh.querySelector('input'), rows = sh.querySelectorAll('.nx-search-row'), none = sh.querySelector('.nx-search-none');
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(), n = 0;
      rows.forEach(function (r) { var hit = !q || r.dataset.q.indexOf(q) >= 0; r.hidden = !hit; if (hit) n++; });
      none.hidden = n > 0;
    });
    setTimeout(function () { inp.focus({ preventScroll: true }); }, 340);
  };

  /* ---- what each control does ----
     By icon name (data-i), then by tab or chip label. Returning false means
     "leave this one alone". */
  var BY_ICON = {
    search: function (el) { NX.search(el); },
    compass: function (el) { NX.search(el); },
    bell: function () { app('messages'); },
    heart: function (el) { if (el.closest('header')) app('messages'); else toggleLike(el); },
    send: function (el) { if (el.closest('header')) app('messages'); else shareUrl(postUrl(el)); },
    chat: function () { app('messages'); },
    mail: function () { app('messages'); },
    comment: function () { app('messages'); },
    share: function (el) { shareUrl(postUrl(el)); },
    shuffle: function (el) { if (el.closest('.nx-spotify') && NX.spPlay) { var n = (typeof TRACKS !== 'undefined' ? TRACKS.length : 1); NX.spPlay(Math.floor(Math.random() * n)); } else shareUrl(postUrl(el)); },
    bookmark: toggleSave, bookmarkFill: toggleSave,
    plus: function () { app('phone'); }, plusSquare: function () { app('phone'); }, plusCircle: function () { app('phone'); },
    feather: function () { app('phone'); }, newChat: function (el) { toTop(el); },
    more: function () { app('wikipedia'); }, moreV: function () { app('wikipedia'); },
    menu2: function () { app('wikipedia'); },
    cast: function (el) { var v = (body(el) || document).querySelector('video'); if (v && v.requestFullscreen) v.requestFullscreen().catch(function () {}); else app('youtube'); },
    live: function (el) { if (el.closest('.nx-camera')) NX.camShoot(); else app('youtube'); },
    flash: function (el) { el.classList.toggle('nx-on'); NX.toast(el.classList.contains('nx-on') ? 'Flash on' : 'Flash off'); },
    flip: function (el) { if (NX.camShoot) NX.camShoot(); },
    chevronDown: function (el) { if (el.closest('.nx-camera')) NX.camRoll(); else app('brands'); },
    chevronRight: function () { app('chatgpt'); },
    video: function () { wa(); }, phone: function () { location.href = 'tel:+201099197988'; },
    emoji: function () { wa(); }, attach: function () { wa(); }, camera: function (el) { if (el.closest('.wa-input')) wa(); else app('camera'); },
    mic: function () { wa(); }, wave: function () { wa(); },
    undo: function (el) { if (el.closest('.ps-sheet')) { var b = el.closest('.ps-sheet').querySelector('.ps-nav.prev'); if (b) b.click(); } else toTop(el); },
    redo: function (el) { var b = el.closest('.ps-sheet') && el.closest('.ps-sheet').querySelector('.ps-nav.next'); if (b) b.click(); },
    layers: function (el) { var a = el.closest('.ps-sheet') && el.closest('.ps-sheet').querySelector('.ps-case'); if (a) a.click(); },
    grid: function (el) { var f = (screenOf(el) || document).querySelector('.ps-files'); if (f) { f.classList.toggle('ps-list'); NX.toast(f.classList.contains('ps-list') ? 'List view' : 'Grid view'); } },
    toc: function (el) { var h = [].find.call((body(el) || document).querySelectorAll('h2'), function (x) { return /career/i.test(x.textContent); }); if (h) h.scrollIntoView({ behavior: 'smooth' }); },
    lang: function () { go('about.html'); },
    book: function (el) { if (el.closest('.nx-browser') && NX.sfTabs) NX.sfTabs(); else go('tools.html'); },
    people: function () { app('brands'); },
    menu: function (el) { if (el.closest('.nx-browser') && NX.sfTabs) NX.sfTabs(); else app('wikipedia'); },
    lock: false, play: false, note: false, photos: false, folder: false
  };
  var BY_LABEL = {
    'home': function (el) { setOn(el, '.nx-tab'); toTop(el); },
    'library': function (el) { setOn(el, '.nx-tab'); toTop(el); },
    'search': function (el) { NX.search(el); },
    'explore': function (el) { NX.search(el); },
    'discover': function (el) { NX.search(el); },
    'new post': function () { app('phone'); }, 'create': function () { app('phone'); }, 'post': function () { app('phone'); },
    'create new': function () { app('phone'); }, 'new presentation': function () { app('phone'); },
    'import image': function () { app('camera'); },
    'notifications': function () { app('messages'); }, 'activity': function () { app('messages'); },
    'inbox': function () { app('messages'); }, 'dms': function () { app('messages'); },
    'friends': function () { app('brands'); }, 'my network': function () { app('brands'); }, 'communities': function () { app('brands'); },
    'subscriptions': function () { app('brands'); }, 'shared': function () { app('brands'); },
    'your library': function (el) { var s = screenOf(el); var h = s && s.querySelector('.sp-h'); if (h) h.scrollIntoView({ behavior: 'smooth' }); },
    'jobs': function () { go('resume.html'); },
    'grok': function () { app('chatgpt'); },
    'more': function () { app('wikipedia'); },
    'learn': function () { go('tools.html'); },
    'files': function (el) { var f = (screenOf(el) || document).querySelector('.ps-sec'); if (f) f.scrollIntoView({ behavior: 'smooth' }); },
    'open': function (el) { toTop(el); },
    'for you': function () { go('gallery.html'); }, 'albums': function () { go('gallery.html'); },
    'upgrade': function () { app('phone'); }
  };

  /* Chips and tabs that filter what the screen shows. */
  function spotifyChip(el) {
    setOn(el, '.sp-chip');
    var s = screenOf(el), which = el.textContent.trim();
    var rows = s.querySelectorAll('.sp-row'), heads = s.querySelectorAll('.sp-h'), cards = s.querySelector('.sp-cards');
    var empty = s.querySelector('.sp-empty');
    if (!empty) { empty = document.createElement('p'); empty.className = 'sp-empty'; empty.textContent = 'No podcasts yet. The music is under Music.'; s.querySelector('.app-body').appendChild(empty); }
    rows.forEach(function (r) { r.hidden = which === 'Podcasts'; });
    if (heads[0]) heads[0].hidden = which === 'Podcasts';
    if (heads[1]) heads[1].hidden = which !== 'All';
    if (cards) cards.hidden = which !== 'All';
    empty.hidden = which !== 'Podcasts';
  }
  function xFeed(el) {
    setOn(el, 'button');
    var s = screenOf(el), following = /following/i.test(el.textContent);
    var feed = s.querySelector('#screen-x-feed'); if (feed) feed.hidden = following;
    toTop(el);
  }
  function tkFeed(el) {
    var wrap = el.parentNode;
    [].forEach.call(wrap.children, function (c) {
      var on = c === el, t = c.textContent;
      if (on && c.tagName !== 'B') { var b = document.createElement('b'); b.textContent = t; wrap.replaceChild(b, c); }
      if (!on && c.tagName === 'B') { var sp = document.createElement('span'); sp.textContent = t; wrap.replaceChild(sp, c); }
    });
    var s = screenOf(wrap), following = /following/i.test(el.textContent);
    // Following: the films only; For You: films and photo posts
    s.querySelectorAll('.tk-item').forEach(function (it) { it.hidden = following && !it.querySelector('.fv'); });
    toTop(wrap);
  }
  function camZoom(el) {
    setOn(el, 'span');
    var img = (screenOf(el) || document).querySelector('.cam-view img');
    if (img) img.style.transform = 'scale(' + ({ '.5': 0.8, '1×': 1, '2': 1.6 }[el.textContent.trim()] || 1) + ')';
  }
  function camMode(el) {
    setOn(el, 'span');
    var m = el.textContent.trim();
    if (m === 'VIDEO' || m === 'SLO-MO' || m === 'TIME-LAPSE') app('youtube');
    else if (m === 'PANO') app('gallery');
  }
  function phSeg(el) {
    setOn(el, 'span');
    var s = screenOf(el), grid = s && s.querySelector('.ph-lib');
    if (!grid) return;
    grid.classList.remove('ph-years', 'ph-months', 'ph-days');
    var w = el.textContent.trim().toLowerCase();
    if (w !== 'all photos') grid.classList.add('ph-' + w);
  }
  function follow(el) {
    var on = !el.classList.contains('nx-on');
    el.classList.toggle('nx-on', on); el.textContent = on ? 'Following' : 'Follow';
    keep('nx-follow', on);
    NX.toast(on ? 'You follow Escapegoat' : 'Unfollowed');
  }
  function psTool(el) { setOn(el, 'span'); }
  function phSelect(el) {
    var on = el.textContent.trim() === 'Select';
    el.textContent = on ? 'Cancel' : 'Select';
    var s = el.closest('.nx-sheet') || screenOf(el); if (s) s.classList.toggle('ph-selecting', on);
  }

  var BY_CLASS = [
    ['.sp-chip', spotifyChip], ['.sp-follow', follow], ['.x-feeds button', xFeed], ['.tk-feeds > span, .tk-feeds > b', tkFeed],
    ['.cam-zoom span', camZoom], ['.cam-modes span', camMode], ['.ph-seg span', phSeg], ['.ps-rail span', psTool],
    ['.ph-sel', phSelect], ['.x-up', function () { app('phone'); }],
    ['.ps-search', function (el) { NX.search(el); }], ['.pp-search', function (el) { NX.search(el); }], ['.li-search', function (el) { NX.search(el); }],
    ['.li-btn.icon', function () { app('wikipedia'); }], ['.gpt-field', function () { wa('Hi Abdelaziz, I have a question: '); }],
    ['.wa-field', function () { wa(); }], ['.sl-input', function () { wa(); }],
    ['.ig-mine', function () { app('camera'); }], ['.ig-word', function (el) { toTop(el); }],
    ['.yt-series-row', function () { window.open('https://www.youtube.com/@Escapegoatsounds', '_blank', 'noopener'); }],
    ['.cam-caret', function () { NX.camRoll(); }], ['.sf-addr', function () { if (NX.sfTabs) NX.sfTabs(); }]
  ];

  function resolve(t) {
    if (!t.closest) return null;
    var scope = t.closest('.app-screen, .nx-sheet, .dyn-content');
    if (!scope) return null;
    // real links and buttons with their own handlers keep them
    var real = t.closest('a[href], [onclick], input, label.fs-form, textarea, video, audio, iframe, form, .fs-box');
    for (var i = 0; i < BY_CLASS.length; i++) {
      var m = t.closest(BY_CLASS[i][0]);
      if (m && (!real || m.contains(real) && real === m)) return [m, BY_CLASS[i][1]];
    }
    if (real) return null;
    var tab = t.closest('.nx-tab, .yt-chip, .ps-new, .ps-import, .pp-fab, .x-fab');
    if (tab) {
      var lab = (tab.getAttribute('aria-label') || tab.textContent || '').trim().toLowerCase();
      if (BY_LABEL[lab]) return [tab, BY_LABEL[lab]];
    }
    var ic = t.closest('svg.nx-i[data-i]');
    if (ic) {
      var host = ic.parentNode && ic.parentNode.matches && ic.parentNode.matches('span.tk-act, span.ig-dm, span.sp-shuf, span.cam-flip, span.gpt-voice, span.cam-caret') ? ic.parentNode : ic;
      var f = BY_ICON[ic.dataset.i];
      if (f) return [host, f];
    }
    var b = t.closest('button');
    if (b) {
      var l2 = (b.getAttribute('aria-label') || b.textContent || '').trim().toLowerCase();
      if (BY_LABEL[l2]) return [b, BY_LABEL[l2]];
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var r = resolve(e.target);
    if (!r) return;
    e.preventDefault();
    r[1](r[0]);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target; if (!t.hasAttribute || !t.hasAttribute('data-nx-act')) return;
    var r = resolve(t); if (!r) return;
    e.preventDefault(); r[1](r[0]);
  });

  /* Mark what's live so it gets a pointer, a focus ring and a role. */
  function mark(root) {
    (root || document).querySelectorAll('.app-screen svg.nx-i[data-i], .nx-sheet svg.nx-i[data-i], .dyn-content svg.nx-i[data-i], .sp-chip, .sp-follow, .x-feeds button, .tk-feeds > *, .cam-zoom span, .cam-modes span, .ph-seg span, .ps-rail span, .ph-sel, .x-up, .ps-search, .pp-search, .li-search, .li-btn.icon, .gpt-field, .wa-field, .sl-input, .ig-mine, .yt-series-row, .cam-caret, .sf-addr, .nx-tab').forEach(function (el) {
      if (el.hasAttribute('data-nx-act')) return;
      var r = resolve(el); if (!r || r[0] !== el && !(r[0].contains(el))) return;
      var host = r[0];
      if (host.hasAttribute('data-nx-act')) return;
      host.setAttribute('data-nx-act', '');
      if (!/^(A|BUTTON)$/.test(host.tagName)) {
        host.setAttribute('role', 'button'); host.setAttribute('tabindex', '0');
        if (host.tagName.toLowerCase() === 'svg') host.removeAttribute('aria-hidden');
        if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', (host.dataset && host.dataset.i) || host.textContent.trim().slice(0, 40));
      }
      var k = saveKey(host);
      if (saved[k] && /bookmark/.test(host.dataset && host.dataset.i || '')) host.classList.add('nx-on');
    });
    var f = store('nx-follow', false), fb = document.querySelector('.sp-follow');
    if (f && fb && !fb.classList.contains('nx-on')) { fb.classList.add('nx-on'); fb.textContent = 'Following'; }
  }
  NX.markActions = mark;
  var pend = null;
  new MutationObserver(function () { clearTimeout(pend); pend = setTimeout(function () { mark(); }, 250); })
    .observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mark(); }); else mark();
})();
