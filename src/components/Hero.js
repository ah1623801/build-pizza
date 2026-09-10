export const Hero = () => (
  <section id="hero">
    <video id="heroVideo" autoPlay muted loop playsInline preload="auto">
      <source src="/Epic B-Roll Style Pizza Commercial _ Instrumental Version.mp4" type="video/mp4" />
    </video>
    <div className="hero-shade"></div>
    <div id="heroDust"></div>
    <div className="hero-grid">
      <div>
        <h1 className="h-title">
          <span className="h-line"><span>YOUR PIZZA.</span></span>
          <span className="h-line outline"><span>YOUR RULES.</span></span>
        </h1>
        <p className="h-sub">Build it exactly the way you want it. Real dough, real fire, real cheese — every choice lands on the same pizza, live.</p>
        <div className="h-cta">
          <button className="btn solid" id="ctaBuild">BUILD YOUR PIZZA</button>
          <button className="btn ghost" id="ctaMenu">VIEW MENU</button>
        </div>
      </div>
    </div>
    <div className="h-scroll">SCROLL</div>
  </section>
);