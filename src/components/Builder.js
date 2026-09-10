export const Builder = () => (
  <section id="builder">
    <div className="b-head" data-rev="true">
      <h2>CREATE YOUR OWN <em>PIZZA</em></h2>
      <span className="kicker">INTERACTIVE KITCHEN</span>
    </div>
    <div className="b-grid">
      <div id="rail"></div>
      <div className="stage-wrap">
        <div className="stage-light"></div>
        <div className="stage-shadow"></div>
        <div id="stageHost"></div>
        <button id="drawerBtn" className="drawer-btn">
          <span className="db-ico">✦</span>
          <span>BUILD IT</span>
          <span id="dbBadge" className="db-badge">0</span>
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