import { Assignment, STATUS_LABELS, TYPE_LABELS, COLOR_CLASSES, formatDueLabel, msUntilDue } from "@/lib/db";

interface Props {
  assignment: Assignment;
  onClick?: () => void;
}

function urgencyBorder(a: Assignment) {
  const ms = msUntilDue(a.due_at);
  if (a.status !== "pending") return "border-border";
  if (ms < 0)               return "border-red-400 dark:border-red-500";
  if (ms < 24 * 3600 * 1000) return "border-amber-400 dark:border-amber-500";
  if (ms < 7 * 24 * 3600 * 1000) return "border-[hsl(var(--accent))]";
  return "border-border";
}

export default function AssignmentCard({ assignment: a, onClick }: Props) {
  const course = a.course;
  const colorClass = course ? COLOR_CLASSES[course.color] : COLOR_CLASSES.indigo;
  const dueLabel = formatDueLabel(a.due_at);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-l-4 bg-card hover:shadow-sm transition-all animate-fade-in ${urgencyBorder(a)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{a.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {course && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                {course.code || course.name}
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {TYPE_LABELS[a.type]}
            </span>
            {a.weight != null && (
              <span className="text-xs text-muted-foreground">{a.weight}%</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-sm font-medium ${
            a.status !== "pending" ? "text-muted-foreground" :
            msUntilDue(a.due_at) < 0 ? "text-red-500" :
            msUntilDue(a.due_at) < 24 * 3600 * 1000 ? "text-amber-500" : "text-foreground"
          }`}>{dueLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{STATUS_LABELS[a.status]}</p>
        </div>
      </div>
    </button>
  );
}
