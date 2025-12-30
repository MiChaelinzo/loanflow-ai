import { Loan, MarketPricing } from './types'
import { Alert, AlertSeverity } from './alertTypes'

export interface SpreadWidening {
  loanId: string
  loanName: string
  spreadChange: number
  spreadChangePercent: number
  timeWindow: string
  currentSpread: number
  baselineSpread: number
  severity: AlertSeverity
  creditRiskIndicator: 'deteriorating' | 'stable' | 'improving'
  marketConditions: 'stressed' | 'normal' | 'favorable'
}

export interface SpreadMonitoringConfig {
  minorWideningThreshold: number
  moderateWideningThreshold: number
  severeWideningThreshold: number
  criticalWideningThreshold: number
  baselineWindow: number
  checkFrequencyMinutes: number
  consecutiveBreachesRequired: number
}

export class SpreadAlertService {
  private spreadHistory: Map<string, Array<{ timestamp: Date; spread: number }>>
  private config: SpreadMonitoringConfig

  constructor(config: SpreadMonitoringConfig) {
    this.spreadHistory = new Map()
    this.config = config
  }

  recordSpread(loanId: string, spread: number): void {
    if (!this.spreadHistory.has(loanId)) {
      this.spreadHistory.set(loanId, [])
    }

    const history = this.spreadHistory.get(loanId)!
    history.push({
      timestamp: new Date(),
      spread,
    })

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)

