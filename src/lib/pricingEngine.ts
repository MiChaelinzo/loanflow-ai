import { Loan, MarketPricing, PriceHistory, MarketFactors, ComparableLoans } from './types'

export class LoanPricingEngine {
  private static instance: LoanPricingEngine
  private marketFactors: MarketFactors
  private priceUpdateCallbacks: Map<string, (pricing: MarketPricing) => void> = new Map()
  private updateIntervals: Map<string, number> = new Map()

  private constructor() {
    this.marketFactors = this.initializeMarketFactors()
    this.startMarketSimulation()
  }

  static getInstance(): LoanPricingEngine {
    if (!LoanPricingEngine.instance) {
      LoanPricingEngine.instance = new LoanPricingEngine()
    }
    return LoanPricingEngine.instance
  }

  private initializeMarketFactors(): MarketFactors {
    return {
      baseRate: 4.5,
      creditSpread: 2.5,
      liquidityPremium: 0.75,
      sectorRisk: 1.2,
      macroeconomic: 0.5,
      volatility: 0.15,
    }
  }

  private startMarketSimulation() {
    setInterval(() => {
      this.marketFactors.baseRate += (Math.random() - 0.5) * 0.02
      this.marketFactors.creditSpread += (Math.random() - 0.5) * 0.05
      this.marketFactors.liquidityPremium += (Math.random() - 0.5) * 0.01
      this.marketFactors.macroeconomic += (Math.random() - 0.5) * 0.03
      this.marketFactors.volatility = Math.max(0.05, Math.min(0.3, this.marketFactors.volatility + (Math.random() - 0.5) * 0.01))
    }, 5000)
  }

  calculateMarketPricing(loan: Loan, allLoans: Loan[]): MarketPricing {
    const dcfPrice = this.calculateDCFPrice(loan)
    const comparablePrice = this.calculateComparablePrice(loan, allLoans)
    const regressionPrice = this.calculateRegressionPrice(loan)

    const fairValue = (dcfPrice * 0.4 + comparablePrice * 0.35 + regressionPrice * 0.25)
    
    const currentPrice = fairValue * (1 + (Math.random() - 0.5) * 0.02)
    
    const previousPrice = loan.marketPricing?.currentPrice || currentPrice
    const priceChange24h = currentPrice - previousPrice
    const priceChangePercent24h = (priceChange24h / previousPrice) * 100

    const spread = this.calculateSpread(loan)
    const ytm = this.calculateYieldToMaturity(loan, currentPrice)
    const duration = this.calculateDuration(loan)
    const convexity = this.calculateConvexity(loan)
    const liquidityScore = this.calculateLiquidityScore(loan)
    const sentiment = this.determineMarketSentiment(loan, priceChange24h)
    const confidenceLevel = this.calculateConfidenceLevel(loan, allLoans)

    return {
      fairValue,
      currentPrice,
      priceChange24h,
      priceChangePercent24h,
      spread,
      yieldToMaturity: ytm,
      duration,
      convexity,
      liquidityScore,
      marketSentiment: sentiment,
      lastUpdated: new Date().toISOString(),
      confidenceLevel,
      pricingModel: 'hybrid',
      benchmarkRate: this.marketFactors.baseRate,
      creditSpread: this.marketFactors.creditSpread,
    }
  }

  private calculateDCFPrice(loan: Loan): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    const cashFlows: number[] = []
    
    for (let i = 1; i <= Math.ceil(yearsToMaturity); i++) {
      cashFlows.push(loan.amount * (loan.interestRate / 100))
    }
    cashFlows[cashFlows.length - 1] += loan.amount

    const discountRate = (
      this.marketFactors.baseRate +
      this.marketFactors.creditSpread * (loan.riskScore / 5) +
      this.marketFactors.liquidityPremium +
      this.marketFactors.sectorRisk * 0.5
    ) / 100

    const presentValue = cashFlows.reduce((pv, cf, index) => {
      return pv + cf / Math.pow(1 + discountRate, index + 1)
    }, 0)

