import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Settings, ChevronLeft, ChevronRight, Type, Sun, Sparkles, ArrowLeft, 
  Heart, MessageCircle, X, Send, FileText, PlayCircle, Volume2, Square, Trophy, Crown,
  Loader2, LogOut, Lock, LogIn, Gamepad2, Award, Zap, Users, Edit2, Share2, Search, UserPlus
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';

import ModuloTrivia from './ModuloTrivia';
import ModuloClub from './ModuloClub';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const BIBLIA_VERSIONES = { RVR1960: BibliaRVR, NTV: BibliaNTV, DHH: BibliaDHH, LBLA: BibliaLBLA, TLA: BibliaTLA };

const LECTURAS_DIARIAS = [
  { libro: 'Salmos', capitulo: 1, devocional: { titulo: 'El Camino de la Bendición', reflexion: 'El Salmo 1 nos planta frente a una gran verdad: nuestras decisiones determinan nuestro destino. El hombre bienaventurado no camina bajo el consejo del mundo, sino que echa raíces junto a las corrientes de agua de la Palabra de Dios.', oracion: 'Señor Jesús, ayúdame a deleitarme en tu Palabra cada día. Amén.' } }, 
  { libro: 'Proverbios', capitulo: 3, devocional: { titulo: 'Confianza de Todo Corazón', reflexion: 'Confiar en el Señor con todo el corazón implica rendir nuestra necesidad de tener siempre el control. Proverbios nos desafía a no depender de nuestra propia prudencia.', oracion: 'Padre Celestial, hoy rindo mi ansiedad y mi propio entendimiento. Amén.' } },
  { libro: 'Juan', capitulo: 1, devocional: { titulo: 'La Luz que Prevalece', reflexion: 'En el principio era el Verbo, la Palabra encarnada que trajo vida y luz a la humanidad. Juan nos recuerda que Jesús vino a disipar toda tiniebla.', oracion: 'Señor Jesús, gracias por venir a mi vida a traer claridad y salvación. Amén.' } },
  { libro: 'Romanos', capitulo: 8, devocional: { titulo: 'Más que Vencedores', reflexion: 'Nos asegura que ya no hay condenación para los que están en Cristo y que ninguna circunstancia nos podrá separar de Su amor.', oracion: 'Gracias, Padre Amado, porque en Cristo soy más que vencedor. Amén.' } }, 
  { libro: 'Filipenses', capitulo: 4, devocional: { titulo: 'La Paz que lo Guarda Todo', reflexion: 'El apóstol Pablo nos enseña el antídoto contra la preocupación: la oración con acción de gracias.', oracion: 'Señor, hoy te entrego cada una de mis preocupaciones. Amén.' } }, 
  { libro: 'Salmos', capitulo: 23, devocional: { titulo: 'Nuestro Buen Pastor', reflexion: 'El Salmo 23 nos recuerda la intimidad del cuidado de Dios. Él no es solo un pastor general; es "mi" Pastor.', oracion: 'Jesús, mi buen Pastor, gracias por guiarme, proveerme y cuidarme. Amén.' } }
];

const devocionalPorDefecto = { titulo: 'Creciendo en la Palabra', reflexion: 'Cada porción de las Escrituras contiene aliento y dirección para nuestra vida diaria.', oracion: 'Señor Jesús, abre mis ojos para ver las maravillas de tu Ley. Amén.' };

