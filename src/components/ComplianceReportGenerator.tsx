import { useState } from 'react'
import { Loan } from '../lib/types'
import { Alert } from '../lib/alertTypes'
import { ComplianceReport } from '../lib/complianceReportTypes'
import { complianceReportService, regulatoryFrameworks } from '../lib/complianceReportService'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  Warning, 
  Table,
  FilePdf,
  Sparkle,
  ShieldCheck,
  TrendUp,
  Users,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ComplianceReportGeneratorProps {
  loans: Loan[]
  alerts: Alert[]
}

export function ComplianceReportGenerator({ loans, alerts }: ComplianceReportGeneratorProps) {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['basel-iii', 'lma-disclosure'])
  const [generatedReport, setGeneratedReport] = useState<ComplianceReport | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('exec-summary')

  const handleGenerateReport = async () => {
    if (selectedFrameworks.length === 0) {
      toast.error('Please select at least one regulatory framework')
      return
    }

    setIsGenerating(true)
    toast.info('Generating compliance report...', {
      description: 'Analyzing portfolio data and regulatory requirements',
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const report = complianceReportService.generateQuarterlyReport(
        loans,
        alerts,
        selectedQuarter,
        selectedYear,
        selectedFrameworks
      )

      setGeneratedReport(report)
      toast.success('Compliance report generated successfully!', {
        description: `${report.sections.length} sections compiled for ${selectedQuarter} ${selectedYear}`,
      })
    } catch (error) {
      toast.error('Failed to generate report', {
        description: 'Please try again or contact support',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = () => {
    if (!generatedReport) return
    
    toast.success('Exporting to PDF...', {
      description: 'Generating downloadable PDF document',
    })

    setTimeout(() => {
      const content = complianceReportService.exportToPDF(generatedReport)
      content.then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Compliance_Report_${generatedReport.quarter}_${generatedReport.fiscalYear}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('PDF exported successfully!')
      })
    }, 500)
  }

  const handleExportExcel = () => {
    if (!generatedReport) return
    
    toast.success('Exporting to Excel...', {
      description: 'Generating downloadable spreadsheet',
    })

    setTimeout(() => {
      const content = complianceReportService.exportToExcel(generatedReport)
      content.then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Compliance_Report_${generatedReport.quarter}_${generatedReport.fiscalYear}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Excel file exported successfully!')
      })
    }, 500)
  }

  const handleFinalizeReport = () => {
    if (!generatedReport) return
    
    setGeneratedReport({
      ...generatedReport,
      status: 'finalized',
    })
    
    toast.success('Report finalized', {
      description: 'Report is now ready for submission',
    })
  }

  const handleSubmitReport = () => {
    if (!generatedReport || generatedReport.status !== 'finalized') return
    
    setGeneratedReport({
      ...generatedReport,
      status: 'submitted',
      submittedDate: new Date().toISOString(),
      submittedBy: 'Current User',
    })
    
    toast.success('Report submitted to regulators', {
      description: 'Confirmation receipt will be sent via email',
    })
  }

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'finalized': return 'default'
      case 'submitted': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock size={16} />
      case 'finalized': return <CheckCircle size={16} className="text-success" />
      case 'submitted': return <ShieldCheck size={16} className="text-primary" />
      default: return <Warning size={16} />
    }
  }

  const currentSection = generatedReport?.sections.find(s => s.id === selectedSection)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText size={32} weight="bold" className="text-primary" />
          Automated Compliance Report Generation
        </h2>
        <p className="text-muted-foreground mt-1">
          Generate comprehensive quarterly regulatory filings with automated data aggregation and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Report Configuration
            </CardTitle>
            <CardDescription>Select reporting period and regulatory frameworks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Reporting Quarter</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Jan - Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr - Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul - Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct - Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Regulatory Frameworks</Label>
              {regulatoryFrameworks.map(framework => (
                <div key={framework.id} className="flex items-start gap-3">
                  <Checkbox
                    id={framework.id}
                    checked={selectedFrameworks.includes(framework.id)}
                    onCheckedChange={() => toggleFramework(framework.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={framework.id} className="text-sm font-medium cursor-pointer">
                      {framework.shortName}
                    </label>
                    <p className="text-xs text-muted-foreground">{framework.jurisdiction}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating || selectedFrameworks.length === 0}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Clock size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle size={20} />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {!generatedReport ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Configure the reporting period and select regulatory frameworks to generate your automated compliance report
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md text-sm">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-semibold text-foreground mb-1">Portfolio Data</div>
                    <div className="text-muted-foreground">{loans.length} loans analyzed</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-semibold text-foreground mb-1">Alert History</div>
                    <div className="text-muted-foreground">{alerts.length} alerts tracked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Report Summary
                        <Badge variant={getStatusColor(generatedReport.status)}>
                          {getStatusIcon(generatedReport.status)}
                          {generatedReport.status.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {generatedReport.quarter} {generatedReport.fiscalYear} | Generated {new Date(generatedReport.generatedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                        <FileText size={16} className="mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        <Table size={16} className="mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <FilePdf size={16} className="mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Loans</div>
                      <div className="text-2xl font-bold font-mono">{generatedReport.summary.totalLoans}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Exposure</div>
                      <div className="text-2xl font-bold font-mono">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(generatedReport.summary.totalExposure)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Covenant Compliance</div>
                      <div className="text-2xl font-bold font-mono">{generatedReport.summary.covenantComplianceRate.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Capital Ratio</div>
                      <div className="text-2xl font-bold font-mono text-success">{generatedReport.summary.capitalAdequacyRatio.toFixed(1)}%</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Key Findings</div>
                    <ul className="space-y-1.5">
                      {generatedReport.summary.keyFindings.map((finding, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendUp size={16} className="text-accent mt-0.5 flex-shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Sections ({generatedReport.sections.length})</CardTitle>
                  <CardDescription>All required regulatory disclosures included</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedReport.sections.map(section => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedSection(section.id)
                          setPreviewOpen(true)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{section.sectionNumber}</span>
                          </div>
                          <div>
                            <div className="font-medium">{section.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {section.requiredByRegulation.length} frameworks
                            </div>
                          </div>
                        </div>
                        <Badge variant={section.status === 'complete' ? 'default' : 'secondary'}>
                          {section.status === 'complete' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                          {section.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {generatedReport.status === 'draft' && (
                <div className="flex items-center gap-3">
                  <Button onClick={handleFinalizeReport} className="flex-1 gap-2" size="lg">
                    <CheckCircle size={20} />
                    Finalize Report
                  </Button>
                </div>
              )}

              {generatedReport.status === 'finalized' && (
                <div className="flex items-center gap-3">
                  <Button onClick={handleSubmitReport} className="flex-1 gap-2" size="lg">
                    <ShieldCheck size={20} />
                    Submit to Regulators
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedReport({ ...generatedReport, status: 'draft' })}>
                    Revert to Draft
                  </Button>
                </div>
              )}

              {generatedReport.status === 'submitted' && (
                <Card className="border-success bg-success/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                        <ShieldCheck size={24} className="text-success" />
                      </div>
                      <div>
                        <div className="font-semibold text-success">Report Successfully Submitted</div>
                        <div className="text-sm text-muted-foreground">
                          Submitted on {new Date(generatedReport.submittedDate!).toLocaleDateString()} by {generatedReport.submittedBy}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {generatedReport?.quarter} {generatedReport?.fiscalYear} Compliance Report
            </DialogDescription>
          </DialogHeader>

          {generatedReport && (
            <Tabs value={selectedSection} onValueChange={setSelectedSection}>
              <TabsList className="grid w-full grid-cols-4">
                {generatedReport.sections.slice(0, 8).map(section => (
                  <TabsTrigger key={section.id} value={section.id} className="text-xs">
                    {section.sectionNumber}. {section.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {generatedReport.sections.map(section => (
                <TabsContent key={section.id} value={section.id} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {section.sectionNumber}. {section.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        Required by: {section.requiredByRegulation.join(', ')}
                      </Badge>
                      <Badge variant={section.status === 'complete' ? 'default' : 'secondary'} className="text-xs">
                        {section.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{section.content}</div>
                  </div>

                  {section.tables && section.tables.length > 0 && (
                    <div className="space-y-4 mt-6">
                      {section.tables.map(table => (
                        <div key={table.id} className="border rounded-lg overflow-hidden">
                          <div className="bg-muted px-4 py-2 font-semibold text-sm">
                            {table.title}
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  {table.headers.map((header, i) => (
                                    <th key={i} className="px-4 py-2 text-left font-medium">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map((row, i) => (
                                  <tr key={i} className="border-t">
                                    {row.map((cell, j) => (
                                      <td key={j} className="px-4 py-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {table.notes && (
                            <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                              Note: {table.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ComplianceReportGeneratorTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <FileText size={20} />
      Compliance Reports
    </Button>
  )
}
