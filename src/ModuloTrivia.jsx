import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

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
    { "pregunta": "Jesús dijo: 'Yo soy el Alfa y la...'", "opciones": ["Beta", "Omega", "Luz", "Verdad"], "respuestaCorrecta": "Omega" },
  { "pregunta": "¿Quién fue tragado por un gran pez?", "opciones": ["Moisés", "Jonás", "David", "Pedro"], "respuestaCorrecta": "Jonás" },
  { "pregunta": "¿Cuántos días y noches llovió en el diluvio?", "opciones": ["40", "7", "12", "100"], "respuestaCorrecta": "40" },
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
  { "pregunta": "¿Qué mujer judía llegó a ser reina del Imperio Persa?", "opciones": ["Vasti", "Ester", "Rut", "Débora"], "respuestaCorrecta": "Ester" },
  { "pregunta": "¿Quién derrotó a Goliat?", "opciones": ["Saúl", "Salomón", "David", "Sansón"], "respuestaCorrecta": "David" }
];

export default function ModuloTrivia({ currentUser, db, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntosSesion, setPuntosSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [preguntasMezcladas, setPreguntasMezcladas] = useState([]);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null);

  useEffect(() => {
    // Mezcla de preguntas para que siempre sean aleatorias
    const mezcladas = [...PREGUNTAS_LOCALES].sort(() => Math.random() - 0.5);
    setPreguntasMezcladas(mezcladas);
  }, []);

  const manejarRespuesta = (opcionSeleccionada) => {
    // Si ya tocó una opción, bloquea los botones para que no toque dos veces
    if (estadoRespuesta) return; 

    const esCorrecta = opcionSeleccionada === preguntasMezcladas[preguntaActual].respuestaCorrecta;
    
    // Muestra los colores verde/rojo
    setEstadoRespuesta({ seleccion: opcionSeleccionada, correcta: preguntasMezcladas[preguntaActual].respuestaCorrecta });

    if (esCorrecta) {
      setPuntosSesion(prev => prev + 10);
      
      // GUARDA EN FIREBASE EN SEGUNDO PLANO (sin trabar la app)
      if (currentUser && db) {
        const puntosTotales = (currentUser.puntosTrivia || 0) + 10;
        currentUser.puntosTrivia = puntosTotales; // Actualiza puntaje visual rápido
        updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { 
          puntosTrivia: puntosTotales 
        }).catch(err => console.error("Error guardando puntos en silencio:", err));
      }
    }

    // Espera 1.5 segundos justos y pasa a la próxima pregunta sin trabarse
    setTimeout(() => {
      if (preguntaActual + 1 < preguntasMezcladas.length) {
        setPreguntaActual(preguntaActual + 1);
        setEstadoRespuesta(null);
      } else {
        setJuegoTerminado(true);
      }
    }, 1500);
  };

  if (preguntasMezcladas.length === 0) {
    return <div className="text-center p-10 text-white font-bold">Cargando desafío...</div>;
  }

  if (juegoTerminado) {
    return (
      <div className="bg-blue-950/80 border border-blue-500/40 p-8 rounded-3xl text-center shadow-xl">
        <h2 className="text-4xl font-black text-white mb-4">¡Completaste todas las preguntas!</h2>
        <p className="text-blue-300 text-xl mb-6">Sumaste <span className="text-amber-400 font-black">{puntosSesion} puntos</span> hoy.</p>
        <button onClick={onVolver} className="bg-blue-600 text-white font-black py-4 px-8 rounded-xl w-full uppercase tracking-widest hover:scale-105 transition-transform">Volver al Inicio</button>
      </div>
    );
  }

  const pregunta = preguntasMezcladas[preguntaActual];

  return (
    <div className="bg-black/80 border border-blue-500/40 p-6 md:p-10 rounded-3xl text-center shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-blue-500/30 pb-4">
        <span className="text-blue-300 font-bold uppercase tracking-widest text-sm">Pregunta {preguntaActual + 1}</span>
        <span className="bg-blue-600 text-white font-black px-4 py-2 rounded-full shadow-lg">Ganado: {puntosSesion} Pts</span>
      </div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white mb-10 leading-tight">{pregunta.pregunta}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pregunta.opciones.map((opcion, index) => {
          // Lógica de colores al responder
          let colorBoton = "bg-[#1a1a1a] border-slate-600 text-white hover:bg-blue-600";
          if (estadoRespuesta) {
            if (opcion === estadoRespuesta.correcta) colorBoton = "bg-green-600 border-green-400 text-white"; // Correcta
            else if (opcion === estadoRespuesta.seleccion) colorBoton = "bg-red-600 border-red-400 text-white"; // Incorrecta
            else colorBoton = "bg-slate-800 border-slate-700 text-slate-500 opacity-50"; // Las demás se apagan
          }

          return (
            <button 
              key={index} 
              onClick={() => manejarRespuesta(opcion)} 
              disabled={estadoRespuesta !== null} 
              className={`border font-bold py-5 px-4 rounded-xl transition-all shadow-md ${colorBoton}`}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      <button onClick={onVolver} className="mt-10 text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 transition-colors">Volver al Inicio (Tus puntos ya están guardados)</button>
    </div>
  );
}