import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Loan, PredictiveAnalytics, LMACompliance, TradeListing, TradeBid, MarketPricing } from './lib/types'
import { TeamMember } from './lib/teamTypes'
import { sampleLoans } from './lib/sampleLoans'
import { pricingEngine } from './lib/pricingEngine'
import { priceAlertService } from './lib/priceAlertService'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { LoanCard } from './components/LoanCard'
import { DocumentUploadDialog } from './components/DocumentUploadDialog'
import { BatchUploadDialog } from './components/BatchUploadDialog'
import { LoanDetailDialog } from './components/LoanDetailDialog'
import { WelcomeDashboard } from './components/WelcomeDashboard'
import { TradingHub } from './components/TradingHub'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { ComplianceChecker } from './components/ComplianceChecker'
import { StressTestDashboard } from './components/StressTestDashboard'
import { MarketIntelligence } from './components/MarketIntelligence'
import { RealTimePricingDashboard } from './components/RealTimePricingDashboard'
import { ExportDialog } from './components/ExportDialog'
import { TutorialWalkthrough, TutorialTrigger } from './components/TutorialWalkthrough'
import { HelpCenterTrigger } from './components/HelpCenter'
import { QuickHelp, quickHelpTips } from './components/QuickHelp'
import { FloatingHelpButton } from './components/FloatingHelpButton'
import { AIChatbot, AIChatbotTrigger } from './components/AIChatbot'
import { PortfolioAIInsights } from './components/PortfolioAIInsights'
import { AlertCenter, AlertCenterTrigger } from './components/AlertCenter'
import { AlertSettingsDialog, AlertSettingsTrigger } from './components/AlertSettings'
import { AlertAnalytics, AlertAnalyticsTrigger } from './components/AlertAnalytics'
import { TeamManagement } from './components/TeamManagement'
import { AlertRouting } from './components/AlertRouting'
import { LoanAssignments } from './components/LoanAssignments'
import { TeamPerformanceDashboard } from './components/TeamPerformanceDashboard'
import { Q3ForecastExport, Q3ForecastExportTrigger } from './components/Q3ForecastExport'
import { ComparativeAnalysis, ComparativeAnalysisTrigger } from './components/ComparativeAnalysis'
import { SpreadWideningMonitor, SpreadWideningMonitorTrigger } from './components/SpreadWideningMonitor'
import { SpreadTrendDashboard, SpreadTrendDashboardTrigger } from './components/SpreadTrendDashboard'
import { ComplianceReportGenerator, ComplianceReportGeneratorTrigger } from './components/ComplianceReportGenerator'
import { MultiPeriodComparison, MultiPeriodComparisonTrigger } from './components/MultiPeriodComparison'
import { Alert } from './lib/alertTypes'
import { UploadSimple, MagnifyingGlass, Brain, ChartLine, ShieldCheck, Leaf, Funnel, Handshake, FileText, Download, Sparkle, Lightning, Globe, Stack, Users, GitBranch, FolderOpen, Trophy, CurrencyDollar, TrendUp, FileDoc } from '@phosphor-icons/react'
import { toast } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

