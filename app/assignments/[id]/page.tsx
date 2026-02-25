import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAssignmentById, getCourses, STATUS_LABELS, COLOR_CLASSES, formatDueLabel } from "@/lib/db";
import AssignmentForm from "@/components/AssignmentForm";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({ params }: Props) {
  const { id } = await params;
  const [assignment, courses] = await Promise.all([
    getAssignmentById(id),
    getCourses(),
  ]);

  if (!assignment) notFound();

  const course = assignment.course;
  const colorClass = course ? COLOR_CLASSES[course.color] : COLOR_CLASSES.indigo;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <DeleteButton id={id} />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {course && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
              {course.code || course.name}
            </span>
          )}
          <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
            {STATUS_LABELS[assignment.status]}
          </span>
          <span className="text-xs text-muted-foreground">{formatDueLabel(assignment.due_at)}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{assignment.title}</h1>
      </div>

      <AssignmentForm courses={courses} assignment={assignment} />
    </main>
  );
}
