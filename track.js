/* Visitor tracking.
   On the live site: GoatCounter (visits, pages, referrers, countries, devices) and,
   if set, Microsoft Clarity (session recordings and heatmaps), plus click events for
   the things that matter: email, phone, LinkedIn, CV downloads, decks and film plays.
   Nothing is sent from localhost.
   Tag the links you send with ?ref=<name> (for example ?ref=seonart) to see which
   application or post a visit came from. */
(function () {
  var GOATCOUNTER = 'escapegoat';   // escapegoat.goatcounter.com
  var CLARITY = '';       // your Microsoft Clarity project id

  // your own local testing is never counted
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:') return;

  if (GOATCOUNTER) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER + '.goatcounter.com/count');
    document.head.appendChild(s);
  }
  if (CLARITY) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY);
  }

  // one named event, sent to both tools
  function event(name) {
    try {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true });
      if (window.clarity) window.clarity('event', name);
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '', host = '';
    try { host = new URL(h, location.href).hostname; } catch (x) {}
    if (/^mailto:/i.test(h)) event('click: email');
    else if (/^tel:/i.test(h)) event('click: phone');
    else if (/linkedin\.com/i.test(host)) event('click: linkedin');
    else if (/instagram\.com/i.test(host)) event('click: instagram');
    else if (/\.pdf($|\?)/i.test(h)) event('download: ' + h.split('/').pop().split('?')[0]);
    else if (/canva\.com/i.test(host)) event('open deck: ' + (a.textContent || '').trim().slice(0, 60));
    else if (/drive\.google\.com/i.test(host)) event('open film: ' + (a.textContent || '').trim().slice(0, 60));
    else if (host && host !== location.hostname) event('outbound: ' + host);
  }, true);

  // the first play of each video on a page
  var played = [];
  document.addEventListener('play', function (e) {
    var v = e.target; if (!v || v.tagName !== 'VIDEO' || v.muted && !v.controls) return;
    var src = (v.currentSrc || v.src || '').split('/').pop().split('?')[0];
    if (!src || played.indexOf(src) >= 0) return;
    played.push(src); event('play: ' + location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).slice(-1)[0] + ' / ' + src);
  }, true);
})();
