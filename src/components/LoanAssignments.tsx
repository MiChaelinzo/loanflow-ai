import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { LoanAssignment, TeamMember } from '../lib/teamTypes'
import { Loan } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { UserPlus, FolderOpen, Users, CheckCircle, Clock, ArrowRight, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function LoanAssignments({ loans }: { loans: Loan[] }) {
  const [assignments, setAssignments] = useKV<LoanAssignment[]>('loan-assignments', [])
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleAssignLoan = (loanId: string, assignees: string[], role: string, notes?: string) => {
    const loan = loans.find((l) => l.id === loanId)
    if (!loan) return

    const assignment: LoanAssignment = {
      id: `ASSIGN-${Date.now()}`,
      loanId,
      loanName: loan.borrowerName,
      assignedTo: assignees,
      assignedBy: 'current-user',
      assignedAt: new Date().toISOString(),
      role: role as any,
      status: 'active',
      notes,
    }

    setAssignments((current) => [...(current || []), assignment])

    assignees.forEach((memberId) => {
      const member = teamMembers?.find((m) => m.id === memberId)
      if (member) {
        toast.success(`Assigned to ${member.name}`, {
          description: `${loan.borrowerName} - ${role} role`,
        })
      }
    })

    setAssignDialogOpen(false)
    setSelectedLoan(null)
  }

  const handleUnassign = (assignmentId: string) => {
    setAssignments((current) =>
      (current || []).map((a) =>
        a.id === assignmentId ? { ...a, status: 'completed' } : a
      )
    )
    toast.success('Assignment removed')
  }

  const getAssignmentsForLoan = (loanId: string) => {
    return (assignments || []).filter((a) => a.loanId === loanId && a.status === 'active')
  }

  const getLoansForMember = (memberId: string) => {
    return (assignments || []).filter(
      (a) => a.assignedTo.includes(memberId) && a.status === 'active'
    )
  }

  const unassignedLoans = loans.filter(
    (loan) => getAssignmentsForLoan(loan.id).length === 0
  )

  const filteredAssignments = (assignments || []).filter((assignment) => {
    const matchesSearch = assignment.loanName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary':
        return 'default'
      case 'secondary':
        return 'secondary'
      case 'reviewer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'completed':
        return 'outline'
      case 'transferred':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderOpen size={32} weight="bold" className="text-accent" />
            Loan Assignments
          </h2>
          <p className="text-muted-foreground mt-1">
            Assign loans to team members for review and monitoring
          </p>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus size={20} />
              Assign Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Loan to Team</DialogTitle>
              <DialogDescription>
                Select team members and define their roles for this loan
              </DialogDescription>
            </DialogHeader>
            <AssignmentForm
              loans={loans}
              teamMembers={teamMembers || []}
              selectedLoan={selectedLoan}
              onSubmit={handleAssignLoan}
              onCancel={() => {
                setAssignDialogOpen(false)
                setSelectedLoan(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {(assignments || []).filter((a) => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{unassignedLoans.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Require assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{(teamMembers || []).length}</div>
            <p className="text-xs text-muted-foreground mt-2">Available assignees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {loans.length > 0
                ? Math.round(((loans.length - unassignedLoans.length) / loans.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-2">Loans assigned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
            <div className="flex gap-3 mt-4">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start assigning loans to team members
                </p>
                <Button onClick={() => setAssignDialogOpen(true)}>Assign Loan</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssignments.map((assignment) => {
                  const loan = loans.find((l) => l.id === assignment.loanId)
                  return (
                    <Card key={assignment.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{assignment.loanName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {loan &&
                                  new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: loan.currency,
                                    notation: 'compact',
                                  }).format(loan.amount)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={getRoleColor(assignment.role)}>
                                {assignment.role}
                              </Badge>
                              <Badge variant={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Assigned To</Label>
                            <div className="flex flex-wrap gap-2">
                              {assignment.assignedTo.map((memberId) => {
                                const member = teamMembers?.find((m) => m.id === memberId)
                                return member ? (
                                  <div
                                    key={memberId}
                                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md"
                                  >
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs">
                                        {member.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{member.name}</span>
                                  </div>
                                ) : null
                              })}
                            </div>
                          </div>

                          {assignment.notes && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Notes</Label>
                              <p className="text-sm">{assignment.notes}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(assignment.assignedAt).toLocaleDateString()}
                            </div>
                            {assignment.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnassign(assignment.id)}
                              >
                                Remove
                              </Button>
                            )}
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
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Current loan assignments per team member</CardDescription>
          </CardHeader>
          <CardContent>
            {(teamMembers || []).length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No team members available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(teamMembers || []).map((member) => {
                  const memberAssignments = getLoansForMember(member.id)
                  return (
                    <Card key={member.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {member.role.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <Badge variant="secondary" className="font-mono">
                            {memberAssignments.length}
                          </Badge>
                        </div>

                        {memberAssignments.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1">
                            {memberAssignments.slice(0, 3).map((assignment) => (
                              <div
                                key={assignment.id}
                                className="text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{assignment.loanName}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {assignment.role}
                                </Badge>
                              </div>
                            ))}
                            {memberAssignments.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{memberAssignments.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AssignmentForm({
  loans,
  teamMembers,
  selectedLoan,
  onSubmit,
  onCancel,
}: {
  loans: Loan[]
  teamMembers: TeamMember[]
  selectedLoan: Loan | null
  onSubmit: (loanId: string, assignees: string[], role: string, notes?: string) => void
  onCancel: () => void
}) {
  const [loanId, setLoanId] = useState(selectedLoan?.id || '')
  const [assignees, setAssignees] = useState<string[]>([])
  const [role, setRole] = useState<string>('primary')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loanId && assignees.length > 0) {
      onSubmit(loanId, assignees, role, notes)
    }
  }

  const toggleAssignee = (memberId: string) => {
    setAssignees((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="loan">Loan</Label>
        <Select value={loanId} onValueChange={setLoanId} required>
          <SelectTrigger id="loan">
            <SelectValue placeholder="Select a loan" />
          </SelectTrigger>
          <SelectContent>
            {loans.map((loan) => (
              <SelectItem key={loan.id} value={loan.id}>
                {loan.borrowerName} -{' '}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: loan.currency,
                  notation: 'compact',
                }).format(loan.amount)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary - Main responsibility</SelectItem>
            <SelectItem value="secondary">Secondary - Support role</SelectItem>
            <SelectItem value="reviewer">Reviewer - Review & approve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assign To (select one or more)</Label>
        <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members available</p>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  assignees.includes(member.id) ? 'bg-accent/10 border-2 border-accent' : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => toggleAssignee(member.id)}
              >
                <Avatar>
                  <AvatarFallback>
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {member.role.replace(/_/g, ' ')} • {member.department}
                  </p>
                </div>
                {assignees.includes(member.id) && (
                  <CheckCircle size={24} weight="fill" className="text-accent" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant notes or instructions..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!loanId || assignees.length === 0}>
          Assign Loan
        </Button>
      </div>
    </form>
  )
}
