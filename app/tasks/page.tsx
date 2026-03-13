"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type Status = "todo" | "in_progress" | "done";
type Assignee = "anil" | "opus";
type Priority = "low" | "medium" | "high";

const columns: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "border-gray-600" },
  { id: "in_progress", label: "In Progress", color: "border-blue-500" },
  { id: "done", label: "Done", color: "border-green-500" },
];

const priorityColors: Record<Priority, string> = {
  low: "bg-gray-700 text-gray-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignee: "opus" as Assignee, priority: "medium" as Priority, status: "todo" as Status });

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await createTask(form);
    setForm({ title: "", description: "", assignee: "opus", priority: "medium", status: "todo" });
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 text-sm mt-1">Everything on the board</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Add Task
        </button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Task</h2>
          <div className="space-y-3">
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value as Assignee })}>
                <option value="opus">Opus</option>
                <option value="anil">Anil</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {columns.map(({ id, label, color }) => (
          <div key={id}>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${color}`}>
              <h2 className="font-semibold text-white">{label}</h2>
              <span className="text-gray-400 text-sm">({tasks.filter((t) => t.status === id).length})</span>
            </div>
            <div className="space-y-3">
              {tasks.filter((t) => t.status === id).map((task) => (
                <div key={task._id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 group">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white text-sm font-medium">{task.title}</span>
                    <button onClick={() => removeTask({ id: task._id as Id<"tasks"> })} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {task.description && <p className="text-gray-400 text-xs mb-3">{task.description}</p>}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority as Priority]}`}>{task.priority}</span>
                    <span className="text-xs text-gray-500">{task.assignee === "opus" ? "🎯 Opus" : "👤 Anil"}</span>
                  </div>
                  <select className="mt-2 w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none" value={task.status} onChange={(e) => updateTask({ id: task._id as Id<"tasks">, status: e.target.value as Status })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
              {tasks.filter((t) => t.status === id).length === 0 && (
                <div className="text-gray-600 text-sm text-center py-8 border border-dashed border-gray-800 rounded-lg">Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
