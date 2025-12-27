import { Alert } from './alertTypes'
import { TeamMember, AlertRoute, AlertAssignment, WorkloadStatus } from './teamTypes'
import { Loan } from './types'

export class AlertRoutingService {
  private lastRoundRobinIndex: Map<string, number> = new Map()

  routeAlert(
    alert: Alert,
    loan: Loan | undefined,
    routes: AlertRoute[],
    teamMembers: TeamMember[]
  ): string | null {
    const activeRoutes = routes
      .filter((route) => route.enabled)
      .sort((a, b) => a.priority - b.priority)

    for (const route of activeRoutes) {
      if (this.matchesRoute(alert, loan, route)) {
        const eligibleMembers = teamMembers.filter((member) =>
          route.routing.assignTo.includes(member.id)
        )

        if (eligibleMembers.length === 0) continue

        switch (route.routing.type) {
          case 'workload_based':
            return this.assignByWorkload(eligibleMembers)
          case 'skill_based':
            return this.assignBySkill(eligibleMembers, loan)
          case 'round_robin':
            return this.assignRoundRobin(route.id, eligibleMembers)
          case 'manual':
            return null
        }
      }
    }

    return null
  }

  private matchesRoute(alert: Alert, loan: Loan | undefined, route: AlertRoute): boolean {
    if (!route.conditions.alertTypes.includes(alert.type)) {
      return false
    }

    if (!route.conditions.severities.includes(alert.severity)) {
      return false
    }

    if (loan && route.conditions.loanCriteria) {
      const criteria = route.conditions.loanCriteria

      if (criteria.industries && !criteria.industries.includes(loan.industry)) {
        return false
      }

      if (criteria.riskLevels && !criteria.riskLevels.includes(loan.riskLevel)) {
        return false
      }

      if (criteria.minAmount && loan.amount < criteria.minAmount) {
        return false
      }

      if (criteria.maxAmount && loan.amount > criteria.maxAmount) {
        return false
      }
    }

    return true
  }

  private assignByWorkload(members: TeamMember[]): string | null {
    const available = members.filter((m) => m.status === 'active')
    if (available.length === 0) return null

    const sorted = [...available].sort((a, b) => {
      const aWorkload = a.currentLoans / a.maxLoans
      const bWorkload = b.currentLoans / b.maxLoans
      return aWorkload - bWorkload
    })

    return sorted[0].id
  }

  private assignBySkill(members: TeamMember[], loan: Loan | undefined): string | null {
    const available = members.filter((m) => m.status === 'active')
    if (available.length === 0) return null

    if (loan) {
      const specialized = available.filter((m) =>
        m.specializations.some((spec) => spec.toLowerCase().includes(loan.industry.toLowerCase()))
      )

      if (specialized.length > 0) {
        return this.assignByWorkload(specialized)
      }
    }

    return this.assignByWorkload(available)
  }

  private assignRoundRobin(routeId: string, members: TeamMember[]): string | null {
    const available = members.filter((m) => m.status === 'active')
    if (available.length === 0) return null

    const lastIndex = this.lastRoundRobinIndex.get(routeId) || 0
    const nextIndex = (lastIndex + 1) % available.length
    this.lastRoundRobinIndex.set(routeId, nextIndex)

    return available[nextIndex].id
  }

  shouldEscalate(assignment: AlertAssignment, route: AlertRoute): boolean {
    if (!route.routing.escalationEnabled || !route.routing.escalationTime) {
      return false
    }

    const now = new Date().getTime()
    const assignedAt = new Date(assignment.assignedAt).getTime()
    const minutesPassed = (now - assignedAt) / (1000 * 60)

    return minutesPassed >= route.routing.escalationTime
  }

  calculateWorkloadStatus(member: TeamMember): WorkloadStatus {
    const workloadRatio = member.currentLoans / member.maxLoans

    if (workloadRatio >= 0.9) return 'critical'
    if (workloadRatio >= 0.7) return 'high'
    if (workloadRatio >= 0.4) return 'medium'
    return 'low'
  }

  getTeamCapacity(teamMembers: TeamMember[]): {
    total: number
    used: number
    available: number
    percentage: number
  } {
    const total = teamMembers.reduce((sum, m) => sum + m.maxLoans, 0)
    const used = teamMembers.reduce((sum, m) => sum + m.currentLoans, 0)
    const available = total - used

    return {
      total,
      used,
      available,
      percentage: total > 0 ? (used / total) * 100 : 0,
    }
  }

  getRecommendedAssignee(
    alert: Alert,
    loan: Loan | undefined,
    teamMembers: TeamMember[]
  ): { memberId: string; reason: string } | null {
    const available = teamMembers.filter(
      (m) => m.status === 'active' && m.alertPreferences.autoAssign
    )

    if (available.length === 0) return null

    const scored = available.map((member) => {
      let score = 0
      let reasons: string[] = []

      if (
        member.alertPreferences.preferredAlertTypes.includes(alert.type)
      ) {
        score += 30
        reasons.push('preferred alert type')
      }

      if (loan) {
        const hasSkill = member.specializations.some((spec) =>
          loan.industry.toLowerCase().includes(spec.toLowerCase())
        )
        if (hasSkill) {
          score += 25
          reasons.push('industry expertise')
        }
      }

      const workloadRatio = member.currentLoans / member.maxLoans
      score += (1 - workloadRatio) * 20
      if (workloadRatio < 0.5) {
        reasons.push('low workload')
      }

      score += (member.performanceMetrics.accuracyScore / 100) * 15
      if (member.performanceMetrics.accuracyScore >= 95) {
        reasons.push('high accuracy')
      }

      const avgResponseMinutes = member.performanceMetrics.avgResponseTime
      if (avgResponseMinutes < 60) {
        score += 10
        reasons.push('fast response time')
      }

      return {
        memberId: member.id,
        memberName: member.name,
        score,
        reason: reasons.join(', '),
      }
    })

    const best = scored.sort((a, b) => b.score - a.score)[0]

    return best
      ? { memberId: best.memberId, reason: best.reason }
      : null
  }
}

export const alertRoutingService = new AlertRoutingService()
