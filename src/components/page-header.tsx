import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-2 pb-4 border-b border-border/60">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{title}</h1>
        {domain && (
          <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
            {domain}
          </Badge>
        )}
        {weight && (
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
            {weight}
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
