import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, arrayUnion, arrayRemove, getDoc 
} from 'firebase/firestore';
import { 
  Shield, Crown, Lock, Unlock, Send, ChevronLeft, PlusCircle, UserCheck, 
  MessageSquare, LogOut, ArrowUpCircle, Trophy, Users, Heart, CheckCircle, 
  ChevronDown, Swords, UserX, Clock, Target, Edit2, Check, X, Flame
} from 'lucide-react';

const RANGOS = ['Seguidor', 'Amigo', 'Discípulo', 'Apóstol'];
const ORDEN_RANGOS = { 'Líder': 1, 'Apóstol': 2, 'Discípulo': 3, 'Amigo': 4, 'Seguidor': 5 };
const ICONOS_RANGO = { 'Líder': '👑', 'Apóstol': '⚔️', 'Discípulo': '📖', 'Amigo': '🤝', 'Seguidor': '🚶' };

const tiempoTranscurrido = (fechaIso) => {
  if (!fechaIso) return 'Desconocida';
  const ahora = new Date();
  const conexion = new Date(fechaIso);
  const diffHoras = Math.floor((ahora - conexion) / (1000 * 60 * 60));
  if (diffHoras < 1) return 'Hace instantes';
  if (diffHoras < 24) return `Hace ${diffHoras} hs`;
  return `Hace ${Math.floor(diffHoras / 24)} días`;
};

