/* ===========================================================
   INNOVA 504 — neural.js
   Malla "red neuronal / Jarvis" que se ensambla desde el núcleo,
   se re-teje y dispara señales. Capa dedicada dentro de .constellation
   =========================================================== */
(function () {
  "use strict";

  const box = document.querySelector(".constellation");
  if (!box) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "neural";
  canvas.setAttribute("aria-hidden", "true");
  box.insertBefore(canvas, box.firstChild);
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let neurons = [];
  let signals = [];
  let boot = 0;            // 0→1 ensamblaje inicial
  let booted = false;
  let t = 0;

  function center(el) {
    const br = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - br.left + r.width / 2, y: r.top - br.top + r.height / 2 };
  }
  function anchorEls() {
    const core = box.querySelector(".node--core .core-disc");
    const tiles = Array.from(box.querySelectorAll(".node--app .tile"));
    return core ? [core, ...tiles] : tiles;
  }

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = box.clientWidth;
    H = box.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    const cx = W / 2, cy = H / 2;
    const margin = Math.min(W, H) * 0.06;
    const N = Math.max(10, Math.min(20, Math.round(W / 32)));
    neurons = Array.from({ length: N }, () => {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.min(W, H) * (0.16 + Math.random() * 0.34);
      return {
        hx: cx + Math.cos(ang) * rad,   // "home" (deriva lenta)
        hy: cy + Math.sin(ang) * rad,
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        ph: Math.random() * Math.PI * 2,
        fa: 0.5 + Math.random(),
        r: Math.random() * 1.5 + 1,
      };
    });
    neurons._margin = margin;
    signals = [];
  }

  function points() {
    // anclas fijas (núcleo + apps) primero, luego neuronas
    const anchors = anchorEls().map((el, i) => {
      const c = center(el);
      return { x: c.x, y: c.y, anchor: true, core: i === 0 };
    });
    const b = boot * boot * (3 - 2 * boot); // smoothstep
    const cx = W / 2, cy = H / 2;
    const np = neurons.map((n) => {
      const fx = Math.sin(t * 0.0008 * n.fa + n.ph) * 6;
      const fy = Math.cos(t * 0.0007 * n.fa + n.ph) * 6;
      const tx = n.hx + fx, ty = n.hy + fy;
      n.x = cx + (tx - cx) * b;
      n.y = cy + (ty - cy) * b;
      return { x: n.x, y: n.y, anchor: false };
    });
    return anchors.concat(np);
  }

  function step() {
    t += 16;
    if (!booted) {
      boot += (1 - boot) * 0.025;
      if (boot > 0.995) { boot = 1; booted = true; }
    }
    // deriva lenta de los "home" de las neuronas
    const m = neurons._margin || 24;
    for (const n of neurons) {
      n.hx += n.vx; n.hy += n.vy;
      if (n.hx < m) { n.hx = m; n.vx *= -1; }
      if (n.hx > W - m) { n.hx = W - m; n.vx *= -1; }
      if (n.hy < m) { n.hy = m; n.vy *= -1; }
      if (n.hy > H - m) { n.hy = H - m; n.vy *= -1; }
    }

    const pts = points();
    const R = Math.min(W, H) * 0.26;
    const vis = Math.min(1, boot * 1.1);

    ctx.clearRect(0, 0, W, H);

    // --- enlaces (red que se re-teje) ---
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], bb = pts[j];
        const dx = a.x - bb.x, dy = a.y - bb.y;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const k = (1 - d / R);
          const near = a.core || bb.core;
          const alpha = k * (near ? 0.34 : 0.14) * vis;
          if (alpha < 0.012) continue;
          ctx.strokeStyle = near
            ? `rgba(251,191,36,${alpha})`
            : `rgba(125,170,235,${alpha})`;
          ctx.lineWidth = near ? 0.9 : 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bb.x, bb.y);
          ctx.stroke();
        }
      }
    }

    // --- neuronas (puntos) ---
    for (let i = anchorEls().length; i < pts.length; i++) {
      const p = pts[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,210,240,${0.5 * vis})`;
      ctx.fill();
    }

    // --- señales viajando por la malla ---
    if (booted && !reduced && Math.random() < 0.06 && signals.length < 10) {
      const a = Math.floor(Math.random() * pts.length);
      let b2 = Math.floor(Math.random() * pts.length);
      if (b2 === a) b2 = (b2 + 1) % pts.length;
      const A = pts[a], B = pts[b2];
      if (Math.hypot(A.x - B.x, A.y - B.y) < R * 1.4) {
        const gold = pts[a].core || pts[b2].core;
        signals.push({ ax: A.x, ay: A.y, bx: B.x, by: B.y, t: 0, sp: 0.02 + Math.random() * 0.02, gold });
      }
    }
    for (let s = signals.length - 1; s >= 0; s--) {
      const sg = signals[s];
      sg.t += sg.sp;
      if (sg.t >= 1) { signals.splice(s, 1); continue; }
      const x = sg.ax + (sg.bx - sg.ax) * sg.t;
      const y = sg.ay + (sg.by - sg.ay) * sg.t;
      const fade = Math.sin(sg.t * Math.PI);
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = sg.gold
        ? `rgba(252,211,77,${0.9 * fade})`
        : `rgba(150,190,255,${0.85 * fade})`;
      ctx.shadowColor = sg.gold ? "rgba(252,211,77,0.9)" : "rgba(150,190,255,0.9)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    raf = requestAnimationFrame(step);
  }

  let raf;
  function start() {
    size();
    cancelAnimationFrame(raf);
    if (reduced) { booted = true; boot = 1; step(); cancelAnimationFrame(raf); }
    else step();
  }

  // arranca tras layout/fuentes
  requestAnimationFrame(() => requestAnimationFrame(start));

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { boot = booted ? 1 : boot; size(); }, 160);
  });
})();
