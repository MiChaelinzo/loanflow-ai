import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { AlertPreferences, DEFAULT_ALERT_PREFERENCES, AlertType } from '@/lib/alertTypes'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Bell, BellSlash, EnvelopeSimple, Check, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AlertSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ALERT_TYPE_LABELS: Record<AlertType, { label: string; description: string }> = {
  covenant_breach: {
    label: 'Covenant Breach',
    description: 'When a loan covenant threshold is breached',
  },
  covenant_at_risk: {
    label: 'Covenant At Risk',
    description: 'When a covenant is approaching breach threshold',
  },
  high_risk_loan: {
    label: 'High Risk Loan',
    description: 'When a loan is classified as high risk',
  },
  critical_risk_loan: {
    label: 'Critical Risk Loan',
    description: 'When a loan reaches critical risk level',
  },
  default_probability_high: {
    label: 'High Default Probability',
    description: 'When default probability exceeds 10% within 30 days',
  },
  maturity_approaching: {
    label: 'Maturity Approaching',
    description: 'When loan maturity is within 30 days',
  },
  lma_compliance_gap: {
    label: 'LMA Compliance Gap',
    description: 'When high-severity compliance gaps are detected',
  },
  esg_score_downgrade: {
    label: 'ESG Score Downgrade',
    description: 'When ESG rating decreases',
  },
  price_above_threshold: {
    label: 'Price Above Threshold',
    description: 'When loan price exceeds set threshold',
  },
  price_below_threshold: {
    label: 'Price Below Threshold',
    description: 'When loan price falls below set threshold',
  },
  price_spike: {
    label: 'Price Spike',
    description: 'When loan price increases rapidly',
  },
  price_drop: {
    label: 'Price Drop',
    description: 'When loan price decreases rapidly',
  },
  spread_widening: {
    label: 'Spread Widening',
    description: 'When credit spread widens significantly',
  },
  spread_tightening: {
    label: 'Spread Tightening',
    description: 'When credit spread tightens significantly',
  },
}

export function AlertSettingsDialog({ open, onOpenChange }: AlertSettingsDialogProps) {
  const [preferences, setPreferences] = useKV<AlertPreferences>(
    'alert-preferences',
    DEFAULT_ALERT_PREFERENCES
  )
  const [localPreferences, setLocalPreferences] = useState<AlertPreferences>(
    preferences || DEFAULT_ALERT_PREFERENCES
  )

  const handleSave = () => {
    setPreferences(localPreferences)
    toast.success('Alert settings saved', {
      description: 'Your notification preferences have been updated',
    })
    onOpenChange(false)
  }

  const handleTestEmail = async () => {
    if (!localPreferences.emailAddress) {
      toast.error('Email address required', {
        description: 'Please enter an email address before testing',
      })
      return
    }

    toast.success('Test email sent', {
      description: `Check your inbox at ${localPreferences.emailAddress}`,
      icon: <EnvelopeSimple size={20} />,
    })
  }

  const toggleAlertType = (type: AlertType, field: 'enabled' | 'emailEnabled') => {
    setLocalPreferences((prev) => ({
      ...prev,
      alertTypes: {
        ...prev.alertTypes,
        [type]: {
          ...prev.alertTypes[type],
          [field]: !prev.alertTypes[type][field],
        },
      },
    }))
  }

  const enabledCount = Object.values(localPreferences.alertTypes).filter((a) => a.enabled).length
  const emailEnabledCount = Object.values(localPreferences.alertTypes).filter(
    (a) => a.emailEnabled
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bell size={28} weight="bold" />
            Alert & Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure automated alerts for covenant breaches, high-risk loans, and other critical
            events. Receive instant notifications via email or in-app alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Master Controls</CardTitle>
              <CardDescription>Global alert and email notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Enable Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Master switch for all alert monitoring
                  </p>
                </div>
                <Switch
                  checked={localPreferences.enabled}
                  onCheckedChange={(checked) =>
                    setLocalPreferences((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={localPreferences.emailAddress}
                    onChange={(e) =>
                      setLocalPreferences((prev) => ({ ...prev, emailAddress: e.target.value }))
                    }
                  />
                  <Button variant="outline" onClick={handleTestEmail} className="gap-2">
                    <EnvelopeSimple size={18} />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alerts will be sent to this email address when configured below
                </p>
              </div>

              <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Status</div>
                  <div className="text-sm text-muted-foreground">
                    {enabledCount} alert types enabled • {emailEnabledCount} with email
                  </div>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <Check size={14} />
                  Configured
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Types</CardTitle>
              <CardDescription>
                Configure which events trigger alerts and email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((type) => {
                const config = localPreferences.alertTypes[type]
                const info = ALERT_TYPE_LABELS[type]

                return (
                  <div key={type} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{info.label}</h4>
                          <Badge
                            variant={
                              config.severity === 'critical'
                                ? 'destructive'
                                : config.severity === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {config.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={() => toggleAlertType(type, 'enabled')}
                      />
                    </div>

                    {config.enabled && (
                      <div className="flex items-center gap-2 pl-4 border-l-2 border-accent">
                        <EnvelopeSimple size={18} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Send email</span>
                        <Switch
                          checked={config.emailEnabled}
                          onCheckedChange={() => toggleAlertType(type, 'emailEnabled')}
                          disabled={!localPreferences.emailAddress}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiet Hours</CardTitle>
              <CardDescription>
                Pause email alerts during specific hours (in-app alerts still active)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Quiet Hours</Label>
                <Switch
                  checked={localPreferences.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    setLocalPreferences((prev) => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: checked },
                    }))
                  }
                />
              </div>

              {localPreferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={localPreferences.quietHours.startTime}
                      onChange={(e) =>
                        setLocalPreferences((prev) => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, startTime: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={localPreferences.quietHours.endTime}
                      onChange={(e) =>
                        setLocalPreferences((prev) => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, endTime: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Digest</CardTitle>
              <CardDescription>
                Receive a summary of all alerts in a single scheduled email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Daily/Weekly Digest</Label>
                <Switch
                  checked={localPreferences.digestEnabled}
                  onCheckedChange={(checked) =>
                    setLocalPreferences((prev) => ({ ...prev, digestEnabled: checked }))
                  }
                />
              </div>

              {localPreferences.digestEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={localPreferences.digestFrequency}
                      onValueChange={(value: 'daily' | 'weekly') =>
                        setLocalPreferences((prev) => ({ ...prev, digestFrequency: value }))
                      }
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="digest-time">Time</Label>
                    <Input
                      id="digest-time"
                      type="time"
                      value={localPreferences.digestTime}
                      onChange={(e) =>
                        setLocalPreferences((prev) => ({ ...prev, digestTime: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-3">
            <Warning size={24} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Demo Mode Notice</p>
              <p className="text-xs text-muted-foreground">
                This is a prototype demonstration. In production, alerts would be sent via your
                institution's email infrastructure with proper authentication and delivery
                guarantees. Email previews are shown in the Alert Center.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check size={18} />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AlertSettingsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="default" onClick={onClick} className="gap-2">
      <Bell size={20} />
      Alerts
    </Button>
  )
}
