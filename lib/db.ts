import { getSupabase } from "./supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export type AssignmentType =
  | "assignment" | "midterm" | "exam" | "quiz" | "project" | "lab" | "other";

export type AssignmentStatus = "pending" | "submitted" | "completed" | "late";

export const ALL_TYPES: AssignmentType[] = [
  "assignment", "midterm", "exam", "quiz", "project", "lab", "other",
];

export const ALL_STATUSES: AssignmentStatus[] = [
  "pending", "submitted", "completed", "late",
];

export const TYPE_LABELS: Record<AssignmentType, string> = {
  assignment: "Assignment",
  midterm:    "Midterm",
  exam:       "Exam",
  quiz:       "Quiz",
  project:    "Project",
  lab:        "Lab",
  other:      "Other",
};

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending:   "Pending",
  submitted: "Submitted",
  completed: "Completed",
  late:      "Late",
};

export const COURSE_COLORS = [
  "slate", "rose", "orange", "amber", "yellow",
  "lime", "green", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "pink",
] as const;
export type CourseColor = (typeof COURSE_COLORS)[number];

export interface Course {
  id: string;
  name: string;
  code: string;
  color: CourseColor;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  type: AssignmentType;
  due_at: string;        // ISO timestamp
  weight: number | null;
  description: string;
  status: AssignmentStatus;
  remind_at: string | null;
  created_at: string;
  // Joined fields (populated in some queries)
  course?: Course;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns remind_at 3 days before due_at, or null if due_at is too soon. */
export function defaultRemindAt(due_at: string): string {
  const due = new Date(due_at);
  const remind = new Date(due.getTime() - 3 * 24 * 60 * 60 * 1000);
  return remind.toISOString();
}

/** ms remaining until due_at (negative if overdue) */
export function msUntilDue(due_at: string): number {
  return new Date(due_at).getTime() - Date.now();
}

export function formatDueLabel(due_at: string): string {
  const ms = msUntilDue(due_at);
  if (ms < 0) return "Overdue";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) return `${Math.ceil(hours)}h left`;
  const days = Math.ceil(hours / 24);
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}

// ── DB queries ─────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function getAssignments(): Promise<Assignment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .order("due_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Assignment[];
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Assignment;
}

// ── Color map for Tailwind ─────────────────────────────────────────────────

export const COLOR_CLASSES: Record<CourseColor, { bg: string; text: string; ring: string }> = {
  slate:  { bg: "bg-slate-100 dark:bg-slate-700/30",   text: "text-slate-700 dark:text-slate-300",  ring: "ring-slate-300 dark:ring-slate-600" },
  rose:   { bg: "bg-rose-100 dark:bg-rose-700/30",     text: "text-rose-700 dark:text-rose-300",    ring: "ring-rose-300 dark:ring-rose-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-700/30", text: "text-orange-700 dark:text-orange-300",ring: "ring-orange-300 dark:ring-orange-600" },
  amber:  { bg: "bg-amber-100 dark:bg-amber-700/30",   text: "text-amber-700 dark:text-amber-300",  ring: "ring-amber-300 dark:ring-amber-600" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-700/30", text: "text-yellow-700 dark:text-yellow-300",ring: "ring-yellow-300 dark:ring-yellow-600" },
  lime:   { bg: "bg-lime-100 dark:bg-lime-700/30",     text: "text-lime-700 dark:text-lime-300",    ring: "ring-lime-300 dark:ring-lime-600" },
  green:  { bg: "bg-green-100 dark:bg-green-700/30",   text: "text-green-700 dark:text-green-300",  ring: "ring-green-300 dark:ring-green-600" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-700/30",     text: "text-teal-700 dark:text-teal-300",    ring: "ring-teal-300 dark:ring-teal-600" },
  cyan:   { bg: "bg-cyan-100 dark:bg-cyan-700/30",     text: "text-cyan-700 dark:text-cyan-300",    ring: "ring-cyan-300 dark:ring-cyan-600" },
  sky:    { bg: "bg-sky-100 dark:bg-sky-700/30",       text: "text-sky-700 dark:text-sky-300",      ring: "ring-sky-300 dark:ring-sky-600" },
  blue:   { bg: "bg-blue-100 dark:bg-blue-700/30",     text: "text-blue-700 dark:text-blue-300",    ring: "ring-blue-300 dark:ring-blue-600" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-700/30", text: "text-indigo-700 dark:text-indigo-300",ring: "ring-indigo-300 dark:ring-indigo-600" },
  violet: { bg: "bg-violet-100 dark:bg-violet-700/30", text: "text-violet-700 dark:text-violet-300",ring: "ring-violet-300 dark:ring-violet-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-700/30", text: "text-purple-700 dark:text-purple-300",ring: "ring-purple-300 dark:ring-purple-600" },
  pink:   { bg: "bg-pink-100 dark:bg-pink-700/30",     text: "text-pink-700 dark:text-pink-300",    ring: "ring-pink-300 dark:ring-pink-600" },
};
