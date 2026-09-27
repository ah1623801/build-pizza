// src/components/admin/OrdersTab.js
"use client";

import { useState, useMemo } from "react";
import { escapeHtml } from "@/lib/security";

// إزالة أي ذكر لكلمة cm وتنسيق اسم المنتج
export function cleanItemName(name) {
  if (!name) return "";
  return String(name)
    .replace(/\s*\bcm\b/gi, "")
    .replace(/\(\s*(\d+)\s*\)/g, "($1)")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// استخراج وترتيب المكونات بالإنجليزية كنص عادي بدون أيقونات وبدون كلمة cm
export function parseItemIngredients(it) {
  if (!it) return [];
  const parts = [];

  if (it.snap && typeof it.snap === "object") {
    // 1. الحجم بالإنجليزية وبدون كلمة cm نهائياً
    const szMap = { small: "Small (24)", med: "Medium (30)", large: "Large (36)" };
    if (it.snap.size) {
      parts.push(szMap[it.snap.size] || String(it.snap.size).replace(/\s*\bcm\b/gi, ""));
    }

    // 2. العجينة بالإنجليزية
    if (it.snap.dough) {
      const dMap = {
        thin: "Thin Crust",
        classic: "Classic Crust",
        thick: "Thick Crust",
        cheese: "Cheese Stuffed Crust"
      };
      parts.push(dMap[it.snap.dough] || `${it.snap.dough} Crust`);
    }

    // 3. الصلصة بالإنجليزية
    if (it.snap.sauce) {
      const sMap = {
        tomato: "Tomato Sauce",
        spicy: "Spicy Tomato Sauce",
        bbq: "BBQ Sauce",
        garlic: "White Garlic Sauce"
      };
      parts.push(sMap[it.snap.sauce] || `${it.snap.sauce} Sauce`);
    }

    // 4. الجبنة بالإنجليزية
    if (it.snap.cheese) {
      const cMap = {
        mozzarella: "Mozzarella",
        extra: "Extra Cheese",
        four: "Four Cheese",
        smoked: "Smoked Cheese"
      };
      parts.push(cMap[it.snap.cheese] || it.snap.cheese);
    }

    // 5. اللحوم بالإنجليزية
    if (it.snap.meats && typeof it.snap.meats === "object") {
      const mMap = {
        pepperoni: "Pepperoni",
        beef: "Ground Beef",
        chicken: "Seasoned Chicken",
        sausage: "Italian Sausage"
      };
      Object.entries(it.snap.meats).forEach(([m, amt]) => {
        const extra = amt === "more" ? " (+Extra)" : amt === "less" ? " (Light)" : "";
        parts.push((mMap[m] || m) + extra);
      });
    }

    // 6. الخضروات بالإنجليزية
    if (Array.isArray(it.snap.vegs)) {
      const vMap = {
        olives: "Black Olives",
        mushroom: "Mushrooms",
        onion: "Red Onions",
        greenPepper: "Green Peppers",
        jalapeno: "Jalapeños",
        basil: "Fresh Basil"
      };
      it.snap.vegs.forEach((v) => {
        parts.push(vMap[v] || v);
      });
    }

    // 7. الإضافات بالإنجليزية
    if (Array.isArray(it.snap.extras)) {
      const xMap = {
        extraCheese: "Extra Cheese",
        chili: "Chili Flakes",
        garlic: "Garlic Sauce",
        truffle: "Truffle Oil",
        bbqDrizzle: "BBQ Drizzle"
      };
      it.snap.extras.forEach((x) => {
        parts.push(xMap[x] || x);
      });
    }
  }

  // Fallback for raw text without cm
  if (parts.length === 0) {
    const raw = it.ingredients_text || it.meta || (Array.isArray(it.ingredients) ? it.ingredients.join(" · ") : it.ingredients) || (Array.isArray(it.ing) ? it.ing.join(" · ") : "");
    if (raw) {
      const cleanRaw = String(raw).replace(/\s*\bcm\b/gi, "");
      const items = cleanRaw.split(/[·|,]+/).map((s) => s.trim()).filter(Boolean);
      items.forEach((p) => parts.push(p));
    }
  }

  return parts;
}

// عرض المكونات كنص عادي مرتب بدون أيقونات
export function IngredientChips({ item }) {
  const parts = parseItemIngredients(item);
  if (!parts || parts.length === 0) return null;

  return (
    <div style={{ fontSize: "11px", color: "rgba(243, 233, 220, 0.72)", lineHeight: "1.5", marginTop: "4px" }}>
      {parts.join(" · ")}
    </div>
  );
}

// دالة نصية للإيصال وتصدير CSV
function getItemIngredients(it) {
  const parts = parseItemIngredients(it);
  return parts.join(" · ");
}

export default function OrdersTab({ orders, onUpdateStatus, onSelectReceipt, onResetOrders, onRefreshOrders }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterView, setFilterView] = useState("all"); // 'all' | 'pending' | 'kitchen' | 'archived'

  // فلترة فورية تدعم البحث برقم الطلب (مع # أو بدونها)، اسم العميل، رقم الهاتف، أو العنوان
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const rawQ = searchQuery.toLowerCase().trim();
    const cleanQ = rawQ.replace(/^#/, "").trim();
    const qNoSpace = cleanQ.replace(/\s+/g, "");

    return orders.filter((o) => {
      const orderNum = String(o.order_number || o.id || "").toLowerCase();
      const custName = String(o.customer_name || o.name || "").toLowerCase();
      const custPhone = String(o.customer_phone || o.phone || "").replace(/\s+/g, "");
      const custAddress = String(o.customer_address || "").toLowerCase();

      const matchOrderNum = orderNum.includes(cleanQ) || orderNum.includes(rawQ);
      const matchName = custName.includes(rawQ);
      const matchPhone = qNoSpace ? custPhone.includes(qNoSpace) : false;
      const matchAddress = custAddress.includes(rawQ);

      const matchItems = (o.items || []).some((it) =>
        String(it.name || "").toLowerCase().includes(rawQ)
      );

      return matchOrderNum || matchName || matchPhone || matchAddress || matchItems;
    });
  }, [orders, searchQuery]);

  const pendingOrders = filteredOrders.filter((o) => o.payment_status === "pending");
  const paidActiveOrders = filteredOrders.filter(
    (o) => o.payment_status === "paid" && (o.order_status === "preparing" || o.order_status === "ready")
  );
  const archivedOrders = filteredOrders.filter(
    (o) => o.order_status === "completed" || o.payment_status === "rejected"
  );

  // حساب إجمالي المبالغ للطلبات المعروضة حالياً
  const filteredTotalValue = useMemo(() => {
    return filteredOrders.reduce((acc, o) => acc + (Number(o.total ?? o.total_price ?? 0)), 0);
  }, [filteredOrders]);

  // 1. طباعة إيصال / بون مطبخ حراري مع تطهير XSS
  const handlePrintTicket = (ord) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const itemsHtml = (ord.items || [])
      .map(
        (it) => {
          const ings = getItemIngredients(it);
          return `
          <div style="margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
              <span>${escapeHtml(cleanItemName(it.name))} × ${Math.max(1, parseInt(it.qty, 10) || 1)}</span>
              <span>EGP ${(Number(it.unit) || 0) * (Math.max(1, parseInt(it.qty, 10) || 1))}</span>
            </div>
            ${ings ? `<div style="font-size: 11px; color: #111; margin-top: 4px; background: #f5f5f5; padding: 4px 6px; border-radius: 4px; line-height: 1.3;"><b>Ingredients:</b> ${escapeHtml(ings)}</div>` : ""}
          </div>
        `;
        }
      )
      .join("");

    const dateStr = ord.created_at
      ? new Date(ord.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
      : new Date().toLocaleString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${escapeHtml(ord.order_number)} - FORNO Kitchen Ticket</title>
          <style>
            @page { size: 80mm auto; margin: 5mm; }
            body {
              font-family: monospace, sans-serif;
              width: 70mm;
              margin: 0 auto;
              color: #000;
              font-size: 12px;
              line-height: 1.4;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .header { margin-bottom: 10px; }
            .footer { margin-top: 15px; font-size: 10px; }
            @media print {
              body { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="center header">
            <h2 style="margin: 0; font-size: 18px; letter-spacing: 1px;">FORNO PIZZA</h2>
            <div style="font-size: 10px;">WOOD-FIRED KITCHEN · CAIRO</div>
            <div class="bold" style="font-size: 15px; margin-top: 6px;">ORDER #${escapeHtml(ord.order_number)}</div>
            <div style="font-size: 10px;">${escapeHtml(dateStr)}</div>
          </div>
          <div class="divider"></div>
          <div>
            <div><b>CUSTOMER:</b> ${escapeHtml(ord.customer_name)}</div>
            <div><b>PHONE:</b> ${escapeHtml(ord.customer_phone)}</div>
            <div><b>ADDRESS:</b> ${escapeHtml(ord.customer_address)}</div>
            <div><b>PAYMENT:</b> ${escapeHtml(ord.payment_method?.toUpperCase())} (${escapeHtml(ord.payment_status?.toUpperCase())})</div>
          </div>
          <div class="divider"></div>
          <div>
            <div class="bold" style="margin-bottom: 6px;">ORDER ITEMS:</div>
            ${itemsHtml}
          </div>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900;">
            <span>TOTAL DUE:</span>
            <span>EGP ${escapeHtml(ord.total)}</span>
          </div>
          <div class="divider"></div>
          <div class="center footer">
            <div>THANK YOU FOR CHOOSING FORNO</div>
            <div>*** KITCHEN COPY ***</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 2. تصدير الطلبات إلى ملف Excel CSV محمي من ثغرات حقن المعادلات (Formula Injection)
  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const sanitizeCsvField = (val) => {
      let str = String(val || "").replace(/"/g, '""');
      // حماية ضد Formula Injection (منع تنفيذ أي معادلات تبدأ بـ = أو + أو - أو @)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = ["Order #", "Date", "Customer Name", "Phone", "Address", "Items & Ingredients", "Items Count", "Total (EGP)", "Payment Method", "Payment Status", "Order Status"];
    const rows = orders.map((o) => {
      const itemsCount = (o.items || []).reduce((acc, it) => acc + (it.qty || 1), 0);
      const itemsDetailed = (o.items || [])
        .map((it) => {
          const ings = getItemIngredients(it);
          return `${cleanItemName(it.name)} (x${it.qty || 1})${ings ? ` [${ings}]` : ""}`;
        })
        .join(" | ");
      const safeDate = o.created_at ? new Date(o.created_at).toISOString().replace("T", " ").slice(0, 19) : "";
      return [
        sanitizeCsvField(o.order_number),
        sanitizeCsvField(safeDate),
        sanitizeCsvField(o.customer_name),
        sanitizeCsvField(o.customer_phone),
        sanitizeCsvField(o.customer_address),
        sanitizeCsvField(itemsDetailed),
        itemsCount,
        Number(o.total) || 0,
        sanitizeCsvField(o.payment_method),
        sanitizeCsvField(o.payment_status),
        sanitizeCsvField(o.order_status),
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `forno_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {/* Top Action Bar: Search, Filters & CSV Export */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
        {/* Search Input */}
        <div style={{ display: "flex", flex: "1 1 300px", gap: "10px", alignItems: "center", background: "#140d08", padding: "12px 18px", borderRadius: "14px", border: "1px solid rgba(243,233,220,0.1)" }}>
          <span style={{ fontSize: "14px" }}>🔍</span>
          <input
            type="text"
            placeholder="SEARCH BY ORDER #, CUSTOMER NAME, OR PHONE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "#f3e9dc",
              fontSize: "12px",
              letterSpacing: "1px",
              outline: "none"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", color: "#ff8b7a", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* View Filter Pills & CSV Export */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterView("all")}
            style={{
              padding: "8px 14px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterView === "all" ? "#ff7a2e" : "rgba(243,233,220,0.1)",
              background: filterView === "all" ? "#ff7a2e" : "transparent",
              color: filterView === "all" ? "#140d08" : "#f3e9dc"
            }}
          >
            ALL ({filteredOrders.length})
          </button>
          <button
            onClick={() => setFilterView("pending")}
            style={{
              padding: "8px 14px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterView === "pending" ? "#ff7a2e" : "rgba(243,233,220,0.1)",
              background: filterView === "pending" ? "#ff7a2e" : "transparent",
              color: filterView === "pending" ? "#140d08" : "#ff7a2e"
            }}
          >
            PENDING ({pendingOrders.length})
          </button>
          <button
            onClick={() => setFilterView("kitchen")}
            style={{
              padding: "8px 14px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterView === "kitchen" ? "#e8b04b" : "rgba(243,233,220,0.1)",
              background: filterView === "kitchen" ? "#e8b04b" : "transparent",
              color: filterView === "kitchen" ? "#140d08" : "#e8b04b"
            }}
          >
            KITCHEN ({paidActiveOrders.length})
          </button>
          <button
            onClick={() => setFilterView("archived")}
            style={{
              padding: "8px 14px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterView === "archived" ? "#9a8b7a" : "rgba(243,233,220,0.1)",
              background: filterView === "archived" ? "#9a8b7a" : "transparent",
              color: filterView === "archived" ? "#140d08" : "#9a8b7a"
            }}
          >
            ARCHIVED ({archivedOrders.length})
          </button>

          <div style={{ background: "rgba(87,168,79,0.15)", border: "1px solid rgba(87,168,79,0.4)", borderRadius: "99px", padding: "7px 16px", color: "#57a84f", fontSize: "11px", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>💰 TOTAL:</span>
            <span style={{ color: "#fff" }}>EGP {filteredTotalValue.toLocaleString()}</span>
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              border: "1px solid rgba(87,168,79,0.5)",
              background: "rgba(87,168,79,0.15)",
              color: "#57a84f"
            }}
            title="Export orders to Excel CSV"
          >
            📥 EXPORT CSV
          </button>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.35)", padding: "7px 14px", borderRadius: "99px", fontSize: "11px", fontWeight: "800", color: "#25D366" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#25D366", boxShadow: "0 0 8px #25D366" }}></span>
            <span>LIVE SYNC</span>
          </div>

          {onResetOrders && (
            <button
              onClick={onResetOrders}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "99px",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
                border: "1px solid rgba(194,43,26,0.6)",
                background: "rgba(194,43,26,0.15)",
                color: "#ff8b7a",
                transition: "all 0.2s ease"
              }}
              title="Zero out all orders and metrics"
            >
              🗑️ RESET ALL ORDERS
            </button>
          )}
        </div>
      </div>

      {/* 1. قسم الطلبات قيد الدفع مع العداد */}
      {(filterView === "all" || filterView === "pending") && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#ff7a2e", letterSpacing: "1px", margin: 0 }}>
              🔥 PENDING PAYMENT ORDERS
            </h3>
            <span style={{ background: "#ff7a2e", color: "#140d08", padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: "900" }}>
              {pendingOrders.length}
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div style={{ padding: "25px", background: "#140d08", borderRadius: "16px", color: "#9a8b7a", textAlign: "center", fontSize: "12px", border: "1px solid rgba(243,233,220,0.08)" }}>
              NO ORDERS AWAITING PAYMENT.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" }}>
              {pendingOrders.map((ord) => (
                <div key={ord.id} style={{ background: "#140d08", border: "1px solid #ff7a2e", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.7)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(243,233,220,0.1)", paddingBottom: "10px", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontFamily: "Impact", fontSize: "20px", color: "#ffb347" }}>#{ord.order_number}</span>
                      <span style={{ marginLeft: "8px", fontSize: "10px", color: "#9a8b7a" }}>
                        {ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,122,46,0.15)", color: "#ffb347", fontWeight: "bold" }}>
                        {ord.payment_method?.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handlePrintTicket(ord)}
                        style={{ padding: "3px 8px", background: "rgba(243,233,220,0.1)", border: "none", color: "#f3e9dc", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                        title="Print kitchen receipt"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.6" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{ord.customer_name}</div>
                    {ord.customer_phone && (
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#ffb347", background: "rgba(255,179,71,0.12)", padding: "2px 8px", borderRadius: "6px", display: "inline-block", marginTop: "3px" }}>
                        📞 {ord.customer_phone}
                      </span>
                    )}
                    {ord.customer_address && (
                      <div style={{ color: "#9a8b7a", marginTop: "3px" }}>📍 {ord.customer_address}</div>
                    )}
                  </div>

                  {/* قائمة المنتجات مع المكونات بالإنجليزية ومرتبة كنص عادي بدون أيقونات */}
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "12px", marginBottom: "12px", maxHeight: "240px", overflowY: "auto", fontSize: "11px" }}>
                    {ord.items?.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: "10px", borderBottom: idx < (ord.items.length - 1) ? "1px dashed rgba(255,255,255,0.08)" : "none", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <b style={{ color: "#fff", fontSize: "12px" }}>{cleanItemName(it.name)}</b>
                          <span style={{ color: "#e8b04b", fontWeight: "bold" }}>× {it.qty} = EGP {(Number(it.unit) || 0) * (it.qty || 1)}</span>
                        </div>
                        <IngredientChips item={it} />
                      </div>
                    ))}
                    <div style={{ textAlign: "right", fontWeight: "900", color: "#ffb347", fontSize: "14px", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "6px" }}>
                      TOTAL: EGP {ord.total}
                    </div>
                  </div>

                  {ord.receipt_url && (
                    <button
                      onClick={() => onSelectReceipt(ord.receipt_url)}
                      style={{ width: "100%", padding: "8px", background: "rgba(255,122,46,0.15)", border: "1px solid #ff7a2e", color: "#ffb347", borderRadius: "8px", fontSize: "10px", fontWeight: "800", marginBottom: "12px", cursor: "pointer" }}
                    >
                      📄 VIEW PAYMENT RECEIPT
                    </button>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => onUpdateStatus(ord.id, "paid", "preparing")}
                      style={{ flex: 1, padding: "12px", background: "#57a84f", color: "#fff", border: "none", borderRadius: "99px", fontSize: "10px", fontWeight: "900", cursor: "pointer" }}
                    >
                      CONFIRM PAYMENT
                    </button>
                    <button
                      onClick={() => onUpdateStatus(ord.id, "rejected", "cancelled")}
                      style={{ padding: "12px 16px", background: "rgba(194,43,26,0.2)", border: "1px solid #c22b1a", color: "#ff8b7a", borderRadius: "99px", fontSize: "10px", fontWeight: "900", cursor: "pointer" }}
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. قسم المطبخ (الطلبات المدفوعة النشطة) */}
      {(filterView === "all" || filterView === "kitchen") && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "22px", color: "#e8b04b", letterSpacing: "1px", margin: 0 }}>
              🍕 ACTIVE KITCHEN ORDERS (PAID)
            </h3>
            <span style={{ background: "#e8b04b", color: "#140d08", padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: "900" }}>
              {paidActiveOrders.length}
            </span>
          </div>

          {paidActiveOrders.length === 0 ? (
            <div style={{ padding: "20px", background: "#140d08", borderRadius: "16px", color: "#9a8b7a", textAlign: "center", fontSize: "12px", border: "1px solid rgba(243,233,220,0.06)" }}>
              NO ACTIVE KITCHEN ORDERS.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
              {paidActiveOrders.map((ord) => (
                <div key={ord.id} style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "18px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <b style={{ fontFamily: "Impact", fontSize: "18px", color: "#fff" }}>#{ord.order_number}</b>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "99px", background: ord.order_status === "ready" ? "#57a84f" : "#ff7a2e", color: "#140d08", fontWeight: "900" }}>
                        {ord.order_status?.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handlePrintTicket(ord)}
                        style={{ padding: "3px 8px", background: "rgba(243,233,220,0.1)", border: "none", color: "#f3e9dc", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                        title="Print kitchen ticket"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9a8b7a", marginBottom: "10px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>{ord.customer_name}</div>
                    {ord.customer_phone && (
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#ffb347", background: "rgba(255,179,71,0.12)", padding: "2px 7px", borderRadius: "5px", display: "inline-block", marginTop: "2px" }}>
                        📞 {ord.customer_phone}
                      </span>
                    )}
                    <div style={{ marginTop: "4px" }}>Total: <b style={{ color: "#ffb347" }}>EGP {ord.total}</b></div>
                  </div>

                  {/* قائمة المكونات لتحضير الأوردر في المطبخ كنص عادي مرتب بدون أيقونات وبدون cm */}
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "10px", marginBottom: "12px", maxHeight: "220px", overflowY: "auto", fontSize: "11px" }}>
                    {ord.items?.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: "8px", borderBottom: idx < (ord.items.length - 1) ? "1px dashed rgba(255,255,255,0.06)" : "none", paddingBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <b style={{ color: "#fff", fontSize: "12px" }}>{cleanItemName(it.name)}</b>
                          <span style={{ color: "#e8b04b", fontWeight: "bold" }}>× {it.qty}</span>
                        </div>
                        <IngredientChips item={it} />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: "flex", gap: "6px" }}>
                    {ord.order_status === "preparing" && (
                      <button
                        onClick={() => onUpdateStatus(ord.id, "paid", "ready")}
                        style={{ flex: 1, padding: "10px", background: "#e8b04b", color: "#140d08", border: "none", borderRadius: "99px", fontSize: "10px", fontWeight: "900", cursor: "pointer" }}
                      >
                        MARK READY
                      </button>
                    )}
                    {ord.order_status === "ready" && (
                      <button
                        onClick={() => onUpdateStatus(ord.id, "paid", "completed")}
                        style={{ flex: 1, padding: "10px", background: "#57a84f", color: "#fff", border: "none", borderRadius: "99px", fontSize: "10px", fontWeight: "900", cursor: "pointer" }}
                      >
                        COMPLETE ORDER ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. أرشيف الطلبات */}
      {(filterView === "all" || filterView === "archived") && (
        <div>
          <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: "18px", color: "#9a8b7a", letterSpacing: "1px", marginBottom: "12px" }}>
            ARCHIVED / COMPLETED / EXPIRED ORDERS ({archivedOrders.length})
          </h3>
          <div style={{ background: "#140d08", borderRadius: "16px", border: "1px solid rgba(243,233,220,0.06)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9a8b7a" }}>
                  <th style={{ padding: "12px 14px" }}>ORDER</th>
                  <th style={{ padding: "12px 14px" }}>CUSTOMER</th>
                  <th style={{ padding: "12px 14px" }}>TOTAL</th>
                  <th style={{ padding: "12px 14px" }}>PAYMENT</th>
                  <th style={{ padding: "12px 14px" }}>STATUS</th>
                  <th style={{ padding: "12px 14px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {archivedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#9a8b7a" }}>No archived orders found.</td>
                  </tr>
                ) : (
                  archivedOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: "Impact", fontSize: "16px", color: "#ffb347" }}>#{o.order_number}</span>
                      </td>
                      <td style={{ padding: "12px 14px", minWidth: "260px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.5px" }}>
                          {o.customer_name}
                        </div>
                        {o.customer_phone && (
                          <div style={{ marginTop: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#ffb347", background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.25)", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span>📞</span>
                              <span>{o.customer_phone}</span>
                            </span>
                          </div>
                        )}
                        {o.customer_address && (
                          <div style={{ fontSize: "10.5px", color: "#9a8b7a", marginTop: "3px" }}>
                            📍 {o.customer_address}
                          </div>
                        )}
                        <div style={{ marginTop: "8px" }}>
                          {(o.items || []).map((it, idx) => (
                            <div key={idx} style={{ marginTop: "4px", paddingBottom: "4px", borderBottom: idx < (o.items.length - 1) ? "1px dashed rgba(255,255,255,0.06)" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                                <span style={{ color: "#fff", fontWeight: "700" }}>• {cleanItemName(it.name)} <span style={{ color: "#e8b04b" }}>× {it.qty || 1}</span></span>
                              </div>
                              <IngredientChips item={it} />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#e8b04b", fontSize: "13px", fontWeight: "bold" }}>EGP {o.total}</td>
                      <td style={{ padding: "12px 14px", textTransform: "uppercase" }}>{o.payment_status}</td>
                      <td style={{ padding: "12px 14px", textTransform: "uppercase" }}>{o.order_status}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => handlePrintTicket(o)}
                          style={{ padding: "4px 8px", background: "rgba(243,233,220,0.1)", border: "none", color: "#f3e9dc", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                          title="Print receipt"
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
