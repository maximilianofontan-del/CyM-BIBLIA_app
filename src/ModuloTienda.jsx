import React, { useState, useEffect } from 'react';
import {
  doc, query, collection, where, getDocs, arrayUnion, onSnapshot, runTransaction
} from 'firebase/firestore';
import {
  Gem, Heart, Gift, ShoppingCart, ChevronLeft, Loader2, Sparkles, Send,
  CreditCard, Crown, CheckCircle2, Flame, Calendar, Star, Shield, Diamond
} from 'lucide-react';

/**
 * FUENTE ÚNICA DE VERDAD (Single Source of Truth - Principio DRY):
 * Unifica los planes reales de Club CyM (Bronce, Plata, Oro, Diamante)
 * con modalidad Anual (2 meses bonificados) y Mensual, manteniendo intactos
 * los IDs ('BRONCE', 'PLATA', 'ORO', 'DIAMANTE') que consume /api/crear-preferencia.
 */
export const PLANES_CLUB_VIP = [
  {
    id: 'BRONCE',
    nombre: 'Socio Bronce',
    precioMensual: '$5.000',
    precioAnual: '$50.000',
    ahorroAnual: 'Ahorrás $10.000 (2 meses gratis)',
    colorBorde: 'border-[#cd7f32]',
    badgeBg: 'bg-[#cd7f32] text-white',
    icono: <Star className="text-[#cd7f32] w-11 h-11 mx-auto" />,
    beneficios: [
      'Apoyo directo al crecimiento del Ministerio CyM',
      'Insignia oficial de Socio Bronce colaborador'
    ]
  },
  {
    id: 'PLATA',
    nombre: 'Socio Plata',
    precioMensual: '$10.000',
    precioAnual: '$100.000',
    ahorroAnual: 'Ahorrás $20.000 (2 meses gratis)',
    colorBorde: 'border-[#c0c0c0]',
    badgeBg: 'bg-[#c0c0c0] text-black',
    icono: <Shield className="text-[#c0c0c0] w-11 h-11 mx-auto" />,
    beneficios: [
      'Todo lo de Bronce',
      'Acceso completo a audios bíblicos narrados',
      'Ranking destacado en Trivia y Comunidad'
    ]
  },
  {
    id: 'ORO',
    nombre: 'Socio Oro',
    popular: true,
    precioMensual: '$20.000',
    precioAnual: '$200.000',
    ahorroAnual: 'Ahorrás $40.000 (2 meses gratis)',
    colorBorde: 'border-[#ffd700]',
    badgeBg: 'bg-[#ffd700] text-black',
    icono: <Crown className="text-[#ffd700] w-11 h-11 mx-auto" />,
    beneficios: [
      'Todo lo de Plata',
      'Asistente IA Bíblico sin límites',
      'Generación de guías bíblicas y Devocionales VIP',
      'Acceso exclusivo al Grupo de Oración VIP'
    ]
  },
  {
    id: 'DIAMANTE',
    nombre: 'Socio Diamante',
    precioMensual: '$30.000',
    precioAnual: '$300.000',
    ahorroAnual: 'Ahorrás $60.000 (2 meses gratis)',
    colorBorde: 'border-[#b9f2ff]',
    badgeBg: 'bg-[#00a86b] text-white',
    icono: <Diamond className="text-[#b9f2ff] w-11 h-11 mx-auto" />,
    beneficios: [
      'Todo lo de Oro',
      'Descarga de bosquejos de sermones en Word / PDF',
      'Soporte pastoral directo y aro esmeralda Diamante'
    ]
  }
];

