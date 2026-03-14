import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    if (category && category !== "all") {
      return await ctx.db.query("reports").withIndex("by_category", (q) => q.eq("category", category)).order("desc").collect();
    }
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const ingest = mutation({
  args: {
    sourcePath: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.string(),
    runAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_sourcePath", (q) => q.eq("sourcePath", args.sourcePath))
      .first();

    const payload = {
      title: args.title,
      category: args.category,
      content: args.content,
      runAt: args.runAt ?? now,
      tags: args.tags,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("reports", {
      sourcePath: args.sourcePath,
      ...payload,
      createdAt: now,
    });
  },
});
