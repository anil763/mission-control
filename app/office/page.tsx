"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const AGENTS = [
  { agentId: "main", name: "Opus", role: "Chief of Staff", emoji: "🎯", desk: "Main Office", color: "from-indigo-900 to-indigo-800" },
  { agentId: "ugc-growth", name: "Nova", role: "Content Strategist", emoji: "💰", desk: "Studio A", color: "from-pink-900 to-pink-800" },
  { agentId: "spiritual-tech", name: "Kai", role: "Blueprint Architect", emoji: "🔮", desk: "Sanctuary", color: "from-purple-900 to-purple-800" },
  { agentId: "temple-ops", name: "Atlas", role: "Community Coordinator", emoji: "🛕", desk: "Temple Wing", color: "from-amber-900 to-amber-800" },
  { agentId: "ms-strategist", name: "Sienna", role: "Tech Thought Leader", emoji: "🧠", desk: "War Room", color: "from-blue-900 to-blue-800" },
  { agentId: "managed-services", name: "Managed Services", role: "Market Intelligence Lead", emoji: "📊", desk: "Strategy Lab", color: "from-cyan-900 to-cyan-800" },
  { agentId: "health-opt", name: "Mira", role: "Vitality Coach", emoji: "⚡", desk: "Wellness Center", color: "from-green-900 to-green-800" },
];

const statusConfig = {
  working: { dot: "bg-green-400", ring: "ring-green-500/40", label: "Working", animate: true },
  idle: { dot: "bg-yellow-400", ring: "ring-yellow-500/40", label: "Idle", animate: false },
  offline: { dot: "bg-gray-600", ring: "ring-gray-600/40", label: "Offline", animate: false },
};

export default function OfficePage() {
  const agents = useQuery(api.agents.list) ?? [];
  const upsertAgent = useMutation(api.agents.upsert);

  useEffect(() => {
    AGENTS.forEach((a) => {
      const existing = agents.find((ag) => ag.agentId === a.agentId);
      if (!existing || existing.name !== a.name || existing.role !== a.role || existing.emoji !== a.emoji) {
        upsertAgent({ agentId: a.agentId, name: a.name, role: a.role, emoji: a.emoji, status: existing?.status ?? "idle", workspace: `~/.openclaw/workspace-${a.agentId}` });
      }
    });
  }, [agents]);

  const getAgent = (agentId: string) => agents.find((a) => a.agentId === agentId);
  const workingCount = agents.filter((a) => a.status === "working").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Office</h1>
        <p className="text-gray-400 text-sm mt-1">
          {workingCount > 0 ? `${workingCount} agent${workingCount > 1 ? "s" : ""} working` : "All agents idle"} · {idleCount} idle
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const data = getAgent(agent.agentId);
          const status = (data?.status ?? "offline") as keyof typeof statusConfig;
          const cfg = statusConfig[status];

          return (
            <div key={agent.agentId} className={`bg-gradient-to-br ${agent.color} border border-white/10 rounded-2xl p-5 relative overflow-hidden`}>
              {/* Desk label */}
              <div className="absolute top-3 right-3 text-xs text-white/30 font-medium">{agent.desk}</div>

              {/* Workspace visual */}
              <div className="mb-4 bg-black/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-6 bg-white/10 rounded flex items-center justify-center">
                  <div className="w-5 h-3.5 bg-white/20 rounded-sm" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1 bg-white/10 rounded w-3/4" />
                  <div className="h-1 bg-white/10 rounded w-1/2" />
                </div>
                {status === "working" && (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Agent */}
              <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl ring-2 ${cfg.ring}`}>
                  {agent.emoji}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${cfg.dot} ${cfg.animate ? "animate-pulse" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{agent.name}</div>
                  <div className="text-white/50 text-xs">{agent.role}</div>
                  <div className="text-white/30 text-xs mt-0.5">{cfg.label}</div>
                </div>
              </div>

              {data?.currentTask && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/60 text-xs truncate">→ {data.currentTask}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
        {Object.entries(statusConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${val.dot}`} />
            {val.label}
          </div>
        ))}
      </div>
    </div>
  );
}
