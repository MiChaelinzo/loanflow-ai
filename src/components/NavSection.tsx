import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { 
  FileText, 
  FolderOpen, 
  Leaf, 
  CurrencyDollar, 
  Handshake, 
  Globe, 
  ChartLine, 
  TrendUp, 
  Lightning, 
  ShieldCheck, 
  FileDoc, 
  Users, 
  Trophy, 
  GitBranch,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Loan } from '@/lib/types'

interface NavSectionProps {
  loans: Loan[]
  activeTab: string
  setActiveTab: (tab: string) => void
  activeAlertCount: number
}

export function NavSection({ loans, activeTab, setActiveTab, activeAlertCount }: NavSectionProps) {
  const [portfolioOpen, setPortfolioOpen] = useState(true)
  const [marketOpen, setMarketOpen] = useState(true)
  const [riskOpen, setRiskOpen] = useState(true)
  const [complianceOpen, setComplianceOpen] = useState(true)

  const portfolioTabs = ['portfolio', 'assignments', 'esg']
  const marketTabs = ['pricing', 'trading', 'market']
  const riskTabs = ['analytics', 'spread-monitor', 'spread-trends', 'stress-test', 'alerts']
  const complianceTabs = ['compliance', 'reports', 'team', 'performance', 'routing']

  const isPortfolioActive = portfolioTabs.includes(activeTab)
  const isMarketActive = marketTabs.includes(activeTab)
  const isRiskActive = riskTabs.includes(activeTab)
  const isComplianceActive = complianceTabs.includes(activeTab)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Collapsible open={portfolioOpen} onOpenChange={setPortfolioOpen}>
        <Card className={`overflow-hidden transition-all ${isPortfolioActive ? 'ring-2 ring-primary/20' : ''}`}>
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} weight="bold" className={isPortfolioActive ? 'text-primary' : 'text-muted-foreground'} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Portfolio Management</h3>
              </div>
              <div className="flex items-center gap-2">
                {isPortfolioActive && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {portfolioOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 flex flex-col gap-1">
              <Button
                variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('portfolio')}
                className="justify-start gap-2 w-full"
              >
                <FileText size={18} />
                Portfolio Overview
              </Button>
              <Button
                variant={activeTab === 'assignments' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('assignments')}
                className="justify-start gap-2 w-full"
                data-tutorial="assignments-tab"
              >
                <FolderOpen size={18} />
                Loan Assignments
              </Button>
              <Button
                variant={activeTab === 'esg' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('esg')}
                className="justify-start gap-2 w-full"
                data-tutorial="esg-tab"
              >
                <Leaf size={18} />
                ESG & Green
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={marketOpen} onOpenChange={setMarketOpen}>
        <Card className={`overflow-hidden transition-all ${isMarketActive ? 'ring-2 ring-primary/20' : ''}`}>
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} weight="bold" className={isMarketActive ? 'text-primary' : 'text-muted-foreground'} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Market & Trading</h3>
              </div>
              <div className="flex items-center gap-2">
                {isMarketActive && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {marketOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 flex flex-col gap-1">
              <Button
                variant={activeTab === 'pricing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('pricing')}
                className="justify-start gap-2 w-full"
                data-tutorial="pricing-tab"
              >
                <CurrencyDollar size={18} />
                Real-Time Pricing
              </Button>
              <Button
                variant={activeTab === 'trading' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('trading')}
                className="justify-start gap-2 w-full"
                data-tutorial="trading-tab"
              >
                <Handshake size={18} />
                Trading Hub
              </Button>
              <Button
                variant={activeTab === 'market' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('market')}
                className="justify-start gap-2 w-full"
                data-tutorial="market-tab"
              >
                <Globe size={18} />
                Market Intelligence
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={riskOpen} onOpenChange={setRiskOpen}>
        <Card className={`overflow-hidden transition-all ${isRiskActive ? 'ring-2 ring-primary/20' : ''}`}>
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartLine size={20} weight="bold" className={isRiskActive ? 'text-primary' : 'text-muted-foreground'} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Risk & Analytics</h3>
              </div>
              <div className="flex items-center gap-2">
                {activeAlertCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {activeAlertCount}
                  </Badge>
                )}
                {isRiskActive && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {riskOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 flex flex-col gap-1">
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
                className="justify-start gap-2 w-full"
                data-tutorial="analytics-tab"
              >
                <ChartLine size={18} />
                Analytics
              </Button>
              <Button
                variant={activeTab === 'spread-monitor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('spread-monitor')}
                className="justify-start gap-2 w-full"
                data-tutorial="spread-monitor-tab"
              >
                <TrendUp size={18} />
                Spread Monitor
              </Button>
              <Button
                variant={activeTab === 'spread-trends' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('spread-trends')}
                className="justify-start gap-2 w-full"
                data-tutorial="spread-trends-tab"
              >
                <ChartLine size={18} />
                Spread Trends
              </Button>
              <Button
                variant={activeTab === 'stress-test' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('stress-test')}
                className="justify-start gap-2 w-full"
                data-tutorial="stress-test-tab"
              >
                <Lightning size={18} />
                Stress Testing
              </Button>
              <Button
                variant={activeTab === 'alerts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('alerts')}
                className="justify-start gap-2 w-full"
              >
                <Lightning size={18} />
                Alert Analytics
                {activeAlertCount > 0 && activeTab !== 'alerts' && (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                    {activeAlertCount}
                  </Badge>
                )}
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={complianceOpen} onOpenChange={setComplianceOpen}>
        <Card className={`overflow-hidden transition-all ${isComplianceActive ? 'ring-2 ring-primary/20' : ''}`}>
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} weight="bold" className={isComplianceActive ? 'text-primary' : 'text-muted-foreground'} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Compliance & Teams</h3>
              </div>
              <div className="flex items-center gap-2">
                {isComplianceActive && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {complianceOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 flex flex-col gap-1">
              <Button
                variant={activeTab === 'compliance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('compliance')}
                className="justify-start gap-2 w-full"
                data-tutorial="compliance-tab"
              >
                <ShieldCheck size={18} />
                Compliance
              </Button>
              <Button
                variant={activeTab === 'reports' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('reports')}
                className="justify-start gap-2 w-full"
                data-tutorial="reports-tab"
              >
                <FileDoc size={18} />
                Reports
              </Button>
              <Button
                variant={activeTab === 'team' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('team')}
                className="justify-start gap-2 w-full"
                data-tutorial="team-tab"
              >
                <Users size={18} />
                Team Management
              </Button>
              <Button
                variant={activeTab === 'performance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('performance')}
                className="justify-start gap-2 w-full"
                data-tutorial="performance-tab"
              >
                <Trophy size={18} />
                Performance
              </Button>
              <Button
                variant={activeTab === 'routing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('routing')}
                className="justify-start gap-2 w-full"
                data-tutorial="routing-tab"
              >
                <GitBranch size={18} />
                Alert Routing
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