const LIBROS_MENU = [
  { nombre: 'Génesis' }, { nombre: 'Éxodo' }, { nombre: 'Levítico' }, { nombre: 'Números' }, { nombre: 'Deuteronomio' }, { nombre: 'Josué' }, { nombre: 'Jueces' }, { nombre: 'Rut' }, { nombre: '1 Samuel' }, { nombre: '2 Samuel' }, { nombre: '1 Reyes' }, { nombre: '2 Reyes' }, { nombre: '1 Crónicas' }, { nombre: '2 Crónicas' }, { nombre: 'Esdras' }, { nombre: 'Nehemías' }, { nombre: 'Ester' }, { nombre: 'Job' }, { nombre: 'Salmos' }, { nombre: 'Proverbios' }, { nombre: 'Eclesiastés' }, { nombre: 'Cantares' }, { nombre: 'Isaías' }, { nombre: 'Jeremías' }, { nombre: 'Lamentaciones' }, { nombre: 'Ezequiel' }, { nombre: 'Daniel' }, { nombre: 'Oseas' }, { nombre: 'Joel' }, { nombre: 'Amós' }, { nombre: 'Abdías' }, { nombre: 'Jonás' }, { nombre: 'Miqueas' }, { nombre: 'Nahúm' }, { nombre: 'Habacuc' }, { nombre: 'Sofonías' }, { nombre: 'Hageo' }, { nombre: 'Zacarías' }, { nombre: 'Malaquías' }, { nombre: 'Mateo' }, { nombre: 'Marcos' }, { nombre: 'Lucas' }, { nombre: 'Juan' }, { nombre: 'Hechos' }, { nombre: 'Romanos' }, { nombre: '1 Corintios' }, { nombre: '2 Corintios' }, { nombre: 'Gálatas' }, { nombre: 'Efesios' }, { nombre: 'Filipenses' }, { nombre: 'Colosenses' }, { nombre: '1 Tesalonicenses' }, { nombre: '2 Tesalonicenses' }, { nombre: '1 Timoteo' }, { nombre: '2 Timoteo' }, { nombre: 'Tito' }, { nombre: 'Filemón' }, { nombre: 'Hebreos' }, { nombre: 'Santiago' }, { nombre: '1 Pedro' }, { nombre: '2 Pedro' }, { nombre: '1 Juan' }, { nombre: '2 Juan' }, { nombre: '3 Juan' }, { nombre: 'Judas' }, { nombre: 'Apocalipsis' }
];

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
    if (buscado === "marcos" && usfmJson === "MRK") return true;
    if (buscado === "lucas" && usfmJson === "LUK") return true;
    if (buscado === "numeros" && usfmJson === "NUM") return true;
    return false;
  });
};

const EstrellasFondo = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
    <div className="absolute inset-0 bg-black/85"></div>
  </div>
);

