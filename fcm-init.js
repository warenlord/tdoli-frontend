// TDOLI — FCM Init v2.0
// À inclure après les scripts Firebase sur toutes les pages
// Utilise le service-worker.js principal (Firebase y est intégré)

(async function initFCM() {
  try {
    if (!firebase.messaging || !firebase.messaging.isSupported()) return;

    const messaging = firebase.messaging();

    // Notifications au premier plan
    messaging.onMessage((payload) => {
      const { title, body } = payload.notification || {};
      const url = (payload.data && payload.data.url) || '/tdoli-deals.html';
      if (Notification.permission === 'granted') {
        const notif = new Notification(title || 'TDOLI', {
          body: body || '',
          icon: '/TDOLI_APP.png',
          data: { url }
        });
        notif.onclick = () => { window.focus(); window.location.href = url; };
      }
    });

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Dés-inscrire l'ancien firebase-messaging-sw.js s'il existe encore
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const scriptURL = (reg.active || reg.installing || reg.waiting || {}).scriptURL || '';
        if (scriptURL.includes('firebase-messaging-sw')) {
          await reg.unregister();
          console.log('[FCM] Ancien SW FCM désinscrit');
        }
      }
    }

    // Utiliser le service worker principal (service-worker.js)
    const swReg = await navigator.serviceWorker.ready;

    const fcmToken = await messaging.getToken({
      vapidKey: 'BIXwPIf199mTWr5vo5CxZiDyJylmed5978sXEP2RSZzb0h2qiFLSW8GFp8WjwHro9EjK5DEVnxYtvuBUsqoPoRE',
      serviceWorkerRegistration: swReg
    });

    if (!fcmToken) return;

    const savedToken = localStorage.getItem('tdoli_fcm_token');
    if (savedToken === fcmToken) return;

    const token = localStorage.getItem('tdoli_token');
    if (!token) return;

    const API = 'https://tdoli-backend.onrender.com';
    await fetch(API + '/notifications/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ fcmToken })
    });

    localStorage.setItem('tdoli_fcm_token', fcmToken);
    console.log('[FCM] Token enregistré');

  } catch(e) {
    console.warn('[FCM] Erreur:', e.message);
  }
})();
