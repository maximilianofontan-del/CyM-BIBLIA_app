import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, ChevronRight, Timer, Flame } from 'lucide-react';

// BASE DE PREGUNTAS (Podés agregar cientos aquí en el futuro)
const PREGUNTAS = [
  { pregunta: "¿Qué mar cruzó Moisés con el pueblo de Israel?", opciones: ["Mar Muerto", "Mar Rojo", "Mar de Galilea"], correcta: 1, referencia: "Éxodo 14:21" },
  { pregunta: "¿Quién fue tragado por un gran pez?", opciones: ["Pedro", "Jonás", "Noé"], correcta: 1, referencia: "Jonás 1:17" },
  { pregunta: "¿Cuántos días y noches llovió en el diluvio?", opciones: ["40", "7", "12"], correcta: 0, referencia: "Génesis 7:12" },
  { pregunta: "¿Quién derrotó a Goliat?", opciones: ["Saúl", "Salomón", "David"], correcta: 2, referencia: "1 Samuel 17" },
  { pregunta: "¿Quién construyó el arca?", opciones: ["Moisés", "Abraham", "Noé"], correcta: 2, referencia: "Génesis 6" },
  { pregunta: "¿Qué animal tentó a Eva en el Edén?", opciones: ["Una serpiente", "Un león", "Un dragón"], correcta: 0, referencia: "Génesis 3" },
  { pregunta: "¿Cómo se llamaba el gigante filisteo?", opciones: ["Sansón", "Goliat", "Faraón"], correcta: 1, referencia: "1 Samuel 17" },
  { pregunta: "¿Quién es conocido como el padre de la fe?", opciones: ["Jacob", "Abraham", "Isaac"], correcta: 1, referencia: "Romanos 4:16" },
  { pregunta: "¿Cuántas plagas envió Dios a Egipto?", opciones: ["7", "10", "12"], correcta: 1, referencia: "Éxodo 7-12" },
  { pregunta: "¿Cuál fue el primer milagro de Jesús?", opciones: ["Sanar a un ciego", "Caminar sobre el agua", "Convertir agua en vino"], correcta: 2, referencia: "Juan 2:11" },
  { pregunta: "¿Quién traicionó a Jesús por 30 monedas de plata?", opciones: ["Pedro", "Judas Iscariote", "Tomás"], correcta: 1, referencia: "Mateo 26:15" },
  { pregunta: "¿Qué profeta fue arrojado al foso de los leones?", opciones: ["Daniel", "Ezequiel", "Jeremías"], correcta: 0, referencia: "Daniel 6" },
  { pregunta: "¿Quién fue el hombre más sabio del Antiguo Testamento?", opciones: ["David", "Salomón", "Moisés"], correcta: 1, referencia: "1 Reyes 3:12" },
  { pregunta: "¿Cuál es el libro más largo de la Biblia?", opciones: ["Génesis", "Isaías", "Salmos"], correcta: 2, referencia: "Libro de Salmos" },
  { pregunta: "¿En qué ciudad nació Jesús?", opciones: ["Nazaret", "Belén", "Jerusalén"], correcta: 1, referencia: "Mateo 2:1" },
  { pregunta: "¿Cuántos mandamientos le dio Dios a Moisés en el Sinaí?", opciones: ["7", "10", "12"], correcta: 1, referencia: "Éxodo 20" },
  { pregunta: "¿Quién fue la madre de Jesús?", opciones: ["María", "Marta", "Magdalena"], correcta: 0, referencia: "Lucas 1:27" },
  { pregunta: "¿Qué ave trajo una rama de olivo a Noé?", opciones: ["Un cuervo", "Un águila", "Una paloma"], correcta: 2, referencia: "Génesis 8:11" },
  { pregunta: "¿Cuál de estos NO era un apóstol de Jesús?", opciones: ["Mateo", "Juan", "Pablo"], correcta: 2, referencia: "Mateo 10:2" },
  { pregunta: "¿Qué usó Jesús para alimentar a los 5000?", opciones: ["5 panes y 2 peces", "7 panes y 3 peces", "Maná del cielo"], correcta: 0, referencia: "Mateo 14:17" }
];

