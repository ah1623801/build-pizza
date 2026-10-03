// src/components/sections/Builder.js
export const Builder = () => (
  <section id="builder" className="picking-size">
    {/* لوجو القسم فوق على الشمال لكل الأجهزة */}
    <div
      className="builder-logo logo"
      role="button"
      tabIndex={0}
      aria-label="FORNO Pizza Home"
      onClick={() => {
        if (typeof window !== 'undefined') {
          const el = document.querySelector('#hero');
          if (el) {
            const absoluteTop = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0);
            if (window.__forno_lenis && typeof window.__forno_lenis.scrollTo === 'function') {
              window.__forno_lenis.scrollTo(absoluteTop, { immediate: false, duration: 1.1 });
            } else {
              window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
            }
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            const el = document.querySelector('#hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      FORNO<span>.</span>
    </div>

    <div className="b-head" data-rev="true">
      <h2 id="builderHeading">CREATE YOUR OWN <em>PIZZA</em></h2>
    </div>

    <div className="b-grid">
      <div className="stage-wrap">
        {/* شاشة اختيار المقاس الدائرية (متاحة لجميع الشاشات في وضع العجلة التفاعلية) */}
        <div id="mobileSizeSelector" className="mob-size-wrap">
          <div className="ms-title" id="chooseSizeTitle">CHOOSE PIZZA SIZE</div>
          <div className="ms-circles" role="group" aria-label="Select Pizza Size">
            <button type="button" className="ms-circle-btn" data-size="small" aria-label="Small Pizza" aria-pressed="false">
              <b>S</b>
            </button>
            <button type="button" className="ms-circle-btn active" data-size="med" aria-label="Medium Pizza" aria-pressed="true">
              <b>M</b>
            </button>
            <button type="button" className="ms-circle-btn" data-size="large" aria-label="Large Pizza" aria-pressed="false">
              <b>L</b>
            </button>
          </div>
        </div>

        <div className="stage-light"></div>
        <div className="stage-shadow"></div>
        <div id="stageHost" role="img" aria-label="Interactive 3D Pizza Canvas"></div>
      </div>
    </div>

    {/* زر السلة العائم داخل منطقة البيلدر على كافة الشاشات */}
    <button
      type="button"
      id="mobileFloatingCart"
      className="mob-floating-cart"
      aria-label="Open Shopping Cart"
      onClick={() => document.body.classList.add('cart-open')}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1.6"/>
        <circle cx="19" cy="21" r="1.6"/>
        <path d="M2 2h3l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
      </svg>
      <span id="mobileCartCount" className="mfc-badge">0</span>
    </button>
  </section>
);

export default Builder;
