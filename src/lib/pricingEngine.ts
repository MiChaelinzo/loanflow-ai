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
      liquidityPremium: 0.5,
      sectorRisk: 1.0,
      macroeconomic: 0.5,
      volatility: 0.15,
    }
  }

  private startMarketSimulation(): void {
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
      creditSpread: spread,
    }
  }

  private calculateDCFPrice(loan: Loan): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    const cashFlows: number[] = []
    
    for (let i = 1; i <= yearsToMaturity; i++) {
      cashFlows.push(loan.amount * (loan.interestRate / 100))
    }
    cashFlows[cashFlows.length - 1] += loan.amount

    const discountRate = (
      this.marketFactors.baseRate +
      this.marketFactors.creditSpread +
      (loan.riskScore / 10) * 2
    ) / 100

    const pv = cashFlows.reduce((pv, cf, i) => {
      return pv + cf / Math.pow(1 + discountRate, i + 1)
    }, 0)

    return pv
  }

  private calculateComparablePrice(loan: Loan, allLoans: Loan[]): number {
    const comparables = this.findComparableLoans(loan, allLoans)
    
    if (comparables.length === 0) {
      return this.calculateDCFPrice(loan)
    }

    const weightedPrice = comparables.reduce((sum, comp) => {
      const adjustmentFactor = loan.amount / comp.currentPrice
      return sum + (comp.currentPrice * comp.similarity * adjustmentFactor)
    }, 0)
    
    const totalWeight = comparables.reduce((sum, comp) => sum + comp.similarity, 0)
    return weightedPrice / totalWeight
  }

  private calculateRegressionPrice(loan: Loan): number {
    const basePrice = loan.amount * 0.98
    const interestAdjustment = 1 + ((loan.interestRate - 5) / 100)
    const riskAdjustment = 1 - (loan.riskScore / 20)
    const maturityAdjustment = 1 - (this.getYearsToMaturity(loan) / 30)
    
    return basePrice * interestAdjustment * riskAdjustment * maturityAdjustment
  }

  private findComparableLoans(loan: Loan, allLoans: Loan[]): ComparableLoans[] {
    return allLoans
      .filter(l => l.id !== loan.id && l.currency === loan.currency && l.marketPricing)
      .map(l => {
        let similarity = 1.0
        
        const amountRatio = Math.min(loan.amount, l.amount) / Math.max(loan.amount, l.amount)
        similarity *= amountRatio
        
        const riskDiff = Math.abs(loan.riskScore - l.riskScore)
        similarity *= Math.max(0, 1 - (riskDiff / 10))
        
        if (loan.industry === l.industry) {
          similarity *= 1.2
        }

        return {
          loanId: l.id,
          borrowerName: l.borrowerName,
          similarity,
          currentPrice: l.marketPricing!.currentPrice,
          spread: l.marketPricing!.spread,
        }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
  }

  private calculateSpread(loan: Loan): number {
    const baseSpread = 100
    const riskPremium = (loan.riskScore / 10) * 50
    const liquidityPremium = this.marketFactors.liquidityPremium * 100
    return baseSpread + riskPremium + liquidityPremium
  }

  private calculateYieldToMaturity(loan: Loan, price: number): number {
    const annualInterest = loan.amount * (loan.interestRate / 100)
    const yearsToMaturity = this.getYearsToMaturity(loan)
    const capitalGainLoss = (loan.amount - price) / yearsToMaturity
    const avgValue = (loan.amount + price) / 2
    
    return ((annualInterest + capitalGainLoss) / avgValue) * 100
  }

  private calculateDuration(loan: Loan): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    return yearsToMaturity * 0.85
  }

  private calculateConvexity(loan: Loan): number {
    const yearsToMaturity = this.getYearsToMaturity(loan)
    return yearsToMaturity * 0.5
  }

  private calculateLiquidityScore(loan: Loan): number {
    let score = 50
    
    if (loan.amount > 50000000) score += 20
    else if (loan.amount > 10000000) score += 10
    
    if (loan.riskLevel === 'low') score += 20
    else if (loan.riskLevel === 'medium') score += 10
    
    score -= this.getYearsToMaturity(loan) * 2
    
    return Math.max(0, Math.min(100, score))
  }

  private determineMarketSentiment(loan: Loan, priceChange: number): 'bullish' | 'neutral' | 'bearish' {
    if (priceChange > loan.amount * 0.02) return 'bullish'
    if (priceChange < -loan.amount * 0.02) return 'bearish'
    return 'neutral'
  }

  private calculateConfidenceLevel(loan: Loan, allLoans: Loan[]): number {
    let confidence = 60
    
    const comparables = this.findComparableLoans(loan, allLoans)
    confidence += Math.min(30, comparables.length * 5)
    
    if (loan.marketPricing) {
      confidence += 10
    }
    
    return Math.min(100, confidence)
  }

  private getYearsToMaturity(loan: Loan): number {
    const maturity = new Date(loan.maturityDate)
    const now = new Date()
    const years = (maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)
    return Math.max(0.1, years)
  }

  generatePriceHistory(loan: Loan, days: number): PriceHistory[] {
    const history: PriceHistory[] = []
    const currentPrice = loan.marketPricing?.currentPrice || loan.amount * 0.98
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const volatility = 0.01 + (loan.riskScore / 100) * 0.02
      const drift = -0.0001
      const randomChange = (Math.random() - 0.5) * 2 * volatility
      const priceChange = 1 + drift + randomChange
      
      const price = currentPrice * priceChange
      
      history.push({
        timestamp: date.toISOString(),
        price,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        spread: this.calculateSpread(loan),
      })
    }
    
    return history
  }

  subscribeToPriceUpdates(loanId: string, callback: (pricing: MarketPricing) => void): void {
    this.priceUpdateCallbacks.set(loanId, callback)
  }

  unsubscribeFromPriceUpdates(loanId: string): void {
    this.priceUpdateCallbacks.delete(loanId)
    const intervalId = this.updateIntervals.get(loanId)
    if (intervalId) {
      clearInterval(intervalId)
      this.updateIntervals.delete(loanId)
    }
  }

  startRealTimePricing(loan: Loan, allLoans: Loan[]): void {
    const intervalId = window.setInterval(() => {
      const pricing = this.calculateMarketPricing(loan, allLoans)
      const callback = this.priceUpdateCallbacks.get(loan.id)
      if (callback) {
        callback(pricing)
      }
    }, 10000)
    
    this.updateIntervals.set(loan.id, intervalId)
  }

  getComparableLoans(loan: Loan, allLoans: Loan[]): ComparableLoans[] {
    return this.findComparableLoans(loan, allLoans)
  }

  getMarketFactors(): MarketFactors {
    return { ...this.marketFactors }
  }
}

export const pricingEngine = LoanPricingEngine.getInstance()
