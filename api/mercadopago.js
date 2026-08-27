export default async function handler(req, res) {
  // Manejo de peticiones de prueba
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Webhook Activo' });
  }

  try {
    const { type, action, data } = req.body;

    if (type === 'payment' || action === 'payment.created') {
      const paymentId = data?.id || req.body?.data?.id;

      if (paymentId) {
        // 1. Consultar estado del pago en Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });
        const paymentData = await mpResponse.json();

        if (paymentData.status === 'approved') {
          const userId = paymentData.external_reference;
          const monto = paymentData.transaction_amount;
          const descripcion = (paymentData.description || '').toLowerCase();

          if (userId) {
            const firebaseApiKey = "AIzaSyD2ya4X0gJZg9eaD7sYs7DOz43cu4Q83lQ";
            const projectId = "cym-biblia";
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cym_usuarios/${userId}?key=${firebaseApiKey}`;

            // 2. Obtener datos actuales del usuario en Firestore
            const userRes = await fetch(firestoreUrl);
            const userData = await userRes.json();

            if (userData.fields) {
              const corazonesActuales = Number(userData.fields.corazones?.integerValue || 10);
              const camposActualizar = {};

              // COMPRA DE CORAZONES EXTRA ($2.000)
              if (descripcion.includes('corazones') || monto === 2000) {
                camposActualizar.corazones = { integerValue: corazonesActuales + 10 };
                camposActualizar.ultimoPagoId = { stringValue: String(paymentId) };
                camposActualizar.fechaUltimoPago = { stringValue: new Date().toISOString() };
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

                camposActualizar.suscripcion = { stringValue: nuevaSuscripcion };
                camposActualizar.fechaVencimiento = { stringValue: fechaVencimiento };
                camposActualizar.ultimoPagoId = { stringValue: String(paymentId) };
                camposActualizar.fechaUltimoPago = { stringValue: new Date().toISOString() };
              }

              // 3. Actualizar documento en Firestore vía PATCH (Sin SDKs pesados)
              const updateMask = Object.keys(camposActualizar).map(k => `updateMask.fieldPaths=${k}`).join('&');
              await fetch(`${firestoreUrl}&${updateMask}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: camposActualizar })
              });

              console.log(`✅ Firestore actualizado exitosamente para el usuario: ${userId}`);
            }
          }
        }
      }
    }

    // Respuesta 200 para avisar a Mercado Pago que la entrega se completó sin errores
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error procesando webhook:', error);
    // Devolvemos 200 OK para evitar bloqueos del webhook en Mercado Pago
    return res.status(200).send('OK procesado con excepcion');
  }
}