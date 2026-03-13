"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckSquare, Film, Brain, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const memories = useQuery(api.memories.list) ?? [];
  const content = useQuery(api.content.list) ?? [];
  const agents = useQuery(api.agents.list) ?? [];

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const stats = [
    { label: "Open Tasks", value: todoCount + inProgressCount, icon: CheckSquare, color: "text-blue-400", href: "/tasks" },
    { label: "Content Items", value: content.length, icon: Film, color: "text-purple-400", href: "/content" },
    { label: "Memories", value: memories.length, icon: Brain, color: "text-green-400", href: "/memory" },
    { label: "Agents Online", value: agents.filter((a) => a.status !== "offline").length, icon: Users, color: "text-yellow-400", href: "/team" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        <p className="text-gray-400 mt-1">Good to see you, Anil. Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Task Summary</h2>
          <div className="space-y-3">
            {[
              { label: "To Do", count: todoCount, color: "bg-gray-600" },
              { label: "In Progress", count: inProgressCount, color: "bg-blue-600" },
              { label: "Done", count: doneCount, color: "bg-green-600" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Content Pipeline</h2>
          <div className="space-y-3">
            {["idea", "scripting", "filming", "editing", "published"].map((stage) => {
              const count = content.filter((c) => c.stage === stage).length;
              return (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm capitalize">{stage}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
