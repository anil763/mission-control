"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Repeat, ExternalLink, Calendar as CalIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type EventType = "reminder" | "task" | "event";

const typeColors: Record<EventType, string> = {
  reminder: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50",
  task: "bg-blue-900/60 text-blue-300 border-blue-700/50",
  event: "bg-indigo-900/60 text-indigo-300 border-indigo-700/50",
};

const typeIcons: Record<EventType, string> = {
  reminder: "🔔",
  task: "✅",
  event: "📅",
};

const gcalColors: Record<string, string> = {
  "1": "bg-blue-900/60 border-blue-700/50 text-blue-200",
  "2": "bg-green-900/60 border-green-700/50 text-green-200",
  "3": "bg-purple-900/60 border-purple-700/50 text-purple-200",
  "4": "bg-red-900/60 border-red-700/50 text-red-200",
  "5": "bg-yellow-900/60 border-yellow-700/50 text-yellow-200",
  "6": "bg-orange-900/60 border-orange-700/50 text-orange-200",
  default: "bg-gray-800/60 border-gray-700/50 text-gray-200",
};

interface GCalEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  htmlLink: string;
  colorId: string | null;
}

function formatTime(iso: string, allDay: boolean) {
  if (allDay) return "All day";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function groupByDay(items: { dateStr: string; [key: string]: any }[]) {
  const groups: Record<string, any[]> = {};
  items.forEach((item) => {
    const day = getDayLabel(item.dateStr);
    if (!groups[day]) groups[day] = [];
    groups[day].push(item);
  });
  return groups;
}

export default function CalendarPage() {
  const cronEvents = useQuery(api.cronEvents.list) ?? [];
  const createEvent = useMutation(api.cronEvents.create);
  const removeEvent = useMutation(api.cronEvents.remove);

  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    type: "event" as EventType,
    recurrence: "",
    agentId: "",
  });

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => { setGcalEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  // Merge and sort all events
  const allItems = [
    ...cronEvents
      .filter((e) => e.scheduledAt >= Date.now())
      .map((e) => ({ ...e, source: "agent", dateStr: new Date(e.scheduledAt).toISOString() })),
    ...gcalEvents.map((e) => ({ ...e, source: "gcal", dateStr: e.start })),
  ].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

  const grouped = groupByDay(allItems);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? "Loading Google Calendar..." : `${gcalEvents.length} Google events · ${cronEvents.filter(e => e.scheduledAt >= Date.now()).length} agent tasks`}
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={14} /> Schedule
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><CalIcon size={11} className="text-green-400" /> Google Calendar</div>
        <div className="flex items-center gap-1.5"><span>🎯</span> Agent Tasks</div>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">New Agent Task</h2>
          <div className="space-y-3">
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3 flex-wrap">
              <input type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}>
                <option value="event">Event</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
              </select>
              <input className="flex-1 min-w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Recurrence (e.g. daily)" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} />
            </div>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
              <option value="">No agent assigned</option>
              <option value="main">Opus</option>
              <option value="ugc-growth">Nova</option>
              <option value="spiritual-tech">Kai</option>
              <option value="temple-ops">Atlas</option>
              <option value="ms-strategist">Sienna</option>
              <option value="managed-services">Managed Services</option>
              <option value="health-opt">Mira</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Save</button>
              <button onClick={() => setAdding(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 && !loading && (
        <div className="text-center py-16 text-gray-600">No upcoming events.</div>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{day}</h2>
            <div className="space-y-2">
              {items.map((item) => {
                if (item.source === "gcal") {
                  const colorClass = gcalColors[item.colorId ?? "default"] ?? gcalColors.default;
                  return (
                    <div key={item.id} className={`border rounded-xl p-4 flex items-start justify-between ${colorClass}`}>
                      <div className="flex items-start gap-3">
                        <CalIcon size={16} className="mt-0.5 text-green-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          {item.description && <div className="text-sm opacity-60 mt-0.5 line-clamp-2">{item.description}</div>}
                          <div className="flex items-center gap-3 mt-1.5 text-xs opacity-60">
                            <span className="flex items-center gap-1"><Clock size={11} />{formatTime(item.start, item.allDay)}</span>
                            {item.location && <span>📍 {item.location}</span>}
                          </div>
                        </div>
                      </div>
                      <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 ml-3 flex-shrink-0">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  );
                }

                // Agent task
                return (
                  <div key={item._id} className={`border rounded-xl p-4 flex items-start justify-between group ${typeColors[item.type as EventType]}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{typeIcons[item.type as EventType]}</span>
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        {item.description && <div className="text-sm opacity-60 mt-0.5">{item.description}</div>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs opacity-60">
                          <span className="flex items-center gap-1"><Clock size={11} />{formatTime(item.scheduledAt, false)}</span>
                          {item.recurrence && <span className="flex items-center gap-1"><Repeat size={11} />{item.recurrence}</span>}
                          {item.agentId && <span>🎯 {item.agentId}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeEvent({ id: item._id as Id<"cronEvents"> })} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60 ml-3 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
