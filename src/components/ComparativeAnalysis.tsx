import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TrendUp, TrendDown, Target, Download, Calendar, ChartLine, GitBranch } from '@phosphor-icons/react'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Area, AreaChart, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar 
} from 'recharts'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loan } from '../lib/types'
import { TeamMember } from '../lib/teamTypes'
import { Alert } from '../lib/alertTypes'

// Interfaces
interface ComparativeAnalysisProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  alerts: Alert[]
  loans: Loan[]
}

interface MetricsBase {
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

interface QuarterlyData {
  q2: MetricsBase
  q3: MetricsBase
}

export function ComparativeAnalysis({ open, onOpenChange, teamMembers, alerts, loans }: ComparativeAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate Data
  const quarterlyData: QuarterlyData = useMemo(() => {
    // Current / Base calculations based on props
    const currentExposure = loans.reduce((sum, l) => sum + l.amount, 0)
    
    const currentRisk = loans.length > 0 
      ? loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length 
      : 0
      
    const currentCompliance = loans.length > 0
      ? (loans.reduce((sum, l) => {
          // Assuming l.covenants exists
          const compliant = l.covenants ? l.covenants.filter((c: any) => c.status === 'compliant').length : 0
          const total = l.covenants ? l.covenants.length : 0
          return sum + (total > 0 ? compliant / total : 1)
        }, 0) / loans.length) * 100
      : 100

    const currentESG = loans.length > 0
      ? loans.reduce((sum, l) => (l.esgScore?.overall === 'A' ? 5 : l.esgScore?.overall === 'B' ? 4 : 3), 0) / loans.length
      : 3.5

    const highRiskCount = loans.filter(l => l.riskScore > 7).length
    
    const avgDefaultProb = loans.length > 0
      ? loans.reduce((sum, l) => sum + (l.predictiveAnalytics?.defaultProbability90d || 0), 0) / loans.length
      : 0
      
    const covenantBreaches = loans.reduce((sum, l) => {
      return sum + (l.covenants ? l.covenants.filter((c: any) => c.status === 'breached').length : 0)
    }, 0)

    // Q2 Data (Simulated Historical - slightly worse performance than current)
    const q2: MetricsBase = {
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
        defaultProbability: avgDefaultProb * 1.15,
        avgRecoveryRate: 78,
        covenantBreaches: Math.ceil(covenantBreaches * 1.6),
      },
      marketMetrics: {
        averageBidAsk: 3.1,
        marketParticipation: 42,
        liquidityIndex: 68,
      }
    }

    // Q3 Data (Forecast/Current - improved performance)
    const q3: MetricsBase = {
      portfolioMetrics: {
        totalExposure: currentExposure,
        averageRisk: currentRisk,
        covenantCompliance: currentCompliance,
        esgScore: Math.min(currentESG * 1.12, 5),
      },
      teamMetrics: {
        efficiency: 92,
        accuracy: 94,
        avgTasksPerMember: 34,
        alertResolution: 91,
      },
      riskMetrics: {
        highRiskLoans: highRiskCount,
        defaultProbability: avgDefaultProb,
        avgRecoveryRate: 82,
        covenantBreaches: covenantBreaches,
      },
      marketMetrics: {
        averageBidAsk: 1.8,
        marketParticipation: 65,
        liquidityIndex: 84,
      }
    }

    return { q2, q3 }
  }, [loans, alerts, teamMembers])

  // Helper function for formatting
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
      default:
        return value.toFixed(1) // standardized to 1 decimal for clean UI
    }
  }

  // Categories for the list view
  const categories = useMemo(() => {
    return [
      {
        name: 'Portfolio Health',
        metrics: [
          {
            name: 'Total Exposure',
            q2: quarterlyData.q2.portfolioMetrics.totalExposure,
            q3: quarterlyData.q3.portfolioMetrics.totalExposure,
            format: 'currency',
            higher: 'neutral',
          },
          {
            name: 'Average Risk Score',
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
        name: 'Operational Efficiency',
        metrics: [
          {
            name: 'Efficiency Score',
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
            name: 'Alert Resolution',
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
            q2: quarterlyData.q2.riskMetrics.defaultProbability * 100, // Normalized for display
            q3: quarterlyData.q3.riskMetrics.defaultProbability * 100,
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
  }, [quarterlyData])

  // Data for Charts
  const trendData = useMemo(() => {
    return [
      {
        month: 'Apr',
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.01,
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
        metric: 'Risk Mgmt',
        q2: 68,
        q3: 92,
      },
      {
        metric: 'Efficiency',
        q2: 76,
        q3: 89,
      },
      {
        metric: 'Compliance',
        q2: quarterlyData.q2.portfolioMetrics.covenantCompliance,
        q3: quarterlyData.q3.portfolioMetrics.covenantCompliance,
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
              {/* Q2 Snapshot */}
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

              {/* Q3 Snapshot */}
              <Card className="border-accent/50 bg-accent/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} className="text-accent" />
                      Q3 2024
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

            {/* Detailed Categories List */}
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
                          <div key={metric.name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{metric.name}</p>
                                {getChangeIndicator(change, metric.higher)}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right min-w-[5rem]">
                                <p className="font-mono font-semibold text-muted-foreground text-sm">
                                  {formatValue(metric.q2, metric.format)}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">Q2</p>
                              </div>
                              <div className="text-right min-w-[5rem]">
                                <p className="font-mono font-semibold text-accent text-sm">
                                  {formatValue(metric.q3, metric.format)}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">Q3</p>
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
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} className="text-accent" />
                    Performance Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine size={20} className="text-accent" />
                    Portfolio Trends: Q2 → Q3
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={trendData}>
                      <defs>
                        <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
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
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Improvements Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Target size={24} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Key Improvements in Q3 Forecast</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Team efficiency projected to increase by 17% through improved alert routing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Risk exposure reduced with better predictive analytics and proactive management.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Market participation up 54% with enhanced trading features.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center sm:justify-between w-full">
          <p className="text-sm text-muted-foreground">
            Comparative analysis generated on {new Date().toLocaleDateString()}
          </p>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ComparativeAnalysisTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <GitBranch size={16} />
      Q2 vs Q3
    </Button>
  )
}