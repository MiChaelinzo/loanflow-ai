import { Alert, AlertType, AlertSeverity, AlertStatus } from './alertTypes'

const SAMPLE_BORROWERS = [
  'TechCorp Industries',
  'Global Manufacturing Ltd',
  'Renewable Energy Solutions',
  'Continental Logistics Corp',
  'Metro Healthcare Systems',
  'Advanced Materials Group',
  'Digital Services Inc',
  'Industrial Holdings LLC',
]

const ALERT_CONFIGS: Array<{
  type: AlertType
  severity: AlertSeverity
  titleTemplate: string
  messageTemplate: string
}> = [
  {
    type: 'covenant_breach',
    severity: 'critical',
    titleTemplate: 'Covenant Breach: Debt Service Coverage Ratio',
    messageTemplate: '{borrower} has breached the Debt Service Coverage Ratio covenant. Current value: 1.08, Threshold: 1.25',
  },
  {
    type: 'covenant_at_risk',
    severity: 'high',
    titleTemplate: 'Covenant At Risk: Leverage Ratio',
    messageTemplate: '{borrower}\'s Leverage Ratio is approaching breach threshold. Current: 3.8, Threshold: 4.0',
  },
  {
    type: 'high_risk_loan',
    severity: 'high',
    titleTemplate: 'High Risk Loan Detected',
    messageTemplate: '{borrower} loan has elevated risk score of 7.2. Recommend enhanced monitoring.',
  },
  {
    type: 'critical_risk_loan',
    severity: 'critical',
    titleTemplate: 'Critical Risk Loan',
    messageTemplate: '{borrower} loan has reached critical risk level (8.5). Immediate action required.',
  },
  {
    type: 'default_probability_high',
    severity: 'high',
    titleTemplate: 'High Default Probability',
    messageTemplate: '{borrower} shows 12.5% probability of default in next 30 days based on predictive models.',
  },
  {
    type: 'maturity_approaching',
    severity: 'medium',
    titleTemplate: 'Loan Maturity Approaching',
    messageTemplate: '{borrower} loan matures in 18 days. Prepare renewal or payoff procedures.',
  },
  {
    type: 'lma_compliance_gap',
    severity: 'medium',
    titleTemplate: 'LMA Compliance Gap',
    messageTemplate: '{borrower} loan documentation has 3 deviations from LMA standard templates.',
  },
  {
    type: 'esg_score_downgrade',
    severity: 'low',
    titleTemplate: 'ESG Score Downgrade',
    messageTemplate: '{borrower} ESG rating downgraded from B to C due to governance concerns.',
  },
]

function generateAlertForConfig(
  config: typeof ALERT_CONFIGS[0],
  borrower: string,
  loanId: string,
  daysAgo: number,
  status: AlertStatus = 'active',
  acknowledgedAfterDays?: number,
  resolvedAfterDays?: number
): Alert {
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  const alert: Alert = {
    id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: config.type,
    severity: config.severity,
    status,
    loanId,
    loanName: borrower,
    title: config.titleTemplate,
    message: config.messageTemplate.replace('{borrower}', borrower),
    details: {
      generatedForDemo: true,
      daysAgo,
    },
    createdAt: createdAt.toISOString(),
    emailSent: Math.random() > 0.3,
  }

  if (acknowledgedAfterDays !== undefined && status !== 'active') {
    alert.acknowledgedAt = new Date(
      createdAt.getTime() + acknowledgedAfterDays * 24 * 60 * 60 * 1000
    ).toISOString()
  }

  if (resolvedAfterDays !== undefined && status === 'resolved') {
    alert.resolvedAt = new Date(
      createdAt.getTime() + resolvedAfterDays * 24 * 60 * 60 * 1000
    ).toISOString()
  }

  if (alert.emailSent) {
    alert.emailSentAt = new Date(createdAt.getTime() + 5 * 60 * 1000).toISOString()
  }

  return alert
}

export function generateSampleAlerts(): Alert[] {
  const alerts: Alert[] = []
  const now = Date.now()

  for (let day = 0; day < 30; day++) {
    const alertsForDay = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < alertsForDay; i++) {
      const config = ALERT_CONFIGS[Math.floor(Math.random() * ALERT_CONFIGS.length)]
      const borrower = SAMPLE_BORROWERS[Math.floor(Math.random() * SAMPLE_BORROWERS.length)]
      const loanId = `LOAN-${Math.floor(Math.random() * 10000)}`

      let status: AlertStatus = 'active'
      let acknowledgedAfterDays: number | undefined
      let resolvedAfterDays: number | undefined

      const rand = Math.random()
      if (day > 5) {
        if (rand < 0.4) {
          status = 'resolved'
          acknowledgedAfterDays = Math.floor(Math.random() * 3) + 1
          resolvedAfterDays = acknowledgedAfterDays + Math.floor(Math.random() * 5) + 2
        } else if (rand < 0.6) {
          status = 'acknowledged'
          acknowledgedAfterDays = Math.floor(Math.random() * 3) + 1
        } else if (rand < 0.7) {
          status = 'dismissed'
        }
      } else if (day > 2 && rand < 0.3) {
        status = 'acknowledged'
        acknowledgedAfterDays = Math.floor(Math.random() * 2) + 1
      }

      alerts.push(
        generateAlertForConfig(
          config,
          borrower,
          loanId,
          day,
          status,
          acknowledgedAfterDays,
          resolvedAfterDays
        )
      )
    }
  }

  const criticalAlerts = [
    generateAlertForConfig(
      ALERT_CONFIGS[0],
      'TechCorp Industries',
      'LOAN-1001',
      1,
      'active'
    ),
    generateAlertForConfig(
      ALERT_CONFIGS[3],
      'Global Manufacturing Ltd',
      'LOAN-1002',
      0,
      'active'
    ),
    generateAlertForConfig(
      ALERT_CONFIGS[0],
      'Metro Healthcare Systems',
      'LOAN-1003',
      2,
      'acknowledged',
      1
    ),
  ]

  return [...alerts, ...criticalAlerts]
}
