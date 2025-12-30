import { Loan, MarketPricing } from './types'
import { Alert, AlertSeverity } from './alertTypes'

export interface SpreadWidening {
  loanId: string
  loanName: string
  currentSpread: number
  previousSpread: number
  spreadChange: number
  spreadChangePercent: number
  timeWindow: string
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

export const DEFAULT_SPREAD_CONFIG: SpreadMonitoringConfig = {
  minorWideningThreshold: 10,
  moderateWideningThreshold: 25,
  severeWideningThreshold: 50,
  criticalWideningThreshold: 100,
  baselineWindow: 7,
  checkFrequencyMinutes: 60,
  consecutiveBreachesRequired: 2,
}

export class SpreadAlertService {
  private config: SpreadMonitoringConfig
  private spreadHistory: Map<string, { timestamp: string; spread: number }[]>

  constructor(config: SpreadMonitoringConfig = DEFAULT_SPREAD_CONFIG) {
    this.config = config
    this.spreadHistory = new Map()
  }

  /**
   * Records spread data for historical tracking
   */
  recordSpread(loanId: string, spread: number): void {
    if (!this.spreadHistory.has(loanId)) {
      this.spreadHistory.set(loanId, [])
    }
    
    const history = this.spreadHistory.get(loanId)!
    history.push({
      timestamp: new Date().toISOString(),
      spread,
    })

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    
    const filtered = history.filter(
      (entry) => new Date(entry.timestamp) > cutoffDate
    )
    this.spreadHistory.set(loanId, filtered)
  }

  /**
   * Calculate baseline spread from historical data
   */
  private calculateBaselineSpread(loanId: string): number | null {
    const history = this.spreadHistory.get(loanId)
    if (!history || history.length < 5) {
      return null
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.baselineWindow)

    const relevantHistory = history.filter(
      (entry) => new Date(entry.timestamp) > cutoffDate
    )

    if (relevantHistory.length === 0) {
      return null
    }

    const sum = relevantHistory.reduce((acc, entry) => acc + entry.spread, 0)
    return sum / relevantHistory.length
  }

  /**
   * Analyze credit risk based on spread and loan characteristics
   */
  private analyzeCreditRisk(
    loan: Loan,
    spreadChange: number
  ): 'deteriorating' | 'stable' | 'improving' {
    const riskFactors = loan.riskFactors
    const avgRiskScore = (riskFactors.credit + riskFactors.market + riskFactors.operational) / 3

    if (spreadChange > 25 && avgRiskScore > 6) {
      return 'deteriorating'
    } else if (spreadChange > 10 && avgRiskScore > 5) {
      return 'deteriorating'
    } else if (spreadChange < -10) {
      return 'improving'
    }
    return 'stable'
  }

  /**
   * Assess market conditions based on portfolio-wide spread movements
   */
  private assessMarketConditions(
    loans: Loan[],
    currentSpread: number
  ): 'stressed' | 'normal' | 'favorable' {
    const loansWithPricing = loans.filter((l) => l.marketPricing?.creditSpread)
    if (loansWithPricing.length < 3) {
      return 'normal'
    }

    const avgPortfolioSpread =
      loansWithPricing.reduce((sum, l) => sum + (l.marketPricing?.creditSpread || 0), 0) /
      loansWithPricing.length

    const wideningCount = loansWithPricing.filter((l) => {
      const baseline = this.calculateBaselineSpread(l.id)
      if (!baseline) return false
      return (l.marketPricing?.creditSpread || 0) > baseline * 1.2
    }).length

    const wideningRatio = wideningCount / loansWithPricing.length

    if (wideningRatio > 0.5 || avgPortfolioSpread > 500) {
      return 'stressed'
    } else if (wideningRatio < 0.2 && avgPortfolioSpread < 200) {
      return 'favorable'
    }
    return 'normal'
  }

  /**
   * Determine severity based on spread widening magnitude
   */
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

    if (creditRisk === 'deteriorating' && baseSeverity !== 'critical') {
      const severityMap: Record<AlertSeverity, AlertSeverity> = {
        low: 'medium',
        medium: 'high',
        high: 'critical',
        critical: 'critical',
      }
      baseSeverity = severityMap[baseSeverity]
    }

    if (marketConditions === 'stressed' && creditRisk === 'deteriorating') {
      baseSeverity = 'critical'
    }

    return baseSeverity
  }

  /**
   * Check all loans for spread widening and generate alerts
   */
  checkSpreadWidening(loans: Loan[], existingAlerts: Alert[]): SpreadWidening[] {
    const widenings: SpreadWidening[] = []

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
          alert.status === 'active' &&
          this.isRecentAlert(alert.createdAt, 4)
      )

      if (isDuplicate) {
        continue
      }

      const creditRisk = this.analyzeCreditRisk(loan, spreadChangePercent)
      const marketConditions = this.assessMarketConditions(loans, currentSpread)
      const severity = this.determineSeverity(spreadChangePercent, creditRisk, marketConditions)

