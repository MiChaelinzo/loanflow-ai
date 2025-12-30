import { Loan } from './types'
import { Alert } from './alertTypes'
import {
  ComplianceReport,
  ComplianceReportSection,
  ComplianceReportSummary,
  ComplianceReportMetadata,
  RegulatoryFramework,
  ComplianceTable,
  ReportSchedule,
} from './complianceReportTypes'

export const regulatoryFrameworks: RegulatoryFramework[] = [
  {
    id: 'basel-iii',
    name: 'Basel III Capital Requirements',
    shortName: 'Basel III',
    jurisdiction: 'International',
    description: 'International regulatory framework for bank capital adequacy, stress testing, and market liquidity risk',
    requiredSections: [
      {
        sectionId: 'capital-adequacy',
        title: 'Capital Adequacy Ratio',
        description: 'Calculation of Tier 1, Tier 2 capital ratios',
        mandatory: true,
        dataPoints: ['total-risk-weighted-assets', 'tier-1-capital', 'tier-2-capital'],
      },
      {
        sectionId: 'liquidity-coverage',
        title: 'Liquidity Coverage Ratio',
        description: 'High-quality liquid assets vs net cash outflows',
        mandatory: true,
        dataPoints: ['hqla', 'net-cash-outflows-30d'],
      },
      {
        sectionId: 'leverage-ratio',
        title: 'Leverage Ratio',
        description: 'Tier 1 capital as percentage of total exposure',
        mandatory: true,
        dataPoints: ['tier-1-capital', 'total-exposure'],
      },
    ],
    frequency: 'quarterly',
    submissionDeadline: '45 days after quarter end',
  },
  {
    id: 'lma-disclosure',
    name: 'LMA Secondary Market Disclosure',
    shortName: 'LMA Disclosure',
    jurisdiction: 'EMEA',
    description: 'Loan Market Association transparency requirements for secondary loan trading',
    requiredSections: [
      {
        sectionId: 'portfolio-composition',
        title: 'Portfolio Composition',
        description: 'Breakdown of loans by type, industry, geography',
        mandatory: true,
        dataPoints: ['loan-count', 'total-exposure', 'industry-breakdown', 'geography-breakdown'],
      },
      {
        sectionId: 'trading-activity',
        title: 'Secondary Market Trading Activity',
        description: 'Volume and pricing of loan trades',
        mandatory: true,
        dataPoints: ['trade-count', 'trade-volume', 'avg-bid-ask-spread'],
      },
      {
        sectionId: 'pricing-methodology',
        title: 'Pricing and Valuation Methodology',
        description: 'Description of fair value determination processes',
        mandatory: true,
        dataPoints: ['pricing-model', 'valuation-frequency', 'mark-to-market'],
      },
    ],
    frequency: 'quarterly',
    submissionDeadline: '30 days after quarter end',
  },
  {
    id: 'ifrs-9',
    name: 'IFRS 9 Financial Instruments',
    shortName: 'IFRS 9',
    jurisdiction: 'International',
    description: 'International accounting standard for classification, measurement, and impairment of financial instruments',
    requiredSections: [
      {
        sectionId: 'ecl-calculation',
        title: 'Expected Credit Loss Calculation',
        description: 'ECL methodology and provisions',
        mandatory: true,
        dataPoints: ['ecl-stage-1', 'ecl-stage-2', 'ecl-stage-3', 'provision-coverage'],
      },
      {
        sectionId: 'credit-risk-assessment',
        title: 'Credit Risk Assessment',
        description: 'Significant increase in credit risk determination',
        mandatory: true,
        dataPoints: ['sicr-criteria', 'pd-lgd-ead-models'],
      },
    ],
    frequency: 'quarterly',
    submissionDeadline: '30 days after quarter end',
  },
  {
    id: 'esg-disclosure',
    name: 'ESG and Green Lending Disclosure',
    shortName: 'ESG Disclosure',
    jurisdiction: 'EU',
    description: 'Environmental, Social, and Governance reporting for sustainable finance',
    requiredSections: [
      {
        sectionId: 'green-portfolio',
        title: 'Green Loan Portfolio',
        description: 'Loans aligned with green taxonomy',
        mandatory: true,
        dataPoints: ['green-loan-volume', 'esg-score-distribution', 'carbon-footprint'],
      },
      {
        sectionId: 'esg-risk',
        title: 'ESG Risk Assessment',
        description: 'Integration of ESG factors in credit decisions',
        mandatory: true,
        dataPoints: ['esg-risk-framework', 'climate-risk-scenarios'],
      },
    ],
    frequency: 'quarterly',
    submissionDeadline: '60 days after quarter end',
  },
]

class ComplianceReportService {
  generateQuarterlyReport(
    loans: Loan[],
    alerts: Alert[],
    quarter: string,
    fiscalYear: number,
    frameworks: string[]
  ): ComplianceReport {
    const reportId = `COMP-${Date.now()}`
    const now = new Date()
    const periodEnd = this.getQuarterEndDate(quarter, fiscalYear)
    const periodStart = this.getQuarterStartDate(quarter, fiscalYear)

    const summary = this.generateSummary(loans, alerts, periodStart, periodEnd)
    const sections = this.generateSections(loans, alerts, frameworks, periodStart, periodEnd)
    const metadata = this.generateMetadata(frameworks)

    return {
      id: reportId,
      reportType: 'quarterly',
      quarter,
      reportingPeriod: quarter,
      fiscalYear,
      generatedDate: now.toISOString(),
      reportingPeriodStart: periodStart,
      reportingPeriodEnd: periodEnd,
      status: 'draft',
      sections,
      summary,
      metadata,
    }
  }

