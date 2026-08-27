export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { plan, tipoProducto, userId, email } = req.body;

    const precios = {
      CORAZONES: { titulo: "Pack 10 Corazones Extra - CyM Trivia", precio: 2000 },
      BRONCE: { titulo: "Suscripción Socio Bronce - CyM Biblia", precio: 2500 },
      PLATA: { titulo: "Suscripción Socio Plata - CyM Biblia", precio: 5000 },
      ORO: { titulo: "Suscripción Socio Oro - CyM Biblia", precio: 8000 },
      DIAMANTE: { titulo: "Suscripción Socio Diamante - CyM Biblia", precio: 12000 }
    };

    const productoElegido = precios[tipoProducto || plan] || precios.CORAZONES;
    const URL_DOMINIO = "https://cy-m-biblia-app.vercel.app/";

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          {
            title: productoElegido.titulo,
            unit_price: Number(productoElegido.precio),
            quantity: 1,
            currency_id: 'ARS'
          }
        ],
        payer: { email: email },
        external_reference: String(userId || ''),
        back_urls: {
          success: URL_DOMINIO,
          failure: URL_DOMINIO,
          pending: URL_DOMINIO
        },
        auto_return: "approved"
      })
    });

    const data = await response.json();

    if (data.init_point) {
      return res.status(200).json({ init_point: data.init_point });
    } else {
      return res.status(500).json({ error: "Error al generar la preferencia de cobro." });
    }

  } catch (error) {
    console.error("Error en servidor al crear preferencia:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}