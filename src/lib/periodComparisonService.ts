import { Loan } from './types'
import { Alert } from './alertTypes'
import { TeamMember } from './teamTypes'
import { QuarterlyMetrics, PeriodComparison, Quarter, ComparisonFilters } from './periodComparisonTypes'

export class PeriodComparisonService {
  generateQuarterlyMetrics(
    quarter: Quarter,
    year: number,
    loans: Loan[],
    alerts: Alert[],
    teamMembers?: TeamMember[]
  ): QuarterlyMetrics {
    const { startDate, endDate } = this.getQuarterDates(quarter, year)
    
    const portfolioMetrics = this.calculatePortfolioMetrics(loans)
    const tradingMetrics = this.calculateTradingMetrics(loans)
    const teamMetrics = this.calculateTeamMetrics(alerts, teamMembers || [])
    const complianceMetrics = this.calculateComplianceMetrics(loans, alerts)
    const esgMetrics = this.calculateESGMetrics(loans)
    const marketMetrics = this.calculateMarketMetrics(loans)
    const riskMetrics = this.calculateRiskMetrics(loans)
    
    return {
      quarter,
      year,
      startDate,
      endDate,
      portfolioMetrics,
      tradingMetrics,
      teamMetrics,
      complianceMetrics,
      esgMetrics,
      marketMetrics,
      riskMetrics,
    }
  }
  
  comparePeriods(
    periods: QuarterlyMetrics[],
    filters: ComparisonFilters
  ): PeriodComparison {
    const trends = this.calculateTrends(periods, filters)
    const insights = this.generateInsights(trends, periods)
    
    return {
      quarters: periods,
      periods,
      trends,
      insights,
    }
  }
  
  comparePeriodsQuarterlyMetrics(
    periods: QuarterlyMetrics[],
    filters: ComparisonFilters
  ): PeriodComparison {
    return this.comparePeriods(periods, filters)
  }
  
  private getQuarterDates(quarter: Quarter, year: number): { startDate: string; endDate: string } {
    const quarterMap: Record<Quarter, { start: [number, number], end: [number, number] }> = {
      Q1: { start: [0, 1], end: [2, 31] },
      Q2: { start: [3, 1], end: [5, 30] },
      Q3: { start: [6, 1], end: [8, 30] },
      Q4: { start: [9, 1], end: [11, 31] },
    }
    
    const { start, end } = quarterMap[quarter]
    const startDate = new Date(year, start[0], start[1]).toISOString()
    const endDate = new Date(year, end[0], end[1]).toISOString()
    
    return { startDate, endDate }
  }
  
  private calculatePortfolioMetrics(loans: Loan[]) {
    const totalExposure = loans.reduce((sum, loan) => {
      if (loan.currency === 'USD') return sum + loan.amount
      return sum + loan.amount * 1.1
    }, 0)
    
    const loanCount = loans.length
    const averageRiskScore = loanCount > 0
      ? loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loanCount
      : 0
    
    const covenantCompliance = loanCount > 0
      ? (loans.reduce((sum, loan) => {
          const compliant = loan.covenants.filter(c => c.status === 'compliant').length
          const total = loan.covenants.length
          return sum + (total > 0 ? compliant / total : 1)
        }, 0) / loanCount) * 100
      : 100
    
    const highRiskLoans = loans.filter(loan => loan.riskScore > 7).length
    const averageLoanSize = loanCount > 0 ? totalExposure / loanCount : 0
    const defaultRate = loans.filter(loan => loan.status === 'defaulted').length / Math.max(loanCount, 1) * 100
    
    return {
      totalExposure,
      loanCount,
      averageRiskScore,
      covenantCompliance,
      highRiskLoans,
      averageLoanSize,
      defaultRate,
    }
  }
  
  private calculateTradingMetrics(loans: Loan[]) {
    const tradeListings = loans.filter(loan => loan.tradeListing)
    const totalTradeVolume = tradeListings.reduce((sum, loan) => {
      if (loan.tradeListing?.status === 'settled') {
        return sum + loan.amount
      }
      return sum
    }, 0)
    
    const numberOfTrades = tradeListings.filter(loan => loan.tradeListing?.status === 'settled').length
    const averageTradeSize = numberOfTrades > 0 ? totalTradeVolume / numberOfTrades : 0
    
    const averageSpread = loans.reduce((sum, loan) => {
      if (loan.marketPricing) {
        return sum + loan.marketPricing.spread
      }
      return sum
    }, 0) / Math.max(loans.length, 1)
    
    const liquidityIndex = loans.reduce((sum, loan) => {
      if (loan.marketPricing) {
        return sum + loan.marketPricing.liquidityScore
      }
      return sum
    }, 0) / Math.max(loans.length, 1)
    
    return {
      totalTradeVolume,
      numberOfTrades,
      averageTradeSize,
      averageSpread,
      liquidityIndex,
    }
  }
  
