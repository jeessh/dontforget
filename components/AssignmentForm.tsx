"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Course, ALL_TYPES, TYPE_LABELS, Assignment, AssignmentType } from "@/lib/db";

interface Props {
  courses: Course[];
  assignment?: Assignment;
}

export default function AssignmentForm({ courses, assignment }: Props) {
  const router = useRouter();
  const editing = !!assignment;

  const [title, setTitle] = useState(assignment?.title ?? "");
  const [courseId, setCourseId] = useState(assignment?.course_id ?? (courses[0]?.id ?? ""));
  const [type, setType] = useState(assignment?.type ?? "assignment");
  const [dueAt, setDueAt] = useState(() => {
    if (!assignment?.due_at) return "";
    const d = new Date(assignment.due_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [weight, setWeight] = useState(assignment?.weight?.toString() ?? "");
  const [description, setDescription] = useState(assignment?.description ?? "");
  const [autoRemind, setAutoRemind] = useState(!editing || !!assignment?.remind_at);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Keep courseId in sync if courses load after initial render
  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id);
  }, [courses, courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !courseId || !dueAt) {
      setError("Title, course, and due date are required.");
      return;
    }
    setSaving(true);
    setError("");

    const dueIso = new Date(dueAt).toISOString();
    const body: Record<string, unknown> = {
      title, course_id: courseId, type, due_at: dueIso,
      weight: weight ? parseFloat(weight) : null,
      description,
    };
    if (!autoRemind) body.remind_at = null;

    const url = editing ? `/api/assignments/${assignment!.id}` : "/api/assignments";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Assignment 3"
          required
        />
      </div>

      <div>
        <label className="label">Course</label>
        <select className="input" value={courseId} onChange={e => setCourseId(e.target.value)} required>
          {courses.length === 0 && <option value="">— no courses yet —</option>}
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.code ? `${c.code} – ${c.name}` : c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value as AssignmentType)}>
            {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Weight (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 20"
          />
        </div>
      </div>

      <div>
        <label className="label">Due Date & Time</label>
        <input
          className="input"
          type="datetime-local"
          value={dueAt}
          onChange={e => setDueAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Any extra context…"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-foreground">
        <input
          type="checkbox"
          className="accent-[hsl(var(--accent))]"
          checked={autoRemind}
          onChange={e => setAutoRemind(e.target.checked)}
        />
        Set reminder 3 days before due date
      </label>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[hsl(var(--accent))] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : editing ? "Save changes" : "Add assignment"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
