import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Inicialización ultra segura
if (!getApps().length) {
  try {
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (typeof serviceAccount === 'string') {
      serviceAccount = JSON.parse(serviceAccount);
    }
    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount) });
    }
  } catch (err) {
    console.error("Error al inicializar Firebase Admin:", err);
  }
}

export default async function handler(req, res) {
  // Respondemos 200 a las peticiones GET/HEAD de prueba de Mercado Pago
  if (req.method !== 'POST') {
    return res.status(200).json({ message: 'Endpoint activo' });
  }

  try {
    const { type, action, data } = req.body;

    if (type === 'payment' || action === 'payment.created') {
      const paymentId = data?.id || req.body?.data?.id;

      if (paymentId) {
        // Consultar estado directamente a Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });
        const paymentData = await mpResponse.json();

        if (paymentData.status === 'approved') {
          const userId = paymentData.external_reference;
          const monto = paymentData.transaction_amount;
          const descripcion = (paymentData.description || '').toLowerCase();

          if (userId && getApps().length > 0) {
            const db = getFirestore();
            const userRef = db.collection('cym_usuarios').doc(userId);

            // COMPRA DE CORAZONES EXTRA ($2.000)
            if (descripcion.includes('corazones') || monto === 2000) {
              await userRef.update({
                corazones: FieldValue.increment(10),
                ultimoPagoId: String(paymentId),
                fechaUltimoPago: new Date().toISOString()
              });
              console.log(`❤️ 10 Corazones acreditados a ${userId}`);
            } 
            // COMPRA DE MEMBRESÍA
            else {
              let nuevaSuscripcion = 'BRONCE';
              if (descripcion.includes('diamante') || monto >= 10000) nuevaSuscripcion = 'DIAMANTE';
              else if (descripcion.includes('oro') || monto >= 7500) nuevaSuscripcion = 'ORO';
              else if (descripcion.includes('plata') || monto >= 4500) nuevaSuscripcion = 'PLATA';
              else if (descripcion.includes('bronce') || monto >= 2000) nuevaSuscripcion = 'BRONCE';

              const hoy = new Date();
              const fechaVencimiento = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString();

              await userRef.update({
                suscripcion: nuevaSuscripcion,
                fechaVencimiento: fechaVencimiento,
                ultimoPagoId: String(paymentId),
                fechaUltimoPago: new Date().toISOString()
              });
              console.log(`✅ Membresía ${nuevaSuscripcion} activada para ${userId}`);
            }
          }
        }
      }
    }

    // SIEMPRE responder 200 OK para evitar reintentos con error 401 en Mercado Pago
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error interno en Webhook:', error);
    return res.status(200).send('OK recibido con advertencia');
  }
}