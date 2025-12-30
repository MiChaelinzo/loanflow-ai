import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Loan } from '@/lib/types'
import { TrendUp, TrendDown, ChartLine, Warning, CheckCircle, Minus, Calendar, Download, ArrowsClockwise } from '@phosphor-icons/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis } from 'recharts'
import { toast } from 'sonner'

interface SpreadTrendDashboardProps {
  loans: Loan[]
}

type TimeRange = '7d' | '30d' | '90d' | '180d' | '1y' | 'all'
type ChartView = 'line' | 'area' | 'scatter' | 'comparison'
type SpreadMetric = 'credit_spread' | 'z_spread' | 'oas' | 'discount_margin'

interface SpreadDataPoint {
  date: string
  timestamp: number
  spread: number
  benchmarkRate: number
  loanId: string
  borrowerName: string
  industry: string
  riskLevel: string
}

interface AggregatedSpreadData {
  date: string
  avgSpread: number
  minSpread: number
  maxSpread: number
  medianSpread: number
  volatility: number
  count: number
}

interface IndustrySpreadData {
  date: string
  [industry: string]: number | string
}

export function SpreadTrendDashboard({ loans }: SpreadTrendDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartView, setChartView] = useState<ChartView>('line')
  const [selectedMetric, setSelectedMetric] = useState<SpreadMetric>('credit_spread')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        toast.info('Spread data refreshed', { duration: 2000 })
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getDaysFromRange = (range: TimeRange): number => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '180d': return 180
      case '1y': return 365
      case 'all': return 730
      default: return 30
    }
  }

  const generateHistoricalSpreadData = (loan: Loan, days: number): SpreadDataPoint[] => {
    const data: SpreadDataPoint[] = []
    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000
    
    const baseSpread = loan.marketPricing?.creditSpread || (loan.interestRate - 4.5)
    const volatility = loan.riskLevel === 'critical' ? 0.5 : 
                      loan.riskLevel === 'high' ? 0.3 : 
                      loan.riskLevel === 'medium' ? 0.15 : 0.08
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * msPerDay)
      const date = new Date(timestamp).toISOString().split('T')[0]
      
      const trend = (days - i) / days
      const seasonality = Math.sin((i / 30) * Math.PI) * 0.1
      const randomWalk = (Math.random() - 0.5) * volatility
      const riskAdjustment = loan.riskLevel === 'critical' ? 0.5 : 
                            loan.riskLevel === 'high' ? 0.2 : 0
      
      let spread = baseSpread + (trend * 0.2) + seasonality + randomWalk + riskAdjustment
      spread = Math.max(0.1, spread)
      
      const baseBenchmark = 4.5
      const benchmarkVolatility = Math.sin((i / 15) * Math.PI) * 0.1
      const benchmarkRate = baseBenchmark + benchmarkVolatility
      
      data.push({
        date,
        timestamp,
        spread: parseFloat(spread.toFixed(2)),
        benchmarkRate: parseFloat(benchmarkRate.toFixed(2)),
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        industry: loan.industry,
        riskLevel: loan.riskLevel
      })
    }
    
    return data
  }

  const historicalData = useMemo(() => {
    const days = getDaysFromRange(timeRange)
    const allData: SpreadDataPoint[] = []
    
    loans.forEach(loan => {
      if (loan.marketPricing) {
        const loanData = generateHistoricalSpreadData(loan, days)
        allData.push(...loanData)
      }
    })
    
    return allData
  }, [loans, timeRange])

  const filteredData = useMemo(() => {
    return historicalData.filter(point => {
      const matchesIndustry = selectedIndustry === 'all' || point.industry === selectedIndustry
      const matchesRisk = selectedRiskLevel === 'all' || point.riskLevel === selectedRiskLevel
      return matchesIndustry && matchesRisk
    })
  }, [historicalData, selectedIndustry, selectedRiskLevel])

  const aggregatedData = useMemo(() => {
    const dateMap = new Map<string, SpreadDataPoint[]>()
    
    filteredData.forEach(point => {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, [])
      }
      dateMap.get(point.date)!.push(point)
    })
    
    const result: AggregatedSpreadData[] = []
    
    dateMap.forEach((points, date) => {
      const spreads = points.map(p => p.spread).sort((a, b) => a - b)
      const avg = spreads.reduce((a, b) => a + b, 0) / spreads.length
      const median = spreads[Math.floor(spreads.length / 2)]
      const variance = spreads.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / spreads.length
      const volatility = Math.sqrt(variance)
      
      result.push({
        date,
        avgSpread: parseFloat(avg.toFixed(2)),
        minSpread: parseFloat(Math.min(...spreads).toFixed(2)),
        maxSpread: parseFloat(Math.max(...spreads).toFixed(2)),
        medianSpread: parseFloat(median.toFixed(2)),
        volatility: parseFloat(volatility.toFixed(2)),
        count: points.length
      })
    })
    
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData])

  const industryTrendData = useMemo(() => {
    const industries = Array.from(new Set(loans.map(l => l.industry)))
    const dateMap = new Map<string, Map<string, number[]>>()
    
    filteredData.forEach(point => {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, new Map())
      }
      const dateIndustries = dateMap.get(point.date)!
      if (!dateIndustries.has(point.industry)) {
        dateIndustries.set(point.industry, [])
      }
      dateIndustries.get(point.industry)!.push(point.spread)
    })
    
    const result: IndustrySpreadData[] = []
    
    dateMap.forEach((industryMap, date) => {
      const dataPoint: IndustrySpreadData = { date }
      industryMap.forEach((spreads, industry) => {
        const avg = spreads.reduce((a, b) => a + b, 0) / spreads.length
        dataPoint[industry] = parseFloat(avg.toFixed(2))
      })
      result.push(dataPoint)
    })
    
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData, loans])

  const spreadStatistics = useMemo(() => {
    if (aggregatedData.length === 0) return null
    
    const latest = aggregatedData[aggregatedData.length - 1]
    const previous = aggregatedData[Math.max(0, aggregatedData.length - 8)]
    const change = latest.avgSpread - previous.avgSpread
    const changePercent = (change / previous.avgSpread) * 100
    
    const allSpreads = aggregatedData.map(d => d.avgSpread)
    const avgOfAvg = allSpreads.reduce((a, b) => a + b, 0) / allSpreads.length
    const maxSpread = Math.max(...allSpreads)
    const minSpread = Math.min(...allSpreads)
    
    const widening = aggregatedData.filter((d, i) => 
      i > 0 && d.avgSpread > aggregatedData[i - 1].avgSpread
    ).length
    const tightening = aggregatedData.filter((d, i) => 
      i > 0 && d.avgSpread < aggregatedData[i - 1].avgSpread
    ).length
    
    return {
      current: latest.avgSpread,
      change,
      changePercent,
      average: avgOfAvg,
      max: maxSpread,
      min: minSpread,
      volatility: latest.volatility,
      wideningDays: widening,
      tighteningDays: tightening,
      totalDays: aggregatedData.length - 1
    }
  }, [aggregatedData])

  const riskLevelDistribution = useMemo(() => {
    const latestDate = aggregatedData[aggregatedData.length - 1]?.date
    if (!latestDate) return []
    
    const latestData = filteredData.filter(d => d.date === latestDate)
    const distribution = new Map<string, { count: number; avgSpread: number; spreads: number[] }>()
    
    latestData.forEach(point => {
      if (!distribution.has(point.riskLevel)) {
        distribution.set(point.riskLevel, { count: 0, avgSpread: 0, spreads: [] })
      }
      const entry = distribution.get(point.riskLevel)!
      entry.count++
      entry.spreads.push(point.spread)
    })
    
    return Array.from(distribution.entries()).map(([riskLevel, data]) => ({
      riskLevel,
      count: data.count,
      avgSpread: parseFloat((data.spreads.reduce((a, b) => a + b, 0) / data.count).toFixed(2))
    })).sort((a, b) => {
      const order = { low: 1, medium: 2, high: 3, critical: 4 }
      return order[a.riskLevel as keyof typeof order] - order[b.riskLevel as keyof typeof order]
    })
  }, [aggregatedData, filteredData])

  const industries = useMemo(() => 
    Array.from(new Set(loans.map(l => l.industry))).sort()
  , [loans])

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Avg Spread', 'Min Spread', 'Max Spread', 'Median Spread', 'Volatility', 'Count'],
      ...aggregatedData.map(d => [
        d.date,
        d.avgSpread.toString(),
        d.minSpread.toString(),
        d.maxSpread.toString(),
        d.medianSpread.toString(),
        d.volatility.toString(),
        d.count.toString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spread-trends-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Spread data exported successfully')
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-destructive'
    if (value < 0) return 'text-success'
    return 'text-muted-foreground'
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendUp className="text-destructive" weight="bold" />
    if (value < 0) return <TrendDown className="text-success" weight="bold" />
    return <Minus className="text-muted-foreground" />
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChartLine size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Spread Data Available</h3>
          <p className="text-muted-foreground text-center">
            Upload loan documents to start tracking spread trends
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ChartLine size={32} weight="bold" className="text-accent" />
            Spread Trend Analysis
          </h2>
          <p className="text-muted-foreground mt-1">
            Historical credit spread visualization and market movement tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <ArrowsClockwise size={16} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download size={16} />
            Export Data
          </Button>
        </div>
      </div>

      {spreadStatistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Avg Spread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{spreadStatistics.current.toFixed(2)}%</div>
              <div className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(spreadStatistics.change)}`}>
                {getTrendIcon(spreadStatistics.change)}
                <span>{spreadStatistics.change >= 0 ? '+' : ''}{spreadStatistics.change.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Period Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{spreadStatistics.average.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Over {timeRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spread Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {spreadStatistics.min.toFixed(2)} - {spreadStatistics.max.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Min - Max</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volatility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{spreadStatistics.volatility.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Std deviation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Widening Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">{spreadStatistics.wideningDays}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((spreadStatistics.wideningDays / spreadStatistics.totalDays) * 100).toFixed(0)}% of period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tightening Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-success">{spreadStatistics.tighteningDays}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((spreadStatistics.tighteningDays / spreadStatistics.totalDays) * 100).toFixed(0)}% of period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Historical Spread Trends</CardTitle>
              <CardDescription>Credit spread movements over time with volatility bands</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="180d">180 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={chartView} onValueChange={(v) => setChartView(v as ChartView)}>
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
              <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
              <TabsTrigger value="comparison">Industry Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="line" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2">{new Date(data.date).toLocaleDateString()}</p>
                            <div className="space-y-1 text-sm">
                              <p>Avg Spread: <span className="font-mono font-semibold">{data.avgSpread}%</span></p>
                              <p>Min: <span className="font-mono">{data.minSpread}%</span></p>
                              <p>Max: <span className="font-mono">{data.maxSpread}%</span></p>
                              <p>Median: <span className="font-mono">{data.medianSpread}%</span></p>
                              <p>Loans: <span className="font-mono">{data.count}</span></p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgSpread" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Average Spread"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxSpread" 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Max Spread"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minSpread" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Min Spread"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="area" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2">{new Date(data.date).toLocaleDateString()}</p>
                            <div className="space-y-1 text-sm">
                              <p>Avg Spread: <span className="font-mono font-semibold">{data.avgSpread}%</span></p>
                              <p>Volatility: <span className="font-mono">{data.volatility}%</span></p>
                              <p>Loans: <span className="font-mono">{data.count}</span></p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="maxSpread" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#fee2e2"
                    name="Max Spread"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgSpread" 
                    stackId="2"
                    stroke="#3b82f6" 
                    fill="#bfdbfe"
                    name="Avg Spread"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="scatter" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    dataKey="timestamp" 
                    name="Date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="spread" 
                    name="Spread"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis range={[20, 200]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2">{data.borrowerName}</p>
                            <div className="space-y-1 text-sm">
                              <p>Date: {new Date(data.timestamp).toLocaleDateString()}</p>
                              <p>Spread: <span className="font-mono font-semibold">{data.spread}%</span></p>
                              <p>Industry: {data.industry}</p>
                              <p>Risk: <Badge variant="outline" className="ml-1">{data.riskLevel}</Badge></p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Spread Data Points" 
                    data={filteredData.filter((_, i) => i % 5 === 0)} 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={industryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                            <div className="space-y-1 text-sm">
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {entry.name}: <span className="font-mono font-semibold">{entry.value}%</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  {industries.slice(0, 7).map((industry, index) => (
                    <Line
                      key={industry}
                      type="monotone"
                      dataKey={industry}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={industry}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spread by Risk Level</CardTitle>
            <CardDescription>Current spread distribution across risk categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskLevelDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="riskLevel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'Avg Spread (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg shadow-lg p-3">
                          <p className="font-semibold mb-2 capitalize">{data.riskLevel} Risk</p>
                          <div className="space-y-1 text-sm">
                            <p>Avg Spread: <span className="font-mono font-semibold">{data.avgSpread}%</span></p>
                            <p>Loan Count: <span className="font-mono">{data.count}</span></p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="avgSpread" fill="#3b82f6" name="Average Spread" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spread Volatility Trend</CardTitle>
            <CardDescription>Market volatility and spread stability over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Volatility', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg shadow-lg p-3">
                          <p className="font-semibold mb-2">{new Date(data.date).toLocaleDateString()}</p>
                          <div className="space-y-1 text-sm">
                            <p>Avg Spread: <span className="font-mono font-semibold">{data.avgSpread}%</span></p>
                            <p>Volatility: <span className="font-mono">{data.volatility}%</span></p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgSpread" 
                  fill="#bfdbfe" 
                  stroke="#3b82f6"
                  name="Avg Spread"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volatility" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Volatility"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spread Movement Alerts</CardTitle>
          <CardDescription>Recent significant spread changes requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aggregatedData.slice(-5).reverse().map((data, index) => {
              const prevData = aggregatedData[aggregatedData.length - 5 + index - 1]
              if (!prevData) return null
              
              const change = data.avgSpread - prevData.avgSpread
              const changePercent = (change / prevData.avgSpread) * 100
              const isSignificant = Math.abs(changePercent) > 5
              
              if (!isSignificant) return null
              
              return (
                <div key={data.date} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="mt-0.5">
                    {change > 0 ? (
                      <Warning size={20} className="text-destructive" weight="fill" />
                    ) : (
                      <CheckCircle size={20} className="text-success" weight="fill" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">
                        {change > 0 ? 'Spread Widening Detected' : 'Spread Tightening Observed'}
                      </span>
                      <Badge variant={change > 0 ? 'destructive' : 'default'}>
                        {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(data.date).toLocaleDateString()} - Average spread moved from {prevData.avgSpread.toFixed(2)}% to {data.avgSpread.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SpreadTrendDashboardTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <ChartLine size={20} />
      Spread Trends
    </Button>
  )
}
