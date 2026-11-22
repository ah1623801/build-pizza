// src/config/site.js
/**
 * FORNO Pizza - Central Site Configuration
 * Use this file to update store contact info, payment details, and metadata easily.
 */

export const siteConfig = {
  name: "FORNO",
  fullName: "FORNO Wood-Fired Pizza Kitchen",
  tagline: "Your Pizza. Your Rules.",
  description: "Custom Wood-Fired Pizza Kitchen — Build your own pizza, watch it bake in our 3D oven, and order directly online.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://forno.pizza",

  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@forno.co",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+20 100 123 4567",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201001234567",
    location: "Cairo, Egypt",
  },

  // Payment Accounts for Cashless / InstaPay transfers
  payment: {
    vodafoneCash: process.env.NEXT_PUBLIC_VODAFONE_CASH || "01001234567",
    instaPay: process.env.NEXT_PUBLIC_INSTAPAY_ID || "forno@instapay",
  },

  // Social Links
  social: {
    instagram: "https://instagram.com/forno.pizza",
    facebook: "https://facebook.com/forno.pizza",
  },

  // Year helper
  get year() {
    return new Date().getFullYear();
  },
};

export default siteConfig;
