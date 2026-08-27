import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { type, action, data } = req.body;

    if (type === 'payment' || action === 'payment.created') {
      const paymentId = data.id;

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const paymentData = await mpResponse.json();

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;
        const monto = paymentData.transaction_amount;
        const descripcion = (paymentData.description || '').toLowerCase();

        if (userId) {
          const userRef = db.collection('cym_usuarios').doc(userId);

          // SI ES COMPRA DE CORAZONES EXTRA ($2.000)
          if (descripcion.includes('corazones') || monto === 2000) {
            await userRef.update({
              corazones: FieldValue.increment(10), // ¡Se activan e incrementan al instante!
              ultimoPagoId: paymentId,
              fechaUltimoPago: new Date().toISOString()
            });
            console.log(`❤️ ¡10 Corazones sumados al instante al usuario ${userId}!`);
          } 
          // SI ES COMPRA DE MEMBRESÍA
          else {
            let nuevaSuscripcion = 'BRONCE';
            if (descripcion.includes('diamante') || monto >= 10000) nuevaSuscripcion = 'DIAMANTE';
            else if (descripcion.includes('oro') || monto >= 7500) nuevaSuscripcion = 'ORO';
            else if (descripcion.includes('plata') || monto >= 4500) nuevaSuscripcion = 'PLATA';
            else if (descripcion.includes('bronce') || monto >= 2500) nuevaSuscripcion = 'BRONCE';

            const hoy = new Date();
            const fechaVencimiento = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString();

            await userRef.update({
              suscripcion: nuevaSuscripcion,
              fechaVencimiento: fechaVencimiento,
              ultimoPagoId: paymentId,
              fechaUltimoPago: new Date().toISOString()
            });
            console.log(`✅ ¡Membresía ${nuevaSuscripcion} activada/renovada para el usuario ${userId}!`);
          }
        }
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Error procesando Webhook:', error);
    res.status(500).send('Error interno');
  }
}