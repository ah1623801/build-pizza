// src/components/layout/Loader.js
"use client";

import { useEffect } from 'react';

export const Loader = () => {
  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 14) + 6;
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
    }, 70);

    // Hard fallback: never allow loader to block screen for more than 2.2 seconds
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
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, []);
  const renderSlice = (keyClass, rotation) => (
    <g key={keyClass} className={`pz-slice ${keyClass}`} transform={`rotate(${rotation} 100 100)`}>
      {/* 1. طبقة العجينة والكرست الذهبي */}
      <path d="M 100 100 L 63.2 33.5 A 76 76 0 0 1 136.8 33.5 Z" fill="#d49b57" />
      <path d="M 62 33.5 A 76 76 0 0 1 138 33.5" stroke="url(#crustGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="85" cy="27" r="2" fill="#5c2605" opacity="0.75" />
      <circle cx="115" cy="27.5" r="1.8" fill="#5c2605" opacity="0.75" />

      {/* 2. طبقة صلصة الطماطم الحمراء */}
      <path d="M 100 100 L 68.2 37.6 A 70 70 0 0 1 131.8 37.6 Z" fill="#b02412" />

      {/* 3. طبقة الجبنة الموتزاريلا السايحة */}
      <path d="M 100 100 L 72.1 40.2 A 66 66 0 0 1 127.9 40.2 Z" fill="url(#cheeseGrad)" />
      <circle cx="104" cy="62" r="2.2" fill="#fff3b0" />

      {/* 4. إضافات البيبروني والريحان الطازج */}
      <g className="slice-toppings">
        {/* بيبروني علوي */}
        <circle cx="100" cy="50" r="7.5" fill="#a81c07" stroke="#6e1003" strokeWidth="1.2" />
        <circle cx="98" cy="48" r="1.4" fill="#f0b39c" />
        <circle cx="102" cy="52" r="1" fill="#f0b39c" />

        {/* بيبروني سفلي */}
        <circle cx="91" cy="72" r="6" fill="#a81c07" stroke="#6e1003" strokeWidth="1.2" />
        <circle cx="89" cy="71" r="1" fill="#f0b39c" />

        {/* ورقة ريحان طازجة */}
        <path d="M 107 72 C 113 67 116 77 110 81 C 105 78 104 71 107 72 Z" fill="#2d7a1e" />
      </g>
    </g>
  );

  return (
    <div id="loader">
      <div className="ld-in">
        <div className="ld-pizza-wrap">
          <svg className="ld-pizza-svg" viewBox="0 0 200 200" width="160" height="160">
            <defs>
              {/* ألوان العجينة المشوية في فرن الحطب */}
              <linearGradient id="crustGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8a4716" />
                <stop offset="50%" stopColor="#e29e57" />
                <stop offset="100%" stopColor="#8a4716" />
              </linearGradient>

              {/* ألوان الجبنة الموتزاريلا الذائبة */}
              <radialGradient id="cheeseGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="55%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#e07a12" />
              </radialGradient>
            </defs>

            {/* بخار يتصاعد بنعومة فوق البيتزا الساخنة عند اكتمالها */}
            <g className="pizza-steam-loader">
              <path d="M 88 18 Q 82 9 88 2" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 100 20 Q 106 10 100 3" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 112 18 Q 106 9 112 2" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* الشرائح الست التي تتجمع وتتراص واحدة تلو الأخرى لتشكيل بيتزا دائرية كاملة */}
            {renderSlice('s1', 0)}
            {renderSlice('s2', 60)}
            {renderSlice('s3', 120)}
            {renderSlice('s4', 180)}
            {renderSlice('s5', 240)}
            {renderSlice('s6', 300)}
          </svg>
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
