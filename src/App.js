import React, { useState } from 'react';
import {
  BookOpen, Settings, ChevronLeft, ChevronRight, Type, Sun, Sparkles, LogIn, ArrowLeft, Heart, ChevronRightCircle, MessageCircle, X, Send
} from 'lucide-react';

// 1. IMPORTAMOS LAS BASES DE DATOS
import BibliaRVR from './data/RVR1960.json';
import BibliaNTV from './data/NTV.json';
import BibliaDHH from './data/DHH.json';
import BibliaLBLA from './data/LBLA.json';
import BibliaTLA from './data/TLA.json';

const BIBLIA_VERSIONES = {
  RVR1960: BibliaRVR,
  NTV: BibliaNTV,
  DHH: BibliaDHH,
  LBLA: BibliaLBLA,
  TLA: BibliaTLA
};

// LECTURAS DIARIAS
const LECTURAS_DIARIAS = [
  { libro: 'Salmos', capitulo: 1 }, { libro: 'Proverbios', capitulo: 3 }, { libro: 'Juan', capitulo: 1 },
  { libro: 'Romanos', capitulo: 8 }, { libro: 'Filipenses', capitulo: 4 }, { libro: 'Salmos', capitulo: 23 },
  { libro: 'Isaías', capitulo: 40 }, { libro: 'Mateo', capitulo: 5 }, { libro: 'Efesios', capitulo: 2 },
  { libro: 'Hebreos', capitulo: 11 }, { libro: 'Salmos', capitulo: 91 }, { libro: 'Juan', capitulo: 3 },
  { libro: '1 Corintios', capitulo: 13 }, { libro: 'Colosenses', capitulo: 3 }, { libro: 'Santiago', capitulo: 1 },
  { libro: 'Salmos', capitulo: 121 }, { libro: 'Proverbios', capitulo: 16 }, { libro: 'Mateo', capitulo: 6 },
  { libro: 'Romanos', capitulo: 12 }, { libro: 'Gálatas', capitulo: 5 }, { libro: 'Salmos', capitulo: 139 },
  { libro: 'Isaías', capitulo: 53 }, { libro: 'Lucas', capitulo: 15 }, { libro: 'Juan', capitulo: 15 },
  { libro: 'Efesios', capitulo: 6 }, { libro: 'Filipenses', capitulo: 2 }, { libro: '1 Tesalonicenses', capitulo: 5 },
  { libro: '1 Juan', capitulo: 4 }, { libro: 'Apocalipsis', capitulo: 21 }, { libro: 'Salmos', capitulo: 27 },
  { libro: 'Proverbios', capitulo: 4 }, { libro: 'Josué', capitulo: 1 }, { libro: 'Jeremías', capitulo: 29 },
  { libro: 'Mateo', capitulo: 28 }, { libro: 'Hechos', capitulo: 2 }
];

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
  { fontName: '2 Pedro', testamento: 'Nuevo Testamento' }, { nombre: '1 Juan', testamento: 'Nuevo Testamento' },
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