export const PAQUETES_DIAMANTES = [
  { id: 'pack_chico', cant: 10, precio: '$2.500 / mes', desc: 'Recarga Básica: Ideal para recuperar vidas y consultas IA.', link: 'https://mpago.la/2E4E6DY' },
  { id: 'pack_medio', cant: 25, precio: '$5.500 / mes', desc: 'Recarga Plata: Pases de torneos VIP y ventajas en duelos.', link: 'https://mpago.la/1dfisBW' },
  { id: 'pack_clan', cant: 50, precio: '$10.000 / mes', desc: 'Recarga Liderazgo: Potenciá tu Clan y multiplicá recompensas.', link: 'https://mpago.la/1nDtvCR', popular: true },
  { id: 'pack_leyenda', cant: 120, precio: '$20.000 / mes', desc: 'Recarga Leyenda: Abundancia para bendecir a todo tu Clan.', link: 'https://mpago.la/1u88YWB' }
];

export default function ModuloTienda({
  currentUser,
  db,
  onVolver,
  onSuscribir,
  tabInicial = 'socios'
}) {
  const [vistaActual, setVistaActual] = useState(tabInicial);
  const [cicloFacturacion, setCicloFacturacion] = useState('ANUAL'); // 'ANUAL' | 'MENSUAL'
  const [procesandoPlan, setProcesandoPlan] = useState(null);
  const [procesandoRegalo, setProcesandoRegalo] = useState(false);

  const [emailAmigo, setEmailAmigo] = useState('');
  const [mensajeRegalo, setMensajeRegalo] = useState('');
  const [corazonesAEnviar, setCorazonesAEnviar] = useState(5);

  const [diamantesEnVivo, setDiamantesEnVivo] = useState(currentUser?.diamantes || 0);
  const [corazonesEnVivo, setCorazonesEnVivo] = useState(currentUser?.corazones || 0);
  const [suscripcionEnVivo, setSuscripcionEnVivo] = useState(currentUser?.suscripcion || 'GRATIS');

  useEffect(() => {
    if (tabInicial) {
      setVistaActual(tabInicial);
    }
  }, [tabInicial]);

  useEffect(() => {
    if (!db || !currentUser?.uid) return;
    const userRef = doc(db, 'cym_usuarios', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDiamantesEnVivo(data.diamantes || 0);
        setCorazonesEnVivo(data.corazones || 0);
        setSuscripcionEnVivo(data.suscripcion || 'GRATIS');
      }
    });
    return () => unsubscribe();
  }, [currentUser, db]);

  const handleActivarMembresia = async (plan) => {
    if (procesandoPlan) return;
    setProcesandoPlan(plan.id);
    try {
      const planPayload = cicloFacturacion === 'ANUAL' ? `${plan.id}_ANUAL` : plan.id;
      if (typeof onSuscribir === 'function') {
        await onSuscribir(planPayload);
      } else {
        const res = await fetch('/api/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planPayload,
            userId: currentUser?.uid,
            email: currentUser?.email
          })
        });
        const data = await res.json();
        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          alert('No se pudo iniciar el proceso de cobro. Intentá de nuevo.');
        }
      }
    } finally {
      setProcesandoPlan(null);
    }
  };

  const handleComprarDiamantes = (paquete) => {
    alert(
      `Serás redirigido a Mercado Pago para activar tu recarga de ${paquete.cant} Diamantes mensuales y apoyar el crecimiento del Ministerio CyM.\n\nUna vez aprobado el pago, los diamantes se acreditarán en tu cuenta.`
    );
    window.open(paquete.link, '_blank', 'noopener,noreferrer');
  };

  /**
   * Genialidad Arquitectónica (Transacción ACID):
   * Ejecuta el envío de corazones mediante runTransaction en Firestore para
   * erradicar condiciones de carrera y garantizar consistencia absoluta de saldos.
   */
  const handleEnviarRegalo = async (e) => {
    e.preventDefault();
    if (procesandoRegalo || !db || !currentUser?.uid) return;

    const emailDestino = emailAmigo.toLowerCase().trim();
    const emailPropio = String(currentUser?.email || '').toLowerCase().trim();

    if (!emailDestino) {
      alert('Ingresá el email de tu amigo.');
      return;
    }
    if (emailDestino === emailPropio) {
      alert('No podés enviarte corazones a tu propia cuenta.');
      return;
    }
    if (corazonesEnVivo < corazonesAEnviar) {
      alert('No tenés suficientes corazones para enviar este regalo.');
      return;
    }

    setProcesandoRegalo(true);
    try {
      const q = query(collection(db, 'cym_usuarios'), where('email', '==', emailDestino));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert('No se encontró ningún usuario con ese correo en CyM Biblia.');
        setProcesandoRegalo(false);
        return;
      }

      const amigoDoc = snap.docs[0];
      const amigoNombre = amigoDoc.data().nombre || amigoDoc.data().email;

      await runTransaction(db, async (transaction) => {
        const emisorRef = doc(db, 'cym_usuarios', currentUser.uid);
        const receptorRef = doc(db, 'cym_usuarios', amigoDoc.id);

        const emisorSnap = await transaction.get(emisorRef);
        const receptorSnap = await transaction.get(receptorRef);

        if (!emisorSnap.exists() || !receptorSnap.exists()) {
          throw new Error('CUENTA_INEXISTENTE');
        }

        const saldoEmisorReal = Number(emisorSnap.data().corazones || 0);
        const saldoReceptorReal = Number(receptorSnap.data().corazones || 0);

        if (saldoEmisorReal < corazonesAEnviar) {
          throw new Error('SALDO_INSUFICIENTE');
        }

        transaction.update(emisorRef, {
          corazones: saldoEmisorReal - corazonesAEnviar
        });

        transaction.update(receptorRef, {
          corazones: saldoReceptorReal + corazonesAEnviar,
          regalosRecibidos: arrayUnion({
            de: currentUser.nombre || currentUser.email,
            cantidad: corazonesAEnviar,
            mensaje: mensajeRegalo.trim() || '¡Bendiciones! Te mando vidas extra.',
            fecha: new Date().toISOString()
          })
        });
      });

      alert(`🎁 ¡Regalo enviado con éxito a ${amigoNombre}!`);
      setEmailAmigo('');
      setMensajeRegalo('');
    } catch (error) {
      if (error?.message === 'SALDO_INSUFICIENTE') {
        alert('No tenés suficientes corazones disponibles para completar esta operación.');
      } else {
        alert('Ocurrió un error al procesar la transferencia. Intentá nuevamente.');
      }
    } finally {
      setProcesandoRegalo(false);
    }
  };

  return (
    <div className="relative min-h-[82vh] w-full flex flex-col justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-[#120e02] to-slate-900 border-2 border-[#cca300]/50 text-white shadow-2xl overflow-hidden">

      {/* CABECERA UNIFICADA */}
      <div className="w-full flex justify-between items-center mb-5">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 font-black text-[11px] uppercase tracking-widest">
          <ShoppingCart size={15} /> Club VIP & Banco Central CyM
        </div>
      </div>

      {/* PANEL DE TELEMETRÍA EN VIVO DEL USUARIO */}
      <div className="bg-black/70 border border-white/10 rounded-3xl p-4 md:p-5 mb-6 grid grid-cols-3 gap-2 items-center shadow-lg">
        <div className="text-center border-r border-white/10 pr-2">
          <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 mb-1">Membresía Club</p>
          <p className="text-sm md:text-lg font-black text-amber-400 flex items-center justify-center gap-1 uppercase">
            <Crown size={18} className="shrink-0" /> {currentUser?.role === 'OWNER' ? 'DIAMANTE' : suscripcionEnVivo}
          </p>
        </div>
        <div className="text-center border-r border-white/10 px-2">
          <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 mb-1">Diamantes</p>
          <p className="text-xl md:text-3xl font-black text-cyan-400 flex items-center justify-center gap-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            <Gem size={20} /> {diamantesEnVivo}
          </p>
        </div>
        <div className="text-center pl-2">
          <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 mb-1">Corazones</p>
          <p className="text-xl md:text-3xl font-black text-red-500 flex items-center justify-center gap-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            <Heart size={20} className="fill-red-500" /> {corazonesEnVivo}
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN UNIFICADA DE 3 CANALES */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => setVistaActual('socios')}
          className={`py-3 px-2 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row justify-center items-center gap-1.5 ${
            vistaActual === 'socios'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg scale-[1.02]'
              : 'bg-black/50 text-slate-300 border border-white/10 hover:bg-white/5'
          }`}
        >
          <Crown size={16} /> <span>Membresías Club VIP</span>
        </button>

        <button
          onClick={() => setVistaActual('diamantes')}
          className={`py-3 px-2 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row justify-center items-center gap-1.5 ${
            vistaActual === 'diamantes'
              ? 'bg-cyan-500 text-black shadow-lg scale-[1.02]'
              : 'bg-black/50 text-slate-300 border border-white/10 hover:bg-white/5'
          }`}
        >
          <Gem size={16} /> <span>Recargar Diamantes</span>
        </button>

        <button
          onClick={() => setVistaActual('regalar')}
          className={`py-3 px-2 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row justify-center items-center gap-1.5 ${
            vistaActual === 'regalar'
              ? 'bg-pink-600 text-white shadow-lg scale-[1.02]'
              : 'bg-black/50 text-slate-300 border border-white/10 hover:bg-white/5'
          }`}
        >
          <Gift size={16} /> <span>Enviar Vidas</span>
        </button>
      </div>

      {/* ====================================================================
          CANAL 1: MEMBRESÍAS CLUB CYM VIP (ANUAL Y MENSUAL)
      ==================================================================== */}
      {vistaActual === 'socios' && (
        <div className="space-y-6 pb-6">
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-900/20 to-emerald-500/20 border border-amber-400/40 p-5 rounded-3xl text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 flex items-center justify-center gap-1.5">
              <Flame size={14} /> Sembrá en el Reino • Club CyM VIP
            </p>
            <h3 className="text-lg md:text-xl font-black text-white">
              Tu Membresía sostiene y hace crecer el Ministerio Crecer y Multiplicar
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Elegí tu nivel de apoyo mensual o anual para que miles de personas sigan recibiendo la Palabra gratis mientras desbloqueás IA ilimitada, audios narrados y bosquejos exclusivos.
            </p>
          </div>

          {/* SELECTOR DE CICLO: ANUAL (2 MESES BONIFICADOS) VS MENSUAL */}
          <div className="flex justify-center">
            <div className="bg-black/80 border border-amber-500/40 p-1.5 rounded-2xl flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCicloFacturacion('ANUAL')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  cicloFacturacion === 'ANUAL'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar size={14} /> Plan Anual (2 Meses Gratis)
              </button>
              <button
                type="button"
                onClick={() => setCicloFacturacion('MENSUAL')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  cicloFacturacion === 'MENSUAL'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Plan Mensual
              </button>
            </div>
          </div>

          {/* GRILLA DE LOS 4 PLANES OFICIALES DE CLUB CYM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLANES_CLUB_VIP.map((plan) => {
              const esMiPlanActual = String(suscripcionEnVivo).toUpperCase() === plan.id;
              const precioMostrar = cicloFacturacion === 'ANUAL' ? plan.precioAnual : plan.precioMensual;
              const sufijoPeriodo = cicloFacturacion === 'ANUAL' ? '/año' : '/mes';

              return (
                <div
                  key={plan.id}
                  className={`relative bg-[#141414] border-2 ${plan.colorBorde} p-6 rounded-3xl flex flex-col justify-between shadow-xl hover:scale-[1.01] transition-transform ${
                    plan.popular ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-amber-500 text-black text-[10px] font-black uppercase px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                      <Sparkles size={12} /> Más Elegido por los Socios
                    </span>
                  )}

                  <div>
                    <div className="text-center mt-1 mb-3">
                      {plan.icono}
                      <span className={`inline-block mt-3 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${plan.badgeBg}`}>
                        {plan.nombre}
                      </span>
                      <p className="text-3xl font-black text-amber-400 mt-2">
                        {precioMostrar} <span className="text-sm text-slate-400 font-normal">{sufijoPeriodo}</span>
                      </p>
                      {cicloFacturacion === 'ANUAL' && (
                        <p className="text-[10px] font-black text-emerald-400 uppercase mt-1">
                          {plan.ahorroAnual}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6 border-t border-white/10 pt-4">
                      {plan.beneficios.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={procesandoPlan === plan.id}
                    onClick={() => handleActivarMembresia(plan)}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black'
                        : 'bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-black'
                    }`}
                  >
                    {procesandoPlan === plan.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Crown size={16} className="fill-black" />
                    )}
                    {esMiPlanActual
                      ? `Renovar ${plan.nombre}`
                      : `Unirme (${cicloFacturacion === 'ANUAL' ? 'Anual' : 'Mensual'})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          CANAL 2: RECARGA DE DIAMANTES
      ==================================================================== */}
      {vistaActual === 'diamantes' && (
        <>
          <div className="bg-cyan-900/30 border border-cyan-500/30 p-4 rounded-2xl mb-6 text-center">
            <p className="text-xs text-cyan-200 font-medium">
              Recargá Diamantes 💎 para potenciar tu Clan, competir en torneos VIP y recuperar vidas mientras apoyás el crecimiento del Ministerio CyM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {PAQUETES_DIAMANTES.map((pack) => (
              <div
                key={pack.id}
                className={`relative bg-black/60 border ${
                  pack.popular ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10'
                } p-5 rounded-2xl flex flex-col justify-between`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} /> Sugerido para Líderes
                  </span>
                )}
                <div className="mb-4 text-center mt-3">
                  <Gem
                    size={44}
                    className={`mx-auto mb-3 ${
                      pack.popular ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-cyan-500'
                    }`}
                  />
                  <h3 className="text-3xl font-black text-white">{pack.cant} 💎</h3>
                  <p className="text-xs text-slate-400 mt-2 h-10">{pack.desc}</p>
                </div>
                <button
                  onClick={() => handleComprarDiamantes(pack)}
                  className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                    pack.popular ? 'bg-cyan-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <CreditCard size={18} /> {pack.precio}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ====================================================================
          CANAL 3: TRANSFERENCIA ATÓMICA DE VIDAS A AMIGOS
      ==================================================================== */}
      {vistaActual === 'regalar' && (
        <div className="bg-black/60 border border-pink-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="text-center mb-6">
            <Gift size={48} className="mx-auto text-pink-400 mb-2" />
            <h3 className="text-xl font-black text-white">Bendecir a un Hermano</h3>
            <p className="text-xs text-slate-300 mt-1">
              Enviá corazones de tu propio saldo para ayudar a un amigo a seguir jugando el torneo.
            </p>
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
                {[2, 5, 10].map((cant) => (
                  <button
                    key={cant}
                    type="button"
                    onClick={() => setCorazonesAEnviar(cant)}
                    className={`flex-1 py-3 rounded-xl font-black text-sm flex justify-center items-center gap-1 border ${
                      corazonesAEnviar === cant
                        ? 'bg-pink-600 border-pink-400 text-white'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    {cant} <Heart size={16} className={corazonesAEnviar === cant ? 'fill-white' : ''} />
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
              disabled={procesandoRegalo || corazonesEnVivo < corazonesAEnviar}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {procesandoRegalo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {procesandoRegalo ? 'Enviando Regalo...' : 'Enviar Bendición'}
            </button>

            {corazonesEnVivo < corazonesAEnviar && (
              <p className="text-center text-[10px] text-red-400 font-bold mt-2">
                No tenés suficientes corazones para este envío.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}