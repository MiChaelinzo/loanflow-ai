import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { AlertRoute } from '../lib/teamTypes'
import { TeamMember } from '../lib/teamTypes'
import { sampleAlertRoutes } from '../lib/sampleTeamData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { Plus, GitBranch, Lightning, ArrowRight, Users, Clock, Warning, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AlertRouting() {
  const [routes, setRoutes] = useKV<AlertRoute[]>('alert-routes', [])
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
  const [selectedRoute, setSelectedRoute] = useState<AlertRoute | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleLoadSampleRoutes = () => {
    setRoutes(sampleAlertRoutes)
    toast.success('Sample routes loaded', {
      description: `${sampleAlertRoutes.length} routing rules configured`,
    })
  }

  const handleToggleRoute = (routeId: string) => {
    setRoutes((current) =>
      (current || []).map((route) =>
        route.id === routeId ? { ...route, enabled: !route.enabled } : route
      )
    )
  }

  const handleDeleteRoute = (routeId: string) => {
    setRoutes((current) => (current || []).filter((r) => r.id !== routeId))
    setEditDialogOpen(false)
    toast.success('Route deleted')
  }

  const handleAddRoute = (newRoute: Partial<AlertRoute>) => {
    const route: AlertRoute = {
      id: `ROUTE-${Date.now()}`,
      name: newRoute.name || 'New Route',
      description: newRoute.description || '',
      priority: newRoute.priority || 50,
      conditions: newRoute.conditions || {
        alertTypes: [],
        severities: [],
      },
      routing: newRoute.routing || {
        type: 'round_robin',
        assignTo: [],
        escalationEnabled: false,
        notifyAll: false,
      },
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setRoutes((current) => [...(current || []), route])
    setAddDialogOpen(false)
    toast.success('Route created', {
      description: route.name,
    })
  }

  const handleUpdateRoute = (updatedRoute: AlertRoute) => {
    setRoutes((current) =>
      (current || []).map((r) =>
        r.id === updatedRoute.id
          ? { ...updatedRoute, updatedAt: new Date().toISOString() }
          : r
      )
    )
    setEditDialogOpen(false)
    toast.success('Route updated')
  }

  const sortedRoutes = [...(routes || [])].sort((a, b) => a.priority - b.priority)

  const getRoutingTypeLabel = (type: string) => {
    switch (type) {
      case 'round_robin':
        return 'Round Robin'
      case 'workload_based':
        return 'Workload Based'
      case 'skill_based':
        return 'Skill Based'
      case 'manual':
        return 'Manual'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitBranch size={32} weight="bold" className="text-accent" />
            Alert Routing
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure intelligent alert routing and assignment rules
          </p>
        </div>
        <div className="flex gap-2">
          {(routes || []).length === 0 && (
            <Button variant="secondary" onClick={handleLoadSampleRoutes} className="gap-2">
              <Sparkle size={20} />
              Load Sample Routes
            </Button>
          )}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                Create Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Alert Route</DialogTitle>
                <DialogDescription>
                  Set up a new routing rule for automatic alert assignment
                </DialogDescription>
              </DialogHeader>
              <RouteForm
                teamMembers={teamMembers || []}
                onSubmit={handleAddRoute}
                onCancel={() => setAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {(routes || []).filter((r) => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {(routes || []).length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalation Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {(routes || []).filter((r) => r.routing.escalationEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">routes with escalation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {teamMembers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">assignable members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
          <CardDescription>
            Rules are evaluated in priority order from highest to lowest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(routes || []).length === 0 ? (
            <div className="text-center py-12">
              <GitBranch size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No routing rules yet</h3>
              <p className="text-muted-foreground mb-6">
                Create routing rules to automate alert assignment
              </p>
              <Button onClick={handleLoadSampleRoutes} variant="secondary">
                Load Sample Routes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRoutes.map((route, index) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !route.enabled ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    setSelectedRoute(route)
                    setEditDialogOpen(true)
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-accent">#{route.priority}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{route.name}</h3>
                          {!route.enabled && (
                            <Badge variant="outline" className="text-xs">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{route.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="gap-1">
                            <Lightning size={14} />
                            {route.conditions.alertTypes.length} alert types
                          </Badge>
                          <Badge variant="secondary">
                            {getRoutingTypeLabel(route.routing.type)}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Users size={14} />
                            {route.routing.assignTo.length} assignees
                          </Badge>
                          {route.routing.escalationEnabled && (
                            <Badge variant="outline" className="gap-1">
                              <Clock size={14} />
                              Escalates in {route.routing.escalationTime}m
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Conditions:</span>
                          <div className="flex flex-wrap gap-1">
                            {route.conditions.severities.map((severity) => (
                              <Badge key={severity} variant="outline" className="text-xs">
                                {severity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Switch
                        checked={route.enabled}
                        onCheckedChange={() => handleToggleRoute(route.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRoute && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
              <DialogDescription>Update routing rule configuration</DialogDescription>
            </DialogHeader>
            <RouteForm
              route={selectedRoute}
              teamMembers={teamMembers || []}
              onSubmit={handleUpdateRoute}
              onDelete={handleDeleteRoute}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function RouteForm({
  route,
  teamMembers,
  onSubmit,
  onDelete,
  onCancel,
}: {
  route?: AlertRoute
  teamMembers: TeamMember[]
  onSubmit: (route: any) => void
  onDelete?: (id: string) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<AlertRoute>>(
    route || {
      name: '',
      description: '',
      priority: 50,
      conditions: {
        alertTypes: [],
        severities: [],
      },
      routing: {
        type: 'round_robin',
        assignTo: [],
        escalationEnabled: false,
        notifyAll: false,
      },
      enabled: true,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const alertTypes = [
    'covenant_breach',
    'covenant_at_risk',
    'high_risk_loan',
    'critical_risk_loan',
    'default_probability_high',
    'maturity_approaching',
    'lma_compliance_gap',
    'esg_score_downgrade',
  ]

  const severities = ['critical', 'high', 'medium', 'low']

  const toggleAlertType = (type: string) => {
    const current = formData.conditions?.alertTypes || []
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    setFormData({
      ...formData,
      conditions: { ...formData.conditions!, alertTypes: updated },
    })
  }

  const toggleSeverity = (severity: string) => {
    const current = formData.conditions?.severities || []
    const updated = current.includes(severity)
      ? current.filter((s) => s !== severity)
      : [...current, severity]
    setFormData({
      ...formData,
      conditions: { ...formData.conditions!, severities: updated },
    })
  }

  const toggleAssignee = (memberId: string) => {
    const current = formData.routing?.assignTo || []
    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId]
    setFormData({
      ...formData,
      routing: { ...formData.routing!, assignTo: updated },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Route Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority (lower = higher priority)</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Conditions</h3>

        <div className="space-y-2">
          <Label>Alert Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {alertTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`alert-${type}`}
                  checked={formData.conditions?.alertTypes?.includes(type)}
                  onCheckedChange={() => toggleAlertType(type)}
                />
                <Label htmlFor={`alert-${type}`} className="text-sm font-normal cursor-pointer">
                  {type.replace(/_/g, ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Severities</Label>
          <div className="flex gap-2">
            {severities.map((severity) => (
              <div key={severity} className="flex items-center gap-2">
                <Checkbox
                  id={`severity-${severity}`}
                  checked={formData.conditions?.severities?.includes(severity)}
                  onCheckedChange={() => toggleSeverity(severity)}
                />
                <Label htmlFor={`severity-${severity}`} className="text-sm font-normal cursor-pointer">
                  {severity}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Routing</h3>

        <div className="space-y-2">
          <Label htmlFor="routing-type">Assignment Type</Label>
          <Select
            value={formData.routing?.type}
            onValueChange={(value) =>
              setFormData({ ...formData, routing: { ...formData.routing!, type: value as any } })
            }
          >
            <SelectTrigger id="routing-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round_robin">Round Robin</SelectItem>
              <SelectItem value="workload_based">Workload Based</SelectItem>
              <SelectItem value="skill_based">Skill Based</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assign To</Label>
          <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {teamMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members available</p>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={formData.routing?.assignTo?.includes(member.id)}
                    onCheckedChange={() => toggleAssignee(member.id)}
                  />
                  <Label htmlFor={`member-${member.id}`} className="text-sm font-normal cursor-pointer flex-1">
                    {member.name} - {member.role.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Escalation</Label>
            <Switch
              checked={formData.routing?.escalationEnabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  routing: { ...formData.routing!, escalationEnabled: checked },
                })
              }
            />
          </div>

          {formData.routing?.escalationEnabled && (
            <div className="space-y-2 pl-4 border-l-2 border-accent">
              <div className="space-y-2">
                <Label htmlFor="escalation-time">Escalation Time (minutes)</Label>
                <Input
                  id="escalation-time"
                  type="number"
                  value={formData.routing?.escalationTime || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      routing: {
                        ...formData.routing!,
                        escalationTime: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        {route && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(route.id)}
          >
            Delete Route
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{route ? 'Update' : 'Create'} Route</Button>
        </div>
      </div>
    </form>
  )
}