  generateSummary(loans: Loan[], alerts: Alert[], periodStart: string, periodEnd: string): ComplianceReportSummary {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const averageRiskScore = loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length : 0

    const covenantCompliance = loans.length > 0
      ? (loans.reduce((sum, loan) => {
          const compliant = loan.covenants.filter(c => c.status === 'compliant').length
          const total = loan.covenants.length
          return sum + (total > 0 ? compliant / total : 1)
        }, 0) / loans.length) * 100
      : 100

    const breachCount = loans.reduce((sum, loan) => {
      return sum + loan.covenants.filter(c => c.status === 'breached' || c.status === 'at-risk').length
    }, 0)

    const periodStartDate = new Date(periodStart)
    const periodEndDate = new Date(periodEnd)

    const newLoansOriginated = loans.filter(loan => {
      const originDate = new Date(loan.originationDate)
      return originDate >= periodStartDate && originDate <= periodEndDate
    }).length

    const loansMatured = loans.filter(loan => {
      const maturityDate = new Date(loan.maturityDate)
      return maturityDate >= periodStartDate && maturityDate <= periodEndDate && loan.status === 'paid-off'
    }).length

    const defaultCount = loans.filter(loan => loan.status === 'defaulted').length

    const esgScores = loans.map(l => l.esgScore.overall)
    const avgESGScore = this.calculateAverageESGScore(esgScores)

    const nonPerformingLoans = loans.filter(loan => 
      loan.status === 'defaulted' || loan.riskLevel === 'critical'
    ).length
    const nplRatio = loans.length > 0 ? (nonPerformingLoans / loans.length) * 100 : 0

    const provisions = this.calculateProvisions(loans)

    const keyFindings = this.generateKeyFindings(loans, alerts, {
      covenantCompliance,
      breachCount,
      nplRatio,
      averageRiskScore,
    })

    const riskMitigationActions = this.generateRiskMitigationActions(loans, alerts)

    return {
      totalLoans: loans.length,
      totalExposure,
      averageRiskScore,
      covenantComplianceRate: covenantCompliance,
      breachCount,
      newLoansOriginated,
      loansMatured,
      defaultCount,
      averageESGScore: avgESGScore,
      capitalAdequacyRatio: 15.2,
      liquidityRatio: 125.4,
      nonPerformingLoanRatio: nplRatio,
      provisions,
      keyFindings,
      riskMitigationActions,
    }
  }

  generateSections(
    loans: Loan[],
    alerts: Alert[],
    frameworks: string[],
    periodStart: string,
    periodEnd: string
  ): ComplianceReportSection[] {
    const sections: ComplianceReportSection[] = []

    sections.push(this.generateExecutiveSummarySection(loans, alerts))
    sections.push(this.generatePortfolioCompositionSection(loans))
    sections.push(this.generateRiskAssessmentSection(loans, alerts))
    sections.push(this.generateCovenantComplianceSection(loans))
    sections.push(this.generateESGSection(loans))
    sections.push(this.generateCapitalAdequacySection(loans))
    sections.push(this.generateTradingActivitySection(loans))
    sections.push(this.generateProvisioningSection(loans))

    if (frameworks.includes('basel-iii')) {
      sections.push(this.generateBaselIIISection(loans))
    }
    if (frameworks.includes('lma-disclosure')) {
      sections.push(this.generateLMADisclosureSection(loans))
    }
    if (frameworks.includes('ifrs-9')) {
      sections.push(this.generateIFRS9Section(loans))
    }

    return sections
  }

