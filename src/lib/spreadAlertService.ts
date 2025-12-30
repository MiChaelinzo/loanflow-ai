import { Loan, MarketPricing } from './types'
import { Alert, AlertSeverity } from './alertTypes'

export interface SpreadWidening {
  loanId: string
  loanName: string
  spreadChange: number
  timeWindow: string
  creditRiskIndicator:
}
export interface Spr
  moderateWideningThresho
  creditRiskIndicator: 'deteriorating' | 'stable' | 'improving'
  marketConditions: 'stressed' | 'normal' | 'favorable'
 

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
  private spreadHistory: Map<
  constructor(config: SpreadMoni
    this.spreadHistory = new M

   * Records spread 
  recordSpread(loanId: strin
      this.spreadHistory.set(loan
 

      spread,

    cutoffDate.setDate(cutoffDate.getDate() - 30)

    )
  }
  /**
   

     

    c
    const relevantHistory = history.filter(
    )
    if (relevantHistory.length === 0) {
    }
    
  }
  /**
   */
    loan: Loa
  ): '

    if (spreadChange > 25 && avgR
    } else if (spreadChange > 10 && avgRiskScore 
    
    }
  }
  /**
   */
   

    i
    }
    c
      loansWithPricing.length
    const wideningCount = loansWithPricing.filter(
      if (!baseline) return false
    }).length
    c

    } else if (wideningRatio < 0.
    }

  /**
   */
    s

    let baseSeverity: AlertSeverity = '
    if (spreadCha
    }

    } else if (spreadChangePercent >= this.config.minorWideningThreshold) {
    }
   

     
      }
    }
    if (marketConditions ===
    }
    return baseSeverity

   * Check all loans for spread widening
  checkSpreadWidening(loans: Loan[], existingAlerts: Alert[]): SpreadWidening[] {

      if (!loan.marketPricing?.creditSpread) {
      }
      const currentSpread = loan.marketPricing.creditSp
      this.recordSpread(loan
      const baselineSpread = this.ca
        continue

      const spreadC
   

     
          alert.loanId === loan.id &&
     
      )
      if (isDuplic
      }
      const creditRisk = this.analyzeCredi
      const severity = this.determineSeverity(spreadChangePercent, creditRisk, 
      widenings.push({
        loanName: loa
     

        severity,
        marketConditions,
    }


   * Generate alerts from spread widening detections
  generateSpreadAlerts(widenings:

      const a

        status: 'active',

        message: this.generateAlertMessage(widening),
          currentSpread
          spreadChange: widening.spreadChange,
          timeWindow: wi
     
        },
   

    }
    return alerts

   * Generate alert title ba
  private generateAlertTitle(wid
      low: 'Minor Spread Widening',
      high: 'Severe Spread Widening',
    }
  }

   */
    const direction = widening.
      widening.marketConditions === 'stressed'
        : widening.marketCo
        : ''
    return `Credit spread for
    )}% (${widening.spreadChange.toFixed(0)}bps) over ${
    }${marketContext}. Cre


  private generateRecommendation(widening: SpreadWidening): string {
      return 'URGENT: Review credit exposure immediately. Conside
      return 'Conduct 
      return 'Schedule 
      return 'Continue mo
  }
  /**
   */
    c

  }
  /**
   */

    avgSpread: number
   

    i
    }
    c

      (entry) => new Date(entry.timestamp)

      return null

    const avgSpr
    con

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) /



    } else if (trendPercent < -10) {
    } else {
    }
    con


    if (coefficientOfVariation > 20) {

    } else {
    }
    ret

      minSpread,
      dataPoints: 
  }
  /**
   */
    this.config = { ...this.config, ...config }


  getConfig(): SpreadMon
  }












































































































































































































