import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Brain, UploadSimple, Sparkle, ChartLine, Handshake, ShieldCheck, Lightning, Leaf, BookOpen, VideoCamera } from '@phosphor-icons/react'
import { HelpCenterTrigger } from './HelpCenter'

interface WelcomeDashboardProps {
  onLoadDemo: () => void
  onUpload: () => void
}

export function WelcomeDashboard({ onLoadDemo, onUpload }: WelcomeDashboardProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI Document Analysis',
      description: 'GPT-4 powered extraction of loan terms, covenants, and risk factors',
      color: 'text-accent',
    },
    {
      icon: ChartLine,
      title: 'Predictive Analytics',
      description: '30/60/90-day default forecasting and covenant breach predictions',
      color: 'text-success',
    },
    {
      icon: Handshake,
      title: 'Transparent Trading',
      description: 'Secondary market hub with AI-suggested pricing and bid management',
      color: 'text-warning',
    },
    {
      icon: ShieldCheck,
      title: 'LMA Compliance',
      description: 'Automated verification against LMA standards with gap analysis',
      color: 'text-primary',
    },
    {
      icon: Lightning,
      title: 'Stress Testing',
      description: 'Simulate economic scenarios and assess portfolio resilience',
      color: 'text-destructive',
    },
    {
      icon: Leaf,
      title: 'ESG Scoring',
      description: 'Track sustainable lending and environmental impact metrics',
      color: 'text-success',
    },
  ]

  const stats = [
    { label: 'Processing Speed', value: '80% faster', description: 'than manual review' },
    { label: 'Extraction Accuracy', value: '95%+', description: 'for standard terms' },
    { label: 'Risk Detection', value: 'Real-time', description: 'covenant monitoring' },
    { label: 'Market Coverage', value: '$4.5T', description: 'global loan market' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Brain size={48} weight="bold" className="text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Welcome to LoanFlow AI</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Intelligent loan management powered by AI. Transform document processing, risk assessment, and secondary market trading.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button size="lg" onClick={onLoadDemo} variant="secondary" className="gap-2 text-lg px-8 py-6">
            <Sparkle size={24} />
            Load Demo Portfolio
          </Button>
          <Button size="lg" onClick={onUpload} className="gap-2 text-lg px-8 py-6">
            <UploadSimple size={24} />
            Upload Your First Document
          </Button>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-3">New to LoanFlow AI?</p>
          <HelpCenterTrigger />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold font-mono">{stat.value}</p>
                <p className="font-medium text-sm">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Platform Capabilities</h2>
        <div className="grid grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${feature.color}`}>
                    <feature.icon size={24} weight="bold" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Built for LMA Edge Hackathon 2025</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Addressing all five competition categories: Digital Loans, Loan Documents, Transparent Trading, 
              Covenant Monitoring, and Green Lending. A comprehensive solution for the multi-trillion dollar loan market.
            </p>
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">5/5</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">AI-First</p>
                <p className="text-xs text-muted-foreground">Approach</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">Ready</p>
                <p className="text-xs text-muted-foreground">Production</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
