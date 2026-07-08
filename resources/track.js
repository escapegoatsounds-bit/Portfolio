/* Visitor tracker beacon — pings /track once per page load.
   Only works while editor_server.py (local backend) is running; on static
   hosting (GitHub Pages) the request 404s silently and nothing breaks. */
(function () {
  try {
    var payload = JSON.stringify({
      path: location.pathname + location.search,
      ref: document.referrer || ''
    });
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/track', blob);
    } else {
      fetch('/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(function () {});
    }
  } catch (e) {}
})();
