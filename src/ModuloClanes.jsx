import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, doc, updateDoc, onSnapshot, query, arrayUnion 
} from 'firebase/firestore';
import { 
  Shield, Crown, Lock, Unlock, Send, ChevronLeft, PlusCircle, UserCheck, MessageSquare
} from 'lucide-react';

export default function ModuloClanes({ currentUser, db, onVolver }) {
  const [clanes, setClanes] = useState([]);
  const [miClan, setMiClan] = useState(null);
  const [cargando, setCargando] = useState(true); // Arranca cargando

  // ESTADOS FORMULARIO CREAR CLAN
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreClan, setNombreClan] = useState('');
  const [descripcionClan, setDescripcionClan] = useState('');
  const [esPrivado, setEsPrivado] = useState(false);
  const [creando, setCreando] = useState(false);

  // CHAT INTERNO
  const [mensajesClan, setMensajesChat] = useState([]);
  const [inputChat, setInputChat] = useState('');

  // 1. ESCUCHAR TODOS LOS CLANES Y BUSCAR EL CLAN DEL USUARIO
  useEffect(() => {
    const q = query(collection(db, 'cym_clanes'));
    
    // Escuchador de Firebase
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      let clanUsuario = null;

      snapshot.forEach((d) => {
        const c = { id: d.id, ...d.data() };
        lista.push(c);

        // Verificar si el usuario es miembro de este clan
        if (c.miembrosIds && c.miembrosIds.includes(currentUser?.uid)) {
          clanUsuario = c;
        }
      });

      setClanes(lista);
      setMiClan(clanUsuario);
      if (clanUsuario) setMensajesChat(clanUsuario.mensajesChat || []);
      
      // APAGAR CARGA CUANDO RESPONDE
      setCargando(false);
      
    }, (error) => {
      console.error("Error consultando clanes en Firestore:", error);
      // APAGAR CARGA INCLUSO SI HAY ERROR DE PERMISOS
      setCargando(false);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  // 2. CREAR UN NUEVO CLAN (COSTO: 50 DIAMANTES 💎)
  const handleCrearClan = async (e) => {
    e.preventDefault();
    if (!nombreClan.trim()) {
      alert("Ingresá un nombre para tu Clan.");
      return;
    }

    const diamantesActuales = currentUser?.diamantes || 0;
    if (diamantesActuales < 50) {
      alert("⚠️ Necesitás 50 Diamantes 💎 para fundar un Clan ($10.000 ARS). Podes adquirirlos en la Tienda.");
      return;
    }

    setCreando(true);
    try {
      // Descontar 50 diamantes al usuario
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
        diamantes: diamantesActuales - 50,
        tituloHonorifico: `👑 LÍDER DE CLAN`
      });

      // Crear el clan en Firestore
      const nuevoClan = {
        nombre: nombreClan.trim(),
        descripcion: descripcionClan.trim(),
        liderId: currentUser.uid,
        liderNombre: currentUser.nombre || 'Líder',
        esPrivado: esPrivado,
        cupoMaximo: 20,
        sublideresIds: [],
        colaboradoresIds: [],
        miembrosIds: [currentUser.uid],
        solicitudesPendientes: [],
        mensajesChat: [],
        puntosSemana: 0,
        fechaCreacion: new Date().toISOString()
      };

      await addDoc(collection(db, 'cym_clanes'), nuevoClan);

      alert("🏰 ¡Felicitaciones! Has fundado tu Clan exitosamente.");
      setMostrarCrear(false);
      setNombreClan('');
      setDescripcionClan('');
    } catch (err) {
      console.error(err);
      alert("Error al intentar crear el Clan. Revisá los permisos de la base de datos.");
    } finally {
      setCreando(false);
    }
  };

  // 3. UNIRSE A UN CLAN ABIERTO O SOLICITAR INGRESO
  const handleUnirseClan = async (clan) => {
    if (miClan) {
      alert("Ya pertenecés a un Clan. Debes salir de tu clan actual para unirte a otro.");
      return;
    }

    if ((clan.miembrosIds?.length || 0) >= (clan.cupoMaximo || 20)) {
      alert("⚠️ Este Clan alcanzó su límite máximo de 20 miembros.");
      return;
    }

    const clanRef = doc(db, 'cym_clanes', clan.id);

    try {
      if (clan.esPrivado) {
        await updateDoc(clanRef, {
          solicitudesPendientes: arrayUnion({
            uid: currentUser.uid,
            nombre: currentUser.nombre || 'Hermano/a',
            foto: currentUser.photoURL
          })
        });
        alert("Solicitud enviada al Líder del Clan.");
      } else {
        await updateDoc(clanRef, {
          miembrosIds: arrayUnion(currentUser.uid)
        });
        alert(`¡Te uniste a ${clan.nombre}!`);
      }
    } catch (e) {
      alert("Error al procesar la solicitud.");
    }
  };

  // 4. CHAT PRIVADO DEL CLAN
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
      await updateDoc(doc(db, 'cym_clanes', miClan.id), {
        mensajesChat: nuevosMensajes
      });
    } catch (err) {}
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 font-black text-xs uppercase tracking-widest">
          <Shield size={16} /> Clanes y Batallas de Grupos
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-20 text-amber-400 my-auto">
          <Shield size={48} className="animate-bounce mx-auto mb-2" />
          <p className="font-bold text-xs uppercase tracking-widest">Conectando...</p>
        </div>
      ) : miClan ? (
        
        /* VISTA: MI CLAN ACTUAL (CHAT PRIVADO + RANGOS) */
        <div className="space-y-6 w-full max-w-2xl mx-auto">
          <div className="bg-black/80 border border-amber-500/40 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/30">
                {miClan.liderId === currentUser.uid ? '👑 Eres el Líder' : '🛡️ Integrante'}
              </span>
              <h2 className="text-3xl font-black text-white mt-1">{miClan.nombre}</h2>
              <p className="text-slate-400 text-xs mt-0.5">{miClan.descripcion || "Sin descripción."}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-bold">Miembros</span>
              <span className="text-lg font-black text-amber-400">{miClan.miembrosIds?.length || 1} / {miClan.cupoMaximo || 20}</span>
            </div>
          </div>

          {/* CHAT PRIVADO DEL CLAN */}
          <div className="bg-black/70 border border-amber-500/20 p-4 rounded-3xl space-y-3 flex flex-col h-[350px]">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold text-amber-400">
              <MessageSquare size={16} /> Chat Privado del Clan
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 text-xs">
              {mensajesClan.length === 0 ? (
                <p className="text-center text-slate-500 py-10">Sé el primero en enviar un mensaje a tu grupo...</p>
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
              <input
                type="text"
                placeholder="Escribir mensaje al Clan..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
              <button type="submit" className="p-2.5 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      ) : (

        /* VISTA: EXPLORADOR DE CLANES Y BOTÓN FUNDAR */
        <div className="space-y-6 w-full max-w-3xl mx-auto">
          <div className="bg-black/80 border border-amber-500/40 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md shadow-2xl">
            <div>
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <Shield size={28} /> Salón de Clanes
              </h2>
              <p className="text-slate-400 text-xs">Unite a un grupo o fundá el tuyo propio para competir en Batallas 3v3.</p>
            </div>
            
            <button
              onClick={() => setMostrarCrear(!mostrarCrear)}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <PlusCircle size={18} /> {mostrarCrear ? "Cerrar Panel" : "Fundar Clan (50 💎)"}
            </button>
          </div>

          {/* FORMULARIO CREAR CLAN */}
          {mostrarCrear && (
            <form onSubmit={handleCrearClan} className="bg-amber-950/30 border border-amber-500/50 p-6 rounded-3xl space-y-4 backdrop-blur-md">
              <h3 className="text-amber-300 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Crown size={18} /> Requisitos de Fundación (50 Diamantes 💎)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Clan *</label>
                  <input
                    type="text"
                    placeholder="Ej: Guerreros de Fe"
                    value={nombreClan}
                    onChange={(e) => setNombreClan(e.target.value)}
                    className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Privacidad</label>
                  <select
                    value={esPrivado ? "privado" : "publico"}
                    onChange={(e) => setEsPrivado(e.target.value === "privado")}
                    className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none"
                  >
                    <option value="publico">🔓 Abierto (Ingreso directo)</option>
                    <option value="privado">🔒 Cerrado (Aprobación del Líder)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descripción / Lema del Clan</label>
                <textarea
                  rows={2}
                  placeholder="Escribí la visión o lema de tu grupo..."
                  value={descripcionClan}
                  onChange={(e) => setDescripcionClan(e.target.value)}
                  className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creando}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
              >
                {creando ? "Fundando..." : "Fundar Clan Oficial"}
              </button>
            </form>
          )}

          {/* LISTA DE CLANES DISPONIBLES */}
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
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.descripcion || "Sin descripción."}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
                    <span className="text-slate-300 font-bold">Líder: <span className="text-amber-400">{c.liderNombre}</span></span>
                    <span className="text-slate-400">{c.miembrosIds?.length || 1} / {c.cupoMaximo || 20} Miembros</span>
                  </div>

                  <button
                    onClick={() => handleUnirseClan(c)}
                    className="w-full bg-white/10 hover:bg-white/20 text-amber-300 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1 border border-amber-500/30"
                  >
                    <UserCheck size={14} /> {c.esPrivado ? "Solicitar Ingreso" : "Unirme al Clan"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}