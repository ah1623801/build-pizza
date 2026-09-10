export const OvenModal = () => (
  <>
    <div id="ovenScene">
      <div className="ov-vignette"></div>
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
        <div id="ovenChips"></div>
        <div id="ovenPrice">EGP 0</div>
        <div className="rv-btns">
          <button id="btnCartAdd" className="btn solid">ADD TO CART</button>
          <button id="btnSave" className="btn ghost">SAVE PIZZA</button>
          <button id="btnAnother" className="btn ghost">MAKE ANOTHER</button>
        </div>
      </div>
    </div>

    <div id="mMenuOverlay"></div>
    <aside id="mMenu">
      <button id="mMenuClose" aria-label="CLOSE">✕</button>
      <button data-go="#builder">BUILD</button>
      <button data-go="#menu">MENU</button>
      <button data-go="#contact">CONTACT</button>
      <button id="mmSaved">SAVED PIZZAS <span id="mmSavedCount">0</span></button>
    </aside>
    
    <div id="toast"></div>
  </>
);