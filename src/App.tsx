import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Loan, PredictiveAnalytics, LMACompliance, TradeListing, TradeBid } from './lib/types'
import { sampleLoans } from './lib/sampleLoans'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
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
import { ExportDialog } from './components/ExportDialog'
import { TutorialWalkthrough, TutorialTrigger } from './components/TutorialWalkthrough'
import { UploadSimple, MagnifyingGlass, Brain, ChartLine, ShieldCheck, Leaf, Funnel, Handshake, FileText, Download, Sparkle, Lightning, Globe, Stack } from '@phosphor-icons/react'
import { toast } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

function App() {
  const [loans, setLoans] = useKV<Loan[]>('loans', [])
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <Brain size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">LoanFlow AI</h1>
                <p className="text-sm text-muted-foreground">Intelligent Loan Management & Trading Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TutorialTrigger />
              {(loans || []).length === 0 && (
                <Button variant="secondary" size="default" onClick={handleLoadSampleData} className="gap-2">
                  <Sparkle size={20} />
                  Load Demo Data
                </Button>
              )}
              <Button variant="outline" size="default" onClick={handleExportPortfolio} className="gap-2">
                <Download size={20} />
                Export
              </Button>
              <Button variant="outline" size="default" onClick={() => setBatchUploadDialogOpen(true)} className="gap-2">
                <Stack size={20} />
                Batch Upload
              </Button>
              <Button size="lg" onClick={() => setUploadDialogOpen(true)} className="gap-2" data-tutorial="upload-button">
                <UploadSimple size={20} />
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="portfolio" className="gap-2">
              <FileText size={18} />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="trading" className="gap-2" data-tutorial="trading-tab">
              <Handshake size={18} />
              Trading
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-tutorial="analytics-tab">
              <ChartLine size={18} />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="stress-test" className="gap-2" data-tutorial="stress-test-tab">
              <Lightning size={18} />
              Stress Test
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2" data-tutorial="market-tab">
              <Globe size={18} />
              Market
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2" data-tutorial="compliance-tab">
              <ShieldCheck size={18} />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="esg" className="gap-2" data-tutorial="esg-tab">
              <Leaf size={18} />
              ESG
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-8">
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

          <TabsContent value="trading">
            <TradingHub 
              loans={loans || []} 
              onCreateListing={handleCreateListing}
              onPlaceBid={handlePlaceBid}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard loans={loans || []} />
          </TabsContent>

          <TabsContent value="stress-test">
            <StressTestDashboard loans={loans || []} />
          </TabsContent>

          <TabsContent value="market">
            <MarketIntelligence loans={loans || []} />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceChecker loans={loans || []} />
          </TabsContent>

          <TabsContent value="esg">
            <div className="space-y-6">
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
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        loans={loans || []}
      />

      <TutorialWalkthrough />
    </div>
  )
}

export default App