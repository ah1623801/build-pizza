// src/lib/i18n.js
"use client";

export const translations = {
  en: {
    // Nav
    navBuild: "BUILD",
    navMenu: "MENU",
    navContact: "CONTACT",
    navSaved: "SAVED",
    navCart: "CART",
    navLang: "العربية",

    // Hero
    heroTitle1: "YOUR PIZZA.",
    heroTitle2: "YOUR RULES.",
    heroSub: "Build it exactly the way you want it. Real dough, real fire, real cheese — every choice lands on the same pizza, live.",
    heroCtaBuild: "BUILD YOUR PIZZA",
    heroCtaMenu: "VIEW MENU",
    heroScroll: "SCROLL",

    // Builder
    builderHead: "CREATE YOUR OWN PIZZA",
    chooseSize: "CHOOSE PIZZA SIZE",
    sizeSmall: "Small",
    sizeMed: "Medium",
    sizeLarge: "Large",
    bakeBtn: "BAKE PIZZA",
    pickDoughFirst: "PICK DOUGH, SAUCE & CHEESE FROM THE WHEEL FIRST 🍕",
    currency: "EGP",

    // Wheel Labels
    catDough: "DOUGH",
    catSauce: "SAUCE",
    catCheese: "CHEESE",
    catMeat: "MEAT",
    catVeg: "VEGGIES",
    catExtras: "EXTRAS",

    // Menu
    menuKicker: "THE MENU",
    menuTitle1: "DON'T WANT TO BUILD?",
    menuTitle2: "WE ALREADY DID THE WORK.",
    catSignature: "SIGNATURE",
    catClassic: "CLASSIC",
    catSpicy: "SPICY",
    catVegetarian: "VEGGIE",
    catSides: "SIDES",
    catDrinks: "DRINKS",
    catDesserts: "DESSERTS",
    addToCart: "ADD TO CART",
    noProducts: "NO PRODUCTS IN THIS CATEGORY YET.",

    // Contact
    contactKicker: "CONTACT US",
    contactTitle1: "GOT SOMETHING",
    contactTitle2: "TO SAY?",
    contactName: "NAME",
    contactPhone: "PHONE",
    contactEmail: "EMAIL",
    contactMessage: "MESSAGE",
    contactSend: "SEND MESSAGE",
    contactSuccessTitle: "THANK YOU.",
    contactSuccessSub: "WE'LL BE IN TOUCH.",

    // Cart & Checkout
    cartTitle: "YOUR CART",
    cartEmpty: "YOUR CART IS EMPTY.<br>GO BUILD SOMETHING BEAUTIFUL.",
    cartTotal: "TOTAL",
    cartCheckout: "CHECKOUT",
    cartContinue: "CONTINUE BUILDING",
    backToCart: "← BACK TO CART",
    customerInfo: "CUSTOMER INFO",
    fullName: "FULL NAME",
    phoneNumber: "PHONE NUMBER",
    paymentMethod: "PAYMENT METHOD",
    payCash: "💵 CASH",
    payVisa: "💳 VISA / INSTAPAY",
    orderType: "ORDER TYPE",
    typeDelivery: "🛵 DELIVERY",
    typePickup: "🏪 IN STORE PICKUP",
    deliveryAddress: "DELIVERY ADDRESS (STREET, BUILDING, APARTMENT)",
    uploadReceipt: "UPLOAD PAYMENT RECEIPT",
    selectReceipt: "SELECT RECEIPT IMAGE",
    tapToCopy: "TAP TO COPY",
    copied: "COPIED! ✓",
    placeOrderCashDelivery: "PLACE ORDER (CASH ON DELIVERY)",
    placeOrderCashPickup: "PLACE ORDER (PAY AT STORE)",
    placeOrderVisa: "SUBMIT PAYMENT & ORDER",
    orderTracking: "LIVE ORDER STATUS",
    couponLabel: "PROMO CODE / COUPON",
    applyCoupon: "APPLY",
    couponPlaceholder: "e.g. FORNO10",
    subtotal: "SUBTOTAL:",
    discount: "DISCOUNT:",
    whatsappConfirm: "CONFIRM ON WHATSAPP",
    orderReceivedMsg: "THANK YOU! YOUR WOOD-FIRED ORDER IS RECEIVED.",
    orderStatusLabel: "STATUS:",
    trackTotalDue: "TOTAL DUE:",
    statusConfirmedPreparing: "CONFIRMED & PREPARING",
    descConfirmedPreparing: "Payment verified! Your order is confirmed and being prepared in the wood-fired oven 🔥",
    modalPaymentConfirmedTitle: "PAYMENT CONFIRMED! 🎉",
    modalPaymentConfirmedSub: "Your payment was verified and the kitchen is preparing your wood-fired pizza!",
    modalViewTrackerBtn: "TRACK ORDER",
    modalOkBtn: "OK",

    // Saved
    savedTitle: "MY SAVED PIZZAS",
    savedEmpty: "NO SAVED PIZZAS YET.<br>BUILD AND BAKE ONE TO SAVE IT!",
    savedBuildNew: "BUILD A NEW ONE",
    savedLoaded: "RECIPE LOADED — EDIT & BAKE",

    // Oven
    ovenTitle: "WOOD-FIRED OVEN",
    ovenBaking: "BAKING AT 450°C",
    ovenReady: "PIZZA BAKED TO PERFECTION!",
    ovenTapHint: "TAP BOX TO OPEN / CLOSE",
    saveRecipe: "SAVE RECIPE",
    orderAgain: "BUILD ANOTHER",

    // Footer
    footerDesc: "Custom Neapolitan wood-fired pizza baked live at 450°C with real flame and pure craftsmanship.",
    footerHoursTitle: "OPENING HOURS",
    footerHours: "Daily: 12:00 PM – 02:00 AM",
    footerDeliveryHours: "Delivery available all week",
    footerFollow: "FOLLOW US",
    footerRights: "ALL RIGHTS RESERVED.",
  },

  ar: {
    // Nav
    navBuild: "اصنع بيتزا",
    navMenu: "المنيو",
    navContact: "تواصل معنا",
    navSaved: "المحفوظات",
    navCart: "السلة",
    navLang: "English",

    // Hero
    heroTitle1: "بيتزتك.",
    heroTitle2: "على ذوقك.",
    heroSub: "اختر كل تفصيلة بنفسك: عجينة طازجة مخبوزة على الحطب، صلصاتنا الخاصة، وأجود أنواع الجبن الطبيعي مباشرة على البيتزا أمامك.",
    heroCtaBuild: "ابدأ تصميم البيتزا",
    heroCtaMenu: "تصفح المنيو",
    heroScroll: "مرر للأسفل",

    // Builder
    builderHead: "صمّم بيتزتك بنفسك",
    chooseSize: "اختر حجم البيتزا",
    sizeSmall: "صغير",
    sizeMed: "وسط",
    sizeLarge: "كبير",
    bakeBtn: "اخبز البيتزا",
    pickDoughFirst: "اختر العجينة والصلصة والجبنة أولاً من العجلة 🍕",
    currency: "ج.م",

    // Wheel Labels
    catDough: "العجينة",
    catSauce: "الصلصة",
    catCheese: "الجبنة",
    catMeat: "اللحوم",
    catVeg: "الخضار",
    catExtras: "الإضافات",

    // Menu
    menuKicker: "قائمة الطعام",
    menuTitle1: "مش عايز تبني بنفسك؟",
    menuTitle2: "جهزنا لك أشهى الوصفات.",
    catSignature: "المميزة",
    catClassic: "كلاسيك",
    catSpicy: "سبايسي",
    catVegetarian: "خضار وجبن",
    catSides: "مقبلات",
    catDrinks: "مشروبات",
    catDesserts: "حلويات",
    addToCart: "أضف للسلة",
    noProducts: "لا توجد أطباق في هذا القسم حالياً.",

    // Contact
    contactKicker: "تواصل معنا",
    contactTitle1: "عندك استفسار",
    contactTitle2: "أو اقتراح؟",
    contactName: "الاسم",
    contactPhone: "رقم الهاتف",
    contactEmail: "البريد الإلكتروني",
    contactMessage: "رسالتك",
    contactSend: "إرسال الرسالة",
    contactSuccessTitle: "شكراً لك.",
    contactSuccessSub: "سنتواصل معك في أقرب وقت.",

    // Cart & Checkout
    cartTitle: "سلة المشتريات",
    cartEmpty: "سلتك فارغة حالياً.<br>اصنع بيتزا أحلامك الآن.",
    cartTotal: "الإجمالي",
    cartCheckout: "إتمام الطلب",
    cartContinue: "متابعة البناء",
    backToCart: "← العودة للسلة",
    customerInfo: "بيانات العميل",
    fullName: "الاسم بالكامل",
    phoneNumber: "رقم الهاتف",
    paymentMethod: "طريقة الدفع",
    payCash: "💵 نقداً (كاش)",
    payVisa: "💳 فيزا / إنستاباي",
    orderType: "نوع الطلب",
    typeDelivery: "🛵 توصيل للمنزل",
    typePickup: "🏪 استلام من الفرع",
    deliveryAddress: "عنوان التوصيل بالتفصيل (الشارع، العمارة، الشقة)",
    uploadReceipt: "إرفاق إيصال التحويل",
    selectReceipt: "اختر صورة الإيصال",
    tapToCopy: "اضغط للنسخ",
    copied: "تم النسخ بنجاح! ✓",
    placeOrderCashDelivery: "تأكيد الطلب (دفع كاش عند الاستلام)",
    placeOrderCashPickup: "تأكيد الطلب (استلام ودفع بالفرع)",
    placeOrderVisa: "تأكيد الطلب وإرسال الإيصال",
    orderTracking: "متابعة حالة الطلب",
    couponLabel: "كود الخصم / كوبون",
    applyCoupon: "تطبيق",
    couponPlaceholder: "مثال: FORNO10",
    subtotal: "المجموع الفرعي:",
    discount: "الخصم:",
    whatsappConfirm: "تأكيد الطلب عبر واتساب",
    orderReceivedMsg: "شكراً لك! تم استلام طلبك وبانتظار بدء التجهيز.",
    orderStatusLabel: "حالة الطلب:",
    trackTotalDue: "إجمالي المبلغ:",
    statusConfirmedPreparing: "تم التأكيد وجاري التجهيز",
    descConfirmedPreparing: "تم تأكيد الدفع بنجاح! طلبك مؤكد وبدأ الشيف في تجهيزه وخبزه بالفرن الآن 🔥",
    modalPaymentConfirmedTitle: "تم تأكيد الدفع بنجاح! 🎉",
    modalPaymentConfirmedSub: "تم تأكيد طلبك والبدء في تجهيزه وخبزه في فرن الحطب الآن!",
    modalViewTrackerBtn: "متابعة حالة الطلب",
    modalOkBtn: "حسناً",

    // Saved
    savedTitle: "البيتزا المحفوظة",
    savedEmpty: "لا توجد أي وصفات محفوظة بعد.<br>صمّم بيتزا واخبزها لتتمكن من حفظها!",
    savedBuildNew: "تصميم بيتزا جديدة",
    savedLoaded: "تم استرجاع الوصفة — جاهزة للتعديل والخبز",

    // Oven
    ovenTitle: "فرن الحطب النابوليتاني",
    ovenBaking: "جاري الخبز على درجة 450° مئوية...",
    ovenReady: "نضجت البيتزا بأعلى معايير الحطب!",
    ovenTapHint: "اضغط على العلبة لفتحها أو غلقها",
    saveRecipe: "حفظ الوصفة",
    orderAgain: "تصميم بيتزا أخرى",

    // Footer
    footerDesc: "بيتزا نابوليتانية أصيلة مخبوزة على لهب الحطب الحقيقي عند 450 درجة مئوية لنكهة لا تُنسى.",
    footerHoursTitle: "مواعيد العمل",
    footerHours: "يومياً: من 12:00 ظهراً حتى 02:00 صباحاً",
    footerDeliveryHours: "التوصيل متاح طوال أيام الأسبوع",
    footerFollow: "تابعنا على",
    footerRights: "جميع الحقوق محفوظة.",
  }
};

