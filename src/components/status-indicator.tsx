import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const statusConfig: Record<Status, { label: string; dotClass: string }> = {
  "not-started": { label: "Not Started", dotClass: "bg-muted-foreground" },
  "in-progress": { label: "In Progress", dotClass: "bg-chart-3" },
  completed: { label: "Completed", dotClass: "bg-chart-2" },
  error: { label: "Error", dotClass: "bg-destructive" },
}

export function StatusIndicator({ status }: { status: Status }) {
  const config = statusConfig[status]
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-2 rounded-full", config.dotClass)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  )
}
