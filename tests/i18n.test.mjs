// tests/i18n.test.mjs
import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatBilingual,
  parseBilingual,
  getLocalizedItemName,
  getLocalizedIngredient,
  getLocalizedCategoryName,
  translations
} from '../src/lib/i18n.js';

describe('i18n & Bilingual Processing Suite', () => {
  it('should format bilingual strings correctly', () => {
    assert.equal(formatBilingual('Margherita', 'مارجريتا'), 'Margherita || مارجريتا');
    assert.equal(formatBilingual('Margherita', ''), 'Margherita');
    assert.equal(formatBilingual('', 'مارجريتا'), 'مارجريتا');
  });

  it('should parse bilingual delimiter strings correctly', () => {
    const res = parseBilingual('THE FIRE || ذا فاير');
    assert.equal(res.en, 'THE FIRE');
    assert.equal(res.ar, 'ذا فاير');

    const single = parseBilingual('Only English');
    assert.equal(single.en, 'Only English');
    assert.equal(single.ar, '');
  });

  it('should resolve localized item names according to language', () => {
    assert.equal(getLocalizedItemName('THE FIRE', 'ar'), 'ذا فاير');
    assert.equal(getLocalizedItemName('THE FIRE', 'en'), 'THE FIRE');
    assert.equal(getLocalizedItemName('Custom Name || اسم مخصص', 'ar'), 'اسم مخصص');
    assert.equal(getLocalizedItemName('Custom Name || اسم مخصص', 'en'), 'Custom Name');
  });

  it('should resolve localized ingredients according to dictionary and delimiter', () => {
    assert.equal(getLocalizedIngredient('Tomato', 'ar'), 'صلصة طماطم');
    assert.equal(getLocalizedIngredient('Mozzarella', 'ar'), 'جبنة موتزاريلا');
    assert.equal(getLocalizedIngredient('Pesto || بيستو', 'ar'), 'بيستو');
  });

  it('should resolve category translations properly', () => {
    assert.equal(getLocalizedCategoryName('signature', 'en'), 'SIGNATURE');
    assert.equal(getLocalizedCategoryName('signature', 'ar'), 'المميزة');
    assert.equal(getLocalizedCategoryName('classic', 'ar'), 'الكلاسيكية');
  });

  it('should have complete translations for core UI in both en and ar', () => {
    assert.ok(translations.en.builderHead);
    assert.ok(translations.ar.builderHead);
    assert.ok(translations.en.cartTitle);
    assert.ok(translations.ar.cartTitle);
    assert.ok(translations.en.orderTracking);
    assert.ok(translations.ar.orderTracking);
  });
});
