/* ZIZO live editor — drag pictures onto any image, click any text to fix it,
   ➕ add brand-new images/videos anywhere, 📦 bulk upload, ◀▶ align, ⛶ fill.
   Edits persist to edits.json via editor_server.py and re-apply on every load. */
(function(){
const PAGE = (location.pathname.replace(/^\//,'') || 'index.html');
let pending = {}, editing = false, lastEdits = {}, addArm = false, bulkFiles = null;
function absPath(p){ return /^(https?:|data:|\/)/.test(p) ? p : '/' + p; }

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
    const r = await fetch('/edits.json?t=' + Date.now());
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
  background:#15151a;border:1px solid #8b5cf6;border-radius:16px;padding:8px 10px;
  box-shadow:0 10px 30px rgba(0,0,0,.7)}`;
document.head.appendChild(css);
document.body.appendChild(bar);
const toast = document.createElement('div'); toast.id = 'ze-toast'; document.body.appendChild(toast);
function say(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(()=>toast.classList.remove('show'), 2400); }
function status(){
  const n = Object.keys(pending).length;
  const s = document.getElementById('ze-status');
  s.textContent = n ? n + ' unsaved change' + (n>1?'s':'') : 'click text · drop images · ➕ add · 📦 bulk';
}

function setMode(on){
  editing = on;
  document.body.classList.toggle('ze-on', on);
  document.getElementById('ze-toggle').style.display = on ? 'none' : '';
  for (const id of ['ze-status','ze-add','ze-bulk','ze-font','ze-save','ze-exit'])
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
document.getElementById('ze-save').onclick = async () => {
  if (!Object.keys(pending).length) return say('Nothing to save');
  const r = await fetch('/save-edits', { method:'POST', body: JSON.stringify({ page: PAGE, edits: pending }) });
  if (r.ok){ say('✅ Saved — live on every reload'); pending = {}; status(); }
  else say('⚠️ Save failed — is editor_server.py running?');
};
document.getElementById('ze-add').onclick = (e) => {
  e.stopPropagation(); bulkFiles = null;
  setAddArm(!addArm);
};
document.getElementById('ze-bulk').onclick = (e) => {
  e.stopPropagation();
  const inp = document.createElement('input');
  inp.type='file'; inp.multiple=true; inp.accept='image/*,video/*';
  inp.onchange = () => {
    if (!inp.files.length) return;
    bulkFiles = Array.from(inp.files);
    say('📦 ' + bulkFiles.length + ' files ready — click where on the page to insert them');
    setAddArm(true);
    document.getElementById('ze-bulk').classList.add('armed');
  };
  inp.click();
};
(function(){
  const fs = document.getElementById('ze-font');
  if (!fs) return;
  fs.onchange = () => {
    const f = fs.value;
    document.body.style.fontFamily = f;
    pending['@font'] = { font: f };
    status();
    say('🔤 Font: ' + fs.selectedOptions[0].textContent + ' — Save to keep it');
  };
})();
function setAddArm(on){
  addArm = on;
  document.getElementById('ze-add').classList.toggle('armed', on && !bulkFiles);
  document.body.classList.toggle('ze-add-arm', on);
  if (!on){ bulkFiles = null; document.getElementById('ze-bulk').classList.remove('armed'); }
  if (on && !bulkFiles) say('➕ Click the spot where the new image/video should go');
}

/* ---------- adding new media ---------- */
function uploadFile(file){
  return fetch('/upload?name=' + encodeURIComponent(file.name), { method:'POST', body: file })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(j => j.path);
}
function currentAdds(sel){
  const p = pending[sel] && pending[sel].adds;
  const s = lastEdits[sel] && lastEdits[sel].adds;
  return (p || s || []).map(a => Object.assign({}, a));
}
function anchorFor(target){
  let el = target.closest('img,video,h1,h2,h3,h4,p,li,a,button,span,div,section,td');
  while (el && el.closest('#zzio-editor-bar')) el = el.parentElement;
  if (!el || el === document.body) return null;
  if (el.hasAttribute('data-ze-add')){
    let sib = el;
    while (sib && sib.hasAttribute && sib.hasAttribute('data-ze-add')) sib = sib.previousElementSibling;
    if (sib) el = sib;
  }
  return el;
}
async function addMedia(anchor, file){
  const isVid = /^video\//.test(file.type);
  if (!isVid && !/^image\//.test(file.type)) return say('Drop an image or video file');
  say('Uploading ' + file.name + '…');
  let path;
  try{ path = await uploadFile(file); }catch(_){ return say('⚠️ Upload failed — is editor_server.py running?'); }
  const sel = cssPath(anchor);
  const adds = currentAdds(sel);
  adds.push({ kind: isVid ? 'video' : 'img', src: path });
  let ref = anchor;
  while (ref.nextElementSibling && ref.nextElementSibling.hasAttribute('data-ze-add')) ref = ref.nextElementSibling;
  ref.after(makeMedia(adds[adds.length-1]));
  pending[sel] = Object.assign(pending[sel]||{}, { adds });
  status(); say((isVid?'🎬':'🖼️') + ' Added — hit Save to keep it');
}
function pickAndAdd(anchor){
  if (bulkFiles){
    const files = bulkFiles; bulkFiles = null;
    document.getElementById('ze-bulk').classList.remove('armed');
    say('📦 Uploading ' + files.length + ' files…');
    (async () => {
      let count = 0;
      for (const f of files){ await addMedia(anchor, f); count++; say('📦 ' + count + '/' + files.length + ' done…'); }
      say('📦 All ' + count + ' files added — hit Save to keep them');
      status();
    })();
  } else {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*,video/*';
    inp.onchange = () => { if (inp.files[0]) addMedia(anchor, inp.files[0]); };
    inp.click();
  }
}
/* helpers for edits to injected media */
function addedRef(el){
  if (!el.hasAttribute('data-ze-add')) return null;
  let i = 0, sib = el;
  while ((sib = sib.previousElementSibling) && sib.hasAttribute && sib.hasAttribute('data-ze-add')) i++;
  return sib ? { sel: cssPath(sib), index: i } : null;
}
function patchAdd(el, patch){
  const ref = addedRef(el);
  if (!ref) return false;
  const adds = currentAdds(ref.sel);
  if (!adds[ref.index]) return false;
  if (patch === null) adds.splice(ref.index, 1);
  else adds[ref.index] = Object.assign(adds[ref.index], patch);
  pending[ref.sel] = Object.assign(pending[ref.sel]||{}, { adds });
  return true;
}

/* ---------- move / align / fill ---------- */
function alignMedia(el, align){
  applyAlign(el, align);
  const patch = { align };
  if (!patchAdd(el, patch)) pending[cssPath(el)] = Object.assign(pending[cssPath(el)]||{}, { align });
  status(); say('Aligned ' + align + ' — hit Save to keep it');
}
function coverMedia(el){
  applyCover(el);
  const patch = { cover: true };
  if (!patchAdd(el, patch)) pending[cssPath(el)] = Object.assign(pending[cssPath(el)]||{}, { cover: true });
  status(); say('Image fills container — hit Save to keep it');
}
function uncoverMedia(el){
  el.style.width = el.style.width || '45%'; el.style.height = 'auto';
  el.style.objectFit = ''; el.style.borderRadius = '10px';
  el.style.padding = ''; el.style.margin = '10px auto';
  el.style.maxWidth = '100%'; el.style.maxHeight = '';
  const patch = { cover: false };
  if (!patchAdd(el, patch)) pending[cssPath(el)] = Object.assign(pending[cssPath(el)]||{}, { cover: false });
  status(); say('Reset to normal size');
}

/* ---------- text editing ---------- */
const TEXT_OK = /^(H1|H2|H3|H4|P|SPAN|A|B|STRONG|EM|DIV|LI|BUTTON|TD)$/;
function editableText(el){
  if (!TEXT_OK.test(el.tagName)) return false;
  if (el.closest('#zzio-editor-bar')) return false;
  return el.innerText.trim().length > 0 && el.querySelectorAll('img,audio,svg,iframe').length === 0
      && el.children.length <= 3 && el.innerText.length < 600;
}
document.addEventListener('mouseover', e => {
  if (!editing) return;
  if (addArm){ if (e.target.classList && !e.target.closest('#zzio-editor-bar')) e.target.classList.add('ze-dragover'); return; }
  if (editableText(e.target)) e.target.classList.add('ze-hover');
});
document.addEventListener('mouseout', e => {
  if (e.target.classList){ e.target.classList.remove('ze-hover'); if (addArm) e.target.classList.remove('ze-dragover'); }
});
document.addEventListener('click', e => {
  if (!editing) return;
  if (addArm){
    if (e.target.closest('#zzio-editor-bar')) return;
    e.preventDefault(); e.stopPropagation();
    e.target.classList && e.target.classList.remove('ze-dragover');
    const anchor = anchorFor(e.target);
    setAddArm(false);
    if (!anchor) return say('Can\'t add here — try another spot');
    pickAndAdd(anchor);
    return;
  }
  const a = e.target.closest('a');
  if (a) { e.preventDefault(); }
  const el = e.target;
  if (el.isContentEditable) return;
  if (!editableText(el)) return;
  e.stopPropagation();
  el.classList.remove('ze-hover');
  const before = el.innerHTML;
  el.setAttribute('contenteditable', 'true');
  el.focus();
  const done = () => {
    el.removeAttribute('contenteditable');
    el.removeEventListener('blur', done);
    if (el.innerHTML !== before){
      pending[cssPath(el)] = { html: el.innerHTML };
      status();
    }
  };
  el.addEventListener('blur', done);
}, true);
document.addEventListener('keydown', e => {
  if (editing && e.key === 'Escape'){
    if (addArm) setAddArm(false);
    if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
  }
});

/* ---------- drag & drop (from Explorer) ---------- */
document.addEventListener('dragover', e => { if (editing) e.preventDefault(); });
document.addEventListener('dragenter', e => {
  if (!editing || !e.target.classList || e.target.closest('#zzio-editor-bar')) return;
  e.target.classList.add('ze-dragover');
});
document.addEventListener('dragleave', e => {
  if (e.target.classList) e.target.classList.remove('ze-dragover');
});
async function swapMedia(el, file){
  const isVid = /^video\//.test(file.type);
  if (!isVid && !/^image\//.test(file.type)) return say('Drop an image or video file');
  say('Uploading ' + file.name + '…');
  let path;
  try{ path = await uploadFile(file); }catch(_){ return say('⚠️ Upload failed'); }
  if (el.hasAttribute('data-ze-add')){
    patchAdd(el, { kind: isVid ? 'video' : 'img', src: path });
    if (isVid && el.tagName !== 'VIDEO'){ const v = makeMedia({kind:'video',src:path,w:el.style.width}); el.replaceWith(v); }
    else el.src = absPath(path) + '?t=' + Date.now();
    status(); return say('🔁 Replaced — hit Save to keep it');
  }
  const sel = cssPath(el);
  if (isVid){
    const v = document.createElement('video');
    v.src = absPath(path); v.controls = true; v.className = el.className;
    v.style.cssText = el.style.cssText; v.style.maxWidth = '100%';
    el.replaceWith(v);
    pending[sel] = Object.assign(pending[sel]||{}, { video: path });
    say('🎬 Video placed — hit Save to keep it');
  } else {
    el.src = absPath(path) + '?t=' + Date.now();
    pending[sel] = Object.assign(pending[sel]||{}, { img: path });
    say('🖼️ Replaced — hit Save to keep it');
  }
  status();
}
document.addEventListener('drop', async e => {
  if (!editing) return;
  e.preventDefault();
  if (e.target.classList) e.target.classList.remove('ze-dragover');
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (!file) return;
  const media = e.target.closest('img,video');
  if (media) return swapMedia(media, file);
  const anchor = anchorFor(e.target);
  if (!anchor) return say('Can\'t add here — try another spot');
  addMedia(anchor, file);
});

/* ---------- media toolbar: replace / resize / align / fill / delete ---------- */
let mt = null, mtEl = null;
function closeMT(){ if (mt){ mt.remove(); mt = null; mtEl = null; } }
function resize(el, delta){
  const parent = el.parentElement;
  const cur = el.getBoundingClientRect().width / parent.getBoundingClientRect().width * 100;
  const w = Math.max(15, Math.min(100, Math.round(cur + delta))) + '%';
  el.style.width = w; el.style.height = 'auto';
  if (!patchAdd(el, { w }))
    pending[cssPath(el)] = Object.assign(pending[cssPath(el)]||{}, { w });
  status(); say('Size: ' + w);
}
function setWidthPct(el, pct){
  const w = Math.max(10, Math.min(100, Math.round(pct))) + '%';
  el.style.width = w; el.style.height = 'auto';
  if (!patchAdd(el, { w }))
    pending[cssPath(el)] = Object.assign(pending[cssPath(el)]||{}, { w });
  status();
}
document.addEventListener('click', e => {
  if (!editing || addArm) return;
  if (mt && mt.contains(e.target)) return;
  const el = e.target.closest('img,video');
  closeMT();
  if (!el || el.closest('#zzio-editor-bar')) return;
  e.preventDefault(); e.stopPropagation();
  mtEl = el;
  mt = document.createElement('div');
  mt.id = 'ze-media-bar';
  const mkBtn = (txt, fn, title, col) => {
    const b = document.createElement('button');
    b.textContent = txt; b.title = title||'';
    b.style.cssText = 'background:'+(col||'#f0c233')+';color:'+(col&&col!=='#f0c233'?'#fff':'#000')
      +';border:none;border-radius:99px;padding:5px 11px;font:700 12px Inter,sans-serif;cursor:pointer;white-space:nowrap';
    b.onclick = ev => { ev.stopPropagation(); fn(); }; return b;
  };
  // Replace
  mt.appendChild(mkBtn('🔁 Replace', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*,video/*';
    inp.onchange = () => { if (inp.files[0]) swapMedia(mtEl, inp.files[0]); closeMT(); };
    inp.click();
  }, 'Pick a new image or video'));
  // Resize
  mt.appendChild(mkBtn('➖', () => resize(mtEl, -10), 'Smaller'));
  mt.appendChild(mkBtn('➕', () => resize(mtEl, +10), 'Bigger'));
  const sw = document.createElement('div'); sw.id = 'ze-size-wrap';
  const sl = document.createElement('input'); sl.type = 'range'; sl.min = '10'; sl.max = '100';
  const curPct = Math.round(el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width * 100);
  sl.value = Math.max(10, Math.min(100, curPct));
  const lbl = document.createElement('span'); lbl.textContent = sl.value + '%';
  sl.oninput = () => { lbl.textContent = sl.value + '%'; setWidthPct(mtEl, +sl.value); };
  sl.onclick = ev => ev.stopPropagation();
  sw.appendChild(sl); sw.appendChild(lbl); mt.appendChild(sw);
  mt.appendChild(mkBtn('↺ Reset', () => {
    mtEl.style.width=''; mtEl.style.height='';
    if (!patchAdd(mtEl, { w: undefined })){ const p = pending[cssPath(mtEl)]; if (p) delete p.w; }
    status(); say('Size reset');
  }, 'Reset to default size'));
  // Align
  mt.appendChild(mkBtn('◀ Left', () => alignMedia(mtEl, 'left'), 'Float left', '#4a9eff'));
  mt.appendChild(mkBtn('⬛ Center', () => alignMedia(mtEl, 'center'), 'Center', '#4a9eff'));
  mt.appendChild(mkBtn('Right ▶', () => alignMedia(mtEl, 'right'), 'Float right', '#4a9eff'));
  // Fill
  mt.appendChild(mkBtn('⛶ Fill', () => coverMedia(mtEl), 'Make image fill its container (cover)', '#8b5cf6'));
  mt.appendChild(mkBtn('⟲ Unfill', () => uncoverMedia(mtEl), 'Reset fill to normal', '#8b5cf6'));
  // Delete (injected only)
  if (el.hasAttribute('data-ze-add'))
    mt.appendChild(mkBtn('🗑 Delete', () => {
      patchAdd(mtEl, null); mtEl.remove(); closeMT(); status(); say('Removed — hit Save to keep it');
    }, 'Delete this added media', '#e85d4a'));
  mt.appendChild(mkBtn('✕', closeMT, 'Close', '#333'));
  const r = el.getBoundingClientRect();
  mt.style.left = Math.max(8, Math.min(window.innerWidth - 500, r.left + r.width/2 - 240)) + 'px';
  mt.style.top = Math.max(8, r.top - 56) + 'px';
  document.body.appendChild(mt);
}, true);
document.addEventListener('scroll', closeMT, true);
})();

/* ── BRAND VIDEO PLAYER ─────────────────────────────────────────────────────
   Primary source: projects.json (brand → projects[*].vimeo).
   Falls back to brands-config.js BRAND_CONFIG[slug].vimeo for legacy entries.
   Supports multiple Vimeo videos per brand with tabs, and both horizontal
   (16:9) and vertical (9:16) orientations.
   ────────────────────────────────────────────────────────────────────────── */
(function(){
  if (document.querySelector('[data-bvtab]')) return;
  const parts = location.pathname.replace(/\\/g,'/').split('/');
  const ci = parts.indexOf('clients');
  if (ci === -1) return;
  const slug = parts[ci + 1];
  if (!slug) return;

  function initPlayer(videos) {
    const target = document.querySelector('section');
    if (!target) return;
    const sec = document.createElement('section');
    sec.style.cssText = 'padding:0;border-bottom:1px solid var(--b,#2c2c33)';
    if (!videos.length) {
      sec.innerHTML = placeholder();
    } else if (videos.length === 1) {
      sec.innerHTML = embed(videos[0]);
    } else {
      sec.innerHTML = tabsHTML(videos);
    }
    target.parentNode.insertBefore(sec, target);
  }

  // Try projects.json first (most up-to-date source)
  var depth = parts.filter(function(p){ return p === '..'; }).length || 2;
  var jsonPath = Array(depth).fill('..').join('/') + '/projects.json';
  fetch(jsonPath + '?t=' + Date.now())
    .then(function(r){ return r.json(); })
    .then(function(data){
      var bd = data[slug];
      var vids = bd ? (bd.projects||[]).flatMap(function(p){ return (p.vimeo||[]).filter(function(v){ return v&&v.id; }); }) : [];
      if (!vids.length) {
        // Fall back to brands-config.js
        var cfg = window.BRAND_CONFIG || {};
        var raw = cfg[slug] && cfg[slug].vimeo;
        vids = Array.isArray(raw) ? raw.filter(function(v){ return v&&v.id; }) : (raw ? [{id:raw,label:'',orientation:'horizontal'}] : []);
      }
      initPlayer(vids);
    })
    .catch(function(){
      var cfg = window.BRAND_CONFIG || {};
      var raw = cfg[slug] && cfg[slug].vimeo;
      var vids = Array.isArray(raw) ? raw.filter(function(v){ return v&&v.id; }) : (raw ? [{id:raw,label:'',orientation:'horizontal'}] : []);
      initPlayer(vids);
    });

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

  function tabsHTML(vids) {
    window.bvTab = function(btn, i) {
      var s = btn.closest('section');
      s.querySelectorAll('.bv-panel').forEach(function(p,j){ p.style.display = j===i?'block':'none'; });
      s.querySelectorAll('[data-bvtab]').forEach(function(b,j){
        b.style.color = j===i ? '#f0c233' : '#666';
        b.style.fontWeight = j===i ? '700' : '400';
        b.style.borderBottom = j===i ? '2px solid #f0c233' : '2px solid transparent';
      });
    };
    var bar = '<div style="display:flex;border-bottom:1px solid var(--b,#2c2c33);background:#080808">'
      + vids.map(function(v,i){
          return '<button data-bvtab onclick="bvTab(this,' + i + ')" style="padding:10px 20px;background:none;border:none;border-bottom:2px solid '+(i===0?'#f0c233':'transparent')+';color:'+(i===0?'#f0c233':'#666')+';font-size:12px;font-weight:'+(i===0?'700':'400')+';cursor:pointer;font-family:inherit;letter-spacing:.04em">'+(v.label||('Video '+(i+1)))+'</button>';
        }).join('') + '</div>';
    var panels = vids.map(function(v,i){
      return '<div class="bv-panel" style="display:'+(i===0?'block':'none')+'">'+embed(v)+'</div>';
    }).join('');
    return bar + panels;
  }

  function placeholder() {
    return '<div style="width:100%;aspect-ratio:16/9;background:#0e0e10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-top:1px solid var(--b,#2c2c33)">'
      + '<div style="width:56px;height:56px;border-radius:50%;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:22px;color:#555">▶</div>'
      + '<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#555;font-family:Inter,system-ui,sans-serif">Campaign video — coming soon</div>'
      + '</div>';
  }
})();
