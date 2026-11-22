// src/components/admin/CouponsTab.js
"use client";

// تم تعليق جزء الكوبونات بالكامل (ctrl + ظ)
/*
import { useState } from "react";

export default function CouponsTab({
  coupons = [],
  onRefresh,
  loading = false,
}) {
  const [filterType, setFilterType] = useState("all");
 // all | percent | fixed | active
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    originalCode: "",
    type: "percent", // 'percent' | 'fixed'
    value: 10,
    minSubtotal: 0,
    maxDiscount: 0,
    active: true,
    descEn: "",
    descAr: "",
  });

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 4500);
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      originalCode: "",
      type: "percent",
      value: 15,
      minSubtotal: 0,
      maxDiscount: 0,
      active: true,
      descEn: "15% discount applied to your order!",
      descAr: "تم تطبيق خصم 15% على طلبك!",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || "",
      originalCode: c.code || "",
      type: c.type === "fixed" ? "fixed" : "percent",
      value: c.value || 0,
      minSubtotal: c.minSubtotal || 0,
      maxDiscount: c.maxDiscount || 0,
      active: c.active !== false,
      descEn: c.description?.en || "",
      descAr: c.description?.ar || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert("يرجى إدخال كود الخصم");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        action: "save",
        code: formData.code.trim().toUpperCase(),
        originalCode: formData.originalCode || null,
        type: formData.type,
        value: Number(formData.value) || 0,
        minSubtotal: Number(formData.minSubtotal) || 0,
        maxDiscount: formData.type === "percent" ? Number(formData.maxDiscount) || 0 : 0,
        active: formData.active,
        description: {
          en: formData.descEn.trim(),
          ar: formData.descAr.trim(),
        },
      };

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showMsg(`✓ تم حفظ كود الخصم ${payload.code} بنجاح!`);
        handleCloseModal();
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "فشل في حفظ الكود");
      }
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الكود: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (code) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMsg(`✓ تم تحديث حالة الكود ${code}`);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "فشل في تغيير حالة الكود");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!confirm(`هل أنت متأكد من حذف كود الخصم ${code} نهائياً؟`)) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMsg(`✓ تم حذف كود الخصم ${code}`);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "فشل في حذف الكود");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("هل أنت متأكد من استعادة أكواد الخصم الافتراضية للسيستم؟")) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMsg("✓ تمت استعادة الكوبونات الافتراضية بنجاح");
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "فشل في الاستعادة");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Filtered List
  const filteredCoupons = (coupons || []).filter((c) => {
    if (filterType === "percent" && c.type !== "percent") return false;
    if (filterType === "fixed" && c.type !== "fixed") return false;
    if (filterType === "active" && c.active === false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = (c.code || "").toLowerCase().includes(q);
      const enMatch = (c.description?.en || "").toLowerCase().includes(q);
      const arMatch = (c.description?.ar || "").toLowerCase().includes(q);
      if (!codeMatch && !enMatch && !arMatch) return false;
    }
    return true;
  });

  const activeCount = (coupons || []).filter((c) => c.active !== false).length;
  const percentCount = (coupons || []).filter((c) => c.type === "percent").length;
  const fixedCount = (coupons || []).filter((c) => c.type === "fixed").length;

  return (
    <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "26px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "24px", color: "#e8b04b", letterSpacing: "1px", margin: 0 }}>
              PROMO CODES & COUPONS 🎟️
            </h3>
            <span style={{ background: "rgba(255, 122, 46, 0.15)", border: "1px solid #ff7a2e", color: "#ffb347", fontSize: "11px", fontWeight: "900", padding: "3px 10px", borderRadius: "99px" }}>
              {coupons.length} TOTAL
            </span>
          </div>
          <p style={{ color: "#9a8b7a", fontSize: "11px", margin: "6px 0 0", maxWidth: "600px", lineHeight: "1.5" }}>
            إدارة أكواد الخصم بالكامل: يمكنك تحديد الخصم <b>كنسبة مئوية (%)</b> أو <b>مبلغ نقدي محدد (EGP)</b>، وتعيين الحد الأدنى للطلب، وإيقاف أو تفعيل أي كود بضغطة زر.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleResetDefaults}
            style={{
              background: "rgba(243, 233, 220, 0.05)",
              border: "1px solid rgba(243, 233, 220, 0.15)",
              color: "#9a8b7a",
              padding: "10px 18px",
              borderRadius: "99px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "11px",
              letterSpacing: "1px",
            }}
            title="استعادة الأكواد الافتراضية"
          >
            RESTORE DEFAULTS
          </button>
          <button
            onClick={handleOpenAdd}
            style={{
              background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
              color: "#1a0c04",
              border: "none",
              padding: "11px 24px",
              borderRadius: "99px",
              fontWeight: "900",
              cursor: "pointer",
              fontSize: "12px",
              letterSpacing: "1px",
              boxShadow: "0 8px 24px rgba(255, 122, 46, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>+</span>
            <span>CREATE NEW COUPON</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: "12px 18px", background: "rgba(87, 168, 79, 0.15)", border: "1px solid #57a84f", borderRadius: "12px", marginBottom: "20px", color: "#7cc46a", fontWeight: "bold", fontSize: "13px" }}>
          {actionMsg}
        </div>
      )}

      {/* Summary KPI Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", marginBottom: "22px" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(243, 233, 220, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "1px", fontWeight: "800" }}>ACTIVE PROMOS</div>
          <div style={{ fontSize: "20px", fontFamily: "Impact, sans-serif", color: "#7cc46a", marginTop: "4px" }}>
            {activeCount} <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#9a8b7a" }}>of {coupons.length}</span>
          </div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(243, 233, 220, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "1px", fontWeight: "800" }}>PERCENTAGE (%) CODES</div>
          <div style={{ fontSize: "20px", fontFamily: "Impact, sans-serif", color: "#ffb347", marginTop: "4px" }}>
            {percentCount}
          </div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(243, 233, 220, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "1px", fontWeight: "800" }}>FIXED AMOUNT (EGP)</div>
          <div style={{ fontSize: "20px", fontFamily: "Impact, sans-serif", color: "#ff7a2e", marginTop: "4px" }}>
            {fixedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "22px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `ALL (${coupons.length})` },
            { id: "active", label: `ACTIVE (${activeCount})` },
            { id: "percent", label: `PERCENT % (${percentCount})` },
            { id: "fixed", label: `FIXED EGP (${fixedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "99px",
                border: "1px solid " + (filterType === tab.id ? "#ff7a2e" : "rgba(243,233,220,0.12)"),
                background: filterType === tab.id ? "rgba(255, 122, 46, 0.15)" : "transparent",
                color: filterType === tab.id ? "#ffb347" : "#9a8b7a",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by code or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(243, 233, 220, 0.12)",
            borderRadius: "99px",
            padding: "8px 16px",
            color: "#f3e9dc",
            fontSize: "11px",
            outline: "none",
            minWidth: "220px",
          }}
        />
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#9a8b7a", background: "rgba(255,255,255,0.01)", borderRadius: "16px", border: "1px dashed rgba(243,233,220,0.08)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎟️</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#f3e9dc" }}>No coupons found</div>
          <p style={{ fontSize: "11px", margin: "6px 0 16px" }}>No coupons match your filter or search query.</p>
          <button
            onClick={handleOpenAdd}
            style={{
              background: "#ff7a2e",
              color: "#140d08",
              border: "none",
              padding: "9px 20px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            CREATE FIRST COUPON
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredCoupons.map((c) => {
            const isPercent = c.type === "percent";
            const isActive = c.active !== false;

            return (
              <div
                key={c.code}
                style={{
                  background: isActive ? "rgba(255, 255, 255, 0.025)" : "rgba(255, 255, 255, 0.008)",
                  border: "1px solid " + (isActive ? "rgba(243, 233, 220, 0.12)" : "rgba(255, 255, 255, 0.04)"),
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  opacity: isActive ? 1 : 0.65,
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  {/* Top Bar: Code + Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontFamily: "Impact, sans-serif",
                          fontSize: "20px",
                          letterSpacing: "1.5px",
                          color: "#ffb347",
                          background: "rgba(255, 179, 71, 0.1)",
                          padding: "4px 12px",
                          borderRadius: "8px",
                          border: "1px dashed rgba(255, 179, 71, 0.35)",
                        }}
                      >
                        {c.code}
                      </span>
                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(c.code);
                            alert(`تم نسخ الكود: ${c.code}`);
                          }
                        }}
                        style={{ background: "none", border: "none", color: "#9a8b7a", cursor: "pointer", fontSize: "14px", padding: "2px" }}
                        title="Copy code"
                      >
                        📋
                      </button>
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "900",
                        padding: "3px 10px",
                        borderRadius: "99px",
                        background: isActive ? "rgba(87, 168, 79, 0.18)" : "rgba(194, 43, 26, 0.18)",
                        color: isActive ? "#7cc46a" : "#ff8b7a",
                        border: "1px solid " + (isActive ? "#57a84f" : "#c22b1a"),
                      }}
                    >
                      {isActive ? "ACTIVE 🟢" : "PAUSED ⏸️"}
                    </span>
                  </div>

                  {/* Value Banner */}
                  <div
                    style={{
                      background: isPercent ? "rgba(232, 176, 75, 0.08)" : "rgba(255, 122, 46, 0.08)",
                      border: "1px solid " + (isPercent ? "rgba(232, 176, 75, 0.2)" : "rgba(255, 122, 46, 0.2)"),
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "10px", color: "#9a8b7a", fontWeight: "800", textTransform: "uppercase" }}>
                        {isPercent ? "PERCENTAGE DISCOUNT" : "FIXED CASH DISCOUNT"}
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "900", color: isPercent ? "#e8b04b" : "#ff7a2e", fontFamily: "Impact, sans-serif", letterSpacing: "1px" }}>
                        {isPercent ? `${c.value}% OFF` : `EGP ${c.value} OFF`}
                      </div>
                    </div>

                    {isPercent && c.maxDiscount > 0 ? (
                      <div style={{ textAlign: "right", fontSize: "10px", color: "#9a8b7a" }}>
                        <div>MAX CAP:</div>
                        <b style={{ color: "#ffb347" }}>EGP {c.maxDiscount}</b>
                      </div>
                    ) : null}
                  </div>

                  {/* Min Subtotal Rule */}
                  <div style={{ fontSize: "11px", marginBottom: "10px", color: "#c5b7a7", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🛒</span>
                    <span>
                      {c.minSubtotal > 0 ? (
                        <>
                          Min order: <b style={{ color: "#ffb347" }}>EGP {c.minSubtotal}</b>
                        </>
                      ) : (
                        <span style={{ color: "#7cc46a" }}>No minimum order required</span>
                      )}
                    </span>
                  </div>

                  {/* Description Box */}
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", fontSize: "11px", lineHeight: "1.4" }}>
                    {c.description?.ar && (
                      <div style={{ color: "#f3e9dc", direction: "rtl", textAlign: "right", marginBottom: "4px" }}>
                        {c.description.ar}
                      </div>
                    )}
                    {c.description?.en && (
                      <div style={{ color: "#9a8b7a", fontSize: "10.5px" }}>
                        {c.description.en}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "rgba(255, 179, 71, 0.12)",
                      border: "1px solid rgba(255, 179, 71, 0.3)",
                      color: "#ffb347",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ EDIT
                  </button>

                  <button
                    onClick={() => handleToggleCoupon(c.code)}
                    style={{
                      padding: "8px 12px",
                      background: isActive ? "rgba(194, 43, 26, 0.15)" : "rgba(87, 168, 79, 0.15)",
                      border: "1px solid " + (isActive ? "#c22b1a" : "#57a84f"),
                      color: isActive ? "#ff8b7a" : "#7cc46a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                    title={isActive ? "تعطيل الكود مؤقتاً" : "تفعيل الكود"}
                  >
                    {isActive ? "PAUSE ⏸️" : "ACTIVATE 🟢"}
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    style={{
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#9a8b7a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                    title="حذف الكود"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#160f0a",
              border: "1px solid rgba(255, 122, 46, 0.3)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255,122,46,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#ffb347", letterSpacing: "1px", margin: 0 }}>
                {editingCoupon ? `EDIT COUPON #${editingCoupon.code}` : "CREATE NEW PROMO CODE 🎟️"}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{ background: "none", border: "none", color: "#9a8b7a", fontSize: "20px", cursor: "pointer", padding: "4px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Coupon Code Input */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  COUPON CODE (كود الخصم) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25, FORNO20, WELCOME50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255, 179, 71, 0.3)",
                    borderRadius: "10px",
                    color: "#ffb347",
                    fontSize: "15px",
                    fontFamily: "Impact, sans-serif",
                    letterSpacing: "1.5px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* DISCOUNT TYPE SWITCHER: % vs Fixed (EGP) */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  DISCOUNT TYPE (نوع الخصم: نسبة مئوية ولا رقم معين؟) *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: "percent",
                        value: formData.type === "fixed" ? 15 : formData.value,
                        descEn: formData.descEn || "15% discount applied to your order!",
                        descAr: formData.descAr || "تم تطبيق خصم 15% على طلبك!",
                      });
                    }}
                    style={{
                      padding: "14px 10px",
                      borderRadius: "12px",
                      border: "2px solid " + (formData.type === "percent" ? "#ff7a2e" : "rgba(255,255,255,0.1)"),
                      background: formData.type === "percent" ? "rgba(255, 122, 46, 0.2)" : "rgba(255,255,255,0.02)",
                      color: formData.type === "percent" ? "#ffb347" : "#9a8b7a",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>%</span>
                    <b style={{ fontSize: "12px" }}>PERCENTAGE (%)</b>
                    <span style={{ fontSize: "10px", opacity: 0.8 }}>خصم نسبة مئوية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        type: "fixed",
                        value: formData.type === "percent" ? 50 : formData.value,
                        descEn: formData.descEn || "50 EGP discount applied!",
                        descAr: formData.descAr || "تم تطبيق خصم 50 ج.م على طلبك!",
                      });
                    }}
                    style={{
                      padding: "14px 10px",
                      borderRadius: "12px",
                      border: "2px solid " + (formData.type === "fixed" ? "#57a84f" : "rgba(255,255,255,0.1)"),
                      background: formData.type === "fixed" ? "rgba(87, 168, 79, 0.2)" : "rgba(255,255,255,0.02)",
                      color: formData.type === "fixed" ? "#7cc46a" : "#9a8b7a",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>💵</span>
                    <b style={{ fontSize: "12px" }}>FIXED AMOUNT (EGP)</b>
                    <span style={{ fontSize: "10px", opacity: 0.8 }}>رقم محدد / مبلغ ثابت</span>
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  {formData.type === "percent" ? "DISCOUNT PERCENTAGE (% من 1 إلى 100) *" : "FIXED DISCOUNT AMOUNT (مبلغ الخصم بالجنية) *"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min={1}
                    max={formData.type === "percent" ? 100 : 10000}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(243, 233, 220, 0.2)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "bold",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ position: "absolute", right: "14px", top: "12px", color: "#ffb347", fontWeight: "bold", fontSize: "13px" }}>
                    {formData.type === "percent" ? "%" : "EGP"}
                  </span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#9a8b7a", marginTop: "4px" }}>
                  {formData.type === "percent"
                    ? `مثال: لو العميل طلبه بـ 300 ج.م، هيتخصم منه ${Math.round((300 * (Number(formData.value) || 0)) / 100)} ج.م`
                    : `مثال: سيتم خصم ${formData.value || 0} ج.م مباشرة من إجمالي الفاتورة`}
                </div>
              </div>

              {/* Optional Max Cap for Percentage */}
              {formData.type === "percent" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                    MAX DISCOUNT CAP (أقصى قيمة للخصم بالجنية - اختياري)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 = بدون حد أقصى"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(243, 233, 220, 0.2)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ fontSize: "10.5px", color: "#9a8b7a", marginTop: "4px" }}>
                    اتركها 0 إن كنت لا تريد سقفاً للخصم، أو حدد مثلاً 100 ج.م كحد أقصى للخصم.
                  </div>
                </div>
              )}

              {/* Minimum Subtotal */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  MINIMUM ORDER SUBTOTAL (الحد الأدنى للطلب بالجنية)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0 = بدون حد أدنى"
                  value={formData.minSubtotal}
                  onChange={(e) => setFormData({ ...formData, minSubtotal: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(243, 233, 220, 0.2)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: "10.5px", color: "#9a8b7a", marginTop: "4px" }}>
                  ضع 0 إذا كان الكوبون صالحاً لأي مبلغ، أو حدد مثلاً 200 ج.م ليُرفض الكوبون إذا كانت السلة أقل من ذلك.
                </div>
              </div>

              {/* Arabic Description */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  ARABIC MESSAGE (رسالة الخصم بالعربية للعميل)
                </label>
                <input
                  type="text"
                  placeholder="تم تطبيق خصم 20% على طلبك!"
                  value={formData.descAr}
                  onChange={(e) => setFormData({ ...formData, descAr: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(243, 233, 220, 0.2)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    direction: "rtl",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* English Description */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#e8b04b", marginBottom: "6px", letterSpacing: "1px" }}>
                  ENGLISH MESSAGE (رسالة الخصم بالإنجليزية)
                </label>
                <input
                  type="text"
                  placeholder="20% discount applied to your order!"
                  value={formData.descEn}
                  onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(243, 233, 220, 0.2)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Active Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  userSelect: "none",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#57a84f", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: formData.active ? "#7cc46a" : "#ff8b7a" }}>
                    {formData.active ? "COUPON IS ACTIVE (الكوبون نشط ويعمل)" : "COUPON IS DISABLED (الكوبون معطل وموقوف)"}
                  </div>
                  <div style={{ fontSize: "10px", color: "#9a8b7a" }}>
                    يمكنك إيقاف الكوبون مؤقتاً في أي وقت دون حذفه.
                  </div>
                </div>
              </label>

              {/* Modal Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#9a8b7a",
                    borderRadius: "12px",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  CANCEL (إلغاء)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: "14px",
                    background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
                    border: "none",
                    color: "#140d08",
                    borderRadius: "12px",
                    fontWeight: "900",
                    fontSize: "13px",
                    letterSpacing: "1px",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(255, 122, 46, 0.4)",
                  }}
                >
                  {saving ? "SAVING..." : editingCoupon ? "UPDATE COUPON ✓" : "CREATE COUPON ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
*/

export default function CouponsTab() {
  return null;
}
