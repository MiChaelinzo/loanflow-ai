import { useState } from 'react'
import { Loan } from '../lib/types'
import { Button } from './ui/button'
import { ChartLine, TrendUp, Trend
interface SpreadTrendDashboardProps 
}
export function SpreadTrendDashboard({ loans }: SpreadTrendDashboardProps) {

interface SpreadTrendDashboardProps {
  loans: Loan[]
}

export function SpreadTrendDashboard({ loans }: SpreadTrendDashboardProps) {
  const [selectedLoan, setSelectedLoan] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

    const older = history.slice(-14, -7)

    
  }
  const selectedLoanData = selecte
    : loansWithPricing.filter(loan => loan.id === selectedL
  return (
      <div className="fl
       
   

        <div className="flex items-center gap-3"
            <SelectTrigger className="w-32"
            </SelectTrigger>
    
              <SelectItem value="90d
          </Select>
    
            </SelectTrigger>
              <SelectItem value="all">All Loans</SelectItem>
    
                </SelectItem>
   


        <Card>
            <CardTitle className="text-sm font-medium text-mute

          
            <p className="text-
        </Card>
        <Card
            <CardTitle className="text-sm font-medium text-muted-fore
          <CardContent>
              {selectedLoanData.f
            <p 
        </Card>
        <Card>
            <CardTitle className="text-sm font-me
          <CardContent>
              {selectedLoanData.filter(l => 
            <p className="tex
        </Card>
        <Card>
            <CardTitle className="text-sm font-medium te
          <CardContent>
              {selectedLoanData.filter(l => Math.abs(calcu
            <p className="te
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
              {(selectedLoanData.reduce((sum, l) => sum + (l.marketPricing?.bidAskSpread || 0), 0) / selectedLoanData.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across portfolio</p>
          </CardContent>
               

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
          <CardContent className="py-12
          const trend = calculateSpreadTrend(loan)
            <p className="text-muted-f
          
      )}
            <Card key={loan.id}>
}
                <div className="flex items-center justify-between">
  return (
                    <CardTitle className="text-lg">{loan.borrowerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{loan.industry}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Spread</div>
                      <div className="text-xl font-bold font-mono">
                        {(loan.marketPricing?.bidAskSpread || 0).toFixed(2)}%
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

                  </div>

              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {(loan.priceHistory || []).slice(-30).map((point, i) => {
                    const maxSpread = Math.max(...(loan.priceHistory || []).map(p => loan.marketPricing?.bidAskSpread || 1))
                    const height = ((loan.marketPricing?.bidAskSpread || 0) / maxSpread) * 100
                    

                      <div
                        key={i}
                        className="flex-1 bg-accent rounded-t transition-all hover:bg-accent/80"

                        title={`${new Date(point.timestamp).toLocaleDateString()}: ${(loan.marketPricing?.bidAskSpread || 0).toFixed(2)}%`}

                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{timeRange} ago</span>
                  <span>Today</span>
                </div>

            </Card>

        })}


      {selectedLoanData.length === 0 && (
        <Card>

            <ChartLine size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No spread data available</h3>
            <p className="text-muted-foreground">Loans need pricing data to display spread trends</p>
          </CardContent>
        </Card>

    </div>

}

export function SpreadTrendDashboardTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <ChartLine size={20} />
      Spread Trends

  )
