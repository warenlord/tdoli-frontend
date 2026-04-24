// TDOLI — FCM Init v1.0
// À inclure après les scripts Firebase sur toutes les pages

(async function initFCM() {
  try {
    if (!firebase.messaging || !firebase.messaging.isSupported()) return;

    const messaging = firebase.messaging();

    // Notifications au premier plan
    messaging.onMessage((payload) => {
      console.log('[FCM] Message reçu:', payload);
      const { title, body } = payload.notification || {};
      const url = payload.data?.url || '/tdoli-deals.html';
      if (Notification.permission === 'granted') {
        const notif = new Notification(title || 'TDOLI', {
          body: body || '',
          icon: '/TDOLI_APP.png',
          data: { url }
        });
        notif.onclick = () => { window.focus(); window.location.href = url; };
      }
    });

    // Enregistrement du token
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

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
