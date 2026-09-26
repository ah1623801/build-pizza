// src/lib/pizza/i18nManager.js
"use client";

import { t, getLang, setLang } from '@/lib/i18n';

export function applyTranslations() {
  const lang = getLang();
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Update HTML tag - Keep site layout LTR, text only in Arabic
  document.documentElement.lang = lang;
  document.documentElement.dir = 'ltr';
  document.body.classList.toggle('lang-ar', lang === 'ar');

  // Nav & Lang Pill
  // Nav Language Button (عر when on EN, EN when on AR)
  const isAr = lang === 'ar';
  const nextLangText = isAr ? 'EN' : 'عر';
  if ($('#langLabel')) $('#langLabel').textContent = nextLangText;
  if ($('#mLangOpt')) $('#mLangOpt').textContent = isAr ? 'English' : 'عربي';
  if ($('#mLangLabel')) $('#mLangLabel').textContent = isAr ? 'اللغة' : 'LANGUAGE';
  $$('.lang-pill .lp-en').forEach(el => el.classList.toggle('active', !isAr));
  $$('.lang-pill .lp-ar').forEach(el => el.classList.toggle('active', isAr));
  if ($('#navLinkBuild')) $('#navLinkBuild').textContent = t('navBuild');
  if ($('#navLinkMenu')) $('#navLinkMenu').textContent = t('navMenu');
  if ($('#navLinkContact')) $('#navLinkContact').textContent = t('navContact');
  if ($('#navSavedText')) $('#navSavedText').textContent = t('navSaved');
  if ($('#navCartText')) $('#navCartText').textContent = t('navCart');

  if ($('#mNavLinkBuild')) $('#mNavLinkBuild').textContent = t('heroCtaBuild');
  if ($('#mNavLinkMenu')) $('#mNavLinkMenu').textContent = t('navMenu');
  if ($('#mNavLinkContact')) $('#mNavLinkContact').textContent = t('navContact');
  if ($('#mNavSavedText')) $('#mNavSavedText').textContent = t('savedTitle');

  // Hero
  const titleLine1 = $('.h-title .h-line:first-child span');
  const titleLine2 = $('.h-title .h-line.outline span');
  if (titleLine1) titleLine1.textContent = t('heroTitle1');
  if (titleLine2) titleLine2.textContent = t('heroTitle2');
  if ($('.h-sub')) $('.h-sub').textContent = t('heroSub');
  if ($('#ctaBuild')) $('#ctaBuild').textContent = t('heroCtaBuild');
  if ($('#ctaMenu')) $('#ctaMenu').textContent = t('heroCtaMenu');
  if ($('.h-scroll')) $('.h-scroll').textContent = t('heroScroll');

  // Builder
  if ($('#builderHeading')) {
    $('#builderHeading').innerHTML = lang === 'ar'
      ? 'صمّم بيتزتك <em>بنفسك</em>'
      : 'CREATE YOUR OWN <em>PIZZA</em>';
  }
  if ($('#chooseSizeTitle')) $('#chooseSizeTitle').textContent = t('chooseSize');
  const wbSpan = $('#wheelBake span');
  if (wbSpan) wbSpan.textContent = t('bakeBtn');

  // Wheel category labels
  const labelMap = {
    dough: t('catDough'),
    sauce: t('catSauce'),
    cheese: t('catCheese'),
    meat: t('catMeat'),
    veg: t('catVeg'),
    extras: t('catExtras'),
  };
  $$('.wg-label').forEach((el) => {
    const cat = el.dataset.cat;
    if (cat && labelMap[cat]) {
      el.textContent = labelMap[cat];
    }
  });

  // Menu Section
  if ($('.menu-pin .m-head .kicker')) $('.menu-pin .m-head .kicker').textContent = t('menuKicker');
  if ($('.menu-pin .m-head h2')) {
    $('.menu-pin .m-head h2').innerHTML = `${t('menuTitle1')}<br/><em>${t('menuTitle2')}</em>`;
  }
  const tabSignature = $('button.tab[data-cat="signature"]');
  if (tabSignature) tabSignature.textContent = t('catSignature');
  const tabClassic = $('button.tab[data-cat="classic"]');
  if (tabClassic) tabClassic.textContent = t('catClassic');
  const tabSpicy = $('button.tab[data-cat="spicy"]');
  if (tabSpicy) tabSpicy.textContent = t('catSpicy');
  const tabVeg = $('button.tab[data-cat="vegetarian"]');
  if (tabVeg) tabVeg.textContent = t('catVegetarian');
  const tabSides = $('button.tab[data-cat="sides"]');
  if (tabSides) tabSides.textContent = t('catSides');
  const tabDrinks = $('button.tab[data-cat="drinks"]');
  if (tabDrinks) tabDrinks.textContent = t('catDrinks');
  const tabDesserts = $('button.tab[data-cat="desserts"]');
  if (tabDesserts) tabDesserts.textContent = t('catDesserts');

  $$('.mbtn').forEach((b) => b.textContent = t('addToCart'));
  try {
    if (typeof window !== 'undefined' && typeof window.fornoRerenderMenu === 'function') {
      window.fornoRerenderMenu();
    }
  } catch (err) {}

  // Contact Section
  if ($('.c-info .kicker')) $('.c-info .kicker').textContent = t('contactKicker');
  if ($('.c-info h2')) {
    $('.c-info h2').innerHTML = `${t('contactTitle1')}<br/><em>${t('contactTitle2')}</em>`;
  }
  if ($('#fName')) $('#fName').placeholder = t('contactName');
  if ($('#fPhone')) $('#fPhone').placeholder = t('contactPhone');
  if ($('#fEmail')) $('#fEmail').placeholder = t('contactEmail');
  if ($('#fMsg')) $('#fMsg').placeholder = t('contactMessage');
  if ($('#cForm button[type="submit"]')) $('#cForm button[type="submit"]').textContent = t('contactSend');
  if ($('#cThanks h3')) $('#cThanks h3').textContent = t('contactSuccessTitle');
  if ($('#cThanks p')) $('#cThanks p').textContent = t('contactSuccessSub');

  // Cart Drawer
  if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
  if ($('#cartTotalLabel')) $('#cartTotalLabel').textContent = t('cartTotal');
  if ($('#checkoutBtn')) $('#checkoutBtn').textContent = t('cartCheckout');
  if ($('#continueBtn')) $('#continueBtn').textContent = t('cartContinue');
  if ($('#backToCartBtn')) $('#backToCartBtn').textContent = t('backToCart');
  if ($('#ckCustomerTitle')) $('#ckCustomerTitle').textContent = t('customerInfo');
  if ($('#ckName')) $('#ckName').placeholder = `${t('fullName')} *`;
  if ($('#ckPhone')) $('#ckPhone').placeholder = `${t('phoneNumber')} *`;
  if ($('#ckPaymentTitle')) $('#ckPaymentTitle').textContent = t('paymentMethod');
  if ($('#ckOrderTypeTitle')) $('#ckOrderTypeTitle').textContent = t('orderType');
  if ($('#typeDeliveryBtn')) $('#typeDeliveryBtn').textContent = t('typeDelivery');
  if ($('#typePickupBtn')) $('#typePickupBtn').textContent = t('typePickup');
  if ($('#ckAddressLabel')) $('#ckAddressLabel').textContent = `${t('deliveryAddress')} *`;
  if ($('#ckAddress')) $('#ckAddress').placeholder = t('deliveryAddress');
  if ($('#uploadReceiptLabel')) $('#uploadReceiptLabel').textContent = `${t('uploadReceipt')} *`;
  if ($('#btnSelectReceipt')) $('#btnSelectReceipt').textContent = t('selectReceipt');
  if ($('#checkoutTotalLabel')) $('#checkoutTotalLabel').textContent = `${t('cartTotal')}:`;
  if ($('#couponLabel')) $('#couponLabel').textContent = t('couponLabel');
  if ($('#btnApplyCoupon')) $('#btnApplyCoupon').textContent = t('applyCoupon');
  if ($('#ckCoupon')) $('#ckCoupon').placeholder = t('couponPlaceholder');
  if ($('#subtotalLabel')) $('#subtotalLabel').textContent = t('subtotal');
  if ($('#discountLabel')) $('#discountLabel').textContent = t('discount');
  if ($('#whatsappConfirmBtn')) $('#whatsappConfirmBtn').textContent = t('whatsappConfirm');
  if ($('#trackOrderRecvMsg')) $('#trackOrderRecvMsg').textContent = t('orderReceivedMsg');
  if ($('#trackStatusLabel')) $('#trackStatusLabel').textContent = t('orderStatusLabel');

  // Saved Drawer
  if ($('#savedDrawerTitle')) $('#savedDrawerTitle').textContent = t('savedTitle');
  if ($('#savedBuild')) $('#savedBuild').textContent = t('savedBuildNew');

  // Footer
  if ($('#footerDesc')) $('#footerDesc').textContent = t('footerDesc');
  if ($('#footerHoursTitle')) $('#footerHoursTitle').textContent = t('footerHoursTitle');
  if ($('#footerHoursDaily')) $('#footerHoursDaily').textContent = t('footerHours');
  if ($('#footerHoursDelivery')) $('#footerHoursDelivery').textContent = t('footerDeliveryHours');
  if ($('#footerSocialTitle')) $('#footerSocialTitle').textContent = t('footerFollow');
  if ($('#footerRights')) $('#footerRights').textContent = t('footerRights');
}

export function setupI18n() {
  window.fornoApplyTranslations = applyTranslations;
  applyTranslations();

  if (!window.__forno_i18n_listener_added) {
    window.__forno_i18n_listener_added = true;
    window.addEventListener('forno_lang_change', () => {
      applyTranslations();
    });
  }
}
