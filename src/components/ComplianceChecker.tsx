import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loan, LMACompliance } from '@/lib/types'
import { CheckCircle, Warning, XCircle, FileText, ShieldCheck } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { AIInsightCard } from './AIInsightCard'

interface ComplianceCheckerProps {
  loans: Loan[]
}

export function ComplianceChecker({ loans }: ComplianceCheckerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const loansWithCompliance = loans.filter(loan => loan.lmaCompliance)

  const avgComplianceScore = loansWithCompliance.length > 0
    ? loansWithCompliance.reduce((sum, loan) => sum + (loan.lmaCompliance?.overallScore || 0), 0) / loansWithCompliance.length
    : 0

  const fullyCompliant = loansWithCompliance.filter(l => l.lmaCompliance?.level === 'full').length
  const partialCompliance = loansWithCompliance.filter(l => l.lmaCompliance?.level === 'partial').length
  const nonCompliant = loansWithCompliance.filter(l => l.lmaCompliance?.level === 'non-compliant').length

  const totalGaps = loansWithCompliance.reduce((sum, loan) => 
    sum + (loan.lmaCompliance?.gaps.length || 0), 0
  )

  const highSeverityGaps = loansWithCompliance.reduce((sum, loan) => 
    sum + (loan.lmaCompliance?.gaps.filter(g => g.severity === 'high').length || 0), 0
  )

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'full':
        return 'bg-success text-success-foreground'
      case 'partial':
        return 'bg-warning text-warning-foreground'
      case 'non-compliant':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle size={18} weight="fill" className="text-destructive" />
      case 'medium':
        return <Warning size={18} weight="fill" className="text-warning" />
      case 'low':
        return <CheckCircle size={18} weight="fill" className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldCheck size={32} className="text-accent" weight="bold" />
          LMA Standards Compliance
        </h2>
        <p className="text-muted-foreground mt-1">
          Automated verification against Loan Market Association frameworks
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {avgComplianceScore.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fully Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">{fullyCompliant}</div>
            <p className="text-xs text-muted-foreground mt-2">100% LMA aligned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalGaps}</div>
            <p className="text-xs text-muted-foreground mt-2">{highSeverityGaps} high severity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-warning">{partialCompliance + nonCompliant}</div>
            <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {highSeverityGaps > 0 && (
        <AIInsightCard
          title="Compliance Priority Alert"
          insight={`${highSeverityGaps} high-severity gap(s) detected across your portfolio. These represent material deviations from LMA standards and should be remediated immediately to ensure enforceability and market acceptance. Estimated legal review cost: $${(highSeverityGaps * 2500).toLocaleString()}.`}
          type="warning"
        />
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">{fullyCompliant}</div>
              <p className="text-sm font-medium">Fully Compliant</p>
              <p className="text-xs text-muted-foreground mt-1">Market-ready documentation</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">{partialCompliance}</div>
              <p className="text-sm font-medium">Partial Compliance</p>
              <p className="text-xs text-muted-foreground mt-1">Minor adjustments needed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive mb-2">{nonCompliant}</div>
              <p className="text-sm font-medium">Non-Compliant</p>
              <p className="text-xs text-muted-foreground mt-1">Significant gaps identified</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loan Compliance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loansWithCompliance.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No compliance assessments yet</h3>
              <p className="text-muted-foreground mb-6">Upload loan documents to run LMA compliance checks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loansWithCompliance.map(loan => {
                const compliance = loan.lmaCompliance!

                return (
                  <Card key={loan.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{loan.borrowerName}</h3>
                            <Badge className={getComplianceColor(compliance.level)}>
                              {compliance.level === 'full' ? 'Fully Compliant' :
                               compliance.level === 'partial' ? 'Partial Compliance' :
                               'Non-Compliant'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Standard: {compliance.standardVersion}</span>
                            <span>•</span>
                            <span>Assessed: {formatDate(compliance.assessmentDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold font-mono">{compliance.overallScore}%</div>
                          <p className="text-xs text-muted-foreground">Compliance Score</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Progress value={compliance.overallScore} className="h-2" />
                      </div>

                      {compliance.gaps.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h4 className="text-sm font-semibold mb-3">
                              Identified Gaps ({compliance.gaps.length})
                            </h4>
                            <div className="space-y-2">
                              {compliance.gaps.map((gap, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg border',
                                    gap.severity === 'high' ? 'bg-destructive/5 border-destructive/20' :
                                    gap.severity === 'medium' ? 'bg-warning/5 border-warning/20' :
                                    'bg-muted/50 border-border'
                                  )}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getSeverityIcon(gap.severity)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold">{gap.section}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {gap.severity} severity
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{gap.issue}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {compliance.gaps.length === 0 && (
                        <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg p-3">
                          <CheckCircle size={20} weight="fill" />
                          <span className="text-sm font-medium">
                            No compliance gaps detected - fully aligned with LMA standards
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">LMA Framework Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Key Clauses Verified</h4>
              {[
                { name: 'Definitions & Interpretation', coverage: 95 },
                { name: 'Representations & Warranties', coverage: 92 },
                { name: 'Financial Covenants', coverage: 88 },
                { name: 'Events of Default', coverage: 100 },
              ].map(clause => (
                <div key={clause.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{clause.name}</span>
                    <span className="text-sm font-mono font-semibold">{clause.coverage}%</span>
                  </div>
                  <Progress value={clause.coverage} className="h-1.5" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Documentation Standards</h4>
              {[
                { name: 'Facility Agreement Structure', coverage: 100 },
                { name: 'Pricing & Fees', coverage: 85 },
                { name: 'Security Documentation', coverage: 78 },
                { name: 'Intercreditor Provisions', coverage: 90 },
              ].map(clause => (
                <div key={clause.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{clause.name}</span>
                    <span className="text-sm font-mono font-semibold">{clause.coverage}%</span>
                  </div>
                  <Progress value={clause.coverage} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AIInsightCard
        title="Standardization Recommendation"
        insight={`Portfolio analysis shows ${avgComplianceScore.toFixed(0)}% average compliance with LMA standards. ${
          avgComplianceScore >= 90 
            ? 'Excellent standardization supports efficient secondary market trading and reduces legal risk exposure.'
            : avgComplianceScore >= 75
            ? 'Good foundation but recommend addressing remaining gaps to enhance marketability and reduce negotiation friction in future transactions.'
            : 'Significant standardization opportunity exists. Adopting LMA templates could reduce legal review time by 40-60% and improve pricing by 15-25 basis points due to enhanced market acceptance.'
        } Estimated annual savings from full standardization: $${((loans.length * 15000) * (1 - avgComplianceScore / 100)).toLocaleString()}.`}
        type={avgComplianceScore >= 90 ? 'success' : 'info'}
      />
    </div>
  )
}
