import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Lightbulb, X, BookOpen } from '@phosphor-icons/react'
import { cn } from '../lib/utils'

interface QuickHelpTip {
  id: string
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface QuickHelpProps {
  tip: QuickHelpTip
  onDismiss?: () => void
  className?: string
}

export function QuickHelp({ tip, onDismiss, className }: QuickHelpProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  return (
    <Card className={cn('border-accent/30 bg-accent/5', className)}>
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Lightbulb size={20} weight="fill" className="text-accent" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm">{tip.title}</h4>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 -mt-1"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{tip.message}</p>
            {tip.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={tip.action.onClick}
                className="gap-2 mt-2"
              >
                <BookOpen size={14} />
                {tip.action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const quickHelpTips = {
  portfolio: {
    id: 'portfolio-help',
    title: 'Portfolio Overview',
    message: 'Your portfolio dashboard shows aggregated metrics across all loans. Use filters to narrow down your view by status, risk level, currency, or industry. Click the "Alerts" button to set up automated notifications for covenant breaches and high-risk events.',
  },
  pricing: {
    id: 'pricing-help',
    title: 'Real-Time Loan Pricing',
    message: 'View dynamic market-based valuations using hybrid pricing models (DCF, comparable loans, regression). Track real-time price movements, yield curves, and liquidity scores. Set price alerts to get notified when loans cross important thresholds. Pricing updates automatically every 10 seconds based on market conditions.',
  },
  trading: {
    id: 'trading-help',
    title: 'Loan Trading Hub',
    message: 'List loans for sale or browse available opportunities. The platform uses AI to suggest optimal pricing based on market conditions and comparable transactions.',
  },
  analytics: {
    id: 'analytics-help',
    title: 'Advanced Analytics',
    message: 'Visualize portfolio concentration, risk distribution, and performance trends. Use predictive models to forecast potential defaults and covenant breaches.',
  },
  stressTest: {
    id: 'stress-help',
    title: 'Stress Testing',
    message: 'Run economic scenarios to test portfolio resilience. See how interest rate changes, recessions, or credit downgrades would impact your loans.',
  },
  compliance: {
    id: 'compliance-help',
    title: 'LMA Compliance',
    message: 'Automatically verify loan documentation against LMA standards. Identify gaps and get recommendations to improve market standardization.',
  },
  esg: {
    id: 'esg-help',
    title: 'ESG & Green Lending',
    message: 'Track environmental, social, and governance metrics across your portfolio. Identify green lending opportunities and monitor sustainability impact.',
  },
  upload: {
    id: 'upload-help',
    title: 'Document Upload',
    message: 'Upload loan documents in PDF, DOCX, or TXT format. Our AI extracts key terms, covenants, risk factors, and compliance data automatically.',
  },
  alerts: {
    id: 'alerts-help',
    title: 'Automated Alerts',
    message: 'Configure email alerts for critical events like covenant breaches, high-risk loans, and maturity approaching. Set up quiet hours and daily/weekly digests to stay informed without interruption.',
  },
  alertAnalytics: {
    id: 'alert-analytics-help',
    title: 'Alert Analytics Dashboard',
    message: 'Track alert response times, resolution patterns, and performance trends. Monitor how quickly your team responds to critical events and identify areas for improvement.',
  },
  team: {
    id: 'team-help',
    title: 'Team Management',
    message: 'Manage team members, assign roles, and monitor workload distribution. Track individual performance metrics including response times, accuracy scores, and loans managed.',
  },
  performance: {
    id: 'performance-help',
    title: 'Team Performance Dashboard',
    message: 'View comprehensive performance rankings and efficiency metrics. Identify top performers, track trends over time, and recognize team achievements. Compare metrics across response time, resolution rate, accuracy, and overall efficiency.',
  },
  forecast: {
    id: 'forecast-help',
    title: 'Predictive Forecasting',
    message: 'AI-powered projections show expected team performance for next quarter based on historical trends. Use these insights for capacity planning, resource allocation, and identifying training opportunities before issues arise.',
  },
  routing: {
    id: 'routing-help',
    title: 'Alert Routing',
    message: 'Configure intelligent routing rules to automatically assign alerts to the right team members based on alert type, severity, loan criteria, and team member expertise. Set up escalation paths for unacknowledged alerts.',
  },
  assignments: {
    id: 'assignments-help',
    title: 'Loan Assignments',
    message: 'Assign loans to team members with specific roles (primary, secondary, reviewer). Track assignment coverage and team workload to ensure balanced distribution across your organization.',
  },
  q3forecast: {
    id: 'q3forecast-help',
    title: 'Q3 Forecast Export',
    message: 'Generate comprehensive Q3 performance projections for board presentations and stakeholder reports. Export to PDF for formatted presentations or Excel for detailed analysis. Includes portfolio growth, risk metrics, team performance, and market intelligence forecasts.',
  },
  spreadMonitor: {
    id: 'spread-monitor-help',
    title: 'Spread Widening Monitor',
    message: 'Detect early signs of credit deterioration by monitoring credit spread changes. Spreads widening beyond thresholds can indicate declining borrower creditworthiness, increased market risk perception, or sector-wide stress. Configure severity thresholds and receive automated alerts when spreads breach warning levels.',
  },
}
