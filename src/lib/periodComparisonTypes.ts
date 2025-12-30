export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface QuarterlyMetrics {
  quarter: Quarter
  year: number
  startDate: string
  endDate: string
  
  portfolioMetrics: {
    totalExposure: number
    loanCount: number
    averageRiskScore: number
    covenantCompliance: number
    highRiskLoans: number
    averageLoanSize: number
    defaultRate: number
  }
  
  tradingMetrics: {
    totalTradeVolume: number
    numberOfTrades: number
    averageTradeSize: number
    averageSpread: number
    liquidityIndex: number
  }
  
  teamMetrics: {
    alertResponseTime: number
    alertResolutionRate: number
    loansProcessed: number
    averageProcessingTime: number
    teamUtilization: number
  }
  
  complianceMetrics: {
    lmaComplianceScore: number
    covenantBreaches: number
    riskIncidents: number
    regulatoryFilings: number
    auditScore: number
  }
  
  esgMetrics: {
    averageESGScore: number
    greenLoanCount: number
    greenExposure: number
    carbonReduction: number
  }
  
  marketMetrics: {
    expectedShortfall: number
    sectorDiversification: number
  }

  riskMetrics: {
    valueAtRisk: number
    expectedShortfall: number
  }
}

export interface PeriodComparisonProps {
  trends: {
    category: string
    value: number
    change: number
    title: string
    severity: 'high' | 'medium' | 'low'
  }[]

  quarters: Quarter[]
  categories: ('portfolio' | 'trading' | 'team' | 'compliance' | 'esg')[]
  showInsights: boolean
}

export interface PeriodComparison {
  quarters: QuarterlyMetrics[]
  insights: {
    category: string
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    trend: 'up' | 'down' | 'stable'
  }[]
}

export interface ComparisonFilters {
  quarters: Quarter[]
  categories: ('portfolio' | 'trading' | 'team' | 'compliance' | 'esg')[]
  showInsights: boolean
}



















