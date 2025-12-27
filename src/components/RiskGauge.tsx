import { cn } from '@/lib/utils'

interface RiskGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function RiskGauge({ score, size = 'md', showLabel = true }: RiskGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(10, score))
  const percentage = (normalizedScore / 10) * 100
  const rotation = (percentage / 100) * 180 - 90

  const getColor = (score: number) => {
    if (score <= 3) return 'text-success'
    if (score <= 5) return 'text-warning'
    if (score <= 7) return 'text-orange-500'
    return 'text-destructive'
  }

  const getLabel = (score: number) => {
    if (score <= 3) return 'Low Risk'
    if (score <= 5) return 'Medium Risk'
    if (score <= 7) return 'High Risk'
    return 'Critical Risk'
  }

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
            strokeDasharray="126 126"
            strokeDashoffset="63"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={cn(
              'transition-all duration-1000 ease-out',
              getColor(normalizedScore)
            )}
            strokeDasharray="126 126"
            strokeDashoffset={63 - (percentage / 100) * 63}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn('font-bold font-mono', textSizeClasses[size], getColor(normalizedScore))}>
              {normalizedScore.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
      {showLabel && (
        <div className={cn('text-sm font-medium', getColor(normalizedScore))}>
          {getLabel(normalizedScore)}
        </div>
      )}
    </div>
  )
}
