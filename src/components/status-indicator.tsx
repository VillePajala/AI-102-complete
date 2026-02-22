import { cn } from "@/lib/utils"
import { Check, Minus, Loader2 } from "lucide-react"

type Status = "not-started" | "in-progress" | "completed" | "error"

const cfg: Record<Status, { label: string; icon: typeof Check; iconClass: string; text: string; bg: string }> = {
  "not-started": {
    label: "Pending",
    icon: Minus,
    iconClass: "text-muted-foreground/50",
    text: "text-muted-foreground",
    bg: "bg-muted/50",
  },
  "in-progress": {
    label: "Active",
    icon: Loader2,
    iconClass: "text-amber-500 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  completed: {
    label: "Done",
    icon: Check,
    iconClass: "text-emerald-500 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  error: {
    label: "Error",
    icon: Minus,
    iconClass: "text-red-500 dark:text-red-400",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/10",
  },
}

export function StatusIndicator({ status }: { status: Status }) {
  const c = cfg[status]
  const Icon = c.icon
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5", c.bg)}>
      <Icon className={cn("size-3", c.iconClass)} strokeWidth={2.5} />
      <span className={cn("text-[10px] font-semibold", c.text)}>{c.label}</span>
    </div>
  )
}
