import { Loan, PriceAlertThreshold } from './types'
import { Alert, AlertSeverity } from './alertTypes'

export interface PriceAlertCheck {
  loanId: string
  triggeredAlerts: Alert[]
}

export class PriceAlertService {
  checkPriceAlerts(
    loans: Loan[], 
    alerts: Alert[]
  ): PriceAlertCheck[] {
    const results: PriceAlertCheck[] = []

    for (const loan of loans) {
      const triggeredAlerts: Alert[] = []
      const currentPrice = loan.marketPricing?.currentPrice || 0
      const priceChangePercent = loan.marketPricing?.priceChangePercent24h || 0
      const currentSpread = loan.marketPricing?.spread || 0
      const thresholds = loan.priceAlerts || []

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
              alertType = 'spread_widening'
              alertMessage = `Spread widened to ${currentSpread.toFixed(2)} bps`
              severity = 'medium'
            }
            break

          case 'price_change_percent':
            if (Math.abs(priceChangePercent) > threshold.value) {
              shouldTrigger = true
              alertType = priceChangePercent > 0 ? 'price_spike' : 'price_drop'
              alertMessage = `24h Price movement of ${priceChangePercent.toFixed(2)}% detected`
              severity = 'medium'
            }
            break
        }

        if (shouldTrigger && alertType) {
          const isDuplicate = alerts.some(
            (a) =>
              a.loanId === loan.id &&
              a.type === alertType &&
              this.isRecentAlert(a.createdAt)
          )

          if (!isDuplicate) {
            const alert: Alert = {
              id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: alertType,
              severity: severity,
              status: 'active',
              loanId: loan.id,
              loanName: loan.borrowerName,
              title: alertType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              message: alertMessage,
              details: {
                thresholdValue: threshold.value,
                currentValue: currentPrice,
                currentSpread: currentSpread,
                note: threshold.note,
              },
              createdAt: new Date().toISOString(),
              emailSent: false
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

  private isRecentAlert(timestamp: string): boolean {
    const now = Date.now()
    const alertTime = new Date(timestamp).getTime()
    const hoursSince = (now - alertTime) / (1000 * 60 * 60)
    return hoursSince < 24
  }

  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(value)
  }

  generateDefaultThresholds(loan: Loan): PriceAlertThreshold[] {
    return [
      {
        id: `ALERT-${loan.id}-PRICE-HIGH`,
        loanId: loan.id,
        type: 'price_above',
        value: 105.00,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'High price target'
      },
      {
        id: `ALERT-${loan.id}-PRICE-LOW`,
        loanId: loan.id,
        type: 'price_below',
        value: 95.00,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Stop loss warning'
      },
      {
        id: `ALERT-${loan.id}-SPREAD-HIGH`,
        loanId: loan.id,
        type: 'spread_above',
        value: 2.0,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'Liquidity warning'
      },
      {
        id: `ALERT-${loan.id}-VOLATILITY`,
        loanId: loan.id,
        type: 'price_change_percent',
        value: 5.0,
        enabled: true,
        triggered: false,
        createdAt: new Date().toISOString(),
        note: 'High volatility detected'
      }
    ]
  }
}

export const priceAlertService = new PriceAlertService()