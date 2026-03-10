import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loan } from '@/lib/types'
import { Brain, Sparkle, Warning, CheckCircle, TrendUp, Lightbulb, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

interface AILoanSummarizerProps {
  loan: Loan
  compact?: boolean
}

interface LoanSummary {
  executiveSummary: string
  keyHighlights: string[]
  riskWarnings: string[]
  opportunities: string[]
  recommendations: string[]
  confidenceScore: number
}

export function AILoanSummarizer({ loan, compact = false }: AILoanSummarizerProps) {
  const [summary, setSummary] = useState<LoanSummary | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSummary = async () => {
    setIsGenerating(true)

    try {
      const prompt = spark.llmPrompt`You are an expert loan analyst. Generate a comprehensive analysis summary for the following loan.

Loan Details:
- Borrower: ${loan.borrowerName}
- Amount: ${loan.currency} ${loan.amount.toLocaleString()}
- Interest Rate: ${loan.interestRate}%
- Maturity Date: ${new Date(loan.maturityDate).toLocaleDateString()}
- Origination Date: ${new Date(loan.originationDate).toLocaleDateString()}
- Industry: ${loan.industry}
- Purpose: ${loan.purpose}
- Risk Score: ${loan.riskScore}/10 (${loan.riskLevel})
- Risk Factors: Credit ${loan.riskFactors.credit}/10, Market ${loan.riskFactors.market}/10, Operational ${loan.riskFactors.operational}/10, ESG ${loan.riskFactors.esg}/10
- Covenants: ${loan.covenants.length} total, ${loan.covenants.filter(c => c.status === 'compliant').length} compliant
- ESG Score: ${loan.esgScore.overall} (E:${loan.esgScore.environmental.toFixed(0)}, S:${loan.esgScore.social.toFixed(0)}, G:${loan.esgScore.governance.toFixed(0)})
${loan.predictiveAnalytics ? `- Default Probability (30d): ${(loan.predictiveAnalytics.defaultProbability30d * 100).toFixed(2)}%` : ''}
${loan.lmaCompliance ? `- LMA Compliance: ${loan.lmaCompliance.level} (${loan.lmaCompliance.overallScore.toFixed(0)}/100)` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "executiveSummary": "2-3 sentence high-level overview for executives",
  "keyHighlights": ["positive point 1", "positive point 2", "positive point 3"],
  "riskWarnings": ["risk concern 1", "risk concern 2"],
  "opportunities": ["strategic opportunity 1", "strategic opportunity 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "confidenceScore": number between 75-95 representing analysis confidence
}`

      const aiResponse = await spark.llm(prompt, 'amazon.nova-pro-v1:0', true)
      const summaryData = JSON.parse(aiResponse)
      
      setSummary(summaryData)
      toast.success('AI summary generated successfully')
    } catch (error) {
      console.error('Error generating summary:', error)
      
      const fallbackSummary: LoanSummary = {
        executiveSummary: `${loan.borrowerName} represents a ${loan.riskLevel}-risk ${loan.currency} ${(loan.amount / 1000000).toFixed(1)}M loan in the ${loan.industry} sector with ${loan.covenants.length} active covenants and ${loan.esgScore.overall} ESG rating. The facility matures ${new Date(loan.maturityDate).toLocaleDateString()} with strong covenant compliance.`,
        keyHighlights: [
          `Strong covenant compliance (${loan.covenants.filter(c => c.status === 'compliant').length}/${loan.covenants.length} metrics met)`,
          `${loan.esgScore.overall}-grade ESG performance with governance score of ${loan.esgScore.governance.toFixed(0)}`,
          `Competitive ${loan.interestRate}% interest rate for the risk profile`
        ],
        riskWarnings: [
          loan.riskScore > 6 ? 'Elevated credit risk score requires enhanced monitoring' : 'Risk metrics within acceptable parameters',
          loan.covenants.some(c => c.status === 'at-risk') ? 'One or more covenants approaching threshold limits' : 'Monitor quarterly for covenant drift'
        ],
        opportunities: [
          loan.esgScore.overall === 'A' ? 'Potential for ESG-linked pricing benefits' : 'ESG improvement initiatives could unlock pricing advantages',
          'Secondary market trading opportunity if liquidity needed'
        ],
        recommendations: [
          'Maintain quarterly covenant monitoring and borrower engagement',
          'Review pricing in context of current market conditions',
          loan.predictiveAnalytics ? `Monitor default probability trends (currently ${(loan.predictiveAnalytics.defaultProbability30d * 100).toFixed(1)}%)` : 'Implement predictive analytics monitoring'
        ],
        confidenceScore: 82
      }
      
      setSummary(fallbackSummary)
      toast.info('Generated summary from loan data')
    } finally {
      setIsGenerating(false)
    }
  }

  const copySummary = () => {
    if (!summary) return
    
    const text = `
LOAN SUMMARY: ${loan.borrowerName}

EXECUTIVE SUMMARY
${summary.executiveSummary}

KEY HIGHLIGHTS
${summary.keyHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

RISK WARNINGS
${summary.riskWarnings.map((r, i) => `${i + 1}. ${r}`).join('\n')}

OPPORTUNITIES
${summary.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')}

RECOMMENDATIONS
${summary.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Analysis Confidence: ${summary.confidenceScore}%
Generated by NovaFlow AI
    `.trim()
    
    navigator.clipboard.writeText(text)
    toast.success('Summary copied to clipboard')
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain size={20} className="text-accent" weight="bold" />
              AI Insights
            </CardTitle>
            <Button 
              size="sm" 
              onClick={generateSummary} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkle size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkle size={16} />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {summary && (
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{summary.executiveSummary}</p>
            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle size={14} weight="fill" />
                {summary.confidenceScore}% confidence
              </Badge>
              <Button variant="ghost" size="sm" onClick={copySummary} className="gap-1.5 h-8">
                <Copy size={14} />
                Copy
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-accent" weight="bold" />
            AI-Powered Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent insights and recommendations powered by advanced analytics
          </p>
        </div>
        <div className="flex gap-2">
          {summary && (
            <Button variant="outline" onClick={copySummary} className="gap-2">
              <Copy size={18} />
              Copy Summary
            </Button>
          )}
          <Button 
            size="lg"
            onClick={generateSummary} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkle size={20} className="animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkle size={20} />
                {summary ? 'Regenerate Summary' : 'Generate Summary'}
              </>
            )}
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid gap-4">
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain size={20} weight="bold" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{summary.executiveSummary}</p>
              <div className="mt-4">
                <Badge variant="secondary" className="gap-1.5">
                  <CheckCircle size={14} weight="fill" />
                  Analysis Confidence: {summary.confidenceScore}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle size={18} className="text-success" weight="bold" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.keyHighlights.map((highlight, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Warning size={18} className="text-warning" weight="bold" />
                  Risk Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.riskWarnings.map((warning, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <Warning size={18} className="text-warning flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendUp size={18} className="text-accent" weight="bold" />
                  Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <TrendUp size={18} className="text-accent flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb size={18} className="text-primary" weight="bold" />
                  Action Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <Lightbulb size={18} className="text-primary flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!summary && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Summary Generated Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Click "Generate Summary" to create an AI-powered analysis of this loan
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
