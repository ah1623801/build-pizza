// src/app/not-found.js
import Link from 'next/link';

export const metadata = {
  title: '404 — Slice Not Found | FORNO',
  description: 'This page was eaten or does not exist.',
};

export default function NotFound() {
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
      overflow: 'hidden',
    }}>
      {/* Glow background effect */}
      <div style={{
        position: 'absolute',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(255,122,46,0.18) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: '90px',
        lineHeight: 1,
        marginBottom: '16px',
        filter: 'drop-shadow(0 10px 25px rgba(255,122,46,0.3))',
      }}>
        🍕
      </div>

      <span style={{
        display: 'inline-block',
        fontSize: '11px',
        letterSpacing: '3px',
        color: '#ff7a2e',
        fontWeight: '800',
        border: '1px solid rgba(255,122,46,0.4)',
        padding: '6px 16px',
        borderRadius: '99px',
        marginBottom: '18px',
        textTransform: 'uppercase',
      }}>
        404 · PIZZA SLICE NOT FOUND
      </span>

      <h1 style={{
        fontFamily: 'var(--disp, sans-serif)',
        fontSize: 'clamp(36px, 8vw, 68px)',
        fontWeight: '400',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '14px',
        lineHeight: 1.1,
      }}>
        LOOKS LIKE THIS SLICE <br />
        <span style={{ color: '#ff7a2e' }}>GOT EATEN.</span>
      </h1>

      <p style={{
        fontSize: '15px',
        color: '#9a8b7a',
        maxWidth: '460px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        The page you are looking for has been burnt to a crisp or never existed in our oven.
        <br />
        الصفحة التي تبحث عنها غير موجودة أو انتهت صلاحيتها.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg, #ff7a2e, #e05a12)',
            color: '#1a0c04',
            padding: '16px 32px',
            borderRadius: '99px',
            fontWeight: '800',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(255,110,40,0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔥</span> BACK TO KITCHEN
        </Link>
        <Link
          href="/#builder"
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
          <span>🍕</span> BUILD A PIZZA
        </Link>
      </div>
    </div>
  );
}
