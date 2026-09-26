// src/lib/pizza/oven.js
"use client";

import { DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS, IMG, F_DOUGH_C, F_SAUCE_C, F_TOP_C, F_VEG_C } from './config';
import { PizzaStage } from './stage';

export function setupOven({
  getState,
  getOrderQty,
  getCombo,
  getEffectiveUnit,
  toast,
  goStep,
  resetBuilder,
  saveCurrentPizza,
  openSaved,
  openCart,
  cart,
  persistCart,
  getLenis
}) {
  const $ = (s) => document.querySelector(s);
  const gsap = window.gsap;
  let ovenTL = null;
  let ovenStage = null;
  let boxToggleReady = false;

  function setStatus(t) {
    const el = $('#ovenStatus');
    if (!el || !gsap) return;
    el.textContent = t;
    gsap.fromTo(el, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 });
  }

  function buildChips() {
    const state = getState();
    const parts = [];
    const d = DOUGH.find((x) => x.id === state.dough);
    if (d) parts.push(d.name);
    const sc = SAUCE.find((x) => x.id === state.sauce);
    if (sc) parts.push(sc.name);
    const ch = CHEESE.find((x) => x.id === state.cheese);
    if (ch) parts.push(ch.name);
    for (const m of Object.keys(state.meats || {})) {
      const it = MEAT.find((x) => x.id === m);
      if (it) parts.push(it.name);
    }
    for (const v of state.vegs || []) {
      const it = VEG.find((x) => x.id === v);
      if (it) parts.push(it.name);
    }
    for (const e of state.extras || []) {
      const it = EXTRAS.find((x) => x.id === e);
      if (it) parts.push(it.name);
    }
    const chipsEl = $('#ovenChips');
    if (chipsEl) {
      chipsEl.innerHTML = parts.map((p) => '<span>' + p + '</span>').join('');
    }
  }

  function startBake() {
    const state = getState();
    const lenis = getLenis ? getLenis() : null;
    try {
      if (!state.dough || !state.sauce || !state.cheese) {
        toast('PLEASE SELECT DOUGH, SAUCE, AND CHEESE FIRST');
        goStep(0);
        return;
      }
      document.body.classList.remove('drawer-open');
      const scene = $('#ovenScene');
      const slot = $('#ovenSlot');
      if (!scene || !slot || !gsap) return;

      slot.innerHTML = '';
      const boxHost = $('#boxPizzaHost');
      if (boxHost) boxHost.innerHTML = '';

      const plate = document.createElement('div');
      plate.className = 'oven-plate';
      slot.appendChild(plate);

      gsap.killTweensOf('#boxPizzaHost');
      gsap.set('.oven', { autoAlpha: 1 });
      gsap.set('.oven-mouth', { overflow: 'hidden' });
      gsap.set('#boxScene', { autoAlpha: 0, scale: 1, y: 0 });
      gsap.set('#boxPizzaHost', { scale: 1, y: 0, rotation: 0 });
      $('#boxScene')?.classList.remove('closed');
      boxToggleReady = false;
      $('#boxScene')?.classList.remove('tapable');

      ovenStage = new PizzaStage(slot, { mini: true });
      ovenStage.applySnapshot(state, 0);

      $('#revealBox')?.classList.remove('show');
      const tm = $('#ovenTimer');
      if (tm) {
        tm.textContent = '00:06';
        tm.style.display = '';
        tm.classList.remove('ready-msg');
      }
      scene.classList.add('on');
      document.body.classList.add('locked');
      if (lenis) lenis.stop();

      gsap.set(slot, { xPercent: -50, yPercent: -50, scale: 1, y: 0, rotation: 0, opacity: 1 });
      gsap.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      gsap.to('.oven-glow', { opacity: 0.8, duration: 1, yoyo: true, repeat: 6, ease: 'sine.inOut' });

      const tl = (ovenTL = gsap.timeline());
      tl.fromTo(slot, { scale: 1.1, y: -30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
        .call(() => setStatus('SLIDING IN'))
        .to(slot, { scale: 0.62, y: 30, duration: 1, ease: 'power2.inOut' }, '+=0.1')
        .to('.oven-door', { y: '0%', duration: 0.7, ease: 'power3.inOut' }, '>-0.2')
        .call(() => setStatus('BAKING'))
        .add('cook', '+=0.1');

      const t = { v: 6 };
      tl.to(
        t,
        {
          v: 0,
          duration: 4.5,
          ease: 'none',
          onUpdate: () => {
            const tmEl = $('#ovenTimer');
            if (tmEl) tmEl.textContent = '00:0' + Math.max(0, Math.ceil(t.v));
          }
        },
        'cook'
      );

      tl.to(ovenStage.doughImgs, { filter: F_DOUGH_C, duration: 1.6, ease: 'sine.inOut' }, 'cook+=0.3')
        .to(ovenStage.mask, { filter: F_SAUCE_C, duration: 1.6, ease: 'sine.inOut' }, 'cook+=0.3')
        .call(() => setStatus('MELTING'), null, 'cook+=0.8')
        .call(() => ovenStage.el.classList.add('cooked'), null, 'cook+=0.4')
        .fromTo(ovenStage.cookedWrap, { opacity: 0 }, { opacity: 0.95, duration: 1.5, ease: 'sine.inOut' }, 'cook+=1.2')
        .to(ovenStage.ring, { opacity: 0.65, duration: 1 }, 'cook+=1.5')
        .call(() => setStatus('BROWNING'), null, 'cook+=2')
        .to(
          ovenStage.topsL.querySelectorAll('svg'),
          { filter: (ix, el) => (el.dataset.kind === 'veg' ? F_VEG_C : F_TOP_C), duration: 1.2, ease: 'sine.inOut' },
          'cook+=2'
        )
        .call(
          () => {
            setStatus('READY.');
            const tmEl = $('#ovenTimer');
            if (tmEl) {
              if (window.innerWidth <= 980) {
                tmEl.textContent = 'YOUR PIZZA IS READY.';
                tmEl.classList.add('ready-msg');
              } else {
                tmEl.style.display = 'none';
              }
            }
          },
          null,
          'cook+=4.5'
        )
        .to('.oven-door', { y: '-112%', duration: 0.8, ease: 'power3.inOut' }, 'cook+=4.6')
        .call(() => gsap.set('.oven-mouth', { overflow: 'visible' }), null, 'cook+=4.6')
        .to(slot, { scale: 1.3, y: 90, duration: 1, ease: 'power2.out' }, 'cook+=5')
        .call(() => setStatus('BOXING'), null, 'cook+=5.8')
        .call(() => {
          $('#boxPizzaHost')?.appendChild(ovenStage.el);
        }, null, 'cook+=6')
        .to('.oven', { autoAlpha: 0, duration: 0.5 }, 'cook+=6')
        .fromTo('#boxScene', { autoAlpha: 0, scale: 0.8, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.1)' }, 'cook+=6.1')
        .call(() => $('#boxScene')?.classList.add('closed'), null, 'cook+=7')
        .call(() => {
          boxToggleReady = true;
          $('#boxScene')?.classList.add('tapable');
        }, null, 'cook+=7.5')
        .call(() => setStatus('BOXED.'), null, 'cook+=7.3')
        .call(
          () => {
            buildChips();
            const ovenPrice = $('#ovenPrice');
            const unit = getEffectiveUnit ? getEffectiveUnit() : 0;
            const qty = getOrderQty ? getOrderQty() : 1;
            const total = Math.max(145, unit * qty);
            if (ovenPrice) ovenPrice.textContent = 'EGP ' + total;
            $('#revealBox')?.classList.add('show');
            gsap.fromTo('#revealBox > *', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
          },
          null,
          'cook+=7.5'
        );
    } catch (e) {
      console.error(e);
    }
  }

  function closeOven(cb) {
    const lenis = getLenis ? getLenis() : null;
    if (lenis) lenis.start();
    $('#boxScene')?.classList.remove('closed');
    if (ovenTL) ovenTL.kill();
    if (gsap) {
      // إيقاف كامل لجميع أنيميشن النار، التوهج، وصينية الخبز والبوكس لمنع استهلاك المعالج
      gsap.killTweensOf(['.oven-glow', '#ovenSlot', '#boxPizzaHost', '.bx-lid', '.bx', '#revealBox', '#ovenScene']);
      gsap.to('#ovenScene', {
        autoAlpha: 0,
        duration: 0.6,
        onComplete: () => {
          $('#ovenScene')?.classList.remove('on');
          document.body.classList.remove('locked');
          const slot = $('#ovenSlot');
          if (slot) slot.innerHTML = '';
          const boxHost = $('#boxPizzaHost');
          if (boxHost) boxHost.innerHTML = '';
          gsap.set('.oven', { autoAlpha: 1 });
          gsap.set('#boxScene', { autoAlpha: 0 });
          gsap.set('#ovenScene', { x: 0 });
          ovenStage = null;
          if (cb) cb();
        }
      });
    } else {
      $('#ovenScene')?.classList.remove('on');
      document.body.classList.remove('locked');
      if (cb) cb();
    }
  }

  $('#ovenCloseBtn')?.addEventListener('click', () => closeOven());

  // تنظيف مستمع الـ ESC السابق قبل تسجيل الجديد لمنع التكرار
  if (window.__forno_oven_keydown) {
    window.removeEventListener('keydown', window.__forno_oven_keydown);
  }
  window.__forno_oven_keydown = (e) => {
    if (e.key === 'Escape' && $('#ovenScene')?.classList.contains('on')) {
      closeOven();
    }
  };
  window.addEventListener('keydown', window.__forno_oven_keydown);

  $('#boxScene')?.addEventListener('click', () => {
    if (!boxToggleReady) return;
    $('#boxScene')?.classList.toggle('closed');
  });

  $('#btnSave')?.addEventListener('click', () => {
    saveCurrentPizza();
    toast('SAVED TO YOUR PIZZAS 🍕');
    closeOven(() => {
      resetBuilder();
      openSaved();
    });
  });

  $('#btnAnother')?.addEventListener('click', () =>
    closeOven(() => {
      resetBuilder();
      const lenis = getLenis ? getLenis() : null;
      if (lenis) lenis.scrollTo('#builder', { offset: -40 });
    })
  );

  $('#btnCartAdd')?.addEventListener('click', () => {
    const state = getState();
    const combo = getCombo();
    let pizzaImg = IMG.pOriginal;
    if (state.sauce === 'bbq') pizzaImg = IMG.pBBQ;
    else if (state.sauce === 'garlic') pizzaImg = IMG.pTruffle;
    else if (state.vegs?.length > 2) pizzaImg = IMG.pGreen;
    else if (state.meats?.pepperoni) pizzaImg = IMG.fire;

    cart.push({
      uid: Date.now(),
      kind: 'pizza',
      name: combo ? combo.name : 'CUSTOM WOOD-FIRED PIZZA',
      img: pizzaImg,
      snap: JSON.parse(JSON.stringify(state)),
      unit: getEffectiveUnit(),
      qty: getOrderQty()
    });
    persistCart();

    closeOven(() => {
      openCart();
    });
    toast('ADDED TO CART 🍕');
  });

  return {
    startBake,
    closeOven,
    buildChips
  };
}
