/* ===========================================================
   INNOVA 504 — Ecosistema ARROW
   main.js  ·  constelación, nodos, i18n, scroll
   =========================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. HEADER scroll state
  --------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     2. REVEAL on scroll
  --------------------------------------------------------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------------------------------------------------------
     3. PARTICLE CONSTELLATION (canvas background)
  --------------------------------------------------------- */
  const canvas = document.querySelector(".particles");
  const ctx = canvas.getContext("2d");
  let W, H, DPR, particles = [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.min(90, Math.round((W * H) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,200,230,0.55)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          const a = (1 - d / 130) * 0.22;
          ctx.strokeStyle = `rgba(251,191,36,${a})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(drawParticles);
  }

  let rafId;
  sizeCanvas();
  if (!reduced) {
    drawParticles();
  } else {
    drawParticles();           // one static frame
    cancelAnimationFrame(rafId);
  }

  /* ---------------------------------------------------------
     4. NODE LINKS — connect core to app nodes + flux pulses
  --------------------------------------------------------- */
  const constellation = document.querySelector(".constellation");
  const svg = document.querySelector(".links");
  const core = document.querySelector(".node--core");
  const appNodes = Array.from(document.querySelectorAll(".node--app"));
  const colorFor = { gold: "#f59e0e", blue: "#3b82f6", teal: "#14b8a6" };
  let lineEls = [], pulseEls = [], geo = [], revealed = false;

  function centerOf(el) {
    const cr = constellation.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 };
  }

  function buildLinks() {
    svg.innerHTML = "";
    lineEls = []; pulseEls = []; geo = [];
    const cr = constellation.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
    const c = centerOf(core);
    // tile center, not label center
    appNodes.forEach((n, i) => {
      const tile = n.querySelector(".tile");
      const a = centerOf(tile);
      const color = colorFor[n.dataset.color] || "#fbbf24";

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", c.x); line.setAttribute("y1", c.y);
      line.setAttribute("x2", a.x); line.setAttribute("y2", a.y);
      line.setAttribute("stroke", color);
      line.setAttribute("class", "link-line");
      line.dataset.target = n.classList.contains("soon") ? "0.35" : "0.7";
      line.style.transition = "opacity .7s ease";
      line.style.opacity = revealed ? line.dataset.target : "0";
      svg.appendChild(line);
      lineEls.push(line);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", 2.8);
      dot.setAttribute("fill", color);
      dot.setAttribute("class", "pulse-dot");
      svg.appendChild(dot);
      pulseEls.push(dot);

      geo.push({ c, a, t: i / appNodes.length });
    });
  }

  function animatePulses() {
    const speed = 0.0045;
    for (let i = 0; i < geo.length; i++) {
      geo[i].t = (geo[i].t + speed) % 1;
      const { c, a, t } = geo[i];
      pulseEls[i].setAttribute("cx", c.x + (a.x - c.x) * t);
      pulseEls[i].setAttribute("cy", c.y + (a.y - c.y) * t);
      pulseEls[i].style.opacity = (Math.sin(t * Math.PI) * 0.9).toFixed(2);
    }
    pulseRaf = requestAnimationFrame(animatePulses);
  }

  let pulseRaf;
  function startLinks() {
    buildLinks();
    cancelAnimationFrame(pulseRaf);
    if (!reduced) animatePulses();
    revealSequence();
  }

  // Encendido escalonado: el núcleo "enciende" cada app y su enlace
  function revealSequence() {
    if (revealed) {
      lineEls.forEach((l) => (l.style.opacity = l.dataset.target));
      appNodes.forEach((n) => n.classList.add("lit"));
      return;
    }
    if (reduced) {
      lineEls.forEach((l) => (l.style.opacity = l.dataset.target));
      appNodes.forEach((n) => n.classList.add("lit"));
      revealed = true;
      return;
    }
    appNodes.forEach((n, i) => {
      setTimeout(() => {
        n.classList.add("lit");
        if (lineEls[i]) lineEls[i].style.opacity = lineEls[i].dataset.target;
      }, 650 + i * 320);
    });
    revealed = true;
  }
  // wait a frame for layout/fonts
  requestAnimationFrame(() => requestAnimationFrame(startLinks));

  /* ---------------------------------------------------------
     5. App-card spotlight follow (subtle)
  --------------------------------------------------------- */
  document.querySelectorAll(".app-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    });
  });

  /* ---------------------------------------------------------
     6. RESIZE
  --------------------------------------------------------- */
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      sizeCanvas();
      startLinks();
    }, 160);
  });

  /* ---------------------------------------------------------
     7. i18n  (ES / EN)
  --------------------------------------------------------- */
  const dict = {
    es: {
      "nav.eco": "Ecosistema",
      "nav.about": "Nosotros",
      "nav.contact": "Contacto",
      "hero.eyebrow": "Construcción · Diseño · Software",
      "hero.h1a": "Un núcleo,",
      "hero.h1b": "un ecosistema completo.",
      "hero.lead": "INNOVA 504 construye y diseña — y ahora también crea software. ARROW es el núcleo del que derivan nuestras aplicaciones para la industria de la construcción.",
      "hero.cta1": "Explorar el ecosistema",
      "hero.cta2": "Conocer INNOVA 504",
      "hero.stat1label": "Apps activas",
      "hero.stat2label": "Núcleo conectado",
      "hero.stat3label": "En desarrollo",
      "core.sub": "Núcleo",
      "scroll": "Descubre",
      "eco.eyebrow": "Una suite, una obra completa",
      "eco.h2": "El ecosistema ARROW",
      "eco.p": "Cada aplicación nace del mismo núcleo y comparte datos, diseño y filosofía. Crece contigo: hoy gestión y presupuestos, mañana mucho más.",
      "app.arrow.role": "Gestión de obras",
      "app.arrow.desc": "Planifica, controla y da seguimiento a tus proyectos de construcción desde un solo lugar.",
      "app.budget.role": "Presupuestos de obra",
      "app.budget.desc": "Presupuestos, materiales, mano de obra e indirectos con precisión. Catálogos, revisiones y reportes listos para descargar.",
      "app.dove.role": "Próximamente",
      "app.dove.desc": "La próxima pieza del ecosistema ARROW. Estamos construyendo algo nuevo para ti.",
      "status.live": "Activo",
      "status.soon": "Próximo",
      "visit": "Visitar",
      "visit.soon": "Muy pronto",
      "about.eyebrow": "Quiénes somos",
      "about.h2": "Construimos, diseñamos y programamos.",
      "about.p": "INNOVA 504 es una empresa de construcción y diseño. Hoy llevamos esa misma exigencia al software, creando herramientas afines que digitalizan y simplifican el día a día de la obra.",
      "foot.tag": "El núcleo del que deriva todo un ecosistema para la construcción.",
      "foot.eco": "Ecosistema",
      "foot.company": "Empresa",
      "foot.about": "Nosotros",
      "foot.contact": "Contacto",
      "foot.rights": "Todos los derechos reservados.",
    },
    en: {
      "nav.eco": "Ecosystem",
      "nav.about": "About",
      "nav.contact": "Contact",
      "hero.eyebrow": "Construction · Design · Software",
      "hero.h1a": "One core,",
      "hero.h1b": "a complete ecosystem.",
      "hero.lead": "INNOVA 504 builds and designs — and now also creates software. ARROW is the core from which our applications for the construction industry derive.",
      "hero.cta1": "Explore the ecosystem",
      "hero.cta2": "About INNOVA 504",
      "hero.stat1label": "Active apps",
      "hero.stat2label": "Connected core",
      "hero.stat3label": "In development",
      "core.sub": "Core",
      "scroll": "Discover",
      "eco.eyebrow": "One suite, one complete build",
      "eco.h2": "The ARROW ecosystem",
      "eco.p": "Every app is born from the same core and shares data, design and philosophy. It grows with you: management and budgets today, much more tomorrow.",
      "app.arrow.role": "Project management",
      "app.arrow.desc": "Plan, control and track your construction projects from a single place.",
      "app.budget.role": "Construction budgets",
      "app.budget.desc": "Budgets, materials, labor and overhead with precision. Catalogs, revisions and reports ready to download.",
      "app.dove.role": "Coming soon",
      "app.dove.desc": "The next piece of the ARROW ecosystem. We're building something new for you.",
      "status.live": "Active",
      "status.soon": "Soon",
      "visit": "Visit",
      "visit.soon": "Coming soon",
      "about.eyebrow": "Who we are",
      "about.h2": "We build, design and code.",
      "about.p": "INNOVA 504 is a construction and design company. Today we bring that same standard to software, creating related tools that digitize and simplify daily life on the job site.",
      "foot.tag": "The core from which an entire ecosystem for construction derives.",
      "foot.eco": "Ecosystem",
      "foot.company": "Company",
      "foot.about": "About",
      "foot.contact": "Contact",
      "foot.rights": "All rights reserved.",
    },
  };

  function applyLang(lang) {
    const d = dict[lang] || dict.es;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll(".lang-toggle button").forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    try { localStorage.setItem("innova504-lang", lang); } catch (e) {}
  }

  document.querySelectorAll(".lang-toggle button").forEach((b) =>
    b.addEventListener("click", () => applyLang(b.dataset.lang))
  );

  let saved = "es";
  try { saved = localStorage.getItem("innova504-lang") || (navigator.language || "es").slice(0, 2); } catch (e) {}
  applyLang(dict[saved] ? saved : "es");
})();
