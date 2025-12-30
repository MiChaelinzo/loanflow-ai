import { useState } from 'react'
import { Loan, PriceAlertThreshold } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Bell, Plus, Trash, TrendUp, TrendDown, CurrencyDollar, ArrowsLeftRight, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PriceAlertsManagerProps {
  loan: Loan
  onUpdate: (alerts: PriceAlertThreshold[]) => void
}

export function PriceAlertsManager({ loan, onUpdate }: PriceAlertsManagerProps) {
  const [alerts, setAlerts] = useState<PriceAlertThreshold[]>(loan.priceAlerts || [])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newAlertType, setNewAlertType] = useState<PriceAlertThreshold['type']>('price_above')
  const [newAlertValue, setNewAlertValue] = useState('')
  const [newAlertNote, setNewAlertNote] = useState('')

  const handleAddAlert = () => {
    const value = parseFloat(newAlertValue)
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid threshold value')
      return
    }

    const newAlert: PriceAlertThreshold = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      loanId: loan.id,
      type: newAlertType,
      value,
      enabled: true,
      triggered: false,
      createdAt: new Date().toISOString(),
      note: newAlertNote,
    }

    const updatedAlerts = [...alerts, newAlert]
    setAlerts(updatedAlerts)
    onUpdate(updatedAlerts)

    setNewAlertValue('')
    setNewAlertNote('')
    setAddDialogOpen(false)
    toast.success('Price alert created', {
      description: `You'll be notified when threshold is reached`,
    })
  }

  const handleToggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    )
    setAlerts(updatedAlerts)
    onUpdate(updatedAlerts)
  }

  const handleDeleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId)
    setAlerts(updatedAlerts)
    onUpdate(updatedAlerts)
    toast.success('Alert removed')
  }

  const getAlertTypeIcon = (type: PriceAlertThreshold['type']) => {
    switch (type) {
      case 'price_above':
        return <TrendUp size={16} weight="bold" />
      case 'price_below':
        return <TrendDown size={16} weight="bold" />
      case 'spread_above':
        return <ArrowsLeftRight size={16} weight="bold" />
      case 'spread_below':
        return <ArrowsLeftRight size={16} weight="bold" />
      case 'price_change_percent':
        return <CurrencyDollar size={16} weight="bold" />
    }
  }

  const getAlertTypeLabel = (type: PriceAlertThreshold['type']) => {
    switch (type) {
      case 'price_above':
        return 'Price Above'
      case 'price_below':
        return 'Price Below'
      case 'spread_above':
        return 'Spread Above'
      case 'spread_below':
        return 'Spread Below'
      case 'price_change_percent':
        return 'Price Change %'
    }
  }

  const formatAlertValue = (type: PriceAlertThreshold['type'], value: number) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: loan.currency,
          minimumFractionDigits: 2,
        }).format(value)
      case 'spread_above':
      case 'spread_below':
        return `${value} bps`
      case 'price_change_percent':
        return `${value}%`
    }
  }

  const currentPrice = loan.marketPricing?.currentPrice || 0
  const currentSpread = loan.marketPricing?.spread || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} weight="bold" />
              Price Alerts
            </CardTitle>
            <CardDescription className="mt-1.5">
              Get notified when price or spread thresholds are reached
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogDescription>
                  Set a threshold to receive notifications when the price moves
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <Select
                    value={newAlertType}
                    onValueChange={(value) => setNewAlertType(value as PriceAlertThreshold['type'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_above">Price Above Threshold</SelectItem>
                      <SelectItem value="price_below">Price Below Threshold</SelectItem>
                      <SelectItem value="spread_above">Spread Above (bps)</SelectItem>
                      <SelectItem value="spread_below">Spread Below (bps)</SelectItem>
                      <SelectItem value="price_change_percent">Price Change % (24h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Threshold Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAlertValue}
                    onChange={(e) => setNewAlertValue(e.target.value)}
                    placeholder={
                      newAlertType === 'price_above' || newAlertType === 'price_below'
                        ? `Current: ${currentPrice.toFixed(2)}`
                        : newAlertType === 'spread_above' || newAlertType === 'spread_below'
                        ? `Current: ${currentSpread.toFixed(0)} bps`
                        : 'e.g., 3 for 3%'
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Input
                    value={newAlertNote}
                    onChange={(e) => setNewAlertNote(e.target.value)}
                    placeholder="e.g., Exit position if reached"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddAlert} className="flex-1">
                    Create Alert
                  </Button>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No price alerts configured</p>
            <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus size={16} />
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={alert.id}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          {getAlertTypeIcon(alert.type)}
                          {getAlertTypeLabel(alert.type)}
                        </div>
                        <Badge variant={alert.enabled ? 'default' : 'secondary'} className="text-xs">
                          {formatAlertValue(alert.type, alert.value)}
                        </Badge>
                        {alert.triggered && (
                          <Badge variant="destructive" className="text-xs">
                            Triggered
                          </Badge>
                        )}
                      </div>
                      {alert.note && (
                        <p className="text-xs text-muted-foreground">{alert.note}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {loan.marketPricing && alerts.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="font-mono font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: loan.currency,
                    minimumFractionDigits: 2,
                  }).format(currentPrice)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Current Spread</p>
                <p className="font-mono font-semibold">{currentSpread.toFixed(0)} bps</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function PriceAlertsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <Bell size={20} />
      Price Alerts
    </Button>
  )
}
