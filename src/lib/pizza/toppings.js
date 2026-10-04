// src/lib/pizza/toppings.js
"use client";

import { clamp, rand, pick, nid, wobbleCircle, mkSVG, speckles } from './geometry';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 980;

export function sauceSVG(type) {
  const conf = {
    tomato: { c1: '#e6452a', c2: '#b02412', c3: '#8a180b', herb: 1 },
    spicy: { c1: '#e23018', c2: '#a81708', c3: '#7e1006', herb: 1, flakes: 1 },
    bbq: { c1: '#7a3413', c2: '#4a1c07', c3: '#2f1006', gloss: 1 },
    garlic: { c1: '#f4e8ca', c2: '#e2cda0', c3: '#c9ad76', herb: 1 }
  }[type] || { c1: '#e6452a', c2: '#b02412', c3: '#8a180b', herb: 1 };

  const gid = nid('sg'),
    gl = nid('gl'),
    fid = nid('sf');
  const mob = isMobile();

  let defs =
    '<defs><radialGradient id="' +
    gid +
    '" cx="45%" cy="42%" r="68%"><stop offset="0%" stop-color="' +
    conf.c1 +
    '"/><stop offset="68%" stop-color="' +
    conf.c2 +
    '"/><stop offset="100%" stop-color="' +
    conf.c3 +
    '"/></radialGradient><radialGradient id="' +
    gl +
    '"><stop offset="0%" stop-color="rgba(255,255,255,.32)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>';
  if (!mob)
    defs +=
      '<filter id="' +
      fid +
      '" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="' +
      ((Math.random() * 100) | 0) +
      '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter>';
  defs += '</defs>';

  let body =
    defs +
    '<g ' +
    (mob ? '' : 'filter="url(#' + fid + ')"') +
    '>' +
    '<path d="' +
    wobbleCircle(100, 100, 78, 16, 0.05) +
    '" fill="url(#' +
    gid +
    ')"/>' +
    '<path d="' +
    wobbleCircle(100, 100, 78, 16, 0.05) +
    '" fill="none" stroke="rgba(40,8,2,.35)" stroke-width="2.5"/>' +
    speckles(100, 100, 70, 26, 0.8, 2.4, type === 'garlic' ? '#b28a4a' : '#5f1004', 0.3);
  if (conf.herb) body += speckles(100, 100, 66, 16, 0.7, 1.6, '#3a6b2a', 0.55);
  if (conf.flakes) body += speckles(100, 100, 66, 12, 1, 2.2, '#8f1a0c', 0.8);
  body += '</g><circle cx="76" cy="70" r="34" fill="url(#' + gl + ')"/>';
  if (conf.gloss) body += '<circle cx="122" cy="118" r="24" fill="url(#' + gl + ')" opacity=".7"/>';
  return mkSVG(200, body);
}

export function mozSliceSVG(variant) {
  const pal = [
    ['#fdfaf1', '#f9f3e0', '#f6eed3', '#fffdf6'],
    ['#f9f1cf', '#f4e8b8', '#eddc9e', '#fffbe6'],
    ['#efe0b4', '#e3cf96', '#d6bd82', '#f7ecc9']
  ][variant || 0];
  const rot = rand(0, 360).toFixed(0);
  let out = '';
  const n = 4 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const x = rand(18, 82),
      y = rand(18, 82),
      a = rand(0, 6.283),
      len = rand(28, 58);
    const x2 = clamp(x + Math.cos(a) * len, 6, 94),
      y2 = clamp(y + Math.sin(a) * len, 6, 94);
    const mx = (x + x2) / 2 + rand(-14, 14),
      my = (y + y2) / 2 + rand(-14, 14);
    const d = 'M ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    const w = rand(5, 9),
      c = pick(pal);
    out += '<path d="' + d + '" fill="none" stroke="rgba(110,90,50,.28)" stroke-width="' + (w + 1.6).toFixed(1) + '" stroke-linecap="round" transform="translate(0 1.4)"/>';
    out += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
    out += '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="' + (w * 0.32).toFixed(1) + '" stroke-linecap="round" transform="translate(0 -' + (w * 0.2).toFixed(1) + ')"/>';
  }
  return mkSVG(100, '<g transform="rotate(' + rot + ' 50 50)">' + out + '</g>');
}

export function meltSVG() {
  const gid = nid('ml'),
    spot = nid('sp'),
    gl = nid('mg'),
    fid = nid('mf');
  const mob = isMobile();

  let spots = '';
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * 6.283,
      r = Math.sqrt(Math.random()) * 66;
    spots += '<circle cx="' + (100 + Math.cos(a) * r).toFixed(1) + '" cy="' + (100 + Math.sin(a) * r).toFixed(1) + '" r="' + rand(3, 9).toFixed(1) + '" fill="url(#' + spot + ')" opacity="' + rand(0.4, 0.85).toFixed(2) + '"/>';
  }
  let peeks = '';
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * 6.283,
      r = Math.sqrt(Math.random()) * 60;
    peeks += '<circle cx="' + (100 + Math.cos(a) * r).toFixed(1) + '" cy="' + (100 + Math.sin(a) * r).toFixed(1) + '" r="' + rand(3, 6).toFixed(1) + '" fill="#9c1f0e" opacity=".3"/>';
  }
  let gloss = '';
  for (let i = 0; i < 5; i++) {
    const a = Math.random() * 6.283,
      r = Math.sqrt(Math.random()) * 50;
    gloss += '<ellipse cx="' + (100 + Math.cos(a) * r).toFixed(1) + '" cy="' + (100 + Math.sin(a) * r).toFixed(1) + '" rx="' + rand(12, 20).toFixed(1) + '" ry="' + rand(3, 6).toFixed(1) + '" fill="url(#' + gl + ')" transform="rotate(' + rand(-60, 60).toFixed(0) + ' 100 100)"/>';
  }

  let defs =
    '<defs>' +
    '<radialGradient id="' +
    gid +
    '" cx="46%" cy="42%" r="66%"><stop offset="0%" stop-color="#f9edbe"/><stop offset="45%" stop-color="#f0d795"/><stop offset="78%" stop-color="#e5c078"/><stop offset="100%" stop-color="#d3a355"/></radialGradient>' +
    '<radialGradient id="' +
    spot +
    '"><stop offset="0%" stop-color="#8a3d12"/><stop offset="70%" stop-color="rgba(138,61,18,.5)"/><stop offset="100%" stop-color="rgba(138,61,18,0)"/></radialGradient>' +
    '<radialGradient id="' +
    gl +
    '"><stop offset="0%" stop-color="rgba(255,255,255,.34)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>';

  if (!mob) {
    defs +=
      '<filter id="' +
      fid +
      '" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="' +
      ((Math.random() * 100) | 0) +
      '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8"/></filter>';
  }
  defs += '</defs>';

  return mkSVG(
    200,
    defs + '<g ' + (mob ? '' : 'filter="url(#' + fid + ')"') + '>' + '<path d="' + wobbleCircle(100, 100, 68, 18, 0.06) + '" fill="url(#' + gid + ')"/>' + peeks + spots + '</g>' + gloss
  );
}