    this.spreadHistory.set(
      loanId,
      history.filter((entry) => entry.timestamp >= cutoffDate)
    )
  }

  calculateBaselineSpread(loanId: string): number | null {
    const history = this.spreadHistory.get(loanId)
    if (!history || history.length === 0) {
      return null
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.baselineWindow)

    const relevantHistory = history.filter(
      (entry) => entry.timestamp <= cutoffDate
    )

    if (relevantHistory.length === 0) {
      return null
    }

    const sum = relevantHistory.reduce((acc, entry) => acc + entry.spread, 0)
    return sum / relevantHistory.length
  }

  private analyzeCreditRisk(
    loan: Loan,
    spreadChangePercent: number
  ): 'deteriorating' | 'stable' | 'improving' {
    const avgRiskScore = loan.riskScore

    if (spreadChangePercent > 25 && avgRiskScore > 7) {
      return 'deteriorating'
    } else if (spreadChangePercent > 10 && avgRiskScore > 5) {
      return 'deteriorating'
    } else if (spreadChangePercent < -10) {
      return 'improving'
    }

    return 'stable'
  }

  private assessMarketConditions(
    loans: Loan[]
  ): 'stressed' | 'normal' | 'favorable' {
    const loansWithPricing = loans.filter((l) => l.marketPricing?.creditSpread)

    if (loansWithPricing.length === 0) {
      return 'normal'
    }

    const avgSpread =
      loansWithPricing.reduce(
        (sum, l) => sum + (l.marketPricing?.creditSpread || 0),
        0
      ) / loansWithPricing.length

    const wideningCount = loansWithPricing.filter((loan) => {
      const baseline = this.calculateBaselineSpread(loan.id)
      if (!baseline) return false
      const current = loan.marketPricing?.creditSpread || 0
      return current > baseline * 1.1
    }).length

    const wideningRatio = wideningCount / loansWithPricing.length

    if (wideningRatio > 0.5 || avgSpread > 8) {
      return 'stressed'
    } else if (wideningRatio < 0.2 && avgSpread < 4) {
      return 'favorable'
    }

    return 'normal'
  }

  private determineSeverity(
    spreadChangePercent: number,
    creditRisk: 'deteriorating' | 'stable' | 'improving',
    marketConditions: 'stressed' | 'normal' | 'favorable'
  ): AlertSeverity {
    let baseSeverity: AlertSeverity = 'low'

    if (spreadChangePercent >= this.config.criticalWideningThreshold) {
      baseSeverity = 'critical'
    } else if (spreadChangePercent >= this.config.severeWideningThreshold) {
      baseSeverity = 'high'
    } else if (spreadChangePercent >= this.config.moderateWideningThreshold) {
      baseSeverity = 'medium'
    } else if (spreadChangePercent >= this.config.minorWideningThreshold) {
      baseSeverity = 'low'
    }

    if (creditRisk === 'deteriorating') {
      if (baseSeverity === 'high') baseSeverity = 'critical'
      else if (baseSeverity === 'medium') baseSeverity = 'high'
    }

    if (marketConditions === 'stressed' && baseSeverity !== 'critical') {
      if (baseSeverity === 'high') baseSeverity = 'critical'
      else if (baseSeverity === 'medium') baseSeverity = 'high'
    }

    return baseSeverity
  }

  checkSpreadWidening(loans: Loan[], existingAlerts: Alert[]): SpreadWidening[] {
    const widenings: SpreadWidening[] = []
    const marketConditions = this.assessMarketConditions(loans)

    for (const loan of loans) {
      if (!loan.marketPricing?.creditSpread) {
        continue
      }

      const currentSpread = loan.marketPricing.creditSpread
      this.recordSpread(loan.id, currentSpread)

      const baselineSpread = this.calculateBaselineSpread(loan.id)
      if (!baselineSpread) {
        continue
      }

      const spreadChange = currentSpread - baselineSpread
      const spreadChangePercent = (spreadChange / baselineSpread) * 100

      if (spreadChangePercent < this.config.minorWideningThreshold) {
        continue
      }

      const isDuplicate = existingAlerts.some(
        (alert) =>
          alert.loanId === loan.id &&
          alert.type === 'spread_widening' &&
          alert.status === 'active'
      )

      if (isDuplicate) {
        continue
      }

      const creditRisk = this.analyzeCreditRisk(loan, spreadChangePercent)
      const severity = this.determineSeverity(
        spreadChangePercent,
        creditRisk,
        marketConditions
      )

      widenings.push({
        loanId: loan.id,
        loanName: loan.borrowerName,
        spreadChange: spreadChange * 100,
        spreadChangePercent,
        timeWindow: `${this.config.baselineWindow}d`,
        currentSpread,
        baselineSpread,
        severity,
        creditRiskIndicator: creditRisk,
        marketConditions,
      })
    }

    return widenings
  }

  generateSpreadAlerts(widenings: SpreadWidening[]): Alert[] {
    const alerts: Alert[] = []

    for (const widening of widenings) {
      const alert: Alert = {
        id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'spread_widening',
        severity: widening.severity,
        status: 'active',
        loanId: widening.loanId,
        loanName: widening.loanName,
        title: this.generateAlertTitle(widening),
        message: this.generateAlertMessage(widening),
        details: {
          currentSpread: widening.currentSpread,
          baselineSpread: widening.baselineSpread,
          spreadChange: widening.spreadChange,
          spreadChangePercent: widening.spreadChangePercent,
          timeWindow: widening.timeWindow,
          creditRiskIndicator: widening.creditRiskIndicator,
          marketConditions: widening.marketConditions,
          recommendation: this.generateRecommendation(widening)
        },
        createdAt: new Date().toISOString(),
        emailSent: false
      }

      alerts.push(alert)
    }

    return alerts
  }

  private generateAlertTitle(widening: SpreadWidening): string {
    const severityLabels = {
      critical: 'Critical Spread Widening',
      high: 'Severe Spread Widening',
      medium: 'Moderate Spread Widening',
      low: 'Minor Spread Widening',
    }
    return severityLabels[widening.severity]
  }

  private generateAlertMessage(widening: SpreadWidening): string {
    const direction = widening.spreadChangePercent > 0 ? 'widened' : 'tightened'
    const marketContext =
      widening.marketConditions === 'stressed'
        ? ' Market conditions are stressed.'
        : widening.marketConditions === 'favorable'
        ? ' Market conditions are favorable.'
        : ''

    return `Credit spread for ${widening.loanName} has ${direction} by ${Math.abs(
      widening.spreadChangePercent
    ).toFixed(1)}% (${widening.spreadChange.toFixed(0)}bps) over ${
      widening.timeWindow
    }.${marketContext} Credit risk indicator: ${widening.creditRiskIndicator}.`
  }

  private generateRecommendation(widening: SpreadWidening): string {
    if (widening.severity === 'critical') {
      return 'URGENT: Review credit exposure immediately. Consider reducing position or hedging risk. Escalate to senior management.'
    } else if (widening.severity === 'high') {
      return 'Conduct thorough credit review. Monitor daily for further deterioration. Prepare risk mitigation strategies.'
    } else if (widening.severity === 'medium') {
      return 'Schedule credit review within 48 hours. Increase monitoring frequency. Review covenant compliance.'
    }
    return 'Continue monitoring. Review at next scheduled credit committee meeting.'
  }

  getSpreadTrendAnalysis(loanId: string): {
    avgSpread: number
    trend: 'widening' | 'tightening' | 'stable'
    volatility: 'high' | 'medium' | 'low'
    maxSpread: number
    minSpread: number
    dataPoints: number
  } | null {
    const history = this.spreadHistory.get(loanId)

    if (!history || history.length < 2) {
      return null
    }

    const spreads = history.map((h) => h.spread)
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length

    const sortedHistory = [...history].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )

    if (sortedHistory.length < 10) {
      return null
    }

    const midPoint = Math.floor(sortedHistory.length / 2)
    const firstHalf = sortedHistory.slice(0, midPoint).map((h) => h.spread)
    const secondHalf = sortedHistory.slice(midPoint).map((h) => h.spread)

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const trendPercent = ((secondAvg - firstAvg) / firstAvg) * 100

    let trend: 'widening' | 'tightening' | 'stable'
    if (trendPercent > 10) {
      trend = 'widening'
    } else if (trendPercent < -10) {
      trend = 'tightening'
    } else {
      trend = 'stable'
    }

    const variance =
      spreads.reduce((sum, val) => sum + Math.pow(val - avgSpread, 2), 0) /
      spreads.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / avgSpread) * 100

    let volatility: 'high' | 'medium' | 'low'
    if (coefficientOfVariation > 20) {
      volatility = 'high'
    } else if (coefficientOfVariation > 10) {
      volatility = 'medium'
    } else {
      volatility = 'low'
    }

    return {
      avgSpread,
      trend,
      volatility,
      maxSpread: Math.max(...spreads),
      minSpread: Math.min(...spreads),
      dataPoints: history.length,
    }
  }

  updateConfig(config: Partial<SpreadMonitoringConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): SpreadMonitoringConfig {
    return { ...this.config }
  }
}

export const spreadAlertService = new SpreadAlertService({
  minorWideningThreshold: 10,
  moderateWideningThreshold: 20,
  severeWideningThreshold: 35,
  criticalWideningThreshold: 50,
  baselineWindow: 7,
  checkFrequencyMinutes: 60,
  consecutiveBreachesRequired: 2,
})
