/* ── BRAND VIDEO PLAYER ─────────────────────────────────────────────────────
   Add a Vimeo ID next to any brand slug below.
   The player auto-injects above the first section on that brand's page.
   Leave empty ('') to show the "coming soon" placeholder instead.
   ────────────────────────────────────────────────────────────────────────── */
(function(){
  const BRAND_VIDEOS = {
    'Geely':                   '',
    'Subway-Oman':             '',
    'Audi':                    '',
    'Snapchat':                '',
    'Warba-Bank':              '',
    'Kappa':                   '',
    'EA-FC-Mobile':            '',
    'Molfix':                  '',
    'Carina':                  '',
    'Bazooka-Candy':           '',
    'Hardees':                 '',
    'MTN':                     '',
    'American-Express':        '',
    'URBEELS':                 '',
    'AXE-Unilever':            '',
    'Bershka':                 '',
    'Krispy-Kreme':            '',
    'Quooker':                 '',
    'Royal-Herbs':             '',
    'Glow':                    '',
    'Delight-Parties':         '',
    'Gourmet':                 '',
    'Royal-Tulip-Hotel':       '',
    'Tonic-International':     '',
    'Septam-Foods':            '',
    'Juicy-Drop':              '',
    'Decoys-Real-Estate':      '',
    'No-Limits-Furniture':     '',
    'Lord-of-the-Wings':       '',
    'GDK':                     '',
    'Brew-Craft':              '',
    'WallPost':                '',
    'Fahel-Brand':             '',
    'Imagine-Studio':          '',
    'ABtalks':                 '',
    'ACUD':                    '',
    'Al-Siddiqi-Holding':      '',
    'Almaza-Bay':              '',
    'Bibliotheca-Alexandrina': '',
    'Biella':                  '',
    'Big-Baby-Pop':            '',
    'Bonny':                   '',
    'Burger-Pump':             '',
    'CAPA':                    '',
    'Chouchou':                '',
    'Defarm':                  '',
    'Deraya':                  '',
    'El-Gouna':                '',
    'Eldib-Co':                '',
    'Em-Sherif-Cafe':          '',
    'Emirgan-Sutis':           '',
    'Gillette-Venus':          '',
    'Hayat-Water':             '',
    'Inside-Out-Art':          '',
    'Lifebox':                 '',
    'Mansour':                 '',
    'Mayo-Clinic':             '',
    'Medina':                  '',
    'Mooz':                    '',
    'Mostique':                '',
    'MTM':                     '',
    'Nineteen84':              '',
    'Noodle-House':            '',
    'One-Zaabeel':             '',
    'Polo-Ralph-Lauren':       '',
    'Revitalash':              '',
    'Ring-Pop':                '',
    'Steam-Cola':              '',
    'The-Center':              '',
    'The-G-Hotels':            '',
    'Zooba':                   '',
  };

  const parts = location.pathname.replace(/\\/g,'/').split('/');
  const ci = parts.indexOf('clients');
  if (ci === -1) return;
  const slug = parts[ci + 1];
  if (!slug || !(slug in BRAND_VIDEOS)) return;

  const id = BRAND_VIDEOS[slug];
  const target = document.querySelector('section');
  if (!target) return;

  const sec = document.createElement('section');
  sec.style.cssText = 'padding:0;border-bottom:1px solid var(--b,#2c2c33)';

  if (id) {
    sec.innerHTML =
      '<div style="width:100%;aspect-ratio:16/9;background:#000;position:relative">' +
        '<iframe src="https://player.vimeo.com/video/' + id +
          '?color=f0c233&title=0&byline=0&portrait=0&dnt=1"' +
          ' width="100%" height="100%"' +
          ' style="position:absolute;inset:0;border:none"' +
          ' allow="autoplay;fullscreen;picture-in-picture" allowfullscreen>' +
        '</iframe>' +
      '</div>';
  } else {
    sec.innerHTML =
      '<div style="width:100%;aspect-ratio:16/9;background:#0e0e10;display:flex;' +
        'flex-direction:column;align-items:center;justify-content:center;gap:10px;' +
        'border-top:1px solid var(--b,#2c2c33)">' +
        '<div style="width:56px;height:56px;border-radius:50%;border:2px solid #333;' +
          'display:flex;align-items:center;justify-content:center;font-size:22px;color:#555">▶</div>' +
        '<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;' +
          'color:#555;font-family:Inter,system-ui,sans-serif">Campaign video — coming soon</div>' +
      '</div>';
  }

  target.parentNode.insertBefore(sec, target);
})();
