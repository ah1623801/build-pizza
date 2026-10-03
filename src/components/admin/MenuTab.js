// src/components/admin/MenuTab.js
"use client";

import { useState, useEffect } from "react";
import { parseBilingual } from "@/lib/i18n";
import { compressImage, formatBytes } from "@/lib/imageCompressor";

export default function MenuTab({
  items,
  categories,
  editingItem,
  formData,
  setFormData,
  imageFile,
  setImageFile,
  submitting,
  onSaveItem,
  onDeleteItem,
  onEditItem,
  onCancelEdit,
}) {
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setCompressionStats(null);
    }
  }, [imageFile]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setCompressionStats(null);
    try {
      // ضغط وتصغير الصورة تلقائياً لسرعة التحميل وتوفير مساحة التخزين بصيغة WebP
      const result = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.82,
      });

      setImageFile(result.file);
      if (result.savedPercent > 0) {
        setCompressionStats({
          original: formatBytes(result.originalSize),
          compressed: formatBytes(result.compressedSize),
          savedPercent: result.savedPercent,
        });
      }
    } catch (err) {
      console.warn("Compression fallback:", err);
      setImageFile(file);
    } finally {
      setCompressing(false);
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Add / Edit Product Form */}
      <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "24px" }}>
        <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
          {editingItem ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
        </h3>
        <form onSubmit={onSaveItem} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
                PRODUCT NAME (ENGLISH) *
              </label>
              <input
                type="text"
                placeholder="e.g. THE TRUFFLE"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name_en: e.target.value,
                    item_id: formData.item_id || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(243,233,220,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "1px", marginBottom: "6px" }}>
                اسم الصنف (بالعربي) 🍕
              </label>
              <input
                type="text"
                placeholder="مثال: ذا ترافل"
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name_ar: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(243,233,220,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
              CATEGORY / نوع الصنف *
            </label>
            <select
              value={formData.categories[0] || categories[0]?.id || "signature"}
              onChange={(e) => {
                const catId = e.target.value;
                const isSimple = ["sides", "drinks", "desserts"].includes(catId);
                setFormData({
                  ...formData,
                  categories: [catId],
                  is_simple: isSimple,
                });
              }}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#18100a",
                border: "1px solid rgba(255, 122, 46, 0.4)",
                borderRadius: "12px",
                color: "#ffb347",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "1px",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {categories.map((c) => {
                const p = parseBilingual(c.name);
                const displayCat = p.ar ? `${p.en} (${p.ar})` : (p.en || c.name);
                return (
                  <option key={c.id} value={c.id} style={{ background: "#140d08", color: "#fff" }}>
                    {displayCat}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Pricing Fields: 3 Sizes if Pizza, Single Price if Simple Item */}
          {!formData.is_simple ? (
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#ff7a2e", marginBottom: "8px", letterSpacing: "1px" }}>
                🍕 أسعار الـ 3 أحجام للبيتزا (PIZZA SIZES PRICING):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                {/* Small Size */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "12px", padding: "10px 12px" }}>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", marginBottom: "4px" }}>
                    حجم صغير SMALL
                  </label>
                  <input
                    type="number"
                    placeholder={formData.price ? String(Math.round(formData.price * 0.85)) : "240"}
                    value={formData.price_small}
                    onChange={(e) => setFormData({ ...formData, price_small: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(243,233,220,0.15)",
                      borderRadius: "8px",
                      color: "#fff",
                      boxSizing: "border-box",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  />
                </div>

                {/* Medium Size (Base) */}
                <div style={{ background: "rgba(255,122,46,0.08)", border: "1px solid #ff7a2e", borderRadius: "12px", padding: "10px 12px" }}>
                  <label style={{ display: "block", fontSize: "10px", color: "#ffb347", fontWeight: "900", marginBottom: "4px" }}>
                    حجم وسط MEDIUM ★
                  </label>
                  <input
                    type="number"
                    placeholder="285"
                    value={formData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = Number(val) || 0;
                      setFormData({
                        ...formData,
                        price: val,
                        price_small: formData.price_small ? formData.price_small : (num ? Math.round(num * 0.85) : ""),
                        price_large: formData.price_large ? formData.price_large : (num ? Math.round(num * 1.25) : ""),
                      });
                    }}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,122,46,0.4)",
                      borderRadius: "8px",
                      color: "#ffb347",
                      boxSizing: "border-box",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  />
                </div>

                {/* Large Size */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "12px", padding: "10px 12px" }}>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", marginBottom: "4px" }}>
                    حجم كبير LARGE
                  </label>
                  <input
                    type="number"
                    placeholder={formData.price ? String(Math.round(formData.price * 1.25)) : "355"}
                    value={formData.price_large}
                    onChange={(e) => setFormData({ ...formData, price_large: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(243,233,220,0.15)",
                      borderRadius: "8px",
                      color: "#fff",
                      boxSizing: "border-box",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
                PRICE (EGP) / السعر
              </label>
              <input
                type="number"
                placeholder="60"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(243,233,220,0.15)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxSizing: "border-box",
                  fontSize: "13px",
                }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
                INGREDIENTS (ENGLISH - COMMA SEPARATED)
              </label>
              <input
                type="text"
                placeholder="Mozzarella, Fresh Basil, Olives"
                value={formData.ingredients_en}
                onChange={(e) => setFormData({ ...formData, ingredients_en: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(243,233,220,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "1px", marginBottom: "6px" }}>
                المكونات (عربي - مفصولة بفواصل)
              </label>
              <input
                type="text"
                placeholder="موتزاريلا، ريحان طازج، زيتون"
                value={formData.ingredients_ar}
                onChange={(e) => setFormData({ ...formData, ingredients_ar: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(243,233,220,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "8px" }}>
              PRODUCT IMAGE
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1.5px dashed rgba(255, 122, 46, 0.45)",
                borderRadius: "16px",
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {compressing ? (
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(255,122,46,0.15)", border: "2px dashed #ff7a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                  ⏳
                </div>
              ) : imageFile ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "2px solid #57a84f", boxShadow: "0 0 15px rgba(87,168,79,0.4)" }}
                />
              ) : formData.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={formData.image_url}
                  alt="Current"
                  style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(243,233,220,0.2)" }}
                />
              ) : (
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(255,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#ffb347" }}>
                  📷
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#f3e9dc", letterSpacing: "1px" }}>
                  {compressing
                    ? "COMPRESSING IMAGE..."
                    : imageFile
                    ? imageFile.name
                    : formData.image_url
                    ? "CHANGE CURRENT IMAGE"
                    : "CLICK TO UPLOAD IMAGE"}
                </div>
                <div style={{ fontSize: "10px", color: "#9a8b7a", marginTop: "3px" }}>
                  {compressing
                    ? "Converting to lightweight WebP..."
                    : " PNG, JPG or WEBP (Recommended 500x500px)"}
                </div>
              </div>

              <span style={{ padding: "8px 16px", borderRadius: "99px", background: "rgba(255,122,46,0.15)", border: "1px solid #ff7a2e", color: "#ffb347", fontSize: "10px", fontWeight: "900", letterSpacing: "1px" }}>
                {compressing ? "..." : "BROWSE"}
              </span>
            </label>

            {/* Compression Feedback Banner */}
        
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: "1 1 auto",
                padding: "14px",
                background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
                color: "#1a0c04",
                border: "none",
                borderRadius: "99px",
                fontWeight: "900",
                fontSize: "10px",
                letterSpacing: "2px",
                cursor: "pointer",
                minWidth: "180px",
              }}
            >
              {submitting ? "SAVING..." : editingItem ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={onCancelEdit}
                style={{
                  flex: "1 1 auto",
                  padding: "14px 20px",
                  background: "none",
                  border: "1px solid rgba(243,233,220,0.2)",
                  color: "#fff",
                  borderRadius: "99px",
                  fontSize: "10px",
                  fontWeight: "800",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Table */}
      <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "24px" }}>
        <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
          EXISTING PRODUCTS ({items.length})
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "500px", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(243, 233, 220, 0.1)", color: "#9a8b7a", fontSize: "9px", letterSpacing: "1px" }}>
                <th style={{ padding: "10px" }}>IMG</th>
                <th style={{ padding: "10px" }}>NAME</th>
                <th style={{ padding: "10px" }}>PRICE</th>
                <th style={{ padding: "10px" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid rgba(243, 233, 220, 0.05)" }}>
                  <td style={{ padding: "10px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image_url || "/ico.webp"}
                      alt=""
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(243,233,220,0.15)" }}
                      onError={(e) => { e.currentTarget.src = "/ico.webp"; }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>
                    {(() => {
                      const p = parseBilingual(it.name);
                      return (
                        <div>
                          <b style={{ fontSize: "12px", color: "#f3e9dc" }}>{p.ar || p.en || it.name}</b>
                          <div style={{ fontSize: "9px", color: "#9a8b7a", marginTop: "2px" }}>{it.categories?.join(", ")}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ fontFamily: "Impact, sans-serif", color: "#e8b04b", fontSize: "16px" }}>
                      EGP {it.size_prices?.med || it.price}
                    </div>
                    {it.size_prices && !it.is_simple && (
                      <div style={{ fontSize: "9px", color: "#ffb347", marginTop: "2px", fontWeight: "700" }}>
                        S: {it.size_prices.small} · M: {it.size_prices.med} · L: {it.size_prices.large}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onEditItem(it)}
                        style={{ padding: "6px 12px", background: "#ff7a2e", color: "#140d08", border: "none", borderRadius: "6px", fontSize: "9px", fontWeight: "800", cursor: "pointer" }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => onDeleteItem(it.id)}
                        style={{ padding: "6px 12px", background: "rgba(194, 43, 26, 0.2)", border: "1px solid rgba(194, 43, 26, 0.4)", color: "#ff8b7a", borderRadius: "6px", fontSize: "9px", fontWeight: "800", cursor: "pointer" }}
                      >
                        DEL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
