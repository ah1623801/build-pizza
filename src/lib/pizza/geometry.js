// src/lib/pizza/geometry.js
"use client";

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smooth = (a, b, x) => {
  x = clamp((x - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

let _uid = 0;
export const nid = (p) => p + (++_uid);

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function wobbleCircle(cx, cy, r, pts, jag) {
  pts = pts || 14;
  jag = jag == null ? 0.06 : jag;
  const p = [];
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (1 - jag + rand(0, 2 * jag));
    p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = '';
  for (let i = 0; i < pts; i++) {
    const p0 = p[(i - 1 + pts) % pts],
      p1 = p[i],
      p2 = p[(i + 1) % pts],
      p3 = p[(i + 2) % pts];
    if (i === 0) d += 'M ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' ';
    const c1x = p1[0] + (p2[0] - p0[0]) / 6,
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6,
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += 'C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + ' ';
  }
  return d + 'Z';
}

export function mkSVG(vb, body) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 ' + vb + ' ' + vb);
  s.innerHTML = body;
  return s;
}

export function speckles(cx, cy, r, n, cmin, cmax, color, op) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      rr = Math.sqrt(Math.random()) * r;
    out +=
      '<circle cx="' +
      (cx + Math.cos(a) * rr).toFixed(1) +
      '" cy="' +
      (cy + Math.sin(a) * rr).toFixed(1) +
      '" r="' +
      rand(cmin, cmax).toFixed(1) +
      '" fill="' +
      color +
      '" opacity="' +
      rand(op * 0.5, op).toFixed(2) +
      '"/>';
  }
  return out;
}

export function scatterPoints(n, o) {
  o = o || {};
  const rMax = o.rMax != null ? o.rMax : 0.72,
    minD = o.minD != null ? o.minD : 0.12,
    rMin = o.rMin != null ? o.rMin : 0.05;
  const occ = o.occ || [];
  const pts = [];
  for (let i = 0; i < n; i++) {
    let best = null,
      bestND = -1;
    for (let t = 0; t < 64; t++) {
      const a = Math.random() * Math.PI * 2;
      const r = rMin + Math.sqrt(Math.random()) * (rMax - rMin);
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      let nd = Infinity;
      const all = occ.concat(pts);
      for (const p of all) {
        const dx = p.x - x,
          dy = p.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < nd) nd = d2;
      }
      if (nd >= minD) {
        best = { x, y };
        break;
      }
      if (nd > bestND) {
        bestND = nd;
        best = { x, y };
      }
    }
    pts.push(best);
  }
  for (let pass = 0; pass < 3; pass++) {
    for (const p of pts) {
      for (const q of pts) {
        if (p === q) continue;
        const dx = p.x - q.x,
          dy = p.y - q.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const want = minD * 0.72;
        if (d < want) {
          const f = ((want - d) / d) * 0.5;
          p.x += dx * f;
          p.y += dy * f;
        }
      }
      const r = Math.hypot(p.x, p.y);
      if (r > rMax) {
        p.x *= rMax / r;
        p.y *= rMax / r;
      }
      if (r < rMin && r > 0) {
        p.x *= rMin / r;
        p.y *= rMin / r;
      }
    }
  }
  return pts.map((p) => ({ x: p.x, y: p.y, rot: rand(-170, 170), s: rand(0.85, 1.2) }));
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
export function phyPoints(n, o) {
  o = o || {};
  const rMax = o.rMax != null ? o.rMax : 0.66;
  const rot0 = rand(0, 6.283),
    jA = 0.26,
    jR = 0.045;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const r = rMax * Math.sqrt((i + 0.5) / n);
    const a = rot0 + i * GOLDEN + rand(-jA, jA);
    const rr = Math.max(0.02, r + rand(-jR, jR) * rMax);
    pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
  }
  return pts;
}

export function resolvePts(raw, o) {
  const minD = o.minD || 0.12,
    occ = o.occ || [],
    rB = o.rBound || 0.74;
  const placed = [],
    out = [];
  for (const p of raw) {
    let best = null,
      bestNd = -1;
    for (let k = 0; k < 12; k++) {
      const c =
        k === 0
          ? { x: p.x, y: p.y }
          : { x: p.x + Math.cos(rand(0, 6.283)) * rand(0.02, minD * 1.5), y: p.y + Math.sin(rand(0, 6.283)) * rand(0.02, minD * 1.5) };
      let nd = Infinity;
      for (const q of occ) {
        const d = Math.hypot(q.x - c.x, q.y - c.y);
        if (d < nd) nd = d;
      }
      for (const q of placed) {
        const d = Math.hypot(q.x - c.x, q.y - c.y);
        if (d < nd) nd = d;
      }
      const r = Math.hypot(c.x, c.y);
      if (r > rB) nd -= (r - rB) * 2;
      if (k === 0) nd += 0.015;
      if (nd > bestNd) {
        bestNd = nd;
        best = c;
      }
    }
    const r = Math.hypot(best.x, best.y);
    if (r > rB) best = { x: (best.x * rB) / r, y: (best.y * rB) / r };
    placed.push(best);
    out.push({ x: best.x, y: best.y, rot: rand(-170, 170), s: rand(0.85, 1.2) });
  }
  return out;
}

export function wavyPath() {
  let y = rand(16, 84);
  let d = 'M -4 ' + y.toFixed(1);
  const seg = 5,
    step = 108 / seg;
  for (let i = 1; i <= seg; i++) {
    const nx = -4 + step * i,
      ny = clamp(y + rand(-14, 14), 8, 92);
    d += ' Q ' + (-4 + step * (i - 0.5)).toFixed(1) + ' ' + (y + rand(-10, 10)).toFixed(1) + ' ' + nx.toFixed(1) + ' ' + ny.toFixed(1);
    y = ny;
  }
  return d;
}

export function dropPiece(st, el, p, cfg, speed, idx) {
  const gsap = window.gsap;
  if (!gsap) return;
  const a = window.innerWidth <= 980 ? { dur: 0.5, bounce: true } : cfg.anim || {};
  const H = st.el.clientHeight || 420;
  gsap.set(el, { xPercent: -50, yPercent: -50, force3D: true });
  if (speed <= 0) {
    gsap.set(el, { rotation: p.rot });
    return;
  }
  const dur = (a.dur || 0.6) * (0.8 + Math.random() * 0.4) * speed;
  const tl = gsap.timeline({ delay: ((idx || 0) * (a.rapid ? 0.02 : 0.04) + Math.random() * 0.08) * speed });
  tl.fromTo(
    el,
    { y: -H * 0.7, x: rand(-0.05, 0.05) * H, rotation: p.rot + (a.spin || 90) * (Math.random() < 0.5 ? -1 : 1), scale: 1.05 },
    { y: 0, x: 0, rotation: p.rot, scale: 1, duration: dur, ease: 'power2.out', force3D: true }
  );
  if (a.bounce) {
    tl.to(el, { y: -H * 0.025, duration: 0.1, ease: 'power1.out' }).to(el, { y: 0, duration: 0.12, ease: 'power2.in', force3D: true });
  }
}