      widenings.push({
        loanId: loan.id,
        loanName: loan.borrowerName,
        currentSpread,
        previousSpread: baselineSpread,
        spreadChange,
        spreadChangePercent,
        timeWindow: `${this.config.baselineWindow} days`,
        severity,
        creditRiskIndicator: creditRisk,
        marketConditions,
      })
    }

    return widenings
  }

  /**
   * Generate alerts from spread widening detections
   */
  generateSpreadAlerts(widenings: SpreadWidening[]): Alert[] {
    const alerts: Alert[] = []

    for (const widening of widenings) {
      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'spread_widening',
        severity: widening.severity,
        status: 'active',
        loanId: widening.loanId,
        loanName: widening.loanName,
        title: this.generateAlertTitle(widening),
        message: this.generateAlertMessage(widening),
        details: {
          currentSpread: widening.currentSpread,
          previousSpread: widening.previousSpread,
          spreadChange: widening.spreadChange,
          spreadChangePercent: widening.spreadChangePercent,
          timeWindow: widening.timeWindow,
          creditRiskIndicator: widening.creditRiskIndicator,
          marketConditions: widening.marketConditions,
          recommendation: this.generateRecommendation(widening),
        },
        createdAt: new Date().toISOString(),
        emailSent: false,
      }

      alerts.push(alert)
    }

    return alerts
  }

  /**
   * Generate alert title based on severity
   */
  private generateAlertTitle(widening: SpreadWidening): string {
    const severityLabels: Record<AlertSeverity, string> = {
      low: 'Minor Spread Widening',
      medium: 'Moderate Spread Widening',
      high: 'Severe Spread Widening',
      critical: 'Critical Spread Widening - Immediate Action Required',
    }
    return severityLabels[widening.severity]
  }

  /**
   * Generate detailed alert message
   */
  private generateAlertMessage(widening: SpreadWidening): string {
    const direction = widening.creditRiskIndicator === 'deteriorating' ? 'deteriorating' : 'stable'
    const marketContext =
      widening.marketConditions === 'stressed'
        ? ' amid stressed market conditions'
        : widening.marketConditions === 'favorable'
        ? ' despite favorable market conditions'
        : ''

    return `Credit spread for ${widening.loanName} has widened by ${widening.spreadChangePercent.toFixed(
      1
    )}% (${widening.spreadChange.toFixed(0)}bps) over ${
      widening.timeWindow
    }${marketContext}. Credit risk appears ${direction}.`
  }

  /**
   * Generate actionable recommendation
   */
  private generateRecommendation(widening: SpreadWidening): string {
    if (widening.severity === 'critical') {
      return 'URGENT: Review credit exposure immediately. Consider hedging strategies, position reduction, or requesting additional collateral. Reassess credit rating and covenant compliance.'
    } else if (widening.severity === 'high') {
      return 'Conduct detailed credit review within 24 hours. Analyze borrower financials, industry trends, and covenant compliance. Prepare contingency plans.'
    } else if (widening.severity === 'medium') {
      return 'Schedule credit review within 48 hours. Monitor daily spread movements and stay informed of any news related to the borrower or sector.'
    } else {
      return 'Continue monitoring. Consider reaching out to the borrower for an update on business performance and market conditions.'
    }
  }

  /**
   * Check if alert is recent
   */
  private isRecentAlert(timestamp: string, hours: number): boolean {
    const now = Date.now()
    const alertTime = new Date(timestamp).getTime()
    const hoursSince = (now - alertTime) / (1000 * 60 * 60)
    return hoursSince < hours
  }

  /**
   * Get spread trend analysis for a loan
   */
  getSpreadTrend(loanId: string, days: number = 30): {
    trend: 'widening' | 'tightening' | 'stable'
    volatility: 'high' | 'medium' | 'low'
    avgSpread: number
    minSpread: number
    maxSpread: number
    dataPoints: number
  } | null {
    const history = this.spreadHistory.get(loanId)
    if (!history || history.length < 5) {
      return null
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const relevantHistory = history.filter(
      (entry) => new Date(entry.timestamp) > cutoffDate
    )

    if (relevantHistory.length < 5) {
      return null
    }

    const spreads = relevantHistory.map((h) => h.spread)
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length
    const minSpread = Math.min(...spreads)
    const maxSpread = Math.max(...spreads)

    const firstHalf = spreads.slice(0, Math.floor(spreads.length / 2))
    const secondHalf = spreads.slice(Math.floor(spreads.length / 2))
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

    const stdDev = Math.sqrt(
      spreads.reduce((sum, spread) => sum + Math.pow(spread - avgSpread, 2), 0) / spreads.length
    )
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
      trend,
      volatility,
      avgSpread,
      minSpread,
      maxSpread,
      dataPoints: relevantHistory.length,
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpreadMonitoringConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): SpreadMonitoringConfig {
    return { ...this.config }
  }
}

export const spreadAlertService = new SpreadAlertService()
