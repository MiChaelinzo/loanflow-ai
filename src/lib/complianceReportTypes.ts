export interface ComplianceReport {
  id: string
  reportType: 'quarterly' | 'annual' | 'ad-hoc'
  quarter: string
  fiscalYear: number
  generatedDate: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
  status: 'draft' | 'finalized' | 'submitted' | 'archived'
  submittedDate?: string
  submittedBy?: string
  sections: ComplianceReportSection[]
  summary: ComplianceReportSummary
  metadata: ComplianceReportMetadata
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
  rows: (string | number)[][]
  footer?: string
  notes?: string
}

export interface ComplianceChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
  description: string
}

export interface ComplianceReportSummary {
  totalLoans: number
  totalExposure: number
  averageRiskScore: number
  covenantComplianceRate: number
  breachCount: number
  newLoansOriginated: number
  loansMatured: number
  defaultCount: number
  averageESGScore: string
  capitalAdequacyRatio: number
  liquidityRatio: number
  nonPerformingLoanRatio: number
  provisions: number
  keyFindings: string[]
  riskMitigationActions: string[]
}

export interface ComplianceReportMetadata {
  institution: string
  reportingEntity: string
  regulatoryFrameworks: string[]
  preparedBy: string
  reviewedBy?: string
  approvedBy?: string
  version: string
  attachments: string[]
  certificationStatement?: string
}

export interface RegulatoryFramework {
  id: string
  name: string
  shortName: string
  jurisdiction: string
  description: string
  requiredSections: RequiredReportSection[]
  frequency: 'monthly' | 'quarterly' | 'annual'
  submissionDeadline: string
}

export interface RequiredReportSection {
  sectionId: string
  title: string
  description: string
  mandatory: boolean
  dataPoints: string[]
}

export interface ComplianceTemplate {
  id: string
  name: string
  framework: string
  sections: TemplateSection[]
  variables: string[]
}

export interface TemplateSection {
  sectionNumber: string
  title: string
  template: string
  requiredData: string[]
  instructions?: string
}

export interface ReportSchedule {
  id: string
  frameworkId: string
  quarter: string
  fiscalYear: number
  dueDate: string
  reminderDates: string[]
  autoGenerate: boolean
  autoSubmit: boolean
  status: 'pending' | 'generated' | 'submitted' | 'overdue'
}
