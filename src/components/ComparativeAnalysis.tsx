import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown, 
  ArrowsLeftRight, 
  Target, 
  Brain, 
  Download,
  GitBranch,
  Calendar,
  ChartBar
} from '@phosphor-icons/react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { TeamMember } from '../lib/teamTypes'
import { Alert } from '../lib/alertTypes'
import { Loan } from '../lib/types'
import { toast } from 'sonner'

interface ComparativeAnalysisProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  alerts: Alert[]
  loans: Loan[]
}

interface QuarterlyData {
  quarter: string
  portfolioMetrics: {
    totalExposure: number
    averageRisk: number
    covenantCompliance: number
    esgScore: number
    loanCount: number
  }
  teamMetrics: {
    efficiency: number
    responseTime: number
    accuracy: number
    alertsResolved: number
    avgTasksPerMember: number
  }
  riskMetrics: {
    highRiskLoans: number
    defaultProbability: number
    covenantBreaches: number
    avgRecoveryRate: number
  }
  marketMetrics: {
    tradingVolume: number
    averageBidAsk: number
    liquidityIndex: number
    marketParticipation: number
  }
}

export function ComparativeAnalysis({ open, onOpenChange, teamMembers, alerts, loans }: ComparativeAnalysisProps) {
  const [selectedView, setSelectedView] = useState<'comparison' | 'trends'>('comparison')

  const quarterlyData = useMemo<{ q2: QuarterlyData; q3: QuarterlyData }>(() => {
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
        }, 0) / Math.max(alerts.filter(a => a.resolvedAt).length, 1)
      : 42

    const q2Data: QuarterlyData = {
      quarter: 'Q2 2024',
      portfolioMetrics: {
        totalExposure: currentExposure * 0.92,
        averageRisk: currentRisk * 1.08,
        covenantCompliance: Math.max(currentCompliance - 6.5, 70),
        esgScore: Math.max(currentESG - 0.5, 2.5),
        loanCount: Math.floor(loans.length * 0.88),
      },
      teamMetrics: {
        efficiency: 76,
        responseTime: avgResponseTime * 1.35,
        accuracy: 89,
        alertsResolved: Math.floor(resolvedAlerts * 0.72),
        avgTasksPerMember: teamMembers.length > 0 ? Math.floor((resolvedAlerts * 0.72) / teamMembers.length) : 8,
      },
      riskMetrics: {
        highRiskLoans: Math.floor(highRiskCount * 1.45),
        defaultProbability: avgDefaultProb * 100 * 1.18,
        covenantBreaches: Math.floor(atRiskCovenants * 1.65),
        avgRecoveryRate: 68,
      },
      marketMetrics: {
        tradingVolume: Math.floor(loans.filter(l => l.tradeListing).length * 0.72),
        averageBidAsk: 3.1,
        liquidityIndex: 58,
        marketParticipation: 42,
      },
    }

    const q3Data: QuarterlyData = {
      quarter: 'Q3 2024',
      portfolioMetrics: {
        totalExposure: currentExposure * 1.12,
        averageRisk: currentRisk * 0.93,
        covenantCompliance: Math.min(currentCompliance + 4.5, 100),
        esgScore: Math.min(currentESG + 0.4, 5),
        loanCount: Math.floor(loans.length * 1.15),
      },
      teamMetrics: {
        efficiency: 89,
        responseTime: avgResponseTime * 0.75,
        accuracy: 95.5,
        alertsResolved: Math.floor(resolvedAlerts * 1.35),
        avgTasksPerMember: teamMembers.length > 0 ? Math.floor((resolvedAlerts * 1.35) / teamMembers.length) : 15,
      },
      riskMetrics: {
        highRiskLoans: Math.max(Math.floor(highRiskCount * 0.7), 0),
        defaultProbability: avgDefaultProb * 100 * 0.85,
        covenantBreaches: Math.max(Math.floor(atRiskCovenants * 0.6), 0),
        avgRecoveryRate: 82,
      },
      marketMetrics: {
        tradingVolume: Math.floor(loans.filter(l => l.tradeListing).length * 1.45),
        averageBidAsk: 1.8,
        liquidityIndex: 78,
        marketParticipation: 65,
      },
    }

    return { q2: q2Data, q3: q3Data }
  }, [teamMembers, alerts, loans])

  const comparisonData = useMemo(() => {
    const categories = [
      {
        name: 'Portfolio',
        metrics: [
          {
            name: 'Total Exposure',
            q2: quarterlyData.q2.portfolioMetrics.totalExposure,
            q3: quarterlyData.q3.portfolioMetrics.totalExposure,
            format: 'currency',
            higher: 'good'
          },
          {
            name: 'Average Risk',
            q2: quarterlyData.q2.portfolioMetrics.averageRisk,
            q3: quarterlyData.q3.portfolioMetrics.averageRisk,
            format: 'decimal',
            higher: 'bad'
          },
          {
            name: 'Covenant Compliance',
            q2: quarterlyData.q2.portfolioMetrics.covenantCompliance,
            q3: quarterlyData.q3.portfolioMetrics.covenantCompliance,
            format: 'percent',
            higher: 'good'
          },
          {
            name: 'ESG Score',
            q2: quarterlyData.q2.portfolioMetrics.esgScore,
            q3: quarterlyData.q3.portfolioMetrics.esgScore,
            format: 'decimal',
            higher: 'good'
          },
          {
            name: 'Loan Count',
            q2: quarterlyData.q2.portfolioMetrics.loanCount,
            q3: quarterlyData.q3.portfolioMetrics.loanCount,
            format: 'number',
            higher: 'neutral'
          },
        ]
      },
      {
        name: 'Team Performance',
        metrics: [
          {
            name: 'Efficiency Score',
            q2: quarterlyData.q2.teamMetrics.efficiency,
            q3: quarterlyData.q3.teamMetrics.efficiency,
            format: 'number',
            higher: 'good'
          },
          {
            name: 'Response Time (hrs)',
            q2: quarterlyData.q2.teamMetrics.responseTime,
            q3: quarterlyData.q3.teamMetrics.responseTime,
            format: 'decimal',
            higher: 'bad'
          },
          {
            name: 'Accuracy',
            q2: quarterlyData.q2.teamMetrics.accuracy,
            q3: quarterlyData.q3.teamMetrics.accuracy,
            format: 'percent',
            higher: 'good'
          },
          {
            name: 'Alerts Resolved',
            q2: quarterlyData.q2.teamMetrics.alertsResolved,
            q3: quarterlyData.q3.teamMetrics.alertsResolved,
            format: 'number',
            higher: 'good'
          },
        ]
      },
      {
        name: 'Risk Management',
        metrics: [
          {
            name: 'High Risk Loans',
            q2: quarterlyData.q2.riskMetrics.highRiskLoans,
            q3: quarterlyData.q3.riskMetrics.highRiskLoans,
            format: 'number',
            higher: 'bad'
          },
          {
            name: 'Default Probability',
            q2: quarterlyData.q2.riskMetrics.defaultProbability,
            q3: quarterlyData.q3.riskMetrics.defaultProbability,
            format: 'percent',
            higher: 'bad'
          },
          {
            name: 'Covenant Breaches',
            q2: quarterlyData.q2.riskMetrics.covenantBreaches,
            q3: quarterlyData.q3.riskMetrics.covenantBreaches,
            format: 'number',
            higher: 'bad'
          },
          {
            name: 'Recovery Rate',
            q2: quarterlyData.q2.riskMetrics.avgRecoveryRate,
            q3: quarterlyData.q3.riskMetrics.avgRecoveryRate,
            format: 'percent',
            higher: 'good'
          },
        ]
      },
      {
        name: 'Market Intelligence',
        metrics: [
          {
            name: 'Trading Volume',
            q2: quarterlyData.q2.marketMetrics.tradingVolume,
            q3: quarterlyData.q3.marketMetrics.tradingVolume,
            format: 'number',
            higher: 'good'
          },
          {
            name: 'Bid-Ask Spread',
            q2: quarterlyData.q2.marketMetrics.averageBidAsk,
            q3: quarterlyData.q3.marketMetrics.averageBidAsk,
            format: 'percent',
            higher: 'bad'
          },
          {
            name: 'Liquidity Index',
            q2: quarterlyData.q2.marketMetrics.liquidityIndex,
            q3: quarterlyData.q3.marketMetrics.liquidityIndex,
            format: 'number',
            higher: 'good'
          },
          {
            name: 'Market Participation',
            q2: quarterlyData.q2.marketMetrics.marketParticipation,
            q3: quarterlyData.q3.marketMetrics.marketParticipation,
            format: 'percent',
            higher: 'good'
          },
        ]
      }
    ]

    return categories
  }, [quarterlyData])

  const trendChartData = useMemo(() => {
    return [
      {
        month: 'Apr',
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure * 0.95,
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.03,
        efficiency: quarterlyData.q2.teamMetrics.efficiency * 0.97,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance * 0.96,
      },
      {
        month: 'May',
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure * 0.98,
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.01,
        efficiency: quarterlyData.q2.teamMetrics.efficiency * 0.99,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance * 0.98,
      },
      {
        month: 'Jun',
        exposure: quarterlyData.q2.portfolioMetrics.totalExposure,
        risk: quarterlyData.q2.portfolioMetrics.averageRisk,
        efficiency: quarterlyData.q2.teamMetrics.efficiency,
        compliance: quarterlyData.q2.portfolioMetrics.covenantCompliance,
      },
      {
        month: 'Jul',
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure * 0.93,
        risk: quarterlyData.q3.portfolioMetrics.averageRisk * 1.05,
        efficiency: quarterlyData.q3.teamMetrics.efficiency * 0.96,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance * 0.97,
      },
      {
        month: 'Aug',
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure * 0.97,
        risk: quarterlyData.q3.portfolioMetrics.averageRisk * 1.02,
        efficiency: quarterlyData.q3.teamMetrics.efficiency * 0.98,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance * 0.99,
      },
      {
        month: 'Sep',
        exposure: quarterlyData.q3.portfolioMetrics.totalExposure,
        risk: quarterlyData.q3.portfolioMetrics.averageRisk,
        efficiency: quarterlyData.q3.teamMetrics.efficiency,
        compliance: quarterlyData.q3.portfolioMetrics.covenantCompliance,
      },
    ]
  }, [quarterlyData])

  const radarComparisonData = useMemo(() => {
    const normalize = (value: number, min: number, max: number) => {
      return ((value - min) / (max - min)) * 100
    }

    return [
      {
        metric: 'Portfolio Growth',
        q2: 85,
        q3: 95,
      },
      {
        metric: 'Risk Management',
        q2: 72,
        q3: 88,
      },
      {
        metric: 'Team Efficiency',
        q2: 76,
        q3: 89,
      },
      {
        metric: 'Compliance',
        q2: normalize(quarterlyData.q2.portfolioMetrics.covenantCompliance, 0, 100),
        q3: normalize(quarterlyData.q3.portfolioMetrics.covenantCompliance, 0, 100),
      },
      {
        metric: 'Market Activity',
        q2: 68,
        q3: 82,
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
      case 'decimal':
        return value.toFixed(2)
      case 'number':
      default:
        return value.toFixed(0)
    }
  }

  const calculateChange = (q2: number, q3: number) => {
    if (q2 === 0) return 0
    return ((q3 - q2) / q2) * 100
  }

  const getChangeIndicator = (change: number, higher: string) => {
    if (higher === 'neutral') {
      return (
        <Badge variant={change >= 0 ? "default" : "secondary"} className="gap-1">
          {change >= 0 ? <TrendUp size={10} /> : <TrendDown size={10} />}
          {Math.abs(change).toFixed(1)}%
        </Badge>
      )
    }

    const isPositive = (change > 0 && higher === 'good') || (change < 0 && higher === 'bad')
    
    return (
      <Badge 
        variant={isPositive ? "default" : "destructive"} 
        className={`gap-1 ${isPositive ? 'bg-success text-success-foreground' : ''}`}
      >
        {change >= 0 ? <TrendUp size={10} /> : <TrendDown size={10} />}
        {Math.abs(change).toFixed(1)}%
      </Badge>
    )
  }

  const handleExport = () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Q2-Q3-Comparison-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Comparative analysis exported', {
      description: 'Q2 vs Q3 data ready for stakeholder review',
    })
  }

  const generateCSVContent = () => {
    let csv = 'Category,Metric,Q2 2024,Q3 2024,Change %,Performance\n'
    
    comparisonData.forEach(category => {
      category.metrics.forEach(metric => {
        const change = calculateChange(metric.q2, metric.q3)
        const isPositive = (change > 0 && metric.higher === 'good') || (change < 0 && metric.higher === 'bad')
        csv += `${category.name},${metric.name},${metric.q2.toFixed(2)},${metric.q3.toFixed(2)},${change.toFixed(2)},${isPositive ? 'Improved' : 'Declined'}\n`
      })
    })

    return csv
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <GitBranch size={24} weight="bold" className="text-white" />
            </div>
            Q2 vs Q3 Comparative Analysis
          </DialogTitle>
          <DialogDescription>
            Side-by-side comparison of quarterly performance metrics showing improvements, trends, and key changes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="comparison" className="gap-2">
                <ArrowsLeftRight size={18} />
                Side-by-Side
              </TabsTrigger>
              <TabsTrigger value="trends" className="gap-2">
                <ChartLine size={18} />
                Trend Analysis
              </TabsTrigger>
            </TabsList>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download size={18} />
              Export
            </Button>
          </div>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} className="text-muted-foreground" />
                      Q2 2024
                    </CardTitle>
                    <Badge variant="secondary">Apr - Jun</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Portfolio</p>
                      <p className="text-2xl font-bold font-mono">
                        {formatValue(quarterlyData.q2.portfolioMetrics.totalExposure, 'currency')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                      <p className="text-2xl font-bold font-mono">
                        {quarterlyData.q2.teamMetrics.efficiency}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-2xl font-bold font-mono">
                        {quarterlyData.q2.portfolioMetrics.averageRisk.toFixed(1)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-bold font-mono">
                        {quarterlyData.q2.portfolioMetrics.covenantCompliance.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/50">
                <CardHeader className="bg-accent/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} className="text-accent" />
                      Q3 2024 (Forecast)
                    </CardTitle>
                    <Badge variant="default">Jul - Sep</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Portfolio</p>
                      <p className="text-2xl font-bold font-mono text-accent">
                        {formatValue(quarterlyData.q3.portfolioMetrics.totalExposure, 'currency')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                      <p className="text-2xl font-bold font-mono text-accent">
                        {quarterlyData.q3.teamMetrics.efficiency}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-2xl font-bold font-mono text-accent">
                        {quarterlyData.q3.portfolioMetrics.averageRisk.toFixed(1)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-bold font-mono text-accent">
                        {quarterlyData.q3.portfolioMetrics.covenantCompliance.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} className="text-primary" />
                  Performance Radar Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarComparisonData}>
                    <PolarGrid stroke="oklch(0.88 0.005 250)" />
                    <PolarAngleAxis dataKey="metric" stroke="oklch(0.45 0.02 250)" />
                    <PolarRadiusAxis stroke="oklch(0.45 0.02 250)" />
                    <Radar 
                      name="Q2 2024" 
                      dataKey="q2" 
                      stroke="oklch(0.45 0.02 250)" 
                      fill="oklch(0.45 0.02 250)" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Q3 2024 (Forecast)" 
                      dataKey="q3" 
                      stroke="oklch(0.70 0.15 210)" 
                      fill="oklch(0.70 0.15 210)" 
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {comparisonData.map((category, idx) => (
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
                      <div className="space-y-3">
                        {category.metrics.map((metric) => {
                          const change = calculateChange(metric.q2, metric.q3)
                          return (
                            <div key={metric.name} className="flex items-center justify-between py-3 border-b last:border-0">
                              <div className="flex-1">
                                <p className="font-medium">{metric.name}</p>
                              </div>
                              <div className="flex items-center gap-8">
                                <div className="text-right min-w-24">
                                  <p className="text-sm text-muted-foreground mb-1">Q2</p>
                                  <p className="font-mono font-semibold">
                                    {formatValue(metric.q2, metric.format)}
                                  </p>
                                </div>
                                <div className="text-center min-w-16">
                                  {getChangeIndicator(change, metric.higher)}
                                </div>
                                <div className="text-right min-w-24">
                                  <p className="text-sm text-muted-foreground mb-1">Q3</p>
                                  <p className="font-mono font-semibold text-accent">
                                    {formatValue(metric.q3, metric.format)}
                                  </p>
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
            </div>

            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Brain size={24} className="text-accent mt-1" />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Improvements Q2 → Q3</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Portfolio exposure growth of {calculateChange(quarterlyData.q2.portfolioMetrics.totalExposure, quarterlyData.q3.portfolioMetrics.totalExposure).toFixed(1)}% driven by strong origination pipeline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Team efficiency improved {calculateChange(quarterlyData.q2.teamMetrics.efficiency, quarterlyData.q3.teamMetrics.efficiency).toFixed(1)}% through AI automation and enhanced workflows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>Risk score reduction of {Math.abs(calculateChange(quarterlyData.q2.portfolioMetrics.averageRisk, quarterlyData.q3.portfolioMetrics.averageRisk)).toFixed(1)}% via proactive monitoring and mitigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        <span>High-risk loan count decreased {Math.abs(calculateChange(quarterlyData.q2.riskMetrics.highRiskLoans, quarterlyData.q3.riskMetrics.highRiskLoans)).toFixed(1)}% with strategic interventions</span>
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
                  6-Month Trend Analysis (Q2 → Q3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis yAxisId="left" stroke="oklch(0.45 0.02 250)" />
                    <YAxis yAxisId="right" orientation="right" stroke="oklch(0.45 0.02 250)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="exposure"
                      stroke="oklch(0.70 0.15 210)"
                      fillOpacity={1}
                      fill="url(#colorExposure)"
                      strokeWidth={2.5}
                      name="Portfolio Exposure"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="risk"
                      stroke="oklch(0.55 0.22 25)"
                      strokeWidth={2.5}
                      name="Risk Score"
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="oklch(0.60 0.15 160)"
                      strokeWidth={2.5}
                      name="Team Efficiency %"
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="compliance"
                      stroke="oklch(0.25 0.06 250)"
                      strokeWidth={2.5}
                      name="Compliance %"
                      dot={{ r: 4 }}
                      strokeDasharray="5 5"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quarter Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Q2 Performance</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>Foundation building phase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>Process optimization initiated</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>Team training completed</span>
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-accent mb-2">Q3 Achievements</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>AI systems fully operational</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Significant efficiency gains</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Risk reduction targets met</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Growth Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">AI Automation</span>
                        <span className="text-sm font-mono font-semibold">+35%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Process Optimization</span>
                        <span className="text-sm font-mono font-semibold">+28%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Market Expansion</span>
                        <span className="text-sm font-mono font-semibold">+22%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '55%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Team Training</span>
                        <span className="text-sm font-mono font-semibold">+18%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target size={18} className="text-success" />
                    Q4 Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portfolio Growth</span>
                    <Badge variant="outline">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Reduction</span>
                    <Badge variant="outline">-10%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Team Efficiency</span>
                    <Badge variant="outline">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trading Volume</span>
                    <Badge variant="outline">+30%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ESG Score</span>
                    <Badge variant="outline">A-</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Comparing {quarterlyData.q2.portfolioMetrics.loanCount} loans (Q2) vs {quarterlyData.q3.portfolioMetrics.loanCount} loans (Q3 forecast)
          </div>
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
      Q2 vs Q3 Compare
    </Button>
  )
}
