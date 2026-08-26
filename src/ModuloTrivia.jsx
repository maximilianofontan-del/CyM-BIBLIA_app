import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Mic, MicOff, Volume2, Square, Trophy, Star, ChevronLeft, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';

// TUS 100 PREGUNTAS ORIGINALES COMPLETAS
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
    { "pregunta": "Jesús dijo: 'Yo soy el Alfa y la...'", "opciones": ["Beta", "Omega", "Luz", "Verdad"], "respuestaCorrecta": "Omega" },
    { "pregunta": "¿Quién fue tragado por un gran pez?", "opciones": ["Moisés", "Jonás", "David", "Pedro"], "respuestaCorrecta": "Jonás" },
    { "pregunta": "¿Cuántos días y noches llovió en el diluvio?", "opciones": ["40", "7", "12", "100"], "respuestaCorrecta": "40" },
    { "pregunta": "¿Quién derrotó a Goliat?", "opciones": ["Saúl", "Salomón", "David", "Sansón"], "respuestaCorrecta": "David" },
    { "pregunta": "¿Cuál es el primer libro de la Biblia?", "opciones": ["Apocalipsis", "Éxodo", "Génesis", "Levítico"], "respuestaCorrecta": "Génesis" },
    { "pregunta": "¿Quién fue vendido como esclavo por sus hermanos?", "opciones": ["José", "Benjamín", "Isaac", "Jacob"], "respuestaCorrecta": "José" },
    { "pregunta": "¿Qué animal tentó a Eva en el Edén?", "opciones": ["Un león", "Una serpiente", "Un cuervo", "Un escorpión"], "respuestaCorrecta": "Una serpiente" },
    { "pregunta": "¿Quién construyó el arca?", "opciones": ["Moisés", "Abraham", "Noé", "Enoc"], "respuestaCorrecta": "Noé" },
    { "pregunta": "¿Cuántas plagas envió Dios a Egipto?", "opciones": ["7", "10", "12", "40"], "respuestaCorrecta": "10" },
    { "pregunta": "¿En qué monte recibió Moisés los 10 mandamientos?", "opciones": ["Sion", "Carmelo", "Sinaí", "Ararat"], "respuestaCorrecta": "Sinaí" },
    { "pregunta": "¿Quién fue el hombre más fuerte de la Biblia?", "opciones": ["Goliat", "David", "Sansón", "Saúl"], "respuestaCorrecta": "Sansón" },
    { "pregunta": "¿A quién le pidió Dios que sacrificara a su hijo Isaac?", "opciones": ["Jacob", "Abraham", "Moisés", "Lot"], "respuestaCorrecta": "Abraham" },
    { "pregunta": "¿Quién interpretó los sueños del Faraón?", "opciones": ["Daniel", "José", "Moisés", "Aarón"], "respuestaCorrecta": "José" },
    { "pregunta": "¿Qué mar cruzaron los israelitas en seco?", "opciones": ["Mar Muerto", "Mar de Galilea", "Mar Rojo", "Mar Mediterráneo"], "respuestaCorrecta": "Mar Rojo" },
    { "pregunta": "¿Quién fue la madre de Samuel?", "opciones": ["Ana", "Rut", "Ester", "Sara"], "respuestaCorrecta": "Ana" },
    { "pregunta": "¿Qué profeta hizo caer fuego del cielo en el monte Carmelo?", "opciones": ["Eliseo", "Isaías", "Elías", "Jeremías"], "respuestaCorrecta": "Elías" },
    { "pregunta": "¿Quién fue arrojado al foso de los leones?", "opciones": ["Sadrac", "Daniel", "Jeremías", "Ezequiel"], "respuestaCorrecta": "Daniel" },
    { "pregunta": "¿Cuál era la profesión de Mateo antes de seguir a Jesús?", "opciones": ["Pescador", "Carpintero", "Recaudador de impuestos", "Médico"], "respuestaCorrecta": "Recaudador de impuestos" },
    { "pregunta": "¿En qué ciudad nació Jesús?", "opciones": ["Nazaret", "Belén", "Jerusalén", "Jericó"], "respuestaCorrecta": "Belén" },
    { "pregunta": "¿Quién bautizó a Jesús?", "opciones": ["Pedro", "Juan el Bautista", "Santiago", "Mateo"], "respuestaCorrecta": "Juan el Bautista" },
    { "pregunta": "¿Cuántos panes y peces multiplicó Jesús?", "opciones": ["5 panes y 2 peces", "7 panes y 3 peces", "2 panes y 5 peces", "12 panes y 2 peces"], "respuestaCorrecta": "5 panes y 2 peces" },
    { "pregunta": "¿Quién negó a Jesús tres veces?", "opciones": ["Judas", "Juan", "Pedro", "Tomás"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Por cuántas monedas traicionó Judas a Jesús?", "opciones": ["10", "20", "30", "40"], "respuestaCorrecta": "30" },
    { "pregunta": "¿Quién le cortó la oreja al siervo del sumo sacerdote?", "opciones": ["Juan", "Pedro", "Jesús", "Santiago"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Qué preso fue liberado en lugar de Jesús?", "opciones": ["Barrabás", "Dimas", "Gestas", "Zaqueo"], "respuestaCorrecta": "Barrabás" },
    { "pregunta": "¿Quién ayudó a cargar la cruz de Jesús?", "opciones": ["Simón de Cirene", "José de Arimatea", "Nicodemo", "Juan"], "respuestaCorrecta": "Simón de Cirene" },
    { "pregunta": "¿Quién fue el primer mártir cristiano?", "opciones": ["Pedro", "Pablo", "Esteban", "Santiago"], "respuestaCorrecta": "Esteban" },
    { "pregunta": "¿En qué camino Jesús se le apareció a Saulo (Pablo)?", "opciones": ["Jericó", "Emaús", "Damasco", "Jerusalén"], "respuestaCorrecta": "Damasco" },
    { "pregunta": "¿Quién escribió el libro de Apocalipsis?", "opciones": ["Pedro", "Pablo", "Juan", "Lucas"], "respuestaCorrecta": "Juan" },
    { "pregunta": "¿Cuántos libros tiene la Biblia (versión protestante)?", "opciones": ["66", "73", "39", "27"], "respuestaCorrecta": "66" },
    { "pregunta": "¿Cuál es el libro más largo de la Biblia?", "opciones": ["Génesis", "Isaías", "Salmos", "Jeremías"], "respuestaCorrecta": "Salmos" },
    { "pregunta": "¿Quién fue el hombre más sabio?", "opciones": ["David", "Salomón", "Esdras", "Pablo"], "respuestaCorrecta": "Salomón" },
    { "pregunta": "¿Qué alimento cayó del cielo para el pueblo de Israel?", "opciones": ["Codornices", "Maná", "Miel", "Pan de cebada"], "respuestaCorrecta": "Maná" },
    { "pregunta": "¿Qué joven pastor mató a un oso y un león?", "opciones": ["José", "Moisés", "David", "Gedeón"], "respuestaCorrecta": "David" },
    { "pregunta": "¿Cómo se llamaba la esposa de Isaac?", "opciones": ["Raquel", "Lea", "Rebeca", "Sara"], "respuestaCorrecta": "Rebeca" },
    { "pregunta": "¿Qué gigante tenía 6 dedos en cada mano?", "opciones": ["Goliat", "El hermano de Goliat", "Og rey de Basán", "No se menciona"], "respuestaCorrecta": "El hermano de Goliat" },
    { "pregunta": "¿Qué profeta fue llevado al cielo en un carro de fuego?", "opciones": ["Enoc", "Eliseo", "Elías", "Moisés"], "respuestaCorrecta": "Elías" },
    { "pregunta": "¿Quién se subió a un árbol para ver a Jesús?", "opciones": ["Zaqueo", "Bartimeo", "Nicodemo", "Lázaro"], "respuestaCorrecta": "Zaqueo" },
    { "pregunta": "¿Quién era el amigo de Jesús que fue resucitado al cuarto día?", "opciones": ["Jairo", "Lázaro", "Juan", "Lucas"], "respuestaCorrecta": "Lázaro" },
    { "pregunta": "¿Cuál es el primer milagro de Jesús registrado en los evangelios?", "opciones": ["Sanar a un ciego", "Caminar sobre el agua", "Convertir el agua en vino", "Multiplicar los panes"], "respuestaCorrecta": "Convertir el agua en vino" },
    { "pregunta": "¿Qué libro de la Biblia no menciona la palabra 'Dios'?", "opciones": ["Rut", "Ester", "Cantares", "Eclesiastés"], "respuestaCorrecta": "Ester" },
    { "pregunta": "¿Quién era el rey de Babilonia cuando Daniel fue llevado cautivo?", "opciones": ["Belsasar", "Darío", "Ciro", "Nabucodonosor"], "respuestaCorrecta": "Nabucodonosor" },
    { "pregunta": "¿Quién era el suegro de Moisés?", "opciones": ["Jetro", "Aarón", "Labán", "Faraón"], "respuestaCorrecta": "Jetro" },
    { "pregunta": "¿Cuántas veces dio vuelta Israel a Jericó el último día?", "opciones": ["1", "3", "7", "12"], "respuestaCorrecta": "7" },
    { "pregunta": "¿Quién era el hermano de Marta y María?", "opciones": ["Simón", "Lázaro", "Felipe", "Andrés"], "respuestaCorrecta": "Lázaro" },
    { "pregunta": "¿En qué río fue bautizado Jesús?", "opciones": ["Nilo", "Éufrates", "Jordán", "Tigris"], "respuestaCorrecta": "Jordán" },
    { "pregunta": "¿Quién era el médico amado que acompañó a Pablo?", "opciones": ["Tito", "Timoteo", "Lucas", "Marcos"], "respuestaCorrecta": "Lucas" },
    { "pregunta": "¿Cómo se llamaba la suegra de Rut?", "opciones": ["Orfa", "Noemí", "Lea", "Ana"], "respuestaCorrecta": "Noemí" },
    { "pregunta": "¿Qué animal habló con Balaam?", "opciones": ["Un camello", "Una serpiente", "Un asna", "Una paloma"], "respuestaCorrecta": "Un asna" },
    { "pregunta": "¿Quién sobrevivió en el foso de los leones?", "opciones": ["Daniel", "Sadrac", "Mesac", "Abed-nego"], "respuestaCorrecta": "Daniel" },
    { "pregunta": "¿Quién fue el primer homicida mencionado en la Biblia?", "opciones": ["Caín", "Lamec", "Esaú", "Faraón"], "respuestaCorrecta": "Caín" },
    { "pregunta": "¿De qué madera construyó Noé el arca?", "opciones": ["Cedro", "Acacia", "Gofer", "Roble"], "respuestaCorrecta": "Gofer" },
    { "pregunta": "¿Quién es el hombre que más años vivió según la Biblia?", "opciones": ["Noé", "Matusalén", "Adán", "Enoc"], "respuestaCorrecta": "Matusalén" },
    { "pregunta": "¿Qué nombre le puso Dios a Jacob después de luchar con el ángel?", "opciones": ["Israel", "Abraham", "Efraín", "Judá"], "respuestaCorrecta": "Israel" },
    { "pregunta": "¿A qué país huyó Moisés tras matar a un egipcio?", "opciones": ["Canaán", "Madián", "Babilonia", "Siria"], "respuestaCorrecta": "Madián" },
    { "pregunta": "¿Qué hermano de Moisés fue el primer sumo sacerdote?", "opciones": ["Coré", "Aarón", "Hur", "Josué"], "respuestaCorrecta": "Aarón" },
    { "pregunta": "¿Qué tribu de Israel no recibió herencia de tierra?", "opciones": ["Judá", "Leví", "Benjamín", "Simeón"], "respuestaCorrecta": "Leví" },
    { "pregunta": "¿Quién sucedió a Moisés como líder de Israel?", "opciones": ["Caleb", "Aarón", "Josué", "Gedeón"], "respuestaCorrecta": "Josué" },
    { "pregunta": "¿Qué mujer escondió a los espías israelitas en Jericó?", "opciones": ["Rut", "Rahab", "Débora", "Jael"], "respuestaCorrecta": "Rahab" },
    { "pregunta": "¿Qué juez de Israel derrotó a los madianitas con solo 300 hombres?", "opciones": ["Sansón", "Gedeón", "Otoniel", "Jefté"], "respuestaCorrecta": "Gedeón" },
    { "pregunta": "¿De qué nacionalidad era Rut?", "opciones": ["Israelita", "Egipcia", "Moabita", "Filistea"], "respuestaCorrecta": "Moabita" },
    { "pregunta": "¿A quién ungió Samuel como el primer rey de Israel?", "opciones": ["David", "Saúl", "Salomón", "Absalón"], "respuestaCorrecta": "Saúl" },
    { "pregunta": "¿Cómo se llamaba el padre del rey David?", "opciones": ["Isaí", "Samuel", "Saúl", "Salomón"], "respuestaCorrecta": "Isaí" },
    { "pregunta": "¿Quién fue el mejor amigo de David?", "opciones": ["Abner", "Jonatán", "Natán", "Joab"], "respuestaCorrecta": "Jonatán" },
    { "pregunta": "¿Qué reina viajó desde lejos para comprobar la sabiduría de Salomón?", "opciones": ["Reina de Sabá", "Reina de Persia", "Reina de Egipto", "Reina de Etiopía"], "respuestaCorrecta": "Reina de Sabá" },
    { "pregunta": "¿Qué profeta sucedió a Elías y pidió una doble porción de su espíritu?", "opciones": ["Eliseo", "Isaías", "Oseas", "Jeremías"], "respuestaCorrecta": "Eliseo" },
    { "pregunta": "¿Quién fue el copero del rey que reconstruyó los muros de Jerusalén?", "opciones": ["Esdras", "Nehemías", "Zorobabel", "Daniel"], "respuestaCorrecta": "Nehemías" },
    { "pregunta": "¿Qué profeta escribió sobre un valle de huesos secos que revivían?", "opciones": ["Jeremías", "Ezequiel", "Isaías", "Joel"], "respuestaCorrecta": "Ezequiel" },
    { "pregunta": "¿A quién se le conoce comúnmente como el 'profeta llorón'?", "opciones": ["Jeremías", "Habacuc", "Jonás", "Miqueas"], "respuestaCorrecta": "Jeremías" },
    { "pregunta": "¿Quiénes fueron arrojados a un horno de fuego ardiente?", "opciones": ["Daniel y sus hermanos", "Sadrac, Mesac y Abed-nego", "Pablo y Silas", "Pedro y Juan"], "respuestaCorrecta": "Sadrac, Mesac y Abed-nego" },
    { "pregunta": "¿Qué ciudad fue destruida por Dios con fuego y azufre?", "opciones": ["Jericó", "Nínive", "Sodoma", "Babilonia"], "respuestaCorrecta": "Sodoma" },
    { "pregunta": "¿Quién es considerado el autor de la mayoría de los Salmos?", "opciones": ["Moisés", "Salomón", "Asaf", "David"], "respuestaCorrecta": "David" },
    { "pregunta": "¿Qué edad tenía Jesús cuando se perdió y fue hallado en el templo?", "opciones": ["7 años", "10 años", "12 años", "15 años"], "respuestaCorrecta": "12 años" },
    { "pregunta": "¿Quién fue el padre terrenal de Juan el Bautista?", "opciones": ["Zacarías", "José", "Simeón", "Elí"], "respuestaCorrecta": "Zacarías" },
    { "pregunta": "¿A qué apóstoles llevó Jesús al monte de la transfiguración?", "opciones": ["Pedro, Andrés y Juan", "Pedro, Jacobo y Juan", "Mateo, Marcos y Lucas", "Felipe, Tomás y Mateo"], "respuestaCorrecta": "Pedro, Jacobo y Juan" },
    { "pregunta": "¿Qué enfermedad tenía el hombre que fue bajado por el techo hacia Jesús?", "opciones": ["Lepra", "Ceguera", "Parálisis", "Fiebre"], "respuestaCorrecta": "Parálisis" },
    { "pregunta": "¿A quién le dijo Jesús de noche: 'Es necesario nacer de nuevo'?", "opciones": ["Nicodemo", "Zaqueo", "Caifás", "Pilato"], "respuestaCorrecta": "Nicodemo" },
    { "pregunta": "¿A quién resucitó Jesús en la ciudad de Naín?", "opciones": ["A la hija de Jairo", "Al hijo de una viuda", "A Lázaro", "Al siervo del centurión"], "respuestaCorrecta": "Al hijo de una viuda" },
    { "pregunta": "¿Qué discípulo caminó sobre el agua hacia Jesús?", "opciones": ["Juan", "Andrés", "Pedro", "Jacobo"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Quién pidió el cuerpo de Jesús a Pilato para sepultarlo?", "opciones": ["José de Arimatea", "Simón de Cirene", "Nicodemo", "Juan"], "respuestaCorrecta": "José de Arimatea" },
    { "pregunta": "¿Quién fue el discípulo elegido para reemplazar a Judas Iscariote?", "opciones": ["Pablo", "Bernabé", "Matías", "Silas"], "respuestaCorrecta": "Matías" },
    { "pregunta": "¿En qué festividad descendió el Espíritu Santo sobre los discípulos?", "opciones": ["Pascua", "Pentecostés", "Tabernáculos", "Purim"], "respuestaCorrecta": "Pentecostés" },
    { "pregunta": "¿Qué pareja mintió sobre el dinero de una venta y cayó muerta?", "opciones": ["Priscila y Aquila", "Ananías y Safira", "Félix y Drusila", "Herodes y Herodías"], "respuestaCorrecta": "Ananías y Safira" },
    { "pregunta": "¿Quién acompañó a Pablo en su primer viaje misionero?", "opciones": ["Timoteo", "Silas", "Lucas", "Bernabé"], "respuestaCorrecta": "Bernabé" },
    { "pregunta": "¿De qué ciudad era originario el apóstol Pablo?", "opciones": ["Jerusalén", "Antioquía", "Tarso", "Roma"], "respuestaCorrecta": "Tarso" },
    { "pregunta": "¿Qué oficio manual tenía Pablo para sostenerse económicamente?", "opciones": ["Pescador", "Carpintero", "Fabricante de tiendas", "Alfarero"], "respuestaCorrecta": "Fabricante de tiendas" },
    { "pregunta": "¿En qué isla naufragó Pablo mientras era llevado a Roma?", "opciones": ["Chipre", "Creta", "Patmos", "Malta"], "respuestaCorrecta": "Malta" },
    { "pregunta": "¿A qué iglesia le escribió Pablo el famoso capítulo sobre el Amor (capítulo 13)?", "opciones": ["Romanos", "Gálatas", "Corintios", "Efesios"], "respuestaCorrecta": "Corintios" },
    { "pregunta": "¿Cuál es el primer fruto del Espíritu mencionado en Gálatas 5?", "opciones": ["Paz", "Paciencia", "Fe", "Amor"], "respuestaCorrecta": "Amor" },
    { "pregunta": "¿Qué libro del Nuevo Testamento es conocido como el 'salón de la fama de la fe'?", "opciones": ["Romanos", "Hebreos", "Santiago", "Judas"], "respuestaCorrecta": "Hebreos" },
    { "pregunta": "¿A cuántas iglesias de Asia Menor se dirigen los mensajes en Apocalipsis?", "opciones": ["3", "5", "7", "12"], "respuestaCorrecta": "7" },
    { "pregunta": "¿Cuál es el último libro del Antiguo Testamento?", "opciones": ["Zacarías", "Malaquías", "Sofonías", "Hageo"], "respuestaCorrecta": "Malaquías" },
    { "pregunta": "¿Quién era la hermana de Moisés y Aarón?", "opciones": ["Séfora", "Jocabed", "María (Miriam)", "Agar"], "respuestaCorrecta": "María (Miriam)" },
    { "pregunta": "¿Qué animal trajo una rama de olivo a Noé?", "opciones": ["Un cuervo", "Una paloma", "Un gorrión", "Un águila"], "respuestaCorrecta": "Una paloma" },
    { "pregunta": "¿Qué rey babilónico se volvió loco y comió hierba como los bueyes?", "opciones": ["Belsasar", "Darío", "Ciro", "Nabucodonosor"], "respuestaCorrecta": "Nabucodonosor" },
    { "pregunta": "¿Qué instrumento usó David para calmar al rey Saúl?", "opciones": ["Flauta", "Trompeta", "Arpa", "Pandero"], "respuestaCorrecta": "Arpa" },
    { "pregunta": "¿En qué idioma se escribió originalmente la mayor parte del Nuevo Testamento?", "opciones": ["Hebreo", "Arameo", "Griego", "Latín"], "respuestaCorrecta": "Griego" },
    { "pregunta": "¿Cómo se llamaba el ciego de Jericó al que Jesús sanó?", "opciones": ["Zaqueo", "Bartimeo", "Simón", "Lázaro"], "respuestaCorrecta": "Bartimeo" },
    { "pregunta": "¿Qué discípulo dijo: 'Señor, no solo mis pies, sino también las manos y la cabeza'?", "opciones": ["Juan", "Tomás", "Pedro", "Mateo"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Qué mujer judía llegó a ser reina del Imperio Persa?", "opciones": ["Vasti", "Ester", "Rut", "Débora"], "respuestaCorrecta": "Ester" }
];

export default function ModuloTrivia({ currentUser, db, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntosSesion, setPuntosSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [preguntasMezcladas, setPreguntasMezcladas] = useState([]);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null);
  
  // Efecto visual de Casino
  const [efectoCasino, setEfectoCasino] = useState(false);
  
  // Estados para modo Voz
  const [modoVoz, setModoVoz] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [textoEscuchado, setTextoEscuchado] = useState("");
  const recognitionRef = useRef(null);
  
  const LETRAS = ['A', 'B', 'C', 'D'];

  const normalizar = (txt) => txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // --- GENERADOR DE SONIDOS NATIVO ---
  const reproducirSonido = (tipo) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (tipo === 'correcto') {
        // Sonido ascendente brillante y ganador
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); 
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); 
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime); 
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log("Audio no soportado.");
    }
  };

  useEffect(() => {
    const mezcladas = [...PREGUNTAS_LOCALES].sort(() => Math.random() - 0.5);
    setPreguntasMezcladas(mezcladas);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        const respuestaHablada = transcript.trim();
        setEscuchando(false);
        validarRespuestaPorVoz(respuestaHablada);
      };

      recognition.onerror = () => setEscuchando(false);
      recognition.onend = () => setEscuchando(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const hablarTexto = (texto, callback = null) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    if (callback) utterance.onend = callback;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (modoVoz && preguntasMezcladas.length > 0 && !juegoTerminado && !estadoRespuesta) {
      const pregunta = preguntasMezcladas[preguntaActual];
      let textoHablar = `Siguiente pregunta. ${pregunta.pregunta} ... Opciones. `;
      pregunta.opciones.forEach((opt, i) => {
        textoHablar += `Opción ${LETRAS[i]}: ${opt}. ... `;
      });
      textoHablar += "¿Cuál es tu respuesta?";
      
      hablarTexto(textoHablar, () => {
        iniciarEscucha();
      });
    }
  }, [preguntaActual, modoVoz, juegoTerminado, preguntasMezcladas]);

  const iniciarEscucha = () => {
    if (recognitionRef.current && !escuchando) {
      try { 
        setTextoEscuchado("");
        recognitionRef.current.start(); 
        setEscuchando(true);
      } catch (e) {}
    }
  };

  const validarRespuestaPorVoz = (textoHablado) => {
    setTextoEscuchado(textoHablado);
    
    const preguntaObj = preguntasMezcladas[preguntaActual];
    const txt = normalizar(textoHablado);
    let opcionDetectada = null;

    const indice = preguntaObj.opciones.findIndex(opt => {
      const optNorm = normalizar(opt);
      return txt === optNorm || txt.includes(optNorm) || optNorm.includes(txt);
    });

    if (indice !== -1 && txt.length > 1) { 
       opcionDetectada = preguntaObj.opciones[indice];
    }

    if (!opcionDetectada) {
       if (/\b(a|la a|opcion a|uno|primera|primer)\b/.test(txt)) opcionDetectada = preguntaObj.opciones[0];
       else if (/\b(b|la b|opcion b|be|dos|segunda|segundo)\b/.test(txt)) opcionDetectada = preguntaObj.opciones[1];
       else if (/\b(c|la c|opcion c|ce|tres|tercera|tercer)\b/.test(txt)) opcionDetectada = preguntaObj.opciones[2];
       else if (/\b(d|la d|opcion d|de|cuatro|cuarta|cuarto)\b/.test(txt)) opcionDetectada = preguntaObj.opciones[3];
    }

    if (opcionDetectada) {
      setTimeout(() => setTextoEscuchado(""), 2500);
      manejarRespuesta(opcionDetectada, true);
    } else {
      hablarTexto("No te entendí bien. Toca la respuesta en la pantalla, o toca el micrófono rojo para repetir.");
    }
  };

  const manejarRespuesta = (opcionSeleccionada, vieneDeVoz = false) => {
    if (estadoRespuesta) return; 

    const preguntaObj = preguntasMezcladas[preguntaActual];
    const esCorrecta = opcionSeleccionada === preguntaObj.respuestaCorrecta;
    
    setEstadoRespuesta({ seleccion: opcionSeleccionada, correcta: preguntaObj.respuestaCorrecta });
    reproducirSonido(esCorrecta ? 'correcto' : 'incorrecto');

    if (esCorrecta) {
      setEfectoCasino(true); // ¡PRENDEMOS LAS LUCES!
      setPuntosSesion(prev => prev + 10);
      if (currentUser && db) {
        const puntosTotales = (currentUser.puntosTrivia || 0) + 10;
        currentUser.puntosTrivia = puntosTotales;
        updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { 
          puntosTrivia: puntosTotales 
        }).catch(() => {});
      }
    }

    if (modoVoz || vieneDeVoz) {
      const mensajeFinal = esCorrecta ? "¡Correcto! Sumaste diez puntos." : `Incorrecto. La respuesta era ${preguntaObj.respuestaCorrecta}.`;
      hablarTexto(mensajeFinal);
    }

    setTimeout(() => {
      setEfectoCasino(false); // Apagamos las luces
      if (preguntaActual + 1 < preguntasMezcladas.length) {
        setPreguntaActual(preguntaActual + 1);
        setEstadoRespuesta(null);
      } else {
        setJuegoTerminado(true);
        if (modoVoz) hablarTexto("¡Excelente! Has terminado el desafío.");
      }
    }, modoVoz ? 4000 : 2500); 
  };

  const toggleModoVoz = () => {
    const nuevoModo = !modoVoz;
    setModoVoz(nuevoModo);
    if (!nuevoModo) {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setEscuchando(false);
      setTextoEscuchado("");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  if (preguntasMezcladas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
        <p className="text-purple-300 font-bold tracking-widest uppercase">Cargando Desafío...</p>
      </div>
    );
  }

  if (juegoTerminado) {
    return (
      <div className="bg-gradient-to-b from-indigo-900 to-purple-900 border-4 border-purple-500/50 p-8 rounded-[40px] text-center shadow-[0_0_50px_rgba(168,85,247,0.4)] max-w-2xl mx-auto">
        <Trophy size={80} className="mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
        <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md">¡Misión Cumplida!</h2>
        <p className="text-purple-200 text-xl mb-8 font-medium">Lograste sumar <span className="text-yellow-400 font-black text-3xl">{puntosSesion} Puntos</span></p>
        <button onClick={onVolver} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black py-4 px-10 rounded-full w-full uppercase tracking-widest hover:scale-105 transition-transform shadow-xl text-lg">
          Volver al Menú
        </button>
      </div>
    );
  }

  const pregunta = preguntasMezcladas[preguntaActual];

  return (
    <>
      {/* --- ESTILOS CSS INYECTADOS DIRECTAMENTE PARA LAS LUCES DEL CASINO --- */}
      <style>{`
        @keyframes lucesCasino {
          0%   { box-shadow: 0 0 20px #FFD700, inset 0 0 20px #FFD700; border-color: #FFD700; }
          25%  { box-shadow: 0 0 50px #FFF, inset 0 0 40px #FFF; border-color: #FFF; }
          50%  { box-shadow: 0 0 20px #FF8C00, inset 0 0 20px #FF8C00; border-color: #FF8C00; }
          75%  { box-shadow: 0 0 50px #FFF, inset 0 0 40px #FFF; border-color: #FFF; }
          100% { box-shadow: 0 0 20px #FFD700, inset 0 0 20px #FFD700; border-color: #FFD700; }
        }
        .animacion-ganador {
          animation: lucesCasino 0.4s infinite;
          transform: scale(1.02);
        }
        @keyframes jackpotTexto {
          0%, 100% { color: #FFD700; text-shadow: 0 0 10px #FFD700; transform: scale(1); }
          50% { color: #FFF; text-shadow: 0 0 30px #FFF; transform: scale(1.3); }
        }
        .animacion-jackpot {
          animation: jackpotTexto 0.3s infinite;
        }
      `}</style>

      <div className={`relative min-h-[75vh] flex flex-col items-center justify-start p-4 md:p-8 rounded-[40px] overflow-hidden transition-all duration-300 ${efectoCasino ? 'bg-gradient-to-br from-yellow-900 via-amber-700 to-orange-900 border-4 border-yellow-400 animacion-ganador' : 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border-4 border-purple-500/30 shadow-2xl'}`}>
        
        {/* DECORACIÓN DE FONDO ESTILO GAME SHOW */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER / MARCADORES */}
        <div className="w-full flex justify-between items-center mb-8 relative z-10">
          <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md shadow-md transition-colors">
            <ChevronLeft size={24} />
          </button>

          {/* ACÁ LOS PUNTOS SALTAN Y BRILLAN SI GANA (EFECTO JACKPOT) */}
          <div className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-6 py-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-2 transition-all ${efectoCasino ? 'animacion-jackpot border-2 border-white' : ''}`}>
            {efectoCasino ? <Sparkles size={18} className="fill-white" /> : <Star size={18} className="fill-black" />} 
            <span className={efectoCasino ? 'text-xl' : ''}>{puntosSesion} Pts</span>
          </div>
        </div>

        {/* BOTÓN MODO VOZ */}
        <div className="relative z-10 mb-8 w-full flex justify-center">
          <button 
            onClick={toggleModoVoz}
            className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl border-2 ${
              modoVoz 
                ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]' 
                : 'bg-indigo-900/80 border-indigo-400/50 text-indigo-200 hover:bg-indigo-800'
            }`}
          >
            {modoVoz ? <Square size={18} fill="currentColor"/> : <Volume2 size={18} />} 
            {modoVoz ? 'Detener Locutor' : 'Jugar Manos Libres'}
          </button>
        </div>

        {/* CARTEL DE LO QUE ESTÁ ESCUCHANDO EL MICRÓFONO */}
        {textoEscuchado && (
          <div className="absolute top-[180px] left-1/2 transform -translate-x-1/2 bg-black/80 text-yellow-400 px-6 py-2 rounded-xl text-sm md:text-base font-black border border-yellow-500/50 z-50 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            🗣️ Escuché: "{textoEscuchado}"
          </div>
        )}

        {/* MICRÓFONO FLOTANTE RESCATE (CLICKABLE) */}
        {(modoVoz && !estadoRespuesta) && (
          <div 
            onClick={iniciarEscucha}
            className={`absolute top-24 left-1/2 transform -translate-x-1/2 text-white p-4 rounded-full cursor-pointer z-40 transition-all duration-300 ${
               escuchando 
                 ? 'bg-red-600 animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.8)]' 
                 : 'bg-slate-700/80 hover:bg-red-500 border-2 border-white/20'
            }`}
            title="Toca para encender el micrófono si se apagó"
          >
            {escuchando ? <Mic size={28} /> : <MicOff size={28} />}
          </div>
        )}

        {/* TARJETA DE PREGUNTA ESTILO CRISTAL */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center mt-6">
          <div className={`absolute -top-6 text-white font-black text-xl w-14 h-14 flex items-center justify-center rounded-full border-4 shadow-xl z-20 transition-colors ${efectoCasino ? 'bg-yellow-500 border-yellow-200' : 'bg-purple-600 border-indigo-900'}`}>
            {preguntaActual + 1}
          </div>

          <div className={`w-full backdrop-blur-xl border p-8 pt-12 md:p-12 md:pt-14 rounded-[30px] text-center shadow-2xl mb-8 transition-colors ${efectoCasino ? 'bg-white/30 border-white/50' : 'bg-white/10 border-white/20'}`}>
            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
              {pregunta.pregunta}
            </h3>
          </div>
          
          {/* GRILLA DE OPCIONES (BOTONES PÍLDORA) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {pregunta.opciones.map((opcion, index) => {
              const esSeleccionada = estadoRespuesta && estadoRespuesta.seleccion === opcion;
              const esCorrecta = estadoRespuesta && estadoRespuesta.correcta === opcion;
              
              let colorBoton = "bg-indigo-900/60 border-indigo-500/50 text-white hover:bg-indigo-700/80";
              let colorLetra = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black";
              let icono = null;

              if (estadoRespuesta) {
                if (esCorrecta) {
                  // Si gana, el botón correcto brilla fuerte
                  colorBoton = "bg-yellow-400 border-white text-black shadow-[0_0_30px_rgba(250,204,21,1)] scale-[1.05] z-10";
                  colorLetra = "bg-black text-yellow-400";
                  icono = <CheckCircle2 size={24} className="text-black" />;
                } else if (esSeleccionada) {
                  colorBoton = "bg-red-500 border-red-300 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)]";
                  icono = <XCircle size={24} className="text-white" />;
                } else {
                  colorBoton = "bg-black/40 border-transparent text-white/50 opacity-40";
                }
              }

              return (
                <button 
                  key={index} 
                  onClick={() => manejarRespuesta(opcion)} 
                  disabled={estadoRespuesta !== null || escuchando} 
                  className={`relative flex items-center justify-between p-4 pl-5 pr-6 rounded-full border-2 transition-all duration-300 font-bold text-lg md:text-xl shadow-lg ${colorBoton}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full font-black text-lg transition-colors ${estadoRespuesta && !esCorrecta ? 'bg-white/20 text-white/50' : colorLetra}`}>
                      {LETRAS[index]}
                    </div>
                    <span>{opcion}</span>
                  </div>
                  {icono && <div>{icono}</div>}
                </button>
              );
            })}
          </div>
        </div>
        
      </div>
    </>
  );
}