export default function App() {
  const [mostrarPortada, setMostrarPortada] = useState(true);
  const [vistaActual, setVistaActual] = useState('home');
  const [versionActual, setVersionActual] = useState('RVR1960');
  const [libroActual, setLibroActual] = useState('Génesis');
  const [capituloActual, setCapituloActual] = useState(1);
  const [tema, setTema] = useState('cym');
  const [tamañoFuente, setTamañoFuente] = useState(18);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  // --- ESTADOS DEL ASISTENTE ---
  const [mostrarAsistente, setMostrarAsistente] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [chatHistorial, setChatHistorial] = useState([
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente bíblico CyM. Pregúntame lo que necesites sobre la Biblia o el capítulo que estás leyendo.' }
  ]);

  const diasTranscurridos = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
  const lecturaHoy = LECTURAS_DIARIAS[diasTranscurridos % LECTURAS_DIARIAS.length];

  const obtenerVersiculos = () => {
    try {
      const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
      if (!libroData) return [{ numero: '', texto: "Libro no encontrado." }];
      if (!libroData.chapters) {
        if (libroData.verses) {
          const filtrados = libroData.verses.filter(v => Number(v.chapter) === capituloActual);
          return filtrados.map(v => ({ numero: v.verse, texto: v.text }));
        }
        return [{ numero: '', texto: "Capítulo no disponible." }];
      }
      const capitulosReales = libroData.chapters.filter(c => c && c.is_chapter === true);
      const capituloData = capitulosReales[capituloActual - 1];
      if (!capituloData || !capituloData.items) return [{ numero: '', texto: "Capítulo no disponible." }];

      return capituloData.items
        .filter(item => item && item.type === "verse")
        .map(item => {
          const numeroSeguro = (item.verse_numbers && item.verse_numbers.length > 0) ? item.verse_numbers[0] : '';
          const textoSeguro = (item.lines && Array.isArray(item.lines)) ? item.lines.join(' ') : (item.text || 'Texto no disponible');
          return { numero: numeroSeguro, texto: textoSeguro };
        });
    } catch (e) {
      return [{ numero: '⚠️', texto: `Error en lectura: ${e.message}` }];
    }
  };

  const versiculosActuales = obtenerVersiculos();

  // --- FUNCIÓN DEL ASISTENTE SOLUCIÓN DEFINITIVA (ESTRICTO V1) ---
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const nuevoMensajeUsuario = { rol: 'usuario', texto: chatInput };
    const nuevoHistorial = [...chatHistorial, nuevoMensajeUsuario];
    
    setChatHistorial(nuevoHistorial);
    setChatInput('');
    setCargandoIA(true);

    try {
      // Intentamos obtener la clave tanto si usa prefijo VITE_ como REACT_APP_
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || window._env_?.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("La clave de API no está vinculada correctamente en las Variables de Entorno de Vercel.");
      }

      // Estructuramos el mensaje final exactamente como lo exige la documentación estable v1
      const promptSistema = `Actúa como un consejero bíblico y teólogo pastoral experto para la aplicación 'CyM Biblia'. Responde de forma amable, clara, devocional y 100% en español. El usuario está leyendo actualmente el libro de ${libroActual}, capítulo ${capituloActual}.`;
      
      const cuerpoSolicitud = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${promptSistema}\n\nPregunta del usuario: ${chatInput}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      };

      // Llamada directa limpia usando la ruta de producción v1 para gemini-1.5-flash
      const respuesta = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoSolicitud)
      });

      const data = await respuesta.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts?.[0]?.text) {
        throw new Error("El servidor de Google no devolvió un formato de texto válido.");
      }

      const textoAsistente = data.candidates[0].content.parts[0].text;
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: textoAsistente }]);
    } catch (error) {
      setChatHistorial([...nuevoHistorial, { rol: 'asistente', texto: `⚠️ Error del asistente: ${error.message}` }]);
    } finally {
      setCargandoIA(false);
    }
  };

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

  const abrirLibro = (nombreLibro, capitulo = 1) => {
    setLibroActual(nombreLibro);
    setCapituloActual(capitulo);
    setVistaActual('lector');
    window.scrollTo(0, 0);
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
          setCapituloActual(nuevoCap);
          window.scrollTo(0, 0);
        }
      }
    } catch(e) {}
  };

  const librosAntiguo = LIBROS_MENU.filter((l) => l.testamento === 'Antiguo Testamento');
  const librosNuevo = LIBROS_MENU.filter((l) => l.testamento === 'Nuevo Testamento');

  if (mostrarPortada) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 select-none relative overflow-hidden">
        <EstrellasFondo />
        <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm">
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM Biblia" className="w-80 h-80 object-contain drop-shadow-[0_0_40px_rgba(204,163,0,0.6)] hover:scale-105 transition-transform duration-500"/>
          <div className="space-y-4 mt-4">
            <h1 className="text-5xl font-black text-[#fcd34d] tracking-widest drop-shadow-md">CyM <span className="font-light opacity-80 text-white">BIBLIA</span></h1>
            <p className="text-xs font-black text-[#cca300] uppercase tracking-[0.3em] opacity-80 drop-shadow-md">LEÉ, CRECÉ Y MULTIPLICÁ</p>
          </div>
          <button onClick={() => setMostrarPortada(false)} className="group w-full mt-8 bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-black py-4 rounded-full font-black text-xs flex items-center justify-center gap-3 shadow-2xl shadow-[#cca300]/40 hover:scale-105 transition-all duration-300 uppercase tracking-wider">
            Comenzar Lectura <LogIn size={18} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-serif relative ${themeStyles[tema].split(' ')[0]} ${themeStyles[tema].split(' ')[1]}`}>
      {tema === 'cym' && <EstrellasFondo />}

      <nav className={`sticky top-0 z-50 px-2 md:px-6 py-3 shadow-md flex items-center justify-between backdrop-blur-md border-b ${navStyles[tema]}`}>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setVistaActual('home')}>
          {vistaActual === 'lector' && <ArrowLeft size={20} className="mr-1" />}
          <img src="https://i.postimg.cc/3RzYnbnB/image-11-png.png" alt="Logo CyM" className="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(204,163,0,0.5)]" />
          <h1 className="text-lg md:text-2xl font-black tracking-wider hidden sm:block">CyM <span className="font-light opacity-80">Biblia</span></h1>
        </div>

        <div className="flex items-center gap-1 md:gap-4 relative z-10">
          {vistaActual === 'lector' && (
            <>
              <select value={versionActual} onChange={(e) => setVersionActual(e.target.value)} className="bg-[#cca300]/20 rounded-full px-2 py-1 font-black text-[#fcd34d] text-xs md:text-sm outline-none cursor-pointer appearance-none text-center border border-[#cca300]/30 mr-1 md:mr-2">
                <option value="RVR1960" className="text-black">RV1960</option>
                <option value="NTV" className="text-black">NTV</option>
                <option value="DHH" className="text-black">DHH</option>
                <option value="LBLA" className="text-black">LBLA</option>
                <option value="TLA" className="text-black">TLA</option>
              </select>

              <select value={libroActual} onChange={(e) => {setLibroActual(e.target.value); setCapituloActual(1);}} className="bg-transparent font-bold text-xs md:text-base outline-none cursor-pointer appearance-none text-right max-w-[70px] md:max-w-[100px] truncate">
                {LIBROS_MENU.map((l) => <option key={l.nombre} value={l.nombre} className="text-black">{l.nombre}</option>)}
              </select>
              <span className="opacity-50 font-black">/</span>
              
              {(() => {
                let cantidadCapitulos = 1;
                try {
                  const libroData = encontrarLibro(BIBLIA_VERSIONES[versionActual], libroActual);
                  if (libroData) {
                    if (libroData.chapters) {
                      cantidadCapitulos = libroData.chapters.filter(c => c.is_chapter === true).length;
                    } else if (libroData.verses) {
                      const caps = libroData.verses.map(v => Number(v.chapter));
                      cantidadCapitulos = Math.max(...caps);
                    }
                  }
                } catch(e) {}
                
                return (
                  <select value={capituloActual} onChange={(e) => setCapituloActual(Number(e.target.value))} className="bg-transparent font-bold text-xs md:text-base outline-none cursor-pointer appearance-none">
                    {Array.from({ length: cantidadCapitulos }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num} className="text-black">Cap. {num}</option>
                    ))}
                  </select>
                );
              })()}
            </>
          )}

          <button onClick={() => setMostrarAjustes(!mostrarAjustes)} className="p-2 rounded-full hover:bg-white/10 transition-colors ml-1"><Settings size={18} /></button>
        </div>
      </nav>

      {mostrarAjustes && (
        <div className={`fixed top-20 right-6 p-5 rounded-2xl shadow-2xl border w-72 z-40 animate-in fade-in slide-in-from-top-4 ${tema === 'cym' ? 'bg-[#141414] border-[#cca300]/50' : 'bg-white border-slate-200'}`}>
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

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-8 relative z-10">
        {vistaActual === 'home' && (
          <div className="animate-in fade-in duration-500">
            <div onClick={() => abrirLibro(lecturaHoy.libro, lecturaHoy.capitulo)} className="relative overflow-hidden rounded-3xl p-8 mb-10 cursor-pointer group shadow-xl transition-transform hover:scale-[1.02] border border-[#cca300]/40 backdrop-blur-md" style={{background: 'linear-gradient(135deg, rgba(30,25,0,0.85) 0%, rgba(0,0,0,0.85) 100%)'}}>
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity"><Heart size={80} color="#ffd700" /></div>
              <p className="text-[#cca300] font-black text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Sparkles size={12} /> Lectura de Hoy</p>
              <h2 className="text-3xl font-black text-[#fcd34d] mb-3">{lecturaHoy.libro} {lecturaHoy.capitulo}</h2>
              <p className="text-slate-300 text-base md:text-lg font-medium italic line-clamp-2 pr-8">Toca para abrir la lectura recomendada de hoy...</p>
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
                      <ChevronRightCircle size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
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
                      <ChevronRightCircle size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'lector' && (
          <div className="animate-in slide-in-from-right-8 duration-300 bg-black/70 p-6 md:p-10 rounded-3xl backdrop-blur-md border border-[#cca300]/20 shadow-2xl">
            <h2 className={`text-3xl font-black mb-12 text-center ${tema === 'cym' ? 'text-[#ffd700]' : ''}`} style={{ fontSize: `${tamañoFuente * 2.2}px` }}>
              {libroActual} {capituloActual}
            </h2>

            <div className="space-y-2 leading-relaxed" style={{ fontSize: `${tamañoFuente}px`, lineHeight: '1.7' }}>
              {versiculosActuales.map((versiculo, index) => (
                <p key={index} className="relative group cursor-text">
                  <sup className={`absolute -left-6 top-1.5 text-[0.6em] font-black select-none ${tema === 'cym' ? 'text-[#ffd700]/60' : 'opacity-40'}`}>
                    {versiculo.numero}
                  </sup>
                  <span className={`rounded p-0.5 transition-colors duration-300 ${tema === 'cym' ? 'hover:bg-[#ffd700]/10 hover:text-[#ffd700]' : 'hover:bg-amber-500/10'}`}>
                    {versiculo.texto}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- BOTÓN Y VENTANA DEL ASISTENTE IA --- */}
      {vistaActual === 'lector' && (
        <div className="fixed bottom-20 right-6 z-50">
          {mostrarAsistente ? (
            <div className={`w-80 h-96 rounded-2xl shadow-2xl flex flex-col border overflow-hidden animate-in slide-in-from-bottom-4 ${tema === 'cym' ? 'bg-[#141414] border-[#cca300]/50' : 'bg-white border-slate-200'}`}>
              <div className={`p-3 flex justify-between items-center border-b ${tema === 'cym' ? 'bg-black border-[#cca300]/30' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className={tema === 'cym' ? 'text-[#ffd700]' : 'text-amber-500'} />
                  <span className="font-bold text-sm">Asistente CyM</span>
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
                  <div className={`self-start p-3 rounded-xl animate-pulse ${tema === 'cym' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
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
                  className={`flex-1 rounded-full px-4 py-2 text-sm outline-none border ${tema === 'cym' ? 'bg-[#1a1a1a] border-[#cca300]/30 text-white placeholder-slate-500 focus:border-[#cca300]' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                />
                <button type="submit" disabled={cargandoIA || !chatInput.trim()} className={`p-2 rounded-full flex-shrink-0 transition-colors ${tema === 'cym' ? 'bg-[#cca300] text-black hover:bg-[#ffd700] disabled:opacity-50' : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'}`}>
                  <Send size={16} />
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