import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const cfg: Record<Status, { label: string; dot: string; pill: string }> = {
  "not-started": {
    label: "Not Started",
    dot: "bg-muted-foreground/40",
    pill: "bg-secondary text-muted-foreground",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  completed: {
    label: "Done",
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    pill: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = cfg[status]
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5", c.pill)}>
      <div className={cn("size-1.5 rounded-full", c.dot)} />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{c.label}</span>
    </div>
  )
}
