import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Loan } from './lib/types'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { LoanCard } from './components/LoanCard'
import { DocumentUploadDialog } from './components/DocumentUploadDialog'
import { LoanDetailDialog } from './components/LoanDetailDialog'
import { UploadSimple, MagnifyingGlass, Brain, ChartLine, ShieldCheck, Leaf, Funnel } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const [loans, setLoans] = useKV<Loan[]>('loans', [])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')

  const handleUploadComplete = (extractedData: any) => {
    const newLoan: Loan = {
      id: `LOAN-${Date.now()}`,
      borrowerName: extractedData.borrowerName,
      amount: extractedData.amount,
      currency: extractedData.currency,
      interestRate: extractedData.interestRate,
      maturityDate: extractedData.maturityDate,
      originationDate: extractedData.originationDate,
      status: 'active',
      riskScore: Math.random() * 3 + 2,
      riskLevel: 'low',
      riskFactors: {
        credit: Math.random() * 3 + 2,
        market: Math.random() * 3 + 2,
        operational: Math.random() * 3 + 2,
        esg: Math.random() * 3 + 2,
      },
      covenants: [
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
        overall: 'B',
        environmental: 72,
        social: 68,
        governance: 75,
        notes: 'Strong governance framework with improving environmental practices.',
      },
      industry: 'Manufacturing',
      purpose: 'Working capital and expansion',
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

  const filteredLoans = (loans || []).filter((loan) => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.industry.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter
    const matchesRisk = riskFilter === 'all' || loan.riskLevel === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
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
                <p className="text-sm text-muted-foreground">Intelligent Loan Management</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <UploadSimple size={20} />
              Upload Loan Document
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
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
            <div className="flex gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by borrower or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
            </div>

            <Separator />

            {filteredLoans.length === 0 && (loans || []).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
                <p className="text-muted-foreground mb-6">Upload your first loan document to get started with AI-powered analysis</p>
                <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                  <UploadSimple size={20} />
                  Upload Document
                </Button>
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
      </main>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />

      <LoanDetailDialog
        loan={selectedLoan}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  )
}

export default App