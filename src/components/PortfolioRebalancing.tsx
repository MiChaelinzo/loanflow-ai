import { useState } from 'react'
import { Loan } from '@/lib/types'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { 
  Scales, 
  TrendUp, 
  Warning, 
  CheckCircle,
  ArrowRight,
  Sparkle,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { toast } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

interface RebalancingRecommendation {
  id: string
  type: 'reduce_exposure' | 'increase_diversity' | 'risk_adjustment' | 'esg_improvement' | 'compliance_gap'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  currentValue: number
  targetValue: number
  actions: string[]
  affectedLoans: string[]
  impact: string
}

interface PortfolioRebalancingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loans: Loan[]
}

export function PortfolioRebalancing({ open, onOpenChange, loans }: PortfolioRebalancingProps) {
  const [recommendations, setRecommendations] = useState<RebalancingRecommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const generateRecommendations = async () => {
    setIsGenerating(true)
    setHasGenerated(false)

    try {
      const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
      const avgRisk = loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length
      const highRiskLoans = loans.filter(l => l.riskScore > 7)
      const industries = [...new Set(loans.map(l => l.industry))]
      const currencies = [...new Set(loans.map(l => l.currency))]
      
      const industryConcentration = industries.map(industry => ({
        industry,
        count: loans.filter(l => l.industry === industry).length,
        exposure: loans.filter(l => l.industry === industry).reduce((sum, l) => sum + l.amount, 0)
      })).sort((a, b) => b.exposure - a.exposure)

      const maxIndustryExposure = industryConcentration[0]
      const maxIndustryPercent = (maxIndustryExposure.exposure / totalExposure) * 100

      const avgEsgScores = {
        A: loans.filter(l => l.esgScore.overall === 'A').length,
        B: loans.filter(l => l.esgScore.overall === 'B').length,
        C: loans.filter(l => l.esgScore.overall === 'C').length,
        D: loans.filter(l => l.esgScore.overall === 'D').length,
        F: loans.filter(l => l.esgScore.overall === 'F').length,
      }

      const prompt = spark.llmPrompt`You are a portfolio management AI assistant. Analyze this loan portfolio and provide strategic rebalancing recommendations.

Portfolio Summary:
- Total Loans: ${loans.length}
- Total Exposure: $${(totalExposure / 1000000).toFixed(1)}M
- Average Risk Score: ${avgRisk.toFixed(1)}/10
- High Risk Loans (>7): ${highRiskLoans.length}
- Industries: ${industries.join(', ')}
- Top Industry: ${maxIndustryExposure.industry} (${maxIndustryPercent.toFixed(1)}% of portfolio)
- Currencies: ${currencies.join(', ')}
- ESG Distribution: A=${avgEsgScores.A}, B=${avgEsgScores.B}, C=${avgEsgScores.C}, D=${avgEsgScores.D}, F=${avgEsgScores.F}

Generate 4-6 strategic rebalancing recommendations focusing on:
1. Industry concentration risk (recommend if any industry >30%)
2. Risk diversification (recommend if avg risk >6 or >20% high risk loans)
3. ESG improvement opportunities (recommend if >30% have C or worse)
4. Currency exposure balance
5. Covenant compliance gaps

Return a JSON object with a single "recommendations" property containing an array of recommendations. Each recommendation should have:
{
  "recommendations": [
    {
      "type": "reduce_exposure" | "increase_diversity" | "risk_adjustment" | "esg_improvement" | "compliance_gap",
      "severity": "high" | "medium" | "low",
      "title": "Brief action title",
      "description": "2-3 sentence explanation of the issue and why it matters",
      "currentValue": numeric current metric,
      "targetValue": numeric target metric,
      "actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "impact": "Expected positive outcome if implemented"
    }
  ]
}`

      const response = await spark.llm(prompt, 'amazon.nova-pro-v1:0', true)
      const data = JSON.parse(response)
      
      const enrichedRecommendations = data.recommendations.map((rec: any, idx: number) => ({
        ...rec,
        id: `rec-${Date.now()}-${idx}`,
        affectedLoans: loans
          .filter(l => {
            if (rec.type === 'reduce_exposure' && maxIndustryPercent > 30) {
              return l.industry === maxIndustryExposure.industry
            }
            if (rec.type === 'risk_adjustment') {
              return l.riskScore > 7
            }
            if (rec.type === 'esg_improvement') {
              return l.esgScore.overall === 'C' || l.esgScore.overall === 'D' || l.esgScore.overall === 'F'
            }
            return false
          })
          .slice(0, 5)
          .map(l => l.id)
      }))

      setRecommendations(enrichedRecommendations)
      setHasGenerated(true)
      toast.success('Rebalancing recommendations generated')
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      
      const fallbackRecommendations: RebalancingRecommendation[] = []

      const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
      const avgRisk = loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length
      const highRiskLoans = loans.filter(l => l.riskScore > 7)
      
      if (avgRisk > 6) {
        fallbackRecommendations.push({
          id: 'rec-risk-1',
          type: 'risk_adjustment',
          severity: 'high',
          title: 'Reduce High-Risk Loan Concentration',
          description: `Your portfolio has ${highRiskLoans.length} high-risk loans (risk score >7) with an average risk of ${avgRisk.toFixed(1)}. This concentration increases default probability and potential losses.`,
          currentValue: highRiskLoans.length,
          targetValue: Math.floor(highRiskLoans.length * 0.6),
          actions: [
            'Sell or securitize the highest-risk loans',
            'Add investment-grade loans to balance the portfolio',
            'Implement stricter underwriting criteria for new loans'
          ],
          affectedLoans: highRiskLoans.slice(0, 5).map(l => l.id),
          impact: 'Expected 15-20% reduction in portfolio-wide default probability'
        })
      }

      const industries = [...new Set(loans.map(l => l.industry))]
      const industryConcentration = industries.map(industry => ({
        industry,
        count: loans.filter(l => l.industry === industry).length,
        exposure: loans.filter(l => l.industry === industry).reduce((sum, l) => sum + l.amount, 0)
      })).sort((a, b) => b.exposure - a.exposure)

      if (industryConcentration[0].exposure / totalExposure > 0.3) {
        fallbackRecommendations.push({
          id: 'rec-industry-1',
          type: 'reduce_exposure',
          severity: 'high',
          title: `Reduce ${industryConcentration[0].industry} Concentration`,
          description: `${industryConcentration[0].industry} represents ${((industryConcentration[0].exposure / totalExposure) * 100).toFixed(1)}% of your portfolio, creating significant sector-specific risk.`,
          currentValue: (industryConcentration[0].exposure / totalExposure) * 100,
          targetValue: 25,
          actions: [
            `Reduce ${industryConcentration[0].industry} exposure by 20-25%`,
            'Diversify into counter-cyclical industries',
            'Set industry exposure limits at 25% maximum'
          ],
          affectedLoans: loans.filter(l => l.industry === industryConcentration[0].industry).slice(0, 5).map(l => l.id),
          impact: 'Improved resilience to sector-specific downturns'
        })
      }

      const poorEsgLoans = loans.filter(l => l.esgScore.overall === 'C' || l.esgScore.overall === 'D' || l.esgScore.overall === 'F')
      if (poorEsgLoans.length / loans.length > 0.3) {
        fallbackRecommendations.push({
          id: 'rec-esg-1',
          type: 'esg_improvement',
          severity: 'medium',
          title: 'Improve ESG Portfolio Quality',
          description: `${poorEsgLoans.length} loans (${((poorEsgLoans.length / loans.length) * 100).toFixed(1)}%) have ESG ratings of C or worse, limiting access to sustainable finance markets.`,
          currentValue: poorEsgLoans.length,
          targetValue: Math.floor(poorEsgLoans.length * 0.5),
          actions: [
            'Engage with borrowers on ESG improvement plans',
            'Prioritize A/B-rated ESG loans in new originations',
            'Consider divesting bottom 20% ESG performers'
          ],
          affectedLoans: poorEsgLoans.slice(0, 5).map(l => l.id),
          impact: 'Access to green bond markets and improved investor appeal'
        })
      }

      setRecommendations(fallbackRecommendations)
      setHasGenerated(true)
      toast.success('Rebalancing recommendations generated')
    } finally {
      setIsGenerating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <Warning size={18} weight="fill" className="text-destructive" />
      case 'medium': return <TrendUp size={18} className="text-warning" />
      case 'low': return <CheckCircle size={18} className="text-success" />
      default: return <CheckCircle size={18} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scales size={24} weight="bold" />
            Portfolio Rebalancing Recommendations
          </DialogTitle>
          <DialogDescription>
            AI-powered strategic guidance to optimize your loan portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!hasGenerated && (
            <Card className="bg-gradient-to-br from-accent/10 to-primary/5">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkle size={32} weight="fill" className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">AI-Powered Portfolio Analysis</h3>
                  <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                    Our AI will analyze your portfolio's industry concentration, risk distribution, 
                    ESG ratings, and compliance metrics to provide strategic rebalancing recommendations.
                  </p>
                  <Button 
                    onClick={generateRecommendations} 
                    disabled={isGenerating || loans.length === 0}
                    className="gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <ArrowsClockwise size={20} className="animate-spin" />
                        Analyzing Portfolio...
                      </>
                    ) : (
                      <>
                        <Sparkle size={20} weight="fill" />
                        Generate Recommendations
                      </>
                    )}
                  </Button>
                  {loans.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Load some loans to generate recommendations
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {hasGenerated && recommendations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle size={48} className="text-success mx-auto mb-4" weight="fill" />
                <h3 className="text-lg font-semibold mb-2">Portfolio is Well-Balanced!</h3>
                <p className="text-muted-foreground">
                  Your portfolio shows good diversification across industries, risk levels, and ESG ratings. 
                  No critical rebalancing actions are required at this time.
                </p>
              </CardContent>
            </Card>
          )}

          {hasGenerated && recommendations.length > 0 && (
            <>
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scales size={20} />
                    Rebalancing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Recommendations</p>
                      <p className="text-2xl font-bold font-mono">{recommendations.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">High Priority</p>
                      <p className="text-2xl font-bold font-mono text-destructive">
                        {recommendations.filter(r => r.severity === 'high').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Affected Loans</p>
                      <p className="text-2xl font-bold font-mono">
                        {[...new Set(recommendations.flatMap(r => r.affectedLoans))].length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Card key={rec.id} className="border-l-4" style={{
                    borderLeftColor: rec.severity === 'high' ? 'hsl(var(--destructive))' : 
                                    rec.severity === 'medium' ? 'hsl(var(--warning))' : 
                                    'hsl(var(--success))'
                  }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getSeverityIcon(rec.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-base">{rec.title}</CardTitle>
                              <Badge variant={getSeverityColor(rec.severity) as any}>
                                {rec.severity} priority
                              </Badge>
                            </div>
                            <CardDescription>{rec.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-muted-foreground">Progress to Target</span>
                          <span className="font-mono font-semibold">
                            {rec.currentValue.toFixed(1)} → {rec.targetValue.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(rec.targetValue / rec.currentValue) * 100} 
                          className="h-2"
                        />
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommended Actions:</h4>
                        <ul className="space-y-2">
                          {rec.actions.map((action, actionIdx) => (
                            <li key={actionIdx} className="flex items-start gap-2 text-sm">
                              <ArrowRight size={16} className="text-accent mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Card className="bg-muted/50">
                        <CardContent className="py-3">
                          <p className="text-sm">
                            <span className="font-semibold">Expected Impact:</span> {rec.impact}
                          </p>
                        </CardContent>
                      </Card>

                      {rec.affectedLoans.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Affects {rec.affectedLoans.length} loan(s)
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={generateRecommendations} className="gap-2">
                  <ArrowsClockwise size={18} />
                  Regenerate
                </Button>
                <Button onClick={() => {
                  toast.success('Recommendations exported to clipboard')
                  const text = recommendations.map(r => 
                    `${r.title}\n${r.description}\nActions: ${r.actions.join('; ')}\n`
                  ).join('\n---\n\n')
                  navigator.clipboard.writeText(text)
                }}>
                  Export Recommendations
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PortfolioRebalancingTrigger({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <Scales size={18} />
      Rebalancing
    </Button>
  )
}
