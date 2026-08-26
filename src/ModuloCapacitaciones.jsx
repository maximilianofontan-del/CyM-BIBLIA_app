import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, Clock, PlusCircle, CheckCircle, 
  ExternalLink, MessageSquare, Loader2, ArrowLeft, ShieldCheck, DollarSign
} from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function ModuloCapacitaciones({ currentUser, db, onVolver }) {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormularioOwner, setMostrarFormularioOwner] = useState(false);

  // Estados del Formulario Owner
  const [nombreClase, setNombreClase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState('');
  const [horario, setHorario] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [linkMercadoPago, setLinkMercadoPago] = useState('');
  const [linkGrupoWhatsApp, setLinkGrupoWhatsApp] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estado para capturar WhatsApp del alumno post-pago
  const [cursoSeleccionadoPago, setCursoSeleccionadoPago] = useState(null);
  const [telefonoWhatsAppInput, setTelefonoWhatsAppInput] = useState('');

  const isOwner = currentUser?.role === 'OWNER';

  const cargarCursos = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'cym_capacitaciones'));
      const docs = [];
      querySnapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setCursos(docs);
    } catch (e) {
      console.error("Error cargando cursos:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (db) cargarCursos();
  }, [db]);

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    if (!nombreClase || !valorCuota || !linkMercadoPago || !linkGrupoWhatsApp) {
      alert("Por favor completa los campos obligatorios (Nombre, Valor, Link de Pago y Grupo de WhatsApp).");
      return;
    }

    setGuardando(true);
    try {
      await addDoc(collection(db, 'cym_capacitaciones'), {
        nombreClase,
        descripcion,
        dias,
        horario,
        valorCuota,
        linkMercadoPago,
        linkGrupoWhatsApp,
        fechaCreacion: new Date().toISOString()
      });
      alert("¡Capacitación publicada con éxito!");
      setNombreClase('');
      setDescripcion('');
      setDias('');
      setHorario('');
      setValorCuota('');
      setLinkMercadoPago('');
      setLinkGrupoWhatsApp('');
      setMostrarFormularioOwner(false);
      cargarCursos();
    } catch (err) {
      alert("Error al publicar la capacitación: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCompletarInscripcionWhatsApp = async (cursoId, linkWhatsApp) => {
    if (!telefonoWhatsAppInput.trim()) {
      alert("Ingresá tu número de WhatsApp con código de área para finalizar.");
      return;
    }

    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, {
        cursosInscriptos: arrayUnion({
          cursoId,
          telefonoWhatsApp: telefonoWhatsAppInput,
          fechaInscripcion: new Date().toISOString()
        })
      });

      alert("¡Inscripción registrada correctamente! Te redirigiremos al grupo exclusivo de estudio.");
      window.open(linkWhatsApp, '_blank');
      setCursoSeleccionadoPago(null);
      setTelefonoWhatsAppInput('');
    } catch (e) {
      alert("Error al registrar datos: " + e.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* HEADER DE SECCIÓN */}
      <div className="bg-black/80 border border-amber-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <button onClick={onVolver} className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <GraduationCap className="text-amber-400" size={32} /> Academia CyM & Capacitaciones
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Clases virtuales sincrónicas. Inscripción por módulos o cuotas mensuales independientes.
          </p>
        </div>

        {isOwner && (
          <button 
            onClick={() => setMostrarFormularioOwner(!mostrarFormularioOwner)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 shadow-xl w-full md:w-auto justify-center"
          >
            <PlusCircle size={18} /> {mostrarFormularioOwner ? "Cerrar Panel Owner" : "Postear Nueva Clase"}
          </button>
        )}
      </div>

      {/* FORMULARIO PUBLICACIÓN DE CURSOS (SOLO OWNER) */}
      {isOwner && mostrarFormularioOwner && (
        <form onSubmit={handleCrearCurso} className="bg-amber-950/30 border border-amber-500/50 p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-amber-500/30 pb-3 mb-2">
            <ShieldCheck className="text-amber-400" size={22} />
            <h3 className="text-amber-300 font-black text-sm uppercase tracking-wider">Panel Owner: Alta de Capacitaciones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Clase / Módulo *</label>
              <input 
                type="text" 
                placeholder="Ej: Escuela Profética - Módulo 1" 
                value={nombreClase} 
                onChange={(e) => setNombreClase(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Valor de la Cuota / Inversión *</label>
              <input 
                type="text" 
                placeholder="Ej: $15.000 / mes" 
                value={valorCuota} 
                onChange={(e) => setValorCuota(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Días de Cursada Sincrónica</label>
              <input 
                type="text" 
                placeholder="Ej: Martes y Jueves" 
                value={dias} 
                onChange={(e) => setDias(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Horario Sincrónico</label>
              <input 
                type="text" 
                placeholder="Ej: 20:00 a 21:30 hs (Arg)" 
                value={horario} 
                onChange={(e) => setHorario(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Link MercadoPago (Cuota) *</label>
              <input 
                type="text" 
                placeholder="https://mpago.la/..." 
                value={linkMercadoPago} 
                onChange={(e) => setLinkMercadoPago(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Link de Grupo de WhatsApp de la Clase *</label>
              <input 
                type="text" 
                placeholder="https://chat.whatsapp.com/..." 
                value={linkGrupoWhatsApp} 
                onChange={(e) => setLinkGrupoWhatsApp(e.target.value)} 
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Descripción y Temario del Curso</label>
            <textarea 
              rows={3}
              placeholder="Detallá de qué trata el curso, requisitos o temas a dictar..." 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
            />
          </div>

          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-xl"
          >
            {guardando ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            {guardando ? "Publicando en Academia..." : "Publicar Capacitacion"}
          </button>
        </form>
      )}

      {/* CATÁLOGO DE CLASES DISPONIBLES */}
      {cargando ? (
        <div className="text-center py-16 text-amber-400">
          <Loader2 className="animate-spin mx-auto mb-3" size={36} />
          <p className="font-bold text-xs uppercase tracking-widest">Cargando Capacitaciones...</p>
        </div>
      ) : cursos.length === 0 ? (
        <div className="bg-black/60 border border-white/10 p-12 rounded-3xl text-center text-slate-400 space-y-3">
          <GraduationCap size={48} className="mx-auto opacity-30 text-amber-400" />
          <h3 className="text-lg font-bold text-white">No hay cursos o capacitaciones abiertas en este momento</h3>
          <p className="text-xs max-w-md mx-auto">Próximamente estaremos publicando nuevos módulos de Escuela Profética, Liderazgo y Discipulado Virtual.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursos.map((c) => (
            <div key={c.id} className="bg-black/80 border border-amber-500/30 hover:border-amber-500/60 p-6 rounded-3xl flex flex-col justify-between shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-500/30">
                      Sincrónico en Vivo
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">{c.nombreClase}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Cuota</span>
                    <span className="text-lg font-black text-amber-400">{c.valorCuota}</span>
                  </div>
                </div>

                {c.descripcion && <p className="text-slate-300 text-xs leading-relaxed">{c.descripcion}</p>}

                <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar size={14} className="text-amber-400" /> <span>{c.dias || "A coordinar"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={14} className="text-amber-400" /> <span>{c.horario || "A coordinar"}</span>
                  </div>
                </div>
              </div>

              {/* BARRAS Y BOTONES DE PAGO Y DESBLOQUEO */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                {cursoSeleccionadoPago?.id === c.id ? (
                  <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl space-y-3">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <CheckCircle size={16} /> ¡Genial! Luego de abonar, ingresá tu número de WhatsApp para sumarte al grupo oficial:
                    </p>
                    <input 
                      type="text" 
                      placeholder="Ej: +5491122334455" 
                      value={telefonoWhatsAppInput} 
                      onChange={(e) => setTelefonoWhatsAppInput(e.target.value)} 
                      className="w-full bg-black border border-amber-500/40 rounded-xl p-2.5 text-white text-xs outline-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCompletarInscripcionWhatsApp(c.id, c.linkGrupoWhatsApp)}
                        className="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <MessageSquare size={14} /> Entrar al Grupo de Estudio
                      </button>
                      <button 
                        onClick={() => setCursoSeleccionadoPago(null)} 
                        className="bg-white/10 text-slate-400 p-2.5 rounded-xl text-xs hover:bg-white/20"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        window.open(c.linkMercadoPago, '_blank');
                        setCursoSeleccionadoPago(c);
                      }}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.02] text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <DollarSign size={16} /> Abonar Cuota / Inscribirme
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}