import { cn } from "@/lib/utils"

type Status = "not-started" | "in-progress" | "completed" | "error"

const statusConfig: Record<
  Status,
  { label: string; dot: string; bg: string; text: string }
> = {
  "not-started": {
    label: "Not Started",
    dot: "bg-white/30",
    bg: "bg-white/5 border-white/10",
    text: "text-white/40",
  },
  "in-progress": {
    label: "Active",
    dot: "bg-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    text: "text-amber-300",
  },
  completed: {
    label: "Done",
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    text: "text-emerald-300",
  },
  error: {
    label: "Error",
    dot: "bg-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    text: "text-red-300",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = statusConfig[status]
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1", c.bg)}>
      <div className={cn("size-1.5 rounded-full", c.dot)} />
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", c.text)}>
        {c.label}
      </span>
    </div>
  )
}
