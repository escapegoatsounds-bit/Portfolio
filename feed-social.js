/* Likes and comments on the phone's feed posts.

   Each post carries data-pid. Counts and comments come from /api/feed (a Vercel
   function with Upstash Redis, see api/feed.js). When that isn't set up, or the
   page runs somewhere without it, likes and comments stay in this browser so the
   buttons still work for the visitor. A visitor's own likes are always
   remembered here, so the heart stays red when they come back. */
(function () {
  var API = '/api/feed';
  var mode = null;                     // 'server' once the API answers, 'local' if it can't
  var data = {};                       // pid -> {likes, comments:[{n,t,at}], total}
  var pending = null;

  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function keep(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var liked = load('fs-liked', {});
  var local = load('fs-local', {});   // pid -> {likes, comments}

  var fmt = function (n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n); };
  var postOf = function (el) { return el.closest('[data-pid]'); };
  var blank = function () { return { likes: 0, comments: [], total: 0 }; };

  function drawList(list, d) {
    list.textContent = '';
    if (!d.comments.length) {
      var e = document.createElement('div');
      e.className = 'fs-empty';
      e.textContent = 'No comments yet. Be the first.';
      list.appendChild(e);
      return;
    }
    d.comments.forEach(function (c) {
      var row = document.createElement('div'), b = document.createElement('b');
      row.className = 'fs-c';
      b.textContent = c.n;
      row.appendChild(b);
      row.appendChild(document.createTextNode(' ' + c.t));
      list.appendChild(row);
    });
    list.scrollTop = list.scrollHeight;
  }

  function render(p) {
    var id = p.dataset.pid, d = data[id] || blank(), on = !!liked[id];
    var btn = p.querySelector('.fs-like');
    if (btn) { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    var lk = p.querySelector('.fs-likes');
    if (lk) { lk.hidden = !d.likes; lk.textContent = d.likes === 1 ? '1 like' : fmt(d.likes) + ' likes'; }
    var nl = p.querySelector('.fs-n-like'); if (nl) nl.textContent = d.likes ? fmt(d.likes) : '';
    var nc = p.querySelector('.fs-n-cmt'); if (nc) nc.textContent = d.total ? fmt(d.total) : '';
    var view = p.querySelector('.fs-view');
    if (view) { view.hidden = !d.total; view.textContent = d.total === 1 ? 'View 1 comment' : 'View all ' + fmt(d.total) + ' comments'; }
    var box = p.querySelector('.fs-box');
    if (box && !box.hidden) drawList(box.querySelector('.fs-list'), d);
  }
  function renderId(id) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pid="' + id + '"]'), render);
  }

  function fromLocal(id) {
    var l = local[id] || { likes: 0, comments: [] };
    return { likes: l.likes || 0, comments: l.comments.slice(), total: l.comments.length };
  }

  /* Fetch counts for every post on the page that we haven't seen yet. */
  async function hydrate() {
    var ids = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-pid]'), function (p) {
      var id = p.dataset.pid;
      if (!(id in data) && ids.indexOf(id) < 0) ids.push(id);
    });
    if (!ids.length) return;
    ids.forEach(function (id) { data[id] = blank(); });
    if (mode !== 'local') {
      try {
        for (var i = 0; i < ids.length; i += 50) {
          var chunk = ids.slice(i, i + 50);
          var r = await fetch(API + '?ids=' + encodeURIComponent(chunk.join(',')), { cache: 'no-store' });
          if (!r.ok) throw new Error(r.status);
          var j = await r.json();
          chunk.forEach(function (id) { if (j[id]) data[id] = j[id]; });
        }
        mode = 'server';
      } catch (e) { mode = 'local'; }
    }
    if (mode === 'local') ids.forEach(function (id) { data[id] = fromLocal(id); });
    ids.forEach(renderId);
  }
  function schedule() {
    clearTimeout(pending);
    pending = setTimeout(hydrate, 300);
  }

  async function send(body) {
    if (mode === 'local') return null;
    try {
      var r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.status === 503 || r.status === 404 || r.status === 405) { mode = 'local'; return null; }
      if (!r.ok) return { error: r.status };
      return await r.json();
    } catch (e) { return { error: 'network' }; }
  }

  window.fsLike = async function (btn) {
    var p = postOf(btn); if (!p) return;
    var id = p.dataset.pid, d = data[id] || (data[id] = blank()), on = !liked[id];
    if (on) liked[id] = 1; else delete liked[id];
    keep('fs-liked', liked);
    d.likes = Math.max(0, d.likes + (on ? 1 : -1));
    renderId(id);
    if (on) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    var r = await send({ id: id, action: on ? 'like' : 'unlike' });
    if (r && typeof r.likes === 'number') { d.likes = r.likes; renderId(id); }
    else if (mode === 'local') {
      var l = local[id] || (local[id] = { likes: 0, comments: [] });
      l.likes = d.likes; keep('fs-local', local);
    }
  };

  /* Double-tap a photo or film to like it, as in the real app. */
  document.addEventListener('dblclick', function (e) {
    var media = e.target.closest && e.target.closest('[data-pid] .fp-frame, [data-pid] .fv');
    if (!media) return;
    var p = postOf(media), btn = p && p.querySelector('.fs-like');
    if (btn && !liked[p.dataset.pid]) window.fsLike(btn);
  });

  window.fsOpen = function (el) {
    var p = postOf(el); if (!p) return;
    var box = p.querySelector('.fs-box'); if (!box) return;
    box.hidden = !box.hidden;
    if (box.hidden) return;
    drawList(box.querySelector('.fs-list'), data[p.dataset.pid] || blank());
    var name = box.querySelector('[name=n]');
    try { if (!name.value) name.value = localStorage.getItem('fs-name') || ''; } catch (e) {}
    box.querySelector('[name=t]').focus({ preventScroll: true });
  };

  window.fsPost = async function (ev, form) {
    ev.preventDefault();
    var p = postOf(form), id = p.dataset.pid, d = data[id] || (data[id] = blank());
    var t = form.t.value.trim(), n = form.n.value.trim().slice(0, 40) || 'Guest';
    var err = form.querySelector('.fs-err');
    err.textContent = '';
    if (!t) return false;
    try { localStorage.setItem('fs-name', n); } catch (e) {}
    var btn = form.querySelector('button');
    btn.disabled = true;
    var r = await send({ id: id, action: 'comment', name: n, text: t });
    btn.disabled = false;
    if (r && r.comment) { d.comments.push(r.comment); d.total = r.total; }
    else if (!r) {
      var c = { n: n, t: t.slice(0, 300), at: Date.now() };
      d.comments.push(c); d.total = d.comments.length;
      var l = local[id] || (local[id] = { likes: d.likes, comments: [] });
      l.comments.push(c); keep('fs-local', local);
    } else {
      err.textContent = r.error === 429 ? 'Too many tries. Wait a minute and post again.' : 'That didn\'t post. Try again.';
      return false;
    }
    form.t.value = '';
    renderId(id);
    return false;
  };

  window.fsHydrate = schedule;
})();
