// src/app/page.js
"use client";

import { useEffect } from 'react';
import {
  Loader,
  Navbar,
  Hero,
  Builder,
  Menu,
  Contact,
  Footer,
  CartDrawer,
  SavedDrawer,
  OvenModal,
} from '@/components';
import { initApp } from '@/utils/mainLogic';

export default function Home() {
  useEffect(() => {
    let isMounted = true;
    let appInstance = null;

    if (typeof initApp === 'function') {
      initApp().then((instance) => {
        if (!isMounted) {
          instance?.destroy?.();
        } else {
          appInstance = instance;
        }
      });
    }

    return () => {
      isMounted = false;
      if (appInstance && typeof appInstance.destroy === 'function') {
        appInstance.destroy();
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
      
      <CartDrawer />
      <SavedDrawer />
      <OvenModal />
    </main>
  );
}