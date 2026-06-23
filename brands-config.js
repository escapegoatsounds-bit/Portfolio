/* ── BRANDS CONFIG ─────────────────────────────────────────────────────────
   Single source of truth for all extended brand metadata.
   Edit via the Brand Manager (Brands panel → Manage Brands) in edit mode,
   or directly here. Changes reflect in every panel on the phone navigator.

   platforms keys → which phone panels show this brand:
     'instagram'  → Instagram feed
     'youtube'    → YouTube panel
     'tiktok'     → TikTok For You
     'x'          → X / Twitter timeline
     'camera'     → Photography panel
     'photoshop'  → Design & Artwork panel
     'powerpoint' → Strategy panel
     'chatgpt'    → AI panel
     'spotify'    → Music / Escapegoat panel
     'slack'      → Startups panel
     'linkedin'   → LinkedIn / Resume panel
     'messages'   → Testimonials panel
   ────────────────────────────────────────────────────────────────────────── */
window.BRAND_CONFIG = {

  'Geely': {
    platforms: ['instagram','youtube'],
    role: 'Creative Director',
    year: '2024',
    tags: ['TVC','ATL','OOH','Automotive'],
    desc: 'National launch campaign for the Geely Coolray in UAE. Full creative from concept to on-air — TVC direction, OOH design, digital rollout.',
    banner: '',
    vimeo: ''
  },

  'Kappa': {
    platforms: ['instagram','tiktok','youtube'],
    role: 'Lead Creative',
    year: '2023',
    tags: ['Ramadan','ATL','Photography','Social'],
    desc: 'Ramadan campaign spanning social, TVC and OOH for Kappa Egypt. Art direction, photography and copy — all in-house.',
    banner: '',
    vimeo: ''
  },

  'Bazooka-Candy': {
    platforms: ['instagram','tiktok'],
    role: 'Creative Lead',
    year: '2022',
    tags: ['Character Design','Branding','FMCG','Social'],
    desc: 'Mascot design and character universe for the MENA market — personality guidelines, animation briefs, POS and social rollout.',
    banner: '',
    vimeo: ''
  },

  'Subway-Oman': {
    platforms: ['instagram','x'],
    role: 'Lead Creative',
    year: '2023',
    tags: ['BTL','Copy','Social','QSR'],
    desc: 'BTL creative and copywriting for SubSavers promotion. Social-first campaign with bilingual copy.',
    banner: '',
    vimeo: ''
  },

  'Molfix': {
    platforms: ['instagram','youtube'],
    role: 'Lead Creative',
    year: '2023',
    tags: ['TVC','Production','FMCG'],
    desc: 'TVC production — concept through final delivery. Directed and produced the full campaign suite.',
    banner: '',
    vimeo: ''
  },

  'Audi': {
    platforms: ['instagram','youtube','camera'],
    role: 'Creative Director',
    year: '2023',
    tags: ['TVC','Photography','Automotive'],
    desc: 'Brand campaign photography and TVC direction for Audi UAE.',
    banner: '',
    vimeo: ''
  },

  'EA-FC-Mobile': {
    platforms: ['youtube','tiktok'],
    role: 'Production Manager',
    year: '2024',
    tags: ['TVC','Gaming','Social'],
    desc: 'Regional TVC production for EA FC Mobile launch campaign.',
    banner: '',
    vimeo: ''
  },

  'Warba-Bank': {
    platforms: ['youtube','chatgpt'],
    role: 'Creative Director',
    year: '2024',
    tags: ['AI Animatics','TVC','Banking','Kuwait'],
    desc: 'First AI-assisted TVC pitch in MENA. Used AI animatics to present before committing to production budget.',
    banner: '',
    vimeo: ''
  },

  'Hardees': {
    platforms: ['youtube'],
    role: 'Creative Director',
    year: '2022',
    tags: ['TVC','QSR'],
    desc: "TVC direction for Hardee's brand campaign.",
    banner: '',
    vimeo: ''
  },

  'Snapchat': {
    platforms: ['powerpoint','tiktok'],
    role: 'Strategist',
    year: '2022',
    tags: ['B2B','Lead Gen','Strategy','Gulf'],
    desc: 'B2B lead generation strategy and Gulf market social campaign.',
    banner: '',
    vimeo: ''
  },

  'MTN': {
    platforms: ['instagram','tiktok','camera'],
    role: 'Director',
    year: '2022',
    tags: ['Social','Video','Photography','Telecom'],
    desc: 'Brand video direction and campaign photography for MTN.',
    banner: '',
    vimeo: ''
  },

  'Royal-Herbs': {
    platforms: ['instagram','tiktok'],
    role: 'Campaign Lead',
    year: '2023',
    tags: ['Influencer','Organic','PR','FMCG'],
    desc: 'Authentic influencer push — zero paid media, full organic reach strategy.',
    banner: '',
    vimeo: ''
  },

  'AXE-Unilever': {
    platforms: ['instagram','photoshop','camera'],
    role: 'Art Director',
    year: '2022',
    tags: ['Key Visuals','Photography','FMCG'],
    desc: 'Art direction, key visual production and commercial photography for AXE.',
    banner: '',
    vimeo: ''
  },

  'Krispy-Kreme': {
    platforms: ['instagram','powerpoint'],
    role: 'Social Strategist',
    year: '2022',
    tags: ['Egypt Entry','Strategy','Social','F&B'],
    desc: 'Egypt market entry strategy and social launch for Krispy Kreme.',
    banner: '',
    vimeo: ''
  },

  'Carina': {
    platforms: ['powerpoint'],
    role: 'Brand Strategist',
    year: '2020',
    tags: ['Strategy','FMCG','Long-term'],
    desc: '5-year brand partner — social strategy, brand voice, and campaign planning.',
    banner: '',
    vimeo: ''
  },

  'Quooker': {
    platforms: ['powerpoint','instagram'],
    role: 'Strategist',
    year: '2023',
    tags: ['Social','TVC','Strategy','Home'],
    desc: 'Social strategy and TVC production for Quooker UAE.',
    banner: '',
    vimeo: ''
  },

  'Brew-Craft': {
    platforms: ['photoshop'],
    role: 'Designer',
    year: '2021',
    tags: ['Logo','Branding','Design'],
    desc: 'Full brand identity — logo, visual system, packaging direction.',
    banner: '',
    vimeo: ''
  },

  'Imagine-Studio': {
    platforms: ['photoshop','slack'],
    role: 'Co-founder',
    year: '2014',
    tags: ['Studio','Design','Photography'],
    desc: 'Co-founded and ran Imagine Creative Studio — photography, design, video.',
    banner: '',
    vimeo: ''
  },

  'Delight-Parties': {
    platforms: ['instagram','camera'],
    role: 'Creative Lead',
    year: '2021',
    tags: ['Social','Photography','Events'],
    desc: 'Social launch, brand photography, inbound/outbound funnel and QA.',
    banner: '',
    vimeo: ''
  },

  'Glow': {
    platforms: ['instagram','x'],
    role: 'Strategy',
    year: '2021',
    tags: ['Social','Design','Beauty'],
    desc: 'Social strategy and creative for Glow skincare — kept the brand top of mind.',
    banner: '',
    vimeo: ''
  },

  'Decoys-Real-Estate': {
    platforms: ['instagram'],
    role: 'Brand Director',
    year: '2019',
    tags: ['Brand Launch','Digital','Real Estate'],
    desc: 'Built the Decoys brand from scratch as Egypt shifted to digital-first real estate.',
    banner: '',
    vimeo: ''
  },

  'Fahel-Brand': {
    platforms: ['slack'],
    role: 'Founder',
    year: '2020',
    tags: ['Startup','Founded'],
    desc: 'Founded and built the Fahel brand.',
    banner: '',
    vimeo: ''
  },

  'URBEELS': {
    platforms: ['slack','instagram','tiktok'],
    role: 'Co-creator',
    year: '2021',
    tags: ['Music','Events','Startup'],
    desc: 'Co-created URBEELS — music, events, and cultural brand.',
    banner: '',
    vimeo: ''
  },

  'Warba-Bank': {
    platforms: ['youtube','chatgpt'],
    role: 'Creative Director',
    year: '2024',
    tags: ['AI','TVC','Banking'],
    desc: 'First AI-animated TVC pitch in MENA.',
    banner: '',
    vimeo: ''
  },

  'Mayo-Clinic': {
    platforms: ['chatgpt'],
    role: 'AI Consultant',
    year: '2024',
    tags: ['AI','Healthcare','Automation'],
    desc: 'Patient comms automation and AI content workflows for healthcare.',
    banner: '',
    vimeo: ''
  }

};

/* localStorage overrides merge on top — set by the Brand Manager UI */
(function(){
  try {
    const ov = JSON.parse(localStorage.getItem('bc_overrides') || '{}');
    Object.keys(ov).forEach(slug => {
      window.BRAND_CONFIG[slug] = Object.assign({}, window.BRAND_CONFIG[slug] || {}, ov[slug]);
    });
  } catch(e){}
})();
