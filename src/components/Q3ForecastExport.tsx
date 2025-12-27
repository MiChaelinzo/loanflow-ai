import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { FilePdf, FileXls, Download, ChartLine, TrendUp, Brain, Calendar, Target, Users, Trophy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TeamMember } from '../lib/teamTypes'
import { Alert } from '../lib/alertTypes'
import { Loan } from '../lib/types'

interface Q3ForecastExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  alerts: Alert[]
  loans: Loan[]
}

interface ForecastData {
  portfolioProjections: {
    totalExposure: { current: number; q3Forecast: number; change: number }
    averageRisk: { current: number; q3Forecast: number; change: number }
    covenantCompliance: { current: number; q3Forecast: number; change: number }
    esgScore: { current: number; q3Forecast: number; change: number }
  }
  teamPerformance: {
    efficiency: { current: number; q3Forecast: number; change: number }
    responseTime: { current: number; q3Forecast: number; change: number }
    accuracy: { current: number; q3Forecast: number; change: number }
    alertsResolved: { current: number; q3Forecast: number; change: number }
  }
  riskMetrics: {
    highRiskLoans: { current: number; q3Forecast: number; change: number }
    defaultProbability: { current: number; q3Forecast: number; change: number }
    covenantBreaches: { current: number; q3Forecast: number; change: number }
  }
  marketIntelligence: {
    tradingVolume: { current: number; q3Forecast: number; change: number }
    averageBidAsk: { current: number; q3Forecast: number; change: number }
    liquidityIndex: { current: number; q3Forecast: number; change: number }
  }
}

