import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { Star, X } from '@phosphor-icons/react'
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
} from '@phosphor-icons/react'

interface FavoritesBarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  activeAlertCount: number
}

const tabConfig: Record<string, { label: string; icon: any }> = {
  portfolio: { label: 'Portfolio', icon: FileText },
  assignments: { label: 'Assignments', icon: FolderOpen },
  esg: { label: 'ESG & Green', icon: Leaf },
  pricing: { label: 'Pricing', icon: CurrencyDollar },
  trading: { label: 'Trading', icon: Handshake },
  market: { label: 'Market Intel', icon: Globe },
  analytics: { label: 'Analytics', icon: ChartLine },
  'spread-monitor': { label: 'Spread Monitor', icon: TrendUp },
  'spread-trends': { label: 'Spread Trends', icon: ChartLine },
  'stress-test': { label: 'Stress Test', icon: Lightning },
  alerts: { label: 'Alert Analytics', icon: Lightning },
  compliance: { label: 'Compliance', icon: ShieldCheck },
  reports: { label: 'Reports', icon: FileDoc },
  team: { label: 'Team', icon: Users },
  performance: { label: 'Performance', icon: Trophy },
  routing: { label: 'Routing', icon: GitBranch },
}

export function FavoritesBar({ activeTab, setActiveTab, activeAlertCount }: FavoritesBarProps) {
  const [favorites, setFavorites] = useKV<string[]>('favorite-tabs', [])

  const handleRemoveFavorite = (tab: string) => {
    setFavorites((current) => (current || []).filter((t) => t !== tab))
  }

  if (!favorites || favorites.length === 0) {
    return null
  }

  return (
    <Card className="p-3 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Star size={18} weight="fill" className="text-accent" />
          <span className="text-sm font-semibold text-muted-foreground">Quick Access</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {favorites.map((tab) => {
            const config = tabConfig[tab]
            if (!config) return null
            
            const Icon = config.icon
            const isActive = activeTab === tab
            const hasAlerts = tab === 'alerts' && activeAlertCount > 0

            return (
              <div key={tab} className="relative group">
                <Button
                  variant={isActive ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="gap-2 pr-8"
                >
                  <Icon size={16} />
                  {config.label}
                  {hasAlerts && !isActive && (
                    <Badge variant="destructive" className="ml-1 h-4 px-1 text-xs">
                      {activeAlertCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFavorite(tab)
                  }}
                  className="absolute right-0 top-0 h-full px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
