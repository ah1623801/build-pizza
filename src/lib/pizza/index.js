// src/lib/pizza/index.js
"use client";

import { freshState, IMG } from './config';
import { cutout, loadImg, DOUGH_SRC, PizzaStage } from './stage';
import { effectiveUnit, baseHas } from './pricing';
import { setupWheel } from './wheel';
import { setupOven } from './oven';
import { setupSaved } from './saved';
import { setupCart } from './cart';
import { syncMenuFromServer, buildTabs, renderMenu, setupContactForm, resolvePizzaImage } from './menu';
import { setupLayout, toast, triggerSizeAlert, updateBadge } from './layout';
import { initAnimations } from '@/lib/animations';
import { setupI18n } from './i18nManager';
import { getLang, getLocalizedItemName, getLocalizedIngredient } from '@/lib/i18n';

const $ = (s) => (typeof document !== 'undefined' ? document.querySelector(s) : null);
const $$ = (s) => (typeof document !== 'undefined' ? [...document.querySelectorAll(s)] : []);

let appInitPromise = null;
let currentAppInstance = null;

export function dismissLoader() {
  const l = document.getElementById('loader');
  if (!l) {
    document.body.classList.add('loaded');
    return;
  }
  const pct = document.getElementById('loadPct');
  const bar = document.getElementById('loadBar');
  if (pct) pct.textContent = '100%';
  if (bar) bar.style.width = '100%';

  if (window.gsap) {
    window.gsap.to(l, {
      autoAlpha: 0,
      scale: 1.05,
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        l.remove();
        document.body.classList.add('loaded');
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }
    });
  } else {
    l.style.transition = 'opacity 0.4s ease';
    l.style.opacity = '0';
    setTimeout(() => {
      l.remove();
      document.body.classList.add('loaded');
    }, 400);
  }
}

