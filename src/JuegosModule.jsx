import React, { useState, useEffect } from 'react';

class SoundFX {
  static ctx = null;

  static getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  static agua() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  static exito() {
    try {
      const ctx = this.getContext();
      const notas = [523.25, 659.25, 783.99, 1046.50];
      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  static remada() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  static pop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }
}

export default function JuegosModule() {
  const [juegoActivo, setJuegoActivo] = useState('MENU');

  const cambiarJuego = (juego) => {
    SoundFX.pop();
    setJuegoActivo(juego);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '16px', fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {juegoActivo !== 'MENU' && (
        <button
          onClick={() => cambiarJuego('MENU')}
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
        >
          ⬅️ Volver a los Juegos
        </button>
      )}

      {juegoActivo === 'MENU' && <MenuJuegos onSeleccionar={cambiarJuego} />}
      {juegoActivo === 'PECES' && <JuegoPeces />}
      {juegoActivo === 'JESUS' && <JuegoDondeEstaJesus />}
      {juegoActivo === 'BARCO' && <JuegoNavegarBarco />}
    </div>
  );
}

function MenuJuegos({ onSeleccionar }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', color: '#facc15', textShadow: '2px 2px #b45309', marginBottom: '8px' }}>🎨 CYM KIDS 🎨</h1>
      <p style={{ fontSize: '18px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '24px' }}>¡Elegí un juego para empezar a divertirte!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={() => onSeleccionar('PECES')} style={{ backgroundColor: '#0284c7', border: '4px solid #38bdf8', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #0369a1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🐟 Atrapá el Pez</span><span style={{ fontSize: '30px' }}>🎣</span>
        </button>
        <button onClick={() => onSeleccionar('JESUS')} style={{ backgroundColor: '#16a34a', border: '4px solid #4ade80', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #15803d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✨ ¿Dónde está Jesús?</span><span style={{ fontSize: '30px' }}>🔍</span>
        </button>
        <button onClick={() => onSeleccionar('BARCO')} style={{ backgroundColor: '#d97706', border: '4px solid #fbbf24', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 0 #b45309', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⛵ Cruzando el Mar</span><span style={{ fontSize: '30px' }}>🌊</span>
        </button>
      </div>
    </div>
  );
}

function JuegoPeces() {
  const [pecera, setPecera] = useState(0);
  const [pezVisible, setPezVisible] = useState(false);
  const [posicionPez, setPosicionPez] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPezVisible(false);
      setTimeout(() => {
        setPosicionPez({ x: Math.floor(Math.random() * 70) + 15, y: Math.floor(Math.random() * 50) + 20 });
        setPezVisible(true);
      }, 400);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const atraparPez = () => {
    SoundFX.agua();
    setPecera(prev => prev + 1);
    setPezVisible(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', color: '#38bdf8' }}>🐟 ¡Tocá el pez que salta!</h2>
      <p style={{ fontSize: '18px', color: '#facc15' }}>Peces en la pecera: <strong>{pecera} 🐠</strong></p>
      <div style={{ position: 'relative', height: '350px', backgroundColor: '#0284c7', borderRadius: '20px', border: '6px solid #38bdf8', overflow: 'hidden', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', backgroundColor: '#38bdf8', opacity: 0.4 }} />
        {pezVisible && (
          <button onClick={atraparPez} style={{ position: 'absolute', left: `${posicionPez.x}%`, top: `${posicionPez.y}%`, fontSize: '48px', background: 'none', border: 'none', cursor: 'pointer', transform: 'scale(1.2)', transition: 'transform 0.1s' }}>🐟</button>
        )}
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.2)', border: '4px solid white', borderRadius: '50px', padding: '10px 20px', fontSize: '24px' }}>
          🏺 {Array.from({ length: Math.min(pecera, 8) }).map((_, i) => <span key={i}>🐠</span>)}
        </div>
      </div>
    </div>
  );
}

function JuegoDondeEstaJesus() {
  const [puntos, setPuntos] = useState(0);
  const [personas, setPersonas] = useState([]);

  const generarMultitud = () => {
    const emojis = ['👤', '🧔', '👩', '👨', '👵', '🧕'];
    const nuevaMultitud = Array.from({ length: 8 }).map(() => ({
      esJesus: false,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    const posicionJesus = Math.floor(Math.random() * 8);
    nuevaMultitud[posicionJesus] = { esJesus: true, emoji: '✨🧔‍♂️✨' };
    setPersonas(nuevaMultitud);
  };

  useEffect(() => { generarMultitud(); }, []);

  const tocarPersona = (esJesus) => {
    if (esJesus) {
      SoundFX.exito();
      setPuntos(prev => prev + 1);
      generarMultitud();
    } else {
      SoundFX.pop();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', color: '#4ade80' }}>✨ Tocá a Jesús entre las personas</h2>
      <p style={{ fontSize: '18px', color: '#facc15' }}>¡Encontrado {puntos} veces! ⭐</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '400px', margin: '20px auto' }}>
        {personas.map((p, index) => (
          <button key={index} onClick={() => tocarPersona(p.esJesus)} style={{ backgroundColor: '#1e293b', border: '4px solid #475569', borderRadius: '16px', padding: '20px', fontSize: '40px', cursor: 'pointer' }}>
            {p.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function JuegoNavegarBarco() {
  const [posicionBarco, setPosicionBarco] = useState(50);
  const [obstaculos, setObstaculos] = useState([]);
  const [puntos, setPuntos] = useState(0);

  const moverIzquierda = () => { SoundFX.remada(); setPosicionBarco(prev => Math.max(prev - 20, 10)); };
  const moverDerecha = () => { SoundFX.remada(); setPosicionBarco(prev => Math.min(prev + 20, 90)); };

  useEffect(() => {
    const tipos = ['🌊', '💨', '⚡', '🪵'];
    const interval = setInterval(() => {
      setObstaculos(prev => [...prev, { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: 0, tipo: tipos[Math.floor(Math.random() * tipos.length)] }]);
      setPuntos(p => p + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setObstaculos(prev => prev.map(o => ({ ...o, y: o.y + 10 })).filter(o => o.y < 100));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', color: '#fbbf24' }}>⛵ Ayudá a los discípulos a cruzar</h2>
      <p style={{ fontSize: '16px', color: '#38bdf8' }}>¡Esquivá las olas y rayos! Distancia: {puntos}m 🏁</p>
      <div style={{ position: 'relative', height: '350px', backgroundColor: '#1e3a8a', borderRadius: '20px', border: '6px solid #3b82f6', overflow: 'hidden', marginTop: '12px' }}>
        {obstaculos.map(o => (
          <div key={o.id} style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`, fontSize: '32px' }}>{o.tipo}</div>
        ))}
        <div style={{ position: 'absolute', bottom: '20px', left: `${posicionBarco}%`, transform: 'translateX(-50%)', fontSize: '48px', transition: 'left 0.1s' }}>⛵</div>
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px' }}>
        <button onClick={moverIzquierda} style={{ flex: 1, maxWidth: '180px', padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }}>⬅️</button>
        <button onClick={moverDerecha} style={{ flex: 1, maxWidth: '180px', padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }}>➡️</button>
      </div>
    </div>
  );
}