  private calculateTeamMetrics(alerts: Alert[], teamMembers: TeamMember[]) {
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved')
    const totalAlerts = Math.max(alerts.length, 1)
    
    const alertResolutionRate = (resolvedAlerts.length / totalAlerts) * 100
    
    const responseTimes = resolvedAlerts
      .filter(a => a.resolvedAt && a.createdAt)
      .map(a => {
        const created = new Date(a.createdAt).getTime()
        const resolved = new Date(a.resolvedAt!).getTime()
        return (resolved - created) / (1000 * 60 * 60)
      })
    
    const alertResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0
    
    const loansProcessed = teamMembers.reduce((sum, member) => sum + ((member as any).loansProcessed || 0), 0)
    const averageProcessingTime = 24
    const teamUtilization = teamMembers.length > 0 ? 75 + Math.random() * 15 : 0
    
    return {
      alertResponseTime,
      alertResolutionRate,
      loansProcessed,
      averageProcessingTime,
      teamUtilization,
    }
  }
  
  private calculateComplianceMetrics(loans: Loan[], alerts: Alert[]) {
    const lmaComplianceScore = loans.reduce((sum, loan) => {
      if (loan.lmaCompliance) {
        return sum + loan.lmaCompliance.overallScore
      }
      return sum + 80
    }, 0) / Math.max(loans.length, 1)
    
    const covenantBreaches = loans.reduce((sum, loan) => {
      return sum + loan.covenants.filter(c => c.status === 'breached').length
    }, 0)
    
    const riskIncidents = alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length
    const regulatoryFilings = Math.floor(loans.length / 10)
    const auditScore = 85 + Math.random() * 10
    
    return {
      lmaComplianceScore,
      covenantBreaches,
      riskIncidents,
      regulatoryFilings,
      auditScore,
    }
  }
  
  private calculateESGMetrics(loans: Loan[]) {
    const scoreMap = { A: 5, B: 4, C: 3, D: 2, F: 1 }
    const averageESGScore = loans.reduce((sum, loan) => {
      return sum + scoreMap[loan.esgScore.overall]
    }, 0) / Math.max(loans.length, 1)
    
    const greenLoanCount = loans.filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B').length
    const greenExposure = loans
      .filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B')
      .reduce((sum, l) => sum + l.amount, 0)
    
    const carbonReduction = -10 - Math.random() * 5
    
    return {
      averageESGScore,
      greenLoanCount,
      greenExposure,
      carbonReduction,
    }
  }
  
  private calculateMarketMetrics(loans: Loan[]) {
    const loansWithPricing = loans.filter(l => l.marketPricing)
    const averageSpreadChange = loansWithPricing.reduce((sum, loan) => {
      return sum + (loan.marketPricing?.spreadChange || 0)
    }, 0) / Math.max(loansWithPricing.length, 1)
    
    const volatilityIndex = loansWithPricing.reduce((sum, loan) => {
      return sum + (loan.marketPricing?.volatility || 0)
    }, 0) / Math.max(loansWithPricing.length, 1)
    
    const valueAtRisk = loans.reduce((sum, loan) => {
      return sum + (loan.amount * (loan.riskScore / 100))
    }, 0)
    
    return {
      averageSpreadChange,
      volatilityIndex,
      valueAtRisk,
    }
  }
  
  private calculateRiskMetrics(loans: Loan[]) {
    const sortedLoans = [...loans].sort((a, b) => a.riskScore - b.riskScore)
    const var95Index = Math.floor(loans.length * 0.95)
    const var99Index = Math.floor(loans.length * 0.99)
    
    const var95 = sortedLoans[var95Index]?.riskScore || 0
    const var99 = sortedLoans[var99Index]?.riskScore || 0
    const expectedShortfall = sortedLoans.slice(var95Index).reduce((sum, loan) => sum + loan.riskScore, 0) / Math.max(sortedLoans.length - var95Index, 1)
    
    const industries = new Set(loans.map(l => l.industry))
    const concentrationRisk = Math.max(...Array.from(industries).map(industry => {
      const industryLoans = loans.filter(l => l.industry === industry)
      return industryLoans.length / loans.length * 100
    })) || 0
    
    const sectorDiversification = industries.size / Math.max(loans.length, 1) * 100
    
    return {
      var95,
      var99,
      expectedShortfall,
      concentrationRisk,
      sectorDiversification,
    }
  }
  
