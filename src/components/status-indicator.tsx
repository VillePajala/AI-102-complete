import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const cfg: Record<Status, { label: string; dot: string; pill: string }> = {
  "not-started": {
    label: "Not Started",
    dot: "bg-foreground/25",
    pill: "bg-foreground/[0.06] text-muted-foreground border border-foreground/[0.06]",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/15",
  },
  completed: {
    label: "Done",
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    pill: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/15",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = cfg[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", c.pill)}>
      <div className={cn("size-1.5 rounded-full", c.dot)} />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{c.label}</span>
    </div>
  )
}
