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
  let isSubmittingOrder = false;
  let isCompletingAnimation = false;
  let completionTimer = null;

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
      try {
        const raw = localStorage.getItem('forno_active_order');
        if (raw) activeCustomerOrder = JSON.parse(raw);
      } catch (e) {}
    }

    if (activeCustomerOrder) {
      showCustomerTracking(activeCustomerOrder);
    } else {
      $('#cartDrawer')?.classList.remove('in-checkout');
      $('#cartDrawer')?.classList.remove('in-tracker');
      if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'none';
      if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
      if ($('#cartViewStep')) {
        $('#cartViewStep').style.display = 'flex';
        $('#cartViewStep').style.flexDirection = 'column';
      }
      if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
    }
  }

  function closeCart() {
    document.body.classList.remove('cart-open');
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
        const safeImg = escapeHtml(item.img || '/ico.webp');
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
    const doneBtn = $('#trackDoneBtn');
    const lineFill = $('#stepperLineFill');
    const node1 = $('#stepNode1');
    const node2 = $('#stepNode2');
    const node3 = $('#stepNode3');
    const trackerActiveContent = $('#trackerActiveContent');
    const trackerCompletedScreen = $('#trackerCompletedScreen');

    function setStepProgress(step1State, step2State, step3State, lineWidth) {
      if (node1) node1.className = `step-node ${step1State}`.trim();
      if (node2) node2.className = `step-node ${step2State}`.trim();
      if (node3) node3.className = `step-node ${step3State}`.trim();
      if (lineFill) lineFill.style.width = lineWidth;
    }

    if (activeCustomerOrder) {
      activeCustomerOrder = { ...activeCustomerOrder, ...ord };
      try {
        localStorage.setItem('forno_active_order', JSON.stringify(activeCustomerOrder));
      } catch (e) {}
    }

    if (ord.payment_status === 'rejected') {
      setStepProgress('active', '', '', '0%');
      if (badge) {
        badge.textContent = 'REJECTED';
        badge.style.background = 'rgba(194,43,26,0.2)';
        badge.style.color = '#ff8b7a';
        badge.style.borderColor = 'var(--red)';
      }
      if (desc) desc.textContent = 'Your payment receipt was rejected by the cashier. Please contact us.';
      if (doneBtn) {
        doneBtn.style.display = 'flex';
        doneBtn.textContent = 'START A NEW ORDER 🍕';
      }
      return;
    }

    // 1. COMPLETED: when cashier marks order completed
    if (ord.order_status === 'completed') {
      setStepProgress('completed', 'completed', 'completed', '100%');
      if (badge) {
        badge.textContent = 'COMPLETED';
        badge.style.background = 'rgba(87,168,79,0.25)';
        badge.style.color = '#7cc46a';
        badge.style.borderColor = '#57a84f';
      }
      if (desc) desc.textContent = 'Order completed & delivered! Thank you for choosing FORNO ❤️';

      if (!isCompletingAnimation) {
        isCompletingAnimation = true;

        // Allow 600ms for user to watch the progress line reach 100%
        setTimeout(() => {
          if (trackerActiveContent) {
            trackerActiveContent.style.opacity = '0';
            trackerActiveContent.style.transform = 'scale(0.92)';
          }

          setTimeout(() => {
            if (trackerActiveContent) trackerActiveContent.style.display = 'none';
            if (trackerCompletedScreen) {
              trackerCompletedScreen.style.display = 'flex';
              trackerCompletedScreen.style.opacity = '1';
            }
            if (doneBtn) doneBtn.style.display = 'none';
          }, 350);

          // Auto-close cart drawer after 2.6 seconds and reset to normal cart view
          if (completionTimer) clearTimeout(completionTimer);
          completionTimer = setTimeout(() => {
            closeCart();

            // Clear order and reset cart state
            try {
              localStorage.removeItem('forno_active_order');
            } catch (e) {}
            activeCustomerOrder = null;
            isCompletingAnimation = false;
            if (customerPollInterval) clearInterval(customerPollInterval);
            customerPollInterval = null;
            cleanupRealtime();

            // Reset UI for next time cart is opened ("لما يفتحها تاني تفتحله بقا السله")
            setTimeout(() => {
              if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'none';
              if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
              if ($('#cartViewStep')) {
                $('#cartViewStep').style.display = 'flex';
                $('#cartViewStep').style.flexDirection = 'column';
              }
              if (trackerActiveContent) {
                trackerActiveContent.style.display = 'flex';
                trackerActiveContent.style.opacity = '1';
                trackerActiveContent.style.transform = 'none';
              }
              if (trackerCompletedScreen) {
                trackerCompletedScreen.style.display = 'none';
              }
              if (doneBtn) {
                doneBtn.style.display = 'flex';
                doneBtn.textContent = 'CLOSE';
              }
              if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
            }, 400);
          }, 2600);
        }, 600);
      }
      return;
    }

    // 2. READY: when cashier marks order ready
    if (ord.order_status === 'ready') {
      setStepProgress('completed', 'completed', 'active', '100%');
      if (badge) {
        badge.textContent = 'READY';
        badge.style.background = 'rgba(87,168,79,0.25)';
        badge.style.color = '#7cc46a';
        badge.style.borderColor = '#57a84f';
      }
      if (desc) desc.textContent = 'Your order is ready for pickup or on its way! 🛵';
      if (doneBtn) {
        doneBtn.style.display = 'flex';
        doneBtn.textContent = 'CLOSE';
      }
      return;
    }

    // 3. CONFIRMED: when cashier confirms payment / starts preparing
    if (ord.payment_status === 'paid' || ord.order_status === 'preparing') {
      setStepProgress('completed', 'active', '', '50%');
      if (badge) {
        badge.textContent = 'CONFIRMED';
        badge.style.background = 'rgba(232,176,75,0.25)';
        badge.style.color = 'var(--gold)';
        badge.style.borderColor = 'var(--gold)';
      }
      if (desc) desc.textContent = 'Payment verified & order confirmed! Your pizza is being baked in the oven 🔥';
      if (doneBtn) {
        doneBtn.style.display = 'flex';
        doneBtn.textContent = 'CLOSE';
      }
      return;
    }

    // 4. Default: PAYMENT PENDING (waiting for cashier verification)
    setStepProgress('active', '', '', '0%');
    if (badge) {
      badge.textContent = 'PAYMENT PENDING';
      badge.style.background = 'rgba(255,122,46,0.15)';
      badge.style.color = 'var(--ember2)';
      badge.style.borderColor = 'var(--ember)';
    }
    if (desc) desc.textContent = 'Waiting for cashier verification. Do not close this page.';
    if (doneBtn) {
      doneBtn.style.display = 'flex';
      doneBtn.textContent = 'CLOSE';
    }
  }

  function showCustomerTracking(order) {
    $('#cartDrawer')?.classList.remove('in-checkout');
    $('#cartDrawer')?.classList.add('in-tracker');
    if ($('#cartViewStep')) $('#cartViewStep').style.display = 'none';
    if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
    if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'flex';
    if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('orderTracking');
    const orderNoEl = $('#trackOrderNo') || $('#trackOrderNum');
    if (orderNoEl) orderNoEl.textContent = 'ORDER #' + order.order_number;

    const trackerActiveContent = $('#trackerActiveContent');
    const trackerCompletedScreen = $('#trackerCompletedScreen');
    if (trackerActiveContent) {
      trackerActiveContent.style.display = 'flex';
      trackerActiveContent.style.opacity = '1';
      trackerActiveContent.style.transform = 'none';
    }
    if (trackerCompletedScreen) {
      trackerCompletedScreen.style.display = 'none';
    }

    // Display WhatsApp Quick Confirmation Button
    const waBtn = $('#whatsappConfirmBtn');
    if (waBtn) {
      const waUrl = order.whatsapp_url || `https://wa.me/201001234567?text=${encodeURIComponent('مرحباً FORNO 🍕 أريد تأكيد استلام طلبي رقم #' + order.order_number)}`;
      waBtn.href = waUrl;
      waBtn.style.display = 'flex';
    }

    activeCustomerOrder = { ...(activeCustomerOrder || {}), ...order };
    try {
      localStorage.setItem('forno_active_order', JSON.stringify(activeCustomerOrder));
    } catch (e) {}

    updateTrackerUI(activeCustomerOrder);

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
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime fallback to polling:', err);
      }
    }

    // 2. Resilient Polling Safety-Net (checks every 3.5 seconds)
    if (customerPollInterval) clearInterval(customerPollInterval);
    customerPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?id=${order.order_number}`);
        if (!res.ok) return; // Keep polling, do not wipe on network glitch
        const fresh = await res.json();
        if (fresh && fresh.order_number) {
          updateTrackerUI(fresh);
        }
      } catch (e) {
        // network error, continue polling
      }
    }, 3500);
  }

  // Bind Events
  const mobileHeaderCart = $('#mobileHeaderCart');
  if (mobileHeaderCart) mobileHeaderCart.onclick = openCart;
  const mobileFloatingCart = $('#mobileFloatingCart');
  if (mobileFloatingCart) mobileFloatingCart.onclick = openCart;
  const cartBtn = $('#cartBtn');
  if (cartBtn) cartBtn.onclick = openCart;
  const cartClose = $('#cartClose');
  if (cartClose) cartClose.onclick = closeCart;
  const cartOverlay = $('#cartOverlay');
  if (cartOverlay) cartOverlay.onclick = closeCart;
  const continueBtn = $('#continueBtn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      closeCart();
      const lenis = getLenis ? getLenis() : null;
      if (lenis) lenis.scrollTo('#builder', { offset: -40 });
    };
  }
  const doneClose = $('#doneClose');
  if (doneClose) doneClose.onclick = closeCart;

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

  const checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
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
    };
  }

  const btnApplyCoupon = $('#btnApplyCoupon');
  if (btnApplyCoupon) {
    btnApplyCoupon.onclick = async () => {
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
    };
  }

  const payCashBtn = $('#payCashBtn');
  if (payCashBtn) payCashBtn.onclick = () => setPaymentMode('cash');
  const payVisaBtn = $('#payVisaBtn');
  if (payVisaBtn) payVisaBtn.onclick = () => setPaymentMode('visa');
  const typeDeliveryBtn = $('#typeDeliveryBtn');
  if (typeDeliveryBtn) typeDeliveryBtn.onclick = () => setDeliveryMode('delivery');
  const typePickupBtn = $('#typePickupBtn');
  if (typePickupBtn) typePickupBtn.onclick = () => setDeliveryMode('pickup');

  const backToCartBtn = $('#backToCartBtn');
  if (backToCartBtn) {
    backToCartBtn.onclick = () => {
      $('#cartDrawer')?.classList.remove('in-checkout');
      $('#cartDrawer')?.classList.remove('in-tracker');
      if ($('#checkoutStep')) $('#checkoutStep').style.display = 'none';
      if ($('#cartViewStep')) {
        $('#cartViewStep').style.display = 'flex';
        $('#cartViewStep').style.flexDirection = 'column';
      }
      if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
    };
  }

  const btnSelectReceipt = $('#btnSelectReceipt');
  if (btnSelectReceipt) btnSelectReceipt.onclick = () => $('#receiptInput')?.click();

  const receiptInput = $('#receiptInput');
  if (receiptInput) {
    receiptInput.onchange = (e) => {
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
    };
  }

  const btnRemoveReceipt = $('#btnRemoveReceipt');
  if (btnRemoveReceipt) {
    btnRemoveReceipt.onclick = () => {
      receiptFileBlob = null;
      const input = $('#receiptInput');
      if (input) input.value = '';
      if ($('#receiptPreviewWrap')) $('#receiptPreviewWrap').style.display = 'none';
      if ($('#btnSelectReceipt')) $('#btnSelectReceipt').style.display = 'block';
    };
  }

  const placeOrderBtn = $('#placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.onclick = async () => {
      if (isSubmittingOrder) {
        console.warn('[Cart] Submission blocked: Order already in flight.');
        return;
      }

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

      if (!cart.length) {
        toast('CART IS EMPTY');
        return;
      }

      const finalAddress =
        deliveryType === 'pickup'
          ? 'IN STORE / PICKUP (استلام من داخل المحل)'
          : address;

      // Immediately lock submission to prevent double clicks / rapid taps
      isSubmittingOrder = true;
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.pointerEvents = 'none';
      placeOrderBtn.style.opacity = '0.6';
      placeOrderBtn.textContent = 'SENDING ORDER...';

      try {
        const orderItems = cart.map((c) => {
          const itemCopy = JSON.parse(JSON.stringify(c));
          const fullMeta = c.kind === 'pizza' ? summarize(c.snap) : (c.meta || (c.ing || []).join(' · '));
          itemCopy.meta = fullMeta;
          itemCopy.ingredients = fullMeta;
          itemCopy.ingredients_text = fullMeta;
          if (!itemCopy.img) itemCopy.img = '/ico.webp';
          return itemCopy;
        });
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

          // إرسال إشعار فوري لجميع التابات المفتوحة (بما فيها الداشبورد) لسماع الطلب فورياً
          if (typeof window !== 'undefined') {
            try {
              const bc = new BroadcastChannel('forno_orders_channel');
              bc.postMessage({ type: 'NEW_ORDER', order: data.order });
              bc.close();
            } catch (e) {}
            try {
              localStorage.setItem('forno_new_order_ping', Date.now().toString());
            } catch (e) {}
          }

          showCustomerTracking(orderToTrack);
        } else {
          toast(data.error || 'FAILED TO PLACE ORDER');
        }
      } catch (err) {
        toast('NETWORK ERROR, PLEASE TRY AGAIN');
      } finally {
        setTimeout(() => {
          isSubmittingOrder = false;
          if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.style.pointerEvents = '';
            placeOrderBtn.style.opacity = '';
            updatePlaceOrderButtonText();
          }
        }, 1500);
      }
    };
  }

  const trackDoneBtn = $('#trackDoneBtn');
  if (trackDoneBtn) {
    trackDoneBtn.onclick = () => {
      // If the order has finished (completed or rejected), clicking will clear it and reset
      if (
        activeCustomerOrder &&
        (activeCustomerOrder.order_status === 'completed' || activeCustomerOrder.payment_status === 'rejected')
      ) {
        try {
          localStorage.removeItem('forno_active_order');
        } catch (e) {}
        activeCustomerOrder = null;
        if (customerPollInterval) clearInterval(customerPollInterval);
        customerPollInterval = null;
        cleanupRealtime();
        if ($('#orderTrackerStep')) $('#orderTrackerStep').style.display = 'none';
        if ($('#cartViewStep')) {
          $('#cartViewStep').style.display = 'flex';
          $('#cartViewStep').style.flexDirection = 'column';
        }
        if ($('#cartDrawerTitle')) $('#cartDrawerTitle').textContent = t('cartTitle');
      }
      closeCart();
    };
  }

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

      activeCustomerOrder = cached;

      const res = await fetch(`/api/orders?id=${cached.order_number}`);
      if (res.ok) {
        const fresh = await res.json();
        if (fresh && fresh.order_number) {
          activeCustomerOrder = { ...cached, ...fresh };
          try {
            localStorage.setItem('forno_active_order', JSON.stringify(activeCustomerOrder));
          } catch (e) {}
        }
      }

      // If active order exists, keep tracking prepared unless it was already completed
      if (activeCustomerOrder) {
        if (activeCustomerOrder.order_status === 'completed') {
          try {
            localStorage.removeItem('forno_active_order');
          } catch (e) {}
          activeCustomerOrder = null;
        } else {
          showCustomerTracking(activeCustomerOrder);
        }
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