export function pepperoniSVG() {
  const gid = nid('pe');
  const path = wobbleCircle(50, 50, 42, 12, 0.06);
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="44%" cy="40%" r="68%"><stop offset="0%" stop-color="#e0523a"/><stop offset="60%" stop-color="#b02a18"/><stop offset="100%" stop-color="#7e150c"/></radialGradient></defs>' +
      '<path d="' +
      path +
      '" fill="url(#' +
      gid +
      ')"/>' +
      '<path d="' +
      path +
      '" fill="none" stroke="#641008" stroke-width="3" opacity=".85"/>' +
      speckles(50, 50, 30, 8, 2, 3.6, '#f0b39c', 0.95) +
      speckles(50, 50, 34, 4, 1.2, 2.2, '#5f0f06', 0.9) +
      '<ellipse cx="40" cy="36" rx="12" ry="6" fill="rgba(255,255,255,.13)" transform="rotate(-20 40 36)"/>'
  );
}

export function beefSVG() {
  const gid1 = nid('bf1'), gid2 = nid('bf2');
  return mkSVG(
    100,
    '<defs>' +
      '<radialGradient id="' + gid1 + '" cx="40%" cy="35%" r="68%">' +
        '<stop offset="0%" stop-color="#7c3d19"/>' +
        '<stop offset="50%" stop-color="#54240c"/>' +
        '<stop offset="85%" stop-color="#361506"/>' +
        '<stop offset="100%" stop-color="#1f0a03"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + gid2 + '" cx="36%" cy="30%" r="65%">' +
        '<stop offset="0%" stop-color="#934d23"/>' +
        '<stop offset="60%" stop-color="#642b10"/>' +
        '<stop offset="100%" stop-color="#2c0f04"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<g filter="drop-shadow(0 2px 3px rgba(12,4,1,0.65))">' +
      '<path d="M 32 44 Q 38 32 48 35 Q 56 30 64 36 Q 74 38 72 48 Q 78 58 70 66 Q 62 74 50 72 Q 38 75 30 66 Q 22 56 32 44 Z" fill="url(#' + gid1 + ')"/>' +
      '<path d="M 36 40 Q 44 34 52 38 Q 60 35 66 42 Q 68 52 62 60 Q 52 66 42 62 Q 32 58 34 48 Q 32 42 36 40 Z" fill="url(#' + gid2 + ')"/>' +
      '<circle cx="28" cy="42" r="7" fill="url(#' + gid1 + ')"/>' +
      '<circle cx="68" cy="44" r="8" fill="url(#' + gid1 + ')"/>' +
      '<circle cx="48" cy="68" r="7.5" fill="url(#' + gid1 + ')"/>' +
      '<circle cx="62" cy="64" r="6.5" fill="url(#' + gid1 + ')"/>' +
      '<circle cx="34" cy="62" r="6" fill="url(#' + gid1 + ')"/>' +
      '<circle cx="50" cy="32" r="6.5" fill="url(#' + gid2 + ')"/>' +
      '<path d="M 34 42 Q 42 46 48 40 M 42 52 Q 52 48 58 56 M 34 56 Q 44 60 52 54 M 52 38 Q 58 44 66 42" fill="none" stroke="#1f0a03" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M 36 38 Q 42 34 46 36 M 54 36 Q 60 34 64 38 M 38 58 Q 44 54 48 58" fill="none" stroke="rgba(255,190,135,0.4)" stroke-width="1.8" stroke-linecap="round"/>' +
      speckles(50, 50, 26, 12, 1, 2.2, '#120501', 0.95) +
      speckles(50, 50, 22, 6, 0.8, 1.5, '#421606', 0.9) +
    '</g>'
  );
}

export function chickenSVG() {
  const gid = nid('ch'),
    cid = nid('chc');
  const path = wobbleCircle(50, 50, 38, 9, 0.16);
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#f0d2a0"/><stop offset="60%" stop-color="#d3a76b"/><stop offset="100%" stop-color="#b5814a"/></radialGradient>' +
      '<clipPath id="' +
      cid +
      '"><path d="' +
      path +
      '"/></clipPath></defs>' +
      '<path d="' +
      path +
      '" fill="url(#' +
      gid +
      ')"/>' +
      '<g clip-path="url(#' +
      cid +
      ')" transform="rotate(18 50 50)">' +
      '<line x1="20" y1="38" x2="82" y2="38" stroke="#7c4a20" stroke-width="4.5" opacity=".55" stroke-linecap="round"/>' +
      '<line x1="16" y1="52" x2="86" y2="52" stroke="#7c4a20" stroke-width="4.5" opacity=".55" stroke-linecap="round"/>' +
      '<line x1="20" y1="66" x2="80" y2="66" stroke="#7c4a20" stroke-width="4.5" opacity=".5" stroke-linecap="round"/>' +
      '</g>' +
      '<path d="' +
      path +
      '" fill="none" stroke="rgba(120,70,30,.4)" stroke-width="2"/>' +
      '<ellipse cx="40" cy="34" rx="11" ry="6" fill="rgba(255,255,255,.22)"/>'
  );
}

