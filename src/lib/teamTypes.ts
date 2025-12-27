export type TeamRole = 
  | 'admin'
  | 'portfolio_manager'
  | 'risk_analyst'
  | 'compliance_officer'
  | 'trader'
  | 'analyst'
  | 'viewer'

export type WorkloadStatus = 'low' | 'medium' | 'high' | 'critical'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  department: string
  avatarUrl?: string
  status: 'active' | 'away' | 'offline'
  specializations: string[]
  maxLoans: number
  currentLoans: number
  alertPreferences: {
    autoAssign: boolean
    maxAlertsPerDay: number
    preferredAlertTypes: string[]
  }
  workloadStatus: WorkloadStatus
  performanceMetrics: {
    avgResponseTime: number
    alertsResolved: number
    loansManaged: number
    accuracyScore: number
  }
  availability: {
    timezone: string
    workingHours: {
      start: string
      end: string
    }
    daysOff: string[]
  }
}

export interface LoanAssignment {
  id: string
  loanId: string
  loanName: string
  assignedTo: string[]
  assignedBy: string
  assignedAt: string
  role: 'primary' | 'secondary' | 'reviewer'
  status: 'active' | 'completed' | 'transferred'
  notes?: string
  dueDate?: string
}

export interface AlertRoute {
  id: string
  name: string
  description: string
  priority: number
  conditions: {
    alertTypes: string[]
    severities: string[]
    loanCriteria?: {
      industries?: string[]
      riskLevels?: string[]
      minAmount?: number
      maxAmount?: number
    }
  }
  routing: {
    type: 'round_robin' | 'workload_based' | 'skill_based' | 'manual'
    assignTo: string[]
    escalationEnabled: boolean
    escalationTime?: number
    escalateTo?: string[]
    notifyAll: boolean
  }
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AlertAssignment {
  id: string
  alertId: string
  alertType: string
  assignedTo: string
  assignedBy: string
  assignedAt: string
  dueDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'escalated'
  notes?: string
  responseTime?: number
  resolution?: {
    action: string
    outcome: string
    resolvedAt: string
  }
}

export interface TeamActivity {
  id: string
  teamMemberId: string
  teamMemberName: string
  action: 'alert_acknowledged' | 'alert_resolved' | 'loan_assigned' | 'loan_updated' | 'alert_escalated' | 'comment_added'
  targetId: string
  targetType: 'loan' | 'alert' | 'assignment'
  details: Record<string, any>
  timestamp: string
}

export interface TeamNotification {
  id: string
  recipientId: string
  type: 'assignment' | 'escalation' | 'mention' | 'update'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export const ROLE_PERMISSIONS = {
  admin: {
    canManageTeam: true,
    canManageRoutes: true,
    canAssignLoans: true,
    canViewAllLoans: true,
    canExport: true,
    canManageAlerts: true,
  },
  portfolio_manager: {
    canManageTeam: false,
    canManageRoutes: true,
    canAssignLoans: true,
    canViewAllLoans: true,
    canExport: true,
    canManageAlerts: true,
  },
  risk_analyst: {
    canManageTeam: false,
    canManageRoutes: false,
    canAssignLoans: false,
    canViewAllLoans: true,
    canExport: true,
    canManageAlerts: true,
  },
  compliance_officer: {
    canManageTeam: false,
    canManageRoutes: false,
    canAssignLoans: false,
    canViewAllLoans: true,
    canExport: true,
    canManageAlerts: true,
  },
  trader: {
    canManageTeam: false,
    canManageRoutes: false,
    canAssignLoans: false,
    canViewAllLoans: true,
    canExport: false,
    canManageAlerts: false,
  },
  analyst: {
    canManageTeam: false,
    canManageRoutes: false,
    canAssignLoans: false,
    canViewAllLoans: false,
    canExport: false,
    canManageAlerts: false,
  },
  viewer: {
    canManageTeam: false,
    canManageRoutes: false,
    canAssignLoans: false,
    canViewAllLoans: false,
    canExport: false,
    canManageAlerts: false,
  },
}

export const DEFAULT_TEAM_MEMBER: Omit<TeamMember, 'id' | 'name' | 'email'> = {
  role: 'analyst',
  department: 'Operations',
  status: 'active',
  specializations: [],
  maxLoans: 20,
  currentLoans: 0,
  alertPreferences: {
    autoAssign: true,
    maxAlertsPerDay: 50,
    preferredAlertTypes: [],
  },
  workloadStatus: 'low',
  performanceMetrics: {
    avgResponseTime: 0,
    alertsResolved: 0,
    loansManaged: 0,
    accuracyScore: 100,
  },
  availability: {
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    daysOff: [],
  },
}
