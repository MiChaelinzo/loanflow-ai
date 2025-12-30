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
  
  riskMetrics: {
    var95: number
    var99: number
    expectedShortfall: number
    concentrationRisk: number
    sectorDiversification: number
  }
}

export interface PeriodComparison {
  periods: QuarterlyMetrics[]
  trends: {
    metric: string
    category: string
    values: number[]
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
    status: 'positive' | 'negative' | 'neutral'
  }[]
  insights: {
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    category: string
  }[]
}

export interface ComparisonFilters {
  quarters: Quarter[]
  year: number
  categories: ('portfolio' | 'trading' | 'team' | 'compliance' | 'esg' | 'risk')[]
  showTrends: boolean
  showInsights: boolean
}
