import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-3 pb-6 mb-2">
      {/* Bottom border with gradient */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
          {title}
        </h1>
        {domain && (
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/[0.06] text-[10px] font-semibold uppercase tracking-wider text-primary"
          >
            {domain}
          </Badge>
        )}
        {weight && (
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground/50 border-border/50">
            {weight}
          </Badge>
        )}
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
