import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Alert, AlertSeverity, AlertType } from '@/lib/alertTypes'
import { generateSampleAlerts } from '@/lib/sampleAlerts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  ChartLine, 
  Clock, 
  CheckCircle, 
  TrendUp, 
  Lightning,
  Calendar,
  Target,
  Stack,
  Sparkle
} from '@phosphor-icons/react'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AlertAnalyticsProps {
  alerts: Alert[]
}

const SEVERITY_COLORS = {
  critical: 'oklch(0.55 0.22 25)',
  high: 'oklch(0.75 0.15 85)',
  medium: 'oklch(0.70 0.15 210)',
  low: 'oklch(0.60 0.15 160)',
}

const ALERT_TYPE_LABELS = {
  covenant_breach: 'Covenant Breach',
  covenant_at_risk: 'Covenant At Risk',
  high_risk_loan: 'High Risk Loan',
  critical_risk_loan: 'Critical Risk Loan',
  default_probability_high: 'Default Risk High',
  maturity_approaching: 'Maturity Approaching',
  lma_compliance_gap: 'LMA Compliance Gap',
  esg_score_downgrade: 'ESG Score Downgrade',
}

export function AlertAnalytics({ alerts }: AlertAnalyticsProps) {
  const [, setAlerts] = useKV<Alert[]>('alerts', [])

  const handleLoadSampleAlerts = () => {
    const sampleAlerts = generateSampleAlerts()
    setAlerts((current) => {
      const existingIds = new Set((current || []).map(a => a.id))
      const newAlerts = sampleAlerts.filter(a => !existingIds.has(a.id))
      return [...(current || []), ...newAlerts]
    })
    toast.success('Sample alerts loaded successfully', {
      description: `${sampleAlerts.length} demo alerts added for analytics`,
      icon: <Sparkle size={20} />,
    })
  }

  const analytics = useMemo(() => {
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const oneWeekMs = 7 * oneDayMs
    const oneMonthMs = 30 * oneDayMs

    const totalAlerts = alerts.length
    const activeAlerts = alerts.filter(a => a.status === 'active').length
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length
    const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged').length

    const alertsWithResponseTime = alerts.filter(a => a.acknowledgedAt || a.resolvedAt)
    const avgResponseTime = alertsWithResponseTime.length > 0
      ? alertsWithResponseTime.reduce((sum, alert) => {
          const created = new Date(alert.createdAt).getTime()
          const responded = new Date(alert.acknowledgedAt || alert.resolvedAt!).getTime()
          return sum + (responded - created)
        }, 0) / alertsWithResponseTime.length
      : 0

    const resolvedAlertsWithTime = alerts.filter(a => a.resolvedAt && a.createdAt)
    const avgResolutionTime = resolvedAlertsWithTime.length > 0
      ? resolvedAlertsWithTime.reduce((sum, alert) => {
          const created = new Date(alert.createdAt).getTime()
          const resolved = new Date(alert.resolvedAt!).getTime()
          return sum + (resolved - created)
        }, 0) / resolvedAlertsWithTime.length
      : 0

    const last24Hours = alerts.filter(a => 
      now - new Date(a.createdAt).getTime() < oneDayMs
    ).length

    const last7Days = alerts.filter(a => 
      now - new Date(a.createdAt).getTime() < oneWeekMs
    ).length

    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<AlertSeverity, number>)

    const typeCounts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<AlertType, number>)

    const dailyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now - (29 - i) * oneDayMs)
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + oneDayMs
      
      const dayAlerts = alerts.filter(a => {
        const created = new Date(a.createdAt).getTime()
        return created >= dayStart && created < dayEnd
      })

      return {
        date: new Date(dayStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayAlerts.length,
        critical: dayAlerts.filter(a => a.severity === 'critical').length,
        high: dayAlerts.filter(a => a.severity === 'high').length,
        medium: dayAlerts.filter(a => a.severity === 'medium').length,
        low: dayAlerts.filter(a => a.severity === 'low').length,
        resolved: dayAlerts.filter(a => a.status === 'resolved').length,
      }
    })

    const weeklyResponseTimes = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = now - i * oneWeekMs
      const weekStart = weekEnd - oneWeekMs
      
      const weekAlerts = alerts.filter(a => {
        const created = new Date(a.createdAt).getTime()
        return created >= weekStart && created < weekEnd && (a.acknowledgedAt || a.resolvedAt)
      })

      const avgTime = weekAlerts.length > 0
        ? weekAlerts.reduce((sum, alert) => {
            const created = new Date(alert.createdAt).getTime()
            const responded = new Date(alert.acknowledgedAt || alert.resolvedAt!).getTime()
            return sum + (responded - created)
          }, 0) / weekAlerts.length
        : 0

      return {
        week: `Week ${4 - i}`,
        responseTime: Math.round(avgTime / (60 * 60 * 1000) * 10) / 10,
        count: weekAlerts.length,
      }
    }).reverse()

    const resolutionRate = totalAlerts > 0 
      ? (resolvedAlerts / totalAlerts) * 100 
      : 0

    const criticalAlertTrend = dailyTrend.map(d => d.critical).slice(-7)
    const criticalTrendDirection = criticalAlertTrend.length >= 2
      ? criticalAlertTrend[criticalAlertTrend.length - 1] - criticalAlertTrend[0]
      : 0

    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      acknowledgedAlerts,
      avgResponseTime,
      avgResolutionTime,
      last24Hours,
      last7Days,
      severityCounts,
      typeCounts,
      dailyTrend,
      weeklyResponseTimes,
      resolutionRate,
      criticalTrendDirection,
    }
  }, [alerts])

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  const severityData = Object.entries(analytics.severityCounts).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: SEVERITY_COLORS[severity as AlertSeverity],
  }))

  const typeData = Object.entries(analytics.typeCounts)
    .map(([type, count]) => ({
      name: ALERT_TYPE_LABELS[type as AlertType],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ChartLine size={32} className="text-accent" weight="bold" />
            Alert Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor alert patterns, response times, and resolution trends
          </p>
        </div>
        {alerts.length === 0 && (
          <Button onClick={handleLoadSampleAlerts} className="gap-2">
            <Sparkle size={20} />
            Load Sample Alerts
          </Button>
        )}
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ChartLine size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Alert Data Available</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Alert analytics will be displayed once your system generates alerts. Load sample data to explore the analytics dashboard.
            </p>
            <Button onClick={handleLoadSampleAlerts} className="gap-2">
              <Sparkle size={20} />
              Load Sample Alerts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {formatDuration(analytics.avgResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Time to acknowledgment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle size={16} />
              Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {formatDuration(analytics.avgResolutionTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Time to resolution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target size={16} />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {analytics.resolutionRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.resolvedAlerts} of {analytics.totalAlerts} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightning size={16} />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono">
                {analytics.severityCounts.critical || 0}
              </span>
              {analytics.criticalTrendDirection !== 0 && (
                <Badge 
                  variant={analytics.criticalTrendDirection > 0 ? 'destructive' : 'default'}
                  className="gap-1"
                >
                  <TrendUp 
                    size={12} 
                    className={cn(
                      analytics.criticalTrendDirection > 0 ? '' : 'rotate-180'
                    )}
                  />
                  {Math.abs(analytics.criticalTrendDirection)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 7 days trend
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" className="gap-2">
            <TrendUp size={18} />
            Trends
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Clock size={18} />
            Performance
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <Stack size={18} />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Calendar size={18} />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Volume Trend (30 Days)</CardTitle>
                <CardDescription>
                  Daily alert creation by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="critical" 
                      stackId="1"
                      stroke={SEVERITY_COLORS.critical}
                      fill={SEVERITY_COLORS.critical}
                      name="Critical"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="high" 
                      stackId="1"
                      stroke={SEVERITY_COLORS.high}
                      fill={SEVERITY_COLORS.high}
                      name="High"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="medium" 
                      stackId="1"
                      stroke={SEVERITY_COLORS.medium}
                      fill={SEVERITY_COLORS.medium}
                      name="Medium"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="low" 
                      stackId="1"
                      stroke={SEVERITY_COLORS.low}
                      fill={SEVERITY_COLORS.low}
                      name="Low"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Trend</CardTitle>
                <CardDescription>
                  Daily alert resolutions vs. new alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="oklch(0.70 0.15 210)"
                      strokeWidth={2}
                      name="New Alerts"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="oklch(0.60 0.15 160)"
                      strokeWidth={2}
                      name="Resolved"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>
                  Average time to acknowledge alerts (hours)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.weeklyResponseTimes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}h`, 'Avg Response Time']}
                    />
                    <Bar 
                      dataKey="responseTime" 
                      fill="oklch(0.70 0.15 210)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Response efficiency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Last 24 Hours</p>
                      <p className="text-2xl font-bold font-mono">{analytics.last24Hours}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {analytics.last24Hours > 5 ? 'High' : analytics.last24Hours > 2 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Last 7 Days</p>
                      <p className="text-2xl font-bold font-mono">{analytics.last7Days}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {analytics.last7Days > 30 ? 'High' : analytics.last7Days > 10 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Active Alerts</p>
                      <p className="text-2xl font-bold font-mono">{analytics.activeAlerts}</p>
                    </div>
                    <Badge 
                      variant={analytics.activeAlerts > 10 ? 'destructive' : 'outline'}
                      className="text-lg px-3 py-1"
                    >
                      {analytics.activeAlerts > 10 ? 'Needs Attention' : 'Good'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Acknowledged</p>
                      <p className="text-2xl font-bold font-mono">{analytics.acknowledgedAlerts}</p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      In Progress
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alerts by Severity</CardTitle>
                <CardDescription>
                  Distribution of alert priority levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {severityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: <span className="font-mono font-semibold">{item.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Alert Types</CardTitle>
                <CardDescription>
                  Most frequent alert categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={typeData} 
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="oklch(0.70 0.15 210)"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alert Status Summary</CardTitle>
              <CardDescription>
                Current state of all alerts in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <div className="text-3xl font-bold font-mono text-destructive">
                    {analytics.activeAlerts}
                  </div>
                  <div className="text-sm font-medium mt-1">Active</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-3xl font-bold font-mono text-warning-foreground">
                    {analytics.acknowledgedAlerts}
                  </div>
                  <div className="text-sm font-medium mt-1">Acknowledged</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-3xl font-bold font-mono text-success">
                    {analytics.resolvedAlerts}
                  </div>
                  <div className="text-sm font-medium mt-1">Resolved</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold font-mono">
                    {analytics.totalAlerts}
                  </div>
                  <div className="text-sm font-medium mt-1">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Activity Overview</CardTitle>
              <CardDescription>
                Complete view of alert creation and resolution patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    fill="oklch(0.70 0.15 210)"
                    name="New Alerts"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="resolved" 
                    fill="oklch(0.60 0.15 160)"
                    name="Resolved"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peak Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyTrend
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5)
                    .map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{day.date}</span>
                        <Badge variant="outline" className="font-mono">
                          {day.total}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Resolution Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyTrend
                    .filter(d => d.resolved > 0)
                    .sort((a, b) => b.resolved - a.resolved)
                    .slice(0, 5)
                    .map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{day.date}</span>
                        <Badge variant="outline" className="font-mono bg-success/10">
                          {day.resolved}
                        </Badge>
                      </div>
                    ))}
                  {analytics.dailyTrend.filter(d => d.resolved > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No resolutions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Alert Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyTrend
                    .filter(d => d.critical > 0)
                    .sort((a, b) => b.critical - a.critical)
                    .slice(0, 5)
                    .map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{day.date}</span>
                        <Badge variant="destructive" className="font-mono">
                          {day.critical}
                        </Badge>
                      </div>
                    ))}
                  {analytics.dailyTrend.filter(d => d.critical > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No critical alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  )
}

export function AlertAnalyticsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
    >
      <ChartLine size={20} />
    </Button>
  )
}
