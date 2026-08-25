import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Settings, ChevronLeft, ChevronRight, Type, Sun, Sparkles, ArrowLeft, 
  Heart, MessageCircle, X, Send, FileText, PlayCircle, Volume2, Square, Trophy, Crown,
  Loader2, LogOut, Lock
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// 1. IMPORTAMOS LOS MÓDULOS NUEVOS
import ModuloTrivia from './ModuloTrivia';
import ModuloClub from './ModuloClub';

// 2. IMPORTAMOS LAS BASES DE DATOS
import BibliaRVR from './data/RVR1960.json';
import BibliaNTV from './data/NTV.json';
import BibliaDHH from './data/DHH.json';
import BibliaLBLA from './data/LBLA.json';
import BibliaTLA from './data/TLA.json';

// --- CONFIGURACIÓN DE FIREBASE (Usando tu proyecto existente) ---
const firebaseConfig = {
  apiKey: "AIzaSyDWDfPiIIwYbuuSvaPq2OVCZi1CINXMqY4",
  authDomain: "controllogisticonewsan.firebaseapp.com",
  projectId: "controllogisticonewsan",
  messagingSenderId: "264933112146",
  appId: "1:264933112146:web:3fa64d97e32a463dd6a28b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const BIBLIA_VERSIONES = {
  RVR1960: BibliaRVR,
  NTV: BibliaNTV,
  DHH: BibliaDHH,
  LBLA: BibliaLBLA,
  TLA: BibliaTLA
};

// LECTURAS DIARIAS CON SUS RESPECTIVOS DEVOCIONALES PASTORES
const LECTURAS_DIARIAS = [
  { 
    libro: 'Salmos', 
    capitulo: 1,
    devocional: {
      titulo: 'El Camino de la Bendición',
      reflexion: 'El Salmo 1 nos planta frente a una gran verdad: nuestras decisiones determinan nuestro destino. El hombre bienaventurado no camina bajo el consejo del mundo, sino que echa raíces junto a las corrientes de agua de la Palabra de Dios. En tiempos de sequía espiritual o de presiones cotidianas, meditar en Su verdad nos mantiene verdes, firmes y dando frutos a su tiempo.',
      oracion: 'Señor Jesús, ayúdame a deleitarme en tu Palabra cada día. Líbrame de los consejos corrientes del mundo y hazme como ese árbol plantado junto a corrientes de agua, firme, fructífero y profundamente arraigado en tu gracia. Amén.'
    }
  }, 
  { 
    libro: 'Proverbios', 
    capitulo: 3,
    devocional: {
      titulo: 'Confianza de Todo Corazón',
      reflexion: 'Confiar en el Señor con "todo el corazón" implica rendir nuestra necesidad de tener siempre el control. Proverbios nos desafía a no depender de nuestra propia prudencia. Cuando reconocemos a Dios en cada uno de nuestros pasos y decisiones, Su promise es clara: Él enderezará nuestras veredas, quitando los obstáculos del camino.',
      oracion: 'Padre Celestial, hoy rindo mi ansiedad y mi propio entendimiento. Decido confiar plenamente en ti y poner mis planes en tus manos. Guía mis decisiones y endereza cada paso que dé en esta jornada. Amén.'
    }
  }, 
  { 
    libro: 'Juan', 
    capitulo: 1,
    devocional: {
      titulo: 'La Luz que Prevalece',
      reflexion: 'En el principio era el Verbo, la Palabra encarnada que trajo vida y luz a la humanidad. Juan nos recuerda que Jesús vino a disipar toda tiniebla. No importa cuán oscuro parezca el panorama a nuestro alrededor o enuestros corazones: la Luz del mundo ya resplandeció, y las tinieblas jamás podrán apagarla.',
      oracion: 'Señor Jesús, gracias por venir a mi vida a traer claridad y salvación. Que tu luz brille hoy a través de mí para iluminar a aquellos que caminan en desánimo y confusión. Amén.'
    }
  },
  { 
    libro: 'Romanos', 
    capitulo: 8,
    devocional: {
      titulo: 'Más que Vencedores',
      reflexion: 'Romanos 8 es el canto de victoria del creyente. Nos asegura que ya no hay condenación para los que están en Cristo y que ninguna circunstancia —ni el dolor, ni la escasez, ni las pruebas— nos podrá separar de Su amor infinito. Si Dios está por nosotros, nuestro triunfo diario está garantizado.',
      oracion: 'Gracias, Padre Amado, porque en Cristo soy más que vencedor. Ningún temor de este mundo puede apartarme de tu amor seguro y eterno. Camino hoy confiado en tu victoria. Amén.'
    }
  }, 
  { 
    libro: 'Filipenses', 
    capitulo: 4,
    devocional: {
      titulo: 'La Paz que lo Guarda Todo',
      reflexion: 'El apóstol Pablo nos teaches el antídoto contra la preocupación: la oración con acción de gracias. Cuando depositamos nuestras peticiones delante del trono de la gracia con un corazón agradecido, la paz de Dios, que sobrepasa todo entendimiento humano, se activa como un escudo sobre nuestras mentes.',
      oracion: 'Señor, hoy te entrego cada una de mis preocupaciones. Cambio mis cargas por tu paz perfecta. Guarda mis pensamientos en Cristo Jesús y recuérdame que todo lo puedo en ti que me fortaleces. Amén.'
    }
  }, 
  { 
    libro: 'Salmos', 
    capitulo: 23,
    devocional: {
      titulo: 'Nuestro Buen Pastor',
      reflexion: 'El Salmo 23 nos recuerda la intimidad del cuidado de Dios. Él no es solo un pastor general; es "mi" Pastor. Nada nos faltará bajo Su guía. Él nos pastorea en lugares de delicados pastos y nos conforta el alma cuando cruzamos valles de sombra, recordándonos que Su vara y Su cayado nos infunden aliento continuo.',
      oracion: 'Jesús, mi buen Pastor, gracias por guiarme, proveerme y cuidarme con tanta ternura. No temeré mal alguno hoy, porque sé que tu bondad y tu misericordia me acompañarán todos los días de mi vida. Amén.'
    }
  }
];