export function sausageSVG() {
  const gidSkin = nid('sa_sk');
  const gidMeat = nid('sa_mt');
  const rot = ((rand(-25, 25)) | 0);
  return mkSVG(
    100,
    '<defs>' +
      '<radialGradient id="' + gidSkin + '" cx="45%" cy="40%" r="70%">' +
        '<stop offset="0%" stop-color="#dc2626"/>' +
        '<stop offset="60%" stop-color="#b91c1c"/>' +
        '<stop offset="100%" stop-color="#7f1d1d"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + gidMeat + '" cx="42%" cy="38%" r="68%">' +
        '<stop offset="0%" stop-color="#fca5a5"/>' +
        '<stop offset="45%" stop-color="#f87171"/>' +
        '<stop offset="85%" stop-color="#ef4444"/>' +
        '<stop offset="100%" stop-color="#b91c1c"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<g transform="rotate(' + rot + ' 50 50)" filter="drop-shadow(0 2px 4px rgba(20,5,3,0.65))">' +
      '<ellipse cx="50" cy="54" rx="41" ry="24" fill="#610e08" stroke="#3b0804" stroke-width="1.5"/>' +
      '<ellipse cx="50" cy="50" rx="41" ry="24" fill="url(#' + gidSkin + ')" stroke="#450a0a" stroke-width="2"/>' +
      '<ellipse cx="50" cy="49" rx="36" ry="20" fill="url(#' + gidMeat + ')"/>' +
      '<ellipse cx="50" cy="49" rx="36" ry="20" fill="none" stroke="rgba(255,200,200,0.5)" stroke-width="1"/>' +
      '<g stroke="#5c0d06" stroke-width="2.6" stroke-linecap="round">' +
        '<path d="M 28 44 Q 34 50 38 56"/>' +
        '<path d="M 44 40 Q 50 48 54 58"/>' +
        '<path d="M 60 42 Q 66 50 70 56"/>' +
      '</g>' +
      '<g stroke="#fca5a5" stroke-width="1" stroke-linecap="round" opacity="0.75">' +
        '<path d="M 29 43 Q 35 49 39 55"/>' +
        '<path d="M 45 39 Q 51 47 55 57"/>' +
        '<path d="M 61 41 Q 67 49 71 55"/>' +
      '</g>' +
      speckles(50, 49, 24, 6, 0.9, 1.8, '#ffffff', 0.75) +
      speckles(50, 49, 26, 4, 0.7, 1.4, '#4a0804', 0.8) +
      '<path d="M 22 46 C 26 34, 46 30, 72 34" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.45"/>' +
    '</g>'
  );
}

export function oliveSVG() {
  const gid = nid('ol');
  const outer = wobbleCircle(50, 50, 38, 10, 0.05);
  const inner = wobbleCircle(50, 50, 14, 8, 0.12);
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="40%" cy="36%" r="70%"><stop offset="0%" stop-color="#4a3c34"/><stop offset="70%" stop-color="#241a14"/><stop offset="100%" stop-color="#150e0a"/></radialGradient></defs>' +
      '<path d="' +
      outer +
      ' ' +
      inner +
      '" fill="url(#' +
      gid +
      ')" fill-rule="evenodd"/>' +
      '<circle cx="50" cy="50" r="14" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="2"/>' +
      '<path d="M 28 30 A 30 30 0 0 1 46 20" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/>'
  );
}

export function mushroomSVG() {
  const gid = nid('mu');
  return mkSVG(
    100,
    '<defs><linearGradient id="' +
      gid +
      '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2e7d2"/><stop offset="70%" stop-color="#dcc9a6"/><stop offset="100%" stop-color="#c9b18a"/></linearGradient></defs>' +
      '<path d="M 15 54 Q 14 18 50 15 Q 86 18 85 54 L 64 54 L 63 77 Q 50 86 37 77 L 36 54 Z" fill="url(#' +
      gid +
      ')"/>' +
      '<path d="M 15 54 Q 14 18 50 15 Q 86 18 85 54 L 64 54 L 63 77 Q 50 86 37 77 L 36 54 Z" fill="none" stroke="rgba(120,95,60,.35)" stroke-width="2"/>' +
      '<g stroke="#b0977a" stroke-width="2" opacity=".8" stroke-linecap="round">' +
      '<line x1="26" y1="52" x2="30" y2="42"/><line x1="36" y1="53" x2="38" y2="41"/><line x1="50" y1="53" x2="50" y2="40"/><line x1="64" y1="53" x2="62" y2="41"/><line x1="74" y1="52" x2="70" y2="42"/>' +
      '</g>'
  );
}

export function onionSVG() {
  const outer = wobbleCircle(50, 50, 40, 10, 0.06);
  const inner = wobbleCircle(50, 50, 27, 10, 0.07);
  return mkSVG(
    100,
    '<path d="' +
      outer +
      ' ' +
      inner +
      '" fill="rgba(226,190,220,.55)" fill-rule="evenodd" stroke="rgba(170,80,150,.55)" stroke-width="1.6"/>' +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.6"/>'
  );
}

export function greenPepperSVG() {
  const gid = nid('gp');
  return mkSVG(
    100,
    '<defs><linearGradient id="' +
      gid +
      '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#57a84f"/><stop offset="100%" stop-color="#2f7a30"/></linearGradient></defs>' +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="url(#' +
      gid +
      ')" stroke-width="12" stroke-linecap="round" stroke-dasharray="72 26 64 45"/>' +
      '<circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="40 60 50 57"/>'
  );
}

