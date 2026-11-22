// src/components/admin/MessagesTab.js
"use client";

import { useState, useMemo } from "react";
import { escapeHtml } from "@/lib/security";

export default function MessagesTab({ messages = [], onDeleteMessage }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState("ALL");

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchTopic = filterTopic === "ALL" || (m.topic || "").toUpperCase() === filterTopic;
      if (!matchTopic) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.message && m.message.toLowerCase().includes(q))
      );
    });
  }, [messages, searchQuery, filterTopic]);

  const stats = useMemo(() => {
    const total = messages.length;
    const catering = messages.filter((m) => (m.topic || "").toUpperCase() === "CATERING").length;
    const order = messages.filter((m) => (m.topic || "").toUpperCase() === "ORDER").length;
    const feedback = messages.filter((m) => (m.topic || "").toUpperCase() === "FEEDBACK").length;
    return { total, catering, order, feedback };
  }, [messages]);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>TOTAL INQUIRIES</div>
          <div style={{ fontSize: "28px", fontFamily: "var(--disp)", color: "#ff7a2e", marginTop: "4px" }}>{stats.total}</div>
        </div>
        <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>CATERING & EVENTS</div>
          <div style={{ fontSize: "28px", fontFamily: "var(--disp)", color: "#e8b04b", marginTop: "4px" }}>{stats.catering}</div>
        </div>
        <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>ORDER QUESTIONS</div>
          <div style={{ fontSize: "28px", fontFamily: "var(--disp)", color: "#ffb347", marginTop: "4px" }}>{stats.order}</div>
        </div>
        <div style={{ background: "#140d08", border: "1px solid rgba(243,233,220,0.1)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ fontSize: "10px", color: "#9a8b7a", letterSpacing: "2px", fontWeight: "800" }}>FEEDBACK & REVIEWS</div>
          <div style={{ fontSize: "28px", fontFamily: "var(--disp)", color: "#57a84f", marginTop: "4px" }}>{stats.feedback}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          background: "#140d08",
          border: "1px solid rgba(243,233,220,0.08)",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        <input
          type="text"
          placeholder="Search by customer name, phone, email, or text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: "1 1 260px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(243,233,220,0.15)",
            borderRadius: "10px",
            padding: "10px 16px",
            color: "#f3e9dc",
            fontSize: "13px",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "GENERAL", "ORDER", "CATERING", "FEEDBACK", "PARTNERSHIP"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTopic(t)}
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                cursor: "pointer",
                border: "1px solid " + (filterTopic === t ? "#ff7a2e" : "rgba(243,233,220,0.1)"),
                background: filterTopic === t ? "#ff7a2e" : "transparent",
                color: filterTopic === t ? "#140d08" : "#9a8b7a",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Grid */}
      {filteredMessages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#140d08",
            borderRadius: "16px",
            border: "1px dashed rgba(243,233,220,0.1)",
            color: "#9a8b7a",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📬</div>
          <h4 style={{ fontFamily: "var(--disp)", fontSize: "18px", color: "#f3e9dc", margin: "0 0 6px" }}>
            NO MESSAGES FOUND
          </h4>
          <p style={{ fontSize: "12px", margin: 0 }}>
            {searchQuery ? "No messages match your search criteria." : "All caught up! Customer contact requests will show here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {filteredMessages.map((m) => {
            const dateStr = m.created_at
              ? new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
              : "Recently";

            const rawPhone = (m.phone || "").replace(/[^\d]/g, "");
            const waUrl = rawPhone ? `https://wa.me/${rawPhone}` : null;

            return (
              <div
                key={m.id}
                style={{
                  background: "#140d08",
                  border: "1px solid rgba(243,233,220,0.1)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "16px", color: "#f3e9dc", fontWeight: "700" }}>
                        {m.name || "Anonymous Guest"}
                      </h4>
                      <span style={{ fontSize: "10px", color: "#9a8b7a" }}>{dateStr}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "900",
                        letterSpacing: "1px",
                        padding: "4px 10px",
                        borderRadius: "99px",
                        background:
                          m.topic === "CATERING"
                            ? "rgba(232, 176, 75, 0.15)"
                            : m.topic === "ORDER"
                            ? "rgba(255, 122, 46, 0.15)"
                            : "rgba(243, 233, 220, 0.08)",
                        color:
                          m.topic === "CATERING"
                            ? "#e8b04b"
                            : m.topic === "ORDER"
                            ? "#ff7a2e"
                            : "#f3e9dc",
                        border: "1px solid rgba(243,233,220,0.1)",
                      }}
                    >
                      {m.topic || "GENERAL"}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#9a8b7a", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "14px" }}>
                    {m.email && (
                      <a href={`mailto:${m.email}`} style={{ color: "#ffb347", textDecoration: "none" }}>
                        ✉️ {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <span style={{ color: "#f3e9dc" }}>
                        📞 {m.phone}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(243,233,220,0.06)",
                      borderRadius: "10px",
                      padding: "12px",
                      fontSize: "13px",
                      color: "#f3e9dc",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap",
                      marginBottom: "16px",
                    }}
                  >
                    {m.message}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(243,233,220,0.08)" }}>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        background: "#25D366",
                        color: "#fff",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      💬 WHATSAPP
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}?subject=Regarding your message to FORNO Pizza`}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.06)",
                        color: "#f3e9dc",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        border: "1px solid rgba(243,233,220,0.15)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      REPLY VIA EMAIL
                    </a>
                  )}
                  <button
                    onClick={() => onDeleteMessage && onDeleteMessage(m.id)}
                    title="Delete message"
                    style={{
                      background: "rgba(194, 43, 26, 0.15)",
                      border: "1px solid #c22b1a",
                      color: "#ff8b7a",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
