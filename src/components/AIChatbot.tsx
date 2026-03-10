import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { 
  X, 
  PaperPlaneRight, 
  Robot, 
  User, 
  Sparkle, 
  ArrowCounterClockwise,
  Copy,
  Check
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface QuickAction {
  label: string
  prompt: string
  icon: typeof Sparkle
}

const quickActions: QuickAction[] = [
  {
    label: 'How do I upload loan documents?',
    prompt: 'How do I upload loan documents to the platform?',
    icon: Sparkle,
  },
  {
    label: 'Explain risk scoring',
    prompt: 'Can you explain how the risk scoring system works?',
    icon: Sparkle,
  },
  {
    label: 'What is LMA compliance?',
    prompt: 'What is LMA compliance and why is it important?',
    icon: Sparkle,
  },
  {
    label: 'How to use trading hub?',
    prompt: 'How do I create a listing in the trading hub?',
    icon: Sparkle,
  },
]

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

export function AIChatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useKV<Message[]>('chatbot-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const systemContext = `You are an AI assistant for NovaFlow AI, an intelligent loan document analysis and risk management platform. You help users understand how to use the platform's features including:

- **Document Upload**: Upload loan documents (PDF/Word) for AI-powered analysis and data extraction
- **Portfolio Management**: View and manage loan portfolios with advanced filtering by currency, industry, status, and risk level
- **Risk Assessment**: Multi-dimensional risk scoring across credit, market, operational, and ESG factors
- **Covenant Monitoring**: Real-time tracking of financial covenants with breach predictions
- **Trading Hub**: Secondary market for transparent loan trading with bid/ask functionality
- **Analytics Dashboard**: Portfolio analytics, concentration risk, risk distribution, and performance metrics
- **Stress Testing**: Simulate economic scenarios to assess portfolio resilience
- **Market Intelligence**: Real-time market trends, currency exposure, industry performance
- **Compliance Checker**: Automated LMA standards verification and gap analysis
- **ESG Scoring**: Environmental, Social, and Governance assessment for green lending
- **Batch Upload**: Process multiple loan documents simultaneously
- **Export & Reporting**: Generate reports in PDF, Excel, and JSON formats

Key platform capabilities:
- AI-powered document extraction using Amazon Nova
- Predictive analytics for default probability and covenant breaches
- LMA compliance scoring and gap identification
- Real-time covenant monitoring with status indicators
- Secondary market price suggestions and trade execution
- ESG scoring aligned with green lending frameworks

Be helpful, concise, and professional. Provide step-by-step guidance when explaining features. Reference specific UI elements like tabs, buttons, and metrics when relevant.`

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages((current) => [...(current || []), userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const prompt = spark.llmPrompt`${systemContext}

User question: ${text}

Provide a helpful, concise response that addresses the user's question about the NovaFlow AI platform. If the question is about a specific feature, explain how to use it step-by-step. Keep your response focused and practical.`

      const response = await spark.llm(prompt, 'amazon.nova-lite-v1:0')

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setMessages((current) => [...(current || []), assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response', {
        description: 'Please try again in a moment',
      })

      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try your question again in a moment, or explore the Help Center for immediate assistance.",
        timestamp: Date.now(),
      }

      setMessages((current) => [...(current || []), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handleClearChat = () => {
    setMessages([])
    toast.success('Chat history cleared')
  }

  const handleCopyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <Card className="w-[450px] h-[650px] flex flex-col shadow-2xl pointer-events-auto border-2 border-accent/20">
        <CardHeader className="border-b bg-gradient-to-r from-accent/10 to-primary/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                <Robot size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ask me anything about NovaFlow AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(messages || []).length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8"
                  title="Clear chat"
                >
                  <ArrowCounterClockwise size={18} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" ref={scrollRef}>
            <div className="space-y-4 min-h-full">
              {(messages || []).length === 0 && (
                <div className="space-y-6 py-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkle size={32} className="text-accent" weight="fill" />
                    </div>
                    <h3 className="font-semibold text-lg">Welcome to AI Assistant!</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      I can help you understand and use all features of NovaFlow AI. Ask me anything!
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start h-auto py-3 px-4 text-left"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <action.icon size={16} className="mr-2 flex-shrink-0 text-accent" />
                          <span className="text-sm">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(messages || []).map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 group',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Robot size={18} weight="bold" className="text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'relative max-w-[85%] rounded-2xl px-4 py-3 break-words',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-xs opacity-60">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyMessage(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check size={14} className="text-success" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={18} weight="bold" className="text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Robot size={18} weight="bold" className="text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 bg-card">
            {(messages || []).length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {quickActions.slice(0, 2).map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 text-xs h-7"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses may not always be accurate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AIChatbotTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="default"
      onClick={onClick}
      className="gap-2 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
    >
      <Robot size={20} weight="bold" />
      AI Chat
    </Button>
  )
}
