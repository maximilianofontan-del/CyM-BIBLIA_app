import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, arrayUnion, arrayRemove, getDoc 
} from 'firebase/firestore';
import { 
  Shield, Crown, Lock, Unlock, Send, ChevronLeft, PlusCircle, UserCheck, 
  MessageSquare, LogOut, ArrowUpCircle, Trophy, Users, Heart, CheckCircle, ChevronDown, Swords
} from 'lucide-react';

const RANGOS = ['Seguidor', 'Amigo', 'Discípulo', 'Apóstol'];
const ORDEN_RANGOS = { 'Líder': 1, 'Apóstol': 2, 'Discípulo': 3, 'Amigo': 4, 'Seguidor': 5 };
const ICONOS_RANGO = { 'Líder': '👑', 'Apóstol': '⚔️', 'Discípulo': '📖', 'Amigo': '🤝', 'Seguidor': '🚶' };

export default function ModuloClanes({ currentUser, db, onVolver }) {
  const [clanes, setClanes] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({});
  const [miClan, setMiClan] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState('miclan'); // 'miclan' o 'ranking'

  // ESTADOS FORMULARIO CREAR CLAN
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreClan, setNombreClan] = useState('');
  const [descripcionClan, setDescripcionClan] = useState('');
  const [esPrivado, setEsPrivado] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // CHAT INTERNO
  const [mensajesClan, setMensajesChat] = useState([]);
  const [inputChat, setInputChat] = useState('');

  // 1. CARGA EN TIEMPO REAL (Usuarios y Clanes)
  useEffect(() => {
    const unsubUsr = onSnapshot(collection(db, 'cym_usuarios'), (snap) => {
      const uMap = {};
      snap.forEach(d => { uMap[d.id] = { id: d.id, ...d.data() }; });
      setUsuariosMap(uMap);
    });

    const q = query(collection(db, 'cym_clanes'));
    const unsubClanes = onSnapshot(q, (snapshot) => {
      const lista = [];
      let clanUsuario = null;

      snapshot.forEach((d) => {
        const c = { id: d.id, ...d.data() };
        lista.push(c);

        if (c.miembrosIds && c.miembrosIds.includes(currentUser?.uid)) {
          clanUsuario = c;
        }
      });

      setClanes(lista);
      setMiClan(clanUsuario);
      if (clanUsuario) setMensajesChat(clanUsuario.mensajesChat || []);
      
      setCargando(false);
    });

    return () => { unsubUsr(); unsubClanes(); };
  }, [currentUser, db]);

  // 2. PROCESAR PUNTOS Y MIEMBROS
  const clanesProcesados = clanes.map(clan => {
    let puntosTotales = 0;
    const miembrosDetalle = (clan.miembrosIds || []).map(uid => {
      const usr = usuariosMap[uid] || { id: uid, nombre: 'Usuario Desconocido', puntosTrivia: 0, corazones: 0 };
      puntosTotales += (usr.puntosTrivia || 0);
      return {
        ...usr,
        rango: clan.rangos?.[uid] || 'Seguidor'
      };
    });

    miembrosDetalle.sort((a, b) => {
      if (ORDEN_RANGOS[a.rango] !== ORDEN_RANGOS[b.rango]) {
        return ORDEN_RANGOS[a.rango] - ORDEN_RANGOS[b.rango];
      }
      return (b.puntosTrivia || 0) - (a.puntosTrivia || 0);
    });

    return { ...clan, puntosTotales, miembrosDetalle };
  }).sort((a, b) => b.puntosTotales - a.puntosTotales);

  const miClanProcesado = clanesProcesados.find(c => c.id === miClan?.id);
  const posicionMiClan = clanesProcesados.findIndex(c => c.id === miClan?.id) + 1;
  const esLider = miClan?.liderId === currentUser?.uid;

  // Lógica de Asistencia Diaria
  const hoyStr = new Date().toISOString().split('T')[0];
  const yaDioAsistencia = currentUser?.ultimaAsistenciaClan === hoyStr;

  // 3. CREAR UN NUEVO CLAN (COSTO: 50 DIAMANTES 💎)
  const handleCrearClan = async (e) => {
    e.preventDefault();
    if (!nombreClan.trim()) { alert("Ingresá un nombre para tu Clan."); return; }

    const diamantesActuales = currentUser?.diamantes || 0;
    if (diamantesActuales < 50) { alert("⚠️ Necesitás 50 Diamantes 💎 para fundar un Clan."); return; }

    setProcesando(true);
    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
        diamantes: diamantesActuales - 50,
        tituloHonorifico: `👑 LÍDER DE CLAN`
      });

      const nuevoClan = {
        nombre: nombreClan.trim(),
        descripcion: descripcionClan.trim(),
        liderId: currentUser.uid,
        liderNombre: currentUser.nombre || 'Líder',
        esPrivado: esPrivado,
        cupoMaximo: 20,
        miembrosIds: [currentUser.uid],
        rangos: { [currentUser.uid]: 'Líder' },
        solicitudesPendientes: [],
        mensajesChat: [],
        fechaCreacion: new Date().toISOString()
      };

      await addDoc(collection(db, 'cym_clanes'), nuevoClan);
      alert("🏰 ¡Felicitaciones! Has fundado tu Clan exitosamente.");
      setMostrarCrear(false);
      setNombreClan('');
      setDescripcionClan('');
    } catch (err) {
      alert("Error al intentar crear el Clan.");
    } finally {
      setProcesando(false);
    }
  };

  // 4. UNIRSE A UN CLAN
  const handleUnirseClan = async (clan) => {
    if (miClan) { alert("Ya pertenecés a un Clan."); return; }
    if ((clan.miembrosIds?.length || 0) >= (clan.cupoMaximo || 20)) { alert("⚠️ Este Clan alcanzó su límite máximo de miembros."); return; }
    if (!window.confirm(`¿Seguro que querés unirte a ${clan.nombre}?`)) return;

    const clanRef = doc(db, 'cym_clanes', clan.id);
    try {
      if (clan.esPrivado) {
        await updateDoc(clanRef, {
          solicitudesPendientes: arrayUnion({ uid: currentUser.uid, nombre: currentUser.nombre || 'Hermano/a', foto: currentUser.photoURL })
        });
        alert("Solicitud enviada al Líder del Clan.");
      } else {
        await updateDoc(clanRef, {
          miembrosIds: arrayUnion(currentUser.uid),
          [`rangos.${currentUser.uid}`]: 'Seguidor'
        });
        alert(`¡Te uniste a ${clan.nombre}!`);
      }
    } catch (e) { alert("Error al procesar la solicitud."); }
  };

  // 5. CHAT PRIVADO DEL CLAN
  const handleEnviarMensajeChat = async (e) => {
    e.preventDefault();
    if (!inputChat.trim() || !miClan) return;

    const nuevoMsg = {
      autor: currentUser.nombre || 'Miembro',
      autorId: currentUser.uid,
      texto: inputChat.trim(),
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nuevosMensajes = [...mensajesClan, nuevoMsg];
    setMensajesChat(nuevosMensajes);
    setInputChat('');

    try {
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { mensajesChat: nuevosMensajes });
    } catch (err) {}
  };

  // 6. SALIR DEL CLAN
  const handleSalirClan = async () => {
    if (miClan.liderId === currentUser.uid && miClan.miembrosIds.length > 1) {
      alert("⚠️ Sos el Líder. Como todavía hay miembros en tu clan, no podés salir sin disolverlo. Pideles que salgan primero.");
      return;
    }
    if (!window.confirm(`¿Estás seguro que querés abandonar el clan "${miClan.nombre}"?`)) return;

    try {
      if (miClan.miembrosIds.length === 1) {
        await deleteDoc(doc(db, 'cym_clanes', miClan.id));
        alert("Saliste del clan. Al quedar vacío, el clan fue disuelto.");
      } else {
        const rangosActualizados = { ...miClan.rangos };
        delete rangosActualizados[currentUser.uid];
        await updateDoc(doc(db, 'cym_clanes', miClan.id), {
          miembrosIds: arrayRemove(currentUser.uid),
          rangos: rangosActualizados
        });
        alert("Has abandonado el clan exitosamente.");
      }
      
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { tituloHonorifico: null });
      setMiClan(null);
    } catch (e) { alert("Ocurrió un error al intentar salir del clan."); }
  };

  // 7. AMPLIAR CUPO DEL CLAN
  const handleAmpliarCupo = async () => {
    const diamantesActuales = currentUser?.diamantes || 0;
    if (diamantesActuales < 25) { alert("⚠️ Necesitás 25 Diamantes 💎 para ampliar la capacidad del Clan."); return; }
    if (!window.confirm("¿Querés invertir 25 Diamantes para habilitar 10 lugares más en tu Clan?")) return;

    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { diamantes: diamantesActuales - 25 });
      const nuevoCupo = (miClan.cupoMaximo || 20) + 10;
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { cupoMaximo: nuevoCupo });
      alert(`¡Éxito! Tu clan ahora tiene capacidad para ${nuevoCupo} miembros.`);
    } catch (e) { alert("Error al intentar ampliar el clan."); }
  };

  // 8. ASISTENCIA Y RECOMPENSA DIARIA
  const handleAsistencia = async () => {
    if (yaDioAsistencia) return;
    setProcesando(true);
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, {
        corazones: (currentUser.corazones || 0) + 2,
        ultimaAsistenciaClan: hoyStr
      });

      if (miClan.liderId && miClan.liderId !== currentUser.uid) {
        const liderRef = doc(db, 'cym_usuarios', miClan.liderId);
        const liderSnap = await getDoc(liderRef);
        if (liderSnap.exists()) {
          await updateDoc(liderRef, { corazones: (liderSnap.data().corazones || 0) + 1 });
        }
      }
      alert("¡Asistencia registrada! Ganaste 2 ❤️ y tu líder recibió 1 ❤️.");
    } catch (error) { alert("Error al registrar asistencia."); } 
    finally { setProcesando(false); }
  };

  // 9. CAMBIAR RANGOS DEL CLAN
  const handleCambiarRango = async (miembroId, nuevoRango) => {
    try {
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { [`rangos.${miembroId}`]: nuevoRango });
    } catch (error) { alert("Error al actualizar el rango."); }
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* BARRA SUPERIOR Y PESTAÑAS */}
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft size={22} /></button>
        <div className="flex bg-black/50 p-1.5 rounded-full border border-amber-500/30">
          <button onClick={() => setPestaña('miclan')} className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors ${pestaña === 'miclan' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Mi Clan</button>
          <button onClick={() => setPestaña('ranking')} className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors ${pestaña === 'ranking' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Clanes Rivales</button>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-20 text-amber-400 my-auto"><Shield size={48} className="animate-bounce mx-auto mb-2" /><p className="font-bold text-xs uppercase tracking-widest">Conectando...</p></div>
      ) : pestaña === 'miclan' ? (
        
        miClanProcesado ? (
          /* VISTA: MI CLAN ACTUAL */
          <div className="space-y-4 w-full max-w-2xl mx-auto">
            
            {/* Banner del Clan */}
            <div className="bg-black/80 border border-amber-500/40 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={100} color="#f59e0b" /></div>
              <div className="relative z-10">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/30">
                  {esLider ? '👑 Eres el Líder' : '🛡️ Integrante'} | Ranking: #{posicionMiClan}
                </span>
                <h2 className="text-3xl font-black text-white mt-2 mb-1">{miClanProcesado.nombre}</h2>
                <p className="text-slate-400 text-xs max-w-sm">{miClanProcesado.descripcion || "Sin descripción."}</p>
              </div>
              <div className="relative z-10 bg-black/60 border border-amber-500/30 p-3 rounded-2xl text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest mb-1">Puntos Globales</span>
                <span className="text-3xl font-black text-amber-400">{miClanProcesado.puntosTotales}</span>
              </div>
            </div>

            {/* Asistencia Diaria */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/60 border border-emerald-500/30 p-5 rounded-3xl">
              <div>
                <h4 className="text-emerald-400 font-black uppercase text-sm">Recompensa Diaria</h4>
                <p className="text-slate-400 text-xs">Marcá asistencia todos los días para ganar corazones para vos y tu líder.</p>
              </div>
              <button 
                onClick={handleAsistencia} disabled={yaDioAsistencia || procesando}
                className={`font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform w-full sm:w-auto ${yaDioAsistencia ? 'bg-emerald-900/40 text-emerald-500 border border-emerald-500/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'}`}
              >
                {yaDioAsistencia ? <><CheckCircle size={18} /> Asistencia Lista</> : <><Heart size={18} /> Dar Asistencia (+2 ❤️)</>}
              </button>
            </div>

            {/* Botones Lider / Abandonar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {esLider && (
                <button onClick={handleAmpliarCupo} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-3 rounded-2xl text-xs uppercase flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02]">
                  <ArrowUpCircle size={18} /> Ampliar Cupo (+10) por 25 💎
                </button>
              )}
              <button onClick={handleSalirClan} className="flex-1 bg-red-600/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-2xl text-xs uppercase flex justify-center items-center gap-2 hover:bg-red-600/40">
                <LogOut size={16} /> Abandonar Clan
              </button>
            </div>

            {/* Lista de Miembros y Rangos */}
            <div className="bg-black/60 border border-white/10 rounded-3xl overflow-hidden mt-4">
              <div className="p-4 bg-black/40 flex justify-between items-center border-b border-white/10">
                <h4 className="font-black text-white uppercase text-sm flex items-center gap-2"><Users size={18} className="text-amber-400"/> Jerarquía del Clan</h4>
                <span className="text-xs font-bold text-slate-400">{miClanProcesado.miembrosDetalle.length} / {miClanProcesado.cupoMaximo}</span>
              </div>
              <div className="divide-y divide-white/5">
                {miClanProcesado.miembrosDetalle.map(miembro => {
                  const esYo = miembro.id === currentUser.uid;
                  return (
                    <div key={miembro.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${esYo ? 'bg-amber-900/20' : 'hover:bg-white/5'}`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="absolute -top-2 -left-2 text-lg z-10 bg-black rounded-full shadow-md">{ICONOS_RANGO[miembro.rango]}</span>
                          <img src={miembro.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className="w-10 h-10 rounded-full border border-amber-500 object-cover" alt="Perfil" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{esYo ? 'Tú' : miembro.nombre} {miembro.id === miClan.liderId && <Crown size={12} className="inline text-[#ffd700] ml-1 mb-1"/>}</p>
                          {esLider && !esYo ? (
                            <div className="mt-1 relative inline-block">
                              <select value={miembro.rango} onChange={(e) => handleCambiarRango(miembro.id, e.target.value)} className="appearance-none bg-amber-900/40 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase rounded py-0.5 pl-2 pr-6 outline-none cursor-pointer">
                                {RANGOS.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-amber-300 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-amber-400 block">{miembro.rango}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center justify-between sm:block">
                        <span className="text-xs font-bold text-slate-400 sm:hidden">Puntos:</span>
                        <div>
                          <p className="font-black text-lg text-amber-400">{miembro.puntosTrivia || 0}</p>
                          <p className="text-[9px] uppercase text-slate-500 font-bold hidden sm:block">Puntos Aportados</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chat Interno */}
            <div className="bg-black/70 border border-amber-500/20 p-4 rounded-3xl flex flex-col h-[350px]">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold text-amber-400">
                <MessageSquare size={16} /> Chat Privado del Clan
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 p-2 text-xs">
                {mensajesClan.length === 0 ? (
                  <p className="text-center text-slate-500 py-10">Sé el primero en enviar un mensaje...</p>
                ) : (
                  mensajesClan.map((m, i) => (
                    <div key={i} className={`p-2.5 rounded-xl max-w-[80%] ${m.autorId === currentUser.uid ? 'ml-auto bg-amber-500/20 border border-amber-500/30 text-amber-200' : 'bg-white/5 border border-white/10 text-slate-200'}`}>
                      <span className="font-bold block text-[10px] opacity-75">{m.autor} - {m.fecha}</span>
                      <p className="text-sm font-medium">{m.texto}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleEnviarMensajeChat} className="flex gap-2 pt-2 border-t border-white/10">
                <input type="text" placeholder="Escribir mensaje al Clan..." value={inputChat} onChange={(e) => setInputChat(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400" />
                <button type="submit" className="p-2.5 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400"><Send size={16} /></button>
              </form>
            </div>

          </div>
        ) : (

          /* VISTA: EXPLORADOR PARA UNIRSE O CREAR CLAN */
          <div className="space-y-6 w-full max-w-3xl mx-auto">
            <div className="bg-black/80 border border-amber-500/40 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md shadow-2xl">
              <div>
                <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2"><Shield size={28} /> Salón de Clanes</h2>
                <p className="text-slate-400 text-xs">Unite a un grupo o fundá el tuyo propio para liderar en el Ranking global.</p>
              </div>
              <button onClick={() => setMostrarCrear(!mostrarCrear)} className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105">
                <PlusCircle size={18} /> {mostrarCrear ? "Cerrar Panel" : "Fundar Clan (50 💎)"}
              </button>
            </div>

            {mostrarCrear && (
              <form onSubmit={handleCrearClan} className="bg-amber-950/30 border border-amber-500/50 p-6 rounded-3xl space-y-4">
                <h3 className="text-amber-300 font-black text-sm uppercase flex items-center gap-2"><Crown size={18} /> Requisitos de Fundación (50 💎)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Clan *</label>
                    <input type="text" placeholder="Ej: Guerreros de Fe" value={nombreClan} onChange={(e) => setNombreClan(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Privacidad</label>
                    <select value={esPrivado ? "privado" : "publico"} onChange={(e) => setEsPrivado(e.target.value === "privado")} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none">
                      <option value="publico">🔓 Abierto (Ingreso directo)</option>
                      <option value="privado">🔒 Cerrado (Requiere aprobación)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Descripción / Lema del Clan</label>
                  <textarea rows={2} placeholder="Escribí la visión o lema..." value={descripcionClan} onChange={(e) => setDescripcionClan(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                </div>
                <button type="submit" disabled={procesando} className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-xl">
                  {procesando ? "Fundando..." : "Fundar Clan Oficial"}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clanes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  <Shield size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-bold">No hay clanes creados todavía. ¡Sé el primer Líder!</p>
                </div>
              ) : (
                clanes.map((c) => (
                  <div key={c.id} className="bg-black/60 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-black text-lg">{c.nombre}</h4>
                        {c.esPrivado ? <Lock size={16} className="text-amber-400" /> : <Unlock size={16} className="text-emerald-400" />}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{c.descripcion || "Sin descripción."}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
                      <span className="text-slate-300 font-bold">Líder: <span className="text-amber-400">{c.liderNombre}</span></span>
                      <span className="text-slate-400">{c.miembrosIds?.length || 1} / {c.cupoMaximo || 20}</span>
                    </div>
                    <button onClick={() => handleUnirseClan(c)} className="w-full bg-white/10 hover:bg-white/20 text-amber-300 font-black py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1 border border-amber-500/30">
                      <UserCheck size={14} /> {c.esPrivado ? "Solicitar Ingreso" : "Unirme al Clan"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      ) : (

        /* VISTA: RANKING DE CLANES RIVALES */
        <div className="space-y-4 w-full max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/30 to-black border border-red-500/30 p-6 rounded-3xl mb-6 text-center shadow-xl">
            <Swords size={32} className="mx-auto text-red-500 mb-3" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Batalla Global de Clanes</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">Acá se suma el puntaje total de todos los miembros. ¡Llevá a tu clan a la cima estudiando la Palabra!</p>
          </div>

          <div className="space-y-3">
            {clanesProcesados.length === 0 ? (
              <p className="text-center text-slate-500 py-10">Todavía no existen clanes en el servidor.</p>
            ) : (
              clanesProcesados.map((c, idx) => {
                const esMio = c.id === miClan?.id;
                let colorPos = 'text-slate-500';
                if (idx === 0) colorPos = 'text-[#ffd700] text-3xl drop-shadow-[0_0_10px_rgba(204,163,0,0.8)]';
                else if (idx === 1) colorPos = 'text-slate-300 text-2xl';
                else if (idx === 2) colorPos = 'text-amber-600 text-xl';

                return (
                  <div key={c.id} className={`flex items-center justify-between p-4 rounded-2xl border ${esMio ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#141414] border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`font-black w-8 text-center ${colorPos}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg leading-tight">{c.nombre} {esMio && <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-black ml-2 align-middle">Tu Clan</span>}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1"><Users size={12} className="inline mr-1"/> {c.miembrosIds?.length || 0} Guerreros</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-[#ffd700]">{c.puntosTotales}</p>
                      <p className="text-[9px] uppercase text-slate-500 font-bold">Pts Totales</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      )}

    </div>
  );
}