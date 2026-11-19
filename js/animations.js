/**
 * Motor de animaciones tácticas (canvas).
 * Atacantes = círculos rosa · Defensores = triángulos negros · Balón = círculo amarillo
 */
const PitchAnimator = (() => {
  const PINK = "#ff0092";
  const DARK = "#1a1f29";
  const BALL = "#f5c518";
  const BLUE = "#3b82f6";
  /** Escenas: t 0–1 → posiciones normalizadas 0–1 */
  const SCENES = {
    /* ——— Calentamiento ——— */
    warm_partido: {
      duration: 4000,
      // Dos filas a la altura de los palos: ida ~10 m y vuelta (todos a la vez)
      attackers: [
        (t) => ({ x: 0.06 + 0.28 * goBack(t), y: 0.34 }),
        (t) => ({ x: 0.12 + 0.28 * goBack(t), y: 0.34 }),
        (t) => ({ x: 0.18 + 0.28 * goBack(t), y: 0.34 }),
        (t) => ({ x: 0.06 + 0.28 * goBack(t), y: 0.66 }),
        (t) => ({ x: 0.12 + 0.28 * goBack(t), y: 0.66 }),
        (t) => ({ x: 0.18 + 0.28 * goBack(t), y: 0.66 }),
      ],
      defenders: [],
      ball: null,
      goal: true,
      goalLeft: true,
    },
    warm_ancho: {
      duration: 4000,
      // A lo ancho, todos a la vez, ida y vuelta, sin conos
      attackers: [
        (t) => ({ x: 0.28, y: 0.14 + 0.72 * goBack(t) }),
        (t) => ({ x: 0.42, y: 0.14 + 0.72 * goBack(t) }),
        (t) => ({ x: 0.56, y: 0.14 + 0.72 * goBack(t) }),
        (t) => ({ x: 0.7, y: 0.14 + 0.72 * goBack(t) }),
      ],
      defenders: [],
      ball: null,
    },

    /* ——— Activación ——— */
    pedalada: {
      duration: 4800,
      // 5 vs 5: círculos (rosa) vs triángulos (negros), posesión y remate de cabeza
      attackers: [
        (t) => ({ x: 0.28 + 0.06 * Math.sin(t * 2.2), y: 0.28 + 0.04 * Math.cos(t * 1.8) }),
        (t) => ({ x: 0.38 + 0.05 * Math.cos(t * 2), y: 0.48 + 0.06 * Math.sin(t * 2.4) }),
        (t) => ({ x: 0.3 + 0.05 * Math.sin(t * 1.6), y: 0.7 + 0.04 * Math.cos(t * 2) }),
        (t) => ({ x: 0.52 + 0.08 * Math.sin(t * 1.8), y: 0.35 + 0.05 * Math.sin(t * 2.2) }),
        (t) => ({ x: 0.55 + 0.1 * ease(Math.max(0, (t - 0.55) / 0.45)), y: 0.58 + 0.04 * Math.cos(t * 2) }),
      ],
      defenders: [
        (t) => ({ x: 0.48 + 0.05 * Math.sin(t * 2), y: 0.3 + 0.04 * Math.cos(t * 1.5) }),
        (t) => ({ x: 0.55 + 0.04 * Math.cos(t * 2.2), y: 0.5 + 0.05 * Math.sin(t * 1.8) }),
        (t) => ({ x: 0.5 + 0.05 * Math.sin(t * 1.4), y: 0.72 + 0.03 * Math.cos(t * 2) }),
        (t) => ({ x: 0.7 + 0.04 * Math.sin(t * 2.5), y: 0.4 + 0.04 * Math.sin(t * 1.6) }),
        (t) => ({ x: 0.72 + 0.03 * Math.cos(t * 1.7), y: 0.62 + 0.04 * Math.sin(t * 2) }),
      ],
      ball: (t, atk) => {
        // Pases entre atacantes y remate de cabeza al final
        if (t < 0.22) return lerp(atk[0](0), atk[1](t), t / 0.22);
        if (t < 0.4) return lerp(atk[1](0.22), atk[2](0.4), (t - 0.22) / 0.18);
        if (t < 0.58) return lerp(atk[2](0.4), atk[3](0.58), (t - 0.4) / 0.18);
        if (t < 0.75) return lerp(atk[3](0.58), atk[4](0.75), (t - 0.58) / 0.17);
        return lerp(atk[4](0.75), { x: 0.9, y: 0.5 }, (t - 0.75) / 0.25);
      },
      goal: true,
      goalLeft: true,
    },
    muralla: {
      duration: 3600,
      attackers: [
        (t) => ({ x: 0.22 + 0.08 * Math.sin(t * 2), y: 0.18 + 0.45 * ease(t) }),
        (t) => ({ x: 0.55 + 0.1 * Math.sin(t * 3), y: 0.15 + 0.5 * ease(t) }),
        (t) => ({ x: 0.78 + 0.06 * Math.cos(t * 2.5), y: 0.2 + 0.42 * ease(Math.min(1, t * 1.1)) }),
      ],
      // Triángulos en línea horizontal de pillar, se mueven un poco a lo largo de ella
      defenders: [
        (t) => ({ x: 0.28 + 0.08 * Math.sin(t * Math.PI * 2), y: 0.5 }),
        (t) => ({ x: 0.45 + 0.07 * Math.sin(t * Math.PI * 2 + 1.2), y: 0.5 }),
        (t) => ({ x: 0.62 + 0.08 * Math.sin(t * Math.PI * 2 + 2.4), y: 0.5 }),
        (t) => ({ x: 0.78 + 0.06 * Math.sin(t * Math.PI * 2 + 0.6), y: 0.5 }),
      ],
      ball: (t, atk) => follow(atk[1](t), 0.028),
    },
    agrupacion: {
      duration: 3200,
      // Los 5 dentro del área (portería derecha)
      attackers: [
        (t) => ({ x: 0.88 + 0.015 * Math.cos(t * 5), y: 0.42 + 0.02 * Math.sin(t * 5) }),
        (t) => ({ x: 0.9 + 0.012 * Math.sin(t * 4), y: 0.5 }),
        (t) => ({ x: 0.87 + 0.015 * Math.cos(t * 4.5), y: 0.58 + 0.015 * Math.sin(t * 4) }),
        (t) => ({ x: 0.84 + 0.012 * Math.sin(t * 3.5), y: 0.46 + 0.015 * Math.cos(t * 3) }),
        (t) => ({ x: 0.85 + 0.012 * Math.cos(t * 3), y: 0.54 + 0.015 * Math.sin(t * 3.5) }),
      ],
      defenders: [],
      ball: null,
      goal: true,
    },
    tulipan: {
      duration: 4000,
      attackers: [
        (t) => ({ x: 0.3 + 0.15 * Math.sin(t * 3), y: 0.3 + 0.1 * Math.cos(t * 2) }),
        (t) => ({ x: 0.55 + 0.12 * Math.cos(t * 2.5), y: 0.35 }),
        (t) => ({ x: 0.4, y: 0.7 + 0.08 * Math.sin(t * 2) }),
        (t) => ({ x: 0.7 + 0.05 * Math.sin(t * 4), y: 0.65 }),
      ],
      defenders: [
        (t) => ({ x: 0.45 + 0.12 * Math.cos(t * Math.PI * 2), y: 0.5 + 0.1 * Math.sin(t * Math.PI * 2) }),
        (t) => ({ x: 0.55 + 0.1 * Math.sin(t * Math.PI * 2), y: 0.55 - 0.12 * Math.cos(t * Math.PI * 2) }),
      ],
      ball: (t, atk) => {
        if (t < 0.5) return follow(atk[0](t), 0.03);
        return lerp(atk[0](0.5), atk[1](t), (t - 0.5) / 0.5);
      },
    },
    relevos: {
      duration: 3200,
      attackers: [
        (t) => ({ x: 0.15 + 0.55 * Math.min(1, t * 2), y: 0.28 }),
        (t) => ({
          x: t > 0.5 ? 0.7 - 0.55 * ((t - 0.5) * 2) : 0.7,
          y: 0.5,
        }),
        (t) => ({ x: 0.15 + 0.55 * Math.min(1, Math.max(0, (t - 0.15) * 2)), y: 0.72 }),
      ],
      defenders: [],
      ball: (t, atk) => follow(atk[t < 0.5 ? 0 : 1](t), 0.028),
      cones: [
        { x: 0.15, y: 0.28 },
        { x: 0.7, y: 0.28 },
        { x: 0.15, y: 0.5 },
        { x: 0.7, y: 0.5 },
        { x: 0.15, y: 0.72 },
        { x: 0.7, y: 0.72 },
        { x: 0.42, y: 0.28 },
        { x: 0.42, y: 0.5 },
        { x: 0.42, y: 0.72 },
      ],
    },
    rondo: {
      duration: 4000,
      attackers: [
        () => ({ x: 0.28, y: 0.28 }),
        () => ({ x: 0.72, y: 0.28 }),
        () => ({ x: 0.72, y: 0.72 }),
        () => ({ x: 0.28, y: 0.72 }),
        () => ({ x: 0.5, y: 0.18 }),
      ],
      defenders: [
        (t) => ({ x: 0.5 + 0.12 * Math.cos(t * Math.PI * 2), y: 0.5 + 0.1 * Math.sin(t * Math.PI * 2) }),
      ],
      ball: (t) => {
        const pts = [
          { x: 0.28, y: 0.28 },
          { x: 0.5, y: 0.18 },
          { x: 0.72, y: 0.28 },
          { x: 0.72, y: 0.72 },
          { x: 0.28, y: 0.72 },
          { x: 0.28, y: 0.28 },
        ];
        return lerpPath(pts, t);
      },
      box: { x: 0.18, y: 0.12, w: 0.64, h: 0.7 },
    },

    /* ——— Técnica ——— */
    pases_frente: {
      duration: 3000,
      attackers: [
        () => ({ x: 0.32, y: 0.35 }),
        () => ({ x: 0.68, y: 0.35 }),
        () => ({ x: 0.32, y: 0.65 }),
        () => ({ x: 0.68, y: 0.65 }),
      ],
      defenders: [],
      ball: (t) => {
        if (t < 0.5) return lerp({ x: 0.32, y: 0.35 }, { x: 0.68, y: 0.35 }, t / 0.5);
        return lerp({ x: 0.32, y: 0.65 }, { x: 0.68, y: 0.65 }, (t - 0.5) / 0.5);
      },
    },
    circuito_conduccion: {
      duration: 3600,
      attackers: [
        (t) => ({
          x: 0.15 + 0.7 * ease(t),
          y: 0.5 + 0.2 * Math.sin(t * Math.PI * 3),
        }),
      ],
      defenders: [],
      ball: (t, atk) => follow(atk[0](t), 0.028),
      cones: [
        { x: 0.28, y: 0.38 },
        { x: 0.28, y: 0.62 },
        { x: 0.45, y: 0.38 },
        { x: 0.45, y: 0.62 },
        { x: 0.62, y: 0.38 },
        { x: 0.62, y: 0.62 },
        { x: 0.78, y: 0.5 },
      ],
    },

    /* ——— Superioridades ——— */
    la_suma: {
      duration: 7800,
      // Oleada 1 →: 1vs portero | Oleada 2 ←: 2vs1+P | Oleada 3 →: 3vs2+P
      attackers: [
        (t) => {
          if (t >= 0.33) return null;
          const u = t / 0.33;
          return { x: 0.35 + 0.42 * ease(u), y: 0.5 };
        },
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          const u = (t - 0.33) / 0.33;
          return { x: 0.72 - 0.42 * ease(u), y: 0.36 };
        },
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          const u = (t - 0.33) / 0.33;
          return { x: 0.7 - 0.4 * ease(u), y: 0.64 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.22 + 0.4 * ease(u), y: 0.5 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.25 + 0.35 * ease(u), y: 0.3 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.25 + 0.35 * ease(u), y: 0.7 };
        },
      ],
      defenders: [
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          const u = (t - 0.33) / 0.33;
          return { x: 0.38 + 0.04 * Math.sin(u * 4), y: 0.5 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.58, y: 0.4 + 0.05 * Math.sin(u * 4) };
        },
        (t) => {
          if (t < 0.66) return null;
          return { x: 0.6, y: 0.62 };
        },
      ],
      ball: (t, atk) => {
        if (t < 0.33) {
          const a = atk[0](t) || { x: 0.5, y: 0.5 };
          if (t < 0.22) return follow(a, 0.03);
          return lerp(a, { x: 0.92, y: 0.5 }, (t - 0.22) / 0.11);
        }
        if (t < 0.66) {
          const a0 = atk[1](t) || { x: 0.5, y: 0.36 };
          const a1 = atk[2](t) || { x: 0.5, y: 0.64 };
          if (t < 0.48) return follow(a0, 0.03);
          if (t < 0.56) return lerp(a0, a1, (t - 0.48) / 0.08);
          return lerp(a1, { x: 0.08, y: 0.5 }, (t - 0.56) / 0.1);
        }
        const a0 = atk[3](t) || { x: 0.4, y: 0.5 };
        const a1 = atk[4](t) || { x: 0.4, y: 0.3 };
        if (t < 0.78) return follow(a0, 0.03);
        if (t < 0.88) return lerp(a0, a1, (t - 0.78) / 0.1);
        return lerp(a1, { x: 0.92, y: 0.4 }, (t - 0.88) / 0.12);
      },
      goal: true,
      goalLeft: true,
      gk: true,
      gkLeft: true,
    },
    oleadas: {
      duration: 7200,
      // 1vs portero → tras finalización 2vs1 → tras finalización 3vs2
      attackers: [
        (t) => {
          if (t >= 0.33) return null;
          const u = t / 0.33;
          return { x: 0.32 + 0.42 * ease(u), y: 0.5 };
        },
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          const u = (t - 0.33) / 0.33;
          return { x: 0.28 + 0.4 * ease(u), y: 0.38 };
        },
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          const u = (t - 0.33) / 0.33;
          return { x: 0.3 + 0.38 * ease(u), y: 0.62 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.25 + 0.4 * ease(u), y: 0.5 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.28 + 0.35 * ease(u), y: 0.3 };
        },
        (t) => {
          if (t < 0.66) return null;
          const u = (t - 0.66) / 0.34;
          return { x: 0.28 + 0.35 * ease(u), y: 0.7 };
        },
      ],
      defenders: [
        (t) => {
          if (t < 0.33 || t >= 0.66) return null;
          return { x: 0.6, y: 0.5 + 0.06 * Math.sin(((t - 0.33) / 0.33) * 4) };
        },
        (t) => {
          if (t < 0.66) return null;
          return { x: 0.58, y: 0.4 + 0.05 * Math.sin(((t - 0.66) / 0.34) * 4) };
        },
        (t) => {
          if (t < 0.66) return null;
          return { x: 0.6, y: 0.62 };
        },
      ],
      ball: (t, atk) => {
        if (t < 0.33) {
          const a = atk[0](t) || { x: 0.5, y: 0.5 };
          if (t < 0.22) return follow(a, 0.03);
          return lerp(a, { x: 0.92, y: 0.5 }, (t - 0.22) / 0.11);
        }
        if (t < 0.66) {
          const a0 = atk[1](t) || { x: 0.45, y: 0.38 };
          const a1 = atk[2](t) || { x: 0.45, y: 0.62 };
          if (t < 0.48) return follow(a0, 0.03);
          if (t < 0.56) return lerp(a0, a1, (t - 0.48) / 0.08);
          return lerp(a1, { x: 0.92, y: 0.55 }, (t - 0.56) / 0.1);
        }
        const a0 = atk[3](t) || { x: 0.4, y: 0.5 };
        const a1 = atk[4](t) || { x: 0.4, y: 0.3 };
        if (t < 0.78) return follow(a0, 0.03);
        if (t < 0.88) return lerp(a0, a1, (t - 0.78) / 0.1);
        return lerp(a1, { x: 0.92, y: 0.4 }, (t - 0.88) / 0.12);
      },
      goal: true,
      gk: true,
    },
    sup_2v1_pasa: {
      duration: 3800,
      // Sin triángulo al inicio; el que da el pase se convierte en triángulo
      attackers: [
        (t) => {
          if (t >= 0.32) return null;
          return { x: 0.34 + 0.08 * ease(t / 0.32), y: 0.5 };
        },
        (t) => ({ x: 0.42 + 0.28 * ease(Math.max(0, (t - 0.2) / 0.8)), y: 0.32 }),
        () => ({ x: 0.32, y: 0.68 }),
      ],
      defenders: [
        (t) => {
          if (t < 0.32) return null;
          const u = (t - 0.32) / 0.68;
          return { x: 0.48 + 0.18 * ease(u), y: 0.48 + 0.06 * Math.sin(u * 4) };
        },
      ],
      ball: (t, atk) => {
        const passer = { x: 0.36, y: 0.5 };
        const recv = atk[1](t);
        if (t < 0.32) return lerp(passer, recv, t / 0.32);
        if (t < 0.7) return follow(recv, 0.03);
        return lerp(recv, { x: 0.92, y: 0.42 }, (t - 0.7) / 0.3);
      },
      goal: true,
      gk: true,
      cones: [
        { x: 0.28, y: 0.32 },
        { x: 0.28, y: 0.5 },
        { x: 0.28, y: 0.68 },
      ],
    },
    sup_2v1_ultimo: {
      duration: 3400,
      attackers: [
        (t) => ({ x: 0.3 + 0.35 * ease(t), y: 0.38 }),
        (t) => ({ x: 0.32 + 0.32 * ease(t), y: 0.62 }),
      ],
      defenders: [(t) => ({ x: 0.58 + 0.05 * Math.sin(t * 4), y: 0.5 })],
      ball: (t, atk) => {
        if (t < 0.4) return follow(atk[0](t), 0.03);
        if (t < 0.65) return lerp(atk[0](0.4), atk[1](0.65), (t - 0.4) / 0.25);
        return lerp(atk[1](0.65), { x: 0.92, y: 0.55 }, (t - 0.65) / 0.35);
      },
      goal: true,
      gk: true,
      cones: [
        { x: 0.25, y: 0.35 },
        { x: 0.25, y: 0.65 },
      ],
    },
    sup_3v1: {
      duration: 3600,
      attackers: [
        (t) => ({ x: 0.28 + 0.35 * ease(t), y: 0.5 }),
        (t) => ({ x: 0.32 + 0.3 * ease(t), y: 0.3 }),
        (t) => ({ x: 0.32 + 0.3 * ease(t), y: 0.7 }),
      ],
      defenders: [(t) => ({ x: 0.6, y: 0.5 + 0.1 * Math.sin(t * 3) })],
      ball: (t, atk) => {
        if (t < 0.3) return follow(atk[0](t), 0.03);
        if (t < 0.5) return lerp(atk[0](0.3), atk[1](0.5), (t - 0.3) / 0.2);
        if (t < 0.7) return lerp(atk[1](0.5), atk[2](0.7), (t - 0.5) / 0.2);
        return lerp(atk[2](0.7), { x: 0.92, y: 0.55 }, (t - 0.7) / 0.3);
      },
      goal: true,
      gk: true,
    },
    sup_3v2: {
      duration: 3600,
      attackers: [
        (t) => ({ x: 0.25 + 0.38 * ease(t), y: 0.5 }),
        (t) => ({ x: 0.3 + 0.32 * ease(t), y: 0.3 }),
        (t) => ({ x: 0.3 + 0.32 * ease(t), y: 0.7 }),
      ],
      defenders: [
        (t) => ({ x: 0.58, y: 0.4 + 0.06 * Math.sin(t * 3) }),
        (t) => ({ x: 0.6, y: 0.62 - 0.05 * Math.sin(t * 3) }),
      ],
      ball: (t, atk) => {
        if (t < 0.35) return follow(atk[0](t), 0.03);
        if (t < 0.6) return lerp(atk[0](0.35), atk[1](0.6), (t - 0.35) / 0.25);
        return lerp(atk[1](0.6), { x: 0.92, y: 0.4 }, (t - 0.6) / 0.4);
      },
      goal: true,
      gk: true,
    },
    comodines_fuera: {
      duration: 4200,
      // 2vs2 + 2 comodines azules fijos en bandas (solo reciben y dan pase)
      attackers: [
        (t) => ({ x: 0.38 + 0.08 * Math.sin(t * 2.5), y: 0.4 + 0.04 * Math.cos(t * 2) }),
        (t) => ({ x: 0.45 + 0.06 * Math.cos(t * 2), y: 0.62 + 0.04 * Math.sin(t * 2.2) }),
      ],
      defenders: [
        (t) => ({ x: 0.58 + 0.04 * Math.sin(t * 2), y: 0.4 + 0.04 * Math.cos(t * 1.8) }),
        (t) => ({ x: 0.6 + 0.04 * Math.cos(t * 2.2), y: 0.62 + 0.03 * Math.sin(t * 2) }),
      ],
      jokers: [
        () => ({ x: 0.5, y: 0.12 }),
        () => ({ x: 0.5, y: 0.88 }),
      ],
      ball: (t, atk) => {
        const jTop = { x: 0.5, y: 0.12 };
        const jBot = { x: 0.5, y: 0.88 };
        if (t < 0.22) return follow(atk[0](t), 0.03);
        if (t < 0.4) return lerp(atk[0](0.22), jTop, (t - 0.22) / 0.18);
        if (t < 0.58) return lerp(jTop, atk[1](0.58), (t - 0.4) / 0.18);
        if (t < 0.72) return lerp(atk[1](0.58), jBot, (t - 0.58) / 0.14);
        if (t < 0.85) return lerp(jBot, atk[0](0.85), (t - 0.72) / 0.13);
        return lerp(atk[0](0.85), { x: 0.92, y: 0.48 }, (t - 0.85) / 0.15);
      },
      goal: true,
      goalLeft: true,
    },
    comodin_medio: {
      duration: 4200,
      // 3vs3 + comodín azul fijo en el medio
      attackers: [
        (t) => ({ x: 0.28 + 0.06 * Math.sin(t * 2), y: 0.3 + 0.03 * Math.cos(t * 1.8) }),
        (t) => ({ x: 0.32 + 0.05 * Math.cos(t * 2.2), y: 0.5 }),
        (t) => ({ x: 0.3 + 0.06 * Math.sin(t * 1.6), y: 0.72 + 0.03 * Math.cos(t * 2) }),
      ],
      defenders: [
        (t) => ({ x: 0.62 + 0.04 * Math.sin(t * 2), y: 0.32 }),
        (t) => ({ x: 0.65 + 0.03 * Math.cos(t * 2.4), y: 0.5 }),
        (t) => ({ x: 0.62 + 0.04 * Math.sin(t * 1.8), y: 0.7 }),
      ],
      jokers: [() => ({ x: 0.5, y: 0.5 })],
      ball: (t, atk) => {
        const j = { x: 0.5, y: 0.5 };
        if (t < 0.22) return follow(atk[0](t), 0.03);
        if (t < 0.4) return lerp(atk[0](0.22), j, (t - 0.22) / 0.18);
        if (t < 0.58) return lerp(j, atk[2](0.58), (t - 0.4) / 0.18);
        if (t < 0.72) return lerp(atk[2](0.58), j, (t - 0.58) / 0.14);
        if (t < 0.85) return lerp(j, atk[1](0.85), (t - 0.72) / 0.13);
        return lerp(atk[1](0.85), { x: 0.92, y: 0.5 }, (t - 0.85) / 0.15);
      },
      goal: true,
      goalLeft: true,
    },

    /* ——— Finalización ——— */
    ronda_tiros: {
      duration: 4000,
      // Fila de 2 en medio campo + 1 en doble penalti:
      // pase al doble penalti → avanza el de medio → devolución → remate
      attackers: [
        // Activo en medio campo (avanza tras el pase)
        (t) => {
          if (t < 0.28) return { x: 0.48, y: 0.5 };
          const u = Math.min(1, (t - 0.28) / 0.45);
          return { x: 0.48 + 0.22 * ease(u), y: 0.5 };
        },
        // Compañero esperando en la fila
        () => ({ x: 0.4, y: 0.5 }),
        // En el punto de doble penalti
        () => ({ x: 0.72, y: 0.5 }),
      ],
      defenders: [],
      ball: (t, atk) => {
        const mid = { x: 0.48, y: 0.5 };
        const dp = { x: 0.72, y: 0.5 };
        if (t < 0.28) return lerp(mid, dp, t / 0.28);
        const shooter = atk[0](t);
        if (t < 0.55) return lerp(dp, shooter, (t - 0.28) / 0.27);
        if (t < 0.68) return follow(shooter, 0.03);
        return lerp(shooter, { x: 0.93, y: 0.5 }, (t - 0.68) / 0.32);
      },
      goal: true,
      gk: true,
    },
    tiros_cruzados: {
      duration: 4000,
      // Igual: pase (cruzado/paralelo), avanzo a atacar el balón, devolución y remate
      attackers: [
        // Activo desde una fila (avanza tras el pase)
        (t) => {
          if (t < 0.28) return { x: 0.42, y: 0.28 };
          const u = Math.min(1, (t - 0.28) / 0.45);
          return { x: 0.42 + 0.22 * ease(u), y: 0.28 + 0.14 * ease(u) };
        },
        // Segunda fila de pase (paralelo/cruzado)
        () => ({ x: 0.42, y: 0.72 }),
        // Quien recibe y deja el balón
        () => ({ x: 0.7, y: 0.48 }),
      ],
      defenders: [],
      ball: (t, atk) => {
        const from = { x: 0.42, y: 0.28 };
        const support = { x: 0.7, y: 0.48 };
        if (t < 0.28) return lerp(from, support, t / 0.28);
        const shooter = atk[0](t);
        if (t < 0.55) return lerp(support, shooter, (t - 0.28) / 0.27);
        if (t < 0.68) return follow(shooter, 0.03);
        return lerp(shooter, { x: 0.93, y: 0.45 }, (t - 0.68) / 0.32);
      },
      goal: true,
      gk: true,
    },
    tiros_2palo: {
      duration: 4200,
      // Igual + opción de rematar o pasar al segundo palo
      attackers: [
        (t) => {
          if (t < 0.25) return { x: 0.42, y: 0.28 };
          const u = Math.min(1, (t - 0.25) / 0.4);
          return { x: 0.42 + 0.2 * ease(u), y: 0.28 + 0.14 * ease(u) };
        },
        () => ({ x: 0.42, y: 0.72 }),
        () => ({ x: 0.7, y: 0.48 }),
        // Segundo palo
        (t) => ({ x: 0.86, y: 0.64 + 0.02 * Math.min(1, Math.max(0, (t - 0.5) / 0.3)) }),
      ],
      defenders: [],
      ball: (t, atk) => {
        const from = { x: 0.42, y: 0.28 };
        const support = { x: 0.7, y: 0.48 };
        if (t < 0.25) return lerp(from, support, t / 0.25);
        const shooter = atk[0](t);
        if (t < 0.48) return lerp(support, shooter, (t - 0.25) / 0.23);
        // Opción: pase al segundo palo y remate
        const far = atk[3](t);
        if (t < 0.68) return lerp(shooter, far, (t - 0.48) / 0.2);
        return lerp(far, { x: 0.93, y: 0.55 }, (t - 0.68) / 0.32);
      },
      goal: true,
      gk: true,
    },
    fin_1v1_bandas: {
      duration: 3600,
      // 1vs1; saques de banda azules; se puede atacar cualquiera de las dos porterías
      attackers: [
        (t) => ({ x: 0.5 + 0.2 * ease(t) * (t < 0.5 ? 1 : -0.2), y: 0.5 + 0.05 * Math.sin(t * 3) }),
      ],
      defenders: [(t) => ({ x: 0.58 + 0.08 * ease(t), y: 0.5 })],
      jokers: [
        () => ({ x: 0.5, y: 0.08 }),
        () => ({ x: 0.5, y: 0.92 }),
      ],
      ball: (t, atk) => {
        if (t < 0.35) return lerp({ x: 0.5, y: 0.08 }, atk[0](0.35), t / 0.35);
        if (t < 0.7) return follow(atk[0](t), 0.03);
        return lerp(atk[0](0.7), { x: 0.92, y: 0.5 }, (t - 0.7) / 0.3);
      },
      goal: true,
      goalLeft: true,
      gk: true,
      gkLeft: true,
    },
    fin_2v2_bandas: {
      duration: 3800,
      // 2vs2; saques de banda azules; se puede atacar cualquiera de las dos porterías
      attackers: [
        (t) => ({ x: 0.45 + 0.2 * ease(t), y: 0.4 }),
        (t) => ({ x: 0.48 + 0.18 * ease(t), y: 0.62 }),
      ],
      defenders: [
        (t) => ({ x: 0.6, y: 0.42 }),
        (t) => ({ x: 0.62, y: 0.6 }),
      ],
      jokers: [
        () => ({ x: 0.5, y: 0.08 }),
        () => ({ x: 0.5, y: 0.92 }),
      ],
      ball: (t, atk) => {
        if (t < 0.3) return lerp({ x: 0.5, y: 0.92 }, atk[1](0.3), t / 0.3);
        if (t < 0.55) return lerp(atk[1](0.3), atk[0](0.55), (t - 0.3) / 0.25);
        return lerp(atk[0](0.55), { x: 0.92, y: 0.42 }, (t - 0.55) / 0.45);
      },
      goal: true,
      goalLeft: true,
      gk: true,
      gkLeft: true,
    },

    /* ——— Portero jugador ——— */
    pj_5v4: {
      duration: 4200,
      // Campo contrario en 1-2-2: PJ verde atrás, 2 medios, 2 arriba
      attackers: [
        (t) => ({ x: 0.55 + 0.02 * Math.cos(t * 1.5), y: 0.5, color: "#2ecc71" }), // 1 PJ
        (t) => ({ x: 0.64 + 0.03 * Math.cos(t * 2), y: 0.28 }), // 2 medios
        (t) => ({ x: 0.64 + 0.03 * Math.sin(t * 1.8), y: 0.72 }),
        (t) => ({ x: 0.78 + 0.02 * Math.sin(t * 1.5), y: 0.35 }), // 2 arriba
        (t) => ({ x: 0.78 + 0.02 * Math.cos(t * 1.5), y: 0.65 }),
      ],
      defenders: [
        (t) => ({ x: 0.68 + 0.03 * Math.sin(t * 2), y: 0.5 }),
        (t) => ({ x: 0.74 + 0.03 * Math.cos(t * 2), y: 0.3 }),
        (t) => ({ x: 0.74 + 0.03 * Math.sin(t * 1.8), y: 0.7 }),
        (t) => ({ x: 0.84 + 0.02 * Math.sin(t * 1.6), y: 0.4 }),
        (t) => ({ x: 0.9, y: 0.5 + 0.03 * Math.sin(t * 2), color: "#2ecc71" }), // portero rival
      ],
      ball: (t, atk) => {
        if (t < 0.25) return lerp(atk[0](0), atk[1](t), t / 0.25);
        if (t < 0.5) return lerp(atk[1](0.25), atk[2](0.5), (t - 0.25) / 0.25);
        if (t < 0.72) return lerp(atk[2](0.5), atk[3](0.72), (t - 0.5) / 0.22);
        return lerp(atk[3](0.72), { x: 0.93, y: 0.42 }, (t - 0.72) / 0.28);
      },
      goal: true,
      goalLeft: true,
    },

    /* ——— Estrategia ——— */
    corner_play: {
      duration: 3400,
      // Saque desde el córner (esquina)
      attackers: [
        () => ({ x: 0.955, y: 0.07 }),
        (t) => ({ x: 0.78 + 0.1 * ease(t), y: 0.42 + 0.1 * ease(t) }),
        (t) => ({ x: 0.74 + 0.12 * ease(t), y: 0.62 }),
      ],
      defenders: [
        () => ({ x: 0.84, y: 0.4 }),
        () => ({ x: 0.86, y: 0.55 }),
        () => ({ x: 0.82, y: 0.7 }),
      ],
      ball: (t) => {
        if (t < 0.28) return { x: 0.955, y: 0.07 };
        return lerp({ x: 0.955, y: 0.07 }, { x: 0.9, y: 0.55 }, (t - 0.28) / 0.72);
      },
      goal: true,
      gk: true,
    },
    estrategia_banda: {
      duration: 3400,
      attackers: [
        () => ({ x: 0.55, y: 0.08 }),
        (t) => ({ x: 0.55 + 0.15 * ease(t), y: 0.25 + 0.15 * ease(t) }),
        (t) => ({ x: 0.7 + 0.1 * ease(t), y: 0.55 }),
      ],
      defenders: [
        () => ({ x: 0.72, y: 0.35 }),
        () => ({ x: 0.78, y: 0.55 }),
      ],
      ball: (t, atk) => {
        if (t < 0.3) return { x: 0.55, y: 0.08 };
        if (t < 0.55) return lerp({ x: 0.55, y: 0.08 }, atk[1](0.55), (t - 0.3) / 0.25);
        return lerp(atk[1](0.55), atk[2](t), (t - 0.55) / 0.45);
      },
      goal: true,
    },
    free_kick: {
      duration: 3400,
      attackers: [
        () => ({ x: 0.62, y: 0.35 }),
        (t) => ({ x: 0.75 + 0.08 * ease(t), y: 0.48 }),
        (t) => ({ x: 0.72 + 0.1 * ease(t), y: 0.65 }),
      ],
      defenders: [
        () => ({ x: 0.82, y: 0.42 }),
        () => ({ x: 0.84, y: 0.52 }),
        () => ({ x: 0.82, y: 0.62 }),
      ],
      ball: (t) => {
        if (t < 0.35) return { x: 0.62, y: 0.35 };
        return lerp({ x: 0.62, y: 0.35 }, { x: 0.92, y: 0.5 }, (t - 0.35) / 0.65);
      },
      goal: true,
      gk: true,
    },
    press_exit: {
      duration: 3800,
      attackers: [
        () => ({ x: 0.12, y: 0.5 }),
        (t) => ({ x: 0.28, y: 0.28 + 0.05 * Math.sin(t * 3) }),
        (t) => ({ x: 0.28, y: 0.72 - 0.05 * Math.sin(t * 3) }),
        (t) => ({ x: 0.48 + 0.12 * ease(t), y: 0.5 }),
      ],
      defenders: [
        (t) => ({ x: 0.38 + 0.05 * Math.sin(t * 4), y: 0.4 }),
        (t) => ({ x: 0.4, y: 0.6 }),
        (t) => ({ x: 0.55, y: 0.5 }),
      ],
      ball: (t, atk) => {
        if (t < 0.3) return lerp(atk[0](0), atk[1](t), t / 0.3);
        if (t < 0.55) return lerp(atk[1](0.3), atk[0](t), (t - 0.3) / 0.25);
        if (t < 0.75) return lerp(atk[0](0.55), atk[2](t), (t - 0.55) / 0.2);
        return lerp(atk[2](0.75), atk[3](t), (t - 0.75) / 0.25);
      },
      goal: true,
      gkLeft: true,
    },
    estrategia_cesion: {
      duration: 3800,
      // Tiro indirecto al borde del área (como falta): pase y remate
      attackers: [
        () => ({ x: 0.78, y: 0.42 }), // saca el indirecto
        (t) => ({ x: 0.82 + 0.04 * ease(t), y: 0.55 }), // recibe y remata
        (t) => ({ x: 0.7 + 0.08 * ease(t), y: 0.32 }),
        (t) => ({ x: 0.68 + 0.1 * ease(t), y: 0.68 }),
      ],
      defenders: [
        () => ({ x: 0.86, y: 0.42 }), // barrera
        () => ({ x: 0.87, y: 0.5 }),
        () => ({ x: 0.86, y: 0.58 }),
        (t) => ({ x: 0.8, y: 0.7 }),
      ],
      ball: (t, atk) => {
        const spot = { x: 0.78, y: 0.42 };
        if (t < 0.3) return spot;
        // Indirecto: toque corto y remate
        if (t < 0.5) return lerp(spot, atk[1](0.5), (t - 0.3) / 0.2);
        return lerp(atk[1](0.5), { x: 0.93, y: 0.5 }, (t - 0.5) / 0.5);
      },
      goal: true,
      gk: true,
    },

    /* ——— Finalización extra ——— */
    sacar_ventaja: {
      duration: 4800,
      // 5vs5: llegan a campo rival, cogen balón con la mano y atacan la otra portería
      attackers: [
        (t) => ({ x: 0.12 + 0.01 * Math.sin(t * 1.5), y: 0.5, color: "#2ecc71" }),
        (t) => ({ x: 0.35 + 0.2 * ease(Math.min(1, t * 1.4)), y: 0.35 }),
        (t) => ({ x: 0.38 + 0.22 * ease(Math.min(1, t * 1.3)), y: 0.65 }),
        (t) => ({ x: 0.45 + 0.25 * ease(Math.min(1, t)), y: 0.5 }),
        (t) => ({ x: 0.32 + 0.18 * ease(Math.min(1, t * 1.2)), y: 0.22 }),
      ],
      defenders: [
        (t) => ({ x: 0.88 - 0.01 * Math.sin(t * 1.5), y: 0.5, color: "#2ecc71" }),
        (t) => ({ x: 0.62, y: 0.35 }),
        (t) => ({ x: 0.65, y: 0.55 }),
        (t) => ({ x: 0.6, y: 0.72 }),
        (t) => ({ x: 0.72, y: 0.48 }),
      ],
      ball: (t, atk) => {
        // Progresión a campo rival → “mano” (pausa) → ataque a la otra portería
        if (t < 0.35) return follow(atk[3](t), 0.03);
        if (t < 0.48) return { x: 0.68, y: 0.5 }; // coge con la mano
        if (t < 0.7) return lerp({ x: 0.68, y: 0.5 }, atk[1](0.7), (t - 0.48) / 0.22);
        return lerp(atk[1](0.7), { x: 0.08, y: 0.45 }, (t - 0.7) / 0.3);
      },
      goal: true,
      goalLeft: true,
    },

    /* ——— Juego de 5 ——— */
    ataque_5_comodin: {
      duration: 4200,
      // 5vs4 + comodín azul en línea de fondo (fuera de campo)
      attackers: [
        (t) => ({ x: 0.35 + 0.08 * Math.sin(t * 2), y: 0.5 }),
        (t) => ({ x: 0.45 + 0.06 * Math.cos(t * 2), y: 0.28 }),
        (t) => ({ x: 0.45 + 0.06 * Math.sin(t * 1.8), y: 0.72 }),
        (t) => ({ x: 0.58 + 0.08 * ease(t), y: 0.4 }),
        (t) => ({ x: 0.58 + 0.08 * ease(t), y: 0.6 }),
      ],
      defenders: [
        (t) => ({ x: 0.62 + 0.03 * Math.sin(t * 2), y: 0.35 }),
        (t) => ({ x: 0.65 + 0.03 * Math.cos(t * 2), y: 0.5 }),
        (t) => ({ x: 0.62 + 0.03 * Math.sin(t * 1.8), y: 0.68 }),
        (t) => ({ x: 0.75 + 0.02 * Math.sin(t * 2), y: 0.5 }),
      ],
      jokers: [
        () => ({ x: 0.97, y: 0.5 }), // línea de fondo, fuera del campo
      ],
      ball: (t, atk) => {
        const joker = { x: 0.97, y: 0.5 };
        if (t < 0.25) return follow(atk[0](t), 0.03);
        if (t < 0.45) return lerp(atk[0](0.25), atk[3](0.45), (t - 0.25) / 0.2);
        if (t < 0.62) return lerp(atk[3](0.45), joker, (t - 0.45) / 0.17);
        if (t < 0.78) return lerp(joker, atk[4](0.78), (t - 0.62) / 0.16);
        return lerp(atk[4](0.78), { x: 0.92, y: 0.55 }, (t - 0.78) / 0.22);
      },
      goal: true,
      goalLeft: true,
    },

    /* ——— Juego real ——— */
    partido_5v5: {
      duration: 4200,
      // 5vs5, colocación inicial 1-2-1 (diamante); portero rival = triángulo verde
      attackers: [
        (t) => ({ x: 0.12 + 0.015 * Math.sin(t * 1.5), y: 0.5, color: "#2ecc71" }), // portero
        (t) => ({ x: 0.32 + 0.02 * Math.sin(t * 2), y: 0.5 }), // cierre (1)
        (t) => ({ x: 0.42 + 0.02 * Math.cos(t * 2), y: 0.22 }), // ala (2)
        (t) => ({ x: 0.42 + 0.02 * Math.sin(t * 1.8), y: 0.78 }), // ala (2)
        (t) => ({ x: 0.48 + 0.08 * ease(t), y: 0.5 }), // pivot (1) progresa
      ],
      defenders: [
        (t) => ({ x: 0.88 - 0.015 * Math.sin(t * 1.5), y: 0.5, color: "#2ecc71" }), // portero rival
        (t) => ({ x: 0.7 + 0.02 * Math.sin(t * 2), y: 0.5 }), // cierre
        (t) => ({ x: 0.6 + 0.02 * Math.cos(t * 2), y: 0.25 }), // ala
        (t) => ({ x: 0.6 + 0.02 * Math.sin(t * 1.8), y: 0.75 }), // ala
        (t) => ({ x: 0.55 + 0.02 * Math.sin(t * 2), y: 0.5 }), // pivot
      ],
      ball: (t, atk) => {
        if (t < 0.25) return lerp(atk[1](0), atk[2](t), t / 0.25);
        if (t < 0.5) return lerp(atk[2](0.25), atk[4](0.5), (t - 0.25) / 0.25);
        if (t < 0.72) return lerp(atk[4](0.5), atk[3](0.72), (t - 0.5) / 0.22);
        return lerp(atk[3](0.72), { x: 0.9, y: 0.55 }, (t - 0.72) / 0.28);
      },
      goal: true,
      goalLeft: true,
    },

    /* ——— Otros ——— */
    otros_circulo: {
      duration: 4000,
      attackers: [
        (t) => {
          const a = t * Math.PI * 2;
          return { x: 0.5 + 0.18 * Math.cos(a), y: 0.5 + 0.18 * Math.sin(a) };
        },
        (t) => {
          const a = t * Math.PI * 2 + (Math.PI * 2) / 5;
          return { x: 0.5 + 0.18 * Math.cos(a), y: 0.5 + 0.18 * Math.sin(a) };
        },
        (t) => {
          const a = t * Math.PI * 2 + (Math.PI * 4) / 5;
          return { x: 0.5 + 0.18 * Math.cos(a), y: 0.5 + 0.18 * Math.sin(a) };
        },
        (t) => {
          const a = t * Math.PI * 2 + (Math.PI * 6) / 5;
          return { x: 0.5 + 0.18 * Math.cos(a), y: 0.5 + 0.18 * Math.sin(a) };
        },
        (t) => {
          const a = t * Math.PI * 2 + (Math.PI * 8) / 5;
          return { x: 0.5 + 0.18 * Math.cos(a), y: 0.5 + 0.18 * Math.sin(a) };
        },
      ],
      defenders: [],
      ball: null,
    },
  };

  /**
   * Movimientos tácticos por escena (coordenadas 0–1).
   * pass | shot | run | dribble
   */
  const MOVES = {
    warm_partido: [
      { type: "run", from: [0.08, 0.34], to: [0.36, 0.34] },
      { type: "run", from: [0.08, 0.66], to: [0.36, 0.66] },
    ],
    warm_ancho: [
      { type: "run", from: [0.28, 0.14], to: [0.28, 0.86] },
      { type: "run", from: [0.42, 0.14], to: [0.42, 0.86] },
      { type: "run", from: [0.56, 0.14], to: [0.56, 0.86] },
      { type: "run", from: [0.7, 0.14], to: [0.7, 0.86] },
    ],
    pedalada: [
      { type: "pass", from: [0.28, 0.28], to: [0.38, 0.48] },
      { type: "pass", from: [0.38, 0.48], to: [0.3, 0.7] },
      { type: "pass", from: [0.3, 0.7], to: [0.52, 0.35] },
      { type: "pass", from: [0.52, 0.35], to: [0.62, 0.58] },
      { type: "shot", from: [0.65, 0.58], to: [0.92, 0.5] },
    ],
    muralla: [
      { type: "run", from: [0.22, 0.18], to: [0.25, 0.62] },
      { type: "dribble", from: [0.55, 0.15], to: [0.55, 0.65] },
      { type: "run", from: [0.78, 0.2], to: [0.78, 0.6] },
    ],
    agrupacion: [
      { type: "run", from: [0.84, 0.46], to: [0.9, 0.5] },
      { type: "run", from: [0.88, 0.58], to: [0.9, 0.5] },
    ],
    tulipan: [
      { type: "pass", from: [0.3, 0.3], to: [0.55, 0.35] },
      { type: "run", from: [0.45, 0.5], to: [0.4, 0.65] },
      { type: "run", from: [0.55, 0.55], to: [0.65, 0.6] },
    ],
    relevos: [
      { type: "dribble", from: [0.15, 0.28], to: [0.7, 0.28] },
      { type: "run", from: [0.7, 0.5], to: [0.15, 0.5] },
      { type: "run", from: [0.15, 0.72], to: [0.7, 0.72] },
    ],
    rondo: [
      { type: "pass", from: [0.28, 0.28], to: [0.5, 0.18] },
      { type: "pass", from: [0.5, 0.18], to: [0.72, 0.28] },
      { type: "run", from: [0.48, 0.48], to: [0.58, 0.55] },
    ],
    pases_frente: [
      { type: "pass", from: [0.32, 0.35], to: [0.68, 0.35] },
      { type: "pass", from: [0.32, 0.65], to: [0.68, 0.65] },
    ],
    circuito_conduccion: [
      { type: "dribble", from: [0.15, 0.5], to: [0.85, 0.5] },
    ],
    la_suma: [
      { type: "shot", from: [0.55, 0.5], to: [0.92, 0.5] },
      { type: "pass", from: [0.55, 0.36], to: [0.5, 0.64] },
      { type: "shot", from: [0.45, 0.64], to: [0.08, 0.5] },
      { type: "pass", from: [0.4, 0.5], to: [0.48, 0.3] },
      { type: "shot", from: [0.55, 0.3], to: [0.92, 0.4] },
    ],
    oleadas: [
      { type: "shot", from: [0.55, 0.5], to: [0.92, 0.5] },
      { type: "pass", from: [0.45, 0.38], to: [0.5, 0.62] },
      { type: "shot", from: [0.55, 0.62], to: [0.92, 0.55] },
      { type: "pass", from: [0.4, 0.5], to: [0.48, 0.3] },
      { type: "shot", from: [0.55, 0.3], to: [0.92, 0.4] },
    ],
    sup_2v1_pasa: [
      { type: "pass", from: [0.36, 0.5], to: [0.48, 0.32] },
      { type: "run", from: [0.4, 0.5], to: [0.58, 0.48] },
      { type: "shot", from: [0.6, 0.35], to: [0.92, 0.42] },
    ],
    sup_2v1_ultimo: [
      { type: "pass", from: [0.35, 0.38], to: [0.5, 0.6] },
      { type: "run", from: [0.35, 0.4], to: [0.55, 0.42] },
      { type: "shot", from: [0.55, 0.6], to: [0.92, 0.55] },
    ],
    sup_3v1: [
      { type: "pass", from: [0.35, 0.5], to: [0.45, 0.3] },
      { type: "pass", from: [0.48, 0.3], to: [0.5, 0.68] },
      { type: "shot", from: [0.55, 0.68], to: [0.92, 0.55] },
    ],
    sup_3v2: [
      { type: "pass", from: [0.32, 0.5], to: [0.48, 0.32] },
      { type: "run", from: [0.35, 0.7], to: [0.55, 0.62] },
      { type: "shot", from: [0.55, 0.35], to: [0.92, 0.4] },
    ],
    comodines_fuera: [
      { type: "pass", from: [0.4, 0.4], to: [0.5, 0.12] },
      { type: "pass", from: [0.5, 0.12], to: [0.48, 0.62] },
      { type: "pass", from: [0.48, 0.62], to: [0.5, 0.88] },
      { type: "shot", from: [0.5, 0.45], to: [0.92, 0.48] },
    ],
    comodin_medio: [
      { type: "pass", from: [0.3, 0.3], to: [0.5, 0.5] },
      { type: "pass", from: [0.5, 0.5], to: [0.32, 0.72] },
      { type: "pass", from: [0.32, 0.72], to: [0.5, 0.5] },
      { type: "shot", from: [0.45, 0.5], to: [0.92, 0.5] },
    ],
    ronda_tiros: [
      { type: "pass", from: [0.48, 0.5], to: [0.72, 0.5] },
      { type: "run", from: [0.48, 0.5], to: [0.68, 0.5] },
      { type: "pass", from: [0.72, 0.5], to: [0.65, 0.5] },
      { type: "shot", from: [0.68, 0.5], to: [0.93, 0.5] },
    ],
    tiros_cruzados: [
      { type: "pass", from: [0.42, 0.28], to: [0.7, 0.48] },
      { type: "run", from: [0.42, 0.28], to: [0.62, 0.4] },
      { type: "pass", from: [0.7, 0.48], to: [0.62, 0.4] },
      { type: "shot", from: [0.64, 0.42], to: [0.93, 0.45] },
    ],
    tiros_2palo: [
      { type: "pass", from: [0.42, 0.28], to: [0.7, 0.48] },
      { type: "run", from: [0.42, 0.28], to: [0.6, 0.4] },
      { type: "pass", from: [0.7, 0.48], to: [0.6, 0.4] },
      { type: "pass", from: [0.62, 0.42], to: [0.86, 0.64] },
      { type: "shot", from: [0.86, 0.64], to: [0.93, 0.55] },
    ],
    fin_1v1_bandas: [
      { type: "pass", from: [0.5, 0.08], to: [0.52, 0.5] },
      { type: "dribble", from: [0.52, 0.5], to: [0.7, 0.5] },
      { type: "shot", from: [0.72, 0.5], to: [0.92, 0.5] },
    ],
    fin_2v2_bandas: [
      { type: "pass", from: [0.5, 0.92], to: [0.55, 0.62] },
      { type: "pass", from: [0.55, 0.62], to: [0.6, 0.4] },
      { type: "shot", from: [0.65, 0.4], to: [0.92, 0.42] },
    ],
    pj_5v4: [
      { type: "pass", from: [0.55, 0.5], to: [0.64, 0.28] },
      { type: "pass", from: [0.64, 0.28], to: [0.64, 0.72] },
      { type: "pass", from: [0.64, 0.72], to: [0.78, 0.35] },
      { type: "shot", from: [0.8, 0.38], to: [0.93, 0.42] },
    ],
    corner_play: [
      { type: "pass", from: [0.955, 0.07], to: [0.9, 0.55] },
      { type: "run", from: [0.78, 0.42], to: [0.88, 0.52] },
      { type: "run", from: [0.74, 0.62], to: [0.86, 0.62] },
    ],
    estrategia_banda: [
      { type: "pass", from: [0.55, 0.08], to: [0.62, 0.35] },
      { type: "run", from: [0.7, 0.55], to: [0.82, 0.55] },
      { type: "pass", from: [0.65, 0.35], to: [0.8, 0.55] },
    ],
    free_kick: [
      { type: "shot", from: [0.62, 0.35], to: [0.92, 0.5] },
      { type: "run", from: [0.75, 0.48], to: [0.85, 0.5] },
      { type: "run", from: [0.72, 0.65], to: [0.82, 0.6] },
    ],
    press_exit: [
      { type: "pass", from: [0.12, 0.5], to: [0.28, 0.28] },
      { type: "pass", from: [0.28, 0.28], to: [0.12, 0.5] },
      { type: "pass", from: [0.12, 0.5], to: [0.28, 0.72] },
      { type: "pass", from: [0.28, 0.72], to: [0.55, 0.5] },
    ],
    estrategia_cesion: [
      { type: "pass", from: [0.78, 0.42], to: [0.84, 0.55] },
      { type: "run", from: [0.7, 0.32], to: [0.8, 0.4] },
      { type: "shot", from: [0.84, 0.55], to: [0.93, 0.5] },
    ],
    partido_5v5: [
      { type: "pass", from: [0.38, 0.5], to: [0.5, 0.22] },
      { type: "pass", from: [0.5, 0.22], to: [0.64, 0.5] },
      { type: "pass", from: [0.64, 0.5], to: [0.52, 0.78] },
      { type: "shot", from: [0.55, 0.75], to: [0.9, 0.55] },
    ],
    sacar_ventaja: [
      { type: "dribble", from: [0.45, 0.5], to: [0.68, 0.5] },
      { type: "pass", from: [0.68, 0.5], to: [0.5, 0.35] },
      { type: "shot", from: [0.48, 0.35], to: [0.08, 0.45] },
    ],
    ataque_5_comodin: [
      { type: "pass", from: [0.35, 0.5], to: [0.6, 0.4] },
      { type: "pass", from: [0.6, 0.4], to: [0.97, 0.5] },
      { type: "pass", from: [0.97, 0.5], to: [0.65, 0.6] },
      { type: "shot", from: [0.68, 0.6], to: [0.92, 0.55] },
    ],
    otros_circulo: [
      { type: "run", from: [0.68, 0.5], to: [0.5, 0.68] },
      { type: "run", from: [0.5, 0.32], to: [0.68, 0.5] },
    ],
  };

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /** Ida (0→0.5) y vuelta (0.5→1) suavizada */
  function goBack(t) {
    const u = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;
    return ease(Math.max(0, Math.min(1, u)));
  }

  function lerp(a, b, t) {
    const u = Math.max(0, Math.min(1, t));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }

  function lerpPath(pts, t) {
    const n = pts.length - 1;
    const scaled = t * n;
    const i = Math.min(n - 1, Math.floor(scaled));
    return lerp(pts[i], pts[i + 1], scaled - i);
  }

  function follow(p, offset) {
    return { x: p.x + offset, y: p.y };
  }

  function rectPath(x, y, w, h, t) {
    const per = 2 * (w + h);
    let d = t * per;
    if (d < w) return { x: x + d, y };
    d -= w;
    if (d < h) return { x: x + w, y: y + d };
    d -= h;
    if (d < w) return { x: x + w - d, y: y + h };
    d -= w;
    return { x, y: y + h - d };
  }

  /**
   * Pista de fútbol sala (vista cenital).
   * fieldMode: "full" | "half"
   * half = medio campo con portería de fondo + portería en la línea de medio.
   */
  function drawPitch(ctx, w, h, scene, fieldMode = "full") {
    const half = fieldMode === "half";
    ctx.clearRect(0, 0, w, h);

    const floor = ctx.createLinearGradient(0, 0, 0, h);
    floor.addColorStop(0, "#dfe8f1");
    floor.addColorStop(0.5, "#d2dde8");
    floor.addColorStop(1, "#c5d2e0");
    ctx.fillStyle = floor;
    ctx.fillRect(0, 0, w, h);

    const left = w * 0.035;
    const top = h * 0.055;
    const right = w * 0.965;
    const bottom = h * 0.945;
    const cw = right - left;
    const ch = bottom - top;
    const midX = (left + right) / 2;
    const midY = (top + bottom) / 2;

    // Proporciones FIFA FS: largo 40×20, portería 3 m, área 6 m, doble penalti 10 m.
    // El área NUNCA debe llegar a los corners (6 m < 8,5 m hasta la banda).
    const areaR = half ? cw * 0.30 : cw * 0.15; // 6/20 o 6/40
    const spot6 = half ? cw * 0.30 : cw * 0.15;
    const spot10 = half ? cw * 0.50 : cw * 0.25;
    const goalHalf = ch * 0.075; // 1,5 m / 20 m
    const cornerR = Math.min(cw, ch) * 0.035;
    const centerR = Math.min(cw, ch) * 0.12;

    const line = "rgba(26, 31, 41, 0.4)";
    ctx.strokeStyle = line;
    ctx.lineWidth = Math.max(1.25, Math.min(w, h) * 0.006);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Contorno
    ctx.strokeRect(left, top, cw, ch);

    if (!half) {
      // Medio campo + círculo
      ctx.beginPath();
      ctx.moveTo(midX, top);
      ctx.lineTo(midX, bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(midX, midY, centerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = line;
      ctx.arc(midX, midY, Math.max(1.5, centerR * 0.06), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Etiqueta sutil de medio campo
      ctx.save();
      ctx.fillStyle = "rgba(26, 31, 41, 0.35)";
      ctx.font = `bold ${Math.max(9, w * 0.028)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("MEDIO CAMPO", midX, top + Math.max(12, h * 0.06));
      ctx.restore();
    }

    // Córners
    [
      [left, top, 0, Math.PI / 2],
      [right, top, Math.PI / 2, Math.PI],
      [right, bottom, Math.PI, (3 * Math.PI) / 2],
      [left, bottom, (3 * Math.PI) / 2, Math.PI * 2],
    ].forEach(([cx, cy, a0, a1]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, cornerR, a0, a1);
      ctx.stroke();
    });

    function drawGoalMouth(goalX, outward) {
      const depth = Math.max(3, w * 0.012);
      ctx.fillStyle = DARK;
      ctx.fillRect(
        outward < 0 ? goalX - depth : goalX,
        midY - goalHalf,
        depth,
        goalHalf * 2
      );
    }

    function drawDot(x, y, r) {
      ctx.beginPath();
      ctx.fillStyle = DARK;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    /**
     * Área FS desde postes: radio ~6 m.
     * Debe quedar un hueco claro hasta el corner (no tocar bandas).
     */
    function drawAreaAndSpots(goalX, dir, preferredR, preferred6, preferred10) {
      const postTop = midY - goalHalf;
      const postBot = midY + goalHalf;
      const distToBand = Math.min(postTop - top, bottom - postBot);
      // Máximo ~70% del camino al corner → hueco visible hasta la banda
      const maxByBand = Math.max(4, distToBand * 0.7);
      const maxByDepth = dir < 0 ? goalX - left - 2 : right - goalX - 2;
      const r = Math.max(4, Math.min(preferredR, maxByBand, maxByDepth));
      const s6 = Math.min(preferred6, r);
      const s10 = Math.min(preferred10, maxByDepth - 2);
      const lw = Math.max(1.8, Math.min(w, h) * 0.008);

      ctx.save();
      ctx.strokeStyle = "rgba(26, 31, 41, 0.75)";
      ctx.lineWidth = lw;
      ctx.beginPath();

      if (dir < 0) {
        ctx.arc(goalX, postTop, r, -Math.PI / 2, Math.PI, true);
        ctx.lineTo(goalX - r, postBot);
        ctx.arc(goalX, postBot, r, Math.PI, Math.PI / 2, true);
      } else {
        ctx.arc(goalX, postTop, r, -Math.PI / 2, 0, false);
        ctx.lineTo(goalX + r, postBot);
        ctx.arc(goalX, postBot, r, 0, Math.PI / 2, false);
      }
      ctx.stroke();
      ctx.restore();

      const dotR = Math.max(1.8, w * 0.005);
      drawDot(goalX + dir * s6, midY, dotR);
      drawDot(goalX + dir * s10, midY, dotR);
    }

    if (half) {
      // Solo área en portería derecha; izquierda = portería de medio sin área
      drawAreaAndSpots(right, -1, areaR, spot6, spot10);
      drawGoalMouth(right, -1);
      drawGoalMouth(left, 1);
    } else {
      drawAreaAndSpots(right, -1, areaR, spot6, spot10);
      drawGoalMouth(right, -1);
      drawAreaAndSpots(left, 1, areaR, spot6, spot10);
      drawGoalMouth(left, 1);
    }

    if (scene.box) {
      const b = scene.box;
      ctx.strokeStyle = "rgba(255,0,146,0.28)";
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(b.x * w, b.y * h, b.w * w, b.h * h);
      ctx.setLineDash([]);
    }
  }

  function drawAttacker(ctx, x, y, r, color = PINK) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawDefender(ctx, x, y, s, color = DARK) {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.9, y + s * 0.75);
    ctx.lineTo(x - s * 0.9, y + s * 0.75);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /** Comodín / neutro (círculo azul) */
  function drawJoker(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = BLUE;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawBall(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = BALL;
    ctx.fill();
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawCone(ctx, x, y) {
    ctx.fillStyle = "#ff6b2c";
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x - 4, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  function drawGk(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#2ecc71";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function arrowHead(ctx, x, y, angle, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - 0.4), y - size * Math.sin(angle - 0.4));
    ctx.lineTo(x - size * Math.cos(angle + 0.4), y - size * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function strokeArrowLine(ctx, x1, y1, x2, y2, opts) {
    const {
      color = DARK,
      width = 1.6,
      dash = null,
      double = false,
      wavy = false,
    } = opts || {};
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(10, len * 0.22);
    const tipX = x2;
    const tipY = y2;
    const endX = x2 - Math.cos(angle) * head * 0.85;
    const endY = y2 - Math.sin(angle) * head * 0.85;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function drawMain(offset = 0) {
      const ox = -Math.sin(angle) * offset;
      const oy = Math.cos(angle) * offset;
      ctx.beginPath();
      if (wavy) {
        const waves = Math.max(3, Math.round(len / 14));
        const amp = Math.min(5, len * 0.08);
        ctx.moveTo(x1 + ox, y1 + oy);
        for (let i = 1; i <= 24; i++) {
          const u = i / 24;
          const px = x1 + dx * u;
          const py = y1 + dy * u;
          const nx = -Math.sin(angle);
          const ny = Math.cos(angle);
          const wave = Math.sin(u * Math.PI * waves) * amp;
          ctx.lineTo(px + nx * wave + ox, py + ny * wave + oy);
        }
      } else {
        if (dash) ctx.setLineDash(dash);
        else ctx.setLineDash([]);
        ctx.moveTo(x1 + ox, y1 + oy);
        ctx.lineTo(endX + ox, endY + oy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (double) {
      drawMain(2.1);
      drawMain(-2.1);
    } else {
      drawMain(0);
    }

    arrowHead(ctx, tipX, tipY, angle, head);
    ctx.restore();
  }

  /** Leyenda de movimientos tácticos */
  function drawMove(ctx, w, h, move) {
    const x1 = move.from[0] * w;
    const y1 = move.from[1] * h;
    const x2 = move.to[0] * w;
    const y2 = move.to[1] * h;
    const scale = Math.min(w, h);
    const width = Math.max(1.4, scale * 0.008);

    switch (move.type) {
      case "shot":
        // Flecha doble línea = tiro
        strokeArrowLine(ctx, x1, y1, x2, y2, { color: DARK, width, double: true });
        break;
      case "run":
        // Flecha discontinua = desplazamiento sin balón
        strokeArrowLine(ctx, x1, y1, x2, y2, { color: "#334155", width, dash: [6, 4] });
        break;
      case "dribble":
        // Flecha serpentina = regate
        strokeArrowLine(ctx, x1, y1, x2, y2, { color: PINK, width: width * 1.05, wavy: true });
        break;
      case "pass":
      default:
        // Flecha continua = pase
        strokeArrowLine(ctx, x1, y1, x2, y2, { color: "#0f172a", width });
        break;
    }
  }

  function drawScene(ctx, w, h, key, t, options = {}) {
    const scene = SCENES[key] || SCENES.otros_circulo;
    const showMoves = options.moves !== false;
    const staticPlayers = !!options.staticPlayers;
    const fieldMode = options.fieldMode === "half" ? "half" : "full";
    const freezeT = staticPlayers ? 0.45 : t;

    drawPitch(ctx, w, h, scene, fieldMode);

    if (scene.cones) {
      scene.cones.forEach((c) => drawCone(ctx, c.x * w, c.y * h));
    }

    if (showMoves) {
      (MOVES[key] || []).forEach((m) => drawMove(ctx, w, h, m));
    }

    const scale = Math.min(w, h);
    const pr = Math.max(6, scale * 0.038);
    const dr = Math.max(7, scale * 0.042);
    const br = Math.max(3.5, scale * 0.02);

    if (scene.gk) drawGk(ctx, w * 0.9, h * 0.5, pr);
    if (scene.gkLeft) drawGk(ctx, w * 0.1, h * 0.5, pr);

    const atkFns = scene.attackers || [];
    const defFns = scene.defenders || [];
    const jokerFns = scene.jokers || [];

    atkFns.forEach((fn) => {
      const p = fn(freezeT);
      if (!p) return;
      drawAttacker(ctx, p.x * w, p.y * h, pr, p.color || PINK);
    });
    defFns.forEach((fn) => {
      const p = fn(freezeT);
      if (!p) return;
      drawDefender(ctx, p.x * w, p.y * h, dr, p.color || DARK);
    });
    jokerFns.forEach((fn) => {
      const p = fn(freezeT);
      if (!p) return;
      drawJoker(ctx, p.x * w, p.y * h, pr);
    });

    if (scene.ball) {
      const b = scene.ball(freezeT, atkFns, defFns, jokerFns);
      if (b) drawBall(ctx, b.x * w, b.y * h, br);
    }
  }

  /** Captura estática con movimientos (ideal para PDF) */
  function snapshot(key, width = 640, height = 360, options = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    drawScene(ctx, width, height, key, 0.45, {
      staticPlayers: true,
      moves: options.moves !== false,
      fieldMode: options.fieldMode === "half" ? "half" : "full",
    });
    return canvas.toDataURL("image/png");
  }

  const running = new Map();

  function mount(canvas, key, options = {}) {
    const scene = SCENES[key] || SCENES.otros_circulo;
    const ctx = canvas.getContext("2d");
    const fieldMode = options.fieldMode === "half" ? "half" : "full";
    const showMoves = options.moves === true;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    let start = performance.now();
    let raf;

    function frame(now) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const t = ((now - start) % scene.duration) / scene.duration;
      drawScene(ctx, w, h, key, t, { moves: showMoves, fieldMode });

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    const controller = {
      key,
      fieldMode,
      stop() {
        cancelAnimationFrame(raf);
        running.delete(canvas);
      },
      resize,
    };

    if (running.has(canvas)) running.get(canvas).stop();
    running.set(canvas, controller);

    return controller;
  }

  function stopAll() {
    running.forEach((c) => c.stop());
    running.clear();
  }

  return { mount, stopAll, snapshot, SCENES, MOVES };
})();