  private calculateTrends(periods: QuarterlyMetrics[], filters: ComparisonFilters) {
    const trends: PeriodComparison['trends'] = []
    
    if (filters.categories.includes('portfolio')) {
      trends.push(...this.calculateCategoryTrends(periods, 'portfolio'))
    }
    if (filters.categories.includes('trading')) {
      trends.push(...this.calculateCategoryTrends(periods, 'trading'))
    }
    if (filters.categories.includes('team')) {
      trends.push(...this.calculateCategoryTrends(periods, 'team'))
    }
    if (filters.categories.includes('compliance')) {
      trends.push(...this.calculateCategoryTrends(periods, 'compliance'))
    }
    if (filters.categories.includes('esg')) {
      trends.push(...this.calculateCategoryTrends(periods, 'esg'))
    }
    if (filters.categories.includes('risk')) {
      trends.push(...this.calculateCategoryTrends(periods, 'risk'))
    }
    
    return trends
  }
  
  private calculateCategoryTrends(periods: QuarterlyMetrics[], category: string) {
    const trends: PeriodComparison['trends'] = []
    
    switch (category) {
      case 'portfolio':
        trends.push(this.createTrend('Total Exposure', 'portfolio', periods.map(p => p.portfolioMetrics.totalExposure)))
        trends.push(this.createTrend('Loan Count', 'portfolio', periods.map(p => p.portfolioMetrics.loanCount)))
        trends.push(this.createTrend('Average Risk Score', 'portfolio', periods.map(p => p.portfolioMetrics.averageRiskScore)))
        trends.push(this.createTrend('Covenant Compliance', 'portfolio', periods.map(p => p.portfolioMetrics.covenantCompliance)))
        break
      case 'trading':
        trends.push(this.createTrend('Trade Volume', 'trading', periods.map(p => p.tradingMetrics.totalTradeVolume)))
        trends.push(this.createTrend('Number of Trades', 'trading', periods.map(p => p.tradingMetrics.numberOfTrades)))
        trends.push(this.createTrend('Average Spread', 'trading', periods.map(p => p.tradingMetrics.averageSpread)))
        trends.push(this.createTrend('Liquidity Index', 'trading', periods.map(p => p.tradingMetrics.liquidityIndex)))
        break
      case 'team':
        trends.push(this.createTrend('Alert Response Time', 'team', periods.map(p => p.teamMetrics.alertResponseTime)))
        trends.push(this.createTrend('Alert Resolution Rate', 'team', periods.map(p => p.teamMetrics.alertResolutionRate)))
        trends.push(this.createTrend('Loans Processed', 'team', periods.map(p => p.teamMetrics.loansProcessed)))
        trends.push(this.createTrend('Team Utilization', 'team', periods.map(p => p.teamMetrics.teamUtilization)))
        break
      case 'compliance':
        trends.push(this.createTrend('LMA Compliance Score', 'compliance', periods.map(p => p.complianceMetrics.lmaComplianceScore)))
        trends.push(this.createTrend('Covenant Breaches', 'compliance', periods.map(p => p.complianceMetrics.covenantBreaches)))
        trends.push(this.createTrend('Risk Incidents', 'compliance', periods.map(p => p.complianceMetrics.riskIncidents)))
        trends.push(this.createTrend('Audit Score', 'compliance', periods.map(p => p.complianceMetrics.auditScore)))
        break
      case 'esg':
        trends.push(this.createTrend('Average ESG Score', 'esg', periods.map(p => p.esgMetrics.averageESGScore)))
        trends.push(this.createTrend('Green Loan Count', 'esg', periods.map(p => p.esgMetrics.greenLoanCount)))
        trends.push(this.createTrend('Green Exposure', 'esg', periods.map(p => p.esgMetrics.greenExposure)))
        trends.push(this.createTrend('Carbon Reduction', 'esg', periods.map(p => p.esgMetrics.carbonReduction)))
        break
      case 'risk':
        trends.push(this.createTrend('VaR 95%', 'risk', periods.map(p => p.riskMetrics.var95)))
        trends.push(this.createTrend('VaR 99%', 'risk', periods.map(p => p.riskMetrics.var99)))
        trends.push(this.createTrend('Expected Shortfall', 'risk', periods.map(p => p.riskMetrics.expectedShortfall)))
        trends.push(this.createTrend('Concentration Risk', 'risk', periods.map(p => p.riskMetrics.concentrationRisk)))
        break
    }
    
    return trends
  }
  
