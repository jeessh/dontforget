"use client";

import { useState } from "react";
import { Course, COURSE_COLORS, COLOR_CLASSES } from "@/lib/db";
import { Trash2 } from "lucide-react";

interface Props {
  courses: Course[];
  assignmentCounts: Record<string, number>;
  onRefresh: () => void;
}

const DOT_COLORS: Record<string, string> = {
  slate: "bg-slate-400",
  rose: "bg-rose-400",
  orange: "bg-orange-400",
  amber: "bg-amber-400",
  yellow: "bg-yellow-400",
  lime: "bg-lime-400",
  green: "bg-green-400",
  teal: "bg-teal-400",
  cyan: "bg-cyan-400",
  sky: "bg-sky-400",
  blue: "bg-blue-400",
  indigo: "bg-indigo-400",
  violet: "bg-violet-400",
  purple: "bg-purple-400",
  pink: "bg-pink-400",
};

export default function CourseList({ courses, assignmentCounts, onRefresh }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState<string>("indigo");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), code: code.trim(), color }),
    });
    setName(""); setCode(""); setColor("indigo"); setAdding(false); setSaving(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course and all its assignments?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-3">
      {courses.length === 0 && !adding && (
        <p className="text-muted-foreground text-sm py-4 text-center">No courses yet.</p>
      )}

      {courses.map(c => {
        const cls = COLOR_CLASSES[c.color] ?? COLOR_CLASSES.indigo;
        return (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                {c.code || c.name}
              </span>
              <span className="text-sm text-foreground">{c.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {assignmentCounts[c.id] ?? 0} assignment{(assignmentCounts[c.id] ?? 0) !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
                title="Delete course"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={handleAdd} className="p-4 rounded-xl bg-card border border-border space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input text-sm"
              placeholder="Course name *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
            <input
              className="input text-sm"
              placeholder="Code (e.g. CS101)"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {COURSE_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full ${DOT_COLORS[c]} transition-transform ${color === c ? "ring-2 ring-offset-2 ring-[hsl(var(--accent))] scale-110" : "hover:scale-105"}`}
                title={c}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-sm rounded-lg bg-[hsl(var(--accent))] text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-1.5 text-sm rounded-lg border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
        >
          + Add course
        </button>
      )}
    </div>
  );
}
