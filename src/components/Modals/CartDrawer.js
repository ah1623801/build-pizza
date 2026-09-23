// src/components/Modals/CartDrawer.js

export const CartDrawer = () => (
  <>
    <div id="cartOverlay"></div>
    <aside id="cartDrawer">
      <div className="cd-head">
        <h3 id="cartDrawerTitle">YOUR CART</h3>
        <button id="cartClose">✕</button>
      </div>

      {/* 1. قائمة عناصر السلة */}
      <div id="cartViewStep">
        <div id="cartItems"></div>
        <div className="cd-foot">
          <div className="cd-total"><span>TOTAL</span><b id="cartTotal">EGP 0</b></div>
          <button id="checkoutBtn" className="btn solid">CHECKOUT</button>
          <button id="continueBtn" className="btn ghost">CONTINUE BUILDING</button>
        </div>
      </div>

      {/* 2. شاشة الـ Checkout */}
      <div id="checkoutStep" style={{ display: 'none', flex: 1, flexDirection: 'column', overflowY: 'auto', padding: '20px 24px' }}>
        <button id="backToCartBtn" className="btn ghost" style={{ padding: '8px 14px', fontSize: '10px', alignSelf: 'flex-start', marginBottom: '16px' }}>← BACK TO CART</button>
        
        {/* بيانات العميل الأساسية */}
        <h4 style={{ fontFamily: 'var(--disp)', fontSize: '18px', color: 'var(--gold)', marginBottom: '12px' }}>CUSTOMER INFO</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          <input id="ckName" placeholder="FULL NAME (الاسم بالكامل)" required className="ck-input" />
          <input id="ckPhone" placeholder="PHONE NUMBER (رقم الهاتف)" type="tel" required className="ck-input" />
        </div>

        {/* طريقة الدفع */}
        <h4 style={{ fontFamily: 'var(--disp)', fontSize: '18px', color: 'var(--gold)', marginBottom: '10px' }}>PAYMENT METHOD</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button type="button" id="payCashBtn" className="pay-method-btn active">💵 CASH</button>
          <button type="button" id="payVisaBtn" className="pay-method-btn">💳 VISA / INSTAPAY</button>
        </div>

        {/* خيار نوع الطلب (توصيل / في المحل) */}
        <div id="orderTypeBox" style={{ display: 'none', marginBottom: '16px' }}>
          <h4 style={{ fontFamily: 'var(--disp)', fontSize: '16px', color: 'var(--gold)', marginBottom: '8px' }}>ORDER TYPE</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" id="typeDeliveryBtn" className="del-type-btn active">🛵 DELIVERY (توصيل)</button>
            <button type="button" id="typePickupBtn" className="del-type-btn">🏪 IN STORE (في المحل)</button>
          </div>
        </div>

        {/* حقل العنوان: يظهر فقط إذا كان فيزا + توصيل */}
        <div id="ckAddressWrap" style={{ display: 'none', marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--mut)', letterSpacing: '1px', marginBottom: '6px' }}>DELIVERY ADDRESS *</label>
          <textarea id="ckAddress" placeholder="STREET, BUILDING, APARTMENT NUMBER (عنوان التوصيل بالتفصيل)" className="ck-input" style={{ minHeight: '65px', resize: 'none' }}></textarea>
        </div>

        {/* تفاصيل التحويل والإيصال */}
        <div id="visaBox" style={{ display: 'none', background: 'rgba(255,122,46,0.06)', border: '1px dashed var(--ember)', borderRadius: '16px', padding: '16px', marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink)', marginBottom: '14px' }}>
            <span style={{ color: 'var(--ember2)', fontWeight: '800', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              ⚡ TAP NUMBER OR ID TO COPY:
            </span>

            <div className="copy-badge" id="copyPhoneBtn" data-copy="01001234567" title="Click to copy">
              <span className="cb-label">VODAFONE CASH / PHONE</span>
              <div className="cb-val-row">
                <b className="cb-val">01001234567</b>
                <span className="cb-icon">📋 TAP TO COPY</span>
              </div>
            </div>

            <div className="copy-badge" id="copyInstaBtn" data-copy="forno@instapay" title="Click to copy" style={{ marginTop: '8px' }}>
              <span className="cb-label">INSTAPAY USERNAME</span>
              <div className="cb-val-row">
                <b className="cb-val">forno@instapay</b>
                <span className="cb-icon">📋 TAP TO COPY</span>
              </div>
            </div>
          </div>
          
          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '1px', fontWeight: '800', color: 'var(--gold)', marginBottom: '6px' }}>UPLOAD PAYMENT RECEIPT *</label>
          <input type="file" id="receiptInput" accept="image/*" style={{ display: 'none' }} />
          <button type="button" id="btnSelectReceipt" className="btn ghost" style={{ width: '100%', padding: '10px', fontSize: '10px' }}>SELECT RECEIPT IMAGE</button>

          <div id="receiptPreviewWrap" style={{ display: 'none', position: 'relative', marginTop: '10px', textAlign: 'center' }}>
            <img id="receiptPreviewImg" alt="Receipt" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '8px', border: '1px solid var(--line)' }} />
            <button type="button" id="btnRemoveReceipt" style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--red)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--mut)', letterSpacing: '2px' }}>TOTAL DUE:</span>
            <b id="checkoutTotalVal" style={{ fontFamily: 'var(--disp)', fontSize: '24px', color: 'var(--ember2)' }}>EGP 0</b>
          </div>
          <button id="placeOrderBtn" className="btn solid" style={{ width: '100%', justifyContent: 'center' }}>PLACE ORDER</button>
        </div>
      </div>

      {/* 3. شاشة حالة الطلب المباشرة للعميل (بدون عداد الوقت) */}
      <div id="orderTrackerStep" style={{ display: 'none', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 24px' }}>
        <span className="kicker" style={{ marginBottom: '10px' }}>LIVE ORDER STATUS</span>
        <h3 id="trackOrderNum" style={{ fontSize: '32px', color: 'var(--ember2)', margin: '0 0 10px' }}>#FN-000000</h3>
        
        <div id="trackStatusBadge" style={{ padding: '8px 20px', borderRadius: '99px', fontSize: '11px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', background: 'rgba(255,122,46,0.15)', color: 'var(--ember2)', border: '1px solid var(--ember)' }}>
          PAYMENT PENDING
        </div>

        <p id="trackDesc" style={{ fontSize: '11px', color: 'var(--mut)', lineHeight: '1.6', maxWidth: '300px', marginBottom: '26px' }}>
          We are waiting for cashier confirmation. This screen updates automatically.
        </p>

        <button id="trackDoneBtn" className="btn ghost" style={{ padding: '12px 28px', fontSize: '10px' }}>DONE & CLOSE</button>
      </div>
    </aside>
  </>
);

export default CartDrawer;