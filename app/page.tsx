import Link from "next/link";
import { Plus } from "lucide-react";
import { getAssignments, getCourses } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [assignments, courses] = await Promise.all([
    getAssignments(),
    getCourses(),
  ]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Deadline Manager</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Stay on top of your coursework.</p>
        </div>
        <Link
          href="/assignments/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add
        </Link>
      </div>

      <DashboardClient initialAssignments={assignments} initialCourses={courses} />
    </main>
  );
}
