// src/lib/coupons.js
/**
 * Central Coupon Validation Logic
 * Used by both POST /api/coupon and POST /api/orders
 */

export const ACTIVE_COUPONS = {
  FORNO10: {
    type: 'percent',
    value: 10,
    minSubtotal: 0,
    description: {
      en: '10% discount applied to your order!',
      ar: 'تم تطبيق خصم 10% على طلبك!',
    },
  },
  FORNO20: {
    type: 'percent',
    value: 20,
    minSubtotal: 250,
    description: {
      en: '20% discount on orders over 250 EGP!',
      ar: 'تم تطبيق خصم 20% للطلبات فوق 250 ج.م!',
    },
  },
  WELCOME50: {
    type: 'fixed',
    value: 50,
    minSubtotal: 200,
    description: {
      en: '50 EGP welcome discount applied!',
      ar: 'تم خصم 50 ج.م كهدية ترحيبية!',
    },
  },
  NAPOLI15: {
    type: 'percent',
    value: 15,
    minSubtotal: 180,
    description: {
      en: '15% artisan pizza discount applied!',
      ar: 'تم تطبيق خصم 15% على البيتزا!',
    },
  },
};

export function validateCoupon(code, subtotal) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: { en: 'Please enter a coupon code', ar: 'يرجى إدخال كود الخصم' } };
  }

const cleanCode = code.trim().toUpperCase();
  
  // حماية ضد Prototype Injection: التأكد إن الكوبون موجود فعلياً كخاصية صريحة وليس وراثة من جافاسكريبت
  const hasCoupon = Object.prototype.hasOwnProperty.call(ACTIVE_COUPONS, cleanCode);
  if (!hasCoupon) {
    return { valid: false, error: { en: 'Invalid or expired promo code', ar: 'كود الخصم غير صحيح أو منتهي الصلاحية' } };
  }

  const coupon = ACTIVE_COUPONS[cleanCode];

  const numericSubtotal = Number(subtotal) || 0;
  if (coupon.minSubtotal && numericSubtotal < coupon.minSubtotal) {
    return {
      valid: false,
      error: {
        en: `Order must be at least ${coupon.minSubtotal} EGP to use this code`,
        ar: `الحد الأدنى لاستخدام هذا الكود هو ${coupon.minSubtotal} ج.م`,
      },
    };
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round((numericSubtotal * coupon.value) / 100);
  } else if (coupon.type === 'fixed') {
    discount = Math.min(numericSubtotal, coupon.value);
  }

  const finalTotal = Math.max(0, numericSubtotal - discount);

return {
    valid: true,
    code: cleanCode,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal || 0, // إرسال الحد الأدنى للواجهة عشان تراقب أي نقصان في السلة
    discount,
    finalTotal,
    message: coupon.description,
  };
}
