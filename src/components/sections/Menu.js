// src/components/sections/Menu.js
/* eslint-disable @next/next/no-img-element */
export const Marquee = () => (
  <div className="marquee">
    <div className="mq-in">
      WOOD-FIRED <i>★</i> HAND-STRETCHED <i>★</i> 48H DOUGH <i>★</i> BUFFALO MOZZARELLA <i>★</i> CAIRO, EGYPT <i>★</i> 
      WOOD-FIRED <i>★</i> HAND-STRETCHED <i>★</i> 48H DOUGH <i>★</i> BUFFALO MOZZARELLA <i>★</i> CAIRO, EGYPT <i>★</i>
    </div>
  </div>
);

export const Menu = () => (
  <>
    <Marquee />
    <section id="menu">
      <div className="menu-pin">
        <div className="m-head" data-rev="true">
          <span className="kicker">THE MENU</span>
          <h2>DON&apos;T WANT TO BUILD?<br/><em>WE ALREADY DID THE WORK.</em></h2>
        </div>
        <div id="menuTabs">
          <button className="tab active" data-cat="signature">SIGNATURE</button>
          <button className="tab" data-cat="classic">CLASSIC</button>
          <button className="tab" data-cat="spicy">SPICY</button>
          <button className="tab" data-cat="vegetarian">VEGETARIAN</button>
          <button className="tab" data-cat="sides">SIDES</button>
          <button className="tab" data-cat="drinks">DRINKS</button>
          <button className="tab" data-cat="desserts">DESSERTS</button>
        </div>
        <div className="menu-view">
          <div id="menuTrack"></div>
        </div>
        <div className="menu-bar"><i id="menuBar"></i></div>
      </div>
    </section>
  </>
);

export default Menu;
