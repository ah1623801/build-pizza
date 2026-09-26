// src/components/sections/Hero.js
export const Hero = () => (
  <section id="hero">
    <video
      id="heroVideo"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/pOriginal.webp"
    >
      <source src="/hero.mp4" type="video/mp4" />
    </video>
    <div className="hero-shade"></div>
    <div id="heroDust"></div>
    <div className="hero-grid hero-grid-centered">
      <div className="hero-content">
        <h1 className="h-title">
          <span className="h-line"><span>YOUR PIZZA.</span></span>
          <span className="h-line outline"><span>YOUR RULES.</span></span>
        </h1>
        <p className="h-sub">Build it exactly the way you want it. Real dough, real fire, real cheese — every choice lands on the same pizza, live.</p>
        <div className="h-cta">
          <button
            className="btn solid"
            id="ctaBuild"
            onClick={() => {
              const el = document.querySelector('#builder');
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const absoluteTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
              if (window.__forno_lenis && typeof window.__forno_lenis.scrollTo === 'function') {
                window.__forno_lenis.scrollTo(absoluteTop, { immediate: false, duration: 1.1 });
              } else {
                window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
              }
            }}
          >
            BUILD YOUR PIZZA
          </button>
          <button
            className="btn ghost"
            id="ctaMenu"
            onClick={() => {
              const el = document.querySelector('#menu');
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const absoluteTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0) - 40;
              if (window.__forno_lenis && typeof window.__forno_lenis.scrollTo === 'function') {
                window.__forno_lenis.scrollTo(absoluteTop, { immediate: false, duration: 1.1 });
              } else {
                window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
              }
            }}
          >
            VIEW MENU
          </button>
        </div>
      </div>
    </div>
    <div className="h-scroll">SCROLL</div>
  </section>
);

export default Hero;
