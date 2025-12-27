import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  X, 
  CaretLeft, 
  CaretRight, 
  Brain, 
  UploadSimple, 
  ChartLine, 
  ShieldCheck, 
  Handshake,
  Leaf,
  Lightning,
  Globe,
  Check,
  Sparkle,
  Users,
  Trophy
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  targetElement?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlightColor?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LoanFlow AI',
    description: 'Your intelligent platform for loan document analysis, risk management, and trading. Let\'s take a quick tour to get you started.',
    icon: Brain,
    position: 'center',
    highlightColor: 'accent'
  },
  {
    id: 'upload',
    title: 'Upload Loan Documents',
    description: 'Start by uploading loan documents in PDF or Word format. Our AI will automatically extract key terms, covenants, and risk factors in seconds.',
    icon: UploadSimple,
    targetElement: '[data-tutorial="upload-button"]',
    position: 'bottom',
    highlightColor: 'primary'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Overview',
    description: 'View all your loans at a glance with real-time metrics: total exposure, average risk score, covenant compliance, and high-risk alerts.',
    icon: ChartLine,
    targetElement: '[data-tutorial="portfolio-metrics"]',
    position: 'bottom',
    highlightColor: 'accent'
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Access predictive analytics, portfolio trends, and AI-powered recommendations. See 30/60/90 day default probabilities and covenant breach predictions.',
    icon: Lightning,
    targetElement: '[data-tutorial="analytics-tab"]',
    position: 'bottom',
    highlightColor: 'warning'
  },
  {
    id: 'trading',
    title: 'Transparent Loan Trading',
    description: 'List loans for sale, receive bids, and execute trades with transparent pricing. Our AI suggests fair market values based on risk and market conditions.',
    icon: Handshake,
    targetElement: '[data-tutorial="trading-tab"]',
    position: 'bottom',
    highlightColor: 'success'
  },
  {
    id: 'compliance',
    title: 'LMA Compliance Checker',
    description: 'Automatically verify loan documentation against LMA standards. Identify gaps, ensure best practices, and reduce legal review time by 70%.',
    icon: ShieldCheck,
    targetElement: '[data-tutorial="compliance-tab"]',
    position: 'bottom',
    highlightColor: 'primary'
  },
  {
    id: 'stress-test',
    title: 'Portfolio Stress Testing',
    description: 'Simulate economic scenarios like recession or market shocks. Assess portfolio resilience and prepare for adverse conditions with custom parameters.',
    icon: Lightning,
    targetElement: '[data-tutorial="stress-test-tab"]',
    position: 'bottom',
    highlightColor: 'destructive'
  },
  {
    id: 'market',
    title: 'Market Intelligence',
    description: 'Stay informed with real-time market trends, currency exposure analysis, industry risk indicators, and upcoming maturity schedules.',
    icon: Globe,
    targetElement: '[data-tutorial="market-tab"]',
    position: 'bottom',
    highlightColor: 'accent'
  },
  {
    id: 'esg',
    title: 'ESG & Green Lending',
    description: 'Track Environmental, Social, and Governance scores. Support sustainable lending practices and align with green finance frameworks.',
    icon: Leaf,
    targetElement: '[data-tutorial="esg-tab"]',
    position: 'bottom',
    highlightColor: 'success'
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Manage team members, assign roles, and monitor workload distribution. Track individual performance metrics and ensure balanced assignments.',
    icon: Users,
    targetElement: '[data-tutorial="team-tab"]',
    position: 'bottom',
    highlightColor: 'accent'
  },
  {
    id: 'performance',
    title: 'Performance Dashboard',
    description: 'View team efficiency rankings, identify top performers, and track performance trends. Monitor response times, accuracy scores, and achievements.',
    icon: Trophy,
    targetElement: '[data-tutorial="performance-tab"]',
    position: 'bottom',
    highlightColor: 'warning'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start by uploading your first loan document or load our demo data to explore all features. Need help? Access this tutorial anytime from the help menu.',
    icon: Sparkle,
    position: 'center',
    highlightColor: 'accent'
  }
]

