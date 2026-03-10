import { Loan } from './types'
import { Alert, AlertType, AlertSeverity } from './alertTypes'

export function checkLoansForAlerts(loans: Loan[], existingAlerts: Alert[] = []): Alert[] {
  const newAlerts: Alert[] = []
  const now = new Date()

  loans.forEach((loan) => {
    const alertsForLoan = checkLoanForAlerts(loan, now)
    
    alertsForLoan.forEach((alert) => {
      const isDuplicate = existingAlerts.some(
        (existing) =>
          existing.loanId === alert.loanId &&
          existing.type === alert.type &&
          existing.status === 'active' &&
          JSON.stringify(existing.details) === JSON.stringify(alert.details)
      )
      
      if (!isDuplicate) {
        newAlerts.push(alert)
      }
    })
  })

  return newAlerts
}

function checkLoanForAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  alerts.push(...checkCovenantAlerts(loan, now))
  alerts.push(...checkRiskAlerts(loan, now))
  alerts.push(...checkDefaultProbabilityAlerts(loan, now))
  alerts.push(...checkMaturityAlerts(loan, now))
  alerts.push(...checkComplianceAlerts(loan, now))
  alerts.push(...checkESGAlerts(loan, now))

  return alerts
}

function checkCovenantAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  loan.covenants.forEach((covenant) => {
    if (covenant.status === 'breached') {
      const percentageOver = ((covenant.currentValue - covenant.threshold) / covenant.threshold) * 100
      
      alerts.push({
        id: `${loan.id}-${covenant.id}-breach-${now.getTime()}`,
        type: 'covenant_breach',
        severity: 'critical',
        status: 'active',
        loanId: loan.id,
        loanName: loan.borrowerName,
        title: `Covenant Breach: ${covenant.type}`,
        message: `${loan.borrowerName} has breached the ${covenant.type} covenant. Current value: ${covenant.currentValue.toFixed(2)}, Threshold: ${covenant.threshold.toFixed(2)}`,
        details: {
          covenantId: covenant.id,
          covenantType: covenant.type,
          threshold: covenant.threshold,
          currentValue: covenant.currentValue,
          percentageOver: percentageOver.toFixed(1),
          loanAmount: loan.amount,
          currency: loan.currency,
        },
        createdAt: now.toISOString(),
        emailSent: false,
      })
    } else if (covenant.status === 'at-risk') {
      const percentageFromThreshold = ((covenant.currentValue - covenant.threshold) / covenant.threshold) * 100
      
      alerts.push({
        id: `${loan.id}-${covenant.id}-atrisk-${now.getTime()}`,
        type: 'covenant_at_risk',
        severity: 'high',
        status: 'active',
        loanId: loan.id,
        loanName: loan.borrowerName,
        title: `Covenant At Risk: ${covenant.type}`,
        message: `${loan.borrowerName}'s ${covenant.type} is approaching breach threshold. Current: ${covenant.currentValue.toFixed(2)}, Threshold: ${covenant.threshold.toFixed(2)}`,
        details: {
          covenantId: covenant.id,
          covenantType: covenant.type,
          threshold: covenant.threshold,
          currentValue: covenant.currentValue,
          percentageFromThreshold: percentageFromThreshold.toFixed(1),
        },
        createdAt: now.toISOString(),
        emailSent: false,
      })
    }
  })

  return alerts
}

function checkRiskAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  if (loan.riskLevel === 'critical') {
    alerts.push({
      id: `${loan.id}-critical-risk-${now.getTime()}`,
      type: 'critical_risk_loan',
      severity: 'critical',
      status: 'active',
      loanId: loan.id,
      loanName: loan.borrowerName,
      title: `Critical Risk Level: ${loan.borrowerName}`,
      message: `${loan.borrowerName} has reached a critical risk level (${loan.riskScore.toFixed(1)}/10). Immediate review recommended.`,
      details: {
        riskScore: loan.riskScore,
        riskLevel: loan.riskLevel,
        riskFactors: loan.riskFactors,
        amount: loan.amount,
        currency: loan.currency,
      },
      createdAt: now.toISOString(),
      emailSent: false,
    })
  } else if (loan.riskLevel === 'high') {
    alerts.push({
      id: `${loan.id}-high-risk-${now.getTime()}`,
      type: 'high_risk_loan',
      severity: 'high',
      status: 'active',
      loanId: loan.id,
      loanName: loan.borrowerName,
      title: `High Risk Level: ${loan.borrowerName}`,
      message: `${loan.borrowerName} is classified as high risk (${loan.riskScore.toFixed(1)}/10). Enhanced monitoring advised.`,
      details: {
        riskScore: loan.riskScore,
        riskLevel: loan.riskLevel,
        riskFactors: loan.riskFactors,
      },
      createdAt: now.toISOString(),
      emailSent: false,
    })
  }

  return alerts
}

function checkDefaultProbabilityAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  if (loan.predictiveAnalytics) {
    const { defaultProbability30d, defaultProbability90d } = loan.predictiveAnalytics

    if (defaultProbability30d > 0.10) {
      alerts.push({
        id: `${loan.id}-default-prob-${now.getTime()}`,
        type: 'default_probability_high',
        severity: 'critical',
        status: 'active',
        loanId: loan.id,
        loanName: loan.borrowerName,
        title: `High Default Probability: ${loan.borrowerName}`,
        message: `${loan.borrowerName} has a ${(defaultProbability30d * 100).toFixed(1)}% probability of default within 30 days.`,
        details: {
          probability30d: defaultProbability30d,
          probability90d: defaultProbability90d,
          amount: loan.amount,
          currency: loan.currency,
        },
        createdAt: now.toISOString(),
        emailSent: false,
      })
    }
  }

  return alerts
}

function checkMaturityAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []
  const maturityDate = new Date(loan.maturityDate)
  const daysUntilMaturity = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilMaturity > 0 && daysUntilMaturity <= 30) {
    alerts.push({
      id: `${loan.id}-maturity-${now.getTime()}`,
      type: 'maturity_approaching',
      severity: daysUntilMaturity <= 7 ? 'high' : 'medium',
      status: 'active',
      loanId: loan.id,
      loanName: loan.borrowerName,
      title: `Maturity Approaching: ${loan.borrowerName}`,
      message: `${loan.borrowerName} loan matures in ${daysUntilMaturity} days. Renewal or repayment planning required.`,
      details: {
        maturityDate: loan.maturityDate,
        daysUntilMaturity,
        amount: loan.amount,
        currency: loan.currency,
      },
      createdAt: now.toISOString(),
      emailSent: false,
    })
  }

  return alerts
}

function checkComplianceAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  if (loan.lmaCompliance) {
    const { level, gaps } = loan.lmaCompliance
    
    if (level === 'partial' && gaps.some((g) => g.severity === 'high')) {
      alerts.push({
        id: `${loan.id}-compliance-${now.getTime()}`,
        type: 'lma_compliance_gap',
        severity: 'medium',
        status: 'active',
        loanId: loan.id,
        loanName: loan.borrowerName,
        title: `LMA Compliance Gap: ${loan.borrowerName}`,
        message: `${loan.borrowerName} has high-severity LMA compliance gaps requiring attention.`,
        details: {
          complianceLevel: level,
          gaps: gaps.filter((g) => g.severity === 'high'),
        },
        createdAt: now.toISOString(),
        emailSent: false,
      })
    }
  }

  return alerts
}

function checkESGAlerts(loan: Loan, now: Date): Alert[] {
  const alerts: Alert[] = []

  if (loan.esgScore.overall === 'D' || loan.esgScore.overall === 'F') {
    alerts.push({
      id: `${loan.id}-esg-${now.getTime()}`,
      type: 'esg_score_downgrade',
      severity: 'low',
      status: 'active',
      loanId: loan.id,
      loanName: loan.borrowerName,
      title: `Low ESG Score: ${loan.borrowerName}`,
      message: `${loan.borrowerName} has a ${loan.esgScore.overall} ESG rating, indicating sustainability concerns.`,
      details: {
        esgRating: loan.esgScore.overall,
        environmental: loan.esgScore.environmental,
        social: loan.esgScore.social,
        governance: loan.esgScore.governance,
      },
      createdAt: now.toISOString(),
      emailSent: false,
    })
  }

  return alerts
}

