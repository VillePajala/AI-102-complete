import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-3 pb-6 border-b border-border/40">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {title}
        </h1>
        {domain && (
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/[0.06] text-[10px] font-medium text-primary"
          >
            {domain}
          </Badge>
        )}
        {weight && (
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground/60 border-border/60">
            {weight}
          </Badge>
        )}
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
