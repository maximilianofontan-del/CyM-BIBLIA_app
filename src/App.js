import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Settings, Type, Sun, Sparkles, ArrowLeft, ChevronRight, ChevronLeft,
  Heart, MessageCircle, X, Send, FileText, Volume2, Square, Crown,
  Loader2, LogOut, LogIn, Gamepad2, Award, Zap, Users, Edit2, Share2, UserPlus,
  GraduationCap, Calendar, Clock, PlusCircle, CheckCircle, ShieldCheck, DollarSign,
  Upload, Download, Image as ImageIcon, Shield, Search, Lock, Trash2, Check,
  Swords, ShoppingCart, Trophy, Globe
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, 
  getDocs, arrayUnion, addDoc, onSnapshot, deleteDoc 
} from 'firebase/firestore';

import ModuloTrivia from './ModuloTrivia';
import ModuloClub from './ModuloClub';
import ModuloDuelo from './ModuloDuelo';
import ModuloClanes from './ModuloClanes';
import ModuloTienda from './ModuloTienda';
import JuegosModule from './JuegosModule';

import BibliaRVR from './data/RVR1960.json';
import BibliaNTV from './data/NTV.json';
import BibliaDHH from './data/DHH.json';
import BibliaLBLA from './data/LBLA.json';
import BibliaTLA from './data/TLA.json';

