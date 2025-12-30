import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Loan, CovenantStatus, PriceAlertThreshold } from '@/lib/types'
import { RiskGauge } from './RiskGauge'
import { AIInsightCard } from './AIInsightCard'
import { AILoanSummarizer } from './AILoanSummarizer'
import { PriceAlertsManager } from './PriceAlertsManager'
import { CheckCircle, Warning, XCircle, Leaf, TrendUp, ShieldWarning, Brain, Bell } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LoanDetailDialogProps {
  loan: Loan | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateLoan?: (loan: Loan) => void
}

export function LoanDetailDialog({ loan, open, onOpenChange, onUpdateLoan }: LoanDetailDialogProps) {
  if (!loan) return null

  const handlePriceAlertsUpdate = (alerts: PriceAlertThreshold[]) => {
    if (onUpdateLoan) {
      onUpdateLoan({ ...loan, priceAlerts: alerts })
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCovenantIcon = (status: CovenantStatus) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle size={20} weight="fill" className="text-success" />
      case 'at-risk':
        return <Warning size={20} weight="fill" className="text-warning" />
      case 'breached':
        return <XCircle size={20} weight="fill" className="text-destructive" />
    }
  }

  const getCovenantColor = (status: CovenantStatus) => {
    switch (status) {
      case 'compliant':
        return 'bg-success/10 text-success border-success/20'
      case 'at-risk':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'breached':
        return 'bg-destructive/10 text-destructive border-destructive/20'
    }
  }

  const getESGColor = (rating: string) => {
    const colors = {
      'A': 'bg-success text-success-foreground',
      'B': 'bg-success/70 text-success-foreground',
      'C': 'bg-warning text-warning-foreground',
      'D': 'bg-orange-500 text-white',
      'F': 'bg-destructive text-destructive-foreground'
    }
    return colors[rating as keyof typeof colors] || colors.C
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl mb-2">{loan.borrowerName}</DialogTitle>
              <p className="text-muted-foreground">{loan.industry} • Loan ID: {loan.id}</p>
            </div>
            <Badge className="text-sm px-3 py-1">
              {loan.status.replace('-', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-summary" className="gap-1.5">
              <Brain size={16} />
              AI Summary
            </TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="covenants">Covenants</TabsTrigger>
            <TabsTrigger value="esg">ESG Score</TabsTrigger>
            <TabsTrigger value="price-alerts" className="gap-1.5">
              <Bell size={16} />
              Price Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Principal Amount</p>
                    <p className="text-2xl font-bold font-mono">{formatCurrency(loan.amount, loan.currency)}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold font-mono">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Currency</p>
                      <p className="text-lg font-semibold font-mono">{loan.currency}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Origination Date</p>
                    <p className="font-medium">{formatDate(loan.originationDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Maturity Date</p>
                    <p className="font-medium">{formatDate(loan.maturityDate)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                    <p className="font-medium">{loan.purpose}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <RiskGauge score={loan.riskScore} size="lg" />
                </CardContent>
              </Card>
            </div>

            <AIInsightCard
              title="AI Recommendation"
              insight={`Based on analysis of ${loan.borrowerName}'s loan structure, the ${loan.riskLevel} risk profile suggests ${
                loan.riskScore <= 5 
                  ? 'favorable terms with strong covenant compliance. Consider this borrower for additional facilities.'
                  : 'enhanced monitoring is recommended. Schedule quarterly reviews and implement stricter reporting requirements.'
              }`}
              type={loan.riskScore <= 5 ? 'success' : 'warning'}
            />
          </TabsContent>

          <TabsContent value="ai-summary" className="mt-6">
            <AILoanSummarizer loan={loan} />
          </TabsContent>

          <TabsContent value="risk" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldWarning size={24} className="text-accent" />
                  Risk Factor Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Credit Risk</span>
                    <span className="text-sm font-mono font-semibold">{loan.riskFactors.credit}/10</span>
                  </div>
                  <Progress value={loan.riskFactors.credit * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Market Risk</span>
                    <span className="text-sm font-mono font-semibold">{loan.riskFactors.market}/10</span>
                  </div>
                  <Progress value={loan.riskFactors.market * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Operational Risk</span>
                    <span className="text-sm font-mono font-semibold">{loan.riskFactors.operational}/10</span>
                  </div>
                  <Progress value={loan.riskFactors.operational * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ESG Risk</span>
                    <span className="text-sm font-mono font-semibold">{loan.riskFactors.esg}/10</span>
                  </div>
                  <Progress value={loan.riskFactors.esg * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <AIInsightCard
              title="Risk Mitigation Strategy"
              insight={`Primary risk driver: ${
                Object.entries(loan.riskFactors).reduce((a, b) => a[1] > b[1] ? a : b)[0]
              } risk. Recommendation: ${
                loan.riskFactors.credit > 6 
                  ? 'Request additional collateral or personal guarantees to mitigate credit exposure.'
                  : loan.riskFactors.market > 6
                  ? 'Consider interest rate hedging instruments to protect against market volatility.'
                  : loan.riskFactors.operational > 6
                  ? 'Implement enhanced operational due diligence and quarterly management reviews.'
                  : 'Engage with borrower on ESG improvement roadmap with measurable KPIs.'
              }`}
              type="info"
            />
          </TabsContent>

          <TabsContent value="covenants" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {loan.covenants.map((covenant) => (
                <Card key={covenant.id} className={cn('border-2', getCovenantColor(covenant.status))}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getCovenantIcon(covenant.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold">{covenant.type}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{covenant.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {covenant.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Threshold</p>
                            <p className="font-mono font-semibold">{covenant.threshold}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Current Value</p>
                            <p className="font-mono font-semibold">{covenant.currentValue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last Checked</p>
                            <p className="text-sm">{formatDate(covenant.lastChecked)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loan.covenants.filter(c => c.status !== 'compliant').length > 0 && (
              <AIInsightCard
                title="Covenant Alert"
                insight={`${loan.covenants.filter(c => c.status === 'breached').length} covenant(s) breached, ${
                  loan.covenants.filter(c => c.status === 'at-risk').length
                } at risk. Immediate action required: Schedule borrower meeting to discuss remediation plan and potential waiver agreements.`}
                type="warning"
              />
            )}
          </TabsContent>

          <TabsContent value="esg" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf size={24} className="text-success" />
                  ESG Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Overall ESG Rating</span>
                  <Badge className={cn('text-2xl font-bold px-4 py-2', getESGColor(loan.esgScore.overall))}>
                    {loan.esgScore.overall}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Environmental</span>
                      <span className="text-sm font-mono font-semibold">{loan.esgScore.environmental}/100</span>
                    </div>
                    <Progress value={loan.esgScore.environmental} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Social</span>
                      <span className="text-sm font-mono font-semibold">{loan.esgScore.social}/100</span>
                    </div>
                    <Progress value={loan.esgScore.social} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Governance</span>
                      <span className="text-sm font-mono font-semibold">{loan.esgScore.governance}/100</span>
                    </div>
                    <Progress value={loan.esgScore.governance} className="h-2" />
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Assessment Notes</p>
                  <p className="text-sm leading-relaxed">{loan.esgScore.notes}</p>
                </div>
              </CardContent>
            </Card>

            <AIInsightCard
              title="ESG Enhancement Opportunity"
              insight={`${loan.borrowerName} shows ${
                loan.esgScore.environmental < 60 
                  ? 'potential for environmental improvements. Recommend linking interest rate to sustainability KPIs (green loan framework).'
                  : loan.esgScore.social < 60
                  ? 'opportunities in social impact. Consider sustainability-linked loan terms with social metrics.'
                  : 'strong ESG performance. Eligible for green bond financing and favorable ESG-linked pricing.'
              }`}
              type="success"
            />
          </TabsContent>

          <TabsContent value="price-alerts" className="space-y-6 mt-6">
            {loan.marketPricing ? (
              <PriceAlertsManager loan={loan} onUpdate={handlePriceAlertsUpdate} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Market pricing data not available for this loan. Price alerts require active pricing data.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
