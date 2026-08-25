import React from 'react';
import { Crown, Star, Shield, Diamond, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ModuloClub({ tema, onVolver, onSuscribir }) {
  const planes = [
    { 
      id: 'BRONCE', nombre: 'Socio Bronce', precio: '$5.000', 
      icono: <Star className="text-[#cd7f32] w-12 h-12 mb-4 mx-auto" />,
      beneficios: ["Apoyo directo al ministerio", "Insignia de colaborador", "Acceso a devocionales"]
    },
    { 
      id: 'PLATA', nombre: 'Socio Plata', precio: '$10.000', 
      icono: <Shield className="text-[#c0c0c0] w-12 h-12 mb-4 mx-auto" />,
      beneficios: ["Todo lo de Bronce", "Acceso a audios narrados", "Ranking destacado en Trivia"]
    },
    { 
      id: 'ORO', nombre: 'Socio Oro', precio: '$20.000', 
      icono: <Crown className="text-[#ffd700] w-12 h-12 mb-4 mx-auto" />,
      beneficios: ["Todo lo de Plata", "Asistente IA sin límites", "Generación de guías bíblicas"]
    },
    { 
      id: 'DIAMANTE', nombre: 'Socio Diamante', precio: '$30.000', 
      icono: <Diamond className="text-[#b9f2ff] w-12 h-12 mb-4 mx-auto" />,
      beneficios: ["Todo lo de Oro", "Bosquejos de sermones en PDF", "Soporte pastoral directo"]
    }
  ];

  return (
    <div className="bg-black/80 border border-amber-500/30 p-6 md:p-10 rounded-3xl text-center shadow-2xl">
      <h2 className="text-3xl font-black text-amber-400 mb-2">Club CyM</h2>
      <p className="text-slate-300 mb-8">Elegí tu nivel de apoyo al ministerio y desbloqueá herramientas exclusivas.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {planes.map(plan => (
          <div key={plan.id} className="bg-[#1a1a1a] border border-amber-500/20 p-6 rounded-2xl flex flex-col hover:scale-[1.02] transition-transform">
            <div className="text-center">
              {plan.icono}
              <h3 className="text-xl font-bold text-white mb-1">{plan.nombre}</h3>
              <p className="text-2xl font-black text-amber-400 mb-4">{plan.precio} <span className="text-sm text-slate-400 font-normal">/mes</span></p>
            </div>
            <ul className="mb-6 space-y-2 flex-grow">
              {plan.beneficios.map((ben, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0 mt-0.5" /> {ben}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onSuscribir(plan.id)} 
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-105 text-black font-black py-3 rounded-xl uppercase tracking-widest transition-transform mt-auto"
            >
              Unirme
            </button>
          </div>
        ))}
      </div>

      <button onClick={onVolver} className="mt-8 flex items-center justify-center gap-2 w-full text-slate-400 hover:text-white font-bold transition-colors">
        <ArrowLeft size={18} /> Volver al Inicio
      </button>
    </div>
  );
}