export function jalapenoSVG() {
  const gid = nid('ja');
  const outer = wobbleCircle(50, 50, 36, 10, 0.06);
  const inner = wobbleCircle(50, 50, 19, 9, 0.1);
  let seeds = '';
  for (let i = 0; i < 6; i++) {
    const a = rand(0, 6.283),
      rr = rand(23, 29);
    seeds += '<circle cx="' + (50 + Math.cos(a) * rr).toFixed(1) + '" cy="' + (50 + Math.sin(a) * rr).toFixed(1) + '" r="' + rand(1.6, 2.4).toFixed(1) + '" fill="#f4ecc0"/>';
  }
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#62a442"/><stop offset="100%" stop-color="#3c7a26"/></radialGradient></defs>' +
      '<path d="' +
      outer +
      ' ' +
      inner +
      '" fill="url(#' +
      gid +
      ')" fill-rule="evenodd" stroke="rgba(30,70,15,.5)" stroke-width="1.6"/>' +
      seeds +
      '<path d="M 30 26 A 28 28 0 0 1 48 18" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2.5" stroke-linecap="round"/>'
  );
}

export function cornSVG() {
  const gid = nid('co');
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="42%" cy="34%" r="75%"><stop offset="0%" stop-color="#ffdf6b"/><stop offset="70%" stop-color="#f2b93c"/><stop offset="100%" stop-color="#e0992a"/></radialGradient></defs>' +
      '<rect x="30" y="26" width="40" height="48" rx="15" fill="url(#' +
      gid +
      ')" transform="rotate(' +
      rand(-14, 14).toFixed(0) +
      ' 50 50)"/>' +
      '<ellipse cx="43" cy="38" rx="7" ry="5" fill="rgba(255,255,255,.5)"/>'
  );
}

export function basilSVG() {
  const gid = nid('ba');
  return mkSVG(
    100,
    '<defs><linearGradient id="' +
      gid +
      '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#46a04a"/><stop offset="100%" stop-color="#1e5c28"/></linearGradient></defs>' +
      '<path d="M 50 12 C 74 20 84 44 78 66 C 72 84 58 92 50 92 C 42 92 28 84 22 66 C 16 44 26 20 50 12 Z" fill="url(#' +
      gid +
      ')"/>' +
      '<path d="M 50 16 L 50 88" stroke="#a8d5a0" stroke-width="2" opacity=".55"/>' +
      '<g stroke="#a8d5a0" stroke-width="1.4" opacity=".4" stroke-linecap="round">' +
      '<path d="M 50 34 Q 62 38 68 48" fill="none"/><path d="M 50 34 Q 38 38 32 48" fill="none"/>' +
      '<path d="M 50 54 Q 63 58 68 66" fill="none"/><path d="M 50 54 Q 37 58 32 66" fill="none"/></g>' +
      '<ellipse cx="42" cy="30" rx="9" ry="5" fill="rgba(255,255,255,.16)" transform="rotate(-24 42 30)"/>'
  );
}

export function chiliSVG() {
  const c = pick(['#c22915', '#931a0a', '#e04a20', '#a82210']);
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 6.283 + rand(-0.4, 0.4);
    const r = rand(16, 34);
    pts.push((50 + Math.cos(a) * r).toFixed(1) + ',' + (50 + Math.sin(a) * r).toFixed(1));
  }
  return mkSVG(100, '<polygon points="' + pts.join(' ') + '" fill="' + c + '" transform="rotate(' + rand(0, 360).toFixed(0) + ' 50 50)"/>');
}

export function garlicSVG() {
  const gid = nid('ga');
  const path = wobbleCircle(50, 50, 30, 7, 0.3);
  return mkSVG(
    100,
    '<defs><radialGradient id="' +
      gid +
      '" cx="40%" cy="35%" r="75%"><stop offset="0%" stop-color="#f8efd2"/><stop offset="100%" stop-color="#dcc08e"/></radialGradient></defs>' +
      '<path d="' +
      path +
      '" fill="url(#' +
      gid +
      ')" stroke="rgba(183,141,78,.45)" stroke-width="1.6"/>'
  );
}

export const SVGF = {
  pepperoni: pepperoniSVG,
  beef: beefSVG,
  chicken: chickenSVG,
  sausage: sausageSVG,
  olives: oliveSVG,
  mushroom: mushroomSVG,
  onion: onionSVG,
  greenPepper: greenPepperSVG,
  jalapeno: jalapenoSVG,
  corn: cornSVG,
  basil: basilSVG,
  chili: chiliSVG,
  garlic: garlicSVG,
  extraCheese: () => mozSliceSVG(0)
};

/* ================= WHEEL ICONS ================= */
export const GR = (c1, c2, c3) => {
  const id = nid('g');
  return [
    id,
    '<radialGradient id="' +
      id +
      '" cx="40%" cy="34%" r="74%"><stop offset="0%" stop-color="' +
      c1 +
      '"/><stop offset="62%" stop-color="' +
      c2 +
      '"/><stop offset="100%" stop-color="' +
      c3 +
      '"/></radialGradient>'
  ];
};

export function icoDough(v) {
  if (v === 2) {
    const [g, d] = GR('#f4ead2', '#e3d4af', '#c6b287');
    return mkSVG(
      100,
      '<defs>' +
        d +
        '</defs><ellipse cx="50" cy="53" rx="36" ry="31" fill="url(#' +
        g +
        ')"/><ellipse cx="41" cy="42" rx="12" ry="6" fill="rgba(255,255,255,.45)"/><path d="M32 44q6-6 12-2M56 40q7-4 12 1" fill="none" stroke="rgba(150,130,95,.45)" stroke-width="2" stroke-linecap="round"/>'
    );
  }
  if (v === 1) {
    const [g, d] = GR('#e6d5b2', '#c9ad82', '#8f744c');
    return mkSVG(
      100,
      '<defs>' +
        d +
        '</defs><circle cx="50" cy="52" r="34" fill="url(#' +
        g +
        ')"/>' +
        speckles(50, 52, 26, 14, 1, 2.4, '#5d4326', 0.8) +
        '<ellipse cx="40" cy="40" rx="10" ry="6" fill="rgba(255,255,255,.35)"/>'
    );
  }
  if (v === 3) {
    const [g, d] = GR('#f8e8ac', '#eecf7e', '#c99b45');
    return mkSVG(
      100,
      '<defs>' +
        d +
        '</defs><circle cx="50" cy="50" r="34" fill="#d9a75f"/><circle cx="50" cy="50" r="30" fill="#b3271a"/>' +
        speckles(50, 50, 29, 8, 3, 5, '#b3271a', 1) +
        '<path d="' +
        wobbleCircle(50, 50, 26, 12, 0.12) +
        '" fill="url(#' +
        g +
        ')"/>' +
        speckles(50, 50, 20, 8, 1.5, 3, '#b06a1c', 0.85) +
        '<path d="M38 78q2 8 0 12M60 76q3 7 1 11" stroke="#f2dd94" stroke-width="3" fill="none" stroke-linecap="round"/>'
    );
  }
  const [g, d] = GR('#ffffff', '#f0e8d5', '#c9bb9c');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><circle cx="50" cy="52" r="34" fill="url(#' +
      g +
      ')"/><ellipse cx="39" cy="40" rx="12" ry="7" fill="rgba(255,255,255,.7)"/><path d="M40 62q8 6 18 2" fill="none" stroke="rgba(160,145,110,.35)" stroke-width="2"/>'
  );
}

