import { useState, useMemo } from 'react'
import { TeamMember } from '../lib/teamTypes'
import { Alert } from '../lib/alertTypes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { QuickHelp, quickHelpTips } from './QuickHelp'
import {
  Trophy,
  TrendUp,
  Clock,
  Target,
  CheckCircle,
  Lightning,
  ChartBar,
  Medal,
  Star,
  Fire,
  Crown,
  Gauge,
  ListChecks,
  Timer,
  CalendarBlank,
  TrendDown,
  ArrowUp,
  ArrowDown,
  Users,
  Sparkle,
  Brain,
  TrendDown as TrendDownIcon,
  MagicWand,
} from '@phosphor-icons/react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface TeamPerformanceDashboardProps {
  teamMembers: TeamMember[]
  alerts: Alert[]
}

interface PerformanceMetrics {
  memberId: string
  member: TeamMember
  efficiencyScore: number
  responseTimeRank: number
  resolutionRateRank: number
  accuracyRank: number
  workloadBalanceScore: number
  overallRank: number
  trends: {
    responseTime: 'up' | 'down' | 'stable'
    accuracy: 'up' | 'down' | 'stable'
    productivity: 'up' | 'down' | 'stable'
  }
  badges: string[]
}

export function TeamPerformanceDashboard({ teamMembers, alerts }: TeamPerformanceDashboardProps) {
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [sortBy, setSortBy] = useState<string>('overall')

  const monthlyComparisonData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    
    return months.map((month, index) => {
      const baseEfficiency = 70 + index * 3
      const baseResponseTime = 50 - index * 2
      const baseAccuracy = 88 + index * 1.5
      const baseResolution = 150 + index * 15
      
      return {
        month,
        efficiency: baseEfficiency + (Math.random() * 6 - 3),
        responseTime: baseResponseTime + (Math.random() * 4 - 2),
        accuracy: baseAccuracy + (Math.random() * 2 - 1),
        alertsResolved: baseResolution + (Math.random() * 20 - 10),
      }
    })
  }, [])

  const forecastData = useMemo(() => {
    if (monthlyComparisonData.length === 0) return []
    
    const currentMonthData = monthlyComparisonData[monthlyComparisonData.length - 1]
    const previousMonthData = monthlyComparisonData[monthlyComparisonData.length - 2]
    
    const efficiencyTrend = currentMonthData.efficiency - previousMonthData.efficiency
    const responseTimeTrend = currentMonthData.responseTime - previousMonthData.responseTime
    const accuracyTrend = currentMonthData.accuracy - previousMonthData.accuracy
    const alertsTrend = currentMonthData.alertsResolved - previousMonthData.alertsResolved
    
    const futureMonths = ['Jul', 'Aug', 'Sep']
    
    return futureMonths.map((month, index) => {
      const growthFactor = 0.85
      const forecastIndex = index + 1
      
      return {
        month,
        efficiency: Math.min(95, currentMonthData.efficiency + (efficiencyTrend * growthFactor * forecastIndex)),
        responseTime: Math.max(25, currentMonthData.responseTime + (responseTimeTrend * growthFactor * forecastIndex)),
        accuracy: Math.min(99, currentMonthData.accuracy + (accuracyTrend * growthFactor * forecastIndex)),
        alertsResolved: Math.max(0, currentMonthData.alertsResolved + (alertsTrend * growthFactor * forecastIndex)),
        isForecast: true,
      }
    })
  }, [monthlyComparisonData])

  const combinedHistoricalAndForecast = useMemo(() => {
    return [
      ...monthlyComparisonData.map(d => ({ ...d, isForecast: false })),
      ...forecastData,
    ]
  }, [monthlyComparisonData, forecastData])

  const teamMemberForecasts = useMemo(() => {
    return teamMembers.slice(0, 5).map((member) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
      
      return {
        name: member.name,
        data: months.map((month, index) => {
          const baseScore = member.performanceMetrics.accuracyScore - 10 + index * 2
          const isForecast = index >= 6
          
          if (isForecast) {
            const trend = 1.5
            const forecastOffset = (index - 5) * trend
            return {
              month,
              score: Math.min(100, baseScore + forecastOffset + (Math.random() * 2 - 1)),
              isForecast: true,
            }
          }
          
          return {
            month,
            score: Math.min(100, baseScore + (Math.random() * 4 - 2)),
            isForecast: false,
          }
        }),
      }
    })
  }, [teamMembers])

  const forecastMetrics = useMemo(() => {
    if (forecastData.length === 0) return null
    
    const q3Forecast = forecastData[forecastData.length - 1]
    const currentData = monthlyComparisonData[monthlyComparisonData.length - 1]
    
    return {
      efficiency: {
        current: currentData.efficiency,
        forecast: q3Forecast.efficiency,
        change: ((q3Forecast.efficiency - currentData.efficiency) / currentData.efficiency) * 100,
      },
      responseTime: {
        current: currentData.responseTime,
        forecast: q3Forecast.responseTime,
        change: ((currentData.responseTime - q3Forecast.responseTime) / currentData.responseTime) * 100,
      },
      accuracy: {
        current: currentData.accuracy,
        forecast: q3Forecast.accuracy,
        change: ((q3Forecast.accuracy - currentData.accuracy) / currentData.accuracy) * 100,
      },
      alertsResolved: {
        current: currentData.alertsResolved,
        forecast: q3Forecast.alertsResolved,
        change: ((q3Forecast.alertsResolved - currentData.alertsResolved) / currentData.alertsResolved) * 100,
      },
    }
  }, [forecastData, monthlyComparisonData])

  const teamMemberTrends = useMemo(() => {
    return teamMembers.slice(0, 5).map((member) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      
      return {
        name: member.name,
        data: months.map((month, index) => {
          const baseScore = member.performanceMetrics.accuracyScore - 10 + index * 2
          return {
            month,
            score: Math.min(100, baseScore + (Math.random() * 4 - 2)),
          }
        }),
      }
    })
  }, [teamMembers])

  const departmentComparison = useMemo(() => {
    const departments = [...new Set(teamMembers.map((m) => m.department))]
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    
    return months.map((month, monthIndex) => {
      const data: any = { month }
      departments.forEach((dept) => {
        const membersInDept = teamMembers.filter((m) => m.department === dept)
        const avgEfficiency = membersInDept.reduce((sum, m) => {
          return sum + m.performanceMetrics.accuracyScore
        }, 0) / membersInDept.length
        
        data[dept] = avgEfficiency - 10 + monthIndex * 2 + (Math.random() * 4 - 2)
      })
      return data
    })
  }, [teamMembers])

  const metricImprovements = useMemo(() => {
    const currentMonth = monthlyComparisonData[monthlyComparisonData.length - 1]
    const previousMonth = monthlyComparisonData[monthlyComparisonData.length - 2]
    
    return {
      efficiency: {
        current: currentMonth.efficiency,
        previous: previousMonth.efficiency,
        change: ((currentMonth.efficiency - previousMonth.efficiency) / previousMonth.efficiency) * 100,
      },
      responseTime: {
        current: currentMonth.responseTime,
        previous: previousMonth.responseTime,
        change: ((previousMonth.responseTime - currentMonth.responseTime) / previousMonth.responseTime) * 100,
      },
      accuracy: {
        current: currentMonth.accuracy,
        previous: previousMonth.accuracy,
        change: ((currentMonth.accuracy - previousMonth.accuracy) / previousMonth.accuracy) * 100,
      },
      alertsResolved: {
        current: currentMonth.alertsResolved,
        previous: previousMonth.alertsResolved,
        change: ((currentMonth.alertsResolved - previousMonth.alertsResolved) / previousMonth.alertsResolved) * 100,
      },
    }
  }, [monthlyComparisonData])

  const radarData = useMemo(() => {
    if (teamMembers.length === 0) return []
    
    const currentMonth = monthlyComparisonData[monthlyComparisonData.length - 1]
    const previousMonth = monthlyComparisonData[monthlyComparisonData.length - 2]
    
    return [
      {
        metric: 'Efficiency',
        current: currentMonth.efficiency,
        previous: previousMonth.efficiency,
      },
      {
        metric: 'Accuracy',
        current: currentMonth.accuracy,
        previous: previousMonth.accuracy,
      },
      {
        metric: 'Speed',
        current: 100 - currentMonth.responseTime,
        previous: 100 - previousMonth.responseTime,
      },
      {
        metric: 'Volume',
        current: (currentMonth.alertsResolved / 200) * 100,
        previous: (previousMonth.alertsResolved / 200) * 100,
      },
      {
        metric: 'Quality',
        current: currentMonth.accuracy,
        previous: previousMonth.accuracy,
      },
    ]
  }, [monthlyComparisonData, teamMembers])

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success'
    if (change < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp size={16} weight="bold" />
    if (change < 0) return <ArrowDown size={16} weight="bold" />
    return <span>—</span>
  }

  const performanceMetrics = useMemo(() => {
    const metrics: PerformanceMetrics[] = teamMembers.map((member) => {
      const responseTimeScore = Math.max(0, 100 - member.performanceMetrics.avgResponseTime)
      const resolutionRate =
        member.performanceMetrics.loansManaged > 0
          ? (member.performanceMetrics.alertsResolved / member.performanceMetrics.loansManaged) * 10
          : 0
      const workloadUtilization = member.maxLoans > 0 ? (member.currentLoans / member.maxLoans) * 100 : 0
      const workloadBalanceScore = workloadUtilization > 90 ? 70 : workloadUtilization > 70 ? 100 : 85

      const efficiencyScore =
        responseTimeScore * 0.3 +
        member.performanceMetrics.accuracyScore * 0.3 +
        resolutionRate * 0.2 +
        workloadBalanceScore * 0.2

      const badges: string[] = []
      if (member.performanceMetrics.alertsResolved > 300) badges.push('High Volume')
      if (member.performanceMetrics.avgResponseTime < 35) badges.push('Speed Demon')
      if (member.performanceMetrics.accuracyScore >= 98) badges.push('Precision Expert')
      if (workloadUtilization > 75) badges.push('Workload Champion')
      if (member.performanceMetrics.alertsResolved > 200 && member.performanceMetrics.accuracyScore >= 95)
        badges.push('Top Performer')

      return {
        memberId: member.id,
        member,
        efficiencyScore,
        responseTimeRank: 0,
        resolutionRateRank: 0,
        accuracyRank: 0,
        workloadBalanceScore,
        overallRank: 0,
        trends: {
          responseTime: Math.random() > 0.5 ? 'down' : 'stable',
          accuracy: Math.random() > 0.6 ? 'up' : 'stable',
          productivity: Math.random() > 0.5 ? 'up' : 'stable',
        },
        badges,
      }
    })

    const sortedByResponseTime = [...metrics].sort(
      (a, b) => a.member.performanceMetrics.avgResponseTime - b.member.performanceMetrics.avgResponseTime
    )
    const sortedByResolution = [...metrics].sort(
      (a, b) => b.member.performanceMetrics.alertsResolved - a.member.performanceMetrics.alertsResolved
    )
    const sortedByAccuracy = [...metrics].sort(
      (a, b) => b.member.performanceMetrics.accuracyScore - a.member.performanceMetrics.accuracyScore
    )
    const sortedByEfficiency = [...metrics].sort((a, b) => b.efficiencyScore - a.efficiencyScore)

    sortedByResponseTime.forEach((m, i) => {
      const metric = metrics.find((metric) => metric.memberId === m.memberId)
      if (metric) metric.responseTimeRank = i + 1
    })

    sortedByResolution.forEach((m, i) => {
      const metric = metrics.find((metric) => metric.memberId === m.memberId)
      if (metric) metric.resolutionRateRank = i + 1
    })

    sortedByAccuracy.forEach((m, i) => {
      const metric = metrics.find((metric) => metric.memberId === m.memberId)
      if (metric) metric.accuracyRank = i + 1
    })

    sortedByEfficiency.forEach((m, i) => {
      const metric = metrics.find((metric) => metric.memberId === m.memberId)
      if (metric) metric.overallRank = i + 1
    })

    return metrics
  }, [teamMembers])

  const sortedMetrics = useMemo(() => {
    const sorted = [...performanceMetrics]
    switch (sortBy) {
      case 'overall':
        return sorted.sort((a, b) => a.overallRank - b.overallRank)
      case 'responseTime':
        return sorted.sort((a, b) => a.responseTimeRank - b.responseTimeRank)
      case 'resolution':
        return sorted.sort((a, b) => a.resolutionRateRank - b.resolutionRateRank)
      case 'accuracy':
        return sorted.sort((a, b) => a.accuracyRank - b.accuracyRank)
      default:
        return sorted.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    }
  }, [performanceMetrics, sortBy])

  const topPerformers = sortedMetrics.slice(0, 3)
  const teamAverages = useMemo(() => {
    if (teamMembers.length === 0) return { responseTime: 0, accuracy: 0, resolution: 0, efficiency: 0 }

    return {
      responseTime:
        teamMembers.reduce((sum, m) => sum + m.performanceMetrics.avgResponseTime, 0) / teamMembers.length,
      accuracy:
        teamMembers.reduce((sum, m) => sum + m.performanceMetrics.accuracyScore, 0) / teamMembers.length,
      resolution:
        teamMembers.reduce((sum, m) => sum + m.performanceMetrics.alertsResolved, 0) / teamMembers.length,
      efficiency: performanceMetrics.reduce((sum, m) => sum + m.efficiencyScore, 0) / performanceMetrics.length,
    }
  }, [teamMembers, performanceMetrics])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown size={16} weight="fill" className="text-warning" />
    if (rank === 2) return <Medal size={16} weight="fill" className="text-muted-foreground" />
    if (rank === 3) return <Medal size={16} weight="fill" className="text-warning/60" />
    return <span className="text-sm text-muted-foreground">#{rank}</span>
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 75) return 'text-accent'
    if (score >= 60) return 'text-warning'
    return 'text-muted-foreground'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendUp size={14} weight="bold" className="text-success" />
    if (trend === 'down') return <TrendUp size={14} weight="bold" className="text-destructive rotate-180" />
    return <span className="text-xs text-muted-foreground">—</span>
  }

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
          <p className="text-muted-foreground">Add team members to view performance metrics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy size={32} weight="bold" className="text-warning" />
            Team Performance Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Efficiency rankings, top performers, and productivity insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge size={16} />
              Avg Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getEfficiencyColor(teamAverages.efficiency)}`}>
              {teamAverages.efficiency.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Team performance score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer size={16} />
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{teamAverages.responseTime.toFixed(0)}m</div>
            <p className="text-xs text-muted-foreground mt-2">Average time to respond</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target size={16} />
              Avg Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{teamAverages.accuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-2">Quality score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListChecks size={16} />
              Avg Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{teamAverages.resolution.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-2">Alerts per member</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown size={24} weight="fill" className="text-warning" />
            Top Performers
          </CardTitle>
          <CardDescription>Highest efficiency rankings this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {topPerformers.map((perf, index) => (
              <Card
                key={perf.memberId}
                className={`${
                  index === 0
                    ? 'ring-2 ring-warning shadow-lg'
                    : index === 1
                    ? 'ring-1 ring-muted-foreground/50'
                    : 'ring-1 ring-muted-foreground/30'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="relative">
                      <Avatar className={`${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`}>
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-accent to-primary text-primary-foreground">
                          {perf.member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        {index === 0 && <Crown size={28} weight="fill" className="text-warning" />}
                        {index === 1 && <Medal size={24} weight="fill" className="text-muted-foreground" />}
                        {index === 2 && <Medal size={24} weight="fill" className="text-warning/60" />}
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-bold ${index === 0 ? 'text-lg' : 'text-base'}`}>
                        {perf.member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{perf.member.role.replace('_', ' ')}</p>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Efficiency</span>
                        <span className={`font-bold ${getEfficiencyColor(perf.efficiencyScore)}`}>
                          {perf.efficiencyScore.toFixed(1)}
                        </span>
                      </div>
                      <Progress value={perf.efficiencyScore} className="h-2" />
                    </div>
                    {perf.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {perf.badges.slice(0, 2).map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            <Star size={12} weight="fill" className="mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="leaderboard">Overall Rankings</TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <CalendarBlank size={16} />
            Month Comparison
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <Sparkle size={16} />
            Q3 Forecast
          </TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Gauge size={16} />
                  Efficiency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{metricImprovements.efficiency.current.toFixed(1)}</span>
                    <Badge variant={metricImprovements.efficiency.change > 0 ? 'default' : 'secondary'} className="gap-1">
                      {getChangeIcon(metricImprovements.efficiency.change)}
                      {Math.abs(metricImprovements.efficiency.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Previous: {metricImprovements.efficiency.previous.toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Timer size={16} />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{metricImprovements.responseTime.current.toFixed(0)}m</span>
                    <Badge variant={metricImprovements.responseTime.change > 0 ? 'default' : 'secondary'} className="gap-1">
                      {getChangeIcon(metricImprovements.responseTime.change)}
                      {Math.abs(metricImprovements.responseTime.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Previous: {metricImprovements.responseTime.previous.toFixed(0)}m
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target size={16} />
                  Accuracy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{metricImprovements.accuracy.current.toFixed(1)}%</span>
                    <Badge variant={metricImprovements.accuracy.change > 0 ? 'default' : 'secondary'} className="gap-1">
                      {getChangeIcon(metricImprovements.accuracy.change)}
                      {Math.abs(metricImprovements.accuracy.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Previous: {metricImprovements.accuracy.previous.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ListChecks size={16} />
                  Alerts Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{metricImprovements.alertsResolved.current.toFixed(0)}</span>
                    <Badge variant={metricImprovements.alertsResolved.change > 0 ? 'default' : 'secondary'} className="gap-1">
                      {getChangeIcon(metricImprovements.alertsResolved.change)}
                      {Math.abs(metricImprovements.alertsResolved.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Previous: {metricImprovements.alertsResolved.previous.toFixed(0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={20} weight="bold" className="text-accent" />
                  Team Efficiency Trend
                </CardTitle>
                <CardDescription>6-month performance trajectory showing continuous improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyComparisonData}>
                    <defs>
                      <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="oklch(0.70 0.15 210)"
                      strokeWidth={3}
                      fill="url(#efficiencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} weight="bold" className="text-success" />
                  Response Time Evolution
                </CardTitle>
                <CardDescription>Lower is better - tracking speed improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="oklch(0.60 0.15 160)"
                      strokeWidth={3}
                      dot={{ fill: 'oklch(0.60 0.15 160)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} weight="bold" className="text-warning" />
                  Alerts Resolved Per Month
                </CardTitle>
                <CardDescription>Volume capacity and throughput growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="alertsResolved" fill="oklch(0.75 0.15 85)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} weight="bold" className="text-primary" />
                  Accuracy Improvement
                </CardTitle>
                <CardDescription>Quality and precision metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyComparisonData}>
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.25 0.06 250)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.25 0.06 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" domain={[80, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="oklch(0.25 0.06 250)"
                      strokeWidth={3}
                      fill="url(#accuracyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {teamMembers.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} weight="bold" className="text-accent" />
                    Individual Member Performance Comparison
                  </CardTitle>
                  <CardDescription>Track top performers across months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                      <XAxis
                        dataKey="month"
                        type="category"
                        allowDuplicatedCategory={false}
                        stroke="oklch(0.45 0.02 250)"
                      />
                      <YAxis stroke="oklch(0.45 0.02 250)" domain={[70, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.88 0.005 250)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      {teamMemberTrends.map((member, index) => {
                        const colors = [
                          'oklch(0.70 0.15 210)',
                          'oklch(0.60 0.15 160)',
                          'oklch(0.75 0.15 85)',
                          'oklch(0.55 0.22 25)',
                          'oklch(0.25 0.06 250)',
                        ]
                        return (
                          <Line
                            key={member.name}
                            data={member.data}
                            type="monotone"
                            dataKey="score"
                            name={member.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        )
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightning size={20} weight="bold" className="text-warning" />
                      Department Performance Comparison
                    </CardTitle>
                    <CardDescription>Cross-department efficiency benchmarking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                        <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                        <YAxis stroke="oklch(0.45 0.02 250)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(1 0 0)',
                            border: '1px solid oklch(0.88 0.005 250)',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        {Object.keys(departmentComparison[0] || {})
                          .filter((key) => key !== 'month')
                          .map((dept, index) => {
                            const colors = [
                              'oklch(0.70 0.15 210)',
                              'oklch(0.60 0.15 160)',
                              'oklch(0.75 0.15 85)',
                              'oklch(0.55 0.22 25)',
                            ]
                            return (
                              <Bar
                                key={dept}
                                dataKey={dept}
                                fill={colors[index % colors.length]}
                                radius={[4, 4, 0, 0]}
                              />
                            )
                          })}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge size={20} weight="bold" className="text-accent" />
                      Performance Radar: Month-over-Month
                    </CardTitle>
                    <CardDescription>Holistic view of metric improvements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="oklch(0.88 0.005 250)" />
                        <PolarAngleAxis dataKey="metric" stroke="oklch(0.45 0.02 250)" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="oklch(0.45 0.02 250)" />
                        <Radar
                          name="Current Month"
                          dataKey="current"
                          stroke="oklch(0.70 0.15 210)"
                          fill="oklch(0.70 0.15 210)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Previous Month"
                          dataKey="previous"
                          stroke="oklch(0.45 0.02 250)"
                          fill="oklch(0.45 0.02 250)"
                          fillOpacity={0.1}
                          strokeWidth={2}
                          strokeDasharray="5 5"
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
              </div>

              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp size={24} weight="bold" className="text-success" />
                    Key Insights & Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={20} weight="fill" className="text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Response Time Decreased</h4>
                        <p className="text-sm text-muted-foreground">
                          Team response time improved by{' '}
                          <span className="font-semibold text-success">
                            {Math.abs(metricImprovements.responseTime.change).toFixed(1)}%
                          </span>{' '}
                          this month, reaching an average of {metricImprovements.responseTime.current.toFixed(0)} minutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Target size={20} weight="fill" className="text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Accuracy Gains</h4>
                        <p className="text-sm text-muted-foreground">
                          Team accuracy rate increased{' '}
                          <span className="font-semibold text-accent">
                            {Math.abs(metricImprovements.accuracy.change).toFixed(1)}%
                          </span>
                          , demonstrating improved quality control and precision
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                        <Lightning size={20} weight="fill" className="text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Volume Increase</h4>
                        <p className="text-sm text-muted-foreground">
                          Team resolved{' '}
                          <span className="font-semibold text-warning">
                            {Math.abs(metricImprovements.alertsResolved.change).toFixed(1)}%
                          </span>{' '}
                          more alerts, showing increased capacity and productivity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Trophy size={20} weight="fill" className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Overall Efficiency Up</h4>
                        <p className="text-sm text-muted-foreground">
                          Composite efficiency score rose by{' '}
                          <span className="font-semibold text-primary">
                            {Math.abs(metricImprovements.efficiency.change).toFixed(1)}%
                          </span>
                          , reflecting comprehensive team performance improvements
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <QuickHelp tip={quickHelpTips.forecast} />
          
          <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 rounded-lg border-2 border-accent/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                <Brain size={24} weight="bold" className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  AI-Powered Performance Forecast
                  <Badge variant="secondary" className="gap-1">
                    <Sparkle size={12} weight="fill" />
                    Predictive Analytics
                  </Badge>
                </h3>
                <p className="text-muted-foreground">
                  Based on historical performance trends and machine learning algorithms, our system projects team performance
                  for the next quarter (Q3). These forecasts help identify potential capacity issues, training needs, and 
                  optimization opportunities before they arise.
                </p>
              </div>
            </div>
          </div>

          {forecastMetrics && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Gauge size={16} />
                    Efficiency Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{forecastMetrics.efficiency.forecast.toFixed(1)}</span>
                      <Badge variant={forecastMetrics.efficiency.change > 0 ? 'default' : 'secondary'} className="gap-1">
                        {getChangeIcon(forecastMetrics.efficiency.change)}
                        {Math.abs(forecastMetrics.efficiency.change).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {forecastMetrics.efficiency.current.toFixed(1)}
                    </p>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Sparkle size={10} />
                      Projected Q3
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Timer size={16} />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono">{forecastMetrics.responseTime.forecast.toFixed(0)}m</span>
                      <Badge variant={forecastMetrics.responseTime.change > 0 ? 'default' : 'secondary'} className="gap-1">
                        {getChangeIcon(forecastMetrics.responseTime.change)}
                        {Math.abs(forecastMetrics.responseTime.change).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {forecastMetrics.responseTime.current.toFixed(0)}m
                    </p>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Sparkle size={10} />
                      Projected Q3
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target size={16} />
                    Accuracy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono">{forecastMetrics.accuracy.forecast.toFixed(1)}%</span>
                      <Badge variant={forecastMetrics.accuracy.change > 0 ? 'default' : 'secondary'} className="gap-1">
                        {getChangeIcon(forecastMetrics.accuracy.change)}
                        {Math.abs(forecastMetrics.accuracy.change).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {forecastMetrics.accuracy.current.toFixed(1)}%
                    </p>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Sparkle size={10} />
                      Projected Q3
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ListChecks size={16} />
                    Alerts Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono">{forecastMetrics.alertsResolved.forecast.toFixed(0)}</span>
                      <Badge variant={forecastMetrics.alertsResolved.change > 0 ? 'default' : 'secondary'} className="gap-1">
                        {getChangeIcon(forecastMetrics.alertsResolved.change)}
                        {Math.abs(forecastMetrics.alertsResolved.change).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {forecastMetrics.alertsResolved.current.toFixed(0)}
                    </p>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Sparkle size={10} />
                      Projected Q3
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={20} weight="bold" className="text-accent" />
                  Efficiency Forecast: Next Quarter
                </CardTitle>
                <CardDescription>Projected team efficiency trajectory through Q3</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={combinedHistoricalAndForecast}>
                    <defs>
                      <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.70 0.15 210)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.60 0.15 160)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.60 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" domain={[60, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card p-3 rounded-lg border shadow-lg">
                              <p className="font-semibold">{data.month}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Efficiency: <span className="font-mono font-semibold text-foreground">{data.efficiency.toFixed(1)}</span>
                                {data.isForecast && (
                                  <Badge variant="outline" className="text-xs ml-1 gap-1">
                                    <Sparkle size={8} />
                                    Forecast
                                  </Badge>
                                )}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="oklch(0.70 0.15 210)"
                      strokeWidth={3}
                      fill="url(#historicalGradient)"
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Historical Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">AI Forecast</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} weight="bold" className="text-success" />
                  Response Time Projection
                </CardTitle>
                <CardDescription>Expected improvements in response speed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedHistoricalAndForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card p-3 rounded-lg border shadow-lg">
                              <p className="font-semibold">{data.month}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Response Time: <span className="font-mono font-semibold text-foreground">{data.responseTime.toFixed(0)}m</span>
                                {data.isForecast && (
                                  <Badge variant="outline" className="text-xs ml-1 gap-1">
                                    <Sparkle size={8} />
                                    Forecast
                                  </Badge>
                                )}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="oklch(0.60 0.15 160)"
                      strokeWidth={3}
                      dot={{ fill: 'oklch(0.60 0.15 160)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} weight="bold" className="text-warning" />
                  Alert Volume Projection
                </CardTitle>
                <CardDescription>Expected throughput capacity for Q3</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={combinedHistoricalAndForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card p-3 rounded-lg border shadow-lg">
                              <p className="font-semibold">{data.month}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Alerts: <span className="font-mono font-semibold text-foreground">{data.alertsResolved.toFixed(0)}</span>
                                {data.isForecast && (
                                  <Badge variant="outline" className="text-xs ml-1 gap-1">
                                    <Sparkle size={8} />
                                    Forecast
                                  </Badge>
                                )}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="alertsResolved"
                      fill="oklch(0.75 0.15 85)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} weight="bold" className="text-primary" />
                  Accuracy Forecast
                </CardTitle>
                <CardDescription>Projected quality metrics improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={combinedHistoricalAndForecast}>
                    <defs>
                      <linearGradient id="accuracyForecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.25 0.06 250)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.25 0.06 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" />
                    <YAxis stroke="oklch(0.45 0.02 250)" domain={[85, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card p-3 rounded-lg border shadow-lg">
                              <p className="font-semibold">{data.month}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Accuracy: <span className="font-mono font-semibold text-foreground">{data.accuracy.toFixed(1)}%</span>
                                {data.isForecast && (
                                  <Badge variant="outline" className="text-xs ml-1 gap-1">
                                    <Sparkle size={8} />
                                    Forecast
                                  </Badge>
                                )}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="oklch(0.25 0.06 250)"
                      strokeWidth={3}
                      fill="url(#accuracyForecastGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {teamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} weight="bold" className="text-accent" />
                  Individual Member Forecast: Q3 Projections
                </CardTitle>
                <CardDescription>Predicted performance trajectories for top team members</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.005 250)" />
                    <XAxis
                      dataKey="month"
                      type="category"
                      allowDuplicatedCategory={false}
                      stroke="oklch(0.45 0.02 250)"
                    />
                    <YAxis stroke="oklch(0.45 0.02 250)" domain={[75, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.88 0.005 250)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    {teamMemberForecasts.map((member, index) => {
                      const colors = [
                        'oklch(0.70 0.15 210)',
                        'oklch(0.60 0.15 160)',
                        'oklch(0.75 0.15 85)',
                        'oklch(0.55 0.22 25)',
                        'oklch(0.25 0.06 250)',
                      ]
                      return (
                        <Line
                          key={member.name}
                          data={member.data}
                          type="monotone"
                          dataKey="score"
                          name={member.name}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={(props) => {
                            const { cx, cy, payload } = props
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={payload.isForecast ? 3 : 4}
                                fill={colors[index % colors.length]}
                                stroke="white"
                                strokeWidth={2}
                                opacity={payload.isForecast ? 0.7 : 1}
                              />
                            )
                          }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-accent/5 to-primary/10 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MagicWand size={24} weight="bold" className="text-accent" />
                AI Recommendations for Q3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {forecastMetrics && forecastMetrics.efficiency.change > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <TrendUp size={20} weight="fill" className="text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Continue Current Trajectory</h4>
                      <p className="text-sm text-muted-foreground">
                        Team efficiency is projected to increase by{' '}
                        <span className="font-semibold text-success">
                          {forecastMetrics.efficiency.change.toFixed(1)}%
                        </span>
                        . Maintain current workflows and training programs to sustain this growth.
                      </p>
                    </div>
                  </div>
                )}

                {forecastMetrics && forecastMetrics.responseTime.change > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} weight="fill" className="text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Focus on Speed Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Response times may improve by{' '}
                        <span className="font-semibold text-warning">
                          {forecastMetrics.responseTime.change.toFixed(1)}%
                        </span>
                        . Consider automation tools and prioritization frameworks to enhance velocity.
                      </p>
                    </div>
                  </div>
                )}

                {forecastMetrics && forecastMetrics.accuracy.change > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Target size={20} weight="fill" className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Quality Improvements Expected</h4>
                      <p className="text-sm text-muted-foreground">
                        Accuracy is forecasted to grow by{' '}
                        <span className="font-semibold text-accent">
                          {forecastMetrics.accuracy.change.toFixed(1)}%
                        </span>
                        . Invest in quality assurance processes and peer review systems.
                      </p>
                    </div>
                  </div>
                )}

                {forecastMetrics && forecastMetrics.alertsResolved.change > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Lightning size={20} weight="fill" className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Capacity Planning Needed</h4>
                      <p className="text-sm text-muted-foreground">
                        Alert resolution volume expected to increase by{' '}
                        <span className="font-semibold text-primary">
                          {forecastMetrics.alertsResolved.change.toFixed(1)}%
                        </span>
                        . Plan for additional resources or process improvements to handle increased load.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Leaderboard</CardTitle>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Rank</SelectItem>
                    <SelectItem value="responseTime">Response Time</SelectItem>
                    <SelectItem value="resolution">Resolution Rate</SelectItem>
                    <SelectItem value="accuracy">Accuracy Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedMetrics.map((perf) => (
                  <Card key={perf.memberId} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                          {getRankBadge(perf.overallRank)}
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="font-semibold bg-accent text-accent-foreground">
                            {perf.member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{perf.member.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {perf.member.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{perf.member.department}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <div className={`text-xl font-bold ${getEfficiencyColor(perf.efficiencyScore)}`}>
                              {perf.efficiencyScore.toFixed(0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Efficiency</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold font-mono">
                              {perf.member.performanceMetrics.avgResponseTime}m
                            </div>
                            <p className="text-xs text-muted-foreground">Response</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold font-mono">
                              {perf.member.performanceMetrics.alertsResolved}
                            </div>
                            <p className="text-xs text-muted-foreground">Resolved</p>
                          </div>
                          <div>
                            <div className="text-xl font-bold font-mono">
                              {perf.member.performanceMetrics.accuracyScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                        </div>
                      </div>
                      {perf.badges.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex gap-2 flex-wrap">
                            {perf.badges.map((badge) => (
                              <Badge key={badge} variant="secondary" className="gap-1">
                                <Star size={12} weight="fill" />
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Breakdown by Metric</CardTitle>
              <CardDescription>Detailed performance across key indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedMetrics.map((perf) => (
                  <div key={perf.memberId} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-sm bg-muted">
                          {perf.member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{perf.member.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getEfficiencyColor(perf.efficiencyScore)}`}>
                          {perf.efficiencyScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 pl-13">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Response Speed</span>
                          <span className="font-semibold">Rank #{perf.responseTimeRank}</span>
                        </div>
                        <Progress
                          value={Math.max(0, 100 - perf.member.performanceMetrics.avgResponseTime)}
                          className="h-1.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Resolution Rate</span>
                          <span className="font-semibold">Rank #{perf.resolutionRateRank}</span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            (perf.member.performanceMetrics.alertsResolved /
                              Math.max(...teamMembers.map((m) => m.performanceMetrics.alertsResolved))) *
                              100
                          )}
                          className="h-1.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Accuracy</span>
                          <span className="font-semibold">Rank #{perf.accuracyRank}</span>
                        </div>
                        <Progress value={perf.member.performanceMetrics.accuracyScore} className="h-1.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Workload Balance</span>
                          <span className="font-semibold">{perf.workloadBalanceScore.toFixed(0)}</span>
                        </div>
                        <Progress value={perf.workloadBalanceScore} className="h-1.5" />
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track improvements and changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedMetrics.map((perf) => (
                  <Card key={perf.memberId}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="font-semibold">
                            {perf.member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{perf.member.name}</h3>
                          <p className="text-sm text-muted-foreground">{perf.member.department}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock size={16} className="text-muted-foreground" />
                              {getTrendIcon(perf.trends.responseTime)}
                            </div>
                            <p className="text-xs text-muted-foreground">Response Time</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Target size={16} className="text-muted-foreground" />
                              {getTrendIcon(perf.trends.accuracy)}
                            </div>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Lightning size={16} className="text-muted-foreground" />
                              {getTrendIcon(perf.trends.productivity)}
                            </div>
                            <p className="text-xs text-muted-foreground">Productivity</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Achievements & Badges</CardTitle>
              <CardDescription>Recognition for excellence and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {sortedMetrics
                  .filter((perf) => perf.badges.length > 0)
                  .map((perf) => (
                    <Card key={perf.memberId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-accent to-primary text-primary-foreground">
                              {perf.member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{perf.member.name}</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {perf.badges.map((badge) => (
                                <Badge key={badge} className="gap-1">
                                  {badge === 'Top Performer' && <Fire size={12} weight="fill" />}
                                  {badge === 'Speed Demon' && <Lightning size={12} weight="fill" />}
                                  {badge === 'Precision Expert' && <Target size={12} weight="fill" />}
                                  {badge === 'High Volume' && <ChartBar size={12} weight="fill" />}
                                  {badge === 'Workload Champion' && <Trophy size={12} weight="fill" />}
                                  <span className="text-xs">{badge}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
