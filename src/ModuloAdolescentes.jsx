import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOTOR DE AUDIO (Arcade)
// ==========================================
class AudioEngine {
  static ctx = null;
  static getContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  static play(freq, type, duration, vol = 0.1) {
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
  static jump() { this.play(400, 'sine', 0.1, 0.1); setTimeout(() => this.play(600, 'sine', 0.1, 0.1), 100); }
  static shoot() { this.play(800, 'square', 0.05, 0.05); }
  static hit() { this.play(150, 'sawtooth', 0.2, 0.1); }
  static explosion() { this.play(100, 'sawtooth', 0.4, 0.2); setTimeout(() => this.play(50, 'sawtooth', 0.4, 0.2), 100); }
  static win() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.play(f, 'square', 0.1, 0.1), i * 100)); }
}

// ==========================================
// CONTENEDOR PRINCIPAL
// ==========================================
export default function ModuloAdolescentes({ currentUser, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState('MENU');
  const [xp, setXp] = useState(0);

  const ganarXP = (cantidad) => setXp(prev => prev + cantidad);
  const cambiarJuego = (juego) => { setJuegoActivo(juego); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', padding: '20px', fontFamily: '"Courier New", Courier, monospace', userSelect: 'none', backgroundImage: 'radial-gradient(circle at top, #18181b 0%, #000 100%)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #27272a', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={juegoActivo === 'MENU' ? onVolver : () => cambiarJuego('MENU')} style={{ backgroundColor: '#18181b', color: '#f4f4f5', border: '1px solid #52525b', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
          {juegoActivo === 'MENU' ? '<< SALIR' : '<< ABORTAR MISIÓN'}
        </button>
        <div style={{ backgroundColor: '#052e16', padding: '10px 20px', borderRadius: '4px', border: '1px solid #10b981', color: '#34d399', fontWeight: '900', letterSpacing: '3px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
          XP: {xp}
        </div>
      </div>

      {juegoActivo === 'MENU' && <MenuTeens onSeleccionar={cambiarJuego} />}
      {juegoActivo === 'RUNNER' && <ElPeregrino onGanar={ganarXP} />}
      {juegoActivo === 'SHOOTER' && <ElCentinela onGanar={ganarXP} />}
    </div>
  );
}

function MenuTeens({ onSeleccionar }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#fff', letterSpacing: '8px', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 0 20px #3b82f6' }}>ZONA ARCADE</h1>
      <p style={{ color: '#a1a1aa', marginBottom: '50px', letterSpacing: '2px' }}>ACCIÓN, SALTOS Y DISPAROS.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', justifyContent: 'center' }}>
        <GameCard id="RUNNER" title="El Peregrino" desc="Corré, saltá pozos y esquivá obstáculos de energía." icon="🏃‍♂️" color="#10b981" onClick={() => onSeleccionar('RUNNER')} />
        <GameCard id="SHOOTER" title="El Centinela" desc="Dispará rayos de luz para frenar a las sombras." icon="🚀" color="#ef4444" onClick={() => onSeleccionar('SHOOTER')} />
      </div>
    </div>
  );
}

function GameCard({ title, desc, icon, color, onClick }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: '#09090b', border: `2px solid #27272a`, borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 30px ${color}40`; e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}>
      <div style={{ fontSize: '60px', filter: `drop-shadow(0 0 10px ${color})` }}>{icon}</div>
      <h3 style={{ color: '#fff', margin: 0, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>{title}</h3>
      <p style={{ color: color, margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{desc}</p>
    </button>
  );
}

// ==========================================
// 1. EL PEREGRINO (Endless Runner / Saltos)
// ==========================================
function ElPeregrino({ onGanar }) {
  const [estado, setEstado] = useState('inicio'); // inicio, jugando, gameover
  const [score, setScore] = useState(0);

  // Físicas
  const charY = useRef(0);
  const velY = useRef(0);
  const gravedad = -1.2;
  const isJumping = useRef(false);
  
  const obstaculos = useRef([]);
  const frameRef = useRef();
  
  // Elementos DOM para renderizado rápido sin re-render de React
  const charRefDOM = useRef(null);
  const obsContainerRef = useRef(null);

  const velocidadJuego = useRef(1);

  const saltar = () => {
    if (estado !== 'jugando') return;
    if (!isJumping.current) {
      velY.current = 18; // Fuerza de salto
      isJumping.current = true;
      AudioEngine.jump();
    }
  };

  const iniciarJuego = () => {
    setEstado('jugando');
    setScore(0);
    charY.current = 0;
    velY.current = 0;
    isJumping.current = false;
    obstaculos.current = [];
    velocidadJuego.current = 1.2; // Velocidad inicial
    loop();
  };

  const gameover = () => {
    cancelAnimationFrame(frameRef.current);
    setEstado('gameover');
    AudioEngine.explosion();
  };

  const loop = () => {
    if (estado !== 'jugando') return;

    // 1. Gravedad y Salto
    if (isJumping.current) {
      charY.current += velY.current;
      velY.current += gravedad;
      if (charY.current <= 0) {
        charY.current = 0;
        isJumping.current = false;
        velY.current = 0;
      }
    }

    // 2. Generar Obstáculos
    if (Math.random() < 0.02 * velocidadJuego.current && (obstaculos.current.length === 0 || obstaculos.current[obstaculos.current.length-1].x < 60)) {
      const tipo = Math.random() > 0.5 ? 'pincho' : 'pozo';
      obstaculos.current.push({ x: 100, tipo, id: Date.now() });
    }

    // 3. Mover Obstáculos y Colisiones
    let hit = false;
    for (let i = 0; i < obstaculos.current.length; i++) {
      let obs = obstaculos.current[i];
      obs.x -= velocidadJuego.current; // Mover a la izquierda

      // Colisión (Personaje fijo en x=10, ancho=10)
      if (obs.x > 5 && obs.x < 15) {
        if (obs.tipo === 'pincho' && charY.current < 20) {
          hit = true; // Tocó el pincho
        }
        if (obs.tipo === 'pozo' && charY.current === 0) {
          hit = true; // Cayó al pozo
        }
      }
    }

    if (hit) {
      gameover();
      return;
    }

    // Limpiar obstáculos que ya pasaron
    obstaculos.current = obstaculos.current.filter(o => o.x > -10);

    // Subir score y velocidad
    setScore(s => {
      const newScore = s + 1;
      if (newScore % 500 === 0) {
        velocidadJuego.current += 0.2;
        onGanar(10);
      }
      return newScore;
    });

    // 4. Renderizado Manual (Mejora drástica de FPS)
    if (charRefDOM.current) {
      charRefDOM.current.style.bottom = `${charY.current}%`;
    }
    
    if (obsContainerRef.current) {
      obsContainerRef.current.innerHTML = obstaculos.current.map(obs => {
        if (obs.tipo === 'pincho') {
          return `<div style="position:absolute; left:${obs.x}%; bottom:0; width:30px; height:40px; background-color:#ef4444; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); box-shadow: 0 0 20px #ef4444;"></div>`;
        } else {
          // Pozo (espacio negro en el piso neón)
          return `<div style="position:absolute; left:${obs.x}%; bottom:-10px; width:60px; height:20px; background-color:#09090b; border-left: 2px solid #10b981; border-right: 2px solid #10b981;"></div>`;
        }
      }).join('');
    }

    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') saltar(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); cancelAnimationFrame(frameRef.current); };
  }, [estado]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} onClick={saltar}>
      <h2 style={{ color: '#10b981', letterSpacing: '4px', textShadow: '0 0 10px #10b981', marginBottom: '20px' }}>EL PEREGRINO</h2>
      
      <div style={{ position: 'relative', height: '400px', backgroundColor: '#000', border: '2px solid #27272a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 30px rgba(16,185,129,0.1)' }}>
        
        {/* Fondo Parallax animado por CSS */}
        <div style={{ position: 'absolute', top: '10%', left: 0, width: '200%', height: '100%', backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(16,185,129,0.05) 50%)', backgroundSize: '100px 100%', animation: estado === 'jugando' ? 'scrollBg 2s linear infinite' : 'none', zIndex: 1 }} />
        <style>{`@keyframes scrollBg { from { transform: translateX(0); } to { transform: translateX(-100px); } }`}</style>

        {/* Piso de Energía */}
        <div style={{ position: 'absolute', bottom: '0', left: 0, width: '100%', height: '10px', backgroundColor: '#10b981', boxShadow: '0 0 20px #10b981', zIndex: 5 }} />

        {/* Personaje */}
        <div ref={charRefDOM} style={{ position: 'absolute', left: '10%', bottom: '0%', width: '40px', height: '50px', zIndex: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transition: 'bottom 0.05s linear' }}>
           <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px #34d399)' }}>🏃🏽‍♂️</span>
        </div>

        {/* Contenedor de Obstáculos */}
        <div ref={obsContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 6 }} />

        {/* HUD Score */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', fontSize: '24px', fontWeight: '900', zIndex: 20 }}>
          DISTANCIA: {Math.floor(score / 10)}m
        </div>

        {/* Pantallas de Inicio y Fin */}
        {estado === 'inicio' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '20px' }}>Tocá la pantalla o Espacio para saltar.</h3>
            <button onClick={(e) => { e.stopPropagation(); iniciarJuego(); }} style={{ padding: '15px 40px', backgroundColor: '#10b981', color: '#000', fontSize: '20px', fontWeight: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 0 20px #10b981' }}>INICIAR CARRERA</button>
          </div>
        )}

        {estado === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239,68,68,0.3)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <h2 style={{ color: '#ef4444', fontSize: '50px', margin: 0, textShadow: '0 0 20px #ef4444' }}>CAÍSTE</h2>
            <p style={{ color: '#fff', fontSize: '20px' }}>Llegaste a {Math.floor(score / 10)} metros.</p>
            <button onClick={(e) => { e.stopPropagation(); iniciarJuego(); }} style={{ padding: '15px 40px', marginTop: '20px', backgroundColor: '#ef4444', color: '#fff', fontSize: '20px', fontWeight: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 0 20px #ef4444' }}>REINTENTAR</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. EL CENTINELA (Shooter / Space Invaders)
// ==========================================
function ElCentinela({ onGanar }) {
  const [estado, setEstado] = useState('inicio'); // inicio, jugando, gameover
  const [score, setScore] = useState(0);

  // Posiciones
  const playerX = useRef(50);
  const bullets = useRef([]);
  const enemies = useRef([]);
  const frameRef = useRef();

  // Controles Suaves
  const keys = useRef({ ArrowLeft: false, ArrowRight: false, a: false, d: false });
  const isShooting = useRef(false);

  // DOM Refs
  const playerRefDOM = useRef(null);
  const objectsRefDOM = useRef(null);

  const iniciarJuego = () => {
    setEstado('jugando');
    setScore(0);
    playerX.current = 50;
    bullets.current = [];
    enemies.current = [];
    loop();
  };

  const disparar = () => {
    if (estado !== 'jugando' || isShooting.current) return;
    isShooting.current = true;
    AudioEngine.shoot();
    bullets.current.push({ x: playerX.current, y: 85, id: Date.now() });
    
    // Cadencia de disparo
    setTimeout(() => { isShooting.current = false; }, 200); 
  };

  const loop = () => {
    if (estado !== 'jugando') return;

    // 1. Mover Jugador
    if (keys.current.ArrowLeft || keys.current.a) playerX.current = Math.max(5, playerX.current - 1.5);
    if (keys.current.ArrowRight || keys.current.d) playerX.current = Math.min(95, playerX.current + 1.5);

    // 2. Generar Enemigos (Sombras)
    if (Math.random() < 0.03 + (score * 0.0005)) { // Aumenta dificultad
      enemies.current.push({ x: Math.random() * 90 + 5, y: -10, hp: 1, id: Date.now() });
    }

    // 3. Mover Balas (Lasers)
    for (let b of bullets.current) {
      b.y -= 3; // Sube rápido
    }
    bullets.current = bullets.current.filter(b => b.y > -10);

    // 4. Mover Enemigos y Detectar Colisión
    let hitPiso = false;
    for (let i = 0; i < enemies.current.length; i++) {
      let e = enemies.current[i];
      e.y += 0.5 + (score * 0.01); // Caen más rápido con el tiempo

      // Colisión Enemigo <-> Bala
      for (let j = 0; j < bullets.current.length; j++) {
        let b = bullets.current[j];
        if (Math.abs(b.x - e.x) < 5 && Math.abs(b.y - e.y) < 5) {
          // Destruido!
          AudioEngine.hit();
          e.hp -= 1;
          b.y = -100; // Eliminar bala
          setScore(s => {
            const ns = s + 10;
            if (ns % 200 === 0) onGanar(20);
            return ns;
          });
        }
      }

      if (e.y > 90 && e.hp > 0) {
        hitPiso = true;
      }
    }

    // Limpiar muertos
    enemies.current = enemies.current.filter(e => e.hp > 0);

    if (hitPiso) {
      cancelAnimationFrame(frameRef.current);
      setEstado('gameover');
      AudioEngine.explosion();
      return;
    }

    // 5. Renderizado Manual
    if (playerRefDOM.current) {
      playerRefDOM.current.style.left = `${playerX.current}%`;
    }
    
    if (objectsRefDOM.current) {
      let html = '';
      // Dibujar Balas
      bullets.current.forEach(b => {
        html += `<div style="position:absolute; left:${b.x}%; top:${b.y}%; width:4px; height:20px; background-color:#38bdf8; box-shadow:0 0 10px #38bdf8; transform:translate(-50%, -50%); border-radius:5px;"></div>`;
      });
      // Dibujar Enemigos
      enemies.current.forEach(e => {
        html += `<div style="position:absolute; left:${e.x}%; top:${e.y}%; transform:translate(-50%, -50%); font-size:30px; filter:drop-shadow(0 0 5px #ef4444);">👾</div>`;
      });
      objectsRefDOM.current.innerHTML = html;
    }

    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = true;
      if (e.code === 'Space') disparar();
    };
    const handleKeyUp = (e) => {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameRef.current);
    };
  }, [estado]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#ef4444', letterSpacing: '4px', textShadow: '0 0 10px #ef4444', marginBottom: '20px' }}>EL CENTINELA</h2>
      
      <div style={{ position: 'relative', height: '500px', backgroundColor: '#09090b', border: '2px solid #27272a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}>
        
        {/* Jugador */}
        <div ref={playerRefDOM} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px #38bdf8)' }}>🚀</span>
        </div>

        {/* Contenedor de Proyectiles y Enemigos */}
        <div ref={objectsRefDOM} style={{ position: 'absolute', inset: 0, zIndex: 5 }} />

        {/* HUD Score */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#fff', fontSize: '20px', fontWeight: '900', zIndex: 20 }}>
          SOMBRAS DESTRUIDAS: {score}
        </div>

        {/* Pantallas */}
        {estado === 'inicio' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Mové con Flechas o A/D. Dispará con Espacio.</h3>
            <p style={{ color: '#ef4444', marginBottom: '30px' }}>No dejes que toquen el piso.</p>
            <button onClick={iniciarJuego} style={{ padding: '15px 40px', backgroundColor: '#ef4444', color: '#fff', fontSize: '20px', fontWeight: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 0 20px #ef4444' }}>INICIAR DEFENSA</button>
          </div>
        )}

        {estado === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239,68,68,0.2)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <h2 style={{ color: '#ef4444', fontSize: '50px', margin: 0, textShadow: '0 0 20px #ef4444' }}>ESCUDO ROTO</h2>
            <p style={{ color: '#fff', fontSize: '24px' }}>Puntaje Final: {score}</p>
            <button onClick={iniciarJuego} style={{ padding: '15px 40px', marginTop: '20px', backgroundColor: '#ef4444', color: '#fff', fontSize: '20px', fontWeight: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 0 20px #ef4444' }}>REINTENTAR</button>
          </div>
        )}
      </div>

      {/* Botones táctiles para jugar en Celular */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button 
          onPointerDown={() => keys.current.ArrowLeft = true} 
          onPointerUp={() => keys.current.ArrowLeft = false} 
          onPointerLeave={() => keys.current.ArrowLeft = false} 
          style={{ width: '80px', height: '60px', backgroundColor: '#27272a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '24px' }}>⬅</button>
        
        <button 
          onPointerDown={disparar} 
          style={{ flex: 1, height: '60px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'black', fontSize: '20px', textTransform: 'uppercase', boxShadow: '0 0 15px #38bdf8' }}>FUEGO</button>
        
        <button 
          onPointerDown={() => keys.current.ArrowRight = true} 
          onPointerUp={() => keys.current.ArrowRight = false} 
          onPointerLeave={() => keys.current.ArrowRight = false}
          style={{ width: '80px', height: '60px', backgroundColor: '#27272a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '24px' }}>➡</button>
      </div>
    </div>
  );
}