import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCourses } from "@/lib/db";
import AssignmentForm from "@/components/AssignmentForm";

export const dynamic = "force-dynamic";

export default async function NewAssignmentPage() {
  const courses = await getCourses();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">New Assignment</h1>
      <AssignmentForm courses={courses} />
    </main>
  );
}
