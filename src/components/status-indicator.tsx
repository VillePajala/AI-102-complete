import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const statusConfig: Record<Status, { label: string; dotClass: string; glowClass: string; bgClass: string }> = {
  "not-started": {
    label: "Not Started",
    dotClass: "bg-muted-foreground/60",
    glowClass: "",
    bgClass: "bg-muted/50 text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    dotClass: "bg-warm",
    glowClass: "shadow-[0_0_6px] shadow-warm/50 animate-glow-pulse",
    bgClass: "bg-warm/10 text-warm",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-chart-2",
    glowClass: "shadow-[0_0_6px] shadow-chart-2/50",
    bgClass: "bg-chart-2/10 text-chart-2",
  },
  error: {
    label: "Error",
    dotClass: "bg-destructive",
    glowClass: "shadow-[0_0_6px] shadow-destructive/50",
    bgClass: "bg-destructive/10 text-destructive",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const config = statusConfig[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5", config.bgClass)}>
      <div className={cn("size-1.5 rounded-full", config.dotClass, config.glowClass)} />
      <span className="text-[10px] font-medium">{config.label}</span>
    </div>
  )
}
