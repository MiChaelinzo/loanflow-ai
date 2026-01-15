import { useState } from 'react'
import { Loan } from '@/lib/types'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { 
  CheckSquare, 
  Square, 
  Trash, 
  Download, 
  Tag, 
  Users,
  X,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BulkActionsProps {
  loans: Loan[]
  selectedLoanIds: string[]
  onSelectionChange: (loanIds: string[]) => void
  onBulkDelete: (loanIds: string[]) => void
  onBulkExport: (loanIds: string[]) => void
  onBulkStatusChange: (loanIds: string[], status: string) => void
}

export function BulkActions({ 
  loans, 
  selectedLoanIds, 
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkStatusChange
}: BulkActionsProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'delete' | 'export' | 'status' | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')

  const allSelected = loans.length > 0 && selectedLoanIds.length === loans.length
  const someSelected = selectedLoanIds.length > 0 && selectedLoanIds.length < loans.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(loans.map(loan => loan.id))
    }
  }

  const handleToggleLoan = (loanId: string) => {
    if (selectedLoanIds.includes(loanId)) {
      onSelectionChange(selectedLoanIds.filter(id => id !== loanId))
    } else {
      onSelectionChange([...selectedLoanIds, loanId])
    }
  }

  const handleBulkAction = (action: 'delete' | 'export' | 'status') => {
    if (selectedLoanIds.length === 0) {
      toast.error('No loans selected')
      return
    }
    setActionType(action)
    setConfirmDialogOpen(true)
  }

  const confirmAction = () => {
    if (!actionType) return

    switch (actionType) {
      case 'delete':
        onBulkDelete(selectedLoanIds)
        toast.success(`${selectedLoanIds.length} loan(s) deleted`)
        break
      case 'export':
        onBulkExport(selectedLoanIds)
        toast.success(`Exporting ${selectedLoanIds.length} loan(s)`)
        break
      case 'status':
        if (newStatus) {
          onBulkStatusChange(selectedLoanIds, newStatus)
          toast.success(`${selectedLoanIds.length} loan(s) status updated`)
        }
        break
    }

    onSelectionChange([])
    setConfirmDialogOpen(false)
    setActionType(null)
    setNewStatus('')
  }

  const selectedLoans = loans.filter(loan => selectedLoanIds.includes(loan.id))
  const totalExposure = selectedLoans.reduce((sum, loan) => sum + loan.amount, 0)
  const avgRisk = selectedLoans.length > 0
    ? selectedLoans.reduce((sum, loan) => sum + loan.riskScore, 0) / selectedLoans.length
    : 0

  if (selectedLoanIds.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="h-5 w-5"
              />
              <span className="text-sm text-muted-foreground">
                Select loans to perform bulk actions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-accent/5 border-accent/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected || someSelected}
                  onCheckedChange={handleSelectAll}
                  className="h-5 w-5"
                />
                <div>
                  <p className="font-semibold">
                    {selectedLoanIds.length} loan{selectedLoanIds.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total exposure: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(totalExposure)} • Avg risk: {avgRisk.toFixed(1)}
                  </p>
                </div>
              </div>

              <Separator orientation="vertical" className="h-10" />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                  className="gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('status')}
                  className="gap-2"
                >
                  <Tag size={16} />
                  Change Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash size={16} />
                  Delete
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="gap-2"
            >
              <X size={16} />
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' && 'Confirm Bulk Delete'}
              {actionType === 'export' && 'Confirm Bulk Export'}
              {actionType === 'status' && 'Change Status for Selected Loans'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete' && 
                `Are you sure you want to delete ${selectedLoanIds.length} loan(s)? This action cannot be undone.`
              }
              {actionType === 'export' && 
                `Export ${selectedLoanIds.length} loan(s) to CSV format?`
              }
              {actionType === 'status' && 
                `Update the status for ${selectedLoanIds.length} selected loan(s)`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'status' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                    <SelectItem value="paid-off">Paid Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Loans Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Loans:</span>
                  <span className="font-mono font-semibold">{selectedLoanIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Exposure:</span>
                  <span className="font-mono font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(totalExposure)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Risk:</span>
                  <Badge variant={avgRisk > 7 ? 'destructive' : avgRisk > 5 ? 'default' : 'secondary'}>
                    {avgRisk.toFixed(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmAction}
                variant={actionType === 'delete' ? 'destructive' : 'default'}
                disabled={actionType === 'status' && !newStatus}
              >
                {actionType === 'delete' && 'Delete'}
                {actionType === 'export' && 'Export'}
                {actionType === 'status' && 'Update Status'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function LoanSelectionCheckbox({ 
  loanId, 
  selected, 
  onToggle 
}: { 
  loanId: string
  selected: boolean
  onToggle: (loanId: string) => void 
}) {
  return (
    <div className="absolute top-3 right-3 z-10">
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(loanId)}
        className="h-5 w-5 bg-background border-2"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
