// src/lib/pizza/stage.js
"use client";

import { rand, phyPoints, resolvePts, scatterPoints, dropPiece, wavyPath } from './geometry';
import {
  IMG,
  TOPCFG,
  CHEESE_CFG,
  CHEESE_SIZE,
  DRIZZLES,
  F_RAW,
  F_DOUGH_C,
  F_TOP_C,
  F_VEG_C,
  F_SAUCE_C
} from './config';
import { sauceSVG, mozSliceSVG, meltSVG, SVGF } from './toppings';

export const loadImg = (u) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = u;
  });

export let DOUGH_SRC = {
  thin: IMG.doughThin,
  classic: IMG.doughClassic,
  thick: IMG.doughThick,
  cheese: IMG.doughCheese
};

export async function cutout(url) {
  // Dough images are pre-trimmed and transparent; return url directly without expensive CPU loops
  return url;
}

export class PizzaStage {
  constructor(host, opts) {
    const gsap = window.gsap;
    opts = opts || {};
    this.mini = Boolean(opts.mini);
    this.groups = {};
    this.occupied = [];
    this.drzEls = {};
    this.cooked = false;
    this.uid = Math.random().toString(36).slice(2, 7);
    this.state = { dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] };
    host.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'pz' + (this.mini ? ' mini' : '');
    root.innerHTML =
      '<div class="pz-scale"><div class="pz-rot">' +
      '<div class="ly l-dough"><img data-d="thin" src="' +
      DOUGH_SRC.thin +
      '" alt=""><img data-d="classic" src="' +
      DOUGH_SRC.classic +
      '" alt=""><img data-d="thick" src="' +
      DOUGH_SRC.thick +
      '" alt=""><img data-d="cheese" src="' +
      DOUGH_SRC.cheese +
      '" alt=""></div>' +
      '<div class="ly l-sauce"><div class="sauce-mask"></div></div>' +
      '<div class="sauce-ring"></div>' +
      '<div class="ly l-cheese"></div>' +
      '<div class="ly l-cooked"></div>' +
      '<div class="ly l-tops"></div>' +
      '<div class="ly l-drz"><svg class="drz-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="gTruf' +
      this.uid +
      '"><stop offset="0%" stop-color="rgba(255,226,150,.95)"/><stop offset="60%" stop-color="rgba(190,140,60,.5)"/><stop offset="100%" stop-color="rgba(190,140,60,0)"/></radialGradient></defs><g class="drz-clip"></g></svg></div>' +
      '<div class="ly l-char"></div><div class="ly l-fx"></div></div></div>';
    host.appendChild(root);
    this.el = root;
    this.q = (s) => root.querySelector(s);
    this.doughImgs = [...root.querySelectorAll('.l-dough img')];
    this.mask = this.q('.sauce-mask');
    this.ring = this.q('.sauce-ring');
    this.cheeseL = this.q('.l-cheese');
    this.cookedWrap = this.q('.l-cooked');
    this.cookedWrap.appendChild(meltSVG());
    this.topsL = this.q('.l-tops');
    this.drzG = this.q('.drz-clip');
    this.charL = this.q('.l-char');
    this.fxL = this.q('.l-fx');
    this.doughImgs.forEach((im, i) => {
      im.style.filter = F_RAW;
      im.style.opacity = i === 1 ? 1 : 0;
    });
    this.mask.style.filter = F_RAW;
    for (let k = 0; k < 11; k++) {
      const d = document.createElement('i');
      d.className = 'char';
      const a = Math.random() * 6.283,
        r = rand(0.8, 0.94),
        s = rand(3, 7.5);
      d.style.width = s + '%';
      d.style.height = s + '%';
      d.style.left = 50 + Math.cos(a) * r * 50 - s / 2 + '%';
      d.style.top = 50 + Math.sin(a) * r * 50 - s / 2 + '%';
      this.charL.appendChild(d);
    }
    this.charSpots = [...this.charL.children];
  }

  setDough(id, speed) {
    const gsap = window.gsap;
    speed = speed == null ? 1 : speed;
    this.state.dough = id;
    const map = { thin: 0, classic: 1, thick: 2, cheese: 3 };
    this.doughImgs.forEach((im, i) => {
      if (gsap) gsap.to(im, { opacity: i === map[id] ? 1 : 0, duration: speed > 0 ? 0.8 : 0, ease: 'power2.inOut' });
      else im.style.opacity = i === map[id] ? 1 : 0;
    });
    const sc = { thin: 0.96, classic: 1, thick: 1.05, cheese: 1.02 }[id];
    if (gsap) gsap.to(this.q('.pz-scale'), { scale: sc, duration: speed > 0 ? 1 : 0, ease: 'elastic.out(1,.55)' });
  }

  setSauce(id, speed) {
    const gsap = window.gsap;
    speed = speed == null ? 1 : speed;
    const prev = this.state.sauce;
    this.state.sauce = id;
    this.mask.innerHTML = '';
    this.mask.appendChild(sauceSVG(id));
    if (!gsap) {
      this.mask.style.clipPath = 'circle(73% at 50% 50%)';
      return;
    }
    if (!prev || speed <= 0) {
      gsap.fromTo(
        this.mask,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(73% at 50% 50%)', duration: speed > 0 ? 1.1 : 0, ease: 'power3.out' }
      );
    } else {
      gsap.to(this.mask, {
        clipPath: 'circle(12% at 50% 50%)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.to(this.mask, { clipPath: 'circle(73% at 50% 50%)', duration: 0.9, ease: 'power3.out' })
      });
    }
  }

  setCheese(id, speed) {
    speed = speed == null ? 1 : speed;
    this.state.cheese = id;
    this.clearGroup('cheese', speed);
    const cfg = CHEESE_CFG[id];
    const fl = id === 'four' ? 'sepia(.18) saturate(1.12)' : id === 'smoked' ? 'sepia(.35) saturate(.95) brightness(.97)' : 'none';
    this.cheeseL.style.filter = fl;
    this.cookedWrap.style.filter = fl;
    const pts = resolvePts(phyPoints(cfg.n, { rMax: 0.6 }), { minD: 0.14, occ: this.occupied, rBound: 0.68 });
    if (!this.groups.cheese) this.groups.cheese = [];
    pts.forEach((p, i) => {
      const el = document.createElement('i');
      el.className = 'top';
      el.style.width = CHEESE_SIZE * 100 * p.s + '%';
      el.style.left = 50 + p.x * 46 + '%';
      el.style.top = 50 + p.y * 46 + '%';
      el.style.zIndex = 1 + ((Math.random() * 14) | 0);
      const sv = mozSliceSVG(cfg.v);
      sv.dataset.kind = 'cheese';
      el.appendChild(sv);
      this.cheeseL.appendChild(el);
      const occ = { x: p.x, y: p.y };
      this.occupied.push(occ);
      this.groups.cheese.push({ el, occ });
      dropPiece(this, el, p, { anim: { dur: 0.62, bounce: true } }, speed, i);
    });
  }

  sprinkle(id, count, cfg, speed) {
    const minD = cfg.size * 0.92;
    const rMax = cfg.size > 0.12 ? 0.66 : cfg.size > 0.08 ? 0.7 : 0.74;
    let pts;
    if (cfg.dist === 'phy') pts = resolvePts(phyPoints(count, { rMax }), { minD, occ: this.occupied, rBound: rMax + 0.06 });
    else pts = scatterPoints(count, { rMax, minD, occ: this.occupied });
    if (!this.groups[id]) this.groups[id] = [];
    pts.forEach((p, i) => {
      const el = document.createElement('i');
      el.className = 'top' + (cfg.shadow === false ? ' ns' : '');
      el.style.width = cfg.size * 100 * p.s + '%';
      el.style.left = 50 + p.x * 46 + '%';
      el.style.top = 50 + p.y * 46 + '%';
      el.style.zIndex = 2 + ((Math.random() * 20) | 0);
      const sv = SVGF[id]();
      sv.dataset.kind = cfg.kind || 'top';
      el.appendChild(sv);
      (cfg.layer === 'cheese' ? this.cheeseL : this.topsL).appendChild(el);
      const occ = { x: p.x, y: p.y };
      this.occupied.push(occ);
      this.groups[id].push({ el, occ });
      dropPiece(this, el, p, cfg, speed, i);
    });
  }

  setTopping(id, count, speed) {
    const gsap = window.gsap;
    speed = speed == null ? 1 : speed;
    const cfg = TOPCFG[id];
    if (!this.groups[id]) this.groups[id] = [];
    const g = this.groups[id],
      cur = g.length;
    if (count > cur) this.sprinkle(id, count - cur, cfg, speed);
    else if (count < cur) {
      const rm = g.splice(count);
      const H = this.el.clientHeight || 420;
      rm.forEach((e, i) => {
        if (e.occ) {
          const oi = this.occupied.indexOf(e.occ);
          if (oi > -1) this.occupied.splice(oi, 1);
        }
        if (gsap) {
          gsap.to(e.el, {
            y: -H * 0.85,
            x: '+=' + rand(-44, 44),
            rotation: '+=150',
            opacity: 0,
            duration: speed > 0 ? 0.55 : 0,
            delay: i * 0.03,
            ease: 'power2.in',
            onComplete: () => e.el.remove()
          });
        } else {
          e.el.remove();
        }
      });
    }
  }

  setExtra(id, on, speed) {
    speed = speed == null ? 1 : speed;
    if (DRIZZLES.includes(id)) this.setDrizzle(id, on, speed);
    else if (on) this.sprinkle(id, TOPCFG[id].fixed, TOPCFG[id], speed);
    else this.clearGroup(id, speed);
  }

  clearGroup(id, speed) {
    this.setTopping(id, 0, speed == null ? 1 : speed);
  }

  setDrizzle(id, on, speed) {
    const gsap = window.gsap;
    speed = speed == null ? 1 : speed;
    if (!on) {
      const g = this.drzEls[id];
      if (g) {
        if (gsap) {
          gsap.to(g, {
            opacity: 0,
            duration: speed > 0 ? 0.4 : 0,
            onComplete: () => g.remove()
          });
        } else {
          g.remove();
        }
        delete this.drzEls[id];
      }
      return;
    }
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', 'rotate(' + rand(-35, 35).toFixed(1) + ' 50 50)');
    if (id === 'truffle') {
      for (let i = 0; i < 12; i++) {
        const c = document.createElementNS(ns, 'circle');
        const a = Math.random() * 6.283,
          r = Math.sqrt(Math.random()) * 0.7;
        c.setAttribute('cx', (50 + Math.cos(a) * r * 50).toFixed(1));
        c.setAttribute('cy', (50 + Math.sin(a) * r * 50).toFixed(1));
        c.setAttribute('r', rand(1.1, 2.4).toFixed(1));
        c.setAttribute('fill', 'url(#gTruf' + this.uid + ')');
        c.style.opacity = 0;
        g.appendChild(c);
      }
    } else {
      const cols = { ketchup: ['#a81810', '#ff6a55'], bbqDrizzle: ['#1c0a03', '#9a6a33'] }[id];
      for (let i = 0; i < 5; i++) {
        const d = wavyPath();
        const p1 = document.createElementNS(ns, 'path');
        p1.setAttribute('d', d);
        p1.setAttribute('fill', 'none');
        p1.setAttribute('stroke', cols[0]);
        p1.setAttribute('stroke-width', rand(1.6, 2.6).toFixed(1));
        p1.setAttribute('stroke-linecap', 'round');
        const p2 = document.createElementNS(ns, 'path');
        p2.setAttribute('d', d);
        p2.setAttribute('fill', 'none');
        p2.setAttribute('stroke', cols[1]);
        p2.setAttribute('stroke-width', '0.6');
        p2.setAttribute('transform', 'translate(0 -0.5)');
        p2.style.opacity = 0;
        g.appendChild(p1);
        g.appendChild(p2);
      }
    }
    this.drzG.appendChild(g);
    this.drzEls[id] = g;
    const paths = [...g.querySelectorAll('path')];
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      if (speed > 0 && gsap) {
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        gsap.to(p, { strokeDashoffset: 0, duration: 0.6, delay: i * 0.09, ease: 'power2.out' });
      } else p.style.strokeDashoffset = 0;
    });
    [...g.children].forEach((c, i) => {
      if (c.tagName === 'circle') {
        if (speed > 0 && gsap) gsap.to(c, { opacity: 0.9, duration: 0.4, delay: i * 0.06 });
        else c.style.opacity = 0.9;
      }
    });
    paths.forEach((p) => {
      if (p.getAttribute('stroke-width') === '0.6') {
        if (speed > 0 && gsap) gsap.to(p, { opacity: 0.75, duration: 0.3, delay: 0.5 });
        else p.style.opacity = 0.75;
      }
    });
  }

  addOil(instant) {
    const gsap = window.gsap;
    this.topsL.querySelectorAll('.top').forEach((t) => {
      const sv = t.querySelector('svg');
      if (!sv || sv.dataset.kind !== 'meat') return;
      for (let k = 0; k < 2; k++) {
        const d = document.createElement('b');
        d.className = 'oil';
        d.style.left = rand(15, 60) + '%';
        d.style.top = rand(15, 60) + '%';
        const s = rand(14, 26) + '%';
        d.style.width = s;
        d.style.height = s;
        t.appendChild(d);
        if (instant) d.style.opacity = 0.7;
        else if (gsap) gsap.fromTo(d, { opacity: 0 }, { opacity: 0.7, duration: 0.8, delay: Math.random() * 0.8 });
      }
    });
  }

  cookifyInstant() {
    this.cooked = true;
    this.el.classList.add('cooked');
    this.doughImgs.forEach((i) => (i.style.filter = F_DOUGH_C));
    this.mask.style.filter = F_SAUCE_C;
    this.cheeseL.style.opacity = 0;
    this.cookedWrap.style.opacity = 1;
    this.ring.style.opacity = 0.65;
    this.charSpots.forEach((c) => (c.style.opacity = 0));
    this.topsL.querySelectorAll('svg').forEach((sv) => (sv.style.filter = sv.dataset.kind === 'veg' ? F_VEG_C : F_TOP_C));
    this.addOil(true);
  }

  applySnapshot(snap, speed) {
    this.reset();
    if (snap.dough) this.setDough(snap.dough, speed);
    if (snap.sauce) this.setSauce(snap.sauce, speed);
    if (snap.cheese) this.setCheese(snap.cheese, speed);
    for (const [m, q] of Object.entries(snap.meats || {})) this.setTopping(m, (TOPCFG[m]?.counts || {})[q] || 12, speed);
    for (const v of snap.vegs || []) this.setTopping(v, TOPCFG[v]?.fixed || 8, speed);
    for (const e of snap.extras || []) this.setExtra(e, true, speed);
    this.state = {
      dough: snap.dough,
      sauce: snap.sauce,
      cheese: snap.cheese,
      meats: { ...(snap.meats || {}) },
      vegs: [...(snap.vegs || [])],
      extras: [...(snap.extras || [])]
    };
  }

  reset() {
    const gsap = window.gsap;
    // قتل أي أنيميشن شغال حالياً على المكونات قبل تفريغها من الدوم لمنع تسريب الميموري
    if (gsap) {
      gsap.killTweensOf([this.cheeseL.children, this.topsL.children, this.drzG.children, this.fxL.children]);
    }
    this.cheeseL.innerHTML = '';
    this.topsL.innerHTML = '';
    this.drzG.innerHTML = '';
    this.fxL.innerHTML = '';
    this.groups = {};
    this.occupied = [];
    this.drzEls = {};
    this.cooked = false;
    this.cheeseL.style.opacity = 1;
    this.cheeseL.style.filter = 'none';
    this.cookedWrap.style.opacity = 0;
    this.cookedWrap.style.filter = 'none';
    this.ring.style.opacity = 0;
    this.mask.style.clipPath = 'circle(0% at 50% 50%)';
    this.mask.style.filter = F_RAW;
    this.mask.innerHTML = '';
    this.doughImgs.forEach((im, i) => {
      im.style.filter = F_RAW;
      im.style.opacity = i === 1 ? 1 : 0;
    });
    this.charSpots.forEach((c) => (c.style.opacity = 0));
    if (gsap) gsap.to(this.q('.pz-scale'), { scale: 1, duration: 0.5 });
    this.state = { dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] };
  }
}
