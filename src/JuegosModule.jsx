import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOTOR DE AUDIO AVANZADO (Música y Efectos)
// ==========================================
class SoundFX {
  static ctx = null;
  static bgmOsc = null;
  static bgmGain = null;
  static bgmInterval = null;

  static getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  static playTone(freq, type, duration, vol = 0.1) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  static agua() { this.playTone(600, 'sine', 0.15, 0.2); setTimeout(() => this.playTone(800, 'sine', 0.1), 100); }
  static exito() { [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.2), i * 100)); }
  static error() { this.playTone(150, 'sawtooth', 0.3, 0.3); setTimeout(() => this.playTone(100, 'sawtooth', 0.4, 0.3), 150); }
  static levelUp() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'square', 0.15, 0.1), i * 120)); }
  static remada() { this.playTone(200, 'sine', 0.1, 0.1); }
  static pop() { this.playTone(400, 'sine', 0.05, 0.1); }
  static choque() { this.playTone(100, 'square', 0.3, 0.4); setTimeout(() => this.playTone(50, 'sawtooth', 0.4, 0.4), 100); }

  static toggleMusic(play) {
    try {
      const ctx = this.getContext();
      if (!play) {
        clearInterval(this.bgmInterval);
        return;
      }
      const notas = [261.63, 329.63, 392.00, 523.25]; // Melodia alegre Do Mayor
      let step = 0;
      clearInterval(this.bgmInterval);
      this.bgmInterval = setInterval(() => {
        this.playTone(notas[step % notas.length], 'sine', 0.2, 0.05);
        step++;
      }, 400);
    } catch (e) {}
  }
}

