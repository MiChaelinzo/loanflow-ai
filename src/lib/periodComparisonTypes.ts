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
  
    expectedShor
    sectorDiversi
}
export interface PeriodCompar
  trends: {
    category: string
   
 

    title: string
    severity: 'high' | 'mediu
  }[]

  quarters: Quarter[
  categories: ('port
  showInsights: bo



