export function generateEmailContent(alert: Alert): { subject: string; body: string } {
  const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`
  
  const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .alert-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
    .critical { background-color: #dc2626; }
    .high { background-color: #ea580c; }
    .medium { background-color: #d97706; }
    .low { background-color: #65a30d; }
    .content { background: #ffffff; padding: 30px; border-left: 4px solid #3b82f6; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    .details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .details-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #6b7280; }
    .value { color: #1f2937; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="alert-badge ${alert.severity}">${alert.severity} Alert</div>
      <h1 style="margin: 10px 0; font-size: 24px;">${alert.title}</h1>
      <p style="margin: 10px 0; opacity: 0.9;">${alert.loanName}</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">${alert.message}</p>
      
      <div class="details">
        <h3 style="margin-top: 0; color: #1f2937;">Alert Details</h3>
        ${generateDetailsHTML(alert)}
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Alert Time:</strong> ${new Date(alert.createdAt).toLocaleString('en-US', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}
      </p>
      
      <a href="#" class="cta-button">View in NovaFlow AI</a>
      
      <p style="color: #6b7280; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <strong>Recommended Actions:</strong><br>
        ${getRecommendedActions(alert)}
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated alert from NovaFlow AI</p>
      <p>To manage your alert preferences, visit your dashboard settings</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return { subject, body }
}

function generateDetailsHTML(alert: Alert): string {
  const details = alert.details
  let html = ''

  Object.entries(details).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    let displayValue = value

    if (typeof value === 'number') {
      if (key.includes('probability') || key.includes('Probability')) {
        displayValue = `${(value * 100).toFixed(1)}%`
      } else if (key === 'amount') {
        const currency = details.currency || 'USD'
        displayValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(value)
      } else {
        displayValue = value.toFixed(2)
      }
    } else if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value, null, 2)
    }

    html += `
      <div class="details-row">
        <span class="label">${label}:</span>
        <span class="value">${displayValue}</span>
      </div>
    `
  })

  return html
}

function getRecommendedActions(alert: Alert): string {
  const actions: Record<AlertType, string> = {
    covenant_breach: '• Immediately contact borrower to discuss breach<br>• Review loan agreement for cure periods and remedies<br>• Assess impact on overall risk profile<br>• Consider increasing monitoring frequency',
    covenant_at_risk: '• Schedule call with borrower to review financial position<br>• Request updated financial statements<br>• Evaluate potential covenant amendment<br>• Monitor weekly until status improves',
    high_risk_loan: '• Review comprehensive risk assessment<br>• Increase reporting frequency from borrower<br>• Consider requesting additional collateral<br>• Evaluate position sizing in portfolio',
    critical_risk_loan: '• Immediate senior management escalation required<br>• Convene credit committee meeting<br>• Assess all available remedies and protections<br>• Consider hedging strategies or position reduction',
    default_probability_high: '• Engage restructuring advisors<br>• Assess security position and recovery scenarios<br>• Review cross-default provisions<br>• Prepare contingency plans',
    maturity_approaching: '• Contact borrower regarding refinancing plans<br>• Review repayment capacity and intentions<br>• Prepare extension documentation if needed<br>• Assess market conditions for refinancing',
    lma_compliance_gap: '• Schedule legal review of documentation gaps<br>• Prepare amendment proposals<br>• Assess materiality of compliance issues<br>• Document remediation timeline',
    esg_score_downgrade: '• Review ESG improvement plan with borrower<br>• Assess alignment with internal ESG policies<br>• Consider impact on pricing and terms<br>• Document sustainability action items',
    price_above_threshold: '• Review pricing model and market conditions<br>• Consider selling position if target reached<br>• Reassess valuation assumptions<br>• Document pricing rationale',
    price_below_threshold: '• Investigate reasons for price decline<br>• Review loan fundamentals and credit quality<br>• Assess if buying opportunity exists<br>• Update risk assessment',
    price_spike: '• Analyze market drivers of price movement<br>• Review comparable loan pricing<br>• Consider profit-taking opportunities<br>• Reassess fair value estimate',
    price_drop: '• Conduct immediate credit review<br>• Assess market sentiment and news flow<br>• Review position size and risk limits<br>• Engage with borrower if needed',
    spread_widening: '• Monitor credit fundamentals for deterioration<br>• Review sector-wide trends<br>• Assess liquidity in secondary market<br>• Consider hedging strategies',
    spread_tightening: '• Document improved credit profile<br>• Review pricing relative to peers<br>• Assess refinancing opportunities<br>• Update valuation models',
  }

  return actions[alert.type] || '• Review loan details in dashboard<br>• Assess required actions<br>• Update monitoring plan'
}

export function generateDigestEmail(alerts: Alert[], period: string): { subject: string; body: string } {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const highCount = alerts.filter((a) => a.severity === 'high').length
  const subject = `NovaFlow AI Alert Digest: ${criticalCount} Critical, ${highCount} High Priority (${period})`

  const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .summary-card { flex: 1; background: #f9fafb; padding: 15px; border-radius: 6px; text-align: center; }
    .summary-number { font-size: 32px; font-weight: bold; margin: 5px 0; }
    .alert-item { background: white; border: 1px solid #e5e7eb; border-left: 4px solid; padding: 20px; margin: 10px 0; border-radius: 6px; }
    .critical-border { border-left-color: #dc2626; }
    .high-border { border-left-color: #ea580c; }
    .medium-border { border-left-color: #d97706; }
    .low-border { border-left-color: #65a30d; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Alert Digest</h1>
      <p style="margin: 10px 0; opacity: 0.9;">${period}</p>
    </div>
    
    <div style="background: white; padding: 30px;">
      <div class="summary">
        <div class="summary-card">
          <div class="summary-number" style="color: #dc2626;">${criticalCount}</div>
          <div style="color: #6b7280; font-size: 13px;">Critical</div>
        </div>
        <div class="summary-card">
          <div class="summary-number" style="color: #ea580c;">${highCount}</div>
          <div style="color: #6b7280; font-size: 13px;">High</div>
        </div>
        <div class="summary-card">
          <div class="summary-number" style="color: #d97706;">${alerts.filter((a) => a.severity === 'medium').length}</div>
          <div style="color: #6b7280; font-size: 13px;">Medium</div>
        </div>
        <div class="summary-card">
          <div class="summary-number" style="color: #65a30d;">${alerts.filter((a) => a.severity === 'low').length}</div>
          <div style="color: #6b7280; font-size: 13px;">Low</div>
        </div>
      </div>
      
      <h2 style="color: #1f2937; margin-top: 30px;">Alert Details</h2>
      
      ${alerts
        .sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        })
        .map(
          (alert) => `
        <div class="alert-item ${alert.severity}-border">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div>
              <span class="badge" style="background: ${
                alert.severity === 'critical'
                  ? '#dc2626'
                  : alert.severity === 'high'
                  ? '#ea580c'
                  : alert.severity === 'medium'
                  ? '#d97706'
                  : '#65a30d'
              }; color: white;">${alert.severity}</span>
              <h3 style="margin: 10px 0 5px 0; color: #1f2937; font-size: 16px;">${alert.title}</h3>
            </div>
          </div>
          <p style="color: #4b5563; margin: 10px 0;">${alert.message}</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
            ${new Date(alert.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      `
        )
        .join('')}
      
      <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 30px 0;">
        View All Alerts in Dashboard
      </a>
    </div>
    
    <div class="footer">
      <p>This is an automated digest from NovaFlow AI</p>
      <p>To manage your digest preferences, visit your dashboard settings</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return { subject, body }
}
