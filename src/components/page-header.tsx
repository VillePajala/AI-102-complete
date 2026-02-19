import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description: string
  domain?: string
  weight?: string
}

export function PageHeader({ title, description, domain, weight }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground text-balance">{title}</h1>
        {domain && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            {domain}
          </Badge>
        )}
        {weight && (
          <Badge variant="outline" className="text-[10px] font-mono">
            {weight}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
