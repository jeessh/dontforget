"use client";

import { useEffect, useState, useCallback } from "react";
import { Assignment, Course, formatExactDate, formatDueLabel } from "@/lib/db";
import { X } from "lucide-react";

interface Reminder extends Assignment {
  course: Course | undefined;
}

export default function ReminderBanner() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/reminders").catch(() => null);
    if (!res?.ok) return;
    const data = await res.json();
    setReminders(data);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  async function markSubmitted(id: string) {
    await fetch(`/api/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "submitted" }),
    });
    load();
  }

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {reminders.map(r => {
        const label = r.course
          ? (r.course.code || r.course.name)
          : "Unknown course";
        return (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/70 dark:border-amber-700/50 animate-fade-in"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 truncate">
                ⏰ <span className="font-semibold">{r.title}</span>
                <span className="font-normal text-amber-600 dark:text-amber-400/80"> · {label}</span>
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/60 mt-0.5">
                Due {formatExactDate(r.due_at)} · {formatDueLabel(r.due_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => markSubmitted(r.id)}
                className="text-xs px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:opacity-80 transition-opacity"
              >
                Done
              </button>
              <button
                onClick={() => setReminders(prev => prev.filter(x => x.id !== r.id))}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
