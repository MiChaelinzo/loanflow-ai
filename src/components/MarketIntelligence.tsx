import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Loan } from '../lib/types'
import { TrendUp, TrendDown, ChartLine, Coins, Globe, Calendar } from '@phosphor-icons/react'

interface MarketIntelligenceProps {
  loans: Loan[]
}

export function MarketIntelligence({ loans }: MarketIntelligenceProps) {
  const currencies = [...new Set(loans.map(l => l.currency))]
  const industries = [...new Set(loans.map(l => l.industry))]

  const marketTrends = [
    {
      category: 'Interest Rates',
      trend: 'up',
      change: '+0.75%',
      description: 'Central banks maintaining restrictive policy',
      impact: 'high',
    },
    {
      category: 'Credit Spreads',
      trend: 'stable',
      change: '±5 bps',
      description: 'Investment grade spreads holding steady',
      impact: 'medium',
    },
    {
      category: 'Default Rates',
      trend: 'down',
      change: '-0.2%',
      description: 'Corporate defaults declining YoY',
      impact: 'low',
    },
    {
      category: 'Secondary Volume',
      trend: 'up',
      change: '+18%',
      description: 'Increased loan trading activity',
      impact: 'medium',
    },
  ]

  const industryPerformance = industries.slice(0, 5).map(industry => {
    const industryLoans = loans.filter(l => l.industry === industry)
    const avgRisk = industryLoans.reduce((sum, l) => sum + l.riskScore, 0) / industryLoans.length
    const totalExposure = industryLoans.reduce((sum, l) => sum + l.amount, 0)

    return {
      industry,
      avgRisk,
      totalExposure,
      count: industryLoans.length,
      trend: avgRisk < 5 ? 'positive' : avgRisk > 6 ? 'negative' : 'neutral',
    }
  }).sort((a, b) => b.totalExposure - a.totalExposure)

  const currencyExposure = currencies.map(currency => {
    const currencyLoans = loans.filter(l => l.currency === currency)
    const totalExposure = currencyLoans.reduce((sum, l) => sum + l.amount, 0)
    const percentage = (totalExposure / loans.reduce((sum, l) => sum + l.amount, 0)) * 100

    return {
      currency,
      totalExposure,
      percentage,
      count: currencyLoans.length,
    }
  }).sort((a, b) => b.totalExposure - a.totalExposure)

  const upcomingMaturities = loans
    .filter(l => {
      const maturityDate = new Date(l.maturityDate)
      const now = new Date()
      const monthsUntilMaturity = (maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsUntilMaturity > 0 && monthsUntilMaturity <= 12
    })
    .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())

  const totalMaturityValue = upcomingMaturities.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Globe size={32} className="text-accent" weight="bold" />
          Market Intelligence
        </h2>
        <p className="text-muted-foreground mt-1">
          Real-time market data and portfolio positioning insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>Key indicators affecting loan portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketTrends.map((trend, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {trend.trend === 'up' ? (
                        <TrendUp size={20} className="text-destructive" weight="bold" />
                      ) : trend.trend === 'down' ? (
                        <TrendDown size={20} className="text-success" weight="bold" />
                      ) : (
                        <ChartLine size={20} className="text-muted-foreground" weight="bold" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{trend.category}</p>
                        <p className="text-xs text-muted-foreground">{trend.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold text-sm ${
                        trend.trend === 'up' ? 'text-destructive' : 
                        trend.trend === 'down' ? 'text-success' : 
                        'text-muted-foreground'
                      }`}>
                        {trend.change}
                      </p>
                      <Badge variant={
                        trend.impact === 'high' ? 'destructive' : 
                        trend.impact === 'medium' ? 'secondary' : 
                        'outline'
                      } className="text-xs">
                        {trend.impact}
                      </Badge>
                    </div>
                  </div>
                  {index < marketTrends.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Exposure</CardTitle>
            <CardDescription>Portfolio distribution by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currencyExposure.map((curr, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Coins size={20} className="text-accent" weight="bold" />
                      <div>
                        <p className="font-medium text-sm">{curr.currency}</p>
                        <p className="text-xs text-muted-foreground">{curr.count} loans</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: curr.currency,
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(curr.totalExposure)}
                      </p>
                      <p className="text-xs text-muted-foreground">{curr.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-accent transition-all"
                      style={{ width: `${curr.percentage}%` }}
                    />
                  </div>
                  {index < currencyExposure.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Performance</CardTitle>
            <CardDescription>Risk assessment by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {industryPerformance.map((ind, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ind.industry}</p>
                      <p className="text-xs text-muted-foreground">
                        {ind.count} loans · {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(ind.totalExposure)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Risk</p>
                        <p className="font-mono font-bold text-sm">{ind.avgRisk.toFixed(1)}</p>
                      </div>
                      {ind.trend === 'positive' ? (
                        <TrendDown size={20} className="text-success" weight="bold" />
                      ) : ind.trend === 'negative' ? (
                        <TrendUp size={20} className="text-destructive" weight="bold" />
                      ) : (
                        <ChartLine size={20} className="text-muted-foreground" weight="bold" />
                      )}
                    </div>
                  </div>
                  {index < industryPerformance.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maturity Schedule (Next 12 Months)</CardTitle>
            <CardDescription>Upcoming loan maturities requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMaturities.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-warning" />
                      <span className="text-sm font-medium">Total Maturing</span>
                    </div>
                    <span className="font-mono font-bold text-lg">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(totalMaturityValue)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {upcomingMaturities.slice(0, 5).map((loan) => {
                    const maturityDate = new Date(loan.maturityDate)
                    const monthsUntil = Math.ceil((maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
                    
                    return (
                      <div key={loan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{loan.borrowerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {maturityDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: loan.currency,
                              notation: 'compact',
                              maximumFractionDigits: 1,
                            }).format(loan.amount)}
                          </p>
                          <Badge variant={monthsUntil <= 3 ? 'destructive' : monthsUntil <= 6 ? 'secondary' : 'outline'} className="text-xs">
                            {monthsUntil}mo
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No maturities in the next 12 months</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
