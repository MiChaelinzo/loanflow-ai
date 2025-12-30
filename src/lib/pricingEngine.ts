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
  private initializeMarketFactors(): 
   

      macroeconomic: 0.5,
    }

    setInterval(() => {
      this.marketFactors.cred
      this.marketFacto
    }, 5000)

    c
   

    const currentPrice = fairValue 
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
    const yearsToMa
    
      cashFlows.push(loan.am
    cashFlows
    const discountRate = (
      this.mark
      this.marke

      return pv + cf / Math.pow(1

  }
  private calculateComparable
    
      return this.calculateDCFPrice(loan)

   

      const adjustmentFactor = loan.amount / comp
      
    }, 0)
    
  }
  private calculateRegressionPrice(loan: Loan): number {
    
    const interestAdjustment = 1 + ((loan.interest


  }
  private findComparableLoans(loan: Loan, allLoans: Loan[]): C
      .filter(l => l.id !== loan.id && l.cu
        let similarity = 1.0
        if 

        
        similarity *= amountRatio
        c


   

          spread: l.marketPricing?.spread || this.calculateSpread(l),
      })
    
  }
  private calculateSpread(loan: Loan): nu
    c

    return baseSpread + riskPremium + liquidityPremium + indu

    const yearsToMaturity = this.getYearsToMaturity(loan)
    const couponRate = loan.int


      (annualCoupon + (faceValue - currentPrice) / yearsToMaturity) /

  }
  private



   

    return Math.min(macaulayDuration, yearsToMaturity)

    
    
  }
  private calculateLiquidityScore(loan: Loan): number {

    else if (loan.amount < 50000000) score -= 10

    const yearsToMaturity = this.getYearsToMaturity(loan)
   


    score += Math.m
    return Math.max(0, Math.min(100, score))

    const threshold = loan.a

    return 'neutral'

    let confidence = 75
    const comparables = this.findComparableLoans(loan, 

    
      loan.predictiveAnalytics,
      lo
    confidence += dataCompleteness * 2
    const marketVolatility = this.marketFactors.volatility

  }

    const now = 
    const diffYears = d
  }
  private getESGMulti
    return esgMap[loan.esgScore.overall] || 1.0

    const
    cons
    let currentPrice = basePrice * (1 - vola
    for (let i = days; i >= 0; i--) {
      
   


      const spread = this.calculateSpread(loan) + (Mat
      history.push({
        price: Math.max(basePrice * 0.8, Math.min(basePrice * 1.
        spread,
    
    return history


    const intervalId = window.setInterval(() => {
    }, 10000)
    this.updateIntervals.set(loan
    return () => {
      const id = this.updateIntervals.get(loanI

      }

  private getCurrentPricin
      fairValue: 0,
      priceChange24h: 0,

      duration: 0,
   

      pricingModel: 'hybrid',
      creditSpread: this.marketFactors.creditSpread,
  }
  getMarketFactors(): MarketFactors {

  getComparableLoans(loan: Loan, allLoans: Loan[






























































































































































