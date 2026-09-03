import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOTOR DE AUDIO (Estilo Arcade/Gamer)
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
  static click() { this.play(300, 'square', 0.05, 0.05); }
  static hit() { this.play(150, 'sawtooth', 0.2, 0.1); }
  static win() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.play(f, 'square', 0.1, 0.1), i * 100)); }
  static lose() { this.play(100, 'sawtooth', 0.5, 0.2); }
}

// ==========================================
// CONTENEDOR PRINCIPAL
// ==========================================
export default function ModuloAdolescentes({ currentUser, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState('MENU');
  const [xp, setXp] = useState(0);

  const ganarXP = (cantidad) => setXp(prev => prev + cantidad);
  const cambiarJuego = (juego) => { AudioEngine.click(); setJuegoActivo(juego); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', padding: '20px', fontFamily: '"Courier New", Courier, monospace', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={juegoActivo === 'MENU' ? onVolver : () => cambiarJuego('MENU')} style={{ backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #3f3f46', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {juegoActivo === 'MENU' ? '⬅ Volver a ASAPH' : '⬅ Menú Principal'}
        </button>
        <div style={{ backgroundColor: '#18181b', padding: '8px 16px', borderRadius: '8px', border: '1px solid #3f3f46', color: '#10b981', fontWeight: 'bold', letterSpacing: '2px' }}>
          XP: {xp}
        </div>
      </div>

      {juegoActivo === 'MENU' && <MenuTeens onSeleccionar={cambiarJuego} xp={xp} />}
      {juegoActivo === 'BABILONIA' && <EscapeBabilonia onGanar={ganarXP} />}
      {juegoActivo === 'NEHEMIAS' && <MuroNehemias onGanar={ganarXP} />}
      {juegoActivo === 'REY' && <DecisionesRey onGanar={ganarXP} />}
      {juegoActivo === 'CODICE' && <CodiceSagrado onGanar={ganarXP} />}
      {juegoActivo === 'HONDA' && <HondaDavid onGanar={ganarXP} />}
    </div>
  );
}

// ==========================================
// MENÚ ADOLESCENTES
// ==========================================
function MenuTeens({ onSeleccionar, xp }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', color: '#f4f4f5', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>Desafíos CyM</h1>
      <p style={{ color: '#71717a', marginBottom: '40px' }}>Estrategia, lógica y misterio.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <GameCard id="BABILONIA" title="Escape de Babilonia" desc="Resolvé acertijos lógicos para escapar." icon="🗝️" color="#8b5cf6" onClick={() => onSeleccionar('BABILONIA')} />
        <GameCard id="NEHEMIAS" title="El Muro de Nehemías" desc="Gestión de recursos en tiempo real." icon="🧱" color="#f59e0b" onClick={() => onSeleccionar('NEHEMIAS')} />
        <GameCard id="REY" title="Decisiones del Rey" desc="Mantené el equilibrio de tu reino." icon="⚖️" color="#ef4444" onClick={() => onSeleccionar('REY')} />
        <GameCard id="CODICE" title="Códice Sagrado" desc="Descifrá la palabra oculta en 6 intentos." icon="📜" color="#10b981" onClick={() => onSeleccionar('CODICE')} />
        <GameCard id="HONDA" title="La Honda de David" desc="Cálculo y precisión contra gigantes." icon="🎯" color="#3b82f6" onClick={() => onSeleccionar('HONDA')} />
      </div>
    </div>
  );
}

function GameCard({ title, desc, icon, color, onClick }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: '#18181b', border: `2px solid #27272a`, borderRadius: '16px', padding: '24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <h3 style={{ color: color, margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>{title}</h3>
      <p style={{ color: '#a1a1aa', margin: 0, fontSize: '12px' }}>{desc}</p>
    </button>
  );
}

