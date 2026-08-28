import React, { useState, useEffect } from 'react';
import { doc, updateDoc, query, collection, where, getDocs, arrayUnion, onSnapshot } from 'firebase/firestore';
import { 
  Gem, Heart, Gift, ShoppingCart, ChevronLeft, Loader2, Sparkles, Send, CreditCard, Infinity
} from 'lucide-react';

// ACÁ ESTÁN TUS LINKS REALES DE MERCADO PAGO
const PAQUETES_DIAMANTES = [
  { id: 'pack_chico', cant: 10, precio: '$2.500 / mes', desc: 'Suscripción Básica: Para recuperar vidas y consultas IA.', link: 'https://mpago.la/2E4E6DY' },
  { id: 'pack_medio', cant: 25, precio: '$5.500 / mes', desc: 'Suscripción Plata: Ideal para pases de torneos VIP.', link: 'https://mpago.la/1dfisBW' },
  { id: 'pack_clan', cant: 50, precio: '$10.000 / mes', desc: 'Suscripción Liderazgo: El justo para crear y potenciar Clanes.', link: 'https://mpago.la/1nDtvCR', popular: true },
  { id: 'pack_leyenda', cant: 120, precio: '$20.000 / mes', desc: 'Suscripción Leyenda: Dinero para bendecir a tu clan.', link: 'https://mpago.la/1u88YWB' }
];

export default function ModuloTienda({ currentUser, db, onVolver }) {
  const [procesando, setProcesando] = useState(false);
  const [vistaActual, setVistaActual] = useState('comprar'); 
  
  const [emailAmigo, setEmailAmigo] = useState('');
  const [mensajeRegalo, setMensajeRegalo] = useState('');
  const [corazonesAEnviar, setCorazonesAEnviar] = useState(5);

  const [diamantesEnVivo, setDiamantesEnVivo] = useState(currentUser?.diamantes || 0);
  const [corazonesEnVivo, setCorazonesEnVivo] = useState(currentUser?.corazones || 0);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const userRef = doc(db, 'cym_usuarios', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDiamantesEnVivo(data.diamantes || 0);
        setCorazonesEnVivo(data.corazones || 0);
      }
    });
    return () => unsubscribe();
  }, [currentUser, db]);

  const handleComprarDiamantes = (paquete) => {
    alert(`Serás redirigido a Mercado Pago para iniciar tu suscripción de ${paquete.cant} Diamantes mensuales.\n\nUna vez aprobado el débito automático, los diamantes se acreditarán en tu cuenta.`);
    window.open(paquete.link, '_blank');
  };

  const handleEnviarRegalo = async (e) => {
    e.preventDefault();
    if (!emailAmigo.trim()) {
      alert("Ingresá el email de tu amigo.");
      return;
    }
    if (corazonesEnVivo < corazonesAEnviar) {
      alert("No tenés suficientes corazones para enviar este regalo.");
      return;
    }

    setProcesando(true);
    try {
      const q = query(collection(db, "cym_usuarios"), where("email", "==", emailAmigo.toLowerCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("No se encontró ningún usuario con ese correo en CyM Biblia.");
        setProcesando(false);
        return;
      }

      const amigoDoc = snap.docs[0];
      const amigoData = amigoDoc.data();

      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
        corazones: corazonesEnVivo - corazonesAEnviar
      });

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
      
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/40 px-4 py-1.5 rounded-full text-cyan-300 font-black text-xs uppercase tracking-widest">
          <ShoppingCart size={16} /> Banco Central CyM
        </div>
      </div>

      <div className="bg-black/60 border border-white/10 rounded-3xl p-5 mb-6 flex justify-around items-center shadow-lg">
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Caja de Diamantes</p>
          <p className="text-3xl font-black text-cyan-400 flex items-center justify-center gap-1.5 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            <Gem size={24} /> {diamantesEnVivo}
          </p>
        </div>
        <div className="w-px h-12 bg-white/10"></div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Corazones Restantes</p>
          <p className="text-3xl font-black text-red-500 flex items-center justify-center gap-1.5 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            <Heart size={24} className="fill-red-500" /> {corazonesEnVivo}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setVistaActual('comprar')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${vistaActual === 'comprar' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'}`}
        >
          <Infinity size={16} /> Membresías Mensuales
        </button>
        <button 
          onClick={() => setVistaActual('regalar')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${vistaActual === 'regalar' ? 'bg-pink-600 text-white shadow-lg' : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'}`}
        >
          <Gift size={16} /> Enviar Vidas a Amigo
        </button>
      </div>

      {vistaActual === 'comprar' && (
        <>
          <div className="bg-cyan-900/30 border border-cyan-500/30 p-4 rounded-2xl mb-6 text-center">
            <p className="text-xs text-cyan-200 font-medium">Al suscribirte, recibirás tu recarga de Diamantes 💎 de forma mensual para potenciar tu Clan, revivir en trivias y acceder a torneos.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {PAQUETES_DIAMANTES.map((pack) => (
              <div key={pack.id} className={`relative bg-black/60 border ${pack.popular ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10'} p-5 rounded-2xl flex flex-col justify-between`}>
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} /> Sugerido para Líderes
                  </span>
                )}
                <div className="mb-4 text-center mt-3">
                  <Gem size={44} className={`mx-auto mb-3 ${pack.popular ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-cyan-500'}`} />
                  <h3 className="text-3xl font-black text-white">{pack.cant} 💎</h3>
                  <p className="text-xs text-slate-400 mt-2 h-10">{pack.desc}</p>
                </div>
                <button 
                  onClick={() => handleComprarDiamantes(pack)}
                  className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${pack.popular ? 'bg-cyan-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  <CreditCard size={18} /> {pack.precio}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {vistaActual === 'regalar' && (
        <div className="bg-black/60 border border-pink-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="text-center mb-6">
            <Gift size={48} className="mx-auto text-pink-400 mb-2" />
            <h3 className="text-xl font-black text-white">Bendecir a un Hermano</h3>
            <p className="text-xs text-slate-300 mt-1">Enviá corazones de tu propio saldo para ayudar a un amigo a seguir jugando el torneo.</p>
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
              disabled={procesando || corazonesEnVivo < corazonesAEnviar}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 mt-4"
            >
              {procesando ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {procesando ? "Enviando Regalo..." : "Enviar Bendición"}
            </button>
            
            {corazonesEnVivo < corazonesAEnviar && (
              <p className="text-center text-[10px] text-red-400 font-bold mt-2">No tenés suficientes corazones para este envío.</p>
            )}
          </form>
        </div>
      )}

    </div>
  );
}