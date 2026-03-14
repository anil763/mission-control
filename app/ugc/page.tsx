"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type DealStatus = "lead" | "pending" | "agreed" | "producing" | "delivered" | "closed";
type PaymentStatus = "unpaid" | "partial" | "paid";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function UGCPage() {
  const deals = useQuery(api.ugc.listDeals) ?? [];
  const summary = useQuery(api.ugc.summary, { month: monthKey() });
  const goal = useQuery(api.ugc.getGoal, { month: monthKey() });

  const createDeal = useMutation(api.ugc.createDeal);
  const updateDeal = useMutation(api.ugc.updateDeal);
  const removeDeal = useMutation(api.ugc.removeDeal);
  const upsertGoal = useMutation(api.ugc.upsertGoal);

  const [adding, setAdding] = useState(false);
  const [goalInput, setGoalInput] = useState(30000);
  const [form, setForm] = useState({
    brand: "",
    title: "",
    amount: 500,
    videosCommitted: 1,
    status: "pending" as DealStatus,
    paymentStatus: "unpaid" as PaymentStatus,
    notes: "",
  });

  const buckets = useMemo(() => ({
    pendingDeals: deals.filter((d) => d.status === "lead" || d.status === "pending"),
    production: deals.filter((d) => (d.status === "agreed" || d.status === "producing") && d.videosDelivered < d.videosCommitted),
    pendingPayment: deals.filter((d) => d.paymentStatus !== "paid"),
    paidThisMonth: deals.filter((d) => d.paidAt && new Date(d.paidAt).getMonth() === new Date().getMonth() && new Date(d.paidAt).getFullYear() === new Date().getFullYear()),
  }), [deals]);

  const addDeal = async () => {
    if (!form.brand.trim() || !form.title.trim()) return;
    await createDeal({
      brand: form.brand,
      title: form.title,
      amount: Number(form.amount) || 0,
      videosCommitted: Number(form.videosCommitted) || 1,
      videosDelivered: 0,
      status: form.status,
      paymentStatus: form.paymentStatus,
      notes: form.notes || undefined,
    });
    setAdding(false);
    setForm({ brand: "", title: "", amount: 500, videosCommitted: 1, status: "pending", paymentStatus: "unpaid", notes: "" });
  };

  const saveGoal = async () => {
    await upsertGoal({ month: monthKey(), goalAmount: Number(goalInput) || 30000 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC CRM</h1>
          <p className="text-gray-400 text-sm mt-1">Deals, production, payments, and monthly goal tracking</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
        <Card label="Pending Deals" value={String(summary?.pendingDealsCount ?? 0)} />
        <Card label="Videos To Produce" value={String(summary?.productionQueueCount ?? 0)} />
        <Card label="Pending Payments" value={String(summary?.pendingPaymentCount ?? 0)} />
        <Card label="Paid This Month" value={money(summary?.paymentsThisMonth ?? 0)} />
        <Card label="Goal Progress" value={`${summary?.progressPct ?? 0}%`} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex items-end gap-3">
        <div>
          <div className="text-sm text-gray-400 mb-1">Monthly Goal ({monthKey()})</div>
          <input type="number" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" value={goalInput} onChange={(e) => setGoalInput(Number(e.target.value))} placeholder={String(goal?.goalAmount ?? 30000)} />
        </div>
        <button onClick={saveGoal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Save Goal</button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 space-y-3">
          <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Brand (e.g. Presidio)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Deal / Video Package" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <input type="number" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Videos committed" value={form.videosCommitted} onChange={(e) => setForm({ ...form, videosCommitted: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DealStatus })}>
              <option value="lead">Lead</option><option value="pending">Pending</option><option value="agreed">Agreed</option><option value="producing">Producing</option><option value="delivered">Delivered</option><option value="closed">Closed</option>
            </select>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
              <option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option>
            </select>
          </div>
          <textarea rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={addDeal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Save Deal</button>
            <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <List title="Pending Deals" rows={buckets.pendingDeals} onDelete={(id) => removeDeal({ id: id as Id<"ugcDeals"> })} onMarkPaid={(id) => updateDeal({ id: id as Id<"ugcDeals">, paymentStatus: "paid", paidAt: Date.now() })} onAdvance={(id, status) => updateDeal({ id: id as Id<"ugcDeals">, status })} />
        <List title="Production Queue" rows={buckets.production} onDelete={(id) => removeDeal({ id: id as Id<"ugcDeals"> })} onMarkPaid={(id) => updateDeal({ id: id as Id<"ugcDeals">, paymentStatus: "paid", paidAt: Date.now() })} onAdvance={(id, status) => updateDeal({ id: id as Id<"ugcDeals">, status })} />
        <List title="Pending Payment" rows={buckets.pendingPayment} onDelete={(id) => removeDeal({ id: id as Id<"ugcDeals"> })} onMarkPaid={(id) => updateDeal({ id: id as Id<"ugcDeals">, paymentStatus: "paid", paidAt: Date.now() })} onAdvance={(id, status) => updateDeal({ id: id as Id<"ugcDeals">, status })} />
        <List title="Paid This Month" rows={buckets.paidThisMonth} onDelete={(id) => removeDeal({ id: id as Id<"ugcDeals"> })} onMarkPaid={(id) => updateDeal({ id: id as Id<"ugcDeals">, paymentStatus: "paid", paidAt: Date.now() })} onAdvance={(id, status) => updateDeal({ id: id as Id<"ugcDeals">, status })} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><div className="text-gray-400 text-xs">{label}</div><div className="text-white text-xl font-semibold mt-1">{value}</div></div>;
}

function List({ title, rows, onDelete, onMarkPaid, onAdvance }: { title: string; rows: any[]; onDelete: (id: string) => void; onMarkPaid: (id: string) => void; onAdvance: (id: string, status: DealStatus) => void }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-white mb-3">{title} <span className="text-gray-500">({rows.length})</span></h2>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-xs text-gray-500">Nothing here.</div>}
        {rows.map((r) => (
          <div key={r._id} className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="text-sm text-white font-medium">{r.brand} · {r.title}</div>
                <div className="text-xs text-gray-400 mt-1">{money(r.amount)} · {r.videosDelivered}/{r.videosCommitted} videos · {r.status} · {r.paymentStatus}</div>
              </div>
              <button onClick={() => onDelete(r._id)} className="text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
            <div className="flex gap-2 mt-3">
              {r.paymentStatus !== "paid" && <button onClick={() => onMarkPaid(r._id)} className="text-xs bg-green-700/40 hover:bg-green-700/60 text-green-300 px-2 py-1 rounded">Mark Paid</button>}
              {r.status !== "producing" && <button onClick={() => onAdvance(r._id, "producing")} className="text-xs bg-blue-700/40 hover:bg-blue-700/60 text-blue-300 px-2 py-1 rounded">Set Producing</button>}
              {r.status !== "delivered" && <button onClick={() => onAdvance(r._id, "delivered")} className="text-xs bg-indigo-700/40 hover:bg-indigo-700/60 text-indigo-300 px-2 py-1 rounded">Set Delivered</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
