/* ZIZO brand pages — Brand cover + profile, and Project sub-tabs.
   Each brand page = one brand. Each tab is a project with: a cover photo, template
   (name/type/client/date/role/status), an analytics row, a pie OR bar chart, and a
   photo + video gallery. Saves to the site via editor_server (/save-projects →
   projects.json) with a localStorage fallback. */
(function(){
  const m = location.pathname.match(/clients\/([^\/]+)\//);
  if(!m) return;
  const SLUG = decodeURIComponent(m[1]);
  const KEY  = 'zz_projects_' + SLUG;
  const brandName = (document.querySelector('.hn')||{}).textContent || SLUG.replace(/-/g,' ');
  const industry = (window.BRAND_INDUSTRY && window.BRAND_INDUSTRY[SLUG]) || '';
  const PALETTE = ['#f0c233','#8b5cf6','#2ecc71','#e85d4a','#4a9eff','#ff7ad9'];

  const PROJ_TYPES  = ['','TVC','Social Media','Campaign','Photography','OOH','Branding','Strategy','AI Production','Events','PR','Copy','Music'];
  const PROJ_ROLES  = ['','Creative Director','Lead Creative','Art Director','Production Manager','Brand Strategist','Campaign Lead','Director','Photographer','Designer','Co-founder','AI Consultant','Social Strategist'];
  const PROJ_STATUS = ['','Live','Delivered','In Production','Pitching','Archived'];
  const YEARS_FULL  = [''].concat([...Array(21)].map((_,i)=>String(2025-i)));
  const YEARS_SINCE = [''].concat([...Array(19)].map((_,i)=>String(2025-i)));
  const IND_OPTS    = ['','Automotive','FMCG','QSR','F&B','Banking','Gaming','Telecom','Healthcare','Real Estate','Retail','Luxury','Beauty','Fashion','Sports','Travel','Technology','E-commerce','Education','Startup','Non-profit'];
  const PROJ_SELECTS = {type:PROJ_TYPES, role:PROJ_ROLES, status:PROJ_STATUS, date:YEARS_FULL};
  const BRAND_SELECTS= {industry:IND_OPTS, since:YEARS_SINCE};

  function absPath(p){ return /^(https?:|data:|\/)/.test(p) ? p : '/' + p; }
  function el(t){ return document.createElement(t); }
  function esc(s){ return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function pick(accept,cb){ const i=el('input'); i.type='file'; i.accept=accept; i.onchange=()=>{ if(i.files[0]) cb(i.files[0]); }; i.click(); }
  function uploadFile(file){
    return fetch('/upload?name='+encodeURIComponent(file.name),{method:'POST',body:file})
      .then(r=>r.ok?r.json():Promise.reject()).then(j=>j.path);
  }

  const BRAND_FIELDS = [
    ['industry','Industry','e.g. Food & Beverage'],
    ['market','Market / Region','e.g. Egypt · GCC'],
    ['since','Working Together Since','e.g. 2021'],
    ['services','Services','e.g. Social, TVC, Photography'],
  ];
  const PROJ_FIELDS = [
    ['name','Project Name','e.g. Ramadan 2024 Campaign'],
    ['type','Type',''],
    ['client','Client', brandName],
    ['date','Year',''],
    ['role','Your Role',''],
    ['status','Status',''],
    ['deliverables','Deliverables','e.g. TVC · OOH · Social'],
  ];
  function blankProject(){
    const p={}; PROJ_FIELDS.forEach(f=>p[f[0]]=''); p.client=brandName; p.desc='';
    p.cover=''; p.analytics={reach:'',duration:'',audience:''}; p.chartType='bar';
    p.chartData=[{label:'Reach',value:60,color:PALETTE[0]},{label:'Engagement',value:25,color:PALETTE[1]},{label:'Conversion',value:15,color:PALETTE[2]}];
    p.media=[]; p.vimeo=[]; return p;
  }
  function defaults(){
    const b={}; BRAND_FIELDS.forEach(f=>b[f[0]]=''); b.industry=industry; b.summary=''; b.cover='';
    return { brand:b, projects:[ Object.assign(blankProject(),{name:''}) ], active:0 };
  }
  let DATA = defaults();

  function persist(toServer, saveBtn){
    DATA.active = Math.max(0, Math.min(DATA.active, DATA.projects.length-1));
    try{ localStorage.setItem(KEY, JSON.stringify(DATA)); }catch(_){}
    if(toServer){
      if(saveBtn){ saveBtn.disabled=true; saveBtn.textContent='Deploying…'; }
      fetch('/save-projects',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({slug:SLUG,data:DATA})})
        .then(r=>r.ok?r.json():null)
        .then(j=>{
          if(!j){ if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='💾 Save';} toast('💾 Saved on this device only'); return; }
          if(j.pushed && j.gitMsg!=='nothing to commit'){
            if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='✅ Deployed';}
            toast('✅ Saved & pushed to GitHub');
          } else if(j.pushed){
            if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='✅ Saved';}
            toast('✅ Saved (no changes to push)');
          } else {
            if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='⚠️ Save (deploy failed)';}
            toast('💾 Saved — push failed: '+j.gitMsg);
          }
          setTimeout(()=>{ if(saveBtn && saveBtn.textContent!=='💾 Save') saveBtn.textContent='💾 Save'; },4000);
        })
        .catch(()=> toast('💾 Saved on this device (server off)'));
    }
  }
  function load(){
    return fetch('/projects.json?t='+Date.now()).then(r=>r.ok?r.json():{}).catch(()=>({}))
      .then(store=>{
        if(store && store[SLUG]) DATA = normalize(store[SLUG]);
        else { try{ const ls=localStorage.getItem(KEY); if(ls) DATA=normalize(JSON.parse(ls)); }catch(_){} }
      });
  }
  function normalize(d){
    d=d||{}; d.brand=d.brand||{};
    BRAND_FIELDS.forEach(f=>{ if(d.brand[f[0]]==null) d.brand[f[0]]=''; });
    if(d.brand.summary==null) d.brand.summary='';
    if(d.brand.cover==null) d.brand.cover='';
    if(!d.brand.industry) d.brand.industry=industry;
    if(!Array.isArray(d.projects)||!d.projects.length) d.projects=[Object.assign(blankProject(),{name:''})];
    d.projects=d.projects.map(p=>{ const np=blankProject(); Object.assign(np,p);
      np.analytics=Object.assign({reach:'',duration:'',audience:''},p.analytics||{});
      if(!Array.isArray(np.chartData)||!np.chartData.length) np.chartData=blankProject().chartData;
      if(!Array.isArray(np.media)) np.media=[];
      // migrate old single-object format to array
      if(Array.isArray(p.vimeo)) np.vimeo=p.vimeo;
      else if(p.vimeo && p.vimeo.id) np.vimeo=[{id:p.vimeo.id,label:p.vimeo.label||'',orientation:p.vimeo.orientation||'horizontal'}];
      else np.vimeo=[];
      np.chartType=p.chartType==='pie'?'pie':'bar';
      return np; });
    d.active=d.active||0; return d;
  }

  // ---------- styles ----------
  const css = el('style');
  css.textContent = `
  #zz-proj{max-width:1100px;margin:0 auto;padding:40px 40px 8px;font-family:var(--font,'Inter',system-ui,sans-serif)}
  #zz-proj .zp-sl{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent,#f0c233);margin-bottom:8px}
  #zz-proj .zp-h{font-size:clamp(22px,3vw,34px);font-weight:900;letter-spacing:-1px;margin-bottom:18px}
  #zz-proj .zp-card{background:var(--s1,#16161a);border:1px solid var(--b,#2c2c33);border-radius:12px;padding:22px 24px;margin-bottom:22px}
  #zz-proj .zp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
  #zz-proj label{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--m2,#c2bcb2);margin-bottom:6px}
  #zz-proj input,#zz-proj textarea{width:100%;background:#0d0d0f;border:1px solid var(--b,#2c2c33);border-radius:8px;
    color:var(--text,#f4f2ed);font:500 14px var(--font,'Inter',sans-serif);padding:10px 12px;outline:none;transition:border-color .15s}
  #zz-proj input:focus,#zz-proj textarea:focus{border-color:var(--accent,#f0c233)}
  #zz-proj select{width:100%;background:#0d0d0f;border:1px solid var(--b,#2c2c33);border-radius:8px;color:var(--text,#f4f2ed);font:500 14px var(--font,'Inter',sans-serif);padding:10px 12px;outline:none;transition:border-color .15s;cursor:pointer;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:10px}
  #zz-proj select:focus{border-color:var(--accent,#f0c233)}
  #zz-proj textarea{min-height:90px;resize:vertical;line-height:1.6}
  #zz-proj .zp-full{grid-column:1/-1}
  #zz-proj .zp-tabs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
  #zz-proj .zp-tab{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:99px;cursor:pointer;
    font-size:12px;font-weight:700;border:1px solid var(--b,#2c2c33);background:transparent;color:var(--m2,#c2bcb2);transition:all .15s}
  #zz-proj .zp-tab:hover{border-color:var(--m2,#c2bcb2);color:var(--text,#f4f2ed)}
  #zz-proj .zp-tab.on{background:var(--accent,#f0c233);border-color:var(--accent,#f0c233);color:#000}
  #zz-proj .zp-add{background:transparent;border:1px dashed var(--accent,#f0c233);color:var(--accent,#f0c233);
    padding:9px 16px;border-radius:99px;font-size:12px;font-weight:700;cursor:pointer}
  #zz-proj .zp-mini{background:#2a2a30;color:#fff;border:none;border-radius:8px;padding:6px 10px;font:700 12px Inter,sans-serif;cursor:pointer}
  #zz-proj .zp-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;position:sticky;bottom:0;z-index:99;background:var(--bg,#080808);border-top:1px solid #2c2c33;padding:14px 0;margin-top:20px}
  #zz-proj .zp-save{background:var(--accent,#f0c233);color:#000;border:none;border-radius:8px;padding:11px 22px;
    font:700 12px var(--font,'Inter',sans-serif);letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
  #zz-proj .zp-del{background:transparent;border:1px solid #5a2330;color:#ff7a90;border-radius:8px;padding:11px 16px;font:700 12px var(--font);cursor:pointer}
  #zz-proj .zp-hint{font-size:11px;color:var(--m,#9a958c)}
  #zz-proj .zp-cover{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--b,#2c2c33);margin-bottom:22px;height:210px;background:linear-gradient(135deg,var(--accent,#f0c233),#0d0d0f)}
  #zz-proj .zp-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #zz-proj .zp-cover .zp-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),transparent 62%);display:flex;flex-direction:column;justify-content:flex-end;padding:18px 22px}
  #zz-proj .zp-cover-btn{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.7);border:1px solid #555;color:#fff;border-radius:99px;padding:7px 14px;font:700 12px Inter,sans-serif;cursor:pointer}
  #zz-proj .zp-seg{display:inline-flex;border:1px solid var(--b,#2c2c33);border-radius:99px;overflow:hidden}
  #zz-proj .zp-segbtn{background:transparent;color:var(--m2,#c2bcb2);border:none;padding:8px 16px;font:700 12px Inter,sans-serif;cursor:pointer}
  #zz-proj .zp-segbtn.on{background:var(--accent,#f0c233);color:#000}
  #zz-proj-toast{position:fixed;bottom:70px;right:18px;z-index:99999;background:var(--accent,#f0c233);color:#000;
    padding:10px 18px;border-radius:10px;font:700 13px Inter,sans-serif;opacity:0;transition:opacity .3s;pointer-events:none}
  #zz-proj-toast.show{opacity:1}`;
  document.head.appendChild(css);
  const toastEl = el('div'); toastEl.id='zz-proj-toast'; document.body.appendChild(toastEl);
  function toast(t){ toastEl.textContent=t; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>toastEl.classList.remove('show'),2200); }

  const root = el('div'); root.id='zz-proj';

  function field(tag,val,ph,on){
    const e=el(tag); e.value=val||''; if(ph)e.placeholder=ph;
    e.addEventListener('input',()=>{ on(e.value); persist(false); });
    return e;
  }
  function selectField(options,val,on){
    const e=el('select');
    options.forEach((opt,i)=>{ const o=el('option'); o.value=opt; o.textContent=i===0?'— select —':opt; if(opt===(val||''))o.selected=true; e.append(o); });
    e.addEventListener('change',()=>{ on(e.value); persist(false); });
    return e;
  }
  function labeled(text,e,full){ const w=el('div'); if(full)w.className='zp-full'; const l=el('label'); l.textContent=text; w.append(l,e); return w; }

  function coverBanner(getSrc,setSrc,title,subtitle){
    const w=el('div'); w.className='zp-cover';
    const src=getSrc();
    if(src){ const im=el('img'); im.src=absPath(src); w.append(im); }
    const ov=el('div'); ov.className='zp-ov';
    ov.innerHTML='<div style="font-size:24px;font-weight:900;letter-spacing:-.5px">'+esc(title)+'</div>'+(subtitle?'<div style="font-size:12px;color:#e4e4e4;margin-top:2px">'+esc(subtitle)+'</div>':'');
    const btn=el('button'); btn.className='zp-cover-btn'; btn.textContent=src?'🖼️ Change cover':'🖼️ Add cover photo';
    btn.onclick=()=>pick('image/*',f=>{ toast('Uploading…'); uploadFile(f).then(p=>{ setSrc(p); persist(true); render(); }).catch(()=>toast('Upload failed — is the server running?')); });
    w.append(ov,btn); return w;
  }

  function analyticsRow(p){
    const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Project Analytics</div><div style="font-size:18px;font-weight:800;margin-bottom:14px">By the numbers</div>';
    const grid=el('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px';
    [['reach','Achievement / Reach','e.g. 15M+ views'],['duration','Project Duration','e.g. 6 months'],['audience','Target Audience','e.g. Gen Z · GCC']].forEach(f=>{
      const c=el('div'); c.style.cssText='background:#0d0d0f;border:1px solid var(--b,#2c2c33);border-radius:10px;padding:14px';
      const lab=el('div'); lab.style.cssText='font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--m2,#c2bcb2);margin-bottom:8px'; lab.textContent=f[1];
      const inp=field('input',p.analytics[f[0]],f[2],v=>p.analytics[f[0]]=v);
      inp.style.background='transparent'; inp.style.border='none'; inp.style.padding='0'; inp.style.fontSize='19px'; inp.style.fontWeight='800';
      c.append(lab,inp); grid.append(c);
    });
    w.append(grid); return w;
  }

  function chartBlock(p){
    const w=el('div'); w.className='zp-card';
    const head=el('div'); head.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px;flex-wrap:wrap';
    head.innerHTML='<div><div class="zp-sl">Results</div><div style="font-size:18px;font-weight:800">Performance breakdown</div></div>';
    const seg=el('div'); seg.className='zp-seg';
    [['bar','▭ Bars'],['pie','◔ Pie']].forEach(([t,lbl])=>{ const b=el('button'); b.className='zp-segbtn'+(p.chartType===t?' on':''); b.textContent=lbl; b.onclick=()=>{ p.chartType=t; persist(false); render(); }; seg.append(b); });
    head.append(seg); w.append(head);

    const data=p.chartData||[];
    const total=data.reduce((s,d)=>s+(+d.value||0),0)||1;
    const viz=el('div'); viz.style.cssText='display:flex;gap:28px;flex-wrap:wrap;align-items:center';
    if(p.chartType==='pie'){
      let acc=0; const segs=data.map(d=>{ const a=acc, frac=(+d.value||0)/total*360; acc+=frac; return d.color+' '+a+'deg '+acc+'deg'; }).join(',');
      const pie=el('div'); pie.style.cssText='width:160px;height:160px;border-radius:50%;flex-shrink:0;background:conic-gradient('+(segs||'#333 0 360deg')+')';
      const leg=el('div'); leg.style.cssText='display:flex;flex-direction:column;gap:8px';
      data.forEach(d=>{ const it=el('div'); it.style.cssText='display:flex;align-items:center;gap:8px;font-size:13px;color:var(--m2,#c2bcb2)'; it.innerHTML='<span style="width:12px;height:12px;border-radius:3px;background:'+d.color+'"></span>'+esc(d.label)+' — <b style="color:var(--text,#f4f2ed)">'+esc(String(d.value))+'</b>'; leg.append(it); });
      viz.append(pie,leg);
    } else {
      const max=Math.max.apply(null,data.map(d=>+d.value||0).concat([1]));
      const bars=el('div'); bars.style.cssText='flex:1;min-width:260px;display:flex;flex-direction:column;gap:12px';
      data.forEach(d=>{ const row=el('div'); row.innerHTML='<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>'+esc(d.label)+'</span><span style="color:var(--accent,#f0c233);font-weight:700">'+esc(String(d.value))+'</span></div><div style="height:12px;background:#0d0d0f;border-radius:99px;overflow:hidden"><div style="height:100%;width:'+((+d.value||0)/max*100)+'%;background:'+d.color+';border-radius:99px;transition:width .5s"></div></div>'; bars.append(row); });
      viz.append(bars);
    }
    w.append(viz);

    // data editor
    const edt=el('div'); edt.style.cssText='margin-top:18px;border-top:1px solid var(--b,#2c2c33);padding-top:14px';
    edt.innerHTML='<div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--m2,#c2bcb2);margin-bottom:8px">Edit data</div>';
    data.forEach((d,i)=>{
      const row=el('div'); row.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:center';
      const lab=field('input',d.label,'Label',v=>d.label=v); lab.style.flex='2';
      const val=field('input',d.value,'Value',v=>d.value=v); val.type='number'; val.style.flex='1';
      const col=el('input'); col.type='color'; col.value=d.color||'#f0c233'; col.style.cssText='width:38px;height:38px;border:none;background:none;cursor:pointer;padding:0'; col.oninput=()=>{ d.color=col.value; persist(false); };
      const del=el('button'); del.className='zp-mini'; del.textContent='✕'; del.onclick=()=>{ data.splice(i,1); persist(false); render(); };
      row.append(lab,val,col,del); edt.append(row);
    });
    const addbar=el('div'); addbar.style.cssText='display:flex;gap:8px;margin-top:6px';
    const add=el('button'); add.className='zp-add'; add.textContent='＋ Add data point'; add.onclick=()=>{ (p.chartData=p.chartData||[]).push({label:'New',value:10,color:PALETTE[data.length%PALETTE.length]}); persist(false); render(); };
    const upd=el('button'); upd.className='zp-mini'; upd.textContent='↻ Update chart'; upd.onclick=()=>{ persist(false); render(); };
    addbar.append(add,upd); edt.append(addbar); w.append(edt);
    return w;
  }

  function vimeoEmbed(v){
    const url='https://player.vimeo.com/video/'+v.id+'?color=f0c233&title=0&byline=0&portrait=0&dnt=1';
    if(v.orientation==='vertical'){
      return '<div style="display:flex;justify-content:center;background:#000;padding:20px 0"><div style="width:min(320px,80%);aspect-ratio:9/16;position:relative"><iframe src="'+url+'" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></div></div>';
    }
    return '<div style="width:100%;aspect-ratio:16/9;position:relative;background:#000"><iframe src="'+url+'" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></div>';
  }

  function vimeoSection(p){
    if(!Array.isArray(p.vimeo)) p.vimeo=[];
    const vids=p.vimeo; const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Campaign Videos</div><div style="font-size:18px;font-weight:800;margin-bottom:14px">Vimeo</div>';

    // Preview: tabs if multiple, single if one
    const active=vids.filter(v=>v.id);
    if(active.length===1){
      const prev=el('div'); prev.style.marginBottom='14px';
      prev.innerHTML=vimeoEmbed(active[0]); w.append(prev);
    } else if(active.length>1){
      const tabBar=el('div'); tabBar.style.cssText='display:flex;border-bottom:1px solid #2c2c33;margin-bottom:0;background:#080808;border-radius:8px 8px 0 0;overflow:hidden';
      const panels=el('div'); panels.style.marginBottom='14px';
      active.forEach((v,i)=>{
        const tb=el('button'); tb.style.cssText='padding:8px 16px;background:none;border:none;border-bottom:2px solid '+(i===0?'#f0c233':'transparent')+';color:'+(i===0?'#f0c233':'#666')+';font-size:12px;font-weight:'+(i===0?'700':'400')+';cursor:pointer;font-family:inherit';
        tb.textContent=v.label||('Video '+(i+1));
        const pan=el('div'); pan.style.display=i===0?'block':'none'; pan.innerHTML=vimeoEmbed(v);
        tb.onclick=()=>{ tabBar.querySelectorAll('button').forEach((b,j)=>{ b.style.borderBottomColor=j===i?'#f0c233':'transparent'; b.style.color=j===i?'#f0c233':'#666'; b.style.fontWeight=j===i?'700':'400'; }); panels.querySelectorAll('div').forEach((d,j)=>d.style.display=j===i?'block':'none'); };
        tabBar.append(tb); panels.append(pan);
      });
      w.append(tabBar,panels);
    }

    // Editable rows
    const list=el('div'); list.style.cssText='display:flex;flex-direction:column;gap:8px';
    function addRow(v, idx){
      const row=el('div'); row.style.cssText='display:grid;grid-template-columns:1fr 1.5fr auto auto;gap:8px;align-items:center;background:#0d0d0f;border:1px solid #2c2c33;border-radius:8px;padding:10px';
      const idI=el('input'); idI.value=v.id||''; idI.placeholder='Vimeo ID'; idI.style.cssText='background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px;width:100%';
      idI.oninput=()=>{
        const raw=idI.value.trim();
        const m=raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)||raw.match(/^(\d+)$/);
        const id=m?m[1]:raw;
        if(id!==raw){ idI.value=id; }
        vids[idx].id=id; persist(false);
      };
      idI.onblur=()=>{ if(vids[idx].id) render(); };
      const lblI=el('input'); lblI.value=v.label||''; lblI.placeholder='Label (e.g. Hero TVC)'; lblI.style.cssText=idI.style.cssText;
      lblI.oninput=()=>{ vids[idx].label=lblI.value; persist(false); };
      const orSel=el('select'); orSel.style.cssText='background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px;cursor:pointer';
      [['horizontal','↔ H'],['vertical','↕ V']].forEach(([val,txt])=>{ const o=el('option'); o.value=val; o.textContent=txt; if((v.orientation||'horizontal')===val)o.selected=true; orSel.append(o); });
      orSel.onchange=()=>{ vids[idx].orientation=orSel.value; persist(false); render(); };
      const rm=el('button'); rm.textContent='✕'; rm.style.cssText='background:none;border:1px solid #3a3a44;border-radius:6px;color:#888;padding:8px 10px;cursor:pointer;font-size:13px';
      rm.onclick=()=>{ vids.splice(idx,1); persist(false); render(); };
      row.append(idI,lblI,orSel,rm); list.append(row);
    }
    vids.forEach((v,i)=>addRow(v,i));
    const addBtn=el('button'); addBtn.textContent='＋ Add Video'; addBtn.style.cssText='background:#0d0d0f;border:1px dashed #3a3a44;border-radius:8px;color:var(--gold,#f0c233);padding:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;width:100%';
    addBtn.onclick=()=>{ vids.push({id:'',label:'',orientation:'horizontal'}); persist(false); render(); };
    w.append(list,addBtn); return w;
  }

  function mediaGallery(p){
    const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Gallery</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Photos &amp; Videos</div><div class="zp-hint" style="margin-bottom:14px">The main event — drop the campaign films and stills here.</div>';
    const grid=el('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px';
    (p.media||[]).forEach((mm,i)=>{
      const cell=el('div'); cell.style.cssText='position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--b,#2c2c33);aspect-ratio:1/1;background:#0d0d0f';
      let me; if(mm.kind==='video'){ me=el('video'); me.src=absPath(mm.src); me.controls=true; } else { me=el('img'); me.src=absPath(mm.src); }
      me.style.cssText='width:100%;height:100%;object-fit:cover';
      const rm=el('button'); rm.className='zp-mini'; rm.textContent='✕'; rm.style.position='absolute'; rm.style.top='6px'; rm.style.right='6px';
      rm.onclick=()=>{ p.media.splice(i,1); persist(true); render(); };
      cell.append(me,rm); grid.append(cell);
    });
    if(!(p.media||[]).length){ const empty=el('div'); empty.style.cssText='color:var(--m,#9a958c);font-size:13px;padding:8px 0'; empty.textContent='No media yet — add the first photo or video below.'; w.append(empty); }
    w.append(grid);
    const bar=el('div'); bar.style.cssText='display:flex;gap:10px;margin-top:14px;flex-wrap:wrap';
    const addP=el('button'); addP.className='zp-add'; addP.textContent='＋ Add Photo'; addP.onclick=()=>pick('image/*',f=>{ toast('Uploading…'); uploadFile(f).then(pth=>{ (p.media=p.media||[]).push({kind:'img',src:pth}); persist(true); render(); }).catch(()=>toast('Upload failed — server off')); });
    const addV=el('button'); addV.className='zp-add'; addV.textContent='🎬 Add Video'; addV.onclick=()=>pick('video/*',f=>{ toast('Uploading…'); uploadFile(f).then(pth=>{ (p.media=p.media||[]).push({kind:'video',src:pth}); persist(true); render(); }).catch(()=>toast('Upload failed — server off')); });
    bar.append(addP,addV); w.append(bar); return w;
  }

  function renderBrand(){
    root.append(coverBanner(()=>DATA.brand.cover, v=>DATA.brand.cover=v, brandName, (DATA.brand.industry||'')+(DATA.brand.market?' · '+DATA.brand.market:'')));
    const sec=el('div'); sec.innerHTML='<p class="zp-sl">Brand Level</p><h2 class="zp-h">Brand Profile</h2>';
    const card=el('div'); card.className='zp-card'; const grid=el('div'); grid.className='zp-grid';
    BRAND_FIELDS.forEach(f=>{ const opts=BRAND_SELECTS[f[0]]; const e=opts?selectField(opts,DATA.brand[f[0]],v=>DATA.brand[f[0]]=v):field('input',DATA.brand[f[0]],f[2],v=>DATA.brand[f[0]]=v); grid.append(labeled(f[1],e)); });
    grid.append(labeled('Summary', field('textarea',DATA.brand.summary,'Short brand summary — who they are and what you did for them.',v=>DATA.brand.summary=v), true));
    card.append(grid); sec.append(card); root.append(sec);
  }

  function renderProjects(){
    const wrap=el('div');
    wrap.innerHTML='<p class="zp-sl">Projects</p><h2 class="zp-h">Work for '+esc(brandName)+'</h2>';
    const tabs=el('div'); tabs.className='zp-tabs';
    DATA.projects.forEach((p,i)=>{ const t=el('button'); t.className='zp-tab'+(i===DATA.active?' on':''); t.textContent=(p.name&&p.name.trim())?p.name:('Tab '+(i+1)); t.onclick=()=>{ DATA.active=i; persist(false); render(); }; tabs.append(t); });
    const add=el('button'); add.className='zp-add'; add.textContent='＋ Add Tab'; add.onclick=()=>{ DATA.projects.push(Object.assign(blankProject(),{name:''})); DATA.active=DATA.projects.length-1; persist(false); render(); };
    tabs.append(add); wrap.append(tabs);

    const p=DATA.projects[DATA.active];
    // project cover
    wrap.append(coverBanner(()=>p.cover, v=>p.cover=v, (p.name&&p.name.trim())?p.name:'This project', [p.type,p.date].filter(Boolean).join(' · ')));
    // template fields
    const card=el('div'); card.className='zp-card'; const grid=el('div'); grid.className='zp-grid';
    PROJ_FIELDS.forEach(f=>{ const opts=PROJ_SELECTS[f[0]]; const e=opts?selectField(opts,p[f[0]],v=>p[f[0]]=v):field('input',p[f[0]],f[2],v=>p[f[0]]=v); grid.append(labeled(f[1],e)); });
    grid.append(labeled('Description', field('textarea',p.desc,'What was the brief, what did you make, what was the result?',v=>p.desc=v), true));
    card.append(grid); wrap.append(card);
    // gallery first so it's immediately visible, then analytics
    wrap.append(vimeoSection(p));
    wrap.append(mediaGallery(p));
    wrap.append(analyticsRow(p));
    wrap.append(chartBlock(p));
    // actions
    const bar=el('div'); bar.className='zp-bar';
    const save=el('button'); save.className='zp-save'; save.textContent='💾 Save & Deploy'; save.onclick=()=>persist(true, save); bar.append(save);
    if(DATA.projects.length>1){ const del=el('button'); del.className='zp-del'; del.textContent='Delete this tab'; del.onclick=()=>{ if(!confirm('Delete "'+(p.name||('Tab '+(DATA.active+1)))+'"?'))return; DATA.projects.splice(DATA.active,1); DATA.active=Math.max(0,DATA.active-1); persist(true, save); render(); }; bar.append(del); }
    const hint=el('span'); hint.className='zp-hint'; hint.textContent='Saves & pushes directly to GitHub Pages.'; bar.append(hint);
    wrap.append(bar); root.append(wrap);
  }

  function render(){ root.innerHTML=''; renderBrand(); renderProjects(); }
  function mount(){
    if(!root.parentNode){
      const hero=document.querySelector('.hero')||document.querySelector('nav');
      if(hero&&hero.parentNode) hero.parentNode.insertBefore(root, hero.nextSibling);
      else document.body.insertBefore(root, document.body.firstChild);
    }
    render();
  }
  function boot(){ mount(); load().then(()=>{ if(root.parentNode) render(); }); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