const devocionalPorDefecto = {
  titulo: 'Creciendo en la Palabra',
  reflexion: 'Cada porción de las Escrituras contiene aliento y dirección para nuestra vida diaria. Al meditar en los versículos de hoy, permite que el Espíritu Santo hable a tu corazón, te redarguya y siembre la semilla de fe necesaria para Crecer y Multiplicar tu influencia espiritual en tu entorno.',
  oracion: 'Señor Jesús, abre mis ojos para ver las maravillas de tu Ley. Que tu Palabra ministre mi vida hoy y me transforme a tu imagen. Amén.'
};

const LIBROS_MENU = [
  { nombre: 'Génesis', testamento: 'Antiguo Testamento' }, { nombre: 'Éxodo', testamento: 'Antiguo Testamento' },
  { nombre: 'Levítico', testamento: 'Antiguo Testamento' }, { nombre: 'Números', testamento: 'Antiguo Testamento' },
  { nombre: 'Deuteronomio', testamento: 'Antiguo Testamento' }, { nombre: 'Josué', testamento: 'Antiguo Testamento' },
  { nombre: 'Jueces', testamento: 'Antiguo Testamento' }, { nombre: 'Rut', testamento: 'Antiguo Testamento' },
  { nombre: '1 Samuel', testamento: 'Antiguo Testamento' }, { nombre: '2 Samuel', testamento: 'Antiguo Testamento' },
  { nombre: '1 Reyes', testamento: 'Antiguo Testamento' }, { nombre: '2 Reyes', testamento: 'Antiguo Testamento' },
  { nombre: '1 Crónicas', testamento: 'Antiguo Testamento' }, { nombre: '2 Crónicas', testamento: 'Antiguo Testamento' },
  { nombre: 'Esdras', testamento: 'Antiguo Testamento' }, { nombre: 'Nehemías', testamento: 'Antiguo Testamento' },
  { nombre: 'Ester', testamento: 'Antiguo Testamento' }, { nombre: 'Job', testamento: 'Antiguo Testamento' },
  { nombre: 'Salmos', testamento: 'Antiguo Testamento' }, { nombre: 'Proverbios', testamento: 'Antiguo Testamento' },
  { nombre: 'Eclesiastés', testamento: 'Antiguo Testamento' }, { nombre: 'Cantares', testamento: 'Antiguo Testamento' },
  { nombre: 'Isaías', testamento: 'Antiguo Testamento' }, { nombre: 'Jeremías', testamento: 'Antiguo Testamento' },
  { nombre: 'Lamentaciones', testamento: 'Antiguo Testamento' }, { nombre: 'Ezequiel', testamento: 'Antiguo Testamento' },
  { nombre: 'Daniel', testamento: 'Antiguo Testamento' }, { nombre: 'Oseas', testamento: 'Antiguo Testamento' },
  { nombre: 'Joel', testamento: 'Antiguo Testamento' }, { nombre: 'Amós', testamento: 'Antiguo Testamento' },
  { nombre: 'Abdías', testamento: 'Antiguo Testamento' }, { nombre: 'Jonás', testamento: 'Antiguo Testamento' },
  { nombre: 'Miqueas', testamento: 'Antiguo Testamento' }, { nombre: 'Nahúm', testamento: 'Antiguo Testamento' },
  { nombre: 'Habacuc', testamento: 'Antiguo Testamento' }, { nombre: 'Sofonías', testamento: 'Antiguo Testamento' },
  { nombre: 'Hageo', testamento: 'Antiguo Testamento' }, { nombre: 'Zacarías', testamento: 'Antiguo Testamento' },
  { nombre: 'Malaquías', testamento: 'Antiguo Testamento' }, { nombre: 'Mateo', testamento: 'Nuevo Testamento' },
  { nombre: 'Marcos', testamento: 'Nuevo Testamento' }, { nombre: 'Lucas', testamento: 'Nuevo Testamento' },
  { nombre: 'Juan', testamento: 'Nuevo Testamento' }, { nombre: 'Hechos', testamento: 'Nuevo Testamento' },
  { nombre: 'Romanos', testamento: 'Nuevo Testamento' }, { nombre: '1 Corintios', testamento: 'Nuevo Testamento' },
  { nombre: '2 Corintios', testamento: 'Nuevo Testamento' }, { nombre: 'Gálatas', testamento: 'Nuevo Testamento' },
  { nombre: 'Efesios', testamento: 'Nuevo Testamento' }, { nombre: 'Filipenses', testamento: 'Nuevo Testamento' },
  { nombre: 'Colosenses', testamento: 'Nuevo Testamento' }, { nombre: '1 Tesalonicenses', testamento: 'Nuevo Testamento' },
  { nombre: '2 Tesalonicenses', testamento: 'Nuevo Testamento' }, { nombre: '1 Timoteo', testamento: 'Nuevo Testamento' },
  { nombre: '2 Timoteo', testamento: 'Nuevo Testamento' }, { nombre: 'Tito', testamento: 'Nuevo Testamento' },
  { nombre: 'Filemón', testamento: 'Nuevo Testamento' }, { nombre: 'Hebreos', testamento: 'Nuevo Testamento' },
  { nombre: 'Santiago', testamento: 'Nuevo Testamento' }, { nombre: '1 Pedro', testamento: 'Nuevo Testamento' },
  { nombre: '2 Pedro', testamento: 'Nuevo Testamento' }, { nombre: '1 Juan', testamento: 'Nuevo Testamento' },
  { nombre: '2 Juan', testamento: 'Nuevo Testamento' }, { nombre: '3 Juan', testamento: 'Nuevo Testamento' },
  { nombre: 'Judas', testamento: 'Nuevo Testamento' }, { nombre: 'Apocalipsis', testamento: 'Nuevo Testamento' }
];

