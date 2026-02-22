import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-6 mb-2 border-b border-border">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
          {title}
        </h1>
        {domain && (
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary"
          >
            {domain}
          </Badge>
        )}
        {weight && (
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
            {weight}
          </Badge>
        )}
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
