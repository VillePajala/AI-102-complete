import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const cfg: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  "not-started": {
    label: "Pending",
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
    bg: "bg-muted/50",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-amber-500 dark:bg-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  completed: {
    label: "Done",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  error: {
    label: "Error",
    dot: "bg-red-500 dark:bg-red-400",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/10",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = cfg[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", c.bg)} role="status" aria-label={`Status: ${c.label}`}>
      <div className={cn("size-2 rounded-full", c.dot)} />
      <span className={cn("text-[11px] font-semibold", c.text)}>{c.label}</span>
    </div>
  )
}
