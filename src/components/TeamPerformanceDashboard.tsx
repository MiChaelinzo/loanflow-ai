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
} from '@phosphor-icons/react'

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Overall Rankings</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

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
