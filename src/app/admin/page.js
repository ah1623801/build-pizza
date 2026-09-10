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
  const [activeTab, setActiveTab] = useState("items");
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

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewCat({ id: "", name: "", sort_order: 10 });
        loadMenuData();
      } else {
        alert(data.error || "فشل في إضافة التصنيف");
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0705", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff7a2e", fontFamily: "sans-serif", letterSpacing: "3px" }}>
        AUTHENTICATING...
      </div>
    );
  }

  // ================= شاشة تسجيل الدخول بتصميم فاخر =================
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
          padding: "44px 34px",
          backdropFilter: "blur(20px)",
          textAlign: "center"
        }}>
          <h2 style={{ fontFamily: "Impact, sans-serif", fontSize: "38px", letterSpacing: "1px", margin: "0 0 6px", color: "#f3e9dc" }}>
            FORNO <span style={{ color: "#ff7a2e" }}>ADMIN</span>
          </h2>
          <p style={{ color: "#9a8b7a", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "28px" }}>
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
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", color: "#e8b04b", marginBottom: "8px" }}>
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
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", color: "#e8b04b", marginBottom: "8px" }}>
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

  // ================= لوحة التحكم الرئيسية =================
  return (
    <div style={{ minHeight: "100vh", background: "#0a0705", color: "#f3e9dc", fontFamily: "'Inter', sans-serif", paddingBottom: "80px" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 5vw",
        borderBottom: "1px solid rgba(243, 233, 220, 0.1)",
        background: "#140d08"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: "28px", letterSpacing: "1px" }}>
            FORNO<span style={{ color: "#ff7a2e" }}>.</span>
          </span>
          <span style={{ background: "#ff7a2e", color: "#140d08", fontSize: "10px", fontWeight: "900", padding: "4px 10px", borderRadius: "99px", letterSpacing: "2px" }}>
            PORTAL
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#9a8b7a", fontSize: "12px" }}>{userEmail}</span>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid rgba(243, 233, 220, 0.2)",
              color: "#f3e9dc",
              padding: "8px 16px",
              borderRadius: "99px",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Tabs */}
      <main style={{ maxWidth: "1300px", margin: "30px auto 0", padding: "0 4vw" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
          <button
            onClick={() => setActiveTab("items")}
            style={{
              padding: "12px 24px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "items" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "items" ? "#ff7a2e" : "transparent",
              color: activeTab === "items" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "11px",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            MENU PRODUCTS ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            style={{
              padding: "12px 24px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "categories" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "categories" ? "#ff7a2e" : "transparent",
              color: activeTab === "categories" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "11px",
              letterSpacing: "2px",
              cursor: "pointer"
            }}
          >
            CATEGORIES ({categories.length})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === "items" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "30px", alignItems: "start" }}>
            {/* Form Card */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#e8b04b", marginBottom: "20px", letterSpacing: "1px" }}>
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
                    style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>PRICE (EGP)</label>
                    <input
                      type="number"
                      placeholder="290"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>TYPE</label>
                    <select
                      value={formData.is_simple ? "simple" : "custom"}
                      onChange={(e) => setFormData({ ...formData, is_simple: e.target.value === "simple" })}
                      style={{ width: "100%", padding: "12px 14px", background: "#140d08", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
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
                      <label key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>
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
                    style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "10px", color: "#e8b04b", fontWeight: "800", letterSpacing: "2px", marginBottom: "6px" }}>PRODUCT IMAGE</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ color: "#9a8b7a", fontSize: "12px" }} />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
                      color: "#1a0c04",
                      border: "none",
                      borderRadius: "99px",
                      fontWeight: "900",
                      fontSize: "11px",
                      letterSpacing: "2px",
                      cursor: "pointer"
                    }}
                  >
                    {submitting ? "SAVING..." : editingItem ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetItemForm}
                      style={{
                        padding: "14px 20px",
                        background: "none",
                        border: "1px solid rgba(243,233,220,0.2)",
                        color: "#fff",
                        borderRadius: "99px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Card */}
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "28px", overflowX: "auto" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#e8b04b", marginBottom: "20px", letterSpacing: "1px" }}>EXISTING PRODUCTS</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(243, 233, 220, 0.1)", color: "#9a8b7a", fontSize: "10px" }}>
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
                          <img src={it.image_url} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "9px", color: "#9a8b7a" }}>NO IMG</span>
                        )}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <b>{it.name}</b>
                        <div style={{ fontSize: "10px", color: "#9a8b7a" }}>{it.categories?.join(", ")}</div>
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
                            }}
                            style={{ padding: "6px 12px", background: "#ff7a2e", color: "#140d08", border: "none", borderRadius: "6px", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteItem(it.id)}
                            style={{ padding: "6px 12px", background: "rgba(194, 43, 26, 0.2)", border: "1px solid rgba(194, 43, 26, 0.4)", color: "#ff8b7a", borderRadius: "6px", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}
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
        )}

        {/* Tab 2: Categories */}
        {activeTab === "categories" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "30px", alignItems: "start" }}>
            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#e8b04b", marginBottom: "20px", letterSpacing: "1px" }}>ADD CATEGORY</h3>
              <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input
                  type="text"
                  placeholder="NAME (e.g. SPECIALS)"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  required
                  style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff" }}
                />
                <input
                  type="number"
                  placeholder="ORDER (e.g. 1)"
                  value={newCat.sort_order}
                  onChange={(e) => setNewCat({ ...newCat, sort_order: e.target.value })}
                  required
                  style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(243,233,220,0.15)", borderRadius: "10px", color: "#fff" }}
                />
                <button type="submit" style={{ padding: "14px", background: "#ff7a2e", color: "#140d08", border: "none", borderRadius: "99px", fontWeight: "900", cursor: "pointer" }}>ADD CATEGORY</button>
              </form>
            </div>

            <div style={{ background: "#140d08", border: "1px solid rgba(243, 233, 220, 0.1)", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#e8b04b", marginBottom: "20px", letterSpacing: "1px" }}>CATEGORIES LIST</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {categories.map((c) => (
                  <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(243,233,220,0.08)" }}>
                    <span><b>{c.name}</b> <small style={{ color: "#9a8b7a" }}>({c.id})</small></span>
                    <button onClick={() => handleDeleteCategory(c.id)} style={{ color: "#ff8b7a", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "800" }}>DELETE</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}