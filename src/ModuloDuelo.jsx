import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, doc, getDoc, updateDoc, onSnapshot 
} from 'firebase/firestore';
import { 
  Swords, Trophy, Clock, Send, ChevronLeft, Loader2, Zap, Share2
} from 'lucide-react';

const PREGUNTAS_DUELO = [
  { p: "¿Cuántos días y noches llovió durante el diluvio?", r: ["40", "30", "50", "7"], c: 0 },
  { p: "¿Quién fue vendido por sus hermanos como esclavo?", r: ["Moisés", "José", "David", "Daniel"], c: 1 },
  { p: "¿En qué libro bíblico se encuentra el Salmo 23?", r: ["Proverbios", "Salmos", "Isaías", "Génesis"], c: 1 },
  { p: "¿Cuál es el primer libro del Nuevo Testamento?", r: ["Marcos", "Lucas", "Juan", "Mateo"], c: 3 },
  { p: "¿Quién derrotó al gigante Goliat con una honda?", r: ["Saúl", "David", "Salomón", "Sansón"], c: 1 }
];

export default function ModuloDuelo({ currentUser, db, onVolver }) {
  const [dueloActivo, setDueloActivo] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [preguntaIndex, setPreguntaIndex] = useState(0);
  const [puntosDuelo, setPuntosDuelo] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [dueloFinalizado, setDueloFinalizado] = useState(false);

  // RELOJ DE 15 SEGUNDOS
  const [tiempoRestante, setTiempoRestante] = useState(15);

  // CHAT DE BATALLA
  const [mensajesChat, setMensajesChat] = useState([]);
  const [inputChat, setInputChat] = useState('');

  const corazonesSuficientes = (currentUser?.corazones || 0) >= 2;

  // EFECTO DEL RELOJ DE 15s POR PREGUNTA
  useEffect(() => {
    if (!dueloActivo || dueloFinalizado || respuestaSeleccionada !== null || dueloActivo.estado === 'ESPERANDO') return;

    if (tiempoRestante === 0) {
      manejarTiempoAgotado();
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante, dueloActivo, dueloFinalizado, respuestaSeleccionada]);

  const manejarTiempoAgotado = () => {
    setRespuestaSeleccionada(-1);
    siguientePregunta();
  };

  const crearDesafio = async () => {
    if (!corazonesSuficientes) {
      alert("⚠️ Necesitás al menos 2 corazones para apostar en un Duelo Bíblico.");
      return;
    }

    setBuscando(true);
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, { corazones: (currentUser.corazones - 2) });

      const docRef = await addDoc(collection(db, 'cym_duelos'), {
        creadorId: currentUser.uid,
        creadorNombre: currentUser.nombre || 'Jugador',
        creadorFoto: currentUser.photoURL,
        creadorPuntos: 0,
        retadorId: null,
        retadorNombre: null,
        retadorPuntos: 0,
        estado: 'ESPERANDO',
        ganadorId: null,
        mensajesChat: [],
        fechaCreacion: new Date().toISOString()
      });

      onSnapshot(doc(db, 'cym_duelos', docRef.id), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDueloActivo({ id: snap.id, ...data });
          setMensajesChat(data.mensajesChat || []);
        }
      });

    } catch (e) {
      alert("Error al crear el desafío.");
    } finally {
      setBuscando(false);
    }
  };

  const responderPregunta = (indexOpcion) => {
    if (respuestaSeleccionada !== null) return;
    setRespuestaSeleccionada(indexOpcion);

    const esCorrecta = indexOpcion === PREGUNTAS_DUELO[preguntaIndex].c;
    const nuevosPuntos = esCorrecta ? puntosDuelo + 10 : puntosDuelo;
    if (esCorrecta) setPuntosDuelo(nuevosPuntos);

    siguientePregunta(nuevosPuntos);
  };

  const siguientePregunta = (puntosActuales = puntosDuelo) => {
    setTimeout(async () => {
      if (preguntaIndex + 1 < PREGUNTAS_DUELO.length) {
        setPreguntaIndex(preguntaIndex + 1);
        setRespuestaSeleccionada(null);
        setTiempoRestante(15);
      } else {
        setDueloFinalizado(true);
        await finalizarMiTurno(puntosActuales);
      }
    }, 1200);
  };

  const finalizarMiTurno = async (puntosFinales) => {
    if (!dueloActivo) return;
    const dueloRef = doc(db, 'cym_duelos', dueloActivo.id);

    if (dueloActivo.creadorId === currentUser.uid) {
      await updateDoc(dueloRef, { creadorPuntos: puntosFinales });
    } else {
      await updateDoc(dueloRef, { retadorPuntos: puntosFinales, estado: 'FINALIZADO' });
      evaluarGanador(dueloActivo, puntosFinales);
    }
  };

  const evaluarGanador = async (duelo, puntosRetador) => {
    const pCreador = duelo.creadorPuntos;
    let ganador = null;

    if (pCreador > puntosRetador) ganador = duelo.creadorId;
    else if (puntosRetador > pCreador) ganador = currentUser.uid;

    await updateDoc(doc(db, 'cym_duelos', duelo.id), { 
      ganadorId: ganador,
      estado: 'FINALIZADO' 
    });

    if (ganador) {
      const ganadorRef = doc(db, 'cym_usuarios', ganador);
      const snapGanador = await getDoc(ganadorRef);
      if (snapGanador.exists()) {
        const datosG = snapGanador.data();
        await updateDoc(ganadorRef, {
          corazones: (datosG.corazones || 0) + 4,
          puntosTrivia: (datosG.puntosTrivia || 0) + 50,
          tituloHonorifico: '🏆 GLADIADOR BÍBLICO'
        });
      }
    }
  };

  const enviarMensajeChat = async (e) => {
    if (e) e.preventDefault();
    if (!inputChat.trim() || !dueloActivo) return;

    const nuevoMsg = {
      autor: currentUser.nombre || 'Jugador',
      texto: inputChat.trim(),
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nuevosMensajes = [...mensajesChat, nuevoMsg];
    setMensajesChat(nuevosMensajes);
    setInputChat('');

    try {
      await updateDoc(doc(db, 'cym_duelos', dueloActivo.id), {
        mensajesChat: nuevosMensajes
      });
    } catch (err) {}
  };

  const reaccionRapida = (emoji) => {
    setInputChat(emoji);
    enviarMensajeChat();
  };

  const compartirDesafioWhatsApp = () => {
    const linkPartida = `${window.location.origin}?duelo=${dueloActivo?.id}`;
    const texto = `⚔️ ¡Te desafío a un Duelo Bíblico en CyM Biblia! Aposté 2 corazones. Tenés 15 segundos por pregunta. ¿Te animás?\n\nEntrá acá: ${linkPartida}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-between p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border-2 border-blue-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="w-full flex justify-between items-center z-10">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/40 px-4 py-1.5 rounded-full text-blue-300 font-black text-xs uppercase tracking-widest">
          <Swords size={16} /> Duelo Sincrónico 1v1
        </div>
      </div>

      {/* VISTA 1: CREAR PARTIDA */}
      {!dueloActivo && (
        <div className="w-full max-w-xl text-center space-y-6 my-auto z-10">
          <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-3xl inline-block">
            <Swords size={60} className="text-blue-400 mx-auto" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white">Desafío en Duplas 1v1</h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Apostá <span className="text-red-400 font-bold">2 Corazones</span>. Respondé en menos de <span className="text-amber-400 font-bold">15 segundos</span> por pregunta. El ganador se lleva <span className="text-emerald-400 font-bold">+4 Corazones</span> y el título de <span className="text-yellow-300 font-bold">🏆 GLADIADOR BÍBLICO</span>.
          </p>

          <button
            onClick={crearDesafio}
            disabled={buscando}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {buscando ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            {buscando ? "Creando Duelo..." : "Crear Duelo y Apostar 2 Corazones"}
          </button>
        </div>
      )}

      {/* VISTA 2: ESPERANDO RIVAL POR WHATSAPP */}
      {dueloActivo && dueloActivo.estado === 'ESPERANDO' && !dueloFinalizado && (
        <div className="w-full max-w-lg text-center space-y-6 my-auto z-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
            <Loader2 className="animate-spin mx-auto text-blue-400" size={40} />
            <h3 className="text-xl font-black text-white">Esperando al Rival...</h3>
            <p className="text-slate-300 text-xs">Mandalé el enlace a tu amigo por WhatsApp para que entre al duelo.</p>
            
            <button
              onClick={compartirDesafioWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 size={18} /> Invitar por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* VISTA 3: BATALLA ACTIVA CON RELOJ DE 15s */}
      {dueloActivo && !dueloFinalizado && (
        <div className="w-full max-w-xl space-y-4 my-auto z-10">
          
          <div className="flex justify-between items-center bg-black/50 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Clock className={tiempoRestante <= 5 ? "text-red-500 animate-ping" : "text-amber-400"} size={20} />
              <span className={`text-lg font-black ${tiempoRestante <= 5 ? "text-red-500" : "text-amber-400"}`}>
                {tiempoRestante}s
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">Pregunta {preguntaIndex + 1} / {PREGUNTAS_DUELO.length}</span>
            <span className="text-xs font-black text-blue-400 flex items-center gap-1"><Trophy size={14} /> {puntosDuelo} PTS</span>
          </div>

          <div className="bg-black/60 border border-blue-500/30 p-6 rounded-3xl text-center space-y-4 shadow-xl">
            <h3 className="text-lg md:text-xl font-black text-white">{PREGUNTAS_DUELO[preguntaIndex].p}</h3>

            <div className="grid grid-cols-1 gap-2.5">
              {PREGUNTAS_DUELO[preguntaIndex].r.map((opcion, idx) => {
                let estilo = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                if (respuestaSeleccionada !== null) {
                  if (idx === PREGUNTAS_DUELO[preguntaIndex].c) estilo = "bg-emerald-600 text-white font-bold border-emerald-400";
                  else if (idx === respuestaSeleccionada) estilo = "bg-red-600 text-white border-red-400";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => responderPregunta(idx)}
                    disabled={respuestaSeleccionada !== null}
                    className={`w-full p-3.5 rounded-xl border text-xs md:text-sm font-bold text-left transition-all ${estilo}`}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHAT DE BATALLA / REACCIONES RÁPIDAS */}
          <div className="bg-black/80 border border-blue-500/20 p-3 rounded-2xl space-y-2">
            <div className="flex gap-2 justify-center border-b border-white/10 pb-2">
              {['🔥', '⚡', '🙏', '👏', '😱'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => reaccionRapida(emoji)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-xl text-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="max-h-20 overflow-y-auto space-y-1 text-left text-xs">
              {mensajesChat.map((m, i) => (
                <div key={i} className="text-slate-300">
                  <span className="font-bold text-blue-400">{m.autor}: </span>{m.texto}
                </div>
              ))}
            </div>

            <form onSubmit={enviarMensajeChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribir mensaje de batalla..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500">
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VISTA 4: PANTALLA FINAL */}
      {dueloFinalizado && (
        <div className="w-full max-w-lg text-center space-y-6 my-auto z-10">
          <div className="bg-gradient-to-b from-amber-500/20 to-black/80 border border-amber-500/40 p-8 rounded-3xl space-y-4 shadow-2xl">
            <Trophy size={60} className="text-amber-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">¡Duelo Finalizado!</h2>
            <p className="text-slate-300 text-sm">Obtuviste <span className="text-amber-400 font-bold">{puntosDuelo} Puntos</span>.</p>

            <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/30 text-xs space-y-2">
              <p className="text-amber-300 font-bold uppercase tracking-wider">Premio al Ganador</p>
              <p className="text-slate-400">Si tu puntaje fue superior al de tu oponente, se te acreditarán <span className="text-emerald-400 font-bold">+4 Corazones</span> y el título honorífico <span className="text-yellow-300 font-bold">🏆 GLADIADOR BÍBLICO</span> en tu perfil.</p>
            </div>

            <button
              onClick={onVolver}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}

    </div>
  );
}