import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Loan } from '@/lib/types'
import { Alert } from '@/lib/alertTypes'
import {
  spreadAlertService,
  SpreadMonitoringConfig,
  DEFAULT_SPREAD_CONFIG,
  SpreadWidening,
} from '@/lib/spreadAlertService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import {
  TrendUp,
  TrendDown,
  Warning,
  CheckCircle,
  XCircle,
  Gauge,
  Lightning,
  ChartLine,
  CaretUp,
  CaretDown,
  Minus,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SpreadWideningMonitorProps {
  loans: Loan[]
  alerts: Alert[]
  onNewAlerts?: (alerts: Alert[]) => void
}

export function SpreadWideningMonitor({ loans, alerts, onNewAlerts }: SpreadWideningMonitorProps) {
  const [config, setConfig] = useKV<SpreadMonitoringConfig>(
    'spread-monitoring-config',
    DEFAULT_SPREAD_CONFIG
  )
  const [localConfig, setLocalConfig] = useState<SpreadMonitoringConfig>(
    config || DEFAULT_SPREAD_CONFIG
  )
  const [widenings, setWidenings] = useState<SpreadWidening[]>([])
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (config) {
      spreadAlertService.updateConfig(config)
    }
  }, [config])

  useEffect(() => {
    const interval = setInterval(() => {
      checkSpreads()
    }, (config?.checkFrequencyMinutes || 60) * 60 * 1000)

    checkSpreads()

    return () => clearInterval(interval)
  }, [loans, alerts])

  const checkSpreads = () => {
    if (loans.length === 0) return

    setIsChecking(true)
    const detectedWidenings = spreadAlertService.checkSpreadWidening(loans, alerts)
    setWidenings(detectedWidenings)
    setLastCheck(new Date().toISOString())

    if (detectedWidenings.length > 0) {
      const newAlerts = spreadAlertService.generateSpreadAlerts(detectedWidenings)
      if (onNewAlerts && newAlerts.length > 0) {
        onNewAlerts(newAlerts)
        toast.warning(`${newAlerts.length} spread widening alert(s) detected`, {
          description: 'Review credit deterioration warnings in your alerts',
        })
      }
    }

    setIsChecking(false)
  }

  const handleSaveConfig = () => {
    setConfig(localConfig)
    spreadAlertService.updateConfig(localConfig)
    toast.success('Spread monitoring configuration updated', {
      description: 'New thresholds and settings have been applied',
    })
  }

  const handleResetConfig = () => {
    setLocalConfig(DEFAULT_SPREAD_CONFIG)
    setConfig(DEFAULT_SPREAD_CONFIG)
    spreadAlertService.updateConfig(DEFAULT_SPREAD_CONFIG)
    toast.success('Configuration reset to defaults')
  }

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical':
        return 'text-destructive'
      case 'high':
        return 'text-warning'
      case 'medium':
        return 'text-accent'
      case 'low':
        return 'text-muted-foreground'
    }
  }

  const getSeverityBadgeVariant = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
    }
  }

  const getRiskIcon = (indicator: 'deteriorating' | 'stable' | 'improving') => {
    switch (indicator) {
      case 'deteriorating':
        return <XCircle className="text-destructive" size={20} />
      case 'stable':
        return <Minus className="text-muted-foreground" size={20} />
      case 'improving':
        return <CheckCircle className="text-success" size={20} />
    }
  }

  const getMarketIcon = (conditions: 'stressed' | 'normal' | 'favorable') => {
    switch (conditions) {
      case 'stressed':
        return <Warning className="text-destructive" size={20} />
      case 'normal':
        return <Gauge className="text-muted-foreground" size={20} />
      case 'favorable':
        return <CheckCircle className="text-success" size={20} />
    }
  }

  const loansWithSpreads = loans.filter((l) => l.marketPricing?.creditSpread)
  const avgSpread =
    loansWithSpreads.length > 0
      ? loansWithSpreads.reduce((sum, l) => sum + (l.marketPricing?.creditSpread || 0), 0) /
        loansWithSpreads.length
      : 0

  const criticalCount = widenings.filter((w) => w.severity === 'critical').length
  const highCount = widenings.filter((w) => w.severity === 'high').length
  const mediumCount = widenings.filter((w) => w.severity === 'medium').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <TrendUp size={32} weight="bold" className="text-warning" />
            Spread Widening Monitor
          </h2>
          <p className="text-muted-foreground mt-1">
            Early warning system for credit deterioration through spread analysis
          </p>
        </div>
        <Button onClick={checkSpreads} disabled={isChecking} className="gap-2">
          <Lightning size={20} />
          {isChecking ? 'Checking...' : 'Check Now'}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Widenings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{widenings.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {criticalCount} critical, {highCount} high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Portfolio Spread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{avgSpread.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-2">basis points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monitored Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{loansWithSpreads.length}</div>
            <p className="text-xs text-muted-foreground mt-2">with spread data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastCheck
                ? new Date(lastCheck).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Next: {localConfig.checkFrequencyMinutes}m
            </p>
          </CardContent>
        </Card>
      </div>

      {widenings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning size={24} className="text-warning" />
              Detected Spread Widenings
            </CardTitle>
            <CardDescription>
              Loans showing significant credit spread widening indicating potential credit deterioration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {widenings.map((widening) => (
              <Card key={widening.loanId} className="border-l-4" style={{
                borderLeftColor: widening.severity === 'critical' ? 'rgb(var(--destructive))' : 
                                widening.severity === 'high' ? 'rgb(var(--warning))' : 
                                'rgb(var(--accent))'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{widening.loanName}</CardTitle>
                      <CardDescription className="mt-1">
                        Loan ID: {widening.loanId}
                      </CardDescription>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(widening.severity)}>
                      {widening.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Spread Change</Label>
                      <div className={`text-2xl font-bold font-mono flex items-center gap-2 ${getSeverityColor(widening.severity)}`}>
                        <CaretUp size={24} weight="bold" />
                        {widening.spreadChangePercent.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        +{widening.spreadChange.toFixed(0)} bps
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Current Spread</Label>
                      <div className="text-2xl font-bold font-mono">
                        {widening.currentSpread.toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        from {widening.previousSpread.toFixed(0)} bps
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Time Window</Label>
                      <div className="text-lg font-semibold">{widening.timeWindow}</div>
                      <p className="text-xs text-muted-foreground mt-1">baseline period</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      {getRiskIcon(widening.creditRiskIndicator)}
                      <div>
                        <Label className="text-xs text-muted-foreground">Credit Risk</Label>
                        <p className="text-sm font-semibold capitalize">
                          {widening.creditRiskIndicator}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getMarketIcon(widening.marketConditions)}
                      <div>
                        <Label className="text-xs text-muted-foreground">Market Conditions</Label>
                        <p className="text-sm font-semibold capitalize">
                          {widening.marketConditions}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {widenings.length === 0 && lastCheck && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle size={48} className="text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Spread Widenings Detected</h3>
            <p className="text-muted-foreground">
              All monitored loans are within acceptable spread thresholds
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={24} />
            Monitoring Configuration
          </CardTitle>
          <CardDescription>
            Configure spread widening detection thresholds and monitoring parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minorThreshold">Minor Widening Threshold (%)</Label>
              <Input
                id="minorThreshold"
                type="number"
                min="5"
                max="50"
                value={localConfig.minorWideningThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    minorWideningThreshold: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Low severity alert threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderateThreshold">Moderate Widening Threshold (%)</Label>
              <Input
                id="moderateThreshold"
                type="number"
                min="10"
                max="100"
                value={localConfig.moderateWideningThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    moderateWideningThreshold: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Medium severity alert threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severeThreshold">Severe Widening Threshold (%)</Label>
              <Input
                id="severeThreshold"
                type="number"
                min="25"
                max="150"
                value={localConfig.severeWideningThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    severeWideningThreshold: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                High severity alert threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticalThreshold">Critical Widening Threshold (%)</Label>
              <Input
                id="criticalThreshold"
                type="number"
                min="50"
                max="200"
                value={localConfig.criticalWideningThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    criticalWideningThreshold: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Critical severity alert threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baselineWindow">Baseline Window (days)</Label>
              <Input
                id="baselineWindow"
                type="number"
                min="3"
                max="30"
                value={localConfig.baselineWindow}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    baselineWindow: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Historical period for baseline calculation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkFrequency">Check Frequency (minutes)</Label>
              <Input
                id="checkFrequency"
                type="number"
                min="15"
                max="1440"
                value={localConfig.checkFrequencyMinutes}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    checkFrequencyMinutes: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                How often to check for spread changes
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveConfig} className="gap-2">
              <CheckCircle size={20} />
              Save Configuration
            </Button>
            <Button onClick={handleResetConfig} variant="outline" className="gap-2">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Understanding Spread Widening Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What is Spread Widening?</h4>
            <p className="text-sm text-muted-foreground">
              Credit spread widening occurs when the difference between a loan's yield and the risk-free rate increases. 
              This typically indicates deteriorating credit quality, increased default risk, or declining market confidence 
              in the borrower's ability to repay.
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Severity Levels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline">LOW</Badge>
                <span className="text-muted-foreground">
                  Minor widening ({localConfig.minorWideningThreshold}%+) - Continue monitoring
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary">MEDIUM</Badge>
                <span className="text-muted-foreground">
                  Moderate widening ({localConfig.moderateWideningThreshold}%+) - Review within 48 hours
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="default">HIGH</Badge>
                <span className="text-muted-foreground">
                  Severe widening ({localConfig.severeWideningThreshold}%+) - Review within 24 hours
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="destructive">CRITICAL</Badge>
                <span className="text-muted-foreground">
                  Critical widening ({localConfig.criticalWideningThreshold}%+) - Immediate action required
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Key Indicators</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Credit Risk Indicator:</strong> Analyzes loan characteristics 
                and risk factors to assess if credit quality is deteriorating, stable, or improving.
              </p>
              <p>
                <strong className="text-foreground">Market Conditions:</strong> Considers portfolio-wide spread 
                movements to distinguish between borrower-specific issues and broader market stress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SpreadWideningMonitorTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <TrendUp size={20} />
      Spread Monitor
    </Button>
  )
}
