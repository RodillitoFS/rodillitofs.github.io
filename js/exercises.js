/**
 * Catálogo de ejercicios — Rodillito FS
 * Edita este archivo para añadir / modificar ejercicios.
 *
 * animation.key: clave del motor de animación (ver animations.js)
 */
const CATEGORIES = [
  { id: "calentamiento", label: "Calentamiento" },
  { id: "juego_activacion", label: "Juego activación" },
  { id: "tecnica", label: "Técnica" },
  { id: "superioridades", label: "Superioridades" },
  { id: "finalizacion", label: "Finalización" },
  { id: "juego_real", label: "Juego real" },
  { id: "juego_de_5", label: "Juego de 5" },
  { id: "estrategia", label: "Estrategia" },
  { id: "portero_jugador", label: "Portero Jugador" },
  { id: "otros", label: "Otros" },
];

const EXERCISES = [
  // ——— Calentamiento ———
  {
    id: "cal-partido",
    category: "calentamiento",
    title: "Calentamiento de partido",
    duration: 12,
    description:
      "Dos filas en los palos. Mientras se corre hasta unos 10 m se hacen ejercicios de articulación: brazos hacia delante, hacia atrás, de lado, cruzando, apertura de abductores, rodillas, talones, sprint, etc.",
    comments: "Ritmo progresivo. Terminar con sprint corto.",
    objective: "Activación articular y elevación de pulsaciones.",
    animation: "warm_partido",
  },
  {
    id: "cal-ancho",
    category: "calentamiento",
    title: "Calentamiento articular a lo ancho",
    duration: 12,
    description:
      "Igual que el calentamiento de partido (brazos hacia delante, hacia atrás, de lado, cruzando, apertura de abductores, rodillas, talones, sprint, etc.), pero corriendo a lo ancho del campo en vez de en fila desde los palos.",
    comments: "Mantener líneas ordenadas a lo ancho.",
    objective: "Activación articular y elevación de pulsaciones.",
    animation: "warm_ancho",
  },

  // ——— Juego de activación ———
  {
    id: "act-pedalada",
    category: "juego_activacion",
    title: "Pedalao",
    duration: 12,
    description:
      "5 vs 5. Máximo 2 toques. Gol válido solo de cabeza y dentro del área rival. Solo puede entrar un defensor en el área.",
    comments: "Exigir calidad del centro/pase al área.",
    objective: "Hacer gol de cabeza dentro del área.",
    animation: "pedalada",
  },
  {
    id: "act-muralla",
    category: "juego_activacion",
    title: "Muralla",
    duration: 10,
    description:
      "Juego de la muralla: uno liga en una línea horizontal y los demás tienen que pasar. Opción: los que pasan lo hacen controlando un balón. Si te pillan, ligas en la línea con los demás.",
    comments: "Ampliar la línea a medida que hay más ligando.",
    objective: "Pasar la línea sin ser pillado / pillar a todos.",
    animation: "muralla",
  },
  {
    id: "act-agrupacion",
    category: "juego_activacion",
    title: "Juego de agrupación",
    duration: 8,
    description:
      "Todos en el área. Un portavoz indica acciones; los últimos en hacerlo hacen castigo físico (3 flexiones o similar). Normas posibles: grupos de 3, tocar el punto de penalti, tocar el larguero, etc.",
    comments: "Cambiar de portavoz. Ritmo alto y atención.",
    objective: "Reacción rápida a consignas / evitar el castigo.",
    animation: "agrupacion",
  },
  {
    id: "act-tulipan",
    category: "juego_activacion",
    title: "Tulipán con balón",
    duration: 10,
    description:
      "Juego del tuli: 2 ligan y tienen que pillar a los demás. Hay 2 balones en juego que son «casa»: no te pueden pillar si lo tienes en posesión o si te lo pasan. Si te pillan, te sientas y no juegas. Objetivo: que los que pillan pillen a todos.",
    comments: "Comunicación para pasar el balón-casa.",
    objective: "Pillar a todos / sobrevivir con el balón-casa.",
    animation: "tulipan",
  },
  {
    id: "act-relevos",
    category: "juego_activacion",
    title: "Juegos por relevos",
    duration: 12,
    description:
      "2–3 equipos compiten en un circuito por ganar una carrera de relevos (varias rondas). Ejemplos: correr y tocar el palo y volver; saltos de obstáculos y volver; zig-zag con balón; carretilla; a caballito; ir y volver en grupo sin que caiga el balón.",
    comments: "Variar estaciones. Competitivo pero controlado.",
    objective: "Ganar la carrera de relevos del equipo.",
    animation: "relevos",
  },
  {
    id: "act-rondo",
    category: "juego_activacion",
    title: "Rondo",
    duration: 10,
    description:
      "Uno o dos jugadores deben robar el balón. Se puede hacer en multirondos.",
    comments: "Máximo 2–3 toques. Si recuperas, sales fuera.",
    objective: "Mantener la posesión / robar el balón.",
    animation: "rondo",
  },

  // ——— Técnica ———
  {
    id: "tec-pases",
    category: "tecnica",
    title: "Técnica de pase",
    duration: 12,
    description:
      "Uno enfrente de otro dando buenos pases tensos y de distinta forma (elevación, empeine, interior, pierna mala). Se pueden usar pelotas de tenis para mejorar el control y el dominio del gesto.",
    comments: "Incluir aquí cómo serán los ejercicios concretos (tipo de pase, pie, distancia, material…).",
    objective: "Mejorar calidad y variedad del pase/control.",
    animation: "pases_frente",
  },
  {
    id: "tec-conduccion",
    category: "tecnica",
    title: "Circuitos de conducción",
    duration: 12,
    description:
      "Circuito con varios zig-zag, cambios de orientación, controles, etc.",
    comments: "Incluir aquí cómo serán los ejercicios concretos (estaciones, zig-zag, cambios de orientación, material…).",
    objective: "Mejorar conducción y cambios de orientación.",
    animation: "circuito_conduccion",
  },

  // ——— Superioridades ———
  {
    id: "sup-la-suma",
    category: "superioridades",
    title: "La suma",
    duration: 16,
    description:
      "Dos equipos. Oleadas alternando dirección: 1 vs portero; en la otra dirección 2 vs 1 (+ portero); en la otra dirección 3 vs 2 (+ portero).",
    comments: "Rotar quién inicia cada oleada.",
    objective: "Hacer gol en cada oleada de superioridad.",
    animation: "la_suma",
  },
  {
    id: "sup-2v1-pasa",
    category: "superioridades",
    title: "2vs1 (define a quién se le pasa)",
    duration: 14,
    description:
      "3 filas de jugadores en medio campo. Reciben balón y ese jugador da pase a otra fila; se defiende la superioridad 2 vs 1.",
    comments: "El que recibe decide a quién pasa para crear el 2vs1.",
    objective: "Hacer gol en superioridad 2vs1.",
    animation: "sup_2v1_pasa",
  },
  {
    id: "sup-2v1-ultimo",
    category: "superioridades",
    title: "2vs1 (define el último en tocar)",
    duration: 14,
    description:
      "2 filas que atacan vs 1. El último en tocar el balón defiende en la siguiente. Si hay gol, repite el defensor.",
    comments: "Exigir decisión rápida: disparo o pase.",
    objective: "Hacer gol en 2vs1.",
    animation: "sup_2v1_ultimo",
  },
  {
    id: "sup-3v1",
    category: "superioridades",
    title: "3vs1 a primer toque",
    duration: 14,
    description:
      "Misma disposición de filas en medio campo. Se ataca un 3 vs 1 a primer toque. El último en tocar el balón defiende en la siguiente; si hay gol, repite el defensor.",
    comments: "Obligar a primer toque. Movilidad constante.",
    objective: "Hacer gol en 3vs1 a un toque.",
    animation: "sup_3v1",
  },
  {
    id: "sup-3v2",
    category: "superioridades",
    title: "3vs2",
    duration: 14,
    description:
      "Igual que el 2vs1 (último en tocar defiende): 2 filas atacan, pero en superioridad 3 vs 2. Si hay gol, repiten los defensores.",
    comments: "Crear el 2vs1 dentro del 3vs2.",
    objective: "Hacer gol en 3vs2.",
    animation: "sup_3v2",
  },
  {
    id: "sup-comodines-fuera",
    category: "superioridades",
    title: "Juego con comodines en las fueras",
    duration: 16,
    description:
      "2 vs 2 a juego real con 2 comodines fijos en las bandas (círculos azules): no se mueven, solo reciben y dan pase (2 toques). Opción: permuta — el jugador que da el pase sale y entra el comodín.",
    comments: "Usar al comodín para progresar, no solo para circular.",
    objective: "Hacer gol aprovechando los comodines.",
    animation: "comodines_fuera",
  },
  {
    id: "sup-comodin-medio",
    category: "superioridades",
    title: "Juego con comodín en el medio",
    duration: 16,
    description:
      "3 vs 3 a juego real con un comodín en el medio (círculo azul, 2 toques). Opción: permuta — el jugador que da el pase sale y entra el comodín.",
    comments: "El comodín orienta el juego; no atascar el centro.",
    objective: "Hacer gol aprovechando el comodín interior.",
    animation: "comodin_medio",
  },
  {
    id: "sup-oleadas",
    category: "superioridades",
    title: "Oleadas de superioridad",
    duration: 14,
    description:
      "1 vs portero; tras finalización 2 vs 1; tras finalización 3 vs 2.",
    comments: "Sin pausa entre oleadas. Balones preparados.",
    objective: "Hacer gol en cada oleada.",
    animation: "oleadas",
  },

  // ——— Finalización ———
  {
    id: "fin-ronda-tiros",
    category: "finalizacion",
    title: "Ronda de tiros",
    duration: 12,
    description:
      "Fila de 2 en medio campo y uno en el punto de doble penalti. Pase desde medio campo al doble penalti; el de medio avanza, recibe la devolución y chuta.",
    comments: "Rotación continua. Calidad del pase previo al tiro.",
    objective: "Hacer gol tras devolución.",
    animation: "ronda_tiros",
  },
  {
    id: "fin-tiros-cruzados",
    category: "finalizacion",
    title: "Ronda de tiros cruzados / paralelo",
    duration: 12,
    description:
      "Igual que la ronda de tiros, en cruzado o paralelo (2 filas): pase, avanzar a atacar el balón y, cuando el compañero la deja, rematar a puerta.",
    comments: "Alternar pie y lado. No taparse el tiro.",
    objective: "Hacer gol tras pase cruzado o en paralelo.",
    animation: "tiros_cruzados",
  },
  {
    id: "fin-segundo-palo",
    category: "finalizacion",
    title: "Ronda de tiros + segundo palo",
    duration: 14,
    description:
      "Igual que la ronda en paralelo, con un jugador en el segundo palo. Tras la devolución se puede rematar o dar pase al segundo palo.",
    comments: "Decisión: remate o asistencia al segundo palo.",
    objective: "Hacer gol (directo o al segundo palo).",
    animation: "tiros_2palo",
  },
  {
    id: "fin-1v1-bandas",
    category: "finalizacion",
    title: "1vs1 con 2 opciones de pase",
    duration: 14,
    description:
      "El atacante puede recibir de 2 saques de banda (uno en cada banda) y atacar una u otra portería.",
    comments: "Leer al defensor y elegir lado/portería.",
    objective: "Hacer gol en 1vs1 tras saque de banda.",
    animation: "fin_1v1_bandas",
  },
  {
    id: "fin-2v2-bandas",
    category: "finalizacion",
    title: "2vs2 con 2 opciones de pase",
    duration: 14,
    description:
      "Igual que el 1vs1 con 2 saques de banda, pero en 2 vs 2. Se puede atacar una u otra portería.",
    comments: "Apoyo tras recepción. Comunicación.",
    objective: "Hacer gol en 2vs2 tras saque de banda.",
    animation: "fin_2v2_bandas",
  },
  {
    id: "fin-sacar-ventaja",
    category: "finalizacion",
    title: "Sacar ventaja",
    duration: 16,
    description:
      "5 vs 5. Si un equipo llega a campo rival puede coger el balón con la mano y ponerlo de nuevo en juego atacando la otra portería.",
    comments: "Tras coger el balón con la mano, reorganizar el ataque hacia la portería contraria.",
    objective: "Hacer gol tras sacar ventaja / cambiar de portería.",
    animation: "sacar_ventaja",
  },

  // ——— Portero Jugador ———
  {
    id: "pj-5v4",
    category: "portero_jugador",
    title: "Portero jugador 5vs4",
    duration: 16,
    description:
      "Practicar el juego de portero-jugador en 5 vs 4 y ensayar jugadas asociadas.",
    comments: "Definir roles del PJ en ataque y repliegue.",
    objective: "Hacer gol / progresar con el PJ como libre.",
    animation: "pj_5v4",
  },

  // ——— Estrategia ———
  {
    id: "est-corner",
    category: "estrategia",
    title: "Estrategias de córner",
    duration: 12,
    description: "Practicar estrategias de córner (ataque y defensa).",
    comments: "Repetir cada variante 6–8 veces. Roles fijos.",
    objective: "Hacer gol de córner / defender el córner.",
    animation: "corner_play",
  },
  {
    id: "est-banda",
    category: "estrategia",
    title: "Estrategias de banda",
    duration: 12,
    description: "Practicar estrategias de saque de banda.",
    comments: "Ensayar 1ª y 2ª acción tras el saque.",
    objective: "Hacer gol / progresar desde saque de banda.",
    animation: "estrategia_banda",
  },
  {
    id: "est-falta",
    category: "estrategia",
    title: "Estrategias de falta",
    duration: 12,
    description: "Practicar estrategias de falta (laterales y frontales).",
    comments: "Definir barrera, remates y coberturas.",
    objective: "Hacer gol de falta / defender la falta.",
    animation: "free_kick",
  },
  {
    id: "est-salida-presion",
    category: "estrategia",
    title: "Estrategias de salida de presión",
    duration: 14,
    description: "Practicar estrategias de salida de presión.",
    comments: "Opciones A/B/C claras ante presión alta.",
    objective: "Salir limpio y progresar ante presión.",
    animation: "press_exit",
  },
  {
    id: "est-cesion",
    category: "estrategia",
    title: "Estrategias de cesión",
    duration: 12,
    description: "Practicar estrategias de tiro indirecto (cesión) al borde del área, como una falta: toque y remate.",
    comments: "Definir primer toque, remate y coberturas.",
    objective: "Hacer gol de tiro indirecto / defender la cesión.",
    animation: "estrategia_cesion",
  },

  // ——— Juego real ———
  {
    id: "jr-partido",
    category: "juego_real",
    title: "Partido a juego real (5vs5)",
    duration: 20,
    description:
      "Partido 5 vs 5 a juego real. Se pueden incluir condiciones cuando un equipo vaya ganando o perdiendo.",
    comments: "Ajustar condiciones según el marcador.",
    objective: "Hacer gol / ganar el partido.",
    animation: "partido_5v5",
  },

  // ——— Juego de 5 ———
  {
    id: "j5-ataque-comodin",
    category: "juego_de_5",
    title: "Ataque de 5 con comodín",
    duration: 16,
    description:
      "Ataque 5 vs 4 con un comodín de color distinto en la línea de fondo (fuera del campo): no puede entrar en el campo, pero sí jugar (recibir y dar pase).",
    comments: "Usar al comodín de fondo para fijar y finalizar.",
    objective: "Hacer gol en superioridad con ayuda del comodín.",
    animation: "ataque_5_comodin",
  },

  // ——— Otros (plantilla abierta) ———
  {
    id: "otr-libre",
    category: "otros",
    title: "Ejercicio libre",
    duration: 10,
    description: "Completa el nombre y la descripción en la plantilla.",
    comments: "",
    objective: "Definir el objetivo al completar el ejercicio.",
    animation: "otros_circulo",
    customizable: true,
  },
];