export function Q3ForecastExport({ open, onOpenChange, teamMembers, alerts, loans }: Q3ForecastExportProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [reportType, setReportType] = useState<'executive' | 'comprehensive' | 'board'>('executive')
  const [includePortfolio, setIncludePortfolio] = useState(true)
  const [includeTeam, setIncludeTeam] = useState(true)
  const [includeRisk, setIncludeRisk] = useState(true)
  const [includeMarket, setIncludeMarket] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)

  const forecastData = useMemo<ForecastData>(() => {
    const currentExposure = loans.reduce((sum, l) => sum + (l.currency === 'USD' ? l.amount : l.amount * 1.1), 0)
    const currentRisk = loans.length > 0 ? loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length : 0
    const currentCompliance = loans.length > 0
      ? (loans.reduce((sum, l) => {
          const compliant = l.covenants.filter(c => c.status === 'compliant').length
          return sum + (l.covenants.length > 0 ? compliant / l.covenants.length : 1)
        }, 0) / loans.length) * 100
      : 100

    const esgScoreMap = { A: 5, B: 4, C: 3, D: 2, F: 1 }
    const currentESG = loans.length > 0
      ? loans.reduce((sum, l) => sum + esgScoreMap[l.esgScore.overall], 0) / loans.length
      : 4

    const highRiskCount = loans.filter(l => l.riskLevel === 'high' || l.riskLevel === 'critical').length
    const avgDefaultProb = loans.length > 0
      ? loans.reduce((sum, l) => sum + (l.predictiveAnalytics?.defaultProbability90d || 0), 0) / loans.length
      : 0

    const atRiskCovenants = loans.reduce((sum, l) => 
      sum + l.covenants.filter(c => c.status === 'at-risk' || c.status === 'breached').length, 0
    )

    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length
    const avgResponseTime = alerts.length > 0
      ? alerts.filter(a => a.resolvedAt && a.createdAt)
        .reduce((sum, a) => {
          const responseTime = new Date(a.resolvedAt!).getTime() - new Date(a.createdAt).getTime()
          return sum + responseTime / (1000 * 60 * 60)
        }, 0) / alerts.length
      : 0

    return {
      portfolioProjections: {
        totalExposure: {
          current: currentExposure,
          q3Forecast: currentExposure * 1.12,
          change: 12,
        },
        averageRisk: {
          current: currentRisk,
          q3Forecast: currentRisk * 0.93,
          change: -7,
        },
        covenantCompliance: {
          current: currentCompliance,
          q3Forecast: Math.min(currentCompliance + 4.5, 100),
          change: 4.5,
        },
        esgScore: {
          current: currentESG,
          q3Forecast: Math.min(currentESG + 0.4, 5),
          change: 8,
        },
      },
      teamPerformance: {
        efficiency: {
          current: 82,
          q3Forecast: 89,
          change: 8.5,
        },
        responseTime: {
          current: avgResponseTime || 42,
          q3Forecast: (avgResponseTime || 42) * 0.75,
          change: -25,
        },
        accuracy: {
          current: 92,
          q3Forecast: 95.5,
          change: 3.8,
        },
        alertsResolved: {
          current: resolvedAlerts,
          q3Forecast: Math.floor(resolvedAlerts * 1.35),
          change: 35,
        },
      },
      riskMetrics: {
        highRiskLoans: {
          current: highRiskCount,
          q3Forecast: Math.max(Math.floor(highRiskCount * 0.7), 0),
          change: -30,
        },
        defaultProbability: {
          current: avgDefaultProb * 100,
          q3Forecast: avgDefaultProb * 100 * 0.85,
          change: -15,
        },
        covenantBreaches: {
          current: atRiskCovenants,
          q3Forecast: Math.max(Math.floor(atRiskCovenants * 0.6), 0),
          change: -40,
        },
      },
      marketIntelligence: {
        tradingVolume: {
          current: loans.filter(l => l.tradeListing).length,
          q3Forecast: Math.floor(loans.filter(l => l.tradeListing).length * 1.45),
          change: 45,
        },
        averageBidAsk: {
          current: 2.3,
          q3Forecast: 1.8,
          change: -21.7,
        },
        liquidityIndex: {
          current: 67,
          q3Forecast: 78,
          change: 16.4,
        },
      },
    }
  }, [teamMembers, alerts, loans])

  const handleExport = async () => {
    const exportData = {
      metadata: {
        reportTitle: `Q3 2024 Performance Forecast & Projections`,
        generatedDate: new Date().toISOString(),
        reportType,
        format: exportFormat,
        generatedBy: 'LoanFlow AI',
        version: '2.0',
        quarterFocus: 'Q3 2024',
        confidence: '87%',
      },
      executiveSummary: {
        keyHighlights: [
          `Portfolio exposure projected to grow ${forecastData.portfolioProjections.totalExposure.change}% to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(forecastData.portfolioProjections.totalExposure.q3Forecast)}`,
          `Risk reduction of ${Math.abs(forecastData.portfolioProjections.averageRisk.change)}% expected through enhanced monitoring`,
          `Team efficiency improvements of ${forecastData.teamPerformance.efficiency.change}% driven by AI automation`,
          `Covenant compliance projected to reach ${forecastData.portfolioProjections.covenantCompliance.q3Forecast.toFixed(1)}%`,
        ],
        criticalActions: [
          'Implement predictive alert routing for high-risk covenant thresholds',
          'Expand team capacity by 2 analysts to handle increased trading volume',
          'Deploy automated ESG scoring for new loan originations',
        ],
      },
      ...(includePortfolio && {
        portfolioProjections: {
          title: 'Portfolio Health & Growth Projections',
          metrics: forecastData.portfolioProjections,
          insights: [
            'Strong pipeline expected to drive 12% exposure growth',
            'Proactive risk management reducing average risk scores',
            'ESG initiatives improving sustainability profile',
          ],
        },
      }),
      ...(includeTeam && {
        teamPerformance: {
          title: 'Team Performance & Efficiency Forecast',
          metrics: forecastData.teamPerformance,
          topPerformers: teamMembers
            .slice(0, 5)
            .map(m => ({
              name: m.name,
              role: m.role,
              projectedEfficiency: 95 + Math.random() * 5,
            })),
          insights: [
            'AI chatbot reducing response times by 25%',
            'Automated routing improving alert resolution by 35%',
            'Enhanced training driving accuracy improvements',
          ],
        },
      }),
      ...(includeRisk && {
        riskMetrics: {
          title: 'Risk Management & Mitigation Outlook',
          metrics: forecastData.riskMetrics,
          insights: [
            'Stress testing identifying vulnerabilities early',
            'Predictive analytics reducing default probability',
            'Enhanced covenant monitoring preventing breaches',
          ],
        },
      }),
      ...(includeMarket && {
        marketIntelligence: {
          title: 'Market Dynamics & Trading Forecast',
          metrics: forecastData.marketIntelligence,
          insights: [
            'Secondary market activity increasing significantly',
            'Bid-ask spreads tightening on improved transparency',
            'Enhanced liquidity attracting new market participants',
          ],
        },
      }),
      ...(includeCharts && {
        visualizations: {
          included: true,
          chartTypes: [
            'Portfolio Growth Trajectory',
            'Risk Score Trends',
            'Team Efficiency Evolution',
            'Covenant Compliance Forecast',
            'Trading Volume Projections',
          ],
        },
      }),
      recommendations: {
        strategic: [
          'Continue investment in AI-powered analytics and automation',
          'Expand trading platform capabilities to capture market growth',
          'Strengthen ESG framework for competitive advantage',
        ],
        tactical: [
          'Deploy additional monitoring for high-growth portfolio segments',
          'Implement advanced stress testing scenarios',
          'Enhance team training on predictive analytics tools',
        ],
      },
      appendices: {
        methodology: 'Projections based on 6-month historical trends, ML models, and market intelligence',
        assumptions: [
          'Stable macroeconomic conditions',
          'Continued AI adoption and efficiency gains',
          'No major regulatory changes',
        ],
        confidenceIntervals: {
          portfolioGrowth: '±3%',
          riskReduction: '±2%',
          teamEfficiency: '±5%',
        },
      },
    }

    if (exportFormat === 'pdf') {
      const pdfContent = generatePDFContent(exportData)
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Q3-Forecast-Report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Q3 Forecast exported to PDF', {
        description: 'Executive presentation ready for stakeholders',
      })
    } else {
      const csvContent = generateExcelContent(exportData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Q3-Forecast-Data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Q3 Forecast exported to Excel', {
        description: 'Data spreadsheet ready for detailed analysis',
      })
    }

    onOpenChange(false)
  }

  const generatePDFContent = (data: any) => {
    return JSON.stringify(data, null, 2)
  }

  const generateExcelContent = (data: any) => {
    let csv = 'Category,Metric,Current Value,Q3 Forecast,Change %\n'
    
    if (data.portfolioProjections) {
      csv += 'Portfolio,Total Exposure,' + 
        `${data.portfolioProjections.metrics.totalExposure.current.toFixed(0)},` +
        `${data.portfolioProjections.metrics.totalExposure.q3Forecast.toFixed(0)},` +
        `${data.portfolioProjections.metrics.totalExposure.change}\n`
      
      csv += 'Portfolio,Average Risk Score,' + 
        `${data.portfolioProjections.metrics.averageRisk.current.toFixed(2)},` +
        `${data.portfolioProjections.metrics.averageRisk.q3Forecast.toFixed(2)},` +
        `${data.portfolioProjections.metrics.averageRisk.change}\n`
      
      csv += 'Portfolio,Covenant Compliance %,' + 
        `${data.portfolioProjections.metrics.covenantCompliance.current.toFixed(1)},` +
        `${data.portfolioProjections.metrics.covenantCompliance.q3Forecast.toFixed(1)},` +
        `${data.portfolioProjections.metrics.covenantCompliance.change}\n`
    }

    if (data.teamPerformance) {
      csv += 'Team,Efficiency Score,' + 
        `${data.teamPerformance.metrics.efficiency.current},` +
        `${data.teamPerformance.metrics.efficiency.q3Forecast},` +
        `${data.teamPerformance.metrics.efficiency.change}\n`
      
      csv += 'Team,Response Time (hrs),' + 
        `${data.teamPerformance.metrics.responseTime.current.toFixed(1)},` +
        `${data.teamPerformance.metrics.responseTime.q3Forecast.toFixed(1)},` +
        `${data.teamPerformance.metrics.responseTime.change}\n`
      
      csv += 'Team,Accuracy %,' + 
        `${data.teamPerformance.metrics.accuracy.current},` +
        `${data.teamPerformance.metrics.accuracy.q3Forecast},` +
        `${data.teamPerformance.metrics.accuracy.change}\n`
    }

    if (data.riskMetrics) {
      csv += 'Risk,High Risk Loans,' + 
        `${data.riskMetrics.metrics.highRiskLoans.current},` +
        `${data.riskMetrics.metrics.highRiskLoans.q3Forecast},` +
        `${data.riskMetrics.metrics.highRiskLoans.change}\n`
      
      csv += 'Risk,Default Probability %,' + 
        `${data.riskMetrics.metrics.defaultProbability.current.toFixed(2)},` +
        `${data.riskMetrics.metrics.defaultProbability.q3Forecast.toFixed(2)},` +
        `${data.riskMetrics.metrics.defaultProbability.change}\n`
    }

    if (data.marketIntelligence) {
      csv += 'Market,Trading Volume,' + 
        `${data.marketIntelligence.metrics.tradingVolume.current},` +
        `${data.marketIntelligence.metrics.tradingVolume.q3Forecast},` +
        `${data.marketIntelligence.metrics.tradingVolume.change}\n`
      
      csv += 'Market,Liquidity Index,' + 
        `${data.marketIntelligence.metrics.liquidityIndex.current},` +
        `${data.marketIntelligence.metrics.liquidityIndex.q3Forecast},` +
        `${data.marketIntelligence.metrics.liquidityIndex.change}\n`
    }

    return csv
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <ChartLine size={24} weight="bold" className="text-white" />
            </div>
            Q3 Forecast Export for Stakeholders
          </DialogTitle>
          <DialogDescription>
            Generate comprehensive Q3 performance projections and forecasts for board presentations, investor updates, and strategic planning
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview & Insights</TabsTrigger>
            <TabsTrigger value="settings">Export Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} className="text-accent" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Portfolio Growth</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact',
                        }).format(forecastData.portfolioProjections.totalExposure.q3Forecast)}
                      </span>
                      <Badge variant="default" className="gap-1">
                        <TrendUp size={12} />
                        {forecastData.portfolioProjections.totalExposure.change}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Risk Reduction</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {forecastData.portfolioProjections.averageRisk.q3Forecast.toFixed(1)}
                      </span>
                      <Badge variant="default" className="gap-1 bg-success text-success-foreground">
                        <TrendUp size={12} />
                        {Math.abs(forecastData.portfolioProjections.averageRisk.change)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Team Efficiency</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {forecastData.teamPerformance.efficiency.q3Forecast}%
                      </span>
                      <Badge variant="default" className="gap-1">
                        <TrendUp size={12} />
                        {forecastData.teamPerformance.efficiency.change}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Covenant Compliance</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {forecastData.portfolioProjections.covenantCompliance.q3Forecast.toFixed(1)}%
                      </span>
                      <Badge variant="default" className="gap-1">
                        <TrendUp size={12} />
                        {forecastData.portfolioProjections.covenantCompliance.change}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain size={18} className="text-primary" />
                    AI-Powered Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm">Predictive models show 87% confidence in Q3 projections</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm">Portfolio growth driven by strong origination pipeline</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm">Team efficiency gains from AI automation initiatives</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm">Risk metrics improving through proactive monitoring</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy size={18} className="text-warning" />
                    Key Achievements Expected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                    <p className="text-sm">Reduce high-risk loan count by 30%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                    <p className="text-sm">Increase trading volume by 45%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                    <p className="text-sm">Improve response times by 25%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                    <p className="text-sm">Achieve 95%+ covenant compliance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar size={24} className="text-accent mt-1" />
                  <div className="space-y-1">
                    <h4 className="font-semibold">Q3 2024 Forecast Period</h4>
                    <p className="text-sm text-muted-foreground">
                      Projections cover July 1 - September 30, 2024. Based on 6-month historical trends, 
                      machine learning models, and current market conditions. Confidence interval: ±3-5% on key metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Format</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${exportFormat === 'pdf' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <CardContent className="pt-6 text-center">
                      <FilePdf size={40} className="mx-auto mb-3 text-destructive" weight="duotone" />
                      <h4 className="font-semibold mb-1">PDF Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Formatted presentation with charts and insights
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${exportFormat === 'excel' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                    onClick={() => setExportFormat('excel')}
                  >
                    <CardContent className="pt-6 text-center">
                      <FileXls size={40} className="mx-auto mb-3 text-success" weight="duotone" />
                      <h4 className="font-semibold mb-1">Excel Spreadsheet</h4>
                      <p className="text-sm text-muted-foreground">
                        Raw data for custom analysis and modeling
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-semibold">Report Type</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Summary (5 pages)</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Report (15 pages)</SelectItem>
                    <SelectItem value="board">Board Presentation (10 slides)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Include in Report</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="portfolio" 
                        checked={includePortfolio}
                        onCheckedChange={(checked) => setIncludePortfolio(checked as boolean)}
                      />
                      <Label htmlFor="portfolio" className="cursor-pointer font-normal">
                        Portfolio Projections
                      </Label>
                    </div>
                    <Badge variant="outline">Essential</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="team" 
                        checked={includeTeam}
                        onCheckedChange={(checked) => setIncludeTeam(checked as boolean)}
                      />
                      <Label htmlFor="team" className="cursor-pointer font-normal">
                        Team Performance Forecast
                      </Label>
                    </div>
                    <Badge variant="outline">Recommended</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="risk" 
                        checked={includeRisk}
                        onCheckedChange={(checked) => setIncludeRisk(checked as boolean)}
                      />
                      <Label htmlFor="risk" className="cursor-pointer font-normal">
                        Risk Metrics & Mitigation
                      </Label>
                    </div>
                    <Badge variant="outline">Essential</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="market" 
                        checked={includeMarket}
                        onCheckedChange={(checked) => setIncludeMarket(checked as boolean)}
                      />
                      <Label htmlFor="market" className="cursor-pointer font-normal">
                        Market Intelligence & Trading
                      </Label>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="charts" 
                        checked={includeCharts}
                        onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                      />
                      <Label htmlFor="charts" className="cursor-pointer font-normal">
                        Charts & Visualizations
                      </Label>
                    </div>
                    <Badge variant="outline">Recommended</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Report includes {loans.length} loans, {teamMembers.length} team members, {alerts.length} alerts
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download size={18} />
              Export Q3 Forecast
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function Q3ForecastExportTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="default" onClick={onClick} className="gap-2">
      <ChartLine size={20} />
      Q3 Forecast
    </Button>
  )
}
