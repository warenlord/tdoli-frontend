// jobs/autoDisputeJob.js — Phase 4 Anti-disparition
// Lance un cron toutes les heures pour vérifier les deals expirés

const Transfer = require('../models/Transfer');
const User = require('../models/User');
const Message = require('../models/Message');

async function runAutoDisputeCheck() {
  try {
    const now = new Date();

    // Trouver les deals matched depuis plus de 24h sans confirmation
    const expiredDeals = await Transfer.find({
      status: 'matched',
      autoDisputeTriggered: false,
      matchedAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) }
    });

    for (const deal of expiredDeals) {
      const issues = [];

      // Vérifier qui n'a pas confirmé
      if (!deal.confirmedBySender) issues.push(deal.sender);
      if (!deal.confirmedByReceiver) issues.push(deal.receiverEmail);

      if (issues.length === 0) continue;

      // Passer en litige automatique
      await Transfer.findByIdAndUpdate(deal._id, {
        status: 'dispute',
        autoDisputeTriggered: true,
        disputeReason: 'Délai de 24h dépassé sans confirmation des deux parties'
      });

      // Envoyer un message système dans le chat du deal
      await Message.create({
        dealId: deal._id,
        sender: 'system',
        text: '⚠️ Ce deal a été automatiquement mis en litige car aucune confirmation n\'a été reçue dans les 24 heures. L\'équipe TDOLI va examiner la situation.',
        readBy: []
      });

      console.log(`[AutoDispute] Deal ${deal.dealCode || deal._id} mis en litige automatique`);
    }

    // Envoyer rappels pour deals proches de l'expiration (entre 20h et 24h)
    const soonExpiring = await Transfer.find({
      status: 'matched',
      autoDisputeTriggered: false,
      matchedAt: {
        $lt: new Date(now - 20 * 60 * 60 * 1000),
        $gt: new Date(now - 24 * 60 * 60 * 1000)
      }
    });

    for (const deal of soonExpiring) {
      // Vérifier si rappel déjà envoyé
      const reminderSent = await Message.findOne({
        dealId: deal._id,
        sender: 'system',
        text: { $regex: 'rappel' }
      });
      if (reminderSent) continue;

      await Message.create({
        dealId: deal._id,
        sender: 'system',
        text: '⏰ Rappel : ce deal doit être confirmé dans les prochaines heures. Upload ta preuve et confirme la réception pour éviter un litige automatique.',
        readBy: []
      });
    }

  } catch(e) {
    console.error('[AutoDispute] Erreur:', e.message);
  }
}

module.exports = { runAutoDisputeCheck };
