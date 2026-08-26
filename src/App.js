import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Settings, Type, Sun, Sparkles, ArrowLeft, 
  Heart, MessageCircle, X, Send, FileText, Volume2, Square, Crown,
  Loader2, LogOut, LogIn, Gamepad2, Award, Zap, Users, Edit2, Share2, UserPlus,
  GraduationCap, Calendar, Clock, PlusCircle, CheckCircle, ShieldCheck, DollarSign,
  Upload, Download, Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion, addDoc } from 'firebase/firestore';

// MÓDULOS EXISTENTES
import ModuloTrivia from './ModuloTrivia';
import ModuloClub from './ModuloClub';

// BASES DE DATOS BÍBLICAS
import BibliaRVR from './data/RVR1960.json';
import BibliaNTV from './data/NTV.json';
import BibliaDHH from './data/DHH.json';
import BibliaLBLA from './data/LBLA.json';
import BibliaTLA from './data/TLA.json';

// --- CONFIGURACIÓN OFICIAL DE FIREBASE ---
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
  { libro: 'Salmos', capitulo: 1, devocional: { titulo: 'El Camino de la Bendición', reflexion: 'El Salmo 1 nos planta frente a una gran verdad: nuestras decisiones determinan nuestro destino. El hombre bienaventurado no camina bajo el consejo del mundo, sino que echa raíces junto a las corrientes de agua de la Palabra de Dios.', oracion: 'Señor Jesús, ayúdame a deleitarme en tu Palabra cada día. Amén.' } }, 
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
  const sub = suscripcion?.toUpperCase() || 'GRATIS';
  if (role === 'OWNER') return { colorAro: 'border-[#00a86b]', colorBadge: 'bg-[#00a86b] text-white', texto: '👑 OWNER / DIAMANTE' };
  if (sub === 'BRONCE') return { colorAro: 'border-[#cd7f32]', colorBadge: 'bg-[#cd7f32] text-white', texto: 'SOCIO BRONCE' };
  if (sub === 'PLATA') return { colorAro: 'border-[#c0c0c0]', colorBadge: 'bg-[#c0c0c0] text-black', texto: 'SOCIO PLATA' };
  if (sub === 'ORO') return { colorAro: 'border-[#ffd700]', colorBadge: 'bg-[#ffd700] text-black', texto: 'SOCIO ORO' };
  if (sub === 'DIAMANTE') return { colorAro: 'border-[#00a86b]', colorBadge: 'bg-[#00a86b] text-white', texto: 'SOCIO DIAMANTE' };
  return { colorAro: 'border-[#3b82f6]', colorBadge: 'bg-[#3b82f6] text-white', texto: 'MEMBRESÍA GRATIS' };
};

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
  const [chatHistorial, setChatHistorial] = useState([{ rol: 'asistente', texto: '¡Hola! Soy tu asistente bíblico CyM. Pregúntame lo que necesites sobre la Biblia.' }]);

  const [listaAmigos, setListaAmigos] = useState([]);
  const [emailBuscar, setEmailBuscar] = useState('');
  const inputRefFoto = useRef(null);
  const versiculoRefs = useRef({});

  // ESTADOS DE CAPACITACIONES
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

  // ESTADOS DE PREDICACIONES / BOSQUEJOS
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

  const cargarCursosFirebase = async () => {
    setCargandoCursos(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'cym_capacitaciones'));
      const docs = [];
      querySnapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setCursos(docs);
    } catch (e) { console.error("Error cargando capacitaciones:", e); }
    finally { setCargandoCursos(false); }
  };

  const cargarPredicacionesFirebase = async () => {
    setCargandoPredicas(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'cym_predicaciones'));
      const docs = [];
      querySnapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setListaPredicaciones(docs);
    } catch (e) { console.error("Error cargando predicaciones:", e); }
    finally { setCargandoPredicas(false); }
  };

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
        if (isGodMode && userData.role !== 'OWNER') {
          userData.role = 'OWNER'; userData.suscripcion = 'DIAMANTE'; userData.creditosIA = 9999;
          await updateDoc(userRef, { role: 'OWNER', suscripcion: 'DIAMANTE', creditosIA: 9999 });
        }
      } else {
        userData = { 
          email: emailLower, nombre: user.displayName || 'Hermano/a', role: isGodMode ? 'OWNER' : 'USER', 
          suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', creditosIA: isGodMode ? 9999 : 3, puntosTrivia: 0, 
          amigos: [], photoURL: user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png", 
          fechaRegistro: new Date().toISOString(), descargasMesActual: 0, ultimoMesDescarga: mesActualClave
        };
        await setDoc(userRef, userData);
      }

      if (!userData.amigos) userData.amigos = [];
      if (userData.ultimoMesDescarga !== mesActualClave) {
        userData.descargasMesActual = 0;
        userData.ultimoMesDescarga = mesActualClave;
        await updateDoc(userRef, { descargasMesActual: 0, ultimoMesDescarga: mesActualClave });
      }

      cargarAmigos(userData.amigos);
      const fotoFinal = userData.photoURL ? userData.photoURL : (user.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png");
      return { uid: user.uid, ...userData, photoURL: fotoFinal };
    } catch (error) { return { uid: user.uid, email: emailLower, nombre: user.displayName, role: isGodMode ? 'OWNER' : 'USER', suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS', creditosIA: 3, puntosTrivia: 0, photoURL: user.photoURL }; }
  };

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      if (user) {
        const u = await cargarOcrearUsuario(user);
        setCurrentUser(u); 
        cargarCursosFirebase();
        cargarPredicacionesFirebase();
      } else { setCurrentUser(null); }
      setIsLoadingAuth(false); 
    }); 
    return () => unsubscribe(); 
  }, []);

  const handleLogin = async () => { try { setIsLoadingAuth(true); const result = await signInWithPopup(auth, googleProvider); if (result.user) setCurrentUser(await cargarOcrearUsuario(result.user)); } catch (error) { setIsLoadingAuth(false); } };
  const handleLogout = async () => { await signOut(auth); setCurrentUser(null); setVistaActual('home'); };

  const handleCrearCapacitacion = async (e) => {
    e.preventDefault();
    if (!nombreClaseInput || !valorCuotaInput || !linkMercadoPagoInput || !linkGrupoWhatsAppInput) {
      alert("Por favor completá los campos obligatorios (*).");
      return;
    }
    setGuardandoCurso(true);
    try {
      await addDoc(collection(db, 'cym_capacitaciones'), {
        nombreClase: nombreClaseInput, descripcion: descripcionCursoInput,
        dias: diasCursoInput, horario: horarioCursoInput, valorCuota: valorCuotaInput,
        linkMercadoPago: linkMercadoPagoInput, linkGrupoWhatsApp: linkGrupoWhatsAppInput,
        fechaCreacion: new Date().toISOString()
      });
      alert("¡Capacitación publicada en la Academia!");
      setNombreClaseInput(''); setDescripcionCursoInput(''); setDiasCursoInput('');
      setHorarioCursoInput(''); setValorCuotaInput(''); setLinkMercadoPagoInput('');
      setLinkGrupoWhatsAppInput(''); setMostrarFormCapacitacion(false);
      cargarCursosFirebase();
    } catch (err) { alert("Error al guardar: " + err.message); }
    finally { setGuardandoCurso(false); }
  };

  const handleCompletarIngresoWhatsApp = async (cursoId, linkWhatsApp) => {
    if (!telefonoWhatsAppAlumno.trim()) { alert("Ingresá tu teléfono para registrarte."); return; }
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, { cursosInscriptos: arrayUnion({ cursoId, telefonoWhatsApp: telefonoWhatsAppAlumno, fecha: new Date().toISOString() }) });
      alert("¡Registro completo! Te redirigimos al grupo oficial.");
      window.open(linkWhatsApp, '_blank');
      setCursoSeleccionadoPago(null); setTelefonoWhatsAppAlumno('');
    } catch (e) { alert("Error al registrar: " + e.message); }
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
      alert("Ingresá el título, pasaje bíblico y adjuntá el archivo Word.");
      return;
    }
    setSubiendoPredica(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await addDoc(collection(db, 'cym_predicaciones'), {
          titulo: tituloPredicaInput, pasaje: pasajePredicaInput,
          nombreArchivo: archivoWordTemp.name, archivoBase64: ev.target.result,
          portadaBase64: portadaImageTemp || null, fechaSubida: new Date().toISOString()
        });
        alert("¡Prédica publicada con éxito!");
        setTituloPredicaInput(''); setPasajePredicaInput(''); setArchivoWordTemp(null); setPortadaImageTemp(null);
        cargarPredicacionesFirebase();
      } catch (err) { alert("Error al guardar: " + err.message); }
      finally { setSubiendoPredica(false); }
    };
    reader.readAsDataURL(archivoWordTemp);
  };

  const handleDescargarArchivoPredica = async (predica, tipo) => {
    const sub = currentUser?.suscripcion?.toUpperCase() || 'GRATIS';
    const rol = currentUser?.role || 'USER';

    if (rol !== 'OWNER' && sub !== 'DIAMANTE') {
      alert("🔒 La biblioteca de prédicas en Word y portadas es exclusiva del Plan Diamante ($30.000/mes). Podés unirte en el Club CyM.");
      setVistaActual('club'); return;
    }

    if (tipo === 'word') {
      let descargasUsadas = currentUser.descargasMesActual || 0;
      if (currentUser.ultimoMesDescarga !== mesActualClave) descargasUsadas = 0;
      if (rol !== 'OWNER' && descargasUsadas >= 10) { alert("⚠️ Has alcanzado el límite de 10 descargas de prédicas en Word para este mes."); return; }

      const link = document.createElement('a'); link.href = predica.archivoBase64;
      link.download = predica.nombreArchivo || `${predica.titulo}.docx`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);

      if (rol !== 'OWNER') {
        const nuevoTotal = descargasUsadas + 1;
        await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { descargasMesActual: nuevoTotal, ultimoMesDescarga: mesActualClave });
        setCurrentUser(prev => ({ ...prev, descargasMesActual: nuevoTotal, ultimoMesDescarga: mesActualClave }));
        alert(`¡Descarga iniciada! Has usado ${nuevoTotal} de 10 descargas este mes.`);
      }
    } else if (tipo === 'portada') {
      if (!predica.portadaBase64) { alert("Esta prédica no incluye imagen de portada."); return; }
      const link = document.createElement('a'); link.href = predica.portadaBase64;
      link.download = `Portada_${predica.titulo}.jpg`;
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
            alert("¡Foto de perfil actualizada correctamente!");
          } catch (error) { alert("Hubo un error al guardar la foto."); }
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
      if (querySnapshot.empty) { alert("No se encontró ningún usuario con ese correo."); return; }
      const amigoId = querySnapshot.docs[0].id;
      if (amigoId === currentUser.uid) { alert("¡No puedes agregarte a ti mismo!"); return; }
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { amigos: arrayUnion(amigoId) });
      alert("¡Amigo agregado con éxito!"); setEmailBuscar('');
      const userSnap = await getDoc(doc(db, 'cym_usuarios', currentUser.uid));
      cargarAmigos(userSnap.data().amigos);
    } catch (e) { alert("Error al buscar."); }
  };

  const retarAmigo = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola! Logré ${currentUser.puntosTrivia || 0} puntos en el Desafío Bíblico de CyM. 📖🏆 ¿Te animás a superarme? Jugá acá: ${window.location.origin}?ref=${currentUser.uid}`)}`, '_blank'); };

  const isOwner = currentUser?.role === 'OWNER';
  const isPremium = isOwner || (currentUser?.suscripcion !== 'GRATIS' && currentUser?.suscripcion !== undefined);

  useEffect(() => { window.speechSynthesis.cancel(); setLeyendoAudio(false); }, [capituloActual, libroActual, vistaActual]);

  const toggleLecturaAudio = () => {
    if (!isPremium) { setVistaActual('club'); return; }
    if (leyendoAudio) { window.speechSynthesis.cancel(); setLeyendoAudio(false); return; }
    const textoCompleto = obtenerVersiculos().map(v => v.texto).join('. ');
    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-ES'; utterance.rate = 0.9; utterance.onend = () => setLeyendoAudio(false);
    window.speechSynthesis.speak(utterance); setLeyendoAudio(true);
  };

  useEffect(() => {
    const manejarBotonAtras = () => {
      if (mostrarModalDevocional) setMostrarModalDevocional(false);
      else if (mostrarAsistente) setMostrarAsistente(false);
      else if (vistaActual !== 'home') { setVistaActual('home'); setVersiculoActual(''); }
    };
    window.history.pushState(null, ''); window.addEventListener('popstate', manejarBotonAtras);
    return () => window.removeEventListener('popstate', manejarBotonAtras);
  }, [vistaActual, mostrarModalDevocional, mostrarAsistente]);

  const diasTranscurridos = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
  const lecturaHoy = LECTURAS_DIARIAS[diasTranscurridos % LECTURAS_DIARIAS.length] || LECTURAS_DIARIAS[0];
  const devocionalHoy = lecturaHoy.devocional || devocionalPorDefecto;

  const handleAbrirDevocional = () => {
    const sub = currentUser?.suscripcion || 'GRATIS'; const rol = currentUser?.role || 'USER';
    if (rol === 'OWNER' || sub === 'ORO' || sub === 'DIAMANTE') { setMostrarModalDevocional(true); } 
    else { if (window.confirm("🔒 Este devocional pastoral es exclusivo para Socios Oro y Diamante. ¿Querés ir al Club CyM para apoyarnos y desbloquearlo?")) { setVistaActual('club'); } }
  };

  const compartirDevocional = () => {
    const textoCompartir = `*${devocionalHoy.titulo}*\n\n${devocionalHoy.reflexion}\n\n_Oración: "${devocionalHoy.oracion}"_\n\n📖 *Lectura de hoy:* ${lecturaHoy.libro} ${lecturaHoy.capitulo}\n\n✨ *MINISTERIO CRECER Y MULTIPLICAR* ✨\n📲 App CyM Biblia`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`, '_blank');
  };

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

      return capituloData.items.filter(item => item && item.type === "verse").map(item => {
        const numeroSeguro = (item.verse_numbers && item.verse_numbers.length > 0) ? String(item.verse_numbers[0]) : '';
        const textoSeguro = (item.lines && Array.isArray(item.lines)) ? item.lines.join(' ') : (item.text || 'Texto no disponible');
        return { numero: numeroSeguro, texto: textoSeguro };
      });
    } catch (e) { return [{ numero: '⚠️', texto: `Error en lectura: ${e.message}` }]; }
  };
  const versiculosActuales = obtenerVersiculos();

  useEffect(() => { if (versiculoActual && versiculoRefs.current[versiculoActual]) { setTimeout(() => { versiculoRefs.current[versiculoActual].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); } }, [versiculoActual, capituloActual, libroActual]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isOwner && currentUser.creditosIA <= 0) { setChatHistorial([...chatHistorial, { rol: 'asistente', texto: '⚠️ Has agotado tus consultas. Adquiere tu Pase Premium en el Club CyM.' }]); setChatInput(''); return; }
    const nuevoMensajeUsuario = { rol: 'usuario', texto: chatInput };
    const nuevoHistorial = [...chatHistorial, nuevoMensajeUsuario];
    setChatHistorial(nuevoHistorial); setChatInput('');

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || window.VITE_OPENAI_API_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: `Consejero pastoral para 'CyM Biblia'. Leyendo ${libroActual} ${capituloActual}.` }, { role: "user", content: chatInput }], temperature: 0.7 }) });
      const data = await response.json();
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: data.choices?.[0]?.message?.content || "Error en la respuesta." }]);
      if (!isOwner) { const nuevoLimite = currentUser.creditosIA - 1; setCurrentUser({...currentUser, creditosIA: nuevoLimite}); await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { creditosIA: nuevoLimite }); }
    } catch (error) { setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: `⚠️ Error: ${error.message}` }]); }
  };

  const abrirLibro = (nombreLibro, capitulo = 1) => { setLibroActual(nombreLibro); setCapituloActual(capitulo); setVersiculoActual(''); setVistaActual('lector'); window.scrollTo(0, 0); };
  const librosAntiguo = LIBROS_MENU.slice(0, 39); const librosNuevo = LIBROS_MENU.slice(39);

  if (isLoadingAuth) return (<div className="min-h-screen bg-black flex flex-col items-center justify-center text-center"><EstrellasFondo /><Loader2 size={48} className="text-[#ffd700] animate-spin mb-4 relative z-10" /><p className="text-[#ffd700] font-black tracking-widest uppercase relative z-10">Conectando al Ministerio...</p></div>);

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

  const estiloMiPerfil = obtenerEstiloSuscripcion(currentUser.suscripcion, currentUser.role);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-serif relative ${themeStyles[tema].split(' ')[0]} ${themeStyles[tema].split(' ')[1]}`}>
      {tema === 'cym' && <EstrellasFondo />}

      <nav className={`sticky top-0 z-50 px-2 md:px-6 py-3 shadow-md flex items-center justify-between backdrop-blur-md border-b ${navStyles[tema]}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setVistaActual('home'); setVersiculoActual(''); }}>
          {vistaActual !== 'home' && <ArrowLeft size={20} className="mr-1" />}
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(204,163,0,0.5)]" />
          <h1 className="text-lg md:text-2xl font-black tracking-wider hidden sm:block">CyM <span className="font-light opacity-80">Biblia</span></h1>
        </div>
        <div className="flex items-center gap-1 md:gap-3 relative z-10">
          <button onClick={() => setVistaActual('capacitaciones')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-amber-500 text-black shadow-md hover:scale-105 transition-transform"><GraduationCap size={14} /> <span className="hidden sm:inline">Academia</span></button>
          <button onClick={() => setVistaActual('predicas')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-cyan-600 text-white shadow-md hover:scale-105 transition-transform"><FileText size={14} /> <span className="hidden sm:inline">Bosquejos VIP</span></button>
          <button onClick={() => setVistaActual('comunidad')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-green-600 text-white shadow-md hover:scale-105 transition-transform"><Users size={14} /> <span className="hidden sm:inline">Comunidad</span></button>
          <button onClick={() => setVistaActual('trivia')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-blue-600 text-white shadow-md hover:scale-105 transition-transform"><Gamepad2 size={14} /> <span className="hidden sm:inline">Jugar</span></button>
          <button onClick={() => setVistaActual('club')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md hover:scale-105 transition-transform"><Crown size={14} className="fill-black" /> <span className="hidden sm:inline">Club CyM</span></button>
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

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 relative z-10">
        
        {vistaActual === 'home' && (
          <div className="space-y-8">
            <div className="bg-black/80 border border-[#cca300]/40 p-5 rounded-3xl backdrop-blur-md flex items-center shadow-xl">
              <input type="file" accept="image/*" ref={inputRefFoto} className="hidden" onChange={handleImageUpload} />
              <div className="relative group cursor-pointer mr-4" onClick={() => inputRefFoto.current.click()}>
                <img src={currentUser.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} alt="Perfil" className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] object-cover ${estiloMiPerfil.colorAro}`} />
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={18} className="text-white" /></div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">{currentUser.nombre || currentUser.email}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${estiloMiPerfil.colorBadge}`}>
                    {estiloMiPerfil.texto}
                  </span>
                  <span className="text-xs text-[#ffd700] font-bold flex items-center gap-1"><Zap size={12}/> {isOwner ? 'Créditos Ilimitados' : `${currentUser.creditosIA} Consultas IA`}</span>
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
                <div><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Gamepad2 size={24} className="text-blue-400" /><h4 className="text-blue-400 font-black text-sm uppercase tracking-widest">Desafío Bíblico</h4></div><button onClick={retarAmigo} className="p-2 bg-blue-600/20 text-blue-400 hover:text-white hover:bg-blue-600 rounded-full transition-colors"><Share2 size={16} /></button></div><p className="text-white font-bold text-3xl mb-1">{currentUser.puntosTrivia || 0} PTS</p><p className="text-slate-400 text-xs mb-4">Sumá puntos y compartí rachas.</p></div>
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

        {/* --- VISTA ACADEMIA (CAPACITACIONES SINCRÓNICAS) --- */}
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

            {/* PANEL FORMULARIO OWNER */}
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

            {/* Malla Cursos */}
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

        {/* --- VISTA SECCIÓN PREDICACIONES VIP (BOSQUEJOS WORD + PORTADA) --- */}
        {vistaActual === 'predicas' && (
          <div className="space-y-6">
            <div className="bg-black/80 border border-cyan-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2"><FileText size={26} /> Catálogo de Prédicas VIP</h2>
                  <p className="text-slate-400 text-xs mt-1">Prédicas completas en Word + Imagen de Portada lista para proyectar.</p>
                </div>
                {currentUser?.role !== 'OWNER' && (
                  <div className="bg-cyan-950/80 border border-cyan-500/50 px-4 py-2 rounded-2xl text-right">
                    <p className="text-[10px] font-black uppercase text-cyan-300">Descargas Word del Mes</p>
                    <p className="text-xl font-black text-white">{currentUser.descargasMesActual || 0} / 10</p>
                  </div>
                )}
              </div>

              {/* PANEL DE SUBIDA OWNER */}
              {isOwner && (
                <div className="bg-cyan-950/40 border border-cyan-500/50 p-6 rounded-2xl mb-8 space-y-4">
                  <h3 className="text-cyan-300 font-black text-sm uppercase tracking-wider flex items-center gap-2"><Upload size={18} /> Cargar Nueva Prédica + Portada (Panel Owner)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Título de la Prédica" value={tituloPredicaInput} onChange={(e) => setTituloPredicaInput(e.target.value)} className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                    <input type="text" placeholder="Pasaje Bíblico (ej: Efesios 6:10-18)" value={pasajePredicaInput} onChange={(e) => setPasajePredicaInput(e.target.value)} className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="file" accept=".doc,.docx" ref={inputRefWord} className="hidden" onChange={handleSelectWord} />
                    <button type="button" onClick={() => inputRefWord.current.click()} className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${archivoWordTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}>
                      <FileText size={18} /> {archivoWordTemp ? `✓ ${archivoWordTemp.name}` : "1. Adjuntar Word (.docx)"}
                    </button>

                    <input type="file" accept="image/*" ref={inputRefPortada} className="hidden" onChange={handleSelectPortada} />
                    <button type="button" onClick={() => inputRefPortada.current.click()} className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${portadaImageTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}>
                      <ImageIcon size={18} /> {portadaImageTemp ? "✓ Portada Seleccionada" : "2. Adjuntar Portada (Opcional)"}
                    </button>
                  </div>

                  <button type="button" onClick={handleGuardarPredica} disabled={subiendoPredica} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                    {subiendoPredica ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    {subiendoPredica ? "Guardando..." : "Publicar Prédica Completa"}
                  </button>
                </div>
              )}

              {/* Malla Tarjetas */}
              {cargandoPredicas ? (
                <div className="text-center py-16 text-cyan-400"><Loader2 className="animate-spin mx-auto mb-3" size={36} /><p className="font-bold text-xs uppercase tracking-widest">Cargando Prédicas...</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listaPredicaciones.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500"><FileText size={48} className="mx-auto mb-3 opacity-30" /><p className="font-bold">No hay prédicas subidas todavía.</p></div>
                  ) : (
                    listaPredicaciones.map((p) => (
                      <div key={p.id} className="bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl">
                        <div>
                          {p.portadaBase64 ? (
                            <div className="h-48 w-full overflow-hidden relative">
                              <img src={p.portadaBase64} alt={p.titulo} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            </div>
                          ) : (
                            <div className="h-32 w-full bg-cyan-950/40 border-b border-white/10 flex items-center justify-center text-cyan-500/40"><FileText size={48} /></div>
                          )}
                          <div className="p-5">
                            <h4 className="text-white font-black text-xl mb-1 leading-snug">{p.titulo}</h4>
                            <p className="text-cyan-400 font-bold text-xs">📖 {p.pasaje}</p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 flex gap-2">
                          <button onClick={() => handleDescargarArchivoPredica(p, 'word')} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                            <Download size={14} /> Descargar .DOCX
                          </button>
                          {p.portadaBase64 && (
                            <button onClick={() => handleDescargarArchivoPredica(p, 'portada')} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 border border-white/10">
                              <ImageIcon size={14} /> Portada
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VISTA COMUNIDAD --- */}
        {vistaActual === 'comunidad' && (
          <div className="bg-black/80 border border-[#cca300]/30 p-6 rounded-3xl backdrop-blur-md">
            <h2 className="text-2xl font-black text-[#ffd700] mb-4 flex items-center gap-2"><Users /> Mis Amigos / Ranking</h2>
            <button onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Sumate a CyM Biblia y compitamos en la Trivia! Hacé clic acá para agregarnos como amigos: ${window.location.origin}?ref=${currentUser.uid}`)}`, '_blank'); }} className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-4 rounded-xl mb-6 shadow-lg flex items-center justify-center gap-2">Invitar amigos por WhatsApp</button>
            <div className="flex flex-col md:flex-row gap-2 mb-6"><input type="email" value={emailBuscar} onChange={(e) => setEmailBuscar(e.target.value)} placeholder="O buscar por email..." className="flex-1 bg-[#1a1a1a] border border-[#cca300]/40 rounded-xl px-4 py-3 text-white outline-none" /><button onClick={buscarYAgregarAmigo} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><UserPlus size={18}/> Buscar</button></div>
            <div className="space-y-3">
              {listaAmigos.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Todavía no tenés amigos. ¡Mandales un WhatsApp con el botón verde de arriba!</p>
              ) : (
                listaAmigos.map((amigo, index) => {
                  const estiloAmigo = obtenerEstiloSuscripcion(amigo.suscripcion, amigo.role);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-amber-500 text-lg w-4">{index + 1}</span>
                        <img src={amigo.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className={`w-12 h-12 rounded-full border-[3px] object-cover ${estiloAmigo.colorAro}`} alt="foto" />
                        <div>
                          <p className="font-bold text-white leading-tight">{amigo.nombre}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${estiloAmigo.colorBadge}`}>{estiloAmigo.texto}</span>
                        </div>
                      </div>
                      <div className="text-right"><p className="font-black text-xl text-blue-400">{amigo.puntosTrivia || 0}</p><p className="text-[10px] uppercase text-slate-400 font-bold">Puntos</p></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* LECTOR BÍBLICO COMPLETO */}
        {vistaActual === 'lector' && (
          <div className="bg-black/70 p-4 md:p-10 rounded-3xl backdrop-blur-md border border-[#cca300]/20 shadow-2xl">
            <div className="mb-8 p-4 bg-black/50 border border-[#cca300]/30 rounded-2xl"><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#cca300]/40 text-amber-300 p-2 rounded-lg font-bold text-xs outline-none"><option value="RVR1960">Reina Valera 1960</option><option value="NTV">NTV</option><option value="DHH">DHH</option><option value="LBLA">LBLA</option><option value="TLA">TLA</option></select><select value={libroActual} onChange={(e) => { setLibroActual(e.target.value); setCapituloActual(1); }} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-xs outline-none">{LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre}>{l.nombre}</option>)}</select><select value={capituloActual} onChange={(e) => setCapituloActual(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-white/20 text-white p-2 rounded-lg font-bold text-xs outline-none">{Array.from({ length: 150 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Capítulo {n}</option>)}</select><select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/20 text-amber-300 p-2 rounded-lg font-bold text-xs outline-none"><option value="">Ir a Versículo</option>{versiculosActuales.map((v) => <option key={v.numero} value={v.numero}>Versículo {v.numero}</option>)}</select></div></div>
            <div className="mb-12 text-center flex flex-col items-center"><h2 className="text-3xl md:text-4xl font-black mb-6 text-[#ffd700]" style={{ fontSize: `${tamañoFuente * 1.8}px` }}>{libroActual} {capituloActual} <span className="opacity-60 text-lg">({versionActual})</span></h2><button onClick={toggleLecturaAudio} className={`flex items-center gap-2 px-6 py-4 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-lg ${leyendoAudio ? 'bg-red-600 text-white animate-pulse' : 'bg-[#cca300]/20 text-[#ffd700] hover:bg-[#cca300]/40'}`}>{leyendoAudio ? <Square size={18} fill="currentColor"/> : <Volume2 size={18} />} {leyendoAudio ? 'Detener Lectura' : 'Escuchar Capítulo Completo'}</button></div>
            <div className="space-y-4 leading-relaxed text-left" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.7' }}>{versiculosActuales.map((versiculo, index) => { const esVersiculoResaltado = versiculo.numero === versiculoActual; return (<p key={index} ref={el => versiculoRefs.current[versiculo.numero] = el} className="relative group cursor-text transition-all duration-500"><sup className={`absolute -left-6 md:-left-8 top-1 text-[0.6em] font-black select-none ${esVersiculoResaltado ? 'text-amber-400 text-sm' : 'text-[#ffd700]/60'}`}>{versiculo.numero}</sup><span className={`rounded p-2 transition-colors duration-500 block ${esVersiculoResaltado ? 'bg-amber-500/20 text-[#ffd700] border-l-4 border-[#ffd700] pl-3 font-bold shadow-lg' : 'hover:bg-[#ffd700]/10 hover:text-[#ffd700]'}`}>{versiculo.texto}</span></p>); })}</div>
          </div>
        )}

        {/* MÓDULOS DE TRIVIA Y CLUB CYM */}
        {vistaActual === 'trivia' && <ModuloTrivia currentUser={currentUser} db={db} tema={tema} onVolver={() => setVistaActual('home')} />}
        {vistaActual === 'club' && (
          <ModuloClub 
            tema={tema} 
            onVolver={() => setVistaActual('home')} 
            onSuscribir={(planElegido) => {
              let linkPago = "https://link.mercadopago.com.ar/crecerymultiplicar"; 
              if (planElegido === 'BRONCE') linkPago = "https://mpago.la/1QrMEYF";
              if (planElegido === 'PLATA') linkPago = "https://mpago.la/2mEVGiW";
              if (planElegido === 'ORO') linkPago = "https://mpago.la/1jwezU4";
              if (planElegido === 'DIAMANTE') linkPago = "https://mpago.la/2X5GusX";
              window.open(linkPago, '_blank');
              setTimeout(() => {
                const confirmo = window.confirm("¿Pudiste completar tu suscripción mensual en MercadoPago? Si tocás 'Aceptar', se abrirá WhatsApp para enviar tu comprobante.");
                if (confirmo) {
                  window.open(`https://api.whatsapp.com/send?phone=5491128745169&text=${encodeURIComponent(`Hola pastor Max! Acabo de suscribirme mensualmente al plan *${planElegido}*. Mi email en la app es: *${currentUser.email}*. Te dejo el comprobante para que me actives la membresía!`)}`, '_blank');
                }
              }, 3000);
            }} 
          />
        )}
      </main>

      {/* ASISTENTE CON IA PASTORAL */}
      {vistaActual === 'lector' && (
        <div className="fixed bottom-20 right-4 md:right-6 z-50">
          {mostrarAsistente ? (
            <div className="w-80 h-[400px] rounded-2xl shadow-2xl flex flex-col border overflow-hidden bg-[#141414] border-[#cca300]/50"><div className="p-4 flex justify-between items-center border-b bg-black border-[#cca300]/30"><div className="flex items-center gap-2"><Sparkles size={18} className="text-[#ffd700]" /><span className="font-bold text-sm text-white">Asistente CyM</span></div><button onClick={() => setMostrarAsistente(false)} className="text-white p-2 hover:bg-white/10 rounded-full"><X size={20} /></button></div><div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col text-sm">{chatHistorial.map((msg, i) => (<div key={i} className={`p-3 rounded-xl max-w-[85%] ${msg.rol === 'usuario' ? 'self-end bg-[#cca300] text-black font-bold' : 'self-start bg-white/10 text-slate-200'}`}>{msg.texto}</div>))}</div><form onSubmit={enviarMensaje} className="p-3 border-t flex gap-2 bg-black border-[#cca300]/30"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Preguntale a la IA..." className="flex-1 rounded-full px-4 py-3 text-sm outline-none border bg-[#1a1a1a] border-[#cca300]/30 text-white" /><button type="submit" className="p-3 rounded-full bg-[#cca300] text-black hover:scale-105"><Send size={18} /></button></form></div>
          ) : (
            <button onClick={() => setMostrarAsistente(true)} className="p-5 rounded-full shadow-2xl bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-black hover:scale-110 transition-transform"><MessageCircle size={28} /></button>
          )}
        </div>
      )}

      <footer className="mt-auto p-6 text-center border-t border-[#cca300]/30 bg-black/70 backdrop-blur-md">
        <span className="text-xs font-black tracking-widest uppercase opacity-40">Ministerio Crecer y Multiplicar</span>
      </footer>
    </div>
  );
}