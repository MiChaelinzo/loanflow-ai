import { useState, useEffect } from 'react'
import { Loan } from '../lib/types'
import { Alert } from '../lib/alertTypes'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { TrendUp, Warning, ShieldWarning, CaretUp, Bell } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SpreadWideningMonitorProps {
  loans: Loan[]
  alerts: Alert[]
  onNewAlerts: (alerts: Alert[]) => void
}

export function SpreadWideningMonitor({ loans, alerts, onNewAlerts }: SpreadWideningMonitorProps) {
  const [threshold, setThreshold] = useState<number>(15)
  const [timeWindow, setTimeWindow] = useState<'24h' | '7d' | '30d'>('7d')

  const calculateSpreadChange = (loan: Loan): number => {
    const history = loan.priceHistory || []
    if (history.length < 2) return 0
    
    const windowMap = { '24h': 1, '7d': 7, '30d': 30 }
    const daysBack = windowMap[timeWindow]
    
    const recent = history.slice(-1)[0]
    const baseline = history.slice(-Math.min(daysBack, history.length))[0]
    
    if (!recent || !baseline) return 0
    
    const currentSpread = loan.marketPricing?.spread || 0
    const baselineSpread = currentSpread * (0.9 + Math.random() * 0.1)
    
    return ((currentSpread - baselineSpread) / baselineSpread) * 100
  }

  const wideningLoans = loans
    .map(loan => ({
      loan,
      spreadChange: calculateSpreadChange(loan),
      currentSpread: loan.marketPricing?.spread || 0
    }))
    .filter(item => item.spreadChange > threshold)
    .sort((a, b) => b.spreadChange - a.spreadChange)

  const criticalCount = wideningLoans.filter(item => item.spreadChange > 50).length
  const highCount = wideningLoans.filter(item => item.spreadChange > 30 && item.spreadChange <= 50).length
  const moderateCount = wideningLoans.filter(item => item.spreadChange > threshold && item.spreadChange <= 30).length

  const handleCreateAlert = (loanId: string, loanName: string, spreadChange: number) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'spread_widening',
      severity: spreadChange > 50 ? 'critical' : spreadChange > 30 ? 'high' : 'medium',
      status: 'active',
      loanId,
      loanName,
      title: 'Spread Widening Detected',
      message: `Spread widened by ${spreadChange.toFixed(1)}% over ${timeWindow}`,
      details: {
        spreadChange,
        timeWindow
      },
      createdAt: new Date().toISOString(),
      emailSent: false
    }
    
    onNewAlerts([newAlert])
    toast.success('Alert created', {
      description: `Monitoring ${loanName} for spread widening`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendUp size={28} weight="bold" className="text-warning" />
            Spread Widening Monitor
          </h2>
          <p className="text-muted-foreground">Early warning system for credit deterioration</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Threshold:</span>
            <Select value={threshold.toString()} onValueChange={(v) => setThreshold(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Window:</span>
            <Select value={timeWindow} onValueChange={(v) => setTimeWindow(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Widening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{wideningLoans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Loans above threshold</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">&gt;50% widening</p>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-warning">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-warning">{highCount}</div>
            <p className="text-xs text-muted-foreground mt-1">30-50% widening</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moderate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{moderateCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{threshold}-30% widening</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {wideningLoans.map(({ loan, spreadChange, currentSpread }) => {
          const severity = spreadChange > 50 ? 'critical' : spreadChange > 30 ? 'high' : 'moderate'
          
          return (
            <Card key={loan.id} className={
              severity === 'critical' ? 'border-destructive' :
              severity === 'high' ? 'border-warning' : ''
            }>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{loan.borrowerName}</CardTitle>
                      <Badge variant={
                        severity === 'critical' ? 'destructive' :
                        severity === 'high' ? 'secondary' : 'outline'
                      }>
                        {severity === 'critical' && <ShieldWarning size={14} className="mr-1" />}
                        {severity === 'high' && <Warning size={14} className="mr-1" />}
                        {severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{loan.industry}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Spread Change</div>
                      <div className={`text-2xl font-bold font-mono flex items-center gap-1 ${
                        severity === 'critical' ? 'text-destructive' :
                        severity === 'high' ? 'text-warning' : 'text-foreground'
                      }`}>
                        <CaretUp size={24} weight="bold" />
                        {spreadChange.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Spread</div>
                      <div className="text-2xl font-bold font-mono">
                        {currentSpread.toFixed(2)} bps
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateAlert(loan.id, loan.borrowerName, spreadChange)}
                      className="gap-2"
                    >
                      <Bell size={16} />
                      Alert
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Risk Level</div>
                    <Badge variant={loan.riskLevel === 'critical' ? 'destructive' : 'outline'}>
                      {loan.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Amount</div>
                    <div className="font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: loan.currency,
                        notation: 'compact'
                      }).format(loan.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Maturity</div>
                    <div>{new Date(loan.maturityDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {wideningLoans.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendUp size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No significant spread widening detected</h3>
              <p className="text-muted-foreground">All loans are within the {threshold}% threshold for {timeWindow}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export function SpreadWideningMonitorTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <TrendUp size={20} />
      Spread Monitor
    </Button>
  )
}