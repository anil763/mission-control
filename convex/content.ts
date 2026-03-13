import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const stages = ["idea", "scripting", "thumbnail", "filming", "editing", "published"] as const;
type Stage = typeof stages[number];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("content").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    idea: v.optional(v.string()),
    platform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube"), v.literal("linkedin")),
    stage: v.union(v.literal("idea"), v.literal("scripting"), v.literal("thumbnail"), v.literal("filming"), v.literal("editing"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("content", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: {
    id: v.id("content"),
    title: v.optional(v.string()),
    idea: v.optional(v.string()),
    script: v.optional(v.string()),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    stage: v.optional(v.union(v.literal("idea"), v.literal("scripting"), v.literal("thumbnail"), v.literal("filming"), v.literal("editing"), v.literal("published"))),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    return await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("content") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});
