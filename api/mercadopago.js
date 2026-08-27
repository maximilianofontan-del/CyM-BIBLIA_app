export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Webhook Activo' });
  }

  try {
    const { type, action, data } = req.body;

    if (type === 'payment' || action === 'payment.created') {
      const paymentId = data?.id || req.body?.data?.id;

      if (paymentId) {
        // 1. Consultar estado real del pago en Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });
        const paymentData = await mpResponse.json();

        if (paymentData.status === 'approved') {
          const userId = paymentData.external_reference;
          const monto = Number(paymentData.transaction_amount || 0);
          const descripcion = String(paymentData.description || '').toLowerCase();

          if (userId && userId !== 'undefined' && userId !== '') {
            const firebaseApiKey = "AIzaSyD2ya4X0gJZg9eaD7sYs7DOz43cu4Q83lQ";
            const projectId = "cym-biblia";
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cym_usuarios/${userId}?key=${firebaseApiKey}`;

            // 2. Traer el documento actual del usuario
            const userRes = await fetch(firestoreUrl);
            const userData = await userRes.json();

            let corazonesActuales = 0;
            if (userData.fields && userData.fields.corazones) {
              const val = userData.fields.corazones;
              corazonesActuales = Number(val.integerValue ?? val.doubleValue ?? val.stringValue ?? 0);
            }

            const camposActualizar = {};

            // SI ES COMPRA DE CORAZONES EXTRA ($2.000)
            if (descripcion.includes('corazones') || monto === 2000) {
              const nuevosCorazones = corazonesActuales + 10;
              camposActualizar.corazones = { integerValue: nuevosCorazones };
              camposActualizar.ultimoPagoId = { stringValue: String(paymentId) };
              camposActualizar.fechaUltimoPago = { stringValue: new Date().toISOString() };
            } 
            // SI ES COMPRA DE MEMBRESÍA
            else {
              let nuevaSuscripcion = 'BRONCE';
              if (descripcion.includes('diamante') || monto >= 10000) nuevaSuscripcion = 'DIAMANTE';
              else if (descripcion.includes('oro') || monto >= 7500) nuevaSuscripcion = 'ORO';
              else if (descripcion.includes('plata') || monto >= 4500) nuevaSuscripcion = 'PLATA';

              const hoy = new Date();
              const fechaVencimiento = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString();

              camposActualizar.suscripcion = { stringValue: nuevaSuscripcion };
              camposActualizar.fechaVencimiento = { stringValue: fechaVencimiento };
              camposActualizar.ultimoPagoId = { stringValue: String(paymentId) };
              camposActualizar.fechaUltimoPago = { stringValue: new Date().toISOString() };
            }

            // 3. Escribir actualización en Firestore mediante PATCH con la máscara de campos requerida
            const updateMaskParams = Object.keys(camposActualizar)
              .map(k => `updateMask.fieldPaths=${k}`)
              .join('&');

            const patchRes = await fetch(`${firestoreUrl}&${updateMaskParams}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fields: camposActualizar })
            });

            const patchResult = await patchRes.json();

            if (patchRes.ok) {
              console.log(`✅ Acreditación exitosa en Firestore para el usuario ${userId}`);
            } else {
              console.error(`❌ Firestore denegó el cambio REST:`, patchResult);
            }
          } else {
            console.error("⚠️ El pago aprobado no contenía un external_reference (userId) válido.");
          }
        }
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return res.status(200).send('OK procesado con excepcion');
  }
}