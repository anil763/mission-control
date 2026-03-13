"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type Stage = "idea" | "scripting" | "thumbnail" | "filming" | "editing" | "published";
type Platform = "tiktok" | "instagram" | "youtube" | "linkedin";

const stages: { id: Stage; label: string; emoji: string }[] = [
  { id: "idea", label: "Idea", emoji: "💡" },
  { id: "scripting", label: "Scripting", emoji: "✍️" },
  { id: "thumbnail", label: "Thumbnail", emoji: "🖼️" },
  { id: "filming", label: "Filming", emoji: "🎬" },
  { id: "editing", label: "Editing", emoji: "✂️" },
  { id: "published", label: "Published", emoji: "🚀" },
];

const platformColors: Record<Platform, string> = {
  tiktok: "bg-pink-900 text-pink-300",
  instagram: "bg-purple-900 text-purple-300",
  youtube: "bg-red-900 text-red-300",
  linkedin: "bg-blue-900 text-blue-300",
};

export default function ContentPage() {
  const items = useQuery(api.content.list) ?? [];
  const createContent = useMutation(api.content.create);
  const updateContent = useMutation(api.content.update);
  const removeContent = useMutation(api.content.remove);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", idea: "", platform: "tiktok" as Platform });

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await createContent({ ...form, stage: "idea" });
    setForm({ title: "", idea: "", platform: "tiktok" });
    setAdding(false);
  };

  const advance = async (id: Id<"content">, currentStage: Stage) => {
    const idx = stages.findIndex((s) => s.id === currentStage);
    if (idx < stages.length - 1) {
      await updateContent({ id, stage: stages[idx + 1].id });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} pieces in the pipeline</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Add Idea
        </button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Content Idea</h2>
          <div className="space-y-3">
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" placeholder="Idea description" value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })} />
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
        {stages.map(({ id, label, emoji }) => (
          <div key={id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span>{emoji}</span>
              <h2 className="font-semibold text-white text-sm">{label}</h2>
              <span className="ml-auto text-xs text-gray-500">{items.filter((i) => i.stage === id).length}</span>
            </div>
            <div className="space-y-3">
              {items.filter((i) => i.stage === id).map((item) => (
                <div key={item._id} className="bg-gray-800 rounded-lg p-3 group">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white text-xs font-medium leading-tight">{item.title}</span>
                    <button onClick={() => removeContent({ id: item._id as Id<"content"> })} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1 flex-shrink-0">
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${platformColors[item.platform as Platform]}`}>{item.platform}</span>
                  {id !== "published" && (
                    <button onClick={() => advance(item._id as Id<"content">, id)} className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                      Next <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
