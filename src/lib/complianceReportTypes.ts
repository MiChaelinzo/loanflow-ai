export interface ComplianceReport {
  id: string
  reportType: 'quarterly' | 'annual' | 'regulatory' | 'audit'
  fiscalYear: number
  quarter?: string
  reportingPeriod: string
  generatedDate: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
  sections: ComplianceReportSection[]
  summary: ComplianceReportSummary
  metadata: ComplianceReportMetadata
  status?: 'draft' | 'review' | 'approved' | 'submitted' | 'finalized'
  submittedDate?: string
  submittedBy?: string
}

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
  rows: any[][]
  footer?: string
  notes?: string
}

export interface ComplianceChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
  description?: string
}

export interface ComplianceReportSummary {
  totalExposure: number
  loanCount: number
  totalLoans?: number
  averageRiskScore: number
  covenantComplianceRate: number
  newLoansOriginated: number
  loansMatured: number
  defaultCount: number
  breachCount?: number
  averageESGScore: string
  capitalAdequacyRatio: number
  nonPerformingLoanRatio: number
  provisions: number
  liquidityRatio?: number
  keyFindings: string[]
  riskMitigationActions: string[]
}

export interface ComplianceReportMetadata {
  preparedBy: string
  reviewedBy?: string
  approvedBy?: string
  institution?: string
  reportingEntity?: string
  regulatoryFrameworks?: string[]
  version?: string
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  distributionList: string[]
  filingAuthority?: string
  regulatoryReference?: string
  certificationStatement?: string
  attachments?: string[]
}

export interface RegulatoryRequirement {
  id: string
  name: string
  authority: string
  frequency: 'quarterly' | 'semi-annual' | 'annual'
  nextDueDate: string
  requiredSections: string[]
  status: 'upcoming' | 'in-progress' | 'submitted' | 'approved'
}

export interface RequiredSection {
  sectionId: string
  title: string
  description: string
  mandatory: boolean
  dataPoints: string[]
}

export interface RegulatoryFramework {
  id: string
  name: string
  shortName?: string
  description?: string
  jurisdiction: string
  applicableTo?: string[]
  requiredSections?: RequiredSection[]
  requirements?: RegulatoryRequirement[]
  frequency?: string
  submissionDeadline?: string
}

export interface ReportSchedule {
  id: string
  reportType: string
  frequency: string
  nextDueDate: string
  lastSubmitted?: string
  status: 'current' | 'overdue' | 'upcoming'
}
