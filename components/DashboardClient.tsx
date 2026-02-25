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

const DAY   = 86_400_000;
const WEEK  = 7  * DAY;
const MONTH = 30 * DAY;

function isActive(a: Assignment) {
  return a.status !== "submitted" && a.status !== "completed";
}

function groupAssignments(assignments: Assignment[]): { visible: Group[]; rest: Assignment[] } {
  const overdue:   Assignment[] = [];
  const today:     Assignment[] = [];
  const thisWeek:  Assignment[] = [];
  const thisMonth: Assignment[] = [];
  const rest:      Assignment[] = [];

  for (const a of assignments) {
    if (!isActive(a)) continue;
    const ms = msUntilDue(a.due_at);
    if (ms < 0)           overdue.push(a);
    else if (ms < DAY)    today.push(a);
    else if (ms < WEEK)   thisWeek.push(a);
    else if (ms < MONTH)  thisMonth.push(a);
    else                  rest.push(a);
  }

  const visible: Group[] = [];
  if (overdue.length)   visible.push({ label: "Overdue",      items: overdue });
  if (today.length)     visible.push({ label: "Due Today",    items: today });
  if (thisWeek.length)  visible.push({ label: "This Week",    items: thisWeek });
  if (thisMonth.length) visible.push({ label: "Next 30 Days", items: thisMonth });

  return { visible, rest };
}

export default function DashboardClient({ initialAssignments, initialCourses }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [showAll, setShowAll] = useState(false);

  const refresh = useCallback(async () => {
    const [aRes, cRes] = await Promise.all([
      fetch("/api/assignments"),
      fetch("/api/courses"),
    ]);
    if (aRes.ok) setAssignments(await aRes.json());
    if (cRes.ok) setCourses(await cRes.json());
  }, []);

  const active    = assignments.filter(isActive);
  const dueToday  = active.filter(a => { const ms = msUntilDue(a.due_at); return ms >= 0 && ms < DAY; });
  const dueWeek   = active.filter(a => { const ms = msUntilDue(a.due_at); return ms >= 0 && ms < WEEK; });
  const dueMonth  = active.filter(a => { const ms = msUntilDue(a.due_at); return ms >= 0 && ms < MONTH; });

  const { visible: groups, rest } = groupAssignments(assignments);
  const allEmpty = groups.length === 0 && rest.length === 0;

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
          { label: "Due Today",  value: dueToday.length },
          { label: "This Week",  value: dueWeek.length },
          { label: "This Month", value: dueMonth.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
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
          {allEmpty ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-medium">All clear!</p>
              <p className="text-sm mt-1">No upcoming assignments.</p>
            </div>
          ) : (
            <>
              {groups.map(g => (
                <div key={g.label}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                    g.label === "Overdue"   ? "text-rose-400 dark:text-rose-400/80" :
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
              ))}

              {rest.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowAll(prev => !prev)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                  >
                    {showAll ? "Hide" : `Show all · ${rest.length} more`}
                  </button>

                  {showAll && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {rest.map(a => (
                        <AssignmentCard
                          key={a.id}
                          assignment={a}
                          onClick={() => router.push(`/assignments/${a.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
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
