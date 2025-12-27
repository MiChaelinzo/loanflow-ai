import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Question, BookOpen, VideoCamera, Sparkle, Lightbulb } from '@phosphor-icons/react'
import { HelpCenter } from './HelpCenter'

export function FloatingHelpButton() {
  const [helpCenterOpen, setHelpCenterOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const quickLinks = [
    {
      title: 'Help Center',
      description: 'Browse all FAQs and tutorials',
      icon: BookOpen,
      action: () => {
        setPopoverOpen(false)
        setHelpCenterOpen(true)
      },
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: VideoCamera,
      action: () => {
        setPopoverOpen(false)
        setHelpCenterOpen(true)
      },
    },
    {
      title: 'Quick Tips',
      description: 'Learn key features',
      icon: Lightbulb,
      action: () => {
        setPopoverOpen(false)
        setHelpCenterOpen(true)
      },
    },
  ]

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0"
            aria-label="Help"
          >
            <Question size={28} weight="bold" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-0 mr-6 mb-2">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkle size={20} className="text-accent" weight="bold" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <link.icon size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-0.5">{link.title}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <HelpCenter open={helpCenterOpen} onOpenChange={setHelpCenterOpen} />
    </>
  )
}
