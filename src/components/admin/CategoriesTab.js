// src/components/admin/CategoriesTab.js
"use client";

import { parseBilingual } from "@/lib/i18n";

export default function CategoriesTab({
  categories,
  editingCat,
  newCat,
  setNewCat,
  onSaveCategory,
  onDeleteCategory,
  onEditCategory,
  onCancelEdit,
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
      {/* Category Form */}
      <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "24px" }}>
        <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
          {editingCat ? "EDIT CATEGORY" : "ADD CATEGORY"}
        </h3>
        <form onSubmit={onSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
              CATEGORY NAME (ENGLISH) *
            </label>
            <input
              type="text"
              placeholder="e.g. SPECIALS"
              value={newCat.name_en}
              onChange={(e) =>
                setNewCat({
                  ...newCat,
                  name_en: e.target.value,
                  id: editingCat ? newCat.id : e.target.value.toLowerCase().replace(/\s+/g, "-"),
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
              اسم التصنيف (بالعربي) 🍕
            </label>
            <input
              type="text"
              placeholder="مثال: المميزة"
              value={newCat.name_ar}
              onChange={(e) =>
                setNewCat({
                  ...newCat,
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
          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
              SLUG ID
            </label>
            <input
              type="text"
              placeholder="ID (e.g. specials)"
              value={newCat.id}
              onChange={(e) => setNewCat({ ...newCat, id: e.target.value })}
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
            <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>
              SORT ORDER
            </label>
            <input
              type="number"
              placeholder="ORDER (e.g. 1)"
              value={newCat.sort_order}
              onChange={(e) => setNewCat({ ...newCat, sort_order: Number(e.target.value) })}
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "14px",
                background: "#ff7a2e",
                color: "#140d08",
                border: "none",
                borderRadius: "99px",
                fontWeight: "900",
                cursor: "pointer",
                fontSize: "10px",
                letterSpacing: "2px",
              }}
            >
              {editingCat ? "UPDATE CATEGORY" : "ADD CATEGORY"}
            </button>
            {editingCat && (
              <button
                type="button"
                onClick={onCancelEdit}
                style={{
                  padding: "14px 20px",
                  background: "none",
                  border: "1px solid rgba(243,233,220,0.2)",
                  color: "#fff",
                  borderRadius: "99px",
                  fontSize: "10px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "24px" }}>
        <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
          CATEGORIES LIST ({categories.length})
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {categories.map((c) => (
            <li
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid rgba(243,233,220,0.08)",
              }}
            >
              <span style={{ fontSize: "12px" }}>
                {(() => {
                  const p = parseBilingual(c.name);
                  return (
                    <>
                      <b>{p.en || c.name}</b> {p.ar && <b style={{ color: "#ffb347", marginLeft: "6px" }}>({p.ar})</b>}
                    </>
                  );
                })()} <small style={{ color: "#9a8b7a" }}>({c.id})</small>
                <span
                  style={{
                    marginLeft: "8px",
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    color: "#e8b04b",
                  }}
                >
                  Order: {c.sort_order}
                </span>
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => onEditCategory(c)}
                  style={{ color: "#e8b04b", background: "none", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: "800" }}
                >
                  EDIT
                </button>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  style={{ color: "#ff8b7a", background: "none", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: "800" }}
                >
                  DELETE
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
