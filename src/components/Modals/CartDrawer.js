export const CartDrawer = () => (
  <>
    <div id="cartOverlay"></div>
    <aside id="cartDrawer">
      <div className="cd-head">
        <h3>YOUR CART</h3>
        <button id="cartClose">✕</button>
      </div>
      <div id="cartItems"></div>
      <div className="cd-foot">
        <div className="cd-total"><span>TOTAL</span><b id="cartTotal">EGP 0</b></div>
        <button id="checkoutBtn" className="btn solid">CHECKOUT</button>
        <button id="continueBtn" className="btn ghost">CONTINUE BUILDING</button>
      </div>
      <div id="cartDone">
        <h3>ORDER RECEIVED.</h3>
        <p>THANK YOU — WE'LL BE IN TOUCH.</p>
        <button id="doneClose" className="btn ghost">CLOSE</button>
      </div>
    </aside>
  </>
);