export function icoBowl(c, seed) {
  const [g, d] = GR('#f6ecd6', '#e2d0ac', '#b49b72');
  let s =
    '<defs>' +
    d +
    '</defs><circle cx="50" cy="52" r="34" fill="url(#' +
    g +
    ')"/><circle cx="50" cy="52" r="26" fill="' +
    c +
    '"/><circle cx="50" cy="52" r="16" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/><circle cx="50" cy="52" r="8" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3"/><ellipse cx="41" cy="41" rx="8" ry="4" fill="rgba(255,255,255,.4)"/>';
  if (seed) s += speckles(50, 52, 20, 10, 1, 2, '#f6d5a0', 0.8);
  return mkSVG(100, s);
}

export function icoTomato() {
  const [g, d] = GR('#ff6a4d', '#d92c14', '#8c1206');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><circle cx="50" cy="56" r="31" fill="url(#' +
      g +
      ')"/><path d="M50 26l4 8 9-5-3 9 10 1-8 6H38l-8-6 10-1-3-9 9 5z" fill="#3f7d2c"/><rect x="48" y="18" width="4" height="10" rx="2" fill="#4c8f36"/><ellipse cx="39" cy="46" rx="9" ry="5" fill="rgba(255,255,255,.4)"/>'
  );
}

export function icoMozzarella() {
  return mkSVG(
    100,
    '<g transform="translate(50, 50) scale(1.35) translate(-50, -57)">' +
      // 1. الكرة الخلفية (Mozzarella dome at back)
      '<path d="M 52 38 C 59 36, 75 39, 83 51 C 89 62, 87 72, 78 74 C 72 75, 63 74, 58 72 Z" fill="#f8fafc" stroke="#1c1917" stroke-width="2.8" stroke-linejoin="round"/>' +
      // مقطع الوجه المقطوع للكرة الخلفية
      '<path d="M 52 38 C 44 38, 41 49, 43 60 C 45 69, 52 73, 58 72 C 65 71, 69 61, 67 50 C 65 41, 59 38, 52 38 Z" fill="#ffffff" stroke="#1c1917" stroke-width="2.8"/>' +
      // 2. الشريحة الوسطى (The middle round slice)
      '<path d="M 43 47 L 48 50 C 58 58, 62 69, 58 78 L 53 75" fill="#f1f5f9" stroke="#1c1917" stroke-width="2.8" stroke-linejoin="round"/>' +
      '<ellipse cx="45" cy="63" rx="17" ry="14" fill="#ffffff" stroke="#1c1917" stroke-width="2.8" transform="rotate(-18 45 63)"/>' +
      // 3. الشريحة الأمامية المستلقية (The front slice)
      '<path d="M 18 64 L 21 69 C 29 78, 40 78, 47 73 L 43 68" fill="#f1f5f9" stroke="#1c1917" stroke-width="2.8" stroke-linejoin="round"/>' +
      '<ellipse cx="29" cy="66" rx="15" ry="10" fill="#ffffff" stroke="#1c1917" stroke-width="2.8" transform="rotate(-12 29 66)"/>' +
    '</g>'
  );
}

export function icoExtraCheese() {
  return mkSVG(
    100,
    '<g transform="translate(50, 50) scale(1.18) translate(-50, -50)">' +
      // 1. الوجه العلوي المائل للمثلث (السطح الفاتح)
      '<path d="M 20 28 C 36 22, 60 17, 78 18 L 70 46 L 20 28 Z" fill="#fdd835"/>' +
      // 2. الوجه الأمامي العمودي (الأصفر الأساسي)
      '<polygon points="20,28 70,46 70,90 20,72" fill="#ffeb3b"/>' +
      // ثقوب دائرية وبيضاوية على الوجه الأمامي (مطابقة للصورة 3)
      '<ellipse cx="26" cy="40" rx="3.2" ry="4.8" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="34" cy="53" rx="4.8" ry="6.2" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="30" cy="65" rx="3" ry="4.2" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="48" cy="47" rx="4.2" ry="5.8" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="44" cy="59" rx="2.8" ry="3.8" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="62" cy="54" rx="4.2" ry="5.2" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="56" cy="71" rx="3.8" ry="5.8" fill="#f57f17" opacity="0.75"/>' +
      '<ellipse cx="66" cy="72" rx="3.2" ry="4.8" fill="#f57f17" opacity="0.75"/>' +
      // 3. الوجه الجانبي الأيمن الداكن
      '<polygon points="78,18 78,62 70,90 70,46" fill="#f57f17"/>' +
      // ثقوب على الوجه الجانبي
      '<ellipse cx="74" cy="38" rx="2" ry="4.2" fill="#d84315"/>' +
      '<ellipse cx="74" cy="52" rx="2" ry="4.8" fill="#d84315"/>' +
      '<ellipse cx="74" cy="68" rx="1.8" ry="3.5" fill="#d84315"/>' +
      '<ellipse cx="77" cy="46" rx="1" ry="2.5" fill="#d84315"/>' +
      '<ellipse cx="77" cy="60" rx="1" ry="2.5" fill="#d84315"/>' +
    '</g>'
  );
}

