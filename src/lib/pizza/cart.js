// src/lib/pizza/cart.js
"use client";

import { clamp, escapeHtml } from './geometry';
import { SIZES } from './pricing';
import { DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS } from './config';
import { PizzaStage } from './stage';
import { t } from '@/lib/i18n';
import { supabaseClient, isSupabaseLive } from '@/lib/supabaseClient';

export function summarize(s) {
  const parts = [];
  const szObj = SIZES.find((x) => x.id === (s.size || 'med'));
  if (szObj) parts.push(szObj.name);
  const d = DOUGH.find((x) => x.id === s.dough);
  if (d) parts.push(d.name);
  const sc = SAUCE.find((x) => x.id === s.sauce);
  if (sc) parts.push(sc.name);
  const ch = CHEESE.find((x) => x.id === s.cheese);
  if (ch) parts.push(ch.name);
  for (const m of Object.keys(s.meats || {})) {
    const it = MEAT.find((x) => x.id === m);
    if (it) parts.push(it.name);
  }
  for (const v of s.vegs || []) {
    const it = VEG.find((x) => x.id === v);
    if (it) parts.push(it.name);
  }
  for (const e of s.extras || []) {
    const it = EXTRAS.find((x) => x.id === e);
    if (it) parts.push(it.name);
  }
  return parts.join(' · ') || '—';
}

