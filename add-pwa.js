const fs = require('fs');

const pwaHead = `
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#060d09">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="TDOLI">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
  <script>
    if('serviceWorker' in navigator){
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(r => console.log('[SW] Enregistre'))
          .catch(e => console.error('[SW] Erreur:', e));
      });
    }
  <\/script>`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('manifest.json')) {
    content = content.replace('</head>', pwaHead + '\n</head>');
    fs.writeFileSync(file, content);
    console.log('Modifie:', file);
  } else {
    console.log('Deja fait:', file);
  }
});

console.log('Termine !');
