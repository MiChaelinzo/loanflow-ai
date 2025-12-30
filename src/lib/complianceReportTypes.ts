export interface ComplianceReport {
  reportType
  fiscalYear: number
  reportingPeriod
  fiscalYear: number
  generatedDate: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
export interface ComplianceReportSection {
  sectionNumber: string
  content: string
  charts?: ComplianceChart[]
  status: 'complete' | 'incomplete
}
e

export interface ComplianceReportSection {
  id: string
  sectionNumber: string
  title: string
  content: string
  tables?: ComplianceTable[]
  charts?: ComplianceChart[]
  requiredByRegulation: string[]
  status: 'complete' | 'incomplete' | 'needs-review'
  lastUpdated: string
}

export interface ComplianceTable {
  id: string
  title: string
  headers: string[]
  averageRiskScore: number
  footer?: string
  notes?: string
}

export interface ComplianceChart {
  nonPerform
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
export interface Comp
}

export interface ComplianceReportSummary {
  approvedBy?: strin
  totalExposure: number
  certificationStatement?:
  covenantComplianceRate: number
export interface Regu
  newLoansOriginated: number
  loansMatured: number
  defaultCount: number
  averageESGScore: string
  capitalAdequacyRatio: number
}
  nonPerformingLoanRatio: number
  provisions: number
  keyFindings: string[]
  riskMitigationActions: string[]
}

export interface ComplianceReportMetadata {

























