    return presentValue
  }

  private calculateComparablePrice(loan: Loan, allLoans: Loan[]): number {
    const comparables = this.findComparableLoans(loan, allLoans)
    
    if (comparables.length === 0) {
      return this.calculateDCFPrice(loan)
    }

    const weightedPrice = comparables.reduce((sum, comp) => {
      const weight = comp.similarity
      const compLoan = allLoans.find(l => l.id === comp.loanId)
      if (!compLoan) return sum
      
      const adjustmentFactor = loan.amount / compLoan.amount
      const riskAdjustment = 1 - ((loan.riskScore - compLoan.riskScore) * 0.02)
      
      return sum + (comp.currentPrice * weight * adjustmentFactor * riskAdjustment)
    }, 0)

    const totalWeight = comparables.reduce((sum, comp) => sum + comp.similarity, 0)
    return totalWeight > 0 ? weightedPrice / totalWeight : this.calculateDCFPrice(loan)
  }

  private calculateRegressionPrice(loan: Loan): number {
    const baseValue = loan.amount
    
    const riskAdjustment = 1 - (loan.riskScore / 10) * 0.15
    const interestAdjustment = 1 + ((loan.interestRate - 5) / 100) * 0.5
    const maturityAdjustment = 1 - (this.getYearsToMaturity(loan) / 20) * 0.1
    const esgAdjustment = this.getESGMultiplier(loan)
    const complianceAdjustment = (loan.lmaCompliance?.overallScore || 80) / 100

    return baseValue * riskAdjustment * interestAdjustment * maturityAdjustment * esgAdjustment * complianceAdjustment
  }

  private findComparableLoans(loan: Loan, allLoans: Loan[]): ComparableLoans[] {
    return allLoans
      .filter(l => l.id !== loan.id && l.currency === loan.currency)
      .map(l => {
        let similarity = 1.0

        if (l.industry !== loan.industry) similarity *= 0.7
        
        const riskDiff = Math.abs(l.riskScore - loan.riskScore)
        similarity *= Math.max(0.5, 1 - riskDiff * 0.1)
        
        const amountRatio = Math.min(l.amount, loan.amount) / Math.max(l.amount, loan.amount)
        similarity *= amountRatio
        
        const maturityDiff = Math.abs(
          this.getYearsToMaturity(l) - this.getYearsToMaturity(loan)
        )
        similarity *= Math.max(0.6, 1 - maturityDiff * 0.1)

        return {
          loanId: l.id,
          borrowerName: l.borrowerName,
          similarity,
          currentPrice: l.marketPricing?.currentPrice || this.calculateDCFPrice(l),
          spread: l.marketPricing?.spread || this.calculateSpread(l),
        }
      })
      .filter(comp => comp.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
  }

  private calculateSpread(loan: Loan): number {
    const baseSpread = this.marketFactors.creditSpread
    const riskPremium = loan.riskScore * 0.3
    const liquidityPremium = this.marketFactors.liquidityPremium
    const industryRisk = this.marketFactors.sectorRisk * 0.5
    
    return baseSpread + riskPremium + liquidityPremium + industryRisk
  }

  private calculateYieldToMaturity(loan: Loan, currentPrice: number): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    const faceValue = loan.amount
    const couponRate = loan.interestRate / 100
    const annualCoupon = faceValue * couponRate

    if (yearsToMaturity <= 0) return 0

    const approximateYTM =
      (annualCoupon + (faceValue - currentPrice) / yearsToMaturity) /
      ((faceValue + currentPrice) / 2)

    return approximateYTM * 100
  }

  private calculateDuration(loan: Loan): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    const ytm = loan.interestRate / 100
    const couponRate = loan.interestRate / 100

    if (couponRate === 0) return yearsToMaturity

    const macaulayDuration =
      (1 + ytm) / ytm -
      (1 + ytm + yearsToMaturity * (couponRate - ytm)) /
        (couponRate * Math.pow(1 + ytm, yearsToMaturity) + ytm - couponRate)

    return Math.min(macaulayDuration, yearsToMaturity)
  }

  private calculateConvexity(loan: Loan): number {
    const duration = this.calculateDuration(loan)
    const ytm = loan.interestRate / 100
    
    return duration * (duration + 1) / Math.pow(1 + ytm, 2)
  }

  private calculateLiquidityScore(loan: Loan): number {
    let score = 100

    if (loan.amount < 10000000) score -= 20
    else if (loan.amount < 50000000) score -= 10

    score -= loan.riskScore * 3

    const yearsToMaturity = this.getYearsToMaturity(loan)
    if (yearsToMaturity > 10) score -= 15
    else if (yearsToMaturity > 5) score -= 8

    if (loan.lmaCompliance?.level === 'full') score += 10
    else if (loan.lmaCompliance?.level === 'non-compliant') score -= 15

    const views = loan.tradeListing?.views || 0
    score += Math.min(views / 10, 10)

    return Math.max(0, Math.min(100, score))
  }

  private determineMarketSentiment(loan: Loan, priceChange: number): 'bullish' | 'neutral' | 'bearish' {
    const threshold = loan.amount * 0.001

    if (priceChange > threshold && loan.riskScore < 5) return 'bullish'
    if (priceChange < -threshold || loan.riskScore > 7) return 'bearish'
    return 'neutral'
  }

  private calculateConfidenceLevel(loan: Loan, allLoans: Loan[]): number {
    let confidence = 75

    const comparables = this.findComparableLoans(loan, allLoans)
    confidence += Math.min(comparables.length * 3, 15)

    if (loan.lmaCompliance?.level === 'full') confidence += 5
    
    const dataCompleteness = [
      loan.predictiveAnalytics,
      loan.lmaCompliance,
      loan.covenants.length > 0,
    ].filter(Boolean).length
    confidence += dataCompleteness * 2

    const marketVolatility = this.marketFactors.volatility
    confidence -= marketVolatility * 20

    return Math.max(50, Math.min(100, confidence))
  }

  private getYearsToMaturity(loan: Loan): number {
    const maturityDate = new Date(loan.maturityDate)
    const now = new Date()
    const diffTime = maturityDate.getTime() - now.getTime()
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
    return Math.max(0, diffYears)
  }

  private getESGMultiplier(loan: Loan): number {
    const esgMap = { A: 1.05, B: 1.02, C: 1.0, D: 0.98, F: 0.95 }
    return esgMap[loan.esgScore.overall] || 1.0
  }

  generatePriceHistory(loan: Loan, days: number = 30): PriceHistory[] {
    const history: PriceHistory[] = []
    const basePrice = loan.marketPricing?.currentPrice || this.calculateDCFPrice(loan)
    const volatility = this.marketFactors.volatility
    
    let currentPrice = basePrice * (1 - volatility * days * 0.01)

    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      
      const dailyChange = (Math.random() - 0.5) * volatility * basePrice * 0.02
      currentPrice += dailyChange
      
      const trend = (days - i) / days
      currentPrice += trend * volatility * basePrice * 0.005

      const volume = Math.floor(Math.random() * 5000000) + 1000000
      const spread = this.calculateSpread(loan) + (Math.random() - 0.5) * 0.5

      history.push({
        timestamp,
        price: Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, currentPrice)),
        volume,
        spread,
      })
    }

    return history
  }

  subscribeToLoanPricing(loanId: string, callback: (pricing: MarketPricing) => void): () => void {
    this.priceUpdateCallbacks.set(loanId, callback)
    
    const intervalId = window.setInterval(() => {
      callback({ ...this.getCurrentPricing(loanId) })
    }, 10000)
    
    this.updateIntervals.set(loanId, intervalId)

    return () => {
      this.priceUpdateCallbacks.delete(loanId)
      const id = this.updateIntervals.get(loanId)
      if (id) {
        clearInterval(id)
        this.updateIntervals.delete(loanId)
      }
    }
  }

  private getCurrentPricing(loanId: string): MarketPricing {
    return {
      fairValue: 0,
      currentPrice: 0,
      priceChange24h: 0,
      priceChangePercent24h: 0,
      spread: 0,
      yieldToMaturity: 0,
      duration: 0,
      convexity: 0,
      liquidityScore: 0,
      marketSentiment: 'neutral',
      lastUpdated: new Date().toISOString(),
      confidenceLevel: 0,
      pricingModel: 'hybrid',
      benchmarkRate: this.marketFactors.baseRate,
      creditSpread: this.marketFactors.creditSpread,
    }
  }

  getMarketFactors(): MarketFactors {
    return { ...this.marketFactors }
  }

  getComparableLoans(loan: Loan, allLoans: Loan[]): ComparableLoans[] {
    return this.findComparableLoans(loan, allLoans)
  }
}

export const pricingEngine = LoanPricingEngine.getInstance()