const themeStyles = { claro: 'bg-slate-50 text-slate-900 border-slate-200', cym: 'bg-[#000000] text-slate-200 border-[#cca300]', sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#d4b886]' };
const navStyles = { claro: 'bg-white/90 border-slate-200 text-slate-800', cym: 'bg-black/70 border-[#cca300]/30 text-[#fcd34d]', sepia: 'bg-[#f4e4c3]/90 border-[#d4b886] text-[#5f4b32]' };

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [vistaActual, setVistaActual] = useState('home'); 
  const [versionActual, setVersionActual] = useState('RVR1960');
  const [libroActual, setLibroActual] = useState('Génesis');
  const [capituloActual, setCapituloActual] = useState(1);
  const [versiculoActual, setVersiculoActual] = useState('');
  const [tema, setTema] = useState('cym');
  const [tamañoFuente, setTamañoFuente] = useState(18);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [mostrarModalDevocional, setMostrarModalDevocional] = useState(false);
  const [mostrarAsistente, setMostrarAsistente] = useState(false);
  const [leyendoAudio, setLeyendoAudio] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [chatHistorial, setChatHistorial] = useState([{ rol: 'asistente', texto: '¡Hola! Soy tu asistente bíblico CyM. Pregúntame lo que necesites.' }]);
  
  // Novedad: Amigos y Foto
  const [listaAmigos, setListaAmigos] = useState([]);
  const [emailBuscar, setEmailBuscar] = useState('');
  const inputRefFoto = useRef(null);
  const versiculoRefs = useRef({});

  const cargarAmigos = async (amigosIds) => {
    if (!amigosIds || amigosIds.length === 0) return;
    const datos = [];
    for (const id of amigosIds) {
      const snap = await getDoc(doc(db, 'cym_usuarios', id));
      if (snap.exists()) datos.push(snap.data());
    }
    datos.sort((a, b) => (b.puntosTrivia || 0) - (a.puntosTrivia || 0));
    setListaAmigos(datos);
  };

  const cargarOcrearUsuario = async (user) => {
    if (!user) return null;
    const emailLower = user.email.toLowerCase();
    const isGodMode = emailLower === 'maxdelanus@gmail.com' || emailLower === 'maximiliano.fontan@newsan.com.ar';
    const userRef = doc(db, 'cym_usuarios', user.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      let userData;

      if (userSnap.exists()) {
        userData = userSnap.data();
        if (isGodMode) { userData.role = 'OWNER'; userData.suscripcion = 'DIAMANTE'; userData.creditosIA = 9999; }
      } else {
        userData = { email: emailLower, nombre: user.displayName || 'Hermano/a', role: isGodMode ? 'OWNER' : 'USER', suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', creditosIA: isGodMode ? 9999 : 3, puntosTrivia: 0, amigos: [], photoURL: user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png", fechaRegistro: new Date().toISOString() };
        await setDoc(userRef, userData);
      }

      // --- MAGIA DEL LINK DE WHATSAPP ---
      const params = new URLSearchParams(window.location.search);
      const amigoRefId = params.get('ref');
      if (amigoRefId && amigoRefId !== user.uid) {
        // Te agrega a vos el amigo
        await updateDoc(userRef, { amigos: arrayUnion(amigoRefId) });
        // Le agrega a tu amigo tu usuario
        await updateDoc(doc(db, 'cym_usuarios', amigoRefId), { amigos: arrayUnion(user.uid) });
        userData.amigos.push(amigoRefId);
        window.history.replaceState(null, '', window.location.pathname); // Limpia el link
      }

      cargarAmigos(userData.amigos);
      return { uid: user.uid, photoURL: user.photoURL, ...userData };
    } catch (error) { return { uid: user.uid, email: emailLower, nombre: user.displayName, role: isGodMode ? 'OWNER' : 'USER', suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', creditosIA: 3, puntosTrivia: 0 }; }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) { const perfil = await cargarOcrearUsuario(user); setCurrentUser(perfil); } 
      else setCurrentUser(null);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try { setIsLoadingAuth(true); const result = await signInWithPopup(auth, googleProvider); if (result.user) setCurrentUser(await cargarOcrearUsuario(result.user)); } 
    catch (error) { console.error(error); setIsLoadingAuth(false); }
  };

  const handleLogout = async () => { await signOut(auth); setCurrentUser(null); setVistaActual('home'); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("La imagen es muy pesada. Elegí una que pese menos de 1MB."); return; }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { photoURL: base64String });
        setCurrentUser({...currentUser, photoURL: base64String});
      };
      reader.readAsDataURL(file);
    }
  };

  const buscarYAgregarAmigo = async () => {
    if(!emailBuscar) return;
    try {
      const q = query(collection(db, "cym_usuarios"), where("email", "==", emailBuscar.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { alert("No se encontró ningún usuario con ese correo."); return; }
      const amigoId = querySnapshot.docs[0].id;
      if (amigoId === currentUser.uid) { alert("¡No puedes agregarte a ti mismo!"); return; }
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { amigos: arrayUnion(amigoId) });
      alert("¡Amigo agregado con éxito!");
      setEmailBuscar('');
      const userSnap = await getDoc(doc(db, 'cym_usuarios', currentUser.uid));
      cargarAmigos(userSnap.data().amigos);
    } catch (e) { alert("Error al buscar."); }
  };

  const retarAmigo = () => {
    const mensaje = `¡Hola! Logré ${currentUser.puntosTrivia || 0} puntos en el Desafío Bíblico de CyM. 📖🏆 ¿Te animás a superarme? Jugá acá: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const isOwner = currentUser?.role === 'OWNER';
  const isPremium = isOwner || (currentUser?.suscripcion !== 'GRATIS' && currentUser?.suscripcion !== undefined);

  useEffect(() => { window.speechSynthesis.cancel(); setLeyendoAudio(false); }, [capituloActual, libroActual, vistaActual]);

  const toggleLecturaAudio = () => {
    if (!isPremium) { setVistaActual('club'); return; }
    if (leyendoAudio) { window.speechSynthesis.cancel(); setLeyendoAudio(false); return; }
    const textoCompleto = obtenerVersiculos().map(v => v.texto).join('. ');
    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-ES'; utterance.rate = 0.9; utterance.onend = () => setLeyendoAudio(false);
    window.speechSynthesis.speak(utterance);
    setLeyendoAudio(true);
  };

  useEffect(() => {
    const manejarBotonAtras = () => {
      if (mostrarModalDevocional) setMostrarModalDevocional(false);
      else if (mostrarAsistente) setMostrarAsistente(false);
      else if (vistaActual !== 'home') { setVistaActual('home'); setVersiculoActual(''); }
    };
    window.history.pushState(null, '');
    window.addEventListener('popstate', manejarBotonAtras);
    return () => window.removeEventListener('popstate', manejarBotonAtras);
  }, [vistaActual, mostrarModalDevocional, mostrarAsistente]);

  const diasTranscurridos = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
  const lecturaHoy = LECTURAS_DIARIAS[diasTranscurridos % LECTURAS_DIARIAS.length] || LECTURAS_DIARIAS[0];
  const devocionalHoy = lecturaHoy.devocional || devocionalPorDefecto;

  const obtenerVersiculos = () => {
    try {
      const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
      if (!libroData) return [];
      if (!libroData.chapters) {
        if (libroData.verses) return libroData.verses.filter(v => Number(v.chapter) === capituloActual).map(v => ({ numero: String(v.verse), texto: v.text }));
        return [];
      }
      const capitulosReales = libroData.chapters.filter(c => c && c.is_chapter === true);
      const capituloData = capitulosReales[capituloActual - 1];
      if (!capituloData || !capituloData.items) return [];
      return capituloData.items.filter(item => item && item.type === "verse").map(item => ({ numero: item.verse_numbers ? String(item.verse_numbers[0]) : '', texto: item.lines ? item.lines.join(' ') : (item.text || '') }));
    } catch (e) { return [{ numero: '⚠️', texto: `Error en lectura: ${e.message}` }]; }
  };
  const versiculosActuales = obtenerVersiculos();

  useEffect(() => {
    if (versiculoActual && versiculoRefs.current[versiculoActual]) { setTimeout(() => { versiculoRefs.current[versiculoActual].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); }
  }, [versiculoActual, capituloActual, libroActual]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isOwner && currentUser.creditosIA <= 0) { setChatHistorial([...chatHistorial, { rol: 'asistente', texto: '⚠️ Has agotado tus consultas. Adquiere tu Pase Premium en el Club CyM.' }]); setChatInput(''); return; }
    const nuevoHistorial = [...chatHistorial, { rol: 'usuario', texto: chatInput }];
    setChatHistorial(nuevoHistorial); setChatInput(''); setCargandoIA(true);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || window.VITE_OPENAI_API_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: `Consejero pastoral para 'CyM Biblia'. Leyendo ${libroActual} ${capituloActual}.` }, { role: "user", content: chatInput }], temperature: 0.7 }) });
      const data = await response.json();
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: data.choices?.[0]?.message?.content || "Error en la respuesta." }]);
      if (!isOwner) { const nuevoLimite = currentUser.creditosIA - 1; setCurrentUser({...currentUser, creditosIA: nuevoLimite}); await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { creditosIA: nuevoLimite }); }
    } catch (error) { setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: `⚠️ Error: ${error.message}` }]); } 
    finally { setCargandoIA(false); }
  };

  const abrirLibro = (nombreLibro, capitulo = 1) => { setLibroActual(nombreLibro); setCapituloActual(capitulo); setVersiculoActual(''); setVistaActual('lector'); window.scrollTo(0, 0); };

  if (isLoadingAuth) { return (<div className="min-h-screen bg-black flex flex-col items-center justify-center text-center"><Loader2 size={48} className="text-[#ffd700] animate-spin mb-4" /><p className="text-[#ffd700] font-black tracking-widest uppercase">Conectando al Ministerio...</p></div>); }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative select-none">
        <EstrellasFondo />
        <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM Biblia" className="w-full max-w-[350px] h-[350px] object-contain drop-shadow-[0_0_60px_rgba(245,194,66,0.65)] relative z-10" />
        <div className="relative z-10 w-full max-w-sm mt-4">
          <h1 className="text-5xl font-serif font-black tracking-wide bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text mb-6">CyM Biblia</h1>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-black text-sm tracking-widest shadow-2xl hover:scale-105 transition-all"><LogIn size={18}/> Ingresar con Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-serif relative ${themeStyles[tema].split(' ')[0]} ${themeStyles[tema].split(' ')[1]}`}>
      {tema === 'cym' && <EstrellasFondo />}

      <nav className={`sticky top-0 z-50 px-3 py-3 shadow-md flex items-center justify-between backdrop-blur-md border-b ${navStyles[tema]}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setVistaActual('home'); setVersiculoActual(''); }}>
          {vistaActual !== 'home' && <ArrowLeft size={24} className="mr-1" />}
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(204,163,0,0.5)]" />
          <h1 className="text-xl font-black tracking-wider hidden sm:block">CyM <span className="font-light opacity-80">Biblia</span></h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 relative z-10">
          <button onClick={() => setVistaActual('comunidad')} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-green-600 text-white shadow-md hover:scale-105"><Users size={16} /> <span className="hidden sm:inline">Comunidad</span></button>
          <button onClick={() => setVistaActual('trivia')} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-blue-600 text-white shadow-md hover:scale-105"><Gamepad2 size={16} /> <span className="hidden sm:inline">Jugar</span></button>
          <button onClick={() => setVistaActual('club')} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md hover:scale-105"><Crown size={16} className="fill-black" /> <span className="hidden sm:inline">Club CyM</span></button>
          <button onClick={() => setMostrarAjustes(!mostrarAjustes)} className="p-2 md:p-3 rounded-full hover:bg-white/10"><Settings size={20} /></button>
          <button onClick={handleLogout} className="p-2 md:p-3 rounded-full text-red-500 hover:bg-red-500/20"><LogOut size={20} /></button>
        </div>
      </nav>

      {mostrarAjustes && (
        <div className={`fixed top-20 right-6 p-5 rounded-2xl shadow-2xl border w-72 z-40 ${tema === 'cym' ? 'bg-[#141414] border-[#cca300]/50' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">Tamaño de lectura</p>
          <div className="flex items-center justify-between mb-6 bg-black/5 rounded-lg p-1 border border-current/10">
            <button onClick={() => setTamañoFuente(Math.max(14, tamañoFuente - 2))} className="p-2 hover:bg-black/10 rounded"><Type size={16} /></button>
            <span className="font-bold text-sm">{tamañoFuente}px</span>
            <button onClick={() => setTamañoFuente(Math.min(32, tamañoFuente + 2))} className="p-2 hover:bg-black/10 rounded"><Type size={22} /></button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">Estilo Visual</p>
          <div className="flex gap-2">
            <button onClick={() => setTema('claro')} className={`flex-1 p-3 rounded-xl border-2 shadow-sm ${tema === 'claro' ? 'border-slate-800 bg-slate-100' : 'border-transparent bg-white text-slate-900'}`}><Sun size={18} className="mx-auto"/></button>
            <button onClick={() => setTema('sepia')} className={`flex-1 p-3 rounded-xl border-2 shadow-sm ${tema === 'sepia' ? 'border-[#8b6b4a] bg-[#e6d5b8]' : 'border-transparent bg-[#fbf0d9] text-[#5f4b32]'}`}><BookOpen size={18} className="mx-auto"/></button>
            <button onClick={() => setTema('cym')} className={`flex-1 p-3 rounded-xl border-2 shadow-sm ${tema === 'cym' ? 'border-[#ffd700] bg-black' : 'border-transparent bg-[#0a0a0a] text-[#ffd700]'}`}><Sparkles size={18} className="mx-auto text-[#ffd700]"/></button>
          </div>
        </div>
      )}

      {mostrarModalDevocional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl border relative overflow-y-auto max-h-[85vh] ${tema === 'cym' ? 'bg-[#0f0f0f] border-[#cca300]/40 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button onClick={() => setMostrarModalDevocional(false)} className="absolute top-5 right-5 p-1"><X size={22} /></button>
            <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><Sparkles size={12} /> Alimento Espiritual</p>
            <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text">{devocionalHoy.titulo}</h3>
            <p className="text-xs font-bold opacity-60 mb-6 italic">Lectura: {lecturaHoy.libro} {lecturaHoy.capitulo}</p>
            <div className="space-y-6" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.6' }}>
              <div><h4 className="text-xs font-black uppercase text-[#ffd700] mb-2"><FileText size={14} className="inline mr-1"/> Reflexión</h4><p>{devocionalHoy.reflexion}</p></div>
              <div className="p-4 bg-amber-500/5 border border-[#cca300]/20 rounded-2xl italic"><h4 className="text-xs font-black uppercase text-[#ffd700] mb-2"><Heart size={14} className="inline mr-1 fill-current"/> Oración</h4><p>"{devocionalHoy.oracion}"</p></div>
            </div>
            <button onClick={() => { setMostrarModalDevocional(false); abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo); }} className="w-full mt-6 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02]">Ir a la Lectura</button>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 relative z-10">
        
        {vistaActual === 'home' && (
          <div className="space-y-8">
            {/* PERFIL */}
            <div className="bg-black/80 border border-[#cca300]/40 p-5 rounded-3xl backdrop-blur-md flex items-center shadow-xl">
              <input type="file" accept="image/*" ref={inputRefFoto} className="hidden" onChange={handleImageUpload} />
              <div className="relative group cursor-pointer mr-4" onClick={() => inputRefFoto.current.click()}>
                <img src={currentUser.photoURL} alt="Perfil" className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#ffd700] object-cover" />
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={18} className="text-white" /></div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">{currentUser.nombre || currentUser.email}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isOwner ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white'}`}>{isOwner ? '👑 OWNER / DIAMANTE' : `MEMBRESÍA ${currentUser.suscripcion || 'GRATIS'}`}</span>
                  <span className="text-xs text-[#ffd700] font-bold flex items-center gap-1"><Zap size={12}/> {isOwner ? 'Créditos Ilimitados' : `${currentUser.creditosIA} Consultas IA`}</span>
                </div>
              </div>
            </div>

            {/* SELECTOR BÍBLICO GLOBAL */}
            <div className="bg-black/70 border border-[#cca300]/30 p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4"><BookOpen size={22} className="text-[#ffd700]" /><h3 className="text-[#ffd700] font-black text-base uppercase">Investigación Bíblica</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#cca300]/40 text-amber-300 p-3 rounded-xl font-bold text-sm outline-none">
                  <option value="RVR1960">Reina Valera 1960</option>
                  <option value="NTV">NTV</option>
                  <option value="DHH">DHH</option>
                  <option value="LBLA">LBLA</option>
                  <option value="TLA">TLA</option>
                </select>
                <select value={libroActual} onChange={(e) => { setLibroActual(e.target.value); setCapituloActual(1); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-3 rounded-xl font-bold text-sm outline-none">
                  {LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}
                </select>
                <select value={capituloActual} onChange={(e) => setCapituloActual(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-3 rounded-xl font-bold text-sm outline-none">
                  {Array.from({ length: 150 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Capítulo {n}</option>)}
                </select>
                <select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/20 text-amber-300 p-3 rounded-xl font-bold text-sm outline-none">
                  <option value="">Todo el cap.</option>
                  {versiculosActuales.map((v) => <option key={v.numero} value={v.numero}>Versículo {v.numero}</option>)}
                </select>
              </div>
              <button onClick={() => setVistaActual('lector')} className="w-full bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-4 rounded-xl text-sm uppercase flex items-center justify-center gap-2">
                <BookOpen size={18} /> Abrir Lectura Seleccionada
              </button>
            </div>

            {/* TRIVIA, COMUNIDAD Y CLUB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-950/60 to-black border border-blue-500/40 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Gamepad2 size={24} className="text-blue-400" /><h4 className="text-blue-400 font-black uppercase">Desafío Bíblico</h4></div>
                    <button onClick={retarAmigo} className="p-2 bg-blue-600 text-white rounded-full"><Share2 size={16} /></button>
                  </div>
                  <p className="text-white font-bold text-3xl mb-1">{currentUser.puntosTrivia || 0} PTS</p>
                  <p className="text-slate-400 text-xs mb-4">Sumá puntos reales y usá el botón de arriba para compartir tus rachas por WhatsApp.</p>
                </div>
                <button onClick={() => setVistaActual('trivia')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-sm uppercase"><Gamepad2 size={18} className="inline mr-2"/>Iniciar Desafío</button>
              </div>

              <div className="bg-gradient-to-br from-amber-950/60 to-black border border-amber-500/40 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Award size={24} className="text-amber-400" /><h4 className="text-amber-400 font-black uppercase">Club CyM</h4></div>
                  <p className="text-white font-bold text-lg mb-1">Apoyo al Ministerio</p>
                  <p className="text-slate-400 text-xs mb-4">Desbloqueá IA pastoral y audios apoyándonos mes a mes.</p>
                </div>
                <button onClick={() => setVistaActual('club')} className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-4 rounded-xl text-sm uppercase"><Crown size={18} className="inline mr-2"/>Donar con MercadoPago</button>
              </div>
            </div>

            {/* DEVOCIONAL */}
            <div className="relative overflow-hidden rounded-3xl p-6 shadow-xl border border-[#cca300]/40" style={{background: 'linear-gradient(135deg, rgba(30,25,0,0.85) 0%, rgba(0,0,0,0.85) 100%)'}}>
              <div className="absolute top-0 right-0 p-6 opacity-10"><Heart size={80} color="#ffd700" /></div>
              <p className="text-[#cca300] font-black text-[10px] uppercase mb-2"><Sparkles size={12} className="inline mr-1"/> Lectura Recomendada</p>
              <h2 className="text-3xl font-black text-[#fcd34d] mb-4">{lecturaHoy.libro} {lecturaHoy.capitulo}</h2>
              <div className="flex gap-3 w-full">
                <button onClick={() => abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo)} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10"><BookOpen size={16} className="inline"/> Leer</button>
                <button onClick={() => setMostrarModalDevocional(true)} className="flex-1 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-3 rounded-xl"><Sparkles size={16} className="inline"/> Devocional</button>
              </div>
            </div>

            {/* LISTA DE LIBROS */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 bg-black/60 p-2 rounded inline-block">Antiguo Testamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {librosAntiguo.map((libro) => (
                    <button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4"><div className="p-2 rounded-full bg-white/10"><BookOpen size={16} /></div><span className="font-bold">{libro.nombre}</span></div>
                      <ChevronRight size={18} className="opacity-30" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 bg-black/60 p-2 rounded inline-block">Nuevo Testamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {librosNuevo.map((libro) => (
                    <button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4"><div className="p-2 rounded-full bg-white/10"><BookOpen size={16} /></div><span className="font-bold">{libro.nombre}</span></div>
                      <ChevronRight size={18} className="opacity-30" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VISTA COMUNIDAD (AMIGOS / RANKING) --- */}
        {vistaActual === 'comunidad' && (
          <div className="bg-black/80 border border-[#cca300]/30 p-6 rounded-3xl">
            <h2 className="text-2xl font-black text-[#ffd700] mb-4 flex items-center gap-2"><Users /> Mis Amigos / Ranking</h2>
            
            {/* NUEVO BOTÓN DE WHATSAPP */}
            <button 
              onClick={() => {
                const url = `${window.location.origin}?ref=${currentUser.uid}`;
                const mensaje = `¡Sumate a CyM Biblia y compitamos en la Trivia! Hacé clic acá para entrar y agregarnos automáticamente como amigos: ${url}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-4 rounded-xl mb-6 shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              Invitar amigos por WhatsApp
            </button>

            <div className="flex flex-col md:flex-row gap-2 mb-6">
              <input type="email" value={emailBuscar} onChange={(e) => setEmailBuscar(e.target.value)} placeholder="O buscar por email..." className="flex-1 bg-[#1a1a1a] border border-[#cca300]/40 rounded-xl px-4 py-3 text-white outline-none" />
              <button onClick={buscarYAgregarAmigo} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><UserPlus size={18}/> Buscar</button>
            </div>

            <div className="space-y-3">
              {listaAmigos.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Todavía no tenés amigos. ¡Mandales un WhatsApp con el botón verde de arriba!</p>
              ) : (
                listaAmigos.map((amigo, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-500 text-lg w-4">{index + 1}</span>
                      <img src={amigo.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className="w-12 h-12 rounded-full border border-slate-500 object-cover" alt="foto" />
                      <div><p className="font-bold text-white">{amigo.nombre}</p><p className="text-[10px] text-amber-400 font-black uppercase">{amigo.suscripcion}</p></div>
                    </div>
                    <div className="text-right"><p className="font-black text-xl text-blue-400">{amigo.puntosTrivia || 0}</p><p className="text-[10px] uppercase text-slate-400 font-bold">Puntos</p></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- VISTA LECTOR BÍBLICO (CON SELECTORES ADENTRO) --- */}
        {vistaActual === 'lector' && (
          <div className="bg-black/70 p-4 md:p-10 rounded-3xl backdrop-blur-md border border-[#cca300]/20 shadow-2xl">
            {/* SELECTORES IN-READER */}
            <div className="mb-8 p-4 bg-black/50 border border-[#cca300]/30 rounded-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#cca300]/40 text-amber-300 p-2 rounded-lg font-bold text-sm outline-none"><option value="RVR1960">Reina Valera 1960</option><option value="NTV">NTV</option><option value="TLA">TLA</option></select>
                <select value={libroActual} onChange={(e) => { setLibroActual(e.target.value); setCapituloActual(1); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-sm outline-none">{LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}</select>
                <select value={capituloActual} onChange={(e) => setCapituloActual(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-sm outline-none">{Array.from({ length: 150 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Cap. {n}</option>)}</select>
                <select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/20 text-amber-300 p-2 rounded-lg font-bold text-sm outline-none"><option value="">Ir a Versículo</option>{versiculosActuales.map((v) => <option key={v.numero} value={v.numero}>Versículo {v.numero}</option>)}</select>
              </div>
            </div>

            <div className="mb-12 text-center flex flex-col items-center">
              <h2 className="text-3xl font-black mb-6 text-[#ffd700]" style={{ fontSize: `${tamañoFuente * 1.8}px` }}>
                {libroActual} {capituloActual} <span className="opacity-60">({versionActual})</span>
              </h2>
              <button onClick={toggleLecturaAudio} className={`flex items-center gap-2 px-6 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-lg ${leyendoAudio ? 'bg-red-600 text-white animate-pulse' : 'bg-[#cca300]/20 text-[#ffd700] hover:bg-[#cca300]/40'}`}>
                {leyendoAudio ? <Square size={18} fill="currentColor"/> : <Volume2 size={18} />} {leyendoAudio ? 'Detener' : 'Escuchar Capítulo'}
              </button>
            </div>

            <div className="space-y-4 leading-relaxed text-left" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.7' }}>
              {versiculosActuales.map((versiculo, index) => {
                const esResaltado = versiculo.numero === versiculoActual;
                return (
                  <p key={index} ref={el => versiculoRefs.current[versiculo.numero] = el} className="relative group">
                    <sup className={`absolute -left-6 md:-left-8 top-1 text-[0.6em] font-black ${esResaltado ? 'text-amber-400 text-sm' : 'text-[#ffd700]/60'}`}>{versiculo.numero}</sup>
                    <span className={`rounded p-2 transition-colors block ${esResaltado ? 'bg-amber-500/20 text-[#ffd700] border-l-4 border-[#ffd700] pl-3 font-bold' : 'hover:bg-[#ffd700]/10'}`}>{versiculo.texto}</span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULOS EXTERNOS */}
        {vistaActual === 'trivia' && <ModuloTrivia currentUser={currentUser} db={db} onVolver={() => setVistaActual('home')} />}
        {vistaActual === 'club' && <ModuloClub onVolver={() => setVistaActual('home')} onSuscribir={() => window.open('https://link.mercadopago.com.ar/crecerymultiplicar', '_blank')} />}
      </main>

      {/* ASISTENTE IA */}
      {vistaActual === 'lector' && (
        <div className="fixed bottom-20 right-4 md:right-6 z-50">
          {mostrarAsistente ? (
            <div className="w-80 h-[400px] rounded-2xl shadow-2xl flex flex-col border overflow-hidden bg-[#141414] border-[#cca300]/50">
              <div className="p-4 flex justify-between items-center border-b bg-black border-[#cca300]/30">
                <div className="flex items-center gap-2"><Sparkles size={18} className="text-[#ffd700]" /><span className="font-bold text-sm text-white">Asistente CyM</span></div>
                <button onClick={() => setMostrarAsistente(false)} className="text-white p-2"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col text-sm">
                {chatHistorial.map((msg, i) => (<div key={i} className={`p-3 rounded-xl max-w-[85%] ${msg.rol === 'usuario' ? 'self-end bg-[#cca300] text-black font-bold' : 'self-start bg-white/10 text-slate-200'}`}>{msg.texto}</div>))}
              </div>
              <form onSubmit={enviarMensaje} className="p-3 border-t flex gap-2 bg-black border-[#cca300]/30">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Preguntale a la IA..." className="flex-1 rounded-full px-4 py-3 text-sm outline-none bg-[#1a1a1a] text-white" />
                <button type="submit" className="p-3 rounded-full bg-[#cca300] text-black"><Send size={18} /></button>
              </form>
            </div>
          ) : (
            <button onClick={() => setMostrarAsistente(true)} className="p-5 rounded-full shadow-2xl bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-black hover:scale-110 transition-transform">
              <MessageCircle size={28} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}