let currentLang = 'ar';

export function getLang() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('forno_lang') || 'ar';
  }
  return 'ar';
}

export function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';
  if (typeof window !== 'undefined') {
    localStorage.setItem('forno_lang', currentLang);
    document.documentElement.lang = currentLang;
    // الموقع يظل بتخطيط LTR دائمًا مع تطبيق خط كايرو فقط للنصوص العربية بدون كسر التخطيط
    document.documentElement.dir = 'ltr';
    document.body.classList.toggle('lang-ar', currentLang === 'ar');
    window.dispatchEvent(new CustomEvent('forno_lang_change', { detail: currentLang }));
  }
}

export function toggleLang() {
  const current = getLang();
  const next = current === 'ar' ? 'en' : 'ar';
  setLang(next);
  return next;
}

export function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || translations['ar']?.[key] || translations['en']?.[key] || key;
}

// ================= BILINGUAL HELPERS & DICTIONARIES =================
export const ITEM_SHORT_MAP = {
  // Fire
  'fire': { en: 'PEPPERONI FIRE', ar: 'بيبروني فاير' },
  'the fire': { en: 'PEPPERONI FIRE', ar: 'بيبروني فاير' },
  'pepperoni fire': { en: 'PEPPERONI FIRE', ar: 'بيبروني فاير' },
  'بيتزا بيبروني فاير': { en: 'PEPPERONI FIRE', ar: 'بيبروني فاير' },
  'بيبروني فاير': { en: 'PEPPERONI FIRE', ar: 'بيبروني فاير' },

  // Truffle
  'truffle': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },
  'the truffle': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },
  'truffle mushroom': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },
  'بيتزا ترافل بالمشروم': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },
  'ترافل بالمشروم': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },
  'ترافل مشروم': { en: 'TRUFFLE MUSHROOM', ar: 'ترافل مشروم' },

  // BBQ
  'bbq': { en: 'BBQ CHICKEN', ar: 'تشيكن باربيكيو' },
  'the bbq': { en: 'BBQ CHICKEN', ar: 'تشيكن باربيكيو' },
  'bbq chicken': { en: 'BBQ CHICKEN', ar: 'تشيكن باربيكيو' },
  'بيتزا تشيكن باربيكيو': { en: 'BBQ CHICKEN', ar: 'تشيكن باربيكيو' },
  'تشيكن باربيكيو': { en: 'BBQ CHICKEN', ar: 'تشيكن باربيكيو' },

  // Green / Supreme
  'green': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },
  'the green': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },
  'veggie supreme': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },
  'بيتزا سوبريم خضار وجبن': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },
  'سوبريم خضار وجبن': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },
  'سوبريم خضار': { en: 'VEGGIE SUPREME', ar: 'سوبريم خضار' },

  // Margherita
  'marg': { en: 'MARGHERITA', ar: 'مارجريتا' },
  'margherita': { en: 'MARGHERITA', ar: 'مارجريتا' },
  'بيتزا مارجريتا نابوليتان': { en: 'MARGHERITA', ar: 'مارجريتا' },
  'بيتزا مارجريتا': { en: 'MARGHERITA', ar: 'مارجريتا' },
  'مارجريتا': { en: 'MARGHERITA', ar: 'مارجريتا' },

  // Original / Classic Pepperoni
  'original': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },
  'the original': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },
  'classic pepperoni': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },
  'بيتزا بيبروني كلاسيك دبل تشيز': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },
  'بيتزا بيبروني كلاسيك': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },
  'بيبروني كلاسيك': { en: 'CLASSIC PEPPERONI', ar: 'بيبروني كلاسيك' },

  // Diablo
  'diablo': { en: 'DIABLO SPICY', ar: 'ديابلو حارة' },
  'diablo spicy': { en: 'DIABLO SPICY', ar: 'ديابلو حارة' },
  'بيتزا ديابلو بيف حارة': { en: 'DIABLO SPICY', ar: 'ديابلو حارة' },
  'ديابلو بيف حارة': { en: 'DIABLO SPICY', ar: 'ديابلو حارة' },
  'ديابلو حارة': { en: 'DIABLO SPICY', ar: 'ديابلو حارة' },

  // Sides / Bread
  'bread': { en: 'GARLIC BREAD', ar: 'خبز بالثوم' },
  'garlic bread': { en: 'GARLIC BREAD', ar: 'خبز بالثوم' },
  'garlic butter bread': { en: 'GARLIC BREAD', ar: 'خبز بالثوم' },
  'خبز بالثوم والجبنة بفرن الحطب': { en: 'GARLIC BREAD', ar: 'خبز بالثوم' },
  'خبز بالثوم': { en: 'GARLIC BREAD', ar: 'خبز بالثوم' },

  // Drinks / Cola
  'cola': { en: 'CRAFT COLA', ar: 'كولا مثلجة' },
  'craft cola': { en: 'CRAFT COLA', ar: 'كولا مثلجة' },
  'كولا مثلجة منعشة': { en: 'CRAFT COLA', ar: 'كولا مثلجة' },
  'كولا مثلجة': { en: 'CRAFT COLA', ar: 'كولا مثلجة' },

  // Desserts / Lava
  'lava': { en: 'CHOCOLATE LAVA', ar: 'مولتن لافا' },
  'chocolate lava': { en: 'CHOCOLATE LAVA', ar: 'مولتن لافا' },
  'مولتن لافا كيك شوكولاتة': { en: 'CHOCOLATE LAVA', ar: 'مولتن لافا' },
  'مولتن لافا': { en: 'CHOCOLATE LAVA', ar: 'مولتن لافا' },
};