// ==========================================
// 1. ESCAPE DE BABILONIA (Escape Room Lógico)
// ==========================================
function EscapeBabilonia({ onGanar }) {
  const NIVELES = [
    { pista: "Acertijo: Multiplicá el número de plagas de Egipto por los días que Jonás estuvo en el pez.", respuesta: "30" },
    { pista: "Código: El número de tribus de Israel unido al número de apóstoles originales.", respuesta: "1212" },
    { pista: "Palabra: Soy un gigante filisteo, pero una simple piedra me derribó. ¿Quién soy?", respuesta: "GOLIAT" },
    { pista: "Acertijo: ¿Cuántos libros tiene el Nuevo Testamento? (Ingresá el número)", respuesta: "27" },
    { pista: "Palabra: Fui vendido por mis hermanos, pero terminé gobernando Egipto.", respuesta: "JOSE" }
  ];

  const [nivel, setNivel] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const verificar = (e) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === NIVELES[nivel].respuesta) {
      AudioEngine.win();
      onGanar(50);
      if (nivel + 1 < NIVELES.length) {
        setNivel(nivel + 1);
        setInput('');
        setError(false);
      } else {
        setTerminado(true);
      }
    } else {
      AudioEngine.lose();
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  if (terminado) return <div style={{textAlign: 'center', padding: '50px', color: '#a855f7'}}><h2>¡Escapaste de Babilonia!</h2></div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#8b5cf6', letterSpacing: '2px' }}>PUERTA {nivel + 1}</h2>
      <div style={{ backgroundColor: '#18181b', padding: '30px', borderRadius: '16px', border: '1px solid #3f3f46', marginTop: '20px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px', color: '#d4d4d8' }}>"{NIVELES[nivel].pista}"</p>
        <form onSubmit={verificar}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu respuesta..."
            style={{ width: '100%', padding: '16px', backgroundColor: '#09090b', border: `2px solid ${error ? '#ef4444' : '#8b5cf6'}`, borderRadius: '8px', color: 'white', fontSize: '16px', textAlign: 'center', marginBottom: '20px', outline: 'none' }}
          />
          <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Intentar Abrir Candado
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. EL MURO DE NEHEMÍAS (Gestión Estratégica)
// ==========================================
function MuroNehemias({ onGanar }) {
  const TOTAL_TRABAJADORES = 15;
  const [muro, setMuro] = useState(0); // 0 a 100%
  const [piedra, setPiedra] = useState(0);
  const [amenaza, setAmenaza] = useState(0);
  const [asignacion, setAsignacion] = useState({ mineros: 5, constructores: 5, guardias: 5 });
  const [estado, setEstado] = useState('jugando'); // jugando, ganado, perdido

  useEffect(() => {
    if (estado !== 'jugando') return;
    const interval = setInterval(() => {
      // 1. Recolectar
      setPiedra(p => p + (asignacion.mineros * 2));
      
      // 2. Construir (si hay piedra)
      setPiedra(p => {
        if (p >= asignacion.constructores) {
          setMuro(m => {
            const nuevo = m + (asignacion.constructores * 0.5);
            if (nuevo >= 100) { setEstado('ganado'); onGanar(100); AudioEngine.win(); return 100; }
            return nuevo;
          });
          return p - asignacion.constructores;
        }
        return p;
      });

      // 3. Amenaza enemiga
      setAmenaza(a => {
        const nuevaAmenaza = a + Math.floor(Math.random() * 5);
        // Combate
        if (nuevaAmenaza > asignacion.guardias * 5) {
          // Daño al muro
          AudioEngine.hit();
          setMuro(m => {
            const dañado = m - 5;
            if (dañado <= -20) { setEstado('perdido'); AudioEngine.lose(); }
            return dañado;
          });
          return 0; // Se resetea la amenaza tras el ataque
        }
        return nuevaAmenaza;
      });

    }, 2000);
    return () => clearInterval(interval);
  }, [asignacion, estado, onGanar]);

  const asignar = (rol, cantidad) => {
    const libres = TOTAL_TRABAJADORES - (asignacion.mineros + asignacion.constructores + asignacion.guardias);
    if (cantidad > 0 && libres === 0) return;
    if (asignacion[rol] + cantidad < 0) return;
    AudioEngine.click();
    setAsignacion(prev => ({ ...prev, [rol]: prev[rol] + cantidad }));
  };

  const libres = TOTAL_TRABAJADORES - (asignacion.mineros + asignacion.constructores + asignacion.guardias);

  if (estado === 'ganado') return <div style={{textAlign: 'center', padding: '50px', color: '#10b981'}}><h2>¡Muro reconstruido con éxito!</h2></div>;
  if (estado === 'perdido') return <div style={{textAlign: 'center', padding: '50px', color: '#ef4444'}}><h2>Los enemigos destruyeron la obra.</h2><button onClick={()=>window.location.reload()}>Reintentar</button></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ color: '#f59e0b' }}>Piedra: {piedra}</span>
        <span style={{ color: '#ef4444' }}>Amenaza Enemiga: {amenaza}%</span>
      </div>

      <div style={{ backgroundColor: '#27272a', height: '30px', borderRadius: '15px', overflow: 'hidden', marginBottom: '30px', border: '2px solid #3f3f46' }}>
        <div style={{ width: `${Math.max(0, muro)}%`, height: '100%', backgroundColor: '#f59e0b', transition: 'width 0.5s' }} />
      </div>
      <p style={{ textAlign: 'center', marginTop: '-20px', marginBottom: '30px' }}>Progreso del Muro: {Math.floor(muro)}%</p>

      <div style={{ textAlign: 'center', marginBottom: '20px', color: '#a1a1aa' }}>Trabajadores Libres: <strong style={{color: 'white'}}>{libres}</strong> / {TOTAL_TRABAJADORES}</div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <Asignador titulo="⛏️ Mineros (Dan Piedra)" cantidad={asignacion.mineros} onCambiar={(n) => asignar('mineros', n)} color="#3b82f6" />
        <Asignador titulo="🧱 Constructores (Suben Muro)" cantidad={asignacion.constructores} onCambiar={(n) => asignar('constructores', n)} color="#f59e0b" />
        <Asignador titulo="⚔️ Guardias (Frenan Amenaza)" cantidad={asignacion.guardias} onCambiar={(n) => asignar('guardias', n)} color="#ef4444" />
      </div>
    </div>
  );
}

