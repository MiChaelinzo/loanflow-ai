export type AlertType = 
  | 'covenant_breach'
  | 'covenant_at_risk'
  | 'high_risk_loan'
  | 'critical_risk_loan'
  | 'default_probability_high'
  | 'maturity_approaching'
  | 'lma_compliance_gap'
  | 'esg_score_downgrade'
  | 'price_above_threshold'
  | 'price_below_threshold'
  | 'price_spike'
  | 'price_drop'
  | 'spread_widening'
  | 'spread_tightening'

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed'

export interface AlertPreferences {
  enabled: boolean
  emailAddress: string
  alertTypes: {
    [K in AlertType]: {
      enabled: boolean
      emailEnabled: boolean
      severity: AlertSeverity
    }
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  digestEnabled: boolean
  digestFrequency: 'daily' | 'weekly'
  digestTime: string
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  loanId: string
  loanName: string
  title: string
  message: string
  details: Record<string, any>
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  emailSent: boolean
  emailSentAt?: string
}

export interface AlertDigest {
  id: string
  period: string
  generatedAt: string
  alerts: Alert[]
  emailSent: boolean
}

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  enabled: true,
  emailAddress: '',
  alertTypes: {
    covenant_breach: {
      enabled: true,
      emailEnabled: true,
      severity: 'critical',
    },
    covenant_at_risk: {
      enabled: true,
      emailEnabled: true,
      severity: 'high',
    },
    high_risk_loan: {
      enabled: true,
      emailEnabled: true,
      severity: 'high',
    },
    critical_risk_loan: {
      enabled: true,
      emailEnabled: true,
      severity: 'critical',
    },
    default_probability_high: {
      enabled: true,
      emailEnabled: true,
      severity: 'high',
    },
    maturity_approaching: {
      enabled: true,
      emailEnabled: false,
      severity: 'medium',
    },
    lma_compliance_gap: {
      enabled: true,
      emailEnabled: false,
      severity: 'medium',
    },
    esg_score_downgrade: {
      enabled: true,
      emailEnabled: false,
      severity: 'low',
    },
    price_above_threshold: {
      enabled: true,
      emailEnabled: true,
      severity: 'medium',
    },
    price_below_threshold: {
      enabled: true,
      emailEnabled: true,
      severity: 'medium',
    },
    price_spike: {
      enabled: true,
      emailEnabled: true,
      severity: 'high',
    },
    price_drop: {
      enabled: true,
      emailEnabled: true,
      severity: 'high',
    },
    spread_widening: {
      enabled: true,
      emailEnabled: true,
      severity: 'medium',
    },
    spread_tightening: {
      enabled: true,
      emailEnabled: false,
      severity: 'low',
    },
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  digestEnabled: false,
  digestFrequency: 'daily',
  digestTime: '09:00',
}
