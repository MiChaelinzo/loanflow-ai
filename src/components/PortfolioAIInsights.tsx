import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loan } from '@/lib/types'
import { Brain, Sparkle, TrendUp, TrendDown, ShieldCheck, Leaf, Target, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

interface PortfolioAIInsightsProps {
  loans: Loan[]
}

interface PortfolioInsights {
  overallHealth: string
  keyTrends: string[]
  topRisks: string[]
  opportunities: string[]
  priorityActions: string[]
  marketPosition: string
}

export function PortfolioAIInsights({ loans }: PortfolioAIInsightsProps) {
  const [insights, setInsights] = useState<PortfolioInsights | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateInsights = async () => {
    if (loans.length === 0) {
      toast.error('No loans in portfolio to analyze')
      return
    }

    setIsGenerating(true)

    try {
      const totalExposure = loans.reduce((sum, l) => sum + l.amount, 0)
      const avgRisk = loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length
      const highRiskCount = loans.filter(l => l.riskScore > 7).length
      const covenantIssues = loans.reduce((sum, l) => 
        sum + l.covenants.filter(c => c.status !== 'compliant').length, 0
      )
      const avgESG = loans.reduce((sum, l) => {
        const scores = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 }
        return sum + (scores[l.esgScore.overall] || 3)
      }, 0) / loans.length
      const industries = [...new Set(loans.map(l => l.industry))]
      const currencies = [...new Set(loans.map(l => l.currency))]

      const prompt = spark.llmPrompt`You are a senior portfolio manager providing executive insights. Analyze this loan portfolio:

Portfolio Metrics:
- Total Loans: ${loans.length}
- Total Exposure: $${(totalExposure / 1000000).toFixed(1)}M
- Average Risk Score: ${avgRisk.toFixed(1)}/10
- High Risk Loans: ${highRiskCount} (${((highRiskCount / loans.length) * 100).toFixed(0)}%)
- Covenant Issues: ${covenantIssues} across portfolio
- Average ESG Score: ${avgESG.toFixed(1)}/5
- Industry Diversification: ${industries.length} sectors (${industries.slice(0, 3).join(', ')})
- Currency Exposure: ${currencies.join(', ')}

Return ONLY a valid JSON object with this structure:
{
  "overallHealth": "one sentence summary of portfolio health",
  "keyTrends": ["trend 1", "trend 2", "trend 3"],
  "topRisks": ["risk 1", "risk 2", "risk 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "priorityActions": ["action 1", "action 2", "action 3"],
  "marketPosition": "one sentence about competitive positioning"
}`

      const aiResponse = await spark.llm(prompt, 'amazon.nova-pro-v1:0', true)
      const insightsData = JSON.parse(aiResponse)
      
      setInsights(insightsData)
      toast.success('Portfolio insights generated')
    } catch (error) {
      console.error('Error generating insights:', error)
      
      const avgRisk = loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length
      const highRiskCount = loans.filter(l => l.riskScore > 7).length
      
      const fallbackInsights: PortfolioInsights = {
        overallHealth: `Portfolio shows ${avgRisk <= 5 ? 'strong' : avgRisk <= 7 ? 'moderate' : 'elevated'} risk profile with ${loans.length} active facilities across ${[...new Set(loans.map(l => l.industry))].length} sectors.`,
        keyTrends: [
          `Average risk score of ${avgRisk.toFixed(1)}/10 indicates ${avgRisk <= 5 ? 'healthy' : 'attention-required'} portfolio quality`,
          `${((loans.filter(l => l.covenants.every(c => c.status === 'compliant')).length / loans.length) * 100).toFixed(0)}% of loans fully covenant compliant`,
          `ESG performance trending ${loans.filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B').length > loans.length / 2 ? 'positive' : 'mixed'} across portfolio`
        ],
        topRisks: [
          highRiskCount > 0 ? `${highRiskCount} high-risk loans require immediate attention and enhanced monitoring` : 'No critical risk outliers identified',
          loans.reduce((sum, l) => sum + l.covenants.filter(c => c.status !== 'compliant').length, 0) > 0 
            ? 'Covenant breaches detected requiring borrower engagement'
            : 'Covenant performance within acceptable ranges',
          'Market volatility exposure through interest rate and currency concentration'
        ],
        opportunities: [
          'Secondary market trading for risk optimization and liquidity management',
          loans.filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B').length > 0 
            ? 'ESG-linked pricing opportunities for high performers'
            : 'Green lending framework development for improved ESG scores',
          'Portfolio diversification through targeted origination in underweight sectors'
        ],
        priorityActions: [
          highRiskCount > 0 ? `Schedule immediate reviews for ${highRiskCount} high-risk facilities` : 'Maintain quarterly review cadence for all facilities',
          'Implement stress testing scenarios for rate and credit shocks',
          'Enhance real-time covenant monitoring and early warning systems'
        ],
        marketPosition: 'Well-positioned with diversified exposure and strong ESG focus aligning with market trends.'
      }
      
      setInsights(fallbackInsights)
      toast.info('Generated insights from portfolio data')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-accent/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <Brain size={24} weight="bold" className="text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Portfolio AI Insights</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Executive summary and strategic recommendations
              </p>
            </div>
          </div>
          <Button 
            size="lg"
            onClick={generateInsights} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkle size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkle size={20} />
                {insights ? 'Refresh' : 'Generate Insights'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {insights && (
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/5 rounded-lg border border-accent/20">
            <div className="flex items-start gap-2 mb-2">
              <Target size={20} className="text-accent flex-shrink-0 mt-0.5" weight="bold" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Overall Portfolio Health</h4>
                <p className="text-sm leading-relaxed">{insights.overallHealth}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendUp size={20} className="text-success" weight="bold" />
                <h4 className="font-semibold">Key Trends</h4>
              </div>
              <ul className="space-y-2">
                {insights.keyTrends.map((trend, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-success mt-0.5">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={20} className="text-warning" weight="bold" />
                <h4 className="font-semibold">Top Risks</h4>
              </div>
              <ul className="space-y-2">
                {insights.topRisks.map((risk, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-warning mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Leaf size={20} className="text-accent" weight="bold" />
                <h4 className="font-semibold">Strategic Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {insights.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={20} className="text-primary" weight="bold" />
                <h4 className="font-semibold">Priority Actions</h4>
              </div>
              <ul className="space-y-2">
                {insights.priorityActions.map((action, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendUp size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm mb-1">Market Position</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insights.marketPosition}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {!insights && !isGenerating && (
        <CardContent>
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Generate AI-powered insights to get strategic recommendations for your portfolio
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
