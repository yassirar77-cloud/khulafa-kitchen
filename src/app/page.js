"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0C0F14", card: "#161B22", card2: "#1C2333", border: "#2A3040",
  accent: "#FF6B35", green: "#22C55E", yellow: "#EAB308", red: "#EF4444",
  blue: "#3B82F6", text: "#E8ECF0", textDim: "#8B95A5", textMuted: "#555F70",
};

const STOCK_DATA = {
  "Protein 🥩": [
    { id: "ayam", name: "Ayam", unit: "kg", cost: 10.5, target: 20 },
    { id: "kambing", name: "Kambing", unit: "kg", cost: 38, target: 5 },
    { id: "daging", name: "Daging", unit: "kg", cost: 32, target: 8 },
    { id: "ikan", name: "Ikan", unit: "kg", cost: 18, target: 10 },
    { id: "sotong", name: "Sotong", unit: "kg", cost: 22, target: 5 },
    { id: "telur", name: "Telur", unit: "biji", cost: 0.45, target: 120 },
  ],
  "Karbohidrat 🍚": [
    { id: "beras", name: "Beras", unit: "kg", cost: 3.2, target: 25 },
    { id: "mee", name: "Mee", unit: "kg", cost: 4.5, target: 10 },
    { id: "bihun", name: "Bihun", unit: "kg", cost: 5.0, target: 8 },
    { id: "roti_doh", name: "Roti Doh", unit: "kg", cost: 6.0, target: 10 },
    { id: "tepung", name: "Tepung", unit: "kg", cost: 3.8, target: 15 },
  ],
  "Minuman ☕": [
    { id: "teh", name: "Teh", unit: "paket", cost: 8.5, target: 5 },
    { id: "nescafe", name: "Nescafe", unit: "paket", cost: 12, target: 3 },
    { id: "milo", name: "Milo", unit: "paket", cost: 15, target: 3 },
    { id: "susu_pekat", name: "Susu Pekat", unit: "tin", cost: 4.5, target: 10 },
    { id: "gula", name: "Gula", unit: "kg", cost: 3.2, target: 10 },
  ],
  "Sayur & Lain 🥬": [
    { id: "bawang", name: "Bawang", unit: "kg", cost: 5.5, target: 10 },
    { id: "kobis", name: "Kobis", unit: "kg", cost: 3.5, target: 8 },
    { id: "bendi", name: "Bendi", unit: "kg", cost: 7, target: 5 },
    { id: "sayur_lain", name: "Sayur Lain", unit: "kg", cost: 5, target: 10 },
    { id: "minyak", name: "Minyak", unit: "liter", cost: 5.5, target: 10 },
    { id: "gas", name: "Gas", unit: "tong", cost: 120, target: 1 },
  ],
};

const ALL_ITEMS = Object.values(STOCK_DATA).flat();

const WASTAGE_REASONS = [
  "Lebih masak", "Basi/expired", "Hangus", "Tumpah",
  "Salah order", "Customer return", "Rosak/pecah",
];

const SUPPLIERS = [
  "BALAJI ENTERPRISE", "MEWAH DAIRIES", "JASMINE FOOD", "AYAM BESTARI",
  "BABAS MASALA", "SAYIDAH MASALA", "FOOK LEONG", "REZA PLASTIC",
  "BESTARI WHOLESALE", "LAIN-LAIN",
];

const SHIFTS = ["Pagi", "Petang", "Malam"];

function key(prefix, date, shift) { return `kk_${prefix}_${date}_${shift}`; }

