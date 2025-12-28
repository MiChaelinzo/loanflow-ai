import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Separator } from './ui/separator'
import { TrendUp, TrendDown, Target, Download, Calendar, ChartLine, GitBranch } from '@phosphor-icons/react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { motion } from 'framer-motion'
import { Loan } from '../lib/types'
import { TeamMember } from '../lib/teamTypes'
import { Alert } from '../lib/alertTypes'
import { toast } from 'sonner'

interface ComparativeAnalysisProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  alerts: Alert[]
  loans: Loan[]
}

interface QuarterlyData {
  portfolioMetrics: {
    totalExposure: number
    averageRisk: number
    covenantCompliance: number
    esgScore: number
  }
  teamMetrics: {
    efficiency: number
    accuracy: number
    avgTasksPerMember: number
    alertResolution: number
  }
  riskMetrics: {
    highRiskLoans: number
    defaultProbability: number
    avgRecoveryRate: number
    covenantBreaches: number
  }
  marketMetrics: {
    averageBidAsk: number
    marketParticipation: number
    liquidityIndex: number
  }
}

export function ComparativeAnalysis({ open, onOpenChange, teamMembers, alerts, loans }: ComparativeAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const quarterlyData = useMemo(() => {
    const currentExposure = loans.reduce((sum, l) => sum + l.amount, 0)
    const currentRisk = loans.length > 0 
      ? loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length 
      : 0
    const currentCompliance = loans.length > 0
      ? (loans.reduce((sum, l) => {
          const compliant = l.covenants.filter(c => c.status === 'compliant').length
          const total = l.covenants.length
          return sum + (total > 0 ? compliant / total : 1)
        }, 0) / loans.length) * 100
      : 100
    const currentESG = loans.length > 0
      ? loans.reduce((sum, l) => (l.esgScore.overall === 'A' ? 5 : l.esgScore.overall === 'B' ? 4 : 3), 0) / loans.length
      : 4
    const highRiskCount = loans.filter(l => l.riskScore > 7).length
    const avgDefaultProb = loans.length > 0
      ? loans.reduce((sum, l) => sum + (l.predictiveAnalytics?.defaultProbability90d || 0), 0) / loans.length
      : 0
    const covenantBreaches = loans.reduce((sum, l) => {
      return sum + l.covenants.filter(c => c.status === 'breached').length
    }, 0)

    const avgResponseTime = alerts.length > 0
      ? alerts
          .filter(a => a.resolvedAt)
          .reduce((sum, a) => {
            const resolved = new Date(a.resolvedAt!).getTime()
            const created = new Date(a.createdAt).getTime()
            return sum + (resolved - created) / (1000 * 60 * 60)
          }, 0) / alerts.filter(a => a.resolvedAt).length
      : 42

    const q2Data: QuarterlyData = {
      portfolioMetrics: {
        totalExposure: currentExposure * 0.92,
        averageRisk: currentRisk * 1.08,
        covenantCompliance: currentCompliance * 0.95,
        esgScore: currentESG * 0.9,
      },
      teamMetrics: {
        efficiency: 76,
        accuracy: 89,
        avgTasksPerMember: 28,
        alertResolution: 82,
      },
      riskMetrics: {
        highRiskLoans: Math.ceil(highRiskCount * 1.4),
        defaultProbability: avgDefaultProb * 100 * 1.15,
        avgRecoveryRate: 78,
        covenantBreaches: Math.ceil(covenantBreaches * 1.6),
      },
      marketMetrics: {
        averageBidAsk: 3.1,
        marketParticipation: 42,
        liquidityIndex: 68,
      },
    }

    const q3Data: QuarterlyData = {
      portfolioMetrics: {
        totalExposure: currentExposure,
        averageRisk: currentRisk,
        covenantCompliance: currentCompliance,
        esgScore: Math.min(currentESG * 1.12, 5),
      },
      teamMetrics: {
        efficiency: 89,
        accuracy: 94,
        avgTasksPerMember: 34,
        alertResolution: 91,
      },
      riskMetrics: {
        highRiskLoans: highRiskCount,
        defaultProbability: avgDefaultProb * 100 * 0.85,
        avgRecoveryRate: 82,
        covenantBreaches: covenantBreaches,
      },
      marketMetrics: {
        averageBidAsk: 1.8,
        marketParticipation: 65,
        liquidityIndex: 84,
      },
    }

    return { q2: q2Data, q3: q3Data }
  }, [loans, alerts, teamMembers])

  const categories = useMemo(() => {
    const quarterlyData = {
      q2: {
        portfolioMetrics: {
          totalExposure: loans.reduce((sum, l) => sum + l.amount, 0) * 0.92,
          averageRisk: 5.8,
          covenantCompliance: 85,
          esgScore: 3.6,
        },
        teamMetrics: { efficiency: 76, accuracy: 89, avgTasksPerMember: 28, alertResolution: 82 },
        riskMetrics: { highRiskLoans: 8, defaultProbability: 18.5, avgRecoveryRate: 78, covenantBreaches: 12 },
        marketMetrics: { averageBidAsk: 3.1, marketParticipation: 42, liquidityIndex: 68 },
      },
      q3: {
        portfolioMetrics: {
          totalExposure: loans.reduce((sum, l) => sum + l.amount, 0),
          averageRisk: 5.2,
          covenantCompliance: 92,
          esgScore: 4.1,
        },
        teamMetrics: { efficiency: 89, accuracy: 94, avgTasksPerMember: 34, alertResolution: 91 },
        riskMetrics: { highRiskLoans: 5, defaultProbability: 14.2, avgRecoveryRate: 82, covenantBreaches: 7 },
        marketMetrics: { averageBidAsk: 1.8, marketParticipation: 65, liquidityIndex: 84 },
      },
    }

    return [
      {
        name: 'Portfolio',
        metrics: [
          {
            name: 'Total Exposure',
            q2: quarterlyData.q2.portfolioMetrics.totalExposure,
            q3: quarterlyData.q3.portfolioMetrics.totalExposure,
            format: 'currency',
            higher: 'neutral',
          },
          {
            name: 'Average Risk',
            q2: quarterlyData.q2.portfolioMetrics.averageRisk,
            q3: quarterlyData.q3.portfolioMetrics.averageRisk,
            format: 'number',
            higher: 'bad',
          },
          {
            name: 'Covenant Compliance',
            q2: quarterlyData.q2.portfolioMetrics.covenantCompliance,
            q3: quarterlyData.q3.portfolioMetrics.covenantCompliance,
            format: 'percent',
            higher: 'good',
          },
          {
            name: 'ESG Score',
            q2: quarterlyData.q2.portfolioMetrics.esgScore,
            q3: quarterlyData.q3.portfolioMetrics.esgScore,
            format: 'number',
            higher: 'good',
          },
        ],
      },
      {
        name: 'Team Performance',
        metrics: [
          {
            name: 'Efficiency',
            q2: quarterlyData.q2.teamMetrics.efficiency,
            q3: quarterlyData.q3.teamMetrics.efficiency,
            format: 'number',
            higher: 'good',
          },
          {
            name: 'Accuracy',
            q2: quarterlyData.q2.teamMetrics.accuracy,
            q3: quarterlyData.q3.teamMetrics.accuracy,
            format: 'percent',
            higher: 'good',
          },
          {
            name: 'Avg Tasks/Member',
            q2: quarterlyData.q2.teamMetrics.avgTasksPerMember,
            q3: quarterlyData.q3.teamMetrics.avgTasksPerMember,
            format: 'number',
            higher: 'good',
          },
          {
            name: 'Alerts Resolved',
            q2: quarterlyData.q2.teamMetrics.alertResolution,
            q3: quarterlyData.q3.teamMetrics.alertResolution,
            format: 'percent',
            higher: 'good',
          },
        ],
      },
      {
        name: 'Risk Management',
        metrics: [
          {
            name: 'High Risk Loans',
            q2: quarterlyData.q2.riskMetrics.highRiskLoans,
            q3: quarterlyData.q3.riskMetrics.highRiskLoans,
            format: 'number',
            higher: 'bad',
          },
          {
            name: 'Default Probability',
            q2: quarterlyData.q2.riskMetrics.defaultProbability,
            q3: quarterlyData.q3.riskMetrics.defaultProbability,
            format: 'percent',
            higher: 'bad',
          },
          {
            name: 'Recovery Rate',
            q2: quarterlyData.q2.riskMetrics.avgRecoveryRate,
            q3: quarterlyData.q3.riskMetrics.avgRecoveryRate,
            format: 'percent',
            higher: 'good',
          },
          {
            name: 'Covenant Breaches',
            q2: quarterlyData.q2.riskMetrics.covenantBreaches,
            q3: quarterlyData.q3.riskMetrics.covenantBreaches,
            format: 'number',
            higher: 'bad',
          },
        ],
      },
      {
        name: 'Market Intelligence',
        metrics: [
          {
            name: 'Avg Bid-Ask Spread',
            q2: quarterlyData.q2.marketMetrics.averageBidAsk,
            q3: quarterlyData.q3.marketMetrics.averageBidAsk,
            format: 'percent',
            higher: 'bad',
          },
          {
            name: 'Liquidity Index',
            q2: quarterlyData.q2.marketMetrics.liquidityIndex,
            q3: quarterlyData.q3.marketMetrics.liquidityIndex,
            format: 'number',
            higher: 'good',
          },
          {
            name: 'Market Participation',
            q2: quarterlyData.q2.marketMetrics.marketParticipation,
            q3: quarterlyData.q3.marketMetrics.marketParticipation,
            format: 'percent',
            higher: 'good',
          },
        ],
      },
    ]
  }, [loans, alerts, teamMembers])

  const trendData = useMemo(() => {
    return [
      {
        month: 'Apr',
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.03,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance * 0.98,
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure * 0.94,
      },
      {
        month: 'May',
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.01,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance * 0.99,
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure * 0.96,
      },
      {
        month: 'Jun',
        risk: quarterlyData.q2.portfolioMetrics.averageRisk,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance,
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure,
      },
      {
        month: 'Jul',
        risk: quarterlyData.q3.portfolioMetrics.averageRisk * 1.08,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance * 0.96,
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure * 0.98,
      },
      {
        month: 'Aug',
        risk: quarterlyData.q3.portfolioMetrics.averageRisk * 1.04,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance * 0.98,
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure * 0.99,
      },
      {
        month: 'Sep',
        risk: quarterlyData.q3.portfolioMetrics.averageRisk,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance,
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure,
      },
    ]
  }, [quarterlyData])

  const radarData = useMemo(() => {
    const normalize = (value: number, min: number, max: number) => {
      return ((value - min) / (max - min)) * 100
    }

    return [
      {
        metric: 'Risk Management',
        q2: 85,
        q3: 92,
      },
      {
        metric: 'Efficiency',
        q2: 76,
        q3: 89,
      },
      {
        metric: 'Compliance',
        q2: normalize(quarterlyData.q2.portfolioMetrics.covenantCompliance, 0, 100),
        q3: normalize(quarterlyData.q3.portfolioMetrics.covenantCompliance, 0, 100),
      },
      {
        metric: 'ESG',
        q2: normalize(quarterlyData.q2.portfolioMetrics.esgScore, 0, 5) * 100,
        q3: normalize(quarterlyData.q3.portfolioMetrics.esgScore, 0, 5) * 100,
      },
      {
        metric: 'Market Intel',
        q2: 68,
        q3: 84,
      },
    ]
  }, [quarterlyData])

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(value)
      case 'percent':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toFixed(2)
      default:
        return value.toString()
    }
  }

  const calculateChange = (q2: number, q3: number, format: string) => {
    if (q2 === 0) return 0
    const change = ((q3 - q2) / q2) * 100
    return change
  }

  const getChangeIndicator = (change: number, higher: string) => {
    const isPositive = higher === 'good' ? change >= 0 : change < 0
    return (
      <Badge variant={isPositive ? 'default' : 'destructive'} className="gap-1 bg-opacity-20">
        {change >= 0 ? <TrendUp size={10} /> : <TrendDown size={10} />}
        {Math.abs(change).toFixed(1)}%
      </Badge>
    )
  }

  const handleExportComparison = () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `q2-vs-q3-comparison-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Comparison data exported', {
      description: 'Q2 vs Q3 analysis downloaded as CSV',
    })
  }

  const generateCSVContent = () => {
    let csv = 'Category,Metric,Q2 2024,Q3 2024,Change %,Direction\n'
    categories.forEach((category) => {
      category.metrics.forEach((metric) => {
        const change = calculateChange(metric.q2, metric.q3, metric.format)
        const isPositive = metric.higher === 'good' ? change >= 0 : change < 0
        csv += `${category.name},${metric.name},${formatValue(metric.q2, metric.format)},${formatValue(metric.q3, metric.format)},${change.toFixed(1)}%,${isPositive ? 'Positive' : 'Negative'}\n`
      })
    })
    return csv
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch size={24} className="text-accent" />
            Q2 vs Q3 Comparative Analysis
          </DialogTitle>
          <DialogDescription>
            Side-by-side comparison of Q2 2024 actual performance versus Q3 2024 forecasted metrics
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Side-by-Side</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <Button onClick={handleExportComparison} variant="outline" className="gap-2">
              <Download size={18} />
              Export Comparison
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-muted bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} className="text-muted-foreground" />
                      Q2 2024
                    </CardTitle>
                    <Badge variant="secondary">Apr - Jun</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold font-mono">
                      {formatValue(quarterlyData.q2.portfolioMetrics.totalExposure, 'currency')}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Exposure</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q2.portfolioMetrics.averageRisk.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">Risk</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q2.portfolioMetrics.covenantCompliance.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q2.teamMetrics.efficiency}
                      </div>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/50 bg-accent/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} className="text-accent" />
                      Q3 2024 (Forecast)
                    </CardTitle>
                    <Badge variant="default">Jul - Sep</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold font-mono">
                      {formatValue(quarterlyData.q3.portfolioMetrics.totalExposure, 'currency')}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Exposure</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q3.portfolioMetrics.averageRisk.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">Risk</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q3.portfolioMetrics.covenantCompliance.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {quarterlyData.q3.teamMetrics.efficiency}
                      </div>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} className="text-accent" />
                  Performance Radar Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.88 0.005 250)" />
                    <PolarAngleAxis dataKey="metric" />
                    <Radar
                      name="Q2 2024"
                      dataKey="q2"
                      stroke="oklch(0.45 0.02 250)"
                      fill="oklch(0.45 0.02 250)"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Q3 2024"
                      dataKey="q3"
                      stroke="oklch(0.70 0.15 210)"
                      fill="oklch(0.70 0.15 210)"
                      fillOpacity={0.5}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {categories.map((category, idx) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.metrics.map((metric) => {
                        const change = calculateChange(metric.q2, metric.q3, metric.format)
                        return (
                          <div key={metric.name} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{metric.name}</p>
                                {getChangeIndicator(change, metric.higher)}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right min-w-24">
                                <p className="font-mono font-semibold text-muted-foreground">
                                  {formatValue(metric.q2, metric.format)}
                                </p>
                                <p className="text-xs text-muted-foreground">Q2</p>
                              </div>
                              <div className="text-right min-w-24">
                                <p className="font-mono font-semibold text-accent">
                                  {formatValue(metric.q3, metric.format)}
                                </p>
                                <p className="text-xs text-muted-foreground">Q3</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Target size={24} className="text-accent mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Improvements in Q3 Forecast</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Team efficiency increased by 17% through improved alert routing and automation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Risk exposure reduced with better predictive analytics and proactive management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Market participation up 54% with enhanced trading features and liquidity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>ESG scores improved significantly with focused green lending initiatives</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine size={20} className="text-accent" />
                  Portfolio Trends: Q2 → Q3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={trendData}>
                    <defs>
                      <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis yAxisId="left" stroke="oklch(0.45 0.02 250)" />
                    <YAxis yAxisId="right" orientation="right" stroke="oklch(0.70 0.15 210)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="exposure"
                      fill="url(#colorExposure)"
                      stroke="oklch(0.70 0.15 210)"
                      strokeWidth={2}
                      name="Exposure"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="risk"
                      stroke="oklch(0.55 0.22 25)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Risk Score"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="compliance"
                      stroke="oklch(0.60 0.15 160)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Compliance %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Q2 Performance Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Period:</span>
                    <span className="ml-2 font-semibold">April - June 2024</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Trend</span>
                      <Badge variant="destructive" className="gap-1">
                        <TrendUp size={10} />
                        +3.2%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alert Volume</span>
                      <span className="font-mono text-sm font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-mono text-sm font-semibold">48h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Q3 Forecast Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Period:</span>
                    <span className="ml-2 font-semibold">July - September 2024</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Trend</span>
                      <Badge variant="default" className="gap-1">
                        <TrendDown size={10} />
                        -10.3%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Projected Alerts</span>
                      <span className="font-mono text-sm font-semibold">118</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Target Response Time</span>
                      <span className="font-mono text-sm font-semibold">28h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendUp size={18} className="text-success" />
                  Quarter-over-Quarter Growth Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Team Efficiency</span>
                    <Badge variant="outline">+17%</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '89%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Market Participation</span>
                    <Badge variant="outline">+54%</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Risk Reduction</span>
                    <Badge variant="outline">+15%</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '78%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Comparative analysis generated on {new Date().toLocaleDateString()}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ComparativeAnalysisTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <GitBranch size={20} />
      Q2 vs Q3
    </Button>
  )
}
