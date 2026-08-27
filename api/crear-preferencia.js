export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Método no permitido' });
    }
  
    try {
      const { plan, userId, email } = req.body;
  
      // Configuramos precios y títulos de cada membresía
      const precios = {
        BRONCE: { titulo: "Suscripción Socio Bronce - CyM Biblia", precio: 2500 },
        PLATA: { titulo: "Suscripción Socio Plata - CyM Biblia", precio: 5000 },
        ORO: { titulo: "Suscripción Socio Oro - CyM Biblia", precio: 8000 },
        DIAMANTE: { titulo: "Suscripción Socio Diamante - CyM Biblia", precio: 12000 }
      };
  
      const planElegido = precios[plan] || precios.BRONCE;
  
      // Creamos la preferencia en Mercado Pago INYECTANDO el ID del usuario (external_reference)
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [
            {
              title: planElegido.titulo,
              unit_price: Number(planElegido.precio),
              quantity: 1,
              currency_id: 'ARS'
            }
          ],
          payer: { email: email },
          // ESTA ES LA CLAVE DE LA AUTOMATIZACIÓN:
          external_reference: userId, 
          back_urls: {
            success: "https://cy-m-biblia-app-git-main-maximilianofontan-dels-projects.vercel.app/",
            failure: "https://cy-m-biblia-app-git-main-maximilianofontan-dels-projects.vercel.app/",
            pending: "https://cy-m-biblia-app-git-main-maximilianofontan-dels-projects.vercel.app/"
          },
          auto_return: "approved"
        })
      });
  
      const data = await response.json();
  
      if (data.init_point) {
        return res.status(200).json({ init_point: data.init_point });
      } else {
        console.error("Error Mercado Pago:", data);
        return res.status(500).json({ error: "No se pudo generar la preferencia de pago." });
      }
  
    } catch (error) {
      console.error("Error en servidor:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }