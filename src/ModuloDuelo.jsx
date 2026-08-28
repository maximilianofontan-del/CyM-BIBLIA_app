import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, doc, getDoc, updateDoc, onSnapshot, query, where 
} from 'firebase/firestore';
import { 
  Swords, Trophy, Clock, Send, ChevronLeft, Loader2, Zap, Users, Inbox, XCircle, CheckCircle2 
} from 'lucide-react';

const PREGUNTAS_DUELO = [
  { p: "¿Cuántos días y noches llovió durante el diluvio?", r: ["40", "30", "50", "7"], c: 0 },
  { p: "¿Quién fue vendido por sus hermanos como esclavo?", r: ["Moisés", "José", "David", "Daniel"], c: 1 },
  { p: "¿En qué libro bíblico se encuentra el Salmo 23?", r: ["Proverbios", "Salmos", "Isaías", "Génesis"], c: 1 },
  { p: "¿Cuál es el primer libro del Nuevo Testamento?", r: ["Marcos", "Lucas", "Juan", "Mateo"], c: 3 },
  { p: "¿Quién derrotó al gigante Goliat con una honda?", r: ["Saúl", "David", "Salomón", "Sansón"], c: 1 },
  { p: "¿En cuántos días creó Dios los cielos y la tierra?", r: ["7", "6", "3", "40"], c: 1 },
  { p: "¿Qué ave envió Noé por primera vez desde el arca?", r: ["Paloma", "Cuervo", "Gorrión", "Águila"], c: 1 },
  { p: "¿Quién era el sobrino de Abraham?", r: ["Isaac", "Jacob", "Lot", "Taré"], c: 2 },
  { p: "¿Qué edad tenía Sara cuando nació su hijo Isaac?", r: ["90 años", "100 años", "80 años", "75 años"], c: 0 },
  { p: "¿Por qué comida vendió Esaú su primogenitura?", r: ["Plato de lentejas", "Cordero asado", "Pan y miel", "Codornices"], c: 0 },
  { p: "¿Cómo se llamaban las dos esposas de Jacob?", r: ["Rut y Orfa", "Lea y Raquel", "Sara y Rebeca", "María y Marta"], c: 1 },
  { p: "¿Quién era el hermano menor de José?", r: ["Rubén", "Judá", "Benjamín", "Simeón"], c: 2 },
  { p: "¿Dónde escondió Jocabed al bebé Moisés?", r: ["Cueva", "Canasta en el Nilo", "Desierto", "Templo"], c: 1 },
  { p: "¿Desde dónde le habló Dios a Moisés por primera vez?", r: ["Una nube", "Una zarza ardiente", "Un torbellino", "Un ángel"], c: 1 },
  { p: "¿Cuál fue la primera plaga de Egipto?", r: ["Ranas", "Oscuridad", "Agua en sangre", "Moscas"], c: 2 },
  { p: "¿Qué fiesta instituyó Dios para recordar la salida de Egipto?", r: ["Pentecostés", "Pascua", "Tabernáculos", "Purim"], c: 1 },
  { p: "¿Qué ídolo de oro hizo Aarón en el desierto?", r: ["Serpiente", "Becerro", "León", "Águila"], c: 1 },
  { p: "¿Cuántos espías envió Moisés a explorar Canaán?", r: ["2", "7", "10", "12"], c: 3 },
  { p: "¿Qué río cruzó Israel en seco para entrar a la Tierra Prometida?", r: ["Nilo", "Tigris", "Éufrates", "Jordán"], c: 3 },
  { p: "¿Por orden de quién se detuvo el sol en Gabaón?", r: ["Moisés", "Josué", "David", "Elías"], c: 1 },
  { p: "¿Qué juez de Israel era zurdo?", r: ["Gedeón", "Aod", "Sansón", "Jefté"], c: 1 },
  { p: "¿Quién fue la única mujer juez de Israel?", r: ["Rut", "Ester", "Débora", "Jael"], c: 2 },
  { p: "¿A quién le reveló Sansón el secreto de su fuerza?", r: ["A su padre", "Filisteos", "Dalila", "A un ángel"], c: 2 },
  { p: "¿Quién fue el sacerdote que crio a Samuel?", r: ["Elí", "Aarón", "Sadoc", "Zacarías"], c: 0 },
  { p: "¿Qué pastoreaba David antes de ser ungido rey?", r: ["Vacas", "Camellos", "Ovejas", "Cabras"], c: 2 },
  { p: "¿Quién construyó el primer gran templo en Jerusalén?", r: ["David", "Josías", "Salomón", "Ezequías"], c: 2 },
  { p: "¿A qué rey le añadió Dios 15 años más de vida?", r: ["Ezequías", "Josías", "David", "Saúl"], c: 0 },
  { p: "¿Quién era el enemigo principal de Mardoqueo y los judíos?", r: ["Faraón", "Amán", "Nabucodonosor", "Sanbalat"], c: 1 },
  { p: "¿A quién alimentaron los cuervos en el arroyo de Querit?", r: ["Eliseo", "Elías", "Isaías", "Jeremías"], c: 1 },
  { p: "¿Cuántas veces se zambulló Naamán en el Jordán?", r: ["3", "7", "10", "12"], c: 1 },
  { p: "¿Qué profeta se casó con una mujer infiel por orden de Dios?", r: ["Amós", "Oseas", "Miqueas", "Joel"], c: 1 },
  { p: "¿Hacia qué ciudad huyó Jonás para no ir a Nínive?", r: ["Babilonia", "Jope", "Tarsis", "Jerusalén"], c: 2 },
  { p: "¿Cuántos Salmos hay en la Biblia?", r: ["100", "120", "150", "200"], c: 2 },
  { p: "¿Qué libro dice: 'Vanidad de vanidades, todo es vanidad'?", r: ["Proverbios", "Cantares", "Job", "Eclesiastés"], c: 3 },
  { p: "¿Qué significa el nombre Emanuel?", r: ["Salvador", "Dios con nosotros", "Príncipe de Paz", "Ungido"], c: 1 },
  { p: "¿Cuál es la última palabra de la Biblia?", r: ["Amén", "Jesús", "Aleluya", "Dios"], c: 0 },
  { p: "¿Qué tribu de Israel fue designada para el sacerdocio?", r: ["Judá", "Benjamín", "Leví", "Zabulón"], c: 2 },
  { p: "¿Qué ángel le anunció a María que concebiría a Jesús?", r: ["Miguel", "Rafael", "Gabriel", "Uriel"], c: 2 },
  { p: "¿Qué regalos llevaron los sabios de oriente a Jesús?", r: ["Oro, plata y bronce", "Oro, incienso y mirra", "Incienso, mirra y diamantes", "Pan y vino"], c: 1 },
  { p: "¿En qué ciudad se crio Jesús?", r: ["Belén", "Jericó", "Nazaret", "Jerusalén"], c: 2 },
  { p: "¿Por la muerte de quién lloró Jesús?", r: ["Juan el Bautista", "Lázaro", "José", "Moisés"], c: 1 },
  { p: "¿Sobre qué animal montó Jesús para entrar triunfante a Jerusalén?", r: ["Caballo blanco", "Camello", "Asno", "Mula"], c: 2 },
  { p: "¿En qué huerto oró Jesús antes de ser arrestado?", r: ["Edén", "Getsemaní", "Monte de los Olivos", "Gólgota"], c: 1 },
  { p: "¿Qué decía el letrero sobre la cruz de Jesús?", r: ["Rey de los Judíos", "El Hijo de Dios", "Salvador del mundo", "El Mesías"], c: 0 },
  { p: "¿A quién se le apareció primero Jesús resucitado?", r: ["Pedro", "María Magdalena", "Juan", "María (su madre)"], c: 1 },
  { p: "¿Qué discípulo dijo que no creería hasta ver las heridas de Jesús?", r: ["Judas", "Felipe", "Tomás", "Mateo"], c: 2 },
  { p: "¿Cómo se llamaba el centurión romano al que Pedro le predicó?", r: ["Julio", "Cornelio", "Félix", "Agusto"], c: 1 },
  { p: "¿En qué ciudad a los discípulos se les llamó 'cristianos' por primera vez?", r: ["Jerusalén", "Roma", "Antioquía", "Éfeso"], c: 2 },
  { p: "¿Qué joven se quedó dormido y cayó de un tercer piso predicando Pablo?", r: ["Timoteo", "Tito", "Eutico", "Esteban"], c: 2 },
  { p: "¿Qué libro del Nuevo Testamento fue escrito por un médico?", r: ["Romanos", "Gálatas", "Hechos", "Hebreos"], c: 2 },
  { p: "¿Qué epístola afirma que 'la fe sin obras es muerta'?", r: ["Romanos", "Santiago", "Efesios", "Judas"], c: 1 },
  { p: "¿En qué capítulo de Efesios se describe la armadura de Dios?", r: ["Capítulo 1", "Capítulo 3", "Capítulo 6", "Capítulo 8"], c: 2 },
  { p: "Completá: 'Todo lo puedo en Cristo que me...'", r: ["Ayuda", "Fortalece", "Guía", "Salva"], c: 1 },
  { p: "¿En qué isla estaba exiliado Juan cuando escribió Apocalipsis?", r: ["Chipre", "Malta", "Patmos", "Creta"], c: 2 },
  { p: "¿Cuántas puertas tiene la Nueva Jerusalén?", r: ["7", "10", "12", "24"], c: 2 },
  { p: "¿De dónde sale el río de agua de vida en Apocalipsis?", r: ["Del Templo", "Del trono de Dios y del Cordero", "De la tierra", "Del cielo"], c: 1 },
  { p: "Jesús dijo: 'Yo soy el Alfa y la...'", r: ["Beta", "Omega", "Luz", "Verdad"], c: 1 },
  { p: "¿Qué animal tentó a Eva en el Edén?", r: ["Un león", "Una serpiente", "Un cuervo", "Un escorpión"], c: 1 },
  { p: "¿En qué monte recibió Moisés los 10 mandamientos?", r: ["Sion", "Carmelo", "Sinaí", "Ararat"], c: 2 },
  { p: "¿Quién fue el hombre más fuerte de la Biblia?", r: ["Goliat", "David", "Sansón", "Saúl"], c: 2 },
  { p: "¿A quién le pidió Dios que sacrificara a su hijo Isaac?", r: ["Jacob", "Abraham", "Moisés", "Lot"], c: 1 },
  { p: "¿Qué mar cruzaron los israelitas en seco?", r: ["Mar Muerto", "Mar de Galilea", "Mar Rojo", "Mar Mediterráneo"], c: 2 },
  { p: "¿Quién fue el primer mártir cristiano?", r: ["Pedro", "Pablo", "Esteban", "Santiago"], c: 2 },
  { p: "¿Cuántos libros tiene la Biblia protestante?", r: ["66", "73", "39", "27"], c: 0 },
  { p: "¿Cuál es el libro más largo de la Biblia?", r: ["Génesis", "Isaías", "Salmos", "Jeremías"], c: 2 },
  { p: "¿Qué alimento cayó del cielo para el pueblo de Israel?", r: ["Codornices", "Maná", "Miel", "Pan de cebada"], c: 1 },
  { p: "¿Quién se subió a un árbol para ver a Jesús?", r: ["Zaqueo", "Bartimeo", "Nicodemo", "Lázaro"], c: 0 },
  { p: "¿Qué hermano de Moisés fue el primer sumo sacerdote?", r: ["Coré", "Aarón", "Hur", "Josué"], c: 1 },
  { p: "¿Qué ciudad amurallada fue conquistada primero por Josué?", r: ["Hai", "Hebrón", "Jericó", "Siquem"], c: 2 },
  { p: "¿De qué nacionalidad era Rut?", r: ["Israelita", "Egipcia", "Moabita", "Filistea"], c: 2 },
  { p: "¿Quién fue el primer rey de Israel?", r: ["David", "Saúl", "Salomón", "Absalón"], c: 1 },
  { p: "¿Qué ciudad fue destruida por Dios con fuego y azufre?", r: ["Jericó", "Nínive", "Sodoma", "Babilonia"], c: 2 },
  { p: "¿Por cuántas monedas de plata traicionó Judas a Jesús?", r: ["10", "20", "30", "40"], c: 2 },
  { p: "¿Qué profeta fue arrojado al foso de los leones?", r: ["Daniel", "Sadrac", "Jeremías", "Ezequiel"], c: 0 },
  { p: "¿Cómo se llamaba el ciego al que Jesús sanó en Jericó?", r: ["Zaqueo", "Bartimeo", "Jairo", "Lázaro"], c: 1 },
  { p: "¿Qué joven mató a un oso y un león para defender a sus ovejas?", r: ["José", "Moisés", "David", "Gedeón"], c: 2 },
  { p: "¿Cómo se llama el profeta que hizo flotar un hacha en el agua?", r: ["Elías", "Eliseo", "Isaías", "Jeremías"], c: 1 },
  { p: "¿Quién era la madre de Salomón?", r: ["Mical", "Abigail", "Betsabé", "María"], c: 2 },
  { p: "¿Qué apóstol era fabricante de tiendas de campaña?", r: ["Pedro", "Juan", "Pablo", "Santiago"], c: 2 },
  { p: "¿Qué madera usó Noé para construir el arca?", r: ["Cedro", "Acacia", "Gofer", "Roble"], c: 2 },
  { p: "¿Cuál era el nombre babilónico de Daniel?", r: ["Sadrac", "Mesac", "Abed-nego", "Beltsasar"], c: 3 },
  { p: "¿De qué color era el caballo de Apocalipsis cuyo jinete era la Muerte?", r: ["Blanco", "Negro", "Amarillo pálido", "Rojo"], c: 2 },
  { p: "¿Quién fue la primera mujer de la Biblia?", r: ["Sara", "Eva", "Raquel", "Rebeca"], c: 1 },
  { p: "¿En qué río fue bautizado Jesús?", r: ["Nilo", "Éufrates", "Jordán", "Tigris"], c: 2 },
  { p: "¿Qué discípulo caminó sobre el agua?", r: ["Juan", "Andrés", "Pedro", "Jacobo"], c: 2 },
  { p: "¿A quién le cortó Pedro la oreja en el Getsemaní?", r: ["Caifás", "Malco", "Ananías", "Barrabás"], c: 1 },
  { p: "¿Qué fruta comieron Adán y Eva en el paraíso?", r: ["Manzana", "Higo", "Fruto del árbol del conocimiento", "Uva"], c: 2 },
  { p: "¿Qué mujer salvó a los espías israelitas en Jericó?", r: ["Rut", "Rahab", "Débora", "Ester"], c: 1 },
  { p: "¿Cuántos cuernos tenía la bestia que subía del mar en Apocalipsis 13?", r: ["7", "10", "12", "4"], c: 1 },
  { p: "¿Cómo se llamaban las hermanas de Lázaro?", r: ["Rut y Noemí", "María y Marta", "Priscila y Lidia", "Sara y Rebeca"], c: 1 },
  { p: "¿Qué emperador romano desterró a Juan a Patmos?", r: ["Domiciano", "Nerón", "Augusto", "Julio César"], c: 0 }
];

