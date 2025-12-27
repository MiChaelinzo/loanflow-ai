import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Loan } from '../lib/types'
import { FileText, FilePdf, FileXls, Download, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loans: Loan[]
}

export function ExportDialog({ open, onOpenChange, loans }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')
  const [reportType, setReportType] = useState<'full' | 'executive' | 'regulatory' | 'investor'>('full')
  const [includeAnalytics, setIncludeAnalytics] = useState(true)
  const [includeRisk, setIncludeRisk] = useState(true)
  const [includeCovenants, setIncludeCovenants] = useState(true)
  const [includeESG, setIncludeESG] = useState(true)
  const [includeTrading, setIncludeTrading] = useState(false)

  const handleExport = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        reportType,
        format: exportFormat,
        generatedBy: 'LoanFlow AI',
        version: '1.0',
      },
      summary: {
        totalLoans: loans.length,
        totalExposure: loans.reduce((sum, l) => sum + l.amount, 0),
        averageRiskScore: loans.reduce((sum, l) => sum + l.riskScore, 0) / loans.length,
        covenantCompliance: (
          (loans.reduce((sum, l) => {
            const compliant = l.covenants.filter(c => c.status === 'compliant').length
            return sum + (l.covenants.length > 0 ? compliant / l.covenants.length : 1)
          }, 0) / loans.length) * 100
        ),
        averageESG: loans.map(l => {
          const scoreMap = { A: 5, B: 4, C: 3, D: 2, F: 1 }
          return scoreMap[l.esgScore.overall]
        }).reduce((sum, s) => sum + s, 0) / loans.length,
      },
      loans: loans.map(loan => {
        const base = {
          id: loan.id,
          borrowerName: loan.borrowerName,
          amount: loan.amount,
          currency: loan.currency,
          interestRate: loan.interestRate,
          maturityDate: loan.maturityDate,
          originationDate: loan.originationDate,
          status: loan.status,
          industry: loan.industry,
          purpose: loan.purpose,
        }

        return {
          ...base,
          ...(includeRisk && {
            riskScore: loan.riskScore,
            riskLevel: loan.riskLevel,
            riskFactors: loan.riskFactors,
          }),
          ...(includeCovenants && {
            covenants: loan.covenants.map(c => ({
              type: c.type,
              description: c.description,
              threshold: c.threshold,
              currentValue: c.currentValue,
              status: c.status,
              lastChecked: c.lastChecked,
            })),
          }),
          ...(includeESG && {
            esgScore: loan.esgScore,
          }),
          ...(includeAnalytics && {
            predictiveAnalytics: loan.predictiveAnalytics,
            lmaCompliance: loan.lmaCompliance,
          }),
          ...(includeTrading && loan.tradeListing && {
            tradeListing: {
              askPrice: loan.tradeListing.askPrice,
              status: loan.tradeListing.status,
              bids: loan.tradeListing.bids.length,
              views: loan.tradeListing.views,
            },
          }),
        }
      }),
    }

    let blob: Blob
    let filename: string

    if (exportFormat === 'json') {
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      filename = `loanflow-${reportType}-${new Date().toISOString().split('T')[0]}.json`
    } else if (exportFormat === 'csv') {
      const headers = [
        'ID', 'Borrower', 'Amount', 'Currency', 'Interest Rate', 'Maturity Date', 
        'Status', 'Industry', 'Risk Score', 'ESG Rating'
      ]
      const rows = loans.map(loan => [
        loan.id,
        loan.borrowerName,
        loan.amount,
        loan.currency,
        loan.interestRate,
        loan.maturityDate,
        loan.status,
        loan.industry,
        loan.riskScore.toFixed(2),
        loan.esgScore.overall,
      ])
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      blob = new Blob([csvContent], { type: 'text/csv' })
      filename = `loanflow-${reportType}-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      const pdfContent = `
LOANFLOW AI - ${reportType.toUpperCase()} REPORT
Generated: ${new Date().toLocaleDateString()}

PORTFOLIO SUMMARY
================
Total Loans: ${loans.length}
Total Exposure: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(exportData.summary.totalExposure)}
Average Risk Score: ${exportData.summary.averageRiskScore.toFixed(2)}
Covenant Compliance: ${exportData.summary.covenantCompliance.toFixed(1)}%

LOAN DETAILS
============
${loans.map(loan => `
${loan.borrowerName} (${loan.id})
  Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: loan.currency }).format(loan.amount)}
  Risk Score: ${loan.riskScore.toFixed(2)} (${loan.riskLevel})
  ESG Rating: ${loan.esgScore.overall}
  Status: ${loan.status}
  Maturity: ${new Date(loan.maturityDate).toLocaleDateString()}
`).join('\n')}
      `.trim()
      blob = new Blob([pdfContent], { type: 'text/plain' })
      filename = `loanflow-${reportType}-${new Date().toISOString().split('T')[0]}.txt`
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Export complete', {
      description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded as ${exportFormat.toUpperCase()}`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={24} />
            Export Portfolio Report
          </DialogTitle>
          <DialogDescription>
            Generate comprehensive reports for stakeholders and regulatory compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Portfolio Report</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="regulatory">Regulatory Filing</SelectItem>
                  <SelectItem value="investor">Investor Package</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      JSON (Structured Data)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileXls size={16} />
                      CSV (Excel Compatible)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FilePdf size={16} />
                      Text Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">Include in Report</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="risk"
                  checked={includeRisk}
                  onCheckedChange={(checked) => setIncludeRisk(!!checked)}
                />
                <label htmlFor="risk" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2">
                  Risk Assessment Data
                  <Badge variant="secondary" className="text-xs">Essential</Badge>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="covenants"
                  checked={includeCovenants}
                  onCheckedChange={(checked) => setIncludeCovenants(!!checked)}
                />
                <label htmlFor="covenants" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2">
                  Covenant Monitoring
                  <Badge variant="secondary" className="text-xs">Essential</Badge>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={includeAnalytics}
                  onCheckedChange={(checked) => setIncludeAnalytics(!!checked)}
                />
                <label htmlFor="analytics" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Predictive Analytics & LMA Compliance
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="esg"
                  checked={includeESG}
                  onCheckedChange={(checked) => setIncludeESG(!!checked)}
                />
                <label htmlFor="esg" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  ESG Scores & Green Lending Data
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trading"
                  checked={includeTrading}
                  onCheckedChange={(checked) => setIncludeTrading(!!checked)}
                />
                <label htmlFor="trading" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Secondary Market Trading Information
                </label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Loans to export</span>
              <span className="font-mono font-bold">{loans.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total exposure</span>
              <span className="font-mono font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(loans.reduce((sum, l) => sum + l.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download size={20} />
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
