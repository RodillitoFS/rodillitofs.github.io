(() => {
  "use strict";

  const PLAYER_COLORS = [
    { id: null, label: "Sin color", swatch: "transparent" },
    { id: "yellow", label: "Amarillo", swatch: "#f5c518" },
    { id: "pink", label: "Rosa", swatch: "#ff0092" },
    { id: "blue", label: "Azul", swatch: "#3b82f6" },
    { id: "green", label: "Verde", swatch: "#22c55e" },
    { id: "orange", label: "Naranja", swatch: "#f97316" },
    { id: "white", label: "Blanco", swatch: "#f4f6f8" },
    { id: "black", label: "Negro", swatch: "#1a1f29" },
  ];

  let personUid = 1;
  function makePerson(name, role, color) {
    return { id: personUid++, name, role, color };
  }

  const state = {
    activeCategory: CATEGORIES[0].id,
    session: [],
    players: [
      makePerson("Pablo", "gk", "yellow"),
      makePerson("Jañez", "gk", "yellow"),
      makePerson("Dani", "gk", "yellow"),
      makePerson("Alberto", "gk", "yellow"),
      makePerson("Arias", "player", null),
      makePerson("Kem", "player", null),
      makePerson("Alex", "player", null),
      makePerson("Borja", "player", null),
      makePerson("Marcos", "player", null),
      makePerson("Rodri", "player", null),
      makePerson("Josemi", "player", null),
      makePerson("Moreta", "player", null),
      makePerson("Álvaro", "player", null),
      makePerson("Guille", "player", null),
      makePerson("Obush", "player", null),
      makePerson("Doute", "player", null),
      makePerson("Iván", "player", null),
      makePerson("Javi", "player", null),
    ],
    activeColor: "pink",
    addingPlayer: false,
    nextUid: 1,
  };

  const els = {
    categoryNav: document.getElementById("category-nav"),
    catalogTitle: document.getElementById("catalog-title"),
    catalogEyebrow: document.getElementById("catalog-eyebrow"),
    catalogCount: document.getElementById("catalog-count"),
    exerciseGrid: document.getElementById("exercise-grid"),
    catalogEmpty: document.getElementById("catalog-empty"),
    sessionList: document.getElementById("session-list"),
    sessionEmpty: document.getElementById("session-empty"),
    sessionTotal: document.getElementById("session-total"),
    colorToolbar: document.getElementById("color-toolbar"),
    colorHint: document.getElementById("color-hint"),
    gkChips: document.getElementById("gk-chips"),
    playerChips: document.getElementById("player-chips"),
    playerInput: document.getElementById("player-input"),
    btnAddPlayer: document.getElementById("btn-add-player"),
    btnAddRest: document.getElementById("btn-add-rest"),
    btnClear: document.getElementById("btn-clear-template"),
    btnPrint: document.getElementById("btn-print"),
    btnPrintMobile: document.getElementById("btn-print-mobile"),
    mobilePrintBar: document.getElementById("mobile-print-bar"),
    btnTheme: document.getElementById("btn-theme"),
    themeLabel: document.getElementById("theme-label"),
    tplDate: document.getElementById("tpl-date"),
    modal: document.getElementById("exercise-modal"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close"),
  };

  const catalogAnimators = [];
  const sessionAnimators = [];

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("rodillito-theme", next);
    } catch (_) {}
    if (els.themeLabel) {
      els.themeLabel.textContent = next === "dark" ? "Claro" : "Oscuro";
    }
  }

  function catLabel(id) {
    return CATEGORIES.find((c) => c.id === id)?.label || id;
  }

  function exercisesIn(catId) {
    return EXERCISES.filter((e) => e.category === catId);
  }

  function stopList(list) {
    list.splice(0).forEach((a) => a.stop?.());
  }

  /* ——— Sidebar ——— */
  function renderCategories() {
    els.categoryNav.innerHTML = CATEGORIES.map((cat) => {
      const count = exercisesIn(cat.id).length;
      const active = cat.id === state.activeCategory ? "is-active" : "";
      return `
        <button type="button" class="cat-btn ${active}" data-cat="${cat.id}">
          <span class="cat-btn__dot"></span>
          <span>${cat.label}</span>
          <span class="cat-btn__count">${count}</span>
        </button>`;
    }).join("");

    els.categoryNav.querySelectorAll(".cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.dataset.cat;
        renderCategories();
        renderCatalog();
      });
    });
  }

  /* ——— Catalog ——— */
  function renderCatalog() {
    const list = exercisesIn(state.activeCategory);
    const label = catLabel(state.activeCategory);

    els.catalogEyebrow.textContent = "Batería";
    els.catalogTitle.textContent = label;
    els.catalogCount.textContent = `${list.length} ejercicio${list.length === 1 ? "" : "s"}`;

    stopList(catalogAnimators);
    els.exerciseGrid.innerHTML = "";

    if (!list.length) {
      els.catalogEmpty.hidden = false;
      return;
    }
    els.catalogEmpty.hidden = true;

    list.forEach((ex, i) => {
      const card = document.createElement("article");
      card.className = "exercise-card";
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="exercise-card__pitch">
          <canvas data-anim="${ex.animation}" aria-hidden="true"></canvas>
        </div>
        <div class="exercise-card__body">
          <p class="exercise-card__group">${label}</p>
          <h3 class="exercise-card__title">${ex.title}</h3>
          <p class="exercise-card__desc">${ex.description}</p>
          <div class="exercise-card__meta">
            <span>${ex.duration} min</span>
            <span>Ver detalle</span>
          </div>
          <button type="button" class="btn btn--primary btn--include" data-include="${ex.id}">
            Incluir a plantilla
          </button>
        </div>`;

      card.querySelector(".exercise-card__meta").style.cursor = "pointer";
      card.querySelector(".exercise-card__title").style.cursor = "pointer";

      const openDetail = () => openModal(ex);
      card.querySelector(".exercise-card__title").addEventListener("click", openDetail);
      card.querySelector(".exercise-card__meta").addEventListener("click", openDetail);
      card.querySelector(".exercise-card__pitch").style.cursor = "pointer";
      card.querySelector(".exercise-card__pitch").addEventListener("click", openDetail);

      card.querySelector("[data-include]").addEventListener("click", (e) => {
        e.stopPropagation();
        addExercise(ex.id);
      });

      els.exerciseGrid.appendChild(card);

      const canvas = card.querySelector("canvas");
      requestAnimationFrame(() => {
        catalogAnimators.push(PitchAnimator.mount(canvas, ex.animation));
      });
    });
  }

  /* ——— Modal ——— */
  function openModal(ex) {
    const label = catLabel(ex.category);
    els.modalBody.innerHTML = `
      <div class="modal__pitch"><canvas data-anim="${ex.animation}"></canvas></div>
      <div class="modal__info">
        <p class="modal__group">${label}</p>
        <h2 class="modal__title">${ex.title}</h2>
        <div class="modal__legend">
          <span class="legend-item"><span class="legend-dot"></span> Atacantes</span>
          <span class="legend-item"><span class="legend-tri"></span> Defensores</span>
          <span class="legend-item"><span class="legend-joker"></span> Comodín</span>
          <span class="legend-item"><span class="legend-ball"></span> Balón</span>
        </div>
        <p class="modal__desc">${ex.description}</p>
        ${ex.objective ? `<p class="modal__objective"><strong>Objetivo:</strong> ${ex.objective}</p>` : ""}
        <p class="modal__comments"><strong>Comentarios:</strong> ${ex.comments || "—"}</p>
        <button type="button" class="btn btn--primary btn--include" id="modal-include">
          Incluir a plantilla · ${ex.duration} min
        </button>
      </div>`;

    els.modal.showModal();
    const canvas = els.modalBody.querySelector("canvas");
    const anim = PitchAnimator.mount(canvas, ex.animation);
    catalogAnimators.push(anim);

    document.getElementById("modal-include").onclick = () => {
      addExercise(ex.id);
      els.modal.close();
    };
  }

  els.modalClose.addEventListener("click", () => els.modal.close());
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) els.modal.close();
  });

  /* ——— Session / Template ——— */
  function addExercise(id) {
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) return;
    const block = {
      uid: state.nextUid++,
      type: "exercise",
      exerciseId: ex.id,
      duration: ex.duration,
      comments: ex.comments || "",
      fieldMode: "full",
    };
    if (ex.customizable) {
      block.customTitle = "";
      block.customDescription = "";
    }
    state.session.push(block);
    renderSession();
    pulseTemplate();
  }

  function updateCustomField(uid, field, value) {
    const block = state.session.find((b) => b.uid === uid);
    if (!block) return;
    block[field] = value;
  }

  function blockTitle(block, ex) {
    if (ex.customizable) return (block.customTitle || "").trim() || ex.title;
    return ex.title;
  }

  function blockDescription(block, ex) {
    if (ex.customizable) {
      return (block.customDescription || "").trim() || ex.description;
    }
    return ex.description;
  }

  function addRest() {
    state.session.push({
      uid: state.nextUid++,
      type: "rest",
      duration: 3,
      title: "Descanso / hidratación",
    });
    renderSession();
  }

  function removeBlock(uid) {
    state.session = state.session.filter((b) => b.uid !== uid);
    renderSession();
  }

  function updateDuration(uid, value) {
    const block = state.session.find((b) => b.uid === uid);
    if (!block) return;
    const n = Math.max(1, Math.min(90, Number(value) || 1));
    block.duration = n;
    updateTotal();
  }

  function updateComments(uid, value) {
    const block = state.session.find((b) => b.uid === uid);
    if (block) block.comments = value;
  }

  function updateFieldMode(uid, mode) {
    const block = state.session.find((b) => b.uid === uid);
    if (!block || block.type === "rest") return;
    block.fieldMode = mode === "half" ? "half" : "full";
    renderSession();
  }

  function moveBlock(uid, direction) {
    const from = state.session.findIndex((b) => b.uid === uid);
    if (from < 0) return;
    const to = from + direction;
    if (to < 0 || to >= state.session.length) return;
    const [item] = state.session.splice(from, 1);
    state.session.splice(to, 0, item);
    renderSession();
  }

  function reorderBlock(fromUid, toUid, placeAfter) {
    if (fromUid === toUid) return;
    const from = state.session.findIndex((b) => b.uid === fromUid);
    const to = state.session.findIndex((b) => b.uid === toUid);
    if (from < 0 || to < 0) return;
    const [item] = state.session.splice(from, 1);
    let insertAt = state.session.findIndex((b) => b.uid === toUid);
    if (placeAfter) insertAt += 1;
    state.session.splice(insertAt, 0, item);
    renderSession();
  }

  function updateTotal() {
    const total = state.session.reduce((s, b) => s + (b.duration || 0), 0);
    els.sessionTotal.textContent = `${total} min`;
  }

  function pulseTemplate() {
    const panel = document.querySelector(".template");
    panel.animate(
      [
        { boxShadow: "0 0 0 0 rgba(255,0,146,0.45)" },
        { boxShadow: "0 0 0 6px rgba(255,0,146,0)" },
      ],
      { duration: 600, easing: "ease-out" }
    );
  }

  function renderSession() {
    stopList(sessionAnimators);
    updateTotal();
    els.sessionEmpty.hidden = state.session.length > 0;
    els.sessionList.innerHTML = "";

    state.session.forEach((block, index) => {
      const li = document.createElement("li");

      const orderControls = `
        <span class="drag-hint" title="Arrastrar para reordenar" aria-hidden="true">⠿</span>
        <button type="button" class="session-item__order" data-move-up="${block.uid}" aria-label="Subir" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="session-item__order" data-move-down="${block.uid}" aria-label="Bajar" ${index === state.session.length - 1 ? "disabled" : ""}>↓</button>
      `;

      li.dataset.uid = String(block.uid);

      if (block.type === "rest") {
        li.className = "session-item session-item--rest";
        li.innerHTML = `
          <div class="session-item__bar">
            ${orderControls}
            <span>Descanso</span>
            <button type="button" class="session-item__remove" data-rm="${block.uid}" aria-label="Quitar">×</button>
          </div>
          <div class="session-item__content">
            <div>
              <h4 class="session-item__title">${block.title}</h4>
              <div class="session-item__time">
                Tiempo
                <input type="number" min="1" max="30" value="${block.duration}" data-dur="${block.uid}" />
                min
              </div>
            </div>
          </div>`;
      } else {
        const ex = EXERCISES.find((e) => e.id === block.exerciseId);
        if (!ex) return;
        if (!block.fieldMode) block.fieldMode = "full";
        const isHalf = block.fieldMode === "half";
        const title = blockTitle(block, ex);
        const desc = blockDescription(block, ex);
        const customFields = ex.customizable
          ? `
              <div class="session-item__custom">
                <input type="text" data-custom-title="${block.uid}" placeholder="Nombre del ejercicio…" value="${(block.customTitle || "").replace(/"/g, "&quot;")}" />
                <textarea data-custom-desc="${block.uid}" placeholder="Descripción…">${block.customDescription || ""}</textarea>
              </div>`
          : `
              <h4 class="session-item__title">${title}</h4>
              <p class="session-item__desc">${desc}</p>
              ${ex.objective ? `<p class="session-item__objective"><strong>Objetivo:</strong> ${ex.objective}</p>` : ""}`;
        li.className = "session-item";
        li.innerHTML = `
          <div class="session-item__bar">
            ${orderControls}
            <span>${index + 1}. ${catLabel(ex.category)}</span>
            <button type="button" class="session-item__remove" data-rm="${block.uid}" aria-label="Quitar">×</button>
          </div>
          <div class="session-item__content">
            <div>
              ${customFields}
              <div class="session-item__comments">
                <textarea data-com="${block.uid}" placeholder="Comentarios…">${block.comments || ""}</textarea>
              </div>
              <div class="session-item__controls">
                <label class="session-item__time">
                  Tiempo
                  <input type="number" min="1" max="90" value="${block.duration}" data-dur="${block.uid}" />
                  min
                </label>
                <div class="field-toggle" role="group" aria-label="Tipo de campo">
                  <button type="button" class="field-toggle__btn ${!isHalf ? "is-active" : ""}" data-field="${block.uid}" data-mode="full">Entero</button>
                  <button type="button" class="field-toggle__btn ${isHalf ? "is-active" : ""}" data-field="${block.uid}" data-mode="half">Reducido</button>
                </div>
              </div>
            </div>
            <div class="session-item__pitch">
              <canvas data-anim="${ex.animation}" data-field-mode="${block.fieldMode}"></canvas>
            </div>
          </div>`;
      }

      els.sessionList.appendChild(li);

      const canvas = li.querySelector("canvas");
      if (canvas) {
        const mode = canvas.dataset.fieldMode === "half" ? "half" : "full";
        requestAnimationFrame(() => {
          sessionAnimators.push(
            PitchAnimator.mount(canvas, canvas.dataset.anim, { fieldMode: mode, moves: false })
          );
        });
      }
    });

    els.sessionList.querySelectorAll("[data-rm]").forEach((btn) => {
      btn.addEventListener("click", () => removeBlock(Number(btn.dataset.rm)));
    });
    els.sessionList.querySelectorAll("[data-dur]").forEach((input) => {
      input.addEventListener("change", () => updateDuration(Number(input.dataset.dur), input.value));
    });
    els.sessionList.querySelectorAll("[data-com]").forEach((ta) => {
      ta.addEventListener("input", () => updateComments(Number(ta.dataset.com), ta.value));
    });
    els.sessionList.querySelectorAll("[data-custom-title]").forEach((input) => {
      input.addEventListener("input", () =>
        updateCustomField(Number(input.dataset.customTitle), "customTitle", input.value)
      );
    });
    els.sessionList.querySelectorAll("[data-custom-desc]").forEach((ta) => {
      ta.addEventListener("input", () =>
        updateCustomField(Number(ta.dataset.customDesc), "customDescription", ta.value)
      );
    });
    els.sessionList.querySelectorAll("[data-field]").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateFieldMode(Number(btn.dataset.field), btn.dataset.mode);
      });
    });
    els.sessionList.querySelectorAll("[data-move-up]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveBlock(Number(btn.dataset.moveUp), -1);
      });
    });
    els.sessionList.querySelectorAll("[data-move-down]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveBlock(Number(btn.dataset.moveDown), 1);
      });
    });

    // Drag & drop desde la barra superior
    let dragUid = null;
    els.sessionList.querySelectorAll(".session-item").forEach((item) => {
      const bar = item.querySelector(".session-item__bar");
      if (bar) {
        bar.draggable = true;
        bar.addEventListener("dragstart", (e) => {
          if (e.target.closest("button")) {
            e.preventDefault();
            return;
          }
          dragUid = Number(item.dataset.uid);
          item.classList.add("is-dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(dragUid));
        });
        bar.addEventListener("dragend", () => {
          item.classList.remove("is-dragging");
          els.sessionList.querySelectorAll(".session-item").forEach((el) => {
            el.classList.remove("drag-over", "drag-over-after");
          });
          dragUid = null;
        });
      }

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const rect = item.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        item.classList.toggle("drag-over", !after);
        item.classList.toggle("drag-over-after", after);
      });
      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over", "drag-over-after");
      });
      item.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromUid = Number(e.dataTransfer.getData("text/plain") || dragUid);
        const toUid = Number(item.dataset.uid);
        const rect = item.getBoundingClientRect();
        const placeAfter = e.clientY > rect.top + rect.height / 2;
        item.classList.remove("drag-over", "drag-over-after");
        reorderBlock(fromUid, toUid, placeAfter);
      });
    });
  }

  /* ——— Players ——— */
  function activeColorMeta() {
    return PLAYER_COLORS.find((c) => c.id === state.activeColor) || PLAYER_COLORS[0];
  }

  function renderColorToolbar() {
    if (!els.colorToolbar) return;
    els.colorToolbar.innerHTML = PLAYER_COLORS.map((c) => {
      const selected = state.activeColor === c.id ? "is-selected" : "";
      const none = c.id === null ? "color-swatch--none" : "";
      const value = c.id === null ? "" : c.id;
      return `<button type="button" class="color-swatch color-swatch--toolbar ${none} ${selected}" data-active-color="${value}" title="${c.label}" style="--swatch:${c.swatch}" aria-label="${c.label}" aria-pressed="${selected ? "true" : "false"}"></button>`;
    }).join("");

    els.colorToolbar.querySelectorAll("[data-active-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = btn.dataset.activeColor;
        state.activeColor = raw ? raw : null;
        renderColorToolbar();
        updateColorHint();
      });
    });
    updateColorHint();
  }

  function updateColorHint() {
    if (!els.colorHint) return;
    const meta = activeColorMeta();
    els.colorHint.textContent = meta.id
      ? `Color activo: ${meta.label}. Toca jugadores para pintarlos.`
      : "Sin color activo. Toca jugadores para quitarles el peto.";
  }

  function chipHtml(person) {
    const colorClass = person.color ? `chip--${person.color}` : "chip--none";
    return `
      <span class="chip ${colorClass}" data-person="${person.id}">
        <button type="button" class="chip__name" data-paint="${person.id}" title="Aplicar color activo">
          <span class="chip__dot" aria-hidden="true"></span>
          ${person.name}
        </button>
        <button type="button" class="chip__remove" data-rm-player="${person.id}" aria-label="Quitar ${person.name}">×</button>
      </span>`;
  }

  function bindPlayerChipEvents(root) {
    if (!root) return;
    root.querySelectorAll("[data-paint]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.paint);
        const person = state.players.find((p) => p.id === id);
        if (!person) return;
        person.color = state.activeColor;
        renderPlayers();
      });
    });
    root.querySelectorAll("[data-rm-player]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.rmPlayer);
        state.players = state.players.filter((p) => p.id !== id);
        renderPlayers();
      });
    });
  }

  function renderPlayers() {
    const gks = state.players.filter((p) => p.role === "gk");
    const field = state.players.filter((p) => p.role === "player");
    if (els.gkChips) {
      els.gkChips.innerHTML = gks.map(chipHtml).join("");
      bindPlayerChipEvents(els.gkChips);
    }
    if (els.playerChips) {
      els.playerChips.innerHTML = field.map(chipHtml).join("");
      bindPlayerChipEvents(els.playerChips);
    }
  }

  els.btnAddPlayer.addEventListener("click", () => {
    state.addingPlayer = true;
    els.playerInput.hidden = false;
    els.playerInput.focus();
  });

  els.playerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const name = els.playerInput.value.trim();
      if (name) {
        state.players.push(makePerson(name, "player", null));
        renderPlayers();
      }
      els.playerInput.value = "";
      els.playerInput.hidden = true;
      state.addingPlayer = false;
    }
    if (e.key === "Escape") {
      els.playerInput.value = "";
      els.playerInput.hidden = true;
      state.addingPlayer = false;
    }
  });

  els.btnAddRest.addEventListener("click", addRest);

  els.btnClear.addEventListener("click", () => {
    if (state.session.length && !confirm("¿Vaciar la plantilla de la sesión?")) return;
    state.session = [];
    renderSession();
  });

  function getJsPdf() {
    return window.jspdf?.jsPDF || window.jsPDF || null;
  }

  function loadImageData(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth || 128;
          c.height = img.naturalHeight || 128;
          c.getContext("2d").drawImage(img, 0, 0);
          resolve(c.toDataURL("image/png"));
        } catch (_) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function wrapText(doc, text, maxWidth) {
    return doc.splitTextToSize(String(text || ""), maxWidth);
  }

  function colorHex(colorId) {
    const map = {
      yellow: "#F5C518",
      pink: "#FF0092",
      blue: "#3B82F6",
      green: "#22C55E",
      orange: "#F97316",
      white: "#E8E8E8",
      black: "#1A1F29",
    };
    return map[colorId] || null;
  }

  async function generatePdf() {
    const JsPDF = getJsPdf();
    if (!JsPDF) {
      alert("No se pudo cargar el generador de PDF. Recarga la página.");
      return;
    }

    const date = els.tplDate?.value || todayISO();
    const place = document.getElementById("tpl-place")?.value || "";
    const time = document.getElementById("tpl-time")?.value || "";
    const filename = `rodillito-entreno-${date}.pdf`;
    const printBtns = [els.btnPrint, els.btnPrintMobile].filter(Boolean);
    const prevLabel = "Generar PDF";
    printBtns.forEach((btn) => {
      btn.disabled = true;
      btn.textContent = "Generando…";
    });

    try {
      const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 8;
      const contentW = pageW - margin * 2;
      let y = margin;

      const ensureSpace = (need) => {
        if (y + need <= pageH - margin) return;
        doc.addPage();
        y = margin;
      };

      const PINK = [255, 0, 146];
      const INK = [20, 24, 32];
      const MUTED = [110, 118, 130];
      const LINE = [230, 233, 238];
      const SOFT = [247, 248, 250];

      const exerciseCount = state.session.filter((b) => b.type !== "rest").length;
      // Compactar más cuando hay 3+ bloques para caber en 1 página
      const compact = exerciseCount >= 3 || state.session.length >= 4;
      // Misma proporción que el campo en pantalla (~2:1, no estirar)
      const DIAGRAM_ASPECT = 2;

      // ——— Cabecera compacta ———
      const headerH = 22;
      doc.setFillColor(...INK);
      doc.roundedRect(margin, y, contentW, headerH, 3, 3, "F");

      const crestData =
        (typeof RODILLITO_CREST_DATA_URL === "string" && RODILLITO_CREST_DATA_URL) ||
        (await loadImageData("assets/escudo_rodillito.png"));
      if (crestData) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin + 2.5, y + 2.5, 17, 17, 3, 3, "F");
        try {
          doc.addImage(crestData, "JPEG", margin + 3.2, y + 3.2, 15.5, 15.5);
        } catch (_) {
          try {
            doc.addImage(crestData, "PNG", margin + 3.2, y + 3.2, 15.5, 15.5);
          } catch (e2) {
            console.warn("No se pudo pintar el escudo", e2);
          }
        }
      }

      const metaX = margin + 23;
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Rodillito FS", metaX, y + 7.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...PINK);
      doc.text("ENTRENAMIENTO", metaX + 32, y + 7.5);
      doc.setTextColor(190, 195, 205);
      doc.setFontSize(7.5);
      doc.text(`${date}  ·  ${time}`, metaX, y + 13);
      const placeLines = wrapText(doc, place, contentW - 30);
      doc.text(placeLines[0] || "", metaX, y + 18);
      y += headerH + 4;

      // ——— Asistentes compactos ———
      const gks = state.players.filter((p) => p.role === "gk");
      const field = state.players.filter((p) => p.role === "player");

      const drawPeople = (title, people) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...PINK);
        doc.text(title.toUpperCase(), margin, y);
        y += 3.2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        let x = margin;
        const chipH = 4.8;
        people.forEach((p) => {
          const label = p.name;
          const tw = doc.getTextWidth(label) + 7;
          if (x + tw > pageW - margin) {
            x = margin;
            y += chipH + 1.1;
          }
          const fill = colorHex(p.color);
          doc.setFillColor(...SOFT);
          doc.roundedRect(x, y - 0.7, tw - 1, 4.4, 2, 2, "F");
          if (fill) {
            const r = parseInt(fill.slice(1, 3), 16);
            const g = parseInt(fill.slice(3, 5), 16);
            const b = parseInt(fill.slice(5, 7), 16);
            doc.setFillColor(r, g, b);
            doc.circle(x + 1.9, y + 1.4, 1.05, "F");
          } else {
            doc.setDrawColor(180);
            doc.setLineWidth(0.2);
            doc.circle(x + 1.9, y + 1.4, 1.05, "S");
          }
          doc.setTextColor(...INK);
          doc.text(label, x + 4, y + 2.3);
          x += tw;
        });
        y += chipH + 2.5;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("Asistentes", margin, y);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.line(margin + 18, y - 1, pageW - margin, y - 1);
      y += 4;
      drawPeople("Porteros", gks);
      drawPeople("Jugadores", field);

      // ——— Leyenda en una sola línea ———
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text("Leyenda:", margin, y + 1.5);
      let lx = margin + 14;
      const legendItems = [
        { label: "Pase", draw: (x, yy) => {
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.4);
          doc.line(x, yy, x + 7, yy);
          doc.setFillColor(15, 23, 42);
          doc.triangle(x + 7, yy, x + 5.2, yy - 0.9, x + 5.2, yy + 0.9, "F");
        }},
        { label: "Tiro", draw: (x, yy) => {
          doc.setDrawColor(26, 31, 41);
          doc.setLineWidth(0.35);
          doc.line(x, yy - 0.55, x + 6.5, yy - 0.55);
          doc.line(x, yy + 0.55, x + 6.5, yy + 0.55);
          doc.setFillColor(26, 31, 41);
          doc.triangle(x + 7.2, yy, x + 5.3, yy - 1, x + 5.3, yy + 1, "F");
        }},
        { label: "Despl.", draw: (x, yy) => {
          doc.setDrawColor(51, 65, 85);
          doc.setLineWidth(0.35);
          doc.setLineDash([1, 0.7], 0);
          doc.line(x, yy, x + 7, yy);
          doc.setLineDash([]);
          doc.setFillColor(51, 65, 85);
          doc.triangle(x + 7, yy, x + 5.2, yy - 0.9, x + 5.2, yy + 0.9, "F");
        }},
        { label: "Regate", draw: (x, yy) => {
          doc.setDrawColor(...PINK);
          doc.setLineWidth(0.45);
          doc.line(x, yy, x + 1.6, yy - 1);
          doc.line(x + 1.6, yy - 1, x + 3.4, yy + 1);
          doc.line(x + 3.4, yy + 1, x + 5.2, yy - 1);
          doc.line(x + 5.2, yy - 1, x + 6.8, yy);
          doc.setFillColor(...PINK);
          doc.triangle(x + 7.4, yy, x + 5.5, yy - 0.9, x + 5.5, yy + 0.9, "F");
        }},
      ];
      legendItems.forEach((item) => {
        item.draw(lx, y + 1.2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.2);
        doc.setTextColor(...INK);
        doc.text(item.label, lx + 8.5, y + 2.1);
        lx += doc.getTextWidth(item.label) + 13;
      });
      y += 5.5;

      // ——— Sesión ———
      const total = state.session.reduce((s, b) => s + (b.duration || 0), 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("Sesión", margin, y);
      doc.setFontSize(8);
      doc.setTextColor(...PINK);
      doc.text(`${total} min`, pageW - margin, y, { align: "right" });
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.line(margin + 14, y - 1, pageW - margin - doc.getTextWidth(`${total} min`) - 3, y - 1);
      y += 4;

      if (!state.session.length) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.setFontSize(9);
        doc.text("Sin ejercicios en la plantilla.", margin, y);
      }

      for (let i = 0; i < state.session.length; i++) {
        const block = state.session[i];

        if (block.type === "rest") {
          ensureSpace(9);
          doc.setFillColor(255, 242, 249);
          doc.roundedRect(margin, y, contentW, 7.5, 2, 2, "F");
          doc.setTextColor(...PINK);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(`Descanso  ·  ${block.duration} min`, margin + 3, y + 5);
          y += 9;
          continue;
        }

        const ex = EXERCISES.find((e) => e.id === block.exerciseId);
        if (!ex) continue;

        const leftW = contentW * 0.52;
        const gap = 2.5;
        const maxDiagramW = contentW - leftW - gap;
        // Ancho del dibujo; alto derivado para no deformar (aspecto 2:1)
        const diagramW = compact ? Math.min(maxDiagramW, 68) : Math.min(maxDiagramW, 78);
        const diagramH = diagramW / DIAGRAM_ASPECT;
        const boxTop = y;

        const title = blockTitle(block, ex);
        const description = blockDescription(block, ex);
        const objective = ex.objective || "";

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        const descLines = wrapText(doc, description, leftW - 3).slice(0, compact ? 2 : 3);
        doc.setFontSize(6.5);
        const objLines = objective
          ? wrapText(doc, `Obj: ${objective}`, leftW - 3).slice(0, 1)
          : [];
        const comLines = block.comments
          ? wrapText(doc, block.comments, leftW - 3).slice(0, compact ? 1 : 2)
          : [];
        let textH = 5 + 4 + descLines.length * 2.8 + 2;
        if (objLines.length) textH += objLines.length * 2.5 + 0.5;
        if (comLines.length) textH += comLines.length * 2.6 + 1;
        textH += 4;

        let diagramImg = null;
        try {
          if (typeof PitchAnimator !== "undefined" && PitchAnimator.snapshot) {
            // Sin flechas en juego real / 5vs5 (queda más limpio en PDF)
            const noMoves =
              ex.category === "juego_real" ||
              ex.category === "juego_de_5" ||
              ex.animation === "partido_5v5" ||
              ex.animation === "pedalada" ||
              ex.animation === "sacar_ventaja" ||
              ex.animation === "ataque_5_comodin" ||
              ex.animation === "ataque_5";
            diagramImg = PitchAnimator.snapshot(ex.animation, 720, 360, {
              fieldMode: block.fieldMode === "half" ? "half" : "full",
              moves: !noMoves,
            });
          }
        } catch (_) {
          diagramImg = null;
        }

        const blockH = Math.max(textH + 2, diagramH + 4);
        ensureSpace(blockH + 2);

        doc.setFillColor(...SOFT);
        doc.roundedRect(margin, boxTop, contentW, blockH, 2, 2, "F");

        let textY = boxTop + 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        doc.setTextColor(...PINK);
        const fieldLabel = block.fieldMode === "half" ? "REDUCIDO" : "ENTERO";
        doc.text(
          `${String(i + 1).padStart(2, "0")} · ${catLabel(ex.category).toUpperCase()} · ${fieldLabel}`,
          margin + 2.5,
          textY
        );
        textY += 3.6;

        doc.setTextColor(...INK);
        doc.setFontSize(9);
        doc.text(title, margin + 2.5, textY);
        textY += 3.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text(descLines, margin + 2.5, textY);
        textY += descLines.length * 2.8 + 0.8;

        if (objLines.length) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.3);
          doc.setTextColor(...PINK);
          doc.text(objLines, margin + 2.5, textY);
          textY += objLines.length * 2.5 + 0.5;
        }

        if (comLines.length) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(130, 130, 140);
          doc.text(comLines, margin + 2.5, textY);
          textY += comLines.length * 2.6 + 0.6;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        const timeLabel = `${block.duration} min`;
        const timeW = doc.getTextWidth(timeLabel) + 4;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin + 2.5, textY - 0.3, timeW, 4.2, 1.5, 1.5, "F");
        doc.setTextColor(...PINK);
        doc.text(timeLabel, margin + 4.5, textY + 2.5);

        if (diagramImg) {
          const imgX = margin + contentW - diagramW - 2;
          const imgY = boxTop + (blockH - diagramH) / 2;
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(imgX, imgY, diagramW, diagramH, 2, 2, "F");
          doc.addImage(diagramImg, "PNG", imgX, imgY, diagramW, diagramH);
        }

        y = boxTop + blockH + 2;
      }

      doc.save(filename);
    } catch (err) {
      console.error("PDF error:", err);
      alert("No se pudo generar el PDF: " + (err?.message || "error desconocido"));
    } finally {
      printBtns.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = prevLabel;
      });
    }
  }

  els.btnPrint?.addEventListener("click", () => {
    generatePdf();
  });
  els.btnPrintMobile?.addEventListener("click", () => {
    generatePdf();
  });

  function syncMobilePrintBar() {
    const mobile = document.documentElement.classList.contains("is-mobile");
    if (els.mobilePrintBar) els.mobilePrintBar.hidden = !mobile;
  }
  syncMobilePrintBar();
  window.addEventListener("resize", syncMobilePrintBar);
  window.addEventListener("orientationchange", syncMobilePrintBar);

  els.btnTheme?.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  /* ——— Init ——— */
  function init() {
    applyTheme(currentTheme());
    els.tplDate.value = todayISO();
    renderCategories();
    renderCatalog();
    renderColorToolbar();
    renderPlayers();
    renderSession();
  }

  init();
})();
