const fs = require('fs');

// Logo topbar — perroquet seul (toutes pages sauf auth)
const logoTopbar = `<div class="topbar-logo"><img src="/TDOLI_APP.png" alt="TDOLI" style="height:32px;width:auto;display:block;"></div>`;

// CSS logo topbar
const logoCSS = `
.topbar-logo img { height: 32px; width: auto; display: block; }`;

// Patterns logo existants à remplacer dans topbar
const topbarPatterns = [
  /<div class="topbar-logo"><img src="\/TD_LI\.png"[^>]*><\/div>/g,
  /<div class="topbar-logo"><img src="\/TDOLI_APP\.png"[^>]*><\/div>/g,
  /<div class="topbar-logo"><span[^>]*>.*?<\/div>/g,
  /<div class="topbar-logo">TDOLI<\/div>/g,
];

// Pages avec topbar (pas auth)
const topbarPages = ['tdoli-feed.html','tdoli-deals.html','tdoli-chat.html','tdoli-profile.html','tdoli-admin.html','tdoli-cgu.html'];

topbarPages.forEach(file => {
  if (!fs.existsSync(file)) { console.log('⏭ Absent:', file); return; }
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  topbarPatterns.forEach(p => {
    if (p.test(content)) { content = content.replace(p, logoTopbar); modified = true; }
    p.lastIndex = 0;
  });
  if (modified && !content.includes('topbar-logo img')) {
    content = content.replace('</style>', logoCSS + '\n</style>');
  }
  fs.writeFileSync(file, content);
  console.log(modified ? '✓ Modifié:' : '⏭ Inchangé:', file);
});

// Page auth — perroquet + texte TDOLI vert
if (fs.existsSync('tdoli-auth.html')) {
  let content = fs.readFileSync('tdoli-auth.html', 'utf8');

  // Header : remplacer tout le bloc logo par perroquet + TDOLI texte
  const headerPatterns = [
    /<img src="\/TDOLI_APP\.png"[^>]*>\s*<img src="\/TD_LI\.png"[^>]*>/g,
    /<div class="logo-ring">.*?<\/div>\s*<div class="logo-text">.*?<\/div>/gs,
    /<img src="\/TDOLI_APP\.png"[^>]*>/g,
  ];

  const newHeader = `<img src="/TDOLI_APP.png" alt="TDOLI" style="width:80px;height:80px;margin:0 auto 12px;display:block;">
    <svg height="32" viewBox="0 0 108 32" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
      <text y="28" font-family="Arial,sans-serif" font-weight="900" font-size="32" letter-spacing="-3" fill="#00c97a">TDOLI</text>
    </svg>`;

  let modified = false;
  headerPatterns.forEach(p => {
    if (p.test(content)) { content = content.replace(p, newHeader); modified = true; }
    p.lastIndex = 0;
  });

  // Redirect overlay : perroquet + TDOLI texte
  const oldRedirect1 = /<img src="\/TDOLI_APP\.png"[^>]*>\s*<img src="\/TD_LI\.png"[^>]*>\s*(<div class="redirect-bar">)/;
  const oldRedirect2 = /<div class="redirect-logo">TDOLI<\/div>/;
  const newRedirect = `<img src="/TDOLI_APP.png" alt="TDOLI" style="width:72px;height:72px;animation:breathe 1.2s ease infinite;">
  <svg height="24" viewBox="0 0 90 24" xmlns="http://www.w3.org/2000/svg" style="animation:breathe 1.2s ease infinite;">
    <text y="21" font-family="Arial,sans-serif" font-weight="900" font-size="24" letter-spacing="-2" fill="#00c97a">TDOLI</text>
  </svg>`;

  if (oldRedirect1.test(content)) {
    content = content.replace(oldRedirect1, newRedirect + '\n  $1');
    modified = true;
  } else if (oldRedirect2.test(content)) {
    content = content.replace(oldRedirect2, newRedirect);
    modified = true;
  }

  fs.writeFileSync('tdoli-auth.html', content);
  console.log(modified ? '✓ Modifié: tdoli-auth.html' : '⏭ Inchangé: tdoli-auth.html');
}

// Page reset — perroquet seul
if (fs.existsSync('tdoli-reset.html')) {
  let content = fs.readFileSync('tdoli-reset.html', 'utf8');
  const old = /<img src="\/TDOLI_APP\.png"[^>]*>\s*<img src="\/TD_LI\.png"[^>]*>/g;
  const newLogo = `<img src="/TDOLI_APP.png" alt="TDOLI" style="width:56px;height:56px;margin:0 auto 10px;display:block;">`;
  if (old.test(content)) { content = content.replace(old, newLogo); }
  old.lastIndex = 0;
  fs.writeFileSync('tdoli-reset.html', content);
  console.log('✓ Modifié: tdoli-reset.html');
}

console.log('\nTerminé !');
