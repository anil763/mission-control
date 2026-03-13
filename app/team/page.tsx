"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const AGENTS = [
  { agentId: "main", name: "Opus", role: "Chief of Staff · Personal Assistant", emoji: "🎯", workspace: "~/.openclaw/workspace" },
  { agentId: "ugc-growth", name: "UGC Growth Agent", role: "UGC Business Strategist · Content Production", emoji: "💰", workspace: "~/.openclaw/workspace-ugc-growth" },
  { agentId: "spiritual-tech", name: "Spiritual Technologist", role: "Spiritual Business Strategy · The Blueprint Code™", emoji: "🔮", workspace: "~/.openclaw/workspace-spiritual-tech" },
  { agentId: "temple-ops", name: "Temple Operations", role: "Guruji Ka Ashram · Communications & Events", emoji: "🛕", workspace: "~/.openclaw/workspace-temple-ops" },
  { agentId: "ms-strategist", name: "MS AI Strategist", role: "Managed Services · Cloud · Agentic AI · LinkedIn", emoji: "🧠", workspace: "~/.openclaw/workspace-ms-strategist" },
  { agentId: "health-opt", name: "Health Optimization", role: "Energy · TRT · Blood Sugar · Longevity", emoji: "⚡", workspace: "~/.openclaw/workspace-health-opt" },
];

const statusColors = {
  working: "bg-green-500",
  idle: "bg-yellow-500",
  offline: "bg-gray-600",
};

const statusLabels = {
  working: "Working",
  idle: "Idle",
  offline: "Offline",
};

export default function TeamPage() {
  const agents = useQuery(api.agents.list) ?? [];
  const upsertAgent = useMutation(api.agents.upsert);

  useEffect(() => {
    AGENTS.forEach((a) => {
      const exists = agents.find((ag) => ag.agentId === a.agentId);
      if (!exists) {
        upsertAgent({ ...a, status: "idle" });
      }
    });
  }, [agents.length]);

  const getAgent = (agentId: string) => agents.find((a) => a.agentId === agentId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-gray-400 text-sm mt-1">{AGENTS.length} agents in your org</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const data = getAgent(agent.agentId);
          const status = data?.status ?? "offline";
          return (
            <div key={agent.agentId} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                      <span className="text-xs text-gray-400">{statusLabels[status as keyof typeof statusLabels]}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{agent.role}</p>
                  {data?.currentTask && (
                    <p className="text-indigo-400 text-xs mt-2 truncate">→ {data.currentTask}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-gray-600 text-xs truncate">{agent.workspace}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
