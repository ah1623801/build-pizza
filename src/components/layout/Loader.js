// src/components/layout/Loader.js
"use client";

import { useEffect } from 'react';

export const Loader = () => {
  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 5) + 3;
      if (currentPct > 90) {
        currentPct = 90;
        clearInterval(interval);
      }
      const pctEl = document.getElementById('loadPct');
      const barEl = document.getElementById('loadBar');
      if (pctEl) {
        const val = parseInt(pctEl.textContent || '0', 10);
        if (isNaN(val) || val < currentPct) {
          pctEl.textContent = currentPct + '%';
        }
      }
      if (barEl) {
        barEl.style.width = currentPct + '%';
      }
    }, 110);

    // Hard fallback: never allow loader to block screen for more than 4.2 seconds
    const fallbackTimer = setTimeout(() => {
      clearInterval(interval);
      const l = document.getElementById('loader');
      if (l) {
        const pctEl = document.getElementById('loadPct');
        const barEl = document.getElementById('loadBar');
        if (pctEl) pctEl.textContent = '100%';
        if (barEl) barEl.style.width = '100%';
        l.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        l.style.opacity = '0';
        l.style.pointerEvents = 'none';
        setTimeout(() => {
          l.remove();
          document.body.classList.add('loaded');
        }, 400);
      }
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div id="loader">
      <div className="ld-in">
        <div className="ld-pizza-wrap">
          {/* بخار يتصاعد بنعومة فوق البيتزا الساخنة عند اكتمالها */}
          <div className="pizza-steam-loader">
            <svg viewBox="0 0 60 30" width="60" height="30">
              <path d="M 15 25 Q 9 12 15 2" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 30 28 Q 36 14 30 3" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 45 25 Q 39 12 45 2" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* الشرائح الست المكونة لصورة loding.png التي تتراص واحدة تلو الأخرى لتشكيل بيتزا دائرية كاملة */}
          <div className="pz-slice-wrap" style={{ transform: 'rotate(0deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s1" alt="" />
          </div>
          <div className="pz-slice-wrap" style={{ transform: 'rotate(60deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s2" alt="" />
          </div>
          <div className="pz-slice-wrap" style={{ transform: 'rotate(120deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s3" alt="" />
          </div>
          <div className="pz-slice-wrap" style={{ transform: 'rotate(180deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s4" alt="" />
          </div>
          <div className="pz-slice-wrap" style={{ transform: 'rotate(240deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s5" alt="" />
          </div>
          <div className="pz-slice-wrap" style={{ transform: 'rotate(300deg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loding.png" className="pz-slice s6" alt="" />
          </div>
        </div>

        <div className="ld-logo">FORNO<span>.</span></div>
        <div className="ld-bar"><i id="loadBar"></i></div>
        <div id="loadPct">0%</div>
        <div className="ld-note">PREHEATING THE OVENS</div>
      </div>
    </div>
  );
};

export default Loader;