const encontrarLibro = (biblia, nombreBuscado) => {
  if (!biblia || !biblia.books) return null;
  const limpiarTexto = (texto) => 
    texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim() : "";
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

const themeStyles = {
  claro: 'bg-slate-50 text-slate-900 border-slate-200',
  cym: 'bg-[#000000] text-slate-200 border-[#cca300]',
  sepia: 'bg-[#fbf0d9] text-[#5f4b32] border-[#d4b886]',
};

const navStyles = {
  claro: 'bg-white/90 border-slate-200 text-slate-800',
  cym: 'bg-black/70 border-[#cca300]/30 text-[#fcd34d]',
  sepia: 'bg-[#f4e4c3]/90 border-[#d4b886] text-[#5f4b32]',
};

export default function App() {
  // --- ESTADOS DE FIREBASE AUTH ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // --- ESTADOS DE LA APP ---
  const [vistaActual, setVistaActual] = useState('home'); 
  const [versionActual, setVersionActual] = useState('RVR1960');
  const [libroActual, setLibroActual] = useState('Génesis');
  const [capituloActual, setCapituloActual] = useState(1);
  const [versiculoActual, setVersiculoActual] = useState('');
  const [tema, setTema] = useState('cym');
  const [tamañoFuente, setTamañoFuente] = useState(18);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [mostrarDonacion, setMostrarDonacion] = useState(false);
  const [mostrarModalDevocional, setMostrarModalDevocional] = useState(false);
  
  const [mostrarAsistente, setMostrarAsistente] = useState(false);
  const [leyendoAudio, setLeyendoAudio] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [chatHistorial, setChatHistorial] = useState([
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente bíblico CyM. Pregúntame lo que necesites sobre la Biblia o el capítulo que estás leyendo.' }
  ]);

  const versiculoRefs = useRef({});

  // --- LÓGICA DE AUTENTICACIÓN FIREBASE ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const emailLower = user.email.toLowerCase();
        const isGodMode = emailLower === 'maxdelanus@gmail.com' || emailLower === 'maximiliano.fontan@newsan.com.ar';
        const userRef = doc(db, 'cym_usuarios', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          let userData;

          if (userSnap.exists()) {
            userData = userSnap.data();
            // Si es Owner, pisamos los datos locales para asegurar acceso total
            if (isGodMode) {
              userData.role = 'OWNER';
              userData.suscripcion = 'DIAMANTE';
              userData.creditosIA = 9999;
            }
          } else {
            // Usuario Nuevo
            userData = {
              email: emailLower,
              nombre: user.displayName || 'Hermano/a',
              role: isGodMode ? 'OWNER' : 'USER',
              suscripcion: isGodMode ? 'DIAMANTE' : 'GRATIS',
              creditosIA: isGodMode ? 9999 : 3, // 3 preguntas de regalo
              fechaRegistro: new Date().toISOString()
            };
            await setDoc(userRef, userData);
          }
          setCurrentUser({ uid: user.uid, photoURL: user.photoURL, ...userData });
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Error de login:", error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setVistaActual('home');
  };

  // VERIFICACIONES DE PERMISOS
  const isOwner = currentUser?.role === 'OWNER';
  const isPremium = isOwner || (currentUser?.suscripcion !== 'GRATIS' && currentUser?.suscripcion !== undefined);

  // --- EFECTO: CANCELAR AUDIO ---
  useEffect(() => {
    window.speechSynthesis.cancel();
    setLeyendoAudio(false);
  }, [capituloActual, libroActual, vistaActual]);

  const toggleLecturaAudio = () => {
    if (!isPremium) {
      setVistaActual('club'); 
      return;
    }
    if (leyendoAudio) {
      window.speechSynthesis.cancel();
      setLeyendoAudio(false);
      return;
    }
    const textoCompleto = obtenerVersiculos().map(v => v.texto).join('. ');
    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-ES'; 
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setLeyendoAudio(false);
    window.speechSynthesis.speak(utterance);
    setLeyendoAudio(true);
  };

  useEffect(() => {
    const manejarBotonAtras = (event) => {
      if (mostrarDonacion) {
        setMostrarDonacion(false); window.history.pushState(null, '');
      } else if (mostrarModalDevocional) {
        setMostrarModalDevocional(false); window.history.pushState(null, '');
      } else if (mostrarAsistente) {
        setMostrarAsistente(false); window.history.pushState(null, '');
      } else if (vistaActual === 'lector' || vistaActual === 'trivia' || vistaActual === 'club') {
        setVistaActual('home'); setVersiculoActual(''); window.history.pushState(null, '');
      }
    };
    window.history.pushState(null, '');
    window.addEventListener('popstate', manejarBotonAtras);
    return () => window.removeEventListener('popstate', manejarBotonAtras);
  }, [vistaActual, mostrarDonacion, mostrarModalDevocional, mostrarAsistente]);

  const diasTranscurridos = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
  const lecturaHoy = LECTURAS_DIARIAS[diasTranscurridos % LECTURAS_DIARIAS.length] || LECTURAS_DIARIAS[0];
  const devocionalHoy = lecturaHoy.devocional || devocionalPorDefecto;

  const obtenerVersiculos = () => {
    try {
      const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
      if (!libroData) return [];
      if (!libroData.chapters) {
        if (libroData.verses) {
          const filtrados = libroData.verses.filter(v => Number(v.chapter) === capituloActual);
          return filtrados.map(v => ({ numero: String(v.verse), texto: v.text }));
        }
        return [];
      }
      const capitulosReales = libroData.chapters.filter(c => c && c.is_chapter === true);
      const capituloData = capitulosReales[capituloActual - 1];
      if (!capituloData || !capituloData.items) return [];

      return capituloData.items
        .filter(item => item && item.type === "verse")
        .map(item => {
          const numeroSeguro = (item.verse_numbers && item.verse_numbers.length > 0) ? String(item.verse_numbers[0]) : '';
          const textoSeguro = (item.lines && Array.isArray(item.lines)) ? item.lines.join(' ') : (item.text || 'Texto no disponible');
          return { numero: numeroSeguro, texto: textoSeguro };
        });
    } catch (e) {
      return [{ numero: '⚠️', texto: `Error en lectura: ${e.message}` }];
    }
  };

  const versiculosActuales = obtenerVersiculos();

  useEffect(() => {
    if (versiculoActual && versiculoRefs.current[versiculoActual]) {
      setTimeout(() => {
        versiculoRefs.current[versiculoActual].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [versiculoActual, capituloActual, libroActual]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!isOwner && currentUser.creditosIA <= 0) {
      setChatHistorial([...chatHistorial, { 
        rol: 'asistente', 
        texto: '⚠️ Has agotado tus consultas. Para seguir disfrutando del Asistente CyM con Inteligencia Artificial, adquiere tu Pase Premium en el Club de Socios.' 
      }]);
      setChatInput('');
      return;
    }

    const nuevoMensajeUsuario = { rol: 'usuario', texto: chatInput };
    const nuevoHistorial = [...chatHistorial, nuevoMensajeUsuario];
    
    setChatHistorial(nuevoHistorial);
    setChatInput('');
    setCargandoIA(true);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || window.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("Clave API de OpenAI no configurada.");

      const promptSistema = `Actúas como un teólogo y consejero pastoral experto para la app 'CyM Biblia'. Responde de forma amable, clara y en español. El usuario está leyendo el libro de ${libroActual}, capítulo ${capituloActual}.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: promptSistema },
            { role: "user", content: chatInput }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Error en los servidores de OpenAI.");

      const textoRespuesta = data.choices?.[0]?.message?.content;
      if (!textoRespuesta) throw new Error("Formato de respuesta desconocido.");

      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: textoRespuesta }]);
      
      // RESTAMOS 1 AL LÍMITE EN FIREBASE SI NO ES OWNER
      if (!isOwner) {
        const nuevoLimite = currentUser.creditosIA - 1;
        setCurrentUser({...currentUser, creditosIA: nuevoLimite});
        await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { creditosIA: nuevoLimite });
      }
    } catch (error) {
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: `⚠️ Error de comunicación: ${error.message}` }]);
    } finally {
      setCargandoIA(false);
    }
  };

  const abrirLibro = (nombreLibro, capitulo = 1) => {
    setLibroActual(nombreLibro); setCapituloActual(capitulo); setVersiculoActual(''); setVistaActual('lector'); window.scrollTo(0, 0);
  };

  const cambiarCapitulo = (direccion) => {
    try {
      const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
      if(libroData) {
        let totalCapitulos = 1;
        if (libroData.chapters) {
          totalCapitulos = libroData.chapters.filter(c => c.is_chapter === true).length;
        } else if (libroData.verses) {
          const caps = libroData.verses.map(v => Number(v.chapter));
          totalCapitulos = Math.max(...caps);
        }
        let nuevoCap = capituloActual + direccion;
        if (nuevoCap >= 1 && nuevoCap <= totalCapitulos) {
          setCapituloActual(nuevoCap); setVersiculoActual(''); window.scrollTo(0, 0);
        }
      }
    } catch(e) {}
  };

  const librosAntiguo = LIBROS_MENU.filter((l) => l.testamento === 'Antiguo Testamento');
  const librosNuevo = LIBROS_MENU.filter((l) => l.testamento === 'Nuevo Testamento');

  // --- PANTALLA DE CARGA ---
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
        <EstrellasFondo />
        <Loader2 size={48} className="text-[#ffd700] animate-spin mb-4 relative z-10" />
        <p className="text-[#ffd700] font-black tracking-widest uppercase relative z-10">Conectando al Ministerio...</p>
      </div>
    );
  }

  // --- PANTALLA DE LOGIN (Si no hay usuario) ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 py-12 text-center relative overflow-hidden select-none">
        <EstrellasFondo />
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl my-auto p-4">
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM Biblia" className="w-full max-w-[480px] h-[480px] object-contain drop-shadow-[0_0_60px_rgba(245,194,66,0.65)]" />
        </div>
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 mt-4 mb-4">
          <div className="space-y-2 mb-2">
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-wide bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              CyM Biblia
            </h1>
            <p className="text-xs font-bold bg-gradient-to-r from-[#ffd366] to-[#b38600] text-transparent bg-clip-text uppercase tracking-[0.25em] opacity-90 drop-shadow-sm">
              Leé, Crecé y Multiplicá
            </p>
          </div>
          <button onClick={handleLogin} className="w-full max-w-xs flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-black text-sm tracking-widest shadow-2xl shadow-amber-500/20 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 uppercase">
            <LogIn size={18}/> Ingresar con Google
          </button>
        </div>
      </div>
    );
  }

  // --- APP PRINCIPAL ---
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-serif relative ${themeStyles[tema].split(' ')[0]} ${themeStyles[tema].split(' ')[1]}`}>
      {tema === 'cym' && <EstrellasFondo />}

      <nav className={`sticky top-0 z-50 px-2 md:px-6 py-3 shadow-md flex items-center justify-between backdrop-blur-md border-b ${navStyles[tema]}`}>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setVistaActual('home'); setVersiculoActual(''); }}>
          {vistaActual !== 'home' && <ArrowLeft size={20} className="mr-1" />}
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(204,163,0,0.5)]" />
          <h1 className="text-lg md:text-2xl font-black tracking-wider hidden sm:block">CyM <span className="font-light opacity-80">Biblia</span></h1>
        </div>

        <div className="flex items-center gap-1 md:gap-3 relative z-10">
          <a href="https://www.youtube.com/@crecerymultiplicar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-wider bg-red-600 text-white shadow-md hover:scale-105 transition-transform" title="Visitar nuestro canal">
            <PlayCircle size={14} /> <span className="hidden sm:inline">YouTube</span>
          </a>

          <button onClick={() => setVistaActual('trivia')} className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-wider bg-blue-600 text-white shadow-md hover:scale-105 transition-transform" title="Jugar Desafío Bíblico">
            <Trophy size={14} /> <span className="hidden sm:inline">Jugar</span>
          </button>

          <button onClick={() => setVistaActual('club')} className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md hover:scale-105 transition-transform" title="Club de Socios">
            <Crown size={14} className="fill-black" /> <span className="hidden sm:inline">Club CyM</span>
          </button>

          {vistaActual === 'lector' && (
            <>
              <select value={versionActual} onChange={(e) => { setVersionActual(e.target.value); setVersiculoActual(''); }} className="bg-[#cca300]/20 rounded-full px-2 py-1 font-black text-[#fcd34d] text-xs md:text-sm outline-none cursor-pointer appearance-none text-center border border-[#cca300]/30 mr-1 hidden sm:block">
                <option value="RVR1960" className="text-black">RV1960</option>
                <option value="NTV" className="text-black">NTV</option>
                <option value="DHH" className="text-black">DHH</option>
                <option value="LBLA" className="text-black">LBLA</option>
                <option value="TLA" className="text-black">TLA</option>
              </select>

              <select value={libroActual} onChange={(e) => {setLibroActual(e.target.value); setCapituloActual(1); setVersiculoActual('');}} className="bg-transparent font-bold text-xs md:text-base outline-none cursor-pointer appearance-none text-right max-w-[70px] md:max-w-[100px] truncate hidden sm:block">
                {LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre} className="text-black">{l.nombre}</option>)}
              </select>
              <span className="opacity-50 font-black hidden sm:inline">/</span>
              
              {(() => {
                let cantidadCapitulos = 1;
                try {
                  const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
                  if (libroData) {
                    if (libroData.chapters) cantidadCapitulos = libroData.chapters.filter(c => c.is_chapter === true).length;
                    else if (libroData.verses) cantidadCapitulos = Math.max(...libroData.verses.map(v => Number(v.chapter)));
                  }
                } catch(e) {}
                return (
                  <select value={capituloActual} onChange={(e) => { setCapituloActual(Number(e.target.value)); setVersiculoActual(''); }} className="bg-transparent font-bold text-xs md:text-base outline-none cursor-pointer appearance-none hidden sm:block">
                    {Array.from({ length: cantidadCapitulos }, (_, i) => i + 1).map(num => <option key={num} value={num} className="text-black">Cap. {num}</option>)}
                  </select>
                );
              })()}

              <span className="opacity-50 font-black hidden sm:inline">:</span>

              <select value={versiculoActual} onChange={(e) => setVersiculoActual(e.target.value)} className="bg-[#cca300]/10 border border-[#cca300]/30 rounded px-1.5 py-0.5 text-[#fcd34d] font-bold text-xs md:text-sm outline-none cursor-pointer appearance-none text-center hidden sm:block">
                <option value="" className="text-black">Ver.</option>
                {versiculosActuales.map((v) => <option key={v.numero} value={v.numero} className="text-black">{v.numero}</option>)}
              </select>
            </>
          )}
          <button onClick={() => setMostrarAjustes(!mostrarAjustes)} className="p-2 rounded-full hover:bg-white/10 transition-colors ml-1"><Settings size={18} /></button>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"><LogOut size={18} /></button>
        </div>
      </nav>

      {/* --- MODAL AJUSTES VISUALES --- */}
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
            <button onClick={() => setTema('claro')} className={`flex-1 p-3 rounded-xl border-2 flex justify-center shadow-sm ${tema === 'claro' ? 'border-slate-800 bg-slate-100' : 'border-transparent bg-white text-slate-900'}`}><Sun size={18} /></button>
            <button onClick={() => setTema('sepia')} className={`flex-1 p-3 rounded-xl border-2 flex justify-center shadow-sm ${tema === 'sepia' ? 'border-[#8b6b4a] bg-[#e6d5b8]' : 'border-transparent bg-[#fbf0d9] text-[#5f4b32]'}`}><BookOpen size={18} /></button>
            <button onClick={() => setTema('cym')} title="Modo CyM" className={`flex-1 p-3 rounded-xl border-2 flex justify-center shadow-sm ${tema === 'cym' ? 'border-[#ffd700] bg-black' : 'border-transparent bg-[#0a0a0a] text-[#ffd700]'}`}><Sparkles size={18} /></button>
          </div>
        </div>
      )}

      {/* --- VENTANA EMERGENTE DEL DEVOCIONAL DIARIO --- */}
      {mostrarModalDevocional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl border relative text-left overflow-y-auto max-h-[85vh] ${tema === 'cym' ? 'bg-[#0f0f0f] border-[#cca300]/40 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button onClick={() => setMostrarModalDevocional(false)} className="absolute top-5 right-5 hover:opacity-70 p-1"><X size={22} /></button>
            <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><Sparkles size={12} /> Alimento Espiritual</p>
            <h3 className="text-2xl md:text-3xl font-serif font-black mb-1 bg-gradient-to-r from-[#ffe066] via-[#f5c242] to-[#b38600] text-transparent bg-clip-text">
              {devocionalHoy.titulo}
            </h3>
            <p className="text-xs font-bold opacity-60 mb-6 italic">En base a la lectura de {lecturaHoy.libro} {lecturaHoy.capitulo}</p>
            <div className="space-y-6" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.6' }}>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#ffd700] mb-2 flex items-center gap-2" style={{ fontSize: `${Math.max(12, tamañoFuente * 0.75)}px` }}><FileText size={14} /> Reflexión Pastoral</h4>
                <p className="opacity-90 font-medium whitespace-pre-line">{devocionalHoy.reflexion}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-[#cca300]/20 italic">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#ffd700] mb-2 flex items-center gap-2" style={{ fontSize: `${Math.max(12, tamañoFuente * 0.75)}px` }}><Heart size={14} className="fill-current" /> Oración de Hoy</h4>
                <p className="opacity-90 font-serif">"{devocionalHoy.oracion}"</p>
              </div>
            </div>
            <button onClick={() => { setMostrarModalDevocional(false); abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo); }} className="w-full mt-6 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg">
              Ir a la Lectura Bíblica
            </button>
          </div>
        </div>
      )}

      {/* --- RENDERIZADO DINÁMICO DE VISTAS PRINCIPALES --- */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 relative z-10">
        
        {vistaActual === 'home' && (
          <div>
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-10 shadow-xl border border-[#cca300]/40 backdrop-blur-md" style={{background: 'linear-gradient(135deg, rgba(30,25,0,0.85) 0%, rgba(0,0,0,0.85) 100%)'}}>
              <div className="absolute top-0 right-0 p-6 opacity-10"><Heart size={80} color="#ffd700" /></div>
              <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Sparkles size={12} /> Lectura Recomendada</p>
              <h2 className="text-3xl font-black text-[#fcd34d] mb-4">{lecturaHoy.libro} {lecturaHoy.capitulo}</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button onClick={() => abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors border border-white/10">
                  <BookOpen size={16} /> Abrir Capítulo
                </button>
                <button onClick={() => setMostrarModalDevocional(true)} className="flex-1 bg-gradient-to-r from-[#ffe066] to-[#b38600] text-black font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-amber-500/10">
                  <Sparkles size={16} /> Leer Devocional de Hoy
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 border-b border-[#cca300]/20 pb-2 bg-black/60 p-2 rounded backdrop-blur-sm inline-block">Antiguo Testamento</h3>
                <div className="flex flex-col gap-2">
                  {librosAntiguo.map((libro) => (
                    <button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${tema === 'cym' ? 'bg-black/60 backdrop-blur-md border-[#cca300]/20 hover:border-[#cca300]/60 hover:bg-[#cca300]/10' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tema === 'cym' ? 'bg-[#cca300]/10 text-[#cca300]' : 'bg-slate-100 text-slate-500'}`}><BookOpen size={16} /></div>
                        <span className="font-bold text-lg">{libro.nombre}</span>
                      </div>
                      <ChevronRight size={18} className="opacity-30" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#cca300] uppercase tracking-[0.2em] mb-3 border-b border-[#cca300]/20 pb-2 bg-black/60 p-2 rounded backdrop-blur-sm inline-block">Nuevo Testamento</h3>
                <div className="flex flex-col gap-2">
                  {librosNuevo.map((libro) => (
                    <button key={libro.nombre} onClick={() => abrirLibro(libro.nombre, 1)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${tema === 'cym' ? 'bg-black/60 backdrop-blur-md border-[#cca300]/20 hover:border-[#cca300]/60 hover:bg-[#cca300]/10' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tema === 'cym' ? 'bg-[#cca300]/10 text-[#cca300]' : 'bg-slate-100 text-slate-500'}`}><BookOpen size={16} /></div>
                        <span className="font-bold text-lg">{libro.nombre}</span>
                      </div>
                      <ChevronRight size={18} className="opacity-30" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'lector' && (
          <div className="bg-black/70 p-6 md:p-10 rounded-3xl backdrop-blur-md border border-[#cca300]/20 shadow-2xl">
            <div className="mb-12 text-center flex flex-col items-center">
              <h2 className={`text-3xl font-black mb-6 ${tema === 'cym' ? 'text-[#ffd700]' : ''}`} style={{ fontSize: `${tamañoFuente * 2.2}px` }}>
                {libroActual} {capituloActual}
              </h2>
              <button onClick={toggleLecturaAudio} className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg ${leyendoAudio ? 'bg-red-600 text-white animate-pulse' : tema === 'cym' ? 'bg-[#cca300]/20 text-[#ffd700] hover:bg-[#cca300]/40' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
                {leyendoAudio ? <Square size={16} fill="currentColor"/> : <Volume2 size={16} />}
                {leyendoAudio ? 'Detener Lectura' : 'Escuchar Capítulo'}
                {!isPremium && <Crown size={14} className="ml-1 opacity-70" />}
              </button>
              {!isPremium && <p className="text-[9px] mt-2 opacity-60 uppercase font-black tracking-widest">Función Premium</p>}
            </div>

            <div className="space-y-2 leading-relaxed text-left" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.7' }}>
              {versiculosActuales.map((versiculo, index) => {
                const esVersiculoResaltado = versiculo.numero === versiculoActual;
                return (
                  <p key={index} ref={el => versiculoRefs.current[versiculo.numero] = el} className="relative group cursor-text transition-all duration-500">
                    <sup className={`absolute -left-6 top-1.5 text-[0.6em] font-black select-none ${esVersiculoResaltado ? 'text-amber-400 text-sm' : tema === 'cym' ? 'text-[#ffd700]/60' : 'opacity-40'}`}>
                      {versiculo.numero}
                    </sup>
                    <span className={`rounded p-1 transition-colors duration-500 block ${esVersiculoResaltado ? 'bg-amber-500/20 text-[#ffd700] border-l-2 border-[#ffd700] pl-2 font-bold' : tema === 'cym' ? 'hover:bg-[#ffd700]/10 hover:text-[#ffd700]' : 'hover:bg-amber-500/10'}`}>
                      {versiculo.texto}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* --- CARGAMOS LOS MÓDULOS SEPARADOS --- */}
        {vistaActual === 'trivia' && (
          <ModuloTrivia tema={tema} onVolver={() => setVistaActual('home')} />
        )}

        {vistaActual === 'club' && (
          <ModuloClub 
            tema={tema} 
            onVolver={() => setVistaActual('home')} 
            onSuscribir={() => alert('Próximamente: Integración con MercadoPago')} 
          />
        )}
      </main>

      {/* --- BOTÓN Y VENTANA DEL ASISTENTE IA --- */}
      {vistaActual === 'lector' && (
        <div className="fixed bottom-20 right-6 z-50">
          {mostrarAsistente ? (
            <div className={`w-80 h-96 rounded-2xl shadow-2xl flex flex-col border overflow-hidden ${tema === 'cym' ? 'bg-[#141414] border-[#cca300]/50' : 'bg-white border-slate-200'}`}>
              <div className={`p-3 flex justify-between items-center border-b ${tema === 'cym' ? 'bg-black border-[#cca300]/30' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className={tema === 'cym' ? 'text-[#ffd700]' : 'text-amber-500'} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">Asistente CyM</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${!isOwner && currentUser.creditosIA === 0 ? 'text-red-500' : tema === 'cym' ? 'text-[#cca300]/70' : 'text-slate-500'}`}>
                      {isOwner ? '👑 MODO OWNER' : currentUser.creditosIA > 0 ? `${currentUser.creditosIA} disp.` : 'Pase Requerido'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setMostrarAsistente(false)} className="hover:opacity-70 p-1"><X size={18} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col text-sm">
                {chatHistorial.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-xl max-w-[85%] ${msg.rol === 'usuario' ? `self-end ${tema === 'cym' ? 'bg-[#cca300] text-black' : 'bg-blue-500 text-white'}` : `self-start ${tema === 'cym' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-800'}`}`}>
                    {msg.texto}
                  </div>
                ))}
                {cargandoIA && (
                  <div className={`self-start p-3 rounded-xl ${tema === 'cym' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    Pensando...
                  </div>
                )}
              </div>

              <form onSubmit={enviarMensaje} className={`p-3 border-t flex gap-2 ${tema === 'cym' ? 'bg-black border-[#cca300]/30' : 'bg-white border-slate-200'}`}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Hacé una pregunta..." 
                  disabled={!isOwner && currentUser.creditosIA <= 0}
                  className={`flex-1 rounded-full px-4 py-2 text-sm outline-none border disabled:opacity-50 ${tema === 'cym' ? 'bg-[#1a1a1a] border-[#cca300]/30 text-white placeholder-slate-500 focus:border-[#cca300]' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                />
                <button 
                  type="submit" 
                  disabled={cargandoIA || !chatInput.trim() || (!isOwner && currentUser.creditosIA <= 0)} 
                  className={`p-2 rounded-full flex-shrink-0 transition-colors ${!isOwner && currentUser.creditosIA <= 0 ? 'bg-red-600 text-white cursor-not-allowed' : tema === 'cym' ? 'bg-[#cca300] text-black hover:bg-[#ffd700] disabled:opacity-50' : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'}`}
                >
                  {!isOwner && currentUser.creditosIA <= 0 ? <Lock size={16} /> : <Send size={16} />}
                </button>
              </form>
            </div>
          ) : (
            <button onClick={() => setMostrarAsistente(true)} className={`p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform ${tema === 'cym' ? 'bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-black shadow-[#cca300]/40' : 'bg-blue-600 text-white shadow-blue-500/40'}`}>
              <MessageCircle size={24} />
            </button>
          )}
        </div>
      )}

      <footer className={`mt-auto p-4 flex justify-between items-center backdrop-blur-md border-t relative z-10 ${navStyles[tema]}`}>
        {vistaActual === 'lector' ? (
          <>
            <button onClick={() => cambiarCapitulo(-1)} className="flex items-center gap-2 font-bold opacity-60 hover:opacity-100 transition-opacity text-sm"><ChevronLeft size={18} /> Anterior</button>
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40 hidden sm:block">CyM Biblia v1.0</span>
            <button onClick={() => cambiarCapitulo(1)} className="flex items-center gap-2 font-bold opacity-60 hover:opacity-100 transition-opacity text-sm">Siguiente <ChevronRight size={18} /></button>
          </>
        ) : (
          <div className="w-full text-center">
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Desarrollado por pastor Max Fontán para el ministerio Crecer y Multiplicar</span>
          </div>
        )}
      </footer>
    </div>
  );
}