import React, { useState, useEffect, useCallback } from 'react';
import {
  Gem, Sparkles, Crown, Shield, Bot, Heart, X, CreditCard, ArrowRight, Zap
} from 'lucide-react';
import { PAQUETES_DIAMANTES } from './ModuloTienda';

// ============================================================================
// CALIBRACIÓN DEL MOTOR DE CONVERSIÓN (PROTOCOLO ANTI-FATIGA COGNITIVA)
// ============================================================================
const CONFIG_PROMO = {
  DELAY_INICIAL_MS: 45000,          // 45 segundos tras ingresar antes del primer cartel
  INTERVALO_RECURRENCIA_MS: 240000, // 4 minutos entre apariciones periódicas
  MAX_IMPRESIONES_SESION: 4,        // Límite máximo por sesión para evitar saturación
  STORAGE_KEY_COUNT: 'cym_promo_vip_count',
  STORAGE_KEY_LAST: 'cym_promo_vip_last_ts',
};

const BENEFICIOS_DESBLOQUEABLES = [
  {
    id: 'clanes',
    badge: 'LIDERAZGO DE CLAN',
    titulo: 'Fundá y Potenciá tu Propio Clan',
    subtitulo: 'Desbloqueá emblemas exclusivos, cupos ampliados y bendiciones grupales con recargas mensuales de Diamantes.',
    icono: Shield,
    acento: 'from-cyan-500 to-blue-600',
    paqueteSugeridoId: 'pack_clan',
  },
  {
    id: 'ia_biblica',
    badge: 'INTELIGENCIA ARTIFICIAL VIP',
    titulo: 'Consultas Ilimitadas al Mentor IA',
    subtitulo: 'Accedé a análisis profundos de escrituras, estrategias de torneo y respuestas instantáneas sin quedarte sin saldo.',
    icono: Bot,
    acento: 'from-purple-500 to-cyan-500',
    paqueteSugeridoId: 'pack_chico',
  },
  {
    id: 'torneos_vip',
    badge: 'ARENA COMPETITIVA',
    titulo: 'Pases Directos a Torneos VIP',
    subtitulo: 'Entrá en las ligas mayores, multiplicá tus recompensas semanales y escalá al top del ranking CyM.',
    icono: Crown,
    acento: 'from-amber-400 to-orange-600',
    paqueteSugeridoId: 'pack_medio',
  },
  {
    id: 'vidas_infinitas',
    badge: 'CONTINUIDAD EN BATALLA',
    titulo: 'Nunca Pierdas tu Racha en Trivias',
    subtitulo: 'Canjeá Diamantes por Corazones al instante y bendecí a los hermanos de tu clan en momentos críticos.',
    icono: Heart,
    acento: 'from-pink-500 to-rose-600',
    paqueteSugeridoId: 'pack_leyenda',
  },
];

/**
 * Genialidad Arquitectónica:
 * Componente autónomo de conversión multi-pestaña. Se monta una sola vez
 * en App.js y opera sobre toda la aplicación con supresión contextual
 * (se silencia automáticamente dentro de la tienda o durante trivias activas).
 */
export default function PromocionMembresiaVIP({
  currentUser,
  enTienda = false,
  pausarAnuncios = false,
  onIrATienda,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceBeneficio, setIndiceBeneficio] = useState(0);

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
      // Tolerancia a fallos en navegadores con almacenamiento bloqueado
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

    setIndiceBeneficio((prev) => (prev + 1) % BENEFICIOS_DESBLOQUEABLES.length);
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

  const beneficioActual = BENEFICIOS_DESBLOQUEABLES[indiceBeneficio];
  const IconoBeneficio = beneficioActual.icono;
  const paqueteDestacado =
    PAQUETES_DIAMANTES.find((p) => p.id === beneficioActual.paqueteSugeridoId) ||
    PAQUETES_DIAMANTES[2];

  const handleIrATiendaDesdeAnuncio = () => {
    setModalAbierto(false);
    if (typeof onIrATienda === 'function') {
      onIrATienda();
    }
  };

  const handleSuscripcionDirecta = () => {
    setModalAbierto(false);
    window.open(paqueteDestacado.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* ACCESO RÁPIDO FLOTANTE EN TODAS LAS PESTAÑAS */}
      {!modalAbierto && (
        <button
          type="button"
          onClick={() => {
            setIndiceBeneficio((prev) => (prev + 1) % BENEFICIOS_DESBLOQUEABLES.length);
            setModalAbierto(true);
          }}
          className="fixed bottom-20 right-4 z-40 bg-slate-950/90 hover:bg-slate-900 text-cyan-300 border border-cyan-400/50 px-3.5 py-2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center gap-2 transition-transform hover:scale-105 backdrop-blur-md"
          title="Ver beneficios de Membresía VIP"
        >
          <Gem size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">VIP</span>
        </button>
      )}

      {/* CARTEL PROMOCIONAL PERIÓDICO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-cyan-400/60 text-white p-6 md:p-7 shadow-[0_0_45px_rgba(34,211,238,0.3)] overflow-hidden">

            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-gradient-to-r ${beneficioActual.acento} opacity-25 blur-3xl pointer-events-none`} />

            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors z-10"
              aria-label="Cerrar anuncio"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-1">
              <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-4">
                <Sparkles size={12} /> {beneficioActual.badge}
              </span>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${beneficioActual.acento} p-0.5 shadow-lg mb-4`}>
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <IconoBeneficio size={32} className="text-cyan-300" />
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                {beneficioActual.titulo}
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {beneficioActual.subtitulo}
              </p>
            </div>

            <div className="mt-5 bg-white/5 border border-cyan-400/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Gem size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Membresía Recomendada
                  </p>
                  <p className="text-lg font-black text-white">
                    {paqueteDestacado.cant} Diamantes <span className="text-xs font-bold text-slate-400">/ mes</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-cyan-300 block">
                  {paqueteDestacado.precio}
                </span>
                <span className="text-[9px] font-bold uppercase text-emerald-400 flex items-center justify-end gap-0.5">
                  <Zap size={10} /> Activación VIP
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleIrATiendaDesdeAnuncio}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Gem size={16} /> Ver Todos los Planes en la Tienda <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleSuscripcionDirecta}
                className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard size={15} className="text-cyan-400" /> Suscribirme Directo ({paqueteDestacado.precio})
              </button>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-full pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
              >
                Continuar explorando por ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}