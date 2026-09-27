/* Visitor tracker beacon — pings /track once per page load.
   Only runs on localhost, where editor_server.py can receive it. On static
   hosting (GitHub Pages) it does nothing. */
(function () {
  // no backend on static hosting, so skip the request instead of logging an error per page
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
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