function Asignador({ titulo, cantidad, onCambiar, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${color}` }}>
      <span style={{ fontWeight: 'bold' }}>{titulo}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => onCambiar(-1)} style={{ width: '40px', height: '40px', backgroundColor: '#27272a', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '20px' }}>-</button>
        <span style={{ fontSize: '20px', width: '30px', textAlign: 'center' }}>{cantidad}</span>
        <button onClick={() => onCambiar(1)} style={{ width: '40px', height: '40px', backgroundColor: '#27272a', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '20px' }}>+</button>
      </div>
    </div>
  );
}

// ==========================================
// 3. DECISIONES DEL REY (Cartas Dilema)
// ==========================================
function DecisionesRey({ onGanar }) {
  const [stats, setStats] = useState({ fe: 50, sabiduria: 50, pueblo: 50 });
  const [turnos, setTurnos] = useState(0);
  const [estado, setEstado] = useState('jugando');

  const CARTAS = [
    { txt: "Un rey vecino te ofrece oro a cambio de poner ídolos en tu templo.", 
      izq: { txt: "Aceptar Oro", ef: {fe:-20, sab:-10, pueblo:+10} }, 
      der: { txt: "Rechazar Ídolos", ef: {fe:+20, sab:+10, pueblo:-10} } },
    { txt: "Hay una sequía. El pueblo pide que bajes los impuestos.", 
      izq: { txt: "Mantenerlos", ef: {fe:0, sab:-10, pueblo:-20} }, 
      der: { txt: "Bajarlos", ef: {fe:+10, sab:+10, pueblo:+20} } },
    { txt: "Tus consejeros sugieren atacar una aldea pacífica para robar su trigo.", 
      izq: { txt: "Atacar", ef: {fe:-30, sab:-20, pueblo:+10} }, 
      der: { txt: "Buscar Paz", ef: {fe:+10, sab:+20, pueblo:-10} } },
    { txt: "Encontraron un viejo pergamino de la Ley olvidado en el templo.", 
      izq: { txt: "Leerlo al pueblo", ef: {fe:+30, sab:+10, pueblo:-10} }, 
      der: { txt: "Ignorarlo", ef: {fe:-30, sab:-20, pueblo:0} } },
  ];

  const [cartaActual, setCartaActual] = useState(CARTAS[0]);

  const elegir = (opcion) => {
    AudioEngine.click();
    const nuevosStats = {
      fe: stats.fe + opcion.ef.fe,
      sabiduria: stats.sabiduria + opcion.ef.sab,
      pueblo: stats.pueblo + opcion.ef.pueblo
    };

    if (nuevosStats.fe <= 0 || nuevosStats.sabiduria <= 0 || nuevosStats.pueblo <= 0) {
      setEstado('perdido');
      AudioEngine.lose();
      return;
    }

    setStats(nuevosStats);
    setTurnos(t => t + 1);
    onGanar(5);
    setCartaActual(CARTAS[Math.floor(Math.random() * CARTAS.length)]);
  };

  if (estado === 'perdido') return <div style={{textAlign: 'center', color: '#ef4444', padding: '50px'}}><h2>Perdiste el trono tras {turnos} decisiones.</h2><button onClick={()=>{setStats({fe:50, sabiduria:50, pueblo:50}); setTurnos(0); setEstado('jugando');}}>Reintentar</button></div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        <StatBar icon="🙏" valor={stats.fe} color="#8b5cf6" label="Fe" />
        <StatBar icon="🦉" valor={stats.sabiduria} color="#3b82f6" label="Sabiduría" />
        <StatBar icon="🧑‍🤝‍🧑" valor={stats.pueblo} color="#f59e0b" label="Pueblo" />
      </div>

      <div style={{ backgroundColor: '#18181b', padding: '40px 20px', borderRadius: '24px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ef4444', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '20px', lineHeight: '1.5' }}>{cartaActual.txt}</h3>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => elegir(cartaActual.izq)} style={{ flex: 1, padding: '20px', backgroundColor: '#27272a', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>{cartaActual.izq.txt}</button>
        <button onClick={() => elegir(cartaActual.der)} style={{ flex: 1, padding: '20px', backgroundColor: '#27272a', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>{cartaActual.der.txt}</button>
      </div>
    </div>
  );
}

function StatBar({ icon, valor, color, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '30%' }}>
      <span>{icon} {label}</span>
      <div style={{ width: '100%', height: '10px', backgroundColor: '#27272a', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, valor))}%`, backgroundColor: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ==========================================
// 4. CÓDICE SAGRADO (Wordle Clone 5 letras)
// ==========================================
function CodiceSagrado({ onGanar }) {
  const PALABRAS = ["DAVID", "PEDRO", "JESUS", "SALMO", "TRIGO", "CIELO", "ALTAR", "CRUZ", "PABLO", "NUBES"];
  const [objetivo, setObjetivo] = useState("");
  const [intentos, setIntentos] = useState([]);
  const [intentoActual, setIntentoActual] = useState("");
  const [estado, setEstado] = useState('jugando'); // jugando, ganado, perdido

  useEffect(() => {
    setObjetivo(PALABRAS[Math.floor(Math.random() * PALABRAS.length)]);
  }, []);

  const adivinar = (e) => {
    e.preventDefault();
    if (intentoActual.length !== 5 || estado !== 'jugando') return;
    
    const nuevoIntento = intentoActual.toUpperCase();
    const nuevosIntentos = [...intentos, nuevoIntento];
    setIntentos(nuevosIntentos);
    setIntentoActual("");

    if (nuevoIntento === objetivo) {
      AudioEngine.win();
      setEstado('ganado');
      onGanar(50);
    } else if (nuevosIntentos.length >= 6) {
      AudioEngine.lose();
      setEstado('perdido');
    } else {
      AudioEngine.click();
    }
  };

  const getColor = (letra, index, intentoStr) => {
    if (objetivo[index] === letra) return '#10b981'; // Correcto
    if (objetivo.includes(letra)) return '#f59e0b'; // Casi
    return '#3f3f46'; // Incorrecto
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#10b981', letterSpacing: '2px', marginBottom: '20px' }}>DESCIFRÁ EL CÓDICE (5 Letras)</h2>
      
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', gap: '10px', marginBottom: '30px' }}>
        {Array.from({ length: 6 }).map((_, filaIdx) => {
          const intentoStr = intentos[filaIdx] || (filaIdx === intentos.length ? intentoActual : "");
          return (
            <div key={filaIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const letra = intentoStr[colIdx] || "";
                const isPasado = filaIdx < intentos.length;
                const colorBg = isPasado ? getColor(letra, colIdx, intentoStr) : '#18181b';
                return (
                  <div key={colIdx} style={{ height: '60px', backgroundColor: colorBg, border: isPasado ? 'none' : '2px solid #3f3f46', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {letra}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {estado === 'jugando' ? (
        <form onSubmit={adivinar}>
          <input type="text" maxLength={5} value={intentoActual} onChange={(e)=>setIntentoActual(e.target.value.toUpperCase())} placeholder="Escribí 5 letras..." style={{ padding: '16px', width: 'calc(100% - 100px)', backgroundColor: '#18181b', color: 'white', border: '2px solid #10b981', borderRadius: '8px', textTransform: 'uppercase', textAlign: 'center', outline: 'none' }} />
          <button type="submit" style={{ padding: '16px 20px', marginLeft: '10px', backgroundColor: '#10b981', color: '#09090b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
        </form>
      ) : (
        <div>
          <h3 style={{ color: estado === 'ganado' ? '#10b981' : '#ef4444' }}>{estado === 'ganado' ? '¡Descifrado!' : `La palabra era ${objetivo}`}</h3>
          <button onClick={()=>{setIntentos([]); setEstado('jugando'); setObjetivo(PALABRAS[Math.floor(Math.random() * PALABRAS.length)]);}} style={{ padding: '10px 20px', marginTop: '10px' }}>Jugar de nuevo</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. LA HONDA DE DAVID (Física/Precisión)
// ==========================================
function HondaDavid({ onGanar }) {
  const [punteria, setPunteria] = useState(0); // 0 a 100 oscilando
  const [direccion, setDireccion] = useState(1); // 1 = sube, -1 = baja
  const [gigante, setGigante] = useState(Math.floor(Math.random() * 60) + 20); // Posición estática aleatoria
  const [estado, setEstado] = useState('apuntando'); // apuntando, disparo, resultado
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (estado !== 'apuntando') return;
    const interval = setInterval(() => {
      setPunteria(p => {
        let nuevo = p + (direccion * 3);
        if (nuevo >= 100) { setDireccion(-1); return 100; }
        if (nuevo <= 0) { setDireccion(1); return 0; }
        return nuevo;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [estado, direccion]);

  const disparar = () => {
    if (estado !== 'apuntando') return;
    setEstado('disparo');
    AudioEngine.hit();
    
    setTimeout(() => {
      const diferencia = Math.abs(punteria - gigante);
      if (diferencia < 10) {
        setResultado('hit');
        AudioEngine.win();
        onGanar(20);
      } else {
        setResultado('miss');
        AudioEngine.lose();
      }
      setEstado('resultado');
    }, 500);
  };

  const reiniciar = () => {
    setGigante(Math.floor(Math.random() * 60) + 20);
    setEstado('apuntando');
    setResultado(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#3b82f6', letterSpacing: '2px', marginBottom: '40px' }}>LA HONDA DE DAVID</h2>

      {/* ZONA DE JUEGO (Visor) */}
      <div style={{ position: 'relative', height: '150px', backgroundColor: '#18181b', borderRadius: '20px', border: '2px solid #3f3f46', marginBottom: '40px' }}>
        
        {/* El Gigante (Objetivo) */}
        <div style={{ position: 'absolute', left: `${gigante}%`, top: '50%', transform: 'translate(-50%, -50%)', fontSize: '40px', transition: 'all 0.3s', opacity: resultado === 'hit' ? 0 : 1 }}>
          👹
        </div>

        {/* La Piedra (Mira) */}
        <div style={{ position: 'absolute', left: `${punteria}%`, bottom: estado==='apuntando' ? '-10px' : '50%', transform: 'translateX(-50%)', fontSize: '30px', transition: estado==='apuntando' ? 'none' : 'all 0.5s ease-out' }}>
          🪨
        </div>
      </div>

      {estado === 'apuntando' && (
        <button onClick={disparar} style={{ padding: '20px 40px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 6px 0 #1d4ed8' }}>
          ¡SOLTAR PIEDRA!
        </button>
      )}

      {estado === 'resultado' && (
        <div className="animate-in zoom-in">
          <h3 style={{ color: resultado === 'hit' ? '#10b981' : '#ef4444', fontSize: '28px' }}>{resultado === 'hit' ? '¡BLANCO PERFECTO!' : '¡Fallaste!'}</h3>
          <button onClick={reiniciar} style={{ padding: '12px 24px', marginTop: '20px', backgroundColor: '#3f3f46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Siguiente Intento</button>
        </div>
      )}
    </div>
  );
}