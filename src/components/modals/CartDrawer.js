// src/components/modals/CartDrawer.js
import siteConfig from '@/config/site';

export const CartDrawer = () => (
  <>
    <div id="cartOverlay"></div>
    <aside id="cartDrawer" role="dialog" aria-modal="true" aria-label="Shopping Cart" aria-labelledby="cartDrawerTitle">
      <div className="cd-head">
        <h3 id="cartDrawerTitle">YOUR CART</h3>
        <button id="cartClose" aria-label="Close cart">✕</button>
      </div>

      {/* 1. قائمة عناصر السلة */}
      <div id="cartViewStep">
        <div id="cartItems"></div>
        <div className="cd-foot">
          <div className="cd-total">
            <span id="cartTotalLabel">TOTAL</span>
            <b id="cartTotal" aria-live="polite">EGP 0</b>
          </div>
          <button id="checkoutBtn" className="btn solid">CHECKOUT</button>
          <button id="continueBtn" className="btn ghost">CONTINUE BUILDING</button>
        </div>
      </div>

      {/* 2. شاشة الـ Checkout */}
      <div id="checkoutStep">
        <button id="backToCartBtn" className="btn ghost" style={{ padding: '8px 14px', fontSize: '10px', alignSelf: 'flex-start', marginBottom: '16px' }}>
          ← BACK TO CART
        </button>
        
        {/* بيانات العميل الأساسية */}
        <h4 id="ckCustomerTitle" style={{ fontFamily: 'var(--disp)', fontSize: '18px', color: 'var(--gold)', marginBottom: '12px' }}>
          CUSTOMER INFO
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          <input id="ckName" placeholder="FULL NAME (الاسم بالكامل)" aria-label="Full Name" required className="ck-input" />
          <input id="ckPhone" placeholder="PHONE NUMBER (رقم الهاتف)" aria-label="Phone Number" type="tel" required className="ck-input" />
        </div>

        {/* طريقة الدفع */}
        <h4 id="ckPaymentTitle" style={{ fontFamily: 'var(--disp)', fontSize: '18px', color: 'var(--gold)', marginBottom: '10px' }}>
          PAYMENT METHOD
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button type="button" id="payCashBtn" className="pay-method-btn active">💵 CASH</button>
          <button type="button" id="payVisaBtn" className="pay-method-btn">💳 VISA / INSTAPAY</button>
        </div>

        {/* خيار نوع الطلب (توصيل / في المحل) - ظاهر دائماً لكافة طرق الدفع */}
        <div id="orderTypeBox" style={{ display: 'block', marginBottom: '16px' }}>
          <h4 id="ckOrderTypeTitle" style={{ fontFamily: 'var(--disp)', fontSize: '16px', color: 'var(--gold)', marginBottom: '8px' }}>
            ORDER TYPE
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" id="typeDeliveryBtn" className="del-type-btn active">🛵 DELIVERY</button>
            <button type="button" id="typePickupBtn" className="del-type-btn">🏪 IN STORE PICKUP</button>
          </div>
        </div>

        {/* حقل العنوان: يظهر دائماً في حالة التوصيل لكاش أو فيزا */}
        <div id="ckAddressWrap" style={{ display: 'block', marginBottom: '18px' }}>
          <label htmlFor="ckAddress" id="ckAddressLabel" style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--mut)', letterSpacing: '1px', marginBottom: '6px' }}>
            DELIVERY ADDRESS *
          </label>
          <textarea id="ckAddress" placeholder="STREET, BUILDING, APARTMENT NUMBER (عنوان التوصيل بالتفصيل)" aria-label="Delivery Address" className="ck-input" style={{ minHeight: '65px', resize: 'none' }}></textarea>
        </div>

        {/* تفاصيل التحويل والإيصال (تظهر فقط عند اختيار فيزا / إنستاباي) */}
        <div id="visaBox" style={{ display: 'none', background: 'rgba(255,122,46,0.06)', border: '1px dashed var(--ember)', borderRadius: '16px', padding: '16px', marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink)', marginBottom: '14px' }}>
            <span style={{ color: 'var(--ember2)', fontWeight: '800', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              ⚡ TAP NUMBER OR ID TO COPY:
            </span>

            <div className="copy-badge" id="copyPhoneBtn" data-copy={siteConfig.payment.vodafoneCash} title="Click to copy">
              <span className="cb-label">VODAFONE CASH / PHONE</span>
              <div className="cb-val-row">
                <b className="cb-val">{siteConfig.payment.vodafoneCash}</b>
                <span className="cb-icon">📋 TAP TO COPY</span>
              </div>
            </div>

            <div className="copy-badge" id="copyInstaBtn" data-copy={siteConfig.payment.instaPay} title="Click to copy" style={{ marginTop: '8px' }}>
              <span className="cb-label">INSTAPAY USERNAME</span>
              <div className="cb-val-row">
                <b className="cb-val">{siteConfig.payment.instaPay}</b>
                <span className="cb-icon">📋 TAP TO COPY</span>
              </div>
            </div>
          </div>
          
          <label id="uploadReceiptLabel" style={{ display: 'block', fontSize: '10px', letterSpacing: '1px', fontWeight: '800', color: 'var(--gold)', marginBottom: '6px' }}>
            UPLOAD PAYMENT RECEIPT *
          </label>
          <input type="file" id="receiptInput" accept="image/*" style={{ display: 'none' }} />
          <button type="button" id="btnSelectReceipt" className="btn ghost" style={{ width: '100%', padding: '10px', fontSize: '10px' }}>
            SELECT RECEIPT IMAGE
          </button>

          <div id="receiptPreviewWrap" style={{ display: 'none', position: 'relative', marginTop: '10px', textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="receiptPreviewImg" alt="Receipt preview" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '8px', border: '1px solid var(--line)' }} />
            <button type="button" id="btnRemoveReceipt" style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--red)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* كود الخصم (Promo Code) */}
        <div id="couponSection" style={{ marginBottom: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: '12px', padding: '12px' }}>
          <label htmlFor="ckCoupon" id="couponLabel" style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '1px', marginBottom: '6px' }}>
            PROMO CODE / COUPON
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input id="ckCoupon" placeholder="e.g. FORNO10" aria-label="Promo code" className="ck-input" style={{ textTransform: 'uppercase', flex: 1, padding: '10px 14px' }} />
            <button type="button" id="btnApplyCoupon" className="btn ghost" style={{ padding: '8px 16px', fontSize: '11px', whiteSpace: 'nowrap' }}>
              APPLY
            </button>
          </div>
          <div id="couponFeedback" style={{ display: 'none', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}></div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <div id="subtotalRow" style={{ display: 'none', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span id="subtotalLabel" style={{ fontSize: '11px', color: 'var(--mut)' }}>SUBTOTAL:</span>
            <span id="subtotalVal" style={{ fontSize: '12px', color: 'var(--ink)' }}>EGP 0</span>
          </div>
          <div id="discountRow" style={{ display: 'none', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span id="discountLabel" style={{ fontSize: '11px', color: '#57a84f' }}>DISCOUNT:</span>
            <span id="discountVal" style={{ fontSize: '12px', color: '#57a84f', fontWeight: 'bold' }}>- EGP 0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span id="checkoutTotalLabel" style={{ fontSize: '12px', color: 'var(--mut)', letterSpacing: '2px' }}>TOTAL DUE:</span>
            <b id="checkoutTotalVal" style={{ fontFamily: 'var(--disp)', fontSize: '24px', color: 'var(--ember2)' }}>EGP 0</b>
          </div>
          <button id="placeOrderBtn" className="btn solid" style={{ width: '100%', justifyContent: 'center' }}>
            PLACE ORDER (CASH ON DELIVERY)
          </button>
        </div>
      </div>

      {/* 3. شاشة حالة الطلب المباشرة للعميل */}
      <div id="orderTrackerStep" style={{ display: 'none', flex: 1, flexDirection: 'column', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
        
        {/* Active Tracking Content Container */}
        <div id="trackerActiveContent" className="tracker-active-content">
          <div className="tracker-top-badge">
            <span className="live-dot"></span>
            <span>LIVE ORDER TRACKING</span>
          </div>

          <h4 id="trackOrderNo" className="tracker-order-num">ORDER #</h4>
          <p id="trackOrderRecvMsg" className="tracker-order-sub">YOUR WOOD-FIRED ORDER IS BEING PROCESSED</p>

          {/* Stepper with animated progress line */}
          <div className="order-stepper-wrap">
            <div className="stepper-line-bg">
              <div id="stepperLineFill" className="stepper-line-fill" style={{ width: '0%' }}></div>
            </div>

            <div className="stepper-nodes">
              {/* Step 1: Received / Pending */}
              <div id="stepNode1" className="step-node active">
                <div className="step-icon-circle">
                  <span className="step-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="13" y2="17" />
                    </svg>
                  </span>
                  <span className="step-check">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
                <span className="step-label">RECEIVED</span>
              </div>

              {/* Step 2: Confirmed / Baking */}
              <div id="stepNode2" className="step-node">
                <div className="step-icon-circle">
                  <span className="step-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  </span>
                  <span className="step-check">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
                <span className="step-label">BAKING</span>
              </div>

              {/* Step 3: Ready / Delivery */}
              <div id="stepNode3" className="step-node">
                <div className="step-icon-circle">
                  <span className="step-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="5.5" cy="17.5" r="2.5" />
                      <circle cx="18.5" cy="17.5" r="2.5" />
                      <path d="M8 17.5h8" />
                      <path d="M12 17.5V11l4-2h3" />
                      <path d="M5.5 15l2-7h5" />
                      <rect x="2" y="7" width="4" height="4" rx="1" />
                    </svg>
                  </span>
                  <span className="step-check">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
                <span className="step-label">READY</span>
              </div>
            </div>
          </div>

          {/* Current Status Highlight Card */}
          <div className="tracker-status-card">
            <div className="tracker-card-head">
              <span id="trackStatusLabel" className="tracker-card-label">CURRENT STATUS</span>
              <span id="trackStatusBadge" className="tracker-badge">PAYMENT PENDING</span>
            </div>
            <p id="trackDesc" className="tracker-card-desc">Waiting for cashier verification. Do not close this page.</p>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          <a id="whatsappConfirmBtn" href="#" target="_blank" rel="noopener noreferrer" className="whatsapp-track-btn" style={{ display: 'none' }}>
            <span className="wa-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </span>
            <span className="wa-btn-text">CONFIRM ON WHATSAPP</span>
            <span className="wa-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </a>
        </div>

        {/* Celebratory Completed Screen (Appears smoothly when finished) */}
        <div id="trackerCompletedScreen" className="tracker-completed-screen" style={{ display: 'none' }}>
          <div className="completed-glow-ring">
            <div className="completed-icon-wrap">
              <span className="completed-check-icon">✓</span>
            </div>
          </div>
          <h3 className="completed-title">COMPLETED</h3>
          <p className="completed-subtitle">YOUR ORDER HAS BEEN FULFILLED! ENJOY YOUR WOOD-FIRED PIZZA 🔥</p>
          <div className="completed-auto-close-hint">CLOSING CART...</div>
        </div>

        <button id="trackDoneBtn" className="btn ghost" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>CLOSE</button>
      </div>
    </aside>
  </>
);

export default CartDrawer;