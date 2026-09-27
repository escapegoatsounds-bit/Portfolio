/* Abdelaziz Askar live editor — drag pictures onto any image, click any text to fix it,
   ➕ add brand-new images/videos anywhere, 📦 bulk upload, ◀▶ align, ⛶ fill.
   Edits persist to edits.json via editor_server.py and re-apply on every load. */
(function(){
  // Saved edits are content and must render for everyone; the toolbar that
  // creates them is local-only. IS_LOCAL gates the editing UI further down.
  const IS_LOCAL = location.hostname === 'localhost'
                || location.hostname === '127.0.0.1'
                || location.protocol === 'file:';

  const PAGE = (location.pathname.replace(/^\//,'') || 'index.html');
  let pending = {}, editing = false, lastEdits = {}, addArm = false, bulkFiles = null;
  // Relative on a live host: the site may sit under a sub-path like /repo-name/.
  function absPath(p){ return /^(https?:|data:|\/)/.test(p) ? p : (IS_LOCAL ? '/' + p : p); }

  function cssPath(el){
    const parts = [];
    while (el && el !== document.body){
      let i = 1, sib = el;
      while ((sib = sib.previousElementSibling))
        if (!(sib.hasAttribute && sib.hasAttribute('data-ze-add'))) i++;
      parts.unshift(el.tagName.toLowerCase() + ':nth-child(' + i + ')');
      el = el.parentElement;
    }
    return 'body>' + parts.join('>');
  }

  function applyAlign(el, align){
    if (align === 'left'){ el.style.float='left'; el.style.margin='0 16px 12px 0'; el.style.display='block'; }
    else if (align === 'right'){ el.style.float='right'; el.style.margin='0 0 12px 16px'; el.style.display='block'; }
    else { el.style.float=''; el.style.margin='10px auto'; el.style.display='block'; }
  }
  function applyCover(el){
    el.style.width='100%'; el.style.height='100%'; el.style.objectFit='cover';
    el.style.borderRadius='inherit'; el.style.padding='0'; el.style.margin='0';
    el.style.display='block'; el.style.maxWidth='none'; el.style.maxHeight='none';
  }

  function makeMedia(a){
    let el;
    if (a.kind === 'video'){ el = document.createElement('video'); el.src = absPath(a.src); el.controls = true; }
    else { el = document.createElement('img'); el.src = absPath(a.src); }
    el.style.maxWidth = '100%'; el.style.width = a.w || '45%'; el.style.height = 'auto';
    el.style.display = 'block'; el.style.margin = '10px auto'; el.style.borderRadius = '10px';
    el.setAttribute('data-ze-add','1');
    if (a.align) applyAlign(el, a.align);
    if (a.cover) applyCover(el);
    return el;
  }

  async function applyEdits(){
    try{
      const r = await fetch(absPath('edits.json') + '?t=' + Date.now());
      if (!r.ok) return;
      const ed = (await r.json())[PAGE] || {};
      lastEdits = ed;
      if (ed['@font']) document.body.style.fontFamily = ed['@font'].font || '';
      for (const sel in ed){
        if (sel[0] === '@') continue;
        const el = document.querySelector(sel);
        if (!el) continue;
        const e = ed[sel];
        if (e.video){
          if (el.tagName === 'VIDEO') el.src = absPath(e.video);
          else if (el.tagName === 'IMG'){
            const v = document.createElement('video');
            v.src = absPath(e.video); v.controls = true; v.className = el.className;
            v.style.cssText = el.style.cssText; v.style.maxWidth = '100%';
            el.replaceWith(v);
          }
        }
        else if (e.img && el.tagName === 'IMG') el.src = absPath(e.img);
        else if (e.html !== undefined) el.innerHTML = e.html;
        if (e.w){ el.style.width = e.w; el.style.height = 'auto'; }
        if (e.align) applyAlign(el, e.align);
        if (e.cover) applyCover(el);
        if (e.css) for (const k in e.css) el.style.setProperty(k, e.css[k], 'important');
      }
      for (const sel in ed){
        const e = ed[sel];
        if (!e.adds || !e.adds.length) continue;
        const el = document.querySelector(sel);
        if (!el) continue;
        let sib = el.nextElementSibling;
        while (sib && sib.hasAttribute && sib.hasAttribute('data-ze-add')){ const nx = sib.nextElementSibling; sib.remove(); sib = nx; }
        let ref = el;
        for (const a of e.adds){ const m = makeMedia(a); ref.after(m); ref = m; }
      }
    }catch(_){}
  }
  window.addEventListener('load', () => { applyEdits(); setTimeout(applyEdits, 400); });

  // Everything past here builds and runs the editing UI, which never ships live.
  if (!IS_LOCAL) return;

  /* ---------- toolbar ---------- */
  const bar = document.createElement('div');
  bar.id = 'zzio-editor-bar';
  bar.innerHTML = '<button id="ze-toggle" title="Toggle edit mode">✏️ Edit</button>'
    + '<span id="ze-status" style="display:none"></span>'
    + '<button id="ze-add" style="display:none" title="Add a new picture or video anywhere">➕ Add</button>'
    + '<button id="ze-bulk" style="display:none" title="Upload multiple images/videos at once">📦 Bulk</button>'
    + '<select id="ze-font" style="display:none" title="Change the page font">'
    +   '<option value="">Aa Font: Default</option>'
    +   "<option value=\"'Inter',system-ui,sans-serif\">Inter</option>"
    +   '<option value="Georgia, serif">Georgia</option>'
    +   "<option value=\"'Times New Roman', serif\">Times</option>"
    +   "<option value=\"'Courier New', monospace\">Courier</option>"
    +   '<option value="Arial, Helvetica, sans-serif">Arial</option>'
    +   "<option value=\"'Trebuchet MS', sans-serif\">Trebuchet</option>"
    +   "<option value=\"'Comic Sans MS', cursive\">Comic Sans</option>"
    +   '<option value="Impact, fantasy">Impact</option>'
    +   "<option value=\"'Palatino Linotype', Palatino, serif\">Palatino</option>"
    + '</select>'
    + '<button id="ze-save" style="display:none">💾 Save</button>'
    + '<button id="ze-push" style="display:none" title="Commit everything and push to GitHub">⬆ Push</button>'
    + '<button id="ze-exit" style="display:none">✕</button>';
  
  const css = document.createElement('style');
  css.textContent = `
    #zzio-editor-bar{position:fixed;bottom:18px;right:18px;z-index:99999;display:flex;gap:8px;align-items:center;flex-wrap:wrap;max-width:520px;
      background:#15151a;border:1px solid #333;border-radius:20px;padding:8px 12px;font-family:Inter,system-ui,sans-serif;
      box-shadow:0 10px 30px rgba(0,0,0,.6)}
    #zzio-editor-bar button{background:#f0c233;color:#000;border:none;border-radius:99px;padding:7px 14px;font-size:12px;
      font-weight:700;cursor:pointer;font-family:inherit}
    #ze-toggle{animation:ze-pulse 2.4s ease infinite;border-radius:99px!important}
    @keyframes ze-pulse{0%,100%{box-shadow:0 0 0 0 rgba(240,194,51,.45)}50%{box-shadow:0 0 0 9px rgba(240,194,51,0)}}
    #zzio-editor-bar #ze-exit{background:#333;color:#ccc}
    #zzio-editor-bar #ze-push{background:#2ecc71;color:#06301a}
    #zzio-editor-bar #ze-push[disabled]{opacity:.55;cursor:wait}
    #zzio-editor-bar #ze-add{background:#8b5cf6;color:#fff}
    #zzio-editor-bar #ze-add.armed{background:#2ecc71;color:#000}
    #zzio-editor-bar #ze-bulk{background:#4a9eff;color:#fff}
    #zzio-editor-bar #ze-bulk.armed{background:#2ecc71;color:#000}
    #zzio-editor-bar #ze-font{background:#222;color:#fff;border:1px solid #444;border-radius:99px;padding:6px 10px;font:700 12px Inter,sans-serif;cursor:pointer;max-width:130px}
    #ze-size-wrap{display:flex;align-items:center;gap:6px;background:#15151a;border:1px solid #8b5cf6;border-radius:99px;padding:4px 10px}
    #ze-size-wrap input[type=range]{accent-color:#f0c233;width:90px}
    #ze-size-wrap span{font:700 11px Inter,sans-serif;color:#a78bfa;min-width:34px;text-align:right}
    #zzio-editor-bar #ze-status{font-size:11px;color:#a78bfa;font-weight:600;white-space:nowrap}
    body.ze-on [contenteditable="true"]{outline:2px dashed #8b5cf6;outline-offset:2px;cursor:text}
    body.ze-on .ze-hover{outline:2px dashed rgba(240,194,51,.8)!important;outline-offset:2px;cursor:pointer}
    body.ze-on img{cursor:copy}
    body.ze-add-arm, body.ze-add-arm *{cursor:crosshair!important}
    .ze-dragover{outline:4px solid #8b5cf6!important;outline-offset:-4px}
    img.ze-dragover{filter:brightness(1.3)}
    #ze-toast{position:fixed;bottom:70px;right:18px;z-index:99999;background:#8b5cf6;color:#fff;padding:10px 18px;
      border-radius:10px;font:600 13px Inter,sans-serif;opacity:0;transition:opacity .3s;pointer-events:none}
    #ze-toast.show{opacity:1}
    #ze-media-bar{position:fixed;z-index:100000;display:flex;gap:5px;flex-wrap:wrap;max-width:480px;
      align-items:center;background:#15151a;border:1px solid #8b5cf6;border-radius:16px;padding:8px 10px;
      box-shadow:0 10px 30px rgba(0,0,0,.7);font-family:Inter,system-ui,sans-serif}
    #ze-media-bar button{background:#222;color:#fff;border:1px solid #3a3a46;border-radius:8px;
      min-width:30px;padding:6px 9px;font-size:12px;font-weight:700;cursor:pointer;line-height:1}
    #ze-media-bar button:hover{border-color:#8b5cf6;color:#a78bfa}
    #ze-media-bar input[type=color]{width:30px;height:30px;padding:0;border:1px solid #3a3a46;
      border-radius:8px;background:#222;cursor:pointer}`;
  document.head.appendChild(css);
  document.body.appendChild(bar);
  const toast = document.createElement('div'); toast.id = 'ze-toast'; document.body.appendChild(toast);
  function say(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(()=>toast.classList.remove('show'), 2400); }
  // When this page was last saved to disk. If it lags behind an edit you just
  // made, the browser served a cached copy - hard reload with Ctrl+Shift+R.
  function builtAt(){
    const d = new Date(document.lastModified);
    return isNaN(d) ? '' : d.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
  }

  function status(){
    const n = Object.keys(pending).length;
    const s = document.getElementById('ze-status');
    const stamp = builtAt();
    s.textContent = (n ? n + ' unsaved change' + (n>1?'s':'') : 'click text · drop images · ➕ add · 📦 bulk')
      + (stamp ? ' · page saved ' + stamp : '');
    s.title = 'This page was last written to disk at ' + stamp
      + '. If that is older than your last edit, you are seeing a cached copy - press Ctrl+Shift+R.';
  }

  function setMode(on){
    editing = on;
    document.body.classList.toggle('ze-on', on);
    document.getElementById('ze-toggle').style.display = on ? 'none' : '';
    for (const id of ['ze-status','ze-add','ze-bulk','ze-font','ze-save','ze-push','ze-exit'])
      document.getElementById(id).style.display = on ? '' : 'none';
    if (on){ const fs=document.getElementById('ze-font'); if(fs) fs.style.display='inline-block'; status(); }
  }
  document.getElementById('ze-toggle').onclick = () => {
    if (location.protocol === 'file:'){
      alert('⚠️ Editing only works through the server.\n\nOpen http://localhost:8777 instead — that\'s where editing works.');
      return;
    }
    setMode(true);
    say('✏️ Edit mode ON — click text · drag image · ➕ Add · 📦 Bulk');
  };
  document.getElementById('ze-exit').onclick = () => {
    if (Object.keys(pending).length && !confirm('Discard ' + Object.keys(pending).length + ' unsaved change(s)?')) return;
    pending = {}; bulkFiles = null; setMode(false); location.reload();
  };
  
  /* UPDATED SAVE HANDLER */
  document.getElementById('ze-save').onclick = async () => {
    if (!Object.keys(pending).length) return say('Nothing to save');
    try {
      const r = await fetch('http://localhost:8777/save-edits', { 
        method:'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ page: PAGE, edits: pending }) 
      });
      if (r.ok){ 
        say('✅ Saved — live on every reload'); 
        pending = {}; 
        status(); 
      } else {
        say('⚠️ Save failed — check terminal');
      }
    } catch(e) {
      say('⚠️ Save error — server down?');
    }
  };

  /* ---------- push to GitHub ----------
     Saves anything still pending first, or the push would commit the page
     without the edit you just made. */
  document.getElementById('ze-push').onclick = async () => {
    const btn = document.getElementById('ze-push');
    if (btn.disabled) return;

    if (Object.keys(pending).length) {
      say('Saving before push…');
      document.getElementById('ze-save').click();
      await new Promise(r => setTimeout(r, 700));
      if (Object.keys(pending).length) return say('⚠️ Save failed — not pushing');
    }

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = '⬆ Pushing…';
    say('Pushing to GitHub — large repos take a while');

    try {
      const r = await fetch('/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Update portfolio content from the editor' })
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok) {
        say(d.committed ? '✅ Pushed ' + d.committed + ' file(s) to ' + (d.branch || 'GitHub')
                        : '✅ Already up to date');
      } else {
        // the endpoint reports which step broke, which is the useful part
        say('⚠️ ' + (d.step || 'push') + ' failed — ' + String(d.error || '').split('\n')[0].slice(0, 90));
        console.error('push failed:', d);
      }
    } catch (e) {
      say('⚠️ Push error — is the editor server running?');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
      status();
    }
  };

  /* ---------- pending-edit helpers ---------- */
  function edit(el){
    const sel = cssPath(el);
    pending[sel] = pending[sel] || {};
    lastEdits[sel] = lastEdits[sel] || {};
    return pending[sel];
  }
  function setCss(el, prop, value){
    const e = edit(el);
    e.css = e.css || {};
    e.css[prop] = value;
    el.style.setProperty(prop, value, 'important');
    status();
  }
  function pxOf(el, prop){
    return Math.round(parseFloat(getComputedStyle(el)[prop])) || 0;
  }
  function rgbToHex(rgb){
    const m = (rgb || '').match(/\d+/g);
    if (!m || m.length < 3) return '#ffffff';
    return '#' + m.slice(0,3).map(n => (+n).toString(16).padStart(2,'0')).join('');
  }

  /* ---------- what can be clicked ---------- */
  const TEXT_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','LI','SPAN','STRONG','EM','B','I',
    'SMALL','TD','TH','BLOCKQUOTE','FIGCAPTION','LABEL','DT','DD','A','DIV','BUTTON']);
  // Inline formatting inside a paragraph is fine to edit; a wrapper holding other
  // blocks is not, so we bind to the element that actually owns the text.
  const BLOCK_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','UL','OL','LI','DIV','SECTION',
    'ARTICLE','TABLE','TBODY','TR','TD','TH','BLOCKQUOTE','FIGURE','NAV','HEADER','FOOTER',
    'ASIDE','FORM','MAIN','PRE','HR']);

  // Editing tools with their own buttons and fields: the page editor must not
  // turn their controls into editable text.
  const OWN_UI = '#zzio-editor-bar, #ze-media-bar, #ze-toast, #zz-proj, #zz-dropped-sec, #brandMgr, .bm-tools, .bm-add, [data-ze-skip]';
  function isChrome(el){
    return !!(el.closest && el.closest(OWN_UI));
  }
  function isMedia(el){ return el.tagName === 'IMG' || el.tagName === 'VIDEO'; }
  function isText(el){
    if (!TEXT_TAGS.has(el.tagName)) return false;
    if (!el.textContent.trim()) return false;
    if (el.querySelector('img,video,iframe,svg')) return false;
    for (const child of el.children) if (BLOCK_TAGS.has(child.tagName)) return false;
    return true;
  }
  function target(el){
    while (el && el !== document.body){
      if (isChrome(el)) return null;
      if (isMedia(el) || isText(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /* ---------- hover outline ---------- */
  let hovered = null;
  document.addEventListener('mousemove', e => {
    if (!editing) return;
    const t = target(e.target);
    if (t === hovered) return;
    if (hovered) hovered.classList.remove('ze-hover');
    hovered = t;
    if (hovered && !hovered.isContentEditable) hovered.classList.add('ze-hover');
  });

  /* ---------- the floating control bar ---------- */
  let bar2 = null, selected = null;
  function closeBar(){
    if (bar2){ bar2.remove(); bar2 = null; }
    selected = null;
  }
  function openBar(el, html){
    closeBar();
    selected = el;
    bar2 = document.createElement('div');
    bar2.id = 'ze-media-bar';
    bar2.innerHTML = html;
    document.body.appendChild(bar2);
    const r = el.getBoundingClientRect();
    const top = r.top > 70 ? r.top - 56 : r.bottom + 10;
    bar2.style.top = Math.max(8, Math.min(top, innerHeight - 70)) + 'px';
    bar2.style.left = Math.max(8, Math.min(r.left, innerWidth - bar2.offsetWidth - 8)) + 'px';
  }
  function btn(label, title){
    return '<button data-a="' + label + '" title="' + title + '">' + label + '</button>';
  }

  function openMediaBar(el){
    const cur = Math.round((el.getBoundingClientRect().width /
      (el.parentElement ? el.parentElement.getBoundingClientRect().width : innerWidth)) * 100) || 100;
    openBar(el,
      '<div id="ze-size-wrap"><input type="range" min="5" max="100" value="' + cur + '">' +
      '<span>' + cur + '%</span></div>' +
      btn('◀','Float left') + btn('■','Centre') + btn('▶','Float right') +
      btn('⛶','Fill its container') + btn('✕','Close'));

    const range = bar2.querySelector('input'), out = bar2.querySelector('#ze-size-wrap span');
    range.oninput = () => {
      out.textContent = range.value + '%';
      const e = edit(el);
      e.w = range.value + '%';
      el.style.width = e.w;
      el.style.height = 'auto';
      status();
    };
    bar2.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return;
      const a = b.dataset.a;
      if (a === '✕') return closeBar();
      if (a === '⛶'){ edit(el).cover = 1; applyCover(el); }
      else {
        const align = a === '◀' ? 'left' : a === '▶' ? 'right' : 'center';
        edit(el).align = align; applyAlign(el, align);
      }
      status();
    };
  }

  function openTextBar(el){
    const size = pxOf(el, 'fontSize');
    openBar(el,
      '<div id="ze-size-wrap"><input type="range" min="8" max="96" value="' + size + '">' +
      '<span>' + size + 'px</span></div>' +
      '<input type="color" value="' + rgbToHex(getComputedStyle(el).color) + '" title="Text colour">' +
      btn('B','Bold') + btn('✕','Close'));

    const range = bar2.querySelector('input[type=range]');
    const out = bar2.querySelector('#ze-size-wrap span');
    range.oninput = () => { out.textContent = range.value + 'px'; setCss(el, 'font-size', range.value + 'px'); };
    bar2.querySelector('input[type=color]').oninput = ev => setCss(el, 'color', ev.target.value);
    bar2.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.a === '✕') return closeBar();
      const bold = getComputedStyle(el).fontWeight;
      setCss(el, 'font-weight', (+bold >= 700 || bold === 'bold') ? '400' : '800');
    };
  }

  /* ---------- click to edit ---------- */
  document.addEventListener('click', e => {
    if (!editing) return;
    if (e.target.closest('#zzio-editor-bar') || e.target.closest('#ze-media-bar')) return;

    const t = target(e.target);
    if (!t){ closeBar(); return; }

    e.preventDefault();   // links must not navigate while editing
    e.stopPropagation();

    if (isMedia(t)){ openMediaBar(t); return; }

    if (t.isContentEditable) return;
    t.classList.remove('ze-hover');
    t.contentEditable = 'true';
    t.focus();
    const before = t.innerHTML;
    openTextBar(t);

    const finish = () => {
      t.contentEditable = 'false';
      t.removeEventListener('blur', finish);
      if (t.innerHTML !== before){ edit(t).html = t.innerHTML; status(); }
    };
    t.addEventListener('blur', finish);
  }, true);

  /* Enter commits, Escape cancels the field. */
  document.addEventListener('keydown', e => {
    if (!editing) return;
    const el = document.activeElement;
    if (!el || !el.isContentEditable) {
      if (e.key === 'Escape') closeBar();
      return;
    }
    if (e.key === 'Escape'){ el.blur(); closeBar(); }
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); el.blur(); }
  });

  /* ---------- font picker ---------- */
  const fontSel = document.getElementById('ze-font');
  if (fontSel) fontSel.onchange = () => {
    document.body.style.fontFamily = fontSel.value;
    pending['@font'] = { font: fontSel.value };
    status();
    say(fontSel.value ? 'Font applied' : 'Font reset');
  };

  window.addEventListener('resize', closeBar);
})();