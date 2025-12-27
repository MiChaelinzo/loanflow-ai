import { Card, CardContent } from '@/components/ui/card'
import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  title: string
  insight: string
  type?: 'info' | 'warning' | 'success'
  className?: string
}

export function AIInsightCard({ title, insight, type = 'info', className }: AIInsightCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'border-warning/50 bg-warning/5'
      case 'success':
        return 'border-success/50 bg-success/5'
      default:
        return 'border-accent/50 bg-accent/5'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-warning'
      case 'success':
        return 'text-success'
      default:
        return 'text-accent'
    }
  }

  return (
    <Card className={cn('border-2', getTypeStyles(), className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={cn('flex-shrink-0', getIconColor())}>
            <Sparkle size={24} weight="fill" className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              {title}
              <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-background/50 rounded">
                AI Generated
              </span>
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
