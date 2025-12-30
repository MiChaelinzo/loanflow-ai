import { useState } from 'react'
import { Loan } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ChartLine, TrendUp, TrendDown, CaretUp, CaretDown } from '@phosphor-icons/react'

interface SpreadTrendDashboardProps {
  loans: Loan[]
}

export function SpreadTrendDashboard({ loans }: SpreadTrendDashboardProps) {
  const [selectedLoan, setSelectedLoan] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const loansWithPricing = loans.filter(loan => loan.marketPricing && loan.priceHistory)

  const generateSpreadData = (loan: Loan) => {
    const history = loan.priceHistory || []
    return history.map(point => ({
      date: new Date(point.timestamp).toLocaleDateString(),
      spread: loan.marketPricing?.spread || 0,
      price: point.price
    }))
  }

  const calculateSpreadTrend = (loan: Loan) => {
    const history = loan.priceHistory || []
    if (history.length < 2) return 0
    
    const recent = history.slice(-7)
    const older = history.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, p) => sum + (loan.marketPricing?.spread || 0), 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + (loan.marketPricing?.spread || 0), 0) / older.length : recentAvg
    
    return ((recentAvg - olderAvg) / olderAvg) * 100
  }

  const selectedLoanData = selectedLoan === 'all' 
    ? loansWithPricing 
    : loansWithPricing.filter(loan => loan.id === selectedLoan)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChartLine size={28} weight="bold" />
            Spread Trend Analysis
          </h2>
          <p className="text-muted-foreground">Historical credit spread visualization and trend analysis</p>
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
              <SelectValue placeholder="Select loan" />
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

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(selectedLoanData.reduce((sum, l) => sum + (l.marketPricing?.spread || 0), 0) / selectedLoanData.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Widening Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning">
              {selectedLoanData.filter(l => calculateSpreadTrend(l) > 10).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Trend deteriorating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tightening Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              {selectedLoanData.filter(l => calculateSpreadTrend(l) < -10).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Trend improving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stable Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {selectedLoanData.filter(l => Math.abs(calculateSpreadTrend(l)) <= 10).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Minimal change</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {selectedLoanData.map(loan => {
          const trend = calculateSpreadTrend(loan)
          const isWidening = trend > 0
          
          return (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.borrowerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{loan.industry}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Spread</div>
                      <div className="text-xl font-bold font-mono">
                        {(loan.marketPricing?.spread || 0).toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">7d Trend</div>
                      <div className={`text-xl font-bold font-mono flex items-center gap-1 ${
                        isWidening ? 'text-warning' : 'text-success'
                      }`}>
                        {isWidening ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                        {Math.abs(trend).toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant={
                      loan.riskLevel === 'low' ? 'default' :
                      loan.riskLevel === 'medium' ? 'secondary' :
                      loan.riskLevel === 'high' ? 'destructive' : 'destructive'
                    }>
                      {loan.riskLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {(loan.priceHistory || []).slice(-30).map((point, i) => {
                    const maxSpread = Math.max(...(loan.priceHistory || []).map(p => loan.marketPricing?.spread || 1))
                    const height = ((loan.marketPricing?.spread || 0) / maxSpread) * 100
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-accent rounded-t transition-all hover:bg-accent/80"
                        style={{ height: `${height}%` }}
                        title={`${new Date(point.timestamp).toLocaleDateString()}: ${(loan.marketPricing?.spread || 0).toFixed(2)}%`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{timeRange} ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedLoanData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ChartLine size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No spread data available</h3>
            <p className="text-muted-foreground">Loans need pricing data to display spread trends</p>
          </CardContent>
        </Card>
      )}
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