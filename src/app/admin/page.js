// src/app/admin/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import OrdersTab from "@/components/admin/OrdersTab";
import MenuTab from "@/components/admin/MenuTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import IngredientsTab from "@/components/admin/IngredientsTab";
import MessagesTab from "@/components/admin/MessagesTab";
import ReceiptModal from "@/components/admin/ReceiptModal";
import { playOrderAlertChime, unlockAudioOnUserGesture } from "@/components/admin/audioNotification";
import { formatBilingual, parseBilingual } from "@/lib/i18n";
import { supabaseClient, isSupabaseLive } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth inputs & Remember Me
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState("");

  // Navigation Tabs: orders | items | categories | ingredients
  const [activeTab, setActiveTab] = useState("orders");

  // Orders State (Cashier)
  const [orders, setOrders] = useState([]);
  const [selectedReceiptModal, setSelectedReceiptModal] = useState(null);
  const previousOrdersCountRef = useRef(0);

  // Dashboard Data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Item Form (Bilingual: EN & AR)
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    item_id: "",
    price: "",
    is_simple: false,
    categories: [],
    ingredients_en: "",
    ingredients_ar: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Category Form (Bilingual: EN & AR)
  const [newCat, setNewCat] = useState({ id: "", name_en: "", name_ar: "", sort_order: 10 });
  const [editingCat, setEditingCat] = useState(null);

  // Ingredient Pricing State
  const [ingredientPrices, setIngredientPrices] = useState({
    dough: {
      thin: { small: 0, med: 0, large: 0 },
      classic: { small: 0, med: 0, large: 0 },
      thick: { small: 15, med: 20, large: 25 },
      cheese: { small: 25, med: 35, large: 45 },
    },
    sauce: {
      tomato: { small: 15, med: 20, large: 25 },
      spicy: { small: 20, med: 30, large: 35 },
      bbq: { small: 25, med: 35, large: 40 },
      garlic: { small: 30, med: 40, large: 45 },
    },
    cheese: {
      mozzarella: { small: 20, med: 25, large: 35 },
      extra: { small: 30, med: 40, large: 50 },
      four: { small: 45, med: 55, large: 65 },
      smoked: { small: 35, med: 45, large: 55 },
    },
    meat: {
      pepperoni: { small: 35, med: 45, large: 55 },
      beef: { small: 40, med: 50, large: 60 },
      chicken: { small: 35, med: 45, large: 55 },
      sausage: { small: 30, med: 40, large: 50 },
    },
    veg: {
      olives: { small: 10, med: 15, large: 20 },
      mushroom: { small: 15, med: 20, large: 25 },
      onion: { small: 8, med: 12, large: 15 },
      greenPepper: { small: 10, med: 15, large: 20 },
      jalapeno: { small: 12, med: 18, large: 22 },
      basil: { small: 8, med: 10, large: 12 },
    },
    extras: {
      extraCheese: { small: 25, med: 30, large: 40 },
      chili: { small: 8, med: 10, large: 12 },
      garlic: { small: 8, med: 10, large: 12 },
      truffle: { small: 25, med: 35, large: 45 },
    },
  });
  const [savingIngredients, setSavingIngredients] = useState(false);
  const [ingMsg, setIngMsg] = useState("");

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        const newOrders = Array.isArray(data) ? data : [];
        
        // Play alert sound if a new pending order arrived
        const pendingCount = newOrders.filter((o) => o.payment_status === "pending").length;
        if (previousOrdersCountRef.current > 0 && pendingCount > previousOrdersCountRef.current) {
          playOrderAlertChime();
        }
        previousOrdersCountRef.current = pendingCount;
        setOrders(newOrders);
      }
    } catch (e) {
      console.error("Orders sync error:", e);
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
          setIngredientPrices((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (e) {
      console.error("Ingredients fetch error:", e);
    }
  };

  // Customer Inquiries & Messages
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Messages fetch error:", e);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm("Are you sure you want to remove this message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      alert("Error deleting message: " + e.message);
    }
  };

  useEffect(() => {
    unlockAudioOnUserGesture();
    let active = true;
    (async () => {
      // 1. استرجاع البريد الإلكتروني فقط إذا اختار المستخدم تذكره
      let savedEmail = "";
      if (typeof window !== "undefined") {
        const isRemembered = localStorage.getItem("forno_admin_remember") === "true";
        setRememberMe(isRemembered);
        if (isRemembered) {
          savedEmail = localStorage.getItem("forno_admin_email") || "";
          if (savedEmail) setEmail(savedEmail);
        }
        // تنظيف أي كلمة مرور كانت محفوظة سابقاً لأمان النظام
        localStorage.removeItem("forno_admin_password");
      }

      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (!active) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserEmail(data.email);
          loadOrders();
          loadMenuData();
          loadIngredientPrices();
          loadMessages();
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Realtime subscription + fallback sync for cashier orders (شغال دايماً طول ما الأدمن مسجل)
  useEffect(() => {
    if (!isAuthenticated) return;

    let channel = null;
    if (isSupabaseLive) {
      try {
        channel = supabaseClient
          .channel("admin-orders-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            (payload) => {
              if (payload.eventType === "INSERT") {
                playOrderAlertChime();
              }
              loadOrders();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Realtime admin channel fallback:", err);
      }
    }

    // Relaxed background polling safety-net (every 10s)
    const syncTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    }, 10000);

    return () => {
      clearInterval(syncTimer);
      if (channel && isSupabaseLive) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [isAuthenticated, activeTab]);

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
        setPassword(""); // تفريغ كلمة المرور فوراً من الذاكرة لحماية الحساب
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("forno_admin_remember", "true");
            localStorage.setItem("forno_admin_email", email.trim());
          } else {
            localStorage.setItem("forno_admin_remember", "false");
            localStorage.removeItem("forno_admin_email");
          }
          localStorage.removeItem("forno_admin_password");
        }
        setIsAuthenticated(true);
        setUserEmail(data.email);
        loadOrders();
        loadMenuData();
        loadIngredientPrices();
        loadMessages();
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
    setPassword("");
    setOrders([]); // تنظيف كاش الطلبات وبيانات العملاء فور تسجيل الخروج
    setMessages([]);
  };

  // ================= إدارة دورة الطلبات (الكاشير) =================
  const handleUpdateOrderStatus = async (id, payment_status, order_status) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, payment_status, order_status }),
      });
      if (res.ok) {
        loadOrders();
      }
    } catch (e) {
      alert("خطأ أثناء تحديث حالة الطلب");
    }
  };

  // ================= إدارة المنتجات (دعم ثنائي اللغة) =================
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formPayload = new FormData();
      if (editingItem) formPayload.append("id", editingItem.id);

      const combinedName = formatBilingual(formData.name_en, formData.name_ar);
      const enIngs = (formData.ingredients_en || "").split(",").map((x) => x.trim()).filter(Boolean);
      const arIngs = (formData.ingredients_ar || "").split(",").map((x) => x.trim()).filter(Boolean);
      const combinedIngs = [];
      const maxLen = Math.max(enIngs.length, arIngs.length);
      for (let i = 0; i < maxLen; i++) {
        const en = enIngs[i] || "";
        const ar = arIngs[i] || "";
        combinedIngs.push(formatBilingual(en, ar));
      }

      formPayload.append("name", combinedName);
      formPayload.append("item_id", (formData.item_id || formData.name_en || "item").toLowerCase().replace(/\s+/g, "-"));
      formPayload.append("price", formData.price);
      formPayload.append("is_simple", formData.is_simple);
      formPayload.append("categories", JSON.stringify(formData.categories));
      formPayload.append("ingredients", JSON.stringify(combinedIngs));
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
      name_en: "",
      name_ar: "",
      item_id: "",
      price: "",
      is_simple: false,
      categories: [],
      ingredients_en: "",
      ingredients_ar: "",
      image_url: "",
    });
    setImageFile(null);
  };

  // ================= إدارة التصنيفات (دعم ثنائي اللغة) =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const combinedName = formatBilingual(newCat.name_en, newCat.name_ar);
      const payload = {
        id: (newCat.id || newCat.name_en || "category").toLowerCase().replace(/\s+/g, "-"),
        name: combinedName,
        sort_order: newCat.sort_order,
        ...(editingCat ? { original_id: editingCat.id } : {}),
      };
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
    setNewCat({ id: "", name_en: "", name_ar: "", sort_order: 10 });
  };

  // ================= إدارة أسعار المكونات =================
  const handleIngredientChange = (catKey, id, size, value) => {
    const num = parseFloat(value) || 0;
    setIngredientPrices((prev) => {
      const currentCat = prev[catKey] || {};
      const currentItem = currentCat[id];
      const isObj = typeof currentItem === "object" && currentItem !== null;

      const updatedItem = isObj
        ? { ...currentItem, [size]: num }
        : { small: currentItem || 0, med: currentItem || 0, large: currentItem || 0, [size]: num };

      return {
        ...prev,
        [catKey]: {
          ...currentCat,
          [id]: updatedItem,
        },
      };
    });
  };

  const handleSaveIngredients = async () => {
    setSavingIngredients(true);
    setIngMsg("");
    try {
      const payload = {};
      for (const [catKey, itemsObj] of Object.entries(ingredientPrices)) {
        payload[catKey] = {};
        for (const [id, priceVal] of Object.entries(itemsObj)) {
          if (typeof priceVal === "object" && priceVal !== null) {
            payload[catKey][id] = {
              small: Number(priceVal.small) || 0,
              med: Number(priceVal.med) || 0,
              large: Number(priceVal.large) || 0,
            };
          } else {
            const val = Number(priceVal) || 0;
            payload[catKey][id] = { small: val, med: val, large: val };
          }
        }
      }

      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIngMsg("تم حفظ وتحديث جميع أسعار المكونات بنجاح! ✓");
        setTimeout(() => setIngMsg(""), 3500);
      } else {
        setIngMsg("فشل الحفظ، تأكد من إعدادات قاعدة البيانات");
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

  // ================= شاشة تسجيل الدخول =================
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 30%, #1e120a 0%, #0a0705 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
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
          boxSizing: "border-box",
        }}>
          <h2 style={{ fontFamily: "Impact, sans-serif", fontSize: "32px", letterSpacing: "1px", margin: "0 0 6px", color: "#f3e9dc" }}>
            FORNO <span style={{ color: "#ff7a2e" }}>ADMIN</span>
          </h2>
          <p style={{ color: "#9a8b7a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "28px" }}>
            CASHIER & RESTAURANT PORTAL
          </p>

          {authError && (
            <div style={{
              background: "rgba(194, 43, 26, 0.15)",
              border: "1px solid #c22b1a",
              color: "#ff8b7a",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "12px",
              marginBottom: "20px",
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
                boxSizing: "border-box",
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
                boxSizing: "border-box",
              }}
            />
          </div>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#f3e9dc",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "24px",
            cursor: "pointer",
            userSelect: "none",
            justifyContent: "flex-start",
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: "#ff7a2e", width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>حفظ بيانات الدخول على هذا الجهاز (Remember Me)</span>
          </label>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #ff7a2e, #e05a12)",
              color: "#1a0c04",
              border: "none",
              borderRadius: "99px",
              fontWeight: "900",
              fontSize: "12px",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            ENTER DASHBOARD
          </button>
        </form>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.payment_status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.payment_status === "paid").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0705", color: "#f3e9dc", fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      {/* Top Header */}
      <header style={{
        background: "#140d08",
        borderBottom: "1px solid rgba(243, 233, 220, 0.1)",
        padding: "18px 4vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <h1 style={{ fontFamily: "Impact, sans-serif", fontSize: "24px", letterSpacing: "1px", margin: 0, color: "#f3e9dc" }}>
            FORNO <span style={{ color: "#ff7a2e" }}>ADMIN</span>
          </h1>
          <span style={{ fontSize: "11px", color: "#ff7a2e", background: "rgba(255, 122, 46, 0.15)", padding: "4px 10px", borderRadius: "99px", fontWeight: "800" }}>
            CASHIER
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", color: "#9a8b7a" }}>{userEmail}</span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(194, 43, 26, 0.15)",
              border: "1px solid #c22b1a",
              color: "#ff8b7a",
              padding: "6px 14px",
              borderRadius: "99px",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1300px", margin: "20px auto 0", padding: "0 4vw" }}>
        {/* KPI Summary Overview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>PAID REVENUE</div>
            <div style={{ fontSize: "24px", fontFamily: "var(--disp)", color: "#57a84f", marginTop: "4px" }}>
              EGP {totalRevenue.toLocaleString()}
            </div>
          </div>
          <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>PAID ORDERS</div>
            <div style={{ fontSize: "24px", fontFamily: "var(--disp)", color: "#ffb347", marginTop: "4px" }}>
              {paidOrdersCount}
            </div>
          </div>
          <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>PENDING CASHIER</div>
            <div style={{ fontSize: "24px", fontFamily: "var(--disp)", color: pendingCount > 0 ? "#ff7a2e" : "#9a8b7a", marginTop: "4px" }}>
              {pendingCount}
            </div>
          </div>
          <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>TOTAL ORDERS</div>
            <div style={{ fontSize: "24px", fontFamily: "var(--disp)", color: "#f3e9dc", marginTop: "4px" }}>
              {orders.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "10px",
          scrollbarWidth: "none",
        }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "orders" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "orders" ? "#ff7a2e" : "transparent",
              color: activeTab === "orders" ? "#140d08" : "#9a8b7a",
              fontWeight: "900",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            ORDERS ({pendingCount} PENDING)
          </button>

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
              cursor: "pointer",
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
              cursor: "pointer",
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
              cursor: "pointer",
            }}
          >
            INGREDIENT PRICES 🍕
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "messages" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "messages" ? "#ff7a2e" : "transparent",
              color: activeTab === "messages" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            MESSAGES ({messages.length}) ✉️
          </button>
        </div>

        {/* Tab 0: Orders */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onSelectReceipt={(url) => setSelectedReceiptModal(url)}
          />
        )}

        {/* Tab 1: Products */}
        {activeTab === "items" && (
          <MenuTab
            items={items}
            categories={categories}
            editingItem={editingItem}
            formData={formData}
            setFormData={setFormData}
            imageFile={imageFile}
            setImageFile={setImageFile}
            submitting={submitting}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={(it) => {
              setEditingItem(it);
              const parsedName = parseBilingual(it.name);
              const ingList = Array.isArray(it.ingredients) ? it.ingredients : [];
              const enList = [];
              const arList = [];
              ingList.forEach((ing) => {
                const p = parseBilingual(ing);
                if (p.en) enList.push(p.en);
                if (p.ar) arList.push(p.ar);
              });
              setFormData({
                name_en: parsedName.en,
                name_ar: parsedName.ar,
                item_id: it.item_id,
                price: it.price,
                is_simple: it.is_simple || false,
                categories: it.categories || [],
                ingredients_en: enList.join(", "),
                ingredients_ar: arList.join(", "),
                image_url: it.image_url || "",
              });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCancelEdit={resetItemForm}
          />
        )}

        {/* Tab 2: Categories */}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories}
            editingCat={editingCat}
            newCat={newCat}
            setNewCat={setNewCat}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditCategory={(c) => {
              setEditingCat(c);
              const parsedCat = parseBilingual(c.name);
              setNewCat({
                id: c.id,
                name_en: parsedCat.en,
                name_ar: parsedCat.ar,
                sort_order: c.sort_order || 10,
              });
            }}
            onCancelEdit={resetCatForm}
          />
        )}

        {/* Tab 3: Ingredients Pricing Matrix */}
        {activeTab === "ingredients" && (
          <IngredientsTab
            ingredientPrices={ingredientPrices}
            onIngredientChange={handleIngredientChange}
            onSaveIngredients={handleSaveIngredients}
            savingIngredients={savingIngredients}
            ingMsg={ingMsg}
          />
        )}

        {/* Tab 4: Customer Messages & Inquiries */}
        {activeTab === "messages" && (
          <MessagesTab
            messages={messages}
            onDeleteMessage={handleDeleteMessage}
          />
        )}

        {/* Payment Receipt Modal */}
        <ReceiptModal
          receiptUrl={selectedReceiptModal}
          onClose={() => setSelectedReceiptModal(null)}
        />
      </main>
    </div>
  );
}