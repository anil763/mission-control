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

  cronEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    recurrence: v.optional(v.string()),
    type: v.union(v.literal("reminder"), v.literal("task"), v.literal("event")),
    agentId: v.optional(v.string()),
    createdAt: v.number(),
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

  ugcDeals: defineTable({
    brand: v.string(),
    title: v.string(),
    amount: v.number(),
    videosCommitted: v.number(),
    videosDelivered: v.number(),
    status: v.union(v.literal("lead"), v.literal("pending"), v.literal("agreed"), v.literal("producing"), v.literal("delivered"), v.literal("closed")),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("partial"), v.literal("paid")),
    notes: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  ugcGoals: defineTable({
    month: v.string(),
    goalAmount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
