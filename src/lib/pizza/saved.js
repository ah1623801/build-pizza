// src/lib/pizza/saved.js
"use client";

import { PizzaStage } from './stage';
import { summarize } from './cart';
import { escapeHtml } from './geometry';

export function setupSaved({
  saved,
  getState,
  setState,
  getCombo,
  setCombo,
  getOrderQty,
  setOrderQty,
  getEffectiveUnit,
  stage,
  goStep,
  setMaxReached,
  setMobileSizeChosen,
  openCart,
  cart,
  persistCart,
  toast,
  getLenis
}) {
  const $ = (s) => document.querySelector(s);

  function persistSaved() {
    try {
      localStorage.setItem('forno_saved', JSON.stringify(saved));
    } catch (e) {}
    const sc = $('#savedCount');
    if (sc) sc.textContent = saved.length;
    const msc = $('#mmSavedCount');
    if (msc) msc.textContent = saved.length;
    renderSaved();
  }

  function openSaved() {
    renderSaved();
    document.body.classList.add('saved-open');
  }

  function closeSaved() {
    document.body.classList.remove('saved-open');
  }

  function saveCurrentPizza() {
    const state = getState();
    const combo = getCombo();
    saved.push({
      uid: Date.now(),
      name: 'MY PIZZA #' + (saved.length + 1),
      snap: JSON.parse(JSON.stringify(state)),
      combo: combo ? JSON.parse(JSON.stringify(combo)) : null,
      unit: getEffectiveUnit(),
      qty: getOrderQty()
    });
    persistSaved();
  }

  function renderSaved() {
    const host = $('#savedItems');
    if (!host) return;
    host.innerHTML = '';
    if (!saved.length) {
      host.innerHTML = '<div class="cart-empty">NO SAVED PIZZAS YET.<br>BAKE ONE AND HIT SAVE.</div>';
      return;
    }
    saved.forEach((sv) => {
      const row = document.createElement('div');
      row.className = 'sv';
      const prev = document.createElement('div');
      prev.className = 'sv-pz';
      const st = new PizzaStage(prev, { mini: true });
      st.applySnapshot(sv.snap, 0);
      st.cookifyInstant();
      row.appendChild(prev);
      const body = document.createElement('div');
      const safeName = escapeHtml(sv.name);
      const safeMeta = escapeHtml(summarize(sv.snap));
      body.innerHTML =
        '<div class="sv-name">' +
        safeName +
        ' <em>✎</em></div><div class="sv-meta">' +
        safeMeta +
        ' × ' +
        Number(sv.qty || 1) +
        '</div>' +
        '<div class="sv-foot"><span class="sv-price">EGP ' +
        (Number(sv.unit || 0) * Number(sv.qty || 1)) +
        '</span>' +
        '<span class="sv-acts"><button class="sv-order">ORDER</button><button class="sv-edit">EDIT</button><button class="sv-rm" aria-label="Delete">✕</button></span></div>';
      row.appendChild(body);
      host.appendChild(row);

      body.querySelector('.sv-name')?.addEventListener('click', () => {
        const n = prompt('PIZZA NAME:', sv.name);
        if (n && n.trim()) {
          sv.name = n.trim().toUpperCase();
          persistSaved();
        }
      });

      body.querySelector('.sv-order')?.addEventListener('click', () => {
        cart.push({
          uid: Date.now(),
          kind: 'pizza',
          name: sv.name,
          snap: JSON.parse(JSON.stringify(sv.snap)),
          unit: sv.unit,
          qty: sv.qty
        });
        persistCart();
        closeSaved();
        openCart();
        toast(sv.name + ' ADDED TO CART');
      });

      body.querySelector('.sv-edit')?.addEventListener('click', () => {
        const newState = JSON.parse(JSON.stringify(sv.snap));
        setState(newState);
        setCombo(sv.combo ? JSON.parse(JSON.stringify(sv.combo)) : null);
        setOrderQty(sv.qty || 1);
        setMobileSizeChosen(true);
        $('#builder')?.classList.remove('picking-size');
        const currentStage = typeof stage === 'function' ? stage() : stage;
        currentStage?.applySnapshot(newState, 1);
        setMaxReached(6);
        goStep(6);
        closeSaved();
        const lenis = getLenis ? getLenis() : null;
        if (lenis) lenis.scrollTo('#builder', { offset: -40 });
        toast('LOADED — EDIT & BAKE');
      });

      body.querySelector('.sv-rm')?.addEventListener('click', () => {
        const idx = saved.findIndex((s) => s.uid === sv.uid);
        if (idx > -1) {
          saved.splice(idx, 1);
          persistSaved();
        }
      });
    });
  }

  $('#savedBtn')?.addEventListener('click', openSaved);
  $('#mmSaved')?.addEventListener('click', () => {
    document.body.classList.remove('mm-open');
    openSaved();
  });
  $('#savedClose')?.addEventListener('click', closeSaved);
  $('#savedOverlay')?.addEventListener('click', closeSaved);
  $('#savedBuild')?.addEventListener('click', () => {
    closeSaved();
    const lenis = getLenis ? getLenis() : null;
    if (lenis) lenis.scrollTo('#builder', { offset: -40 });
  });

  return {
    persistSaved,
    openSaved,
    closeSaved,
    saveCurrentPizza,
    renderSaved
  };
}
