import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Mic, MicOff, Volume2, Square, Loader2 } from 'lucide-react';

// ¡IMPORTANTE! PEGÁ TUS 100 PREGUNTAS ADENTRO DE ESTOS CORCHETES [ ]
const PREGUNTAS_LOCALES = [
    { "pregunta": "¿En cuántos días creó Dios los cielos y la tierra?", "opciones": ["7", "6", "3", "40"], "respuestaCorrecta": "6" },
    { "pregunta": "¿Qué ave envió Noé por primera vez desde el arca?", "opciones": ["Una paloma", "Un cuervo", "Un gorrión", "Un águila"], "respuestaCorrecta": "Un cuervo" },
    { "pregunta": "¿Cómo se llamaba la torre que los hombres construyeron para llegar al cielo?", "opciones": ["Torre de Babel", "Torre de Siloé", "Torre de Sión", "Torre de Jericó"], "respuestaCorrecta": "Torre de Babel" },
    { "pregunta": "¿Quién era el sobrino de Abraham?", "opciones": ["Isaac", "Jacob", "Lot", "Taré"], "respuestaCorrecta": "Lot" },
    { "pregunta": "¿Qué edad tenía Sara cuando nació su hijo Isaac?", "opciones": ["90 años", "100 años", "80 años", "75 años"], "respuestaCorrecta": "90 años" },
    { "pregunta": "¿Por qué comida vendió Esaú su primogenitura?", "opciones": ["Un plato de lentejas", "Un cordero asado", "Pan y miel", "Unas codornices"], "respuestaCorrecta": "Un plato de lentejas" },
    { "pregunta": "¿Cómo se llamaban las dos esposas de Jacob?", "opciones": ["Rut y Orfa", "Lea y Raquel", "Sara y Rebeca", "María y Marta"], "respuestaCorrecta": "Lea y Raquel" },
    { "pregunta": "¿Quién era el hermano menor de José?", "opciones": ["Rubén", "Judá", "Benjamín", "Simeón"], "respuestaCorrecta": "Benjamín" },
    { "pregunta": "¿Dónde escondió Jocabed al bebé Moisés?", "opciones": ["En una cueva", "En una canasta en el Nilo", "En el desierto", "En el templo"], "respuestaCorrecta": "En una canasta en el Nilo" },
    { "pregunta": "¿Desde dónde le habló Dios a Moisés por primera vez?", "opciones": ["Una nube", "Una zarza ardiente", "Un torbellino", "Un ángel"], "respuestaCorrecta": "Una zarza ardiente" },
    { "pregunta": "¿Cuál fue la primera plaga de Egipto?", "opciones": ["Ranas", "Oscuridad", "Agua convertida en sangre", "Moscas"], "respuestaCorrecta": "Agua convertida en sangre" },
    { "pregunta": "¿Qué fiesta instituyó Dios para recordar la salida de Egipto?", "opciones": ["Pentecostés", "La Pascua", "Los Tabernáculos", "Purim"], "respuestaCorrecta": "La Pascua" },
    { "pregunta": "¿Cómo se llamaba el lugar donde las aguas eran amargas y Moisés las endulzó?", "opciones": ["Mara", "Sinaí", "Elim", "Horeb"], "respuestaCorrecta": "Mara" },
    { "pregunta": "¿Qué contenía el Arca del Pacto además de las tablas de la ley?", "opciones": ["La honda de David", "El maná y la vara de Aarón", "La corona de Saúl", "Oro y plata"], "respuestaCorrecta": "El maná y la vara de Aarón" },
    { "pregunta": "¿Qué ídolo de oro hizo Aarón mientras Moisés estaba en el monte?", "opciones": ["Una serpiente", "Un becerro", "Un león", "Un águila"], "respuestaCorrecta": "Un becerro" },
    { "pregunta": "¿Cuántos espías envió Moisés a explorar Canaán?", "opciones": ["2", "7", "10", "12"], "respuestaCorrecta": "12" },
    { "pregunta": "¿Quiénes fueron los dos únicos espías que dieron un buen reporte?", "opciones": ["Moisés y Aarón", "Josué y Caleb", "Eldad y Medad", "Nadab y Abiú"], "respuestaCorrecta": "Josué y Caleb" },
    { "pregunta": "¿Qué hizo Moisés para salvar al pueblo de las serpientes venenosas?", "opciones": ["Oró 40 días", "Hizo una serpiente de bronce", "Ofreció un holocausto", "Huyó al monte"], "respuestaCorrecta": "Hizo una serpiente de bronce" },
    { "pregunta": "¿En qué monte murió Moisés?", "opciones": ["Sinaí", "Nebo", "Carmelo", "Sión"], "respuestaCorrecta": "Nebo" },
    { "pregunta": "¿Qué río cruzó Israel en seco para entrar a la Tierra Prometida?", "opciones": ["Nilo", "Tigris", "Éufrates", "Jordán"], "respuestaCorrecta": "Jordán" },
    { "pregunta": "¿Por orden de quién se detuvo el sol en Gabaón?", "opciones": ["Moisés", "Josué", "David", "Elías"], "respuestaCorrecta": "Josué" },
    { "pregunta": "¿Qué juez de Israel era zurdo?", "opciones": ["Gedeón", "Aod", "Sansón", "Jefté"], "respuestaCorrecta": "Aod" },
    { "pregunta": "¿Quién fue la única mujer juez de Israel?", "opciones": ["Rut", "Ester", "Débora", "Jael"], "respuestaCorrecta": "Débora" },
    { "pregunta": "¿Qué mujer mató a Sísara clavándole una estaca en la sien?", "opciones": ["Débora", "Jael", "Rahab", "Dalila"], "respuestaCorrecta": "Jael" },
    { "pregunta": "¿A quién le reveló Sansón el secreto de su fuerza?", "opciones": ["A su padre", "A los filisteos", "A Dalila", "A un ángel"], "respuestaCorrecta": "A Dalila" },
    { "pregunta": "¿Quién fue el sacerdote que crio a Samuel?", "opciones": ["Elí", "Aarón", "Sadoc", "Zacarías"], "respuestaCorrecta": "Elí" },
    { "pregunta": "¿Qué pastoreaba David antes de ser ungido rey?", "opciones": ["Vacas", "Camellos", "Ovejas", "Cabras"], "respuestaCorrecta": "Ovejas" },
    { "pregunta": "¿Cómo se llamaba el hijo de David que se rebeló contra él?", "opciones": ["Salomón", "Absalón", "Amnón", "Adonías"], "respuestaCorrecta": "Absalón" },
    { "pregunta": "¿Quién construyó el primer gran templo en Jerusalén?", "opciones": ["David", "Josías", "Salomón", "Ezequías"], "respuestaCorrecta": "Salomón" },
    { "pregunta": "¿A qué rey le añadió Dios 15 años más de vida?", "opciones": ["Ezequías", "Josías", "David", "Saúl"], "respuestaCorrecta": "Ezequías" },
    { "pregunta": "¿Qué rey comenzó a reinar a los 8 años de edad?", "opciones": ["Manasés", "Joás", "Josías", "Acaz"], "respuestaCorrecta": "Josías" },
    { "pregunta": "¿Quién era el enemigo principal de Mardoqueo y los judíos?", "opciones": ["Faraón", "Amán", "Nabucodonosor", "Sanbalat"], "respuestaCorrecta": "Amán" },
    { "pregunta": "¿Cuántos amigos fueron a consolar a Job?", "opciones": ["2", "3", "5", "7"], "respuestaCorrecta": "3" },
    { "pregunta": "¿Quién lideró la reconstrucción del Templo tras el exilio?", "opciones": ["Esdras", "Nehemías", "Zorobabel", "Malaquías"], "respuestaCorrecta": "Zorobabel" },
    { "pregunta": "¿A quién alimentaron los cuervos en el arroyo de Querit?", "opciones": ["Eliseo", "Elías", "Isaías", "Jeremías"], "respuestaCorrecta": "Elías" },
    { "pregunta": "¿Cómo se llamaba el general sirio que fue sanado de lepra?", "opciones": ["Giezi", "Senaquerib", "Naamán", "Ben-adad"], "respuestaCorrecta": "Naamán" },
    { "pregunta": "¿Cuántas veces se zambulló Naamán en el Jordán?", "opciones": ["3", "7", "10", "12"], "respuestaCorrecta": "7" },
    { "pregunta": "¿Qué profeta se casó con una mujer ramera por orden de Dios?", "opciones": ["Amós", "Oseas", "Miqueas", "Joel"], "respuestaCorrecta": "Oseas" },
    { "pregunta": "¿Qué profeta habló de una gran plaga de langostas?", "opciones": ["Joel", "Nahúm", "Jonás", "Sofonías"], "respuestaCorrecta": "Joel" },
    { "pregunta": "¿Qué rey vio una mano escribiendo en la pared?", "opciones": ["Belsasar", "Darío", "Nabucodonosor", "Ciro"], "respuestaCorrecta": "Belsasar" },
    { "pregunta": "¿Hacia qué ciudad huyó Jonás para no ir a Nínive?", "opciones": ["Babilonia", "Jope", "Tarsis", "Jerusalén"], "respuestaCorrecta": "Tarsis" },
    { "pregunta": "¿Qué ciudad asiria se arrepintió por la predicación de Jonás?", "opciones": ["Babilonia", "Tiro", "Damasco", "Nínive"], "respuestaCorrecta": "Nínive" },
    { "pregunta": "¿Cuántos Salmos hay en la Biblia?", "opciones": ["100", "120", "150", "200"], "respuestaCorrecta": "150" },
    { "pregunta": "¿Cuál es el capítulo más largo de toda la Biblia?", "opciones": ["Isaías 53", "Salmo 119", "Génesis 1", "Apocalipsis 22"], "respuestaCorrecta": "Salmo 119" },
    { "pregunta": "¿Cuál es el capítulo más corto de la Biblia?", "opciones": ["Salmo 117", "Juan 11", "3 Juan 1", "Esdras 2"], "respuestaCorrecta": "Salmo 117" },
    { "pregunta": "¿Qué libro de la Biblia dice: 'Vanidad de vanidades, todo es vanidad'?", "opciones": ["Proverbios", "Cantares", "Job", "Eclesiastés"], "respuestaCorrecta": "Eclesiastés" },
    { "pregunta": "¿Qué significa el nombre Emanuel?", "opciones": ["Salvador", "Dios con nosotros", "Príncipe de Paz", "Ungido"], "respuestaCorrecta": "Dios con nosotros" },
    { "pregunta": "¿Cuál es la última palabra de la Biblia?", "opciones": ["Amén", "Jesús", "Aleluya", "Dios"], "respuestaCorrecta": "Amén" },
    { "pregunta": "¿Quién era el hijo mayor de Jacob?", "opciones": ["Judá", "Rubén", "José", "Leví"], "respuestaCorrecta": "Rubén" },
    { "pregunta": "¿Qué tribu de Israel fue designada para el sacerdocio?", "opciones": ["Judá", "Benjamín", "Leví", "Zabulón"], "respuestaCorrecta": "Leví" },
    { "pregunta": "¿Qué animal despedazó a los jóvenes que se burlaron de Eliseo?", "opciones": ["Leones", "Osos", "Lobos", "Perros salvajes"], "respuestaCorrecta": "Osos" },
    { "pregunta": "¿Qué ángel le anunció a María que concebiría a Jesús?", "opciones": ["Miguel", "Rafael", "Gabriel", "Uriel"], "respuestaCorrecta": "Gabriel" },
    { "pregunta": "¿Quién era la parienta de María que también estaba embarazada?", "opciones": ["Marta", "Elisabet", "Ana", "Salomé"], "respuestaCorrecta": "Elisabet" },
    { "pregunta": "¿Qué regalos le llevaron los sabios de oriente a Jesús?", "opciones": ["Oro, plata y bronce", "Oro, incienso y mirra", "Incienso, mirra y diamantes", "Pan, vino y aceite"], "respuestaCorrecta": "Oro, incienso y mirra" },
    { "pregunta": "¿Qué rey mandó a matar a los niños menores de dos años en Belén?", "opciones": ["Pilato", "Herodes", "Agripa", "Félix"], "respuestaCorrecta": "Herodes" },
    { "pregunta": "¿Cuál fue la primera tentación que el diablo le hizo a Jesús?", "opciones": ["Tirarse del templo", "Convertir piedras en pan", "Adorarle", "Caminar sobre el agua"], "respuestaCorrecta": "Convertir piedras en pan" },
    { "pregunta": "¿En qué ciudad se crio Jesús?", "opciones": ["Belén", "Jericó", "Nazaret", "Jerusalén"], "respuestaCorrecta": "Nazaret" },
    { "pregunta": "¿Por la muerte de quién lloró Jesús?", "opciones": ["Juan el Bautista", "Lázaro", "José", "Moisés"], "respuestaCorrecta": "Lázaro" },
    { "pregunta": "¿Qué dos profetas aparecieron junto a Jesús en la transfiguración?", "opciones": ["Isaías y Jeremías", "Moisés y Elías", "Enoch y Elías", "Abraham y David"], "respuestaCorrecta": "Moisés y Elías" },
    { "pregunta": "¿Sobre qué animal montó Jesús para entrar triunfante a Jerusalén?", "opciones": ["Un caballo blanco", "Un camello", "Un asno", "Una mula"], "respuestaCorrecta": "Un asno" },
    { "pregunta": "¿En qué huerto oró Jesús antes de ser arrestado?", "opciones": ["Edén", "Getsemaní", "Monte de los Olivos", "Gólgota"], "respuestaCorrecta": "Getsemaní" },
    { "pregunta": "¿Quién era el sumo sacerdote cuando Jesús fue crucificado?", "opciones": ["Anás", "Caifás", "Zacarías", "Nicodemo"], "respuestaCorrecta": "Caifás" },
    { "pregunta": "¿Cómo se llamaba el gobernador romano que lavó sus manos?", "opciones": ["Herodes", "Pilato", "César", "Félix"], "respuestaCorrecta": "Pilato" },
    { "pregunta": "¿Qué decía el letrero sobre la cruz de Jesús?", "opciones": ["Rey de los Judíos", "El Hijo de Dios", "Salvador del mundo", "El Mesías"], "respuestaCorrecta": "Rey de los Judíos" },
    { "pregunta": "¿Quién removió la piedra del sepulcro de Jesús?", "opciones": ["Pedro", "Los soldados", "Un ángel", "Terremoto"], "respuestaCorrecta": "Un ángel" },
    { "pregunta": "¿A quién se le apareció primero Jesús resucitado?", "opciones": ["Pedro", "María Magdalena", "Juan", "Su madre María"], "respuestaCorrecta": "María Magdalena" },
    { "pregunta": "¿Qué discípulo dijo que no creería hasta ver las heridas de Jesús?", "opciones": ["Judas", "Felipe", "Tomás", "Mateo"], "respuestaCorrecta": "Tomás" },
    { "pregunta": "¿En el camino a qué aldea se apareció Jesús a dos discípulos?", "opciones": ["Emaús", "Jericó", "Betania", "Capernaúm"], "respuestaCorrecta": "Emaús" },
    { "pregunta": "¿Desde qué monte ascendió Jesús al cielo?", "opciones": ["Sinaí", "Monte de los Olivos", "Carmelo", "Tabor"], "respuestaCorrecta": "Monte de los Olivos" },
    { "pregunta": "¿Qué famosa enseñanza de Jesús incluye las Bienaventuranzas?", "opciones": ["El Sermón del Monte", "La Última Cena", "El Aposento Alto", "El discurso del Templo"], "respuestaCorrecta": "El Sermón del Monte" },
    { "pregunta": "¿Quién fue el famoso maestro judío que le enseñó la ley a Pablo?", "opciones": ["Nicodemo", "Gamaliel", "Caifás", "Ananías"], "respuestaCorrecta": "Gamaliel" },
    { "pregunta": "¿Cómo se llamaba el centurión romano al que Pedro le predicó?", "opciones": ["Julio", "Cornelio", "Félix", "Agusto"], "respuestaCorrecta": "Cornelio" },
    { "pregunta": "¿Quién cantaba himnos junto a Pablo en la cárcel de Filipos?", "opciones": ["Pedro", "Silas", "Lucas", "Marcos"], "respuestaCorrecta": "Silas" },
    { "pregunta": "¿En qué ciudad a los discípulos se les llamó 'cristianos' por primera vez?", "opciones": ["Jerusalén", "Roma", "Antioquía", "Éfeso"], "respuestaCorrecta": "Antioquía" },
    { "pregunta": "¿Cómo se llamaba la mujer vendedora de púrpura que creyó en Filipos?", "opciones": ["Priscila", "Lidia", "Dorcas", "Febe"], "respuestaCorrecta": "Lidia" },
    { "pregunta": "¿Qué joven se quedó dormido y cayó de un tercer piso mientras Pablo predicaba?", "opciones": ["Timoteo", "Tito", "Eutico", "Esteban"], "respuestaCorrecta": "Eutico" },
    { "pregunta": "¿Cómo se llamaba el esclavo fugitivo sobre el cual Pablo escribe una carta?", "opciones": ["Onésimo", "Filemón", "Tíquico", "Apolo"], "respuestaCorrecta": "Onésimo" },
    { "pregunta": "¿Quién era el joven pastor a quien Pablo le escribió dos cartas?", "opciones": ["Timoteo", "Tito", "Lucas", "Juan Marcos"], "respuestaCorrecta": "Timoteo" },
    { "pregunta": "¿Qué libro del Nuevo Testamento fue escrito por un médico?", "opciones": ["Romanos", "Gálatas", "Hechos", "Hebreos"], "respuestaCorrecta": "Hechos" },
    { "pregunta": "¿Cuántas epístolas del Nuevo Testamento se atribuyen a Pablo?", "opciones": ["7", "10", "13", "21"], "respuestaCorrecta": "13" },
    { "pregunta": "¿Qué epístola afirma que 'la fe sin obras es muerta'?", "opciones": ["Romanos", "Santiago", "Efesios", "Judas"], "respuestaCorrecta": "Santiago" },
    { "pregunta": "¿En qué capítulo de Efesios se describe la armadura de Dios?", "opciones": ["Capítulo 1", "Capítulo 3", "Capítulo 6", "Capítulo 8"], "respuestaCorrecta": "Capítulo 6" },
    { "pregunta": "¿Cuántas características tiene el 'fruto del Espíritu' en Gálatas 5?", "opciones": ["7", "9", "12", "3"], "respuestaCorrecta": "9" },
    { "pregunta": "Completá el versículo: 'Todo lo puedo en Cristo que me...'", "opciones": ["Ayuda", "Fortalece", "Guía", "Salva"], "respuestaCorrecta": "Fortalece" },
    { "pregunta": "¿En qué isla estaba exiliado Juan cuando escribió Apocalipsis?", "opciones": ["Chipre", "Malta", "Patmos", "Creta"], "respuestaCorrecta": "Patmos" },
    { "pregunta": "¿Cuántas puertas tiene la Nueva Jerusalén?", "opciones": ["7", "10", "12", "24"], "respuestaCorrecta": "12" },
    { "pregunta": "¿De dónde sale el río de agua de vida en Apocalipsis?", "opciones": ["Del Templo", "Del trono de Dios y del Cordero", "De la tierra", "Del cielo"], "respuestaCorrecta": "Del trono de Dios y del Cordero" },
    { "pregunta": "¿Cuántos tipos de frutos da el árbol de la vida?", "opciones": ["1", "7", "12", "24"], "respuestaCorrecta": "12" },
    { "pregunta": "¿Qué color tenía el caballo cuyo jinete se llamaba Muerte?", "opciones": ["Blanco", "Rojo", "Negro", "Amarillo pálido"], "respuestaCorrecta": "Amarillo pálido" },
    { "pregunta": "Jesús dijo: 'Yo soy el Alfa y la...'", "opciones": ["Beta", "Omega", "Luz", "Verdad"], "respuestaCorrecta": "Omega" }
];

