// src/components/modals/OvenModal.js
export const OvenModal = () => (
  <>
    <div id="ovenScene" role="dialog" aria-modal="true" aria-label="Pizza Oven Baking Simulation">
      <div className="ov-vignette"></div>
      <button id="ovenCloseBtn" aria-label="Cancel and Exit Oven" style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--ink)', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✕</button>
      <div className="oven-head">
        <div id="ovenStatus">PREHEATING</div>
        <div id="ovenTimer">00:08</div>
      </div>
      <div className="oven">
        <div className="oven-chimney"><i></i><i></i><i></i></div>
        <div className="oven-body">
          <div className="oven-mouth">
            <div className="oven-glow"></div>
            <div className="embers"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <div className="flames"><i></i><i></i><i></i><i></i><i></i></div>
            <div id="ovenSlot"></div>
            <div className="oven-door"></div>
          </div>
        </div>
        <div className="oven-base"></div>
      </div>
      <div id="boxWrap">
        <div id="boxScene">
          <div className="bx3d-wrap">
            <div className="bx3d">
              <div className="bx-floor">
                <div className="bx-paper"></div>
                <div className="pz-holder"><div id="boxPizzaHost"></div></div>
              </div>
              <div className="bx-wall bx-w-front"></div>
              <div className="bx-wall bx-w-back"></div>
              <div className="bx-wall bx-w-left"></div>
              <div className="bx-wall bx-w-right"></div>
              <div className="bx-lid3d">
                <div className="lid-top"><span>FORNO</span><b>WOOD-FIRED · YOUR WAY</b></div>
                <div className="lid-under"></div>
                <div className="lid-flap lf-left"></div>
                <div className="lid-flap lf-right"></div>
                <div className="lid-flap lf-front"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="oven-steam"></div>
      <div id="revealBox">
        <h2>YOUR PIZZA<br/>IS READY.</h2>
    
        <div id="ovenPrice">EGP 0</div>
        <div className="rv-btns">
          <button id="btnCartAdd" className="btn solid">ADD TO CART</button>
          <button id="btnSave" className="btn ghost">SAVE PIZZA</button>
          <button id="btnAnother" className="btn ghost">MAKE ANOTHER</button>
        </div>
      </div>
    </div>
    
    <div id="toast" role="status" aria-live="polite"></div>
  </>
);

export default OvenModal;