export const INGREDIENT_TRANSLATIONS = {
  'Tomato': 'صلصة طماطم',
  'Mozzarella': 'موتزاريلا',
  'Pepperoni': 'بيبروني',
  'Jalapeño': 'هلابينو',
  'Chili Oil': 'زيت حار',
  'Truffle Cream': 'كريمة ترافل',
  'Mushroom': 'مشروم',
  'Parmesan': 'بارميزان',
  'BBQ': 'صوص باربيكيو',
  'Chicken': 'دجاج مشوي',
  'Smoked Cheese': 'جبنة مدخنة',
  'Onion': 'بصل مكرمل',
  'Olives': 'زيتون كلاماتا',
  'Green Pepper': 'فلفل أخضر',
  'Basil': 'ريحان',
  'Olive Oil': 'زيت زيتون',
  'Double Pepperoni': 'دبل بيبروني',
  'Spicy Tomato': 'صلصة حارة',
  'Beef': 'لحم مفروم',
  'Chili Flakes': 'شطة مجروشة',
  'Wood-Oven': 'فرن حطب',
  'Garlic': 'ثوم بلدي',
  'Herbs': 'أعشاب إيطالية',
  'Butter': 'زبدة',
  'Ice Cold': 'ثلج منعش',
  'House Syrup': 'سيرب كولا',
  'Citrus': 'ليمون',
  'Molten Center': 'شوكولاتة ذائبة',
  'Sea Salt': 'ملح بحري',
  'Vanilla': 'فانيليا',
};

