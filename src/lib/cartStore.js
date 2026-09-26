"use client";

// مخزن تفاعلي متوافق مع معمارية ريأكت (Reactive React Store Bridge)
export const CART_EVENT = 'forno_cart_update';

export function dispatchCartUpdate(cartItems) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: cartItems }));
  }
}

export function subscribeCart(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail);
  window.addEventListener(CART_EVENT, handler);
  return () => window.removeEventListener(CART_EVENT, handler);
}