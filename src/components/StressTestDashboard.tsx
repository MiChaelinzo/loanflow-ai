import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Loan } from '../lib/types'
import { ChartLineUp, Warning, TrendDown, Lightning } from '@phosphor-icons/react'

interface StressTestDashboardProps {
  loans: Loan[]
}

export function StressTestDashboard({ loans }: StressTestDashboardProps) {
  const [scenario, setScenario] = useState('recession')
  const [interestRateShock, setInterestRateShock] = useState([2])
  const [defaultRateIncrease, setDefaultRateIncrease] = useState([5])
  const [gdpDecline, setGdpDecline] = useState([3])

  const scenarios = {
    recession: {
      name: 'Economic Recession',
      description: 'GDP decline, increased defaults, credit spread widening',
      interestShock: 2,
      defaultIncrease: 5,
      gdpDecline: 3,
    },
    'market-shock': {
      name: 'Market Shock',
      description: 'Sudden liquidity crisis, spike in risk premiums',
      interestShock: 3.5,
      defaultIncrease: 7,
      gdpDecline: 1,
    },
    'sector-crisis': {
      name: 'Sector-Specific Crisis',
      description: 'Major disruption in key industries',
      interestShock: 1.5,
      defaultIncrease: 10,
      gdpDecline: 2,
    },
    custom: {
      name: 'Custom Scenario',
      description: 'Define your own stress parameters',
      interestShock: interestRateShock[0],
      defaultIncrease: defaultRateIncrease[0],
      gdpDecline: gdpDecline[0],
    },
  }

  const currentScenario = scenarios[scenario as keyof typeof scenarios]

  const calculateStressImpact = () => {
    const params = scenario === 'custom' 
      ? { interestShock: interestRateShock[0], defaultIncrease: defaultRateIncrease[0], gdpDecline: gdpDecline[0] }
      : currentScenario

    const baseDefaultRate = loans.reduce((sum, loan) => 
      sum + (loan.predictiveAnalytics?.defaultProbability90d || 0), 0) / loans.length

    const stressedDefaultRate = baseDefaultRate + (params.defaultIncrease / 100)
    const expectedLosses = loans.reduce((sum, loan) => sum + loan.amount, 0) * stressedDefaultRate * 0.4

    const loansAtRisk = loans.filter(loan => {
      const adjustedRisk = loan.riskScore + (params.interestShock / 2)
      return adjustedRisk > 7
    }).length

    const portfolioImpact = (expectedLosses / loans.reduce((sum, loan) => sum + loan.amount, 0)) * 100

    return {
      baseDefaultRate: baseDefaultRate * 100,
      stressedDefaultRate: stressedDefaultRate * 100,
      expectedLosses,
      loansAtRisk,
      portfolioImpact,
      breachProbability: Math.min(95, loansAtRisk / loans.length * 100 + params.defaultIncrease * 2),
    }
  }

  const impact = loans.length > 0 ? calculateStressImpact() : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Lightning size={32} className="text-warning" weight="bold" />
          Portfolio Stress Testing
        </h2>
        <p className="text-muted-foreground mt-1">
          Simulate adverse scenarios and assess portfolio resilience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Scenario Configuration</CardTitle>
            <CardDescription>Select or customize stress test parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stress Scenario</label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recession">Economic Recession</SelectItem>
                  <SelectItem value="market-shock">Market Shock</SelectItem>
                  <SelectItem value="sector-crisis">Sector Crisis</SelectItem>
                  <SelectItem value="custom">Custom Scenario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-medium text-sm">{currentScenario.name}</p>
              <p className="text-xs text-muted-foreground">{currentScenario.description}</p>
            </div>

            {scenario === 'custom' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Interest Rate Shock</label>
                      <span className="text-sm text-muted-foreground">+{interestRateShock[0]}%</span>
                    </div>
                    <Slider
                      value={interestRateShock}
                      onValueChange={setInterestRateShock}
                      min={0}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Default Rate Increase</label>
                      <span className="text-sm text-muted-foreground">+{defaultRateIncrease[0]}%</span>
                    </div>
                    <Slider
                      value={defaultRateIncrease}
                      onValueChange={setDefaultRateIncrease}
                      min={0}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">GDP Decline</label>
                      <span className="text-sm text-muted-foreground">-{gdpDecline[0]}%</span>
                    </div>
                    <Slider
                      value={gdpDecline}
                      onValueChange={setGdpDecline}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stress Test Results</CardTitle>
            <CardDescription>Projected impact on portfolio performance</CardDescription>
          </CardHeader>
          <CardContent>
            {impact ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Base Default Rate</p>
                    <p className="text-2xl font-bold font-mono">{impact.baseDefaultRate.toFixed(2)}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Stressed Default Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold font-mono text-warning">{impact.stressedDefaultRate.toFixed(2)}%</p>
                      <TrendDown size={20} className="text-warning" weight="bold" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Warning size={18} className="text-destructive" />
                      <p className="text-sm font-medium">Expected Losses</p>
                    </div>
                    <p className="text-xl font-bold font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(impact.expectedLosses)}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Warning size={18} className="text-warning" />
                      <p className="text-sm font-medium">Loans at Risk</p>
                    </div>
                    <p className="text-xl font-bold font-mono">{impact.loansAtRisk}</p>
                    <p className="text-xs text-muted-foreground">
                      {((impact.loansAtRisk / loans.length) * 100).toFixed(0)}% of portfolio
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <ChartLineUp size={18} className="text-accent" />
                      <p className="text-sm font-medium">Portfolio Impact</p>
                    </div>
                    <p className="text-xl font-bold font-mono">{impact.portfolioImpact.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">of total exposure</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Risk Assessment</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Covenant Breach Probability</span>
                      <Badge variant={impact.breachProbability > 50 ? 'destructive' : 'secondary'}>
                        {impact.breachProbability.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          impact.breachProbability > 50 ? 'bg-destructive' : 'bg-warning'
                        }`}
                        style={{ width: `${Math.min(100, impact.breachProbability)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightning size={16} className="text-accent" />
                    AI Recommendation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {impact.portfolioImpact > 5
                      ? 'Portfolio shows significant vulnerability to this scenario. Consider: (1) Increasing reserves by 15-20%, (2) Reducing exposure to high-risk sectors, (3) Negotiating covenant relief with at-risk borrowers.'
                      : impact.portfolioImpact > 2
                      ? 'Portfolio demonstrates moderate resilience. Recommended actions: (1) Monitor high-risk loans closely, (2) Maintain adequate liquidity buffers, (3) Consider selective hedging strategies.'
                      : 'Portfolio shows strong resilience to this scenario. Continue current risk management practices while monitoring for early warning indicators.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lightning size={48} className="mx-auto mb-4 opacity-50" />
                <p>Add loans to your portfolio to run stress tests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
