import { useState } from 'react'
import { Loan } from '@/lib/types'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Warning,
  TrendUp,
  TrendDown,
  Equals
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LoanComparisonProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loans: Loan[]
}

export function LoanComparison({ open, onOpenChange, loans }: LoanComparisonProps) {
  const [loan1Id, setLoan1Id] = useState<string>('')
  const [loan2Id, setLoan2Id] = useState<string>('')
  const [loan3Id, setLoan3Id] = useState<string>('')

  const loan1 = loans.find(l => l.id === loan1Id)
  const loan2 = loans.find(l => l.id === loan2Id)
  const loan3 = loan3Id ? loans.find(l => l.id === loan3Id) : undefined

  const selectedLoans = [loan1, loan2, loan3].filter(Boolean) as Loan[]

  const compareMetric = (metric1: number, metric2: number, lowerIsBetter: boolean = false) => {
    const diff = metric1 - metric2
    if (Math.abs(diff) < 0.01) {
      return <Equals size={16} className="text-muted-foreground" />
    }
    if (lowerIsBetter) {
      return diff < 0 ? 
        <CheckCircle size={16} className="text-success" weight="fill" /> : 
        <Warning size={16} className="text-warning" weight="fill" />
    }
    return diff > 0 ? 
      <CheckCircle size={16} className="text-success" weight="fill" /> : 
      <Warning size={16} className="text-warning" weight="fill" />
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-success'
      case 'medium': return 'text-warning'
      case 'high': return 'text-destructive'
      case 'critical': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getEsgColor = (score: string) => {
    switch (score) {
      case 'A': return 'text-success'
      case 'B': return 'text-success'
      case 'C': return 'text-warning'
      case 'D': return 'text-destructive'
      case 'F': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const ComparisonRow = ({ 
    label, 
    values, 
    isBetter,
    type = 'text'
  }: { 
    label: string
    values: (string | number | undefined)[]
    isBetter?: (number | undefined)[]
    type?: 'text' | 'currency' | 'percent' | 'date' | 'risk' | 'esg'
  }) => (
    <div className="grid grid-cols-4 gap-4 py-3 border-b last:border-b-0">
      <div className="font-medium text-sm text-muted-foreground">{label}</div>
      {values.map((value, idx) => (
        <div key={idx} className="flex items-center justify-between">
          <span className={`text-sm ${
            type === 'risk' && typeof value === 'string' ? getRiskColor(value) : 
            type === 'esg' && typeof value === 'string' ? getEsgColor(value) : ''
          }`}>
            {type === 'currency' && typeof value === 'number' 
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(value)
              : type === 'percent' && typeof value === 'number'
              ? `${value.toFixed(2)}%`
              : type === 'date' && value
              ? new Date(value as string).toLocaleDateString()
              : value || 'N/A'
            }
          </span>
          {isBetter && isBetter[idx] !== undefined && (
            <span className="ml-2">
              {isBetter[idx] === 1 ? (
                <CheckCircle size={16} className="text-success" weight="fill" />
              ) : isBetter[idx] === -1 ? (
                <Warning size={16} className="text-warning" weight="fill" />
              ) : (
                <Equals size={16} className="text-muted-foreground" />
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch size={24} />
            Loan Comparison
          </DialogTitle>
          <DialogDescription>
            Compare up to 3 loans side-by-side to identify the best opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loan 1</label>
              <Select value={loan1Id} onValueChange={setLoan1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map(loan => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.borrowerName} - {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: loan.currency,
                        notation: 'compact'
                      }).format(loan.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loan 2</label>
              <Select value={loan2Id} onValueChange={setLoan2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.filter(l => l.id !== loan1Id).map(loan => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.borrowerName} - {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: loan.currency,
                        notation: 'compact'
                      }).format(loan.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loan 3 (Optional)</label>
              <Select value={loan3Id} onValueChange={setLoan3Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select third loan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {loans.filter(l => l.id !== loan1Id && l.id !== loan2Id).map(loan => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.borrowerName} - {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: loan.currency,
                        notation: 'compact'
                      }).format(loan.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedLoans.length < 2 && (
            <Card className="bg-muted/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Select at least 2 loans to begin comparison
                </p>
              </CardContent>
            </Card>
          )}

          {selectedLoans.length >= 2 && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                <TabsTrigger value="covenants">Covenants</TabsTrigger>
                <TabsTrigger value="esg">ESG</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Loan Headers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                      <div className="font-semibold text-sm">Metric</div>
                      {selectedLoans.map(loan => (
                        <div key={loan.id} className="font-semibold text-sm">{loan.borrowerName}</div>
                      ))}
                    </div>
                    <ComparisonRow
                      label="Loan ID"
                      values={selectedLoans.map(l => l.id)}
                    />
                    <ComparisonRow
                      label="Industry"
                      values={selectedLoans.map(l => l.industry)}
                    />
                    <ComparisonRow
                      label="Status"
                      values={selectedLoans.map(l => l.status)}
                    />
                    <ComparisonRow
                      label="Loan Amount"
                      values={selectedLoans.map(l => l.amount)}
                      type="currency"
                    />
                    <ComparisonRow
                      label="Currency"
                      values={selectedLoans.map(l => l.currency)}
                    />
                    <ComparisonRow
                      label="Interest Rate"
                      values={selectedLoans.map(l => l.interestRate)}
                      type="percent"
                    />
                    <ComparisonRow
                      label="Origination Date"
                      values={selectedLoans.map(l => l.originationDate)}
                      type="date"
                    />
                    <ComparisonRow
                      label="Maturity Date"
                      values={selectedLoans.map(l => l.maturityDate)}
                      type="date"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk Metrics</CardTitle>
                    <CardDescription>Lower risk scores indicate better credit quality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                      <div className="font-semibold text-sm">Metric</div>
                      {selectedLoans.map(loan => (
                        <div key={loan.id} className="font-semibold text-sm">{loan.borrowerName}</div>
                      ))}
                    </div>
                    <ComparisonRow
                      label="Overall Risk Score"
                      values={selectedLoans.map(l => l.riskScore.toFixed(1))}
                    />
                    <ComparisonRow
                      label="Risk Level"
                      values={selectedLoans.map(l => l.riskLevel)}
                      type="risk"
                    />
                    <ComparisonRow
                      label="Credit Risk"
                      values={selectedLoans.map(l => l.riskFactors.credit.toFixed(1))}
                    />
                    <ComparisonRow
                      label="Market Risk"
                      values={selectedLoans.map(l => l.riskFactors.market.toFixed(1))}
                    />
                    <ComparisonRow
                      label="Operational Risk"
                      values={selectedLoans.map(l => l.riskFactors.operational.toFixed(1))}
                    />
                    <ComparisonRow
                      label="ESG Risk"
                      values={selectedLoans.map(l => l.riskFactors.esg.toFixed(1))}
                    />
                    <ComparisonRow
                      label="30-Day Default Prob"
                      values={selectedLoans.map(l => l.predictiveAnalytics?.defaultProbability30d ? l.predictiveAnalytics.defaultProbability30d * 100 : 0)}
                      type="percent"
                    />
                    <ComparisonRow
                      label="90-Day Default Prob"
                      values={selectedLoans.map(l => l.predictiveAnalytics?.defaultProbability90d ? l.predictiveAnalytics.defaultProbability90d * 100 : 0)}
                      type="percent"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="covenants" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Covenant Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                      <div className="font-semibold text-sm">Metric</div>
                      {selectedLoans.map(loan => (
                        <div key={loan.id} className="font-semibold text-sm">{loan.borrowerName}</div>
                      ))}
                    </div>
                    <ComparisonRow
                      label="Total Covenants"
                      values={selectedLoans.map(l => l.covenants.length)}
                    />
                    <ComparisonRow
                      label="Compliant"
                      values={selectedLoans.map(l => 
                        l.covenants.filter(c => c.status === 'compliant').length
                      )}
                    />
                    <ComparisonRow
                      label="At Risk"
                      values={selectedLoans.map(l => 
                        l.covenants.filter(c => c.status === 'at-risk').length
                      )}
                    />
                    <ComparisonRow
                      label="Breached"
                      values={selectedLoans.map(l => 
                        l.covenants.filter(c => c.status === 'breached').length
                      )}
                    />
                    <ComparisonRow
                      label="Compliance Rate"
                      values={selectedLoans.map(l => 
                        l.covenants.length > 0 
                          ? (l.covenants.filter(c => c.status === 'compliant').length / l.covenants.length) * 100
                          : 100
                      )}
                      type="percent"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="esg" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ESG Scores</CardTitle>
                    <CardDescription>Environmental, Social, and Governance ratings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                      <div className="font-semibold text-sm">Metric</div>
                      {selectedLoans.map(loan => (
                        <div key={loan.id} className="font-semibold text-sm">{loan.borrowerName}</div>
                      ))}
                    </div>
                    <ComparisonRow
                      label="Overall ESG Score"
                      values={selectedLoans.map(l => l.esgScore.overall)}
                      type="esg"
                    />
                    <ComparisonRow
                      label="Environmental"
                      values={selectedLoans.map(l => l.esgScore.environmental.toFixed(1))}
                    />
                    <ComparisonRow
                      label="Social"
                      values={selectedLoans.map(l => l.esgScore.social.toFixed(1))}
                    />
                    <ComparisonRow
                      label="Governance"
                      values={selectedLoans.map(l => l.esgScore.governance.toFixed(1))}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">LMA Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
                      <div className="font-semibold text-sm">Metric</div>
                      {selectedLoans.map(loan => (
                        <div key={loan.id} className="font-semibold text-sm">{loan.borrowerName}</div>
                      ))}
                    </div>
                    <ComparisonRow
                      label="LMA Compliance Level"
                      values={selectedLoans.map(l => l.lmaCompliance?.level || 'N/A')}
                    />
                    <ComparisonRow
                      label="LMA Score"
                      values={selectedLoans.map(l => l.lmaCompliance?.overallScore.toFixed(1) || 'N/A')}
                    />
                    <ComparisonRow
                      label="LMA Standard"
                      values={selectedLoans.map(l => l.lmaCompliance?.standardVersion || 'N/A')}
                    />
                    <ComparisonRow
                      label="Compliance Gaps"
                      values={selectedLoans.map(l => l.lmaCompliance?.gaps.length || 0)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {selectedLoans.length >= 2 && (
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-base">Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Based on the comparison, <strong>{
                    selectedLoans.reduce((best, loan) => 
                      loan.riskScore < best.riskScore ? loan : best
                    ).borrowerName
                  }</strong> has the lowest risk score ({
                    selectedLoans.reduce((best, loan) => 
                      loan.riskScore < best.riskScore ? loan : best
                    ).riskScore.toFixed(1)
                  }) and appears to be the strongest credit quality among the selected loans.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LoanComparisonTrigger({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <GitBranch size={18} />
      Compare Loans
    </Button>
  )
}
