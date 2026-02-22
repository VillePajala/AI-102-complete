import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const statusConfig: Record<
  Status,
  { label: string; dot: string; glow: string; bg: string; text: string }
> = {
  "not-started": {
    label: "Not Started",
    dot: "bg-muted-foreground/40",
    glow: "",
    bg: "bg-muted/30",
    text: "text-muted-foreground/70",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-warm",
    glow: "shadow-[0_0_4px] shadow-warm/40 animate-glow-pulse",
    bg: "bg-warm/[0.08]",
    text: "text-warm",
  },
  completed: {
    label: "Done",
    dot: "bg-chart-2",
    glow: "shadow-[0_0_4px] shadow-chart-2/40",
    bg: "bg-chart-2/[0.08]",
    text: "text-chart-2",
  },
  error: {
    label: "Error",
    dot: "bg-destructive",
    glow: "shadow-[0_0_4px] shadow-destructive/40",
    bg: "bg-destructive/[0.08]",
    text: "text-destructive",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = statusConfig[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5", c.bg)}>
      <div className={cn("size-1.5 rounded-full", c.dot, c.glow)} />
      <span className={cn("text-[10px] font-medium", c.text)}>{c.label}</span>
    </div>
  )
}
