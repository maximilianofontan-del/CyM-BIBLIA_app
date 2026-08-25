import React from 'react';
import { Crown, Sparkles, Star, ShieldCheck, Heart } from 'lucide-react';

export default function ModuloClub({ tema, onVolver, onSuscribir }) {
  const isCym = tema === 'cym';

  const PLANES = [
    { nivel: 'Bronce', precio: 5, color: 'from-amber-700 to-amber-900', icon: Star, beneficios: ['300 preguntas IA / mes', 'Biblia en Audio desbloqueada', 'Insignia Bronce en perfil'] },
    { nivel: 'Plata', precio: 10, color: 'from-slate-400 to-slate-600', icon: ShieldCheck, beneficios: ['IA Ilimitada', 'Bosquejos en PDF', 'Insignia Plata'] },
    { nivel: 'Oro', precio: 15, color: 'from-yellow-400 to-yellow-600', icon: Crown, beneficios: ['Todo lo anterior', 'Zoom mensual Q&A con Pastor', 'Nombre dorado en app'] },
    { nivel: 'Diamante', precio: 30, color: 'from-cyan-400 to-blue-600', icon: Sparkles, beneficios: ['Mención como Patrocinador', 'Muro de Oración Prioritario', 'Acceso total sin límites'] }
  ];

  return (
    <div className={`p-6 max-w-5xl mx-auto mt-10 rounded-3xl shadow-2xl border-2 ${isCym ? 'bg-black/90 border-[#cca300]/30 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="text-center mb-10">
        <Heart size={48} className={`mx-auto mb-4 ${isCym ? 'text-[#ffd700]' : 'text-red-500'}`} />
        <h2 className="text-3xl md:text-4xl font-black mb-3">Club de Sembradores CyM</h2>
        <p className="opacity-80 max-w-xl mx-auto text-sm leading-relaxed">
          Tu suscripción mensual sostiene los servidores de la Inteligencia Artificial y nos ayuda a seguir expandiendo el Evangelio. Elige tu nivel y desbloquea herramientas exclusivas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {PLANES.map((plan, idx) => (
          <div key={idx} className={`relative p-1 rounded-2xl bg-gradient-to-b ${plan.color} shadow-lg hover:-translate-y-2 transition-transform`}>
            <div className={`h-full p-6 rounded-xl flex flex-col ${isCym ? 'bg-[#141414]' : 'bg-white'}`}>
              <plan.icon size={32} className={`mb-4 ${isCym ? 'text-white' : 'text-slate-800'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">{plan.nivel}</h3>
              <p className="text-2xl font-black mb-6">${plan.precio} <span className="text-xs font-normal opacity-60">/ mes</span></p>
              
              <ul className="space-y-3 flex-grow mb-6 text-sm opacity-90">
                {plan.beneficios.map((ben, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {ben}
                  </li>
                ))}
              </ul>

              <button onClick={onSuscribir} className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-colors bg-gradient-to-r ${plan.color} text-white hover:opacity-90`}>
                Suscribirme
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={onVolver} className="text-sm font-bold opacity-60 hover:opacity-100 underline underline-offset-4">
          Volver a la lectura
        </button>
      </div>
    </div>
  );
}