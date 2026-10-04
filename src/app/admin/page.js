// src/app/admin/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import OrdersTab from "@/components/admin/OrdersTab";
import MenuTab, { resolveAdminItemImage } from "@/components/admin/MenuTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import IngredientsTab from "@/components/admin/IngredientsTab";
import MessagesTab from "@/components/admin/MessagesTab";
// import CouponsTab from "@/components/admin/CouponsTab";
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

  // Date & Period Filter State: all | today | yesterday | this_month | custom_date | custom_month
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedCustomDate, setSelectedCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedCustomMonth, setSelectedCustomMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterModalOpen]);

  // Dashboard Data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Item Form (Bilingual: EN & AR + 3 Pizza Sizes)
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    item_id: "",
    price: "",
    price_small: "",
    price_large: "",
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
      const res = await fetch("/api/menu", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
        if (data.items && Array.isArray(data.items)) setItems(data.items);
      }
    } catch (e) {
      console.error("Menu data fetch error:", e);
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

  // تم تعليق جزء الكوبونات (ctrl + ظ)
  /*
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      }
    } catch (e) {
      console.error("Coupons fetch error:", e);
    } finally {
      setLoadingCoupons(false);
    }
  };
  */

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
          // loadCoupons();
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

  const handleResetOrders = async () => {
    if (!confirm("⚠️ هل أنت متأكد من تصفير وحذف جميع بيانات الطلبات والإجماليات في الداشبورد بالكامل؟\nسيتم حذف جميع الطلبات وإعادة الإجماليات إلى 0.")) {
      return;
    }
    try {
      const res = await fetch("/api/orders", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders([]);
        previousOrdersCountRef.current = 0;
        alert("تم تصفير جميع الطلبات والإجماليات بنجاح! ✓");
      } else {
        alert(data.error || "فشل تصفير الطلبات");
      }
    } catch (e) {
      alert("حدث خطأ أثناء تصفير الطلبات");
    }
  };

  // Realtime subscription + BroadcastChannel + Storage + high-speed sync for cashier orders
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Supabase Realtime WebSocket Listener
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
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "messages" },
            () => {
              loadMessages();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Realtime admin channel fallback:", err);
      }
    }

    // 2. BroadcastChannel: Instant zero-latency cross-tab notification (<5ms!)
    let bc = null;
    try {
      bc = new BroadcastChannel("forno_orders_channel");
      bc.onmessage = (msg) => {
        if (msg.data?.type === "NEW_ORDER") {
          playOrderAlertChime();
          loadOrders();
        }
      };
    } catch (e) {}

    // 3. Storage Event: Fires across browser tabs immediately on new order ping
    const handleStorage = (e) => {
      if (e.key === "forno_new_order_ping") {
        playOrderAlertChime();
        loadOrders();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Focus Event: Instant sync when switching back to dashboard tab
    const handleFocus = () => {
      loadOrders();
    };
    window.addEventListener("focus", handleFocus);

    // 5. Active fast polling fallback: checks every 2.5s (2500ms)
    const syncTimer = setInterval(() => {
      loadOrders();
    }, 2500);

    return () => {
      clearInterval(syncTimer);
      if (channel && isSupabaseLive) {
        supabaseClient.removeChannel(channel);
      }
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated]);

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
      formPayload.append("price_small", formData.price_small || "");
      formPayload.append("price_large", formData.price_large || "");
      if (formData.price_small || formData.price_large) {
        formPayload.append("size_prices", JSON.stringify({
          small: Number(formData.price_small) || Math.round((Number(formData.price) || 0) * 0.85),
          med: Number(formData.price) || 0,
          large: Number(formData.price_large) || Math.round((Number(formData.price) || 0) * 1.25),
        }));
      }
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
      price_small: "",
      price_large: "",
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
              autoComplete="email"
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
              autoComplete="current-password"
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

  // Robust Filter orders by selected time period (Cairo / UTC / Local ISO resilience)
  const pad = (n) => String(n).padStart(2, "0");
  const extractDateKeys = (rawDate) => {
    if (!rawDate) return { localDay: "", localMonth: "", utcDay: "", utcMonth: "", rawDay: "", rawMonth: "" };
    const str = String(rawDate).trim();
    const rawDayMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const rawDay = rawDayMatch ? `${rawDayMatch[1]}-${rawDayMatch[2]}-${rawDayMatch[3]}` : "";
    const rawMonth = rawDayMatch ? `${rawDayMatch[1]}-${rawDayMatch[2]}` : "";

    const d = new Date(rawDate);
    if (isNaN(d.getTime())) {
      return { localDay: rawDay, localMonth: rawMonth, utcDay: rawDay, utcMonth: rawMonth, rawDay, rawMonth };
    }
    const localDay = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const localMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const utcDay = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    const utcMonth = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
    return { localDay, localMonth, utcDay, utcMonth, rawDay, rawMonth };
  };

  const filteredOrders = (() => {
    if (!orders || orders.length === 0) return [];
    if (periodFilter === "all") return orders;

    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const todayUtc = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
    const thisMonthLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const thisMonthUtc = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;

    const yLocal = new Date(now);
    yLocal.setDate(yLocal.getDate() - 1);
    const yesterdayLocal = `${yLocal.getFullYear()}-${pad(yLocal.getMonth() + 1)}-${pad(yLocal.getDate())}`;

    const yUtc = new Date(now);
    yUtc.setUTCDate(yUtc.getUTCDate() - 1);
    const yesterdayUtc = `${yUtc.getUTCFullYear()}-${pad(yUtc.getUTCMonth() + 1)}-${pad(yUtc.getUTCDate())}`;

    return orders.filter((o) => {
      const dateVal = o.created_at || o.createdAt || o.date || o.created_time;
      if (!dateVal) return false;
      const { localDay, localMonth, utcDay, utcMonth, rawDay, rawMonth } = extractDateKeys(dateVal);

      if (periodFilter === "today") {
        return (
          localDay === todayLocal ||
          utcDay === todayUtc ||
          rawDay === todayLocal ||
          rawDay === todayUtc ||
          localDay === todayUtc ||
          utcDay === todayLocal
        );
      }
      if (periodFilter === "yesterday") {
        return (
          localDay === yesterdayLocal ||
          utcDay === yesterdayUtc ||
          rawDay === yesterdayLocal ||
          rawDay === yesterdayUtc
        );
      }
      if (periodFilter === "this_month") {
        return (
          localMonth === thisMonthLocal ||
          utcMonth === thisMonthUtc ||
          rawMonth === thisMonthLocal ||
          rawMonth === thisMonthUtc
        );
      }
      if (periodFilter === "custom_date") {
        return (
          localDay === selectedCustomDate ||
          utcDay === selectedCustomDate ||
          rawDay === selectedCustomDate
        );
      }
      if (periodFilter === "custom_month") {
        return (
          localMonth === selectedCustomMonth ||
          utcMonth === selectedCustomMonth ||
          rawMonth === selectedCustomMonth
        );
      }
      return true;
    });
  })();

  const pendingCount = filteredOrders.filter((o) => o.payment_status === "pending").length;

  // PAID REVENUE (الأرباح المدفوعة فقط مع استبعاد الملغي والمرفوض)
  const paidOrders = filteredOrders.filter(
    (o) => (o.payment_status === "paid" || o.order_status === "completed") &&
           o.order_status !== "cancelled" &&
           o.payment_status !== "rejected"
  );
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total ?? o.total_price ?? 0)), 0);
  const paidOrdersCount = paidOrders.length;

  // إجمالي الكاش (Total Cash)
  const cashPaidOrders = paidOrders.filter((o) => o.payment_method === "cash" || !o.payment_method);
  const totalCash = cashPaidOrders.reduce((sum, o) => sum + (Number(o.total ?? o.total_price ?? 0)), 0);

  // إجمالي المحافظ / فيزا / إنستاباي (Total Wallets & Online)
  const walletPaidOrders = paidOrders.filter((o) =>
    ["visa", "wallet", "vodafone", "instapay"].includes(String(o.payment_method).toLowerCase())
  );
  const totalWallets = walletPaidOrders.reduce((sum, o) => sum + (Number(o.total ?? o.total_price ?? 0)), 0);

  // إجمالي العمليات المكنسلة (Total Cancelled Orders)
  const cancelledOrders = filteredOrders.filter(
    (o) => o.order_status === "cancelled" || o.payment_status === "rejected"
  );
  const cancelledCount = cancelledOrders.length;
  const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (Number(o.total ?? o.total_price ?? 0)), 0);

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
        {activeTab === "orders" && (
          <>
            {/* Dashboard Toolbar with Slick Filter Trigger */}
            <div style={{
              display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(243, 233, 220, 0.08)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: "var(--disp)", fontSize: "28px", letterSpacing: "1.5px", margin: 0, color: "#f3e9dc" }}>
                EXECUTIVE OVERVIEW
              </h2>
              {periodFilter !== "all" && (
                <span style={{
                  fontSize: "10px",
                  fontWeight: "900",
                  letterSpacing: "1.5px",
                  background: "rgba(255, 122, 46, 0.18)",
                  color: "#ff7a2e",
                  border: "1px solid rgba(255, 122, 46, 0.45)",
                  padding: "4px 12px",
                  borderRadius: "99px",
                  textTransform: "uppercase",
                  boxShadow: "0 0 14px rgba(255, 122, 46, 0.25)"
                }}>
                  ACTIVE FILTER ON
                </span>
              )}
            </div>
            <div style={{ fontSize: "12.5px", color: "#9a8b7a", marginTop: "5px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>Period:</span>
              <b style={{ color: "#ffb347", letterSpacing: "0.5px" }}>
                {periodFilter === "all" && "All Time (Complete Records)"}
                {periodFilter === "today" && "Today's Orders"}
                {periodFilter === "yesterday" && "Yesterday's Orders"}
                {periodFilter === "this_month" && "Current Month"}
                {periodFilter === "custom_date" && `Specific Date: ${selectedCustomDate}`}
                {periodFilter === "custom_month" && `Specific Month: ${selectedCustomMonth}`}
              </b>
              {periodFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setPeriodFilter("all")}
                  style={{
                    background: "rgba(194, 43, 26, 0.15)",
                    border: "1px solid rgba(194, 43, 26, 0.35)",
                    color: "#ff8b7a",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                    marginLeft: "4px",
                  }}
                >
                  RESET ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Buttons + Slick Filter Trigger Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.02)", padding: "4px", borderRadius: "99px", border: "1px solid rgba(243, 233, 220, 0.08)" }}>
              {[
                { id: "all", label: "ALL TIME" },
                { id: "today", label: "TODAY" },
                { id: "yesterday", label: "YESTERDAY" },
                { id: "this_month", label: "THIS MONTH" },
              ].map((pill) => {
                const isAct = periodFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setPeriodFilter(pill.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "99px",
                      border: isAct ? "1.5px solid #ff7a2e" : "1px solid transparent",
                      background: isAct ? "linear-gradient(135deg, #ff7a2e, #e05a12)" : "transparent",
                      color: isAct ? "#140d08" : "#9a8b7a",
                      fontSize: "10.5px",
                      fontWeight: isAct ? "900" : "700",
                      letterSpacing: "1px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isAct ? "0 4px 14px rgba(255, 122, 46, 0.4)" : "none",
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 18px",
                background: periodFilter.startsWith("custom_")
                  ? "linear-gradient(135deg, rgba(255,122,46,0.3) 0%, rgba(20,13,8,0.98) 100%)"
                  : "linear-gradient(135deg, #24140b 0%, #140d08 100%)",
                border: periodFilter.startsWith("custom_") ? "1.5px solid #ff7a2e" : "1.5px solid rgba(255, 122, 46, 0.35)",
                borderRadius: "14px",
                color: periodFilter.startsWith("custom_") ? "#ffb347" : "#f3e9dc",
                fontSize: "11.5px",
                fontWeight: "900",
                letterSpacing: "1.2px",
                cursor: "pointer",
                boxShadow: periodFilter.startsWith("custom_")
                  ? "0 8px 25px rgba(255,122,46,0.38), 0 0 15px rgba(255,122,46,0.25)"
                  : "0 8px 24px rgba(0,0,0,0.6)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: "rgba(255, 122, 46, 0.15)",
                border: "1px solid rgba(255, 122, 46, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff7a2e"
              }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </div>
     
              {periodFilter.startsWith("custom_") && (
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#ff7a2e",
                  boxShadow: "0 0 10px #ff7a2e",
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Redesigned Filter Modal Dialog */}
        {isFilterModalOpen && (
          <div
            onClick={() => setIsFilterModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              background: "rgba(5, 3, 2, 0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "620px",
                background: "linear-gradient(180deg, #1c1109 0%, #100a06 100%)",
                border: "1.5px solid rgba(255, 122, 46, 0.45)",
                borderRadius: "26px",
                padding: "32px 30px",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 122, 46, 0.2)",
                boxSizing: "border-box",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Modal Head */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", borderBottom: "1px solid rgba(243, 233, 220, 0.1)", paddingBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    background: "rgba(255, 122, 46, 0.15)",
                    border: "1px solid rgba(255, 122, 46, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff7a2e",
                    boxShadow: "0 0 20px rgba(255, 122, 46, 0.25)"
                  }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--disp)", fontSize: "25px", letterSpacing: "1px", margin: 0, color: "#fff" }}>
                      FILTER TIMEFRAME
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "#9a8b7a", margin: "4px 0 0" }}>
                      Select a preset or specify custom dates to refine dashboard statistics.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    color: "#9a8b7a",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 1. Quick Presets (4 interactive cards) */}
              <div style={{ marginBottom: "22px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", letterSpacing: "1.5px", color: "#e8b04b", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
                  ⚡ QUICK TIMEFRAMES:
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: "all", title: "ALL TIME", icon: "🌐", desc: "Lifetime restaurant records" },
                    { id: "today", title: "TODAY", icon: "☀️", desc: "Live orders from today" },
                    { id: "yesterday", title: "YESTERDAY", icon: "⏪", desc: "Previous day's volume" },
                    { id: "this_month", title: "THIS MONTH", icon: "🗓️", desc: "Current month to date" },
                  ].map((p) => {
                    const active = periodFilter === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setPeriodFilter(p.id);
                          setIsFilterModalOpen(false);
                        }}
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(255,122,46,0.2) 0%, rgba(36,20,11,0.9) 100%)"
                            : "rgba(255, 255, 255, 0.03)",
                          border: active ? "1.5px solid #ff7a2e" : "1px solid rgba(243, 233, 220, 0.1)",
                          borderRadius: "16px",
                          padding: "16px 18px",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          position: "relative",
                          boxShadow: active ? "0 6px 20px rgba(255, 122, 46, 0.25)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "22px" }}>{p.icon}</span>
                          {active && (
                            <span style={{
                              background: "#ff7a2e",
                              color: "#140d08",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "11px",
                              fontWeight: "900",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: "var(--disp)", fontSize: "17px", color: active ? "#ffb347" : "#f3e9dc", letterSpacing: "1px" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9a8b7a", marginTop: "4px", lineHeight: "1.4" }}>
                          {p.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Date Range Pickers (2 Cards) */}
              <div style={{ marginBottom: "22px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", letterSpacing: "1.5px", color: "#e8b04b", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
                  📅 OR CHOOSE CUSTOM DATE / MONTH:
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Specific Day Picker Card */}
                  <div
                    onClick={() => setPeriodFilter("custom_date")}
                    style={{
                      background: periodFilter === "custom_date"
                        ? "linear-gradient(135deg, rgba(255,122,46,0.2) 0%, rgba(36,20,11,0.9) 100%)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: periodFilter === "custom_date" ? "1.5px solid #ff7a2e" : "1px solid rgba(243, 233, 220, 0.1)",
                      borderRadius: "16px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      boxShadow: periodFilter === "custom_date" ? "0 6px 20px rgba(255, 122, 46, 0.25)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "20px" }}>📆</span>
                      <b style={{ fontSize: "13px", letterSpacing: "1px", color: periodFilter === "custom_date" ? "#ffb347" : "#fff" }}>
                        SPECIFIC DAY
                      </b>
                    </div>
                    <p style={{ fontSize: "10.5px", color: "#9a8b7a", margin: "0 0 10px" }}>
                      Pick any single calendar date:
                    </p>
                    <input
                      type="date"
                      value={selectedCustomDate}
                      onChange={(e) => {
                        setSelectedCustomDate(e.target.value);
                        setPeriodFilter("custom_date");
                      }}
                      style={{
                        width: "100%",
                        background: "#120a05",
                        border: "1px solid rgba(255, 122, 46, 0.35)",
                        borderRadius: "10px",
                        padding: "9px 12px",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: "700",
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "pointer"
                      }}
                    />
                  </div>

                  {/* Specific Month Picker Card */}
                  <div
                    onClick={() => setPeriodFilter("custom_month")}
                    style={{
                      background: periodFilter === "custom_month"
                        ? "linear-gradient(135deg, rgba(255,122,46,0.2) 0%, rgba(36,20,11,0.9) 100%)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: periodFilter === "custom_month" ? "1.5px solid #ff7a2e" : "1px solid rgba(243, 233, 220, 0.1)",
                      borderRadius: "16px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      boxShadow: periodFilter === "custom_month" ? "0 6px 20px rgba(255, 122, 46, 0.25)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "20px" }}>📊</span>
                      <b style={{ fontSize: "13px", letterSpacing: "1px", color: periodFilter === "custom_month" ? "#ffb347" : "#fff" }}>
                        SPECIFIC MONTH
                      </b>
                    </div>
                    <p style={{ fontSize: "10.5px", color: "#9a8b7a", margin: "0 0 10px" }}>
                      Pick a month & year:
                    </p>
                    <input
                      type="month"
                      value={selectedCustomMonth}
                      onChange={(e) => {
                        setSelectedCustomMonth(e.target.value);
                        setPeriodFilter("custom_month");
                      }}
                      style={{
                        width: "100%",
                        background: "#120a05",
                        border: "1px solid rgba(255, 122, 46, 0.35)",
                        borderRadius: "10px",
                        padding: "9px 12px",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: "700",
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "pointer"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Status Summary Pill */}
              <div style={{
                background: "rgba(255, 122, 46, 0.08)",
                border: "1px dashed rgba(255, 122, 46, 0.35)",
                borderRadius: "16px",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <div>
                  <span style={{ fontSize: "10.5px", color: "#9a8b7a", letterSpacing: "1px", display: "block" }}>CURRENT SELECTION</span>
                  <b style={{ fontSize: "14px", color: "#ffb347", letterSpacing: "0.5px" }}>
                    {periodFilter === "all" && "All Time (Complete Records)"}
                    {periodFilter === "today" && "Today's Orders"}
                    {periodFilter === "yesterday" && "Yesterday's Orders"}
                    {periodFilter === "this_month" && "Current Month"}
                    {periodFilter === "custom_date" && `Specific Date: ${selectedCustomDate}`}
                    {periodFilter === "custom_month" && `Specific Month: ${selectedCustomMonth}`}
                  </b>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "10.5px", color: "#9a8b7a", display: "block" }}>MATCHING ORDERS</span>
                  <b style={{ fontSize: "17px", color: "#57a84f" }}>{filteredOrders.length}</b>
                </div>
              </div>

              {/* 4. Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setPeriodFilter("all")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "99px",
                    border: "1px solid rgba(243, 233, 220, 0.15)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#f3e9dc",
                    fontWeight: "800",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  RESET TO ALL TIME
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{
                    flex: 1.4,
                    padding: "14px",
                    borderRadius: "99px",
                    border: "none",
                    background: "linear-gradient(135deg, #ff7a2e 0%, #e05a12 100%)",
                    color: "#140d08",
                    fontWeight: "900",
                    fontSize: "12px",
                    letterSpacing: "1.5px",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(255, 122, 46, 0.4)",
                    transition: "all 0.2s ease"
                  }}
                >
                  APPLY & CLOSE ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROW 1: FINANCIAL OVERVIEW (4 High-Impact KPI Cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* 1. PAID REVENUE */}
          <div style={{
            background: "linear-gradient(135deg, rgba(87,168,79,0.12) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(87,168,79,0.45)",
            borderRadius: "20px",
            padding: "22px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(87,168,79,0.12)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#57a84f", letterSpacing: "2px", fontWeight: "900" }}>PAID REVENUE</span>
              <span style={{ fontSize: "14px" }}>💰</span>
            </div>
            <div style={{ fontSize: "34px", fontFamily: "var(--disp)", color: "#57a84f", marginTop: "8px", letterSpacing: "0.5px" }}>
              EGP {paidRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "6px", fontWeight: "600" }}>
              Net Verified Sales
            </div>
          </div>

          {/* 2. CASH REVENUE */}
          <div style={{
            background: "linear-gradient(135deg, rgba(232,176,75,0.08) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(232,176,75,0.35)",
            borderRadius: "20px",
            padding: "22px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(232,176,75,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#e8b04b", letterSpacing: "2px", fontWeight: "900" }}>CASH REVENUE</span>
              <span style={{ fontSize: "14px" }}>💵</span>
            </div>
            <div style={{ fontSize: "32px", fontFamily: "var(--disp)", color: "#ffb347", marginTop: "8px", letterSpacing: "0.5px" }}>
              EGP {totalCash.toLocaleString()}
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "6px", fontWeight: "600" }}>
              {cashPaidOrders.length} Paid in Cash
            </div>
          </div>

          {/* 3. WALLETS & ONLINE */}
          <div style={{
            background: "linear-gradient(135deg, rgba(79,195,247,0.08) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(79,195,247,0.35)",
            borderRadius: "20px",
            padding: "22px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(79,195,247,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#4fc3f7", letterSpacing: "2px", fontWeight: "900" }}>WALLETS & ONLINE</span>
              <span style={{ fontSize: "14px" }}>📱</span>
            </div>
            <div style={{ fontSize: "32px", fontFamily: "var(--disp)", color: "#4fc3f7", marginTop: "8px", letterSpacing: "0.5px" }}>
              EGP {totalWallets.toLocaleString()}
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "6px", fontWeight: "600" }}>
              {walletPaidOrders.length} Paid via Vodafone / InstaPay
            </div>
          </div>

          {/* 4. CANCELLED / REJECTED */}
          <div style={{
            background: "linear-gradient(135deg, rgba(194,43,26,0.1) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(194,43,26,0.4)",
            borderRadius: "20px",
            padding: "22px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(194,43,26,0.12)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#ff8b7a", letterSpacing: "2px", fontWeight: "900" }}>CANCELLED / REJECTED</span>
              <span style={{ fontSize: "14px" }}>✕</span>
            </div>
            <div style={{ fontSize: "32px", fontFamily: "var(--disp)", color: "#ff8b7a", marginTop: "8px", letterSpacing: "0.5px" }}>
              {cancelledCount} <span style={{ fontSize: "14px", fontFamily: "sans-serif", fontWeight: "700" }}>ORDERS</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "6px", fontWeight: "600" }}>
              EGP {cancelledRevenue.toLocaleString()} Lost Revenue
            </div>
          </div>
        </div>

        {/* ROW 2: OPERATIONAL & VOLUME (3 Balanced Large Cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* 5. COMPLETED ORDERS */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(87,168,79,0.3)",
            borderRadius: "20px",
            padding: "20px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>COMPLETED ORDERS</span>
              <span style={{ fontSize: "13px", color: "#57a84f" }}>✓</span>
            </div>
            <div style={{ fontSize: "36px", fontFamily: "var(--disp)", color: "#57a84f", marginTop: "6px" }}>
              {paidOrdersCount}
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "4px" }}>
              Successfully Delivered & Fulfilled
            </div>
          </div>

          {/* 6. PENDING CASHIER */}
          <div style={{
            background: pendingCount > 0 ? "linear-gradient(135deg, rgba(255,122,46,0.16) 0%, rgba(20,13,8,0.95) 100%)" : "rgba(20,13,8,0.95)",
            border: pendingCount > 0 ? "1.5px solid #ff7a2e" : "1px solid rgba(243,233,220,0.12)",
            borderRadius: "20px",
            padding: "20px 24px",
            boxShadow: pendingCount > 0 ? "0 10px 30px rgba(0,0,0,0.7), 0 0 25px rgba(255,122,46,0.25)" : "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: pendingCount > 0 ? "#ffb347" : "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>AWAITING CASHIER</span>
              <span style={{ fontSize: "13px" }}>⏳</span>
            </div>
            <div style={{ fontSize: "36px", fontFamily: "var(--disp)", color: pendingCount > 0 ? "#ff7a2e" : "#9a8b7a", marginTop: "6px" }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: "11.5px", color: pendingCount > 0 ? "#ffb347" : "#9a8b7a", marginTop: "4px", fontWeight: pendingCount > 0 ? "700" : "400" }}>
              {pendingCount > 0 ? "Requires Immediate Attention 🔥" : "All Orders Verified"}
            </div>
          </div>

          {/* 7. TOTAL ORDERS IN PERIOD */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(20,13,8,0.95) 100%)",
            border: "1px solid rgba(243,233,220,0.18)",
            borderRadius: "20px",
            padding: "20px 24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>TOTAL IN PERIOD</span>
              <span style={{ fontSize: "13px" }}>📊</span>
            </div>
            <div style={{ fontSize: "36px", fontFamily: "var(--disp)", color: "#f3e9dc", marginTop: "6px" }}>
              {filteredOrders.length}
            </div>
            <div style={{ fontSize: "11.5px", color: "#9a8b7a", marginTop: "4px" }}>
              Total Logged Orders in Period
            </div>
          </div>
        </div>
      </>
    )}

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
            onClick={() => {
              setActiveTab("items");
              loadMenuData();
            }}
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
            onClick={() => {
              setActiveTab("categories");
              loadMenuData();
            }}
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

          {/* تم تعليق زر الكوبونات في الداشبورد (ctrl + ظ) */}
          {/*
          <button
            onClick={() => setActiveTab("coupons")}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "99px",
              border: "1px solid " + (activeTab === "coupons" ? "#ff7a2e" : "rgba(243,233,220,0.15)"),
              background: activeTab === "coupons" ? "#ff7a2e" : "transparent",
              color: activeTab === "coupons" ? "#140d08" : "#9a8b7a",
              fontWeight: "800",
              fontSize: "10px",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            COUPONS ({coupons.length}) 🎟️
          </button>
          */}
        </div>

        {/* Tab 0: Orders */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={filteredOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            onSelectReceipt={(url) => setSelectedReceiptModal(url)}
            onResetOrders={handleResetOrders}
            onRefreshOrders={loadOrders}
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
              const baseP = Number(it.price) || 0;
              const szP = it.size_prices || {};
              setFormData({
                name_en: parsedName.en,
                name_ar: parsedName.ar,
                item_id: it.item_id || it.id || "",
                price: szP.med || it.price || "",
                price_small: szP.small || (baseP ? Math.round(baseP * 0.85) : ""),
                price_large: szP.large || (baseP ? Math.round(baseP * 1.25) : ""),
                is_simple: it.is_simple || false,
                categories: it.categories || [],
                ingredients_en: enList.join(", "),
                ingredients_ar: arList.join(", "),
                image_url: it.image_url || resolveAdminItemImage(it) || "",
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

        {/* Tab 5: Promo Codes & Coupons - تم التعليق بناءً على الطلب (ctrl + ظ) */}
        {/*
        {activeTab === "coupons" && (
          <CouponsTab
            coupons={coupons}
            onRefresh={loadCoupons}
            loading={loadingCoupons}
          />
        )}
        */}

        {/* Payment Receipt Modal */}
        <ReceiptModal
          receiptUrl={selectedReceiptModal}
          onClose={() => setSelectedReceiptModal(null)}
        />
      </main>
    </div>
  );
}