export default function ModuloTrivia({ tema, onVolver }) {
  // Juego infinito: elegimos una pregunta random al azar
  const [indicePregunta, setIndicePregunta] = useState(() => Math.floor(Math.random() * PREGUNTAS.length));
  
  const [puntaje, setPuntaje] = useState(0);
  const [racha, setRacha] = useState(0); // Nuevo sistema de rachas
  const [respondido, setRespondido] = useState(false);
  const [opcionElegida, setOpcionElegida] = useState(null);
  const [tiempo, setTiempo] = useState(15);

  useEffect(() => {
    if (tiempo > 0 && !respondido) {
      const timer = setTimeout(() => setTiempo(tiempo - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tiempo === 0 && !respondido) {
      setRespondido(true);
      setRacha(0); // Pierde la racha por tiempo
    }
  }, [tiempo, respondido]);

  const manejarRespuesta = (index) => {
    if (respondido) return;
    setOpcionElegida(index);
    setRespondido(true);
    
    if (index === PREGUNTAS[indicePregunta].correcta) {
      setPuntaje(puntaje + 10);
      setRacha(racha + 1); // Suma racha
    } else {
      setRacha(0); // Pierde la racha por error
    }
  };

  const siguientePregunta = () => {
    let nuevoIndice;
    // Buscamos una pregunta random que NO sea la misma que acabamos de jugar
    do {
      nuevoIndice = Math.floor(Math.random() * PREGUNTAS.length);
    } while (nuevoIndice === indicePregunta);

    setIndicePregunta(nuevoIndice);
    setRespondido(false);
    setOpcionElegida(null);
    setTiempo(15);
  };

  const isCym = tema === 'cym';
  const preguntaActual = PREGUNTAS[indicePregunta];

  return (
    <div className={`p-6 max-w-2xl mx-auto rounded-3xl border-2 shadow-2xl mt-10 ${isCym ? 'bg-black/80 border-[#cca300]/40 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
      
      {/* HEADER DE LA TRIVIA */}
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-current/20">
        <h2 className={`text-2xl font-black flex items-center gap-2 ${isCym ? 'text-[#ffd700]' : 'text-amber-600'}`}>
          <Trophy size={28} /> Desafío CyM
        </h2>
        <button onClick={onVolver} className="text-sm font-bold opacity-70 hover:opacity-100 uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full">
          Salir
        </button>
      </div>

      <div className="space-y-6">
        
        {/* PUNTAJE, RACHA Y TIEMPO */}
        <div className="flex justify-between items-center font-bold text-sm bg-black/20 p-3 rounded-xl border border-current/10">
          <div className="flex items-center gap-4">
            <span>Puntos: <strong className={`text-lg ${isCym ? 'text-[#ffd700]' : 'text-amber-600'}`}>{puntaje}</strong></span>
            {racha > 1 && (
              <span className="flex items-center gap-1 text-orange-500 animate-pulse">
                <Flame size={16}/> Racha x{racha}
              </span>
            )}
          </div>
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${tiempo <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10'}`}>
            <Timer size={16}/> {tiempo}s
          </span>
        </div>
        
        {/* PREGUNTA */}
        <h3 className="text-xl md:text-2xl font-black leading-tight min-h-[80px]">
          {preguntaActual.pregunta}
        </h3>

        {/* OPCIONES */}
        <div className="space-y-3">
          {preguntaActual.opciones.map((opcion, idx) => {
            const esCorrecta = idx === preguntaActual.correcta;
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

        {/* RESULTADO Y BOTÓN DE CONTINUAR */}
        {respondido && (
          <div className="pt-6 animate-in slide-in-from-bottom-2">
            <div className={`p-4 rounded-xl mb-4 text-sm font-bold border ${isCym ? 'bg-[#cca300]/10 border-[#cca300]/30 text-[#ffd700]' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              📖 La respuesta está en: {preguntaActual.referencia}
            </div>
            
            <button 
              onClick={siguientePregunta} 
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg ${isCym ? 'bg-[#cca300] text-black' : 'bg-blue-600 text-white'}`}
            >
              Siguiente Pregunta <ChevronRight size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}