  private createTrend(
    metric: string,
    category: string,
    values: number[]
  ): PeriodComparison['trends'][0] {
    if (values.length < 2) {
      return {
        metric,
        category,
        values,
        change: 0,
        changePercent: 0,
        trend: 'stable',
        status: 'neutral',
      }
    }
    
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const change = lastValue - firstValue
    const changePercent = firstValue !== 0 ? (change / Math.abs(firstValue)) * 100 : 0
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (Math.abs(changePercent) < 2) {
      trend = 'stable'
    } else if (change > 0) {
      trend = 'up'
    } else {
      trend = 'down'
    }
    
    const status = this.determineTrendStatus(metric, trend)
    
    return {
      metric,
      category,
      values,
      change,
      changePercent,
      trend,
      status,
    }
  }
  
  private determineTrendStatus(
    metric: string,
    trend: 'up' | 'down' | 'stable'
  ): 'positive' | 'negative' | 'neutral' {
    if (trend === 'stable') return 'neutral'
    
    const positiveUpMetrics = [
      'Total Exposure',
      'Loan Count',
      'Covenant Compliance',
      'Trade Volume',
      'Number of Trades',
      'Liquidity Index',
      'Alert Resolution Rate',
      'Loans Processed',
      'Team Utilization',
      'LMA Compliance Score',
      'Audit Score',
      'Average ESG Score',
      'Green Loan Count',
      'Green Exposure',
    ]
    
    const positiveDownMetrics = [
      'Average Risk Score',
      'Alert Response Time',
      'Average Spread',
      'Covenant Breaches',
      'Risk Incidents',
      'VaR 95%',
      'VaR 99%',
      'Expected Shortfall',
      'Concentration Risk',
      'Carbon Reduction',
    ]
    
    if (positiveUpMetrics.includes(metric)) {
      return trend === 'up' ? 'positive' : 'negative'
    }
    
    if (positiveDownMetrics.includes(metric)) {
      return trend === 'down' ? 'positive' : 'negative'
    }
    
    return 'neutral'
  }
  
  private generateInsights(trends: PeriodComparison['trends'], periods: QuarterlyMetrics[]) {
    const insights: PeriodComparison['insights'] = []
    
    const negativeSignificantTrends = trends.filter(
      t => t.status === 'negative' && Math.abs(t.changePercent) > 10
    )
    
    const positiveSignificantTrends = trends.filter(
      t => t.status === 'positive' && Math.abs(t.changePercent) > 10
    )
    
    negativeSignificantTrends.forEach(trend => {
      insights.push({
        title: `${trend.metric} Declining`,
        description: `${trend.metric} has ${trend.trend === 'down' ? 'decreased' : 'increased'} by ${Math.abs(trend.changePercent).toFixed(1)}% over the analysis period. This requires immediate attention.`,
        severity: Math.abs(trend.changePercent) > 25 ? 'high' : 'medium',
        category: trend.category,
      })
    })
    
    positiveSignificantTrends.forEach(trend => {
      insights.push({
        title: `${trend.metric} Improving`,
        description: `${trend.metric} has ${trend.trend === 'up' ? 'increased' : 'decreased'} by ${Math.abs(trend.changePercent).toFixed(1)}% over the analysis period. Performance is trending positively.`,
        severity: 'low',
        category: trend.category,
      })
    })
    
    if (periods.length > 1) {
      const latestPeriod = periods[periods.length - 1]
      const previousPeriod = periods[periods.length - 2]
      
      if (latestPeriod.complianceMetrics.covenantBreaches > previousPeriod.complianceMetrics.covenantBreaches) {
        insights.push({
          title: 'Increasing Covenant Breaches',
          description: `Covenant breaches have increased from ${previousPeriod.complianceMetrics.covenantBreaches} to ${latestPeriod.complianceMetrics.covenantBreaches}. Enhanced monitoring recommended.`,
          severity: 'high',
          category: 'compliance',
        })
      }
      
      if (latestPeriod.portfolioMetrics.defaultRate > previousPeriod.portfolioMetrics.defaultRate + 1) {
        insights.push({
          title: 'Rising Default Rate',
          description: `Default rate has increased by ${(latestPeriod.portfolioMetrics.defaultRate - previousPeriod.portfolioMetrics.defaultRate).toFixed(2)}%. Review credit assessment processes.`,
          severity: 'high',
          category: 'portfolio',
        })
      }
      
      if (latestPeriod.teamMetrics.teamUtilization > 90) {
        insights.push({
          title: 'High Team Utilization',
          description: `Team utilization at ${latestPeriod.teamMetrics.teamUtilization.toFixed(1)}%. Consider expanding team capacity to prevent burnout.`,
          severity: 'medium',
          category: 'team',
        })
      }
    }
    
    return insights.slice(0, 10)
  }
}

export const periodComparisonService = new PeriodComparisonService()
