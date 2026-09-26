// src/lib/pizza/pricing.js
"use client";

import { DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS } from './config';

export const SIZES = [
  { id: 'small', name: 'SMALL (24 CM)', desc: 'Personal size · Light bite', scale: 0.85 },
  { id: 'med', name: 'MEDIUM (30 CM)', desc: 'Standard size · 2 Persons (Our Signature)', scale: 1.0 },
  { id: 'large', name: 'LARGE (36 CM)', desc: 'Party size · 3-4 Persons', scale: 1.15 }
];

export function getIngPrice(item, size = 'med') {
  if (!item) return 0;
  const sz = size || 'med';
  if (typeof item.prices === 'object' && item.prices !== null) {
    return item.prices[sz] ?? item.prices.med ?? 0;
  }
  return Number(item.price) || 0;
}

export function meatPrice(id, q = 'normal', size = 'med') {
  const item = MEAT.find((m) => m.id === id);
  const b = getIngPrice(item, size);
  const m = { less: 0.7, normal: 1, more: 1.4 }[q] || 1;
  return Math.round((b * m) / 5) * 5;
}

export function unitPrice(s) {
  const sz = s.size || 'med';
  const baseScale = { small: 0.85, med: 1.0, large: 1.25 }[sz] || 1.0;
  let p = Math.round(145 * baseScale);
  if (s.dough) p += getIngPrice(DOUGH.find((d) => d.id === s.dough), sz);
  if (s.sauce) p += getIngPrice(SAUCE.find((d) => d.id === s.sauce), sz);
  if (s.cheese) p += getIngPrice(CHEESE.find((d) => d.id === s.cheese), sz);
  for (const [id, q] of Object.entries(s.meats || {})) p += meatPrice(id, q, sz);
  for (const v of s.vegs || []) p += getIngPrice(VEG.find((x) => x.id === v), sz);
  for (const e of s.extras || []) p += getIngPrice(EXTRAS.find((x) => x.id === e), sz);
  return Math.max(145, p);
}

export function baseHas(cat, id, combo) {
  if (!combo) return false;
  const b = combo.snap;
  if (cat === 'meat') return id in (b.meats || {});
  if (cat === 'veg') return (b.vegs || []).includes(id);
  if (cat === 'extras') return (b.extras || []).includes(id);
  return false;
}

export function priceOf(arr, id, size = 'med') {
  const o = arr.find((x) => x.id === id);
  return getIngPrice(o, size);
}

export function comboDelta(state, combo) {
  if (!combo) return 0;
  const b = combo.snap;
  const sz = state.size || 'med';
  let d = 0;
  if (state.dough !== b.dough) d += Math.max(0, priceOf(DOUGH, state.dough, sz) - priceOf(DOUGH, b.dough, sz));
  if (state.sauce !== b.sauce) d += Math.max(0, priceOf(SAUCE, state.sauce, sz) - priceOf(SAUCE, b.sauce, sz));
  if (state.cheese !== b.cheese) d += Math.max(0, priceOf(CHEESE, state.cheese, sz) - priceOf(CHEESE, b.cheese, sz));
  for (const [id, q] of Object.entries(state.meats || {})) {
    if (id in (b.meats || {})) d += Math.max(0, meatPrice(id, q, sz) - meatPrice(id, b.meats[id], sz));
    else d += meatPrice(id, q, sz);
  }
  for (const v of state.vegs || []) if (!(b.vegs || []).includes(v)) d += priceOf(VEG, v, sz);
  for (const e of state.extras || []) if (!(b.extras || []).includes(e)) d += priceOf(EXTRAS, e, sz);
  return d;
}

export function effectiveUnit(state, combo) {
  return combo ? combo.basePrice + comboDelta(state, combo) : unitPrice(state);
}
