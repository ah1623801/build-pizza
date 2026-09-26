// src/utils/mainLogic.js
"use client";

/**
 * FORNO Pizza - Master Logic Facade
 * Cleanly re-exports the modular architecture from @/lib/pizza
 */
export { initApp } from '../lib/pizza/index';
export * from '../lib/pizza/config';
export * from '../lib/pizza/geometry';
export * from '../lib/pizza/pricing';
export * from '../lib/pizza/stage';
export * from '../lib/pizza/wheel';
export * from '../lib/pizza/oven';
export * from '../lib/pizza/saved';
export * from '../lib/pizza/cart';
export * from '../lib/pizza/menu';
export * from '../lib/pizza/layout';