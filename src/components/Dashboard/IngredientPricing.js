// src/components/Dashboard/IngredientPricing.js
"use client";

import { useState, useEffect } from 'react';

export default function IngredientPricing() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // جلب الأسعار الحالية
  useEffect(() => {
    fetch('/api/ingredients')
      .then(res => res.json())
      .then(data => {
        setPrices(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (category, id, value) => {
    setPrices(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: Number(value) || 0
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices)
      });
      if (res.ok) {
        setMsg('تم حفظ وتحديث الأسعار بنجاح! ✓');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      setMsg('حدث خطأ أثناء الحفظ!');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ color: '#ff7a2e', padding: 20 }}>جاري تحميل الأسعار...</div>;

  const categories = [
    { key: 'dough', title: '🍕 العجين (Dough)' },
    { key: 'sauce', title: '🥫 الصلصات (Sauce)' },
    { key: 'cheese', title: '🧀 الأجبان (Cheese)' },
    { key: 'meat', title: '🥩 اللحوم (Meats)' },
    { key: 'veg', title: '🥦 الخضراوات (Veggies)' },
    { key: 'extras', title: '✨ الإضافات (Extras)' },
  ];

  return (
    <div style={{
      background: '#120b07',
      color: '#f3e9dc',
      padding: '30px',
      borderRadius: '20px',
      border: '1px solid rgba(255,122,46,0.2)',
      maxWidth: '900px',
      margin: '20px auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--disp, sans-serif)', fontSize: '26px', color: '#ffb347', letterSpacing: '1px' }}>
          تعديل أسعار المكونات (EGP)
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #ff7a2e, #e05a12)',
            color: '#1a0c04',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '99px',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px', background: 'rgba(255,122,46,0.15)', border: '1px solid #ff7a2e', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', color: '#ffb347', fontWeight: 'bold' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(243,233,220,0.08)', borderRadius: '16px', padding: '18px' }}>
            <h3 style={{ fontSize: '16px', color: '#e8b04b', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              {cat.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(prices[cat.key] || {}).map(([id, price]) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#c5b7a7' }}>{id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={price}
                      onChange={e => handleChange(cat.key, id, e.target.value)}
                      style={{
                        width: '80px',
                        background: '#1d120a',
                        border: '1px solid rgba(255,122,46,0.3)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        color: '#ffb347',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#9a8b7a' }}>EGP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}