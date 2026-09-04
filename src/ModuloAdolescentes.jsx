import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOTOR DE AUDIO (Estilo Arcade/Hardcore)
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
  static click() { this.play(800, 'square', 0.05, 0.05); }
  static hit() { this.play(100, 'sawtooth', 0.3, 0.2); } // Golpe/Daño grave
  static laser() { this.play(1200, 'sine', 0.1, 0.05); setTimeout(() => this.play(800, 'sine', 0.1, 0.05), 50); }
  static win() { [880, 1108, 1318, 1760].forEach((f, i) => setTimeout(() => this.play(f, 'square', 0.1, 0.1), i * 80)); }
  static lose() { this.play(50, 'sawtooth', 0.8, 0.3); } // Game Over brutal
}

// ==========================================
// CONTENEDOR PRINCIPAL - ESTÉTICA CYBERPUNK
// ==========================================
export default function ModuloAdolescentes({ currentUser, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState('MENU');
  const [xp, setXp] = useState(0);

  const ganarXP = (cantidad) => setXp(prev => prev + cantidad);
  const cambiarJuego = (juego) => { AudioEngine.click(); setJuegoActivo(juego); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#e4e4e7', padding: '20px', fontFamily: '"Courier New", Courier, monospace', userSelect: 'none', backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}>
      
      {/* HEADER TÁCTICO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3f3f46', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={juegoActivo === 'MENU' ? onVolver : () => cambiarJuego('MENU')} style={{ backgroundColor: '#18181b', color: '#f4f4f5', border: '1px solid #52525b', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
          {juegoActivo === 'MENU' ? '<< SALIR' : '<< ABORTAR MISIÓN'}
        </button>
        <div style={{ backgroundColor: '#052e16', padding: '10px 20px', borderRadius: '4px', border: '1px solid #10b981', color: '#34d399', fontWeight: '900', letterSpacing: '3px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
          RANGO: {xp} XP
        </div>
      </div>

      {juegoActivo === 'MENU' && <MenuTeens onSeleccionar={cambiarJuego} />}
      {juegoActivo === 'FUEGO' && <SalmosDeFuego onGanar={ganarXP} />}
      {juegoActivo === 'DEFENSA' && <DefensaTemplo onGanar={ganarXP} />}
      {juegoActivo === 'EXODO' && <ExodoHardcore onGanar={ganarXP} />}
      {juegoActivo === 'ARENA' && <ArenaCyM onGanar={ganarXP} />}
    </div>
  );
}

// ==========================================
// MENÚ PRINCIPAL NEÓN
// ==========================================
function MenuTeens({ onSeleccionar }) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#fff', letterSpacing: '8px', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 0 20px #ef4444' }}>ZONA DE ALTO RIESGO</h1>
      <p style={{ color: '#a1a1aa', marginBottom: '50px', letterSpacing: '2px' }}>PREPARATE PARA TRANSPIRAR.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <GameCard id="FUEGO" title="Salmos de Fuego" desc="Reflejos extremos al ritmo de la música." color="#f97316" onClick={() => onSeleccionar('FUEGO')} />
        <GameCard id="DEFENSA" title="Defensa del Templo" desc="Tipeo hiper-veloz para frenar hordas." color="#3b82f6" onClick={() => onSeleccionar('DEFENSA')} />
        <GameCard id="EXODO" title="Éxodo: Modo Hardcore" desc="Sobreviví 40 días en el desierto. Permadeath." color="#ef4444" onClick={() => onSeleccionar('EXODO')} />
        <GameCard id="ARENA" title="Arena CyM (1v1)" desc="Trivia a muerte. 5 segundos por respuesta." color="#a855f7" onClick={() => onSeleccionar('ARENA')} />
      </div>
    </div>
  );
}

function GameCard({ title, desc, color, onClick }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: '#09090b', border: `2px solid #27272a`, borderRadius: '8px', padding: '30px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}40`; e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', backgroundColor: color }} />
      <h3 style={{ color: '#fff', margin: 0, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>{title}</h3>
      <p style={{ color: color, margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{desc}</p>
    </button>
  );
}

// ==========================================
// 1. SALMOS DE FUEGO (Guitar Hero / Piano Tiles)
// ==========================================
function SalmosDeFuego({ onGanar }) {
  const [notas, setNotas] = useState([]);
  const [score, setScore] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [estado, setEstado] = useState('jugando'); // jugando, gameover
  
  // Velocidad de caída inicial
  const velocidadBase = 5; 
  const currentSpeed = useRef(velocidadBase);

  // Referencias para el loop rápido
  const notasRef = useRef(notas);
  const estadoRef = useRef(estado);

  useEffect(() => { notasRef.current = notas; }, [notas]);
  useEffect(() => { estadoRef.current = estado; }, [estado]);

  // Generador de notas (aumenta la frecuencia con el score)
  useEffect(() => {
    if (estado !== 'jugando') return;
    const intervalGen = setInterval(() => {
      if (estadoRef.current !== 'jugando') return;
      const carril = Math.floor(Math.random() * 4);
      setNotas(prev => [...prev, { id: Date.now(), carril, y: 0 }]);
    }, Math.max(800 - (score * 10), 300)); // Cada vez aparecen más rápido

    return () => clearInterval(intervalGen);
  }, [estado, score]);

  // Motor de caída a 60fps
  useEffect(() => {
    if (estado !== 'jugando') return;
    const intervalMove = setInterval(() => {
      setNotas(prev => {
        let nuevas = [];
        let fallo = false;

        // Aumentar velocidad global según el score
        currentSpeed.current = velocidadBase + (score * 0.1);

        for (let n of prev) {
          const newY = n.y + currentSpeed.current;
          if (newY > 100) {
            // Nota perdida = Daño
            fallo = true;
          } else {
            nuevas.push({ ...n, y: newY });
          }
        }

        if (fallo) {
          AudioEngine.hit();
          setVidas(v => {
            const nuevasVidas = v - 1;
            if (nuevasVidas <= 0) { setEstado('gameover'); AudioEngine.lose(); }
            return nuevasVidas;
          });
        }
        return nuevas;
      });
    }, 30);
    return () => clearInterval(intervalMove);
  }, [estado, score]);

  // Controles por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (estadoRef.current !== 'jugando') return;
      const keyMap = { 'a': 0, 's': 1, 'k': 2, 'l': 3 };
      const carrilPresionado = keyMap[e.key.toLowerCase()];
      
      if (carrilPresionado !== undefined) {
        presionarCarril(carrilPresionado);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const presionarCarril = (carrilIndex) => {
    // Buscar la nota más baja en ese carril que esté en la zona de hit (y > 75)
    setNotas(prev => {
      const targetIndex = prev.findIndex(n => n.carril === carrilIndex && n.y > 75);
      if (targetIndex !== -1) {
        // Hit!
        AudioEngine.laser();
        const nuevas = [...prev];
        nuevas.splice(targetIndex, 1);
        setScore(s => {
          const nuevoScore = s + 1;
          if (nuevoScore % 10 === 0) onGanar(10); // Da XP cada 10 hits
          return nuevoScore;
        });
        return nuevas;
      }
      return prev; // Miss total
    });
  };

  const reiniciar = () => {
    setNotas([]);
    setScore(0);
    setVidas(3);
    currentSpeed.current = velocidadBase;
    setEstado('jugando');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#f97316', fontWeight: '900', fontSize: '24px', textShadow: '0 0 10px #f97316' }}>
        <span>HITS: {score}</span>
        <span>VIDAS: {Array(vidas).fill('▮').join('')}</span>
      </div>

      <div style={{ position: 'relative', height: '400px', backgroundColor: '#09090b', border: '2px solid #3f3f46', overflow: 'hidden', display: 'flex' }}>
        
        {/* Línea de Hit */}
        <div style={{ position: 'absolute', bottom: '15%', left: 0, width: '100%', height: '5px', backgroundColor: '#f97316', boxShadow: '0 0 15px #f97316', zIndex: 10 }} />

        {/* 4 Carriles */}
        {[0, 1, 2, 3].map(c => (
          <div key={c} style={{ flex: 1, borderRight: c<3 ? '1px solid #27272a' : 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', color: '#52525b', fontWeight: 'bold' }}>{['A','S','K','L'][c]}</div>
          </div>
        ))}

        {/* Renderizado de Notas */}
        {notas.map(n => (
          <div key={n.id} style={{
            position: 'absolute',
            top: `${n.y}%`,
            left: `${(n.carril * 25) + 12.5}%`,
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '20px',
            backgroundColor: n.y > 75 ? '#fff' : '#f97316',
            boxShadow: n.y > 75 ? '0 0 20px #fff' : '0 0 15px #f97316',
            zIndex: 5
          }} />
        ))}

        {estado === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#ef4444', fontSize: '40px', textShadow: '0 0 20px #ef4444', letterSpacing: '5px', margin: 0 }}>SISTEMA CAÍDO</h2>
            <p style={{ color: '#fff', fontSize: '20px', marginTop: '10px' }}>HITS TOTALES: {score}</p>
            <button onClick={reiniciar} style={{ marginTop: '30px', backgroundColor: '#f97316', color: '#000', border: 'none', padding: '15px 30px', fontWeight: '900', fontSize: '18px', cursor: 'pointer' }}>REINICIAR</button>
          </div>
        )}
      </div>

      <p style={{ color: '#71717a', marginTop: '20px', fontSize: '12px' }}>* Usá las teclas A, S, K, L en tu teclado para disparar.</p>
    </div>
  );
}

// ==========================================
// 2. DEFENSA DEL TEMPLO (Tipeo Veloz)
// ==========================================
function DefensaTemplo({ onGanar }) {
  const DICCIONARIO = ["SABIDURIA", "PENTECOSTES", "JERUSALEN", "SACRIFICIO", "REDENCION", "PROFECIA", "APOCALIPSIS", "TESTAMENTO", "SANTUARIO", "TABERNACULO"];
  
  const [enemigos, setEnemigos] = useState([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [estado, setEstado] = useState('jugando');

  const velocidadBase = 0.2;
  const currentSpeed = useRef(velocidadBase);

  // Generar Enemigos
  useEffect(() => {
    if (estado !== 'jugando') return;
    const interval = setInterval(() => {
      const palabra = DICCIONARIO[Math.floor(Math.random() * DICCIONARIO.length)];
      setEnemigos(prev => [...prev, { id: Date.now(), palabra, y: 0 }]);
    }, Math.max(3000 - (score * 50), 1000));
    return () => clearInterval(interval);
  }, [estado, score]);

  // Mover Enemigos
  useEffect(() => {
    if (estado !== 'jugando') return;
    const interval = setInterval(() => {
      currentSpeed.current = velocidadBase + (score * 0.02);
      
      setEnemigos(prev => {
        let perdio = false;
        const nuevos = prev.map(e => {
          const newY = e.y + currentSpeed.current;
          if (newY > 90) perdio = true; // Llegó al centro
          return { ...e, y: newY };
        });

        if (perdio) {
          AudioEngine.lose();
          setEstado('gameover');
        }
        return nuevos;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [estado, score]);

  // Manejar Tipeo
  const handleTipeo = (e) => {
    const texto = e.target.value.toUpperCase();
    setInput(texto);

    // ¿Coincide con algún enemigo entero?
    setEnemigos(prev => {
      const matchIndex = prev.findIndex(en => en.palabra === texto);
      if (matchIndex !== -1) {
        AudioEngine.laser();
        const nuevas = [...prev];
        nuevas.splice(matchIndex, 1);
        setScore(s => {
          const ns = s + 1;
          onGanar(5);
          return ns;
        });
        setInput(''); // Limpia al destruir
        return nuevas;
      }
      return prev;
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#3b82f6', letterSpacing: '4px', textShadow: '0 0 10px #3b82f6', marginBottom: '20px' }}>DEFENSA DEL TEMPLO</h2>
      
      <div style={{ position: 'relative', height: '400px', backgroundColor: '#09090b', border: '2px solid #3f3f46', overflow: 'hidden' }}>
        
        {/* Núcleo a defender */}
        <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', backgroundColor: '#3b82f6', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.5 }} />

        {/* Enemigos bajando */}
        {enemigos.map(e => {
          // Highlight de las letras que ya tipeó correctamente (si coincide el inicio)
          const coincideInicio = e.palabra.startsWith(input) && input.length > 0;

          return (
            <div key={e.id} style={{ position: 'absolute', top: `${e.y}%`, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#18181b', border: '1px solid #ef4444', padding: '5px 10px', color: '#fff', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
              {coincideInicio ? (
                <>
                  <span style={{ color: '#3b82f6' }}>{input}</span>
                  <span>{e.palabra.slice(input.length)}</span>
                </>
              ) : (
                e.palabra
              )}
            </div>
          );
        })}

        {estado === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#ef4444', fontSize: '30px', margin: 0 }}>TEMPLO DESTRUIDO</h2>
            <p style={{ color: '#fff' }}>HORDAS ELIMINADAS: {score}</p>
            <button onClick={()=>{setEnemigos([]); setScore(0); setInput(''); setEstado('jugando');}} style={{ marginTop: '20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>REINTENTAR</button>
          </div>
        )}
      </div>

      <input 
        type="text" 
        value={input} 
        onChange={handleTipeo} 
        disabled={estado !== 'jugando'}
        autoFocus
        placeholder="TIPEAR PARA DESTRUIR..."
        style={{ width: '100%', padding: '20px', marginTop: '20px', backgroundColor: '#18181b', border: '2px solid #3b82f6', color: '#fff', fontSize: '24px', textAlign: 'center', outline: 'none', letterSpacing: '4px' }}
      />
    </div>
  );
}

// ==========================================
// 3. ÉXODO: MODO HARDCORE (Roguelike / Supervivencia)
// ==========================================
function ExodoHardcore({ onGanar }) {
  const [dia, setDia] = useState(1);
  const [stats, setStats] = useState({ agua: 100, mana: 100, moral: 100 });
  const [evento, setEvento] = useState(null);
  const [estado, setEstado] = useState('jugando'); // jugando, muerto, victoria

  const EVENTOS = [
    { txt: "Tormenta de Arena masiva. ¿Qué protegés?", 
      opA: { txt: "Proteger Agua", ef: {agua:0, mana:-30, moral:-10} },
      opB: { txt: "Proteger Tiendas (Moral)", ef: {agua:-20, mana:-20, moral:0} } },
    { txt: "Encuentran un oasis pequeño pero dudoso.", 
      opA: { txt: "Beber (Riesgo de enfermedad)", ef: {agua:+30, mana:0, moral:-20} },
      opB: { txt: "Ignorar y seguir", ef: {agua:-20, mana:0, moral:+10} } },
    { txt: "El pueblo se queja de comer solo Maná.", 
      opA: { txt: "Ignorarlos (Cae moral)", ef: {agua:-10, mana:0, moral:-30} },
      opB: { txt: "Dar ración doble", ef: {agua:0, mana:-40, moral:+20} } }
  ];

  useEffect(() => {
    generarEvento();
  }, []);

  const generarEvento = () => {
    setEvento(EVENTOS[Math.floor(Math.random() * EVENTOS.length)]);
  };

  const elegir = (opcion) => {
    AudioEngine.click();
    
    // Consumo diario fijo
    const consumoDiario = { agua: -10, mana: -10, moral: -5 };

    const nuevosStats = {
      agua: stats.agua + opcion.ef.agua + consumoDiario.agua,
      mana: stats.mana + opcion.ef.mana + consumoDiario.mana,
      moral: stats.moral + opcion.ef.moral + consumoDiario.moral
    };

    if (nuevosStats.agua <= 0 || nuevosStats.mana <= 0 || nuevosStats.moral <= 0) {
      setEstado('muerto');
      AudioEngine.lose();
      return;
    }

    if (dia + 1 > 40) {
      setEstado('victoria');
      AudioEngine.win();
      onGanar(500); // Premio gigante por ganar el hardcore
      return;
    }

    setStats(nuevosStats);
    setDia(d => d + 1);
    generarEvento();
  };

  if (estado === 'muerto') return <div style={{textAlign: 'center', padding: '50px', color: '#ef4444'}}><h2>EL PUEBLO PERECIÓ EN EL DÍA {dia}</h2><button onClick={()=>{setStats({agua:100, mana:100, moral:100}); setDia(1); setEstado('jugando'); generarEvento();}}>Iniciar nueva expedición</button></div>;
  if (estado === 'victoria') return <div style={{textAlign: 'center', padding: '50px', color: '#10b981'}}><h2>¡LLEGARON A LA TIERRA PROMETIDA!</h2></div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#ef4444', letterSpacing: '4px', textShadow: '0 0 10px #ef4444', marginBottom: '10px' }}>ÉXODO: SUPERVIVENCIA</h2>
      <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>DÍA {dia} / 40</p>

      {/* Stats UI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #3b82f6', padding: '15px', color: '#3b82f6', fontWeight: 'bold' }}>AGUA<br/>{stats.agua}</div>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #facc15', padding: '15px', color: '#facc15', fontWeight: 'bold' }}>MANÁ<br/>{stats.mana}</div>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #a855f7', padding: '15px', color: '#a855f7', fontWeight: 'bold' }}>MORAL<br/>{stats.moral}</div>
      </div>

      {/* Terminal de Evento */}
      {evento && (
        <div style={{ backgroundColor: '#000', border: '2px dashed #ef4444', padding: '30px', marginBottom: '20px', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#fff', fontSize: '18px', letterSpacing: '1px' }}>{evento.txt}</p>
        </div>
      )}

      {/* Decisiones */}
      {evento && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => elegir(evento.opA)} style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #52525b', padding: '20px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', transition: 'border-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#ef4444'} onMouseOut={e=>e.currentTarget.style.borderColor='#52525b'}>{evento.opA.txt}</button>
          <button onClick={() => elegir(evento.opB)} style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #52525b', padding: '20px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', transition: 'border-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#ef4444'} onMouseOut={e=>e.currentTarget.style.borderColor='#52525b'}>{evento.opB.txt}</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ARENA CyM (Trivia 1v1 con Tiempo Letal)
// ==========================================
function ArenaCyM({ onGanar }) {
  const PREGUNTAS = [
    { q: "¿Quién escribió la mayor parte de los Salmos?", a: "DAVID", b: "SALOMON", ans: "a" },
    { q: "¿En qué isla fue exiliado Juan?", a: "CHIPRE", b: "PATMOS", ans: "b" },
    { q: "¿Quién era el padre de Juan el Bautista?", a: "ZACARIAS", b: "ZEBEDEO", ans: "a" },
    { q: "¿Qué ciudad destruyó Dios con fuego y azufre?", a: "NINIVE", b: "SODOMA", ans: "b" }
  ];

  const [preguntaActiva, setPreguntaActiva] = useState(PREGUNTAS[0]);
  const [vidaJugador, setVidaJugador] = useState(100);
  const [vidaRival, setVidaRival] = useState(100);
  const [tiempo, setTiempo] = useState(5); // 5 SEGUNDOS LETALES
  const [estado, setEstado] = useState('jugando');

  useEffect(() => {
    if (estado !== 'jugando') return;
    const interval = setInterval(() => {
      setTiempo(t => {
        if (t - 1 <= 0) {
          // Se acabó el tiempo = Castigo al jugador
          AudioEngine.hit();
          setVidaJugador(v => {
            if (v - 20 <= 0) setEstado('perdido');
            return v - 20;
          });
          siguientePregunta();
          return 5;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [estado]);

  const siguientePregunta = () => {
    setPreguntaActiva(PREGUNTAS[Math.floor(Math.random() * PREGUNTAS.length)]);
    setTiempo(5);
  };

  const responder = (opcion) => {
    if (estado !== 'jugando') return;

    if (opcion === preguntaActiva.ans) {
      AudioEngine.laser();
      // Daño al rival basado en qué tan rápido respondió
      const dano = tiempo * 5; 
      setVidaRival(v => {
        const nv = v - dano;
        if (nv <= 0) { setEstado('ganado'); AudioEngine.win(); onGanar(100); }
        return nv;
      });
    } else {
      AudioEngine.hit();
      // Castigo por error
      setVidaJugador(v => {
        const nv = v - 20;
        if (nv <= 0) { setEstado('perdido'); AudioEngine.lose(); }
        return nv;
      });
    }
    siguientePregunta();
  };

  if (estado === 'ganado') return <div style={{textAlign: 'center', padding: '50px', color: '#a855f7'}}><h2>¡RIVAL DESTRUIDO!</h2></div>;
  if (estado === 'perdido') return <div style={{textAlign: 'center', padding: '50px', color: '#ef4444'}}><h2>CAÍSTE EN LA ARENA.</h2><button onClick={()=>{setVidaJugador(100);setVidaRival(100);setEstado('jugando');setTiempo(5);}}>Reintentar</button></div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* BARRAS DE VIDA (Estilo Pelea) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
        <div style={{ width: '40%' }}>
          <div style={{ color: '#10b981', fontWeight: '900', marginBottom: '5px' }}>VOS ({vidaJugador}%)</div>
          <div style={{ height: '20px', backgroundColor: '#18181b', border: '2px solid #10b981', transform: 'skewX(-15deg)' }}>
            <div style={{ height: '100%', width: `${Math.max(0, vidaJugador)}%`, backgroundColor: '#10b981', transition: 'width 0.2s' }} />
          </div>
        </div>
        <div style={{ fontSize: '40px', fontWeight: '900', color: '#ef4444', textShadow: '0 0 20px #ef4444' }}>VS</div>
        <div style={{ width: '40%', textAlign: 'right' }}>
          <div style={{ color: '#ef4444', fontWeight: '900', marginBottom: '5px' }}>IA RIVAL ({vidaRival}%)</div>
          <div style={{ height: '20px', backgroundColor: '#18181b', border: '2px solid #ef4444', transform: 'skewX(-15deg)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ height: '100%', width: `${Math.max(0, vidaRival)}%`, backgroundColor: '#ef4444', transition: 'width 0.2s' }} />
          </div>
        </div>
      </div>

      {/* RELOJ LETAL */}
      <div style={{ textAlign: 'center', fontSize: '60px', fontWeight: '900', color: tiempo <= 2 ? '#ef4444' : '#fff', marginBottom: '20px', textShadow: tiempo <= 2 ? '0 0 20px #ef4444' : 'none' }}>
        00:0{tiempo}
      </div>

      {/* PREGUNTA Y RESPUESTAS */}
      <div style={{ backgroundColor: '#18181b', padding: '40px', border: '2px solid #a855f7', textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', margin: 0 }}>{preguntaActiva.q}</h3>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => responder('a')} style={{ flex: 1, backgroundColor: '#09090b', color: '#a855f7', border: '2px solid #a855f7', padding: '20px', fontSize: '20px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#a855f7'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#09090b'}>{preguntaActiva.a}</button>
        <button onClick={() => responder('b')} style={{ flex: 1, backgroundColor: '#09090b', color: '#a855f7', border: '2px solid #a855f7', padding: '20px', fontSize: '20px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#a855f7'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#09090b'}>{preguntaActiva.b}</button>
      </div>
    </div>
  );
}