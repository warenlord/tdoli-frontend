// public/fcm-init.js — Phase 9 Firebase Notifications
// Version corrigée — demande permission seulement sur action utilisateur

async function initFCM() {
  try {
    if (!firebase.messaging || !firebase.messaging.isSupported()) return;

    const messaging = firebase.messaging();

    messaging.onMessage((payload) => {
      const { title, body } = payload.notification || {};
      const url = (payload.data && payload.data.url) || '/tdoli-deals.html';

      if (Notification.permission === 'granted') {
        const notif = new Notification(title || 'TDOLI', {
          body: body || '',
          icon: '/TDOLI_APP.png',
          badge: '/TDOLI_APP.png',
          data: { url }
        });
        notif.onclick = () => { window.focus(); window.location.href = url; };
      }
    });

    // NE PAS demander la permission automatiquement
    // La permission sera demandée sur action utilisateur (voir requestFCMPermission)
    if (Notification.permission === 'granted') {
      await registerFCMToken(messaging);
    }

  } catch(e) {
    if (e.name !== 'AbortError') console.warn('[FCM]', e.message);
  }
}

// Appeler cette fonction sur un clic utilisateur (bouton notif par ex)
async function requestFCMPermission() {
  try {
    if (!firebase.messaging || !firebase.messaging.isSupported()) return false;
    const messaging = firebase.messaging();
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerFCMToken(messaging);
      return true;
    }
    return false;
  } catch(e) {
    console.warn('[FCM] Permission:', e.message);
    return false;
  }
}

async function registerFCMToken(messaging) {
  try {
    if (!('serviceWorker' in navigator)) return;
    const swReg = await navigator.serviceWorker.ready;

    const fcmToken = await messaging.getToken({
      vapidKey: 'BIXwPIf199mTWr5va5CxZiDyJylmed5978sXEP2RSZzb0h2qiFLSW8GFp8Bjw-Hro9EjK5DEVnxYtvuBUsqoPoRE',
      serviceWorkerRegistration: swReg
    });

    if (!fcmToken) return;

    const savedToken = localStorage.getItem('tdoli_fcm_token');
    if (savedToken === fcmToken) return; // Pas de changement

    const token = localStorage.getItem('tdoli_token');
    if (!token) return;

    await fetch('https://tdoli-backend.onrender.com/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ fcmToken })
    });

    localStorage.setItem('tdoli_fcm_token', fcmToken);
    console.log('[FCM] Token enregistré');
  } catch(e) {
    console.warn('[FCM] Token:', e.message);
  }
}

// Démarrer FCM silencieusement
initFCM();
