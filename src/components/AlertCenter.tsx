import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Alert, AlertPreferences, AlertStatus, AlertSeverity, DEFAULT_ALERT_PREFERENCES } from '@/lib/alertTypes'
import { Loan } from '@/lib/types'
import { checkLoansForAlerts, generateEmailContent } from '@/lib/alertService'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import {
  Bell,
  BellRinging,
  Check,
  EnvelopeSimple,
  Eye,
  Trash,
  Warning,
  X,
  ShieldWarning,
  ListChecks,
  ChartLine,
  CalendarBlank,
  ShieldCheck,
  Leaf,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AlertCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loans: Loan[]
}

const ALERT_TYPE_ICONS = {
  covenant_breach: ListChecks,
  covenant_at_risk: ListChecks,
  high_risk_loan: ShieldWarning,
  critical_risk_loan: ShieldWarning,
  default_probability_high: ChartLine,
  maturity_approaching: CalendarBlank,
  lma_compliance_gap: ShieldCheck,
  esg_score_downgrade: Leaf,
}

export function AlertCenter({ open, onOpenChange, loans }: AlertCenterProps) {
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
  const [preferences] = useKV<AlertPreferences>('alert-preferences', DEFAULT_ALERT_PREFERENCES)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'acknowledged' | 'all'>('active')

  useEffect(() => {
    if (open && preferences?.enabled && loans.length > 0) {
      const newAlerts = checkLoansForAlerts(loans, alerts || [])
      if (newAlerts.length > 0) {
        setAlerts((current) => [...(current || []), ...newAlerts])
        
        const criticalCount = newAlerts.filter((a) => a.severity === 'critical').length
        const highCount = newAlerts.filter((a) => a.severity === 'high').length
        
        if (criticalCount > 0 || highCount > 0) {
          toast.warning('New alerts detected', {
            description: `${criticalCount} critical, ${highCount} high priority alerts`,
            icon: <BellRinging size={20} />,
          })
        }
      }
    }
  }, [open, loans])

  const handleAcknowledge = (alertId: string) => {
    setAlerts((current) =>
      (current || []).map((alert) =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date().toISOString() }
          : alert
      )
    )
    toast.success('Alert acknowledged')
  }

  const handleResolve = (alertId: string) => {
    setAlerts((current) =>
      (current || []).map((alert) =>
        alert.id === alertId
          ? { ...alert, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() }
          : alert
      )
    )
    toast.success('Alert marked as resolved')
  }

  const handleDismiss = (alertId: string) => {
    setAlerts((current) =>
      (current || []).map((alert) =>
        alert.id === alertId ? { ...alert, status: 'dismissed' as AlertStatus } : alert
      )
    )
    toast.info('Alert dismissed')
  }

  const handleDelete = (alertId: string) => {
    setAlerts((current) => (current || []).filter((alert) => alert.id !== alertId))
    toast.success('Alert deleted')
  }

  const handleViewEmail = (alert: Alert) => {
    const email = generateEmailContent(alert)
    setEmailPreview(email)
    setSelectedAlert(alert)
  }

  const handleClearAll = (status?: AlertStatus) => {
    if (status) {
      setAlerts((current) => (current || []).filter((alert) => alert.status !== status))
      toast.success(`All ${status} alerts cleared`)
    } else {
      setAlerts([])
      toast.success('All alerts cleared')
    }
  }

  const filteredAlerts = (alerts || []).filter((alert) => {
    if (activeTab === 'active') return alert.status === 'active'
    if (activeTab === 'acknowledged')
      return alert.status === 'acknowledged' || alert.status === 'resolved'
    return true
  })

  const activeAlerts = (alerts || []).filter((a) => a.status === 'active')
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length
  const highCount = activeAlerts.filter((a) => a.severity === 'high').length

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-warning text-warning-foreground'
      case 'low':
        return 'bg-success text-success-foreground'
    }
  }

  return (
    <>
      <Dialog open={open && !emailPreview} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <BellRinging size={28} weight="bold" className="text-accent" />
                  Alert Center
                </DialogTitle>
                <DialogDescription>
                  Monitor and manage covenant breaches, high-risk loans, and critical events
                </DialogDescription>
              </div>
              {activeAlerts.length > 0 && (
                <div className="flex gap-2">
                  <Badge variant="destructive" className="gap-1">
                    <Warning size={14} />
                    {criticalCount} Critical
                  </Badge>
                  <Badge className="gap-1 bg-orange-500">
                    <Warning size={14} />
                    {highCount} High
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active" className="gap-2">
                  <Bell size={18} />
                  Active ({activeAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="acknowledged" className="gap-2">
                  <Check size={18} />
                  Acknowledged (
                  {(alerts || []).filter((a) => a.status === 'acknowledged' || a.status === 'resolved').length})
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  All ({(alerts || []).length})
                </TabsTrigger>
              </TabsList>

              {filteredAlerts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => handleClearAll()} className="gap-2">
                  <Trash size={16} />
                  Clear All
                </Button>
              )}
            </div>

            <TabsContent value={activeTab} className="flex-1 mt-4 min-h-0">
              <ScrollArea className="h-[500px] pr-4">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-success" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No {activeTab} alerts</h3>
                    <p className="text-muted-foreground text-sm">
                      {activeTab === 'active'
                        ? 'Your portfolio is healthy. All loans are within acceptable parameters.'
                        : `No ${activeTab} alerts to display.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAlerts
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .map((alert) => {
                        const Icon = ALERT_TYPE_ICONS[alert.type] || Warning
                        return (
                          <Card
                            key={alert.id}
                            className={cn(
                              'border-l-4',
                              alert.severity === 'critical' && 'border-l-destructive',
                              alert.severity === 'high' && 'border-l-orange-500',
                              alert.severity === 'medium' && 'border-l-warning',
                              alert.severity === 'low' && 'border-l-success'
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <div
                                    className={cn(
                                      'w-10 h-10 rounded-lg flex items-center justify-center',
                                      alert.severity === 'critical' && 'bg-destructive/10',
                                      alert.severity === 'high' && 'bg-orange-500/10',
                                      alert.severity === 'medium' && 'bg-warning/10',
                                      alert.severity === 'low' && 'bg-success/10'
                                    )}
                                  >
                                    <Icon
                                      size={20}
                                      weight="bold"
                                      className={cn(
                                        alert.severity === 'critical' && 'text-destructive',
                                        alert.severity === 'high' && 'text-orange-500',
                                        alert.severity === 'medium' && 'text-warning',
                                        alert.severity === 'low' && 'text-success'
                                      )}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge className={getSeverityColor(alert.severity)}>
                                        {alert.severity}
                                      </Badge>
                                      <h4 className="font-semibold">{alert.title}</h4>
                                    </div>
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-3">
                                    {alert.message}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(alert.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                      })}
                                      {alert.acknowledgedAt && (
                                        <span className="ml-2">
                                          • Acknowledged{' '}
                                          {new Date(alert.acknowledgedAt).toLocaleString('en-US', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                          })}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewEmail(alert)}
                                        className="gap-1.5"
                                      >
                                        <EnvelopeSimple size={16} />
                                        Email
                                      </Button>

                                      {alert.status === 'active' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAcknowledge(alert.id)}
                                            className="gap-1.5"
                                          >
                                            <Check size={16} />
                                            Acknowledge
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResolve(alert.id)}
                                            className="gap-1.5"
                                          >
                                            <Check size={16} weight="bold" />
                                            Resolve
                                          </Button>
                                        </>
                                      )}

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(alert.id)}
                                        className="gap-1.5 text-destructive hover:text-destructive"
                                      >
                                        <Trash size={16} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!emailPreview} onOpenChange={() => setEmailPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EnvelopeSimple size={24} weight="bold" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              Preview of the email that would be sent for this alert
            </DialogDescription>
          </DialogHeader>

          {emailPreview && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Subject</div>
                <div className="font-mono text-sm">{emailPreview.subject}</div>
              </div>

              <Separator />

              <ScrollArea className="h-[500px] border rounded-lg">
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: emailPreview.body }}
                />
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEmailPreview(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(emailPreview.body)
                    toast.success('Email HTML copied to clipboard')
                  }}
                  className="gap-2"
                >
                  Copy HTML
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AlertCenterTrigger({
  onClick,
  alertCount,
}: {
  onClick: () => void
  alertCount: number
}) {
  return (
    <Button
      variant={alertCount > 0 ? 'default' : 'outline'}
      size="default"
      onClick={onClick}
      className="gap-2 relative"
    >
      {alertCount > 0 ? <BellRinging size={20} weight="bold" /> : <Bell size={20} />}
      Alerts
      {alertCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive">
          {alertCount > 99 ? '99+' : alertCount}
        </Badge>
      )}
    </Button>
  )
}
