import React, { useState } from 'react';
import { doc, updateDoc, getDoc, query, collection, where, getDocs, arrayUnion } from 'firebase/firestore';
import { 
  Gem, Heart, Gift, ShoppingCart, ChevronLeft, Loader2, Sparkles, Send
} from 'lucide-react';

const PAQUETES_DIAMANTES = [
  { id: 'pack_chico', cant: 10, precio: '$2.500', desc: 'Para uso personal y cosméticos.' },
  { id: 'pack_medio', cant: 25, precio: '$5.500', desc: 'Ideal para pases de torneos.' },
  { id: 'pack_clan', cant: 50, precio: '$10.000', desc: 'Fundador: El justo para crear un Clan.', popular: true },
  { id: 'pack_leyenda', cant: 120, precio: '$20.000', desc: '+20% Diamantes de regalo.' }
];

export default function ModuloTienda({ currentUser, db, onVolver }) {
  const [procesando, setProcesando] = useState(false);
  const [vistaActual, setVistaActual] = useState('comprar'); // 'comprar' o 'regalar'
  
  // Estados para regalos
  const [emailAmigo, setEmailAmigo] = useState('');
  const [mensajeRegalo, setMensajeRegalo] = useState('');
  const [corazonesAEnviar, setCorazonesAEnviar] = useState(5);

  const diamantesActuales = currentUser?.diamantes || 0;
  const corazonesActuales = currentUser?.corazones || 0;

  const handleComprarDiamantes = async (paquete) => {
    // Acá iría la integración real con Mercado Pago. 
    // Por ahora simulamos la compra exitosa para que puedas testear el flujo.
    if (!window.confirm(`¿Simular la compra de ${paquete.cant} Diamantes por ${paquete.precio}? (En producción esto abrirá MercadoPago)`)) return;

    setProcesando(true);
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, {
        diamantes: diamantesActuales + paquete.cant
      });
      alert(`💎 ¡Compra exitosa! Se añadieron ${paquete.cant} Diamantes a tu cuenta.`);
    } catch (error) {
      alert("Error al procesar la compra.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEnviarRegalo = async (e) => {
    e.preventDefault();
    if (!emailAmigo.trim()) {
      alert("Ingresá el email de tu amigo.");
      return;
    }
    if (corazonesActuales < corazonesAEnviar) {
      alert("No tenés suficientes corazones para enviar este regalo.");
      return;
    }

    setProcesando(true);
    try {
      // 1. Buscar al amigo por email
      const q = query(collection(db, "cym_usuarios"), where("email", "==", emailAmigo.toLowerCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("No se encontró ningún usuario con ese correo en CyM Biblia.");
        setProcesando(false);
        return;
      }

      const amigoDoc = snap.docs[0];
      const amigoData = amigoDoc.data();

      // 2. Descontar corazones al usuario actual
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
        corazones: corazonesActuales - corazonesAEnviar
      });

      // 3. Sumar corazones al amigo y enviarle una notificación/registro
      await updateDoc(doc(db, 'cym_usuarios', amigoDoc.id), {
        corazones: (amigoData.corazones || 0) + corazonesAEnviar,
        regalosRecibidos: arrayUnion({
          de: currentUser.nombre || currentUser.email,
          cantidad: corazonesAEnviar,
          mensaje: mensajeRegalo || '¡Bendiciones! Te mando vidas extra.',
          fecha: new Date().toISOString()
        })
      });

      alert(`🎁 ¡Regalo enviado con éxito a ${amigoData.nombre || amigoData.email}!`);
      setEmailAmigo('');
      setMensajeRegalo('');
    } catch (error) {
      alert("Ocurrió un error al enviar el regalo.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/40 px-4 py-1.5 rounded-full text-cyan-300 font-black text-xs uppercase tracking-widest">
          <ShoppingCart size={16} /> Tienda y Economía
        </div>
      </div>

      {/* SALDO DEL USUARIO */}
      <div className="bg-black/60 border border-white/10 rounded-3xl p-5 mb-6 flex justify-around items-center shadow-lg">
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Mis Diamantes</p>
          <p className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-1.5">
            <Gem size={20} /> {diamantesActuales}
          </p>
        </div>
        <div className="w-px h-10 bg-white/10"></div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Mis Corazones</p>
          <p className="text-2xl font-black text-red-500 flex items-center justify-center gap-1.5">
            <Heart size={20} className="fill-red-500" /> {corazonesActuales}
          </p>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setVistaActual('comprar')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${vistaActual === 'comprar' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'}`}
        >
          <Gem size={16} /> Comprar 💎
        </button>
        <button 
          onClick={() => setVistaActual('regalar')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${vistaActual === 'regalar' ? 'bg-pink-600 text-white shadow-lg' : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'}`}
        >
          <Gift size={16} /> Enviar Regalo
        </button>
      </div>

      {/* VISTA 1: COMPRAR DIAMANTES */}
      {vistaActual === 'comprar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {PAQUETES_DIAMANTES.map((pack) => (
            <div key={pack.id} className={`relative bg-black/60 border ${pack.popular ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10'} p-5 rounded-2xl flex flex-col justify-between`}>
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> Más Popular
                </span>
              )}
              <div className="mb-4 text-center mt-2">
                <Gem size={40} className="mx-auto text-cyan-400 mb-2" />
                <h3 className="text-2xl font-black text-white">{pack.cant} 💎</h3>
                <p className="text-xs text-slate-400 mt-1 h-8">{pack.desc}</p>
              </div>
              <button 
                onClick={() => handleComprarDiamantes(pack)}
                disabled={procesando}
                className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 shadow-lg ${pack.popular ? 'bg-cyan-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {procesando ? <Loader2 className="animate-spin mx-auto" size={18} /> : pack.precio}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 2: ENVIAR REGALO A UN AMIGO */}
      {vistaActual === 'regalar' && (
        <div className="bg-black/60 border border-pink-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="text-center mb-6">
            <Gift size={48} className="mx-auto text-pink-400 mb-2" />
            <h3 className="text-xl font-black text-white">Bendecir a un Hermano</h3>
            <p className="text-xs text-slate-300 mt-1">Enviá corazones de tu propio saldo para ayudar a un amigo a seguir jugando.</p>
          </div>

          <form onSubmit={handleEnviarRegalo} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Email del Amigo</label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={emailAmigo}
                onChange={(e) => setEmailAmigo(e.target.value)}
                className="w-full bg-black/80 border border-pink-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-pink-400"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">¿Cuántos corazones enviar?</label>
              <div className="flex gap-2">
                {[2, 5, 10].map(cant => (
                  <button
                    key={cant}
                    type="button"
                    onClick={() => setCorazonesAEnviar(cant)}
                    className={`flex-1 py-3 rounded-xl font-black text-sm flex justify-center items-center gap-1 border ${corazonesAEnviar === cant ? 'bg-pink-600 border-pink-400 text-white' : 'bg-black/40 border-white/10 text-slate-400'}`}
                  >
                    {cant} <Heart size={16} className={corazonesAEnviar === cant ? "fill-white" : ""} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Mensaje de Bendición (Opcional)</label>
              <input 
                type="text" 
                placeholder="¡Para que ganes ese duelo!" 
                maxLength={40}
                value={mensajeRegalo}
                onChange={(e) => setMensajeRegalo(e.target.value)}
                className="w-full bg-black/80 border border-pink-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-pink-400"
              />
            </div>

            <button 
              type="submit"
              disabled={procesando || corazonesActuales < corazonesAEnviar}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 mt-4"
            >
              {procesando ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {procesando ? "Enviando Regalo..." : "Enviar Bendición"}
            </button>
            
            {corazonesActuales < corazonesAEnviar && (
              <p className="text-center text-[10px] text-red-400 font-bold mt-2">No tenés suficientes corazones para este envío.</p>
            )}
          </form>
        </div>
      )}

    </div>
  );
}