export default function Home() {
  const [tab, setTab] = useState(0);
  const [shift, setShift] = useState("Pagi");
  const today = new Date().toISOString().split("T")[0];

  const [qty, setQty] = useState({});
  const [wastage, setWastage] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [wItem, setWItem] = useState(ALL_ITEMS[0].id);
  const [wQty, setWQty] = useState("");
  const [wReason, setWReason] = useState(WASTAGE_REASONS[0]);
  const [wNote, setWNote] = useState("");

  const [invSupplier, setInvSupplier] = useState(SUPPLIERS[0]);
  const [invAmount, setInvAmount] = useState("");
  const [invNote, setInvNote] = useState("");
  const [invImage, setInvImage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const sq = localStorage.getItem(key("stock", today, shift));
      if (sq) setQty(JSON.parse(sq)); else setQty({});
      const sw = localStorage.getItem(key("wastage", today, shift));
      if (sw) setWastage(JSON.parse(sw)); else setWastage([]);
      const si = localStorage.getItem(key("invoice", today, shift));
      if (si) setInvoices(JSON.parse(si)); else setInvoices([]);
    } catch { setQty({}); setWastage([]); setInvoices([]); }
  }, [today, shift]);

  useEffect(() => { localStorage.setItem(key("stock", today, shift), JSON.stringify(qty)); }, [qty, today, shift]);
  useEffect(() => { localStorage.setItem(key("wastage", today, shift), JSON.stringify(wastage)); }, [wastage, today, shift]);
  useEffect(() => { localStorage.setItem(key("invoice", today, shift), JSON.stringify(invoices)); }, [invoices, today, shift]);

  const totalCost = ALL_ITEMS.reduce((s, i) => s + (qty[i.id] || 0) * i.cost, 0);
  const totalWastage = wastage.reduce((s, w) => s + w.cost, 0);
  const totalInvoice = invoices.reduce((s, v) => s + v.amount, 0);
  const overTarget = ALL_ITEMS.filter(i => (qty[i.id] || 0) > i.target).length;

  function addWastage() {
    const item = ALL_ITEMS.find(i => i.id === wItem);
    const q = parseFloat(wQty);
    if (!item || !q || q <= 0) return;
    setWastage(p => [...p, { id: Date.now(), item: item.name, itemId: item.id, qty: q, unit: item.unit, reason: wReason, note: wNote, cost: q * item.cost }]);
    setWQty(""); setWNote("");
  }

  function handleInvPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInvImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function addInvoice() {
    const amt = parseFloat(invAmount);
    if (!amt || amt <= 0) return;
    setInvoices(p => [...p, { id: Date.now(), supplier: invSupplier, amount: amt, note: invNote, image: invImage }]);
    setInvAmount(""); setInvNote(""); setInvImage(null);
  }

  const s = {
    wrap: { maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "12px 14px 90px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 14px", borderBottom: `1px solid ${C.border}` },
    shiftBar: { display: "flex", gap: 4 },
    shiftBtn: (active) => ({ padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: active ? C.accent : C.card, color: active ? "#fff" : C.textDim }),
    statCard: (color) => ({ background: C.card, padding: 14, borderRadius: 12, border: `1px solid ${C.border}`, flex: 1, minWidth: 0 }),
    bigNum: (color) => ({ fontSize: 22, fontWeight: 900, color, marginTop: 2 }),
    label: { fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
    catTitle: { fontSize: 13, fontWeight: 800, color: C.textDim, margin: "16px 0 8px", textTransform: "uppercase", letterSpacing: 0.5 },
    itemRow: { background: C.card, padding: "12px 14px", borderRadius: 12, marginBottom: 6, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
    btn: (bg) => ({ padding: "10px 20px", borderRadius: 10, border: "none", background: bg, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }),
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, outline: "none" },
    select: { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, outline: "none", WebkitAppearance: "none" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 100 },
    navBtn: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", color: active ? C.accent : C.textDim, fontSize: 10, fontWeight: 600, cursor: "pointer", padding: "4px 12px" }),
  };

  function progressColor(val, target) {
    if (target === 0) return C.green;
    const pct = val / target;
    if (pct <= 0.7) return C.red;
    if (pct <= 1) return C.green;
    return C.yellow;
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>🔥 KHULAFA KITCHEN</h1>
          <p style={{ margin: 0, fontSize: 11, color: C.textDim }}>{today}</p>
        </div>
        <div style={s.shiftBar}>
          {SHIFTS.map(sh => (
            <button key={sh} onClick={() => setShift(sh)} style={s.shiftBtn(shift === sh)}>{sh}</button>
          ))}
        </div>
      </div>

      {tab === 0 && (
        <div>
          <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
            <div style={s.statCard()}>
              <div style={s.label}>Kos Stok</div>
              <div style={s.bigNum(totalCost > 3000 ? C.red : C.green)}>RM {totalCost.toFixed(0)}</div>
            </div>
            <div style={s.statCard()}>
              <div style={s.label}>Item</div>
              <div style={s.bigNum(C.text)}>{ALL_ITEMS.length}</div>
            </div>
            <div style={s.statCard()}>
              <div style={s.label}>Over Target</div>
              <div style={s.bigNum(overTarget > 0 ? C.yellow : C.green)}>{overTarget}</div>
            </div>
          </div>
          {Object.entries(STOCK_DATA).map(([cat, items]) => (
            <div key={cat}>
              <div style={s.catTitle}>{cat}</div>
              {items.map(item => {
                const v = qty[item.id] || 0;
                const pct = item.target > 0 ? Math.min((v / item.target) * 100, 100) : 0;
                const pc = progressColor(v, item.target);
                return (
                  <div key={item.id} style={s.itemRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: C.textDim }}>RM {item.cost}/{item.unit} · target: {item.target}</div>
                      <div style={{ height: 4, background: C.bg, borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pc, borderRadius: 2, transition: "width .3s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 10 }}>
                      <button onClick={() => setQty(p => ({ ...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1) }))} style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <input type="number" value={v} onChange={e => setQty(p => ({ ...p, [item.id]: Math.max(0, parseFloat(e.target.value) || 0) }))} style={{ width: 52, padding: "6px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: v > item.target ? C.yellow : C.accent, fontSize: 16, fontWeight: 800, textAlign: "center", outline: "none" }} />
                      <button onClick={() => setQty(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: C.accent, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div>
          <div style={{ ...s.statCard(C.red), margin: "14px 0", background: totalWastage > 50 ? "#2D1215" : C.card, border: `1px solid ${totalWastage > 50 ? C.red + "55" : C.border}` }}>
            <div style={s.label}>Total Wastage</div>
            <div style={s.bigNum(totalWastage > 50 ? C.red : C.green)}>RM {totalWastage.toFixed(2)}</div>
            {totalWastage > 50 && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>⚠ Melebihi RM50</div>}
          </div>
          <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={{ ...s.label, marginBottom: 10 }}>Tambah Wastage</div>
            <select value={wItem} onChange={e => setWItem(e.target.value)} style={{ ...s.select, marginBottom: 8 }}>
              {ALL_ITEMS.map(i => <option key={i.id} value={i.id}>{i.name} (RM {i.cost}/{i.unit})</option>)}
            </select>
            <input type="number" placeholder="Quantity" value={wQty} onChange={e => setWQty(e.target.value)} style={{ ...s.input, marginBottom: 8 }} />
            <select value={wReason} onChange={e => setWReason(e.target.value)} style={{ ...s.select, marginBottom: 8 }}>
              {WASTAGE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input placeholder="Nota (optional)" value={wNote} onChange={e => setWNote(e.target.value)} style={{ ...s.input, marginBottom: 10 }} />
            {wQty > 0 && (() => { const it = ALL_ITEMS.find(i => i.id === wItem); return <div style={{ fontSize: 12, color: C.yellow, marginBottom: 8 }}>Kos: RM {(parseFloat(wQty) * (it?.cost || 0)).toFixed(2)}</div>; })()}
            <button onClick={addWastage} style={s.btn(C.red)}>+ Tambah Wastage</button>
          </div>
          {wastage.length > 0 && <div style={{ ...s.label, marginBottom: 8 }}>Senarai Hari Ni</div>}
          {wastage.map((w, i) => (
            <div key={w.id} style={{ ...s.itemRow, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{w.item} — {w.qty} {w.unit}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{w.reason}{w.note ? ` · ${w.note}` : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.red }}>-RM {w.cost.toFixed(2)}</span>
                <button onClick={() => setWastage(p => p.filter((_, idx) => idx !== i))} style={{ width: 28, height: 28, borderRadius: 14, border: `1px solid ${C.border}`, background: C.bg, color: C.red, fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div>
          <div style={{ ...s.statCard(), margin: "14px 0" }}>
            <div style={s.label}>Invoice Hari Ni</div>
            <div style={s.bigNum(C.blue)}>RM {totalInvoice.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{invoices.length} invois</div>
          </div>
          <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={{ ...s.label, marginBottom: 10 }}>Invois Baru</div>
            <button onClick={() => fileRef.current?.click()} style={{ ...s.btn(C.card2), marginBottom: 10, border: `1px dashed ${C.border}`, color: C.textDim }}>📸 Ambil Gambar Invois</button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleInvPhoto} style={{ display: "none" }} />
            {invImage && <img src={invImage} alt="preview" style={{ width: "100%", borderRadius: 8, marginBottom: 10, maxHeight: 200, objectFit: "cover" }} />}
            <select value={invSupplier} onChange={e => setInvSupplier(e.target.value)} style={{ ...s.select, marginBottom: 8 }}>
              {SUPPLIERS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
            </select>
            <input type="number" placeholder="Jumlah RM" value={invAmount} onChange={e => setInvAmount(e.target.value)} style={{ ...s.input, marginBottom: 8 }} />
            <input placeholder="Nota (optional)" value={invNote} onChange={e => setInvNote(e.target.value)} style={{ ...s.input, marginBottom: 10 }} />
            <button onClick={addInvoice} style={s.btn(C.blue)}>💾 Simpan Invois</button>
          </div>
          {invoices.length > 0 && <div style={{ ...s.label, marginBottom: 8 }}>Senarai Invois</div>}
          {invoices.map((inv, i) => (
            <div key={inv.id} style={{ ...s.itemRow, marginBottom: 6 }}>
              {inv.image && <img src={inv.image} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", marginRight: 10, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{inv.supplier}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{inv.note || "Tiada nota"}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.blue, flexShrink: 0 }}>RM {inv.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0" }}>
            <div style={s.statCard()}>
              <div style={s.label}>Kos Stok</div>
              <div style={s.bigNum(C.accent)}>RM {totalCost.toFixed(0)}</div>
            </div>
            <div style={s.statCard()}>
              <div style={s.label}>Wastage</div>
              <div style={s.bigNum(totalWastage > 50 ? C.red : C.green)}>RM {totalWastage.toFixed(0)}</div>
            </div>
            <div style={s.statCard()}>
              <div style={s.label}>Invois</div>
              <div style={s.bigNum(C.blue)}>RM {totalInvoice.toFixed(0)}</div>
            </div>
            <div style={s.statCard()}>
              <div style={s.label}>Over Target</div>
              <div style={s.bigNum(overTarget > 0 ? C.yellow : C.green)}>{overTarget} item</div>
            </div>
          </div>

          <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={s.label}>Invoice vs Stock Gap</div>
            {(() => {
              const gap = totalCost > 0 ? Math.abs(totalInvoice - totalCost) / totalCost * 100 : 0;
              const isOver = gap > 15;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 13 }}>Stok: RM {totalCost.toFixed(0)}</span>
                    <span style={{ fontSize: 13 }}>Invois: RM {totalInvoice.toFixed(0)}</span>
                  </div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(gap, 100)}%`, background: isOver ? C.red : C.green, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isOver ? C.red : C.green, marginTop: 6 }}>
                    Gap: {gap.toFixed(1)}% {isOver ? "⚠ Lebih 15%" : "✓ OK"}
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={s.label}>Shift: {shift}</div>
            <div style={{ marginTop: 8 }}>
              {Object.entries(STOCK_DATA).map(([cat, items]) => {
                const catCost = items.reduce((s, i) => s + (qty[i.id] || 0) * i.cost, 0);
                return (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13 }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>RM {catCost.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {wastage.length > 0 && (
            <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div style={s.label}>Top Wastage</div>
              {wastage.sort((a, b) => b.cost - a.cost).slice(0, 5).map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13 }}>{w.item} — {w.reason}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>-RM {w.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={s.bottomNav}>
        {[
          { icon: "📦", label: "Stock" },
          { icon: "🗑️", label: "Wastage" },
          { icon: "📸", label: "Invoice" },
          { icon: "📊", label: "Summary" },
        ].map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={s.navBtn(tab === i)}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