export default function ModuloDuelo({ currentUser, db, listaAmigos = [], onVolver }) {
  const [dueloActivo, setDueloActivo] = useState(null);
  const [preguntasPartida, setPreguntasPartida] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [preguntaIndex, setPreguntaIndex] = useState(0);
  const [puntosDuelo, setPuntosDuelo] = useState(0);
  const puntosDueloRef = useRef(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [dueloFinalizado, setDueloFinalizado] = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [inputChat, setInputChat] = useState('');

  const [desafiosRecibidos, setDesafiosRecibidos] = useState([]);

  const corazonesSuficientes = (currentUser?.corazones || 0) >= 2;
  const amigosParaRetar = listaAmigos.filter(a => a.uid !== currentUser.uid);

  // MANTENER REFERENCIA ACTUALIZADA DE LOS PUNTOS PARA EL CORTE SÚBITO
  useEffect(() => {
    puntosDueloRef.current = puntosDuelo;
  }, [puntosDuelo]);

  // ESCUCHAR DESAFÍOS ENTRANTES
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'cym_duelos'), where('retadorId', '==', currentUser.uid), where('estado', '==', 'ESPERANDO'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const retos = [];
      snap.forEach(d => retos.push({ id: d.id, ...d.data() }));
      setDesafiosRecibidos(retos);
    });
    return () => unsubscribe();
  }, [currentUser, db]);

  // RELOJ DE 15 SEGUNDOS
  useEffect(() => {
    if (!dueloActivo || dueloFinalizado || respuestaSeleccionada !== null || dueloActivo.estado === 'ESPERANDO') return;
    if (tiempoRestante === 0) {
      setRespuestaSeleccionada(-1);
      siguientePregunta();
      return;
    }
    const timer = setInterval(() => setTiempoRestante((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [tiempoRestante, dueloActivo, dueloFinalizado, respuestaSeleccionada]);

  // ESCUCHADOR DE CORTE: SI EL OPONENTE TERMINA ANTES, ME CORTA EL DUELO A MI
  useEffect(() => {
    if (!dueloActivo || dueloFinalizado || dueloActivo.estado !== 'ACTIVO') return;

    const soyCreador = currentUser.uid === dueloActivo.creadorId;
    const elOtroTermino = soyCreador ? dueloActivo.retadorTermino : dueloActivo.creadorTermino;

    if (elOtroTermino) {
      setDueloFinalizado(true);
      setTimeout(() => {
        alert("⏱️ ¡Tu oponente terminó todas las preguntas primero! El duelo se cierra con tu puntaje actual.");
        finalizarMiTurno(puntosDueloRef.current);
      }, 100);
    }
  }, [dueloActivo, dueloFinalizado, currentUser.uid]);

  const procesarDatosDuelo = (data, id) => {
    if (data.preguntasIds && data.preguntasIds.length > 0) {
      setPreguntasPartida(data.preguntasIds.map(indice => PREGUNTAS_DUELO[indice]));
    }
    setDueloActivo({ id, ...data });
    setMensajesChat(data.mensajesChat || []);
  };

  const retarAmigo = async (amigo) => {
    if (!corazonesSuficientes) {
      alert("⚠️ Necesitás al menos 2 corazones para apostar en un Duelo Bíblico.");
      return;
    }

    setBuscando(true);
    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { corazones: currentUser.corazones - 2 });

      // Seleccionar 30 preguntas al azar del banco gigante
      const cantidadPreguntas = Math.min(30, PREGUNTAS_DUELO.length);
      const indicesAleatorios = [];
      while (indicesAleatorios.length < cantidadPreguntas) {
        const rand = Math.floor(Math.random() * PREGUNTAS_DUELO.length);
        if (!indicesAleatorios.includes(rand)) {
          indicesAleatorios.push(rand);
        }
      }

      const docRef = await addDoc(collection(db, 'cym_duelos'), {
        creadorId: currentUser.uid,
        creadorNombre: currentUser.nombre || 'Jugador',
        creadorPuntos: 0,
        retadorId: amigo.uid,
        retadorNombre: amigo.nombre || 'Amigo',
        retadorPuntos: 0,
        estado: 'ESPERANDO',
        ganadorId: null,
        mensajesChat: [],
        preguntasIds: indicesAleatorios,
        creadorTermino: false,
        retadorTermino: false,
        fechaCreacion: new Date().toISOString()
      });

      onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.estado === 'RECHAZADO') {
             alert(`${data.retadorNombre} ha rechazado o cancelado el desafío. Se te devolvieron los 2 corazones.`);
             setDueloActivo(null);
             return;
          }
          procesarDatosDuelo(data, snap.id);
        }
      });
    } catch (e) {
      alert("Error al enviar el desafío.");
    } finally {
      setBuscando(false);
    }
  };

  const aceptarDesafio = async (duelo) => {
    if (!corazonesSuficientes) {
      alert("⚠️ Necesitás al menos 2 corazones para aceptar y apostar.");
      return;
    }
    setBuscando(true);
    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { corazones: currentUser.corazones - 2 });
      const docRef = doc(db, 'cym_duelos', duelo.id);
      
      await updateDoc(docRef, { estado: 'ACTIVO' });

      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          procesarDatosDuelo(docSnap.data(), docSnap.id);
        }
      });
    } catch (e) {
      alert("Error al conectar con la partida.");
    } finally {
      setBuscando(false);
    }
  };

  const rechazarDesafio = async (duelo) => {
    try {
      const docRef = doc(db, 'cym_duelos', duelo.id);
      await updateDoc(docRef, { estado: 'RECHAZADO' });
      const creadorRef = doc(db, 'cym_usuarios', duelo.creadorId);
      const creadorSnap = await getDoc(creadorRef);
      if (creadorSnap.exists()) {
        await updateDoc(creadorRef, { corazones: (creadorSnap.data().corazones || 0) + 2 });
      }
    } catch(e) {}
  };

  const cancelarDesafioEnviado = async () => {
    if (!dueloActivo) return;
    try {
      await updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { corazones: currentUser.corazones + 2 });
      await updateDoc(doc(db, 'cym_duelos', dueloActivo.id), { estado: 'CANCELADO' });
      setDueloActivo(null);
    } catch(e) {}
  };

  const responderPregunta = (indexOpcion) => {
    if (respuestaSeleccionada !== null) return;
    setRespuestaSeleccionada(indexOpcion);

    const esCorrecta = indexOpcion === preguntasPartida[preguntaIndex].c;
    const nuevosPuntos = esCorrecta ? puntosDuelo + 10 : puntosDuelo;
    if (esCorrecta) setPuntosDuelo(nuevosPuntos);

    siguientePregunta(nuevosPuntos);
  };

  const siguientePregunta = (puntosActuales = puntosDuelo) => {
    setTimeout(async () => {
      // Si cortaron el duelo por muerte súbita mientras estaba en el timeout, evitamos avanzar.
      if (dueloFinalizado) return;

      if (preguntaIndex + 1 < preguntasPartida.length) {
        setPreguntaIndex(preguntaIndex + 1);
        setRespuestaSeleccionada(null);
        setTiempoRestante(15);
      } else {
        setDueloFinalizado(true);
        await finalizarMiTurno(puntosActuales);
      }
    }, 1200);
  };

  const finalizarMiTurno = async (puntosFinales) => {
    if (!dueloActivo) return;
    const dueloRef = doc(db, 'cym_duelos', dueloActivo.id);
    const soyCreador = dueloActivo.creadorId === currentUser.uid;

    if (soyCreador) {
      await updateDoc(dueloRef, { creadorPuntos: puntosFinales, creadorTermino: true });
    } else {
      await updateDoc(dueloRef, { retadorPuntos: puntosFinales, retadorTermino: true });
    }

    // El último en guardar datos es el encargado de evaluar quién ganó
    const snap = await getDoc(dueloRef);
    const data = snap.data();
    if (data.creadorTermino && data.retadorTermino && data.estado !== 'FINALIZADO') {
      evaluarGanador(dueloActivo.id, data.creadorPuntos, data.retadorPuntos, data.creadorId, data.retadorId);
    }
  };

  const evaluarGanador = async (id, pCreador, pRetador, idCreador, idRetador) => {
    let ganador = null;
    if (pCreador > pRetador) ganador = idCreador;
    else if (pRetador > pCreador) ganador = idRetador;

    await updateDoc(doc(db, 'cym_duelos', id), { 
      ganadorId: ganador || 'EMPATE',
      estado: 'FINALIZADO' 
    });

    if (ganador) {
      const ganadorRef = doc(db, 'cym_usuarios', ganador);
      const snapGanador = await getDoc(ganadorRef);
      if (snapGanador.exists()) {
        const datosG = snapGanador.data();
        await updateDoc(ganadorRef, {
          corazones: (datosG.corazones || 0) + 4, // Premio 4 corazones
          puntosTrivia: (datosG.puntosTrivia || 0) + 50,
          tituloHonorifico: '🏆 GLADIADOR BÍBLICO'
        });
      }
    }
  };

  const enviarMensajeChat = async (e) => {
    if (e) e.preventDefault();
    if (!inputChat.trim() || !dueloActivo) return;
    const nuevoMsg = {
      autor: currentUser.nombre || 'Jugador',
      texto: inputChat.trim(),
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const nuevosMensajes = [...mensajesChat, nuevoMsg];
    setMensajesChat(nuevosMensajes);
    setInputChat('');
    try {
      await updateDoc(doc(db, 'cym_duelos', dueloActivo.id), { mensajesChat: nuevosMensajes });
    } catch (err) {}
  };

  const reaccionRapida = (emoji) => {
    setInputChat(emoji);
    enviarMensajeChat();
  };

  const onCerrarMenu = () => {
    if (dueloActivo && dueloActivo.estado === 'ESPERANDO') cancelarDesafioEnviado();
    onVolver();
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-start p-4 md:p-6 rounded-[35px] bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-900 border-2 border-purple-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="w-full flex justify-between items-center z-10 mb-6">
        <button onClick={onCerrarMenu} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 bg-purple-600/30 border border-purple-400/40 px-4 py-1.5 rounded-full text-purple-300 font-black text-xs uppercase tracking-widest">
          <Swords size={16} /> Duelos Sincrónicos (30 Preguntas)
        </div>
      </div>

      {/* VISTA 1: SALÓN DE DESAFÍOS */}
      {!dueloActivo && (
        <div className="w-full max-w-2xl space-y-6 z-10">
          <div className="bg-purple-900/30 border border-purple-500/30 p-6 rounded-3xl text-center shadow-lg">
            <Swords size={48} className="text-purple-400 mx-auto mb-3" />
            <h2 className="text-2xl font-black text-white">Salón de Duelos</h2>
            <p className="text-slate-300 text-xs mt-1">Apostá 2 corazones y desafiá a tus amigos en una partida de 30 preguntas. El primero en terminar puede cortar la batalla.</p>
          </div>

          {/* INBOX */}
          {desafiosRecibidos.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 p-5 rounded-3xl shadow-xl">
              <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Inbox size={18} /> Desafíos Entrantes ({desafiosRecibidos.length})
              </h3>
              <div className="space-y-3">
                {desafiosRecibidos.map(reto => (
                  <div key={reto.id} className="bg-black/60 p-4 rounded-2xl flex items-center justify-between border border-amber-500/30">
                    <div>
                      <p className="font-bold text-white">{reto.creadorNombre}</p>
                      <p className="text-[10px] text-amber-300 uppercase">Ha apostado 2 ❤️</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => aceptarDesafio(reto)} disabled={buscando} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl" title="Aceptar y Jugar">
                        {buscando ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                      </button>
                      <button onClick={() => rechazarDesafio(reto)} className="bg-red-600/50 hover:bg-red-500 text-white p-2 rounded-xl" title="Rechazar">
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LISTA DE AMIGOS */}
          <div className="bg-black/60 border border-white/10 p-5 rounded-3xl shadow-xl">
            <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={18} className="text-purple-400" /> Mis Amigos
            </h3>
            {amigosParaRetar.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-6">Todavía no tenés amigos agregados. Ve a la pestaña de "Comunidad" para buscarlos.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {amigosParaRetar.map(amigo => (
                  <div key={amigo.uid} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={amigo.photoURL || "https://i.postimg.cc/3RzYnbnB/image-11-png.png"} className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50" alt="perfil" />
                      <div>
                        <p className="font-bold text-white text-sm">{amigo.nombre}</p>
                        <p className="text-[10px] text-purple-300 uppercase">{amigo.puntosTrivia || 0} PTS Trivia</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => retarAmigo(amigo)} 
                      disabled={buscando}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-4 rounded-xl text-xs uppercase flex items-center gap-2 shadow-md transition-transform hover:scale-105"
                    >
                      <Zap size={14} /> Retar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: ESPERANDO */}
      {dueloActivo && dueloActivo.estado === 'ESPERANDO' && !dueloFinalizado && (
        <div className="w-full max-w-lg text-center space-y-6 my-auto z-10">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 shadow-xl">
            <Loader2 className="animate-spin mx-auto text-purple-400" size={40} />
            <h3 className="text-2xl font-black text-white">Desafío Enviado</h3>
            <p className="text-slate-300 text-sm">Esperando a que <span className="text-purple-400 font-bold">{dueloActivo.retadorNombre}</span> abra su Salón de Duelos y acepte.</p>
            <button onClick={cancelarDesafioEnviado} className="mt-4 bg-red-600/50 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase">
              Cancelar y recuperar corazones
            </button>
          </div>
        </div>
      )}

      {/* VISTA 3: BATALLA ACTIVA */}
      {dueloActivo && dueloActivo.estado === 'ACTIVO' && !dueloFinalizado && preguntasPartida.length > 0 && (
        <div className="w-full max-w-xl space-y-4 my-auto z-10">
          <div className="flex justify-between items-center bg-black/50 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Clock className={tiempoRestante <= 5 ? "text-red-500 animate-ping" : "text-amber-400"} size={20} />
              <span className={`text-lg font-black ${tiempoRestante <= 5 ? "text-red-500" : "text-amber-400"}`}>
                {tiempoRestante}s
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">Pregunta {preguntaIndex + 1} / {preguntasPartida.length}</span>
            <span className="text-xs font-black text-purple-400 flex items-center gap-1"><Trophy size={14} /> {puntosDuelo} PTS</span>
          </div>

          <div className="bg-black/60 border border-purple-500/30 p-6 rounded-3xl text-center space-y-4 shadow-xl">
            <h3 className="text-lg md:text-xl font-black text-white">{preguntasPartida[preguntaIndex].p}</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {preguntasPartida[preguntaIndex].r.map((opcion, idx) => {
                let estilo = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                if (respuestaSeleccionada !== null) {
                  if (idx === preguntasPartida[preguntaIndex].c) estilo = "bg-emerald-600 text-white font-bold border-emerald-400";
                  else if (idx === respuestaSeleccionada) estilo = "bg-red-600 text-white border-red-400";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => responderPregunta(idx)}
                    disabled={respuestaSeleccionada !== null}
                    className={`w-full p-3.5 rounded-xl border text-xs md:text-sm font-bold text-left transition-all ${estilo}`}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-black/80 border border-purple-500/20 p-3 rounded-2xl space-y-2">
            <div className="flex gap-2 justify-center border-b border-white/10 pb-2">
              {['🔥', '⚡', '🙏', '👏', '😱'].map((emoji) => (
                <button key={emoji} onClick={() => reaccionRapida(emoji)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-xl text-lg transition-transform hover:scale-125">
                  {emoji}
                </button>
              ))}
            </div>
            <div className="max-h-20 overflow-y-auto space-y-1 text-left text-xs">
              {mensajesChat.map((m, i) => (
                <div key={i} className="text-slate-300">
                  <span className="font-bold text-purple-400">{m.autor}: </span>{m.texto}
                </div>
              ))}
            </div>
            <form onSubmit={enviarMensajeChat} className="flex gap-2">
              <input type="text" placeholder="Escribir mensaje..." value={inputChat} onChange={(e) => setInputChat(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none" />
              <button type="submit" className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500"><Send size={14} /></button>
            </form>
          </div>
        </div>
      )}

      {/* VISTA 4: PANTALLA DE RESULTADOS FINALES */}
      {dueloFinalizado && (
        <div className="w-full max-w-lg text-center space-y-6 my-auto z-10">
          <div className="bg-gradient-to-b from-slate-900 to-black/80 border border-purple-500/40 p-8 rounded-3xl space-y-4 shadow-2xl">
            
            {dueloActivo.estado !== 'FINALIZADO' ? (
              <div className="py-8">
                <Loader2 className="animate-spin text-purple-400 mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-black text-white">Sincronizando con el rival...</h2>
                <p className="text-slate-400 text-sm mt-2">Calculando y validando los puntajes finales.</p>
              </div>
            ) : (
              <>
                {(() => {
                  const soyCreador = currentUser.uid === dueloActivo.creadorId;
                  const misPuntos = soyCreador ? dueloActivo.creadorPuntos : dueloActivo.retadorPuntos;
                  const rivalPuntos = soyCreador ? dueloActivo.retadorPuntos : dueloActivo.creadorPuntos;
                  const miNombre = soyCreador ? dueloActivo.creadorNombre : dueloActivo.retadorNombre;
                  const rivalNombre = soyCreador ? dueloActivo.retadorNombre : dueloActivo.creadorNombre;

                  let textoResultado = "";
                  let colorCentral = "";
                  let icono = null;

                  if (misPuntos > rivalPuntos) {
                    textoResultado = "¡VICTORIA! 🏆";
                    colorCentral = "text-emerald-400";
                    icono = <Trophy size={60} className="text-emerald-400 mx-auto drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />;
                  } else if (misPuntos < rivalPuntos) {
                    textoResultado = "DERROTA 💀";
                    colorCentral = "text-red-500";
                    icono = <XCircle size={60} className="text-red-500 mx-auto" />;
                  } else {
                    textoResultado = "EMPATE TÉCNICO 🤝";
                    colorCentral = "text-amber-400";
                    icono = <Swords size={60} className="text-amber-400 mx-auto" />;
                  }

                  return (
                    <div className="space-y-6">
                      {icono}
                      <h2 className={`text-3xl font-black ${colorCentral}`}>{textoResultado}</h2>
                      
                      <div className="bg-black/60 p-4 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="font-bold text-white text-sm">{miNombre} (Tú)</span>
                          <span className="font-black text-xl text-cyan-400">{misPuntos} PTS</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="font-bold text-slate-400 text-sm">{rivalNombre}</span>
                          <span className="font-black text-xl text-slate-300">{rivalPuntos} PTS</span>
                        </div>
                      </div>

                      <div className="bg-black/40 p-4 rounded-xl border border-purple-500/20 text-xs">
                        {misPuntos > rivalPuntos 
                          ? <p className="text-emerald-400 font-bold text-sm">¡Ganaste la apuesta! +4 Corazones y +50 Pts de Trivia.</p>
                          : <p className="text-slate-400">Has perdido los 2 corazones apostados. ¡La revancha te espera!</p>
                        }
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            <button onClick={onCerrarMenu} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg mt-4">
              Salir del Duelo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}