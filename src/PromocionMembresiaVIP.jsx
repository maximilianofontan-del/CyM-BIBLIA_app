import React, { useState, useEffect, useCallback } from 'react';
import {
  Gem, Sparkles, Crown, Heart, X, ArrowRight, Flame, CheckCircle2
} from 'lucide-react';

const CONFIG_PROMO = {
  DELAY_INICIAL_MS: 45000,          // 45 segundos tras ingresar antes del primer cartel
  INTERVALO_RECURRENCIA_MS: 240000, // 4 minutos entre apariciones periódicas
  MAX_IMPRESIONES_SESION: 4,        // Límite máximo por sesión
  STORAGE_KEY_COUNT: 'cym_promo_vip_count',
  STORAGE_KEY_LAST: 'cym_promo_vip_last_ts',
};

const MENSAJES_INSPIRACIONALES = [
  {
    id: 'crecimiento_ministerio',
    badge: 'IMPULSÁ EL REINO • CRECER Y MULTIPLICAR',
    titulo: 'Ayudá a que el Ministerio llegue a miles de vidas más',
    subtitulo:
      'Tu Membresía Mensual de Socio sostiene esta plataforma gratuita para toda la comunidad y desbloquea IA sin límites, audios narrados, devocionales y bosquejos en Word/PDF.',
    versiculo: '“El que siembra generosamente, generosamente también segará.” — 2 Corintios 9:6',
  },
  {
    id: 'liderazgo_espiritual',
    badge: 'CLUB CYM VIP • MEMBRESÍA MENSUAL',
    titulo: 'Crecé en la Palabra y Multiplicá tu Liderazgo',
    subtitulo:
      'Unite mes a mes como Socio Bronce, Plata, Oro o Diamante para expandir el evangelio, y equipá tu Clan con recargas de Diamantes.',
    versiculo: '“Y todo lo que hagáis, hacedlo de corazón, como para el Señor.” — Colosenses 3:23',
  },
  {
    id: 'comunidad_oracion',
    badge: 'ALIANZA MINISTERIAL CYM',
    titulo: 'Formá parte activa de los Socios que sostienen esta obra',
    subtitulo:
      'Ingresá al Grupo de Oración VIP, descargá prédicas completas y recargá Diamantes para dominar los torneos y duelos bíblicos.',
    versiculo: '“Honra al Señor con tus bienes y con las primicias de todos tus frutos.” — Proverbios 3:9',
  },
];