export function initApp() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (currentAppInstance) return Promise.resolve(currentAppInstance);
  if (appInitPromise) return appInitPromise;

  window.__forno_app_inited = true;

  // Fallback safety timeout: never let the loader stay stuck
  const failsafeTimer = setTimeout(() => {
    dismissLoader();
  }, 2200);

  appInitPromise = (async () => {
    console.log('🍕 [FORNO 1/4] Starting modular initApp...');

    const { gsap, ScrollTrigger } = initAnimations();

    console.log('🍕 [FORNO 3/4] Animation engine ready! Booting components...');

    const progress = { v: 0 };
    let loadAnim = null;
    if (gsap) {
      loadAnim = gsap.to(progress, {
        v: 90,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => {
          const bar = document.getElementById('loadBar');
          const pct = document.getElementById('loadPct');
          if (bar) bar.style.width = Math.round(progress.v) + '%';
          if (pct) pct.textContent = Math.round(progress.v) + '%';
        }
      });
    }

    DOUGH_SRC.thin = IMG.doughThin;
    DOUGH_SRC.classic = IMG.doughClassic;
    DOUGH_SRC.thick = IMG.doughThick;
    DOUGH_SRC.cheese = IMG.doughCheese;

    const jobs = [
      loadImg(IMG.fire).catch(() => {}),
      syncMenuFromServer().catch(() => {})
    ];

    await Promise.all(jobs);

    return new Promise((resolve) => {
      const handleComplete = () => {
        clearTimeout(failsafeTimer);
        try {
          const instance = finishBoot();
          resolve(instance);
        } catch (err) {
          console.error('finishBoot error:', err);
          dismissLoader();
          resolve(null);
        }
      };

      if (gsap) {
        if (loadAnim) loadAnim.kill();
        gsap.to(progress, {
          v: 100,
          duration: 0.25,
          ease: 'power1.inOut',
          onUpdate: () => {
            const bar = document.getElementById('loadBar');
            const pct = document.getElementById('loadPct');
            if (bar) bar.style.width = Math.round(progress.v) + '%';
            if (pct) pct.textContent = Math.round(progress.v) + '%';
          },
          onComplete: handleComplete
        });
      } else {
        handleComplete();
      }
    });
  })();

  function finishBoot() {
    const gsap = window.gsap;
    try {
      localStorage.removeItem('forno_builder_progress');
    } catch (e) {}

    let state = freshState();
    let combo = null;
    let orderQty = 1;
    let cart = [];
    let saved = [];

// نظام فحص وتحديث كاش العميل (Storage Versioning & Integrity Validation)
    const STORAGE_VERSION = 'forno_v1.1';
    try {
      if (localStorage.getItem('forno_storage_ver') !== STORAGE_VERSION) {
        localStorage.setItem('forno_storage_ver', STORAGE_VERSION);
      }

      // فلترة وتطهير سلة المشتريات من أي داتا قديمة مكسورة تسبب NaN
      const rawCart = JSON.parse(localStorage.getItem('forno_cart'));
      if (Array.isArray(rawCart)) {
        cart = rawCart.filter(it => 
          it && 
          it.uid && 
          typeof it.unit === 'number' && 
          !isNaN(it.unit) && 
          it.unit >= 0 &&
          it.qty > 0 &&
          (it.kind === 'simple' || (it.kind === 'pizza' && it.snap && typeof it.snap === 'object'))
        );
      } else {
        cart = [];
      }
    } catch (e) {
      cart = [];
    }

    try {
      // فلترة وتطهير الوصفات المحفوظة
      const rawSaved = JSON.parse(localStorage.getItem('forno_saved'));
      if (Array.isArray(rawSaved)) {
        saved = rawSaved.filter(sv => sv && sv.uid && sv.snap && typeof sv.snap === 'object');
      } else {
        saved = [];
      }
    } catch (e) {
      saved = [];
    }

    const stage = new PizzaStage($('#stageHost'));
    stage.applySnapshot(state, 0);

    let layout = null;
    let oven = null;
    let cartModule = null;
    let savedModule = null;
    let wheel = null;

    cartModule = setupCart({
      cart,
      toast,
      getLenis: () => window.__forno_lenis
    });

    layout = setupLayout({
      getState: () => state,
      getCombo: () => combo,
      getOrderQty: () => orderQty,
      setOrderQty: (q) => { orderQty = q; },
      getStage: () => stage,
      onStartBake: () => oven?.startBake(),
      getLenis: () => window.__forno_lenis
    });

    savedModule = setupSaved({
      saved,
      getState: () => state,
      setState: (s) => { state = s; },
      getCombo: () => combo,
      setCombo: (c) => { combo = c; },
      getOrderQty: () => orderQty,
      setOrderQty: (q) => { orderQty = q; },
      getEffectiveUnit: () => effectiveUnit(state, combo),
      stage,
      goStep: (i) => layout?.goStep(i),
      setMaxReached: (m) => layout?.setMaxReached(m),
      setMobileSizeChosen: (val) => layout?.setMobileSizeChosen?.(val),
      openCart: () => cartModule?.openCart(),
      cart,
      persistCart: () => cartModule?.persistCart(),
      toast,
      getLenis: () => window.__forno_lenis
    });

    oven = setupOven({
      getState: () => state,
      getOrderQty: () => orderQty,
      getCombo: () => combo,
      getEffectiveUnit: () => effectiveUnit(state, combo),
      toast,
      goStep: (i) => layout?.goStep(i),
      resetBuilder: () => {
        state = freshState();
        combo = null;
        orderQty = 1;
        stage.applySnapshot(state, 0.4);
        layout?.goStep(0);
        layout?.openSizePicker?.();
        wheel?.clearSelection?.();
        document.querySelectorAll('.wi.on').forEach(el => el.classList.remove('on'));
        updateBadge(state);
      },
      saveCurrentPizza: () => savedModule?.saveCurrentPizza(),
      openSaved: () => savedModule?.openSaved(),
      openCart: () => cartModule?.openCart(),
      cart,
      persistCart: () => cartModule?.persistCart(),
      getLenis: () => window.__forno_lenis
    });

    wheel = setupWheel({
      state,
      getState: () => state,
      stage,
      toast,
      startBake: () => oven?.startBake(),
      baseHas: (cat, id) => baseHas(cat, id, combo),
      isMobileSizeChosen: () => !!state.size,
      triggerSizeAlert,
      updateBadge: () => updateBadge(state)
    });

    const handleAddToCart = (it, selectedSize = 'med', selectedPrice = null) => {
      const lang = getLang();
      const cleanName = getLocalizedItemName(it.name, lang) || it.name;
      if (it.simple) {
        cart.push({
          uid: Date.now(),
          kind: 'simple',
          name: cleanName,
          img: it.img,
          meta: (it.ing || []).map(x => getLocalizedIngredient(x, lang)).join(' · '),
          unit: it.price,
          qty: 1
        });
      } else {
        const chosenImg = it.img || resolvePizzaImage(it) || IMG.pOriginal;
        const sz = selectedSize || 'med';
        const szLabel = lang === 'ar'
          ? (sz === 'small' ? ' (صغير)' : sz === 'large' ? ' (كبير)' : ' (وسط)')
          : (sz === 'small' ? ' (Small)' : sz === 'large' ? ' (Large)' : ' (Medium)');
        const unitPrice = selectedPrice || (it.size_prices?.[sz] || it.price);
        const presetSnap = it.preset ? JSON.parse(JSON.stringify(it.preset)) : { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: [], extras: [] };
        presetSnap.size = sz;

        cart.push({
          uid: Date.now(),
          kind: 'pizza',
          fromMenu: true,
          name: cleanName + szLabel,
          size: sz,
          img: chosenImg,
          snap: presetSnap,
          unit: unitPrice,
          qty: 1
        });
      }
      cartModule?.persistCart();
      cartModule?.openCart();
      const toastMsg = lang === 'ar'
        ? `تمت إضافة ${cleanName} إلى السلة 🍕`
        : `${cleanName} ADDED TO CART 🍕`;
      toast(toastMsg);
    };

    window.fornoRerenderMenu = () => {
      buildTabs({ onAddToCart: handleAddToCart, toast });
      renderMenu({ onAddToCart: handleAddToCart, toast });
    };

    buildTabs({ onAddToCart: handleAddToCart, toast });
    renderMenu({ onAddToCart: handleAddToCart, toast });
    setupContactForm({ toast });

    layout.buildRail();
    layout.goStep(0);

    cartModule.renderCart();
    cartModule.popBadge();
    cartModule.restoreActiveOrderIfAny();
    savedModule.persistSaved();
    layout.setupScroll();
    layout.heroFX();
    layout.setupMobileSizeAnimation();
    layout.setupMobileLivePrice();
    setupI18n();

    dismissLoader();

    if (gsap) {
      const heroTl = gsap.timeline({ delay: 0.2 });
      if ($('#heroPizza')) {
        heroTl.fromTo('#heroPizza', { scale: 0.7, autoAlpha: 0, rotation: -20 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.2, ease: 'power3.out' });
      }
      heroTl.fromTo('.h-line span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, $('#heroPizza') ? '-=0.7' : '0')
        .fromTo('.h-sub, .h-cta', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 }, '-=0.3')
        .fromTo('.h-scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, '-=0.2');
    }

    // إرجاع واجهة التحكم والتنظيف الكامل (Lifecycle Teardown Interface)
    const appInstance = {
      destroy: () => {
        // 1. قتل جميع الـ ScrollTriggers لمنع تسريب الذاكرة
        if (window.ScrollTrigger) {
          window.ScrollTrigger.getAll().forEach(t => t.kill());
        }
        // 2. إيقاف وتدمير محرك السكرول Lenis
        if (window.__forno_lenis) {
          window.__forno_lenis.destroy();
          window.__forno_lenis = null;
        }
        if (window.__forno_lenis_ticker && window.gsap) {
          window.gsap.ticker.remove(window.__forno_lenis_ticker);
          window.__forno_lenis_ticker = null;
        }
        // 3. إيقاف حلقة الـ RAF للعجلة
        if (window.__forno_wheel_raf) {
          cancelAnimationFrame(window.__forno_wheel_raf);
          window.__forno_wheel_raf = null;
        }
        window.__forno_app_inited = false;
        currentAppInstance = null;
        appInitPromise = null;
      }
    };
    currentAppInstance = appInstance;
    return appInstance;
  };

  return appInitPromise;
}
