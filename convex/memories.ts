import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").order("desc").collect();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    if (!query.trim()) return await ctx.db.query("memories").order("desc").collect();
    return await ctx.db.query("memories").withSearchIndex("search_content", (q) => q.search("content", query)).collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("memories", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...fields }) => {
    return await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});
