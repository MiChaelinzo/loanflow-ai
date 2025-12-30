import { Loan, PriceAlertThreshold, Alert, AlertSeverity } from './types'

export interface PriceAlertCheck {
  loanId: string
  triggeredAlerts: Alert[]
}

export class PriceAlertService {
  /**
   * Checks a list of loans against defined thresholds to generate alerts.
   */
  checkPriceAlerts(
    loans: Loan[], 
    thresholds: PriceAlertThreshold[], 
    existingAlerts: Alert[]
  ): PriceAlertCheck[] {
    const results: PriceAlertCheck[] = []

    for (const loan of loans) {
      const triggeredAlerts: Alert[] = []
      const currentPrice = loan.marketPricing?.lastPrice || 0
      const priceChangePercent = loan.marketPricing?.priceChangePercent24h || 0
      const currentSpread = loan.marketPricing?.bidAskSpread || 0

      for (const threshold of thresholds) {
        if (!threshold.enabled) continue

        let shouldTrigger = false
        let alertType: Alert['type'] | null = null
        let alertMessage = ''
        let severity: AlertSeverity = 'medium'

        switch (threshold.type) {
          case 'price_above':
            if (currentPrice > threshold.value) {
              shouldTrigger = true
              alertType = 'price_above_threshold'
              alertMessage = `Price exceeded threshold of ${this.formatCurrency(threshold.value, loan.currency)}`
              severity = 'medium'
            }
            break

          case 'price_below':
            if (currentPrice < threshold.value) {
              shouldTrigger = true
              alertType = 'price_below_threshold'
              alertMessage = `Price fell below threshold of ${this.formatCurrency(threshold.value, loan.currency)}`
              severity = 'high'
            }
            break

          case 'spread_above':
            if (currentSpread > threshold.value) {
              shouldTrigger = true
              alertType = 'spread_above_threshold'
              alertMessage = `Bid-Ask spread widened to ${currentSpread.toFixed(2)}%`
              severity = 'warning'
            }
            break

          case 'price_change_percent':
            if (Math.abs(priceChangePercent) > threshold.value) {
              shouldTrigger = true
              alertType = 'volatility_alert'
              alertMessage = `24h Price movement of ${priceChangePercent.toFixed(2)}% detected`
              severity = 'medium'
            }
            break
        }

        if (shouldTrigger && alertType) {
          // Check if we recently alerted on this to avoid spam
          const isDuplicate = existingAlerts.some(
            (a) =>
              a.loanId === loan.id &&
              a.type === alertType &&
              this.isRecentAlert(a.timestamp)
          )

          if (!isDuplicate) {
            const alert: Alert = {
              id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: alertType,
              severity: severity,
              status: 'active',
              loanId: loan.id,
              loanName: loan.borrowerName,
              message: alertMessage,
              timestamp: new Date().toISOString(),
              metadata: {
                thresholdValue: threshold.value,
                currentValue: currentPrice,
                currentSpread: currentSpread,
                note: threshold.note,
              }
            }
            triggeredAlerts.push(alert)
          }
        }
      }

      if (triggeredAlerts.length > 0) {
        results.push({
          loanId: loan.id,
          triggeredAlerts
        })
      }
    }

    return results
  }

  /**
   * Helper to determine if an alert is recent (e.g., within last 24 hours)
   */
  private isRecentAlert(timestamp: string): boolean {
    const now = Date.now()
    const alertTime = new Date(timestamp).getTime()
    const hoursSince = (now - alertTime) / (1000 * 60 * 60)
    return hoursSince < 24
  }

  /**
   * Helper to format currency
   */
  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Generates default thresholds for a loan
   */
  generateDefaultThresholds(loan: Loan): PriceAlertThreshold[] {
    return [
      {
        id: `ALERT-${loan.id}-PRICE-HIGH`,
        type: 'price_above',
        value: 105.00,
        enabled: true,
        createdAt: new Date().toISOString(),
        note: 'High price target'
      },
      {
        id: `ALERT-${loan.id}-PRICE-LOW`,
        type: 'price_below',
        value: 95.00,
        enabled: true,
        createdAt: new Date().toISOString(),
        note: 'Stop loss warning'
      },
      {
        id: `ALERT-${loan.id}-SPREAD-HIGH`,
        type: 'spread_above',
        value: 2.0, // 2% spread
        enabled: true,
        createdAt: new Date().toISOString(),
        note: 'Liquidity warning'
      },
      {
        id: `ALERT-${loan.id}-VOLATILITY`,
        type: 'price_change_percent',
        value: 5.0, // 5% move
        enabled: true,
        createdAt: new Date().toISOString(),
        note: 'High volatility detected'
      }
    ]
  }
}

export const priceAlertService = new PriceAlertService()