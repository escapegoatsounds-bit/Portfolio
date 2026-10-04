/* Video highlights on the home page: one film at a time, muted, moving on by
   itself. Each slide says the brand, the campaign and what my job was.
   Tap a thumbnail or the arrows to jump; turn the sound on and the film
   plays to its end before moving on. */
(function () {
  var P = 'assets/previews/';
  var SLIDES = [
    { slug: 'Geely', brand: 'Geely', title: 'Say Hi to the Geely EX5', role: 'Production Manager · Tonic International', src: P + '12barOXeQeVlMMD8IzvP9Dd5Ob7Xq45po.mp4', poster: P + '12barOXeQeVlMMD8IzvP9Dd5Ob7Xq45po.jpg' },
    { slug: 'Bazooka-Candy', brand: 'Bazooka Candies', title: 'Share Your Fun!', role: 'Lead Creative · Tonic International', src: P + '1WxWKnLeO5oakZKMrGDA7GgDB70wVTNLO.mp4', poster: P + '1WxWKnLeO5oakZKMrGDA7GgDB70wVTNLO.jpg' },
    { slug: 'Molfix', brand: 'Molfix', title: 'North Africa TVC', role: 'Creative Director', src: P + '1zzyMS9aJmGOXINMCrPmjmyhUIqZOhvBb.mp4', poster: P + '1zzyMS9aJmGOXINMCrPmjmyhUIqZOhvBb.jpg' },
    { slug: 'EA-FC-Mobile', brand: 'FIFA Mobile', title: 'FIFA Mobile launch ad', role: 'Copywriter, storyboards, animation and edit', src: P + 'local-EA-FC-Mobile-FIFA-Mobile-launch-ad.mp4', poster: P + 'local-EA-FC-Mobile-FIFA-Mobile-launch-ad.jpg' },
    { slug: 'Mooz', brand: 'Bazooka Candies', title: 'Mooz, the Bazooka moose', role: 'Character creator · Tonic International', src: 'assets/highlights/bazooka-moose.mp4', poster: 'assets/highlights/bazooka-moose.webp' },
    { slug: 'Quooker', brand: 'Quooker', title: 'Making waves in UAE luxury homes', role: 'Head of Social & AI · Tonic International', src: 'assets/highlights/quooker.mp4', poster: 'assets/highlights/quooker.webp' }
  ];
  var MAX_MUTED = 20;          // seconds a muted slide plays before the next

  var root = document.getElementById('highlights');
  if (!root) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  root.innerHTML =
    '<div class="hl-head"><h2 class="pd-guide-title">Highlights</h2><span>' + SLIDES.length + ' campaigns. Let it play, or pick one.</span></div>' +
    '<div class="hl-stage">' +
      '<img class="hl-bg" alt="" aria-hidden="true">' +
      '<video class="hl-video" muted playsinline preload="metadata"></video>' +
      '<div class="hl-cap"><span class="hl-brand"></span><b class="hl-title"></b><span class="hl-role"><em>My role</em><span></span></span></div>' +
      '<button type="button" class="hl-nav hl-prev" aria-label="Previous highlight">‹</button>' +
      '<button type="button" class="hl-nav hl-next" aria-label="Next highlight">›</button>' +
      '<button type="button" class="hl-sound" aria-label="Turn the sound on" aria-pressed="false">🔇</button>' +
      '<a class="hl-case" href="#">Case study →</a>' +
      '<div class="hl-progress" aria-hidden="true"><i></i></div>' +
    '</div>' +
    '<div class="hl-thumbs" role="tablist">' + SLIDES.map(function (s, i) {
      return '<button type="button" role="tab" class="hl-thumb" data-i="' + i + '" aria-label="' + esc(s.brand + ': ' + s.title) + '">' +
        '<img src="' + esc(s.poster) + '" alt="" loading="lazy"><span>' + esc(s.brand) + '</span></button>';
    }).join('') + '</div>';

  var v = root.querySelector('.hl-video'), bg = root.querySelector('.hl-bg');
  var bar = root.querySelector('.hl-progress i'), snd = root.querySelector('.hl-sound');
  var i = -1, sound = false, visible = true;

  function show(n) {
    i = (n + SLIDES.length) % SLIDES.length;
    var s = SLIDES[i];
    v.src = s.src; v.poster = s.poster; bg.src = s.poster;
    v.muted = !sound;
    root.querySelector('.hl-brand').textContent = s.brand;
    root.querySelector('.hl-title').textContent = s.title;
    root.querySelector('.hl-role span').textContent = s.role;
    var a = root.querySelector('.hl-case');
    a.href = 'clients/' + s.slug + '/index.html';
    a.setAttribute('aria-label', 'Open the ' + s.brand + ' case study');
    root.querySelectorAll('.hl-thumb').forEach(function (t, k) {
      t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
    bar.style.width = '0%';
    play();
  }
  function play() { if (visible) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  function limit() { return sound ? (v.duration || MAX_MUTED) : Math.min(v.duration || MAX_MUTED, MAX_MUTED); }

  v.addEventListener('timeupdate', function () {
    var L = limit();
    bar.style.width = Math.min(100, v.currentTime / L * 100) + '%';
    if (!sound && v.currentTime >= L) show(i + 1);
  });
  v.addEventListener('ended', function () { show(i + 1); });
  root.querySelector('.hl-prev').addEventListener('click', function () { show(i - 1); });
  root.querySelector('.hl-next').addEventListener('click', function () { show(i + 1); });
  root.querySelector('.hl-thumbs').addEventListener('click', function (e) {
    var t = e.target.closest('.hl-thumb'); if (t) show(+t.dataset.i);
  });
  snd.addEventListener('click', function () {
    sound = !sound; v.muted = !sound;
    snd.textContent = sound ? '🔊' : '🔇';
    snd.setAttribute('aria-pressed', sound ? 'true' : 'false');
    snd.setAttribute('aria-label', sound ? 'Turn the sound off' : 'Turn the sound on');
    // the lock-screen music and the feed films go quiet while a highlight talks
    if (sound) {
      if (typeof egPlaying !== 'undefined' && egPlaying && typeof toggleEgMusic === 'function') toggleEgMusic();
      if (window.NX && NX.stopMusic) NX.stopMusic();
    }
    play();
  });
  v.addEventListener('click', function () { if (v.paused) play(); else v.pause(); });

  // only play while it's on screen and the home panel is showing
  function check() {
    var on = root.offsetParent !== null && !document.hidden;
    var r = root.getBoundingClientRect();
    on = on && r.bottom > 0 && r.top < innerHeight;
    if (on === visible) return;
    visible = on;
    if (on) play(); else v.pause();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(check).observe(root);
  document.addEventListener('visibilitychange', check);
  setInterval(check, 1500);
  show(0);
})();