export function setupCart({
  cart,
  toast,
  getLenis
}) {
  const $ = (s) => document.querySelector(s);
  const gsap = window.gsap;

  let selectedPayment = 'cash';
  let deliveryType = 'pickup';
  let receiptFileBlob = null;
  let activeCustomerOrder = null;
  let customerPollInterval = null;
  let customerRealtimeChannel = null;
  let appliedCoupon = null;

  function cleanupRealtime() {
    if (customerRealtimeChannel && isSupabaseLive) {
      try {
        supabaseClient.removeChannel(customerRealtimeChannel);
      } catch (e) {}
      customerRealtimeChannel = null;
    }
  }

function persistCart() {
    try {
      localStorage.setItem('forno_cart', JSON.stringify(cart));
    } catch (e) {}
    renderCart();
    popBadge();

    // إشعار معمارية React بتغير الداتا لتحديث الـ State رسمياً
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('forno_cart_update', { detail: [...cart] }));
    }
  }

  function popBadge() {
    const total = cart.reduce((a, c) => a + c.qty, 0);
    const b = $('#cartCount');
    const mb = $('#mobileCartCount');
    if (b) {
      b.textContent = total;
      if (gsap) gsap.fromTo(b, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,.4)' });
    }
    if (mb) {
      mb.textContent = total;
      if (gsap) gsap.fromTo(mb, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: 'power2.out' });
    }
  }

  function openCart() {
    document.body.classList.add('cart-open');
    if (!activeCustomerOrder) {
      $('#cartDrawer')?.classList.remove('in-checkout');
      $('#cartDrawer')?.classList.remove('in-tracker');
      if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
    }
  }

  function closeCart() {
    document.body.classList.remove('cart-open');
    if (customerPollInterval) {
      clearInterval(customerPollInterval);
      customerPollInterval = null;
    }
    cleanupRealtime();
  }

  function updateCheckoutTotals() {
    const subtotal = cart.reduce((a, c) => a + c.unit * c.qty, 0);
    let discount = 0;

    // حماية ضد الخصم الوهمي: إلغاء الكوبون فوراً لو إجمالي السلة نزل عن الحد الأدنى المطلوب
    if (appliedCoupon && appliedCoupon.valid) {
      if (appliedCoupon.minSubtotal && subtotal < appliedCoupon.minSubtotal) {
        appliedCoupon = null;
        const feedback = $('#couponFeedback');
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.color = 'var(--red)';
          feedback.textContent = `COUPON REMOVED: MINIMUM ORDER IS EGP ${appliedCoupon ? appliedCoupon.minSubtotal : ''}`;
        }
      } else if (appliedCoupon.type === 'percent') {
        discount = Math.round((subtotal * appliedCoupon.value) / 100);
      } else {
        discount = Math.min(subtotal, appliedCoupon.value);
      }
    }
    const finalTotal = Math.max(0, subtotal - discount);

    const subRow = $('#subtotalRow');
    const discRow = $('#discountRow');
    const subVal = $('#subtotalVal');
    const discVal = $('#discountVal');
    const totalVal = $('#checkoutTotalVal');

    if (discount > 0) {
      if (subRow) subRow.style.display = 'flex';
      if (discRow) discRow.style.display = 'flex';
      if (subVal) subVal.textContent = 'EGP ' + subtotal;
      if (discVal) discVal.textContent = '- EGP ' + discount;
    } else {
      if (subRow) subRow.style.display = 'none';
      if (discRow) discRow.style.display = 'none';
    }

    if (totalVal) totalVal.textContent = 'EGP ' + finalTotal;
  }

  function renderCart() {
    const host = $('#cartItems');
    if (!host) return;
    host.innerHTML = '';
    if (!cart.length) {
      host.innerHTML = '<div class="cart-empty">YOUR CART IS EMPTY.<br>GO BUILD SOMETHING BEAUTIFUL.</div>';
    }
    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'ci';
      const prev = document.createElement('div');
      if (item.img) {
        prev.className = 'ci-pz';
        const safeImg = escapeHtml(item.img);
        prev.innerHTML = '<img class="ci-img" src="' + safeImg + '" alt="' + escapeHtml(item.name || '') + '">';
      } else if (item.kind === 'pizza') {
        prev.className = 'ci-pz';
        const st = new PizzaStage(prev, { mini: true });
        st.applySnapshot(item.snap, 0);
        st.cookifyInstant();
      } else {
        const safeImg = escapeHtml(item.img || '');
        prev.innerHTML = '<img class="ci-img" src="' + safeImg + '" alt="">';
      }
      row.appendChild(prev);
      const body = document.createElement('div');
      body.className = 'ci-body';
      const meta = item.kind === 'pizza' ? summarize(item.snap) : item.meta;
      const safeName = escapeHtml(item.name);
      const safeMeta = escapeHtml(meta);
      body.innerHTML =
        '<div class="ci-name">' +
        safeName +
        '</div><div class="ci-meta">' +
        safeMeta +
        '</div>' +
        '<div class="ci-foot"><div class="stepper"><button class="qm" aria-label="Decrease quantity">−</button><span>' +
        item.qty +
        '</span><button class="qp" aria-label="Increase quantity">+</button></div><span class="ci-price">EGP ' +
        item.unit * item.qty +
        '</span></div>';
      row.appendChild(body);
      const rm = document.createElement('button');
      rm.className = 'ci-rm';
      rm.setAttribute('aria-label', 'Remove item');
      rm.textContent = '✕';
      rm.addEventListener('click', () => {
        const idx = cart.findIndex((c) => c.uid === item.uid);
        if (idx > -1) {
          cart.splice(idx, 1);
          renderCart();
          popBadge();
        }
      });
      row.appendChild(rm);
      body.querySelector('.qm')?.addEventListener('click', () => {
        item.qty = clamp(item.qty - 1, 1, 9);
        persistCart(); // حفظ الكمية الجديدة فوراً في الذاكرة لمنع ضياعها
      });
      body.querySelector('.qp')?.addEventListener('click', () => {
        item.qty = clamp(item.qty + 1, 1, 9);
        persistCart(); // حفظ الكمية الجديدة فوراً في الذاكرة لمنع ضياعها
      });
      host.appendChild(row);
    });
    const totalEl = $('#cartTotal');
    if (totalEl) totalEl.textContent = 'EGP ' + cart.reduce((a, c) => a + c.unit * c.qty, 0);
  }

  function updatePlaceOrderButtonText() {
    const btn = $('#placeOrderBtn');
    if (!btn) return;
    if (selectedPayment === 'visa') {
      btn.textContent = t('placeOrderVisa');
    } else {
      btn.textContent = deliveryType === 'delivery' ? t('placeOrderCashDelivery') : t('placeOrderCashPickup');
    }
  }

  function setPaymentMode(mode) {
    selectedPayment = mode;
    if (mode === 'cash') {
      $('#payCashBtn')?.classList.add('active');
      $('#payVisaBtn')?.classList.remove('active');
      if ($('#visaBox')) $('#visaBox').style.display = 'none';
    } else {
      $('#payVisaBtn')?.classList.add('active');
      $('#payCashBtn')?.classList.remove('active');
      if ($('#visaBox')) $('#visaBox').style.display = 'block';
    }
    updatePlaceOrderButtonText();
  }

  function setDeliveryMode(type) {
    deliveryType = type;
    if (type === 'delivery') {
      $('#typeDeliveryBtn')?.classList.add('active');
      $('#typePickupBtn')?.classList.remove('active');
      if ($('#ckAddressWrap')) $('#ckAddressWrap').style.display = 'block';
    } else {
      $('#typePickupBtn')?.classList.add('active');
      $('#typeDeliveryBtn')?.classList.remove('active');
      if ($('#ckAddressWrap')) $('#ckAddressWrap').style.display = 'none';
    }
    updatePlaceOrderButtonText();
  }

  function updateTrackerUI(ord) {
    const badge = $('#trackStatusBadge');
    const desc = $('#trackDesc');
    if (!badge || !desc) return;

    if (ord.payment_status === 'rejected') {
      badge.textContent = 'PAYMENT REJECTED';
      badge.style.background = 'rgba(194,43,26,0.2)';
      badge.style.color = '#ff8b7a';
      badge.style.borderColor = 'var(--red)';
      desc.textContent = 'Your payment receipt was rejected by the cashier. Please contact us.';
      if (customerPollInterval) clearInterval(customerPollInterval);
      try {
        localStorage.removeItem('forno_active_order');
      } catch (e) {}
      return;
    }
    if (ord.payment_status === 'pending') {
      badge.textContent = 'PAYMENT PENDING';
      badge.style.background = 'rgba(255,122,46,0.15)';
      badge.style.color = 'var(--ember2)';
      badge.style.borderColor = 'var(--ember)';
      desc.textContent = 'Waiting for cashier verification. Do not close this page.';
      return;
    }

    if (ord.order_status === 'preparing') {
      badge.textContent = 'PAID — PREPARING';
      badge.style.background = 'rgba(232,176,75,0.2)';
      badge.style.color = 'var(--gold)';
      badge.style.borderColor = 'var(--gold)';
      desc.textContent = 'Payment verified! Your pizza is in the oven right now.';
    } else if (ord.order_status === 'ready') {
      badge.textContent = 'READY';
      badge.style.background = 'rgba(87,168,79,0.2)';
      badge.style.color = '#7cc46a';
      badge.style.borderColor = '#57a84f';
      desc.textContent = 'Your order is ready for pickup or out for delivery!';
    } else if (ord.order_status === 'completed') {
      badge.textContent = 'COMPLETED';
      badge.style.background = 'rgba(255,255,255,0.1)';
      badge.style.color = 'var(--ink)';
      badge.style.borderColor = 'var(--line)';
      desc.textContent = 'Order fulfilled. Thank you for choosing FORNO!';
      if (customerPollInterval) {
        clearInterval(customerPollInterval);
        customerPollInterval = null;
      }
      try {
        localStorage.removeItem('forno_active_order');
      } catch (e) {}
    }
  }

  function showCustomerTracking(order) {
    $('#cartDrawer')?.classList.remove('in-checkout');
    $('#cartDrawer')?.classList.add('in-tracker');
    if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
    if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'flex';
    if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('orderTracking');
    const orderNoEl = $('#trackOrderNo') || $('#trackOrderNum');
    if (orderNoEl) orderNoEl.textContent = 'ORDER #' + order.order_number;

    // Display WhatsApp Quick Confirmation Button
    const waBtn = $('#whatsappConfirmBtn');
    if (waBtn) {
      const waUrl = order.whatsapp_url || `https://wa.me/201001234567?text=${encodeURIComponent('مرحباً FORNO 🍕 أريد تأكيد استلام طلبي رقم #' + order.order_number)}`;
      waBtn.href = waUrl;
      waBtn.style.display = 'flex';
    }

    updateTrackerUI(order);

    // 1. Instant Realtime Subscription with Supabase
    cleanupRealtime();
    if (isSupabaseLive) {
      try {
        customerRealtimeChannel = supabaseClient
          .channel(`order-track-${order.order_number}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `order_number=eq.${order.order_number}`,
            },
            (payload) => {
              if (payload && payload.new) {
                updateTrackerUI(payload.new);
                if (payload.new.order_status === 'completed' || payload.new.payment_status === 'rejected') {
                  if (customerPollInterval) clearInterval(customerPollInterval);
                  customerPollInterval = null;
                  cleanupRealtime();
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime fallback to polling:', err);
      }
    }

    // 2. Resilient Polling Safety-Net
    if (customerPollInterval) clearInterval(customerPollInterval);
    customerPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?id=${order.order_number}`);
        if (!res.ok) {
          clearInterval(customerPollInterval);
          customerPollInterval = null;
          cleanupRealtime();
          try {
            localStorage.removeItem('forno_active_order');
          } catch (e) {}
          return;
        }
        const fresh = await res.json();
        updateTrackerUI(fresh);
        if (fresh.order_status === 'completed' || fresh.payment_status === 'rejected') {
          clearInterval(customerPollInterval);
          customerPollInterval = null;
          cleanupRealtime();
          try {
            localStorage.removeItem('forno_active_order');
          } catch (e) {}
        }
      } catch (e) {
        clearInterval(customerPollInterval);
        customerPollInterval = null;
        cleanupRealtime();
      }
    }, 5000);
  }

  // Bind Events
  $('#mobileHeaderCart')?.addEventListener('click', openCart);
  $('#mobileFloatingCart')?.addEventListener('click', openCart);
  $('#cartBtn')?.addEventListener('click', openCart);
  $('#cartClose')?.addEventListener('click', closeCart);
  $('#cartOverlay')?.addEventListener('click', closeCart);
  $('#continueBtn')?.addEventListener('click', () => {
    closeCart();
    const lenis = getLenis ? getLenis() : null;
    if (lenis) lenis.scrollTo('#builder', { offset: -40 });
  });
  $('#doneClose')?.addEventListener('click', closeCart);

  document.querySelectorAll('.copy-badge').forEach((el) => {
    el.addEventListener('click', () => {
      const val = el.getAttribute('data-copy');
      if (!val) return;
      const iconSpan = el.querySelector('.cb-icon');
      const originalText = iconSpan ? iconSpan.textContent : '';

      const onCopied = () => {
        toast(`COPIED: ${val} 📋`);
        if (iconSpan) {
          iconSpan.textContent = t('copied');
          iconSpan.style.color = 'var(--gold)';
          setTimeout(() => {
            iconSpan.textContent = originalText;
            iconSpan.style.color = '';
          }, 2000);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(val)
          .then(onCopied)
          .catch(() => fallbackCopy(val));
      } else {
        fallbackCopy(val);
      }

      function fallbackCopy(text) {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          onCopied();
        } catch (e) {
          toast(`TEXT: ${text}`);
        }
      }
    });
  });

  $('#checkoutBtn')?.addEventListener('click', () => {
    if (!cart.length) {
      toast('CART IS EMPTY');
      return;
    }
    $('#cartDrawer')?.classList.add('in-checkout');
    $('#cartDrawer')?.classList.remove('in-tracker');
    if ($('#cartViewStep')) $('#cartViewStep').style.display = 'none';
    if ($('#checkoutStep')) $('#checkoutStep').style.display = 'flex';
    if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartCheckout');
    updateCheckoutTotals();
    setPaymentMode('cash');
  });

  $('#btnApplyCoupon')?.addEventListener('click', async () => {
    const code = $('#ckCoupon')?.value.trim().toUpperCase();
    const feedback = $('#couponFeedback');
    if (!code) {
      toast('PLEASE ENTER A PROMO CODE');
      return;
    }
    const subtotal = cart.reduce((a, c) => a + c.unit * c.qty, 0);
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        appliedCoupon = data;
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.color = '#57a84f';
          feedback.textContent = `${data.code} APPLIED (-EGP ${data.discount})`;
        }
        updateCheckoutTotals();
        toast(`PROMO CODE ${data.code} APPLIED! 🎉`);
      } else {
        appliedCoupon = null;
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.color = 'var(--red)';
          feedback.textContent = data.error?.en || data.error?.ar || data.error || 'INVALID COUPON';
        }
        updateCheckoutTotals();
      }
    } catch {
      toast('FAILED TO VALIDATE COUPON');
    }
  });

  $('#payCashBtn')?.addEventListener('click', () => setPaymentMode('cash'));
  $('#payVisaBtn')?.addEventListener('click', () => setPaymentMode('visa'));
  $('#typeDeliveryBtn')?.addEventListener('click', () => setDeliveryMode('delivery'));
  $('#typePickupBtn')?.addEventListener('click', () => setDeliveryMode('pickup'));

  $('#backToCartBtn')?.addEventListener('click', () => {
    $('#cartDrawer')?.classList.remove('in-checkout');
    $('#cartDrawer')?.classList.remove('in-tracker');
    if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
    if ($('#cartViewStep')) {
      $('#cartViewStep').style.display = 'flex';
      $('#cartViewStep').style.flexDirection = 'column';
    }
    if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
  });

  $('#btnSelectReceipt')?.addEventListener('click', () => $('#receiptInput')?.click());
  $('#receiptInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      receiptFileBlob = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const previewImg = $('#receiptPreviewImg');
        if (previewImg) previewImg.src = ev.target.result;
        if ($('#receiptPreviewWrap')) $('#receiptPreviewWrap').style.display = 'block';
        if ($('#btnSelectReceipt')) $('#btnSelectReceipt').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  $('#btnRemoveReceipt')?.addEventListener('click', () => {
    receiptFileBlob = null;
    const input = $('#receiptInput');
    if (input) input.value = '';
    if ($('#receiptPreviewWrap')) $('#receiptPreviewWrap').style.display = 'none';
    if ($('#btnSelectReceipt')) $('#btnSelectReceipt').style.display = 'block';
  });

  $('#placeOrderBtn')?.addEventListener('click', async () => {
    const name = $('#ckName')?.value.trim();
    const phone = $('#ckPhone')?.value.trim();
    const address = $('#ckAddress')?.value.trim();

    if (!name || !phone) {
      toast('PLEASE ENTER NAME & PHONE NUMBER');
      return;
    }

    if (deliveryType === 'delivery' && !address) {
      toast(t('deliveryAddress') + ' *');
      $('#ckAddress')?.focus();
      return;
    }

    if (selectedPayment === 'visa' && !receiptFileBlob) {
      toast(t('uploadReceipt') + ' *');
      return;
    }

    const finalAddress =
      deliveryType === 'pickup'
        ? 'IN STORE / PICKUP (استلام من داخل المحل)'
        : address;

    const btn = $('#placeOrderBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'SENDING ORDER...';
    }

    try {
      const orderItems = JSON.parse(JSON.stringify(cart));
      const totalAmount = cart.reduce((a, c) => a + c.unit * c.qty, 0);

      const fd = new FormData();
      fd.append('customer_name', name);
      fd.append('customer_phone', phone);
      fd.append('customer_address', finalAddress);
      fd.append('payment_method', selectedPayment);
      fd.append('total', totalAmount);
      fd.append('items', JSON.stringify(orderItems));
      if (receiptFileBlob) fd.append('receipt', receiptFileBlob);
      if (appliedCoupon && appliedCoupon.valid) {
        fd.append('coupon_code', appliedCoupon.code);
      }

      const res = await fetch('/api/orders', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.success) {
        cart.length = 0;
        appliedCoupon = null;
        const couponFeedback = $('#couponFeedback');
        if (couponFeedback) couponFeedback.style.display = 'none';
        persistCart();
        const orderToTrack = {
          ...data.order,
          whatsapp_url: data.whatsapp_url,
        };
        activeCustomerOrder = orderToTrack;
        try {
          localStorage.setItem('forno_active_order', JSON.stringify(orderToTrack));
        } catch (e) {}
        showCustomerTracking(orderToTrack);
      } else {
        toast(data.error || 'FAILED TO PLACE ORDER');
      }
    } catch (err) {
      toast('NETWORK ERROR, PLEASE TRY AGAIN');
    } finally {
      if (btn) {
        btn.disabled = false;
        updatePlaceOrderButtonText();
      }
    }
  });

  $('#trackDoneBtn')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('forno_active_order');
    } catch (e) {}
    if (customerPollInterval) clearInterval(customerPollInterval);
    if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'none';
    if ($('#cartViewStep')) {
      $('#cartViewStep').style.display = 'flex';
      $('#cartViewStep').style.flexDirection = 'column';
    }
    if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = 'YOUR CART';
    closeCart();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.body.classList.contains('cart-open')) {
        closeCart();
      }
    }
  });

  async function restoreActiveOrderIfAny() {
    try {
      const raw = localStorage.getItem('forno_active_order');
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (!cached || !cached.order_number) return;

      const res = await fetch(`/api/orders?id=${cached.order_number}`);
      if (!res.ok) {
        localStorage.removeItem('forno_active_order');
        return;
      }
      const fresh = await res.json();
      if (fresh.order_status !== 'completed' && fresh.payment_status !== 'rejected') {
        openCart();
        showCustomerTracking(fresh);
      } else {
        localStorage.removeItem('forno_active_order');
      }
    } catch (e) {
      // Ignore network errors on boot
    }
  }

  return {
    persistCart,
    renderCart,
    popBadge,
    openCart,
    closeCart,
    showCustomerTracking,
    restoreActiveOrderIfAny
  };
}
