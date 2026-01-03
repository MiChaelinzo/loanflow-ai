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
    greenExposure: number
    greenLoanCount?: number
    carbonReduction?: number
  }
  
  marketMetrics: {
    averageSpreadChange: number
    volatilityIndex: number
    valueAtRisk: number
  }
  
  riskMetrics?: {
    var95?: number
    var99?: number
    expectedShortfall?: number
    concentrationRisk?: number
    sectorDiversification?: number
    averageRiskScore?: number
    highRiskLoans?: number
    defaultRate?: number
  }
}

export interface TrendItem {
  category: string
  metric?: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  trend: 'up' | 'down' | 'stable'
  status?: 'improving' | 'declining' | 'stable'
  values?: number[]
  change?: number
  changePercent?: number
}

export interface PeriodComparison {
  quarters: QuarterlyMetrics[]
  periods?: QuarterlyMetrics[]
  insights: TrendItem[]
  trends?: TrendItem[]
}

export interface ComparisonFilters {
  quarters: Quarter[]
  year?: number
  categories: ('portfolio' | 'trading' | 'team' | 'compliance' | 'esg' | 'risk')[]
  showInsights: boolean
  showTrends?: boolean
}