const firebaseConfig = {
  apiKey: "AIzaSyD2ya4X0gJZg9eaD7sYs7DOz43cu4Q83lQ",
  authDomain: "cym-biblia.firebaseapp.com",
  projectId: "cym-biblia",
  storageBucket: "cym-biblia.firebasestorage.app",
  messagingSenderId: "31778840496",
  appId: "1:31778840496:web:a0dda4c372b560298e0075"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const BIBLIA_VERSIONES = { RVR1960: BibliaRVR, NTV: BibliaNTV, DHH: BibliaDHH, LBLA: BibliaLBLA, TLA: BibliaTLA };

const LECTURAS_DIARIAS = [
  { libro: 'Salmos', capitulo: 1, devocional: { titulo: 'El Camino de la Bendición', reflexion: 'El Salmo 1 nos planta frente a una gran verdad: nuestras decisiones determinan nuestro destino.', oracion: 'Señor Jesús, ayúdame a deleitarme en tu Palabra cada día. Amén.' } }, 
  { libro: 'Proverbios', capitulo: 3, devocional: { titulo: 'Confianza de Todo Corazón', reflexion: 'Confiar en el Señor con "todo el corazón" implica rendir nuestra necesidad de tener siempre el control.', oracion: 'Padre Celestial, hoy rindo mi ansiedad y mi propio entendimiento. Amén.' } }, 
  { libro: 'Juan', capitulo: 1, devocional: { titulo: 'La Luz que Prevalece', reflexion: 'En el principio era el Verbo, la Palabra encarnada que trajo vida y luz a la humanidad.', oracion: 'Señor Jesús, gracias por venir a mi vida a traer claridad y salvación. Amén.' } }
];

const devocionalPorDefecto = { titulo: 'Creciendo en la Palabra', reflexion: 'Cada porción de las Escrituras contiene aliento y dirección para nuestra vida diaria.', oracion: 'Señor Jesús, abre mis ojos para ver las maravillas de tu Ley. Amén.' };

const LIBROS_MENU = [ { nombre: 'Génesis' }, { nombre: 'Éxodo' }, { nombre: 'Levítico' }, { nombre: 'Números' }, { nombre: 'Deuteronomio' }, { nombre: 'Josué' }, { nombre: 'Jueces' }, { nombre: 'Rut' }, { nombre: '1 Samuel' }, { nombre: '2 Samuel' }, { nombre: '1 Reyes' }, { nombre: '2 Reyes' }, { nombre: '1 Crónicas' }, { nombre: '2 Crónicas' }, { nombre: 'Esdras' }, { nombre: 'Nehemías' }, { nombre: 'Ester' }, { nombre: 'Job' }, { nombre: 'Salmos' }, { nombre: 'Proverbios' }, { nombre: 'Eclesiastés' }, { nombre: 'Cantares' }, { nombre: 'Isaías' }, { nombre: 'Jeremías' }, { nombre: 'Lamentaciones' }, { nombre: 'Ezequiel' }, { nombre: 'Daniel' }, { nombre: 'Oseas' }, { nombre: 'Joel' }, { nombre: 'Amós' }, { nombre: 'Abdías' }, { nombre: 'Jonás' }, { nombre: 'Miqueas' }, { nombre: 'Nahúm' }, { nombre: 'Habacuc' }, { nombre: 'Sofonías' }, { nombre: 'Hageo' }, { nombre: 'Zacarías' }, { nombre: 'Malaquías' }, { nombre: 'Mateo' }, { nombre: 'Marcos' }, { nombre: 'Lucas' }, { nombre: 'Juan' }, { nombre: 'Hechos' }, { nombre: 'Romanos' }, { nombre: '1 Corintios' }, { nombre: '2 Corintios' }, { nombre: 'Gálatas' }, { nombre: 'Efesios' }, { nombre: 'Filipenses' }, { nombre: 'Colosenses' }, { nombre: '1 Tesalonicenses' }, { nombre: '2 Tesalonicenses' }, { nombre: '1 Timoteo' }, { nombre: '2 Timoteo' }, { nombre: 'Tito' }, { nombre: 'Filemón' }, { nombre: 'Hebreos' }, { nombre: 'Santiago' }, { nombre: '1 Pedro' }, { nombre: '2 Pedro' }, { nombre: '1 Juan' }, { nombre: '2 Juan' }, { nombre: '3 Juan' }, { nombre: 'Judas' }, { nombre: 'Apocalipsis' } ];

const encontrarLibro = (biblia, nombreBuscado) => {
  if (!biblia || !biblia.books) return null;
  const limpiarTexto = (texto) => texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim() : "";
  const buscado = limpiarTexto(nombreBuscado);
  return biblia.books.find(b => {
    const nombreJson = limpiarTexto(b.name);
    const usfmJson = b.book_usfm ? b.book_usfm.toUpperCase() : "";
    if (nombreJson === buscado || nombreJson.replace("san", "") === buscado || nombreJson.includes(buscado)) return true;
    if (buscado === "juan" && (usfmJson === "JHN" || usfmJson === "JOH")) return true;
    if (buscado === "mateo" && usfmJson === "MAT") return true;
    return false;
  });
};

const EstrellasFondo = () => (<div className="fixed inset-0 z-0 pointer-events-none" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center'}}><div className="absolute inset-0 bg-black/85"></div></div>);

const themeStyles = { claro: 'bg-slate-50 text-slate-900 border-slate-200', cym: 'bg-[#000000] text-slate-200 border-[#cca300]', sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#d4b886]' };
const navStyles = { claro: 'bg-white/90 border-slate-200 text-slate-800', cym: 'bg-black/70 border-[#cca300]/30 text-[#fcd34d]', sepia: 'bg-[#f4e4c3]/90 border-[#d4b886] text-[#5f4b32]' };

export const obtenerEstiloSuscripcion = (suscripcion, role) => {
  const sub = suscripcion ? String(suscripcion).toUpperCase() : 'GRATIS';
  if (role === 'OWNER') return { colorAro: 'border-[#00a86b]', colorBadge: 'bg-[#00a86b] text-white', texto: '👑 OWNER / DIAMANTE' };
  if (sub === 'BRONCE') return { colorAro: 'border-[#cd7f32]', colorBadge: 'bg-[#cd7f32] text-white', texto: 'SOCIO BRONCE' };
  if (sub === 'PLATA') return { colorAro: 'border-[#c0c0c0]', colorBadge: 'bg-[#c0c0c0] text-black', texto: 'SOCIO PLATA' };
  if (sub === 'ORO') return { colorAro: 'border-[#ffd700]', colorBadge: 'bg-[#ffd700] text-black', texto: 'SOCIO ORO' };
  if (sub === 'DIAMANTE') return { colorAro: 'border-[#00a86b]', colorBadge: 'bg-[#00a86b] text-white', texto: 'SOCIO DIAMANTE' };
  return { colorAro: 'border-[#3b82f6]', colorBadge: 'bg-[#3b82f6] text-white', texto: 'MEMBRESÍA GRATIS' };
};

function ModuloAdmin() {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardandoId, setGuardandoId] = useState(null);

  const NIVELES_MEMBRESIA = ['GRATIS', 'BRONCE', 'PLATA', 'ORO', 'DIAMANTE'];

  useEffect(() => {
    const q = query(collection(db, 'cym_usuarios'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      setListaUsuarios(docs);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const esOnline = (ultimaConexion) => {
    if (!ultimaConexion) return false;
    const ahora = new Date();
    const conexion = new Date(ultimaConexion);
    return (ahora - conexion) / (1000 * 60) < 5;
  };

  const cambiarSuscripcion = async (uid, nuevaSuscripcion) => {
    setGuardandoId(uid);
    try {
      const userRef = doc(db, 'cym_usuarios', uid);
      await updateDoc(userRef, {
        suscripcion: nuevaSuscripcion,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (e) {
      alert("Error al cambiar membresía.");
    } finally {
      setGuardandoId(null);
    }
  };

  const cambiarCorazones = async (uid, cantidadActual, delta) => {
    setGuardandoId(uid);
    const nuevoValor = Math.max(0, (cantidadActual || 0) + delta);
    try {
      await updateDoc(doc(db, 'cym_usuarios', uid), { corazones: nuevoValor });
    } catch (e) {
      alert("Error al cambiar corazones.");
    } finally {
      setGuardandoId(null);
    }
  };

  const cambiarDiamantes = async (uid, cantidadActual, delta) => {
    setGuardandoId(uid);
    const nuevoValor = Math.max(0, (cantidadActual || 0) + delta);
    try {
      await updateDoc(doc(db, 'cym_usuarios', uid), { diamantes: nuevoValor });
    } catch (e) {
      alert("Error al modificar diamantes.");
    } finally {
      setGuardandoId(null);
    }
  };

  const cambiarPuntosTrivia = async (uid, puntosActuales, delta) => {
    setGuardandoId(uid);
    const nuevoValor = Math.max(0, (puntosActuales || 0) + delta);
    try {
      await updateDoc(doc(db, 'cym_usuarios', uid), { puntosTrivia: nuevoValor });
    } catch (e) {
      alert("Error al modificar puntos.");
    } finally {
      setGuardandoId(null);
    }
  };

  const usuariosFiltrados = listaUsuarios
    .filter(u => 
      (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      const aOnline = esOnline(a.ultimaConexion);
      const bOnline = esOnline(b.ultimaConexion);
      
      // Los online van arriba
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      
      // Si ambos están igual (los dos online o los dos offline), ordena por el más reciente
      const fechaA = a.ultimaConexion ? new Date(a.ultimaConexion).getTime() : 0;
      const fechaB = b.ultimaConexion ? new Date(b.ultimaConexion).getTime() : 0;
      return fechaB - fechaA;
    });

  return (
    <div className="space-y-6">
      <div className="bg-black/80 border border-emerald-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <Shield size={28} /> Panel de Control de Administrador
            </h2>
            <p className="text-slate-400 text-xs">Gestión en tiempo real de membresías, corazones, diamantes, puntos y pantalla activa.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por usuario o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/70 border border-emerald-500/30 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-slate-400">Total Usuarios</p>
            <p className="text-2xl font-black text-white mt-1">{listaUsuarios.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-emerald-400">En Línea 🟢</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {listaUsuarios.filter((u) => esOnline(u.ultimaConexion)).length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-amber-400">Membresías VIP ⭐</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {listaUsuarios.filter((u) => u.suscripcion && u.suscripcion !== 'GRATIS').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-cyan-400">Cursos / Capacitaciones</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">
              {listaUsuarios.filter((u) => u.cursosInscriptos && u.cursosInscriptos.length > 0).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-black/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md overflow-x-auto shadow-2xl">
        <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
          <Users size={20} className="text-emerald-400" /> Lista de Usuarios y Ajustes Directos
        </h3>
        {cargando ? (
          <div className="text-center py-8 text-amber-400"><Loader2 className="animate-spin mx-auto" size={32} /></div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                <th className="p-3">Estado / Ubicación</th>
                <th className="p-3">Usuario / Email</th>
                <th className="p-3">Membresía</th>
                <th className="p-3 text-cyan-400">Diamantes 💎</th>
                <th className="p-3 text-red-400">Corazones</th>
                <th className="p-3 text-blue-400">Puntos Trivia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {usuariosFiltrados.map((u) => {
                const online = esOnline(u.ultimaConexion);
                return (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold">
                      {online ? <span className="text-emerald-400 font-black">🟢 Online</span> : <span className="text-slate-500">🔴 Off</span>}
                      <span className="block text-[10px] font-normal text-amber-400 uppercase mt-1 mb-1">
                        📍 {u.ubicacionActual || 'Home'}
                      </span>
                      {u.ultimaConexion ? (
                        <span className="block text-[10px] font-normal text-slate-400" style={{ textTransform: 'none' }}>
                          ⏱️ {new Date(u.ultimaConexion).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                      ) : (
                        <span className="block text-[10px] font-normal text-slate-500">Sin registro</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {u.nombre || u.email} 
                      <br/>
                      <span className="text-xs text-slate-400 font-normal">{u.email}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={(u.suscripcion || 'GRATIS').toUpperCase()}
                        onChange={(e) => cambiarSuscripcion(u.id, e.target.value)}
                        disabled={guardandoId === u.id}
                        className="bg-black/80 border border-amber-500/50 text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl outline-none"
                      >
                        {NIVELES_MEMBRESIA.map(n => (
                          <option key={n} value={n} className="bg-slate-900 text-white">{n}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 bg-black/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl w-fit">
                        <span className="text-cyan-400 font-black text-xs">{u.diamantes || 0} 💎</span>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => cambiarDiamantes(u.id, u.diamantes, -10)} className="bg-slate-800 hover:bg-slate-700 text-white px-1.5 py-0.5 rounded text-xs font-black">-10</button>
                          <button onClick={() => cambiarDiamantes(u.id, u.diamantes, 50)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-1.5 py-0.5 rounded text-xs font-black">+50</button>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 bg-black/60 border border-red-500/30 px-2.5 py-1 rounded-xl w-fit">
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span className="text-white font-black text-xs">{u.corazones ?? 10}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => cambiarCorazones(u.id, u.corazones, -1)} className="bg-slate-800 hover:bg-slate-700 text-white px-1.5 py-0.5 rounded text-xs font-black">-</button>
                          <button onClick={() => cambiarCorazones(u.id, u.corazones, 10)} className="bg-red-600 hover:bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-black">+10</button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 bg-black/60 border border-blue-500/30 px-2.5 py-1 rounded-xl w-fit">
                        <span className="text-blue-400 font-black text-xs">{u.puntosTrivia || 0} PTS</span>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => cambiarPuntosTrivia(u.id, u.puntosTrivia, -10)} className="bg-slate-800 hover:bg-slate-700 text-white px-1.5 py-0.5 rounded text-xs font-black">-10</button>
                          <button onClick={() => cambiarPuntosTrivia(u.id, u.puntosTrivia, 50)} className="bg-blue-600 hover:bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-black">+50</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AppMain() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [vistaActual, setVistaActualState] = useState(new URLSearchParams(window.location.search).get('duelo') ? 'duelo' : 'home');
  const [versionActual, setVersionActual] = useState('RVR1960');
  const [libroActual, setLibroActual] = useState('Génesis');
  const [capituloActual, setCapituloActual] = useState(1);
  const [versiculoActual, setVersiculoActual] = useState('');
  const [tema, setTema] = useState('cym');
  const [tamañoFuente, setTamañoFuente] = useState(18);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [mostrarModalDevocional, setMostrarModalDevocional] = useState(false);
  
  const [mostrarAsistente, setMostrarAsistente] = useState(false);
  
  // ESTADOS DE VOCES PARA LECTURA
  const [leyendoAudio, setLeyendoAudio] = useState(false);
  const [vocesDisponibles, setVocesDisponibles] = useState([]);
  const [vozSeleccionada, setVozSeleccionada] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatHistorial, setChatHistorial] = useState([{ rol: 'asistente', texto: '¡Hola! Soy tu asistente bíblico CyM. Pregúntame lo que necesites sobre la Biblia.' }]);

  const [listaAmigos, setListaAmigos] = useState([]);
  const [emailBuscar, setEmailBuscar] = useState('');
  const inputRefFoto = useRef(null);
  const versiculoRefs = useRef({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarInstalador, setMostrarInstalador] = useState(false);
  
  // ESTADOS PARA EL INSTALADOR INTELIGENTE
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);

  // REFERENCIAS PARA EL LECTOR DE VOZ
  const lectorEstadoRef = useRef({ libro: libroActual, capitulo: capituloActual, leyendoAudio });

  // ESTADOS PARA COMUNIDAD Y RANKING
  const [pestañaComunidad, setPestañaComunidad] = useState('amigos');
  const [rankingGlobal, setRankingGlobal] = useState([]);

  // ESTADOS PARA EDICIÓN DE PRÉDICAS
  const [predicaEditando, setPredicaEditando] = useState(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editPasaje, setEditPasaje] = useState('');
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // 1. CARGA ROBUSTA DE VOCES (Especial para arreglar el bug de Safari/Edge Mobile)
  useEffect(() => {
    let intentoCarga;
    const cargarVoces = () => {
      const voces = window.speechSynthesis.getVoices();
      if (voces.length > 0) {
        const vocesEspanol = voces.filter(v => v.lang.toLowerCase().includes('es'));
        const vocesFinales = vocesEspanol.length > 0 ? vocesEspanol : voces;
        setVocesDisponibles(vocesFinales);
        setVozSeleccionada(prev => {
          if (!prev && vocesFinales.length > 0) return vocesFinales[0].voiceURI;
          return prev;
        });
        clearInterval(intentoCarga);
      }
    };

    cargarVoces();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = cargarVoces;
    }
    intentoCarga = setInterval(cargarVoces, 500);
    return () => clearInterval(intentoCarga);
  }, []);

  // 2. INSTALADOR INTELIGENTE (Detecta iPhone vs Android)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(isIOS);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setMostrarInstalador(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIOS && !isStandalone) {
      setTimeout(() => setMostrarInstalador(true), 2500);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const setVistaActual = (nuevaVista) => {
    setVistaActualState(nuevaVista);
    if (currentUser?.uid) {
      updateDoc(doc(db, 'cym_usuarios', currentUser.uid), {
        ubicacionActual: nuevaVista,
        ultimaConexion: new Date().toISOString()
      }).catch(() => {});
    }
  };

  const handleInstalarApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setMostrarInstalador(false);
    }
    setDeferredPrompt(null);
  };

  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [mostrarFormCapacitacion, setMostrarFormCapacitacion] = useState(false);
  const [nombreClaseInput, setNombreClaseInput] = useState('');
  const [descripcionCursoInput, setDescripcionCursoInput] = useState('');
  const [diasCursoInput, setDiasCursoInput] = useState('');
  const [horarioCursoInput, setHorarioCursoInput] = useState('');
  const [valorCuotaInput, setValorCuotaInput] = useState('');
  const [linkMercadoPagoInput, setLinkMercadoPagoInput] = useState('');
  const [linkGrupoWhatsAppInput, setLinkGrupoWhatsAppInput] = useState('');
  const [guardandoCurso, setGuardandoCurso] = useState(false);
  const [cursoSeleccionadoPago, setCursoSeleccionadoPago] = useState(null);
  const [telefonoWhatsAppAlumno, setTelefonoWhatsAppAlumno] = useState('');

  const [listaPredicaciones, setListaPredicaciones] = useState([]);
  const [cargandoPredicas, setCargandoPredicas] = useState(false);
  const [tituloPredicaInput, setTituloPredicaInput] = useState('');
  const [pasajePredicaInput, setPasajePredicaInput] = useState('');
  const [archivoWordTemp, setArchivoWordTemp] = useState(null);
  const [portadaImageTemp, setPortadaImageTemp] = useState(null);
  const [subiendoPredica, setSubiendoPredica] = useState(false);

  const inputRefWord = useRef(null);
  const inputRefPortada = useRef(null);
  const mesActualClave = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  const estadosNavegacion = useRef({ vistaActual, mostrarModalDevocional, mostrarAsistente });
  
  useEffect(() => {
    estadosNavegacion.current = { vistaActual, mostrarModalDevocional, mostrarAsistente };
  }, [vistaActual, mostrarModalDevocional, mostrarAsistente]);

  useEffect(() => {
    window.history.pushState({ atrapado: true }, '');

    const manejarBotonAtras = () => {
      const { vistaActual, mostrarModalDevocional, mostrarAsistente } = estadosNavegacion.current;
      
      if (vistaActual === 'home' && !mostrarModalDevocional && !mostrarAsistente) {
        return; 
      }
      
      window.history.pushState({ atrapado: true }, '');
      
      if (mostrarAsistente) {
        setMostrarAsistente(false);
      } else if (mostrarModalDevocional) {
        setMostrarModalDevocional(false);
      } else {
        setVistaActual('home');
        setVersiculoActual('');
      }
    };

    window.addEventListener('popstate', manejarBotonAtras);
    return () => window.removeEventListener('popstate', manejarBotonAtras);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoadingAuth(false); }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // CARGAR RANKING GLOBAL CUANDO ESTÁ EN LA PESTAÑA COMUNIDAD
  useEffect(() => {
    if (vistaActual === 'comunidad' && pestañaComunidad === 'global') {
      const cargarRankingGlobal = async () => {
        try {
          const q = query(collection(db, 'cym_usuarios'));
          const snap = await getDocs(q);
          const usuariosData = [];
          snap.forEach(docSnap => {
            usuariosData.push({ id: docSnap.id, ...docSnap.data() });
          });
          
          usuariosData.sort((a, b) => (b.puntosTrivia || 0) - (a.puntosTrivia || 0));
          setRankingGlobal(usuariosData.slice(0, 50));
        } catch (error) {
          console.error("Error cargando ranking global", error);
        }
      };
      cargarRankingGlobal();
    }
  }, [vistaActual, pestañaComunidad, db]);

  const cargarCursosFirebase = async () => {
    setCargandoCursos(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'cym_capacitaciones'));
      const docs = [];
      querySnapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setCursos(docs);
    } catch (e) { }
    finally { setCargandoCursos(false); }
  };

  const cargarPredicacionesFirebase = async () => {
    setCargandoPredicas(true);
    try {
      let querySnapshot = await getDocs(collection(db, 'predicas'));
      if (querySnapshot.empty) querySnapshot = await getDocs(collection(db, 'cym_predicaciones'));
      if (querySnapshot.empty) querySnapshot = await getDocs(collection(db, 'bosquejos'));

      const docs = [];
      querySnapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setListaPredicaciones(docs);
    } catch (e) { }
    finally { setCargandoPredicas(false); }
  };

  const cargarAmigos = async (amigosIds, usrActual) => {
    const datos = [];
    if (usrActual) {
      datos.push(usrActual);
    }

    if (amigosIds && Array.isArray(amigosIds) && amigosIds.length > 0) {
      for (const id of amigosIds) {
        try {
          const snap = await getDoc(doc(db, 'cym_usuarios', id));
          if (snap.exists()) datos.push({ uid: snap.id, ...snap.data() });
        } catch (e) {}
      }
    }
    
    datos.sort((a, b) => (b.puntosTrivia || 0) - (a.puntosTrivia || 0));
    setListaAmigos(datos);
  };

  const cargarOcrearUsuario = async (user) => {
    if (!user) return null;
    const emailLower = user.email ? user.email.toLowerCase() : '';
    const isGodMode = emailLower === 'maxdelanus@gmail.com' || emailLower === 'maximiliano.fontan@newsan.com.ar';
    const userRef = doc(db, 'cym_usuarios', user.uid);
    const hoyClave = new Date().toISOString().split('T')[0];
    
    try {
      const userSnap = await getDoc(userRef);
      let userData;

      if (userSnap.exists()) {
        userData = userSnap.data();
        const updates = { 
          ultimaConexion: new Date().toISOString(),
          ubicacionActual: vistaActual
        };

        const fechaUltimoReseteo = userData.ultimaFechaCorazones;

        if (fechaUltimoReseteo !== hoyClave) {
          userData.corazones = 10;
          userData.ultimaFechaCorazones = hoyClave;
          updates.corazones = 10;
          updates.ultimaFechaCorazones = hoyClave;
        } else if (userData.corazones === undefined || userData.corazones === null) {
          userData.corazones = 0;
          updates.corazones = 0;
        }

        if (isGodMode && userData.role !== 'OWNER') {
          userData.role = 'OWNER';
          userData.suscripcion = 'DIAMANTE';
          userData.creditosIA = 9999;
          updates.role = 'OWNER';
          updates.suscripcion = 'DIAMANTE';
          updates.creditosIA = 9999;
        }

        await updateDoc(userRef, updates);
      } else {
        userData = { 
          email: emailLower, 
          nombre: user.displayName || 'Hermano/a', 
          role: isGodMode ? 'OWNER' : 'USER', 
          suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', 
          creditosIA: isGodMode ? 9999 : 3, 
          puntosTrivia: 0, 
          corazones: 10,
          diamantes: 0,
          ultimaFechaCorazones: hoyClave,
          amigos: [], 
          photoURL: user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png", 
          fechaRegistro: new Date().toISOString(), 
          descargasMesActual: 0, 
          ultimoMesDescarga: mesActualClave,
          ultimaConexion: new Date().toISOString(),
          ubicacionActual: 'home'
        };
        await setDoc(userRef, userData);
      }

      if (!userData.amigos) userData.amigos = [];
      if (userData.ultimoMesDescarga !== mesActualClave) {
        userData.descargasMesActual = 0;
        userData.ultimoMesDescarga = mesActualClave;
        await updateDoc(userRef, { descargasMesActual: 0, ultimoMesDescarga: mesActualClave });
      }

      const params = new URLSearchParams(window.location.search);
      const amigoRefId = params.get('ref');
      if (amigoRefId && amigoRefId !== user.uid) {
        await updateDoc(userRef, { amigos: arrayUnion(amigoRefId) });
        await updateDoc(doc(db, 'cym_usuarios', amigoRefId), { amigos: arrayUnion(user.uid) });
        userData.amigos.push(amigoRefId);
        window.history.replaceState(null, '', window.location.pathname); 
      }

      const fotoFinal = userData.photoURL || user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png";
      const usrCompleto = { uid: user.uid, ...userData, photoURL: fotoFinal };
      
      cargarAmigos(userData.amigos, usrCompleto);
      return usrCompleto;
      
    } catch (error) { 
      console.error("Error al cargar usuario:", error);
      return { 
        uid: user.uid, 
        email: emailLower, 
        nombre: user.displayName || 'Usuario', 
        role: isGodMode ? 'OWNER' : 'USER', 
        suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', 
        creditosIA: 3, 
        puntosTrivia: 0, 
        corazones: 10,
        diamantes: 0,
        photoURL: user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png", 
        descargasMesActual: 0 
      }; 
    }
  };

  useEffect(() => { 
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => console.error("Error fijando persistencia de sesión:", error));

    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      try {
        if (user) {
          const u = await cargarOcrearUsuario(user);
          setCurrentUser(u); 
          cargarCursosFirebase();
          cargarPredicacionesFirebase();
        } else { 
          setCurrentUser(null); 
        }
      } catch (e) {
      } finally {
        setIsLoadingAuth(false); 
      }
    }); 
    return () => unsubscribe(); 
  }, []);

  const handleLogin = async () => { try { setIsLoadingAuth(true); const result = await signInWithPopup(auth, googleProvider); if (result.user) setCurrentUser(await cargarOcrearUsuario(result.user)); } catch (error) { setIsLoadingAuth(false); } };
  const handleLogout = async () => { await signOut(auth); setCurrentUser(null); setVistaActual('home'); };

  const handleCrearCapacitacion = async (e) => {
    e.preventDefault();
    if (!nombreClaseInput || !valorCuotaInput || !linkMercadoPagoInput || !linkGrupoWhatsAppInput) {
      alert("Completá los campos obligatorios."); return;
    }
    setGuardandoCurso(true);
    try {
      await addDoc(collection(db, 'cym_capacitaciones'), {
        nombreClase: nombreClaseInput, descripcion: descripcionCursoInput,
        dias: diasCursoInput, horario: horarioCursoInput, valorCuota: valorCuotaInput,
        linkMercadoPago: linkMercadoPagoInput, linkGrupoWhatsApp: linkGrupoWhatsAppInput,
        fechaCreacion: new Date().toISOString()
      });
      alert("¡Capacitación publicada!");
      setNombreClaseInput(''); setDescripcionCursoInput(''); setDiasCursoInput('');
      setHorarioCursoInput(''); setValorCuotaInput(''); setLinkMercadoPagoInput('');
      setLinkGrupoWhatsAppInput(''); setMostrarFormCapacitacion(false);
      cargarCursosFirebase();
    } catch (err) {}
    finally { setGuardandoCurso(false); }
  };

  const handleCompletarIngresoWhatsApp = async (cursoId, linkWhatsApp) => {
    if (!telefonoWhatsAppAlumno.trim()) { alert("Ingresá tu teléfono."); return; }
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, { cursosInscriptos: arrayUnion({ cursoId, telefonoWhatsApp: telefonoWhatsAppAlumno, fecha: new Date().toISOString() }) });
      alert("¡Redirigiendo al grupo oficial!");
      window.open(linkWhatsApp, '_blank');
      setCursoSeleccionadoPago(null); setTelefonoWhatsAppAlumno('');
    } catch (e) { }
  };

  const handleSelectWord = (e) => { const file = e.target.files[0]; if (file) setArchivoWordTemp(file); };
  const handleSelectPortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
          setPortadaImageTemp(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarPredica = async () => {
    if (!tituloPredicaInput.trim() || !pasajePredicaInput.trim() || !archivoWordTemp) {
      alert("Completá título, pasaje y Word."); return;
    }

    const TAMANO_MAXIMO_BYTES = 850 * 1024;
    if (archivoWordTemp.size > TAMANO_MAXIMO_BYTES) {
      alert("⚠️ El archivo Word es muy pesado (máx 850 KB). Subí un documento más liviano.");
      return;
    }

    setSubiendoPredica(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await addDoc(collection(db, 'predicas'), {
          titulo: tituloPredicaInput.trim(),
          nombre: tituloPredicaInput.trim(),
          pasaje: pasajePredicaInput.trim(),
          pasajeBiblico: pasajePredicaInput.trim(),
          nombreArchivo: archivoWordTemp.name, 
          archivoBase64: ev.target.result,
          wordUrl: ev.target.result,
          portadaBase64: portadaImageTemp || null, 
          portadaUrl: portadaImageTemp || null,
          fechaSubida: new Date().toISOString()
        });
        alert("¡Prédica subida con éxito!");
        setTituloPredicaInput(''); setPasajePredicaInput(''); setArchivoWordTemp(null); setPortadaImageTemp(null);
        if (inputRefWord.current) inputRefWord.current.value = '';
        if (inputRefPortada.current) inputRefPortada.current.value = '';
        cargarPredicacionesFirebase();
      } catch (err) {
        alert("Error al subir la prédica. Verificá permisos.");
      } finally { 
        setSubiendoPredica(false); 
      }
    };
    reader.readAsDataURL(archivoWordTemp);
  };

  const handleEliminarPredica = async (idPredica) => {
    if (!window.confirm("¿Estás seguro de que querés borrar esta prédica del catálogo?")) return;
    try {
      await deleteDoc(doc(db, 'predicas', idPredica));
      await deleteDoc(doc(db, 'cym_predicaciones', idPredica));
      alert("Prédica eliminada.");
      cargarPredicacionesFirebase();
    } catch (e) {
      alert("Error al eliminar la prédica.");
    }
  };

  const handleAbrirEdicion = (predica) => {
    setPredicaEditando(predica);
    setEditTitulo(predica.titulo || predica.nombre || '');
    setEditPasaje(predica.pasaje || predica.pasajeBiblico || '');
  };

  const handleGuardarEdicionPredica = async (e) => {
    e.preventDefault();
    if (!editTitulo.trim() || !editPasaje.trim()) {
      alert("Completá título y pasaje.");
      return;
    }
    setGuardandoEdit(true);
    try {
      const updates = {
        titulo: editTitulo.trim(),
        nombre: editTitulo.trim(),
        pasaje: editPasaje.trim(),
        pasajeBiblico: editPasaje.trim()
      };
      
      try { await updateDoc(doc(db, 'predicas', predicaEditando.id), updates); } catch (err) {}
      try { await updateDoc(doc(db, 'cym_predicaciones', predicaEditando.id), updates); } catch (err) {}

      alert("¡Prédica actualizada!");
      setPredicaEditando(null);
      cargarPredicacionesFirebase();
    } catch (e) {
      alert("Error al actualizar la prédica.");
    } finally {
      setGuardandoEdit(false);
    }
  };

  const handleDescargarArchivoPredica = async (predica, tipo) => {
    const sub = currentUser?.suscripcion ? String(currentUser.suscripcion).toUpperCase() : 'GRATIS';
    const rol = currentUser?.role || 'USER';

    if (rol !== 'OWNER' && sub !== 'DIAMANTE') {
      alert("🔒 Exclusivo para Socios DIAMANTE.");
      setVistaActual('club'); return;
    }

    if (tipo === 'word') {
      const urlAdescargar = predica.archivoBase64 || predica.archivoUrl || predica.wordUrl || predica.url;
      if (!urlAdescargar) { alert("Archivo Word no disponible."); return; }

      const link = document.createElement('a'); 
      link.href = urlAdescargar;
      link.download = predica.nombreArchivo || `${predica.titulo || predica.nombre || 'Predica'}.docx`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);

      if (rol !== 'OWNER') {
        const descargasUsadas = currentUser?.descargasMesActual || 0;
        const nuevoTotal = descargasUsadas + 1;
        await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { descargasMesActual: nuevoTotal, ultimoMesDescarga: mesActualClave });
        setCurrentUser(prev => ({ ...prev, descargasMesActual: nuevoTotal, ultimoMesDescarga: mesActualClave }));
      }
    } else if (tipo === 'portada') {
      if (!predica.portadaBase64 && !predica.portadaUrl) { alert("Sin portada adjunta."); return; }
      const link = document.createElement('a'); 
      link.href = predica.portadaBase64 || predica.portadaUrl;
      link.download = `Portada_${predica.titulo || predica.nombre || 'Predica'}.jpg`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL('image/jpeg', 0.6);
          try {
            await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { photoURL: base64String });
            setCurrentUser(prev => ({...prev, photoURL: base64String}));
            alert("¡Foto actualizada!");
          } catch (error) {}
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const buscarYAgregarAmigo = async () => {
    if(!emailBuscar) return;
    try {
      const q = query(collection(db, "cym_usuarios"), where("email", "==", emailBuscar.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { alert("No se encontró usuario."); return; }
      const amigoId = querySnapshot.docs[0].id;
      if (amigoId === currentUser.uid) return;
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { amigos: arrayUnion(amigoId) });
      setEmailBuscar('');
      const userSnap = await getDoc(doc(db, 'cym_usuarios', currentUser.uid));
      cargarAmigos(userSnap.data()?.amigos, currentUser);
    } catch (e) {}
  };

  const agregarAmigoPorId = async (amigoId) => {
    if (amigoId === currentUser.uid) return;
    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { amigos: arrayUnion(amigoId) });
      alert("¡Amigo agregado con éxito! Ya puedes desafiarlo.");
      
      const nuevosAmigos = [...(currentUser.amigos || []), amigoId];
      setCurrentUser({...currentUser, amigos: nuevosAmigos});
      
      const userSnap = await getDoc(doc(db, 'cym_usuarios', currentUser.uid));
      cargarAmigos(userSnap.data()?.amigos, currentUser);
    } catch (e) {
      alert("Error al agregar amigo.");
    }
  };

  const retarAmigo = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola! Logré ${currentUser?.puntosTrivia || 0} puntos en CyM. Jugá acá: ${window.location.origin}?ref=${currentUser?.uid}`)}`, '_blank'); };

  const isOwner = currentUser?.role === 'OWNER';
  const isPremium = isOwner || (currentUser?.suscripcion && currentUser?.suscripcion !== 'GRATIS');

  const obtenerVersiculos = (libro = libroActual, capitulo = capituloActual) => {
    try {
      const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libro);
      if (!libroData) return [];
      if (!libroData.chapters) {
        if (libroData.verses) return libroData.verses.filter(v => Number(v.chapter) === capitulo).map(v => ({ numero: String(v.verse), texto: v.text }));
        return [];
      }
      const capitulosReales = libroData.chapters.filter(c => c && c.is_chapter === true);
      const capituloData = capitulosReales[capitulo - 1];
      if (!capituloData || !capituloData.items) return [];

      return capituloData.items.filter(item => item && item.type === "verse").map(item => {
        const numeroSeguro = (item.verse_numbers && item.verse_numbers.length > 0) ? String(item.verse_numbers[0]) : '';
        const textoSeguro = (item.lines && Array.isArray(item.lines)) ? item.lines.join(' ') : (item.text || 'Texto no disponible');
        return { numero: numeroSeguro, texto: textoSeguro };
      });
    } catch (e) { return [{ numero: '⚠️', texto: 'Contenido no disponible' }]; }
  };
  const versiculosActuales = obtenerVersiculos();

  // ACTUALIZAR REF PARA LA LECTURA EN VOZ ALTA CADA VEZ QUE CAMBIAN
  useEffect(() => {
    lectorEstadoRef.current = { libro: libroActual, capitulo: capituloActual, leyendoAudio };
  }, [libroActual, capituloActual, leyendoAudio]);

  // CANCELAR AUDIO SI SALIMOS DEL LECTOR
  useEffect(() => { 
    if (vistaActual !== 'lector') {
      window.speechSynthesis.cancel(); 
      setLeyendoAudio(false); 
    }
  }, [vistaActual]);

  const avanzarCapituloAutomatico = () => {
    const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], lectorEstadoRef.current.libro);
    if (!libroData) return;
    
    let maxCapitulos = 1;
    if (libroData.chapters) {
      maxCapitulos = libroData.chapters.filter(c => c && c.is_chapter === true).length;
    } else if (libroData.verses) {
      const capitulosUnicos = [...new Set(libroData.verses.map(v => Number(v.chapter)))];
      maxCapitulos = Math.max(...capitulosUnicos);
    }

    if (lectorEstadoRef.current.capitulo < maxCapitulos) {
      const nuevoCapitulo = lectorEstadoRef.current.capitulo + 1;
      setCapituloActual(nuevoCapitulo);
      setVersiculoActual('');
      setTimeout(() => iniciarLecturaVoz(false, lectorEstadoRef.current.libro, nuevoCapitulo), 500); 
    } else {
      const indexLibro = LIBROS_MENU.findIndex(l => l.nombre === lectorEstadoRef.current.libro);
      if (indexLibro >= 0 && indexLibro < LIBROS_MENU.length - 1) {
        const proximoLibro = LIBROS_MENU[indexLibro + 1].nombre;
        setLibroActual(proximoLibro);
        setCapituloActual(1);
        setVersiculoActual('');
        setTimeout(() => iniciarLecturaVoz(false, proximoLibro, 1), 500);
      } else {
        setLeyendoAudio(false);
      }
    }
  };

  const iniciarLecturaVoz = (respetarVersiculoSeleccionado = true, libroToRead = libroActual, capituloToRead = capituloActual) => {
    window.speechSynthesis.cancel();
    
    const versos = obtenerVersiculos(libroToRead, capituloToRead);
    if (!versos || versos.length === 0) {
      setLeyendoAudio(false);
      return;
    }

    let versiculosAleer = versos;
    
    if (respetarVersiculoSeleccionado && versiculoActual !== '') {
      const indexVerso = versos.findIndex(v => String(v.numero) === String(versiculoActual));
      if (indexVerso !== -1) {
        versiculosAleer = versos.slice(indexVerso);
      }
    }

    const textoCompleto = versiculosAleer.map(v => v.texto).join('. ');
    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-ES'; 
    
    if (vozSeleccionada) {
      const voz = vocesDisponibles.find(v => v.voiceURI === vozSeleccionada);
      if (voz) utterance.voice = voz;
    }
    
    utterance.rate = 0.9; 
    
    utterance.onend = () => {
      if (lectorEstadoRef.current.leyendoAudio) {
        avanzarCapituloAutomatico();
      }
    };
    
    window.speechSynthesis.speak(utterance); 
    setLeyendoAudio(true);
  };

  const toggleLecturaAudio = () => {
    if (!isPremium) { setVistaActual('club'); return; }
    
    if (leyendoAudio) { 
      window.speechSynthesis.cancel(); 
      setLeyendoAudio(false); 
    } else {
      iniciarLecturaVoz(true);
    }
  };

  const irCapituloAnterior = () => {
    if (capituloActual > 1) {
      setCapituloActual(capituloActual - 1);
      setVersiculoActual('');
      window.scrollTo(0, 0);
    } else {
      const indexLibro = LIBROS_MENU.findIndex(l => l.nombre === libroActual);
      if (indexLibro > 0) {
        const libroAnterior = LIBROS_MENU[indexLibro - 1].nombre;
        setLibroActual(libroAnterior);
        setCapituloActual(1);
        setVersiculoActual('');
        window.scrollTo(0, 0);
      }
    }
  };

  const irCapituloSiguiente = () => {
    const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
    let maxCapitulos = 1;
    if (libroData && libroData.chapters) {
      maxCapitulos = libroData.chapters.filter(c => c && c.is_chapter === true).length;
    } else if (libroData && libroData.verses) {
      const capitulosUnicos = [...new Set(libroData.verses.map(v => Number(v.chapter)))];
      maxCapitulos = Math.max(...capitulosUnicos);
    }

    if (capituloActual < maxCapitulos) {
      setCapituloActual(capituloActual + 1);
      setVersiculoActual('');
      window.scrollTo(0, 0);
    } else {
      const indexLibro = LIBROS_MENU.findIndex(l => l.nombre === libroActual);
      if (indexLibro >= 0 && indexLibro < LIBROS_MENU.length - 1) {
        const proximoLibro = LIBROS_MENU[indexLibro + 1].nombre;
        setLibroActual(proximoLibro);
        setCapituloActual(1);
        setVersiculoActual('');
        window.scrollTo(0, 0);
      }
    }
  };


  const diasTranscurridos = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
  const lecturaHoy = LECTURAS_DIARIAS[diasTranscurridos % LECTURAS_DIARIAS.length] || LECTURAS_DIARIAS[0];
  const devocionalHoy = lecturaHoy.devocional || devocionalPorDefecto;

  const handleAbrirDevocional = () => {
    const sub = currentUser?.suscripcion || 'GRATIS'; const rol = currentUser?.role || 'USER';
    if (rol === 'OWNER' || sub === 'ORO' || sub === 'DIAMANTE') { setMostrarModalDevocional(true); } 
    else { if (window.confirm("🔒 Devocional exclusivo Oro/Diamante. ¿Ir al Club CyM?")) { setVistaActual('club'); } }
  };

  const compartirDevocional = () => {
    const textoCompartir = `*${devocionalHoy.titulo}*\n\n${devocionalHoy.reflexion}\n\n✨ *MINISTERIO CRECER Y MULTIPLICAR* ✨`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`, '_blank');
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isOwner && (currentUser?.creditosIA || 0) <= 0) { setChatHistorial([...chatHistorial, { rol: 'asistente', texto: '⚠️ Consultas agotadas. Unite al Club CyM.' }]); setChatInput(''); return; }
    const nuevoMensajeUsuario = { rol: 'usuario', texto: chatInput };
    const nuevoHistorial = [...chatHistorial, nuevoMensajeUsuario];
    setChatHistorial(nuevoHistorial); setChatInput('');

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || window.VITE_OPENAI_API_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: `Consejero pastoral CyM. Leyendo ${libroActual} ${capituloActual}.` }, { role: "user", content: chatInput }], temperature: 0.7 }) });
      const data = await response.json();
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: data.choices?.[0]?.message?.content || "Respuesta no generada." }]);
      if (!isOwner) { const nuevoLimite = (currentUser?.creditosIA || 1) - 1; setCurrentUser({...currentUser, creditosIA: nuevoLimite}); await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { creditosIA: nuevoLimite }); }
    } catch (error) { setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: 'Error de conexión.' }]); }
  };

  const abrirLibro = (nombreLibro, capitulo = 1) => { setLibroActual(nombreLibro); setCapituloActual(capitulo); setVersiculoActual(''); setVistaActual('lector'); window.scrollTo(0, 0); };
  const librosAntiguo = LIBROS_MENU.slice(0, 39); const librosNuevo = LIBROS_MENU.slice(39);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <EstrellasFondo />
        <Loader2 size={48} className="text-[#ffd700] animate-spin mb-4 relative z-10" />
        <p className="text-[#ffd700] font-black tracking-widest uppercase relative z-10 mb-4">Conectando al Ministerio...</p>
        <button onClick={() => setIsLoadingAuth(false)} className="relative z-10 text-xs text-slate-400 underline uppercase font-bold">Omitir espera</button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 py-12 text-center relative overflow-hidden select-none">
        <EstrellasFondo />
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl my-auto p-4"><img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM Biblia" className="w-full max-w-[480px] h-[480px] object-contain drop-shadow-[0_0_60px_rgba(245,194,66,0.65)]" /></div>
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 mt-4 mb-4">
          <div className="space-y-2 mb-2"><h1 className="text-4xl md:text-5xl font-serif font-black tracking-wide bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text">CyM Biblia</h1><p className="text-xs font-bold bg-gradient-to-r from-[#ffd366] to-[#b38600] text-transparent bg-clip-text uppercase tracking-[0.25em] opacity-90">Leé, Crecé y Multiplicá</p></div>
          <button onClick={handleLogin} className="w-full max-w-xs flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-black text-sm tracking-widest shadow-2xl hover:scale-105 transition-all"><LogIn size={18}/> Ingresar con Google</button>
        </div>
      </div>
    );
  }

  const estiloMiPerfil = obtenerEstiloSuscripcion(currentUser?.suscripcion, currentUser?.role);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-serif relative ${themeStyles[tema].split(' ')[0]} ${themeStyles[tema].split(' ')[1]}`}>
      {tema === 'cym' && <EstrellasFondo />}

      <nav className={`sticky top-0 z-50 px-2 md:px-6 py-3 shadow-md flex items-center justify-between backdrop-blur-md border-b ${navStyles[tema]} overflow-x-auto`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setVistaActual('home'); setVersiculoActual(''); }}>
          {vistaActual !== 'home' && <ArrowLeft size={20} className="mr-1" />}
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(204,163,0,0.5)]" />
          <h1 className="text-lg md:text-2xl font-black tracking-wider hidden sm:block">CyM <span className="font-light opacity-80">Biblia</span></h1>
        </div>
        <div className="flex items-center gap-1 md:gap-3 relative z-10 whitespace-nowrap ml-4">
          {isOwner && (
            <button onClick={() => setVistaActual('admin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-emerald-600 text-white shadow-md hover:scale-105 transition-transform"><Shield size={14} /> <span className="hidden lg:inline">Admin</span></button>
          )}
          <button onClick={() => setVistaActual('capacitaciones')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-amber-500 text-black shadow-md hover:scale-105 transition-transform"><GraduationCap size={14} /> <span className="hidden lg:inline">Academia</span></button>
          <button onClick={() => setVistaActual('predicas')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-cyan-600 text-white shadow-md hover:scale-105 transition-transform"><FileText size={14} /> <span className="hidden lg:inline">Bosquejos VIP</span></button>
          <button onClick={() => setVistaActual('comunidad')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-green-600 text-white shadow-md hover:scale-105 transition-transform"><Users size={14} /> <span className="hidden lg:inline">Comunidad</span></button>
          
          <button onClick={() => setVistaActual('trivia')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-blue-600 text-white shadow-md hover:scale-105 transition-transform"><Gamepad2 size={14} /> <span className="hidden lg:inline">Trivia</span></button>
          <button onClick={() => setVistaActual('juegos')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-orange-500 text-white shadow-md hover:scale-105 transition-transform"><Sparkles size={14} /> <span className="hidden lg:inline">CyM Kids</span></button>
          <button onClick={() => setVistaActual('duelo')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-purple-600 text-white shadow-md hover:scale-105 transition-transform"><Swords size={14} /> <span className="hidden lg:inline">Duelos</span></button>
          <button onClick={() => setVistaActual('clanes')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-amber-600 text-white shadow-md hover:scale-105 transition-transform"><Shield size={14} /> <span className="hidden lg:inline">Clanes</span></button>
          <button onClick={() => setVistaActual('tienda')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-pink-600 text-white shadow-md hover:scale-105 transition-transform"><ShoppingCart size={14} /> <span className="hidden lg:inline">Tienda</span></button>

          <button onClick={() => setVistaActual('club')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md hover:scale-105 transition-transform"><Crown size={14} className="fill-black" /> <span className="hidden lg:inline">Club CyM</span></button>
          
          <button onClick={() => setMostrarAjustes(!mostrarAjustes)} className="p-2 rounded-full hover:bg-white/10 transition-colors ml-1"><Settings size={18} /></button>
          <button onClick={handleLogout} className="p-2 rounded-full text-red-500 hover:bg-red-500/20 transition-colors"><LogOut size={18} /></button>
        </div>
      </nav>

      {mostrarAjustes && (
        <div className={`fixed top-20 right-6 p-5 rounded-2xl shadow-2xl border w-72 z-40 ${tema === 'cym' ? 'bg-[#141414] border-[#cca300]/50' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">Tamaño de lectura</p>
          <div className="flex items-center justify-between mb-6 bg-black/5 rounded-lg p-1 border border-current/10"><button onClick={() => setTamañoFuente(Math.max(14, tamañoFuente - 2))} className="p-2 hover:bg-black/10 rounded"><Type size={16} /></button><span className="font-bold text-sm">{tamañoFuente}px</span><button onClick={() => setTamañoFuente(Math.min(32, tamañoFuente + 2))} className="p-2 hover:bg-black/10 rounded"><Type size={22} /></button></div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">Estilo Visual</p>
          <div className="flex gap-2"><button onClick={() => setTema('claro')} className={`flex-1 p-3 rounded-xl border-2 flex justify-center ${tema === 'claro' ? 'border-slate-800 bg-slate-100' : 'border-transparent bg-white text-slate-900'}`}><Sun size={18} /></button><button onClick={() => setTema('sepia')} className={`flex-1 p-3 rounded-xl border-2 flex justify-center ${tema === 'sepia' ? 'border-[#8b6b4a] bg-[#e6d5b8]' : 'border-transparent bg-[#fbf0d9] text-[#5f4b32]'}`}><BookOpen size={18} /></button><button onClick={() => setTema('cym')} title="Modo CyM" className={`flex-1 p-3 rounded-xl border-2 flex justify-center ${tema === 'cym' ? 'border-[#ffd700] bg-black' : 'border-transparent bg-[#0a0a0a] text-[#ffd700]'}`}><Sparkles size={18} /></button></div>
        </div>
      )}

      {mostrarModalDevocional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl border relative text-left overflow-y-auto max-h-[85vh] ${tema === 'cym' ? 'bg-[#0f0f0f] border-[#cca300]/40 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button onClick={() => setMostrarModalDevocional(false)} className="absolute top-5 right-5 hover:opacity-70 p-1"><X size={22} /></button>
            <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><Sparkles size={12} /> Alimento Espiritual</p>
            <h3 className="text-2xl md:text-3xl font-serif font-black mb-1 bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text">{devocionalHoy.titulo}</h3>
            <p className="text-xs font-bold opacity-60 mb-6 italic">Lectura de base: {lecturaHoy.libro} {lecturaHoy.capitulo}</p>
            <div className="space-y-6" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.6' }}>
              <div><h4 className="text-xs font-black uppercase text-[#ffd700] mb-2 flex items-center gap-2"><FileText size={14} /> Reflexión Pastoral</h4><p className="opacity-90 font-medium whitespace-pre-line">{devocionalHoy.reflexion}</p></div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-[#cca300]/20 italic"><h4 className="text-xs font-black uppercase text-[#ffd700] mb-2 flex items-center gap-2"><Heart size={14} className="fill-current" /> Oración</h4><p className="opacity-90 font-serif">"{devocionalHoy.oracion}"</p></div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setMostrarModalDevocional(false); abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo); }} className="flex-1 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] shadow-lg">
                Ir a Lectura
              </button>
              <button onClick={compartirDevocional} className="bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg" title="Compartir Devocional">
                <Share2 size={16} /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN DE PRÉDICA */}
      {predicaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1626] border border-cyan-500/50 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-cyan-400 font-black text-lg flex items-center gap-2"><Edit2 size={20} /> Editar Prédica</h3>
              <button onClick={() => setPredicaEditando(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardarEdicionPredica} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Título de la Prédica</label>
                <input type="text" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} className="w-full bg-black/70 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pasaje Bíblico</label>
                <input type="text" value={editPasaje} onChange={(e) => setEditPasaje(e.target.value)} className="w-full bg-black/70 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={guardandoEdit} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-lg">
                  {guardandoEdit ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {guardandoEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button type="button" onClick={() => setPredicaEditando(null)} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-3 rounded-xl text-xs font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 relative z-10">
        
        {/* PANEL ADMIN (SOLO OWNER) */}
        {vistaActual === 'admin' && isOwner && <ModuloAdmin />}

        {vistaActual === 'home' && (
          <div className="space-y-8">
            
            <div className="bg-black/80 border border-[#cca300]/40 p-5 rounded-3xl backdrop-blur-md flex items-center shadow-xl">
              <input type="file" accept="image/*" ref={inputRefFoto} className="hidden" onChange={handleImageUpload} />
              <div className="relative group cursor-pointer mr-4" onClick={() => inputRefFoto.current?.click()}>
                <img 
                  src={currentUser?.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} 
                  alt="Perfil" 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] object-cover ${currentUser?.marcoEquipado || estiloMiPerfil.colorAro}`} 
                />
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={18} className="text-white" /></div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">{currentUser?.nombre || currentUser?.email || "Usuario"}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${estiloMiPerfil.colorBadge}`}>
                    {estiloMiPerfil.texto}
                  </span>
                  <span className="text-xs text-[#ffd700] font-bold flex items-center gap-1"><Zap size={12}/> {isOwner ? 'Créditos Ilimitados' : `${currentUser?.creditosIA || 0} Consultas IA`}</span>
                </div>
              </div>
            </div>

            {(currentUser?.role === 'OWNER' || currentUser?.suscripcion === 'ORO' || currentUser?.suscripcion === 'DIAMANTE') && (
              <div className="bg-gradient-to-r from-emerald-900/60 to-black border border-emerald-500/40 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-xl">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                  <h3 className="text-emerald-400 font-black text-lg flex items-center justify-center md:justify-start gap-2 mb-1">
                    <Heart size={20} className="fill-emerald-400" /> Grupo de Oración VIP
                  </h3>
                  <p className="text-slate-300 text-sm">Espacio exclusivo para compartir tus peticiones.</p>
                </div>
                <button 
                  onClick={() => window.open('https://chat.whatsapp.com/JNGHYMGAXK8BTht9MZUCU2?s=sh&p=a&ilr=1', '_blank')}
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <MessageCircle size={18} /> Entrar al Grupo
                </button>
              </div>
            )}

            <div className="bg-black/70 border border-[#cca300]/30 p-6 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4"><BookOpen size={22} className="text-[#ffd700]" /><h3 className="text-[#ffd700] font-black text-base uppercase tracking-wider">Investigación Bíblica</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Versión</label><select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#cca300]/40 text-amber-300 p-2.5 rounded-xl font-bold text-xs"><option value="RVR1960">RVR 1960</option><option value="NTV">NTV</option><option value="DHH">DHH</option><option value="LBLA">LBLA</option><option value="TLA">TLA</option></select></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Libro</label><select value={libroActual} onChange={(e) => { setLibroActual(e.target.value); setCapituloActual(1); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2.5 rounded-xl font-bold text-xs">{LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}</select></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Capítulo</label><select value={capituloActual} onChange={(e) => setCapituloActual(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2.5 rounded-xl font-bold text-xs">{Array.from({ length: 150 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Capítulo {n}</option>)}</select></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Versículo</label><select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/20 text-amber-300 p-2.5 rounded-xl font-bold text-xs"><option value="">Todo el cap.</option>{versiculosActuales.map((v) => <option key={v.numero} value={v.numero}>Versículo {v.numero}</option>)}</select></div>
              </div>
              <button onClick={() => setVistaActual('lector')} className="w-full bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"><BookOpen size={16} /> Abrir Lectura</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-950/60 to-black border border-blue-500/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Gamepad2 size={24} className="text-blue-400" /><h4 className="text-blue-400 font-black text-sm uppercase tracking-widest">Desafío Bíblico</h4></div><button onClick={retarAmigo} className="p-2 bg-blue-600/20 text-blue-400 hover:text-white hover:bg-blue-600 rounded-full transition-colors"><Share2 size={16} /></button></div><p className="text-white font-bold text-3xl mb-1">{currentUser?.puntosTrivia || 0} PTS</p><p className="text-slate-400 text-xs mb-4">Sumá puntos y compartí rachas.</p></div>
                <button onClick={() => setVistaActual('trivia')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"><Gamepad2 size={16}/> Jugar Trivia</button>
              </div>
              <div className="bg-gradient-to-br from-amber-950/60 to-black border border-amber-500/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div><div className="flex items-center gap-2 mb-2"><Award size={24} className="text-amber-400" /><h4 className="text-amber-400 font-black text-sm uppercase tracking-widest">Club CyM</h4></div><p className="text-white font-bold text-lg mb-1">Apoyo al Ministerio</p><p className="text-slate-400 text-xs mb-4">Desbloqueá herramientas con IA apoyando mes a mes.</p></div>
                <button onClick={() => setVistaActual('club')} className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"><Crown size={16} className="fill-black" /> Unirme / Donar</button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-xl border border-[#cca300]/40 backdrop-blur-md" style={{background: 'linear-gradient(135deg, rgba(30,25,0,0.85) 0%, rgba(0,0,0,0.85) 100%)'}}>
              <div className="absolute top-0 right-0 p-6 opacity-10"><Heart size={80} color="#ffd700" /></div>
              <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Sparkles size={12} /> Lectura Recomendada</p>
              <h2 className="text-3xl font-black text-[#fcd34d] mb-4">{lecturaHoy.libro} {lecturaHoy.capitulo}</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full"><button onClick={() => abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2"><BookOpen size={16} /> Abrir Capítulo</button><button onClick={handleAbrirDevocional} className="flex-1 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2"><Sparkles size={16} /> Leer Devocional de Hoy</button></div>
            </div>

            <div className="space-y-8">
              <div><h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 border-b border-[#cca300]/20 pb-2 bg-black/60 p-2 rounded backdrop-blur-sm inline-block">Antiguo Testamento</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{librosAntiguo.map((libro) => (<button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${tema === 'cym' ? 'bg-black/60 border-[#cca300]/20 hover:bg-[#cca300]/10' : 'bg-white border-slate-100'}`}><div className="flex items-center gap-4"><div className={`p-2 rounded-full ${tema === 'cym' ? 'bg-[#cca300]/10 text-[#cca300]' : 'bg-slate-100 text-slate-500'}`}><BookOpen size={16} /></div><span className="font-bold text-base">{libro.nombre}</span></div><ChevronRight size={18} className="opacity-30" /></button>))}</div></div>
              <div><h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 border-b border-[#cca300]/20 pb-2 bg-black/60 p-2 rounded backdrop-blur-sm inline-block">Nuevo Testamento</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{librosNuevo.map((libro) => (<button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${tema === 'cym' ? 'bg-black/60 border-[#cca300]/20 hover:bg-[#cca300]/10' : 'bg-white border-slate-100'}`}><div className="flex items-center gap-4"><div className={`p-2 rounded-full ${tema === 'cym' ? 'bg-[#cca300]/10 text-[#cca300]' : 'bg-slate-100 text-slate-500'}`}><BookOpen size={16} /></div><span className="font-bold text-base">{libro.nombre}</span></div><ChevronRight size={18} className="opacity-30" /></button>))}</div></div>
            </div>
          </div>
        )}

        {/* ACADEMIA */}
        {vistaActual === 'capacitaciones' && (
          <div className="space-y-8">
            <div className="bg-black/80 border border-amber-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <GraduationCap className="text-amber-400" size={32} /> Academia CyM & Capacitaciones
                </h2>
                <p className="text-slate-400 text-xs mt-1">Clases virtuales sincrónicas. Inscripción independiente por módulos.</p>
              </div>
              {isOwner && (
                <button 
                  onClick={() => setMostrarFormCapacitacion(!mostrarFormCapacitacion)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 shadow-xl w-full md:w-auto justify-center"
                >
                  <PlusCircle size={18} /> {mostrarFormCapacitacion ? "Cerrar Panel Owner" : "Postear Nueva Clase"}
                </button>
              )}
            </div>

            {isOwner && mostrarFormCapacitacion && (
              <form onSubmit={handleCrearCapacitacion} className="bg-amber-950/30 border border-amber-500/50 p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2 border-b border-amber-500/30 pb-3 mb-2">
                  <ShieldCheck className="text-amber-400" size={22} />
                  <h3 className="text-amber-300 font-black text-sm uppercase tracking-wider">Panel Owner: Alta de Capacitaciones</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Clase / Módulo *</label>
                    <input type="text" placeholder="Ej: Escuela Profética - Módulo 1" value={nombreClaseInput} onChange={(e) => setNombreClaseInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Valor de la Cuota *</label>
                    <input type="text" placeholder="Ej: $15.000 / mes" value={valorCuotaInput} onChange={(e) => setValorCuotaInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Días de Cursada</label>
                    <input type="text" placeholder="Ej: Martes y Jueves" value={diasCursoInput} onChange={(e) => setDiasCursoInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Horario Sincrónico</label>
                    <input type="text" placeholder="Ej: 20:00 a 21:30 hs (Arg)" value={horarioCursoInput} onChange={(e) => setHorarioCursoInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Link MercadoPago (Cuota) *</label>
                    <input type="text" placeholder="https://mpago.la/..." value={linkMercadoPagoInput} onChange={(e) => setLinkMercadoPagoInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Link de Grupo WhatsApp *</label>
                    <input type="text" placeholder="https://chat.whatsapp.com/..." value={linkGrupoWhatsAppInput} onChange={(e) => setLinkGrupoWhatsAppInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Descripción y Temario</label>
                  <textarea rows={3} placeholder="Detalles de la cursada..." value={descripcionCursoInput} onChange={(e) => setDescripcionCursoInput(e.target.value)} className="w-full bg-black/70 border border-amber-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                </div>

                <button type="submit" disabled={guardandoCurso} className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-xl">
                  {guardandoCurso ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  {guardandoCurso ? "Publicando..." : "Publicar Capacitación"}
                </button>
              </form>
            )}

            {cargandoCursos ? (
              <div className="text-center py-16 text-amber-400"><Loader2 className="animate-spin mx-auto mb-3" size={36} /><p className="font-bold text-xs uppercase tracking-widest">Cargando Capacitaciones...</p></div>
            ) : cursos.length === 0 ? (
              <div className="bg-black/60 border border-white/10 p-12 rounded-3xl text-center text-slate-400 space-y-3">
                <GraduationCap size={48} className="mx-auto opacity-30 text-amber-400" />
                <h3 className="text-lg font-bold text-white">No hay cursos abiertos actualmente</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cursos.map((c) => (
                  <div key={c.id} className="bg-black/80 border border-amber-500/30 p-6 rounded-3xl flex flex-col justify-between shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-500/30">Sincrónico en Vivo</span>
                          <h3 className="text-xl font-black text-white mt-2">{c.nombreClase}</h3>
                        </div>
                        <div className="text-right"><span className="text-xs text-slate-400 block uppercase font-bold">Cuota</span><span className="text-lg font-black text-amber-400">{c.valorCuota}</span></div>
                      </div>
                      {c.descripcion && <p className="text-slate-300 text-xs leading-relaxed">{c.descripcion}</p>}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-300"><Calendar size={14} className="text-amber-400" /> <span>{c.dias || "A coordinar"}</span></div>
                        <div className="flex items-center gap-1.5 text-slate-300"><Clock size={14} className="text-amber-400" /> <span>{c.horario || "A coordinar"}</span></div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      {cursoSeleccionadoPago?.id === c.id ? (
                        <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5"><CheckCircle size={16} /> Luego de abonar, ingresá tu WhatsApp:</p>
                          <input type="text" placeholder="Ej: +5491122334455" value={telefonoWhatsAppAlumno} onChange={(e) => setTelefonoWhatsAppAlumno(e.target.value)} className="w-full bg-black border border-amber-500/40 rounded-xl p-2.5 text-white text-xs outline-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleCompletarIngresoWhatsApp(c.id, c.linkGrupoWhatsApp)} className="flex-1 bg-[#25D366] text-white font-black py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5"><MessageCircle size={14} /> Entrar al Grupo</button>
                            <button onClick={() => setCursoSeleccionadoPago(null)} className="bg-white/10 text-slate-400 p-2.5 rounded-xl text-xs">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { window.open(c.linkMercadoPago, '_blank'); setCursoSeleccionadoPago(c); }} className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"><DollarSign size={16} /> Abonar Cuota / Inscribirme</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREDICACIONES VIP */}
        {vistaActual === 'predicas' && (
          <div className="space-y-6">
            <div className="bg-black/80 border border-cyan-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2"><FileText size={26} /> Catálogo de Prédicas y Bosquejos VIP</h2>
                  <p className="text-slate-400 text-xs mt-1">Visibles para todos. Descarga exclusiva en Word (.docx) para <span className="text-yellow-400 font-bold">Socios Diamante</span>.</p>
                </div>
                {currentUser?.role !== 'OWNER' && (
                  <div className="bg-cyan-950/80 border border-cyan-500/50 px-4 py-2 rounded-2xl text-right">
                    <p className="text-[10px] font-black uppercase text-cyan-300">Descargas del Mes</p>
                    <p className="text-xl font-black text-white">{currentUser?.descargasMesActual || 0} / 10</p>
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="bg-cyan-950/40 border border-cyan-500/50 p-6 rounded-2xl mb-8 space-y-4">
                  <h3 className="text-cyan-300 font-black text-sm uppercase tracking-wider flex items-center gap-2"><Upload size={18} /> Cargar Nueva Prédica + Portada (Panel Owner)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Título de la Prédica" value={tituloPredicaInput} onChange={(e) => setTituloPredicaInput(e.target.value)} className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                    <input type="text" placeholder="Pasaje Bíblico (ej: Efesios 6:10-18)" value={pasajePredicaInput} onChange={(e) => setPasajePredicaInput(e.target.value)} className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="file" accept=".doc,.docx" ref={inputRefWord} className="hidden" onChange={handleSelectWord} />
                    <button type="button" onClick={() => inputRefWord.current?.click()} className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${archivoWordTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}>
                      <FileText size={18} /> {archivoWordTemp ? `✓ ${archivoWordTemp.name}` : "1. Adjuntar Word (.docx)"}
                    </button>

                    <input type="file" accept="image/*" ref={inputRefPortada} className="hidden" onChange={handleSelectPortada} />
                    <button type="button" onClick={() => inputRefPortada.current?.click()} className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${portadaImageTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}>
                      <ImageIcon size={18} /> {portadaImageTemp ? "✓ Portada Seleccionada" : "2. Adjuntar Portada (Opcional)"}
                    </button>
                  </div>

                  <button type="button" onClick={handleGuardarPredica} disabled={subiendoPredica} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                    {subiendoPredica ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    {subiendoPredica ? "Guardando..." : "Publicar Prédica Completa"}
                  </button>
                </div>
              )}

              {cargandoPredicas ? (
                <div className="text-center py-16 text-cyan-400">
                  <Loader2 className="animate-spin mx-auto mb-3" size={36} />
                  <p className="font-bold text-xs uppercase tracking-widest">Cargando Prédicas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listaPredicaciones.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <FileText size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold">No hay prédicas subidas todavía.</p>
                    </div>
                  ) : (
                    listaPredicaciones.map((p) => {
                      const esDiamante = (currentUser?.suscripcion || '').toUpperCase() === 'DIAMANTE' || isOwner;
                      return (
                        <div key={p.id} className="bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl relative group">
                          
                          {/* BOTONES EXCLUSIVOS OWNER: EDITAR Y BORRAR */}
                          {isOwner && (
                            <div className="absolute top-3 right-3 z-20 flex gap-2">
                              <button
                                onClick={() => handleAbrirEdicion(p)}
                                className="bg-blue-600/90 hover:bg-blue-500 text-white p-2 rounded-xl backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                                title="Editar Prédica"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminarPredica(p.id)}
                                className="bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-xl backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                                title="Eliminar Prédica"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}

                          <div>
                            {(p.portadaBase64 || p.portadaUrl) ? (
                              <div className="h-48 w-full overflow-hidden relative">
                                <img src={p.portadaBase64 || p.portadaUrl} alt={p.titulo || p.nombre} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                              </div>
                            ) : (
                              <div className="h-32 w-full bg-cyan-950/40 border-b border-white/10 flex items-center justify-center text-cyan-500/40">
                                <FileText size={48} />
                              </div>
                            )}
                            <div className="p-5">
                              <h4 className="text-white font-black text-xl mb-1 leading-snug">{p.titulo || p.nombre || 'Prédica'}</h4>
                              <p className="text-cyan-400 font-bold text-xs">📖 {p.pasaje || p.pasajeBiblico || ''}</p>
                            </div>
                          </div>

                          <div className="p-5 pt-0 flex gap-2">
                            <button 
                              onClick={() => handleDescargarArchivoPredica(p, 'word')} 
                              className={`flex-1 font-black py-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md ${
                                esDiamante 
                                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                                  : 'bg-black/60 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                              }`}
                            >
                              {esDiamante ? <Download size={14} /> : <Lock size={14} />} 
                              {esDiamante ? 'Descargar Word (.docx)' : '🔒 Exclusivo Diamante'}
                            </button>

                            {(p.portadaBase64 || p.portadaUrl) && (
                              <button onClick={() => handleDescargarArchivoPredica(p, 'portada')} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 border border-white/10">
                                <ImageIcon size={14} /> Portada
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMUNIDAD (MIS AMIGOS Y RANKING GLOBAL) */}
        {vistaActual === 'comunidad' && (
          <div className="bg-black/80 border border-[#cca300]/30 p-6 rounded-3xl backdrop-blur-md">
            <h2 className="text-2xl font-black text-[#ffd700] mb-6 flex items-center gap-2"><Trophy size={28} /> Salón de la Fama</h2>
            
            {/* PESTAÑAS */}
            <div className="flex gap-2 mb-6 bg-black/50 p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setPestañaComunidad('amigos')} 
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${pestañaComunidad === 'amigos' ? 'bg-[#cca300] text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
              >
                <Users size={16} /> Mis Amigos
              </button>
              <button 
                onClick={() => setPestañaComunidad('global')} 
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${pestañaComunidad === 'global' ? 'bg-[#cca300] text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
              >
                <Globe size={16} /> Top 50 Global
              </button>
            </div>

            {pestañaComunidad === 'amigos' ? (
              <>
                <button onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Sumate a CyM Biblia y compitamos en la Trivia! Hacé clic acá para agregarnos como amigos: ${window.location.origin}?ref=${currentUser?.uid}`)}`, '_blank'); }} className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-4 rounded-xl mb-6 shadow-lg flex items-center justify-center gap-2">Invitar amigos por WhatsApp</button>
                <div className="flex flex-col md:flex-row gap-2 mb-6"><input type="email" value={emailBuscar} onChange={(e) => setEmailBuscar(e.target.value)} placeholder="O buscar por email..." className="flex-1 bg-[#1a1a1a] border border-[#cca300]/40 rounded-xl px-4 py-3 text-white outline-none" /><button onClick={buscarYAgregarAmigo} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><UserPlus size={18}/> Buscar</button></div>
                <div className="space-y-3">
                  {listaAmigos.length === 0 ? (
                    <p className="text-slate-400 text-center py-6">Todavía no tenés amigos ni has sumado puntos. ¡Jugá una partida de trivia!</p>
                  ) : (
                    listaAmigos.map((amigo, index) => {
                      const esYo = amigo.uid === currentUser?.uid || amigo.email === currentUser?.email;
                      const estiloAmigo = obtenerEstiloSuscripcion(amigo.suscripcion, amigo.role);
                      let medalla = null;
                      if(index === 0) medalla = "🥇";
                      if(index === 1) medalla = "🥈";
                      if(index === 2) medalla = "🥉";

                      return (
                        <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${esYo ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-lg w-8 text-center ${index < 3 ? 'text-3xl' : 'text-slate-500'}`}>{medalla || index + 1}</span>
                            <img src={amigo.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className={`w-12 h-12 rounded-full border-[3px] object-cover ${amigo.marcoEquipado || estiloAmigo.colorAro}`} alt="foto" />
                            <div>
                              <p className="font-bold text-white leading-tight">
                                {esYo ? 'Tú' : amigo.nombre}
                              </p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${estiloAmigo.colorBadge}`}>{estiloAmigo.texto}</span>
                            </div>
                          </div>
                          <div className="text-right"><p className="font-black text-xl text-blue-400">{amigo.puntosTrivia || 0}</p><p className="text-[10px] uppercase text-slate-400 font-bold">Puntos</p></div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {rankingGlobal.length === 0 ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#ffd700]" size={40} /></div>
                ) : (
                  rankingGlobal.map((user, index) => {
                    const esYo = user.id === currentUser?.uid;
                    const esAmigo = (currentUser?.amigos || []).includes(user.id);
                    const estiloUsuario = obtenerEstiloSuscripcion(user.suscripcion, user.role);
                    let medalla = null;
                    if(index === 0) medalla = "🥇";
                    if(index === 1) medalla = "🥈";
                    if(index === 2) medalla = "🥉";

                    return (
                      <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border ${esYo ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-lg w-8 text-center ${index < 3 ? 'text-3xl' : 'text-slate-500'}`}>{medalla || index + 1}</span>
                          <img src={user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className={`w-12 h-12 rounded-full border-[3px] object-cover ${user.marcoEquipado || estiloUsuario.colorAro}`} alt="foto" />
                          <div>
                            <p className="font-bold text-white leading-tight">
                              {esYo ? 'Tú' : (user.nombre || user.email)}
                            </p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${estiloUsuario.colorBadge}`}>{estiloUsuario.texto}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="font-black text-xl text-blue-400">{user.puntosTrivia || 0}</p>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Puntos</p>
                          </div>
                          
                          {/* BOTONES DE AGREGAR AMIGO DESDE EL GLOBAL */}
                          {!esYo && !esAmigo && (
                            <button 
                              onClick={() => agregarAmigoPorId(user.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center"
                              title="Agregar a mis amigos"
                            >
                              <UserPlus size={18} />
                            </button>
                          )}
                          {!esYo && esAmigo && (
                            <div className="bg-emerald-600/20 text-emerald-400 p-2.5 rounded-xl flex items-center justify-center" title="Ya es tu amigo">
                              <CheckCircle size={18} />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* LECTOR BÍBLICO */}
        {vistaActual === 'lector' && (
          <div className="bg-black/70 p-4 md:p-10 rounded-3xl backdrop-blur-md border border-[#cca300]/20 shadow-2xl">
            <div className="mb-8 p-4 bg-black/50 border border-[#cca300]/30 rounded-2xl"><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#cca300]/40 text-amber-300 p-2 rounded-lg font-bold text-xs outline-none"><option value="RVR1960">Reina Valera 1960</option><option value="NTV">NTV</option><option value="DHH">DHH</option><option value="LBLA">LBLA</option><option value="TLA">TLA</option></select><select value={libroActual} onChange={(e) => { setLibroActual(e.target.value); setCapituloActual(1); setVersiculoActual(''); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-xs outline-none">{LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}</select><select value={capituloActual} onChange={(e) => { setCapituloActual(Number(e.target.value)); setVersiculoActual(''); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-xs outline-none">{Array.from({ length: 150 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Capítulo {n}</option>)}</select><select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/20 text-amber-300 p-2 rounded-lg font-bold text-xs outline-none"><option value="">Todo el cap.</option>{versiculosActuales.map((v) => <option key={v.numero} value={v.numero}>Versículo {v.numero}</option>)}</select></div></div>
            
            <div className="mb-12 text-center flex flex-col items-center">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={irCapituloAnterior} className="p-2 hover:bg-[#cca300]/20 rounded-full text-[#ffd700] transition-colors"><ChevronLeft size={32}/></button>
                <h2 className="font-black text-[#ffd700]" style={{ fontSize: `${tamañoFuente * 1.8}px` }}>{libroActual} {capituloActual} <span className="opacity-60 text-lg">({versionActual})</span></h2>
                <button onClick={irCapituloSiguiente} className="p-2 hover:bg-[#cca300]/20 rounded-full text-[#ffd700] transition-colors"><ChevronRight size={32}/></button>
              </div>

              {/* SELECTOR DE VOCES VISIBLE */}
              {vocesDisponibles.length > 0 && (
                <div className="mb-6 flex items-center gap-2 bg-black/40 border border-[#cca300]/30 px-4 py-2 rounded-full">
                  <Volume2 size={16} className="text-[#ffd700]" />
                  <select 
                    value={vozSeleccionada} 
                    onChange={(e) => setVozSeleccionada(e.target.value)} 
                    className="bg-transparent text-amber-100 text-xs font-bold outline-none max-w-[200px] md:max-w-[300px] truncate cursor-pointer appearance-none"
                  >
                    {vocesDisponibles.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI} className="text-black">{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={toggleLecturaAudio} className={`flex items-center gap-2 px-6 py-4 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-lg ${leyendoAudio ? 'bg-red-600 text-white animate-pulse' : 'bg-[#cca300]/20 text-[#ffd700] hover:bg-[#cca300]/40'}`}>
                {leyendoAudio ? <Square size={18} fill="currentColor"/> : <Volume2 size={18} />} 
                {leyendoAudio ? 'Detener Lectura' : (versiculoActual ? 'Leer desde el versículo' : 'Escuchar Capítulo Completo')}
              </button>
            </div>

            <div className="space-y-4 leading-relaxed text-left" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.7' }}>
              {versiculosActuales.map((versiculo, index) => { 
                const esVersiculoResaltado = versiculo.numero === versiculoActual; 
                return (
                  <p key={index} ref={el => versiculoRefs.current[versiculo.numero] = el} className="relative group cursor-text transition-all duration-500">
                    <sup className={`absolute -left-6 md:-left-8 top-1 text-[0.6em] font-black select-none ${esVersiculoResaltado ? 'text-amber-400 text-sm' : 'text-[#ffd700]/60'}`}>{versiculo.numero}</sup>
                    <span className={`rounded p-2 transition-colors duration-500 block ${esVersiculoResaltado ? 'bg-amber-500/20 text-[#ffd700] border-l-4 border-[#ffd700] pl-3 font-bold shadow-lg' : 'hover:bg-[#ffd700]/10 hover:text-[#ffd700]'}`}>{versiculo.texto}</span>
                  </p>
                ); 
              })}
            </div>
            
            {/* Navegación al final del capítulo */}
            <div className="mt-12 pt-8 border-t border-[#cca300]/30 flex justify-between items-center">
               <button onClick={irCapituloAnterior} className="flex items-center gap-2 text-slate-400 hover:text-[#ffd700] font-bold uppercase tracking-wider text-xs transition-colors"><ChevronLeft size={20}/> Capítulo Anterior</button>
               <button onClick={irCapituloSiguiente} className="flex items-center gap-2 text-slate-400 hover:text-[#ffd700] font-bold uppercase tracking-wider text-xs transition-colors">Siguiente Capítulo <ChevronRight size={20}/></button>
            </div>
          </div>
        )}

        {/* NUEVAS VISTAS MODULARES */}
        {vistaActual === 'duelo' && (
          <ModuloDuelo currentUser={currentUser} db={db} listaAmigos={listaAmigos} onVolver={() => setVistaActual('home')} />
        )}
        {vistaActual === 'clanes' && (
          <ModuloClanes currentUser={currentUser} db={db} onVolver={() => setVistaActual('home')} />
        )}
        {vistaActual === 'tienda' && (
          <ModuloTienda currentUser={currentUser} db={db} onVolver={() => setVistaActual('home')} />
        )}

        {/* TRIVIA Y CLUB Y JUEGOS KIDS */}
        {vistaActual === 'trivia' && <ModuloTrivia currentUser={currentUser} db={db} tema={tema} onVolver={() => setVistaActual('home')} />}
        {vistaActual === 'juegos' && <JuegosModule currentUser={currentUser} db={db} />}
        
        {vistaActual === 'club' && (
          <ModuloClub 
            tema={tema} 
            onVolver={() => setVistaActual('home')} 
            onSuscribir={async (planElegido) => {
              try {
                const res = await fetch('/api/crear-preferencia', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    plan: planElegido,
                    userId: currentUser?.uid,
                    email: currentUser?.email
                  })
                });

                const data = await res.json();

                if (data.init_point) {
                  window.location.href = data.init_point;
                } else {
                  alert("No se pudo iniciar el proceso de cobro. Intentá de nuevo.");
                }
              } catch (err) {
                console.error("Error al iniciar suscripción:", err);
                alert("Error al conectar con la pasarela de pago.");
              }
            }} 
          />
        )}
      </main>

      {/* IA ASISTENTE */}
      {vistaActual === 'lector' && (
        <div className="fixed bottom-20 right-4 md:right-6 z-50">
          {mostrarAsistente ? (
            <div className="w-80 h-[400px] rounded-2xl shadow-2xl flex flex-col border overflow-hidden bg-[#141414] border-[#cca300]/50"><div className="p-4 flex justify-between items-center border-b bg-black border-[#cca300]/30"><div className="flex items-center gap-2"><Sparkles size={18} className="text-[#ffd700]" /><span className="font-bold text-sm text-white">Asistente CyM</span></div><button onClick={() => setMostrarAsistente(false)} className="text-white p-2 hover:bg-white/10 rounded-full"><X size={20} /></button></div><div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col text-sm">{chatHistorial.map((msg, i) => (<div key={i} className={`p-3 rounded-xl max-w-[85%] ${msg.rol === 'usuario' ? 'self-end bg-[#cca300] text-black font-bold' : 'self-start bg-white/10 text-slate-200'}`}>{msg.texto}</div>))}</div><form onSubmit={enviarMensaje} className="p-3 border-t flex gap-2 bg-black border-[#cca300]/30"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Preguntale a la IA..." className="flex-1 rounded-full px-4 py-3 text-sm outline-none border bg-[#1a1a1a] border-[#cca300]/30 text-white" /><button type="submit" className="p-3 rounded-full bg-[#cca300] text-black hover:scale-105"><Send size={18} /></button></form></div>
          ) : (
            <button onClick={() => setMostrarAsistente(true)} className="p-5 rounded-full shadow-2xl bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-black hover:scale-110 transition-transform"><MessageCircle size={28} /></button>
          )}
        </div>
      )}

      {/* CARTEL INTELIGENTE DE DESCARGA / INSTALACIÓN */}
      {mostrarInstalador && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-gradient-to-t from-black via-black to-transparent backdrop-blur-md animate-in slide-in-from-bottom flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-[#141414] border-2 border-[#cca300] rounded-3xl p-5 shadow-[0_0_40px_rgba(204,163,0,0.3)] flex flex-col gap-4 relative">
            <button onClick={() => setMostrarInstalador(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={20} /></button>
            <div className="flex items-center gap-4">
              <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Icono" className="w-14 h-14 object-contain" />
              <div>
                <h3 className="text-white font-black text-lg leading-tight">Instalar App Oficial</h3>
                <p className="text-slate-400 text-xs font-bold mt-1">Más rápida y sin usar el navegador.</p>
              </div>
            </div>
            
            {esDispositivoIOS ? (
              <div className="bg-white/10 p-4 rounded-xl text-slate-200 text-xs text-center border border-white/20 mt-2">
                <p className="font-bold mb-3 text-[#ffd700]">Para instalar en tu iPhone o iPad:</p>
                <p className="mb-2">1. Tocá el ícono de <b>Compartir</b> <Share2 size={16} className="inline opacity-80"/> en la barra del navegador.</p>
                <p>2. Elegí <b>"Agregar a inicio"</b> <PlusCircle size={16} className="inline opacity-80"/>.</p>
                <button onClick={() => setMostrarInstalador(false)} className="mt-5 w-full bg-slate-800 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px]">Entendido</button>
              </div>
            ) : (
              <button onClick={handleInstalarApp} className="w-full bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <Download size={18} /> Instalar Ahora
              </button>
            )}
          </div>
        </div>
      )}
      <footer className="mt-auto p-6 text-center border-t border-[#cca300]/30 bg-black/70 backdrop-blur-md">
        <span className="text-xs font-black tracking-widest uppercase opacity-40">Ministerio Crecer y Multiplicar</span>
      </footer>
    </div>
  );
}

// --------------------------------------------------
// EL PARACAÍDAS DE REACT (ERROR BOUNDARY)
// --------------------------------------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("¡Paracaídas activado! Error capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-serif">
          <div className="absolute inset-0 bg-black/85 z-0"></div>
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-40 h-40 object-contain mb-8 relative z-10 drop-shadow-[0_0_30px_rgba(204,163,0,0.5)]" />
          <h2 className="text-3xl font-black text-[#ffd700] mb-4 relative z-10">Actualizando...</h2>
          <p className="text-slate-300 text-sm mb-10 max-w-md relative z-10 leading-relaxed">
            Tuvimos una pequeña interrupción de conexión o estamos aplicando mejoras en el servidor. <br/><br/>
            Tocá el botón dorado para recargar la aplicación de forma segura.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="relative z-10 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-4 px-10 rounded-full uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
          >
            Reiniciar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// EXPORTACIÓN FINAL BLINDADA
export default function App() {
  return (
    <ErrorBoundary>
      <AppMain />
    </ErrorBoundary>
  );
}