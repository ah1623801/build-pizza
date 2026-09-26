// src/lib/pizza/config.js
"use client";

export const IMG = {
  doughClassic: '/images/doughClassic.webp',
  doughThin: '/images/doughThin.webp',
  doughThick: '/images/doughThick.webp',
  doughCheese: '/images/doughCheese.webp',
  table: '/images/table.webp',
  fire: '/images/fire.webp',
  pTruffle: '/images/pTruffle.webp',
  pBBQ: '/images/pBBQ.webp',
  pGreen: '/images/pGreen.webp',
  pMarg: '/images/pMarg.webp',
  pOriginal: '/images/pOriginal.webp'
};

export const DOUGH = [
  { id: 'thin', name: 'THIN CRUST', desc: 'Light and crispy', price: 0 },
  { id: 'classic', name: 'CLASSIC', desc: 'Our signature dough', price: 0 },
  { id: 'thick', name: 'THICK CRUST', desc: 'Soft and fluffy', price: 20 },
  { id: 'cheese', name: 'CHEESE CRUST', desc: 'Stuffed with mozzarella', price: 35 }
];

export const SAUCE = [
  { id: 'tomato', name: 'TOMATO', desc: 'Classic tomato sauce', price: 20 },
  { id: 'spicy', name: 'SPICY TOMATO', desc: 'Tomato + chili', price: 30 },
  { id: 'bbq', name: 'BBQ', desc: 'Smoky BBQ sauce', price: 35 },
  { id: 'garlic', name: 'GARLIC CREAM', desc: 'Creamy garlic sauce', price: 40 }
];

export const CHEESE = [
  { id: 'mozzarella', name: 'MOZZARELLA', desc: 'Fresh slices, uncooked', price: 25 },
  { id: 'extra', name: 'EXTRA MOZZARELLA', desc: 'Double the pull', price: 40 },
  { id: 'four', name: 'FOUR CHEESE', desc: 'Mozz · cheddar · parm · gouda', price: 55 },
  { id: 'smoked', name: 'SMOKED CHEESE', desc: 'Low & slow smoked', price: 45 }
];

export const MEAT = [
  { id: 'pepperoni', name: 'PEPPERONI', price: 45 },
  { id: 'beef', name: 'BEEF', price: 50 },
  { id: 'chicken', name: 'CHICKEN', price: 45 },
  { id: 'sausage', name: 'SAUSAGE', price: 40 }
];

export const VEG = [
  { id: 'olives', name: 'OLIVES', price: 15 },
  { id: 'mushroom', name: 'MUSHROOM', price: 20 },
  { id: 'onion', name: 'ONION', price: 12 },
  { id: 'greenPepper', name: 'GREEN PEPPER', price: 15 },
  { id: 'jalapeno', name: 'JALAPEÑO', price: 18 },
  { id: 'basil', name: 'BASIL', price: 10 }
];

export const EXTRAS = [
  { id: 'extraCheese', name: 'EXTRA CHEESE', price: 30 },
  { id: 'chili', name: 'CHILI FLAKES', price: 10 },
  { id: 'garlic', name: 'GARLIC', price: 10 },
  { id: 'truffle', name: 'TRUFFLE OIL', price: 35 }
];

export const DRIZZLES = ['ketchup', 'bbqDrizzle', 'truffle'];

export const TOPCFG = {
  pepperoni: { size: 0.145, kind: 'meat', dist: 'phy', counts: { less: 8, normal: 12, more: 18 }, anim: { dur: 0.7, spin: 160, bounce: true } },
  beef: { size: 0.1, kind: 'meat', dist: 'phy', counts: { less: 10, normal: 15, more: 21 }, anim: { dur: 0.65, spin: 90, bounce: true } },
  chicken: { size: 0.115, kind: 'meat', dist: 'phy', counts: { less: 9, normal: 13, more: 19 }, anim: { dur: 0.7, spin: 120 } },
  sausage: { size: 0.12, kind: 'meat', dist: 'phy', counts: { less: 8, normal: 12, more: 18 }, anim: { dur: 0.7, spin: 100 } },
  olives: { size: 0.07, kind: 'veg', dist: 'phy', fixed: 8, anim: { dur: 0.55, roll: true } },
  mushroom: { size: 0.11, kind: 'veg', dist: 'phy', fixed: 7, anim: { dur: 0.75, spin: 60 } },
  onion: { size: 0.12, kind: 'veg', dist: 'phy', fixed: 6, anim: { dur: 1.05, float: true } },
  greenPepper: { size: 0.115, kind: 'veg', dist: 'phy', fixed: 7, anim: { dur: 0.7, spin: 80 } },
  jalapeno: { size: 0.09, kind: 'veg', dist: 'phy', fixed: 8, anim: { dur: 0.6, spin: 260, bounce: true } },
  basil: { size: 0.13, kind: 'veg', dist: 'phy', fixed: 6, anim: { dur: 1.35, float: true } },
  chili: { size: 0.035, kind: 'veg', fixed: 26, shadow: false, anim: { dur: 0.45, rapid: true } },
  garlic: { size: 0.05, kind: 'veg', fixed: 16, shadow: false, anim: { dur: 0.5 } },
  extraCheese: { size: 0.17, kind: 'cheese', dist: 'phy', fixed: 8, layer: 'cheese', anim: { dur: 0.6, bounce: true } }
};

export const CHEESE_CFG = { mozzarella: { n: 22, v: 0 }, extra: { n: 32, v: 0 }, four: { n: 26, v: 1 }, smoked: { n: 24, v: 2 } };
export const CHEESE_SIZE = 0.19;

export const F_RAW = 'sepia(0) saturate(1) brightness(1) contrast(1) hue-rotate(0deg)';
export const F_DOUGH_C = 'sepia(0.65) saturate(1.55) brightness(0.92) contrast(1.22) hue-rotate(-8deg)';
export const F_TOP_C = 'sepia(0.3) saturate(1.15) brightness(0.82) contrast(1.12) hue-rotate(0deg)';
export const F_VEG_C = 'sepia(0.2) saturate(0.95) brightness(0.85) contrast(1.08) hue-rotate(0deg)';
export const F_SAUCE_C = 'sepia(0.2) saturate(1.35) brightness(0.78) contrast(1.05) hue-rotate(-6deg)';

export const GROUPS = [
  { cat: 'dough', label: 'DOUGH', color: '#f3e9dc', ids: ['thin', 'classic', 'thick', 'cheese'] },
  { cat: 'sauce', label: 'SAUCE', color: '#e0492c', ids: ['tomato', 'spicy', 'bbq', 'garlic'] },
  { cat: 'cheese', label: 'CHEESE', color: '#e8b04b', ids: ['mozzarella', 'extra', 'four', 'smoked'] },
  { cat: 'meat', label: 'MEAT', color: '#c22b1a', ids: ['pepperoni', 'beef', 'chicken', 'sausage'] },
  { cat: 'veg', label: 'VEGGIES', color: '#57a84f', ids: ['olives', 'mushroom', 'onion', 'greenPepper', 'jalapeno', 'basil'] },
  { cat: 'extras', label: 'EXTRAS', color: '#9b6bd6', ids: ['extraCheese', 'chili', 'garlic', 'truffle'] }
];

export const freshState = () => ({
  size: 'med',
  dough: 'classic',
  sauce: null,
  cheese: null,
  meats: {},
  vegs: [],
  extras: []
});
