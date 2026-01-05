import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Brain, UploadSimple, Sparkle, ChartLine, Handshake, ShieldCheck, Lightning, Leaf, BookOpen, VideoCamera, Target, TrendUp, Users, Globe, CheckCircle, ArrowRight, Rocket, Bank, FileText, CircleDashed } from '@phosphor-icons/react'
import { HelpCenterTrigger } from './HelpCenter'

interface WelcomeDashboardProps {
  onLoadDemo: () => void
  onUpload: () => void
  onDismiss?: () => void
}

export function WelcomeDashboard({ onLoadDemo, onUpload, onDismiss }: WelcomeDashboardProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI Document Analysis',
      description: 'GPT-4 powered extraction of loan terms, covenants, and risk factors with 95%+ accuracy',
      color: 'text-accent',
      category: 'Digital Loans',
    },
    {
      icon: FileText,
      title: 'Smart Document Processing',
      description: 'Automated LMA compliance checking and standardized document generation',
      color: 'text-primary',
      category: 'Loan Documents',
    },
    {
      icon: Handshake,
      title: 'Transparent Trading Hub',
      description: 'Secondary market platform with real-time pricing, bid management, and AI valuations',
      color: 'text-warning',
      category: 'Transparent Trading',
    },
    {
      icon: ShieldCheck,
      title: 'Covenant Monitoring',
      description: 'Real-time tracking with predictive breach alerts and automated compliance reporting',
      color: 'text-primary',
      category: 'Keeping Loans on Track',
    },
    {
      icon: Leaf,
      title: 'ESG & Green Lending',
      description: 'Comprehensive ESG scoring, carbon tracking, and sustainable lending metrics',
      color: 'text-success',
      category: 'Greener Lending',
    },
    {
      icon: ChartLine,
      title: 'Predictive Analytics',
      description: 'Advanced forecasting, stress testing, and portfolio intelligence powered by AI',
      color: 'text-accent',
      category: 'Digital Loans',
    },
  ]

  const stats = [
    { label: 'Processing Speed', value: '80% faster', description: 'than manual review', icon: Rocket },
    { label: 'Extraction Accuracy', value: '95%+', description: 'for standard terms', icon: Target },
    { label: 'Risk Detection', value: 'Real-time', description: 'covenant monitoring', icon: Lightning },
    { label: 'Market Coverage', value: '$4.5T', description: 'global loan market', icon: Globe },
  ]

  const valueProps = [
    {
      title: 'Value Proposition',
      icon: Target,
      points: [
        'Reduce document processing time from hours to minutes',
        'Eliminate manual errors in covenant tracking and compliance',
        'Enable data-driven loan trading with transparent pricing',
        'Proactive risk management with AI-powered predictions',
      ],
    },
    {
      title: 'Target Market',
      icon: Bank,
      points: [
        'Commercial banks and lending institutions',
        'Asset managers with loan portfolios',
        'Private credit funds and CLO managers',
        'Corporate treasury and finance teams',
      ],
    },
    {
      title: 'Efficiency Gains',
      icon: TrendUp,
      points: [
        '80% reduction in document review time',
        '95% automated compliance verification',
        'Real-time portfolio risk monitoring (vs weekly/monthly)',
        'Instant market pricing vs days of analysis',
      ],
    },
    {
      title: 'Scalability',
      icon: CircleDashed,
      points: [
        'Cloud-based architecture for global deployment',
        'Multi-currency and multi-jurisdiction support',
        'API-ready for integration with existing systems',
        'Team collaboration with role-based access',
      ],
    },
  ]

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-primary/10 to-background border-2 border-accent/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,144,226,0.1),transparent_50%)]" />
        
        <div className="relative text-center space-y-6 py-16 px-8">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
            LMA Edge Hackathon 2025 Submission
          </Badge>
          
          <div className="w-28 h-28 bg-gradient-to-br from-accent via-primary to-accent/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
            <Brain size={56} weight="bold" className="text-white" />
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            LoanFlow AI
          </h1>
          
          <p className="text-2xl font-semibold text-foreground max-w-3xl mx-auto">
            Intelligent Loan Management & Trading Platform
          </p>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform the $4.5 trillion loan market with AI-powered document processing, real-time risk analytics, 
            transparent secondary trading, and automated compliance monitoring. A comprehensive solution addressing 
            all five LMA Edge Hackathon categories.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-8">
            <Button size="lg" onClick={onLoadDemo} variant="secondary" className="gap-2 text-lg px-8 py-6 shadow-lg">
              <Sparkle size={24} weight="bold" />
              Load Demo Portfolio
            </Button>
            <Button size="lg" onClick={onUpload} className="gap-2 text-lg px-8 py-6 shadow-lg">
              <UploadSimple size={24} weight="bold" />
              Upload Your First Document
            </Button>
          </div>

          {onDismiss && (
            <div className="pt-4">
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
                Skip and start with empty portfolio
              </Button>
            </div>
          )}

          <div className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">New to LoanFlow AI? Start with our interactive tutorial</p>
            <div className="flex items-center justify-center gap-3">
              <HelpCenterTrigger />
              <Button variant="ghost" size="sm" className="gap-2">
                <VideoCamera size={18} />
                Watch Demo Video
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Why LoanFlow AI?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for commercial viability with clear value proposition, scalability, and measurable impact
          </p>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-card via-card to-muted/30 border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
                    <stat.icon size={24} className="text-accent" weight="bold" />
                  </div>
                  <p className="text-4xl font-bold font-mono bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="font-semibold text-sm">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {valueProps.map((section, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <section.icon size={24} className="text-primary" weight="bold" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-success mt-0.5 flex-shrink-0" weight="fill" />
                      <span className="text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Comprehensive Platform Features</h2>
          <p className="text-muted-foreground text-lg">Addressing all five LMA Edge Hackathon categories</p>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl hover:scale-[1.02] transition-all border-2 hover:border-accent/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-xs">
                    {feature.category}
                  </Badge>
                  <div className={`w-14 h-14 rounded-xl bg-muted flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} weight="bold" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 border-2 border-accent/40 shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="text-accent" size={32} weight="fill" />
              <h3 className="text-3xl font-bold">Competition Alignment</h3>
            </div>
            
            <p className="text-muted-foreground max-w-4xl mx-auto text-lg leading-relaxed">
              LoanFlow AI delivers a <span className="font-semibold text-foreground">commercially viable, scalable solution</span> for the multi-trillion dollar loan market. 
              Our platform demonstrates <span className="font-semibold text-foreground">clear value proposition</span> with measurable efficiency gains, 
              significant <span className="font-semibold text-foreground">risk mitigation capabilities</span>, and drives <span className="font-semibold text-foreground">industry-wide standardization</span> through 
              LMA compliance automation.
            </p>
            
            <Separator className="my-6 bg-accent/20" />
            
            <div className="grid grid-cols-5 gap-6 pt-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-2xl flex items-center justify-center">
                  <Brain size={32} className="text-accent" weight="bold" />
                </div>
                <p className="font-bold text-lg">Digital Loans</p>
                <p className="text-xs text-muted-foreground">AI Processing</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                  <FileText size={32} className="text-primary" weight="bold" />
                </div>
                <p className="font-bold text-lg">Documents</p>
                <p className="text-xs text-muted-foreground">LMA Compliance</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-warning/20 rounded-2xl flex items-center justify-center">
                  <Handshake size={32} className="text-warning" weight="bold" />
                </div>
                <p className="font-bold text-lg">Trading</p>
                <p className="text-xs text-muted-foreground">Transparent Market</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={32} className="text-accent" weight="bold" />
                </div>
                <p className="font-bold text-lg">On Track</p>
                <p className="text-xs text-muted-foreground">Covenant Monitor</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-success/20 rounded-2xl flex items-center justify-center">
                  <Leaf size={32} className="text-success" weight="bold" />
                </div>
                <p className="font-bold text-lg">Green</p>
                <p className="text-xs text-muted-foreground">ESG Scoring</p>
              </div>
            </div>
            
            <div className="pt-6">
              <Button size="lg" onClick={onLoadDemo} className="gap-2 shadow-lg">
                Get Started <ArrowRight size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <BookOpen size={48} className="mx-auto text-muted-foreground" weight="duotone" />
            <h3 className="text-xl font-bold">Ready to Explore?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Load our demo portfolio to see LoanFlow AI in action with sample loan documents, 
              real-time analytics, trading features, and comprehensive reporting tools.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button onClick={onLoadDemo} variant="secondary" className="gap-2">
                <Sparkle size={20} />
                Load Demo Data
              </Button>
              <Button onClick={onUpload} className="gap-2">
                <UploadSimple size={20} />
                Upload Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const Trophy = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="currentColor"
    viewBox="0 0 256 256"
    {...props}
  >
    <path d="M232,64H208V56a16,16,0,0,0-16-16H64A16,16,0,0,0,48,56v8H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8Zm144,0a64,64,0,0,1-128,0V56H192Zm40-24a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z" />
  </svg>
)
