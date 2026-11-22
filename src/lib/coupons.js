// src/lib/coupons.js
// تم تعليق جزء الكوبونات بالكامل من الموقع (ctrl + ظ)

/*
import { supabaseServer } from '@/lib/supabaseServer';

export const DEFAULT_COUPONS = {
  FORNO10: {
    code: 'FORNO10',
    type: 'percent',
    value: 10,
    minSubtotal: 0,
    maxDiscount: 0,
    active: true,
    description: {
      en: '10% discount applied to your order!',
      ar: 'تم تطبيق خصم 10% على طلبك!',
    },
  },
  FORNO20: {
    code: 'FORNO20',
    type: 'percent',
    value: 20,
    minSubtotal: 250,
    maxDiscount: 0,
    active: true,
    description: {
      en: '20% discount on orders over 250 EGP!',
      ar: 'تم تطبيق خصم 20% للطلبات فوق 250 ج.م!',
    },
  },
  WELCOME50: {
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    minSubtotal: 200,
    maxDiscount: 0,
    active: true,
    description: {
      en: '50 EGP welcome discount applied!',
      ar: 'تم خصم 50 ج.م كهدية ترحيبية!',
    },
  },
  NAPOLI15: {
    code: 'NAPOLI15',
    type: 'percent',
    value: 15,
    minSubtotal: 180,
    maxDiscount: 0,
    active: true,
    description: {
      en: '15% artisan pizza discount applied!',
      ar: 'تم تطبيق خصم 15% على البيتزا!',
    },
  },
};

export const ACTIVE_COUPONS = DEFAULT_COUPONS;

export async function getCouponsMap(forceFresh = false) {
  return DEFAULT_COUPONS;
}

export async function saveCouponsMap(couponsMap) {
  return couponsMap;
}

export function invalidateCouponsCache() {}

export async function validateCouponAsync(code, subtotal) {
  return { valid: false, error: { en: 'Coupons disabled', ar: 'الكوبونات معطلة حالياً' } };
}

export function validateCoupon(code, subtotal, fallbackCoupons = DEFAULT_COUPONS) {
  return { valid: false, error: { en: 'Coupons disabled', ar: 'الكوبونات معطلة حالياً' } };
}
*/

export const DEFAULT_COUPONS = {};
export const ACTIVE_COUPONS = {};
export async function getCouponsMap() { return {}; }
export async function saveCouponsMap() { return {}; }
export function invalidateCouponsCache() {}
export async function validateCouponAsync() { return { valid: false }; }
export function validateCoupon() { return { valid: false }; }
