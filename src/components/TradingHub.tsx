import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loan, TradeListing, TradeBid } from '@/lib/types'
import { Handshake, TrendUp, Eye, CurrencyDollar, Calendar, User } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TradingHubProps {
  loans: Loan[]
  onCreateListing: (loanId: string, askPrice: number) => void
  onPlaceBid: (listingId: string, amount: number) => void
}

export function TradingHub({ loans, onCreateListing, onPlaceBid }: TradingHubProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [listingDialogOpen, setListingDialogOpen] = useState(false)
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<TradeListing | null>(null)
  const [askPrice, setAskPrice] = useState('')
  const [bidAmount, setBidAmount] = useState('')

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
      month: 'short',
      day: 'numeric',
    })
  }

  const handleListForSale = (loan: Loan) => {
    setSelectedLoan(loan)
    setAskPrice((loan.amount * 0.98).toString())
    setListingDialogOpen(true)
  }

  const handleCreateListing = () => {
    if (selectedLoan && askPrice) {
      onCreateListing(selectedLoan.id, parseFloat(askPrice))
      setListingDialogOpen(false)
      setAskPrice('')
      setSelectedLoan(null)
      toast.success('Loan listed for sale', {
        description: 'Your loan is now available in the secondary market',
      })
    }
  }

  const handleOpenBidDialog = (listing: TradeListing) => {
    setSelectedListing(listing)
    const suggestedBid = listing.askPrice * 0.97
    setBidAmount(suggestedBid.toString())
    setBidDialogOpen(true)
  }

  const handlePlaceBid = () => {
    if (selectedListing && bidAmount) {
      onPlaceBid(selectedListing.id, parseFloat(bidAmount))
      setBidDialogOpen(false)
      setBidAmount('')
      setSelectedListing(null)
      toast.success('Bid placed successfully', {
        description: 'The seller will be notified of your offer',
      })
    }
  }

  const activeListings = loans.filter(loan => loan.tradeListing?.status === 'listed')
  const myLoans = loans.filter(loan => !loan.tradeListing || loan.tradeListing.status === 'cancelled')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Handshake size={32} className="text-accent" weight="bold" />
            Secondary Market Trading
          </h2>
          <p className="text-muted-foreground mt-1">
            Transparent loan trading with AI-powered pricing recommendations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{activeListings.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Available for bidding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Market Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {formatCurrency(
                activeListings.reduce((sum, loan) => sum + (loan.tradeListing?.askPrice || 0), 0),
                'USD'
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Listed loans value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">2.3%</div>
            <p className="text-xs text-muted-foreground mt-2">Below par value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {activeListings.reduce((sum, loan) => sum + (loan.tradeListing?.views || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total views</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Active Market Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {activeListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No active listings</h3>
              <p className="text-muted-foreground mb-6">List a loan from your portfolio to start trading</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeListings.map((loan) => {
                const listing = loan.tradeListing!
                const discount = ((loan.amount - listing.askPrice) / loan.amount) * 100
                const highestBid = listing.bids.length > 0
                  ? Math.max(...listing.bids.map(b => b.amount))
                  : 0

                return (
                  <Card key={loan.id} className="border-2 hover:border-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{loan.borrowerName}</h3>
                            <Badge variant="outline">{loan.industry}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Par Value</p>
                              <p className="text-sm font-mono font-semibold">
                                {formatCurrency(loan.amount, loan.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Ask Price</p>
                              <p className="text-sm font-mono font-semibold text-accent">
                                {formatCurrency(listing.askPrice, listing.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Discount</p>
                              <p className="text-sm font-mono font-semibold text-success">
                                {discount.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                              <p className={cn(
                                'text-sm font-mono font-semibold',
                                loan.riskScore <= 5 ? 'text-success' : 'text-warning'
                              )}>
                                {loan.riskScore.toFixed(1)}/10
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={16} />
                              <span>Expires: {formatDate(listing.expiryDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye size={16} />
                              <span>{listing.views} views</span>
                            </div>
                            {listing.bids.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <CurrencyDollar size={16} />
                                <span>{listing.bids.length} bids • High: {formatCurrency(highestBid, listing.currency)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleOpenBidDialog(listing)} className="gap-2">
                            <CurrencyDollar size={18} />
                            Place Bid
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
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
          <CardTitle className="text-xl">My Portfolio - Available to List</CardTitle>
        </CardHeader>
        <CardContent>
          {myLoans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No loans available to list</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">{loan.borrowerName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(loan.amount, loan.currency)} • {loan.interestRate}% • {loan.industry}
                    </p>
                  </div>
                  <Button onClick={() => handleListForSale(loan)} variant="outline" className="gap-2">
                    <TrendUp size={18} />
                    List for Sale
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={listingDialogOpen} onOpenChange={setListingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>List Loan for Sale</DialogTitle>
            <DialogDescription>
              Set your asking price for {selectedLoan?.borrowerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Par Value</Label>
              <div className="text-2xl font-bold font-mono mt-1">
                {selectedLoan && formatCurrency(selectedLoan.amount, selectedLoan.currency)}
              </div>
            </div>
            <Separator />
            <div>
              <Label htmlFor="ask-price">Ask Price ({selectedLoan?.currency})</Label>
              <Input
                id="ask-price"
                type="number"
                value={askPrice}
                onChange={(e) => setAskPrice(e.target.value)}
                placeholder="Enter asking price"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                AI suggests: {selectedLoan && formatCurrency(selectedLoan.amount * 0.98, selectedLoan.currency)} (2% discount)
              </p>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
              <p className="text-sm font-medium mb-1">Market Intelligence</p>
              <p className="text-xs text-muted-foreground">
                Similar loans trading at 2-3% discount. Your pricing is competitive.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setListingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateListing}>
              Create Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place Bid</DialogTitle>
            <DialogDescription>
              Make an offer for this loan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Seller Ask Price</Label>
              <div className="text-2xl font-bold font-mono mt-1 text-accent">
                {selectedListing && formatCurrency(selectedListing.askPrice, selectedListing.currency)}
              </div>
            </div>
            <Separator />
            <div>
              <Label htmlFor="bid-amount">Your Bid Amount ({selectedListing?.currency})</Label>
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Minimum bid: {selectedListing && formatCurrency(selectedListing.minBidAmount, selectedListing.currency)}
              </p>
            </div>
            {selectedListing && selectedListing.bids.length > 0 && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Current Highest Bid</p>
                <p className="text-lg font-mono font-bold">
                  {formatCurrency(
                    Math.max(...selectedListing.bids.map(b => b.amount)),
                    selectedListing.currency
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBid}>
              Place Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
