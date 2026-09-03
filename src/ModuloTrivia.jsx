import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Mic, MicOff, Volume2, Square, Trophy, Star, ChevronLeft, CheckCircle2, XCircle, Loader2, Sparkles, Heart, Gem, ShoppingBag } from 'lucide-react';

const PREGUNTAS_LOCALES = [
    { "pregunta": "¿En cuántos días creó Dios los cielos y la tierra?", "opciones": ["7", "6", "3", "40"], "respuestaCorrecta": "6" },
      { "pregunta": "¿Cuántos animales de cada especie subió Moisés al arca?", "opciones": ["2", "7", "Ninguno, fue Noé", "14"], "respuestaCorrecta": "Ninguno, fue Noé" },
      { "pregunta": "¿En qué libro de la Biblia se dice que la manzana fue el fruto prohibido?", "opciones": ["Génesis", "Éxodo", "Cantares", "En ninguno"], "respuestaCorrecta": "En ninguno" },
      { "pregunta": "¿Quién le cortó el cabello a Sansón?", "opciones": ["Dalila", "Sus hermanos", "Un sirviente", "Los filisteos"], "respuestaCorrecta": "Un sirviente" },
      { "pregunta": "¿Cuántos reyes magos visitaron a Jesús en el pesebre la noche de su nacimiento?", "opciones": ["3", "12", "Ninguno", "2"], "respuestaCorrecta": "Ninguno" },
      { "pregunta": "¿Qué animal se tragó a Jonás según la Biblia?", "opciones": ["Una ballena azul", "Un gran pez", "Un tiburón", "Un leviatán"], "respuestaCorrecta": "Un gran pez" },
      { "pregunta": "¿En qué versículo dice 'Ayúdate, que yo te ayudaré'?", "opciones": ["Mateo 4:10", "Salmos 23:1", "Proverbios 3:5", "En ninguna parte"], "respuestaCorrecta": "En ninguna parte" },
      { "pregunta": "¿De qué color era el caballo de Pablo cuando cayó camino a Damasco?", "opciones": ["Blanco", "Negro", "Marrón", "No menciona un caballo"], "respuestaCorrecta": "No menciona un caballo" },
      { "pregunta": "¿Cuántos días llovió durante el diluvio en la época de Moisés?", "opciones": ["40 días", "7 días", "Ninguno, fue en la época de Noé", "150 días"], "respuestaCorrecta": "Ninguno, fue en la época de Noé" },
      { "pregunta": "¿Qué mandó a hacer Jesús en el octavo día de la creación?", "opciones": ["Separar las aguas", "Crear a Eva", "Nada, la creación duró 6 días", "Descansar"], "respuestaCorrecta": "Nada, la creación duró 6 días" },
      { "pregunta": "¿Quién mató al hermano de Abel?", "opciones": ["Caín", "Lamec", "Nadie, Caín era su hermano", "Set"], "respuestaCorrecta": "Nadie, Caín era su hermano" },
      { "pregunta": "¿Qué arma de hierro usó Caín para matar a Abel?", "opciones": ["Una espada", "Una lanza", "Un cuchillo", "No se especifica"], "respuestaCorrecta": "No se especifica" },
      { "pregunta": "¿Cuál es la raíz de todos los males según Pablo?", "opciones": ["El dinero", "El amor al dinero", "La mentira", "El orgullo"], "respuestaCorrecta": "El amor al dinero" },
      { "pregunta": "¿Cuántas plagas envió Moisés a Egipto?", "opciones": ["10", "7", "Dios las envió, no Moisés", "12"], "respuestaCorrecta": "Dios las envió, no Moisés" },
      { "pregunta": "¿Qué tipo de pez multiplicó Jesús junto con los panes?", "opciones": ["Tilapia", "Salmón", "Bagre", "No menciona la especie"], "respuestaCorrecta": "No menciona la especie" },
      { "pregunta": "¿A cuántos muertos resucitó el rey David?", "opciones": ["1", "3", "A ninguno", "12"], "respuestaCorrecta": "A ninguno" },
      { "pregunta": "¿De qué madera estaba hecha la cruz en la que murió Moisés?", "opciones": ["Cedro", "Acacia", "Olivo", "Moisés no fue crucificado"], "respuestaCorrecta": "Moisés no fue crucificado" },
      { "pregunta": "¿Cuántas monedas de oro le dieron a Judas por traicionar a Jesús?", "opciones": ["30", "Ninguna, fueron de plata", "10", "40"], "respuestaCorrecta": "Ninguna, fueron de plata" },
      { "pregunta": "¿Qué santo bautizó a Jesús en el río Jordán?", "opciones": ["San Pedro", "San Mateo", "Juan el Bautista", "San Lucas"], "respuestaCorrecta": "Juan el Bautista" },
      { "pregunta": "¿Cuántas vacas limpias llevó Noé en el arca?", "opciones": ["2", "14 (Siete parejas)", "4", "Ninguna"], "respuestaCorrecta": "14 (Siete parejas)" },
      { "pregunta": "¿Qué ángel le anunció a María Magdalena que estaba embarazada?", "opciones": ["Gabriel", "Miguel", "A la Virgen María, no a Magdalena", "Rafael"], "respuestaCorrecta": "A la Virgen María, no a Magdalena" },
      { "pregunta": "¿Cómo se llamaba el mar que dividió Jesús para los israelitas?", "opciones": ["Mar Rojo", "Mar de Galilea", "Ninguno, fue Moisés", "Mar Muerto"], "respuestaCorrecta": "Ninguno, fue Moisés" },
      { "pregunta": "¿Cuántas veces negó Pedro a Jesús por 30 monedas de plata?", "opciones": ["3", "7", "Judas lo hizo por monedas", "1"], "respuestaCorrecta": "Judas lo hizo por monedas" },
      { "pregunta": "¿Qué rey fue tragado por los leones en el foso?", "opciones": ["Nabucodonosor", "Ninguno, fue Daniel", "Darío", "Belsasar"], "respuestaCorrecta": "Ninguno, fue Daniel" },
      { "pregunta": "¿Cuál fue el primer milagro de Jesús cuando era un niño en Nazaret?", "opciones": ["Sanar un pájaro", "Dar vista a un niño", "Caminar sobre el agua", "Ninguno, su primer milagro fue de adulto"], "respuestaCorrecta": "Ninguno, su primer milagro fue de adulto" },
      { "pregunta": "¿En qué parte del Padre Nuestro original se menciona a la Virgen María?", "opciones": ["Al principio", "En el medio", "Al final", "En ninguna"], "respuestaCorrecta": "En ninguna" },
      { "pregunta": "¿Dónde aterrizó el Arca de la Alianza después del diluvio?", "opciones": ["Monte Ararat", "Monte Sinaí", "Jerusalén", "Esa fue el Arca de Noé"], "respuestaCorrecta": "Esa fue el Arca de Noé" },
      { "pregunta": "¿Cuántos hermanos varones tenía Jesús según el Antiguo Testamento?", "opciones": ["4", "2", "Ninguno, el AT fue escrito antes de Jesús", "12"], "respuestaCorrecta": "Ninguno, el AT fue escrito antes de Jesús" },
      { "pregunta": "¿A qué tribu pertenecía Pablo antes de llamarse Pedro?", "opciones": ["Benjamín", "Judá", "Nunca se llamó Pedro", "Leví"], "respuestaCorrecta": "Nunca se llamó Pedro" },
      { "pregunta": "¿Qué mujer se convirtió en estatua de sal en el Nuevo Testamento?", "opciones": ["María", "Marta", "Ninguna, fue en el Antiguo", "Salomé"], "respuestaCorrecta": "Ninguna, fue en el Antiguo" },
      { "pregunta": "¿Quién bautizó a Moisés en las aguas del río Nilo?", "opciones": ["Faraón", "Aarón", "Nadie, fue rescatado del agua", "Jetro"], "respuestaCorrecta": "Nadie, fue rescatado del agua" },
      { "pregunta": "¿Qué mandamiento dice 'No comerás carne de cerdo'?", "opciones": ["El tercero", "El décimo", "El primero", "Ninguno"], "respuestaCorrecta": "Ninguno" },
      { "pregunta": "¿Cuántos días ayunó Jesús en el jardín del Edén?", "opciones": ["40", "7", "3", "Ayunó en el desierto, no en el Edén"], "respuestaCorrecta": "Ayunó en el desierto, no en el Edén" },
      { "pregunta": "¿Qué profeta mayor escribió el Evangelio según San Mateo?", "opciones": ["Isaías", "Jeremías", "Daniel", "Mateo era apóstol, no profeta del AT"], "respuestaCorrecta": "Mateo era apóstol, no profeta del AT" },
      { "pregunta": "¿A qué ciudad se dirigía el buen samaritano cuando lo asaltaron?", "opciones": ["Jericó", "Jerusalén", "Samaria", "El asaltado era un hombre anónimo"], "respuestaCorrecta": "El asaltado era un hombre anónimo" },
      { "pregunta": "¿Cuántas personas sobrevivieron a la destrucción de Sodoma dentro del arca?", "opciones": ["8", "4", "2", "El arca fue para el diluvio"], "respuestaCorrecta": "El arca fue para el diluvio" },
      { "pregunta": "¿Qué cuervo le llevó pan y carne a Jesús durante su ayuno?", "opciones": ["Uno blanco", "Uno negro", "Fueron ángeles, los cuervos alimentaron a Elías", "Dos cuervos"], "respuestaCorrecta": "Fueron ángeles, los cuervos alimentaron a Elías" },
      { "pregunta": "¿Quién fue el primer hijo de Abraham con su esposa Agar?", "opciones": ["Isaac", "Jacob", "Ismael", "Agar era su sierva, no su esposa"], "respuestaCorrecta": "Agar era su sierva, no su esposa" },
      { "pregunta": "¿Cuántas plagas cayeron sobre el Imperio Romano para liberar a Israel?", "opciones": ["10", "7", "Ninguna, cayeron sobre Egipto", "3"], "respuestaCorrecta": "Ninguna, cayeron sobre Egipto" },
      { "pregunta": "¿Qué edad tenía el rey David cuando conoció a Jesucristo?", "opciones": ["30", "40", "50", "Vivió 1000 años antes"], "respuestaCorrecta": "Vivió 1000 años antes" },
      { "pregunta": "¿De qué material precioso era la corona de oro de Jesús en la cruz?", "opciones": ["Oro puro", "Plata", "Bronce", "Era de espinas"], "respuestaCorrecta": "Era de espinas" },
      { "pregunta": "¿Qué rey ordenó la Torre de Babel en el centro de Jerusalén?", "opciones": ["Salomón", "David", "Se construyó en Sinar, no en Jerusalén", "Herodes"], "respuestaCorrecta": "Se construyó en Sinar, no en Jerusalén" },
      { "pregunta": "¿Cuántas tribus de Israel se ahogaron en el Mar Rojo?", "opciones": ["2", "12", "1", "Ninguna, cruzaron a salvo"], "respuestaCorrecta": "Ninguna, cruzaron a salvo" },
      { "pregunta": "¿En qué idioma escribió Moisés las cartas a los Romanos?", "opciones": ["Hebreo", "Arameo", "Griego", "Las escribió Pablo, no Moisés"], "respuestaCorrecta": "Las escribió Pablo, no Moisés" },
      { "pregunta": "¿Cuál de los tres reyes magos era hermano biológico de Jesús?", "opciones": ["Melchor", "Gaspar", "Baltasar", "Ninguno"], "respuestaCorrecta": "Ninguno" },
      { "pregunta": "¿Qué animal usó Sansón para hablar directamente con Dios?", "opciones": ["Un león", "Una zorra", "El asna que habló era de Balaam", "Un cordero"], "respuestaCorrecta": "El asna que habló era de Balaam" },
      { "pregunta": "¿Cuántos hermanos mayores tenía Jesús en su familia?", "opciones": ["2", "4", "Ninguno, fue el primogénito", "1"], "respuestaCorrecta": "Ninguno, fue el primogénito" },
      { "pregunta": "¿Quién cerró la puerta del arca de Noé con llave desde adentro?", "opciones": ["Noé", "Sem", "Dios la cerró desde afuera", "Cam"], "respuestaCorrecta": "Dios la cerró desde afuera" },
      { "pregunta": "¿A qué profeta le dijo Jesús 'Polvo eres y al polvo volverás'?", "opciones": ["Pedro", "Juan", "Judas", "Dios se lo dijo a Adán en Génesis"], "respuestaCorrecta": "Dios se lo dijo a Adán en Génesis" },
      { "pregunta": "¿Qué libro del Antiguo Testamento detalla la resurrección de Lázaro?", "opciones": ["Isaías", "Salmos", "Job", "Ocurre en el Nuevo Testamento"], "respuestaCorrecta": "Ocurre en el Nuevo Testamento" },
      { "pregunta": "¿Quién era emperador romano cuando se construyó el Arca de Noé?", "opciones": ["César Augusto", "Nerón", "Tiberio", "El Imperio no existía"], "respuestaCorrecta": "El Imperio no existía" },
      { "pregunta": "¿Qué animal silvestre engañó a la Virgen María en el Edén?", "opciones": ["Una serpiente", "Un león", "Una zorra", "La engañada fue Eva"], "respuestaCorrecta": "La engañada fue Eva" },
      { "pregunta": "¿De qué árbol sagrado tomó Jesús madera para fabricar su cruz?", "opciones": ["Olivo", "Cedro", "Higuera", "Fue forzado a cargarla, no la fabricó"], "respuestaCorrecta": "Fue forzado a cargarla, no la fabricó" },
      { "pregunta": "¿Cuántas piedras usó finalmente David para derribar a Goliat?", "opciones": ["5", "3", "1", "0"], "respuestaCorrecta": "1" },
      { "pregunta": "¿A quién le vendió Jacob su primogenitura por unas monedas?", "opciones": ["A Esaú", "A Labán", "A Isaac", "Él la compró, no la vendió"], "respuestaCorrecta": "Él la compró, no la vendió" },
      { "pregunta": "¿Qué libro de la Biblia escribió Jesucristo de su puño y letra?", "opciones": ["Apocalipsis", "Juan", "Mateo", "Ninguno"], "respuestaCorrecta": "Ninguno" },
      { "pregunta": "¿Cuántos mandamientos le entregó Dios a Noé en el Sinaí?", "opciones": ["10", "7", "2", "Se los entregó a Moisés"], "respuestaCorrecta": "Se los entregó a Moisés" },
      { "pregunta": "¿Qué apóstol caminó sobre el agua junto con Juan?", "opciones": ["Pedro", "Mateo", "Santiago", "Solo Pedro caminó sobre el agua"], "respuestaCorrecta": "Solo Pedro caminó sobre el agua" },
      { "pregunta": "¿Quién se tragó entero al camello para no pasar por la aguja?", "opciones": ["Jonás", "Pedro", "Un fariseo", "Nadie, es una hipérbole"], "respuestaCorrecta": "Nadie, es una hipérbole" },
      { "pregunta": "¿En qué mes cayó el muro de Jericó según nuestro calendario?", "opciones": ["Abril", "Enero", "Octubre", "Ese calendario no existía"], "respuestaCorrecta": "Ese calendario no existía" },
      { "pregunta": "¿Qué milagro usó Pablo para convertir agua en vino en Caná?", "opciones": ["Oración", "Fe", "Ninguno, el milagro lo hizo Jesús", "Imposición de manos"], "respuestaCorrecta": "Ninguno, el milagro lo hizo Jesús" },
      { "pregunta": "¿Cuántos capítulos tiene el libro de Filemón en el Antiguo Testamento?", "opciones": ["1", "3", "5", "Es del Nuevo Testamento"], "respuestaCorrecta": "Es del Nuevo Testamento" },
      { "pregunta": "¿Qué espada de oro usó David para cortarle la cabeza a Goliat?", "opciones": ["La de Saúl", "La de Jonatán", "Ninguna, usó la espada del filisteo", "La suya propia"], "respuestaCorrecta": "Ninguna, usó la espada del filisteo" },
      { "pregunta": "¿Qué discípula de Jesús lo traicionó con un beso?", "opciones": ["María Magdalena", "Marta", "Salomé", "Fue un hombre, Judas"], "respuestaCorrecta": "Fue un hombre, Judas" },
      { "pregunta": "¿Cuántos leprosos regresaron a agradecerle a Moisés?", "opciones": ["1", "9", "10", "Fueron sanados por Jesús"], "respuestaCorrecta": "Fueron sanados por Jesús" },
      { "pregunta": "¿De qué libro es: 'Dios da las peores batallas a sus mejores guerreros'?", "opciones": ["Salmos", "Josué", "Efesios", "No es un versículo bíblico"], "respuestaCorrecta": "No es un versículo bíblico" },
      { "pregunta": "¿A qué fariseo le dijo Pablo: 'Deja que los niños vengan a mí'?", "opciones": ["Nicodemo", "Gamaliel", "A ninguno, lo dijo Jesús", "Saulo"], "respuestaCorrecta": "A ninguno, lo dijo Jesús" },
      { "pregunta": "¿En qué ciudad construyó Abraham la Torre de Babel?", "opciones": ["Ur", "Harán", "Hebrón", "Se construyó antes de Abraham"], "respuestaCorrecta": "Se construyó antes de Abraham" },
      { "pregunta": "¿Qué profeta estuvo 40 días en el vientre de un pez?", "opciones": ["Jonás", "Ezequiel", "Daniel", "Jonás estuvo 3 días, no 40"], "respuestaCorrecta": "Jonás estuvo 3 días, no 40" },
      { "pregunta": "¿Cómo se llamaba la hija de Adán que cometió el primer asesinato?", "opciones": ["Aclima", "Azura", "Noé", "Fue su hijo varón, Caín"], "respuestaCorrecta": "Fue su hijo varón, Caín" },
      { "pregunta": "¿Cuántas trompetas romanas tocaron en las murallas de Roma?", "opciones": ["7", "12", "0", "La historia es de Jericó"], "respuestaCorrecta": "La historia es de Jericó" },
      { "pregunta": "¿Qué apóstol dividió el Mar Rojo huyendo del Faraón?", "opciones": ["Pedro", "Pablo", "Juan", "Fue Moisés, siglos antes"], "respuestaCorrecta": "Fue Moisés, siglos antes" },
      { "pregunta": "¿Qué rey terrenal le regaló oro, mirra y diamantes al niño Jesús?", "opciones": ["Herodes", "Melchor", "Gaspar", "Los magos dieron incienso, no diamantes"], "respuestaCorrecta": "Los magos dieron incienso, no diamantes" },
      { "pregunta": "¿Cuántas puertas de madera tenía el Arca de la Alianza?", "opciones": ["1", "2", "4", "Ninguna, era un cofre cerrado"], "respuestaCorrecta": "Ninguna, era un cofre cerrado" },
      { "pregunta": "¿Cómo murió el apóstol Judas crucificado por el Imperio?", "opciones": ["Boca abajo", "En una cruz en X", "Atado", "Se quitó la vida ahorcándose"], "respuestaCorrecta": "Se quitó la vida ahorcándose" },
      { "pregunta": "¿En qué versículo se menciona la jugosa manzana roja de Adán?", "opciones": ["Génesis 3:1", "Génesis 3:6", "Génesis 4:1", "No menciona especie ni color"], "respuestaCorrecta": "No menciona especie ni color" },
      { "pregunta": "¿Qué profeta mayor estuvo presente bajo la cruz de Cristo?", "opciones": ["Isaías", "Jeremías", "Ezequiel", "Ninguno, vivieron siglos antes"], "respuestaCorrecta": "Ninguno, vivieron siglos antes" },
      { "pregunta": "¿Cuántos capítulos de Apocalipsis escribió Moisés en Patmos?", "opciones": ["22", "12", "7", "Lo escribió Juan, no Moisés"], "respuestaCorrecta": "Lo escribió Juan, no Moisés" },
      { "pregunta": "¿A quién de los doce apóstoles elegidos le decían 'El Bautista'?", "opciones": ["Pedro", "Andrés", "Santiago", "No era de los 12 apóstoles"], "respuestaCorrecta": "No era de los 12 apóstoles" },
      { "pregunta": "¿Qué milagro realizó Jesús dentro del arca durante el diluvio?", "opciones": ["Multiplicar comida", "Calmar la tormenta", "Sanar animales", "Vivió miles de años después"], "respuestaCorrecta": "Vivió miles de años después" },
      { "pregunta": "¿De qué raza era el perro pastor de David?", "opciones": ["Ovejero", "Mastín", "Lebrel", "No se registra que tuviera perro"], "respuestaCorrecta": "No se registra que tuviera perro" },
      { "pregunta": "¿Qué profeta dividió el río Nilo para escapar del ejército?", "opciones": ["Ezequiel", "Daniel", "Moisés", "Dividió el Mar Rojo, no el Nilo"], "respuestaCorrecta": "Dividió el Mar Rojo, no el Nilo" },
      { "pregunta": "¿Cuántas esposas tuvo el rey Salomón antes del gran diluvio?", "opciones": ["700", "300", "1000", "Gobernó siglos después del diluvio"], "respuestaCorrecta": "Gobernó siglos después del diluvio" },
      { "pregunta": "¿A qué santo le entregó Dios las tablas en el Monte Sinaí?", "opciones": ["San Pedro", "San Pablo", "San Juan", "A Moisés"], "respuestaCorrecta": "A Moisés" },
      { "pregunta": "¿Qué carpintero judío construyó el Arca del Pacto con la Virgen María?", "opciones": ["José", "Jesús", "Zacarías", "La construyó Bezaleel en el Éxodo"], "respuestaCorrecta": "La construyó Bezaleel en el Éxodo" },
      { "pregunta": "¿De qué árbol arrancó Noé la rama para llevársela a la paloma?", "opciones": ["Olivo", "Cedro", "Higuera", "La paloma regresó sola con la rama"], "respuestaCorrecta": "La paloma regresó sola con la rama" },
      { "pregunta": "¿En qué libro del Nuevo Testamento están los zorros de Sansón?", "opciones": ["Hechos", "Romanos", "Hebreos", "Es del Antiguo Testamento"], "respuestaCorrecta": "Es del Antiguo Testamento" },
      { "pregunta": "¿Cuántos pares de animales metió Pedro en su barca?", "opciones": ["2", "7", "14", "Metió peces, los pares fueron de Noé"], "respuestaCorrecta": "Metió peces, los pares fueron de Noé" },
      { "pregunta": "¿Qué faraón gobernaba al construir el muro de Jericó?", "opciones": ["Ramsés", "Tutankamón", "Ptolomeo", "Jericó estaba fuera del dominio del faraón"], "respuestaCorrecta": "Jericó estaba fuera del dominio del faraón" },
      { "pregunta": "¿Qué arcángel le dictó los Diez Mandamientos a Adán?", "opciones": ["Miguel", "Gabriel", "Rafael", "Dios a Moisés, no a Adán"], "respuestaCorrecta": "Dios a Moisés, no a Adán" },
      { "pregunta": "¿Quién fue el autor original de Génesis en el Nuevo Testamento?", "opciones": ["Pablo", "Juan", "Pedro", "Génesis es del Antiguo Testamento"], "respuestaCorrecta": "Génesis es del Antiguo Testamento" },
      { "pregunta": "¿En qué evangelio se narra que David vence a Goliat?", "opciones": ["Mateo", "Marcos", "Lucas", "En ninguno, está en 1 Samuel"], "respuestaCorrecta": "En ninguno, está en 1 Samuel" },
      { "pregunta": "¿A cuántos peces alimentó Jesús con cinco panes y dos multitudes?", "opciones": ["5000", "4000", "12", "Fueron 5 panes y 2 peces"], "respuestaCorrecta": "Fueron 5 panes y 2 peces" },
      { "pregunta": "¿Cuál fue la peor plaga sobre la ciudad de Roma?", "opciones": ["Sangre", "Ranas", "Oscuridad", "Cayeron sobre Egipto"], "respuestaCorrecta": "Cayeron sobre Egipto" },
      { "pregunta": "¿Qué edad tenía Matusalén al ser resucitado al tercer día?", "opciones": ["969", "930", "900", "Fue Lázaro, Matusalén murió anciano"], "respuestaCorrecta": "Fue Lázaro, Matusalén murió anciano" },
      { "pregunta": "¿Cuántas iglesias locales fundó Abraham?", "opciones": ["7", "12", "3", "Ninguna, la iglesia nace en el NT"], "respuestaCorrecta": "Ninguna, la iglesia nace en el NT" },
      { "pregunta": "¿En qué río bautizó Elías a Juan el Bautista?", "opciones": ["Jordán", "Nilo", "Éufrates", "Vivieron con 900 años de diferencia"], "respuestaCorrecta": "Vivieron con 900 años de diferencia" },
      { "pregunta": "¿A qué rey le cortó la cabeza Dalila?", "opciones": ["Saúl", "David", "Salomón", "Cortó el cabello a Sansón (juez)"], "respuestaCorrecta": "Cortó el cabello a Sansón (juez)" },
      { "pregunta": "¿Cuántas personas subieron al cielo en carro de fuego con Moisés?", "opciones": ["2", "1", "12", "Moisés murió, fue Elías"], "respuestaCorrecta": "Moisés murió, fue Elías" },
      { "pregunta": "¿Qué reina se lavó las manos frente a la multitud?", "opciones": ["Jezabel", "Ester", "Vasti", "Fue Poncio Pilato"], "respuestaCorrecta": "Fue Poncio Pilato" },
      { "pregunta": "¿Qué libro de la Biblia termina exactamente con la palabra 'Principio'?", "opciones": ["Génesis", "Juan", "Apocalipsis", "Ninguno, es el título"], "respuestaCorrecta": "Ninguno, es el título" },
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
    { "pregunta": "¿Qué mujer judía llegó a ser reina del Imperio Persa?", "opciones": ["Vasti", "Ester", "Rut", "Débora"], "respuestaCorrecta": "Ester" },
    { "pregunta": "¿Qué creó Dios en el primer día?", "opciones": ["La luz", "Los animales", "El sol", "El hombre"], "respuestaCorrecta": "La luz" },
    { "pregunta": "¿Quién fue el tercer hijo de Adán y Eva?", "opciones": ["Enós", "Set", "Cainán", "Lamec"], "respuestaCorrecta": "Set" },
    { "pregunta": "¿Cuántos años vivió Adán?", "opciones": ["930", "900", "950", "990"], "respuestaCorrecta": "930" },
    { "pregunta": "¿De qué ciudad llamó Dios a Abraham?", "opciones": ["Babilonia", "Nínive", "Ur de los caldeos", "Harán"], "respuestaCorrecta": "Ur de los caldeos" },
    { "pregunta": "¿Cómo se llamó el hijo de Abraham y Agar?", "opciones": ["Isaac", "Ismael", "Zimrán", "Madián"], "respuestaCorrecta": "Ismael" },
    { "pregunta": "¿Qué significa el nombre Isaac?", "opciones": ["Salvación", "Risa", "Promesa", "Paz"], "respuestaCorrecta": "Risa" },
    { "pregunta": "¿A qué monte mandó Dios a Abraham para sacrificar a Isaac?", "opciones": ["Sinaí", "Moriah", "Carmelo", "Nebo"], "respuestaCorrecta": "Moriah" },
    { "pregunta": "¿Cómo se llamaba el padre de Rebeca?", "opciones": ["Betuel", "Labán", "Taré", "Nacor"], "respuestaCorrecta": "Betuel" },
    { "pregunta": "¿Qué robó Raquel a su padre Labán?", "opciones": ["Sus ovejas", "Su oro", "Sus ídolos", "Su tienda"], "respuestaCorrecta": "Sus ídolos" },
    { "pregunta": "¿Qué nombre le puso Raquel a Benjamín antes de morir?", "opciones": ["Benoni", "Rubén", "José", "Dan"], "respuestaCorrecta": "Benoni" },
    { "pregunta": "¿Quién fue el primogénito de Jacob?", "opciones": ["José", "Judá", "Rubén", "Simeón"], "respuestaCorrecta": "Rubén" },
    { "pregunta": "¿A quiénes masacraron Simeón y Leví?", "opciones": ["A los madianitas", "A los de Siquem", "A los egipcios", "A los filisteos"], "respuestaCorrecta": "A los de Siquem" },
    { "pregunta": "¿Qué soñó José en su primer sueño?", "opciones": ["Manjos de trigo", "El sol y la luna", "Siete vacas", "Siete espigas"], "respuestaCorrecta": "Manjos de trigo" },
    { "pregunta": "¿A quién fue vendido José en Egipto?", "opciones": ["Al Faraón", "A Potifar", "A un panadero", "A un copero"], "respuestaCorrecta": "Potifar" },
    { "pregunta": "¿De qué acusó la esposa de Potifar a José?", "opciones": ["De robo", "De intento de abuso", "De asesinato", "De traición"], "respuestaCorrecta": "De intento de abuso" },
    { "pregunta": "¿A quién perdonó la vida el Faraón según el sueño que interpretó José?", "opciones": ["Al panadero", "Al jefe de la guardia", "Al copero", "A su hermano"], "respuestaCorrecta": "Al copero" },
    { "pregunta": "¿Qué edad tenía José cuando se presentó ante Faraón?", "opciones": ["20 años", "30 años", "40 años", "50 años"], "respuestaCorrecta": "30 años" },
    { "pregunta": "¿Cómo se llamaron los hijos de José?", "opciones": ["Efraín y Manasés", "Gersón y Eliezer", "Pérez y Zera", "Jacob y Esaú"], "respuestaCorrecta": "Efraín y Manasés" },
    { "pregunta": "¿En qué tierra de Egipto habitaron los israelitas?", "opciones": ["Tebas", "Menfis", "Gosén", "Alejandría"], "respuestaCorrecta": "Gosén" },
    { "pregunta": "¿Cuántos años vivió José?", "opciones": ["100", "110", "120", "130"], "respuestaCorrecta": "110" },
    { "pregunta": "¿A qué tribu pertenecían los padres de Moisés?", "opciones": ["Judá", "Leví", "Benjamín", "Dan"], "respuestaCorrecta": "Leví" },
    { "pregunta": "¿Cómo se llamaba la hermana de Moisés?", "opciones": ["Jocabed", "Séfora", "María", "Ester"], "respuestaCorrecta": "María" },
    { "pregunta": "¿Quién encontró al bebé Moisés en el río?", "opciones": ["La hija del Faraón", "Una sierva egipcia", "Jocabed", "Miriam"], "respuestaCorrecta": "La hija del Faraón" },
    { "pregunta": "¿A qué tierra huyó Moisés?", "opciones": ["Canaán", "Madián", "Moab", "Edom"], "respuestaCorrecta": "Madián" },
    { "pregunta": "¿Quién fue el suegro de Moisés?", "opciones": ["Jetro", "Balaam", "Balac", "Melquisedec"], "respuestaCorrecta": "Jetro" },
    { "pregunta": "¿Qué excusa dio Moisés a Dios para no ir a Egipto?", "opciones": ["Soy muy viejo", "Soy tardo de habla", "Tengo miedo", "No conozco el camino"], "respuestaCorrecta": "Soy tardo de habla" },
    { "pregunta": "¿Qué plaga vino después del agua convertida en sangre?", "opciones": ["Piojos", "Moscas", "Ranas", "Úlceras"], "respuestaCorrecta": "Ranas" },
    { "pregunta": "¿Qué plaga fue la novena?", "opciones": ["Granizo", "Oscuridad", "Langostas", "Muerte de primogénitos"], "respuestaCorrecta": "Oscuridad" },
    { "pregunta": "¿De qué debían pintar los dinteles de las puertas en la Pascua?", "opciones": ["Aceite", "Agua", "Sangre de cordero", "Vino"], "respuestaCorrecta": "Sangre de cordero" },
    { "pregunta": "¿Cuántos años estuvieron los israelitas en Egipto?", "opciones": ["400", "430", "450", "480"], "respuestaCorrecta": "430" },
    { "pregunta": "¿Qué guiaba a los israelitas de día en el desierto?", "opciones": ["Una columna de fuego", "Una estrella", "Un ángel", "Una columna de nube"], "respuestaCorrecta": "Una columna de nube" },
    { "pregunta": "¿En qué lugar encontraron 12 fuentes de agua y 70 palmeras?", "opciones": ["Mara", "Elim", "Sinaí", "Refidim"], "respuestaCorrecta": "Elim" },
    { "pregunta": "¿Qué caía del cielo junto con el rocío de la mañana?", "opciones": ["Maná", "Codornices", "Nieve", "Miel"], "respuestaCorrecta": "Maná" },
    { "pregunta": "¿Quiénes sostuvieron las manos de Moisés en la batalla contra Amalec?", "opciones": ["Aarón y Hur", "Josué y Caleb", "Eldad y Medad", "Nadab y Abiú"], "respuestaCorrecta": "Aarón y Hur" },
    { "pregunta": "¿Qué mandamiento es el quinto?", "opciones": ["No matarás", "Honra a tu padre y a tu madre", "No robarás", "No codiciarás"], "respuestaCorrecta": "Honra a tu padre y a tu madre" },
    { "pregunta": "¿Qué mueble del tabernáculo estaba en el Lugar Santísimo?", "opciones": ["La fuente de bronce", "El altar del incienso", "El Arca del Pacto", "La mesa de los panes"], "respuestaCorrecta": "El Arca del Pacto" },
    { "pregunta": "¿Quiénes fueron consumidos por fuego por ofrecer fuego extraño?", "opciones": ["Coré y Datán", "Nadab y Abiú", "Ofni y Finees", "Ananías y Safira"], "respuestaCorrecta": "Nadab y Abiú" },
    { "pregunta": "¿Qué tribu fue censada aparte de las demás?", "opciones": ["Judá", "Simeón", "Leví", "Benjamín"], "respuestaCorrecta": "Leví" },
    { "pregunta": "¿Por qué castigó Dios a María con lepra?", "opciones": ["Por murmurar contra Moisés", "Por robar oro", "Por adorar ídolos", "Por no guardar el sábado"], "respuestaCorrecta": "Por murmurar contra Moisés" },
    { "pregunta": "¿Quién lideró la rebelión contra Moisés y fue tragado por la tierra?", "opciones": ["Datán", "Coré", "Abiram", "Balac"], "respuestaCorrecta": "Coré" },
    { "pregunta": "¿De quién era la vara que reverdeció y dio almendras?", "opciones": ["Moisés", "Aarón", "Josué", "Caleb"], "respuestaCorrecta": "Aarón" },
    { "pregunta": "¿Qué rey de Moab contrató a Balaam para maldecir a Israel?", "opciones": ["Og", "Sehón", "Balac", "Eglón"], "respuestaCorrecta": "Balac" },
    { "pregunta": "¿Qué ángel se interpuso en el camino del asna de Balaam?", "opciones": ["El Ángel de Jehová", "Gabriel", "Miguel", "Rafael"], "respuestaCorrecta": "El Ángel de Jehová" },
    { "pregunta": "¿Dónde hizo Moisés un resumen de la ley antes de morir?", "opciones": ["Éxodo", "Deuteronomio", "Levítico", "Números"], "respuestaCorrecta": "Deuteronomio" },
    { "pregunta": "¿Cuántos años tenía Moisés cuando murió?", "opciones": ["100", "110", "120", "130"], "respuestaCorrecta": "120" },
    { "pregunta": "¿Qué ciudad amurallada fue la primera en ser conquistada por Josué?", "opciones": ["Hai", "Hebrón", "Jericó", "Siquem"], "respuestaCorrecta": "Jericó" },
    { "pregunta": "¿Qué robó Acán de Jericó?", "opciones": ["Plata y oro", "Un manto babilónico, plata y oro", "Armas", "Alimentos"], "respuestaCorrecta": "Un manto babilónico, plata y oro" },
    { "pregunta": "¿A qué tribu pertenecía Josué?", "opciones": ["Judá", "Efraín", "Manasés", "Benjamín"], "respuestaCorrecta": "Efraín" },
    { "pregunta": "¿Con qué pueblo hizo Josué un pacto engañado por sus ropas viejas?", "opciones": ["Los gabaonitas", "Los filisteos", "Los madianitas", "Los jebuseos"], "respuestaCorrecta": "Los gabaonitas" },
    { "pregunta": "¿A quién le dio Josué la ciudad de Hebrón como heredad?", "opciones": ["Caleb", "Otoniel", "Fineés", "Eleazar"], "respuestaCorrecta": "Caleb" },
    { "pregunta": "¿Qué juez mató al rey Eglón, un hombre muy obeso?", "opciones": ["Aod", "Gedeón", "Otoniel", "Sansón"], "respuestaCorrecta": "Aod" },
    { "pregunta": "¿Qué usó Samgar para matar al rey Eglón?", "opciones": ["Una lanza", "Un puñal de dos filos", "Una honda", "Una flecha"], "respuestaCorrecta": "Un puñal de dos filos" },
    { "pregunta": "¿Qué juez mató a 600 filisteos con una aguijada de bueyes?", "opciones": ["Jefté", "Samgar", "Aod", "Gedeón"], "respuestaCorrecta": "Samgar" },
    { "pregunta": "¿Bajo qué árbol se sentaba Débora a juzgar a Israel?", "opciones": ["Un roble", "Un cedro", "Una palmera", "Un olivo"], "respuestaCorrecta": "Una palmera" },
    { "pregunta": "¿A qué general llamó Débora para la batalla?", "opciones": ["Gedeón", "Barac", "Jefté", "Abimelec"], "respuestaCorrecta": "Barac" },
    { "pregunta": "¿Qué señal pidió Gedeón a Dios con un vellón de lana?", "opciones": ["Que el vellón estuviera mojado y la tierra seca", "Que se quemara", "Que volara", "Que cambiara de color"], "respuestaCorrecta": "Que el vellón estuviera mojado y la tierra seca" },
    { "pregunta": "¿Con cuántos hombres derrotó Gedeón a Madián?", "opciones": ["32000", "10000", "300", "3000"], "respuestaCorrecta": "300" },
    { "pregunta": "¿Qué usaron los hombres de Gedeón en la batalla?", "opciones": ["Espadas y escudos", "Cántaros, antorchas y trompetas", "Arcos y flechas", "Hondas"], "respuestaCorrecta": "Cántaros, antorchas y trompetas" },
    { "pregunta": "¿Qué juez hizo un voto insensato que le costó la vida a su hija?", "opciones": ["Sansón", "Gedeón", "Jefté", "Ibzán"], "respuestaCorrecta": "Jefté" },
    { "pregunta": "¿Qué animal mató Sansón con sus propias manos?", "opciones": ["Un oso", "Un león", "Un lobo", "Una serpiente"], "respuestaCorrecta": "Un león" },
    { "pregunta": "¿Con qué mató Sansón a mil filisteos?", "opciones": ["Con una quijada de asno", "Con una espada", "Con una honda", "Con un palo"], "respuestaCorrecta": "Con una quijada de asno" },
    { "pregunta": "¿A qué dios adoraban los filisteos en el templo que destruyó Sansón?", "opciones": ["Baal", "Asera", "Dagón", "Moloc"], "respuestaCorrecta": "Dagón" },
    { "pregunta": "¿Cómo se llamaba el marido de Noemí?", "opciones": ["Elimelec", "Mahlón", "Quelión", "Booz"], "respuestaCorrecta": "Elimelec" },
    { "pregunta": "¿En qué ciudad se instalarón Rut y Noemí al volver de Moab?", "opciones": ["Jerusalén", "Jericó", "Belén", "Hebrón"], "respuestaCorrecta": "Belén" },
    { "pregunta": "¿Quién fue el padre de Booz?", "opciones": ["Salmón", "Elimelec", "Obed", "No se menciona"], "respuestaCorrecta": "Salmón" },
    { "pregunta": "¿Cómo se llamó el hijo de Rut y Booz?", "opciones": ["David", "Isaí", "Obed", "Salomón"], "respuestaCorrecta": "Obed" },
    { "pregunta": "¿Cómo se llamaban los hijos malvados del sacerdote Elí?", "opciones": ["Nadab y Abiú", "Ofni y Finees", "Coré y Datán", "Eldad y Medad"], "respuestaCorrecta": "Ofni y Finees" },
    { "pregunta": "¿Qué objeto sagrado robaron los filisteos en la batalla de Afec?", "opciones": ["La mesa de los panes", "El altar", "El Arca del Pacto", "El efod"], "respuestaCorrecta": "El Arca del Pacto" },
    { "pregunta": "¿Qué le pasó al ídolo Dagón cuando pusieron el Arca a su lado?", "opciones": ["Se derritió", "Cayó postrado sin cabeza ni manos", "Desapareció", "Habló"], "respuestaCorrecta": "Cayó postrado sin cabeza ni manos" },
    { "pregunta": "¿A qué tribu pertenecía el rey Saúl?", "opciones": ["Judá", "Benjamín", "Efraín", "Dan"], "respuestaCorrecta": "Benjamín" },
    { "pregunta": "¿Qué gigante desafió al ejército de Israel durante 40 días?", "opciones": ["Og", "Goliat", "Lahmi", "Sif"], "respuestaCorrecta": "Goliat" },
    { "pregunta": "¿De qué ciudad era Goliat?", "opciones": ["Asdod", "Gat", "Ascalón", "Ecrón"], "respuestaCorrecta": "Gat" },
    { "pregunta": "¿Cuántas piedras lisas recogió David del arroyo?", "opciones": ["1", "3", "5", "7"], "respuestaCorrecta": "5" },
    { "pregunta": "¿Quién era la hija de Saúl que fue esposa de David?", "opciones": ["Mical", "Merab", "Abigail", "Ahinoam"], "respuestaCorrecta": "Mical" },
    { "pregunta": "¿A qué ciudad huyó David y se hizo el loco para que no lo mataran?", "opciones": ["Ecrón", "Gat", "Jericó", "Siquem"], "respuestaCorrecta": "Gat" },
    { "pregunta": "¿A quién consultó Saúl la noche antes de su muerte?", "opciones": ["A Samuel", "A la adivina de Endor", "A David", "A Natán"], "respuestaCorrecta": "A la adivina de Endor" },
    { "pregunta": "¿En qué monte murieron Saúl y Jonatán?", "opciones": ["Carmelo", "Gilboa", "Sinaí", "Tabor"], "respuestaCorrecta": "Gilboa" },
    { "pregunta": "¿Cómo se llamaba el general del ejército de David?", "opciones": ["Abner", "Amad", "Joab", "Amasa"], "respuestaCorrecta": "Joab" },
    { "pregunta": "¿Cómo se llamaba la mujer de Urías heteo que David tomó?", "opciones": ["Betsabé", "Abigail", "Mical", "Maaca"], "respuestaCorrecta": "Betsabé" },
    { "pregunta": "¿Qué profeta confrontó a David por su pecado con Betsabé?", "opciones": ["Samuel", "Elías", "Gad", "Natán"], "respuestaCorrecta": "Natán" },
    { "pregunta": "¿Qué le pidió Salomón a Dios cuando comenzó a reinar?", "opciones": ["Riquezas", "Vida larga", "Sabiduría", "Muerte de sus enemigos"], "respuestaCorrecta": "Sabiduría" },
    { "pregunta": "¿Cuántos años tardó Salomón en construir el Templo?", "opciones": ["3", "7", "10", "40"], "respuestaCorrecta": "7" },
    { "pregunta": "¿Bajo qué rey se dividió el reino de Israel en dos?", "opciones": ["Salomón", "Roboam", "Jeroboam", "Acab"], "respuestaCorrecta": "Roboam" },
    { "pregunta": "¿Quién fue el peor rey de Israel del norte?", "opciones": ["Omri", "Baasa", "Acab", "Zimri"], "respuestaCorrecta": "Acab" },
    { "pregunta": "¿Cómo se llamaba la malvada esposa de Acab?", "opciones": ["Atalía", "Jezabel", "Dalila", "Herodías"], "respuestaCorrecta": "Jezabel" },
    { "pregunta": "¿Qué profeta desafió a los 450 profetas de Baal en el monte Carmelo?", "opciones": ["Eliseo", "Elías", "Isaías", "Jeremías"], "respuestaCorrecta": "Elías" },
    { "pregunta": "¿Quién era el rey de Siria que asedió Samaria en tiempos de Eliseo?", "opciones": ["Senaquerib", "Ben-adad", "Hazael", "Ciro"], "respuestaCorrecta": "Ben-adad" },
    { "pregunta": "¿A quién le cayó la lepra de Naamán por codicioso?", "opciones": ["Giezi", "Eliseo", "Acab", "Jeroboam"], "respuestaCorrecta": "Giezi" },
    { "pregunta": "¿Qué imperio destruyó el reino del norte (Israel)?", "opciones": ["Babilonia", "Egipto", "Asiria", "Roma"], "respuestaCorrecta": "Asiria" },
    { "pregunta": "¿Qué imperio destruyó el reino del sur (Judá) y el Templo?", "opciones": ["Asiria", "Persia", "Babilonia", "Egipto"], "respuestaCorrecta": "Babilonia" },
    { "pregunta": "¿Qué rey descubrió el Libro de la Ley perdido en el templo?", "opciones": ["Ezequías", "Josías", "Joás", "Uziías"], "respuestaCorrecta": "Josías" },
    { "pregunta": "¿Qué rey persa firmó el decreto para reconstruir el Templo?", "opciones": ["Ciro", "Darío", "Artajerjes", "Asuero"], "respuestaCorrecta": "Ciro" },
    { "pregunta": "¿En cuántos días reconstruyó Nehemías los muros de Jerusalén?", "opciones": ["40", "52", "100", "7"], "respuestaCorrecta": "52" },
    { "pregunta": "¿Quién era la reina de Persia antes que Ester?", "opciones": ["Jezabel", "Vasti", "Zeres", "Hadasa"], "respuestaCorrecta": "Vasti" },
    { "pregunta": "¿Cómo se llamaba el primo que crio a Ester?", "opciones": ["Amán", "Mardoqueo", "Esdras", "Nehemías"], "respuestaCorrecta": "Mardoqueo" },
    { "pregunta": "¿De dónde era Job?", "opciones": ["Babilonia", "Uz", "Canaán", "Egipto"], "respuestaCorrecta": "Uz" },
    { "pregunta": "¿Cómo se llamaban las hijas de Job al final de su prueba?", "opciones": ["Jemima, Cesia y Keren-hapuc", "Sara, Rebeca y Raquel", "Lea, Zilpa y Bilha", "Rut, Noemí y Orfa"], "respuestaCorrecta": "Jemima, Cesia y Keren-hapuc" },
    { "pregunta": "¿A quién se le atribuye la autoría del libro de Proverbios?", "opciones": ["David", "Asaf", "Salomón", "Ezequías"], "respuestaCorrecta": "Salomón" },
    { "pregunta": "Según Proverbios 1:7, ¿cuál es el principio de la sabiduría?", "opciones": ["La obediencia", "El temor de Jehová", "El conocimiento", "El amor"], "respuestaCorrecta": "El temor de Jehová" },
    { "pregunta": "¿A qué profeta le purificó los labios un serafín con un carbón encendido?", "opciones": ["Jeremías", "Ezequiel", "Daniel", "Isaías"], "respuestaCorrecta": "Isaías" },
    { "pregunta": "¿Qué profeta vio una visión de Dios con ruedas llenas de ojos?", "opciones": ["Daniel", "Zacarías", "Ezequiel", "Isaías"], "respuestaCorrecta": "Ezequiel" },
    { "pregunta": "¿Cómo se llamaban los tres amigos de Daniel?", "opciones": ["Misael, Ananías, Azarías", "Josué, Caleb, Otoniel", "Pedro, Jacobo, Juan", "Sadrac, Mesac, Abed-nego"], "respuestaCorrecta": "Sadrac, Mesac, Abed-nego" },
    { "pregunta": "¿Qué animal representaba a Grecia en la visión de Daniel?", "opciones": ["Un león", "Un oso", "Un leopardo", "Un macho cabrío"], "respuestaCorrecta": "Un macho cabrío" },
    { "pregunta": "¿A qué profeta se lo conoce como el predicador de la justicia social?", "opciones": ["Amós", "Oseas", "Jonás", "Habacuc"], "respuestaCorrecta": "Amós" },
    { "pregunta": "¿Qué libro profético es de un solo capítulo?", "opciones": ["Abdías", "Jonás", "Miqueas", "Nahúm"], "respuestaCorrecta": "Abdías" },
    { "pregunta": "¿En qué ciudad nació Juan el Bautista?", "opciones": ["Jerusalén", "Belén", "Región montañosa de Judea", "Nazaret"], "respuestaCorrecta": "Región montañosa de Judea" },
    { "pregunta": "¿Cómo se llamaba la madre de Juan el Bautista?", "opciones": ["María", "Ana", "Elisabet", "Marta"], "respuestaCorrecta": "Elisabet" },
    { "pregunta": "¿Quién era el César en Roma cuando nació Jesús?", "opciones": ["Augusto", "Tiberio", "Nerón", "Calígula"], "respuestaCorrecta": "Augusto" },
    { "pregunta": "¿A quién le prometió el Espíritu Santo que no moriría sin ver al Cristo?", "opciones": ["Zacarías", "Simeón", "José", "Juan"], "respuestaCorrecta": "Simeón" },
    { "pregunta": "¿Qué profetisa de 84 años habló del niño Jesús en el templo?", "opciones": ["Débora", "Ana", "Elisabet", "María"], "respuestaCorrecta": "Ana" },
    { "pregunta": "¿A dónde huyó José con María y Jesús para escapar de Herodes?", "opciones": ["A Siria", "A Babilonia", "A Egipto", "A Moab"], "respuestaCorrecta": "A Egipto" },
    { "pregunta": "¿En qué fiesta se quedó Jesús en el templo a los 12 años?", "opciones": ["Pentecostés", "La Pascua", "Los Tabernáculos", "Purim"], "respuestaCorrecta": "La Pascua" },
    { "pregunta": "¿Qué comía Juan el Bautista en el desierto?", "opciones": ["Maná y miel", "Pan y peces", "Langostas y miel silvestre", "Frutas y verduras"], "respuestaCorrecta": "Langostas y miel silvestre" },
    { "pregunta": "¿Qué forma tomó el Espíritu Santo al bajar sobre Jesús?", "opciones": ["De nube", "De fuego", "De paloma", "De viento"], "respuestaCorrecta": "De paloma" },
    { "pregunta": "¿A qué apóstol encontró Jesús sentado al banco de los tributos públicos?", "opciones": ["Pedro", "Mateo", "Juan", "Judas"], "respuestaCorrecta": "Mateo" },
    { "pregunta": "¿Quiénes eran conocidos como 'Hijos del trueno'?", "opciones": ["Pedro y Andrés", "Jacobo y Juan", "Felipe y Bartolomé", "Tomás y Mateo"], "respuestaCorrecta": "Jacobo y Juan" },
    { "pregunta": "¿Dónde hizo Jesús su primer milagro?", "opciones": ["Jerusalén", "Caná de Galilea", "Capernaúm", "Jericó"], "respuestaCorrecta": "Caná de Galilea" },
    { "pregunta": "¿A quién le dijo Jesús: 'Te haré pescador de hombres'?", "opciones": ["A Mateo", "A Juan", "A Pedro", "A Felipe"], "respuestaCorrecta": "A Pedro" },
    { "pregunta": "¿Qué milagro hizo Jesús en el estanque de Betesda?", "opciones": ["Sanó a un ciego", "Sanó a un paralítico que llevaba 38 años enfermo", "Resucitó a un niño", "Caminó sobre el agua"], "respuestaCorrecta": "Sanó a un paralítico que llevaba 38 años enfermo" },
    { "pregunta": "¿Cuántos cestos sobraron cuando Jesús alimentó a los 5000?", "opciones": ["7", "10", "12", "0"], "respuestaCorrecta": "12" },
    { "pregunta": "¿En qué monte se transfiguró Jesús?", "opciones": ["Sinaí", "Hermón", "Tabor", "Calvario"], "respuestaCorrecta": "Tabor" },
    { "pregunta": "¿A qué cobrador de impuestos de baja estatura llamó Jesús desde un árbol?", "opciones": ["Mateo", "Zaqueo", "Nicodemo", "Bartimeo"], "respuestaCorrecta": "Zaqueo" },
    { "pregunta": "¿Qué ungüento derramó María sobre los pies de Jesús?", "opciones": ["Nardo puro", "Mirra", "Incienso", "Aceite de oliva"], "respuestaCorrecta": "Nardo puro" },
    { "pregunta": "¿Qué discípulo criticó que se gastara dinero en perfume en lugar de darlo a los pobres?", "opciones": ["Tomás", "Pedro", "Judas Iscariote", "Felipe"], "respuestaCorrecta": "Judas Iscariote" },
    { "pregunta": "¿A quién prometió Jesús: 'Hoy estarás conmigo en el paraíso'?", "opciones": ["A Juan", "A su madre", "Al ladrón arrepentido", "Al centurión"], "respuestaCorrecta": "Al ladrón arrepentido" },
    { "pregunta": "¿Qué sucedió en el templo cuando Jesús murió?", "opciones": ["Se derrumbó", "El velo se rasgó en dos", "Se llenó de humo", "El altar se rompió"], "respuestaCorrecta": "El velo se rasgó en dos" },
    { "pregunta": "¿Quién era el padre de Santiago y Juan?", "opciones": ["Zebedeo", "Alfeo", "Jonás", "Zacarías"], "respuestaCorrecta": "Zebedeo" },
    { "pregunta": "¿De qué región era la mujer que le pidió a Jesús agua junto al pozo?", "opciones": ["Judea", "Galilea", "Samaria", "Decápolis"], "respuestaCorrecta": "Samaria" },
    { "pregunta": "¿Qué nombre significa 'Cráneo' o 'Calavera'?", "opciones": ["Gólgota", "Getsemaní", "Sión", "Betania"], "respuestaCorrecta": "Gólgota" },
    { "pregunta": "¿A quién le dijo Jesús: 'Apacienta mis ovejas' después de resucitar?", "opciones": ["Juan", "Tomás", "Pedro", "Jacobo"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Cuántos días estuvo Jesús en la tierra entre su resurrección y su ascensión?", "opciones": ["3", "7", "40", "50"], "respuestaCorrecta": "40" },
    { "pregunta": "¿Dónde debían esperar los discípulos la promesa del Espíritu Santo?", "opciones": ["Nazaret", "Belén", "Galilea", "Jerusalén"], "respuestaCorrecta": "Jerusalén" },
    { "pregunta": "¿Cuántas personas se convirtieron en Pentecostés tras el sermón de Pedro?", "opciones": ["1000", "3000", "5000", "120"], "respuestaCorrecta": "3000" },
    { "pregunta": "¿En qué puerta del templo Pedro y Juan sanaron a un cojo?", "opciones": ["La puerta de las ovejas", "La puerta Hermosa", "La puerta Dorada", "La puerta del Rey"], "respuestaCorrecta": "La puerta Hermosa" },
    { "pregunta": "¿Quién era el rabino que aconsejó al Sanedrín no matar a los apóstoles?", "opciones": ["Caifás", "Gamaliel", "Anás", "Nicodemo"], "respuestaCorrecta": "Gamaliel" },
    { "pregunta": "¿Cómo se llamaba el mago que quiso comprar el poder del Espíritu Santo?", "opciones": ["Elimas", "Simón", "Apolos", "Balaam"], "respuestaCorrecta": "Simón" },
    { "pregunta": "¿A quién le predicó Felipe en un carruaje en el desierto?", "opciones": ["A un centurión", "A un etíope eunuco", "A un procónsul", "A un fariseo"], "respuestaCorrecta": "A un etíope eunuco" },
    { "pregunta": "¿Qué discípulo fue resucitado por Pedro en Jope?", "opciones": ["Eutico", "Lázaro", "Dorcas (Tabita)", "Lidia"], "respuestaCorrecta": "Dorcas (Tabita)" },
    { "pregunta": "¿Cómo murió el apóstol Jacobo, hermano de Juan?", "opciones": ["Crucificado", "A espada por Herodes", "Apedreado", "En el exilio"], "respuestaCorrecta": "A espada por Herodes" },
    { "pregunta": "¿Quién liberó a Pedro de la cárcel en el libro de los Hechos?", "opciones": ["Un ángel", "Pablo", "Juan", "Un terremoto"], "respuestaCorrecta": "Un ángel" },
    { "pregunta": "¿Qué dios pensaban en Listra que era Bernabé?", "opciones": ["Mercurio", "Apolo", "Júpiter", "Zeus"], "respuestaCorrecta": "Júpiter" },
    { "pregunta": "¿Qué oficio tenían Priscila y Aquila?", "opciones": ["Pescadores", "Hacedores de tiendas", "Alfareros", "Herreros"], "respuestaCorrecta": "Hacedores de tiendas" },
    { "pregunta": "¿En qué ciudad predicó Pablo sobre 'El Dios no conocido'?", "opciones": ["Roma", "Corinto", "Atenas", "Éfeso"], "respuestaCorrecta": "Atenas" },
    { "pregunta": "¿Qué platero provocó un alboroto contra Pablo en Éfeso?", "opciones": ["Alejandro", "Demetrio", "Simón", "Diotrefes"], "respuestaCorrecta": "Demetrio" },
    { "pregunta": "¿Qué gobernador romano le dijo a Pablo: 'Por poco me persuades a ser cristiano'?", "opciones": ["Félix", "Festos", "Agripa", "Pilato"], "respuestaCorrecta": "Agripa" },
    { "pregunta": "¿A qué emperador apeló Pablo su caso para ser juzgado?", "opciones": ["César", "Herodes", "Tiberio", "Augusto"], "respuestaCorrecta": "César" },
    { "pregunta": "¿A qué animal sacudió Pablo de su mano en la isla de Malta?", "opciones": ["Un escorpión", "Una víbora", "Una araña", "Un murciélago"], "respuestaCorrecta": "Una víbora" },
    { "pregunta": "¿En qué epístola se encuentra el 'Salón de la fama de la fe'?", "opciones": ["Romanos", "Efesios", "Hebreos", "Santiago"], "respuestaCorrecta": "Hebreos" },
    { "pregunta": "¿Qué libro dice que 'Dios es amor'?", "opciones": ["1 Juan", "Apocalipsis", "Romanos", "Salmos"], "respuestaCorrecta": "1 Juan" },
    { "pregunta": "¿Qué epístola fue escrita a un dueño de esclavos?", "opciones": ["Tito", "Gálatas", "Filemón", "Colosenses"], "respuestaCorrecta": "Filemón" },
    { "pregunta": "¿En qué libro advierte Pablo sobre el anticristo y el 'hombre de pecado'?", "opciones": ["Romanos", "2 Tesalonicenses", "1 Corintios", "Apocalipsis"], "respuestaCorrecta": "2 Tesalonicenses" },
    { "pregunta": "¿Qué es 'la certeza de lo que se espera, la convicción de lo que no se ve'?", "opciones": ["La esperanza", "El amor", "La fe", "La paz"], "respuestaCorrecta": "La fe" },
    { "pregunta": "¿Qué escritor bíblico llama a los cristianos 'real sacerdocio, nación santa'?", "opciones": ["Pablo", "Pedro", "Juan", "Santiago"], "respuestaCorrecta": "Pedro" },
    { "pregunta": "¿Qué libro del Nuevo Testamento trata exclusivamente de visiones del fin de los tiempos?", "opciones": ["Hechos", "Hebreos", "Judas", "Apocalipsis"], "respuestaCorrecta": "Apocalipsis" },
    { "pregunta": "¿Cuántos ancianos vio Juan sentados alrededor del trono de Dios?", "opciones": ["12", "144", "24", "7"], "respuestaCorrecta": "24" },
    { "pregunta": "¿Qué representan los siete candeleros de oro en Apocalipsis?", "opciones": ["Los siete espíritus", "Las siete iglesias", "Los siete ángeles", "Las siete trompetas"], "respuestaCorrecta": "Las siete iglesias" },
    { "pregunta": "¿Qué ciudad es mencionada primero en las cartas de Apocalipsis?", "opciones": ["Esmirna", "Pergamo", "Éfeso", "Laodicea"], "respuestaCorrecta": "Éfeso" },
    { "pregunta": "¿A qué iglesia le dijo el Señor que era 'tibia'?", "opciones": ["Tiatira", "Filadelfia", "Laodicea", "Sardis"], "respuestaCorrecta": "Laodicea" },
    { "pregunta": "¿Qué número es la marca de la bestia?", "opciones": ["777", "144", "666", "1000"], "respuestaCorrecta": "666" },
    { "pregunta": "¿Cómo será el cielo y la tierra nueva según Apocalipsis 21?", "opciones": ["Como el Edén", "De oro puro", "No habrá mar", "Volverá el sol"], "respuestaCorrecta": "No habrá mar" },
    { "pregunta": "¿Quién es el autor del último libro de la Biblia?", "opciones": ["Pablo", "Jesús", "Juan", "Pedro"], "respuestaCorrecta": "Juan" },
    { "pregunta": "¿Qué forma tiene la Nueva Jerusalén?", "opciones": ["Esférica", "Pirámide", "Cuadrangular", "Cilíndrica"], "respuestaCorrecta": "Cuadrangular" },
    { "pregunta": "¿Con qué material están hechas las calles de la Nueva Jerusalén?", "opciones": ["Plata", "Mármol", "Diamantes", "Oro puro como cristal transparente"], "respuestaCorrecta": "Oro puro como cristal transparente" },
    { "pregunta": "¿De quién es la espada que usó David para decapitar a Goliat?", "opciones": ["De Jonatán", "De Saúl", "Del mismo Goliat", "No tenía espada"], "respuestaCorrecta": "Del mismo Goliat" },
    { "pregunta": "¿Cómo se llamaba el pozo donde Jesús sanó al ciego de nacimiento?", "opciones": ["Betesda", "Siloé", "Jacob", "Jordán"], "respuestaCorrecta": "Siloé" },
    { "pregunta": "¿Qué ave cantó cuando Pedro negó a Jesús?", "opciones": ["Un cuervo", "Una paloma", "Un gallo", "Un ruiseñor"], "respuestaCorrecta": "Un gallo" },
    { "pregunta": "¿Qué rey mandó construir la estatua de oro de 60 codos?", "opciones": ["Belsasar", "Darío", "Nabucodonosor", "Ciro"], "respuestaCorrecta": "Nabucodonosor" },
    { "pregunta": "¿Quién subió al monte Sinaí con Moisés a recibir las tablas?", "opciones": ["Aarón", "Josué", "Hur", "Nadie, subió solo"], "respuestaCorrecta": "Nadie, subió solo" },
    { "pregunta": "¿Qué animal proveyó una moneda para que Pedro pagara el impuesto?", "opciones": ["Un pez", "Un cordero", "Una paloma", "Un asno"], "respuestaCorrecta": "Un pez" },
    { "pregunta": "¿Qué libro de la Biblia termina con un signo de interrogación?", "opciones": ["Amós", "Jonás", "Sofonías", "Malaquías"], "respuestaCorrecta": "Jonás" },
    { "pregunta": "¿Qué reina malvada fue arrojada por una ventana y devorada por perros?", "opciones": ["Atalía", "Jezabel", "Vasti", "Zeres"], "respuestaCorrecta": "Jezabel" },
    { "pregunta": "¿En qué día de la creación hizo Dios las aves y los peces?", "opciones": ["Tercero", "Cuarto", "Quinto", "Sexto"], "respuestaCorrecta": "Quinto" },
    { "pregunta": "¿Cómo se llamaba la suegra de Pedro?", "opciones": ["Marta", "No se menciona su nombre", "Ana", "María"], "respuestaCorrecta": "No se menciona su nombre" },
    { "pregunta": "¿Quién era el recaudador de impuestos que se volvió apóstol?", "opciones": ["Lucas", "Marcos", "Mateo", "Juan"], "respuestaCorrecta": "Mateo" },
    { "pregunta": "¿Qué rey de Israel tenía 700 esposas y 300 concubinas?", "opciones": ["David", "Roboam", "Salomón", "Acab"], "respuestaCorrecta": "Salomón" },
    { "pregunta": "¿Qué instrumento musical se menciona con más frecuencia en los Salmos?", "opciones": ["Flauta", "Trompeta", "Arpa", "Pandero"], "respuestaCorrecta": "Arpa" },
    { "pregunta": "¿Quién interpretó el sueño de la estatua hecha de distintos metales?", "opciones": ["José", "Isaías", "Daniel", "Ezequiel"], "respuestaCorrecta": "Daniel" },
    { "pregunta": "¿A qué apóstol se le conoce como el 'Dídimo'?", "opciones": ["Felipe", "Tomás", "Bartolomé", "Judas"], "respuestaCorrecta": "Tomás" },
    { "pregunta": "¿Qué fruta trajeron los espías del valle de Escol?", "opciones": ["Higos", "Granadas", "Un racimo de uvas", "Dátiles"], "respuestaCorrecta": "Un racimo de uvas" },
    { "pregunta": "¿Qué profeta fue escondido en una cisterna lodosa?", "opciones": ["Jeremías", "Daniel", "Isaías", "Miqueas"], "respuestaCorrecta": "Jeremías" },
    { "pregunta": "¿A qué ciudad iban los dos discípulos el día que Jesús resucitó?", "opciones": ["Jericó", "Betania", "Emaús", "Nazaret"], "respuestaCorrecta": "Emaús" },
    { "pregunta": "¿Qué rey mandó arrojar a Daniel al foso de los leones?", "opciones": ["Ciro", "Darío", "Belsasar", "Nabucodonosor"], "respuestaCorrecta": "Darío" },
    { "pregunta": "¿Quién era el sumo sacerdote en el tiempo de Elí que cayó de su silla y murió?", "opciones": ["Elí", "Aarón", "Zadok", "Finees"], "respuestaCorrecta": "Elí" },
    { "pregunta": "¿A qué mujer engañó la serpiente en el Edén?", "opciones": ["Sara", "Raquel", "Eva", "Agar"], "respuestaCorrecta": "Eva" },
    { "pregunta": "¿Cuál era la señal del pacto de Dios con Abraham?", "opciones": ["El arco iris", "La circuncisión", "El sábado", "Los diez mandamientos"], "respuestaCorrecta": "La circuncisión" },
    { "pregunta": "¿Qué madera usó Noé para hacer el arca?", "opciones": ["Cedro", "Acacia", "Gofer", "Roble"], "respuestaCorrecta": "Gofer" },
    { "pregunta": "¿A quién le dijo Dios: 'Ciertamente serás bendición'?", "opciones": ["Isaac", "Abraham", "Jacob", "Moisés"], "respuestaCorrecta": "Abraham" },
    { "pregunta": "¿Qué metal no se encontraba en la estatua que soñó Nabucodonosor?", "opciones": ["Oro", "Plata", "Bronce", "Cobre"], "respuestaCorrecta": "Cobre" },
    { "pregunta": "¿Qué animal alimentaba a Elías cerca del arroyo Querit?", "opciones": ["Palomas", "Cuervos", "Águilas", "Perros"], "respuestaCorrecta": "Cuervos" },
    { "pregunta": "¿Cuál fue la primera plaga que afectó a Egipto?", "opciones": ["Las ranas", "El río se convierte en sangre", "Los piojos", "La oscuridad"], "respuestaCorrecta": "El río se convierte en sangre" },
    { "pregunta": "¿A qué profeta le dijo Dios que se casara con una mujer infiel?", "opciones": ["Oseas", "Amós", "Jonás", "Miqueas"], "respuestaCorrecta": "Oseas" },
    { "pregunta": "¿Quién fue la madre de Salomón?", "opciones": ["Mical", "Abigail", "Betsabé", "María"], "respuestaCorrecta": "Betsabé" },
    { "pregunta": "¿A quién se le devolvió el doble de todo lo que había perdido?", "opciones": ["David", "Job", "José", "Abraham"], "respuestaCorrecta": "Job" },
    { "pregunta": "¿Quién era el general sirio curado de lepra?", "opciones": ["Ben-adad", "Senaquerib", "Naamán", "Hazael"], "respuestaCorrecta": "Naamán" },
    { "pregunta": "¿Qué apóstol era fabricante de tiendas de campaña?", "opciones": ["Pedro", "Juan", "Pablo", "Santiago"], "respuestaCorrecta": "Pablo" },
    { "pregunta": "¿Qué mujer fue levantada de entre los muertos por Pedro?", "opciones": ["Lidia", "María", "Dorcas", "Priscila"], "respuestaCorrecta": "Dorcas" },
    { "pregunta": "¿Cómo se llamaba el siervo del sumo sacerdote al que Pedro le cortó la oreja?", "opciones": ["Caifás", "Malco", "Ananías", "Barrabás"], "respuestaCorrecta": "Malco" },
    { "pregunta": "¿A quién llamó Jesús 'generación de víboras'?", "opciones": ["A los publicanos", "A los fariseos y saduceos", "A los romanos", "A sus discípulos"], "respuestaCorrecta": "A los fariseos y saduceos" },
    { "pregunta": "¿Qué profeta hizo flotar un hacha de hierro en el agua?", "opciones": ["Elías", "Eliseo", "Ezequiel", "Jeremías"], "respuestaCorrecta": "Eliseo" },
    { "pregunta": "¿En qué fiesta se derramó el Espíritu Santo sobre los discípulos?", "opciones": ["La Pascua", "El Día de la Expiación", "Pentecostés", "Los Tabernáculos"], "respuestaCorrecta": "Pentecostés" },
    { "pregunta": "¿Quién reemplazó a Judas Iscariote como apóstol?", "opciones": ["Pablo", "Silas", "Bernabé", "Matías"], "respuestaCorrecta": "Matías" },
    { "pregunta": "¿A quién entregó Jesús al cuidado de su madre antes de morir?", "opciones": ["A Pedro", "A Juan", "A Santiago", "A Mateo"], "respuestaCorrecta": "A Juan" },
    { "pregunta": "¿Qué emperador romano desterró a Juan a la isla de Patmos?", "opciones": ["Domiciano", "Nerón", "Augusto", "Julio César"], "respuestaCorrecta": "Domiciano" },
    { "pregunta": "¿Qué significa la palabra 'Gólgota'?", "opciones": ["Lugar de la calavera", "Lugar de llanto", "Monte alto", "Ciudad de paz"], "respuestaCorrecta": "Lugar de la calavera" },
    { "pregunta": "¿A quién reconoció Jesús al decir: 'He aquí un verdadero israelita en quien no hay engaño'?", "opciones": ["A Natanael", "A Pedro", "A Andrés", "A Tomás"], "respuestaCorrecta": "A Natanael" },
    { "pregunta": "¿Cuántos libros tiene el Nuevo Testamento?", "opciones": ["27", "39", "66", "24"], "respuestaCorrecta": "27" },
    { "pregunta": "¿En qué ciudad fueron llamados cristianos por primera vez los discípulos?", "opciones": ["Jerusalén", "Roma", "Éfeso", "Antioquía"], "respuestaCorrecta": "Antioquía" },
    { "pregunta": "¿Qué rey mandó construir el gran templo de Jerusalén?", "opciones": ["David", "Saúl", "Salomón", "Ezequías"], "respuestaCorrecta": "Salomón" },
    { "pregunta": "¿Quién interpretó los sueños del jefe de los coperos y el panadero?", "opciones": ["Daniel", "José", "Moisés", "Jacob"], "respuestaCorrecta": "José" },
    { "pregunta": "¿Cuál era la tribu encargada del sacerdocio en Israel?", "opciones": ["Judá", "Leví", "Benjamín", "Efraín"], "respuestaCorrecta": "Leví" },
    { "pregunta": "¿Qué libro bíblico narra la historia de los inicios de la iglesia primitiva?", "opciones": ["Evangelio de Juan", "Romanos", "Hechos de los Apóstoles", "Gálatas"], "respuestaCorrecta": "Hechos de los Apóstoles" },
    { "pregunta": "¿Quién tuvo la visión del valle de los huesos secos?", "opciones": ["Ezequiel", "Jeremías", "Daniel", "Oseas"], "respuestaCorrecta": "Ezequiel" },
    { "pregunta": "¿A qué apóstol reprendió Pablo cara a cara en Antioquía?", "opciones": ["A Juan", "A Santiago", "A Pedro", "A Bernabé"], "respuestaCorrecta": "A Pedro" },
    { "pregunta": "¿En la armadura de Dios (Efesios 6), ¿qué representa el yelmo (casco)?", "opciones": ["La fe", "La verdad", "La salvación", "El Espíritu"], "respuestaCorrecta": "La salvación" },
    { "pregunta": "¿Qué fruta comieron Adán y Eva?", "opciones": ["Una manzana", "Un higo", "El fruto del árbol del conocimiento", "Una uva"], "respuestaCorrecta": "El fruto del árbol del conocimiento" },
    { "pregunta": "¿Cómo se llamaba el suegro de Moisés, sacerdote de Madián?", "opciones": ["Labán", "Jetro", "Balaam", "Mardoqueo"], "respuestaCorrecta": "Jetro" },
    { "pregunta": "¿Qué río se abrió para que los israelitas entraran a la Tierra Prometida?", "opciones": ["El Nilo", "El Éufrates", "El Tigris", "El Jordán"], "respuestaCorrecta": "El Jordán" },
    { "pregunta": "¿Qué mujer ayudó a los espías israelitas en Jericó?", "opciones": ["Rut", "Rahab", "Débora", "Ester"], "respuestaCorrecta": "Rahab" },
    { "pregunta": "¿Quién era el gigante filisteo que David venció?", "opciones": ["Goliat", "Og", "Anac", "Sif"], "respuestaCorrecta": "Goliat" },
    { "pregunta": "¿Cuál fue el profeta que fue llevado al cielo en un torbellino?", "opciones": ["Eliseo", "Moisés", "Elías", "Enoc"], "respuestaCorrecta": "Elías" },
    { "pregunta": "¿Cómo se llama el primer mártir de la iglesia cristiana?", "opciones": ["Santiago", "Esteban", "Pedro", "Pablo"], "respuestaCorrecta": "Esteban" },
    { "pregunta": "¿A quién le dijo Jesús: 'Yo soy la resurrección y la vida'?", "opciones": ["A Marta", "A María", "A Lázaro", "A Pedro"], "respuestaCorrecta": "A Marta" },
    { "pregunta": "¿Qué hombre vivió más años según el registro bíblico?", "opciones": ["Noé", "Matusalén", "Adán", "Enoc"], "respuestaCorrecta": "Matusalén" },
    { "pregunta": "¿Quién era el gobernador romano durante el juicio de Jesús?", "opciones": ["Herodes Antipas", "Poncio Pilato", "Félix", "Festo"], "respuestaCorrecta": "Poncio Pilato" },
    { "pregunta": "¿Qué joven pastor ungido rey tocaba el arpa para Saúl?", "opciones": ["Salomón", "Jonatán", "David", "Absalón"], "respuestaCorrecta": "David" },
    { "pregunta": "¿Qué ciudad es conocida como la Ciudad de David?", "opciones": ["Hebrón", "Belén", "Jerusalén", "Jericó"], "respuestaCorrecta": "Jerusalén" },
    { "pregunta": "¿Quién era el sumo sacerdote que crió a Samuel?", "opciones": ["Aarón", "Elí", "Sadoc", "Finees"], "respuestaCorrecta": "Elí" },
    { "pregunta": "¿A qué rey le prolongó Dios la vida quince años?", "opciones": ["Josías", "Ezequías", "Salomón", "David"], "respuestaCorrecta": "Ezequías" },
    { "pregunta": "¿Qué profeta huyó en barco hacia Tarsis?", "opciones": ["Nahúm", "Jonás", "Miqueas", "Amós"], "respuestaCorrecta": "Jonás" },
    { "pregunta": "¿En qué fiesta de los judíos Jesús instituyó la Cena del Señor?", "opciones": ["Pentecostés", "Purim", "La Pascua", "Los Tabernáculos"], "respuestaCorrecta": "La Pascua" },
    { "pregunta": "¿De dónde eran expulsados los mercaderes por Jesús?", "opciones": ["Del palacio", "De la sinagoga", "Del Templo", "Del mercado"], "respuestaCorrecta": "Del Templo" },
    { "pregunta": "¿Cuántos hombres conformaban el grupo íntimo de apóstoles de Jesús?", "opciones": ["7", "10", "12", "70"], "respuestaCorrecta": "12" },
    { "pregunta": "¿Quién escribió el libro de los Romanos?", "opciones": ["Pedro", "Santiago", "Juan", "Pablo"], "respuestaCorrecta": "Pablo" },
    { "pregunta": "¿Quién fue el compañero de Pablo en su primer viaje misionero?", "opciones": ["Timoteo", "Silas", "Lucas", "Bernabé"], "respuestaCorrecta": "Bernabé" },
    { "pregunta": "¿Cómo se llamaba la mujer que lavó los pies de Jesús con sus lágrimas?", "opciones": ["María Magdalena", "Una mujer pecadora", "Marta", "María, hermana de Lázaro"], "respuestaCorrecta": "Una mujer pecadora" },
    { "pregunta": "¿A quién pidió Salomón ayuda material para edificar el Templo?", "opciones": ["A Hiram, rey de Tiro", "A Faraón", "Al rey de Babilonia", "A la reina de Sabá"], "respuestaCorrecta": "A Hiram, rey de Tiro" },
    { "pregunta": "¿Quién vio una zarza ardiendo que no se consumía?", "opciones": ["Abraham", "Josué", "Moisés", "Gedeón"], "respuestaCorrecta": "Moisés" },
    { "pregunta": "¿A quién le cambió Dios el nombre por 'Israel'?", "opciones": ["Abraham", "Jacob", "Isaac", "José"], "respuestaCorrecta": "Jacob" },
    { "pregunta": "¿Cuál de las siguientes mujeres fue juez en Israel?", "opciones": ["Jael", "Débora", "Rut", "Ester"], "respuestaCorrecta": "Débora" },
    { "pregunta": "¿Quién era el apóstol que inicialmente perseguía a la Iglesia?", "opciones": ["Pedro", "Saulo (Pablo)", "Mateo", "Tomás"], "respuestaCorrecta": "Saulo (Pablo)" },
    { "pregunta": "¿Qué animal se utilizó para tentar a Jesús en el desierto? (Pregunta trampa)", "opciones": ["Una serpiente", "Un león", "Un escorpión", "Ningún animal"], "respuestaCorrecta": "Ningún animal" },
    { "pregunta": "¿Qué instrumento tocaron los israelitas cuando cayeron los muros de Jericó?", "opciones": ["Trompetas de cuerno de carnero", "Arpas", "Tambores", "Flautas"], "respuestaCorrecta": "Trompetas de cuerno de carnero" },
    { "pregunta": "¿Quién vendió su primogenitura por un plato de lentejas?", "opciones": ["Jacob", "Ismael", "Esaú", "Rubén"], "respuestaCorrecta": "Esaú" },
    { "pregunta": "¿Qué profeta curó las aguas de Jericó con sal?", "opciones": ["Elías", "Eliseo", "Jeremías", "Isaías"], "respuestaCorrecta": "Eliseo" },
    { "pregunta": "¿Cuántos días de ayuno hizo Jesús en el desierto?", "opciones": ["30", "40", "12", "7"], "respuestaCorrecta": "40" },
    { "pregunta": "¿Qué oficio tenía David antes de matar a Goliat?", "opciones": ["Soldado", "Carpintero", "Pastor de ovejas", "Armero"], "respuestaCorrecta": "Pastor de ovejas" },
    { "pregunta": "¿A qué apóstol se le rebeló un gran lienzo que bajaba del cielo con animales impuros?", "opciones": ["A Pablo", "A Juan", "A Pedro", "A Jacobo"], "respuestaCorrecta": "A Pedro" },
    { "pregunta": "¿Cómo se llamaba la esposa del profeta Oseas?", "opciones": ["Gomer", "Rahab", "María", "Lea"], "respuestaCorrecta": "Gomer" },
    { "pregunta": "¿Qué enfermedad padeció el rey Uzías hasta el día de su muerte?", "opciones": ["Ceguera", "Parálisis", "Lepra", "Sordera"], "respuestaCorrecta": "Lepra" },
    { "pregunta": "¿Quién mandó cortar la cabeza a Juan el Bautista?", "opciones": ["Herodes Antipas", "Herodes el Grande", "Pilato", "César"], "respuestaCorrecta": "Herodes Antipas" },
    { "pregunta": "¿A quién le apareció un ángel mientras desgranaba trigo en el lagar?", "opciones": ["Sansón", "Gedeón", "Otoniel", "Jefté"], "respuestaCorrecta": "Gedeón" },
    { "pregunta": "¿De qué color era el caballo que representa la Muerte en Apocalipsis?", "opciones": ["Blanco", "Negro", "Amarillo (Pálido)", "Rojo"], "respuestaCorrecta": "Amarillo (Pálido)" },
    { "pregunta": "¿Cuántos capítulos tiene el libro de Proverbios?", "opciones": ["30", "31", "32", "29"], "respuestaCorrecta": "31" },
    { "pregunta": "¿En qué río se ordenó bañar a Naamán para curarse de lepra?", "opciones": ["Nilo", "Jordán", "Éufrates", "Tigris"], "respuestaCorrecta": "Jordán" },
    { "pregunta": "¿Quién es el autor de los libros 1 y 2 de Crónicas, según la tradición?", "opciones": ["Nehemías", "Samuel", "Esdras", "David"], "respuestaCorrecta": "Esdras" },
    { "pregunta": "¿A qué edad fue circuncidado Abraham?", "opciones": ["A los 99 años", "A los 8 días", "A los 50 años", "A los 100 años"], "respuestaCorrecta": "A los 99 años" },
    { "pregunta": "¿Qué comida pidieron los israelitas en el desierto cuando se cansaron del maná?", "opciones": ["Carne", "Pescado", "Fruta", "Pan"], "respuestaCorrecta": "Carne" },
    { "pregunta": "¿Cómo se llamaba el ciego que gritó a Jesús: '¡Hijo de David, ten misericordia de mí!'?", "opciones": ["Bartimeo", "Zaqueo", "Jairo", "Lázaro"], "respuestaCorrecta": "Bartimeo" },
    { "pregunta": "¿Qué joven cayó del tercer piso por quedarse dormido mientras Pablo predicaba?", "opciones": ["Timoteo", "Tito", "Eutico", "Filemón"], "respuestaCorrecta": "Eutico" },
    { "pregunta": "¿Cuántas vírgenes prudentes había en la parábola de Jesús?", "opciones": ["3", "5", "7", "10"], "respuestaCorrecta": "5" },
    { "pregunta": "¿En la parábola del sembrador, ¿qué representaba la semilla?", "opciones": ["La fe", "La Palabra de Dios", "Las buenas obras", "La gracia"], "respuestaCorrecta": "La Palabra de Dios" },
    { "pregunta": "¿Qué instrumento tocó Miriam después de cruzar el Mar Rojo?", "opciones": ["Un arpa", "Una flauta", "Un pandero", "Una trompeta"], "respuestaCorrecta": "Un pandero" },
    { "pregunta": "¿En qué región de Israel estaba ubicada Nazaret?", "opciones": ["Judea", "Samaria", "Decápolis", "Galilea"], "respuestaCorrecta": "Galilea" },
    { "pregunta": "¿Qué reina hizo preguntas difíciles a Salomón para probar su sabiduría?", "opciones": ["Reina de Sabá", "Reina de Persia", "Reina de Egipto", "Reina de Babilonia"], "respuestaCorrecta": "Reina de Sabá" },
    { "pregunta": "¿Qué libro de la Biblia describe detalladamente el arca del pacto y el tabernáculo?", "opciones": ["Génesis", "Deuteronomio", "Éxodo", "Levítico"], "respuestaCorrecta": "Éxodo" },
    { "pregunta": "¿A qué animal comparó Jesús a Herodes?", "opciones": ["A un lobo", "A un zorro (zorra)", "A una serpiente", "A un perro"], "respuestaCorrecta": "A un zorro (zorra)" },
    { "pregunta": "¿Quién era el hijo de Rut que fue abuelo del Rey David?", "opciones": ["Booz", "Obed", "Isaí", "Salomón"], "respuestaCorrecta": "Obed" },
    { "pregunta": "¿En qué libro leemos la frase: 'El amor es paciente, es bondadoso...'?", "opciones": ["Gálatas", "Romanos", "1 Corintios", "Efesios"], "respuestaCorrecta": "1 Corintios" },
    { "pregunta": "¿Quién oró pidiendo que Dios le ensanchara su territorio y lo librara del mal?", "opciones": ["Jabes", "Josué", "Caleb", "David"], "respuestaCorrecta": "Jabes" },
    { "pregunta": "¿Cómo se llamaban las hermanas de Lázaro?", "opciones": ["Rut y Noemí", "María y Marta", "Priscila y Lidia", "Sara y Rebeca"], "respuestaCorrecta": "María y Marta" },
    { "pregunta": "¿A qué árbol maldijo Jesús por no tener fruto?", "opciones": ["A un olivo", "A un manzano", "A una higuera", "A una vid"], "respuestaCorrecta": "A una higuera" },
    { "pregunta": "¿Cuál es la última palabra del Antiguo Testamento (en la RVR1960)?", "opciones": ["Maldición", "Bendición", "Amén", "Jehová"], "respuestaCorrecta": "Maldición" },
    { "pregunta": "¿Qué profeta lloró desconsoladamente por la destrucción de Jerusalén?", "opciones": ["Ezequiel", "Jeremías", "Isaías", "Daniel"], "respuestaCorrecta": "Jeremías" },
    { "pregunta": "¿Cuántos cuernos tenía la bestia que salía del mar en Apocalipsis 13?", "opciones": ["7", "10", "12", "4"], "respuestaCorrecta": "10" }
];

export default function ModuloTrivia({ currentUser, db, onVolver }) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntosSesion, setPuntosSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [preguntasMezcladas, setPreguntasMezcladas] = useState([]);
  const [estadoRespuesta, setEstadoRespuesta] = useState(null);
  
  const [efectoCasino, setEfectoCasino] = useState(false);
  const [modoVoz, setModoVoz] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [textoEscuchado, setTextoEscuchado] = useState("");

  const [mostrarModalSinVidas, setMostrarModalSinVidas] = useState(false);
  const [comprandoCorazones, setComprandoCorazones] = useState(false);

  // LECTURA EN TIEMPO REAL
  const [corazonesEnVivo, setCorazonesEnVivo] = useState(currentUser?.corazones ?? 10);
  const [diamantesEnVivo, setDiamantesEnVivo] = useState(currentUser?.diamantes ?? 0);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const userRef = doc(db, 'cym_usuarios', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCorazonesEnVivo(data.corazones ?? 10);
        setDiamantesEnVivo(data.diamantes ?? 0);
      }
    });
    return () => unsubscribe();
  }, [currentUser, db]);

  const recognitionRef = useRef(null);
  const procesarVozRef = useRef(null);
  
  const LETRAS = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (corazonesEnVivo <= 0 && !juegoTerminado) {
      setMostrarModalSinVidas(true);
    }
  }, [corazonesEnVivo, juegoTerminado]);

  const normalizar = (txt) => txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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
    } catch (e) { }
  };

  const validarRespuestaPorVoz = (textoHablado) => {
    setTextoEscuchado(textoHablado);
    
    const preguntaObj = preguntasMezcladas[preguntaActual];
    if (!preguntaObj) return;

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

  procesarVozRef.current = validarRespuestaPorVoz;

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
        if (procesarVozRef.current) procesarVozRef.current(respuestaHablada);
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
    if (modoVoz && preguntasMezcladas.length > 0 && !juegoTerminado && !estadoRespuesta && !mostrarModalSinVidas) {
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
  }, [preguntaActual, modoVoz, juegoTerminado, preguntasMezcladas, mostrarModalSinVidas]);

  const iniciarEscucha = () => {
    if (recognitionRef.current && !escuchando) {
      try { 
        setTextoEscuchado("");
        recognitionRef.current.start(); 
        setEscuchando(true);
      } catch (e) {}
    }
  };

  // NUEVA FUNCIÓN: COMPRAR 10 CORAZONES EXCLUSIVAMENTE CON 10 DIAMANTES 💎
  const handleComprarCorazonesConDiamantes = async () => {
    if (diamantesEnVivo < 10) {
      alert("⚠️ No tenés suficientes Diamantes. Podés adquirir paquetes en la Tienda.");
      onVolver(); // Lo lleva a la tienda
      return;
    }

    setComprandoCorazones(true);
    try {
      const userRef = doc(db, 'cym_usuarios', currentUser.uid);
      await updateDoc(userRef, {
        diamantes: diamantesEnVivo - 10,
        corazones: corazonesEnVivo + 10
      });
      alert("💎 ¡Recarga exitosa! Se descontaron 10 Diamantes y sumaste 10 Corazones.");
      setMostrarModalSinVidas(false);
    } catch (err) {
      alert("Error al procesar el canje de Diamantes.");
    } finally {
      setComprandoCorazones(false);
    }
  };

  const manejarRespuesta = async (opcionSeleccionada, vieneDeVoz = false) => {
    if (corazonesEnVivo <= 0) {
      setMostrarModalSinVidas(true);
      return;
    }

    if (estadoRespuesta || mostrarModalSinVidas) return; 

    const preguntaObj = preguntasMezcladas[preguntaActual];
    const esCorrecta = opcionSeleccionada === preguntaObj.respuestaCorrecta;
    
    setEstadoRespuesta({ seleccion: opcionSeleccionada, correcta: preguntaObj.respuestaCorrecta });
    reproducirSonido(esCorrecta ? 'correcto' : 'incorrecto');

    if (esCorrecta) {
      setEfectoCasino(true);
      setPuntosSesion(prev => prev + 10);
      if (currentUser && db) {
        const puntosTotales = (currentUser.puntosTrivia || 0) + 10;
        updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { 
          puntosTrivia: puntosTotales 
        }).catch(() => {});
      }
    } else {
      const nuevosCorazones = Math.max(0, corazonesEnVivo - 1);
      if (currentUser && db) {
        updateDoc(doc(db, 'cym_usuarios', currentUser.uid), { 
          corazones: nuevosCorazones 
        }).catch(() => {});
      }
    }

    if (modoVoz || vieneDeVoz) {
      const mensajeFinal = esCorrecta ? "¡Correcto! Sumaste diez puntos." : `Incorrecto. La respuesta era ${preguntaObj.respuestaCorrecta}.`;
      hablarTexto(mensajeFinal);
    }

    setTimeout(() => {
      setEfectoCasino(false); 
      if (!esCorrecta && corazonesEnVivo - 1 <= 0) {
        setMostrarModalSinVidas(true);
      } else if (preguntaActual + 1 < preguntasMezcladas.length) {
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
        
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER CON CORAZONES Y PUNTOS */}
        <div className="w-full flex justify-between items-center mb-6 relative z-10">
          <button onClick={onVolver} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md shadow-md transition-colors">
            <ChevronLeft size={24} />
          </button>

          {/* MARCADOR DE CORAZONES */}
          <div className="bg-black/60 border border-red-500/40 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg">
            <Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />
            <span className="text-white font-black text-sm">{corazonesEnVivo} / 10</span>
          </div>

          <div className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-6 py-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-2 transition-all ${efectoCasino ? 'animacion-jackpot border-2 border-white' : ''}`}>
            {efectoCasino ? <Sparkles size={18} className="fill-white" /> : <Star size={18} className="fill-black" />} 
            <span className={efectoCasino ? 'text-xl' : ''}>{puntosSesion} Pts</span>
          </div>
        </div>

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

        {textoEscuchado && (
          <div className="absolute top-[180px] left-1/2 transform -translate-x-1/2 bg-black/80 text-yellow-400 px-6 py-2 rounded-xl text-sm md:text-base font-black border border-yellow-500/50 z-50 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            🗣️ Escuché: "{textoEscuchado}"
          </div>
        )}

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

        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center mt-6">
          <div className={`absolute -top-6 text-white font-black text-xl w-14 h-14 flex items-center justify-center rounded-full border-4 shadow-xl z-20 transition-colors ${efectoCasino ? 'bg-yellow-500 border-yellow-200' : 'bg-purple-600 border-indigo-900'}`}>
            {preguntaActual + 1}
          </div>

          <div className={`w-full backdrop-blur-xl border p-8 pt-12 md:p-12 md:pt-14 rounded-[30px] text-center shadow-2xl mb-8 transition-colors ${efectoCasino ? 'bg-white/30 border-white/50' : 'bg-white/10 border-white/20'}`}>
            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
              {pregunta.pregunta}
            </h3>
          </div>
          
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {pregunta.opciones.map((opcion, index) => {
              const esSeleccionada = estadoRespuesta && estadoRespuesta.seleccion === opcion;
              const esCorrecta = estadoRespuesta && estadoRespuesta.correcta === opcion;
              
              let colorBoton = "bg-indigo-900/60 border-indigo-500/50 text-white hover:bg-indigo-700/80";
              let colorLetra = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black";
              let icono = null;

              if (estadoRespuesta) {
                if (esCorrecta) {
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

      {/* MODAL EMERGENTE DE CANJE CON DIAMANTES CUANDO LLEGA A 0 CORAZONES */}
      {mostrarModalSinVidas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#141414] border-2 border-red-500/50 p-6 md:p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <Heart size={44} className="text-red-500" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">¡Te quedaste sin corazones!</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Tus 10 corazones diarios se restauran gratis a las 00:00 hs, o podés recargarlos usando tus Diamantes.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
              <p className="text-xs font-bold uppercase text-amber-400">¿Querés seguir jugando ahora?</p>
              <p className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-2">
                10 💎 <span className="text-xs font-normal text-slate-400">/ 10 Corazones Extra</span>
              </p>
              <p className="text-[10px] text-slate-400">Saldo actual: {diamantesEnVivo} 💎</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComprarCorazonesConDiamantes}
                disabled={comprandoCorazones}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
              >
                {comprandoCorazones ? <Loader2 className="animate-spin" size={18} /> : <Gem size={18} />}
                {diamantesEnVivo >= 10 ? "Canjear 10 Diamantes por 10 Corazones" : "Ir a la Tienda de Diamantes"}
              </button>

              <button
                onClick={onVolver}
                className="w-full bg-white/10 hover:bg-white/15 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider"
              >
                Volver al Menú Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}