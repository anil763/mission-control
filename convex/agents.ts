import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const upsert = mutation({
  args: {
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    workspace: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("agents").filter((q) => q.eq(q.field("agentId"), args.agentId)).first();
    const now = Date.now();
    if (existing) {
      return await ctx.db.patch(existing._id, { ...args, updatedAt: now });
    }
    return await ctx.db.insert("agents", { ...args, updatedAt: now });
  },
});

export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, { agentId, status, currentTask }) => {
    const existing = await ctx.db.query("agents").filter((q) => q.eq(q.field("agentId"), agentId)).first();
    if (existing) {
      return await ctx.db.patch(existing._id, { status, currentTask, updatedAt: Date.now() });
    }
  },
});
