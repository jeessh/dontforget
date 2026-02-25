"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Assignment, Course, msUntilDue } from "@/lib/db";
import AssignmentCard from "./AssignmentCard";
import CourseList from "./CourseList";
import ReminderBanner from "./ReminderBanner";

interface Props {
  initialAssignments: Assignment[];
  initialCourses: Course[];
}

type Tab = "upcoming" | "courses";

type Group = {
  label: string;
  items: Assignment[];
};

function groupAssignments(assignments: Assignment[]): Group[] {
  const now = Date.now();
  const DAY = 86_400_000;
  const WEEK = 7 * DAY;

  const overdue:   Assignment[] = [];
  const today:     Assignment[] = [];
  const thisWeek:  Assignment[] = [];
  const later:     Assignment[] = [];

  for (const a of assignments) {
    if (a.status !== "pending") continue;
    const ms = msUntilDue(a.due_at);
    if (ms < 0)            overdue.push(a);
    else if (ms < DAY)     today.push(a);
    else if (ms < WEEK)    thisWeek.push(a);
    else                   later.push(a);
  }

  const groups: Group[] = [];
  if (overdue.length)  groups.push({ label: "Overdue",    items: overdue });
  if (today.length)    groups.push({ label: "Due Today",  items: today });
  if (thisWeek.length) groups.push({ label: "This Week",  items: thisWeek });
  if (later.length)    groups.push({ label: "Later",      items: later });

  // If nothing pending, show completed/submitted
  if (groups.length === 0) {
    const done = assignments.filter(a => a.status !== "pending");
    if (done.length) groups.push({ label: "Completed", items: done });
  }

  return groups;
}

export default function DashboardClient({ initialAssignments, initialCourses }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const refresh = useCallback(async () => {
    const [aRes, cRes] = await Promise.all([
      fetch("/api/assignments"),
      fetch("/api/courses"),
    ]);
    if (aRes.ok) setAssignments(await aRes.json());
    if (cRes.ok) setCourses(await cRes.json());
  }, []);

  // Stats
  const DAY = 86_400_000;
  const WEEK = 7 * DAY;
  const pending   = assignments.filter(a => a.status === "pending");
  const dueToday  = pending.filter(a => { const ms = msUntilDue(a.due_at); return ms >= 0 && ms < DAY; });
  const dueWeek   = pending.filter(a => { const ms = msUntilDue(a.due_at); return ms >= 0 && ms < WEEK; });

  const groups = groupAssignments(assignments);

  const assignmentCounts: Record<string, number> = {};
  for (const a of assignments) {
    assignmentCounts[a.course_id] = (assignmentCounts[a.course_id] ?? 0) + 1;
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "courses",  label: "Courses" },
  ];

  return (
    <div>
      <ReminderBanner />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Pending",    value: pending.length },
          { label: "Due Today",  value: dueToday.length },
          { label: "This Week",  value: dueWeek.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <div className="space-y-6">
          {groups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-medium">All clear!</p>
              <p className="text-sm mt-1">No pending assignments.</p>
            </div>
          ) : (
            groups.map(g => (
              <div key={g.label}>
                <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                  g.label === "Overdue" ? "text-rose-400 dark:text-rose-400/80" :
                  g.label === "Due Today" ? "text-amber-400 dark:text-amber-400/80" :
                  "text-muted-foreground"
                }`}>{g.label}</h3>
                <div className="space-y-2">
                  {g.items.map(a => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      onClick={() => router.push(`/assignments/${a.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <CourseList
          courses={courses}
          assignmentCounts={assignmentCounts}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
