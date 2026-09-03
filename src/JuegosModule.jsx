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
      const notas = [261.63, 329.63, 392.00, 523.25];
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
export default function JuegosModule({ currentUser, db }) {
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
      {juegoActivo === 'LABERINTO' && <JuegoLaberinto onGanar={ganarEstrellas} />}
      {juegoActivo === 'MEMORIA' && <JuegoMemoriaArca onGanar={ganarEstrellas} />}
      {juegoActivo === 'REBANO' && <JuegoRebano onGanar={ganarEstrellas} />}
      {juegoActivo === 'ARPA' && <JuegoArpa onGanar={ganarEstrellas} />}
      {juegoActivo === 'COSECHA' && <JuegoCosecha onGanar={ganarEstrellas} />}
      {juegoActivo === 'PINCELADAS' && <JuegoPinceladas onGanar={ganarEstrellas} />}
      {juegoActivo === 'ARMADURA' && <JuegoArmadura onGanar={ganarEstrellas} />}
      {juegoActivo === 'TEMPLO' && <JuegoTemplo onGanar={ganarEstrellas} />}
    </div>
  );
}

// ==========================================
// MENÚ PRINCIPAL
// ==========================================
function MenuJuegos({ onSeleccionar, estrellas }) {
  const desbloqueoEspecial = estrellas >= 50;

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '#facc15', textShadow: '3px 3px #b45309', margin: '0 0 8px 0' }}>🎨 CYM KIDS 🎨</h1>
      <p style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '24px' }}>¡Ganá estrellas jugando para desbloquear la Corona!</p>
      
      {desbloqueoEspecial && (
        <div style={{ backgroundColor: '#fef08a', border: '4px dashed #eab308', padding: '16px', borderRadius: '20px', marginBottom: '24px', color: '#713f12', animation: 'pulse 2s infinite' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'black' }}>👑 ¡DESBLOQUEASTE LA CORONA DE ORO! 👑</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>¡Sos un Súper Campeón de CyM!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', paddingBottom: '40px' }}>
        <button onClick={() => onSeleccionar('PECES')} style={{ backgroundColor: '#0284c7', border: '4px solid #38bdf8', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #0369a1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🎣</span>
          <span style={{ fontSize: '14px' }}>Atrapá el Pez</span>
        </button>
        <button onClick={() => onSeleccionar('JESUS')} style={{ backgroundColor: '#16a34a', border: '4px solid #4ade80', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #15803d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🔍</span>
          <span style={{ fontSize: '14px' }}>Buscar a Jesús</span>
        </button>
        <button onClick={() => onSeleccionar('BARCO')} style={{ backgroundColor: '#d97706', border: '4px solid #fbbf24', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #b45309', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🌊</span>
          <span style={{ fontSize: '14px' }}>Cruzando el Mar</span>
        </button>
        <button onClick={() => onSeleccionar('LEER')} style={{ backgroundColor: '#8b5cf6', border: '4px solid #c084fc', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #6d28d9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🔤</span>
          <span style={{ fontSize: '14px' }}>Leo con Jesús</span>
        </button>
        <button onClick={() => onSeleccionar('LABERINTO')} style={{ backgroundColor: '#10b981', border: '4px solid #34d399', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #059669', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🐑</span>
          <span style={{ fontSize: '14px' }}>Camino a Jesús</span>
        </button>
        <button onClick={() => onSeleccionar('MEMORIA')} style={{ backgroundColor: '#ec4899', border: '4px solid #f472b6', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #be185d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🦓</span>
          <span style={{ fontSize: '14px' }}>Parejas del Arca</span>
        </button>
        <button onClick={() => onSeleccionar('REBANO')} style={{ backgroundColor: '#f97316', border: '4px solid #fdba74', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #c2410c', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🐺</span>
          <span style={{ fontSize: '14px' }}>Rebaño Seguro</span>
        </button>
        <button onClick={() => onSeleccionar('ARPA')} style={{ backgroundColor: '#8b5cf6', border: '4px solid #c084fc', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #6d28d9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🪕</span>
          <span style={{ fontSize: '14px' }}>Arpa de David</span>
        </button>
        <button onClick={() => onSeleccionar('COSECHA')} style={{ backgroundColor: '#eab308', border: '4px solid #fde047', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #a16207', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🍎</span>
          <span style={{ fontSize: '14px' }}>La Cosecha</span>
        </button>
        <button onClick={() => onSeleccionar('PINCELADAS')} style={{ backgroundColor: '#06b6d4', border: '4px solid #67e8f9', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #0e7490', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🎨</span>
          <span style={{ fontSize: '14px' }}>Pinceladas</span>
        </button>
        <button onClick={() => onSeleccionar('ARMADURA')} style={{ backgroundColor: '#94a3b8', border: '4px solid #cbd5e1', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🛡️</span>
          <span style={{ fontSize: '14px' }}>Atrapá Armadura</span>
        </button>
        <button onClick={() => onSeleccionar('TEMPLO')} style={{ backgroundColor: '#a855f7', border: '4px solid #d8b4fe', borderRadius: '20px', padding: '16px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #7e22ce', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '48px' }}>🧹</span>
          <span style={{ fontSize: '14px' }}>Limpiá el Templo</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 1: ATRAPÁ EL PEZ
// ==========================================
function JuegoPeces({ onGanar }) {
  const [pecera, setPecera] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [pezVisible, setPezVisible] = useState(false);
  const [posicionPez, setPosicionPez] = useState({ x: 50, y: 50 });
  
  const meta = nivel * 5;
  const velocidad = Math.max(2000 - (nivel * 200), 800); 

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
// JUEGO 2: ¿DÓNDE ESTÁ JESÚS?
// ==========================================
function JuegoDondeEstaJesus({ onGanar }) {
  const [nivel, setNivel] = useState(1);
  const [personas, setPersonas] = useState([]);
  const [mensaje, setMensaje] = useState('¡Encontrá a Jesús!');

  const generarMultitud = (nvl) => {
    const cantidad = Math.min(6 + (nvl * 2), 25);
    const emojis = ['👤', '👩', '👨', '👵', '🧕', '👳‍♂️', '🧔', '🧔‍♂️', '🧔🏻‍♂️'];
    
    const nuevaMultitud = Array.from({ length: cantidad }).map(() => ({
      esJesus: false,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    
    const posicionJesus = Math.floor(Math.random() * cantidad);
    nuevaMultitud[posicionJesus] = { esJesus: true, emoji: nvl > 5 ? '🧔🏽‍♂️' : '✨🧔🏽‍♂️✨' };
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
// JUEGO 3: CRUZANDO EL MAR
// ==========================================
function JuegoNavegarBarco({ onGanar }) {
  const [posicionBarco, setPosicionBarco] = useState(50);
  const [obstaculos, setObstaculos] = useState([]);
  const [vidas, setVidas] = useState(3);
  const [nivel, setNivel] = useState(1);
  const [distancia, setDistancia] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const velocidadCaida = 8 + (nivel * 1.5);
  const frameRate = 100;
  
  const barcoRef = useRef(posicionBarco);
  const vidasRef = useRef(vidas);

  useEffect(() => { barcoRef.current = posicionBarco; }, [posicionBarco]);
  useEffect(() => { vidasRef.current = vidas; }, [vidas]);

  const moverIzquierda = () => { if(!gameOver) { SoundFX.remada(); setPosicionBarco(p => Math.max(p - 15, 10)); } };
  const moverDerecha = () => { if(!gameOver) { SoundFX.remada(); setPosicionBarco(p => Math.min(p + 15, 90)); } };

  useEffect(() => {
    if (gameOver) return;
    const tipos = ['⚡', '☁️', '🪵', '🌪️'];
    const interval = setInterval(() => {
      setObstaculos(prev => [...prev, { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: 0, tipo: tipos[Math.floor(Math.random() * tipos.length)] }]);
    }, Math.max(1800 - (nivel * 150), 800));
    return () => clearInterval(interval);
  }, [nivel, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObstaculos(prev => {
        let nuevos = [];
        for (let obs of prev) {
          const newY = obs.y + velocidadCaida;
          if (newY > 80 && newY < 100) {
            const distanciaX = Math.abs(obs.x - barcoRef.current);
            if (distanciaX < 12) {
              SoundFX.choque();
              const vidasRestantes = vidasRef.current - 1;
              setVidas(vidasRestantes);
              if (vidasRestantes <= 0) setGameOver(true);
              continue;
            }
          }
          if (newY < 110) nuevos.push({ ...obs, y: newY });
        }
        return nuevos;
      });

      setDistancia(d => {
        const nuevaDist = d + 1;
        if (nuevaDist % 100 === 0) {
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
// JUEGO 4: LEO CON JESÚS
// ==========================================
function JuegoAprenderLeer({ onGanar }) {
  const [listaMezclada, setListaMezclada] = useState([]);
  const [nivel, setNivel] = useState(0);
  const [letrasDisponibles, setLetrasDisponibles] = useState([]);
  const [letrasElegidas, setLetrasElegidas] = useState([]);
  const [mensaje, setMensaje] = useState("¡Ordená las letras!");
  const [estado, setEstado] = useState("jugando");

  const PALABRAS_BASE = [
    { texto: "DIOS", emoji: "👑" }, { texto: "JESUS", emoji: "✨" }, { texto: "AMOR", emoji: "❤️" },
    { texto: "PAZ", emoji: "🕊️" }, { texto: "PAN", emoji: "🍞" }, { texto: "LUZ", emoji: "💡" },
    { texto: "PEZ", emoji: "🐟" }, { texto: "ARCA", emoji: "🚢" }, { texto: "NOE", emoji: "👴🏽" },
    { texto: "MARIA", emoji: "🧕🏽" }, { texto: "LEON", emoji: "🦁" }, { texto: "OVEJA", emoji: "🐑" },
    { texto: "CRUZ", emoji: "✝️" }, { texto: "REY", emoji: "🤴🏽" }, { texto: "AGUA", emoji: "💧" },
    { texto: "CIELO", emoji: "☁️" }, { texto: "VIDA", emoji: "🌱" }, { texto: "FE", emoji: "🙏🏽" },
    { texto: "VINO", emoji: "🍷" }, { texto: "FUEGO", emoji: "🔥" }, { texto: "MUNDO", emoji: "🌍" },
    { texto: "ANGEL", emoji: "👼🏽" }, { texto: "ROCA", emoji: "🪨" }, { texto: "MAR", emoji: "🌊" },
    { texto: "SOL", emoji: "☀️" }, { texto: "LUNA", emoji: "🌙" }, { texto: "ESTRELLA", emoji: "⭐" },
    { texto: "NUBE", emoji: "⛅" }, { texto: "DIA", emoji: "🌅" }, { texto: "NOCHE", emoji: "🌃" },
    { texto: "ARBOL", emoji: "🌳" }, { texto: "FLOR", emoji: "🌺" }, { texto: "FRUTO", emoji: "🍎" },
    { texto: "SEMILLA", emoji: "🌰" }, { texto: "TRIGO", emoji: "🌾" }, { texto: "MIEL", emoji: "🍯" },
    { texto: "LECHE", emoji: "🥛" }, { texto: "ORO", emoji: "🪙" }, { texto: "CORONA", emoji: "👑" },
    { texto: "MANTO", emoji: "🧥" }, { texto: "BARCA", emoji: "⛵" }, { texto: "RED", emoji: "🥅" },
    { texto: "RAMA", emoji: "🌿" }, { texto: "OLIVO", emoji: "🌿" }, { texto: "PALOMA", emoji: "🕊️" },
    { texto: "CUERVO", emoji: "🐦‍⬛" }, { texto: "OSO", emoji: "🐻" }, { texto: "LOBO", emoji: "🐺" },
    { texto: "ZORRO", emoji: "🦊" }, { texto: "CAMELLO", emoji: "🐫" }, { texto: "BURRO", emoji: "🫏" },
    { texto: "CABALLO", emoji: "🐎" }, { texto: "VACA", emoji: "🐄" }, { texto: "TORO", emoji: "🐂" },
    { texto: "CERDO", emoji: "🐖" }, { texto: "RANA", emoji: "🐸" }, { texto: "AVE", emoji: "🦅" },
    { texto: "GALLO", emoji: "🐓" }, { texto: "PATO", emoji: "🦆" }, { texto: "NIÑO", emoji: "👦" },
    { texto: "NIÑA", emoji: "👧" }, { texto: "PADRE", emoji: "👨" }, { texto: "MADRE", emoji: "👩" },
    { texto: "BEBE", emoji: "👶" }, { texto: "HERMANO", emoji: "👦" }, { texto: "FAMILIA", emoji: "👨‍👩‍👧‍👦" },
    { texto: "BESO", emoji: "💋" }, { texto: "ABRAZO", emoji: "🫂" }, { texto: "CANTO", emoji: "🎵" },
    { texto: "CORO", emoji: "🎤" }, { texto: "ARPA", emoji: "🪕" }, { texto: "FLAUTA", emoji: "🪈" },
    { texto: "FIESTA", emoji: "🥳" }, { texto: "RISA", emoji: "😂" }, { texto: "GOZO", emoji: "😁" },
    { texto: "GRACIA", emoji: "🎁" }, { texto: "DON", emoji: "🎀" }, { texto: "PERDON", emoji: "🤝" },
    { texto: "AMIGO", emoji: "🧑‍🤝‍🧑" }, { texto: "REINO", emoji: "🏰" }, { texto: "SANTO", emoji: "😇" },
    { texto: "VERDAD", emoji: "🧭" }, { texto: "CAMINO", emoji: "🛤️" }, { texto: "TEMPLO", emoji: "🕍" },
    { texto: "REZO", emoji: "🛐" }, { texto: "MANA", emoji: "🥖" }, { texto: "MILAGRO", emoji: "✨" },
    { texto: "PASTOR", emoji: "🦯" }, { texto: "SAL", emoji: "🧂" }, { texto: "LIRIO", emoji: "🌸" },
    { texto: "RIO", emoji: "🏞️" }, { texto: "PEDRO", emoji: "🎣" }, { texto: "PABLO", emoji: "📜" },
    { texto: "MOISES", emoji: "🌊" }, { texto: "GOLIAT", emoji: "🛡️" }, { texto: "DAVID", emoji: "🪨" },
    { texto: "JOSE", emoji: "🪚" }, { texto: "BIBLIA", emoji: "📖" }, { texto: "PROFETAS", emoji: "🗣️" },
    { texto: "SALMOS", emoji: "🎼" }
  ];

  useEffect(() => {
    const mezcladas = [...PALABRAS_BASE].sort(() => Math.random() - 0.5);
    setListaMezclada(mezcladas);
  }, []);

  const hablarLetra = (letra) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(letra);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.3;
    window.speechSynthesis.speak(utterance);
  };

  const hablarPalabra = (texto) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const iniciarNivel = (n) => {
    if (listaMezclada.length === 0) return;
    const palabra = listaMezclada[n].texto;
    const mezcladas = palabra.split('').map((letra, index) => ({ id: index, letra })).sort(() => Math.random() - 0.5);
    setLetrasDisponibles(mezcladas);
    setLetrasElegidas([]);
    setEstado("jugando");
    setMensaje("¡Ordená las letras!");
    hablarPalabra(palabra);
  };

  useEffect(() => { 
    if (listaMezclada.length > 0) iniciarNivel(nivel); 
  }, [nivel, listaMezclada]);

  const tocarLetra = (item) => {
    if (estado !== "jugando") return;
    SoundFX.pop();
    hablarLetra(item.letra);
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
    if (estado !== "jugando" || listaMezclada.length === 0) return;

    const palabraActual = listaMezclada[nivel].texto;
    if (letrasElegidas.length === palabraActual.length) {
      const palabraArmada = letrasElegidas.map(l => l.letra).join('');
      
      if (palabraArmada === palabraActual) {
        setEstado("correcto");
        setMensaje("¡Excelente!");
        SoundFX.exito();
        hablarPalabra("¡Excelente! " + palabraActual);
        onGanar(10);
        
        setTimeout(() => {
          if (nivel + 1 < listaMezclada.length) {
            setNivel(n => n + 1);
          } else {
            setListaMezclada([...PALABRAS_BASE].sort(() => Math.random() - 0.5));
            setNivel(0);
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
  }, [letrasElegidas, nivel, onGanar, estado, listaMezclada]);

  if (listaMezclada.length === 0) return null;

  const palabraObj = listaMezclada[nivel];

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#c084fc' }}>Nivel {nivel + 1}</h2>
        <button onClick={() => hablarPalabra(palabraObj.texto)} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔊 Escuchar
        </button>
      </div>

      <div style={{ backgroundColor: '#2e1065', borderRadius: '24px', padding: '24px', border: '4px solid #8b5cf6', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px', animation: estado === 'correcto' ? 'bounce 1s' : 'none' }}>
          {palabraObj.emoji}
        </div>
        
        <p style={{ color: estado === 'correcto' ? '#4ade80' : estado === 'error' ? '#ef4444' : '#e9d5ff', fontWeight: 'bold', fontSize: '20px', height: '30px' }}>
          {mensaje}
        </p>

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

// ==========================================
// JUEGO 5: EL CAMINO A JESÚS
// ==========================================
function JuegoLaberinto({ onGanar }) {
  const LABERINTOS = [
    [
      [2, 0, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 0, 3]
    ],
    [
      [2, 0, 1, 0, 0, 3],
      [1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [1, 0, 1, 1, 1, 1]
    ],
    [
      [1, 1, 1, 1, 1, 1, 3],
      [2, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  ];

  const [nivel, setNivel] = useState(0);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [mensaje, setMensaje] = useState("Guiá a la ovejita hasta Jesús");
  const [estado, setEstado] = useState("jugando");

  const iniciarNivel = (n) => {
    const lab = LABERINTOS[n];
    let startX = 0, startY = 0;
    lab.forEach((fila, y) => {
      fila.forEach((celda, x) => {
        if (celda === 2) { startX = x; startY = y; }
      });
    });
    setPosicion({ x: startX, y: startY });
    setEstado("jugando");
    setMensaje(`Nivel ${n + 1}: Guiá a la ovejita`);
  };

  useEffect(() => { iniciarNivel(nivel); }, [nivel]);

  const mover = (dx, dy) => {
    if (estado !== "jugando") return;
    const nx = posicion.x + dx;
    const ny = posicion.y + dy;
    const lab = LABERINTOS[nivel];

    if (ny >= 0 && ny < lab.length && nx >= 0 && nx < lab[0].length) {
      if (lab[ny][nx] !== 1) { 
        SoundFX.pop();
        setPosicion({ x: nx, y: ny });
        
        if (lab[ny][nx] === 3) {
          setEstado("ganado");
          setMensaje("¡Encontraste a Jesús!");
          SoundFX.exito();
          onGanar(10);
          
          setTimeout(() => {
            if (nivel + 1 < LABERINTOS.length) {
              setNivel(n => n + 1);
            } else {
              setNivel(0);
            }
          }, 2500);
        }
      } else {
        SoundFX.error(); 
      }
    }
  };

  const laberintoActual = LABERINTOS[nivel];
  const columnas = laberintoActual[0].length;

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', color: '#34d399', margin: '0 0 8px 0' }}>{mensaje}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)`, gap: '4px', backgroundColor: '#064e3b', padding: '12px', borderRadius: '16px', border: '4px solid #10b981', margin: '0 auto', maxWidth: '350px' }}>
        {laberintoActual.map((fila, y) => (
          fila.map((celda, x) => {
            const esJugador = posicion.x === x && posicion.y === y;
            let contenido = '';
            let bg = '#ecfccb';
            
            if (celda === 1) { bg = '#047857'; contenido = '🌳'; } 
            if (celda === 3 && !esJugador) { contenido = '✨🧔🏽‍♂️✨'; } 
            if (esJugador) { contenido = '🐑'; } 
            
            return (
              <div key={`${x}-${y}`} style={{ aspectRatio: '1/1', backgroundColor: bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: celda === 1 ? 'inset 0 0 10px rgba(0,0,0,0.3)' : 'none' }}>
                {contenido}
              </div>
            );
          })
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
        <div />
        <button onClick={() => mover(0, -1)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', height: '70px', cursor: 'pointer', boxShadow: '0 6px 0 #059669', touchAction: 'manipulation' }}>⬆️</button>
        <div />
        
        <button onClick={() => mover(-1, 0)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', height: '70px', cursor: 'pointer', boxShadow: '0 6px 0 #059669', touchAction: 'manipulation' }}>⬅️</button>
        <button onClick={() => mover(0, 1)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', height: '70px', cursor: 'pointer', boxShadow: '0 6px 0 #059669', touchAction: 'manipulation' }}>⬇️</button>
        <button onClick={() => mover(1, 0)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', height: '70px', cursor: 'pointer', boxShadow: '0 6px 0 #059669', touchAction: 'manipulation' }}>➡️</button>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 6: MEMOTEST DEL ARCA DE NOÉ
// ==========================================
function JuegoMemoriaArca({ onGanar }) {
  const ANIMALES_DISPONIBLES = ['🦁', '🐘', '🦒', '🐒', '🦓', '🐄', '🐖', '🐑', '🐪', '🦏', '🐇', '🦘'];
  
  const [nivel, setNivel] = useState(1);
  const [cartas, setCartas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);
  const [paresEncontrados, setParesEncontrados] = useState(0);

  const iniciarNivel = (nivelActual) => {
    const cantidadPares = Math.min(2 + nivelActual, 10);
    const animalesElegidos = [...ANIMALES_DISPONIBLES].sort(() => Math.random() - 0.5).slice(0, cantidadPares);
    
    const mazo = [...animalesElegidos, ...animalesElegidos]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, volteada: false, emparejada: false }));
    
    setCartas(mazo);
    setSeleccionadas([]);
    setParesEncontrados(0);
    setBloqueado(false);
  };

  useEffect(() => { iniciarNivel(nivel); }, [nivel]);

  const tocarCarta = (index) => {
    if (bloqueado || cartas[index].volteada || cartas[index].emparejada) return;
    SoundFX.pop();

    const nuevasCartas = [...cartas];
    nuevasCartas[index].volteada = true;
    setCartas(nuevasCartas);

    const nuevasSeleccionadas = [...seleccionadas, index];
    setSeleccionadas(nuevasSeleccionadas);

    if (nuevasSeleccionadas.length === 2) {
      setBloqueado(true);
      const [idx1, idx2] = nuevasSeleccionadas;

      if (nuevasCartas[idx1].emoji === nuevasCartas[idx2].emoji) {
        SoundFX.exito();
        nuevasCartas[idx1].emparejada = true;
        nuevasCartas[idx2].emparejada = true;
        setCartas(nuevasCartas);
        setSeleccionadas([]);
        setBloqueado(false);

        const nuevosPares = paresEncontrados + 1;
        setParesEncontrados(nuevosPares);

        if (nuevosPares === nuevasCartas.length / 2) {
          SoundFX.levelUp();
          onGanar(10);
          setTimeout(() => setNivel(n => n + 1), 2000);
        }
      } else {
        SoundFX.error();
        setTimeout(() => {
          nuevasCartas[idx1].volteada = false;
          nuevasCartas[idx2].volteada = false;
          setCartas(nuevasCartas);
          setSeleccionadas([]);
          setBloqueado(false);
        }, 1000);
      }
    }
  };

  const columnas = cartas.length > 12 ? 4 : cartas.length > 8 ? 4 : 3;

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#f472b6' }}>Nivel {nivel}</h2>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>Pares: {paresEncontrados} / {cartas.length / 2}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)`, gap: '12px', backgroundColor: '#831843', padding: '16px', borderRadius: '20px', border: '4px solid #be185d' }}>
        {cartas.map((carta, index) => (
          <button 
            key={carta.id} 
            onClick={() => tocarCarta(index)} 
            style={{ 
              aspectRatio: '1/1', 
              backgroundColor: carta.volteada || carta.emparejada ? '#fbcfe8' : '#ec4899', 
              border: `4px solid ${carta.volteada || carta.emparejada ? '#f472b6' : '#be185d'}`, 
              borderRadius: '16px', 
              fontSize: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: carta.volteada || carta.emparejada ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              opacity: carta.emparejada ? 0.6 : 1
            }}
          >
            {carta.volteada || carta.emparejada ? carta.emoji : '🚪'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 7: REBAÑO SEGURO (Whack-a-Mole)
// ==========================================
function JuegoRebano({ onGanar }) {
  const [puntaje, setPuntaje] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [vidas, setVidas] = useState(3);
  const [agujeros, setAgujeros] = useState(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);

  const meta = nivel * 8; 
  const velocidadVisible = Math.max(1500 - (nivel * 100), 800); 

  useEffect(() => {
    if (gameOver) return;
    
    let timeoutVisible;
    let timeoutOculto;

    const cicloJuego = () => {
      const nuevosAgujeros = Array(9).fill(null);
      const randomIndex = Math.floor(Math.random() * 9);
      const esLobo = Math.random() > 0.8; 
      nuevosAgujeros[randomIndex] = esLobo ? '🐺' : '🐑';
      setAgujeros(nuevosAgujeros);

      timeoutVisible = setTimeout(() => {
        setAgujeros(Array(9).fill(null));
        timeoutOculto = setTimeout(() => {
          cicloJuego();
        }, Math.random() * 600 + 400); 
      }, velocidadVisible);
    };

    timeoutOculto = setTimeout(cicloJuego, 1000);

    return () => {
      clearTimeout(timeoutVisible);
      clearTimeout(timeoutOculto);
    };
  }, [velocidadVisible, gameOver]);

  const tocarAgujero = (index) => {
    if (gameOver || agujeros[index] === null || agujeros[index] === '💨') return;
    
    const animal = agujeros[index];
    const nuevosAgujeros = [...agujeros];
    nuevosAgujeros[index] = '💨'; 
    setAgujeros(nuevosAgujeros);

    if (animal === '🐑') {
      SoundFX.pop();
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      if (nuevoPuntaje >= meta) {
        SoundFX.levelUp();
        setNivel(n => n + 1);
        onGanar(5);
        setPuntaje(0);
      }
    } else if (animal === '🐺') {
      SoundFX.choque();
      setVidas(v => {
        if (v - 1 <= 0) setGameOver(true);
        return v - 1;
      });
    }
  };

  const reiniciar = () => {
    setVidas(3);
    setNivel(1);
    setPuntaje(0);
    setAgujeros(Array(9).fill(null));
    setGameOver(false);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '0 16px' }}>
        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => <span key={i} style={{ opacity: i < vidas ? 1 : 0.3 }}>❤️</span>)}
        </div>
        <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
          Nivel {nivel} | Faltan {meta - puntaje} 🐑
        </div>
      </div>

      <div style={{ backgroundColor: '#14532d', padding: '20px', borderRadius: '24px', border: '6px solid #22c55e', position: 'relative' }}>
        {gameOver ? (
          <div style={{ padding: '60px 0' }}>
            <h2 style={{ color: '#ef4444', fontSize: '36px', margin: '0 0 16px 0' }}>¡El lobo atacó! 🐺</h2>
            <button onClick={reiniciar} style={{ padding: '16px 32px', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '16px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 6px 0 #166534' }}>🔄 Jugar de Nuevo</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {agujeros.map((animal, i) => (
              <button 
                key={i} 
                onClick={() => tocarAgujero(i)}
                style={{ 
                  aspectRatio: '1/1', 
                  backgroundColor: '#166534', 
                  border: 'none', 
                  borderRadius: '50%', 
                  boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)',
                  fontSize: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: animal ? 'pointer' : 'default',
                  transform: animal && animal !== '💨' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {animal}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 8: EL ARPA DE DAVID (Musical)
// ==========================================
function JuegoArpa({ onGanar }) {
  const CUERDAS = [
    { color: '#ef4444', freq: 261.63, tecla: 'Do' },
    { color: '#f97316', freq: 293.66, tecla: 'Re' },
    { color: '#eab308', freq: 329.63, tecla: 'Mi' },
    { color: '#22c55e', freq: 349.23, tecla: 'Fa' },
    { color: '#3b82f6', freq: 392.00, tecla: 'Sol' },
    { color: '#a855f7', freq: 440.00, tecla: 'La' },
    { color: '#ec4899', freq: 493.88, tecla: 'Si' },
  ];

  const [secuencia, setSecuencia] = useState([]);
  const [pasoJugador, setPasoJugador] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [mensaje, setMensaje] = useState("¡Tocá libre o seguí la luz!");
  const [esperandoJugador, setEsperandoJugador] = useState(false);
  const [cuerdaActiva, setCuerdaActiva] = useState(null);

  const tocarCuerda = (index, esAutomatico = false) => {
    setCuerdaActiva(index);
    SoundFX.playTone(CUERDAS[index].freq, 'sine', 0.4, 0.2);
    setTimeout(() => setCuerdaActiva(null), 300);

    if (!esAutomatico && esperandoJugador) {
      if (index === secuencia[pasoJugador]) {
        if (pasoJugador + 1 === secuencia.length) {
          setEsperandoJugador(false);
          setMensaje("¡Muy bien!");
          SoundFX.exito();
          onGanar(5);
          setTimeout(() => {
            setNivel(n => n + 1);
            iniciarSecuencia(nivel + 1);
          }, 1500);
        } else {
          setPasoJugador(p => p + 1);
        }
      } else {
        setEsperandoJugador(false);
        setMensaje("¡Ups! Intentá de nuevo");
        SoundFX.error();
        setTimeout(() => iniciarSecuencia(nivel), 1500);
      }
    }
  };

  const iniciarSecuencia = (nvl) => {
    setMensaje(`Nivel ${nvl}: Observá...`);
    const nuevaSecuencia = [];
    const longitud = Math.min(3 + Math.floor(nvl / 2), 8); 
    
    for (let i = 0; i < longitud; i++) {
      nuevaSecuencia.push(Math.floor(Math.random() * CUERDAS.length));
    }
    
    setSecuencia(nuevaSecuencia);
    setPasoJugador(0);
    setEsperandoJugador(false);

    nuevaSecuencia.forEach((cuerdaIdx, i) => {
      setTimeout(() => {
        tocarCuerda(cuerdaIdx, true);
        if (i === nuevaSecuencia.length - 1) {
          setTimeout(() => {
            setMensaje("¡Tu turno!");
            setEsperandoJugador(true);
          }, 500);
        }
      }, (i + 1) * 800);
    });
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#a855f7' }}>Nivel {nivel}</h2>
        <button onClick={() => iniciarSecuencia(nivel)} style={{ backgroundColor: '#a855f7', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ▶️ Jugar Secuencia
        </button>
      </div>

      <div style={{ backgroundColor: '#4c1d95', borderRadius: '24px', padding: '30px 20px', border: '4px solid #7e22ce', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', position: 'relative' }}>
        <p style={{ color: '#e9d5ff', fontWeight: 'bold', fontSize: '20px', marginBottom: '24px', minHeight: '30px' }}>
          {mensaje}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: '250px', borderTop: '10px solid #d97706', borderBottom: '10px solid #d97706', padding: '20px 0', borderRadius: '20px' }}>
          {CUERDAS.map((c, i) => (
            <div 
              key={i} 
              onClick={() => tocarCuerda(i)}
              style={{
                width: '30px',
                height: '100%',
                backgroundColor: cuerdaActiva === i ? 'white' : c.color,
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: cuerdaActiva === i ? `0 0 20px ${c.color}, inset 0 0 10px white` : `inset 0 0 10px rgba(0,0,0,0.3)`,
                transition: 'background-color 0.1s, box-shadow 0.1s',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '10px'
              }}
            >
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', opacity: 0.7 }}>{c.tecla}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 9: LA COSECHA
// ==========================================
function JuegoCosecha({ onGanar }) {
  const [nivel, setNivel] = useState(1);
  const [puntaje, setPuntaje] = useState(0);
  const [frutas, setFrutas] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const CANASTAS = [
    { color: '#ef4444', emoji: '🍎', tipo: 'manzana' },
    { color: '#22c55e', emoji: '🍐', tipo: 'pera' },
    { color: '#a855f7', emoji: '🍇', tipo: 'uva' }
  ];

  const meta = nivel * 10;
  const velocidadCaida = 1.5 + (nivel * 0.2); // Más lento

  useEffect(() => {
    if (gameOver) return;
    
    const intervalGenerador = setInterval(() => {
      const tipoRandom = CANASTAS[Math.floor(Math.random() * CANASTAS.length)];
      setFrutas(prev => [...prev, { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: 0, ...tipoRandom }]);
    }, Math.max(3500 - (nivel * 200), 1500));

    const intervalCaida = setInterval(() => {
      setFrutas(prev => {
        let nuevas = [];
        let huboFalla = false;
        for (let f of prev) {
          const newY = f.y + velocidadCaida;
          if (newY > 90) {
            huboFalla = true;
          } else {
            nuevas.push({ ...f, y: newY });
          }
        }
        if (huboFalla) {
          SoundFX.error();
          setGameOver(true);
        }
        return nuevas;
      });
    }, 100);

    return () => { clearInterval(intervalGenerador); clearInterval(intervalCaida); };
  }, [nivel, gameOver, velocidadCaida]);

  const tocarCanasta = (tipoCanasta) => {
    if (gameOver) return;
    
    setFrutas(prev => {
      const index = prev.findIndex(f => f.tipo === tipoCanasta && f.y > 50); 
      if (index !== -1) {
        SoundFX.pop();
        const nuevas = [...prev];
        nuevas.splice(index, 1);
        
        setPuntaje(p => {
          const nuevoP = p + 1;
          if (nuevoP >= meta) {
            SoundFX.levelUp();
            setNivel(n => n + 1);
            onGanar(5);
            return 0; 
          }
          return nuevoP;
        });
        return nuevas;
      } else {
        SoundFX.choque();
        return prev;
      }
    });
  };

  const reiniciar = () => {
    setNivel(1);
    setPuntaje(0);
    setFrutas([]);
    setGameOver(false);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#eab308' }}>Nivel {nivel}</h2>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>Cosecha: {puntaje} / {meta}</span>
      </div>

      <div style={{ position: 'relative', height: '400px', backgroundColor: '#ecfccb', borderRadius: '20px', border: '6px solid #84cc16', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: '20px', left: '10%', fontSize: '40px', opacity: 0.5 }}>☁️</div>
        <div style={{ position: 'absolute', top: '40px', right: '20%', fontSize: '50px', opacity: 0.5 }}>☁️</div>

        {frutas.map(f => (
          <div key={f.id} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, fontSize: '40px', transform: 'translateX(-50%)', zIndex: 10 }}>{f.emoji}</div>
        ))}

        {gameOver && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
            <h2 style={{ color: '#ef4444', fontSize: '32px', margin: '0 0 10px 0' }}>¡Se cayó una fruta! 💥</h2>
            <button onClick={reiniciar} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#84cc16', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>🔄 Intentar de Nuevo</button>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '100px', backgroundColor: '#d97706', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '10px' }}>
          {CANASTAS.map((c, i) => (
            <button 
              key={i} 
              onClick={() => tocarCanasta(c.tipo)}
              style={{ backgroundColor: c.color, border: '4px solid white', borderRadius: '15px 15px 5px 5px', width: '80px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', boxShadow: '0 -4px 10px rgba(0,0,0,0.3)', touchAction: 'manipulation' }}
            >
              🛒
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 10: PINCELADAS DE LA CREACIÓN (SVG Interactivo Real)
// ==========================================
function JuegoPinceladas({ onGanar }) {
  const [nivel, setNivel] = useState(1);
  const [colorActivo, setColorActivo] = useState('#facc15');
  const [ganado, setGanado] = useState(false);

  const COLORES = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#000000', '#8b4513'];

  const [zonas, setZonas] = useState({
    melena: '#ffffff', cara: '#ffffff', orejaIzq: '#ffffff', orejaDer: '#ffffff', nariz: '#ffffff',
    tronco: '#ffffff', hojasIzq: '#ffffff', hojasDer: '#ffffff', hojasCentro: '#ffffff', fruto1: '#ffffff', fruto2: '#ffffff', fruto3: '#ffffff',
    agua: '#ffffff', cuerpo: '#ffffff', aleta: '#ffffff', chorro: '#ffffff'
  });

  const pintar = (zona) => {
    SoundFX.pop();
    setZonas(prev => ({ ...prev, [zona]: colorActivo }));
  };

  const terminarObra = () => {
    SoundFX.exito();
    setGanado(true);
    onGanar(10);
    setTimeout(() => {
      setNivel(n => n + 1);
      setGanado(false);
    }, 3000);
  };

  const figuraId = nivel % 3;

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#06b6d4', margin: '0' }}>¡Pintá la Creación!</h2>
        <button onClick={terminarObra} style={{ backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
          ¡Terminé! ✨
        </button>
      </div>
      
      <div style={{ position: 'relative', height: '350px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '6px solid #67e8f9', overflow: 'hidden', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {ganado && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, fontSize: '40px', fontWeight: 'black', color: '#0891b2', animation: 'bounce 1s infinite' }}>
            ¡HERMOSO! 🎨
          </div>
        )}

        {/* DIBUJO 1: LEÓN */}
        {figuraId === 1 && (
          <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', cursor: 'pointer' }}>
            <circle cx="50" cy="50" r="45" fill={zonas.melena} stroke="#000" strokeWidth="2" onClick={() => pintar('melena')} />
            <circle cx="25" cy="30" r="12" fill={zonas.orejaIzq} stroke="#000" strokeWidth="2" onClick={() => pintar('orejaIzq')} />
            <circle cx="75" cy="30" r="12" fill={zonas.orejaDer} stroke="#000" strokeWidth="2" onClick={() => pintar('orejaDer')} />
            <circle cx="50" cy="55" r="25" fill={zonas.cara} stroke="#000" strokeWidth="2" onClick={() => pintar('cara')} />
            <circle cx="40" cy="45" r="4" fill="#000" />
            <circle cx="60" cy="45" r="4" fill="#000" />
            <polygon points="45,55 55,55 50,65" fill={zonas.nariz} stroke="#000" strokeWidth="1" onClick={() => pintar('nariz')} />
            <path d="M50,65 Q40,75 35,65 M50,65 Q60,75 65,65" fill="none" stroke="#000" strokeWidth="2" />
          </svg>
        )}

        {/* DIBUJO 2: ÁRBOL CON FRUTOS */}
        {figuraId === 2 && (
          <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', cursor: 'pointer' }}>
            <rect x="40" y="50" width="20" height="45" fill={zonas.tronco} stroke="#000" strokeWidth="2" onClick={() => pintar('tronco')} />
            <circle cx="50" cy="35" r="25" fill={zonas.hojasCentro} stroke="#000" strokeWidth="2" onClick={() => pintar('hojasCentro')} />
            <circle cx="30" cy="45" r="20" fill={zonas.hojasIzq} stroke="#000" strokeWidth="2" onClick={() => pintar('hojasIzq')} />
            <circle cx="70" cy="45" r="20" fill={zonas.hojasDer} stroke="#000" strokeWidth="2" onClick={() => pintar('hojasDer')} />
            <circle cx="50" cy="25" r="6" fill={zonas.fruto1} stroke="#000" strokeWidth="2" onClick={() => pintar('fruto1')} />
            <circle cx="35" cy="45" r="6" fill={zonas.fruto2} stroke="#000" strokeWidth="2" onClick={() => pintar('fruto2')} />
            <circle cx="65" cy="40" r="6" fill={zonas.fruto3} stroke="#000" strokeWidth="2" onClick={() => pintar('fruto3')} />
          </svg>
        )}

        {/* DIBUJO 0 (3): BALLENA Y MAR */}
        {figuraId === 0 && (
          <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', cursor: 'pointer' }}>
            <path d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z" fill={zonas.agua} stroke="#000" strokeWidth="2" onClick={() => pintar('agua')} />
            <path d="M10,50 Q40,20 80,40 Q95,50 90,30 Q90,60 80,60 Q50,80 10,50 Z" fill={zonas.cuerpo} stroke="#000" strokeWidth="2" onClick={() => pintar('cuerpo')} />
            <path d="M40,55 Q50,45 60,60 Z" fill={zonas.aleta} stroke="#000" strokeWidth="2" onClick={() => pintar('aleta')} />
            <path d="M60,32 Q60,10 50,15 M60,32 Q60,10 70,15" fill="none" stroke={zonas.chorro} strokeWidth="4" onClick={() => pintar('chorro')} />
            <circle cx="25" cy="45" r="3" fill="#000" />
          </svg>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {COLORES.map(c => (
          <button 
            key={c}
            onClick={() => setColorActivo(c)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: c,
              border: colorActivo === c ? '4px solid #cbd5e1' : '2px solid #e2e8f0',
              boxShadow: colorActivo === c ? '0 0 15px rgba(0,0,0,0.3)' : 'none',
              cursor: 'pointer',
              transform: colorActivo === c ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// JUEGO 11: LA ARMADURA DE DIOS (Arcade: Cae del cielo)
// ==========================================
function JuegoArmadura({ onGanar }) {
  const [posicionPersonaje, setPosicionPersonaje] = useState(50);
  const [caidas, setCaidas] = useState([]);
  const [equipadas, setEquipadas] = useState([]);
  const [vidas, setVidas] = useState(3);
  const [nivel, setNivel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const PIEZAS_FALTANTES = ['🪖', '🛡️', '🗡️', '🥋', '🥾'];
  const velocidadCaida = 2 + (nivel * 0.5); // Mucho más lento para infantiles
  const frameRate = 100;

  const personajeRef = useRef(posicionPersonaje);
  const vidasRef = useRef(vidas);
  const equipadasRef = useRef(equipadas);

  useEffect(() => { personajeRef.current = posicionPersonaje; }, [posicionPersonaje]);
  useEffect(() => { vidasRef.current = vidas; }, [vidas]);
  useEffect(() => { equipadasRef.current = equipadas; }, [equipadas]);

  const moverIzquierda = () => { if(!gameOver) setPosicionPersonaje(p => Math.max(p - 15, 10)); };
  const moverDerecha = () => { if(!gameOver) setPosicionPersonaje(p => Math.min(p + 15, 90)); };

  useEffect(() => {
    if (gameOver) return;
    const intervalGen = setInterval(() => {
      const esFuego = Math.random() < 0.3;
      const piezasNecesarias = PIEZAS_FALTANTES.filter(p => !equipadasRef.current.includes(p));
      
      if (piezasNecesarias.length === 0) return; 
      
      const objeto = esFuego ? '🔥' : piezasNecesarias[Math.floor(Math.random() * piezasNecesarias.length)];
      setCaidas(prev => [...prev, { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: 0, tipo: objeto }]);
    }, Math.max(3500 - (nivel * 200), 1500));

    return () => clearInterval(intervalGen);
  }, [nivel, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const intervalMove = setInterval(() => {
      setCaidas(prev => {
        let nuevas = [];
        for (let obj of prev) {
          const newY = obj.y + velocidadCaida;
          
          if (newY > 80 && newY < 100) {
            const distanciaX = Math.abs(obj.x - personajeRef.current);
            if (distanciaX < 15) { 
              if (obj.tipo === '🔥') {
                SoundFX.choque();
                const vidasRestantes = vidasRef.current - 1;
                setVidas(vidasRestantes);
                if (vidasRestantes <= 0) setGameOver(true);
              } else {
                if (!equipadasRef.current.includes(obj.tipo)) {
                  SoundFX.exito();
                  const nuevasEquipadas = [...equipadasRef.current, obj.tipo];
                  setEquipadas(nuevasEquipadas);
                  if (nuevasEquipadas.length === 5) {
                    SoundFX.levelUp();
                    setNivel(n => n + 1);
                    setEquipadas([]); 
                    setCaidas([]);
                    onGanar(15);
                  }
                } else {
                  SoundFX.pop(); 
                }
              }
              continue; 
            }
          }
          if (newY < 110) nuevas.push({ ...obj, y: newY });
        }
        return nuevas;
      });
    }, frameRate);

    return () => clearInterval(intervalMove);
  }, [velocidadCaida, gameOver, onGanar]);

  const reiniciar = () => {
    setVidas(3);
    setNivel(1);
    setEquipadas([]);
    setCaidas([]);
    setGameOver(false);
    setPosicionPersonaje(50);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 16px' }}>
        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => <span key={i} style={{ opacity: i < vidas ? 1 : 0.3 }}>❤️</span>)}
        </div>
        <div style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '18px' }}>Nivel {nivel}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
        {PIEZAS_FALTANTES.map(p => (
          <div key={p} style={{ width: '40px', height: '40px', backgroundColor: equipadas.includes(p) ? '#4ade80' : '#334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', transition: 'background-color 0.3s' }}>
            {p}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', height: '350px', backgroundColor: '#0f172a', borderRadius: '20px', border: '6px solid #475569', overflow: 'hidden' }}>
        
        {caidas.map(c => (
          <div key={c.id} style={{ position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, fontSize: '36px', transform: 'translateX(-50%)', zIndex: 10 }}>{c.tipo}</div>
        ))}

        {!gameOver ? (
          <div style={{ position: 'absolute', bottom: '20px', left: `${posicionPersonaje}%`, transform: 'translateX(-50%)', fontSize: '56px', transition: 'left 0.1s linear', zIndex: 20 }}>
            👤
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
            <h2 style={{ color: '#ef4444', fontSize: '32px', margin: '0 0 10px 0' }}>¡Cuidado con el fuego! 💥</h2>
            <button onClick={reiniciar} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#475569', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>🔄 Jugar de Nuevo</button>
          </div>
        )}
      </div>

      {!gameOver && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={moverIzquierda} style={{ flex: 1, padding: '24px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', touchAction: 'manipulation' }}>⬅️</button>
          <button onClick={moverDerecha} style={{ flex: 1, padding: '24px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '16px', fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', touchAction: 'manipulation' }}>➡️</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// JUEGO 12: LIMPIANDO EL TEMPLO
// ==========================================
function JuegoTemplo({ onGanar }) {
  const [nivel, setNivel] = useState(1);
  const [objetos, setObjetos] = useState([]);
  const [nivelCompletado, setNivelCompletado] = useState(false);
  
  const OBJETOS_BUENOS = ['🕊️', '🍞', '📖', '🕯️', '🌸'];
  const OBJETOS_MALOS = ['🕸️', '🗑️', '🕷️', '🪙', '💩']; 

  useEffect(() => {
    const cantidad = Math.min(6 + nivel * 2, 20);
    let nuevos = [];
    for(let i=0; i<cantidad; i++) {
      let esMalo = Math.random() > 0.4; 
      if (i === 0) esMalo = true; // Asegura que siempre haya basura

      nuevos.push({
        id: i,
        esMalo,
        emoji: esMalo ? OBJETOS_MALOS[Math.floor(Math.random() * OBJETOS_MALOS.length)] : OBJETOS_BUENOS[Math.floor(Math.random() * OBJETOS_BUENOS.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 10
      });
    }
    setObjetos(nuevos);
    setNivelCompletado(false);
  }, [nivel]);

  const tocarObjeto = (obj) => {
    if (nivelCompletado) return;

    if (obj.esMalo) {
      SoundFX.pop();
      // En lugar de marcar como limpio, lo sacamos del arreglo para que desaparezca
      const nuevos = objetos.filter(o => o.id !== obj.id);
      setObjetos(nuevos);

      // Si ya no quedan malos en el arreglo nuevo
      if (!nuevos.some(o => o.esMalo)) {
        setNivelCompletado(true);
        SoundFX.exito();
        onGanar(5);
        setTimeout(() => {
          setNivel(n => n + 1);
        }, 2000);
      }
    } else {
      SoundFX.error(); 
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#d8b4fe' }}>Nivel {nivel}</h2>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>Tocá la basura 🧹</span>
      </div>

      <div style={{ position: 'relative', height: '400px', backgroundColor: '#faf5ff', borderRadius: '20px', border: '6px solid #d8b4fe', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '40px', height: '100%', backgroundColor: '#f3e8ff' }} />
        <div style={{ position: 'absolute', top: 0, right: '20%', width: '40px', height: '100%', backgroundColor: '#f3e8ff' }} />

        {objetos.map(o => (
          <button 
            key={o.id}
            onClick={() => tocarObjeto(o)}
            style={{
              position: 'absolute',
              left: `${o.x}%`,
              top: `${o.y}%`,
              fontSize: '40px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transform: 'translate(-50%, -50%)',
              padding: 0
            }}
          >
            {o.emoji}
          </button>
        ))}

        {nivelCompletado && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, fontSize: '32px', fontWeight: 'black', color: '#a855f7', animation: 'bounce 1s infinite' }}>
            ¡TEMPLO LIMPIO! ✨
          </div>
        )}
      </div>
    </div>
  );
}