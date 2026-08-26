import React, { useState, useEffect, useRef } from 'react';
import { 
  FileWord, Upload, Download, Image as ImageIcon, Loader2, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function ModuloBosquejos({ currentUser, db, onVolver, onIrAlClub }) {
  const [listaPredicaciones, setListaPredicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados Formulario Owner
  const [tituloPredica, setTituloPredica] = useState('');
  const [pasajePredica, setPasajePredica] = useState('');
  const [archivoWordTemp, setArchivoWordTemp] = useState(null);
  const [portadaImageTemp, setPortadaImageTemp] = useState(null);
  const [subiendoPredica, setSubiendoPredica] = useState(false);

  const inputRefWord = useRef(null);
  const inputRefPortada = useRef(null);

  const isOwner = currentUser?.role === 'OWNER';
  const mesActualClave = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  const cargarPredicaciones = async () => {
    setCargando(true);
    try {
      const q = collection(db, 'cym_predicaciones');
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach(docSnap => docs.push({ id: docSnap.id, ...docSnap.data() }));
      setListaPredicaciones(docs);
    } catch (e) {
      console.error("Error cargando predicaciones:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (db) cargarPredicaciones();
  }, [db]);

  const handleSelectWord = (e) => {
    const file = e.target.files[0];
    if (file) setArchivoWordTemp(file);
  };

  const handleSelectPortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setPortadaImageTemp(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarPredica = async () => {
    if (!tituloPredica.trim() || !pasajePredica.trim()) {
      alert("Ingresá el título y el pasaje bíblico.");
      return;
    }
    if (!archivoWordTemp) {
      alert("Por favor seleccioná el archivo Word (.docx) de la prédica.");
      return;
    }

    setSubiendoPredica(true);
    const readerWord = new FileReader();
    readerWord.onload = async (event) => {
      const base64Word = event.target.result;
      try {
        await addDoc(collection(db, 'cym_predicaciones'), {
          titulo: tituloPredica,
          pasaje: pasajePredica,
          nombreArchivo: archivoWordTemp.name,
          archivoBase64: base64Word,
          portadaBase64: portadaImageTemp || null,
          fechaSubida: new Date().toISOString()
        });
        alert("¡Prédica guardada con éxito!");
        setTituloPredica('');
        setPasajePredica('');
        setArchivoWordTemp(null);
        setPortadaImageTemp(null);
        cargarPredicaciones();
      } catch (err) {
        alert("Error al guardar: " + err.message);
      } finally {
        setSubiendoPredica(false);
      }
    };
    readerWord.readAsDataURL(archivoWordTemp);
  };

  const handleDescargarArchivo = async (predica, tipo) => {
    const sub = currentUser?.suscripcion?.toUpperCase() || 'GRATIS';
    const rol = currentUser?.role || 'USER';

    if (rol !== 'OWNER' && sub !== 'DIAMANTE') {
      alert("🔒 La biblioteca de prédicas en Word y portadas es exclusiva del Plan Diamante ($30.000/mes). Podés unirte en el Club CyM.");
      onIrAlClub();
      return;
    }

    if (tipo === 'word') {
      let descargasUsadas = currentUser.descargasMesActual || 0;
      if (currentUser.ultimoMesDescarga !== mesActualClave) descargasUsadas = 0;

      if (rol !== 'OWNER' && descargasUsadas >= 10) {
        alert("⚠️ Has alcanzado el límite de 10 descargas de prédicas en Word para este mes.");
        return;
      }

      const link = document.createElement('a');
      link.href = predica.archivoBase64;
      link.download = predica.nombreArchivo || `${predica.titulo}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (rol !== 'OWNER') {
        const nuevoTotal = descargasUsadas + 1;
        const userRef = doc(db, 'cym_usuarios', currentUser.uid);
        await updateDoc(userRef, { descargasMesActual: nuevoTotal, ultimoMesDescarga: mesActualClave });
        currentUser.descargasMesActual = nuevoTotal;
        currentUser.ultimoMesDescarga = mesActualClave;
        alert(`¡Descarga de Word completada! Has usado ${nuevoTotal} de 10 descargas este mes.`);
      }
    } else if (tipo === 'portada') {
      if (!predica.portadaBase64) {
        alert("Esta prédica no tiene imagen de portada adjunta.");
        return;
      }
      const link = document.createElement('a');
      link.href = predica.portadaBase64;
      link.download = `Portada_${predica.titulo}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-black/80 border border-cyan-500/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <button onClick={onVolver} className="text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
          <h2 className="text-3xl font-black text-cyan-400 flex items-center gap-3">
            <FileWord size={32} /> Banco de Prédicas & Bosquejos VIP
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Material exclusivo preparado en Word (.docx) + Portadas para descargar.
          </p>
        </div>

        {currentUser?.role !== 'OWNER' && (
          <div className="bg-cyan-950/80 border border-cyan-500/50 px-5 py-3 rounded-2xl text-right">
            <p className="text-[10px] font-black uppercase text-cyan-300">Descargas del Mes</p>
            <p className="text-xl font-black text-white">{currentUser?.descargasMesActual || 0} / 10</p>
          </div>
        )}
      </div>

      {/* PANEL DE CARGA EXCLUSIVO PARA OWNER */}
      {isOwner && (
        <div className="bg-cyan-950/40 border border-cyan-500/50 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-3">
            <ShieldCheck className="text-cyan-400" size={20} />
            <h3 className="text-cyan-300 font-black text-xs uppercase tracking-wider">Panel Owner: Cargar Nueva Prédica y Portada</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Título de la Prédica" 
              value={tituloPredica} 
              onChange={(e) => setTituloPredica(e.target.value)} 
              className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none"
            />
            <input 
              type="text" 
              placeholder="Pasaje Bíblico Base (ej: Efesios 6:10-18)" 
              value={pasajePredica} 
              onChange={(e) => setPasajePredica(e.target.value)} 
              className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 text-white text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="file" accept=".doc,.docx" ref={inputRefWord} className="hidden" onChange={handleSelectWord} />
            <button 
              type="button"
              onClick={() => inputRefWord.current.click()} 
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${archivoWordTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}
            >
              <FileWord size={18} /> {archivoWordTemp ? `✓ ${archivoWordTemp.name}` : "1. Adjuntar Word (.docx)"}
            </button>

            <input type="file" accept="image/*" ref={inputRefPortada} className="hidden" onChange={handleSelectPortada} />
            <button 
              type="button"
              onClick={() => inputRefPortada.current.click()} 
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase ${portadaImageTemp ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-black/40 border-cyan-500/30 text-cyan-400'}`}
            >
              <ImageIcon size={18} /> {portadaImageTemp ? "✓ Portada Seleccionada" : "2. Adjuntar Imagen Portada"}
            </button>
          </div>

          <button 
            type="button"
            onClick={handleGuardarPredica} 
            disabled={subiendoPredica}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {subiendoPredica ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {subiendoPredica ? "Guardando..." : "Publicar en Galería"}
          </button>
        </div>
      )}

      {/* TARJETAS DE PREDICACIONES */}
      {cargando ? (
        <div className="text-center py-16 text-cyan-400">
          <Loader2 className="animate-spin mx-auto mb-3" size={36} />
          <p className="font-bold text-xs uppercase tracking-widest">Cargando Bosquejos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listaPredicaciones.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 bg-black/60 border border-white/10 rounded-3xl">
              <FileWord size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">No hay prédicas subidas aún.</p>
            </div>
          ) : (
            listaPredicaciones.map((p) => (
              <div key={p.id} className="bg-black/80 border border-white/10 hover:border-cyan-500/50 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all">
                <div>
                  {p.portadaBase64 ? (
                    <div className="h-48 w-full overflow-hidden relative">
                      <img src={p.portadaBase64} alt={p.titulo} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-cyan-950/40 border-b border-white/10 flex items-center justify-center text-cyan-500/40">
                      <FileWord size={48} />
                    </div>
                  )}
                  <div className="p-5">
                    <h4 className="text-white font-black text-xl mb-1 leading-snug">{p.titulo}</h4>
                    <p className="text-cyan-400 font-bold text-xs">📖 {p.pasaje}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button 
                    onClick={() => handleDescargarArchivo(p, 'word')}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download size={14} /> Descargar .DOCX
                  </button>
                  
                  {p.portadaBase64 && (
                    <button 
                      onClick={() => handleDescargarArchivo(p, 'portada')}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-3 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 border border-white/10"
                      title="Descargar Imagen de Portada"
                    >
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
  );
}