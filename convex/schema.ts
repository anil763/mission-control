import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    assignee: v.union(v.literal("anil"), v.literal("opus")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  memories: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).searchIndex("search_content", {
    searchField: "content",
    filterFields: ["tags"],
  }),

  content: defineTable({
    title: v.string(),
    idea: v.optional(v.string()),
    script: v.optional(v.string()),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    platform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube"), v.literal("linkedin")),
    stage: v.union(
      v.literal("idea"),
      v.literal("scripting"),
      v.literal("thumbnail"),
      v.literal("filming"),
      v.literal("editing"),
      v.literal("published")
    ),
    thumbnailUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    workspace: v.string(),
    updatedAt: v.number(),
  }),
});
