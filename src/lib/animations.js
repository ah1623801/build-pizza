// src/lib/animations.js
"use client";

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

let isInitialized = false;

export function initAnimations() {
  if (typeof window === 'undefined') return { gsap, ScrollTrigger, Lenis };

  if (!isInitialized) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    window.gsap = gsap;
    window.ScrollTrigger = ScrollTrigger;
    window.Lenis = Lenis;

    isInitialized = true;
  }

  return { gsap, ScrollTrigger, Lenis };
}

// Ensure window globals exist on client execution
if (typeof window !== 'undefined') {
  initAnimations();
}

export { gsap, ScrollTrigger, Lenis };
export default initAnimations;
