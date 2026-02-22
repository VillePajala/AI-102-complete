import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const statusConfig: Record<
  Status,
  { label: string; dot: string; ring: string; bg: string; text: string }
> = {
  "not-started": {
    label: "Not Started",
    dot: "bg-muted-foreground/30",
    ring: "",
    bg: "bg-muted/20 border-border/40",
    text: "text-muted-foreground/50",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-warm",
    ring: "shadow-[0_0_6px] shadow-warm/50 animate-glow-pulse",
    bg: "bg-warm/[0.06] border-warm/20",
    text: "text-warm",
  },
  completed: {
    label: "Done",
    dot: "bg-chart-2",
    ring: "shadow-[0_0_6px] shadow-chart-2/50",
    bg: "bg-chart-2/[0.06] border-chart-2/20",
    text: "text-chart-2",
  },
  error: {
    label: "Error",
    dot: "bg-destructive",
    ring: "shadow-[0_0_6px] shadow-destructive/50",
    bg: "bg-destructive/[0.06] border-destructive/20",
    text: "text-destructive",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = statusConfig[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1", c.bg)}>
      <div className={cn("size-1.5 rounded-full", c.dot, c.ring)} />
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", c.text)}>{c.label}</span>
    </div>
  )
}