function App() {
  const [loans, setLoans] = useKV<Loan[]>('loans', [])
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [batchUploadDialogOpen, setBatchUploadDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('portfolio')
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [alertCenterOpen, setAlertCenterOpen] = useState(false)
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false)
  const [alertAnalyticsOpen, setAlertAnalyticsOpen] = useState(false)
  const [q3ForecastOpen, setQ3ForecastOpen] = useState(false)
  const [comparativeAnalysisOpen, setComparativeAnalysisOpen] = useState(false)
  const [spreadMonitorOpen, setSpreadMonitorOpen] = useState(false)
  const [spreadTrendsOpen, setSpreadTrendsOpen] = useState(false)
  const [complianceReportOpen, setComplianceReportOpen] = useState(false)
  const [multiPeriodOpen, setMultiPeriodOpen] = useState(false)
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])

  useEffect(() => {
    const interval = setInterval(() => {
      if ((loans || []).length > 0 && (alerts || []).length >= 0) {
        const priceAlertChecks = priceAlertService.checkPriceAlerts(loans || [], alerts || [])
        
        if (priceAlertChecks.length > 0) {
          const newAlerts: Alert[] = []
          priceAlertChecks.forEach(check => {
            newAlerts.push(...check.triggeredAlerts)
          })

          if (newAlerts.length > 0) {
            setAlerts((currentAlerts) => [...(currentAlerts || []), ...newAlerts])
            
            newAlerts.forEach(alert => {
              toast.warning(`Price Alert: ${alert.loanName}`, {
                description: alert.message,
              })
            })
          }
        }
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [loans, alerts])

  useEffect(() => {
    if ((loans || []).length > 0) {
      const updatedLoans = (loans || []).map(loan => {
        if (!loan.marketPricing) {
          const pricing = pricingEngine.calculateMarketPricing(loan, loans || [])
          const priceHistory = pricingEngine.generatePriceHistory(loan, 30)
          return { ...loan, marketPricing: pricing, priceHistory }
        }
        return loan
      })
      
      if (updatedLoans.some((l, i) => l !== (loans || [])[i])) {
        setLoans(updatedLoans)
      }
    }
  }, [loans?.length])

  const handlePricingUpdate = (loanId: string, pricing: MarketPricing) => {
    setLoans((currentLoans) =>
      (currentLoans || []).map((loan) =>
        loan.id === loanId ? { ...loan, marketPricing: pricing } : loan
      )
    )
  }

  const handleUploadComplete = async (extractedData: any) => {
    const riskScore = (
      (extractedData.riskFactors?.credit || 3) +
      (extractedData.riskFactors?.market || 3) +
      (extractedData.riskFactors?.operational || 3) +
      (extractedData.riskFactors?.esg || 3)
    ) / 4

    const getRiskLevel = (score: number) => {
      if (score <= 3) return 'low'
      if (score <= 5) return 'medium'
      if (score <= 7) return 'high'
      return 'critical'
    }

    const predictiveAnalytics: PredictiveAnalytics = {
      defaultProbability30d: Math.random() * 0.15,
      defaultProbability60d: Math.random() * 0.20,
      defaultProbability90d: Math.random() * 0.25,
      covenantBreachRisk: [],
      recommendation: 'Monitor quarterly for covenant compliance and market conditions',
    }

    const lmaCompliance: LMACompliance = {
      overallScore: Math.random() * 20 + 75,
      level: Math.random() > 0.5 ? 'full' : 'partial',
      gaps: [],
      standardVersion: 'LMA 2023 Investment Grade',
      assessmentDate: new Date().toISOString(),
    }

    if (lmaCompliance.level === 'partial') {
      lmaCompliance.gaps = [
        {
          section: 'Financial Covenants',
          issue: 'Covenant definition deviates from LMA standard terminology',
          severity: 'medium',
        },
      ]
    }

    const newLoan: Loan = {
      id: `LOAN-${Date.now()}`,
      borrowerName: extractedData.borrowerName,
      amount: extractedData.amount,
      currency: extractedData.currency,
      interestRate: extractedData.interestRate,
      maturityDate: extractedData.maturityDate,
      originationDate: extractedData.originationDate,
      status: 'active',
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      riskFactors: extractedData.riskFactors || {
        credit: Math.random() * 3 + 2,
        market: Math.random() * 3 + 2,
        operational: Math.random() * 3 + 2,
        esg: Math.random() * 3 + 2,
      },
      covenants: extractedData.covenants?.map((c: any, i: number) => ({
        id: `COV-${Date.now()}-${i}`,
        type: c.type,
        description: c.description,
        threshold: c.threshold,
        currentValue: c.threshold * (0.9 + Math.random() * 0.3),
        status: Math.random() > 0.8 ? 'at-risk' : 'compliant',
        lastChecked: new Date().toISOString(),
      })) || [
        {
          id: `COV-${Date.now()}-1`,
          type: 'Debt Service Coverage Ratio',
          description: 'Minimum DSCR of 1.25x',
          threshold: 1.25,
          currentValue: 1.45,
          status: 'compliant',
          lastChecked: new Date().toISOString(),
        },
      ],
      esgScore: {
        overall: (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)],
        environmental: 60 + Math.random() * 30,
        social: 60 + Math.random() * 30,
        governance: 65 + Math.random() * 30,
        notes: extractedData.esgNotes || 'Strong governance framework with improving environmental practices.',
      },
      industry: extractedData.industry || 'Manufacturing',
      purpose: extractedData.purpose || 'Working capital and expansion',
      predictiveAnalytics,
      lmaCompliance,
    }

    setLoans((currentLoans) => [...(currentLoans || []), newLoan])
    toast.success('Loan document analyzed successfully!', {
      description: `${newLoan.borrowerName} - ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: newLoan.currency,
        minimumFractionDigits: 0,
      }).format(newLoan.amount)}`,
    })
  }

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan)
    setDetailDialogOpen(true)
  }

  const handleLoanUpdate = (updatedLoan: Loan) => {
    setLoans((currentLoans) =>
      (currentLoans || []).map((loan) =>
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    )
    setSelectedLoan(updatedLoan)
  }

  const handleCreateListing = (loanId: string, askPrice: number) => {
    setLoans((currentLoans) =>
      (currentLoans || []).map((loan) => {
        if (loan.id === loanId) {
          const listing: TradeListing = {
            id: `TRADE-${Date.now()}`,
            loanId: loan.id,
            sellerId: 'current-user',
            sellerName: 'My Institution',
            askPrice,
            currency: loan.currency,
            minBidAmount: askPrice * 0.95,
            listedDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'listed',
            bids: [],
            views: Math.floor(Math.random() * 50),
          }
          return { ...loan, tradeListing: listing }
        }
        return loan
      })
    )
  }

  const handlePlaceBid = (listingId: string, amount: number) => {
    setLoans((currentLoans) =>
      (currentLoans || []).map((loan) => {
        if (loan.tradeListing?.id === listingId) {
          const newBid: TradeBid = {
            id: `BID-${Date.now()}`,
            tradeId: listingId,
            bidderId: 'current-user',
            bidderName: 'My Institution',
            amount,
            bidDate: new Date().toISOString(),
            status: 'pending',
          }
          return {
            ...loan,
            tradeListing: {
              ...loan.tradeListing,
              bids: [...loan.tradeListing.bids, newBid],
            },
          }
        }
        return loan
      })
    )
  }

  const handleLoadSampleData = () => {
    setLoans(sampleLoans)
    toast.success('Sample loans loaded successfully', {
      description: `${sampleLoans.length} demo loan documents added to portfolio`,
    })
  }

  const handleExportPortfolio = () => {
    setExportDialogOpen(true)
  }

  const uniqueCurrencies = [...new Set((loans || []).map(loan => loan.currency))].sort()
  const uniqueIndustries = [...new Set((loans || []).map(loan => loan.industry))].sort()

  const filteredLoans = (loans || []).filter((loan) => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.industry.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter
    const matchesRisk = riskFilter === 'all' || loan.riskLevel === riskFilter
    const matchesCurrency = currencyFilter === 'all' || loan.currency === currencyFilter
    const matchesIndustry = industryFilter === 'all' || loan.industry === industryFilter
    return matchesSearch && matchesStatus && matchesRisk && matchesCurrency && matchesIndustry
  })

  const totalExposure = (loans || []).reduce((sum, loan) => {
    if (loan.currency === 'USD') return sum + loan.amount
    return sum + loan.amount * 1.1
  }, 0)

  const averageRisk = (loans || []).length > 0
    ? (loans || []).reduce((sum, loan) => sum + loan.riskScore, 0) / (loans || []).length
    : 0

  const covenantCompliance = (loans || []).length > 0
    ? ((loans || []).reduce((sum, loan) => {
        const compliant = loan.covenants.filter(c => c.status === 'compliant').length
        const total = loan.covenants.length
        return sum + (total > 0 ? compliant / total : 1)
      }, 0) / (loans || []).length) * 100
    : 100

  const highRiskLoans = (loans || []).filter(loan => loan.riskScore > 7).length

  const activeAlertCount = (alerts || []).filter((a) => a.status === 'active').length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <Brain size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">LoanFlow AI</h1>
                <p className="text-sm text-muted-foreground">Intelligent Loan Management & Trading Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg border">
                <AlertCenterTrigger
                  onClick={() => setAlertCenterOpen(true)}
                  alertCount={activeAlertCount}
                />
                <Separator orientation="vertical" className="h-6" />
                <AIChatbotTrigger onClick={() => setChatbotOpen(true)} />
                <Separator orientation="vertical" className="h-6" />
                <HelpCenterTrigger />
                <TutorialTrigger />
              </div>
              
              {(loans || []).length === 0 && (
                <Button variant="secondary" size="default" onClick={handleLoadSampleData} className="gap-2">
                  <Sparkle size={20} />
                  Load Demo
                </Button>
              )}
              
              <Button size="lg" onClick={() => setUploadDialogOpen(true)} className="gap-2" data-tutorial="upload-button">
                <UploadSimple size={20} weight="bold" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {(loans || []).length === 0 ? (
          <WelcomeDashboard 
            onLoadDemo={handleLoadSampleData}
            onUpload={() => setUploadDialogOpen(true)}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-muted-foreground">Navigation</h2>
                <Badge variant="outline" className="font-mono">
                  {(loans || []).length} Loans
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setBatchUploadDialogOpen(true)} className="gap-2">
                  <Stack size={18} />
                  Batch Upload
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExportPortfolio} className="gap-2">
                  <Download size={18} />
                  Export Portfolio
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3 nav-card-hover">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Portfolio Management</h3>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('portfolio')}
                    className="justify-start gap-2 w-full"
                  >
                    <FileText size={18} />
                    Portfolio Overview
                  </Button>
                  <Button
                    variant={activeTab === 'assignments' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('assignments')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="assignments-tab"
                  >
                    <FolderOpen size={18} />
                    Loan Assignments
                  </Button>
                  <Button
                    variant={activeTab === 'esg' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('esg')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="esg-tab"
                  >
                    <Leaf size={18} />
                    ESG & Green
                  </Button>
                </div>
              </Card>

              <Card className="p-3 nav-card-hover">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Market & Trading</h3>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={activeTab === 'pricing' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('pricing')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="pricing-tab"
                  >
                    <CurrencyDollar size={18} />
                    Real-Time Pricing
                  </Button>
                  <Button
                    variant={activeTab === 'trading' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('trading')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="trading-tab"
                  >
                    <Handshake size={18} />
                    Trading Hub
                  </Button>
                  <Button
                    variant={activeTab === 'market' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('market')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="market-tab"
                  >
                    <Globe size={18} />
                    Market Intelligence
                  </Button>
                </div>
              </Card>

              <Card className="p-3 nav-card-hover">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Risk & Analytics</h3>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('analytics')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="analytics-tab"
                  >
                    <ChartLine size={18} />
                    Analytics
                  </Button>
                  <Button
                    variant={activeTab === 'spread-monitor' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('spread-monitor')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="spread-monitor-tab"
                  >
                    <TrendUp size={18} />
                    Spread Monitor
                  </Button>
                  <Button
                    variant={activeTab === 'spread-trends' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('spread-trends')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="spread-trends-tab"
                  >
                    <ChartLine size={18} />
                    Spread Trends
                  </Button>
                  <Button
                    variant={activeTab === 'stress-test' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('stress-test')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="stress-test-tab"
                  >
                    <Lightning size={18} />
                    Stress Testing
                  </Button>
                  <Button
                    variant={activeTab === 'alerts' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('alerts')}
                    className="justify-start gap-2 w-full relative"
                  >
                    <Lightning size={18} />
                    Alert Analytics
                    {activeAlertCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                        {activeAlertCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-3 nav-card-hover">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Compliance & Teams</h3>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={activeTab === 'compliance' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('compliance')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="compliance-tab"
                  >
                    <ShieldCheck size={18} />
                    Compliance
                  </Button>
                  <Button
                    variant={activeTab === 'reports' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('reports')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="reports-tab"
                  >
                    <FileDoc size={18} />
                    Reports
                  </Button>
                  <Button
                    variant={activeTab === 'team' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('team')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="team-tab"
                  >
                    <Users size={18} />
                    Team Management
                  </Button>
                  <Button
                    variant={activeTab === 'performance' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('performance')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="performance-tab"
                  >
                    <Trophy size={18} />
                    Performance
                  </Button>
                  <Button
                    variant={activeTab === 'routing' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('routing')}
                    className="justify-start gap-2 w-full"
                    data-tutorial="routing-tab"
                  >
                    <GitBranch size={18} />
                    Alert Routing
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-accent/5 border-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkle size={20} className="text-accent" weight="bold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Quick Actions & Reports</h3>
                  <p className="text-sm text-muted-foreground mb-3">Generate insights, export data, and access advanced analysis tools</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setQ3ForecastOpen(true)} className="gap-2">
                      <ChartLine size={16} />
                      Q3 Forecast
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setComparativeAnalysisOpen(true)} className="gap-2">
                      <ChartLine size={16} />
                      Comparative Analysis
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSpreadMonitorOpen(true)} className="gap-2">
                      <TrendUp size={16} />
                      Spread Monitor
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSpreadTrendsOpen(true)} className="gap-2">
                      <ChartLine size={16} />
                      Spread Trends
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setComplianceReportOpen(true)} className="gap-2">
                      <FileDoc size={16} />
                      Compliance Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMultiPeriodOpen(true)} className="gap-2">
                      <ChartLine size={16} />
                      Multi-Period Compare
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAlertAnalyticsOpen(true)} className="gap-2">
                      <Lightning size={16} />
                      Alert Analytics
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAlertSettingsOpen(true)} className="gap-2">
                      <Lightning size={16} />
                      Alert Settings
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <TabsContent value="portfolio" className="space-y-8">
            <QuickHelp tip={quickHelpTips.portfolio} />
            
            {(loans || []).length > 0 && (
              <PortfolioAIInsights loans={loans || []} />
            )}
            
            <div className="grid grid-cols-4 gap-6" data-tutorial="portfolio-metrics">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Exposure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(totalExposure)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Across {(loans || []).length} loans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{averageRisk.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ChartLine size={14} className="text-success" />
                    <p className="text-xs text-success">Portfolio health: Good</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Covenant Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{covenantCompliance.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ShieldCheck size={14} className="text-success" />
                    <p className="text-xs text-success">All monitored</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{highRiskLoans}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Require attention</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Loan Portfolio</CardTitle>
                  <Badge variant="outline" className="gap-1.5">
                    <Funnel size={14} />
                    {filteredLoans.length} of {(loans || []).length} loans
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-64">
                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by borrower or industry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="defaulted">Defaulted</SelectItem>
                      <SelectItem value="paid-off">Paid Off</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="critical">Critical Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      {uniqueCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {uniqueIndustries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {filteredLoans.length === 0 && (loans || []).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
                    <p className="text-muted-foreground mb-6">Upload your first loan document or load sample data to explore the platform</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={handleLoadSampleData} variant="secondary" className="gap-2">
                        <Sparkle size={20} />
                        Load Demo Data
                      </Button>
                      <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                        <UploadSimple size={20} />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                )}

                {filteredLoans.length === 0 && (loans || []).length > 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No loans match your filters</p>
                  </div>
                )}

                {filteredLoans.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLoans.map((loan) => (
                      <LoanCard key={loan.id} loan={loan} onClick={() => handleLoanClick(loan)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <QuickHelp tip={quickHelpTips.pricing} />
            <RealTimePricingDashboard 
              loans={loans || []} 
              onPricingUpdate={handlePricingUpdate}
            />
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            <QuickHelp tip={quickHelpTips.trading} />
            <TradingHub 
              loans={loans || []} 
              onCreateListing={handleCreateListing}
              onPlaceBid={handlePlaceBid}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <QuickHelp tip={quickHelpTips.analytics} />
            <AnalyticsDashboard loans={loans || []} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <QuickHelp tip={quickHelpTips.alertAnalytics} />
            <AlertAnalytics alerts={alerts || []} />
          </TabsContent>

          <TabsContent value="spread-monitor" className="space-y-4">
            <QuickHelp tip={quickHelpTips.spreadMonitor} />
            <SpreadWideningMonitor 
              loans={loans || []} 
              alerts={alerts || []}
              onNewAlerts={(newAlerts) => {
                setAlerts((currentAlerts) => [...(currentAlerts || []), ...newAlerts])
              }}
            />
          </TabsContent>

          <TabsContent value="spread-trends" className="space-y-4">
            <QuickHelp tip={quickHelpTips.spreadTrends} />
            <SpreadTrendDashboard loans={loans || []} />
          </TabsContent>

          <TabsContent value="stress-test" className="space-y-4">
            <QuickHelp tip={quickHelpTips.stressTest} />
            <StressTestDashboard loans={loans || []} />
          </TabsContent>

          <TabsContent value="market">
            <MarketIntelligence loans={loans || []} />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <QuickHelp tip={quickHelpTips.compliance} />
            <ComplianceChecker loans={loans || []} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ComplianceReportGenerator loans={loans || []} alerts={alerts || []} />
          </TabsContent>

          <TabsContent value="esg">
            <div className="space-y-6">
              <QuickHelp tip={quickHelpTips.esg} className="mb-6" />
              
              <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Leaf size={32} className="text-success" weight="bold" />
                  ESG & Green Lending
                </h2>
                <p className="text-muted-foreground mt-1">
                  Environmental, Social, and Governance performance tracking
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg ESG Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">B+</div>
                    <p className="text-xs text-muted-foreground mt-2">Portfolio average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Green Loans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">
                      {(loans || []).filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B').length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">High ESG performers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Green Exposure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(
                        (loans || [])
                          .filter(l => l.esgScore.overall === 'A' || l.esgScore.overall === 'B')
                          .reduce((sum, l) => sum + l.amount, 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Sustainable lending</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Reduction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">-12%</div>
                    <p className="text-xs text-muted-foreground mt-2">Portfolio footprint</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(loans || [])
                  .sort((a, b) => {
                    const scoreMap = { A: 5, B: 4, C: 3, D: 2, F: 1 }
                    return scoreMap[b.esgScore.overall] - scoreMap[a.esgScore.overall]
                  })
                  .map((loan) => (
                    <LoanCard key={loan.id} loan={loan} onClick={() => handleLoanClick(loan)} />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <QuickHelp tip={quickHelpTips.team} />
            <TeamManagement />
          </TabsContent>

          <TabsContent value="performance">
            <QuickHelp tip={quickHelpTips.performance} />
            <TeamPerformanceDashboard 
              teamMembers={teamMembers || []}
              alerts={alerts || []}
            />
          </TabsContent>

          <TabsContent value="routing">
            <QuickHelp tip={quickHelpTips.routing} />
            <AlertRouting />
          </TabsContent>

          <TabsContent value="assignments">
            <QuickHelp tip={quickHelpTips.assignments} />
            <LoanAssignments loans={loans || []} />
          </TabsContent>
        </Tabs>
        )}
      </main>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />

      <BatchUploadDialog
        open={batchUploadDialogOpen}
        onOpenChange={setBatchUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />

      <LoanDetailDialog
        loan={selectedLoan}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onUpdateLoan={handleLoanUpdate}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        loans={loans || []}
      />

      <TutorialWalkthrough />
      
      <FloatingHelpButton />

      <Dialog open={alertAnalyticsOpen} onOpenChange={setAlertAnalyticsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alert Analytics Dashboard</DialogTitle>
            <DialogDescription>
              Comprehensive insights into alert patterns, response times, and resolution trends
            </DialogDescription>
          </DialogHeader>
          <AlertAnalytics alerts={alerts || []} />
        </DialogContent>
      </Dialog>

      <AIChatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />

      <AlertCenter open={alertCenterOpen} onOpenChange={setAlertCenterOpen} loans={loans || []} />

      <AlertSettingsDialog open={alertSettingsOpen} onOpenChange={setAlertSettingsOpen} />

      <Q3ForecastExport
        open={q3ForecastOpen}
        onOpenChange={setQ3ForecastOpen}
        teamMembers={teamMembers || []}
        alerts={alerts || []}
        loans={loans || []}
      />

      <ComparativeAnalysis
        open={comparativeAnalysisOpen}
        onOpenChange={setComparativeAnalysisOpen}
        teamMembers={teamMembers || []}
        alerts={alerts || []}
        loans={loans || []}
      />

      <Dialog open={spreadMonitorOpen} onOpenChange={setSpreadMonitorOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spread Widening Monitor</DialogTitle>
            <DialogDescription>
              Early warning system for credit deterioration through real-time spread analysis
            </DialogDescription>
          </DialogHeader>
          <SpreadWideningMonitor 
            loans={loans || []} 
            alerts={alerts || []}
            onNewAlerts={(newAlerts) => {
              setAlerts((currentAlerts) => [...(currentAlerts || []), ...newAlerts])
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={spreadTrendsOpen} onOpenChange={setSpreadTrendsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spread Trend Visualization</DialogTitle>
            <DialogDescription>
              Historical credit spread analysis with advanced charting and insights
            </DialogDescription>
          </DialogHeader>
          <SpreadTrendDashboard loans={loans || []} />
        </DialogContent>
      </Dialog>

      <Dialog open={complianceReportOpen} onOpenChange={setComplianceReportOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compliance Report Generator</DialogTitle>
            <DialogDescription>
              Automated quarterly regulatory filings with comprehensive portfolio analysis
            </DialogDescription>
          </DialogHeader>
          <ComplianceReportGenerator loans={loans || []} alerts={alerts || []} />
        </DialogContent>
      </Dialog>

      <Dialog open={multiPeriodOpen} onOpenChange={setMultiPeriodOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Multi-Period Report Comparison</DialogTitle>
            <DialogDescription>
              Analyze trends and performance across Q1, Q2, and Q3
            </DialogDescription>
          </DialogHeader>
          <MultiPeriodComparison 
            loans={loans || []} 
            alerts={alerts || []} 
            teamMembers={teamMembers || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App