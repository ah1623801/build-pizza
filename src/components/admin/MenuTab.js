// src/components/admin/MenuTab.js
"use client";

import { parseBilingual } from "@/lib/i18n";

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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
                PRICE (EGP)
              </label>
              <input
                type="number"
                placeholder="290"
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
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
                CATEGORY
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
          </div>

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
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ display: "none" }}
              />
              {imageFile ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "2px solid #ff7a2e", boxShadow: "0 0 15px rgba(255,122,46,0.4)" }}
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
                  {imageFile ? imageFile.name : formData.image_url ? "CHANGE CURRENT IMAGE" : "CLICK TO UPLOAD IMAGE"}
                </div>
                <div style={{ fontSize: "10px", color: "#9a8b7a", marginTop: "3px" }}>
                  PNG, JPG or WEBP (Recommended 500x500px)
                </div>
              </div>

              <span style={{ padding: "8px 16px", borderRadius: "99px", background: "rgba(255,122,46,0.15)", border: "1px solid #ff7a2e", color: "#ffb347", fontSize: "10px", fontWeight: "900", letterSpacing: "1px" }}>
                BROWSE
              </span>
            </label>
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
                    {it.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={it.image_url} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "9px", color: "#9a8b7a" }}>NO IMG</span>
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {(() => {
                      const p = parseBilingual(it.name);
                      return (
                        <div>
                          <b style={{ fontSize: "12px", color: "#f3e9dc" }}>{p.en || it.name}</b>
                          {p.ar && <div style={{ fontSize: "11px", color: "#ffb347", fontWeight: "700" }}>{p.ar}</div>}
                          <div style={{ fontSize: "9px", color: "#9a8b7a", marginTop: "2px" }}>{it.categories?.join(", ")}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "10px", fontFamily: "Impact, sans-serif", color: "#e8b04b", fontSize: "16px" }}>EGP {it.price}</td>
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
