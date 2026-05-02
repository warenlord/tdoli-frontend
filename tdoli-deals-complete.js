// ═══════════════════════════════════════════════════════════
// TDOLI — Overlay "Deal Complété" partagé v1.0
// Inclure dans : feed, messages, chat, profile, deals
// ═══════════════════════════════════════════════════════════

(function() {
  const API = 'https://tdoli-backend.onrender.com';
  const token = localStorage.getItem('tdoli_token');
  if (!token) return;

  // ── Injection HTML overlay ──────────────────────────────
  const overlayHTML = `
<div class="deal-complete-overlay" id="dealCompleteOverlay">
  <div class="confetti-wrap" id="dcoConfetti"></div>
  <div class="dco-parrot"><img src="/TDOLI_APP.png" alt="TDOLI"></div>
  <div class="dco-title">Deal complété ! 🎉</div>
  <div class="dco-sub" id="dcoSub">L'échange a été validé avec succès.</div>
  <div class="dco-code" id="dcoCode" style="display:none;"></div>
  <div class="dco-rating" id="dcoRating" style="display:none;">
    <div class="dco-rating-title">Note ton partenaire</div>
    <div class="dco-rating-name" id="dcoPartnerName"></div>
    <div class="dco-stars" id="dcoStars">
      <span class="dco-star" data-n="1" onclick="dcSetStar(1)">⭐</span>
      <span class="dco-star" data-n="2" onclick="dcSetStar(2)">⭐</span>
      <span class="dco-star" data-n="3" onclick="dcSetStar(3)">⭐</span>
      <span class="dco-star" data-n="4" onclick="dcSetStar(4)">⭐</span>
      <span class="dco-star" data-n="5" onclick="dcSetStar(5)">⭐</span>
    </div>
    <textarea class="dco-comment" id="dcoComment" placeholder="Commentaire (optionnel)..."></textarea>
    <button class="dco-btn-rate" onclick="dcSubmitRating()">Envoyer ma note</button>
    <button class="dco-btn-later" onclick="dcDismiss()">Plus tard</button>
  </div>
  <button class="dco-btn-later" id="dcoBtnLater" onclick="dcDismiss()">Continuer →</button>
</div>`;

  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // ── État ────────────────────────────────────────────────
  window.dcSelectedStar = 0;
  window.dcDealId = null;

  // ── Étoiles ─────────────────────────────────────────────
  window.dcSetStar = function(n) {
    window.dcSelectedStar = n;
    document.querySelectorAll('.dco-star').forEach((s, i) => {
      s.classList.toggle('active', i < n);
    });
  };

  // ── Confetti ─────────────────────────────────────────────
  window.spawnConfetti = function() {
    const wrap = document.getElementById('dcoConfetti');
    if (!wrap) return;
    wrap.innerHTML = '';
    const colors = ['#00e676','#ffd740','#2979ff','#ff1744','#ffffff'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const size = 6 + Math.random() * 8;
      el.style.cssText = 'left:' + Math.random() * 100 + 'vw;top:-10px;background:' +
        colors[Math.floor(Math.random() * colors.length)] +
        ';animation-duration:' + (1.5 + Math.random() * 2) + 's;animation-delay:' +
        (Math.random() * 1.5) + 's;width:' + size + 'px;height:' + size + 'px;';
      wrap.appendChild(el);
    }
  };

  // ── Afficher overlay ─────────────────────────────────────
  window.showDealCompleteOverlay = function(dealId, dealCode, partnerName, amount, currency) {
    window.dcDealId = dealId;
    window.dcSelectedStar = 0;

    const sub      = document.getElementById('dcoSub');
    const code     = document.getElementById('dcoCode');
    const rating   = document.getElementById('dcoRating');
    const btnLater = document.getElementById('dcoBtnLater');
    const nameEl   = document.getElementById('dcoPartnerName');
    const comment  = document.getElementById('dcoComment');

    if (sub && amount) sub.textContent = 'Échange de ' + Number(amount).toLocaleString('fr-FR') + ' ' + currency + ' validé !';
    if (code && dealCode) { code.textContent = dealCode; code.style.display = 'block'; }
    if (nameEl && partnerName) nameEl.textContent = partnerName;
    if (comment) comment.value = '';
    document.querySelectorAll('.dco-star').forEach(s => s.classList.remove('active'));

    // Vérifier si déjà noté via localStorage
    const alreadyRated = localStorage.getItem('tdoli_rated_' + dealId) === '1';

    if (alreadyRated) {
      // Déjà noté — afficher message sans formulaire
      if (rating) {
        rating.innerHTML = '<div style="padding:14px;text-align:center;color:var(--green);font-family:\'Syne\',sans-serif;font-weight:700;font-size:14px;">⭐ Tu as déjà noté ce deal</div>';
        rating.style.display = 'block';
      }
      if (btnLater) btnLater.textContent = 'Continuer →';
    } else if (partnerName && rating) {
      // Pas encore noté — afficher formulaire
      rating.style.display = 'block';
      if (btnLater) btnLater.style.display = 'none';
    }

    document.getElementById('dealCompleteOverlay').classList.add('show');
    window.spawnConfetti();
  };

  // ── Soumettre la note ────────────────────────────────────
  window.dcSubmitRating = async function() {
    if (!window.dcSelectedStar) {
      // Toast si disponible
      if (typeof showToast === 'function') showToast('Sélectionne une note', '#ff1744');
      return;
    }
    if (!window.dcDealId) { window.dcDismiss(); return; }

    const comment = document.getElementById('dcoComment')?.value || '';
    const btn = document.querySelector('.dco-btn-rate');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.5s linear infinite;vertical-align:middle;margin-right:6px;"></span>Envoi...'; }

    try {
      const r = await fetch(API + '/deals/' + window.dcDealId + '/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ rating: window.dcSelectedStar, comment })
      });
      if (r.ok) {
        // Persister la notation dans localStorage
        localStorage.setItem('tdoli_rated_' + window.dcDealId, '1');
        // Mettre à jour le Set local si deals.html l'expose
        if (window.ratedDeals) window.ratedDeals.add(window.dcDealId);
        if (typeof showToast === 'function') showToast('Note envoyée ! ⭐', 'var(--green-dim)');
      } else {
        if (typeof showToast === 'function') showToast('Erreur lors de l\'envoi', '#ff1744');
      }
    } catch(e) {
      if (typeof showToast === 'function') showToast('Erreur réseau', '#ff1744');
    }
    window.dcDismiss();
  };

  // ── Fermer overlay ───────────────────────────────────────
  window.dcDismiss = function() {
    document.getElementById('dealCompleteOverlay').classList.remove('show');
    try {
      const seen = JSON.parse(localStorage.getItem('tdoli_seen_completed') || '[]');
      if (window.dcDealId && !seen.includes(window.dcDealId)) {
        seen.push(window.dcDealId);
        if (seen.length > 20) seen.splice(0, seen.length - 20);
        localStorage.setItem('tdoli_seen_completed', JSON.stringify(seen));
      }
    } catch(e) {}
    // Recharger si deals.html expose loadDeals
    if (typeof loadDeals === 'function') loadDeals(true);
  };

  // ── Vérifier deals complétés ─────────────────────────────
  window.checkDealCompletedFlag = async function() {
    try {
      const seen = JSON.parse(localStorage.getItem('tdoli_seen_completed') || '[]');
      const r = await fetch(API + '/deals/mine', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!r.ok) return;
      const deals = await r.json();
      if (!Array.isArray(deals)) return;
      const newlyCompleted = deals.find(d => d.status === 'completed' && !seen.includes(d._id));
      if (!newlyCompleted) return;
      const amount   = newlyCompleted.myAmount   || newlyCompleted.amount   || null;
      const currency = newlyCompleted.myCurrency || newlyCompleted.currency || null;
      setTimeout(() => window.showDealCompleteOverlay(
        newlyCompleted._id,
        newlyCompleted.dealCode     || null,
        newlyCompleted.otherUsername || null,
        amount,
        currency
      ), 800);
    } catch(e) {}
  };

  // ── Lancer la vérification au chargement ─────────────────
  window.addEventListener('DOMContentLoaded', () => {
    window.checkDealCompletedFlag();
  });

  // ── Re-vérifier quand l'app revient au premier plan ──────
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') window.checkDealCompletedFlag();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.checkDealCompletedFlag();
  });

})();
