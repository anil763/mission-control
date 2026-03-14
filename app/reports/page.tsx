"use client";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const categories = ["all", "ugc", "reddit", "outreach", "brief", "other"] as const;

function prettyDate(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ReportsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const reports = useQuery(api.reports.list, { category }) ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!reports.length) return null;
    if (!selectedId) return reports[0];
    return reports.find((r) => r._id === selectedId) ?? reports[0];
  }, [reports, selectedId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 text-sm mt-1">Daily intelligence and agent reports, readable anywhere.</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${category === c ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"}`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 bg-gray-900 border border-gray-800 rounded-xl p-3 max-h-[70vh] overflow-auto">
          {reports.length === 0 && <div className="text-sm text-gray-500 p-2">No reports yet.</div>}
          <div className="space-y-2">
            {reports.map((r) => (
              <button
                key={r._id}
                onClick={() => setSelectedId(r._id)}
                className={`w-full text-left rounded-lg p-3 border ${selected?._id === r._id ? "bg-indigo-600/20 border-indigo-500" : "bg-gray-950 border-gray-800 hover:bg-gray-800/70"}`}
              >
                <div className="text-white text-sm font-medium line-clamp-2">{r.title}</div>
                <div className="text-xs text-gray-400 mt-1">{r.category} · {prettyDate(r.runAt ?? r.updatedAt)}</div>
                <div className="text-[11px] text-gray-500 mt-1 truncate">{r.sourcePath}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-8 bg-gray-900 border border-gray-800 rounded-xl p-5 max-h-[70vh] overflow-auto">
          {!selected ? (
            <div className="text-gray-500 text-sm">Select a report.</div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">{selected.title}</h2>
              <div className="text-xs text-gray-400 mb-4">{selected.category} · {prettyDate(selected.runAt ?? selected.updatedAt)} · {selected.sourcePath}</div>
              <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-sans">{selected.content}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
