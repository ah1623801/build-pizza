// src/app/admin/page.js
"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Dashboard Data
  const [activeTab, setActiveTab] = useState("items"); // items | categories | ingredients
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Item Form
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    item_id: "",
    price: "",
    is_simple: false,
    categories: [],
    ingredients: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Category Form
  const [newCat, setNewCat] = useState({ id: "", name: "", sort_order: 10 });
  const [editingCat, setEditingCat] = useState(null);

  // Ingredient Pricing State
  const [ingredientPrices, setIngredientPrices] = useState({
    dough: { thin: 0, classic: 0, thick: 20, cheese: 35 },
    sauce: { tomato: 20, spicy: 30, bbq: 35, garlic: 40 },
    cheese: { mozzarella: 25, extra: 40, four: 55, smoked: 45 },
    meat: { pepperoni: 45, beef: 50, chicken: 45, sausage: 40 },
    veg: { olives: 15, mushroom: 20, onion: 12, greenPepper: 15, jalapeno: 18, corn: 12, basil: 10 },
    extras: { extraCheese: 30, chili: 10, garlic: 10, truffle: 35 }
  });
  const [savingIngredients, setSavingIngredients] = useState(false);
  const [ingMsg, setIngMsg] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUserEmail(data.email);
        loadMenuData();
        loadIngredientPrices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (data.items) setItems(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  const loadIngredientPrices = async () => {
    try {
      const res = await fetch("/api/ingredients");
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setIngredientPrices(prev => ({ ...prev, ...data }));
        }
      }
    } catch (e) {
      console.error("Ingredients fetch error:", e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUserEmail(data.email);
        loadMenuData();
        loadIngredientPrices();
      } else {
        setAuthError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch (e) {
      setAuthError("حدث خطأ في الاتصال بالسيرفر");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setUserEmail("");
  };

  // ================= إدارة المنتجات =================
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formPayload = new FormData();
      if (editingItem) formPayload.append("id", editingItem.id);
      formPayload.append("name", formData.name);
      formPayload.append("item_id", formData.item_id);
      formPayload.append("price", formData.price);
      formPayload.append("is_simple", formData.is_simple);
      formPayload.append("categories", JSON.stringify(formData.categories));
      formPayload.append(
        "ingredients",
        JSON.stringify(formData.ingredients.split(",").map((x) => x.trim()).filter(Boolean))
      );
      formPayload.append("image_url", formData.image_url);
      if (imageFile) formPayload.append("image", imageFile);

      const res = await fetch("/api/menu", { method: "POST", body: formPayload });
      const data = await res.json();
      if (res.ok && data.success) {
        resetItemForm();
        loadMenuData();
      } else {
        alert(data.error || "فشل في حفظ المنتج");
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      if (res.ok) loadMenuData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      item_id: "",
      price: "",
      is_simple: false,
      categories: [],
      ingredients: "",
      image_url: "",
    });
    setImageFile(null);
  };

  // ================= إدارة وتعديل الكاتيجوريز =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = editingCat ? { ...newCat, original_id: editingCat.id } : newCat;
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        resetCatForm();
        loadMenuData();
      } else {
        alert(data.error || "فشل في حفظ التصنيف");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("هل تريد حذف هذا التصنيف؟")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) loadMenuData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const resetCatForm = () => {
    setEditingCat(null);
    setNewCat({ id: "", name: "", sort_order: 10 });
  };

  // ================= إدارة أسعار المكونات =================
  const handleIngredientChange = (category, id, value) => {
    setIngredientPrices(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: Number(value) || 0
      }
    }));
  };

  const handleSaveIngredients = async () => {
    setSavingIngredients(true);
    setIngMsg("");
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientPrices)
      });
      if (res.ok) {
        setIngMsg("تم حفظ وتحديث جميع أسعار المكونات بنجاح! ✓");
        setTimeout(() => setIngMsg(""), 3500);
      } else {
        setIngMsg("فشل الحفظ، تأكد من ملف API الخاص بالمكونات");
      }
    } catch (e) {
      setIngMsg("خطأ في الاتصال أثناء حفظ الأسعار");
    } finally {
      setSavingIngredients(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0705", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff7a2e", fontFamily: "sans-serif", letterSpacing: "3px" }}>
        AUTHENTICATING...
      </div>
    );
  }

  // ================= تسجيل الدخول =================
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 30%, #1e120a 0%, #0a0705 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif"
      }}>
        <form onSubmit={handleLogin} style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(20, 13, 8, 0.9)",
          border: "1px solid rgba(255, 122, 46, 0.25)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 122, 46, 0.1)",
          borderRadius: "24px",
          padding: "40px 24px",
          backdropFilter: "blur(20px)",
          textAlign: "center",
          boxSizing: "border-box"
        }}>
          <h2 style={{ fontFamily: "Impact, sans-serif", fontSize: "32px", letterSpacing: "1px", margin: "0 0 6px", color: "#f3e9dc" }}>
            FORNO <span style={{ color: "#ff7a2e" }}>ADMIN</span>
          </h2>
          <p style={{ color: "#9a8b7a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "28px" }}>
            RESTAURANT PORTAL
          </p>

          {authError && (
            <div style={{
              background: "rgba(194, 43, 26, 0.15)",
              border: "1px solid #c22b1a",
              color: "#ff8b7a",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "12px",
              marginBottom: "20px"
            }}>
              {authError}
            </div>
          )}

          <div style={{ textAlign: "left", marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#e8b04b", marginBottom: "8px" }}>
              EMAIL
            </label>
            <input
              type="email"
              placeholder="admin@forno.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(243, 233, 220, 0.15)",
                borderRadius: "12px",
                color: "#f3e9dc",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#e8b04b", marginBottom: "8px" }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(243, 233, 220, 0.15)",
                borderRadius: "12px",
                color: "#f3e9dc",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
              color: "#1a0c04",
              border: "none",
              borderRadius: "99px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: "900",
              letterSpacing: "3px",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(255, 122, 46, 0.4)"
            }}
          >
            LOGIN TO DASHBOARD
          </button>
        </form>
      </div>
    );
  }

  // ================= الداشبورد الرئيسية =================
  const ingredientCategories = [
    { key: "dough", title: "🍕 العجين (Dough)" },
    { key: "sauce", title: "🥫 الصلصات (Sauce)" },
    { key: "cheese", title: "🧀 الأجبان (Cheese)" },
    { key: "meat", title: "🥩 اللحوم (Meats)" },
    { key: "veg", title: "🥦 الخضراوات (Veggies)" },
    { key: "extras", title: "✨ الإضافات (Extras)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0705", color: "#f3e9dc", fontFamily: "'Inter', sans-serif", paddingBottom: "80px" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 4vw",
        borderBottom: "1px solid rgba(243, 233, 220, 0.1)",
        background: "#140d08",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: "24px", letterSpacing: "1px" }}>
            FORNO<span style={{ color: "#ff7a2e" }}>.</span>
          </span>
          <span style={{ background: "#ff7a2e", color: "#140d08", fontSize: "9px", fontWeight: "900", padding: "4px 8px", borderRadius: "99px", letterSpacing: "2px" }}>
            PORTAL
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#9a8b7a", fontSize: "11px" }}>
            {userEmail}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid rgba(243, 233, 220, 0.2)",
              color: "#f3e9dc",
              padding: "8px 14px",
              borderRadius: "99px",
              fontSize: "9px",
              fontWeight: "800",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1300px", margin: "20px auto 0", padding: "0 4vw" }}>
        
        {/* Navigation Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginBottom: "24px", 
          overflowX: "auto", 
          paddingBottom: "10px",
          scrollbarWidth: "none"
        }}>
          <button
            onClick={() => setActiveTab("items")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "items" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "items" ? "#ff7a2e" : "transparent",
              color: activeTab === "items" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            PRODUCTS ({items.length})
          </button>
          
          <button
            onClick={() => setActiveTab("categories")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "categories" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "categories" ? "#ff7a2e" : "transparent",
              color: activeTab === "categories" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            CATEGORIES ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("ingredients")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "ingredients" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "ingredients" ? "#ff7a2e" : "transparent",
              color: activeTab === "ingredients" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            INGREDIENT PRICES 🍕
          </button>
        </div>

        {/* ================= TAB 1: PRODUCTS ================= */}
        {activeTab === "items" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Add / Edit Product Form */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
                {editingItem ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
              </h3>
              <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>PRODUCT NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. THE TRUFFLE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, item_id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    required
                    style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>PRICE (EGP)</label>
                    <input
                      type="number"
                      placeholder="290"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>TYPE</label>
                    <select
                      value={formData.is_simple ? "simple" : "custom"}
                      onChange={(e) => setFormData({ ...formData, is_simple: e.target.value === "simple" })}
                      style={{ width: "100%", padding: "12px", background: "#140d08", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="custom">PIZZA (CUSTOMIZABLE)</option>
                      <option value="simple">SIMPLE (DRINK / SIDE)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>CATEGORIES</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {categories.map((c) => (
                      <label key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(c.id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.categories, c.id]
                              : formData.categories.filter((x) => x !== c.id);
                            setFormData({ ...formData, categories: updated });
                          }}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>INGREDIENTS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="Mozzarella, Fresh Basil, Olives"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>PRODUCT IMAGE</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ color: "#9a8b7a", fontSize: "10px", maxWidth: "100%" }} />
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
                      minWidth: "180px"
                    }}
                  >
                    {submitting ? "SAVING..." : editingItem ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetItemForm}
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
                        minWidth: "120px"
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Table */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>EXISTING PRODUCTS</h3>
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
                            <img src={it.image_url} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "9px", color: "#9a8b7a" }}>NO IMG</span>
                          )}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <b style={{ fontSize: "12px" }}>{it.name}</b>
                          <div style={{ fontSize: "9px", color: "#9a8b7a", marginTop: "2px" }}>{it.categories?.join(", ")}</div>
                        </td>
                        <td style={{ padding: "10px", fontFamily: "Impact, sans-serif", color: "#e8b04b", fontSize: "16px" }}>EGP {it.price}</td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => {
                                setEditingItem(it);
                                setFormData({
                                  name: it.name,
                                  item_id: it.item_id,
                                  price: it.price,
                                  is_simple: it.is_simple || false,
                                  categories: it.categories || [],
                                  ingredients: (it.ingredients || []).join(", "),
                                  image_url: it.image_url || "",
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              style={{ padding: "6px 12px", background: "#ff7a2e", color: "#140d08", border: "none", borderRadius: "6px", fontSize: "9px", fontWeight: "800", cursor: "pointer" }}
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteItem(it.id)}
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
        )}

        {/* ================= TAB 2: CATEGORIES (مع إمكانية التعديل) ================= */}
        {activeTab === "categories" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
            
            {/* Category Form */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>
                {editingCat ? "EDIT CATEGORY" : "ADD CATEGORY"}
              </h3>
              <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>CATEGORY NAME</label>
                  <input
                    type="text"
                    placeholder="NAME (e.g. SPECIALS)"
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value, id: editingCat ? newCat.id : e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    required
                    style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>SLUG ID</label>
                  <input
                    type="text"
                    placeholder="ID (e.g. specials)"
                    value={newCat.id}
                    onChange={(e) => setNewCat({ ...newCat, id: e.target.value })}
                    required
                    style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>SORT ORDER</label>
                  <input
                    type="number"
                    placeholder="ORDER (e.g. 1)"
                    value={newCat.sort_order}
                    onChange={(e) => setNewCat({ ...newCat, sort_order: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1, padding: "14px", background: "#ff7a2e", color: "#140d08", border: "none", borderRadius: "99px", fontWeight: "900", cursor: "pointer", fontSize: "10px", letterSpacing: "2px" }}>
                    {editingCat ? "UPDATE CATEGORY" : "ADD CATEGORY"}
                  </button>
                  {editingCat && (
                    <button type="button" onClick={resetCatForm} style={{ padding: "14px 20px", background: "none", border: "1px solid rgba(243,233,220,0.2)", color: "#fff", borderRadius: "99px", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Category List */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "20px", color: "#e8b04b", marginBottom: "16px", letterSpacing: "1px" }}>CATEGORIES LIST</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {categories.map((c) => (
                  <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(243,233,220,0.08)" }}>
                    <span style={{ fontSize: "12px" }}>
                      <b>{c.name}</b> <small style={{ color: "#9a8b7a" }}>({c.id})</small>
                      <span style={{ marginLeft: "8px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", color: "#e8b04b" }}>Order: {c.sort_order}</span>
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setEditingCat(c);
                          setNewCat({ id: c.id, name: c.name, sort_order: c.sort_order || 10 });
                        }}
                        style={{ color: "#e8b04b", background: "none", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: "800" }}
                      >
                        EDIT
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id)} style={{ color: "#ff8b7a", background: "none", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: "800" }}>
                        DELETE
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ================= TAB 3: INGREDIENT PRICES (تعديل أسعار المكونات) ================= */}
        {activeTab === "ingredients" && (
          <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "24px", color: "#e8b04b", letterSpacing: "1px", margin: 0 }}>
                  EDIT INGREDIENT PRICES (EGP)
                </h3>
                <p style={{ color: "#9a8b7a", fontSize: "11px", margin: "4px 0 0" }}>
                  الأسعار المحددة هنا تظهر مباشرة في البيتزا كيتشن وتُحسب تلقائياً في الفاتورة.
                </p>
              </div>
              <button
                onClick={handleSaveIngredients}
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
                  boxShadow: "0 8px 24px rgba(255, 122, 46, 0.3)"
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {ingredientCategories.map((cat) => (
                <div key={cat.key} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(243, 233, 220, 0.08)", borderRadius: "16px", padding: "18px" }}>
                  <h4 style={{ fontSize: "15px", color: "#ffb347", marginBottom: "14px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "8px" }}>
                    {cat.title}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Object.entries(ingredientPrices[cat.key] || {}).map(([id, price]) => (
                      <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#c5b7a7", fontWeight: "600" }}>
                          {id}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handleIngredientChange(cat.key, id, e.target.value)}
                            style={{
                              width: "80px",
                              background: "#1d120a",
                              border: "1px solid rgba(255, 122, 46, 0.3)",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              color: "#ffb347",
                              fontWeight: "bold",
                              textAlign: "center",
                              fontSize: "13px"
                            }}
                          />
                          <span style={{ fontSize: "10px", color: "#9a8b7a" }}>EGP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}