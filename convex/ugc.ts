import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const dealStatus = v.union(
  v.literal("lead"),
  v.literal("pending"),
  v.literal("agreed"),
  v.literal("producing"),
  v.literal("delivered"),
  v.literal("closed")
);

const paymentStatus = v.union(v.literal("unpaid"), v.literal("partial"), v.literal("paid"));

function currentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export const listDeals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ugcDeals").order("desc").collect();
  },
});

export const createDeal = mutation({
  args: {
    brand: v.string(),
    title: v.string(),
    amount: v.number(),
    videosCommitted: v.number(),
    videosDelivered: v.number(),
    status: dealStatus,
    paymentStatus,
    notes: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ugcDeals", { ...args, createdAt: now, updatedAt: now });
  },
});

export const updateDeal = mutation({
  args: {
    id: v.id("ugcDeals"),
    brand: v.optional(v.string()),
    title: v.optional(v.string()),
    amount: v.optional(v.number()),
    videosCommitted: v.optional(v.number()),
    videosDelivered: v.optional(v.number()),
    status: v.optional(dealStatus),
    paymentStatus: v.optional(paymentStatus),
    notes: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    return await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const removeDeal = mutation({
  args: { id: v.id("ugcDeals") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});

export const getGoal = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, { month }) => {
    const monthKey = month ?? currentMonthKey();
    const row = await ctx.db.query("ugcGoals").filter((q) => q.eq(q.field("month"), monthKey)).first();
    return row ?? null;
  },
});

export const upsertGoal = mutation({
  args: { month: v.string(), goalAmount: v.number() },
  handler: async (ctx, { month, goalAmount }) => {
    const existing = await ctx.db.query("ugcGoals").filter((q) => q.eq(q.field("month"), month)).first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { goalAmount, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("ugcGoals", { month, goalAmount, createdAt: now, updatedAt: now });
  },
});

export const summary = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, { month }) => {
    const monthKey = month ?? currentMonthKey();
    const deals = await ctx.db.query("ugcDeals").collect();
    const goalRow = await ctx.db.query("ugcGoals").filter((q) => q.eq(q.field("month"), monthKey)).first();

    const pendingDeals = deals.filter((d) => d.status === "lead" || d.status === "pending");
    const productionQueue = deals.filter((d) => (d.status === "agreed" || d.status === "producing") && d.videosDelivered < d.videosCommitted);
    const pendingPayment = deals.filter((d) => d.paymentStatus !== "paid");

    const paymentsThisMonth = deals
      .filter((d) => d.paidAt)
      .filter((d) => {
        const dt = new Date(d.paidAt!);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        return key === monthKey;
      })
      .reduce((sum, d) => sum + d.amount, 0);

    const goalAmount = goalRow?.goalAmount ?? 30000;

    return {
      month: monthKey,
      goalAmount,
      paymentsThisMonth,
      progressPct: goalAmount > 0 ? Math.min(100, Math.round((paymentsThisMonth / goalAmount) * 100)) : 0,
      pendingDealsCount: pendingDeals.length,
      productionQueueCount: productionQueue.length,
      pendingPaymentCount: pendingPayment.length,
    };
  },
});