export function icoFourCheese() {
  return mkSVG(
    100,
    '<g transform="translate(50, 50) scale(1.15) translate(-50, -50)">' +
      // 1. أعلى اليسار: عجلة الجبن مع المقطع المقطوع (Top-Left: Cheese wheel with slice cut)
      '<g transform="translate(10, 10)">' +
        '<path d="M 4 12 C 4 6, 36 6, 36 12 L 36 20 C 36 26, 4 26, 4 20 Z" fill="#f59e0b"/>' +
        '<ellipse cx="20" cy="12" rx="16" ry="7" fill="#fbbf24"/>' +
        '<path d="M 20 12 L 28 15 L 28 23 L 20 20 Z" fill="#fef08a"/>' +
        '<ellipse cx="25" cy="18" rx="1.8" ry="2.5" fill="#d97706"/>' +
        '<circle cx="23" cy="15" r="1" fill="#d97706"/>' +
      '</g>' +

      // 2. أعلى اليمين: مثلث الجبن المسطح (Top-Right: Flat cheese wedge)
      '<g transform="translate(54, 8)">' +
        '<polygon points="6,24 34,16 18,8" fill="#fde047"/>' +
        '<polygon points="6,24 34,16 34,26 6,34" fill="#fbbf24"/>' +
        '<circle cx="12" cy="27" r="2.8" fill="#d97706"/>' +
        '<circle cx="22" cy="24" r="3.5" fill="#d97706"/>' +
        '<circle cx="28" cy="22" r="2" fill="#d97706"/>' +
        '<ellipse cx="20" cy="14" rx="3" ry="1.5" fill="#d97706"/>' +
      '</g>' +

      // 3. أسفل اليسار: مكعب الجبن ذو الثقوب الكبيرة (Bottom-Left: 3D Swiss cube)
      '<g transform="translate(10, 48)">' +
        '<polygon points="6,12 18,4 34,6 22,14" fill="#fde047"/>' +
        '<ellipse cx="22" cy="8" rx="3.5" ry="1.8" fill="#d97706"/>' +
        '<polygon points="6,12 22,14 22,36 6,34" fill="#fbbf24"/>' +
        '<circle cx="14" cy="26" r="6" fill="#f59e0b"/>' +
        '<circle cx="12" cy="18" r="3" fill="#d97706"/>' +
        '<polygon points="22,14 34,6 34,28 22,36" fill="#f59e0b"/>' +
        '<circle cx="28" cy="18" r="3.8" fill="#d97706"/>' +
        '<circle cx="30" cy="27" r="2" fill="#d97706"/>' +
      '</g>' +

      // 4. أسفل اليمين: مثلث الجبن القائم بثقوب دائرية (Bottom-Right: Upright cheese slice)
      '<g transform="translate(54, 48)">' +
        '<polygon points="22,4 6,34 32,34" fill="#fbbf24"/>' +
        '<ellipse cx="18" cy="14" rx="3.5" ry="5" fill="#d97706"/>' +
        '<circle cx="22" cy="24" r="3.2" fill="#fde047"/>' +
        '<circle cx="14" cy="28" r="3.8" fill="#fde047"/>' +
        '<circle cx="26" cy="30" r="2.2" fill="#fde047"/>' +
        '<polygon points="22,4 32,34 36,30 26,2" fill="#f59e0b"/>' +
        '<ellipse cx="30" cy="16" rx="2" ry="4" fill="#d97706"/>' +
        '<ellipse cx="33" cy="26" rx="1.5" ry="3" fill="#d97706"/>' +
      '</g>' +
    '</g>'
  );
}

export function icoSmokedCheese() {
  return mkSVG(
    100,
    '<g transform="translate(50, 50) scale(1.18) translate(-50, -50)">' +
      // 1. جسم القالب الأسطواني الخارجي (أحمر قرميدي)
      '<path d="M 12 36 L 12 62 C 12 78, 46 82, 46 82 L 46 56 Z" fill="#b83838"/>' +
      '<path d="M 80 48 L 80 72 C 86 68, 89 60, 89 52 L 89 36 Z" fill="#a02626"/>' +
      // 2. السطح العلوي البيضاوي المقوس
      '<path d="M 12 36 C 12 18, 89 18, 89 36 C 89 42, 85 46, 80 48 L 50 37 L 46 56 C 24 53, 12 44, 12 36 Z" fill="#c44848"/>' +
      // 3. المقطع الداخلي المقطوع باللون الأصفر الغني
      // الجدار الداخلي الأيسر
      '<path d="M 50 37 L 46 56 L 46 82 L 50 63 Z" fill="#eab308"/>' +
      '<ellipse cx="48" cy="60" rx="1.5" ry="3" fill="#ca8a04"/>' +
      '<ellipse cx="48" cy="72" rx="1.5" ry="2.5" fill="#ca8a04"/>' +
      // الجدار الداخلي الأيمن العريض المواجه للأمام
      '<path d="M 50 37 L 80 48 L 80 72 L 46 82 Z" fill="#facc15"/>' +
      // ثقوب الجبن الصفراء/البرتقالية على الوجه الداخلي (زي الصورة 1)
      '<ellipse cx="56" cy="48" rx="2" ry="3.5" fill="#eab308"/>' +
      '<ellipse cx="61" cy="46" rx="1.8" ry="3" fill="#eab308"/>' +
      '<ellipse cx="56" cy="58" rx="2.2" ry="3.8" fill="#eab308"/>' +
      '<ellipse cx="62" cy="55" rx="1.8" ry="2.2" fill="#eab308"/>' +
      '<ellipse cx="67" cy="53" rx="2" ry="3.2" fill="#eab308"/>' +
      '<ellipse cx="63" cy="64" rx="2.4" ry="4" fill="#eab308"/>' +
      '<ellipse cx="70" cy="60" rx="1.8" ry="2.5" fill="#eab308"/>' +
      '<ellipse cx="75" cy="59" rx="2" ry="3.5" fill="#eab308"/>' +
      '<ellipse cx="70" cy="69" rx="2.2" ry="3.8" fill="#eab308"/>' +
    '</g>'
  );
}
export function icoShred(w) {
  return w ? icoExtraCheese() : icoMozzarella();
}

