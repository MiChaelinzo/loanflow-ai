import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loan, LoanStatus, RiskLevel } from '@/lib/types'
import { TrendUp, TrendDown, FileText, Calendar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LoanCardProps {
  loan: Loan
  onClick?: () => void
}

export function LoanCard({ loan, onClick }: LoanCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground'
      case 'pending':
        return 'bg-warning text-warning-foreground'
      case 'defaulted':
        return 'bg-destructive text-destructive-foreground'
      case 'paid-off':
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'text-success'
      case 'medium':
        return 'text-warning'
      case 'high':
        return 'text-orange-500'
      case 'critical':
        return 'text-destructive'
    }
  }

  const covenantIssues = loan.covenants.filter(c => c.status !== 'compliant').length

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:border-accent/50',
        onClick && 'hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{loan.borrowerName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{loan.industry}</p>
          </div>
          <Badge className={getStatusColor(loan.status)}>
            {loan.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(loan.amount, loan.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
            <p className="text-xl font-bold font-mono">{loan.interestRate}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">Maturity:</span>
          <span className="font-medium">{formatDate(loan.maturityDate)}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Risk Score:</span>
            <span className={cn('text-lg font-bold font-mono', getRiskColor(loan.riskLevel))}>
              {loan.riskScore.toFixed(1)}
            </span>
          </div>
          {covenantIssues > 0 && (
            <Badge variant="destructive" className="gap-1">
              <TrendDown size={14} />
              {covenantIssues} Issue{covenantIssues > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                loan.riskScore <= 3 ? 'bg-success' :
                loan.riskScore <= 5 ? 'bg-warning' :
                loan.riskScore <= 7 ? 'bg-orange-500' : 'bg-destructive'
              )}
              style={{ width: `${(loan.riskScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
