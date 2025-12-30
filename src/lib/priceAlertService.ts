import { Loan, PriceAlertThreshold } from './types'
import { Alert, AlertSeverity } from './alertTypes'

export interface PriceAlertCheck {
  loan: Loan
  triggeredAlerts: Alert[]
}

class PriceAlertService {
  checkPriceAlerts(loans: Loan[], existingAlerts: Alert[]): PriceAlertCheck[] {
    const results: PriceAlertCheck[] = []

    for (const loan of loans) {
      if (!loan.marketPricing || !loan.priceAlerts || loan.priceAlerts.length === 0) {
        continue
      }

      const triggeredAlerts: Alert[] = []
      const currentPrice = loan.marketPricing.currentPrice
      const currentSpread = loan.marketPricing.spread
      const priceChangePercent = loan.marketPricing.priceChangePercent24h

      for (const threshold of loan.priceAlerts) {
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
              alertType = 'spread_widening'
              alertMessage = `Spread widened above ${threshold.value} bps`
              severity = 'high'
            }
            break

          case 'spread_below':
            if (currentSpread < threshold.value) {
              shouldTrigger = true
              alertType = 'spread_tightening'
              alertMessage = `Spread tightened below ${threshold.value} bps`
              severity = 'low'
            }
            break

          case 'price_change_percent':
            if (Math.abs(priceChangePercent) > threshold.value) {
              shouldTrigger = true
              alertType = priceChangePercent > 0 ? 'price_spike' : 'price_drop'
              alertMessage = priceChangePercent > 0
                ? `Price spiked ${priceChangePercent.toFixed(2)}% in 24h`
                : `Price dropped ${Math.abs(priceChangePercent).toFixed(2)}% in 24h`
              severity = 'high'
            }
            break
        }

        if (shouldTrigger && alertType) {
          const existingAlert = existingAlerts.find(
            (a) =>
              a.loanId === loan.id &&
              a.type === alertType &&
              a.status === 'active' &&
              this.isRecentAlert(a.createdAt)
          )

          if (!existingAlert) {
            const alert: Alert = {
              id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: alertType,
              severity,
              status: 'active',
              loanId: loan.id,
              loanName: loan.borrowerName,
              title: `Price Alert: ${loan.borrowerName}`,
              message: alertMessage,
              details: {
                thresholdId: threshold.id,
                thresholdType: threshold.type,
                thresholdValue: threshold.value,
                currentPrice,
                currentSpread,
                priceChangePercent,
                note: threshold.note,
              },
              createdAt: new Date().toISOString(),
              emailSent: false,
            }

            triggeredAlerts.push(alert)
          }
        }
      }

      if (triggeredAlerts.length > 0) {
        results.push({
          loan,
          triggeredAlerts,
        })
      }
    }

    return results
  }

  private isRecentAlert(createdAt: string): boolean {
    const alertTime = new Date(createdAt).getTime()
    const now = Date.now()
    const hoursSinceAlert = (now - alertTime) / (1000 * 60 * 60)
    return hoursSinceAlert < 24
  }

  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  createDefaultAlerts(loan: Loan): PriceAlertThreshold[] {
    if (!loan.marketPricing) return []

    const currentPrice = loan.marketPricing.currentPrice
    const currentSpread = loan.marketPricing.spread

    return [
      {
        id: `ALERT-${loan.id}-PRICE-HIGH`,
        loanId: loan.id,
        type: 'price_above',
        value: currentPrice * 1.05,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Alert when price increases 5%',
      },
      {
        id: `ALERT-${loan.id}-PRICE-LOW`,
        loanId: loan.id,
        type: 'price_below',
        value: currentPrice * 0.95,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Alert when price decreases 5%',
      },
      {
        id: `ALERT-${loan.id}-SPREAD-HIGH`,
        loanId: loan.id,
        type: 'spread_above',
        value: currentSpread + 50,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Alert when spread widens by 50 bps',
      },
      {
        id: `ALERT-${loan.id}-PRICE-CHANGE`,
        loanId: loan.id,
        type: 'price_change_percent',
        value: 3,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Alert when price changes more than 3% in 24h',
      },
    ]
  }
}

export const priceAlertService = new PriceAlertService()
