import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
    const { type, data } = req.body;

    if (type === 'payment' && data && data.id) {
      const paymentId = data.id;

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      
      const paymentData = await mpResponse.json();

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference; 

        if (userId) {
          await db.collection('usuarios').doc(userId).update({
            membresia: 'Premium',
            fecha_pago: new Date().toISOString(),
            pago_id: paymentId
          });
        }
      }
    }
    
    res.status(200).send('Notificación recibida');

  } catch (error) {
    console.error('Error procesando el Webhook:', error);
    res.status(500).send('Error interno del servidor');
  }
}