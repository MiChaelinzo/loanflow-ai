import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  MagnifyingGlass, 
  Faders, 
  FloppyDisk, 
  Trash, 
  Check,
  Star,
  StarFour
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface SearchFilters {
  searchQuery: string
  statusFilter: string
  riskFilter: string
  currencyFilter: string
  industryFilter: string
  minAmount?: number
  maxAmount?: number
  minRisk?: number
  maxRisk?: number
  esgScoreFilter: string
  maturityDateFrom?: string
  maturityDateTo?: string
}

interface SavedFilter {
  id: string
  name: string
  filters: SearchFilters
  createdAt: number
  isFavorite: boolean
}

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  uniqueCurrencies: string[]
  uniqueIndustries: string[]
}

export function AdvancedSearch({ 
  filters, 
  onFiltersChange, 
  uniqueCurrencies, 
  uniqueIndustries 
}: AdvancedSearchProps) {
  const [savedFilters, setSavedFilters] = useKV<SavedFilter[]>('saved-filters', [])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState('')

  const hasActiveFilters = () => {
    return (
      filters.searchQuery !== '' ||
      filters.statusFilter !== 'all' ||
      filters.riskFilter !== 'all' ||
      filters.currencyFilter !== 'all' ||
      filters.industryFilter !== 'all' ||
      filters.minAmount !== undefined ||
      filters.maxAmount !== undefined ||
      filters.minRisk !== undefined ||
      filters.maxRisk !== undefined ||
      filters.esgScoreFilter !== 'all' ||
      filters.maturityDateFrom !== undefined ||
      filters.maturityDateTo !== undefined
    )
  }

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      statusFilter: 'all',
      riskFilter: 'all',
      currencyFilter: 'all',
      industryFilter: 'all',
      esgScoreFilter: 'all',
    })
    toast.success('Filters cleared')
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name')
      return
    }

    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      filters: { ...filters },
      createdAt: Date.now(),
      isFavorite: false,
    }

    setSavedFilters((current) => [...(current || []), newFilter])
    setFilterName('')
    setSaveDialogOpen(false)
    toast.success(`Filter "${filterName}" saved`)
  }

  const handleLoadFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters)
    toast.success(`Filter "${filter.name}" applied`)
  }

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((current) =>
      (current || []).filter((f) => f.id !== filterId)
    )
    toast.success('Filter deleted')
  }

  const handleToggleFavorite = (filterId: string) => {
    setSavedFilters((current) =>
      (current || []).map((f) =>
        f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    )
  }

  const activeFilterCount = [
    filters.statusFilter !== 'all',
    filters.riskFilter !== 'all',
    filters.currencyFilter !== 'all',
    filters.industryFilter !== 'all',
    filters.esgScoreFilter !== 'all',
    filters.minAmount !== undefined,
    filters.maxAmount !== undefined,
    filters.minRisk !== undefined,
    filters.maxRisk !== undefined,
    filters.maturityDateFrom !== undefined,
    filters.maturityDateTo !== undefined,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Search by borrower, industry, or loan ID..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Faders size={18} />
          Advanced
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters() && (
          <Button variant="ghost" onClick={handleClearFilters} className="gap-2">
            <Trash size={18} />
            Clear
          </Button>
        )}

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FloppyDisk size={18} />
              Save Filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Filters</DialogTitle>
              <DialogDescription>
                Save your current filter configuration for quick access later
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="filter-name">Filter Name</Label>
                <Input
                  id="filter-name"
                  placeholder="e.g., High Risk USD Loans"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
                  <FloppyDisk size={18} className="mr-2" />
                  Save Filter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            <CardDescription>Refine your search with additional criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.statusFilter} onValueChange={(value) => onFiltersChange({ ...filters, statusFilter: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                    <SelectItem value="paid-off">Paid Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select value={filters.riskFilter} onValueChange={(value) => onFiltersChange({ ...filters, riskFilter: value })}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label>ESG Score</Label>
                <Select value={filters.esgScoreFilter} onValueChange={(value) => onFiltersChange({ ...filters, esgScoreFilter: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ESG Scores</SelectItem>
                    <SelectItem value="A">A - Excellent</SelectItem>
                    <SelectItem value="B">B - Good</SelectItem>
                    <SelectItem value="C">C - Fair</SelectItem>
                    <SelectItem value="D">D - Poor</SelectItem>
                    <SelectItem value="F">F - Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={filters.currencyFilter} onValueChange={(value) => onFiltersChange({ ...filters, currencyFilter: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={filters.industryFilter} onValueChange={(value) => onFiltersChange({ ...filters, industryFilter: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Loan Amount Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-amount">Minimum Amount</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      minAmount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-amount">Maximum Amount</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="No limit"
                    value={filters.maxAmount || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      maxAmount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Risk Score Range (1-10)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-risk">Minimum Risk</Label>
                  <Input
                    id="min-risk"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1"
                    value={filters.minRisk || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      minRisk: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-risk">Maximum Risk</Label>
                  <Input
                    id="max-risk"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="10"
                    value={filters.maxRisk || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      maxRisk: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Maturity Date Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maturity-from">From Date</Label>
                  <Input
                    id="maturity-from"
                    type="date"
                    value={filters.maturityDateFrom || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      maturityDateFrom: e.target.value || undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maturity-to">To Date</Label>
                  <Input
                    id="maturity-to"
                    type="date"
                    value={filters.maturityDateTo || ''}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      maturityDateTo: e.target.value || undefined 
                    })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(savedFilters || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Filters</CardTitle>
            <CardDescription>Quick access to your frequently used filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(savedFilters || [])
                .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                .map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleFavorite(filter.id)}
                    >
                      {filter.isFavorite ? (
                        <StarFour size={18} weight="fill" className="text-warning" />
                      ) : (
                        <Star size={18} className="text-muted-foreground" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{filter.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Saved {new Date(filter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadFilter(filter)}
                      className="gap-2"
                    >
                      <Check size={16} />
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteFilter(filter.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
