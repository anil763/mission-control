"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2, Clock, Repeat } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type EventType = "reminder" | "task" | "event";

const typeColors: Record<EventType, string> = {
  reminder: "bg-yellow-900 text-yellow-300 border-yellow-700",
  task: "bg-blue-900 text-blue-300 border-blue-700",
  event: "bg-purple-900 text-purple-300 border-purple-700",
};

const typeIcons: Record<EventType, string> = {
  reminder: "🔔",
  task: "✅",
  event: "📅",
};

function groupByDay(events: any[]) {
  const groups: Record<string, any[]> = {};
  events.forEach((e) => {
    const day = new Date(e.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups[day]) groups[day] = [];
    groups[day].push(e);
  });
  return groups;
}

export default function CalendarPage() {
  const events = useQuery(api.cronEvents.list) ?? [];
  const createEvent = useMutation(api.cronEvents.create);
  const removeEvent = useMutation(api.cronEvents.remove);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    type: "event" as EventType,
    recurrence: "",
    agentId: "",
  });

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await createEvent({
      title: form.title,
      description: form.description || undefined,
      scheduledAt: new Date(form.scheduledAt).getTime(),
      type: form.type,
      recurrence: form.recurrence || undefined,
      agentId: form.agentId || undefined,
    });
    setForm({ title: "", description: "", scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16), type: "event", recurrence: "", agentId: "" });
    setAdding(false);
  };

  const upcoming = events.filter((e) => e.scheduledAt >= Date.now()).sort((a, b) => a.scheduledAt - b.scheduledAt);
  const past = events.filter((e) => e.scheduledAt < Date.now()).sort((a, b) => b.scheduledAt - a.scheduledAt);
  const grouped = groupByDay(upcoming);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Schedule
        </button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Event</h2>
          <div className="space-y-3">
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <input type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}>
                <option value="event">Event</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
              </select>
              <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Recurrence (e.g. daily)" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} />
            </div>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
              <option value="">No agent assigned</option>
              <option value="main">Opus</option>
              <option value="ugc-growth">UGC Growth Agent</option>
              <option value="spiritual-tech">Spiritual Technologist</option>
              <option value="temple-ops">Temple Operations</option>
              <option value="ms-strategist">MS AI Strategist</option>
              <option value="health-opt">Health Optimization</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Save</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16 text-gray-600">No upcoming events scheduled.</div>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{day}</h2>
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div key={event._id} className={`border rounded-xl p-4 flex items-start justify-between group ${typeColors[event.type as EventType]}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{typeIcons[event.type as EventType]}</span>
                    <div>
                      <div className="font-medium text-white">{event.title}</div>
                      {event.description && <div className="text-sm opacity-70 mt-0.5">{event.description}</div>}
                      <div className="flex items-center gap-3 mt-2 text-xs opacity-60">
                        <span className="flex items-center gap-1"><Clock size={11} />{new Date(event.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        {event.recurrence && <span className="flex items-center gap-1"><Repeat size={11} />{event.recurrence}</span>}
                        {event.agentId && <span>→ {event.agentId}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeEvent({ id: event._id as Id<"cronEvents"> })} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/80">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