// ==========================================
// CONTENEDOR PRINCIPAL Y MEMORIA DE ESTRELLAS
// ==========================================
export function JuegosModule() {
  const [juegoActivo, setJuegoActivo] = useState('MENU');
  const [estrellas, setEstrellas] = useState(0);
  const [musicaActivada, setMusicaActivada] = useState(false);

  const ganarEstrellas = (cantidad) => setEstrellas(prev => prev + cantidad);

  const cambiarJuego = (juego) => {
    SoundFX.pop();
    setJuegoActivo(juego);
  };

  const toggleMusica = () => {
    const nuevoEstado = !musicaActivada;
    setMusicaActivada(nuevoEstado);
    SoundFX.toggleMusic(nuevoEstado);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: 'white', padding: '16px', fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        {juegoActivo !== 'MENU' ? (
          <button onClick={() => cambiarJuego('MENU')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>⬅️ Volver</button>
        ) : <div />}
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={toggleMusica} style={{ backgroundColor: '#1e293b', border: '2px solid #334155', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '16px' }}>
            {musicaActivada ? '🔊 Música On' : '🔈 Música Off'}
          </button>
          <div style={{ backgroundColor: '#fbbf24', color: '#78350f', fontWeight: 'black', padding: '8px 16px', borderRadius: '12px', fontSize: '16px', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⭐ {estrellas}
          </div>
        </div>
      </div>

      {juegoActivo === 'MENU' && <MenuJuegos onSeleccionar={cambiarJuego} estrellas={estrellas} />}
      {juegoActivo === 'PECES' && <JuegoPeces onGanar={ganarEstrellas} />}
      {juegoActivo === 'JESUS' && <JuegoDondeEstaJesus onGanar={ganarEstrellas} />}
      {juegoActivo === 'BARCO' && <JuegoNavegarBarco onGanar={ganarEstrellas} />}
      {juegoActivo === 'LEER' && <JuegoAprenderLeer onGanar={ganarEstrellas} />}
    </div>
  );
}

// ==========================================
// MENÚ PRINCIPAL
// ==========================================
function MenuJuegos({ onSeleccionar, estrellas }) {
  const desbloqueoEspecial = estrellas >= 50;

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '#facc15', textShadow: '3px 3px #b45309', margin: '0 0 8px 0' }}>🎨 CYM KIDS 🎨</h1>
      <p style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '24px' }}>¡Ganá estrellas jugando para desbloquear la Corona!</p>
      
      {desbloqueoEspecial && (
        <div style={{ backgroundColor: '#fef08a', border: '4px dashed #eab308', padding: '16px', borderRadius: '20px', marginBottom: '24px', color: '#713f12', animation: 'pulse 2s infinite' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'black' }}>👑 ¡DESBLOQUEASTE LA CORONA DE ORO! 👑</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>¡Sos un Súper Campeón de CyM!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={() => onSeleccionar('PECES')} style={{ backgroundColor: '#0284c7', border: '4px solid #38bdf8', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #0369a1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.1s' }}>
          <div style={{ textAlign: 'left' }}><span style={{ display: 'block' }}>🐟 Atrapá el Pez</span><span style={{ fontSize: '12px', color: '#bae6fd', fontWeight: 'normal' }}>Niveles de velocidad</span></div>
          <span style={{ fontSize: '36px' }}>🎣</span>
        </button>
        <button onClick={() => onSeleccionar('JESUS')} style={{ backgroundColor: '#16a34a', border: '4px solid #4ade80', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #15803d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}><span style={{ display: 'block' }}>✨ ¿Dónde está Jesús?</span><span style={{ fontSize: '12px', color: '#bbf7d0', fontWeight: 'normal' }}>Búsqueda avanzada</span></div>
          <span style={{ fontSize: '36px' }}>🔍</span>
        </button>
        <button onClick={() => onSeleccionar('BARCO')} style={{ backgroundColor: '#d97706', border: '4px solid #fbbf24', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #b45309', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}><span style={{ display: 'block' }}>⛵ Cruzando el Mar</span><span style={{ fontSize: '12px', color: '#fef08a', fontWeight: 'normal' }}>Esquivá obstáculos (3 vidas)</span></div>
          <span style={{ fontSize: '36px' }}>🌊</span>
        </button>
        <button onClick={() => onSeleccionar('LEER')} style={{ backgroundColor: '#8b5cf6', border: '4px solid #c084fc', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}><span style={{ display: 'block' }}>📖 Leo con Jesús</span><span style={{ fontSize: '12px', color: '#e9d5ff', fontWeight: 'normal' }}>Armá las palabras (Con Audio)</span></div>
          <span style={{ fontSize: '36px' }}>🔤</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 1: ATRAPÁ EL PEZ (Con Niveles)
// ==========================================
function JuegoPeces({ onGanar }) {
  const [pecera, setPecera] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [pezVisible, setPezVisible] = useState(false);
  const [posicionPez, setPosicionPez] = useState({ x: 50, y: 50 });
  
  const meta = nivel * 5;
  const velocidad = Math.max(2000 - (nivel * 300), 600); // Se hace más rápido

  useEffect(() => {
    const interval = setInterval(() => {
      setPezVisible(false);
      setTimeout(() => {
        setPosicionPez({ x: Math.floor(Math.random() * 70) + 15, y: Math.floor(Math.random() * 50) + 20 });
        setPezVisible(true);
      }, 200);
    }, velocidad);
    return () => clearInterval(interval);
  }, [velocidad]);

  const atraparPez = () => {
    SoundFX.agua();
    const nuevosPeces = pecera + 1;
    setPecera(nuevosPeces);
    setPezVisible(false);

    if (nuevosPeces >= meta) {
      SoundFX.levelUp();
      setNivel(n => n + 1);
      setPecera(0);
      onGanar(5);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>Nivel {nivel}</h2>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>Faltan {meta - pecera} 🐟</span>
      </div>
      
      <div style={{ position: 'relative', height: '350px', backgroundColor: '#0284c7', borderRadius: '20px', border: '6px solid #38bdf8', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', backgroundColor: '#bae6fd', opacity: 0.3 }} />
        
        {pezVisible && (
          <button onClick={atraparPez} style={{ position: 'absolute', left: `${posicionPez.x}%`, top: `${posicionPez.y}%`, fontSize: '56px', background: 'none', border: 'none', cursor: 'pointer', transform: 'scale(1.2)', padding: 0 }}>🐟</button>
        )}
        
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '4px solid #bae6fd', borderRadius: '20px', padding: '10px', display: 'flex', flexWrap: 'wrap', width: '120px', minHeight: '60px' }}>
          {Array.from({ length: pecera }).map((_, i) => <span key={i} style={{ fontSize: '20px' }}>🐠</span>)}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 2: ¿DÓNDE ESTÁ JESÚS? (Difícil y dinámico)
// ==========================================
function JuegoDondeEstaJesus({ onGanar }) {
  const [nivel, setNivel] = useState(1);
  const [personas, setPersonas] = useState([]);
  const [mensaje, setMensaje] = useState('¡Encontrá a Jesús!');

  const generarMultitud = (nvl) => {
    const cantidad = Math.min(6 + (nvl * 3), 25); // Crece la grilla con el nivel
    // Emojis distractores (se vuelven más parecidos)
    const emojis = ['👤', '👩', '👨', '👵', '🧕', '👳‍♂️', '🧔', '🧔‍♂️', '🧔🏻‍♂️'];
    
    const nuevaMultitud = Array.from({ length: cantidad }).map(() => ({
      esJesus: false,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    
    const posicionJesus = Math.floor(Math.random() * cantidad);
    // En niveles altos, le sacamos los destellos obvios para que sea más difícil
    nuevaMultitud[posicionJesus] = { esJesus: true, emoji: nvl > 3 ? '🧔🏽‍♂️' : '✨🧔🏽‍♂️✨' };
    setPersonas(nuevaMultitud);
  };

  useEffect(() => { generarMultitud(nivel); }, [nivel]);

  const tocarPersona = (esJesus) => {
    if (esJesus) {
      SoundFX.exito();
      setMensaje('¡Lo encontraste!');
      onGanar(3);
      setTimeout(() => {
        setNivel(n => n + 1);
        setMensaje(`Nivel ${nivel + 1}`);
      }, 1000);
    } else {
      SoundFX.error();
      setMensaje('Ups, no es él. ¡Buscá bien!');
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', color: '#4ade80', margin: '0 0 4px 0' }}>{mensaje}</h2>
      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>Nivel {nivel}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(personas.length))}, 1fr)`, gap: '8px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '20px', border: '4px solid #334155' }}>
        {personas.map((p, index) => (
          <button key={index} onClick={() => tocarPersona(p.esJesus)} style={{ backgroundColor: '#1e293b', border: '2px solid #475569', borderRadius: '12px', padding: '10px', fontSize: personas.length > 16 ? '28px' : '40px', cursor: 'pointer', transition: 'transform 0.1s' }}>
            {p.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 3: CRUZANDO EL MAR (Colisiones Reales)
// ==========================================
function JuegoNavegarBarco({ onGanar }) {
  const [posicionBarco, setPosicionBarco] = useState(50);
  const [obstaculos, setObstaculos] = useState([]);
  const [vidas, setVidas] = useState(3);
  const [nivel, setNivel] = useState(1);
  const [distancia, setDistancia] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const velocidadCaida = 10 + (nivel * 2); // Cae más rápido
  const frameRate = 100;
  
  // Referencias para las colisiones (React state en setInterval es complicado sin refs)
  const barcoRef = useRef(posicionBarco);
  const vidasRef = useRef(vidas);

  useEffect(() => { barcoRef.current = posicionBarco; }, [posicionBarco]);
  useEffect(() => { vidasRef.current = vidas; }, [vidas]);

  const moverIzquierda = () => { if(!gameOver) { SoundFX.remada(); setPosicionBarco(p => Math.max(p - 15, 10)); } };
  const moverDerecha = () => { if(!gameOver) { SoundFX.remada(); setPosicionBarco(p => Math.min(p + 15, 90)); } };

  // Generador de obstáculos
  useEffect(() => {
    if (gameOver) return;
    const tipos = ['⚡', '☁️', '🪵', '🌪️'];
    const interval = setInterval(() => {
      setObstaculos(prev => [...prev, { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: 0, tipo: tipos[Math.floor(Math.random() * tipos.length)] }]);
    }, Math.max(1500 - (nivel * 200), 500));
    return () => clearInterval(interval);
  }, [nivel, gameOver]);

  // Motor de físicas y colisiones
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObstaculos(prev => {
        let nuevos = [];
        for (let obs of prev) {
          const newY = obs.y + velocidadCaida;
          
          // Detectar colisión (Si Y está abajo de todo y X está cerca del barco)
          if (newY > 80 && newY < 100) {
            const distanciaX = Math.abs(obs.x - barcoRef.current);
            if (distanciaX < 12) { // Zona de impacto
              SoundFX.choque();
              const vidasRestantes = vidasRef.current - 1;
              setVidas(vidasRestantes);
              if (vidasRestantes <= 0) setGameOver(true);
              continue; // Destruye el obstáculo al chocar
            }
          }
          if (newY < 110) nuevos.push({ ...obs, y: newY });
        }
        return nuevos;
      });

      setDistancia(d => {
        const nuevaDist = d + 1;
        if (nuevaDist % 100 === 0) { // Sube de nivel cada 100m
          SoundFX.levelUp();
          setNivel(n => n + 1);
          onGanar(10);
        }
        return nuevaDist;
      });

    }, frameRate);
    return () => clearInterval(interval);
  }, [velocidadCaida, gameOver, onGanar]);

  const reiniciarBarco = () => {
    setVidas(3);
    setNivel(1);
    setDistancia(0);
    setObstaculos([]);
    setGameOver(false);
    setPosicionBarco(50);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 16px' }}>
        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => <span key={i} style={{ opacity: i < vidas ? 1 : 0.3 }}>❤️</span>)}
        </div>
        <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>Nivel {nivel} | {distancia}m</div>
      </div>

      <div style={{ position: 'relative', height: '400px', backgroundColor: '#1e3a8a', borderRadius: '20px', border: '6px solid #3b82f6', overflow: 'hidden' }}>
        {/* Fondo animado simple (estelas de agua) */}
        <div style={{ position: 'absolute', top: `${(distancia * 5) % 400}px`, left: '20%', width: '2px', height: '20px', backgroundColor: '#60a5fa', opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: `${(distancia * 8) % 400}px`, right: '30%', width: '2px', height: '30px', backgroundColor: '#60a5fa', opacity: 0.5 }} />

        {obstaculos.map(o => (
          <div key={o.id} style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`, fontSize: '36px', transform: 'translateX(-50%)', zIndex: 10 }}>{o.tipo}</div>
        ))}

        {!gameOver ? (
          <div style={{ position: 'absolute', bottom: '20px', left: `${posicionBarco}%`, transform: 'translateX(-50%)', fontSize: '56px', transition: 'left 0.1s linear', zIndex: 20 }}>
            ⛵
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
            <h2 style={{ color: '#ef4444', fontSize: '32px', margin: '0 0 10px 0' }}>¡Bote Hundido! 💥</h2>
            <p style={{ color: '#fbbf24', fontSize: '18px' }}>Llegaste a {distancia} metros.</p>
            <button onClick={reiniciarBarco} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>🔄 Jugar de Nuevo</button>
          </div>
        )}
      </div>

      {!gameOver && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={moverIzquierda} style={{ flex: 1, padding: '24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #1d4ed8', touchAction: 'manipulation' }}>⬅️</button>
          <button onClick={moverDerecha} style={{ flex: 1, padding: '24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #1d4ed8', touchAction: 'manipulation' }}>➡️</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// JUEGO 4: LEO CON JESÚS (Lectoescritura interactiva)
// ==========================================
function JuegoAprenderLeer({ onGanar }) {
  const PALABRAS = [
    { texto: "DIOS", emoji: "👑" },
    { texto: "JESUS", emoji: "✨🧔🏽‍♂️✨" },
    { texto: "AMOR", emoji: "❤️" },
    { texto: "PAZ", emoji: "🕊️" },
    { texto: "PAN", emoji: "🍞" },
    { texto: "LUZ", emoji: "💡" },
    { texto: "PEZ", emoji: "🐟" },
    { texto: "ARCA", emoji: "🚢" }
  ];

  const [nivel, setNivel] = useState(0);
  const [letrasDisponibles, setLetrasDisponibles] = useState([]);
  const [letrasElegidas, setLetrasElegidas] = useState([]);
  const [mensaje, setMensaje] = useState("¡Ordená las letras!");
  const [estado, setEstado] = useState("jugando"); // jugando, correcto, error

  const iniciarNivel = (n) => {
    const palabra = PALABRAS[n].texto;
    // Mezclar letras y asignarles un ID único
    const mezcladas = palabra.split('').map((letra, index) => ({ id: index, letra })).sort(() => Math.random() - 0.5);
    
    setLetrasDisponibles(mezcladas);
    setLetrasElegidas([]);
    setEstado("jugando");
    setMensaje("¡Ordená las letras!");
    hablarPalabra(palabra);
  };

  useEffect(() => { iniciarNivel(nivel); }, [nivel]);

  const hablarPalabra = (texto) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    utterance.pitch = 1.2; // Voz un poco más aguda para niños
    window.speechSynthesis.speak(utterance);
  };

  const tocarLetra = (item) => {
    if (estado !== "jugando") return;
    SoundFX.pop();
    setLetrasElegidas([...letrasElegidas, item]);
    setLetrasDisponibles(letrasDisponibles.filter(l => l.id !== item.id));
  };

  const devolverLetra = (item) => {
    if (estado !== "jugando") return;
    SoundFX.pop();
    setLetrasDisponibles([...letrasDisponibles, item]);
    setLetrasElegidas(letrasElegidas.filter(l => l.id !== item.id));
  };

  useEffect(() => {
    const palabraActual = PALABRAS[nivel].texto;
    if (letrasElegidas.length === palabraActual.length) {
      const palabraArmada = letrasElegidas.map(l => l.letra).join('');
      
      if (palabraArmada === palabraActual) {
        setEstado("correcto");
        setMensaje("¡Excelente!");
        SoundFX.exito();
        hablarPalabra("¡Excelente! " + palabraActual);
        onGanar(10);
        
        setTimeout(() => {
          if (nivel + 1 < PALABRAS.length) {
            setNivel(n => n + 1);
          } else {
            setNivel(0); // Reinicia el ciclo si las termina todas
          }
        }, 2500);
      } else {
        setEstado("error");
        setMensaje("Casi... ¡Intentá de nuevo!");
        SoundFX.error();
        
        setTimeout(() => {
          iniciarNivel(nivel);
        }, 1500);
      }
    }
  }, [letrasElegidas, nivel, onGanar]);

  const palabraObj = PALABRAS[nivel];

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#c084fc' }}>Nivel {nivel + 1}</h2>
        <button onClick={() => hablarPalabra(palabraObj.texto)} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔊 Escuchar
        </button>
      </div>

      <div style={{ backgroundColor: '#2e1065', borderRadius: '24px', padding: '24px', border: '4px solid #8b5cf6', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        {/* IMAGEN / EMOJI */}
        <div style={{ fontSize: '80px', marginBottom: '16px', animation: estado === 'correcto' ? 'bounce 1s' : 'none' }}>
          {palabraObj.emoji}
        </div>
        
        <p style={{ color: estado === 'correcto' ? '#4ade80' : estado === 'error' ? '#ef4444' : '#e9d5ff', fontWeight: 'bold', fontSize: '20px', height: '30px' }}>
          {mensaje}
        </p>

        {/* ZONA DE ARMADO (Slots) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', minHeight: '80px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {Array.from({ length: palabraObj.texto.length }).map((_, i) => {
            const letraColocada = letrasElegidas[i];
            return (
              <div key={i} onClick={() => letraColocada && devolverLetra(letraColocada)} style={{ width: '60px', height: '70px', backgroundColor: letraColocada ? '#c084fc' : '#1e1b4b', border: `3px dashed ${letraColocada ? '#e9d5ff' : '#4c1d95'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'black', color: 'white', cursor: letraColocada ? 'pointer' : 'default', boxShadow: letraColocada ? '0 4px 0 #7e22ce' : 'none', transform: letraColocada ? 'scale(1.05)' : 'scale(1)' }}>
                {letraColocada ? letraColocada.letra : ''}
              </div>
            );
          })}
        </div>

        {/* LETRAS DISPONIBLES (Desordenadas) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', minHeight: '80px' }}>
          {letrasDisponibles.map((item) => (
            <button key={item.id} onClick={() => tocarLetra(item)} style={{ width: '60px', height: '70px', backgroundColor: '#fcd34d', border: 'none', borderRadius: '12px', fontSize: '32px', fontWeight: 'black', color: '#713f12', cursor: 'pointer', boxShadow: '0 6px 0 #b45309', transition: 'transform 0.1s' }}>
              {item.letra}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default JuegosModule;