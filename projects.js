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
  const AGENCY_OPTS  = ['','Tonic International','Nineteen84 Management','Al Siddiqi Holding','Eldib Co.','Mansour Group','CAPA','Freelance / Direct','Other'];
  const PROJ_SELECTS = {type:PROJ_TYPES, role:PROJ_ROLES, status:PROJ_STATUS, date:YEARS_FULL, agency:AGENCY_OPTS};
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
    ['website','Brand Website','e.g. https://brand.com'],
  ];
  const DELIV_TYPES   = ['TVC','Social Media','Campaign','Photography','OOH','Branding','Strategy','AI Production','Events','PR','Copy','Music','Film'];
  const SOCIAL_PLATFORMS = ['Instagram','TikTok','Facebook','YouTube','Snapchat','X / Twitter','LinkedIn','WhatsApp','Pinterest','Threads'];
  const SOCIAL_KEYS = ['instagram','tiktok','facebook','youtube','x','linkedin','snapchat','whatsapp','pinterest','threads'];
  const SOCIAL_META = {
    instagram:{label:'Instagram', color:'#E1306C', bg:'#1a0a10', prefix:'@', url:h=>'https://instagram.com/'+h},
    tiktok:   {label:'TikTok',    color:'#69C9D0', bg:'#091314', prefix:'@', url:h=>'https://tiktok.com/@'+h},
    facebook: {label:'Facebook',  color:'#1877F2', bg:'#080f1f', prefix:'',  url:h=>'https://facebook.com/'+h},
    youtube:  {label:'YouTube',   color:'#FF0000', bg:'#1a0000', prefix:'@', url:h=>'https://youtube.com/@'+h},
    x:        {label:'X',         color:'#f4f2ed', bg:'#111',    prefix:'@', url:h=>'https://x.com/'+h},
    linkedin: {label:'LinkedIn',  color:'#0A66C2', bg:'#080f1a', prefix:'',  url:h=>'https://linkedin.com/company/'+h},
    snapchat: {label:'Snapchat',  color:'#FFFC00', bg:'#131300', prefix:'@', url:h=>'https://snapchat.com/add/'+h},
    whatsapp: {label:'WhatsApp',  color:'#25D366', bg:'#061209', prefix:'',  url:h=>'https://wa.me/'+h},
    pinterest:{label:'Pinterest', color:'#E60023', bg:'#1a0000', prefix:'@', url:h=>'https://pinterest.com/'+h},
    threads:  {label:'Threads',   color:'#f4f2ed', bg:'#111',    prefix:'@', url:h=>'https://threads.net/@'+h},
  };
  const SOCIAL_ABBR = {instagram:'IG',tiktok:'TK',facebook:'FB',youtube:'YT',x:'X',linkedin:'in',snapchat:'SC',whatsapp:'WA',pinterest:'PT',threads:'TH'};
  const KNOWN_HANDLES = {
    'Kappa':             {instagram:'kappaofficial',facebook:'kappa',x:'kappasport'},
    'Subway-Oman':       {instagram:'subwayoman',facebook:'SubwayOman',x:'SubwayOman'},
    'EA-FC-Mobile':      {instagram:'easportsfcmobile',tiktok:'easports',x:'EASPORTSFCMobile',youtube:'EASPORTSFCMobile',facebook:'easportsfcmobile'},
    'Geely':             {instagram:'geelyauto',x:'GeelyGlobal',youtube:'GeelyAutoOfficial',facebook:'GeelyAuto',linkedin:'geely'},
    'Snapchat':          {instagram:'snapchat',tiktok:'snapchat',x:'Snapchat',youtube:'Snapchat',facebook:'Snapchat'},
    'Bazooka-Candy':     {instagram:'bazookacandy',facebook:'bazookacandy',x:'bazookacandy'},
    'AXE-Unilever':      {instagram:'axeofficial',tiktok:'axe',x:'AXEbodyspray',facebook:'Axe',youtube:'axe'},
    'Bershka':           {instagram:'bershka',tiktok:'bershka',x:'bershka',facebook:'Bershka',youtube:'bershka',pinterest:'bershka'},
    'Krispy-Kreme':      {instagram:'krispykreme',tiktok:'krispykreme',x:'krispykreme',facebook:'krispykreme',youtube:'KrispyKreme'},
    'Audi':              {instagram:'audi',tiktok:'audi',x:'audi',facebook:'Audi',youtube:'audi',linkedin:'audi'},
    'Polo-Ralph-Lauren': {instagram:'ralphlauren',tiktok:'ralphlauren',x:'RalphLauren',facebook:'RalphLauren',youtube:'ralphlauren',pinterest:'ralphlauren'},
    'Gillette-Venus':    {instagram:'gillettevenus',tiktok:'gillettevenus',x:'GilletteVenus',facebook:'GilletteVenus',youtube:'GilletteVenus'},
    'Hardees':           {instagram:'hardeesarabia',facebook:'HardeesMiddleEast',x:'HardeesArabia'},
    'Molfix':            {instagram:'molfix_official',facebook:'Molfix',youtube:'MolfixOfficial'},
    'Mayo-Clinic':       {instagram:'mayoclinic',tiktok:'mayoclinic',x:'MayoClinic',facebook:'MayoClinic',youtube:'MayoClinic',linkedin:'mayo-clinic'},
    'Quooker':           {instagram:'quooker',tiktok:'quooker',x:'QuookerHQ',facebook:'Quooker',youtube:'quooker'},
    'Zooba':             {instagram:'zooba_egy',tiktok:'zooba_egy',facebook:'zooba',x:'zooba_egy'},
    'Biella':            {instagram:'biellarestaurants',facebook:'BiellaRestaurants'},
    'El-Gouna':          {instagram:'elgouna',facebook:'ElGounaTownship',x:'elgouna'},
    'Bibliotheca-Alexandrina':{instagram:'bibliotheca.alexandrina',facebook:'LibraryofAlexandria',x:'Bibalex',youtube:'BibalexTV'},
    'Em-Sherif-Cafe':    {instagram:'emsherifcafe',facebook:'EmSherifCafe'},
    'Hayat-Water':       {instagram:'hayatwater',facebook:'HayatWater'},
    'Ring-Pop':          {instagram:'ringpop',facebook:'RingPop',x:'ringpop'},
    'Juicy-Drop':        {instagram:'juicydrop',facebook:'JuicyDrop'},
    'Burger-Pump':       {instagram:'burgerpump_eg'},
    'Warba-Bank':        {instagram:'warbabank',facebook:'WarbaBankKuwait',x:'WarbaBank'},
    'One-Zaabeel':       {instagram:'onezaabeel',facebook:'OneZaabeel'},
    'Decoys-Real-Estate':{instagram:'derayaeg',facebook:'DerayaRealEstate'},
    'Gourmet':           {instagram:'gourmetegypt',facebook:'GourmetEgypt'},
    'Revitalash':        {instagram:'revitalash',facebook:'RevitaLash',x:'RevitaLash'},
    'Almaza-Bay':        {instagram:'almazabay',facebook:'AlmazaBay'},
    'Noodle-House':      {instagram:'noodlehousedubai',facebook:'NoodleHouseGroup'},
    'Carina':            {instagram:'carinafashion',facebook:'CarinaME'},
    'Emirgan-Sutis':     {instagram:'emirgansutis',facebook:'EmirganSutis'},
    'Al-Siddiqi-Holding':{instagram:'alsiddiqiholding',facebook:'AlSiddiqiHolding',linkedin:'al-siddiqi-holding'},
    'Tonic-International':{instagram:'tonicintl',linkedin:'tonic-international'},
    'Mansour':           {instagram:'mansourgroup',facebook:'MansourGroup',linkedin:'mansour-group'},
    'ACUD':              {instagram:'acud_egypt',facebook:'ACUDEgypt'},
    'Mooz':              {instagram:'mooz.eg',facebook:'MoozEgypt'},
    'GDK':               {instagram:'gdk_kuwait',facebook:'GDKq8'},
    'Royal-Tulip-Hotel': {instagram:'royaltuliphotel',facebook:'RoyalTulipHotel'},
    'Royal-Herbs':       {instagram:'royalherbs_eg',facebook:'RoyalHerbsEgypt'},
    'Deraya':            {instagram:'derayaeg',facebook:'DerayaRealEstate',linkedin:'deraya-real-estate'},
    'Deraya-Real-Estate':{instagram:'derayaeg',facebook:'DerayaRealEstate',linkedin:'deraya-real-estate'},
    'The-Recovery-Clinic':{instagram:'therecoveryclinic',facebook:'TheRecoveryClinic',linkedin:'the-recovery-clinic'},
    'Chouchou':          {instagram:'chouchoueg',facebook:'ChouchouEgypt'},
    'Lifebox':           {instagram:'lifeboxme',facebook:'LifeboxME'},
    'Big-Baby-Pop':      {instagram:'bigbabypop',facebook:'BigBabyPop'},
    'Mostique':          {instagram:'mostique.eg',facebook:'Mostique'},
    'MTM':               {instagram:'mtm_egypt',facebook:'MTMEgypt'},
    'Fujifilm':          {instagram:'fujifilmme',facebook:'FujifilmMiddleEast',x:'FujifilmME',youtube:'FujifilmGlobal'},
    'Lord-of-the-Wings': {instagram:'lordofthewings',facebook:'LordoftheWings'},
    'Brew-Craft':        {instagram:'brewcraft.eg',facebook:'BrewCraftEgypt'},
    'No-Limits-Furniture':{instagram:'nolimitsfurniture',facebook:'NoLimitsFurniture'},
    'Bonny':             {instagram:'bonnyfoods',facebook:'BonnyFoods'},
    'Imagine-Studio':    {instagram:'imaginestudio.eg',facebook:'ImagineStudioEgypt'},
    'URBEELS':           {instagram:'urbeels',facebook:'URBEELS'},
    'WallPost':          {instagram:'wallpost.eg',facebook:'WallPost'},
    'Escapegoat-Sound':  {instagram:'escapegoatsound',facebook:'EscapegoatSound'},
    'Bohobun':           {instagram:'bohobun.eg',facebook:'Bohobun'},
    'Delight-Pastries':  {instagram:'delightpastry',facebook:'DelightPastry'},
    'Delight-Parties':   {instagram:'delightparties',facebook:'DelightParties'},
    'Blue-Ocean-Sharm':  {instagram:'blueoceansharm',facebook:'BlueOceanSharm'},
    'Carzami':           {instagram:'carzami',facebook:'Carzami'},
    'Eldib-Co':          {instagram:'eldibco',linkedin:'eldib-co'},
    'Steam-Cola':        {instagram:'steamcola',facebook:'SteamCola'},
    'Labanita':          {instagram:'labanitaeg',facebook:'LabanitaEgypt'},
    'BIC-WNA':           {instagram:'bicwna',facebook:'BICWestNorthAfrica'},
    'Glow':              {instagram:'gloweg',facebook:'GlowEgypt'},
    'CAPA':              {instagram:'capa.eg',facebook:'CAPAEgypt'},
    'Nineteen84':        {instagram:'nineteen84.eg',facebook:'Nineteen84Egypt'},
    'The-Center':        {instagram:'thecentercairo',facebook:'TheCenterCairo'},
    'The-G-Hotels':      {instagram:'theghotels',facebook:'TheGHotels'},
    'Medina':            {instagram:'medinabrands',facebook:'MedinaBrands'},
    'Juicy-Drop-Arabia': {instagram:'juicydrop',facebook:'JuicyDrop'},
    'Memaar-Al-Morshedy':{instagram:'memaaralmorshedy',facebook:'MemaarAlMorshedy',linkedin:'memaar-almorshedy'},
  };
  const PROJ_FIELDS = [
    ['name','Project Name','e.g. Ramadan 2024 Campaign'],
    ['client','Client', brandName],
    ['date','Year',''],
    ['role','Your Role',''],
    ['agency','Agency',''],
    ['status','Status',''],
    ['deliverables','Deliverables','e.g. 3 TVCs · 20 posts · KV'],
  ];
  function blankProject(){
    const p={}; PROJ_FIELDS.forEach(f=>p[f[0]]=''); p.client=brandName; p.desc='';
    p.cover=''; p.analytics={reach:'',duration:'',audience:''}; p.chartType='bar';
    p.chartData=[{label:'Reach',value:60,color:PALETTE[0]},{label:'Engagement',value:25,color:PALETTE[1]},{label:'Conversion',value:15,color:PALETTE[2]}];
    p.media=[]; p.vimeo=[]; p.types=[]; p.platforms=[]; p.articles=[]; p.briefs=[]; return p;
  }
  function defaults(){
    const b={}; BRAND_FIELDS.forEach(f=>b[f[0]]=''); b.industry=industry; b.summary=''; b.cover=''; b.logo=''; b.socials={};
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
    return fetch('../../projects.json'+(EDIT_MODE?'?t='+Date.now():'')).then(r=>r.ok?r.json():{}).catch(()=>({}))
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
    if(d.brand.logo==null) d.brand.logo='';
    if(!d.brand.socials || typeof d.brand.socials!=='object') d.brand.socials={};
    SOCIAL_KEYS.forEach(k=>{ if(d.brand.socials[k]==null) d.brand.socials[k]=''; });
    const known=KNOWN_HANDLES[SLUG]||{}; Object.entries(known).forEach(([k,v])=>{ if(!d.brand.socials[k]) d.brand.socials[k]=v; });
    if(!d.brand.industry) d.brand.industry=industry;
    if(!Array.isArray(d.projects)||!d.projects.length) d.projects=[Object.assign(blankProject(),{name:''})];
    d.projects=d.projects.map(p=>{ const np=blankProject(); Object.assign(np,p);
      np.analytics=Object.assign({reach:'',duration:'',audience:''},p.analytics||{});
      if(!Array.isArray(np.chartData)||!np.chartData.length) np.chartData=blankProject().chartData;
      if(!Array.isArray(np.media)) np.media=[];
      if(!Array.isArray(np.articles)) np.articles=[];
      // Normalize old {text,url,date} article format to new {body,link} format
      np.articles=np.articles.map(a=>a.body!==undefined?a:{title:a.title||'',body:a.text||'',link:a.url||a.link||'',socialUrl:a.socialUrl||'',socialPlatform:a.socialPlatform||'',date:a.date||''});
      if(!Array.isArray(np.briefs)) np.briefs=[];
      // migrate old single-object format to array
      if(Array.isArray(p.vimeo)) np.vimeo=p.vimeo;
      else if(p.vimeo && p.vimeo.id) np.vimeo=[{id:p.vimeo.id,label:p.vimeo.label||'',orientation:p.vimeo.orientation||'horizontal',source:'vimeo'}];
      else np.vimeo=[];
      // ensure source field on all vimeo entries (backward compat)
      np.vimeo=np.vimeo.map(v=>v.source?v:{...v,source:'vimeo'});
      np.types = Array.isArray(p.types) ? p.types : (p.type ? [p.type] : []);
      np.platforms = Array.isArray(p.platforms) ? p.platforms : [];
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
  #zz-proj .zp-chip{padding:6px 14px;border-radius:99px;font-size:12px;font-weight:600;border:1px solid var(--b,#2c2c33);background:transparent;color:var(--m2,#c2bcb2);cursor:pointer;transition:all .15s;font-family:inherit}
  #zz-proj .zp-chip:hover{border-color:var(--m2,#c2bcb2);color:var(--text,#f4f2ed)}
  #zz-proj .zp-chip.on{background:var(--accent,#f0c233);border-color:var(--accent,#f0c233);color:#000}
  #zz-proj .zp-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
  #zz-proj-toast{position:fixed;bottom:70px;right:18px;z-index:99999;background:var(--accent,#f0c233);color:#000;
    padding:10px 18px;border-radius:10px;font:700 13px Inter,sans-serif;opacity:0;transition:opacity .3s;pointer-events:none}
  #zz-proj-toast.show{opacity:1}
  /* ── Edit Mode Banner ───────────────────────────────── */
  #zz-edit-banner{background:#f0c233;color:#000;padding:9px 20px;border-radius:10px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  #zz-edit-banner .zeb-left{display:flex;align-items:center;gap:10px}
  #zz-edit-banner .zeb-icon{font-size:18px;flex-shrink:0}
  #zz-edit-banner .zeb-title{font:800 12px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase}
  #zz-edit-banner .zeb-sub{font:500 11px Inter,sans-serif;opacity:.65;margin-top:1px}
  #zz-edit-banner .zeb-badge{font:700 11px Inter,sans-serif;padding:5px 14px;background:rgba(0,0,0,.14);border-radius:6px;flex-shrink:0;white-space:nowrap}
  /* ── X / Twitter Post Cards ─────────────────────────── */
  .zz-feed{display:flex;flex-direction:column;gap:1px;border:1px solid #1e1e2a;border-radius:16px;overflow:hidden;max-width:600px}
  .zz-tweet{background:#080810;padding:18px 20px;border-bottom:1px solid #111118;transition:background .15s;cursor:default}
  .zz-tweet:last-child{border-bottom:none}
  .zz-tweet:hover{background:#0c0c18}
  .zz-tweet-hd{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
  .zz-tweet-av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f0c233,#e85d4a);flex-shrink:0;display:flex;align-items:center;justify-content:center;font:900 15px Inter,sans-serif;color:#000;overflow:hidden}
  .zz-tweet-av img{width:100%;height:100%;object-fit:cover}
  .zz-tweet-meta{flex:1;min-width:0}
  .zz-tweet-name{font:700 14px Inter,sans-serif;color:#f4f2ed;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .zz-tweet-handle{font:400 13px Inter,sans-serif;color:#555565;line-height:1.4}
  .zz-tweet-xlogo{font:900 16px Inter,sans-serif;color:#e8e6e1;flex-shrink:0;margin-top:2px}
  .zz-tweet-body{font:400 15px/1.65 Inter,sans-serif;color:#e8e6e1;white-space:pre-wrap;word-break:break-word;margin-bottom:14px}
  .zz-tweet-title{font:700 15px/1.3 Inter,sans-serif;color:#f4f2ed;margin-bottom:6px}
  .zz-tweet-link{display:block;border:1px solid #1e1e2a;border-radius:12px;padding:10px 14px;margin-bottom:14px;text-decoration:none;background:#0c0c18;font:500 12px Inter,sans-serif;color:#5a8fee;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:border-color .15s}
  .zz-tweet-link:hover{border-color:#2c2c3a}
  .zz-tweet-eng{display:flex;gap:24px;padding-top:12px;border-top:1px solid #111118}
  .zz-tweet-btn{display:flex;align-items:center;gap:6px;font:400 13px Inter,sans-serif;color:#42424e;cursor:default;transition:color .15s}
  .zz-tweet-btn:hover{color:#7878a8}
  /* ── Viewer Gallery ──────────────────────────────────── */
  .zz-gallery-section{padding:72px 0;border-bottom:1px solid var(--b,#2c2c33)}
  .zz-gallery-section .c{max-width:1100px;margin:0 auto;padding:0 40px}
  @media(max-width:800px){.zz-gallery-section .c{padding:0 20px}}
  /* Artistic masonry grid */
  .zz-art-grid{columns:3 220px;column-gap:6px;margin-bottom:8px}
  @media(max-width:700px){.zz-art-grid{columns:2}}
  @media(max-width:420px){.zz-art-grid{columns:1}}
  .zz-art-item{break-inside:avoid;display:inline-block;width:100%;margin-bottom:6px;cursor:pointer;border-radius:8px;overflow:hidden;background:#111;vertical-align:top;transition:opacity .2s}
  .zz-art-item:hover{opacity:.92}
  .zz-art-mwrap{position:relative;overflow:hidden}
  .zz-art-mwrap img{width:100%;height:auto;display:block;transition:transform .4s ease}
  .zz-art-mwrap.vid{aspect-ratio:16/9;position:relative}
  .zz-art-mwrap.vid video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease}
  .zz-art-item:hover .zz-art-mwrap img,.zz-art-item:hover .zz-art-mwrap.vid video{transform:scale(1.04)}
  .zz-art-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.12);pointer-events:none}
  .zz-art-play span{width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.62);border:2px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff}
  .zz-art-cap{padding:10px 12px 12px;font-size:12px;line-height:1.6;color:var(--m,#9a958c);background:#0d0d10;border-top:1px solid #181820}
  /* ── Lightbox ────────────────────────────────────────── */
  #zz-lb{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}
  #zz-lb.open{opacity:1;pointer-events:all}
  #zz-lb .zz-lb-wrap{position:relative;max-width:min(90vw,1200px);max-height:80vh;display:flex;align-items:center;justify-content:center}
  #zz-lb .zz-lb-wrap img,#zz-lb .zz-lb-wrap video{max-width:100%;max-height:80vh;object-fit:contain;border-radius:6px}
  #zz-lb .zz-lb-arrow{position:fixed;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;transition:background .15s}
  #zz-lb .zz-lb-arrow:hover{background:rgba(255,255,255,.22)}
  #zz-lb .zz-lb-arrow.prev{left:16px}
  #zz-lb .zz-lb-arrow.next{right:16px}
  #zz-lb .zz-lb-close{position:fixed;top:16px;right:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}
  #zz-lb .zz-lb-counter{position:fixed;top:16px;left:50%;transform:translateX(-50%);font:700 12px Inter,sans-serif;color:rgba(255,255,255,.7);letter-spacing:.1em;background:rgba(0,0,0,.5);padding:5px 14px;border-radius:99px}
  #zz-lb .zz-lb-strip{position:fixed;bottom:0;left:0;right:0;display:flex;gap:6px;padding:12px;overflow-x:auto;background:rgba(0,0,0,.6);justify-content:center}
  #zz-lb .zz-lb-dot{width:40px;height:40px;border-radius:4px;overflow:hidden;cursor:pointer;flex-shrink:0;opacity:.5;transition:opacity .15s;border:2px solid transparent}
  #zz-lb .zz-lb-dot.on{opacity:1;border-color:var(--accent,#f0c233)}
  #zz-lb .zz-lb-dot img{width:100%;height:100%;object-fit:cover}
  /* ── Edit gallery grid ──────────────────────────────── */
  .zz-edit-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
  .zz-edit-cell{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--b,#2c2c33);background:#0d0d0f;display:flex;flex-direction:column}
  .zz-edit-thumb{position:relative;aspect-ratio:4/3;overflow:hidden;flex-shrink:0}
  .zz-edit-thumb img,.zz-edit-thumb video{width:100%;height:100%;object-fit:cover;display:block}
  .zz-edit-cell .zz-rm{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.82);color:#fff;border:1px solid #555;border-radius:6px;padding:4px 8px;font:700 11px Inter,sans-serif;cursor:pointer;z-index:2}
  .zz-edit-cell .zz-idx{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.82);color:rgba(255,255,255,.6);border-radius:4px;padding:3px 6px;font:700 10px Inter,sans-serif;z-index:2}
  .zz-edit-cap{padding:8px 10px;background:#0d0d0f;border-top:1px solid #1c1c22;flex:1}
  .zz-edit-cap textarea{width:100%;background:transparent;border:none;color:#c2bcb2;font:400 11px/1.5 Inter,sans-serif;outline:none;padding:0;resize:none;min-height:44px}
  .zz-edit-cap textarea::placeholder{color:#3d3d44}
  /* ── Carousel ────────────────────────────────────────── */
  .zz-carousel-wrap{margin-bottom:14px}
  .zz-carousel{position:relative;overflow:hidden;border-radius:14px;background:#111;border:1px solid var(--b,#2c2c33)}
  .zz-car-track{display:flex;transition:transform .45s cubic-bezier(.22,1,.36,1);will-change:transform}
  .zz-car-slide{flex:0 0 100%;position:relative;overflow:hidden;cursor:pointer;background:#000}
  .zz-car-slide img,.zz-car-slide video{width:100%;height:100%;object-fit:contain;display:block}
  .zz-car-cap{position:absolute;bottom:0;left:0;right:0;padding:18px 22px;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);color:#fff;font-size:13px;line-height:1.5;pointer-events:none}
  .zz-car-btn{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(0,0,0,.58);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;transition:background .15s;line-height:1;padding:0}
  .zz-car-btn:hover{background:rgba(0,0,0,.85)}
  .zz-car-btn.prev{left:13px}.zz-car-btn.next{right:13px}
  .zz-car-dots{display:flex;justify-content:center;gap:5px;margin-top:9px;flex-wrap:wrap}
  .zz-car-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);cursor:pointer;transition:all .2s;flex-shrink:0;border:none;padding:0}
  .zz-car-dot.on{width:20px;border-radius:3px;background:var(--accent,#f0c233)}
  .zz-car-ctr{position:absolute;top:12px;right:14px;background:rgba(0,0,0,.55);color:rgba(255,255,255,.8);font:700 11px Inter,sans-serif;padding:4px 10px;border-radius:99px;z-index:3;letter-spacing:.06em}
  /* Thumbnails below carousel */
  .zz-car-thumbs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-top:9px;scrollbar-width:none}
  .zz-car-thumbs::-webkit-scrollbar{display:none}
  .zz-car-thumb{width:52px;height:52px;border-radius:6px;overflow:hidden;flex-shrink:0;cursor:pointer;opacity:.5;transition:opacity .2s;border:2px solid transparent}
  .zz-car-thumb.on{opacity:1;border-color:var(--accent,#f0c233)}
  .zz-car-thumb img,.zz-car-thumb video{width:100%;height:100%;object-fit:cover;display:block}`;
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

  const PROCESS_PRESETS = {
    'Social Media':   [{title:'Brief & Strategy',desc:'Aligned brand objectives, audience insights, and content pillars.'},{title:'Content Production',desc:'Wrote copy, developed visual direction, and produced all assets.'},{title:'Scheduling & Publishing',desc:'Planned the content calendar and published across platforms.'},{title:'Community & Reporting',desc:'Managed comments, tracked performance, and reported results.'}],
    'TVC / Video':    [{title:'Brief & Strategy',desc:'Defined the creative brief, campaign goals, and audience.'},{title:'Concept & Scripting',desc:'Developed the big idea, wrote the script and visual direction.'},{title:'Production',desc:'Directed and produced the shoot — crew, talent, and locations.'},{title:'Post-Production',desc:'Edited, coloured, mixed, and delivered the final cut.'}],
    'Branding':       [{title:'Discovery',desc:'Researched the market, competitors, and brand positioning.'},{title:'Brand Strategy',desc:'Defined the brand voice, values, and visual DNA.'},{title:'Identity Design',desc:'Designed the logo, colour system, typography, and assets.'},{title:'Brand Guidelines',desc:'Packaged all elements into a comprehensive brand guide.'}],
    'Copywriting':    [{title:'Brief & Research',desc:'Understood the audience, tone, and campaign objectives.'},{title:'Concept & Draft',desc:'Developed the creative concept and wrote the first drafts.'},{title:'Refinement',desc:'Iterated based on feedback and refined every word.'},{title:'Final Delivery',desc:'Delivered polished copy across all required formats.'}],
    'BTL / Activation':[{title:'Brief & Objectives',desc:'Defined goals, audience, and activation mechanics.'},{title:'Concept & Design',desc:'Developed the creative concept, visuals, and messaging.'},{title:'Production',desc:'Produced all materials — POS, signage, and print assets.'},{title:'Execution & Reporting',desc:'Executed on-ground and measured results against KPIs.'}],
    'Photography':    [{title:'Brief & Art Direction',desc:'Defined the visual mood, references, and shot list.'},{title:'Pre-Production',desc:'Sourced talent, locations, props, and styling.'},{title:'Shoot Day',desc:'Directed and shot all content on location.'},{title:'Post-Production',desc:'Edited, retouched, and delivered the final images.'}],
    'Web Design':     [{title:'Discovery & Brief',desc:'Mapped the user journey, goals, and sitemap.'},{title:'Wireframes & UX',desc:'Designed the structure, flows, and interaction model.'},{title:'Visual Design',desc:'Applied the brand identity across all pages.'},{title:'Launch & Handoff',desc:'Built, tested, and delivered the final product.'}],
    'Campaign':       [{title:'Brief & Strategy',desc:'Defined campaign goals, audience, and creative approach.'},{title:'Creative Development',desc:'Concepted the big idea and developed all creative assets.'},{title:'Production',desc:'Produced and finalised all campaign deliverables.'},{title:'Launch & Reporting',desc:'Launched across channels and reported on performance.'}],
  };

  function processSection(p){
    p.process = p.process || [];
    const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Process</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">How It Came Together</div><div class="zp-hint" style="margin-bottom:14px">Choose a preset or build your own steps.</div>';

    const presetRow=el('div'); presetRow.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px';
    Object.keys(PROCESS_PRESETS).forEach(key=>{
      const b=el('button'); b.className='zp-add'; b.style.cssText='font-size:11px;padding:5px 12px';
      b.textContent=key;
      b.onclick=()=>{ p.process=PROCESS_PRESETS[key].map(s=>({...s})); persist(false); render(); };
      presetRow.append(b);
    });
    w.append(presetRow);

    const list=el('div'); list.style.cssText='display:flex;flex-direction:column;gap:10px';
    (p.process).forEach((s,i)=>{
      const row=el('div'); row.style.cssText='display:grid;grid-template-columns:1fr 2fr auto;gap:8px;align-items:start';
      const t=field('input',s.title,'Step title',v=>s.title=v);
      const d=field('input',s.desc,'Description',v=>s.desc=v);
      const del=el('button'); del.className='zp-mini'; del.textContent='✕'; del.style.marginTop='2px';
      del.onclick=()=>{ p.process.splice(i,1); persist(false); render(); };
      row.append(t,d,del); list.append(row);
    });
    w.append(list);
    const addStep=el('button'); addStep.className='zp-add'; addStep.textContent='＋ Add Step'; addStep.style.marginTop='10px';
    addStep.onclick=()=>{ p.process.push({title:'',desc:''}); persist(false); render(); };
    w.append(addStep);
    return w;
  }

  function reportsSection(p){
    function canvaEmbed(url){const m=url.match(/canva\.com\/design\/([^/?]+)/);return m?'https://www.canva.com/design/'+m[1]+'/view?embed':'';}
    const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Reports</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Campaign Report</div><div class="zp-hint" style="margin-bottom:14px">Paste a Canva report link — shows as a full embed on the brand page.</div>';
    const urlI=el('input'); urlI.value=p.reportUrl||''; urlI.placeholder='https://www.canva.com/design/...';
    urlI.style.cssText='width:100%;background:#0d0d0f;border:1px solid var(--b,#2c2c33);border-radius:8px;color:var(--text,#f4f2ed);font:500 14px Inter,sans-serif;padding:10px 12px;outline:none;margin-bottom:8px;box-sizing:border-box';
    const badge=el('div'); badge.style.cssText='font-size:11px;margin-bottom:12px';
    function refresh(){ const ok=canvaEmbed(urlI.value.trim()); badge.style.color=ok?'#f0c233':'#888'; badge.textContent=ok?'↳ Canva report detected':(urlI.value?'↳ Not a valid Canva link':''); }
    urlI.oninput=()=>{ p.reportUrl=urlI.value.trim(); refresh(); persist(false); }; refresh();
    if(p.reportUrl&&canvaEmbed(p.reportUrl)){
      const prev=el('div'); prev.style.cssText='position:relative;width:100%;padding-top:56%;border-radius:8px;overflow:hidden;border:1px solid var(--b,#2c2c33)';
      const ifr=el('iframe'); ifr.src=canvaEmbed(p.reportUrl); ifr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none'; ifr.allowFullscreen=true;
      prev.append(ifr); w.append(urlI,badge,prev);
    } else { w.append(urlI,badge); }
    return w;
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

  function chipPicker(options, selected, onChange){
    const w=el('div'); w.className='zp-chips';
    options.forEach(opt=>{
      const c=el('button'); c.type='button'; c.className='zp-chip'+(selected.includes(opt)?' on':''); c.textContent=opt;
      c.onclick=()=>{
        const i=selected.indexOf(opt);
        if(i>-1) selected.splice(i,1); else selected.push(opt);
        c.className='zp-chip'+(selected.includes(opt)?' on':'');
        onChange(selected);
      };
      w.append(c);
    });
    return w;
  }

  function videoEmbed(v){
    const isDrive=v.source==='drive';
    const src=isDrive
      ?'https://drive.google.com/file/d/'+v.id+'/preview'
      :'https://player.vimeo.com/video/'+v.id+'?color=f0c233&title=0&byline=0&portrait=0&dnt=1';
    if(v.orientation==='vertical'){
      return '<div style="display:flex;justify-content:center;background:#000;padding:20px 0"><div style="width:min(320px,80%);aspect-ratio:9/16;position:relative"><iframe src="'+src+'" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></div></div>';
    }
    return '<div style="width:100%;aspect-ratio:16/9;position:relative;background:#000"><iframe src="'+src+'" width="100%" height="100%" style="position:absolute;inset:0;border:none" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></div>';
  }

  function vimeoSection(p){
    if(!Array.isArray(p.vimeo)) p.vimeo=[];
    const vids=p.vimeo; const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Campaign Videos</div><div style="font-size:18px;font-weight:800;margin-bottom:4px">Videos</div><div class="zp-hint" style="margin-bottom:14px">Paste a Vimeo or Google Drive video URL — auto-detected, embedded in YouTube / TikTok feeds.</div>';

    function videoCard(v){
      const isDrive=v.source==='drive';
      const link=isDrive?'https://drive.google.com/file/d/'+v.id+'/view':'https://vimeo.com/'+v.id;
      const platLabel=isDrive?'Google Drive':'Vimeo';
      const platColor=isDrive?'#4285f4':'#00adef';
      const aspect=v.orientation==='vertical'?'9/16':'16/9';
      return '<a href="'+link+'" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:'+aspect+';background:linear-gradient(145deg,#111,#1c1c20);border-radius:10px;text-decoration:none;border:1px solid #2c2c33;margin-bottom:14px"><div style="text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 10px">▶</div><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px">'+(v.label||'Video')+'</div><div style="font-size:10px;color:'+platColor+';font-weight:600;letter-spacing:.05em">'+platLabel+' · click to watch</div></div></a>';
    }

    const active=vids.filter(v=>v.id);
    if(active.length===1){
      const prev=el('div'); prev.innerHTML=videoCard(active[0]); w.append(prev);
    } else if(active.length>1){
      const tabBar=el('div'); tabBar.style.cssText='display:flex;border-bottom:1px solid #2c2c33;margin-bottom:0;background:#080808;border-radius:8px 8px 0 0;overflow:hidden';
      const panels=el('div'); panels.style.marginBottom='14px';
      active.forEach((v,i)=>{
        const tb=el('button'); tb.style.cssText='padding:8px 16px;background:none;border:none;border-bottom:2px solid '+(i===0?'#f0c233':'transparent')+';color:'+(i===0?'#f0c233':'#666')+';font-size:12px;font-weight:'+(i===0?'700':'400')+';cursor:pointer;font-family:inherit';
        tb.textContent=v.label||('Video '+(i+1));
        const pan=el('div'); pan.style.display=i===0?'block':'none'; pan.innerHTML=videoCard(v);
        tb.onclick=()=>{ Array.from(tabBar.children).forEach((b,j)=>{ b.style.borderBottomColor=j===i?'#f0c233':'transparent'; b.style.color=j===i?'#f0c233':'#666'; b.style.fontWeight=j===i?'700':'400'; }); Array.from(panels.children).forEach((d,j)=>d.style.display=j===i?'block':'none'); };
        tabBar.append(tb); panels.append(pan);
      });
      w.append(tabBar,panels);
    }

    const list=el('div'); list.style.cssText='display:flex;flex-direction:column;gap:8px';
    function parseVideoUrl(raw){
      const vm=raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)||raw.match(/^(\d+)$/);
      if(vm) return {id:vm[1],source:'vimeo'};
      const dm=raw.match(/drive\.google\.com\/file\/d\/([^/?]+)/)||raw.match(/drive\.google\.com\/open\?id=([^&]+)/);
      if(dm) return {id:dm[1],source:'drive'};
      return null;
    }
    function addRow(v,idx){
      const row=el('div'); row.style.cssText='background:#0d0d0f;border:1px solid #2c2c33;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px';
      const urlWrap=el('div'); urlWrap.style.cssText='display:flex;flex-direction:column;gap:3px';
      const urlI=el('input');
      urlI.value=v.id?(v.source==='drive'?'https://drive.google.com/file/d/'+v.id+'/view':'https://vimeo.com/'+v.id):'';
      urlI.placeholder='Paste Vimeo or Google Drive video URL';
      urlI.style.cssText='width:100%;background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      const badge=el('div'); badge.style.cssText='font-size:11px;font-weight:600;padding-left:2px;min-height:14px';
      function refreshBadge(){ const s=vids[idx].source; badge.style.color=s==='drive'?'#4285f4':'#00adef'; badge.textContent=vids[idx].id?(s==='drive'?'↳ Google Drive video':'↳ Vimeo video'):''; }
      refreshBadge();
      urlI.oninput=()=>{ const p=parseVideoUrl(urlI.value.trim()); if(p){vids[idx].id=p.id;vids[idx].source=p.source;}else{vids[idx].id=urlI.value.trim();vids[idx].source='vimeo';} refreshBadge(); persist(false); };
      urlI.onblur=()=>{ if(vids[idx].id) render(); };
      urlWrap.append(urlI,badge);
      const metaRow=el('div'); metaRow.style.cssText='display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center';
      const lblI=el('input'); lblI.value=v.label||''; lblI.placeholder='Label (e.g. Hero TVC)'; lblI.style.cssText='background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px;width:100%';
      lblI.oninput=()=>{ vids[idx].label=lblI.value; persist(false); };
      const orSel=el('select'); orSel.style.cssText='background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px;cursor:pointer';
      [['horizontal','↔ H'],['vertical','↕ V']].forEach(([val,txt])=>{ const o=el('option'); o.value=val; o.textContent=txt; if((v.orientation||'horizontal')===val)o.selected=true; orSel.append(o); });
      orSel.onchange=()=>{ vids[idx].orientation=orSel.value; persist(false); render(); };
      const rm=el('button'); rm.textContent='✕'; rm.style.cssText='background:none;border:1px solid #3a3a44;border-radius:6px;color:#888;padding:8px 10px;cursor:pointer;font-size:13px';
      rm.onclick=()=>{ vids.splice(idx,1); persist(false); render(); };
      metaRow.append(lblI,orSel,rm); row.append(urlWrap,metaRow); list.append(row);
    }
    vids.forEach((v,i)=>addRow(v,i));
    const addBtn=el('button'); addBtn.textContent='＋ Add Video'; addBtn.style.cssText='background:#0d0d0f;border:1px dashed #3a3a44;border-radius:8px;color:var(--gold,#f0c233);padding:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;width:100%';
    addBtn.onclick=()=>{ vids.push({id:'',label:'',orientation:'horizontal',source:'vimeo'}); persist(false); render(); };
    w.append(list,addBtn); return w;
  }

  function articlesSection(p){
    if(!Array.isArray(p.articles)) p.articles=[];
    const arts=p.articles; const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Articles & Posts</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Written Content</div><div class="zp-hint" style="margin-bottom:14px">Paste a social post URL to pull it into the feed — or write copy manually. Both auto-appear in the right platform feed.</div>';
    const list=el('div'); list.style.cssText='display:flex;flex-direction:column;gap:10px';
    function detectSocPlat(url){
      if(!url) return '';
      if(/instagram\.com\/(p|reel|tv)\//.test(url)) return 'Instagram';
      if(/tiktok\.com\/@[^/]+\/video\//.test(url)) return 'TikTok';
      if(/(twitter|x)\.com\/[^/]+\/status\//.test(url)) return 'X / Twitter';
      if(/linkedin\.com\/(posts|feed\/update|pulse)\//.test(url)) return 'LinkedIn';
      if(/youtube\.com\/watch|youtu\.be\//.test(url)) return 'YouTube';
      if(/facebook\.com\//.test(url)) return 'Facebook';
      return '';
    }
    function addRow(a,idx){
      const row=el('div'); row.style.cssText='background:#0d0d0f;border:1px solid #2c2c33;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px';
      // Social post URL (routes to detected platform feed)
      const socialWrap=el('div'); socialWrap.style.cssText='display:flex;flex-direction:column;gap:4px';
      const socialI=el('input'); socialI.value=a.socialUrl||''; socialI.placeholder='🔗 Paste social post URL — Instagram, TikTok, X, LinkedIn, YouTube (auto-routes to feed)';
      socialI.style.cssText='width:100%;background:#080808;border:1px solid #3a3a44;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      const socialBadge=el('div'); socialBadge.style.cssText='font-size:11px;font-weight:600;min-height:16px;padding-left:2px';
      function updateBadge(url){
        const plat=detectSocPlat(url);
        socialBadge.style.color=plat?'#f0c233':'#888';
        socialBadge.textContent=plat?'↳ Routes to '+plat+' feed':url?'↳ Platform not recognised':'';
      }
      updateBadge(a.socialUrl||'');
      socialI.oninput=()=>{ const plat=detectSocPlat(socialI.value); arts[idx].socialUrl=socialI.value; arts[idx].socialPlatform=plat; updateBadge(socialI.value); persist(false); };
      socialWrap.append(socialI,socialBadge);
      // Title (optional — use when you also want to add copy)
      const titleI=el('input'); titleI.value=a.title||''; titleI.placeholder='Headline / title (optional)';
      titleI.style.cssText='width:100%;background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      titleI.oninput=()=>{ arts[idx].title=titleI.value; persist(false); };
      // Body copy
      const bodyI=el('textarea'); bodyI.value=a.body||''; bodyI.placeholder='Post copy / article body (for text-only posts without a URL)…';
      bodyI.style.cssText='width:100%;background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px;min-height:70px;resize:vertical;line-height:1.5';
      bodyI.oninput=()=>{ arts[idx].body=bodyI.value; persist(false); };
      // External link (optional)
      const linkI=el('input'); linkI.value=a.link||''; linkI.placeholder='External article link (optional)';
      linkI.style.cssText='width:100%;background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      linkI.oninput=()=>{ arts[idx].link=linkI.value; persist(false); };
      const rm=el('button'); rm.textContent='✕ Remove'; rm.style.cssText='align-self:flex-end;background:none;border:1px solid #3a3a44;border-radius:6px;color:#888;padding:5px 12px;font-size:11px;cursor:pointer';
      rm.onclick=()=>{ arts.splice(idx,1); persist(false); render(); };
      row.append(socialWrap,titleI,bodyI,linkI,rm); list.append(row);
    }
    arts.forEach((a,i)=>addRow(a,i));
    const addBtn=el('button'); addBtn.textContent='＋ Add Article / Post'; addBtn.style.cssText='background:#0d0d0f;border:1px dashed #3a3a44;border-radius:8px;color:var(--gold,#f0c233);padding:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;width:100%';
    addBtn.onclick=()=>{ arts.push({title:'',body:'',link:'',socialUrl:'',socialPlatform:''}); persist(false); render(); };
    w.append(list,addBtn); return w;
  }

  // ── Brief / Presentation modal ───────────────────────────────────────────
  function openBriefModal(title,canvaUrl,embedUrl){
    let modal=document.getElementById('zz-brief-modal');
    if(!modal){
      modal=document.createElement('div'); modal.id='zz-brief-modal';
      modal.style.cssText='position:fixed;inset:0;z-index:99999;display:none;flex-direction:column;background:#07070a';
      modal.innerHTML='<div style="display:flex;align-items:center;gap:12px;padding:12px 20px;background:#111118;border-bottom:1px solid #2c2c33;flex-shrink:0"><button id="zzBMclose" style="background:none;border:1px solid #3a3a44;border-radius:6px;color:#aaa;padding:6px 14px;font-size:15px;cursor:pointer;font-family:inherit">✕</button><span id="zzBMtitle" style="font-size:15px;font-weight:800;color:#fff;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span><a id="zzBMlink" href="#" target="_blank" rel="noopener" style="font-size:11px;color:#f0c233;text-decoration:none;font-weight:700;border:1px solid rgba(240,194,51,.3);border-radius:6px;padding:6px 14px;white-space:nowrap;flex-shrink:0">Open in Canva ↗</a></div><div style="flex:1;position:relative"><iframe id="zzBMframe" src="" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen allow="fullscreen;autoplay"></iframe></div>';
      document.body.appendChild(modal);
      document.getElementById('zzBMclose').onclick=()=>{modal.style.display='none';document.getElementById('zzBMframe').src='';};
    }
    document.getElementById('zzBMtitle').textContent=title;
    document.getElementById('zzBMlink').href=canvaUrl;
    document.getElementById('zzBMframe').src=embedUrl||canvaUrl;
    modal.style.display='flex';
  }
  window.openBriefModal=openBriefModal;

  function briefsSection(p){
    if(!Array.isArray(p.briefs)) p.briefs=[];
    const briefs=p.briefs; const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Creative Briefs</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Presentations & Briefs</div><div class="zp-hint" style="margin-bottom:14px">Paste a Canva share link — opens as a full-screen professional brief presenter on the brand page.</div>';

    function canvaEmbed(url){ const m=url.match(/canva\.com\/design\/([^/?]+)/); return m?'https://www.canva.com/design/'+m[1]+'/view?embed':''; }

    // Preview cards for existing briefs with valid URLs
    const readyBriefs=briefs.filter(b=>b.canvaUrl&&b.canvaUrl.includes('canva.com'));
    if(readyBriefs.length){
      const previews=el('div'); previews.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:16px';
      readyBriefs.forEach(b=>{
        const card=el('div'); card.style.cssText='background:linear-gradient(135deg,#1a0d2e,#0d0d14);border:1px solid #3a2a5a;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;cursor:pointer;transition:border-color .2s';
        card.onmouseover=()=>card.style.borderColor='#7b2d8b';
        card.onmouseout=()=>card.style.borderColor='#3a2a5a';
        const ico=el('div'); ico.style.cssText='width:44px;height:44px;background:linear-gradient(135deg,#7b2d8b,#3d1a6e);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px';
        ico.textContent='📋';
        const info=el('div');
        info.innerHTML='<div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:3px">'+(b.title||'Creative Brief')+'</div><div style="font-size:10px;color:#888;letter-spacing:.05em">Canva Presentation</div>';
        const btn=el('button'); btn.textContent='▶ Present Brief';
        btn.style.cssText='background:linear-gradient(135deg,#7b2d8b,#3d1a6e);border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;width:100%;letter-spacing:.04em';
        btn.onclick=()=>openBriefModal(b.title||'Creative Brief',b.canvaUrl,canvaEmbed(b.canvaUrl));
        card.append(ico,info,btn); previews.append(card);
      });
      w.append(previews);
    }

    // Edit rows
    const list=el('div'); list.style.cssText='display:flex;flex-direction:column;gap:8px';
    function addRow(b,idx){
      const row=el('div'); row.style.cssText='background:#0d0d0f;border:1px solid #2c2c33;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px';
      const titleI=el('input'); titleI.value=b.title||''; titleI.placeholder='Brief title (e.g. "Ramadan 2024 Campaign Brief")';
      titleI.style.cssText='width:100%;background:#080808;border:1px solid #2c2c33;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      titleI.oninput=()=>{ briefs[idx].title=titleI.value; persist(false); };
      const urlWrap=el('div'); urlWrap.style.cssText='display:flex;flex-direction:column;gap:3px';
      const urlI=el('input'); urlI.value=b.canvaUrl||''; urlI.placeholder='Canva share URL — https://www.canva.com/design/...';
      urlI.style.cssText='width:100%;background:#080808;border:1px solid #3a3a44;border-radius:6px;color:#f4f2ed;padding:8px 10px;font-size:13px';
      const badge=el('div'); badge.style.cssText='font-size:11px;font-weight:600;padding-left:2px;min-height:14px';
      function refreshBadge(){ const ok=canvaEmbed(urlI.value); badge.style.color=ok?'#f0c233':'#888'; badge.textContent=ok?'↳ Canva presentation detected':urlI.value?'↳ Not a Canva link':''; }
      refreshBadge();
      urlI.oninput=()=>{ briefs[idx].canvaUrl=urlI.value; refreshBadge(); persist(false); };
      urlWrap.append(urlI,badge);
      const rm=el('button'); rm.textContent='✕ Remove'; rm.style.cssText='align-self:flex-end;background:none;border:1px solid #3a3a44;border-radius:6px;color:#888;padding:5px 12px;font-size:11px;cursor:pointer';
      rm.onclick=()=>{ briefs.splice(idx,1); persist(false); render(); };
      row.append(titleI,urlWrap,rm); list.append(row);
    }
    briefs.forEach((b,i)=>addRow(b,i));
    const addBtn=el('button'); addBtn.textContent='＋ Add Brief / Presentation';
    addBtn.style.cssText='background:#0d0d0f;border:1px dashed #3a3a44;border-radius:8px;color:var(--gold,#f0c233);padding:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;width:100%';
    addBtn.onclick=()=>{ briefs.push({title:'',canvaUrl:''}); persist(false); render(); };
    w.append(list,addBtn); return w;
  }

  function pickMulti(accept,cb){
    const i=el('input'); i.type='file'; i.accept=accept; i.multiple=true;
    i.onchange=()=>{ if(i.files&&i.files.length) cb(Array.from(i.files)); }; i.click();
  }
  function uploadMulti(p, files, onDone){
    let done=0; const total=files.length;
    toast('Uploading 1 / '+total+'…');
    function next(idx){
      if(idx>=total){ persist(true); onDone(); return; }
      uploadFile(files[idx]).then(pth=>{
        const kind=files[idx].type.startsWith('video')?'video':'img';
        (p.media=p.media||[]).push({kind,src:pth,caption:''});
        done++;
        toast('Uploading '+(done+1<total?done+1:done)+' / '+total+(done<total?'…':' — done!'));
        next(idx+1);
      }).catch(()=>{ toast('Upload failed on file '+(idx+1)); next(idx+1); });
    }
    next(0);
  }

  function mediaGallery(p){
    const w=el('div'); w.className='zp-card';
    w.innerHTML='<div class="zp-sl">Gallery</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Photos &amp; Videos</div><div class="zp-hint" style="margin-bottom:14px">Bulk-upload photos &amp; videos — they appear as a carousel on the live page. Add captions to tell the story.</div>';
    const grid=el('div'); grid.className='zz-edit-grid';
    function rebuildGrid(){
      grid.innerHTML='';
      (p.media||[]).forEach((mm,i)=>{
        const cell=el('div'); cell.className='zz-edit-cell';

        if(mm.kind==='canva'){
          const thumb=el('div'); thumb.className='zz-edit-thumb';
          thumb.style.cssText='background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:12px;text-align:center';
          thumb.innerHTML='<div style="font-size:28px;margin-bottom:4px">📊</div><div style="font-size:11px;font-weight:700;color:#f4f2ed">Canva Presentation</div><div style="font-size:10px;color:#555;word-break:break-all;max-width:100%">'+(mm.src.slice(0,36)||'')+'</div>';
          const idx=el('span'); idx.className='zz-idx'; idx.textContent=i+1;
          const rm=el('button'); rm.className='zz-rm'; rm.textContent='✕';
          rm.onclick=()=>{ p.media.splice(i,1); persist(false); rebuildGrid(); };
          thumb.append(idx,rm);
          const capWrap=el('div'); capWrap.className='zz-edit-cap';
          const lbIn=el('textarea'); lbIn.placeholder='Slide deck title…'; lbIn.value=mm.label||''; lbIn.rows=2;
          lbIn.oninput=()=>{ mm.label=lbIn.value; persist(false); };
          capWrap.append(lbIn);
          cell.append(thumb,capWrap); grid.append(cell); return;
        }

        const thumb=el('div'); thumb.className='zz-edit-thumb';
        const idx=el('span'); idx.className='zz-idx'; idx.textContent=i+1;
        const rm=el('button'); rm.className='zz-rm'; rm.textContent='✕';
        rm.onclick=()=>{ p.media.splice(i,1); persist(false); rebuildGrid(); };
        let me;
        if(mm.kind==='video'){ me=el('video'); me.src=absPath(mm.src); me.muted=true; me.style.cssText='width:100%;height:100%;object-fit:cover'; }
        else { me=el('img'); me.src=absPath(mm.src); me.loading='lazy'; }
        thumb.append(me,idx,rm);
        const capWrap=el('div'); capWrap.className='zz-edit-cap';
        const capIn=el('textarea'); capIn.rows=2; capIn.placeholder='Caption / description shown below the photo and on the news feed…'; capIn.value=mm.caption||'';
        capIn.oninput=()=>{ mm.caption=capIn.value; persist(false); };
        capWrap.append(capIn);
        cell.append(thumb,capWrap); grid.append(cell);
      });
    }
    rebuildGrid();
    if(!(p.media||[]).length){ const empty=el('div'); empty.style.cssText='color:var(--m,#9a958c);font-size:13px;padding:8px 0;'; empty.textContent='No media yet — use the buttons below to add photos and videos.'; w.append(empty); }
    w.append(grid);
    const bar=el('div'); bar.style.cssText='display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center';
    const bulk=el('button'); bulk.className='zp-add'; bulk.textContent='📁 Bulk Upload Photos';
    bulk.onclick=()=>pickMulti('image/*',files=>uploadMulti(p,files,()=>render()));
    const addV=el('button'); addV.className='zp-add'; addV.textContent='🎬 Add Video';
    addV.onclick=()=>pickMulti('video/*',files=>uploadMulti(p,files,()=>render()));
    const addUrl=el('button'); addUrl.className='zp-add'; addUrl.textContent='🔗 URL';
    addUrl.onclick=()=>{ const u=prompt('Paste image or video URL:',''); if(!u||!u.trim())return; const k=/\.(mp4|webm|mov|avi)/i.test(u)?'video':'img'; (p.media=p.media||[]).push({kind:k,src:u.trim(),caption:''}); persist(true); render(); };
    const addCanva=el('button'); addCanva.className='zp-add'; addCanva.textContent='📊 Add Canva';
    addCanva.onclick=()=>{
      const u=prompt('Paste Canva embed URL (the ?embed link from Share → Embed):','');
      if(!u||!u.trim())return;
      const src=u.trim().replace(/\/view(\?.*)?$/,'/view?embed');
      (p.media=p.media||[]).push({kind:'canva',src,label:''}); persist(true); rebuildGrid();
    };
    const hint=el('span'); hint.className='zp-hint'; hint.textContent='Ctrl+A in file picker to select all at once.';
    bar.append(bulk,addV,addUrl,addCanva,hint); w.append(bar); return w;
  }

  // ── Viewer gallery: Instagram-style album + lightbox ──────────────────
  let _lbItems=[], _lbIdx=0;
  function openLightbox(items, startIdx){
    _lbItems=items; _lbIdx=startIdx||0;
    let lb=document.getElementById('zz-lb');
    if(!lb){
      lb=el('div'); lb.id='zz-lb';
      const close=el('button'); close.className='zz-lb-close'; close.innerHTML='&times;';
      close.onclick=()=>lb.classList.remove('open');
      const prev=el('button'); prev.className='zz-lb-arrow prev'; prev.textContent='‹';
      prev.onclick=()=>showLb(_lbIdx-1);
      const next=el('button'); next.className='zz-lb-arrow next'; next.textContent='›';
      next.onclick=()=>showLb(_lbIdx+1);
      lb.append(close,prev,next);
      const wrap=el('div'); wrap.className='zz-lb-wrap'; wrap.id='zz-lb-wrap'; lb.append(wrap);
      const counter=el('div'); counter.className='zz-lb-counter'; counter.id='zz-lb-counter'; lb.append(counter);
      const strip=el('div'); strip.className='zz-lb-strip'; strip.id='zz-lb-strip'; lb.append(strip);
      lb.onclick=e=>{ if(e.target===lb||e.target===wrap) lb.classList.remove('open'); };
      document.body.append(lb);
      document.addEventListener('keydown',e=>{
        if(!lb.classList.contains('open')) return;
        if(e.key==='ArrowRight'||e.key==='ArrowDown') showLb(_lbIdx+1);
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp') showLb(_lbIdx-1);
        else if(e.key==='Escape') lb.classList.remove('open');
      });
      let tx=0;
      lb.addEventListener('touchstart',e=>{ tx=e.touches[0].clientX; },{passive:true});
      lb.addEventListener('touchend',e=>{ const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) showLb(_lbIdx+(dx<0?1:-1)); },{passive:true});
    }
    lb.classList.add('open'); showLb(_lbIdx);
  }
  function showLb(idx){
    _lbIdx=Math.max(0,Math.min(idx,_lbItems.length-1));
    const wrap=document.getElementById('zz-lb-wrap'); if(!wrap) return;
    const counter=document.getElementById('zz-lb-counter');
    const strip=document.getElementById('zz-lb-strip');
    wrap.innerHTML='';
    const mm=_lbItems[_lbIdx];
    let media;
    if(mm.kind==='video'){ media=el('video'); media.src=absPath(mm.src); media.controls=true; media.autoplay=true; }
    else { media=el('img'); media.src=absPath(mm.src); media.alt=mm.caption||''; }
    wrap.append(media);
    if(mm.caption){ const cap=el('div'); cap.style.cssText='color:rgba(255,255,255,.75);font-size:13px;text-align:center;margin-top:10px;max-width:600px;line-height:1.5'; cap.textContent=mm.caption; wrap.append(cap); }
    if(counter) counter.textContent=(_lbIdx+1)+' / '+_lbItems.length;
    if(strip){
      strip.innerHTML='';
      _lbItems.forEach((m,i)=>{
        const d=el('div'); d.className='zz-lb-dot'+(i===_lbIdx?' on':'');
        if(m.kind==='video'){ d.style.cssText='background:#222;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff'; d.textContent='▶'; }
        else { const im=el('img'); im.src=absPath(m.src); im.loading='lazy'; d.append(im); }
        d.onclick=()=>showLb(i); strip.append(d);
      });
      setTimeout(()=>{ const a=strip.querySelector('.on'); if(a){ const left=a.offsetLeft-strip.offsetWidth/2+a.offsetWidth/2; strip.scrollTo({left:Math.max(0,left),behavior:'smooth'}); } },50);
    }
  }

  function applyGallery(){
    const p=DATA.projects[DATA.active]||DATA.projects[0]||{};
    const items=p.media||[];
    const old=document.getElementById('zz-gallery-sec'); if(old) old.remove();
    if(!items.length) return;

    const canvaItems=items.filter(m=>m.kind==='canva');
    const mediaItems=items.filter(m=>m.kind!=='canva');

    const sec=el('div'); sec.id='zz-gallery-sec'; sec.className='zz-gallery-section';
    const c=el('div'); c.className='c';

    if(mediaItems.length){
      const sl=el('p'); sl.className='sl'; sl.textContent='Gallery';
      const st=el('h2'); st.className='st'; st.textContent=p.name||'Campaign Work';
      c.append(sl,st);

      // ── Carousel (4+ items) ──────────────────────────────
      if(mediaItems.length>=4){
        const wrap=el('div'); wrap.className='zz-carousel-wrap';
        const car=el('div'); car.className='zz-carousel';
        // aspect ratio based on first image (default 16/9)
        car.style.aspectRatio='16/9';
        const track=el('div'); track.className='zz-car-track';
        let cur=0, autoT=null;

        mediaItems.forEach((mm,i)=>{
          const slide=el('div'); slide.className='zz-car-slide';
          if(mm.kind==='drive'){
            // Google Drive video embed — fill the slide with an iframe
            slide.style.background='#000';
            const ifr=el('iframe'); ifr.src='https://drive.google.com/file/d/'+mm.id+'/preview';
            ifr.style.cssText='width:100%;height:100%;border:none;position:absolute;inset:0';
            ifr.allow='autoplay;fullscreen'; ifr.allowFullscreen=true;
            slide.style.position='relative';
            slide.append(ifr);
          } else {
            let media;
            if(mm.kind==='video'){
              media=el('video'); media.src=absPath(mm.src); media.muted=true; media.loop=true; media.playsInline=true;
            } else {
              media=el('img'); media.src=absPath(mm.src); media.alt=mm.caption||''; media.loading=i<3?'eager':'lazy';
            }
            media.onclick=()=>openLightbox(mediaItems,i);
            slide.append(media);
          }
          if(mm.caption){ const cap=el('div'); cap.className='zz-car-cap'; cap.textContent=mm.caption; slide.append(cap); }
          track.append(slide);
        });
        car.append(track);

        const ctr=el('div'); ctr.className='zz-car-ctr'; ctr.textContent='1 / '+mediaItems.length; car.append(ctr);
        const btnP=el('button'); btnP.className='zz-car-btn prev'; btnP.innerHTML='&#8249;'; car.append(btnP);
        const btnN=el('button'); btnN.className='zz-car-btn next'; btnN.innerHTML='&#8250;'; car.append(btnN);

        const dotsRow=el('div'); dotsRow.className='zz-car-dots';
        const thumbsRow=el('div'); thumbsRow.className='zz-car-thumbs';

        const dotEls=[], thumbEls=[];
        mediaItems.forEach((mm,i)=>{
          const d=el('button'); d.type='button'; d.className='zz-car-dot'+(i===0?' on':'');
          d.onclick=()=>goTo(i); dotsRow.append(d); dotEls.push(d);
          const th=el('div'); th.className='zz-car-thumb'+(i===0?' on':'');
          let tm;
          if(mm.kind==='drive'){
            tm=el('div'); tm.style.cssText='width:100%;height:100%;background:#111;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff';
            tm.textContent='▶';
          } else if(mm.kind==='video'){ tm=el('video'); tm.src=absPath(mm.src); tm.muted=true; }
          else { tm=el('img'); tm.src=absPath(mm.src); tm.loading='lazy'; }
          th.append(tm); th.onclick=()=>goTo(i); thumbsRow.append(th); thumbEls.push(th);
        });

        function goTo(idx){
          cur=((idx%mediaItems.length)+mediaItems.length)%mediaItems.length;
          track.style.transform='translateX(-'+(cur*100)+'%)';
          ctr.textContent=(cur+1)+' / '+mediaItems.length;
          dotEls.forEach((d,i)=>d.className='zz-car-dot'+(i===cur?' on':''));
          thumbEls.forEach((t,i)=>{ t.className='zz-car-thumb'+(i===cur?' on':''); });
          setTimeout(()=>{ const a=thumbsRow.querySelector('.on'); if(a){ const left=a.offsetLeft-thumbsRow.offsetWidth/2+a.offsetWidth/2; thumbsRow.scrollTo({left:Math.max(0,left),behavior:'smooth'}); } },50);
          // video autoplay for current slide
          track.querySelectorAll('video').forEach((v,i)=>{ if(i===cur){v.play().catch(()=>{});}else{v.pause();v.currentTime=0;} });
        }
        btnP.onclick=()=>{ clearAuto(); goTo(cur-1); startAuto(); };
        btnN.onclick=()=>{ clearAuto(); goTo(cur+1); startAuto(); };

        function startAuto(){ autoT=setInterval(()=>goTo(cur+1), 4500); }
        function clearAuto(){ clearInterval(autoT); }
        car.addEventListener('mouseenter',clearAuto);
        car.addEventListener('mouseleave',startAuto);
        startAuto();

        let tx=0;
        car.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
        car.addEventListener('touchend',e=>{ clearAuto(); const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>40) goTo(cur+(dx<0?1:-1)); startAuto(); },{passive:true});

        wrap.append(car);
        // Show dots for <=12 items, thumbnails for >12
        if(mediaItems.length<=12) wrap.append(dotsRow);
        else wrap.append(thumbsRow);
        c.append(wrap);
      }

      // ── Masonry grid (always shown below carousel, or alone if <4) ─
      const gridHdr=el('p'); gridHdr.style.cssText='font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent,#f0c233);margin:'+(mediaItems.length>=4?'40px':'0')+' 0 10px;';
      gridHdr.textContent=mediaItems.length>=4?'Full Gallery':'Gallery';
      if(mediaItems.length>=4) c.append(gridHdr);

      const grid=el('div'); grid.className='zz-art-grid';

      mediaItems.forEach((mm,i)=>{
        const item=el('div'); item.className='zz-art-item';

        const mwrap=el('div');
        if(mm.kind==='video'){
          mwrap.className='zz-art-mwrap vid';
          const v=el('video'); v.src=absPath(mm.src); v.muted=true; v.loop=true; v.playsInline=true;
          const play=el('div'); play.className='zz-art-play'; play.innerHTML='<span>▶</span>';
          mwrap.append(v,play);
          mwrap.addEventListener('mouseenter',()=>v.play());
          mwrap.addEventListener('mouseleave',()=>{ v.pause(); v.currentTime=0; });
        } else {
          mwrap.className='zz-art-mwrap';
          const img=el('img'); img.src=absPath(mm.src); img.alt=mm.caption||''; img.loading='lazy';
          mwrap.append(img);
        }
        mwrap.onclick=()=>openLightbox(mediaItems,i);
        item.append(mwrap);

        if(mm.caption){
          const cap=el('div'); cap.className='zz-art-cap'; cap.textContent=mm.caption;
          item.append(cap);
        }
        grid.append(item);
      });
      c.append(grid);
    }

    // Canva presentation embeds
    if(canvaItems.length){
      const psl=el('p'); psl.className='sl'; psl.style.marginTop=mediaItems.length?'56px':'0';
      psl.textContent='Presentation';
      c.append(psl);
      canvaItems.forEach(mm=>{
        if(mm.label){ const pst=el('h2'); pst.className='st'; pst.textContent=mm.label; c.append(pst); }
        const wrap=el('div');
        wrap.style.cssText='position:relative;width:100%;height:0;padding-top:56.2225%;border-radius:12px;overflow:hidden;border:1px solid var(--b,#2c2c33)';
        const iframe=el('iframe'); iframe.src=mm.src; iframe.loading='lazy'; iframe.allowFullscreen=true;
        iframe.allow='fullscreen'; iframe.setAttribute('allowfullscreen','allowfullscreen');
        iframe.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none';
        wrap.append(iframe); c.append(wrap);
      });
    }

    sec.append(c);
    const btns=document.querySelector('.btns');
    if(btns) btns.before(sec); else document.body.append(sec);
  }

  function applyBrandCircle(){
    const bc=document.querySelector('.bc'); if(!bc) return;
    bc.style.overflow='hidden';
    // Priority: uploaded logo → assets/logos/[SLUG].png fallback
    const logoSrc=DATA.brand.logo?absPath(DATA.brand.logo):('/assets/logos/'+SLUG+'.png');
    // Remove existing initials text
    if(!bc.querySelector('img')){ bc.textContent=''; }
    let img=bc.querySelector('img');
    if(!img){ img=el('img'); img.style.cssText='width:100%;height:100%;object-fit:contain;display:block;padding:10%'; bc.append(img); }
    img.src=logoSrc;
    img.onload=()=>{ bc.style.background='#fff'; img.style.display='block'; };
    img.onerror=()=>{
      img.style.display='none';
      if(!bc.textContent.trim()){ bc.textContent=brandName.slice(0,2).toUpperCase(); }
      bc.style.background='';
    };
  }

  function renderBrand(){
    // Edit mode banner — visible only when editor panel is mounted
    const banner=el('div'); banner.id='zz-edit-banner';
    banner.innerHTML='<div class="zeb-left"><div class="zeb-icon">✏️</div><div><div class="zeb-title">Edit Mode</div><div class="zeb-sub">Changes save to device instantly &nbsp;·&nbsp; Press Save &amp; Deploy to publish</div></div></div><div class="zeb-badge">'+esc(brandName)+'</div>';
    root.append(banner);
    const sec=el('div'); sec.innerHTML='<p class="zp-sl">Brand Level</p><h2 class="zp-h">Brand Profile</h2>';
    const card=el('div'); card.className='zp-card'; const grid=el('div'); grid.className='zp-grid';

    // Logo upload row at the top of the brand card
    const logoRow=el('div'); logoRow.style.cssText='grid-column:1/-1;display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid #2c2c33;margin-bottom:4px';
    const logoPreview=el('div'); logoPreview.style.cssText='width:64px;height:64px;border-radius:50%;background:var(--accent,#f0c233);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff';
    if(DATA.brand.logo){
      const pi=el('img'); pi.src=absPath(DATA.brand.logo); pi.style.cssText='width:100%;height:100%;object-fit:contain;padding:10%';
      pi.onerror=()=>{ pi.style.display='none'; };
      logoPreview.appendChild(pi);
    } else { logoPreview.textContent=brandName.slice(0,2).toUpperCase(); }
    const logoMeta=el('div'); logoMeta.style.cssText='display:flex;flex-direction:column;gap:6px';
    const logoTitle=el('div'); logoTitle.style.cssText='font-size:13px;font-weight:700'; logoTitle.textContent='Brand Logo';
    const logoHint=el('div'); logoHint.className='zp-hint'; logoHint.textContent=DATA.brand.logo?'Logo set — click to replace':'No logo yet — upload a PNG/SVG';
    const logoBtn=el('button'); logoBtn.className='zp-add'; logoBtn.textContent='📷 Upload Logo';
    logoBtn.onclick=()=>pick('image/*',f=>{ toast('Uploading logo…'); uploadFile(f).then(pth=>{ DATA.brand.logo=pth; persist(false); render(); applyBrandCircle(); toast('✅ Logo updated'); }).catch(()=>toast('Upload failed — is editor server running?')); });
    if(DATA.brand.logo){
      const rmBtn=el('button'); rmBtn.style.cssText='background:none;border:1px solid #5a2330;color:#ff7a90;border-radius:6px;padding:5px 12px;font-size:11px;cursor:pointer;margin-left:6px';
      rmBtn.textContent='Remove'; rmBtn.onclick=()=>{ DATA.brand.logo=''; persist(false); render(); applyBrandCircle(); };
      logoMeta.append(logoTitle,logoHint,el('div').appendChild(logoBtn)&&logoBtn); logoMeta.lastChild.appendChild(rmBtn);
    } else { logoMeta.append(logoTitle,logoHint,logoBtn); }
    logoRow.append(logoPreview,logoMeta); grid.append(logoRow);

    BRAND_FIELDS.forEach(f=>{ const opts=BRAND_SELECTS[f[0]]; const e=opts?selectField(opts,DATA.brand[f[0]],v=>DATA.brand[f[0]]=v):field('input',DATA.brand[f[0]],f[2],v=>DATA.brand[f[0]]=v); grid.append(labeled(f[1],e)); });
    grid.append(labeled('Summary', field('textarea',DATA.brand.summary,'Short brand summary — who they are and what you did for them.',v=>DATA.brand.summary=v), true));
    card.append(grid); sec.append(card);

    // Social Handles card
    const socialCard=el('div'); socialCard.className='zp-card';
    socialCard.innerHTML='<div class="zp-sl">Social Media</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">Social Handles</div><div class="zp-hint" style="margin-bottom:16px">Enter the handle without @ — links are built automatically. Pre-filled where known.</div>';
    const socialGrid=el('div'); socialGrid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px';
    if(!DATA.brand.socials) DATA.brand.socials={};
    SOCIAL_KEYS.forEach(k=>{
      const meta=SOCIAL_META[k];
      const row=el('div'); row.style.cssText='display:flex;flex-direction:column;gap:4px';
      const lab=el('label'); lab.textContent=meta.label;
      const inp=field('input',(DATA.brand.socials[k]||'').replace(/^@/,''),meta.prefix+'handle',v=>{ DATA.brand.socials[k]=v.replace(/^@/,''); applySocialHandles(); });
      row.append(lab,inp); socialGrid.append(row);
    });
    socialCard.append(socialGrid);
    const hasHandles=SOCIAL_KEYS.some(k=>DATA.brand.socials[k]);
    if(hasHandles){
      const prev=el('div'); prev.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #2c2c33';
      SOCIAL_KEYS.forEach(k=>{ const h=(DATA.brand.socials[k]||'').replace(/^@/,''); if(!h)return; const meta=SOCIAL_META[k]; const a=el('a'); a.href=meta.url(h); a.target='_blank'; a.rel='noopener'; a.style.cssText='display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:'+meta.bg+';border:1px solid #2c2c33;border-radius:99px;font-size:12px;font-weight:700;color:'+meta.color+';text-decoration:none;letter-spacing:.02em'; a.textContent=meta.label+' · @'+h; prev.append(a); });
      socialCard.append(prev);
    }
    sec.append(socialCard); root.append(sec);
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
    wrap.append(coverBanner(()=>p.cover, v=>p.cover=v, (p.name&&p.name.trim())?p.name:'This project', [(p.types||[]).join(' · '),p.date].filter(Boolean).join(' · ')));
    // template fields
    const card=el('div'); card.className='zp-card'; const grid=el('div'); grid.className='zp-grid';
    PROJ_FIELDS.forEach(f=>{ const opts=PROJ_SELECTS[f[0]]; const e=opts?selectField(opts,p[f[0]],v=>p[f[0]]=v):field('input',p[f[0]],f[2],v=>p[f[0]]=v); grid.append(labeled(f[1],e)); });
    grid.append(labeled('Description', field('textarea',p.desc,'What was the brief, what did you make, what was the result?',v=>p.desc=v), true));
    card.append(grid); wrap.append(card);
    // types & platforms multi-picker
    const typesCard=el('div'); typesCard.className='zp-card';
    typesCard.innerHTML='<div class="zp-sl">Deliverable Types</div>';
    const platSection=el('div');
    function rebuildPlatSection(){
      platSection.innerHTML='';
      if((p.types||[]).includes('Social Media')){
        const lbl=el('label'); lbl.textContent='Platforms'; lbl.style.marginTop='14px';
        platSection.append(lbl, chipPicker(SOCIAL_PLATFORMS, p.platforms=p.platforms||[], v=>{ p.platforms=v; persist(false); }));
      }
    }
    typesCard.append(chipPicker(DELIV_TYPES, p.types=p.types||[], v=>{ p.types=v; persist(false); rebuildPlatSection(); }));
    typesCard.append(platSection); rebuildPlatSection();
    wrap.append(typesCard);
    wrap.append(processSection(p));
    wrap.append(articlesSection(p));
    wrap.append(briefsSection(p));
    wrap.append(mediaGallery(p));
    wrap.append(reportsSection(p));
    // actions
    const bar=el('div'); bar.className='zp-bar';
    const save=el('button'); save.className='zp-save'; save.textContent='💾 Save & Deploy'; save.onclick=()=>persist(true, save); bar.append(save);
    if(DATA.projects.length>1){ const del=el('button'); del.className='zp-del'; del.textContent='Delete this tab'; del.onclick=()=>{ if(!confirm('Delete "'+(p.name||('Tab '+(DATA.active+1)))+'"?'))return; DATA.projects.splice(DATA.active,1); DATA.active=Math.max(0,DATA.active-1); persist(true, save); render(); }; bar.append(del); }
    const addVidBar=el('button'); addVidBar.className='zp-add'; addVidBar.textContent='🎬 Add Video'; addVidBar.title='Add a Vimeo or Google Drive campaign video';
    addVidBar.onclick=()=>{ const u=prompt('Paste Vimeo or Google Drive video URL:',''); if(!u||!u.trim())return; const raw=u.trim(); const vm=raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)||raw.match(/^(\d+)$/); const dm=raw.match(/drive\.google\.com\/file\/d\/([^/?]+)/); if(!vm&&!dm){alert('Not a valid Vimeo or Drive link.');return;} const id=vm?vm[1]:dm[1]; const source=dm?'drive':'vimeo'; const label=prompt('Label for this video (optional):',''); const ans=prompt('Orientation? Type H for horizontal (16:9) or V for vertical (9:16 — Reels/TikTok):','H'); const orientation=(ans&&/^v/i.test(ans.trim()))?'vertical':'horizontal'; (p.vimeo=p.vimeo||[]).push({id,source,label:label||'',orientation}); persist(true); render(); }; bar.append(addVidBar);
    const addCanvaBar=el('button'); addCanvaBar.className='zp-add'; addCanvaBar.textContent='📊 Add Canva'; addCanvaBar.title='Add a Canva presentation embed to the gallery';
    addCanvaBar.onclick=()=>{ function canvaEmbed(url){const m=url.match(/canva\.com\/design\/([^/?]+)/);return m?'https://www.canva.com/design/'+m[1]+'/view?embed':'';} const u=prompt('Paste Canva share link — e.g. https://www.canva.com/design/...',''); if(!u||!u.trim())return; const src=u.trim().replace(/\/view(\?.*)?$/,'/view?embed'); if(!canvaEmbed(src)){alert('Not a valid Canva design link.');return;} (p.media=p.media||[]).push({kind:'canva',src,label:''}); persist(true); render(); }; bar.append(addCanvaBar);
    const hint=el('span'); hint.className='zp-hint'; hint.textContent='Saves & pushes directly to GitHub Pages.'; bar.append(hint);
    wrap.append(bar); root.append(wrap);
  }

  function applyHeroCover(){
    const hero=document.querySelector('.hero');
    if(!hero) return;
    const p=DATA.projects[DATA.active]||{};
    const cover=p.cover||DATA.brand.cover||'';
    if(cover){
      const src=/^(https?:|\/\/)/.test(cover)?cover:('/'+cover.replace(/^\//,''));
      hero.style.backgroundImage='linear-gradient(to right,rgba(0,0,0,.82) 0%,rgba(0,0,0,.42) 55%,rgba(0,0,0,.65) 100%),url('+src+')';
      hero.style.backgroundSize='cover';
      hero.style.backgroundPosition='center';
      hero.style.backgroundRepeat='no-repeat';
      // make right panel semi-transparent so cover shows through
      const hs=hero.querySelector('.hs');
      if(hs) hs.style.background='rgba(0,0,0,.35)';
    } else {
      hero.style.backgroundImage='';
      const hs=hero.querySelector('.hs');
      if(hs) hs.style.background='';
    }
  }

  function applyAnalytics(){
    const p=DATA.projects[DATA.active]||DATA.projects[0]||{};
    const a=p.analytics||{};
    const rg=document.querySelector('.rg');
    if(!rg) return;
    const section=rg.closest('section');
    const fields=[
      {key:'reach', label:'Achievement'},
      {key:'duration', label:'Duration'},
      {key:'audience', label:'Audience'}
    ];
    const boxes=rg.querySelectorAll('.rc');
    let anyVisible=false;
    fields.forEach((f,i)=>{
      const box=boxes[i]; if(!box) return;
      const val=(a[f.key]||'').trim();
      if(val){
        box.style.display='';
        const rn=box.querySelector('.rn'); if(rn) rn.textContent=val;
        const rl=box.querySelector('.rl'); if(rl) rl.textContent=f.label;
        anyVisible=true;
      } else {
        box.style.display='none';
      }
    });
    if(section) section.style.display=anyVisible?'':'none';
  }

  function applySocialHandles(){
    const hs=document.querySelector('.hs'); if(!hs) return;
    let bar=document.getElementById('zz-social-bar');
    if(!bar){ bar=el('div'); bar.id='zz-social-bar'; bar.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)'; hs.append(bar); }
    bar.innerHTML='';
    const soc=DATA.brand.socials||{};
    let any=false;
    SOCIAL_KEYS.forEach(k=>{ const h=(soc[k]||'').replace(/^@/,''); if(!h)return; any=true; const meta=SOCIAL_META[k]; const a=el('a'); a.href=meta.url(h); a.target='_blank'; a.rel='noopener'; a.title=meta.label+': @'+h; a.style.cssText='width:30px;height:30px;border-radius:50%;background:'+meta.bg+';border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:'+meta.color+';text-decoration:none;letter-spacing:0;transition:transform .15s'; a.textContent=SOCIAL_ABBR[k]; a.onmouseenter=()=>a.style.transform='scale(1.18)'; a.onmouseleave=()=>a.style.transform=''; bar.append(a); });
    bar.style.display=any?'flex':'none';
  }
  // Are we in edit mode? Activated by ?edit in URL or by editor.js toggle (ze-on class).
  const EDIT_MODE = /[?&]edit\b/.test(location.search);

  function applyProcess(){
    const p=DATA.projects[DATA.active]||DATA.projects[0]||{};
    const steps=p.process||[]; if(!steps.length) return;
    const old=document.getElementById('zz-process-sec'); if(old) old.remove();
    const sec=el('div'); sec.id='zz-process-sec'; sec.style.cssText='padding:72px 0;border-bottom:1px solid var(--b,#2c2c33)';
    const c=el('div'); c.className='c';
    const sl=el('p'); sl.className='sl'; sl.textContent='Process';
    const st=el('h2'); st.className='st'; st.textContent='How It Came Together';
    c.append(sl,st);
    steps.forEach((s,i)=>{
      const row=el('div'); row.style.cssText='display:grid;grid-template-columns:56px 1fr;gap:24px;padding:24px 0;border-bottom:1px solid var(--b,#2c2c33);align-items:start';
      const num=el('div'); num.className='pn'; num.textContent=String(i+1).padStart(2,'0');
      const body=el('div');
      const title=el('div'); title.className='pt'; title.textContent=s.title;
      const desc=el('div'); desc.className='pb'; desc.textContent=s.desc;
      body.append(title,desc); row.append(num,body); c.append(row);
    });
    sec.append(c);
    const btns=document.querySelector('.btns'); if(btns) btns.before(sec); else document.body.append(sec);
    // hide the static process section in the HTML so we don't show both
    document.querySelectorAll('section').forEach(s=>{ if(s.querySelector('.ps')) s.style.display='none'; });
  }

  function applyReports(){
    function canvaEmbed(url){const m=url.match(/canva\.com\/design\/([^/?]+)/);return m?'https://www.canva.com/design/'+m[1]+'/view?embed':'';}
    const p=DATA.projects[DATA.active]||DATA.projects[0]||{};
    const url=p.reportUrl||''; const embed=canvaEmbed(url); if(!embed) return;
    const old=document.getElementById('zz-report-sec'); if(old) old.remove();
    const sec=el('div'); sec.id='zz-report-sec'; sec.style.cssText='padding:72px 0;border-bottom:1px solid var(--b,#2c2c33)';
    const c=el('div'); c.className='c';
    const sl=el('p'); sl.className='sl'; sl.textContent='Report';
    const st=el('h2'); st.className='st'; st.textContent='Campaign Results';
    const wrap=el('div'); wrap.style.cssText='position:relative;width:100%;padding-top:56%;border-radius:12px;overflow:hidden;border:1px solid var(--b,#2c2c33);margin-top:20px';
    const ifr=el('iframe'); ifr.src=embed; ifr.loading='lazy'; ifr.allowFullscreen=true; ifr.allow='fullscreen';
    ifr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none';
    wrap.append(ifr); c.append(sl,st,wrap); sec.append(c);
    const btns=document.querySelector('.btns'); if(btns) btns.before(sec); else document.body.append(sec);
    // hide static results section
    document.querySelectorAll('section').forEach(s=>{ if(s.querySelector('.rg')) s.style.display='none'; });
  }

  function applyArticles(){
    const p=DATA.projects[DATA.active]||DATA.projects[0]||{};
    const arts=(p.articles||[]).filter(a=>(a.body||a.text||'').trim()||(a.title||'').trim());
    const old=document.getElementById('zz-articles-sec'); if(old) old.remove();
    if(!arts.length) return;
    const sec=el('div'); sec.id='zz-articles-sec'; sec.style.cssText='padding:72px 0;border-bottom:1px solid var(--b,#2c2c33)';
    const c=el('div'); c.className='c';
    const sl=el('p'); sl.className='sl'; sl.textContent='Written Content';
    const st=el('h2'); st.className='st'; st.textContent='Posts & Articles';
    c.append(sl,st);
    const feed=el('div'); feed.className='zz-feed'; feed.style.marginTop='24px';
    arts.forEach(a=>{
      const body=(a.body||a.text||'').trim();
      const title=(a.title||'').trim();
      const link=a.link||a.url||'';
      const date=a.date||'';
      const card=el('div'); card.className='zz-tweet';
      // Header
      const hd=el('div'); hd.className='zz-tweet-hd';
      const av=el('div'); av.className='zz-tweet-av'; av.textContent='ZI';
      const meta=el('div'); meta.className='zz-tweet-meta';
      meta.innerHTML='<div class="zz-tweet-name">Abdelaziz Askar</div><div class="zz-tweet-handle">@AbdelazizAskar'+(date?' &middot; '+esc(date):'')+'</div>';
      const xlo=el('div'); xlo.className='zz-tweet-xlogo'; xlo.textContent='𝕏';
      hd.append(av,meta,xlo); card.append(hd);
      if(title){ const h=el('div'); h.className='zz-tweet-title'; h.textContent=title; card.append(h); }
      if(body){ const b=el('div'); b.className='zz-tweet-body'; b.textContent=body; card.append(b); }
      if(link){ const lk=el('a'); lk.className='zz-tweet-link'; lk.href=link; lk.target='_blank'; lk.rel='noopener'; lk.textContent=link.replace(/^https?:\/\//,'').replace(/\/$/,''); card.append(lk); }
      const eng=el('div'); eng.className='zz-tweet-eng';
      [['💬','Reply'],['🔁','Repost'],['❤️','Like'],['📤','Share']].forEach(([ico,lbl])=>{
        const b=el('div'); b.className='zz-tweet-btn'; b.title=lbl;
        b.innerHTML=ico+'<span>—</span>'; eng.append(b);
      });
      card.append(eng); feed.append(card);
    });
    c.append(feed); sec.append(c);
    const btns=document.querySelector('.btns'); if(btns) btns.before(sec); else document.body.append(sec);
  }

  function applyDisplay(){ applyHeroCover(); applyAnalytics(); applyBrandCircle(); applySocialHandles(); applyProcess(); applyArticles(); applyGallery(); applyReports(); }
  function render(){ root.innerHTML=''; renderBrand(); renderProjects(); applyDisplay(); }
  function mount(){
    if(!root.parentNode){
      const sy=window.scrollY;
      root.style.overflowAnchor='none';
      const hero=document.querySelector('.hero')||document.querySelector('nav');
      if(hero&&hero.parentNode) hero.parentNode.insertBefore(root, hero.nextSibling);
      else document.body.insertBefore(root, document.body.firstChild);
      requestAnimationFrame(()=>window.scrollTo({top:sy,behavior:'instant'}));
    }
    render();
  }

  // Cache the load promise so we never fetch projects.json twice.
  let _lp=null;
  function loadOnce(){ if(!_lp) _lp=load(); return _lp; }

  function boot(){
    if(EDIT_MODE){
      // Edit mode: load then build the full panel (single render, no defaults pass).
      loadOnce().then(()=>mount());
      return;
    }
    // Visitor mode: load data and apply display enhancements only — no edit panel DOM.
    loadOnce().then(()=>applyDisplay());
    // If the owner clicks "✏️ Edit" (editor.js adds ze-on to body), lazy-mount the panel.
    const obs=new MutationObserver(()=>{
      if(document.body.classList.contains('ze-on')&&!root.parentNode){
        loadOnce().then(()=>mount()); obs.disconnect();
      }
    });
    obs.observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
