// src/components/Loader.js
export const Loader = () => (
  <div id="loader">
    <div className="ld-in">
      <div className="ld-slice-card">
        <svg className="ld-slice-svg" viewBox="0 0 120 130" width="130" height="140">
          <defs>
            {/* ألوان العجينة المشوية */}
            <linearGradient id="crustGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8a4716" />
              <stop offset="50%" stopColor="#d89650" />
              <stop offset="100%" stopColor="#8a4716" />
            </linearGradient>

            {/* ألوان الجبنة السايحة */}
            <radialGradient id="cheeseGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="60%" stopColor="#ffb347" />
              <stop offset="100%" stopColor="#e07a12" />
            </radialGradient>
          </defs>

          {/* بخار طالع من الشريحة */}
          <g className="slice-steam">
            <path d="M 50 15 Q 46 8 50 2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 60 18 Q 64 10 60 3" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 70 16 Q 66 9 70 2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          {/* 1. الطبقة الأولى: العجينة والكرست الذهبي */}
          <g className="layer-dough">
            <path d="M 20 30 Q 60 14 100 30 L 60 120 Z" fill="#d49b57" />
            {/* حرف الكرست السميك */}
            <path d="M 18 30 Q 60 12 102 30" stroke="url(#crustGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* فقاقيع تحمير الفرن */}
            <circle cx="36" cy="24" r="2.5" fill="#5c2605" opacity="0.7" />
            <circle cx="62" cy="20" r="3" fill="#5c2605" opacity="0.6" />
            <circle cx="84" cy="24" r="2" fill="#5c2605" opacity="0.8" />
          </g>

          {/* 2. الطبقة الثانية: صلصة الطماطم الحمراء */}
          <g className="layer-sauce">
            <path d="M 25 34 Q 60 22 95 34 L 60 114 Z" fill="#b02412" />
          </g>

          {/* 3. الطبقة الثالثة: الجبنة الموتزاريلا السايحة مع سيلان على الحواف */}
          <g className="layer-cheese">
            <path d="M 26 36 Q 60 25 94 36 L 82 66 Q 78 72 74 65 L 60 110 L 46 66 Q 42 74 38 65 Z" fill="url(#cheeseGrad)" />
            {/* قطرات جبنة بتسيل */}
            <circle cx="76" cy="69" r="2.5" fill="#ffb347" />
            <circle cx="40" cy="71" r="2" fill="#ffb347" />
          </g>

          {/* 4. الطبقة الرابعة: البيبروني والريحان */}
          <g className="layer-toppings">
            {/* بيبروني 1 */}
            <g className="top-item p1">
              <circle cx="60" cy="44" r="8" fill="#a81c07" stroke="#6e1003" strokeWidth="1.5" />
              <circle cx="58" cy="42" r="1.5" fill="#f0b39c" />
              <circle cx="62" cy="46" r="1.2" fill="#f0b39c" />
            </g>
            {/* بيبروني 2 */}
            <g className="top-item p2">
              <circle cx="48" cy="66" r="7.5" fill="#a81c07" stroke="#6e1003" strokeWidth="1.5" />
              <circle cx="46" cy="64" r="1.2" fill="#f0b39c" />
            </g>
            {/* بيبروني 3 */}
            <g className="top-item p3">
              <circle cx="72" cy="66" r="7.5" fill="#a81c07" stroke="#6e1003" strokeWidth="1.5" />
              <circle cx="74" cy="68" r="1.2" fill="#f0b39c" />
            </g>
            {/* أوراق ريحان خضراء طازة */}
            <path className="top-item b1" d="M 58 78 C 65 74 67 85 60 88 C 55 85 54 75 58 78 Z" fill="#2d7a1e" />
            <path className="top-item b2" d="M 40 48 C 45 44 48 52 42 55 C 38 52 37 46 40 48 Z" fill="#3a8f2a" />
          </g>
        </svg>
      </div>

      <div className="ld-logo">FORNO<span>.</span></div>
      <div className="ld-bar"><i id="loadBar"></i></div>
      <div id="loadPct">0%</div>
      <div className="ld-note">PREHEATING THE OVENS</div>
    </div>
  </div>
);