// src/app/error.js
"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log unexpected runtime error to monitoring if needed
    console.error('FORNO Kitchen Error Caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1f120a 0%, #0a0705 100%)',
      color: '#f3e9dc',
      textAlign: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div style={{
        fontSize: '80px',
        lineHeight: 1,
        marginBottom: '16px',
        filter: 'drop-shadow(0 10px 25px rgba(194,43,26,0.4))',
      }}>
        🔥
      </div>

      <span style={{
        display: 'inline-block',
        fontSize: '11px',
        letterSpacing: '3px',
        color: '#c22b1a',
        fontWeight: '800',
        border: '1px solid rgba(194,43,26,0.4)',
        padding: '6px 16px',
        borderRadius: '99px',
        marginBottom: '18px',
        textTransform: 'uppercase',
      }}>
        KITCHEN MALFUNCTION
      </span>

      <h1 style={{
        fontFamily: 'var(--disp, sans-serif)',
        fontSize: 'clamp(32px, 7vw, 56px)',
        fontWeight: '400',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '14px',
        lineHeight: 1.1,
      }}>
        THE OVEN GOT A BIT <br />
        <span style={{ color: '#ff7a2e' }}>TOO HOT.</span>
      </h1>

      <p style={{
        fontSize: '15px',
        color: '#9a8b7a',
        maxWidth: '460px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Something went wrong while rendering this page. Our chefs have been notified.
        <br />
        حدث خطأ تقني غير متوقع. يرجى إعادة المحاولة.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            background: 'linear-gradient(135deg, #ff7a2e, #e05a12)',
            color: '#1a0c04',
            padding: '16px 32px',
            borderRadius: '99px',
            fontWeight: '800',
            fontSize: '12px',
            letterSpacing: '2px',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(255,110,40,0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔄</span> TRY AGAIN / إعادة المحاولة
        </button>
        <Link
          href="/"
          style={{
            border: '1px solid rgba(243,233,220,0.2)',
            color: '#f3e9dc',
            padding: '16px 32px',
            borderRadius: '99px',
            fontWeight: '800',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🏠</span> HOME PAGE
        </Link>
      </div>
    </div>
  );
}
