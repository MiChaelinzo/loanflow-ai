import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { TeamMember, DEFAULT_TEAM_MEMBER, ROLE_PERMISSIONS } from '../lib/teamTypes'
import { sampleTeamMembers } from '../lib/sampleTeamData'
import { alertRoutingService } from '../lib/alertRoutingService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import { Users, Plus, UserCircle, ChartBar, Clock, Target, TrendUp, MapPin, Lightning, Briefcase } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLoadSampleTeam = () => {
    setTeamMembers(sampleTeamMembers)
    toast.success('Sample team loaded', {
      description: `${sampleTeamMembers.length} team members added`,
    })
  }

  const handleAddMember = (newMember: Partial<TeamMember>) => {
    const member: TeamMember = {
      ...DEFAULT_TEAM_MEMBER,
      id: `TM-${Date.now()}`,
      name: newMember.name || '',
      email: newMember.email || '',
      role: newMember.role || 'analyst',
      department: newMember.department || 'Operations',
      specializations: newMember.specializations || [],
    }

    setTeamMembers((current) => [...(current || []), member])
    setAddDialogOpen(false)
    toast.success('Team member added', {
      description: `${member.name} has been added to the team`,
    })
  }

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setTeamMembers((current) =>
      (current || []).map((m) => (m.id === updatedMember.id ? updatedMember : m))
    )
    setEditDialogOpen(false)
    toast.success('Team member updated', {
      description: `${updatedMember.name}'s profile has been updated`,
    })
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers((current) => (current || []).filter((m) => m.id !== memberId))
    setEditDialogOpen(false)
    toast.success('Team member removed')
  }

  const uniqueDepartments = [...new Set((teamMembers || []).map((m) => m.department))].sort()

  const filteredMembers = (teamMembers || []).filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
    return matchesSearch && matchesRole && matchesDepartment
  })

  const capacity = alertRoutingService.getTeamCapacity(teamMembers || [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'portfolio_manager':
        return 'default'
      case 'risk_analyst':
        return 'secondary'
      case 'compliance_officer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-destructive'
      case 'high':
        return 'text-warning'
      case 'medium':
        return 'text-accent'
      default:
        return 'text-success'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success'
      case 'away':
        return 'bg-warning'
      default:
        return 'bg-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users size={32} weight="bold" className="text-accent" />
            Team Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and workload distribution
          </p>
        </div>
        <div className="flex gap-2">
          {(teamMembers || []).length === 0 && (
            <Button variant="secondary" onClick={handleLoadSampleTeam} className="gap-2">
              <Users size={20} />
              Load Sample Team
            </Button>
          )}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a new team member to your organization</DialogDescription>
              </DialogHeader>
              <AddMemberForm onSubmit={handleAddMember} onCancel={() => setAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{(teamMembers || []).length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{capacity.total}</div>
            <p className="text-xs text-muted-foreground mt-2">Maximum loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{capacity.percentage.toFixed(0)}%</div>
            <Progress value={capacity.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{capacity.available}</div>
            <p className="text-xs text-muted-foreground mt-2">Loan slots open</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
          <div className="flex gap-3 mt-4">
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                <SelectItem value="risk_analyst">Risk Analyst</SelectItem>
                <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                <SelectItem value="trader">Trader</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {(teamMembers || []).length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-6">Add team members to enable collaboration</p>
              <Button onClick={handleLoadSampleTeam} variant="secondary">
                Load Sample Team
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedMember(member)
                    setEditDialogOpen(true)
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg font-semibold">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(
                            member.status
                          )}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant={getRoleColor(member.role)} className="text-xs">
                            {member.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Workload</span>
                        <span className={`font-semibold ${getWorkloadColor(member.workloadStatus)}`}>
                          {member.currentLoans}/{member.maxLoans}
                        </span>
                      </div>
                      <Progress
                        value={(member.currentLoans / member.maxLoans) * 100}
                        className="h-2"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {member.performanceMetrics.avgResponseTime}m
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Target size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {member.performanceMetrics.accuracyScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>Update member information and settings</DialogDescription>
            </DialogHeader>
            <EditMemberForm
              member={selectedMember}
              onSubmit={handleUpdateMember}
              onDelete={handleRemoveMember}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AddMemberForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (member: Partial<TeamMember>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: 'analyst',
    department: 'Operations',
    specializations: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as any })}
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
              <SelectItem value="risk_analyst">Risk Analyst</SelectItem>
              <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
              <SelectItem value="trader">Trader</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Member</Button>
      </div>
    </form>
  )
}

function EditMemberForm({
  member,
  onSubmit,
  onDelete,
  onCancel,
}: {
  member: TeamMember
  onSubmit: (member: TeamMember) => void
  onDelete: (id: string) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<TeamMember>(member)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as any })}
          >
            <SelectTrigger id="edit-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
              <SelectItem value="risk_analyst">Risk Analyst</SelectItem>
              <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
              <SelectItem value="trader">Trader</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-department">Department</Label>
          <Input
            id="edit-department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger id="edit-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-maxLoans">Max Loans</Label>
          <Input
            id="edit-maxLoans"
            type="number"
            value={formData.maxLoans}
            onChange={(e) => setFormData({ ...formData, maxLoans: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Auto-assign Alerts</Label>
          <Switch
            checked={formData.alertPreferences.autoAssign}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                alertPreferences: { ...formData.alertPreferences, autoAssign: checked },
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(member.id)}
        >
          Remove Member
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </div>
    </form>
  )
}
