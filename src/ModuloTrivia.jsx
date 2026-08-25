import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, ChevronRight, Timer, Medal } from 'lucide-react';

const PREGUNTAS = [
  { pregunta: "¿Qué mar cruzó Moisés con el pueblo de Israel?", opciones: ["Mar Muerto", "Mar Rojo", "Mar de Galilea"], correcta: 1, referencia: "Éxodo 14:21" },
  { pregunta: "¿Quién fue tragado por un gran pez?", opciones: ["Pedro", "Jonás", "Noé"], correcta: 1, referencia: "Jonás 1:17" },
  { pregunta: "¿Cuántos días y noches llovió en el diluvio?", opciones: ["40", "7", "12"], correcta: 0, referencia: "Génesis 7:12" },
  { pregunta: "¿Quién derrotó a Goliat?", opciones: ["Saúl", "Salomón", "David"], correcta: 2, referencia: "1 Samuel 17" }
];

export default function ModuloTrivia({ tema, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respondido, setRespondido] = useState(false);
  const [opcionElegida, setOpcionElegida] = useState(null);
  const [tiempo, setTiempo] = useState(15);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  useEffect(() => {
    if (tiempo > 0 && !respondido && !juegoTerminado) {
      const timer = setTimeout(() => setTiempo(tiempo - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tiempo === 0 && !respondido) {
      setRespondido(true);
    }
  }, [tiempo, respondido, juegoTerminado]);

  const manejarRespuesta = (index) => {
    if (respondido) return;
    setOpcionElegida(index);
    setRespondido(true);
    if (index === PREGUNTAS[preguntaActual].correcta) setPuntaje(puntaje + 10);
  };

  const siguientePregunta = () => {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setRespondido(false);
      setOpcionElegida(null);
      setTiempo(15);
    } else {
      setJuegoTerminado(true);
    }
  };

  const isCym = tema === 'cym';

  return (
    <div className={`p-6 max-w-2xl mx-auto rounded-3xl border-2 shadow-2xl mt-10 ${isCym ? 'bg-black/80 border-[#cca300]/40 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-current/20">
        <h2 className={`text-2xl font-black flex items-center gap-2 ${isCym ? 'text-[#ffd700]' : 'text-amber-600'}`}>
          <Trophy size={28} /> Desafío CyM
        </h2>
        <button onClick={onVolver} className="text-sm font-bold opacity-70 hover:opacity-100">Volver</button>
      </div>

      {!juegoTerminado ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center font-bold text-sm opacity-80">
            <span>Pregunta {preguntaActual + 1} de {PREGUNTAS.length}</span>
            <span className={`flex items-center gap-1 ${tiempo <= 5 ? 'text-red-500 animate-pulse' : ''}`}><Timer size={16}/> {tiempo}s</span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black leading-tight min-h-[80px]">
            {PREGUNTAS[preguntaActual].pregunta}
          </h3>

          <div className="space-y-3">
            {PREGUNTAS[preguntaActual].opciones.map((opcion, idx) => {
              const esCorrecta = idx === PREGUNTAS[preguntaActual].correcta;
              const fueElegida = opcionElegida === idx;
              let claseBoton = isCym ? 'bg-white/10 hover:bg-white/20 border-transparent' : 'bg-slate-50 hover:bg-slate-100 border-slate-200';
              
              if (respondido) {
                if (esCorrecta) claseBoton = 'bg-emerald-500/20 border-emerald-500 text-emerald-600 font-bold';
                else if (fueElegida) claseBoton = 'bg-red-500/20 border-red-500 text-red-600 line-through opacity-70';
                else claseBoton = 'opacity-40 border-transparent';
              }

              return (
                <button 
                  key={idx} 
                  disabled={respondido}
                  onClick={() => manejarRespuesta(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${claseBoton}`}
                >
                  <span>{opcion}</span>
                  {respondido && esCorrecta && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {respondido && fueElegida && !esCorrecta && <XCircle size={18} className="text-red-500" />}
                </button>
              );
            })}
          </div>

          {respondido && (
            <div className="pt-6 animate-in slide-in-from-bottom-2">
              <div className={`p-4 rounded-xl mb-4 text-sm font-bold border ${isCym ? 'bg-[#cca300]/10 border-[#cca300]/30 text-[#ffd700]' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                📖 La respuesta está en: {PREGUNTAS[preguntaActual].referencia}
              </div>
              <button onClick={siguientePregunta} className={`w-full py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isCym ? 'bg-[#cca300] text-black' : 'bg-blue-600 text-white'}`}>
                {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'} <ChevronRight size={18}/>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 animate-in zoom-in">
          <Medal size={64} className={`mx-auto mb-4 ${isCym ? 'text-[#ffd700]' : 'text-amber-500'}`} />
          <h3 className="text-3xl font-black mb-2">¡Completado!</h3>
          <p className="text-lg mb-6 opacity-80">Lograste <strong className={isCym ? 'text-[#ffd700]' : 'text-amber-600'}>{puntaje}</strong> puntos.</p>
          <button onClick={onVolver} className={`px-8 py-3 rounded-full font-black uppercase tracking-widest ${isCym ? 'bg-[#cca300] text-black' : 'bg-blue-600 text-white'}`}>
            Volver al Inicio
          </button>
        </div>
      )}
    </div>
  );
}