export default function ModuloTrivia({ currentUser, db, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntosSesion, setPuntosSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [preguntasMezcladas, setPreguntasMezcladas] = useState([]);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null);
  
  // Estados para modo Voz
  const [modoVoz, setModoVoz] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Mezcla de preguntas
    const mezcladas = [...PREGUNTAS_LOCALES].sort(() => Math.random() - 0.5);
    setPreguntasMezcladas(mezcladas);

    // Inicializar Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const respuestaHablada = event.results[0][0].transcript.trim().toLowerCase();
        setEscuchando(false);
        validarRespuestaPorVoz(respuestaHablada);
      };

      recognition.onerror = () => {
        setEscuchando(false);
      };

      recognition.onend = () => {
        setEscuchando(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Función para leer el texto en voz alta
  const hablarTexto = (texto, callback = null) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    
    if (callback) {
      utterance.onend = callback;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Efecto que lee la pregunta automáticamente si está en modo voz
  useEffect(() => {
    if (modoVoz && preguntasMezcladas.length > 0 && !juegoTerminado && !estadoRespuesta) {
      const pregunta = preguntasMezcladas[preguntaActual];
      const textoHablar = `Siguiente pregunta. ${pregunta.pregunta} ... Opciones. ${pregunta.opciones.join(". ... ")}. ¿Cuál es tu respuesta?`;
      
      hablarTexto(textoHablar, () => {
        // Arranca a escuchar automáticamente cuando termina de leer
        iniciarEscucha();
      });
    }
  }, [preguntaActual, modoVoz, juegoTerminado, preguntasMezcladas]);

  const iniciarEscucha = () => {
    if (recognitionRef.current) {
      setEscuchando(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setEscuchando(false);
      }
    }
  };

  const validarRespuestaPorVoz = (textoHablado) => {
    const preguntaObj = preguntasMezcladas[preguntaActual];
    
    // Buscar si lo que dijo coincide con alguna de las opciones
    const opcionDetectada = preguntaObj.opciones.find(opt => 
      textoHablado.includes(opt.toLowerCase()) || opt.toLowerCase().includes(textoHablado)
    );

    if (opcionDetectada) {
      manejarRespuesta(opcionDetectada, true);
    } else {
      hablarTexto("No te entendí bien. Repetí tu respuesta por favor.", () => {
        iniciarEscucha();
      });
    }
  };

  const manejarRespuesta = (opcionSeleccionada, vieneDeVoz = false) => {
    if (estadoRespuesta) return; 

    const preguntaObj = preguntasMezcladas[preguntaActual];
    const esCorrecta = opcionSeleccionada === preguntaObj.respuestaCorrecta;
    
    setEstadoRespuesta({ seleccion: opcionSeleccionada, correcta: preguntaObj.respuestaCorrecta });

    if (modoVoz || vieneDeVoz) {
      const mensajeFinal = esCorrecta ? "¡Correcto! Sumaste diez puntos." : `Incorrecto. La respuesta era ${preguntaObj.respuestaCorrecta}.`;
      hablarTexto(mensajeFinal);
    }

    if (esCorrecta) {
      setPuntosSesion(prev => prev + 10);
      
      if (currentUser && db) {
        const puntosTotales = (currentUser.puntosTrivia || 0) + 10;
        currentUser.puntosTrivia = puntosTotales;
        updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { 
          puntosTrivia: puntosTotales 
        }).catch(() => {});
      }
    }

    setTimeout(() => {
      if (preguntaActual + 1 < preguntasMezcladas.length) {
        setPreguntaActual(preguntaActual + 1);
        setEstadoRespuesta(null);
      } else {
        setJuegoTerminado(true);
        if (modoVoz) hablarTexto("¡Excelente! Has terminado el desafío.");
      }
    }, modoVoz ? 3500 : 1500); // Dar más tiempo para que termine de hablar en modo voz
  };

  const toggleModoVoz = () => {
    const nuevoModo = !modoVoz;
    setModoVoz(nuevoModo);
    if (!nuevoModo) {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setEscuchando(false);
    }
  };

  // Limpiar motores al salir del componente
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  if (preguntasMezcladas.length === 0) {
    return <div className="text-center p-10 text-white font-bold">Cargando desafío...</div>;
  }

  if (juegoTerminado) {
    return (
      <div className="bg-blue-950/80 border border-blue-500/40 p-8 rounded-3xl text-center shadow-xl">
        <h2 className="text-4xl font-black text-white mb-4">¡Completaste el Desafío!</h2>
        <p className="text-blue-300 text-xl mb-6">Sumaste <span className="text-amber-400 font-black">{puntosSesion} puntos</span> hoy.</p>
        <button onClick={onVolver} className="bg-blue-600 text-white font-black py-4 px-8 rounded-xl w-full uppercase tracking-widest hover:scale-105 transition-transform">Volver al Inicio</button>
      </div>
    );
  }

  const pregunta = preguntasMezcladas[preguntaActual];

  return (
    <div className="bg-black/80 border border-blue-500/40 p-6 md:p-10 rounded-3xl text-center shadow-2xl relative">
      
      {/* BOTÓN GIGANTE MODO VOZ */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={toggleModoVoz}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl ${
            modoVoz 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
              : 'bg-blue-900 border border-blue-400 text-blue-300 hover:bg-blue-800'
          }`}
        >
          {modoVoz ? <Square size={20} fill="currentColor"/> : <Volume2 size={20} />} 
          {modoVoz ? 'Detener Voz' : 'Jugar con Voz (Manos Libres)'}
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 border-b border-blue-500/30 pb-4">
        <span className="text-blue-300 font-bold uppercase tracking-widest text-sm">Pregunta {preguntaActual + 1}</span>
        <span className="bg-blue-600 text-white font-black px-4 py-2 rounded-full shadow-lg">Ganado: {puntosSesion} Pts</span>
      </div>
      
      {/* INDICADOR DE MICRÓFONO ESCUCHANDO */}
      {escuchando && (
        <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.8)]" title="Micrófono activado, te estoy escuchando...">
          <Mic size={24} />
        </div>
      )}

      <h3 className="text-2xl md:text-3xl font-black text-white mb-10 leading-tight">{pregunta.pregunta}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pregunta.opciones.map((opcion, index) => {
          let colorBoton = "bg-[#1a1a1a] border-slate-600 text-white hover:bg-blue-600";
          if (estadoRespuesta) {
            if (opcion === estadoRespuesta.correcta) colorBoton = "bg-green-600 border-green-400 text-white"; 
            else if (opcion === estadoRespuesta.seleccion) colorBoton = "bg-red-600 border-red-400 text-white"; 
            else colorBoton = "bg-slate-800 border-slate-700 text-slate-500 opacity-50"; 
          }

          return (
            <button 
              key={index} 
              onClick={() => manejarRespuesta(opcion)} 
              disabled={estadoRespuesta !== null || escuchando} 
              className={`border font-bold py-5 px-4 rounded-xl transition-all shadow-md ${colorBoton}`}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      <button onClick={onVolver} className="mt-10 text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 transition-colors">
        Volver al Inicio
      </button>
    </div>
  );
}