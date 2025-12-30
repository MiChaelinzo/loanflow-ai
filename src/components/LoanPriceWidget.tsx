import { Loan } from '@/lib/types'
import { Badge } from './ui/badge'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

interface LoanPriceWidgetProps {
  loan: Loan
  compact?: boolean
}

export function LoanPriceWidget({ loan, compact = false }: LoanPriceWidgetProps) {
  const pricing = loan.marketPricing

  if (!pricing) {
    return null
  }

  const getTrendIcon = () => {
    if (pricing.priceChange24h > 0) {
      return <TrendUp size={compact ? 12 : 14} weight="bold" />
    } else if (pricing.priceChange24h < 0) {
      return <TrendDown size={compact ? 12 : 14} weight="bold" />
    }
    return <Minus size={compact ? 12 : 14} weight="bold" />
  }

  const getTrendColor = () => {
    if (pricing.priceChange24h > 0) return 'text-success'
    if (pricing.priceChange24h < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  const getSentimentColor = () => {
    switch (pricing.marketSentiment) {
      case 'bullish': return 'bg-success/10 text-success border-success/20'
      case 'bearish': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: loan.currency,
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(pricing.currentPrice)}
          </span>
          <span className={`flex items-center gap-0.5 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            {Math.abs(pricing.priceChangePercent24h).toFixed(1)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-mono font-bold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: loan.currency,
            notation: 'compact',
            maximumFractionDigits: 2,
          }).format(pricing.currentPrice)}
        </span>
        <span className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          {pricing.priceChangePercent24h >= 0 ? '+' : ''}
          {pricing.priceChangePercent24h.toFixed(2)}%
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={getSentimentColor()}>
          {pricing.marketSentiment}
        </Badge>
        <span className="text-xs text-muted-foreground">
          YTM: {pricing.yieldToMaturity.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
