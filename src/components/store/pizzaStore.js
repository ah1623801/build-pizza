// src/store/pizzaStore.js

export let state = { dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] };
export let orderQty = 1;
export let curStep = 0;
export let maxReached = 0;
export let stage = null;
export let combo = null;
export let cart = [];
export let saved = [];

export const setStage = (s) => stage = s;
export const setCurStep = (s) => curStep = s;
export const setMaxReached = (s) => maxReached = s;
export const setCombo = (c) => combo = c;
export const setState = (newState) => state = newState;
export const setOrderQty = (q) => orderQty = q;
export const setCart = (c) => cart = c;
export const setSaved = (s) => saved = s;

export const freshState = () => ({ dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] });

// تحميل الـ Saved من الـ LocalStorage إذا أمكن
if (typeof window !== 'undefined') {
  try { saved = JSON.parse(localStorage.getItem('forno_saved') || '[]'); } catch (e) { saved = []; }
}