export const CATEGORY_TRANSLATIONS = {
  'signature': { en: 'SIGNATURE', ar: 'المميزة' },
  'classic': { en: 'CLASSIC', ar: 'كلاسيك' },
  'spicy': { en: 'SPICY', ar: 'سبايسي' },
  'vegetarian': { en: 'VEGGIE', ar: 'خضار وجبن' },
  'sides': { en: 'SIDES', ar: 'مقبلات' },
  'drinks': { en: 'DRINKS', ar: 'مشروبات' },
  'desserts': { en: 'DESSERTS', ar: 'حلويات' },
};

/**
 * Format string as bilingual: "English || Arabic"
 */
export function formatBilingual(en, ar) {
  const cleanEn = (en || '').trim();
  const cleanAr = (ar || '').trim();
  if (cleanEn && cleanAr) return `${cleanEn} || ${cleanAr}`;
  return cleanAr || cleanEn;
}

/**
 * Parse string that might be formatted as "English || Arabic"
 */
export function parseBilingual(raw) {
  if (!raw) return { en: '', ar: '' };
  const str = String(raw).trim();
  if (str.includes('||')) {
    const parts = str.split('||').map(s => s.trim());
    return { en: parts[0] || '', ar: parts[1] || parts[0] || '' };
  }
  if (/[\u0600-\u06FF]/.test(str)) {
    return { en: '', ar: str };
  }
  return { en: str, ar: '' };
}