export default function ModuloClanes({ currentUser, db, onVolver }) {
  const [clanes, setClanes] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({});
  const [miClan, setMiClan] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState('miclan'); 

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreClan, setNombreClan] = useState('');
  const [descripcionClan, setDescripcionClan] = useState('');
  const [esPrivado, setEsPrivado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [asistenciaDada, setAsistenciaDada] = useState(false);

  const [editandoMeta, setEditandoMeta] = useState(false);
  const [inputMeta, setInputMeta] = useState('');

  const [mensajesClan, setMensajesChat] = useState([]);
  const [inputChat, setInputChat] = useState('');

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

  const clanesProcesados = clanes.map(clan => {
    let puntosTotales = 0;
    const miembrosDetalle = (clan.miembrosIds || []).map(uid => {
      const usr = usuariosMap[uid] || { id: uid, nombre: 'Usuario Desconocido', puntosTrivia: 0, corazones: 0, ultimaConexion: null };
      puntosTotales += (usr.puntosTrivia || 0);
      const esElLider = uid === clan.liderId;
      const rangoReal = esElLider ? 'Líder' : (clan.rangos?.[uid] || 'Seguidor');
      return { ...usr, rango: rangoReal };
    });

    miembrosDetalle.sort((a, b) => {
      if (ORDEN_RANGOS[a.rango] !== ORDEN_RANGOS[b.rango]) return ORDEN_RANGOS[a.rango] - ORDEN_RANGOS[b.rango];
      return (b.puntosTrivia || 0) - (a.puntosTrivia || 0);
    });

    return { ...clan, puntosTotales, miembrosDetalle };
  }).sort((a, b) => b.puntosTotales - a.puntosTotales);

  const miClanProcesado = clanesProcesados.find(c => c.id === miClan?.id);
  const posicionMiClan = clanesProcesados.findIndex(c => c.id === miClan?.id) + 1;
  const metaIndividual = miClanProcesado?.metaSemanal || 1000;
  
  const esLider = miClan?.liderId === currentUser?.uid;
  const miRango = miClanProcesado?.miembrosDetalle.find(m => m.id === currentUser.uid)?.rango || 'Seguidor';
  const puedeAdministrar = miRango === 'Líder' || miRango === 'Apóstol';

  const hoyStr = new Date().toISOString().split('T')[0];
  const yaDioAsistencia = currentUser?.ultimaAsistenciaClan === hoyStr || asistenciaDada;

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
        desafiosPendientes: [],
        metaSemanal: 1000,
        fechaCreacion: new Date().toISOString()
      };

      await addDoc(collection(db, 'cym_clanes'), nuevoClan);
      alert("🏰 ¡Felicitaciones! Has fundado tu Clan exitosamente.");
      setMostrarCrear(false);
      setNombreClan('');
      setDescripcionClan('');
    } catch (err) { alert("Error al crear el Clan."); } 
    finally { setProcesando(false); }
  };

  const handleUnirseClan = async (clan) => {
    if (miClan) { alert("Ya pertenecés a un Clan."); return; }
    if ((clan.miembrosIds?.length || 0) >= (clan.cupoMaximo || 20)) { alert("⚠️ Clan lleno."); return; }
    if (!window.confirm(`¿Seguro que querés unirte a ${clan.nombre}?`)) return;

    const clanRef = doc(db, 'cym_clanes', clan.id);
    try {
      if (clan.esPrivado) {
        await updateDoc(clanRef, {
          solicitudesPendientes: arrayUnion({ uid: currentUser.uid, nombre: currentUser.nombre || 'Hermano/a', foto: currentUser.photoURL })
        });
        alert("Solicitud enviada al Líder.");
      } else {
        await updateDoc(clanRef, {
          miembrosIds: arrayUnion(currentUser.uid),
          [`rangos.${currentUser.uid}`]: 'Seguidor'
        });
        alert(`¡Te uniste a ${clan.nombre}!`);
      }
    } catch (e) { alert("Error al procesar la solicitud."); }
  };

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
    try { await updateDoc(doc(db, 'cym_clanes', miClan.id), { mensajesChat: nuevosMensajes }); } catch (err) {}
  };

  const handleSalirClan = async () => {
    if (esLider && miClan.miembrosIds.length > 1) {
      alert("⚠️ Sos el Líder. No podés salir sin disolverlo. Expulsa a los demás primero.");
      return;
    }
    if (!window.confirm(`¿Abandonar el clan "${miClan.nombre}"?`)) return;

    try {
      if (miClan.miembrosIds.length === 1) {
        await deleteDoc(doc(db, 'cym_clanes', miClan.id));
        alert("Clan disuelto.");
      } else {
        const rangosActualizados = { ...miClan.rangos };
        delete rangosActualizados[currentUser.uid];
        await updateDoc(doc(db, 'cym_clanes', miClan.id), {
          miembrosIds: arrayRemove(currentUser.uid),
          rangos: rangosActualizados
        });
      }
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { tituloHonorifico: null });
      setMiClan(null);
    } catch (e) { alert("Error al salir."); }
  };

  const handleExpulsarMiembro = async (miembro) => {
    if (miembro.rango === 'Líder') return;
    if (miRango === 'Apóstol' && miembro.rango === 'Apóstol') { alert("Un Apóstol no puede expulsar a otro Apóstol."); return; }
    if (!window.confirm(`¿Expulsar a ${miembro.nombre} del clan?`)) return;

    try {
      const rangosActualizados = { ...miClan.rangos };
      delete rangosActualizados[miembro.id];
      await updateDoc(doc(db, 'cym_clanes', miClan.id), {
        miembrosIds: arrayRemove(miembro.id),
        rangos: rangosActualizados
      });
    } catch (e) { alert("Error al expulsar."); }
  };

  const procesarSolicitud = async (solicitud, aceptar) => {
    try {
      const nuevasSol = (miClan.solicitudesPendientes || []).filter(s => s.uid !== solicitud.uid);
      if (aceptar) {
        if ((miClan.miembrosIds.length || 0) >= (miClan.cupoMaximo || 20)) { alert("El clan está lleno."); return; }
        await updateDoc(doc(db, 'cym_clanes', miClan.id), {
          solicitudesPendientes: nuevasSol,
          miembrosIds: arrayUnion(solicitud.uid),
          [`rangos.${solicitud.uid}`]: 'Seguidor'
        });
      } else {
        await updateDoc(doc(db, 'cym_clanes', miClan.id), { solicitudesPendientes: nuevasSol });
      }
    } catch (e) { alert("Error al procesar solicitud."); }
  };

  const handleAsistencia = async () => {
    if (yaDioAsistencia) return;
    setAsistenciaDada(true);
    setProcesando(true);
    
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, { corazones: (currentUser.corazones || 0) + 2, ultimaAsistenciaClan: hoyStr });

      if (miClan.liderId && miClan.liderId !== currentUser.uid) {
        const liderRef = doc(db, 'cym_usuarios', miClan.liderId);
        const liderSnap = await getDoc(liderRef);
        if (liderSnap.exists()) {
          await updateDoc(liderRef, { corazones: (liderSnap.data().corazones || 0) + 1 });
        }
      }
    } catch (error) { 
      setAsistenciaDada(false); 
      alert("Error al registrar asistencia."); 
    } 
    finally { setProcesando(false); }
  };

  const handleCambiarRango = async (miembroId, nuevoRango) => {
    try { await updateDoc(doc(db, 'cym_clanes', miClan.id), { [`rangos.${miembroId}`]: nuevoRango }); } 
    catch (error) {}
  };

  const handleGuardarMeta = async () => {
    const val = parseInt(inputMeta, 10);
    if (isNaN(val) || val < 0) return;
    try {
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { metaSemanal: val });
      setEditandoMeta(false);
    } catch (e) { alert("Error al actualizar meta."); }
  };

  const handleAmpliarCupo = async () => {
    const diamantesActuales = currentUser?.diamantes || 0;
    if (diamantesActuales < 25) { alert("⚠️ Necesitás 25 Diamantes 💎."); return; }
    if (!window.confirm("¿Ampliar cupo en 10 lugares por 25 Diamantes?")) return;

    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { diamantes: diamantesActuales - 25 });
      const nuevoCupo = (miClan.cupoMaximo || 20) + 10;
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { cupoMaximo: nuevoCupo });
    } catch (e) {}
  };

  // BATALLAS: DESAFIAR
  const handleDesafiar = async (rival) => {
    if (!miClan) { alert("Debés pertenecer a un clan para desafiar."); return; }
    if (miClanProcesado?.desafioActivo) { alert("Tu clan ya tiene una batalla activa."); return; }

    const metaDuelo = prompt(`¿A cuántos puntos querés desafiar a ${rival.nombre}? (Ej: 5000)`);
    const valMeta = parseInt(metaDuelo, 10);
    if (isNaN(valMeta) || valMeta <= 0) return;

    try {
      await updateDoc(doc(db, 'cym_clanes', rival.id), {
        desafiosPendientes: arrayUnion({
          id: Date.now().toString(),
          retadorId: miClan.id,
          retadorNombre: miClan.nombre,
          meta: valMeta
        })
      });
      alert(`⚔️ ¡Has enviado un grito de guerra a ${rival.nombre} por ${valMeta} puntos!`);
    } catch (e) { alert("Error al enviar el desafío."); }
  };

  // BATALLAS: ACEPTAR (Guarda los puntos base para contar desde 0)
  const aceptarDesafio = async (desafio) => {
    try {
      const clanRetador = clanesProcesados.find(c => c.id === desafio.retadorId);
      const puntosBaseRetador = clanRetador ? clanRetador.puntosTotales : 0;
      const puntosBaseMios = miClanProcesado.puntosTotales;

      const objDesafio = {
        retadorId: desafio.retadorId, 
        retadorNombre: desafio.retadorNombre,
        rivalId: miClan.id, 
        rivalNombre: miClan.nombre, 
        meta: desafio.meta,
        baseRetador: puntosBaseRetador,
        baseRival: puntosBaseMios
      };

      await updateDoc(doc(db, 'cym_clanes', miClan.id), {
        desafiosPendientes: arrayRemove(desafio),
        desafioActivo: objDesafio
      });
      await updateDoc(doc(db, 'cym_clanes', desafio.retadorId), {
        desafioActivo: objDesafio
      });
    } catch(e) { alert("Error al aceptar."); }
  };

  const rechazarDesafio = async (desafio) => {
    try { await updateDoc(doc(db, 'cym_clanes', miClan.id), { desafiosPendientes: arrayRemove(desafio) }); } 
    catch(e) {}
  };

  const finalizarDuelo = async () => {
    if (!window.confirm("¿Seguro que querés terminar este duelo? Se borrará el historial de la batalla.")) return;
    try {
      const rivalId = miClanProcesado.desafioActivo.retadorId === miClan.id ? miClanProcesado.desafioActivo.rivalId : miClanProcesado.desafioActivo.retadorId;
      await updateDoc(doc(db, 'cym_clanes', miClan.id), { desafioActivo: null });
      if (rivalId) await updateDoc(doc(db, 'cym_clanes', rivalId), { desafioActivo: null });
    } catch(e) { alert("Error al finalizar duelo."); }
  };

  // Lógica de Renderizado del Marcador en Vivo
  let renderGuerra = null;
  if (miClanProcesado?.desafioActivo) {
    const guerra = miClanProcesado.desafioActivo;
    const esRetador = guerra.retadorId === miClan.id;
    
    // Calcular progreso de Mi Clan
    const miBase = esRetador ? guerra.baseRetador : guerra.baseRival;
    const misPuntosActuales = miClanProcesado.puntosTotales;
    const miProgresoGuerra = Math.max(0, misPuntosActuales - (miBase || 0));

    // Calcular progreso del Rival
    const rivalId = esRetador ? guerra.rivalId : guerra.retadorId;
    const clanRival = clanesProcesados.find(c => c.id === rivalId);
    const rivalBase = esRetador ? guerra.baseRival : guerra.baseRetador;
    const rivalPuntosActuales = clanRival ? clanRival.puntosTotales : 0;
    const rivalProgresoGuerra = Math.max(0, rivalPuntosActuales - (rivalBase || 0));

    const meta = guerra.meta;
    const ganeYo = miProgresoGuerra >= meta;
    const ganoRival = rivalProgresoGuerra >= meta;

    if (ganeYo || ganoRival) {
      renderGuerra = (
        <div className={`border p-6 rounded-3xl mb-4 shadow-2xl text-center ${ganeYo ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-red-950/80 border-red-500/50'}`}>
          <h3 className={`text-3xl font-black mb-2 uppercase ${ganeYo ? 'text-emerald-400' : 'text-red-500'}`}>
            {ganeYo ? '🏆 ¡VICTORIA GLORIOSA!' : '💀 DERROTA APLASTANTE'}
          </h3>
          <p className="text-white text-sm mb-4">
            {ganeYo ? `¡Tu clan destrozó a ${esRetador ? guerra.rivalNombre : guerra.retadorNombre}!` : `El clan ${esRetador ? guerra.rivalNombre : guerra.retadorNombre} alcanzó la meta primero.`}
          </p>
          <div className="flex justify-center gap-6 text-xl font-black mb-6">
            <div className={ganeYo ? 'text-emerald-400' : 'text-slate-400'}>{miClanProcesado.nombre}: {miProgresoGuerra}</div>
            <div className={ganoRival ? 'text-red-400' : 'text-slate-400'}>{esRetador ? guerra.rivalNombre : guerra.retadorNombre}: {rivalProgresoGuerra}</div>
          </div>
          {esLider && (
            <button onClick={finalizarDuelo} className="bg-white text-black font-black uppercase px-6 py-3 rounded-xl hover:scale-105">
              Cerrar y Limpiar Marcador
            </button>
          )}
        </div>
      );
    } else {
      renderGuerra = (
        <div className="bg-gradient-to-r from-red-950 to-black border border-red-500/50 p-5 rounded-3xl mb-4 shadow-xl">
          <h4 className="font-black text-red-500 text-center mb-1 flex justify-center items-center gap-2"><Swords size={20}/> ⚔️ GUERRA DE CLANES ACTIVA ⚔️</h4>
          <p className="text-center text-xs text-slate-300 mb-5 uppercase tracking-widest font-bold">Meta a alcanzar jugando Trivia: {meta} Puntos</p>
          
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <p className="font-black text-amber-400 text-xs sm:text-sm truncate px-1">{miClanProcesado.nombre}</p>
              <p className="text-3xl font-black text-white mt-1">{miProgresoGuerra}</p>
            </div>
            <div className="px-2 sm:px-4 font-black text-slate-600 text-2xl">VS</div>
            <div className="flex-1">
              <p className="font-black text-red-400 text-xs sm:text-sm truncate px-1">{esRetador ? guerra.rivalNombre : guerra.retadorNombre}</p>
              <p className="text-3xl font-black text-white mt-1">{rivalProgresoGuerra}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-5 overflow-hidden flex">
             <div className="bg-amber-500 h-2" style={{width: `${(miProgresoGuerra / meta) * 100}%`}}></div>
          </div>
          {esLider && (
            <button onClick={finalizarDuelo} className="mt-5 w-full bg-white/5 border border-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-white/10 transition-colors">
              Rendirse / Cancelar
            </button>
          )}
        </div>
      );
    }
  }


  return (
    <div className="relative min-h-[80vh] w-full flex flex-col justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 text-white shadow-2xl overflow-hidden">
      
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
          <div className="space-y-4 w-full max-w-2xl mx-auto">
            
            {/* NOTIFICACIÓN DE DESAFÍOS RECIBIDOS */}
            {miClanProcesado.desafiosPendientes?.length > 0 && !miClanProcesado.desafioActivo && (
              <div className="space-y-2 mb-4">
                {miClanProcesado.desafiosPendientes.map(desafio => (
                  <div key={desafio.id} className="bg-red-950/80 border border-red-500/50 p-4 rounded-3xl flex justify-between items-center shadow-xl">
                    <div>
                      <h4 className="font-black text-red-500 text-sm uppercase flex items-center gap-1.5"><Flame size={16}/> ¡DESAFÍO RECIBIDO!</h4>
                      <p className="text-xs text-white mt-1">El clan <span className="font-bold text-amber-400">{desafio.retadorNombre}</span> los retó a sumar <span className="font-bold text-amber-400">{desafio.meta}</span> puntos.</p>
                    </div>
                    {esLider && (
                      <div className="flex gap-2">
                        <button onClick={() => aceptarDesafio(desafio)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-md"><Check size={16}/></button>
                        <button onClick={() => rechazarDesafio(desafio)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-md"><X size={16}/></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MARCADOR DE GUERRA */}
            {renderGuerra}
            
            <div className="bg-black/80 border border-amber-500/40 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={100} color="#f59e0b" /></div>
              <div className="relative z-10">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/30">
                  {ICONOS_RANGO[miRango]} {miRango} | Ranking: #{posicionMiClan}
                </span>
                <h2 className="text-3xl font-black text-white mt-2 mb-1">{miClanProcesado.nombre}</h2>
                <p className="text-slate-400 text-xs max-w-sm">{miClanProcesado.descripcion || "Sin descripción."}</p>
              </div>
              <div className="relative z-10 bg-black/60 border border-amber-500/30 p-3 rounded-2xl text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest mb-1">Puntos Globales</span>
                <span className="text-3xl font-black text-amber-400">{miClanProcesado.puntosTotales}</span>
              </div>
            </div>

            {/* Meta Individual */}
            <div className="bg-black/40 border border-white/10 p-5 rounded-3xl flex justify-between items-center">
              <div>
                <h4 className="text-white font-black text-sm flex items-center gap-2"><Target size={16} className="text-amber-400"/> Meta Individual Evaluativa</h4>
                <p className="text-xs text-slate-400">Puntos mínimos exigidos por el Líder.</p>
              </div>
              
              {esLider ? (
                editandoMeta ? (
                  <div className="flex gap-2 items-center">
                    <input type="number" value={inputMeta} onChange={e => setInputMeta(e.target.value)} placeholder="Pts..." className="w-20 bg-black border border-amber-500/50 rounded-lg px-2 py-1 text-white outline-none text-xs text-center" />
                    <button onClick={handleGuardarMeta} className="bg-emerald-600 p-1.5 rounded-lg text-white"><Check size={14}/></button>
                    <button onClick={() => setEditandoMeta(false)} className="bg-red-600 p-1.5 rounded-lg text-white"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-amber-400">{metaIndividual}</span>
                    <button onClick={() => {setInputMeta(metaIndividual); setEditandoMeta(true);}} className="text-slate-400 hover:text-white"><Edit2 size={14}/></button>
                  </div>
                )
              ) : (
                <span className="text-lg font-black text-amber-400">{metaIndividual}</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/60 border border-emerald-500/30 p-5 rounded-3xl">
              <div>
                <h4 className="text-emerald-400 font-black uppercase text-sm">Recompensa Diaria</h4>
                <p className="text-slate-400 text-xs">Marcá asistencia para ganar corazones.</p>
              </div>
              <button 
                onClick={handleAsistencia} disabled={yaDioAsistencia || procesando}
                className={`font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform w-full sm:w-auto ${yaDioAsistencia ? 'bg-emerald-900/40 text-emerald-500 border border-emerald-500/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'}`}
              >
                {yaDioAsistencia ? <><CheckCircle size={18} /> Asistencia Lista</> : <><Heart size={18} /> Dar Asistencia (+2 ❤️)</>}
              </button>
            </div>

            {puedeAdministrar && miClanProcesado.solicitudesPendientes?.length > 0 && (
              <div className="bg-blue-950/40 border border-blue-500/40 p-4 rounded-3xl">
                <h4 className="font-black text-blue-400 text-xs uppercase mb-3 flex items-center gap-2"><UserCheck size={14}/> Solicitudes de Ingreso ({miClanProcesado.solicitudesPendientes.length})</h4>
                <div className="space-y-2">
                  {miClanProcesado.solicitudesPendientes.map((sol) => (
                    <div key={sol.uid} className="flex items-center justify-between bg-black/50 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <img src={sol.foto || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className="w-8 h-8 rounded-full" alt="foto" />
                        <span className="text-sm font-bold">{sol.nombre}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => procesarSolicitud(sol, true)} className="bg-emerald-600 p-1.5 rounded-lg text-white hover:bg-emerald-500"><CheckCircle size={16}/></button>
                        <button onClick={() => procesarSolicitud(sol, false)} className="bg-red-600 p-1.5 rounded-lg text-white hover:bg-red-500"><X size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-black/60 border border-white/10 rounded-3xl overflow-hidden mt-4">
              <div className="p-4 bg-black/40 flex justify-between items-center border-b border-white/10">
                <h4 className="font-black text-white uppercase text-sm flex items-center gap-2"><Users size={18} className="text-amber-400"/> Jerarquía del Clan</h4>
                <span className="text-xs font-bold text-slate-400">{miClanProcesado.miembrosDetalle.length} / {miClanProcesado.cupoMaximo}</span>
              </div>
              <div className="divide-y divide-white/5">
                {miClanProcesado.miembrosDetalle.map(miembro => {
                  const esYo = miembro.id === currentUser.uid;
                  const puntosAportados = miembro.puntosTrivia || 0;
                  const alcanzoMeta = puntosAportados >= metaIndividual;
                  const colorEstatus = alcanzoMeta ? 'text-emerald-400' : 'text-red-500';

                  return (
                    <div key={miembro.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${esYo ? 'bg-amber-900/20' : 'hover:bg-white/5'}`}>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative">
                          <span className="absolute -top-2 -left-2 text-lg z-10 bg-black rounded-full shadow-md">{ICONOS_RANGO[miembro.rango]}</span>
                          <img src={miembro.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className="w-10 h-10 rounded-full border border-amber-500 object-cover" alt="Perfil" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm leading-tight ${colorEstatus}`}>
                            {esYo ? 'Tú' : miembro.nombre} {miembro.rango === 'Líder' && <Crown size={12} className="inline text-[#ffd700] ml-1 mb-1"/>}
                          </p>
                          
                          {esLider && !esYo && miembro.rango !== 'Líder' ? (
                            <div className="mt-1 relative inline-block">
                              <select value={miembro.rango} onChange={(e) => handleCambiarRango(miembro.id, e.target.value)} className="appearance-none bg-amber-900/40 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase rounded py-0.5 pl-2 pr-6 outline-none cursor-pointer">
                                {RANGOS.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-amber-300 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-amber-400 block">{miembro.rango}</span>
                          )}

                          {puedeAdministrar && !esYo && (
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock size={10}/> {tiempoTranscurrido(miembro.ultimaConexion)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-0 border-white/5 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 font-bold block sm:hidden">Puntos:</span>
                          <p className={`font-black text-lg ${colorEstatus}`}>{puntosAportados}</p>
                          <p className="text-[9px] uppercase text-slate-500 font-bold hidden sm:block">Puntos Aportados</p>
                        </div>
                        {puedeAdministrar && !esYo && miembro.rango !== 'Líder' && (
                          <button onClick={() => handleExpulsarMiembro(miembro)} title="Expulsar Miembro" className="p-2 bg-red-900/40 hover:bg-red-600 border border-red-500/30 rounded-xl text-red-400 hover:text-white transition-colors">
                            <UserX size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

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

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <button onClick={handleSalirClan} className="flex-1 bg-red-600/10 border border-red-500/20 text-red-500 font-bold py-3 rounded-2xl text-xs uppercase flex justify-center items-center gap-2 hover:bg-red-600/30">
                <LogOut size={16} /> Abandonar Clan
              </button>
            </div>

          </div>
        ) : (

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

        <div className="space-y-4 w-full max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/30 to-black border border-red-500/30 p-6 rounded-3xl mb-6 text-center shadow-xl">
            <Swords size={32} className="mx-auto text-red-500 mb-3" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Batalla Global de Clanes</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">Acá se suma el puntaje total de todos los miembros. Llevá a tu clan a la cima. ¡Podés desafiar a tus rivales para demostrar quién sabe más!</p>
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
                  <div key={c.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border gap-4 ${esMio ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#141414] border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`font-black w-8 text-center ${colorPos}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg leading-tight">{c.nombre} {esMio && <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-black ml-2 align-middle">Tu Clan</span>}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1"><Users size={12} className="inline mr-1"/> {c.miembrosIds?.length || 0} Guerreros</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-2xl text-[#ffd700]">{c.puntosTotales}</p>
                        <p className="text-[9px] uppercase text-slate-500 font-bold">Pts Totales</p>
                      </div>
                      
                      {!esMio && (
                        <button 
                          onClick={() => handleDesafiar(c)}
                          className="bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-black px-4 py-2 rounded-xl text-[10px] uppercase flex items-center gap-1.5 transition-colors"
                        >
                          <Swords size={14}/> Desafiar
                        </button>
                      )}
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