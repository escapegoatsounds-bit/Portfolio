/* ── BRAND VIDEO PLAYER ─────────────────────────────────────────────────────
   Reads from window.BRAND_CONFIG (set by brands-config.js).
   Supports multiple Vimeo videos per brand with tabs, and both horizontal
   (16:9) and vertical (9:16) orientations per video.
   ────────────────────────────────────────────────────────────────────────── */
(function(){
  const cfg = window.BRAND_CONFIG || {};
  const parts = location.pathname.replace(/\\/g,'/').split('/');
  const ci = parts.indexOf('clients');
  if (ci === -1) return;
  const slug = parts[ci + 1];
  if (!slug || !cfg[slug]) return;

  const raw = cfg[slug].vimeo;
  const videos = Array.isArray(raw) ? raw.filter(v => v && v.id) : (raw ? [{id:raw,label:'',orientation:'horizontal'}] : []);
  const target = document.querySelector('section');
  if (!target) return;

  const sec = document.createElement('section');
  sec.style.cssText = 'padding:0;border-bottom:1px solid var(--b,#2c2c33)';

  if (!videos.length) {
    sec.innerHTML = placeholder();
  } else if (videos.length === 1) {
    sec.innerHTML = embed(videos[0]);
  } else {
    sec.innerHTML = tabs(videos);
  }

  target.parentNode.insertBefore(sec, target);

  function embed(v) {
    const isV = v.orientation === 'vertical';
    const url = 'https://player.vimeo.com/video/' + v.id + '?color=f0c233&title=0&byline=0&portrait=0&dnt=1';
    if (isV) {
      return '<div style="display:flex;justify-content:center;align-items:center;background:#000;padding:24px 0">'
        + '<div style="width:min(360px,80%);aspect-ratio:9/16;background:#000;position:relative">'
        + '<iframe src="' + url + '" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe>'
        + '</div></div>';
    }
    return '<div style="width:100%;aspect-ratio:16/9;background:#000;position:relative">'
      + '<iframe src="' + url + '" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe>'
      + '</div>';
  }

  function tabs(vids) {
    window.bvTab = function(btn, i) {
      var s = btn.closest('section');
      s.querySelectorAll('.bv-panel').forEach(function(p,j){ p.style.display = j===i?'block':'none'; });
      s.querySelectorAll('[data-bvtab]').forEach(function(b,j){
        b.style.color = j===i ? '#f0c233' : '#666';
        b.style.fontWeight = j===i ? '700' : '400';
        b.style.borderBottom = j===i ? '2px solid #f0c233' : '2px solid transparent';
      });
    };
    var tabBar = '<div style="display:flex;border-bottom:1px solid var(--b,#2c2c33);background:#080808">'
      + vids.map(function(v,i){
          return '<button data-bvtab onclick="bvTab(this,' + i + ')" style="padding:10px 20px;background:none;border:none;border-bottom:2px solid ' + (i===0?'#f0c233':'transparent') + ';color:' + (i===0?'#f0c233':'#666') + ';font-size:12px;font-weight:' + (i===0?'700':'400') + ';cursor:pointer;font-family:inherit;letter-spacing:.04em">'
            + (v.label || ('Video ' + (i+1))) + '</button>';
        }).join('')
      + '</div>';
    var panels = vids.map(function(v,i){
      return '<div class="bv-panel" style="display:' + (i===0?'block':'none') + '">' + embed(v) + '</div>';
    }).join('');
    return tabBar + panels;
  }

  function placeholder() {
    return '<div style="width:100%;aspect-ratio:16/9;background:#0e0e10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-top:1px solid var(--b,#2c2c33)">'
      + '<div style="width:56px;height:56px;border-radius:50%;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:22px;color:#555">▶</div>'
      + '<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#555;font-family:Inter,system-ui,sans-serif">Campaign video — coming soon</div>'
      + '</div>';
  }
})();