interface TutorialWalkthroughProps {
  onComplete?: () => void
}

export function TutorialWalkthrough({ onComplete }: TutorialWalkthroughProps) {
  const [hasSeenTutorial, setHasSeenTutorial] = useKV<boolean>('tutorial-completed', false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTutorial])

  useEffect(() => {
    if (!isVisible) return

    const step = tutorialSteps[currentStep]
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      setHighlightedElement(null)
    }
  }, [currentStep, isVisible])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTutorial()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    completeTutorial()
  }

  const completeTutorial = () => {
    setIsVisible(false)
    setHasSeenTutorial(currentValue => true)
    onComplete?.()
  }

  const restartTutorial = () => {
    setCurrentStep(0)
    setIsVisible(true)
    setHasSeenTutorial(currentValue => false)
  }

  if (hasSeenTutorial && !isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={restartTutorial}
        className="fixed bottom-6 right-6 gap-2 shadow-lg bg-card border z-50"
        data-tutorial="restart-button"
      >
        <Sparkle size={18} weight="fill" className="text-accent" />
        Tutorial
      </Button>
    )
  }

  if (!isVisible) return null

  const step = tutorialSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  const getTooltipPosition = () => {
    if (!highlightedElement || step.position === 'center') return {}
    
    const rect = highlightedElement.getBoundingClientRect()
    const tooltipWidth = 400
    const tooltipHeight = 200
    const offset = 24

    switch (step.position) {
      case 'bottom':
        return {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2 - tooltipWidth / 2
        }
      case 'top':
        return {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + rect.width / 2 - tooltipWidth / 2
        }
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + offset
        }
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - offset
        }
      default:
        return {}
    }
  }

  const tooltipStyle = step.position === 'center' 
    ? {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    : getTooltipPosition()

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleSkip}
            />

            {highlightedElement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed z-[101] pointer-events-none"
                style={{
                  top: highlightedElement.getBoundingClientRect().top - 8,
                  left: highlightedElement.getBoundingClientRect().left - 8,
                  width: highlightedElement.offsetWidth + 16,
                  height: highlightedElement.offsetHeight + 16,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 0 0 4px oklch(var(--color-accent) / 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.6)'
                }}
              />
            )}

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-[102]"
              style={tooltipStyle}
            >
              <Card className={cn(
                "w-[450px] shadow-2xl border-2",
                step.position === 'center' && "max-w-[90vw]"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      "bg-gradient-to-br from-accent/20 to-primary/20"
                    )}>
                      <Icon size={24} weight="bold" className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSkip}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <X size={18} />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-accent to-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="gap-2"
                      >
                        Skip Tutorial
                      </Button>
                      <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrev}
                            className="gap-1"
                          >
                            <CaretLeft size={18} />
                            Back
                          </Button>
                        )}
                        <Button
                          onClick={handleNext}
                          className="gap-2 min-w-24"
                        >
                          {currentStep === tutorialSteps.length - 1 ? (
                            <>
                              <Check size={18} />
                              Finish
                            </>
                          ) : (
                            <>
                              Next
                              <CaretRight size={18} />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {step.position === 'center' && currentStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 pt-6 border-t"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <Brain size={24} className="mx-auto mb-2 text-accent" weight="bold" />
                          <p className="text-xs font-medium">AI-Powered</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <ShieldCheck size={24} className="mx-auto mb-2 text-success" weight="bold" />
                          <p className="text-xs font-medium">LMA Compliant</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <Lightning size={24} className="mx-auto mb-2 text-warning" weight="bold" />
                          <p className="text-xs font-medium">Real-Time</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function TutorialTrigger() {
  const [, setHasSeenTutorial] = useKV<boolean>('tutorial-completed', false)

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setHasSeenTutorial(currentValue => false)}
      className="gap-2"
    >
      <Sparkle size={18} weight="fill" className="text-accent" />
      Show Tutorial
    </Button>
  )
}
