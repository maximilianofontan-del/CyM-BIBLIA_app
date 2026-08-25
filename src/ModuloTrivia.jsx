import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

// IMPORTAMOS LA BASE DE DATOS MASIVA DE PREGUNTAS
import preguntasDesdeJson from './data/PreguntasTrivia.json';

export default function ModuloTrivia({ currentUser, db, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntosSesion, setPuntosSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [preguntasMezcladas, setPreguntasMezcladas] = useState([]);

  // Mezclar las preguntas al iniciar el componente
  useEffect(() => {
    const mezcladas = [...preguntasDesdeJson].sort(() => Math.random() - 0.5);
    // Para que no sea infinito en una sola sesión, tomamos 15 preguntas al azar por partida
    setPreguntasMezcladas(mezcladas.slice(0, 15));
  }, []);

  const manejarRespuesta = async (opcionSeleccionada) => {
    const esCorrecta = opcionSeleccionada === preguntasMezcladas[preguntaActual].respuestaCorrecta;
    let nuevosPuntosSesion = puntosSesion;
    
    if (esCorrecta) {
      nuevosPuntosSesion += 10;
      setPuntosSesion(nuevosPuntosSesion);
    }

    if (preguntaActual + 1 < preguntasMezcladas.length) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setJuegoTerminado(true);
      if (currentUser && db) {
        const puntosTotales = (currentUser.puntosTrivia || 0) + nuevosPuntosSesion;
        await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
          puntosTrivia: puntosTotales
        });
      }
    }
  };

  // Pantalla de carga mientras mezcla
  if (preguntasMezcladas.length === 0) {
    return <div className="text-center p-10 text-white font-bold">Cargando desafío...</div>;
  }

  // Pantalla final
  if (juegoTerminado) {
    return (
      <div className="bg-blue-950/80 border border-blue-500/40 p-8 rounded-3xl text-center shadow-xl">
        <h2 className="text-4xl font-black text-white mb-4">¡Desafío Completado!</h2>
        <p className="text-blue-300 text-xl mb-6">Sumaste <span className="text-amber-400 font-black">{puntosSesion} puntos</span> a tu cuenta global.</p>
        <button onClick={onVolver} className="bg-blue-600 text-white font-black py-4 px-8 rounded-xl w-full uppercase tracking-widest hover:scale-105 transition-transform">
          Volver al Inicio
        </button>
      </div>
    );
  }

  const pregunta = preguntasMezcladas[preguntaActual];

  return (
    <div className="bg-black/80 border border-blue-500/40 p-6 md:p-10 rounded-3xl text-center shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-blue-500/30 pb-4">
        <span className="text-blue-300 font-bold uppercase tracking-widest text-sm">Pregunta {preguntaActual + 1} / {preguntasMezcladas.length}</span>
        <span className="bg-blue-600 text-white font-black px-4 py-2 rounded-full shadow-lg">{puntosSesion} Pts</span>
      </div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white mb-10 leading-tight">{pregunta.pregunta}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pregunta.opciones.map((opcion, index) => (
          <button 
            key={index} 
            onClick={() => manejarRespuesta(opcion)}
            className="bg-[#1a1a1a] border border-slate-600 text-white font-bold py-5 px-4 rounded-xl hover:bg-blue-600 hover:border-blue-400 transition-colors shadow-md"
          >
            {opcion}
          </button>
        ))}
      </div>

      <button onClick={onVolver} className="mt-10 text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 transition-colors">
        Abandonar Partida
      </button>
    </div>
  );
}