export function icoCube() {
  return icoFourCheese();
}

export function icoBlock() {
  return icoSmokedCheese();
}

export function icoPep() {
  const [g, d] = GR('#e0523a', '#a82413', '#6d0f07');
  let s = '<defs>' + d + '</defs>';
  [
    [38, 44],
    [58, 40],
    [50, 58]
  ].forEach((p) => {
    s +=
      '<circle cx="' +
      p[0] +
      '" cy="' +
      p[1] +
      '" r="15" fill="url(#' +
      g +
      ')"/><circle cx="' +
      p[0] +
      '" cy="' +
      p[1] +
      '" r="15" fill="none" stroke="#5c0d05" stroke-width="2"/>' +
      speckles(p[0], p[1], 10, 5, 1, 2, '#f0b39c', 0.9);
  });
  return mkSVG(100, s);
}

export function icoBeef() {
  const [gMeat, dMeat] = GR('#dc2626', '#b91c1c', '#7f1d1d');
  const [gFat, dFat] = GR('#ffffff', '#fef2f2', '#fecaca');
  const [gBone, dBone] = GR('#ffffff', '#f5f5f4', '#d6d3d1');
  return mkSVG(
    100,
    '<defs>' + dMeat + dFat + dBone + '</defs>' +
    '<ellipse cx="50" cy="84" rx="35" ry="8" fill="rgba(0,0,0,0.35)"/>' +
    '<path d="M 20 48 C 14 62, 26 78, 48 82 C 72 86, 88 72, 84 56 L 84 66 C 88 78, 72 92, 48 88 C 26 84, 14 70, 20 56 Z" fill="#450a0a" stroke="#2e0505" stroke-width="1.5"/>' +
    '<path d="M 18 46 C 12 60, 24 76, 48 80 C 72 84, 88 70, 84 54 C 82 40, 72 32, 58 32 C 44 32, 42 22, 28 24 C 18 26, 16 38, 18 46 Z" fill="url(#' + gFat + ')" stroke="#b91c1c" stroke-width="1.5"/>' +
    '<path d="M 22 46 C 18 58, 28 72, 48 76 C 68 80, 82 68, 78 54 C 76 42, 68 36, 56 36 C 44 36, 40 28, 30 28 C 22 28, 20 38, 22 46 Z" fill="url(#' + gMeat + ')"/>' +
    '<circle cx="38" cy="46" r="8" fill="url(#' + dBone + ')" stroke="#e7e5e4" stroke-width="1.5"/>' +
    '<circle cx="38" cy="46" r="4" fill="#a8a29e"/>' +
    '<path d="M 48 42 Q 58 40 68 46" fill="none" stroke="#fecaca" stroke-width="2" stroke-linecap="round" opacity="0.85"/>' +
    '<path d="M 46 54 Q 56 56 66 52" fill="none" stroke="#fecaca" stroke-width="2" stroke-linecap="round" opacity="0.85"/>' +
    '<path d="M 40 64 Q 50 68 60 66" fill="none" stroke="#fecaca" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>' +
    '<path d="M 28 58 Q 32 66 36 68" fill="none" stroke="#fecaca" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>' +
    '<ellipse cx="64" cy="42" rx="6" ry="2.5" fill="#ffffff" opacity="0.35" transform="rotate(-15 64 42)"/>'
  );
}

export function icoBacon() {
  return mkSVG(
    100,
    '<g transform="rotate(-14 50 50)"><rect x="18" y="40" width="64" height="20" rx="8" fill="#a3341f"/><path d="M20 46q10-4 20 0t20 0 18 0M20 54q10-4 20 0t20 0 18 0" fill="none" stroke="#f2c7b0" stroke-width="4" stroke-linecap="round"/><rect x="18" y="40" width="64" height="20" rx="8" fill="none" stroke="#6d1a0c" stroke-width="2"/></g>'
  );
}

export function icoChick() {
  const [g, d] = GR('#f0d2a0', '#d3a76b', '#a9763f');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><path d="' +
      wobbleCircle(50, 52, 30, 10, 0.14) +
      '" fill="url(#' +
      g +
      ')"/><path d="M32 44h36M30 54h40M34 64h32" stroke="#7c4a20" stroke-width="4" opacity=".5" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="9" ry="5" fill="rgba(255,255,255,.3)"/>'
  );
}

export function icoSaus() {
  const [gSkin, dSkin] = GR('#ef4444', '#dc2626', '#991b1b');
  const [gSide, dSide] = GR('#991b1b', '#7f1d1d', '#450a0a');
  return mkSVG(
    100,
    '<defs>' + dSkin + dSide + '</defs>' +
    '<ellipse cx="50" cy="80" rx="35" ry="7" fill="rgba(0,0,0,0.3)"/>' +
    '<path d="M 20 38 C 12 50, 16 68, 32 74 C 52 82, 74 76, 84 56 C 88 48, 86 38, 78 36 C 72 34, 68 40, 64 48 C 56 60, 42 62, 34 52 C 28 44, 30 36, 24 34 C 21 34, 20 36, 20 38 Z" fill="url(#' + gSide + ')" stroke="#450a0a" stroke-width="1.5"/>' +
    '<path d="M 20 36 C 14 46, 18 64, 34 70 C 52 78, 72 72, 82 54 C 86 46, 84 38, 78 36 C 72 34, 68 40, 62 48 C 54 58, 42 60, 34 50 C 28 42, 30 34, 24 33 C 21 33, 20 34, 20 36 Z" fill="url(#' + gSkin + ')"/>' +
    '<circle cx="21" cy="35" r="3.5" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/>' +
    '<circle cx="80" cy="37" r="3.5" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/>' +
    '<path d="M 30 46 L 36 56" stroke="#450a0a" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M 40 50 L 46 62" stroke="#450a0a" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M 52 50 L 58 62" stroke="#450a0a" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M 64 46 L 70 56" stroke="#450a0a" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M 28 40 C 38 48, 58 48, 72 40" fill="none" stroke="#fca5a5" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>'
  );
}

