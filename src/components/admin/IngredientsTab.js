// src/components/admin/IngredientsTab.js
"use client";

const INGREDIENT_CATEGORIES = [
  { key: "dough", title: "🍞 DOUGH (العجينة)" },
  { key: "sauce", title: "🍅 SAUCE (الصلصة)" },
  { key: "cheese", title: "🧀 CHEESE (الجبنة)" },
  { key: "meat", title: "🥩 MEATS (اللحوم)" },
  { key: "veg", title: "🥦 VEGETABLES (الخضار)" },
  { key: "extras", title: "✨ EXTRAS & DRIZZLES (إضافات)" },
];

export default function IngredientsTab({
  ingredientPrices,
  onIngredientChange,
  onSaveIngredients,
  savingIngredients,
  ingMsg,
}) {
  return (
    <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "24px", color: "#e8b04b", letterSpacing: "1px", margin: 0 }}>
            EDIT INGREDIENT PRICES (EGP)
          </h3>
          <p style={{ color: "#9a8b7a", fontSize: "11px", margin: "4px 0 0" }}>
            حدد سعر كل مكون حسب الحجم (Small / Med / Large).
          </p>
        </div>
        <button
          onClick={onSaveIngredients}
          disabled={savingIngredients}
          style={{
            background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
            color: "#1a0c04",
            border: "none",
            padding: "12px 28px",
            borderRadius: "99px",
            fontWeight: "900",
            cursor: "pointer",
            fontSize: "12px",
            letterSpacing: "1px",
            boxShadow: "0 8px 24px rgba(255, 122, 46, 0.3)",
          }}
        >
          {savingIngredients ? "SAVING..." : "SAVE ALL PRICES"}
        </button>
      </div>

      {ingMsg && (
        <div style={{ padding: "12px 16px", background: "rgba(255, 122, 46, 0.15)", border: "1px solid #ff7a2e", borderRadius: "10px", marginBottom: "22px", color: "#ffb347", fontWeight: "bold", fontSize: "13px" }}>
          {ingMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        {INGREDIENT_CATEGORIES.map((cat) => (
          <div key={cat.key} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(243, 233, 220, 0.08)", borderRadius: "16px", padding: "18px" }}>
            <h4 style={{ fontSize: "15px", color: "#ffb347", marginBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "8px" }}>
              {cat.title}
            </h4>

            {/* شريط عناوين المقاسات */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "6px", marginBottom: "8px", fontSize: "10px", fontWeight: "900", color: "#9a8b7a", textAlign: "center" }}>
              <span style={{ textAlign: "left" }}>ITEM</span>
              <span style={{ color: "#ffb347" }}>SMALL</span>
              <span style={{ color: "#ff7a2e" }}>MED</span>
              <span style={{ color: "#e8b04b" }}>LARGE</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(ingredientPrices[cat.key] || {}).map(([id, priceObj]) => {
                const p =
                  typeof priceObj === "object" && priceObj !== null
                    ? priceObj
                    : { small: priceObj || 0, med: priceObj || 0, large: priceObj || 0 };

                return (
                  <div key={id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#c5b7a7", fontWeight: "700" }}>
                      {id}
                    </span>
                    <input
                      type="number"
                      value={p.small ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onIngredientChange(cat.key, id, "small", e.target.value)}
                      style={{ width: "100%", background: "#1d120a", border: "1px solid rgba(255, 179, 71, 0.2)", borderRadius: "6px", padding: "6px 4px", color: "#ffb347", fontWeight: "bold", textAlign: "center", fontSize: "12px" }}
                    />
                    <input
                      type="number"
                      value={p.med ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onIngredientChange(cat.key, id, "med", e.target.value)}
                      style={{ width: "100%", background: "#1d120a", border: "1px solid rgba(255, 122, 46, 0.3)", borderRadius: "6px", padding: "6px 4px", color: "#ff7a2e", fontWeight: "bold", textAlign: "center", fontSize: "12px" }}
                    />
                    <input
                      type="number"
                      value={p.large ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onIngredientChange(cat.key, id, "large", e.target.value)}
                      style={{ width: "100%", background: "#1d120a", border: "1px solid rgba(232, 176, 75, 0.3)", borderRadius: "6px", padding: "6px 4px", color: "#e8b04b", fontWeight: "bold", textAlign: "center", fontSize: "12px" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
