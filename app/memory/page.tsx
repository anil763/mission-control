"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Search, Plus, Trash2, Tag } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function MemoryPage() {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "", source: "" });

  const allMemories = useQuery(api.memories.list) ?? [];
  const searchResults = useQuery(api.memories.search, query.trim() ? { query } : "skip") ?? [];
  const memories = query.trim() ? searchResults : allMemories;

  const createMemory = useMutation(api.memories.create);
  const removeMemory = useMutation(api.memories.remove);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createMemory({
      title: form.title,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: form.source || undefined,
    });
    setForm({ title: "", content: "", tags: "", source: "" });
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Memory</h1>
          <p className="text-gray-400 text-sm mt-1">{allMemories.length} memories stored</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Add Memory
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Search memories..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Memory</h2>
          <div className="space-y-3">
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Source (optional)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Save</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {memories.map((mem) => (
          <div key={mem._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white">{mem.title}</h3>
              <button onClick={() => removeMemory({ id: mem._id as Id<"memories"> })} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{mem.content}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {mem.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">
                  <Tag size={10} />{tag}
                </span>
              ))}
              {mem.source && <span className="text-xs text-gray-500">· {mem.source}</span>}
              <span className="text-xs text-gray-600 ml-auto">{new Date(mem.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {memories.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            {query ? "No memories match that search." : "No memories yet."}
          </div>
        )}
      </div>
    </div>
  );
}
