// tests/pricing.test.mjs
import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SIZES, meatPrice, unitPrice, comboDelta, effectiveUnit } from '../src/lib/pizza/pricing.js';
import { validateCoupon, ACTIVE_COUPONS } from '../src/lib/coupons.js';

describe('Pricing Engine Verification', () => {
  it('should define standard pizza sizes with correct scales', () => {
    assert.equal(SIZES.length, 3);
    const small = SIZES.find(s => s.id === 'small');
    const med = SIZES.find(s => s.id === 'med');
    const large = SIZES.find(s => s.id === 'large');

    assert.ok(small && small.scale < med.scale);
    assert.equal(med.scale, 1.0);
    assert.ok(large && large.scale > med.scale);
  });

  it('should calculate meat prices accurately according to portion multipliers', () => {
    // Normal portion
    const normalPrice = meatPrice('pepperoni', 'normal', 'med');
    assert.ok(typeof normalPrice === 'number' && normalPrice > 0);

    // Less portion should be cheaper or equal
    const lessPrice = meatPrice('pepperoni', 'less', 'med');
    assert.ok(lessPrice <= normalPrice);

    // More portion should be more expensive
    const morePrice = meatPrice('pepperoni', 'more', 'med');
    assert.ok(morePrice >= normalPrice);
  });

  it('should calculate unitPrice with base scale and additions', () => {
    const baseMed = unitPrice({ size: 'med', dough: 'classic' });
    const baseSmall = unitPrice({ size: 'small', dough: 'classic' });
    const baseLarge = unitPrice({ size: 'large', dough: 'classic' });

    assert.ok(baseSmall < baseMed);
    assert.ok(baseLarge > baseMed);

    // Adding toppings must increase the unit price
    const withMeat = unitPrice({
      size: 'med',
      dough: 'classic',
      sauce: 'tomato',
      cheese: 'mozzarella',
      meats: { pepperoni: 'normal' }
    });
    assert.ok(withMeat > baseMed);
  });

  it('should calculate comboDelta and effectiveUnit correctly', () => {
    const combo = {
      basePrice: 200,
      snap: {
        dough: 'classic',
        sauce: 'tomato',
        cheese: 'mozzarella',
        meats: {},
        vegs: [],
        extras: []
      }
    };

    // Exactly matching combo should have delta = 0 and effectiveUnit = basePrice
    const exactState = {
      size: 'med',
      dough: 'classic',
      sauce: 'tomato',
      cheese: 'mozzarella',
      meats: {},
      vegs: [],
      extras: []
    };
    assert.equal(comboDelta(exactState, combo), 0);
    assert.equal(effectiveUnit(exactState, combo), 200);

    // Adding an extra topping should increase effective unit by delta
    const extraState = {
      ...exactState,
      vegs: ['olives']
    };
    const delta = comboDelta(extraState, combo);
    assert.ok(delta > 0);
    assert.equal(effectiveUnit(extraState, combo), 200 + delta);
  });
});

describe('Coupon Validation Suite', () => {
  it('should reject invalid or missing coupon codes', () => {
    const res1 = validateCoupon('', 300);
    assert.equal(res1.valid, false);

    const res2 = validateCoupon('NONEXISTENT_CODE', 300);
    assert.equal(res2.valid, false);
  });

  it('should reject coupons when subtotal does not meet minSubtotal', () => {
    // FORNO20 requires minSubtotal of 250
    const res = validateCoupon('FORNO20', 150);
    assert.equal(res.valid, false);
    assert.ok(res.error);
  });

  it('should calculate percent discount accurately', () => {
    const res = validateCoupon('FORNO10', 300);
    assert.equal(res.valid, true);
    assert.equal(res.discount, 30); // 10% of 300
    assert.equal(res.finalTotal, 270);
  });

  it('should calculate fixed discount accurately', () => {
    const res = validateCoupon('WELCOME50', 300);
    assert.equal(res.valid, true);
    assert.equal(res.discount, 50);
    assert.equal(res.finalTotal, 250);
  });
});
