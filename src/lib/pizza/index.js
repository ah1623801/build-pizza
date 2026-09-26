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

let appInitPromise = null;
let currentAppInstance = null;

export async function initApp() {
  if (typeof window === 'undefined') return null;
  if (currentAppInstance) return currentAppInstance;
  if (appInitPromise) return appInitPromise;

  window.__forno_app_inited = true;

  console.log('🍕 [FORNO 1/4] Starting modular initApp...');

  const { gsap, ScrollTrigger } = initAnimations();

  const $ = (s) => document.querySelector(s);

  console.log('🍕 [FORNO 3/4] Animation engine ready! Booting components...');

  const loadBar = $('#loadBar');
  const loadPct = $('#loadPct');

  const progress = { v: 0 };
  let loadAnim = null;
  if (gsap) {
    loadAnim = gsap.to(progress, {
      v: 90,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        if (loadBar) loadBar.style.width = Math.round(progress.v) + '%';
        if (loadPct) loadPct.textContent = Math.round(progress.v) + '%';
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

  if (loadAnim) loadAnim.kill();

  const finishBoot = () => {
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
      setMobileSizeChosen: () => {},
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

    const handleAddToCart = (it) => {
      if (it.simple) {
        cart.push({
          uid: Date.now(),
          kind: 'simple',
          name: it.name,
          img: it.img,
          meta: (it.ing || []).join(' · '),
          unit: it.price,
          qty: 1
        });
      } else {
        const chosenImg = it.img || resolvePizzaImage(it) || IMG.pOriginal;
        cart.push({
          uid: Date.now(),
          kind: 'pizza',
          fromMenu: true,
          name: it.name,
          img: chosenImg,
          snap: it.preset ? JSON.parse(JSON.stringify(it.preset)) : { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: [], extras: [] },
          unit: it.price,
          qty: 1
        });
      }
      cartModule?.persistCart();
      cartModule?.openCart();
      toast(it.name + ' ADDED TO CART 🍕');
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

    if (gsap) {
      gsap.to('#loader', {
        autoAlpha: 0,
        scale: 1.05,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          const l = $('#loader');
          if (l) l.remove();
          document.body.classList.add('loaded');
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }
      });

      const heroTl = gsap.timeline({ delay: 0.2 });
      if ($('#heroPizza')) {
        heroTl.fromTo('#heroPizza', { scale: 0.7, autoAlpha: 0, rotation: -20 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.2, ease: 'power3.out' });
      }
      heroTl.fromTo('.h-line span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, $('#heroPizza') ? '-=0.7' : '0')
        .fromTo('.h-sub, .h-cta', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 }, '-=0.3')
        .fromTo('.h-scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, '-=0.2');
    } else {
      const l = $('#loader');
      if (l) l.remove();
      document.body.classList.add('loaded');
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

  // غلق المعمارية بنظام Promise يضمن إرجاع كائن الـ Lifecycle Teardown بدقة
  appInitPromise = new Promise((resolve) => {
    const handleComplete = () => {
      const instance = finishBoot();
      resolve(instance);
    };

    if (gsap) {
      gsap.to(progress, {
        v: 100,
        duration: 0.3,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (loadBar) loadBar.style.width = Math.round(progress.v) + '%';
          if (loadPct) loadPct.textContent = Math.round(progress.v) + '%';
        },
        onComplete: handleComplete
      });
    } else {
      handleComplete();
    }
  });

  return appInitPromise;
}