/**
 * Return localized name for menu items (always concise, never showing both languages together)
 */
export function getLocalizedItemName(rawName, lang = getLang()) {
  if (!rawName) return '';
  const parsed = parseBilingual(rawName);
  const cleanRaw = String(rawName).trim().toLowerCase();
  const cleanEn = (parsed.en || '').trim().toLowerCase();
  const cleanAr = (parsed.ar || '').trim();

  let match = ITEM_SHORT_MAP[cleanRaw] ||
              (cleanEn ? ITEM_SHORT_MAP[cleanEn] : null) ||
              (cleanAr ? ITEM_SHORT_MAP[cleanAr] : null);

  if (!match) {
    for (const [k, v] of Object.entries(ITEM_SHORT_MAP)) {
      if (cleanRaw.includes(k) || (cleanAr && cleanAr.includes(k)) || (cleanEn && cleanEn.includes(k))) {
        match = v;
        break;
      }
    }
  }

  if (match) {
    return lang === 'en' ? match.en : match.ar;
  }

  if (lang === 'en') {
    return parsed.en || parsed.ar || rawName;
  }
  return parsed.ar || parsed.en || rawName;
}

/**
 * Return localized text for an ingredient
 */
export function getLocalizedIngredient(rawIng, lang = getLang()) {
  if (!rawIng) return '';
  const parsed = parseBilingual(rawIng);
  const clean = (parsed.en || parsed.ar || rawIng).trim();

  if (lang === 'en') {
    if (parsed.en) return parsed.en;
    for (const [enKey, arVal] of Object.entries(INGREDIENT_TRANSLATIONS)) {
      if (arVal === clean || clean.includes(arVal)) return enKey;
    }
    return clean;
  }

  if (parsed.ar) return parsed.ar;
  if (INGREDIENT_TRANSLATIONS[clean]) return INGREDIENT_TRANSLATIONS[clean];
  const match = Object.keys(INGREDIENT_TRANSLATIONS).find(k => k.toLowerCase() === clean.toLowerCase());
  if (match) return INGREDIENT_TRANSLATIONS[match];
  return clean;
}

