import { useState } from 'react'
import { Loan } from '../lib/types'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ChartLine, TrendUp, TrendDown } from '@phosphor-icons/react'

interface SpreadTrendDashboardProps {
  loans: Loan[]
}

export function SpreadTrendDashboard({ loans }: SpreadTrendDashboardProps) {
  const [selectedLoan, setSelectedLoan] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const loansWithPricing = loans.filter(loan => loan.priceHistory && loan.priceHistory.length > 0)

  const selectedLoanData = selectedLoan === 'all'
    ? loansWithPricing
    : loansWithPricing.filter(loan => loan.id === selectedLoan)

  const calculateSpreadTrend = (loan: Loan) => {
    if (!loan.priceHistory || loan.priceHistory.length < 2) return { trend: 'stable', change: 0 }

    const history = loan.priceHistory.slice(-30)
    const older = history.slice(0, 15)
    const recent = history.slice(-15)

    const oldAvg = older.reduce((sum, p) => sum + (p.spread || 0), 0) / older.length
    const recentAvg = recent.reduce((sum, p) => sum + (p.spread || 0), 0) / recent.length

    const change = ((recentAvg - oldAvg) / oldAvg) * 100

    if (change > 5) return { trend: 'widening', change }
    if (change < -5) return { trend: 'tightening', change }
    return { trend: 'stable', change }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Spread Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">Historical credit spread movements and patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLoan} onValueChange={setSelectedLoan}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
              {loansWithPricing.map(loan => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.borrowerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Widening Spreads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {selectedLoanData.filter(l => calculateSpreadTrend(l).trend === 'widening').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Loans showing spread widening</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stable Spreads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {selectedLoanData.filter(l => calculateSpreadTrend(l).trend === 'stable').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Loans with stable spreads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tightening Spreads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {selectedLoanData.filter(l => calculateSpreadTrend(l).trend === 'tightening').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Loans showing spread tightening</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spread Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedLoanData.map(loan => {
              const { trend, change } = calculateSpreadTrend(loan)
              return (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{loan.borrowerName}</div>
                    <div className="text-sm text-muted-foreground">{loan.industry}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm">
                        Current: {loan.marketPricing?.spread.toFixed(0) || 0} bps
                      </div>
                      <div className={`text-xs ${change > 0 ? 'text-destructive' : change < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}% vs prior period
                      </div>
                    </div>
                    <Badge variant={trend === 'widening' ? 'destructive' : trend === 'tightening' ? 'default' : 'secondary'} className="gap-1.5">
                      {trend === 'widening' && <TrendUp size={14} />}
                      {trend === 'tightening' && <TrendDown size={14} />}
                      {trend === 'stable' && <ChartLine size={14} />}
                      {trend.charAt(0).toUpperCase() + trend.slice(1)}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SpreadTrendDashboardTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <ChartLine size={20} />
      Spread Trends
    </Button>
  )
}
