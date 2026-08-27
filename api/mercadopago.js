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

      // Consultamos el estado del pago a Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      
      const paymentData = await mpResponse.json();

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference; 
        const monto = paymentData.transaction_amount;
        const descripcion = (paymentData.description || '').toLowerCase();

        if (userId) {
          // Detectamos el nivel de membresía o paquete según la descripción o el precio
          let nuevaSuscripcion = 'BRONCE';

          if (descripcion.includes('diamante') || monto >= 10000) {
            nuevaSuscripcion = 'DIAMANTE';
          } else if (descripcion.includes('oro') || monto >= 5000) {
            nuevaSuscripcion = 'ORO';
          } else if (descripcion.includes('plata') || monto >= 3000) {
            nuevaSuscripcion = 'PLATA';
          } else if (descripcion.includes('bronce')) {
            nuevaSuscripcion = 'BRONCE';
          }

          // Actualizamos los datos exactos en la colección 'cym_usuarios'
          await db.collection('cym_usuarios').doc(userId).update({
            suscripcion: nuevaSuscripcion,
            ultimaConexion: new Date().toISOString(),
            ultimoPagoId: paymentId,
            fechaUltimoPago: new Date().toISOString()
          });

          console.log(`✅ ¡Pago Aprobado! Usuario ${userId} actualizado a ${nuevaSuscripcion}`);
        }
      }
    }
    
    res.status(200).send('OK');

  } catch (error) {
    console.error('Error procesando el Webhook:', error);
    res.status(500).send('Error interno del servidor');
  }
}