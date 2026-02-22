import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const cfg: Record<Status, { label: string; dot: string; text: string }> = {
  "not-started": {
    label: "Pending",
    dot: "bg-muted-foreground/30",
    text: "text-muted-foreground/70",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  completed: {
    label: "Done",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = cfg[status]
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", c.dot)} />
      <span className={cn("text-[10px] font-medium", c.text)}>{c.label}</span>
    </div>
  )
}