/**
 * Return localized name for category (always concise)
 */
export function getLocalizedCategoryName(rawCat, lang = getLang()) {
  if (!rawCat) return '';
  const parsed = parseBilingual(rawCat);
  const cleanRaw = String(rawCat).trim().toLowerCase();
  const cleanEn = (parsed.en || '').trim().toLowerCase();
  const cleanAr = (parsed.ar || '').trim();

  let entry = CATEGORY_TRANSLATIONS[cleanRaw] ||
              (cleanEn ? CATEGORY_TRANSLATIONS[cleanEn] : null);

  if (!entry) {
    entry = Object.values(CATEGORY_TRANSLATIONS).find(c =>
      c.ar === cleanAr || c.ar === rawCat || c.en.toLowerCase() === cleanRaw || c.en.toLowerCase() === cleanEn
    );
  }

  if (!entry) {
    if (cleanRaw.includes('sig') || cleanAr.includes('ممي')) entry = CATEGORY_TRANSLATIONS.signature;
    else if (cleanRaw.includes('class') || cleanAr.includes('كلاسيك')) entry = CATEGORY_TRANSLATIONS.classic;
    else if (cleanRaw.includes('spic') || cleanAr.includes('سبايس') || cleanAr.includes('حار')) entry = CATEGORY_TRANSLATIONS.spicy;
    else if (cleanRaw.includes('veg') || cleanAr.includes('خضار') || cleanAr.includes('جبن')) entry = CATEGORY_TRANSLATIONS.vegetarian;
    else if (cleanRaw.includes('side') || cleanAr.includes('مقبل')) entry = CATEGORY_TRANSLATIONS.sides;
    else if (cleanRaw.includes('drink') || cleanAr.includes('مشروب')) entry = CATEGORY_TRANSLATIONS.drinks;
    else if (cleanRaw.includes('dessert') || cleanAr.includes('حلو')) entry = CATEGORY_TRANSLATIONS.desserts;
  }

  if (entry) {
    return lang === 'en' ? entry.en : entry.ar;
  }

  if (lang === 'en') {
    return parsed.en || parsed.ar || rawCat;
  }
  return parsed.ar || parsed.en || rawCat;
}

