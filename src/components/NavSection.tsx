import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
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
  CaretUp,
  Star
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
  const [favorites, setFavorites] = useKV<string[]>('favorite-tabs', [])

  const portfolioTabs = ['portfolio', 'assignments', 'esg']
  const marketTabs = ['pricing', 'trading', 'market']
  const riskTabs = ['analytics', 'spread-monitor', 'spread-trends', 'stress-test', 'alerts']
  const complianceTabs = ['compliance', 'reports', 'team', 'performance', 'routing']

  const isPortfolioActive = portfolioTabs.includes(activeTab)
  const isMarketActive = marketTabs.includes(activeTab)
  const isRiskActive = riskTabs.includes(activeTab)
  const isComplianceActive = complianceTabs.includes(activeTab)

  const toggleFavorite = (tab: string) => {
    setFavorites((current) => {
      const currentFavorites = current || []
      if (currentFavorites.includes(tab)) {
        return currentFavorites.filter((t) => t !== tab)
      } else {
        return [...currentFavorites, tab]
      }
    })
  }

  const isFavorite = (tab: string) => {
    return (favorites || []).includes(tab)
  }

  const renderNavButton = (tab: string, icon: any, label: string, badgeContent?: React.ReactNode) => {
    const Icon = icon
    const isActive = activeTab === tab
    const favorited = isFavorite(tab)

    return (
      <div key={tab} className="relative group">
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab(tab)}
          className="justify-start gap-2 w-full pr-8"
          data-tutorial={`${tab}-tab`}
        >
          <Icon size={18} />
          {label}
          {badgeContent}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(tab)
          }}
          className={`absolute right-0 top-0 h-full px-2 transition-opacity ${
            favorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={16} weight={favorited ? 'fill' : 'regular'} className={favorited ? 'text-accent' : ''} />
        </Button>
      </div>
    )
  }

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
              {renderNavButton('portfolio', FileText, 'Portfolio Overview')}
              {renderNavButton('assignments', FolderOpen, 'Loan Assignments')}
              {renderNavButton('esg', Leaf, 'ESG & Green')}
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
              {renderNavButton('pricing', CurrencyDollar, 'Real-Time Pricing')}
              {renderNavButton('trading', Handshake, 'Trading Hub')}
              {renderNavButton('market', Globe, 'Market Intelligence')}
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
              {renderNavButton('analytics', ChartLine, 'Analytics')}
              {renderNavButton('spread-monitor', TrendUp, 'Spread Monitor')}
              {renderNavButton('spread-trends', ChartLine, 'Spread Trends')}
              {renderNavButton('stress-test', Lightning, 'Stress Testing')}
              {renderNavButton(
                'alerts',
                Lightning,
                'Alert Analytics',
                activeAlertCount > 0 && activeTab !== 'alerts' ? (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                    {activeAlertCount}
                  </Badge>
                ) : undefined
              )}
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
              {renderNavButton('compliance', ShieldCheck, 'Compliance')}
              {renderNavButton('reports', FileDoc, 'Reports')}
              {renderNavButton('team', Users, 'Team Management')}
              {renderNavButton('performance', Trophy, 'Performance')}
              {renderNavButton('routing', GitBranch, 'Alert Routing')}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
