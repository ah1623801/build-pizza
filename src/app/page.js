// src/app/page.js
"use client";

import { useEffect, useRef } from 'react';
import { Loader } from '../components/Loader';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Builder } from '../components/Builder';
import { Menu } from '../components/Menu';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/Modals/CartDrawer';
import { SavedDrawer } from '../components/Modals/SavedDrawer';
import { OvenModal } from '../components/Modals/OvenModal';
import { initApp } from '../utils/mainLogic';

export default function Home() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    setTimeout(() => {
      if (typeof initApp === 'function') {
        initApp();
      }
    }, 100);

    return () => {
      if (typeof window !== 'undefined' && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
    };
  }, []);

  return (
    <main>
      <Loader />
      <div id="grain"></div>
      <Navbar />
      <Hero />
      <Builder />
      <Menu />
      <Contact />
      <Footer />
      
      {/* Modals & Drawers */}
      <CartDrawer />
      <SavedDrawer />
      <OvenModal />
    </main>
  );
}