export default function PromocionMembresiaVIP({
  currentUser,
  enTienda = false,
  pausarAnuncios = false,
  onIrASocios,
  onIrADiamantes,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceMensaje, setIndiceMensaje] = useState(0);

  const obtenerEstadoSesion = useCallback(() => {
    try {
      const count = Number(sessionStorage.getItem(CONFIG_PROMO.STORAGE_KEY_COUNT) || '0');
      const lastTs = Number(sessionStorage.getItem(CONFIG_PROMO.STORAGE_KEY_LAST) || '0');
      return { count, lastTs };
    } catch {
      return { count: 0, lastTs: 0 };
    }
  }, []);

  const registrarImpresion = useCallback(() => {
    try {
      const { count } = obtenerEstadoSesion();
      sessionStorage.setItem(CONFIG_PROMO.STORAGE_KEY_COUNT, String(count + 1));
      sessionStorage.setItem(CONFIG_PROMO.STORAGE_KEY_LAST, String(Date.now()));
    } catch {
      // Tolerancia a fallos en modo incógnito
    }
  }, [obtenerEstadoSesion]);

  const dispararAnuncioControlado = useCallback(() => {
    if (!currentUser || enTienda || pausarAnuncios || modalAbierto) return;

    const { count, lastTs } = obtenerEstadoSesion();
    if (count >= CONFIG_PROMO.MAX_IMPRESIONES_SESION) return;

    const tiempoTranscurrido = Date.now() - lastTs;
    if (lastTs > 0 && tiempoTranscurrido < CONFIG_PROMO.INTERVALO_RECURRENCIA_MS - 5000) {
      return;
    }

    setIndiceMensaje((prev) => (prev + 1) % MENSAJES_INSPIRACIONALES.length);
    setModalAbierto(true);
    registrarImpresion();
  }, [currentUser, enTienda, pausarAnuncios, modalAbierto, obtenerEstadoSesion, registrarImpresion]);

  useEffect(() => {
    if (!currentUser || enTienda || pausarAnuncios) return;

    const initialTimer = setTimeout(() => {
      dispararAnuncioControlado();
    }, CONFIG_PROMO.DELAY_INICIAL_MS);

    const recurringInterval = setInterval(() => {
      dispararAnuncioControlado();
    }, CONFIG_PROMO.INTERVALO_RECURRENCIA_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringInterval);
    };
  }, [currentUser, enTienda, pausarAnuncios, dispararAnuncioControlado]);

  useEffect(() => {
    if (enTienda && modalAbierto) {
      setModalAbierto(false);
    }
  }, [enTienda, modalAbierto]);

  if (!currentUser || enTienda) return null;

  const mensajeActual = MENSAJES_INSPIRACIONALES[indiceMensaje];

  return (
    <>
      {/* PÍLDORA FLOTANTE DISCRETA EN TODAS LAS PESTAÑAS */}
      {!modalAbierto && (
        <button
          type="button"
          onClick={() => {
            setIndiceMensaje((prev) => (prev + 1) % MENSAJES_INSPIRACIONALES.length);
            setModalAbierto(true);
          }}
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-2 border-amber-200/70 px-3.5 py-2 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.45)] flex items-center gap-1.5 transition-transform hover:scale-105"
          title="Club CyM VIP: Membresías y Diamantes"
        >
          <Crown size={15} className="fill-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">Club VIP & 💎</span>
        </button>
      )}

      {/* MODAL INSPIRACIONAL DE DOBLE CONVERSIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[32px] bg-gradient-to-b from-[#1a1300] via-slate-950 to-black border-2 border-[#ffd700]/70 text-white p-6 md:p-7 shadow-[0_0_55px_rgba(255,215,0,0.28)] overflow-hidden my-auto">

            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-500 opacity-25 blur-3xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors z-10"
              aria-label="Cerrar anuncio"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-1">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
                <Flame size={12} /> {mensajeActual.badge}
              </span>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-0.5 shadow-lg mb-3">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Crown size={32} className="text-[#ffd700]" />
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                {mensajeActual.titulo}
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {mensajeActual.subtitulo}
              </p>

              <p className="text-[11px] italic font-serif text-amber-300/90 mt-2.5 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl">
                {mensajeActual.versiculo}
              </p>
            </div>

            {/* BLOQUE UNIFICADO: MEMBRESÍA MENSUAL Y DIAMANTES EN UN MISMO LUGAR */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-amber-500/10 border border-amber-400/50 rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                      <Crown size={13} /> Membresía Club VIP
                    </span>
                    <span className="bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                      Mensual
                    </span>
                  </div>
                  <p className="text-xs font-black text-white">Desde $5.000 / mes</p>
                  <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> IA ilimitada, Audios y Bosquejos
                  </p>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-400/50 rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1">
                      <Gem size={13} /> Diamantes 💎
                    </span>
                    <span className="bg-cyan-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                      Desde $2.500
                    </span>
                  </div>
                  <p className="text-xs font-black text-white">Packs de 10 a 120 💎</p>
                  <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-400 shrink-0" /> Clanes, Torneos y Vidas Extra
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false);
                  if (typeof onIrASocios === 'function') onIrASocios();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] hover:brightness-110 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(245,194,66,0.4)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Crown size={16} className="fill-black" /> Hacerme Socio VIP (Apoyar al Ministerio) <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false);
                  if (typeof onIrADiamantes === 'function') onIrADiamantes();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Gem size={16} className="text-cyan-400" /> Ir a Recargar Diamantes 💎
              </button>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-full pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
              >
                <Heart size={10} /> Continuar explorando por ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}