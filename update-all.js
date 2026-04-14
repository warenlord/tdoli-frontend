const fs = require('fs');

// CSS commun à ajouter
const commonCSS = `
.topbar-left{display:flex;align-items:center;}
.topbar-right{display:flex;align-items:center;gap:10px;}
.user-avatar-btn{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#009e60,#1a4fff);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#fff;border:none;cursor:pointer;text-decoration:none;flex-shrink:0;border:1.5px solid rgba(0,201,122,0.3);}
.share-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;background:rgba(0,201,122,0.1);border:1px solid rgba(0,201,122,0.25);border-radius:20px;color:#00c97a;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;}
.share-btn:active{opacity:0.7;}
.topbar-logo-img{height:28px;width:auto;display:block;}`;

// Nouvelle topbar avec avatar + parrainage
function buildTopbar(activePage) {
  return `<div class="topbar">
  <div class="topbar-left">
    <a href="/tdoli-profile.html" class="user-avatar-btn" id="avatarBtn">?</a>
  </div>
  <div style="flex:1;"></div>
  <div class="topbar-right">
    <button class="share-btn" onclick="shareApp()">🎁 Parrainer</button>
  </div>
</div>`;
}

// Script parrainage à ajouter dans chaque page
const shareScript = `
function shareApp(){
  const username=localStorage.getItem('tdoli_username')||'ami';
  const msg='Rejoins-moi sur TDOLI — la plateforme de transfert P2P pour la diaspora africaine !\\n\\nInscris-toi ici : https://tdoli.com\\n\\nParrainé par '+username;
  if(navigator.share){navigator.share({title:'TDOLI',text:msg,url:'https://tdoli.com'});}
  else{
    const wa='https://wa.me/?text='+encodeURIComponent(msg);
    window.open(wa,'_blank');
  }
}
function initAvatar(){
  const username=localStorage.getItem('tdoli_username')||localStorage.getItem('tdoli_email')||'?';
  const initials=username.substring(0,2).toUpperCase();
  const btn=document.getElementById('avatarBtn');
  if(btn)btn.textContent=initials;
}
document.addEventListener('DOMContentLoaded',initAvatar);`;

// Pages à modifier (topbar standard)
const pages = ['tdoli-feed.html','tdoli-deals.html','tdoli-chat.html','tdoli-profile.html'];

pages.forEach(file => {
  if (!fs.existsSync(file)) { console.log('⏭ Absent:', file); return; }
  let content = fs.readFileSync(file, 'utf8');

  // Remplacer la topbar entière
  const topbarRegex = /<div class="topbar">[\s\S]*?<\/div>\s*(?=<div class="filter|<div class="content|<div class="mm-bar|<div class="deal-sum)/;
  
  if (topbarRegex.test(content)) {
    content = content.replace(topbarRegex, buildTopbar(file) + '\n');
  }

  // Ajouter CSS si absent
  if (!content.includes('share-btn')) {
    content = content.replace('</style>', commonCSS + '\n</style>');
  }

  // Ajouter script parrainage avant </script> final
  if (!content.includes('shareApp')) {
    content = content.replace('</script>\n</body>', shareScript + '\n</script>\n</body>');
  }

  fs.writeFileSync(file, content);
  console.log('✓ Modifié:', file);
});

// Page auth — perroquet + TDOLI + fond transparent
if (fs.existsSync('tdoli-auth.html')) {
  let content = fs.readFileSync('tdoli-auth.html', 'utf8');

  // Remplacer le header logo
  const logoPatterns = [
    /<img src="\/TDOLI_APP\.png"[^>]*>\s*\n?\s*<svg[^>]*>[\s\S]*?<\/svg>/,
    /<img src="\/TDOLI_APP\.png"[^>]*>\s*<img src="\/TD_LI\.png"[^>]*>/,
    /<div class="logo-ring">[\s\S]*?<\/div>\s*<div class="logo-text">[\s\S]*?<\/div>/,
  ];

  const newAuthLogo = `<img src="/TDOLI_APP.png" alt="TDOLI" style="width:88px;height:88px;margin:0 auto 14px;display:block;">
    <img src="/TD_LI.png" alt="TDOLI" style="height:36px;width:auto;margin:0 auto;display:block;">`;

  let modified = false;
  for (const p of logoPatterns) {
    if (p.test(content)) {
      content = content.replace(p, newAuthLogo);
      modified = true;
      break;
    }
  }

  // Redirect overlay
  const redirectPatterns = [
    /<img src="\/TDOLI_APP\.png"[^>]*>\s*\n?\s*<svg[^>]*>[\s\S]*?<\/svg>/,
    /<div class="redirect-logo">TDOLI<\/div>/,
  ];
  const newRedirect = `<img src="/TDOLI_APP.png" alt="TDOLI" style="width:72px;height:72px;animation:breathe 1.2s ease infinite;display:block;margin:0 auto;">
  <img src="/TD_LI.png" alt="TDOLI" style="height:28px;width:auto;margin:0 auto;animation:breathe 1.2s ease infinite;">`;

  for (const p of redirectPatterns) {
    if (p.test(content)) {
      content = content.replace(p, newRedirect);
      modified = true;
      break;
    }
  }

  fs.writeFileSync('tdoli-auth.html', content);
  console.log(modified ? '✓ Modifié: tdoli-auth.html' : '⏭ Inchangé: tdoli-auth.html');
}

console.log('\nTerminé !');
