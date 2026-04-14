const fs = require('fs');

// Style CSS à ajouter pour le logo
const logoCSS = `
.topbar-logo img {
  height: 32px;
  width: auto;
  display: block;
}`;

// Nouveau HTML du logo — image à la place du texte
const logoHTML = `<div class="topbar-logo"><img src="/TD_LI.png" alt="TDOLI"></div>`;

// Ancien pattern du logo texte multicolore
const oldPatterns = [
  /<div class="topbar-logo"><span class="l1">T<\/span><span class="l2">D<\/span><span class="l3">O<\/span><span class="l4">L<\/span><span class="l5">I<\/span><\/div>/g,
  /<div class="topbar-logo">TDOLI<\/div>/g,
  /<div class="topbar-logo"><span class="l1">T<\/span><span class="l2">D<\/span><span class="l3">O<\/span><span class="l4">L<\/span><span class="l5">I<\/span><\/div>/g
];

const files = fs.readdirSync('.').filter(f => 
  f.endsWith('.html') && f !== 'offline.html' && f !== 'tdoli-cgu.html'
);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  oldPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, logoHTML);
      modified = true;
    }
    pattern.lastIndex = 0;
  });

  // Ajouter le CSS du logo dans le style si pas encore présent
  if (modified && !content.includes('topbar-logo img')) {
    content = content.replace('</style>', logoCSS + '\n</style>');
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('✓ Modifié:', file);
  } else {
    console.log('⏭ Pas de logo trouvé:', file);
  }
});

console.log('Terminé !');
