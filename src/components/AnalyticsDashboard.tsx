import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Loan } from '@/lib/types'
import { ChartLine, Warning, TrendUp, TrendDown, Brain, ShieldWarning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { AIInsightCard } from './AIInsightCard'

interface AnalyticsDashboardProps {
  loans: Loan[]
}

export function AnalyticsDashboard({ loans }: AnalyticsDashboardProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const loansWithAnalytics = loans.filter(loan => loan.predictiveAnalytics)
  
  const highRiskLoans = loansWithAnalytics.filter(
    loan => (loan.predictiveAnalytics?.defaultProbability30d || 0) > 0.15
  )

  const covenantRiskLoans = loansWithAnalytics.filter(
    loan => (loan.predictiveAnalytics?.covenantBreachRisk?.length || 0) > 0
  )

  const avgDefaultProb30d = loansWithAnalytics.length > 0
    ? loansWithAnalytics.reduce((sum, loan) => sum + (loan.predictiveAnalytics?.defaultProbability30d || 0), 0) / loansWithAnalytics.length
    : 0

  const portfolioRiskTrend = avgDefaultProb30d < 0.05 ? 'improving' : avgDefaultProb30d < 0.1 ? 'stable' : 'deteriorating'

  const industryExposure = loans.reduce((acc, loan) => {
    acc[loan.industry] = (acc[loan.industry] || 0) + loan.amount
    return acc
  }, {} as Record<string, number>)

  const topIndustries = Object.entries(industryExposure)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const totalExposure = Object.values(industryExposure).reduce((sum, val) => sum + val, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ChartLine size={32} className="text-accent" weight="bold" />
          Predictive Analytics & Portfolio Intelligence
        </h2>
        <p className="text-muted-foreground mt-1">
          AI-powered forecasting and risk monitoring
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">30-Day Default Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {(avgDefaultProb30d * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              {portfolioRiskTrend === 'improving' && (
                <>
                  <TrendDown size={14} className="text-success" />
                  <p className="text-xs text-success">Improving</p>
                </>
              )}
              {portfolioRiskTrend === 'stable' && (
                <p className="text-xs text-muted-foreground">Stable</p>
              )}
              {portfolioRiskTrend === 'deteriorating' && (
                <>
                  <TrendUp size={14} className="text-destructive" />
                  <p className="text-xs text-destructive">Deteriorating</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{highRiskLoans.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Loans requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Covenant Watch List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{covenantRiskLoans.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Potential breaches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              'text-3xl font-bold',
              portfolioRiskTrend === 'improving' ? 'text-success' :
              portfolioRiskTrend === 'stable' ? 'text-warning' : 'text-destructive'
            )}>
              {portfolioRiskTrend === 'improving' ? 'Good' :
               portfolioRiskTrend === 'stable' ? 'Fair' : 'Poor'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overall assessment</p>
          </CardContent>
        </Card>
      </div>

      {highRiskLoans.length > 0 && (
        <AIInsightCard
          title="Portfolio Risk Alert"
          insight={`${highRiskLoans.length} loan(s) showing elevated default risk (>15% probability in next 30 days). Immediate review recommended for: ${highRiskLoans.slice(0, 3).map(l => l.borrowerName).join(', ')}${highRiskLoans.length > 3 ? '...' : ''}. Consider increasing loan loss provisions by ${formatCurrency(highRiskLoans.reduce((sum, l) => sum + l.amount, 0) * 0.05)}.`}
          type="warning"
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Warning size={22} className="text-warning" />
              Early Warning Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loansWithAnalytics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain size={48} className="mx-auto mb-3 opacity-50" />
                <p>Upload loans to generate predictive analytics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loansWithAnalytics
                  .sort((a, b) => 
                    (b.predictiveAnalytics?.defaultProbability30d || 0) - 
                    (a.predictiveAnalytics?.defaultProbability30d || 0)
                  )
                  .slice(0, 5)
                  .map(loan => {
                    const prob30 = (loan.predictiveAnalytics?.defaultProbability30d || 0) * 100
                    const prob60 = (loan.predictiveAnalytics?.defaultProbability60d || 0) * 100
                    const prob90 = (loan.predictiveAnalytics?.defaultProbability90d || 0) * 100

                    return (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{loan.borrowerName}</h4>
                            <p className="text-sm text-muted-foreground">{loan.industry}</p>
                          </div>
                          <Badge variant={prob30 > 15 ? 'destructive' : prob30 > 10 ? 'default' : 'secondary'}>
                            {prob30.toFixed(1)}% 30d risk
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>30 days</span>
                              <span className="font-mono font-semibold">{prob30.toFixed(1)}%</span>
                            </div>
                            <Progress value={prob30} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>60 days</span>
                              <span className="font-mono font-semibold">{prob60.toFixed(1)}%</span>
                            </div>
                            <Progress value={prob60} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>90 days</span>
                              <span className="font-mono font-semibold">{prob90.toFixed(1)}%</span>
                            </div>
                            <Progress value={prob90} className="h-1.5" />
                          </div>
                        </div>

                        {loan.predictiveAnalytics?.covenantBreachRisk && 
                         loan.predictiveAnalytics.covenantBreachRisk.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-xs text-warning">
                              <ShieldWarning size={14} />
                              <span>Covenant breach likely: {formatDate(loan.predictiveAnalytics.covenantBreachRisk[0].estimatedDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Industry Concentration Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIndustries.map(([industry, exposure]) => {
                const percentage = (exposure / totalExposure) * 100
                const isHighConcentration = percentage > 25

                return (
                  <div key={industry}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{industry}</span>
                        {isHighConcentration && (
                          <Warning size={14} className="text-warning" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-semibold">
                          {formatCurrency(exposure)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>

            <Separator className="my-4" />

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium mb-1">Diversification Score</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {topIndustries.length >= 5 ? 'Well diversified' : 
                   topIndustries.length >= 3 ? 'Moderate concentration' : 
                   'High concentration risk'}
                </p>
                <Badge variant={topIndustries.length >= 5 ? 'default' : 'destructive'}>
                  {topIndustries.length} sectors
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stress Testing Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-success">Base Case</h4>
              <p className="text-xs text-muted-foreground mb-3">Current market conditions</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expected Loss:</span>
                  <span className="font-mono font-semibold">{formatCurrency(totalExposure * 0.01)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Loss Rate:</span>
                  <span className="font-mono font-semibold">1.0%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 border-warning/50 bg-warning/5">
              <h4 className="font-semibold mb-2 text-warning">Moderate Stress</h4>
              <p className="text-xs text-muted-foreground mb-3">Interest rate +2%, GDP -1%</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expected Loss:</span>
                  <span className="font-mono font-semibold">{formatCurrency(totalExposure * 0.035)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Loss Rate:</span>
                  <span className="font-mono font-semibold">3.5%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 border-destructive/50 bg-destructive/5">
              <h4 className="font-semibold mb-2 text-destructive">Severe Stress</h4>
              <p className="text-xs text-muted-foreground mb-3">Interest rate +5%, GDP -3%</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expected Loss:</span>
                  <span className="font-mono font-semibold">{formatCurrency(totalExposure * 0.075)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Loss Rate:</span>
                  <span className="font-mono font-semibold">7.5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIInsightCard
        title="AI Strategic Recommendation"
        insight={`Portfolio analysis suggests ${
          portfolioRiskTrend === 'improving' 
            ? 'favorable conditions for portfolio expansion. Consider allocating additional capital to low-risk sectors with strong ESG scores.'
            : portfolioRiskTrend === 'stable'
            ? 'maintaining current risk appetite. Focus on diversification to reduce industry concentration risk.'
            : 'implementing defensive measures. Recommend reducing exposure to high-risk borrowers and increasing provisioning by 15-20%.'
        } Projected portfolio value under stress: ${formatCurrency(totalExposure * 0.925)} (7.5% haircut in severe scenario).`}
        type={portfolioRiskTrend === 'improving' ? 'success' : portfolioRiskTrend === 'stable' ? 'info' : 'warning'}
      />
    </div>
  )
}
