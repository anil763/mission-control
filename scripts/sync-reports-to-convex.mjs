#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL || "").trim();
if (!convexUrl) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL");
  process.exit(1);
}

const reportsDir = path.resolve(process.env.OPENCLAW_REPORTS_DIR || path.join(process.env.HOME || "", ".openclaw/workspace/reports"));
if (!fs.existsSync(reportsDir)) {
  console.log(`No reports directory at ${reportsDir}`);
  process.exit(0);
}

const client = new ConvexHttpClient(convexUrl);
const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith(".md")).sort();

function inferCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes("reddit")) return "reddit";
  if (lower.includes("ugc")) return "ugc";
  if (lower.includes("brand-target")) return "outreach";
  if (lower.includes("brief")) return "brief";
  return "other";
}

function titleFromFilename(name) {
  return name
    .replace(/\.md$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

let count = 0;
for (const file of files) {
  const fullPath = path.join(reportsDir, file);
  const stat = fs.statSync(fullPath);
  const content = fs.readFileSync(fullPath, "utf8");

  await client.mutation("reports:ingest", {
    sourcePath: `reports/${file}`,
    title: titleFromFilename(file),
    category: inferCategory(file),
    content,
    runAt: stat.mtimeMs,
    tags: ["auto-sync"],
  });
  count++;
}

console.log(`Synced ${count} report(s) from ${reportsDir}`);
