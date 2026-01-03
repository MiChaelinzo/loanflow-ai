import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Loan } from '@/lib/types'
import { Alert } from '@/lib/alertTypes'
import { TeamMember } from '@/lib/teamTypes'
import { QuarterlyMetrics, PeriodComparison, Quarter, ComparisonFilters, TrendItem } from '@/lib/periodComparisonTypes'
import { periodComparisonService } from '@/lib/periodComparisonService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendUp, TrendDown, Minus, Warning, CheckCircle, Info, ChartLine, Download, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MultiPeriodComparisonProps {
  loans: Loan[]
  alerts: Alert[]
  teamMembers?: TeamMember[]
}

export function MultiPeriodComparison({ loans, alerts, teamMembers }: MultiPeriodComparisonProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedQuarters, setSelectedQuarters] = useState<Quarter[]>(['Q1', 'Q2', 'Q3'])
  const [selectedCategories, setSelectedCategories] = useState<ComparisonFilters['categories']>([
    'portfolio',
    'trading',
    'team',
    'compliance',
    'esg',
    'risk',
  ])
  const [comparison, setComparison] = useState<PeriodComparison | null>(null)
  const [loading, setLoading] = useState(false)

  const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  const categoryLabels: Record<string, string> = {
    portfolio: 'Portfolio',
    trading: 'Trading',
    team: 'Team',
    compliance: 'Compliance',
    esg: 'ESG',
    risk: 'Risk',
  }

  useEffect(() => {
    if (selectedQuarters.length > 0 && selectedCategories.length > 0) {
      generateComparison()
    }
  }, [selectedYear, selectedQuarters, selectedCategories, loans.length, alerts.length])

  const generateComparison = () => {
    setLoading(true)
    try {
      const periods = selectedQuarters.map(quarter => {
        return periodComparisonService.generateQuarterlyMetrics(
          quarter,
          selectedYear,
          loans,
          alerts,
          teamMembers
        )
      })

      const filters: ComparisonFilters = {
        quarters: selectedQuarters,
        year: selectedYear,
        categories: selectedCategories,
        showTrends: true,
        showInsights: true,
      }

      const comparisonData = periodComparisonService.comparePeriods(periods, filters)
      setComparison(comparisonData)
    } catch (error) {
      toast.error('Failed to generate comparison', {
        description: 'An error occurred while calculating the metrics.',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleQuarter = (quarter: Quarter) => {
    setSelectedQuarters(prev => {
      if (prev.includes(quarter)) {
        return prev.filter(q => q !== quarter)
      } else {
        return [...prev, quarter].sort((a, b) => quarters.indexOf(a) - quarters.indexOf(b))
      }
    })
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category as any)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category as any]
      }
    })
  }

  const exportComparison = () => {
    if (!comparison) return

    const csvData = generateCSVData(comparison)
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multi-period-comparison-${selectedYear}-${selectedQuarters.join('-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Comparison exported successfully')
  }

  const generateCSVData = (comparison: PeriodComparison): string => {
    const periods = comparison.periods ?? comparison.quarters
    const trends = comparison.trends ?? []
    const headers = ['Metric', 'Category', ...periods.map(p => p.quarter), 'Change', 'Change %', 'Trend', 'Status']
    const rows = trends.map(trend => [
      trend.metric,
      trend.category,
      ...(trend.values ?? []).map(v => v.toFixed(2)),
      (trend.change ?? 0).toFixed(2),
      (trend.changePercent ?? 0).toFixed(2),
      trend.trend,
      trend.status,
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendUp size={16} />
    if (trend === 'down') return <TrendDown size={16} />
    return <Minus size={16} />
  }

  const getTrendColor = (status?: 'improving' | 'declining' | 'stable') => {
    if (status === 'improving') return 'text-success'
    if (status === 'declining') return 'text-destructive'
    return 'text-muted-foreground'
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (severity === 'high') return 'destructive'
    if (severity === 'medium') return 'outline'
    return 'secondary'
  }

  const prepareChartData = (trends?: TrendItem[]) => {
    if (!comparison || !trends) return []

    const periods = comparison.periods ?? comparison.quarters
    return periods.map((period, index) => {
      const dataPoint: any = { quarter: period.quarter }
      trends.forEach(trend => {
        if (trend.values) {
          dataPoint[trend.metric ?? trend.title] = trend.values[index]
        }
      })
      return dataPoint
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating comparison...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ChartLine size={32} weight="bold" className="text-accent" />
          Multi-Period Report Comparison
        </h2>
        <p className="text-muted-foreground mt-1">
          Analyze trends and performance across multiple quarters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Settings</CardTitle>
          <CardDescription>Select the periods and categories you want to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Quarters ({selectedQuarters.length} selected)</label>
              <div className="flex gap-2">
                {quarters.map(quarter => (
                  <Button
                    key={quarter}
                    variant={selectedQuarters.includes(quarter) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleQuarter(quarter)}
                  >
                    {quarter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="text-sm font-medium">Categories ({selectedCategories.length} selected)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={selectedCategories.includes(key as any)}
                    onCheckedChange={() => toggleCategory(key)}
                  />
                  <label htmlFor={key} className="text-sm cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateComparison} disabled={selectedQuarters.length < 2}>
              <ChartLine size={20} />
              Generate Comparison
            </Button>
            {comparison && (
              <Button variant="outline" onClick={exportComparison}>
                <Download size={20} />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                {comparison.insights.length} insights identified across {selectedQuarters.length} quarters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparison.insights.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No significant insights to report
                  </p>
                )}
                {comparison.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5">
                      {insight.severity === 'high' && <Warning size={20} className="text-destructive" />}
                      {insight.severity === 'medium' && <Info size={20} className="text-warning" />}
                      {insight.severity === 'low' && <CheckCircle size={20} className="text-success" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue={selectedCategories[0]} className="space-y-6">
            <TabsList>
              {selectedCategories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {categoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedCategories.map(category => (
              <TabsContent key={category} value={category} className="space-y-6">
                {(comparison.trends ?? []).filter(t => t.category === category).map((trend, index) => {
                  const chartData = prepareChartData([trend])
                  
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{trend.metric ?? trend.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 font-semibold ${getTrendColor(trend.status)}`}>
                              {getTrendIcon(trend.trend)}
                              {(trend.changePercent ?? 0) > 0 ? '+' : ''}{(trend.changePercent ?? 0).toFixed(1)}%
                            </span>
                            <Badge variant={trend.status === 'improving' ? 'default' : trend.status === 'declining' ? 'destructive' : 'secondary'}>
                              {trend.status}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Change: {(trend.change ?? 0) > 0 ? '+' : ''}{(trend.change ?? 0).toFixed(2)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="quarter"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0.5rem',
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey={trend.metric}
                              stroke="hsl(var(--accent))"
                              strokeWidth={2}
                              dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        <div className="mt-4 grid grid-cols-3 gap-4">
                          {(trend.values ?? []).map((value, idx) => {
                            const periods = comparison.periods ?? comparison.quarters
                            return (
                              <div key={idx} className="text-center">
                                <p className="text-xs text-muted-foreground">{periods[idx]?.quarter}</p>
                                <p className="text-lg font-bold font-mono">{value.toFixed(2)}</p>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Comparative Overview</CardTitle>
              <CardDescription>All metrics side-by-side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Metric</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      {(comparison.periods ?? comparison.quarters).map(period => (
                        <th key={period.quarter} className="text-right p-3 font-semibold">
                          {period.quarter}
                        </th>
                      ))}
                      <th className="text-right p-3 font-semibold">Change</th>
                      <th className="text-center p-3 font-semibold">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(comparison.trends ?? []).map((trend, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3">{trend.metric ?? trend.title}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {trend.category}
                          </Badge>
                        </td>
                        {(trend.values ?? []).map((value, idx) => (
                          <td key={idx} className="p-3 text-right font-mono text-sm">
                            {value.toFixed(2)}
                          </td>
                        ))}
                        <td className={`p-3 text-right font-semibold ${getTrendColor(trend.status)}`}>
                          {(trend.change ?? 0) > 0 ? '+' : ''}{(trend.changePercent ?? 0).toFixed(1)}%
                        </td>
                        <td className="p-3 text-center">
                          <span className={getTrendColor(trend.status)}>
                            {getTrendIcon(trend.trend)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export function MultiPeriodComparisonTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <ChartLine size={20} />
      Multi-Period
    </Button>
  )
}
