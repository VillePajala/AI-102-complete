import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 mb-2 border-b border-border">
      {(domain || weight) && (
        <div className="flex items-center gap-2">
          {domain && (
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/8 text-[11px] font-bold uppercase tracking-wider text-primary"
            >
              {domain}
            </Badge>
          )}
          {weight && (
            <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
              {weight}
            </Badge>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-balance md:text-3xl leading-[1.15]">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
