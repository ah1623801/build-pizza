// src/components/admin/ReceiptModal.js
"use client";

export default function ReceiptModal({ receiptUrl, onClose }) {
  if (!receiptUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#140d08",
          border: "1px solid #ff7a2e",
          borderRadius: "16px",
          padding: "20px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <b style={{ color: "#ffb347", fontSize: "14px", letterSpacing: "1px" }}>PAYMENT RECEIPT</b>
          <button 
            onClick={onClose}
            aria-label="Close Receipt Modal"
            style={{ background: "none", border: "none", color: "#ff8b7a", fontSize: "18px", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={receiptUrl} 
          alt="Payment Receipt" 
          style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }} 
        />
        <a 
          href={receiptUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: "14px", color: "#e8b04b", fontSize: "11px", fontWeight: "bold", textDecoration: "none" }}
        >
          ↗ OPEN FULL IMAGE IN NEW TAB
        </a>
      </div>
    </div>
  );
}
