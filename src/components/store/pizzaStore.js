export let state = { size: 'med', dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] };
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

export const setCart = (c) => {
  cart = c;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('forno_cart', JSON.stringify(c)); } catch (e) {}
  }
};

export const setSaved = (s) => {
  saved = s;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('forno_saved', JSON.stringify(s)); } catch (e) {}
  }
};

export const freshState = (size = 'med') => ({ size, dough: null, sauce: null, cheese: null, meats: {}, vegs: [], extras: [] });

// استرجاع السلة والمحفوظات فوراً عند إقلاع الصفحة في المتصفح
if (typeof window !== 'undefined') {
  try { saved = JSON.parse(localStorage.getItem('forno_saved') || '[]'); } catch (e) { saved = []; }
  try { cart = JSON.parse(localStorage.getItem('forno_cart') || '[]'); } catch (e) { cart = []; }
}