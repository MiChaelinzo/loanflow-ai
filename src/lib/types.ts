export type LoanStatus = 'active' | 'pending' | 'defaulted' | 'paid-off'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type CovenantStatus = 'compliant' | 'at-risk' | 'breached'
export type ESGRating = 'A' | 'B' | 'C' | 'D' | 'F'

export interface Covenant {
  id: string
  type: string
  description: string
  threshold: number
  currentValue: number
  status: CovenantStatus
  lastChecked: string
}

export interface ESGScore {
  overall: ESGRating
  environmental: number
  social: number
  governance: number
  notes: string
}

export interface RiskFactors {
  credit: number
  market: number
  operational: number
  esg: number
}

export interface Loan {
  id: string
  borrowerName: string
  amount: number
  currency: string
  interestRate: number
  maturityDate: string
  originationDate: string
  status: LoanStatus
  riskScore: number
  riskLevel: RiskLevel
  riskFactors: RiskFactors
  covenants: Covenant[]
  esgScore: ESGScore
  industry: string
  purpose: string
  documentUrl?: string
}