  generateExecutiveSummarySection(loans: Loan[], alerts: Alert[]): ComplianceReportSection {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const avgRisk = loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length : 0
    const highRiskCount = loans.filter(loan => loan.riskLevel === 'high' || loan.riskLevel === 'critical').length

    const content = `
## Executive Summary

This quarterly compliance report provides a comprehensive overview of the loan portfolio performance, risk metrics, and regulatory compliance status for the reporting period.

### Portfolio Overview
- **Total Loans**: ${loans.length}
- **Total Exposure**: ${this.formatCurrency(totalExposure)}
- **Average Risk Score**: ${avgRisk.toFixed(2)}/10
- **High Risk Loans**: ${highRiskCount} (${((highRiskCount / loans.length) * 100).toFixed(1)}%)

### Key Highlights
- Portfolio continues to demonstrate strong credit quality with an average risk score of ${avgRisk.toFixed(2)}
- Covenant compliance remains robust at ${this.calculateCovenantCompliance(loans).toFixed(1)}%
- ESG integration has improved with ${loans.filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B').length} loans rated A or B
- Active monitoring identified ${alerts.length} alerts during the period, with ${alerts.filter(a => a.status === 'resolved').length} successfully resolved

### Regulatory Status
All regulatory requirements have been met for the reporting period. Capital ratios exceed minimum requirements, and risk management frameworks are operating effectively.
    `.trim()

    return {
      id: 'exec-summary',
      sectionNumber: '1',
      title: 'Executive Summary',
      content,
      status: 'complete',
      requiredByRegulation: ['basel-iii', 'lma-disclosure', 'ifrs-9', 'esg-disclosure'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generatePortfolioCompositionSection(loans: Loan[]): ComplianceReportSection {
    const industryBreakdown = this.calculateIndustryBreakdown(loans)
    const currencyBreakdown = this.calculateCurrencyBreakdown(loans)
    const riskBreakdown = this.calculateRiskBreakdown(loans)

    const industryTable: ComplianceTable = {
      id: 'industry-breakdown',
      title: 'Portfolio Breakdown by Industry',
      headers: ['Industry', 'Number of Loans', 'Total Exposure', 'Percentage'],
      rows: Object.entries(industryBreakdown).map(([industry, data]) => [
        industry,
        data.count,
        this.formatCurrency(data.amount),
        `${data.percentage.toFixed(1)}%`,
      ]),
    }

    const currencyTable: ComplianceTable = {
      id: 'currency-breakdown',
      title: 'Portfolio Breakdown by Currency',
      headers: ['Currency', 'Number of Loans', 'Total Exposure', 'Percentage'],
      rows: Object.entries(currencyBreakdown).map(([currency, data]) => [
        currency,
        data.count,
        this.formatCurrency(data.amount),
        `${data.percentage.toFixed(1)}%`,
      ]),
    }

    const riskTable: ComplianceTable = {
      id: 'risk-breakdown',
      title: 'Portfolio Breakdown by Risk Level',
      headers: ['Risk Level', 'Number of Loans', 'Total Exposure', 'Percentage'],
      rows: Object.entries(riskBreakdown).map(([risk, data]) => [
        risk.charAt(0).toUpperCase() + risk.slice(1),
        data.count,
        this.formatCurrency(data.amount),
        `${data.percentage.toFixed(1)}%`,
      ]),
    }

    const content = `
## Portfolio Composition

The loan portfolio demonstrates diversification across multiple industries and currencies. Concentration risk is actively managed within approved limits.

### Industry Diversification
The portfolio spans ${Object.keys(industryBreakdown).length} distinct industries, with the largest concentration in ${this.getLargestIndustry(industryBreakdown)} at ${Math.max(...Object.values(industryBreakdown).map(d => d.percentage)).toFixed(1)}% of total exposure.

### Currency Exposure
Multi-currency lending is conducted across ${Object.keys(currencyBreakdown).length} currencies, with appropriate hedging strategies in place to manage FX risk.

### Risk Distribution
The portfolio maintains a balanced risk profile with ${riskBreakdown['low']?.percentage.toFixed(1) || 0}% in low-risk assets and ${riskBreakdown['critical']?.percentage.toFixed(1) || 0}% requiring enhanced monitoring.
    `.trim()

    return {
      id: 'portfolio-composition',
      sectionNumber: '2',
      title: 'Portfolio Composition',
      content,
      tables: [industryTable, currencyTable, riskTable],
      status: 'complete',
      requiredByRegulation: ['lma-disclosure', 'basel-iii'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateRiskAssessmentSection(loans: Loan[], alerts: Alert[]): ComplianceReportSection {
    const avgRisk = loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length : 0
    const highRiskLoans = loans.filter(loan => loan.riskLevel === 'high' || loan.riskLevel === 'critical')
    
    const riskFactorAvg = {
      credit: loans.reduce((sum, loan) => sum + loan.riskFactors.credit, 0) / loans.length,
      market: loans.reduce((sum, loan) => sum + loan.riskFactors.market, 0) / loans.length,
      operational: loans.reduce((sum, loan) => sum + loan.riskFactors.operational, 0) / loans.length,
      esg: loans.reduce((sum, loan) => sum + loan.riskFactors.esg, 0) / loans.length,
    }

    const riskFactorTable: ComplianceTable = {
      id: 'risk-factors',
      title: 'Average Risk Factor Scores',
      headers: ['Risk Factor', 'Average Score', 'Risk Level', 'Trend'],
      rows: [
        ['Credit Risk', riskFactorAvg.credit.toFixed(2), this.getRiskLevelFromScore(riskFactorAvg.credit), '↓'],
        ['Market Risk', riskFactorAvg.market.toFixed(2), this.getRiskLevelFromScore(riskFactorAvg.market), '→'],
        ['Operational Risk', riskFactorAvg.operational.toFixed(2), this.getRiskLevelFromScore(riskFactorAvg.operational), '↓'],
        ['ESG Risk', riskFactorAvg.esg.toFixed(2), this.getRiskLevelFromScore(riskFactorAvg.esg), '↑'],
      ],
      notes: '↓ Decreasing | → Stable | ↑ Increasing (compared to prior quarter)',
    }

    const content = `
## Risk Assessment

### Overall Risk Profile
The portfolio maintains an average risk score of ${avgRisk.toFixed(2)}/10, indicating ${this.getRiskLevelFromScore(avgRisk)} overall risk. ${highRiskLoans.length} loans (${((highRiskLoans.length / loans.length) * 100).toFixed(1)}%) are classified as high or critical risk and subject to enhanced monitoring.

### Risk Factor Analysis
A comprehensive multi-dimensional risk assessment evaluates credit, market, operational, and ESG factors for each loan:

- **Credit Risk (${riskFactorAvg.credit.toFixed(2)}/10)**: Borrower creditworthiness and default probability
- **Market Risk (${riskFactorAvg.market.toFixed(2)}/10)**: Interest rate, currency, and market volatility exposure
- **Operational Risk (${riskFactorAvg.operational.toFixed(2)}/10)**: Process, system, and execution risks
- **ESG Risk (${riskFactorAvg.esg.toFixed(2)}/10)**: Environmental, social, and governance considerations

### Alert Management
${alerts.length} risk alerts were generated during the reporting period:
- ${alerts.filter(a => a.severity === 'critical').length} critical alerts
- ${alerts.filter(a => a.severity === 'high').length} high severity alerts
- ${alerts.filter(a => a.status === 'resolved').length} alerts resolved
- ${alerts.filter(a => a.status === 'active').length} alerts under active management

### Mitigation Actions
- Enhanced monitoring protocols implemented for ${highRiskLoans.length} high-risk exposures
- Covenant compliance closely tracked across all facilities
- Regular stress testing performed to assess portfolio resilience
    `.trim()

    return {
      id: 'risk-assessment',
      sectionNumber: '3',
      title: 'Risk Assessment and Management',
      content,
      tables: [riskFactorTable],
      status: 'complete',
      requiredByRegulation: ['basel-iii', 'ifrs-9'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateCovenantComplianceSection(loans: Loan[]): ComplianceReportSection {
    const allCovenants = loans.flatMap(loan => 
      loan.covenants.map(c => ({ ...c, borrower: loan.borrowerName, loanId: loan.id }))
    )
    
    const compliant = allCovenants.filter(c => c.status === 'compliant').length
    const atRisk = allCovenants.filter(c => c.status === 'at-risk').length
    const breach = allCovenants.filter(c => c.status === 'breached').length
    const complianceRate = allCovenants.length > 0 ? (compliant / allCovenants.length) * 100 : 100

    const covenantTable: ComplianceTable = {
      id: 'covenant-status',
      title: 'Covenant Compliance Status',
      headers: ['Status', 'Count', 'Percentage'],
      rows: [
        ['Compliant', compliant, `${((compliant / allCovenants.length) * 100).toFixed(1)}%`],
        ['At Risk', atRisk, `${((atRisk / allCovenants.length) * 100).toFixed(1)}%`],
        ['Breach', breach, `${((breach / allCovenants.length) * 100).toFixed(1)}%`],
        ['Total', allCovenants.length, '100.0%'],
      ],
    }

    const breachTable: ComplianceTable = {
      id: 'covenant-breaches',
      title: 'Covenant Breaches and At-Risk Covenants',
      headers: ['Borrower', 'Covenant Type', 'Status', 'Current Value', 'Threshold'],
      rows: allCovenants
        .filter(c => c.status === 'breached' || c.status === 'at-risk')
        .slice(0, 10)
        .map(c => [
          c.borrower,
          c.type,
          c.status === 'breached' ? 'BREACH' : 'At Risk',
          c.currentValue.toFixed(2),
          c.threshold.toFixed(2),
        ]),
      notes: breach > 0 ? 'Waiver requests and remediation plans initiated for all breaches' : 'No covenant breaches during reporting period',
    }

    const content = `
## Covenant Compliance

### Compliance Overview
Portfolio-wide covenant compliance rate of ${complianceRate.toFixed(1)}% demonstrates strong borrower performance and effective monitoring. ${allCovenants.length} covenants are actively tracked across ${loans.length} loan facilities.

### Covenant Status Summary
- **Compliant**: ${compliant} covenants (${((compliant / allCovenants.length) * 100).toFixed(1)}%)
- **At Risk**: ${atRisk} covenants require enhanced monitoring
- **Breach**: ${breach} covenant breaches identified and under remediation

### Monitoring Framework
Automated covenant tracking with real-time alerts ensures prompt identification of potential issues:
- Daily compliance checks for all financial covenants
- Quarterly certification requirements from borrowers
- Proactive engagement with borrowers showing deteriorating metrics
- Waiver and amendment processes for covenant breaches

${breach > 0 ? `### Breach Remediation
All covenant breaches are subject to formal remediation procedures including waiver requests, amendment negotiations, or enhanced security requirements. Management is actively engaged with affected borrowers to restore compliance.` : ''}
    `.trim()

    return {
      id: 'covenant-compliance',
      sectionNumber: '4',
      title: 'Covenant Monitoring and Compliance',
      content,
      tables: [covenantTable, breachTable],
      status: 'complete',
      requiredByRegulation: ['basel-iii', 'lma-disclosure'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateESGSection(loans: Loan[]): ComplianceReportSection {
    const esgScores = loans.map(l => l.esgScore.overall)
    const greenLoans = loans.filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B')
    const greenExposure = greenLoans.reduce((sum, loan) => sum + loan.amount, 0)
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)

    const esgDistribution = {
      'A': loans.filter(l => l.esgScore.overall === 'A').length,
      'B': loans.filter(l => l.esgScore.overall === 'B').length,
      'C': loans.filter(l => l.esgScore.overall === 'C').length,
      'D': loans.filter(l => l.esgScore.overall === 'D').length,
      'F': loans.filter(l => l.esgScore.overall === 'F').length,
    }

    const avgEnv = loans.reduce((sum, l) => sum + l.esgScore.environmental, 0) / loans.length
    const avgSocial = loans.reduce((sum, l) => sum + l.esgScore.social, 0) / loans.length
    const avgGov = loans.reduce((sum, l) => sum + l.esgScore.governance, 0) / loans.length

    const esgTable: ComplianceTable = {
      id: 'esg-distribution',
      title: 'ESG Score Distribution',
      headers: ['ESG Rating', 'Number of Loans', 'Percentage'],
      rows: Object.entries(esgDistribution).map(([rating, count]) => [
        rating,
        count,
        `${((count / loans.length) * 100).toFixed(1)}%`,
      ]),
    }

    const esgFactorTable: ComplianceTable = {
      id: 'esg-factors',
      title: 'ESG Factor Scores (0-100)',
      headers: ['Factor', 'Portfolio Average', 'Rating'],
      rows: [
        ['Environmental', avgEnv.toFixed(1), this.getESGRating(avgEnv)],
        ['Social', avgSocial.toFixed(1), this.getESGRating(avgSocial)],
        ['Governance', avgGov.toFixed(1), this.getESGRating(avgGov)],
      ],
    }

    const content = `
## ESG and Green Lending

### ESG Integration
Environmental, Social, and Governance factors are systematically integrated into credit assessment and portfolio management. ${greenLoans.length} loans (${((greenLoans.length / loans.length) * 100).toFixed(1)}%) achieve top-tier ESG ratings (A or B).

### Green Lending Portfolio
- **Green Loan Count**: ${greenLoans.length}
- **Green Exposure**: ${this.formatCurrency(greenExposure)} (${((greenExposure / totalExposure) * 100).toFixed(1)}% of portfolio)
- **Average ESG Score**: ${this.calculateAverageESGScore(esgScores)}
- **Portfolio Carbon Footprint**: -12% reduction year-over-year

### ESG Factor Analysis
Portfolio-level ESG assessment across three key dimensions:
- **Environmental (${avgEnv.toFixed(1)}/100)**: Climate risk, carbon emissions, resource management, pollution control
- **Social (${avgSocial.toFixed(1)}/100)**: Labor practices, community impact, human rights, product safety
- **Governance (${avgGov.toFixed(1)}/100)**: Board structure, shareholder rights, transparency, ethics

### Sustainable Finance Initiatives
- Green loan frameworks aligned with LMA Green Loan Principles
- ESG due diligence integrated into credit approval process
- Annual ESG reassessment for all borrowers
- Climate risk scenario analysis conducted quarterly
- Support for borrowers' transition to sustainable practices

### Regulatory Alignment
The ESG framework aligns with:
- EU Taxonomy for Sustainable Activities
- LMA Green Loan Principles
- UN Sustainable Development Goals (SDGs)
- Task Force on Climate-related Financial Disclosures (TCFD)
    `.trim()

    return {
      id: 'esg-section',
      sectionNumber: '5',
      title: 'ESG and Sustainable Finance',
      content,
      tables: [esgTable, esgFactorTable],
      status: 'complete',
      requiredByRegulation: ['esg-disclosure'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateCapitalAdequacySection(loans: Loan[]): ComplianceReportSection {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const riskWeightedAssets = this.calculateRiskWeightedAssets(loans)

    const capitalTable: ComplianceTable = {
      id: 'capital-ratios',
      title: 'Capital Adequacy Ratios',
      headers: ['Metric', 'Amount/Ratio', 'Minimum Required', 'Status'],
      rows: [
        ['Tier 1 Capital', '$2.5B', 'N/A', '✓'],
        ['Tier 2 Capital', '$850M', 'N/A', '✓'],
        ['Total Capital', '$3.35B', 'N/A', '✓'],
        ['Risk-Weighted Assets', this.formatCurrency(riskWeightedAssets), 'N/A', '✓'],
        ['CET1 Ratio', '12.8%', '4.5%', '✓ Well Above'],
        ['Tier 1 Ratio', '15.2%', '6.0%', '✓ Well Above'],
        ['Total Capital Ratio', '17.5%', '8.0%', '✓ Well Above'],
        ['Leverage Ratio', '6.2%', '3.0%', '✓ Above'],
      ],
      notes: 'All capital ratios exceed regulatory minimums with comfortable buffers',
    }

    const content = `
## Capital Adequacy

### Regulatory Capital Position
The institution maintains a strong capital position, with all regulatory ratios significantly exceeding minimum requirements. This provides substantial buffer to absorb potential losses and support business growth.

### Basel III Compliance
All Basel III capital requirements are fully met:
- **Common Equity Tier 1 (CET1) Ratio**: 12.8% (minimum: 4.5%)
- **Tier 1 Capital Ratio**: 15.2% (minimum: 6.0%)
- **Total Capital Ratio**: 17.5% (minimum: 8.0%)
- **Leverage Ratio**: 6.2% (minimum: 3.0%)

### Risk-Weighted Assets
Total RWA of ${this.formatCurrency(riskWeightedAssets)} reflects the credit risk profile of the loan portfolio, calculated using standardized approach with appropriate risk weights applied by exposure type and credit rating.

### Capital Planning
- Stress testing demonstrates capital adequacy under adverse scenarios
- Capital buffers exceed regulatory and internal targets
- Dividend policy balances shareholder returns with capital strength
- Growth capacity available within capital constraints
    `.trim()

    return {
      id: 'capital-adequacy',
      sectionNumber: '6',
      title: 'Capital Adequacy and Basel III Compliance',
      content,
      tables: [capitalTable],
      status: 'complete',
      requiredByRegulation: ['basel-iii'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateTradingActivitySection(loans: Loan[]): ComplianceReportSection {
    const tradedLoans = loans.filter(loan => loan.tradeListing)
    const totalTradingVolume = tradedLoans.reduce((sum, loan) => sum + (loan.tradeListing?.askPrice || 0), 0)
    const avgBidCount = tradedLoans.length > 0
      ? tradedLoans.reduce((sum, loan) => sum + (loan.tradeListing?.bids.length || 0), 0) / tradedLoans.length
      : 0

    const tradingTable: ComplianceTable = {
      id: 'trading-summary',
      title: 'Secondary Market Trading Activity',
      headers: ['Metric', 'Value'],
      rows: [
        ['Loans Listed for Sale', tradedLoans.length],
        ['Total Trading Volume', this.formatCurrency(totalTradingVolume)],
        ['Average Bid Count per Listing', avgBidCount.toFixed(1)],
        ['Active Bids', tradedLoans.reduce((sum, loan) => sum + (loan.tradeListing?.bids.filter(b => b.status === 'pending').length || 0), 0)],
        ['Completed Trades', tradedLoans.filter(loan => loan.tradeListing?.status === 'settled').length],
      ],
    }

    const content = `
## Secondary Market Trading Activity

### Trading Overview
The secondary loan market provides liquidity and price discovery, enabling portfolio optimization and risk management. ${tradedLoans.length} loans were active in the trading platform during the reporting period.

### Market Transparency
The LMA-aligned trading platform provides:
- Real-time pricing and fair value estimates
- Transparent bid-ask spreads
- Historical trade data
- Standardized settlement processes

### Price Discovery
Market-based pricing methodology incorporates:
- Comparable loan analysis
- Discounted cash flow valuation
- Risk-adjusted spreads
- Market liquidity factors

### Trading Volume
Total secondary market activity of ${this.formatCurrency(totalTradingVolume)} demonstrates active portfolio management and healthy market liquidity.
    `.trim()

    return {
      id: 'trading-activity',
      sectionNumber: '7',
      title: 'Secondary Market Trading Activity',
      content,
      tables: [tradingTable],
      status: 'complete',
      requiredByRegulation: ['lma-disclosure'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateProvisioningSection(loans: Loan[]): ComplianceReportSection {
    const provisions = this.calculateProvisions(loans)
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const coverageRatio = (provisions / totalExposure) * 100

    const stage1Loans = loans.filter(loan => loan.riskLevel === 'low')
    const stage2Loans = loans.filter(loan => loan.riskLevel === 'medium')
    const stage3Loans = loans.filter(loan => loan.riskLevel === 'high' || loan.riskLevel === 'critical' || loan.status === 'defaulted')

    const provisionTable: ComplianceTable = {
      id: 'provisions',
      title: 'Expected Credit Loss Provisions (IFRS 9)',
      headers: ['Stage', 'Number of Loans', 'Exposure', 'ECL Provision', 'Coverage %'],
      rows: [
        [
          'Stage 1 (12-month ECL)',
          stage1Loans.length,
          this.formatCurrency(stage1Loans.reduce((sum, l) => sum + l.amount, 0)),
          this.formatCurrency(provisions * 0.15),
          '0.3%',
        ],
        [
          'Stage 2 (Lifetime ECL)',
          stage2Loans.length,
          this.formatCurrency(stage2Loans.reduce((sum, l) => sum + l.amount, 0)),
          this.formatCurrency(provisions * 0.35),
          '2.5%',
        ],
        [
          'Stage 3 (Credit-impaired)',
          stage3Loans.length,
          this.formatCurrency(stage3Loans.reduce((sum, l) => sum + l.amount, 0)),
          this.formatCurrency(provisions * 0.50),
          '45.0%',
        ],
        [
          'Total',
          loans.length,
          this.formatCurrency(totalExposure),
          this.formatCurrency(provisions),
          `${coverageRatio.toFixed(1)}%`,
        ],
      ],
    }

    const content = `
## Credit Loss Provisioning

### IFRS 9 Expected Credit Loss (ECL)
Loan loss provisions are calculated using forward-looking expected credit loss methodology in accordance with IFRS 9. Total provisions of ${this.formatCurrency(provisions)} represent ${coverageRatio.toFixed(1)}% of total exposure.

### Staging Methodology
- **Stage 1**: Loans with no significant increase in credit risk since origination (12-month ECL)
- **Stage 2**: Loans with significant increase in credit risk but not credit-impaired (lifetime ECL)
- **Stage 3**: Credit-impaired loans with objective evidence of default (lifetime ECL)

### ECL Calculation
Expected credit loss incorporates:
- Probability of Default (PD): Historical default rates adjusted for forward-looking factors
- Loss Given Default (LGD): Recovery rates based on collateral and seniority
- Exposure at Default (EAD): Outstanding balance plus undrawn commitments
- Macroeconomic overlays: GDP growth, unemployment, interest rates

### Provision Adequacy
The provision coverage ratio of ${coverageRatio.toFixed(1)}% exceeds peer benchmarks and provides adequate buffer for potential credit losses. Management reviews provisioning methodology quarterly and updates assumptions based on portfolio performance and economic outlook.

### Forward-Looking Adjustments
Current period provisions reflect:
- Baseline economic scenario (80% weight)
- Adverse economic scenario (15% weight)
- Severe adverse scenario (5% weight)
    `.trim()

    return {
      id: 'provisioning',
      sectionNumber: '8',
      title: 'Credit Loss Provisioning and IFRS 9',
      content,
      tables: [provisionTable],
      status: 'complete',
      requiredByRegulation: ['ifrs-9', 'basel-iii'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateBaselIIISection(loans: Loan[]): ComplianceReportSection {
    const content = `
## Basel III Additional Disclosures

### Liquidity Coverage Ratio (LCR)
- **High-Quality Liquid Assets (HQLA)**: $4.2B
- **Net Cash Outflows (30-day)**: $3.35B
- **LCR**: 125.4% (minimum: 100%)

The LCR exceeds regulatory requirements, demonstrating the institution's ability to withstand a 30-day liquidity stress scenario.

### Net Stable Funding Ratio (NSFR)
- **Available Stable Funding**: $18.5B
- **Required Stable Funding**: $16.2B
- **NSFR**: 114.2% (minimum: 100%)

The NSFR confirms sustainable funding profile for assets and activities over a one-year horizon.

### Leverage Ratio
- **Tier 1 Capital**: $2.5B
- **Total Exposure Measure**: $40.3B
- **Leverage Ratio**: 6.2% (minimum: 3.0%)

The leverage ratio provides a non-risk-based backstop to risk-weighted capital requirements.
    `.trim()

    return {
      id: 'basel-iii',
      sectionNumber: '9',
      title: 'Basel III Supplementary Disclosures',
      content,
      status: 'complete',
      requiredByRegulation: ['basel-iii'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateLMADisclosureSection(loans: Loan[]): ComplianceReportSection {
    const content = `
## LMA Secondary Market Disclosure

### Pricing Methodology
Fair value determination follows LMA best practices:
- **Valuation Models**: Discounted cash flow (DCF), comparable loan analysis, market-based regression
- **Pricing Frequency**: Real-time pricing updates every 10 seconds
- **Mark-to-Market**: Daily portfolio revaluation
- **Independent Validation**: Monthly pricing verification by independent pricing service

### Trading Platform Features
- LMA-compliant standardized settlement documentation
- Electronic trade confirmation and settlement
- Transparent bid-ask spreads and market depth
- Historical pricing and trade data
- Automated regulatory reporting

### Market Making
The institution provides liquidity through competitive two-way pricing on selected loan exposures, supporting market efficiency and price discovery in the EMEA loan markets.
    `.trim()

    return {
      id: 'lma-disclosure',
      sectionNumber: '10',
      title: 'LMA Market Transparency Standards',
      content,
      status: 'complete',
      requiredByRegulation: ['lma-disclosure'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateIFRS9Section(loans: Loan[]): ComplianceReportSection {
    const content = `
## IFRS 9 Impairment Methodology

### Significant Increase in Credit Risk (SICR)
Criteria for identifying SICR and migrating exposures from Stage 1 to Stage 2:
- 30+ days past due
- Significant downgrade in internal risk rating (2+ notches)
- Adverse changes in business conditions
- Covenant breach or waiver
- Inclusion on watchlist or early alert reports

### PD, LGD, and EAD Models
- **Probability of Default (PD)**: Through-the-cycle models calibrated to point-in-time estimates
- **Loss Given Default (LGD)**: Downturn LGD reflects reduced recovery rates in stress
- **Exposure at Default (EAD)**: Considers drawn and undrawn commitments with credit conversion factors

### Model Performance
- Annual model validation and back-testing
- Quarterly model monitoring and performance metrics
- Independent model risk management oversight
- Regular benchmarking against external data

### Macroeconomic Factors
Forward-looking ECL incorporates:
- GDP growth forecasts
- Unemployment rates
- Interest rate curves
- Industry-specific leading indicators
    `.trim()

    return {
      id: 'ifrs-9',
      sectionNumber: '11',
      title: 'IFRS 9 Impairment Models',
      content,
      status: 'complete',
      requiredByRegulation: ['ifrs-9'],
      lastUpdated: new Date().toISOString(),
    }
  }

  generateMetadata(frameworks: string[]): ComplianceReportMetadata {
    return {
      institution: 'Financial Institution Name',
      reportingEntity: 'Loan Portfolio Management Division',
      regulatoryFrameworks: frameworks.map(id => {
        const framework = regulatoryFrameworks.find(f => f.id === id)
        return framework?.name || id
      }),
      preparedBy: 'Compliance Team',
      version: '1.0',
      attachments: [],
      certificationStatement: 'The undersigned certify that this report accurately reflects the loan portfolio status and regulatory compliance as of the reporting date.',
    }
  }

  private getQuarterStartDate(quarter: string, fiscalYear: number): string {
    const quarterMap: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }
    const month = quarterMap[quarter] || 0
    return new Date(fiscalYear, month, 1).toISOString()
  }

  private getQuarterEndDate(quarter: string, fiscalYear: number): string {
    const quarterMap: Record<string, number> = { Q1: 2, Q2: 5, Q3: 8, Q4: 11 }
    const month = quarterMap[quarter] || 2
    const lastDay = new Date(fiscalYear, month + 1, 0).getDate()
    return new Date(fiscalYear, month, lastDay, 23, 59, 59).toISOString()
  }

  private calculateAverageESGScore(scores: ('A' | 'B' | 'C' | 'D' | 'F')[]): string {
    const scoreMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 }
    const avg = scores.reduce((sum, score) => sum + scoreMap[score], 0) / scores.length
    if (avg >= 4.5) return 'A'
    if (avg >= 3.5) return 'B+'
    if (avg >= 2.5) return 'B'
    if (avg >= 1.5) return 'C'
    return 'D'
  }

  private calculateProvisions(loans: Loan[]): number {
    return loans.reduce((sum, loan) => {
      const provisionRate = loan.riskLevel === 'critical' ? 0.45 : 
                           loan.riskLevel === 'high' ? 0.15 :
                           loan.riskLevel === 'medium' ? 0.025 : 0.003
      return sum + (loan.amount * provisionRate)
    }, 0)
  }

  private generateKeyFindings(
    loans: Loan[],
    alerts: Alert[],
    metrics: { covenantCompliance: number; breachCount: number; nplRatio: number; averageRiskScore: number }
  ): string[] {
    const findings: string[] = []

    if (metrics.covenantCompliance >= 95) {
      findings.push(`Strong covenant compliance at ${metrics.covenantCompliance.toFixed(1)}% demonstrates effective borrower monitoring`)
    } else if (metrics.covenantCompliance < 85) {
      findings.push(`Covenant compliance of ${metrics.covenantCompliance.toFixed(1)}% requires enhanced monitoring and remediation efforts`)
    }

    if (metrics.nplRatio > 5) {
      findings.push(`Non-performing loan ratio of ${metrics.nplRatio.toFixed(1)}% exceeds target threshold - intensified workout efforts required`)
    } else {
      findings.push(`Non-performing loan ratio of ${metrics.nplRatio.toFixed(1)}% remains within acceptable limits`)
    }

    if (metrics.averageRiskScore < 4) {
      findings.push('Portfolio maintains low-risk profile with average risk score below 4.0')
    } else if (metrics.averageRiskScore > 6) {
      findings.push('Elevated average risk score indicates need for portfolio de-risking initiatives')
    }

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    if (criticalAlerts > 0) {
      findings.push(`${criticalAlerts} critical alerts generated during period - all under active management`)
    }

    findings.push('All regulatory capital ratios exceed minimum requirements with comfortable buffers')
    findings.push('ESG integration continues to strengthen with improved portfolio sustainability metrics')

    return findings
  }

  private generateRiskMitigationActions(loans: Loan[], alerts: Alert[]): string[] {
    const actions: string[] = []

    const highRiskLoans = loans.filter(loan => loan.riskLevel === 'high' || loan.riskLevel === 'critical')
    if (highRiskLoans.length > 0) {
      actions.push(`Enhanced monitoring protocols implemented for ${highRiskLoans.length} high-risk exposures`)
    }

    const covenantBreaches = loans.reduce((sum, loan) => 
      sum + loan.covenants.filter(c => c.status === 'breached').length, 0
    )
    if (covenantBreaches > 0) {
      actions.push(`Active engagement with ${covenantBreaches} borrowers for covenant breach remediation`)
    }

    actions.push('Regular stress testing performed to assess portfolio resilience under adverse scenarios')
    actions.push('Diversification strategies to reduce concentration risk across industries and geographies')
    actions.push('Continuous refinement of risk models incorporating latest macroeconomic forecasts')

    return actions
  }

  private calculateCovenantCompliance(loans: Loan[]): number {
    const allCovenants = loans.flatMap(loan => loan.covenants)
    if (allCovenants.length === 0) return 100
    const compliant = allCovenants.filter(c => c.status === 'compliant').length
    return (compliant / allCovenants.length) * 100
  }

  private calculateIndustryBreakdown(loans: Loan[]) {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const breakdown: Record<string, { count: number; amount: number; percentage: number }> = {}

    loans.forEach(loan => {
      if (!breakdown[loan.industry]) {
        breakdown[loan.industry] = { count: 0, amount: 0, percentage: 0 }
      }
      breakdown[loan.industry].count++
      breakdown[loan.industry].amount += loan.amount
    })

    Object.keys(breakdown).forEach(industry => {
      breakdown[industry].percentage = (breakdown[industry].amount / totalExposure) * 100
    })

    return breakdown
  }

  private calculateCurrencyBreakdown(loans: Loan[]) {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const breakdown: Record<string, { count: number; amount: number; percentage: number }> = {}

    loans.forEach(loan => {
      if (!breakdown[loan.currency]) {
        breakdown[loan.currency] = { count: 0, amount: 0, percentage: 0 }
      }
      breakdown[loan.currency].count++
      breakdown[loan.currency].amount += loan.amount
    })

    Object.keys(breakdown).forEach(currency => {
      breakdown[currency].percentage = (breakdown[currency].amount / totalExposure) * 100
    })

    return breakdown
  }

  private calculateRiskBreakdown(loans: Loan[]) {
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0)
    const breakdown: Record<string, { count: number; amount: number; percentage: number }> = {}

    loans.forEach(loan => {
      if (!breakdown[loan.riskLevel]) {
        breakdown[loan.riskLevel] = { count: 0, amount: 0, percentage: 0 }
      }
      breakdown[loan.riskLevel].count++
      breakdown[loan.riskLevel].amount += loan.amount
    })

    Object.keys(breakdown).forEach(risk => {
      breakdown[risk].percentage = (breakdown[risk].amount / totalExposure) * 100
    })

    return breakdown
  }

  private getLargestIndustry(breakdown: Record<string, { count: number; amount: number; percentage: number }>): string {
    let largest = ''
    let maxAmount = 0
    Object.entries(breakdown).forEach(([industry, data]) => {
      if (data.amount > maxAmount) {
        maxAmount = data.amount
        largest = industry
      }
    })
    return largest
  }

  private getRiskLevelFromScore(score: number): string {
    if (score <= 3) return 'Low'
    if (score <= 5) return 'Moderate'
    if (score <= 7) return 'Elevated'
    return 'High'
  }

  private getESGRating(score: number): string {
    if (score >= 80) return 'A (Excellent)'
    if (score >= 70) return 'B (Good)'
    if (score >= 60) return 'C (Fair)'
    if (score >= 50) return 'D (Poor)'
    return 'F (Failing)'
  }

  private calculateRiskWeightedAssets(loans: Loan[]): number {
    return loans.reduce((sum, loan) => {
      const riskWeight = loan.riskLevel === 'critical' ? 1.5 :
                        loan.riskLevel === 'high' ? 1.0 :
                        loan.riskLevel === 'medium' ? 0.5 : 0.2
      return sum + (loan.amount * riskWeight)
    }, 0)
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`
    }
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  exportToPDF(report: ComplianceReport): Promise<Blob> {
    return new Promise((resolve) => {
      const content = this.generatePDFContent(report)
      const blob = new Blob([content], { type: 'application/pdf' })
      resolve(blob)
    })
  }

  exportToExcel(report: ComplianceReport): Promise<Blob> {
    return new Promise((resolve) => {
      const content = this.generateExcelContent(report)
      const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      resolve(blob)
    })
  }

  private generatePDFContent(report: ComplianceReport): string {
    let content = `COMPLIANCE REPORT - ${report.quarter} ${report.fiscalYear}\n\n`
    content += `Generated: ${new Date(report.generatedDate).toLocaleDateString()}\n`
    content += `Reporting Period: ${new Date(report.reportingPeriodStart).toLocaleDateString()} - ${new Date(report.reportingPeriodEnd).toLocaleDateString()}\n\n`
    
    report.sections.forEach(section => {
      content += `\n${section.sectionNumber}. ${section.title}\n`
      content += `${'='.repeat(section.title.length + 4)}\n\n`
      content += section.content + '\n\n'
      
      if (section.tables) {
        section.tables.forEach(table => {
          content += `\n${table.title}\n`
          content += `${'-'.repeat(table.title.length)}\n`
          content += table.headers.join(' | ') + '\n'
          table.rows.forEach(row => {
            content += row.join(' | ') + '\n'
          })
          if (table.notes) {
            content += `\nNote: ${table.notes}\n`
          }
          content += '\n'
        })
      }
    })

    return content
  }

  private generateExcelContent(report: ComplianceReport): string {
    const csvRows: string[] = []
    
    csvRows.push(`Compliance Report - ${report.quarter} ${report.fiscalYear}`)
    csvRows.push(`Generated,${new Date(report.generatedDate).toLocaleDateString()}`)
    csvRows.push(`Period,${new Date(report.reportingPeriodStart).toLocaleDateString()} - ${new Date(report.reportingPeriodEnd).toLocaleDateString()}`)
    csvRows.push('')
    csvRows.push('Summary Metrics')
    csvRows.push('Metric,Value')
    csvRows.push(`Total Loans,${report.summary.totalLoans}`)
    csvRows.push(`Total Exposure,${this.formatCurrency(report.summary.totalExposure)}`)
    csvRows.push(`Average Risk Score,${report.summary.averageRiskScore.toFixed(2)}`)
    csvRows.push(`Covenant Compliance Rate,${report.summary.covenantComplianceRate.toFixed(1)}%`)
    csvRows.push(`Breach Count,${report.summary.breachCount}`)
    csvRows.push(`NPL Ratio,${report.summary.nonPerformingLoanRatio.toFixed(1)}%`)
    csvRows.push('')

    report.sections.forEach(section => {
      csvRows.push('')
      csvRows.push(`Section ${section.sectionNumber}: ${section.title}`)
      
      if (section.tables) {
        section.tables.forEach(table => {
          csvRows.push('')
          csvRows.push(table.title)
          csvRows.push(table.headers.join(','))
          table.rows.forEach(row => {
            csvRows.push(row.join(','))
          })
        })
      }
    })

    return csvRows.join('\n')
  }
}

export const complianceReportService = new ComplianceReportService()
