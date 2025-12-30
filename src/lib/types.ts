export type LoanStatus = 'active' | 'pending' | 'defaulted' | 'paid-off'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type CovenantStatus = 'compliant' | 'at-risk' | 'breached'
export type ESGRating = 'A' | 'B' | 'C' | 'D' | 'F'
export type TradeStatus = 'listed' | 'bidding' | 'pending-settlement' | 'settled' | 'cancelled'
export type ComplianceLevel = 'full' | 'partial' | 'non-compliant'

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

export interface PredictiveAnalytics {
  defaultProbability30d: number
  defaultProbability60d: number
  defaultProbability90d: number
  covenantBreachRisk: {
    covenantId: string
    probability: number
    estimatedDate: string
  }[]
  recommendation: string
}

export interface LMACompliance {
  overallScore: number
  level: ComplianceLevel
  gaps: {
    section: string
    issue: string
    severity: 'high' | 'medium' | 'low'
  }[]
  standardVersion: string
  assessmentDate: string
}

export interface TradeListing {
  id: string
  loanId: string
  sellerId: string
  sellerName: string
  askPrice: number
  currency: string
  minBidAmount: number
  listedDate: string
  expiryDate: string
  status: TradeStatus
  bids: TradeBid[]
  views: number
}

export interface TradeBid {
  id: string
  tradeId: string
  bidderId: string
  bidderName: string
  amount: number
  bidDate: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

export interface MarketPricing {
  fairValue: number
  currentPrice: number
  priceChange24h: number
  priceChangePercent24h: number
  spread: number
  yieldToMaturity: number
  duration: number
  convexity: number
  liquidityScore: number
  marketSentiment: 'bullish' | 'neutral' | 'bearish'
  lastUpdated: string
  confidenceLevel: number
  pricingModel: 'dcf' | 'comparable' | 'regression' | 'hybrid'
  benchmarkRate: number
  creditSpread: number
}

export interface PriceHistory {
  timestamp: string
  price: number
  volume?: number
  spread?: number
}

export interface MarketFactors {
  baseRate: number
  creditSpread: number
  liquidityPremium: number
  sectorRisk: number
  macroeconomic: number
  volatility: number
}

export interface ComparableLoans {
  loanId: string
  borrowerName: string
  similarity: number
  currentPrice: number
  spread: number
}

export interface PriceAlertThreshold {
  id: string
  loanId: string
  type: 'price_above' | 'price_below' | 'spread_above' | 'spread_below' | 'price_change_percent'
  value: number
  enabled: boolean
  triggered: boolean
  lastTriggeredAt?: string
  createdAt: string
  note?: string
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
  predictiveAnalytics?: PredictiveAnalytics
  lmaCompliance?: LMACompliance
  tradeListing?: TradeListing
  marketPricing?: MarketPricing
  priceHistory?: PriceHistory[]
  priceAlerts?: PriceAlertThreshold[]
}
