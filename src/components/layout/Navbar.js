// src/components/layout/Navbar.js
"use client";
import { useState, useEffect } from 'react';
import { subscribeCart } from '@/lib/cartStore';
import { getLang, setLang, toggleLang } from '@/lib/i18n';

export const Navbar = () => {
  const [count, setCount] = useState(0);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    setCurrentLang(getLang());
    const handleLangChange = (e) => {
      setCurrentLang(e.detail || getLang());
    };
    window.addEventListener('forno_lang_change', handleLangChange);

    // إدارة الحالة بمعمارية React حقيقية بدون لمس الدوم
    const unsubscribe = subscribeCart((items) => {
      const total = items.reduce((acc, it) => acc + (it.qty || 1), 0);
      setCount(total);
    });
    return () => {
      unsubscribe();
      window.removeEventListener('forno_lang_change', handleLangChange);
    };
  }, []);

  const handleToggleLang = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const next = toggleLang();
    setCurrentLang(next);
    if (typeof window !== 'undefined' && typeof window.fornoApplyTranslations === 'function') {
      window.fornoApplyTranslations();
    }
  };

  if (typeof window !== 'undefined') {
    window.fornoToggleLang = handleToggleLang;
  }

  const handleScrollTo = (target) => {
    if (typeof window === 'undefined') return;
    const el = document.querySelector(target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0) - 30;
    if (window.__forno_lenis && typeof window.__forno_lenis.scrollTo === 'function') {
      window.__forno_lenis.scrollTo(absoluteTop, { immediate: false, duration: 1.1 });
    } else {
      window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
    }
  };

  return (
    <>
      <header id="nav">
      <div
        className="logo"
        role="button"
        tabIndex={0}
        aria-label="FORNO Pizza Home"
        data-go="#hero"
        style={{ cursor: 'pointer' }}
        onClick={() => handleScrollTo('#hero')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleScrollTo('#hero');
          }
        }}
      >
        FORNO<span>.</span>
      </div>

      <nav className="nav-links">
        <button data-go="#builder" id="navLinkBuild" onClick={() => handleScrollTo('#builder')}>BUILD</button>
        <button data-go="#menu" id="navLinkMenu" onClick={() => handleScrollTo('#menu')}>MENU</button>
        <button data-go="#contact" id="navLinkContact" onClick={() => handleScrollTo('#contact')}>CONTACT</button>
      </nav>

      <div className="nav-acts">
        {/* زر تبديل اللغة الراقي EN / عر */}
        <button id="langToggle" className="nav-lang-btn" type="button" aria-label="Toggle language" onClick={handleToggleLang}>
          <span id="langLabel">{currentLang === 'ar' ? 'EN' : 'عر'}</span>
        </button>

        <button id="savedBtn" aria-label="View saved pizzas" onClick={() => document.body.classList.add('saved-open')}>
          <span id="navSavedText">SAVED</span> <span id="savedCount" className="nav-count-badge">0</span>
        </button>

        <button id="cartBtn" aria-label="View shopping cart" onClick={() => document.body.classList.add('cart-open')}>
          <svg className="cb-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1.6"/>
            <circle cx="19" cy="21" r="1.6"/>
            <path d="M2 2h3l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
          </svg>
          <span className="cb-txt" id="navCartText">CART</span>
          <span id="cartCount" className="nav-count-badge">{count}</span>
        </button>

        <button id="burgerBtn" aria-label="Toggle Navigation Menu" aria-expanded="false" aria-controls="mMenu" onClick={() => document.body.classList.toggle('mm-open')}>
          <i></i><i></i><i></i>
        </button>
      </div>
    </header>

    {/* Mobile Navigation Drawer */}
    <div id="mMenuOverlay" onClick={() => document.body.classList.remove('mm-open')}></div>
    <aside id="mMenu" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
      <div className="m-menu-head">
        <div className="logo" onClick={() => { document.body.classList.remove('mm-open'); handleScrollTo('#hero'); }}>FORNO<span>.</span></div>
        <button id="mMenuClose" aria-label="Close mobile menu" onClick={() => document.body.classList.remove('mm-open')}>✕</button>
      </div>
      
      <div className="m-menu-links">
        <button data-go="#builder" id="mNavLinkBuild" onClick={() => { document.body.classList.remove('mm-open'); handleScrollTo('#builder'); }}>BUILD YOUR PIZZA</button>
        <button data-go="#menu" id="mNavLinkMenu" onClick={() => { document.body.classList.remove('mm-open'); handleScrollTo('#menu'); }}>OUR MENU</button>
        <button data-go="#contact" id="mNavLinkContact" onClick={() => { document.body.classList.remove('mm-open'); handleScrollTo('#contact'); }}>CONTACT US</button>
        <button id="mmSaved" onClick={() => { document.body.classList.remove('mm-open'); document.body.classList.add('saved-open'); }}>
          <span id="mNavSavedText">SAVED PIZZAS</span> <span id="mmSavedCount" className="nav-count-badge">0</span>
        </button>
        <div className="m-lang-row">
          <span className="m-lang-label" id="mLangLabel">{currentLang === 'ar' ? 'اللغة' : 'LANGUAGE'}</span>
          <button type="button" className="nav-lang-btn m-lang-btn" onClick={handleToggleLang}>
            <span id="mLangOpt">{currentLang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </aside>
  </>
);
}
export default Navbar;
