/* Software Abdelaziz works in, with the Simple Icons slug for each logo.
   Shared by tools.html (the full Skills page) and index.html (the homepage
   strip), so the list lives in one place. */
const CATS = [
  {
    name: 'Adobe Creative Suite', color: '#FF0000', pip: '#FF3333',
    tools: [
      {name:'Photoshop', logo:'assets/logos/tool-Photoshop.png',    abbr:'Ps', bg:'#001d34', ic:'#31A8FF', si:'adobephotoshop',  pct:98, since:'2004', level:'Expert',   ctx:'Fine Arts university — 20+ years of daily use across brand design, retouching & campaign KVs'},
      {name:'Illustrator', logo:'assets/logos/tool-Illustrator.png',  abbr:'Ai', bg:'#330b00', ic:'#FF9A00', si:'adobeillustrator',pct:96, since:'2004', level:'Expert',   ctx:'University & professional brand identity. Logos, icons, print layouts, campaign artwork'},
      {name:'InDesign', logo:'assets/logos/tool-InDesign.png',     abbr:'Id', bg:'#1c0010', ic:'#FF3366', si:'adobeindesign',   pct:82, since:'2005', level:'Advanced', ctx:'Print production, brand kits, pitch decks & multi-page publications'},
      {name:'After Effects',abbr:'Ae', bg:'#1a013f', ic:'#9999FF', si:'adobeaftereffects',pct:80,since:'2011', level:'Advanced', ctx:'Motion graphics, animatics, title design & TVC pre-viz at Imagine Studio'},
      {name:'Premiere Pro', logo:'assets/logos/tool-Premiere.png', abbr:'Pr', bg:'#1a013f', ic:'#9999FF', si:'adobepremierepro',pct:85, since:'2014', level:'Advanced', ctx:'TVC editing, social video & full campaign video production at Nineteen84'},
      {name:'Adobe Firefly',abbr:'Ff', bg:'#3d1a00', ic:'#FF6A00', si:'adobefirefly',   pct:72, since:'2024', level:'Advanced', ctx:'AI-assisted design acceleration & generative fill at Tonic International'},
    ]
  },
  {
    name: 'Generative AI & Automation', color: '#6C3AFF', pip: '#8B5CF6',
    tools: [
      {name:'ChatGPT / GPT-4', abbr:'GPT', bg:'#0d0d0d', ic:'#19c37d', si:'openai',        pct:95, since:'2023', level:'Expert',   ctx:'Deployed for creative copy, strategy briefs, pitch decks & AI workflow automation at Tonic'},
      {name:'Midjourney', logo:'assets/logos/tool-Midjourney.png',      abbr:'MJ',  bg:'#000',    ic:'#fff',    si:'midjourney',     pct:92, since:'2023', level:'Expert',   ctx:'Campaign concepts, pitch visuals, mood boards & creative presentations'},
      {name:'Runway ML', logo:'assets/logos/tool-Runway.png',       abbr:'RW',  bg:'#0a0a0a', ic:'#fff',    si:'runway',         pct:85, since:'2024', level:'Advanced', ctx:'AI video generation, inpainting & motion effects at Tonic International Dubai'},
      {name:'ElevenLabs',      abbr:'EL',  bg:'#0f0f0f', ic:'#F5A623', si:'elevenlabs',     pct:90, since:'2024', level:'Expert',   ctx:'AI voiceovers, lip-sync production & multilingual audio for TVCs & social'},
      {name:'Suno AI', logo:'assets/logos/tool-Suno.png',         abbr:'SN',  bg:'#0f0a00', ic:'#E9B52E', si:'sunoai',         pct:92, since:'2024', level:'Expert',   ctx:'Full commercial-grade music production for Escapegoat — no engineering team needed'},
      {name:'DALL-E',          abbr:'DL',  bg:'#0d0d0d', ic:'#19c37d', si:'openai',         pct:80, since:'2023', level:'Advanced', ctx:'Storyboard mockups, concept art & rapid visual ideation'},
      {name:'Adobe Firefly',   abbr:'Ff',  bg:'#3d1a00', ic:'#FF6A00', si:'adobefirefly',   pct:72, since:'2024', level:'Advanced', ctx:'Generative fill, text-to-image & AI-enhanced design inside Creative Cloud'},
      {name:'Stable Diffusion',abbr:'SD',  bg:'#0a1020', ic:'#7c9fff', si:'',               pct:70, since:'2023', level:'Advanced', ctx:'Custom model workflows & fine-tuned brand-consistent image generation'},
    ]
  },
  {
    name: 'Video & Post-Production', color: '#DA0F3F', pip: '#EF4444',
    tools: [
      {name:'DaVinci Resolve', logo:'assets/logos/tool-DaVinci.png',abbr:'DR', bg:'#0a0a14', ic:'#f5a623', si:'davinciresolve',  pct:78, since:'2020', level:'Advanced',    ctx:'Color grading, professional finishing & post-production at Nineteen84'},
      {name:'Final Cut Pro', logo:'assets/logos/tool-FinalCut.png',  abbr:'FC', bg:'#1a0a00', ic:'#FF7A00', si:'apple',           pct:65, since:'2022', level:'Intermediate', ctx:'Fast-turnaround social video edits & quick delivery timelines'},
    ]
  },
  {
    name: 'Design & Prototyping', color: '#0ACF83', pip: '#10B981',
    tools: [
      {name:'Figma',    abbr:'Fg', bg:'#1a0a1a', ic:'#A259FF', si:'figma',  pct:82, since:'2020', level:'Advanced', ctx:'UI designs, team presentation layouts, wireframes & collaborative creative briefs'},
      {name:'Canva Pro', logo:'assets/logos/tool-Canva.png',abbr:'Ca', bg:'#0a1a20', ic:'#00C4CC', si:'canva',  pct:95, since:'2018', level:'Expert',   ctx:'Team-wide content production, social templates & rapid campaign asset delivery'},
    ]
  },
  {
    name: 'Music & Audio Production', color: '#1DB954', pip: '#22C55E',
    tools: [
      {name:'FL Studio', logo:'assets/logos/tool-FLStudio.png', abbr:'FL', bg:'#001a0a', ic:'#F99B1C', si:'flstudio',   pct:82, since:'2011', level:'Advanced',    ctx:'First used as Fruity Loops at Imagine Studio (2011). Returned at pro level for Escapegoat — beat production, arrangement & sound design'},
      {name:'Logic Pro',  abbr:'LP', bg:'#1a0a00', ic:'#FF7A00', si:'apple',     pct:65, since:'2024', level:'Intermediate', ctx:'Recording, mixing & final mastering for commercial-grade music output'},
    ]
  },
  {
    name: 'Social Media & Marketing Platforms', color: '#0061FF', pip: '#3B82F6',
    tools: [
      {name:'Meta Business Suite',         abbr:'Me', bg:'#001a40', ic:'#0081FB', si:'meta',        pct:93, since:'2016', level:'Expert',   ctx:'Multi-brand campaign management, paid social & analytics — 8+ years'},
      {name:'TikTok Studio',               abbr:'Tt', bg:'#1a000a', ic:'#FE2C55', si:'tiktok',      pct:90, since:'2020', level:'Expert',   ctx:'Short-form content strategy, trend analysis & TikTok-first production'},
      {name:'YouTube Studio',              abbr:'Yt', bg:'#1a0000', ic:'#FF0000', si:'youtube',     pct:82, since:'2018', level:'Advanced', ctx:'Channel management, analytics, content optimization & YouTube campaign strategy'},
      {name:'LinkedIn Campaign Manager',   abbr:'Li', bg:'#001a30', ic:'#0A66C2', si:'linkedin',    pct:78, since:'2018', level:'Advanced', ctx:'B2B strategy, lead generation campaigns & professional content management'},
      {name:'Snapchat for Business',       abbr:'Sc', bg:'#1a1a00', ic:'#FFFC00', si:'snapchat',    pct:75, since:'2018', level:'Advanced', ctx:'Snap Ads, AR lens campaigns & Snapchat-first strategy for brands'},
      {name:'Instagram Insights',          abbr:'Ig', bg:'#1a0020', ic:'#E1306C', si:'instagram',   pct:95, since:'2016', level:'Expert',   ctx:'Full-funnel Instagram strategy — organic, paid, Reels & influencer campaigns'},
      {name:'Google Analytics',            abbr:'GA', bg:'#001a10', ic:'#E37400', si:'googleanalytics', pct:75, since:'2015', level:'Advanced', ctx:'Campaign performance tracking, audience analysis & data-driven reporting'},
    ]
  },
];
