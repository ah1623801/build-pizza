// src/components/Builder.js

export const Builder = () => (
  <section id="builder">
    <div className="b-head" data-rev="true">
      <h2>CREATE YOUR OWN <em>PIZZA</em></h2>
      
      {/* 🛒 أيقونة السلة المضافة على اليمين تحت INTERACTIVE KITCHEN */}

    </div>
    <div className="b-grid">
      <div id="rail"></div>

      <div className="stage-wrap">
        {/* 🍕 شاشة اختيار المقاس الدائرية للموبايل والتابلت */}
        <div id="mobileSizeSelector" className="mob-size-wrap">
   
          <div className="ms-title">CHOOSE PIZZA SIZE</div>
          <div className="ms-circles">
            <button type="button" className="ms-circle-btn" data-size="small">
              <b>S</b>
            </button>
            <button type="button" className="ms-circle-btn" data-size="med">
              <b>M</b>
            </button>
            <button type="button" className="ms-circle-btn" data-size="large">
              <b>L</b>
            </button>
          </div>
        </div>
<div className="stage-light"></div>
        <div className="stage-shadow"></div>
        <div id="stageHost"></div>
        <button id="drawerBtn" className="drawer-btn">
          <span className="db-ico">✦</span>
          <span>BUILD IT</span>
          <span id="dbBadge" className="db-badge">0</span>
        </button>

        {/* 🛒 زر السلة العائم المضاف للموبايل داخل سكشن البيتزا فقط */}
        <button type="button" id="mobileFloatingCart" className="mob-floating-cart" aria-label="Open Cart">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.6"/>
            <circle cx="19" cy="21" r="1.6"/>
            <path d="M2 2h3l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
          </svg>
          <span id="mobileCartCount" className="mfc-badge">0</span>
        </button>
      </div>

      <div id="drawerOverlay"></div>
      <aside className="panel">
        <button id="drawerClose" className="drawer-close">✕</button>
        <div className="p-top">
          <button id="pBack">← BACK</button>
          <span id="pStepNo"></span>
          <button id="pNext">CONTINUE →</button>
        </div>
        <div id="panelBody"></div>
        <button id="drawerHandle" className="d3-handle-btn"><span></span></button>
      </aside>
    </div>
  </section>
);