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
          <h2>DON'T WANT TO BUILD?<br/><em>WE ALREADY DID THE WORK.</em></h2>
        </div>
        <div id="menuTabs"></div>
        <div className="menu-view"><div id="menuTrack"></div></div>
        <div className="menu-bar"><i id="menuBar"></i></div>
      </div>
    </section>
  </>
);