export function icoOlives() {
  let s = '';
  [
    [36, 40],
    [58, 36],
    [44, 60],
    [64, 58]
  ].forEach((p) => {
    s +=
      '<circle cx="' +
      p[0] +
      '" cy="' +
      p[1] +
      '" r="12" fill="#241a14"/><circle cx="' +
      p[0] +
      '" cy="' +
      p[1] +
      '" r="5" fill="#0d0805"/><path d="M' +
      (p[0] - 8) +
      ' ' +
      (p[1] - 6) +
      'a10 10 0 0 1 6-5" stroke="rgba(255,255,255,.35)" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  });
  return mkSVG(100, s);
}

export function icoOnion() {
  return mkSVG(
    100,
    '<circle cx="50" cy="50" r="32" fill="#c0487f"/><circle cx="50" cy="50" r="26" fill="#e79cc0"/><circle cx="50" cy="50" r="20" fill="#f6d7e6"/><circle cx="50" cy="50" r="13" fill="#e79cc0"/><circle cx="50" cy="50" r="7" fill="#f9e6ef"/><ellipse cx="40" cy="38" rx="9" ry="5" fill="rgba(255,255,255,.5)"/>'
  );
}

export function icoPepper() {
  const [g, d] = GR('#7cc46a', '#3f8f2f', '#1e5c17');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><path d="M50 30c14 0 24 12 24 28 0 16-10 26-24 26S26 74 26 58c0-16 10-28 24-28z" fill="url(#' +
      g +
      ')"/><path d="M38 34q-4 22 0 44M62 34q4 22 0 44" fill="none" stroke="rgba(20,70,10,.35)" stroke-width="4"/><path d="M50 30q2-10 10-12" fill="none" stroke="#4c8f36" stroke-width="6" stroke-linecap="round"/><ellipse cx="40" cy="44" rx="7" ry="12" fill="rgba(255,255,255,.25)"/>'
  );
}

export function icoBasil() {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s +=
      '<g transform="rotate(' +
      (i * 90 + 45) +
      ' 50 50)"><path d="M50 12 C64 20 70 36 66 48 C62 58 54 62 50 62 C46 62 38 58 34 48 C30 36 36 20 50 12 Z" fill="url(#bg' +
      i +
      ')"/></g>';
    s =
      '<defs><linearGradient id="bg' +
      i +
      '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4aa44e"/><stop offset="100%" stop-color="#1e5c28"/></linearGradient></defs>' +
      s;
  }
  return mkSVG(100, s + '<circle cx="50" cy="50" r="5" fill="#2c7a34"/>');
}

export function icoFlakes() {
  let s = '<circle cx="50" cy="52" r="32" fill="#f2efe6"/><circle cx="50" cy="52" r="25" fill="#8c1a0c"/>';
  for (let i = 0; i < 14; i++) {
    s +=
      '<rect x="' +
      rand(30, 66).toFixed(1) +
      '" y="' +
      rand(32, 68).toFixed(1) +
      '" width="5" height="4" rx="1" fill="' +
      pick(['#d84326', '#e8632f', '#b02210']) +
      '" transform="rotate(' +
      rand(0, 90).toFixed(0) +
      ' 50 50)"/>';
  }
  return mkSVG(100, s + speckles(50, 52, 18, 8, 0.8, 1.6, '#f6d5a0', 0.9));
}

export function icoBulb() {
  const [g, d] = GR('#f6efe2', '#dcc9ae', '#a98d68');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><path d="M 50 22 C 54 30 52 34 58 38 C 68 45 74 54 74 64 C 74 78 64 88 50 88 C 36 88 26 78 26 64 C 26 54 32 45 42 38 C 48 34 46 30 50 22 Z" fill="url(#' +
      g +
      ')"/><path d="M 40 44 Q 36 62 40 78 M 50 42 V 80 M 60 44 Q 64 62 60 78" fill="none" stroke="rgba(150,120,80,.4)" stroke-width="2.5"/><path d="M 46 22 H 54 L 52 14 H 48 Z" fill="#b49b72"/>'
  );
}

export function icoKetchup() {
  const [g, d] = GR('#ff6a4d', '#c2180b', '#7a0d04');
  return mkSVG(
    100,
    '<defs>' +
      d +
      '</defs><path d="M50 20c8 14 20 22 20 38a20 20 0 1 1-40 0c0-16 12-24 20-38z" fill="url(#' +
      g +
      ')"/><path d="M22 44l-8-4M78 44l8-4M30 30l-6-8M70 30l6-8M50 12V4" stroke="#d92c14" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="52" rx="7" ry="11" fill="rgba(255,255,255,.3)"/>'
  );
}

export function icoTruffle() {
  let s = '';
  [
    [40, 44, 14],
    [58, 40, 12],
    [52, 58, 15],
    [66, 56, 10],
    [34, 58, 10]
  ].forEach((p) => {
    s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#191110"/>' + speckles(p[0], p[1], p[2] - 2, 8, 0.8, 1.8, '#4a382b', 0.9);
  });
  return mkSVG(100, s);
}

export const ICON = {
  thin: () => icoDough(2),
  classic: () => icoDough(0),
  thick: () => icoDough(1),
  cheese: () => icoDough(3),
  tomato: icoTomato,
  spicy: () => icoBowl('#c22b12', 1),
  bbq: () => icoBowl('#38150a', 0),
  'sauce:garlic': () => icoBowl('#efe6cc', 0),
  mozzarella: icoMozzarella,
  extra: icoExtraCheese,
  four: icoFourCheese,
  smoked: icoSmokedCheese,
  pepperoni: icoPep,
  beef: icoBeef,
  chicken: icoChick,
  sausage: icoSaus,
  olives: icoOlives,
  mushroom: mushroomSVG,
  onion: icoOnion,
  greenPepper: icoPepper,
  jalapeno: jalapenoSVG,
  basil: icoBasil,
  extraCheese: icoExtraCheese,
  chili: icoFlakes,
  'extras:garlic': icoBulb,
  ketchup: icoKetchup,
  bbqDrizzle: () => icoBowl('#4a2008', 0),
  truffle: icoTruffle
};
