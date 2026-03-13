import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cronEvents").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    recurrence: v.optional(v.string()),
    type: v.union(v.literal("reminder"), v.literal("task"), v.literal("event")),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cronEvents", { ...args, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("cronEvents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});
