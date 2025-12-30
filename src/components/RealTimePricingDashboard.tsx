import { useState, useEffect } from 'react'
import { Loan, MarketPricing, PriceHistory, ComparableLoans } from '@/lib/types'
import { pricingEngine } from '@/lib/pricingEngine'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendUp, 
  TrendDown, 
  ArrowsClockwise, 
  ChartLine, 
  Gauge, 
  Lightning,
  Clock,
  Database,
  CheckCircle,
  Warning,
  Info
} from '@phosphor-icons/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RealTimePricingDashboardProps {
  loans: Loan[]
  onPricingUpdate?: (loanId: string, pricing: MarketPricing) => void
}

export function RealTimePricingDashboard({ loans, onPricingUpdate }: RealTimePricingDashboardProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(loans[0] || null)
  const [pricing, setPricing] = useState<MarketPricing | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [comparables, setComparables] = useState<ComparableLoans[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (!selectedLoan) return

    calculatePricing()
    
    if (!autoRefresh) return

    const interval = setInterval(() => {
      calculatePricing(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedLoan, autoRefresh, loans])

  const calculatePricing = async (isUpdate = false) => {
    if (!selectedLoan) return
    
    if (!isUpdate) setIsCalculating(true)

    setTimeout(() => {
      const newPricing = pricingEngine.calculateMarketPricing(selectedLoan, loans)
      setPricing(newPricing)

      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      const history = pricingEngine.generatePriceHistory(selectedLoan, days)
      setPriceHistory(history)

      const comps = pricingEngine.getComparableLoans(selectedLoan, loans)
      setComparables(comps)

      if (onPricingUpdate) {
        onPricingUpdate(selectedLoan.id, newPricing)
      }

      setIsCalculating(false)
    }, 300)
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Database size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Loans Available</h3>
            <p className="text-muted-foreground">Upload loan documents to see real-time pricing analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const marketFactors = pricingEngine.getMarketFactors()

  const chartData = priceHistory.map(h => ({
    date: new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: h.price,
    volume: h.volume ? h.volume / 1000000 : 0,
    spread: h.spread,
  }))

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-success'
      case 'bearish': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'default'
      case 'bearish': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Lightning size={32} className="text-accent" weight="bold" />
            Real-Time Loan Pricing Engine
          </h2>
          <p className="text-muted-foreground mt-1">
            Dynamic market-based valuations with AI-powered pricing models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <ArrowsClockwise size={16} className={autoRefresh ? 'animate-spin' : ''} />
            Auto-Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => calculatePricing()}
            disabled={isCalculating}
            className="gap-2"
          >
            {isCalculating ? (
              <ArrowsClockwise size={16} className="animate-spin" />
            ) : (
              <ArrowsClockwise size={16} />
            )}
            Recalculate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-accent/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Base Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketFactors.baseRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Treasury benchmark</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketFactors.creditSpread.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Market average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liquidity Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketFactors.liquidityPremium.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Current market</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(marketFactors.volatility * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Price fluctuation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Loan for Pricing Analysis</CardTitle>
              <CardDescription>Choose a loan to view detailed market pricing and valuation</CardDescription>
            </div>
            {pricing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={14} />
                Last updated: {new Date(pricing.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedLoan?.id}
            onValueChange={(value) => {
              const loan = loans.find(l => l.id === value)
              setSelectedLoan(loan || null)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loans.map((loan) => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.borrowerName} - {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: loan.currency,
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(loan.amount)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLoan && pricing && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fair Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedLoan.currency,
                    notation: 'compact',
                    maximumFractionDigits: 2,
                  }).format(pricing.fairValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Hybrid model valuation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedLoan.currency,
                    notation: 'compact',
                    maximumFractionDigits: 2,
                  }).format(pricing.currentPrice)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {pricing.priceChange24h >= 0 ? (
                    <TrendUp size={14} className="text-success" weight="bold" />
                  ) : (
                    <TrendDown size={14} className="text-destructive" weight="bold" />
                  )}
                  <span className={`text-xs font-medium ${pricing.priceChange24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pricing.priceChangePercent24h >= 0 ? '+' : ''}
                    {pricing.priceChangePercent24h.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Yield to Maturity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{pricing.yieldToMaturity.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Expected annual return</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getSentimentBadge(pricing.marketSentiment)} className="text-sm">
                  {pricing.marketSentiment.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Based on recent activity</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="price-chart" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="price-chart">Price Chart</TabsTrigger>
              <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
              <TabsTrigger value="comparables">Comparables</TabsTrigger>
              <TabsTrigger value="breakdown">Pricing Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="price-chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Price History</CardTitle>
                    <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Duration & Convexity</CardTitle>
                    <CardDescription>Interest rate risk measures</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Modified Duration</span>
                        <span className="text-lg font-bold font-mono">{pricing.duration.toFixed(2)}</span>
                      </div>
                      <Progress value={Math.min((pricing.duration / 10) * 100, 100)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{pricing.duration.toFixed(1)}% price change per 1% rate change
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Convexity</span>
                        <span className="text-lg font-bold font-mono">{pricing.convexity.toFixed(2)}</span>
                      </div>
                      <Progress value={Math.min((pricing.convexity / 50) * 100, 100)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Second-order rate sensitivity
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Credit Metrics</CardTitle>
                    <CardDescription>Spread and risk analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Credit Spread</span>
                        <span className="text-lg font-bold font-mono">{pricing.spread.toFixed(2)}%</span>
                      </div>
                      <Progress value={Math.min((pricing.spread / 10) * 100, 100)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Over benchmark rate
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Liquidity Score</span>
                        <span className="text-lg font-bold font-mono">{pricing.liquidityScore.toFixed(0)}/100</span>
                      </div>
                      <Progress value={pricing.liquidityScore} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {pricing.liquidityScore > 75 ? 'Highly liquid' : pricing.liquidityScore > 50 ? 'Moderately liquid' : 'Less liquid'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Model Confidence</CardTitle>
                    <CardDescription>Pricing accuracy and reliability indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Confidence</span>
                          <span className="text-lg font-bold font-mono">{pricing.confidenceLevel.toFixed(0)}%</span>
                        </div>
                        <Progress value={pricing.confidenceLevel} className="h-3" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Data Quality</p>
                            <p className="text-xs text-muted-foreground">Complete loan information</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info size={20} className="text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Comparables</p>
                            <p className="text-xs text-muted-foreground">{comparables.length} similar loans found</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Gauge size={20} className="text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Model Type</p>
                            <p className="text-xs text-muted-foreground">{pricing.pricingModel.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparables" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comparable Loans</CardTitle>
                  <CardDescription>Similar loans used for market-based pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  {comparables.length === 0 ? (
                    <div className="text-center py-8">
                      <Warning size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No comparable loans found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comparables.map((comp) => (
                        <div
                          key={comp.loanId}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{comp.borrowerName}</p>
                            <p className="text-sm text-muted-foreground">
                              Similarity: {(comp.similarity * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedLoan.currency,
                                notation: 'compact',
                              }).format(comp.currentPrice)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Spread: {comp.spread.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spread Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={comparables.map(c => ({
                        name: c.borrowerName.substring(0, 20),
                        spread: c.spread,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="spread" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Model Components</CardTitle>
                  <CardDescription>How the fair value is calculated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">DCF Model</span>
                        <span className="text-sm text-muted-foreground">40%</span>
                      </div>
                      <Progress value={40} />
                      <p className="text-xs text-muted-foreground">Discounted cash flow</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Comparable</span>
                        <span className="text-sm text-muted-foreground">35%</span>
                      </div>
                      <Progress value={35} />
                      <p className="text-xs text-muted-foreground">Market comparables</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Regression</span>
                        <span className="text-sm text-muted-foreground">25%</span>
                      </div>
                      <Progress value={25} />
                      <p className="text-xs text-muted-foreground">Statistical model</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Pricing Adjustments</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Risk Premium</span>
                          <span className="text-sm font-mono">{(selectedLoan.riskScore * 0.3).toFixed(2)}%</span>
                        </div>
                        <Progress value={selectedLoan.riskScore * 10} className="h-1" />
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">ESG Adjustment</span>
                          <span className="text-sm font-mono text-success">
                            {selectedLoan.esgScore.overall === 'A' ? '+5%' : selectedLoan.esgScore.overall === 'B' ? '+2%' : '0%'}
                          </span>
                        </div>
                        <Progress value={selectedLoan.esgScore.overall === 'A' ? 100 : 50} className="h-1" />
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Liquidity Factor</span>
                          <span className="text-sm font-mono">{marketFactors.liquidityPremium.toFixed(2)}%</span>
                        </div>
                        <Progress value={marketFactors.liquidityPremium * 20} className="h-1" />
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Compliance Bonus</span>
                          <span className="text-sm font-mono text-success">
                            {selectedLoan.lmaCompliance?.level === 'full' ? '+10%' : '0%'}
                          </span>
                        </div>
                        <Progress value={selectedLoan.lmaCompliance?.level === 'full' ? 100 : 0} className="h-1" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Pricing Formula</h4>
                    <div className="font-mono text-sm space-y-1">
                      <p>Fair Value = (DCF × 0.40) + (Comparable × 0.35) + (Regression × 0.25)</p>
                      <p className="text-muted-foreground text-xs mt-2">
                        Adjusted for: Risk Premium, ESG Score, Liquidity, Compliance, Market Volatility
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
