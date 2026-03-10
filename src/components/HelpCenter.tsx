import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { 
  MagnifyingGlass, 
  Question, 
  VideoCamera, 
  Rocket, 
  FolderOpen, 
  Handshake, 
  ChartLine, 
  ShieldCheck, 
  Leaf, 
  File, 
  Wrench,
  Play,
  BookOpen,
  X,
  ClockClockwise,
  Sparkle
} from '@phosphor-icons/react'
import { faqs, videoTutorials, helpCategories, HelpCategory, FAQ, VideoTutorial } from '../lib/helpCenterData'
import { cn } from '../lib/utils'

interface HelpCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryIcons: Record<string, any> = {
  rocket: Rocket,
  folder: FolderOpen,
  handshake: Handshake,
  chart: ChartLine,
  shield: ShieldCheck,
  leaf: Leaf,
  file: File,
  wrench: Wrench,
}

export function HelpCenter({ open, onOpenChange }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'faqs' | 'videos'>('faqs')
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)])
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const filteredVideos = videoTutorials.filter((video) => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<HelpCategory, FAQ[]>)

  const groupedVideos = filteredVideos.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = []
    }
    acc[video.category].push(video)
    return acc
  }, {} as Record<HelpCategory, VideoTutorial[]>)

  const getCategoryLabel = (category: HelpCategory) => {
    return helpCategories.find(c => c.id === category)?.label || category
  }

  const getCategoryIcon = (iconName: string) => {
    const Icon = categoryIcons[iconName]
    return Icon ? <Icon size={18} weight="bold" /> : null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen size={28} weight="bold" className="text-accent" />
                  Help Center
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Search FAQs, watch video tutorials, and learn how to use NovaFlow AI
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col px-6 pb-6">
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles, FAQs, and tutorials..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>

                {recentSearches.length > 0 && !searchQuery && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <ClockClockwise size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Recent:</span>
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery(search)}
                        className="h-7 text-xs"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="gap-2"
                  >
                    <Sparkle size={16} />
                    All Topics
                  </Button>
                  {helpCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2"
                    >
                      {getCategoryIcon(category.icon)}
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'faqs' | 'videos')} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="faqs" className="gap-2">
                    <Question size={18} weight="bold" />
                    FAQs ({filteredFAQs.length})
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="gap-2">
                    <VideoCamera size={18} weight="bold" />
                    Video Tutorials ({filteredVideos.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="faqs" className="flex-1 overflow-hidden mt-0">
                  <ScrollArea className="h-full pr-4">
                    {filteredFAQs.length === 0 ? (
                      <div className="text-center py-12">
                        <Question size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-3">
                              {getCategoryIcon(helpCategories.find(c => c.id === category)?.icon || 'file')}
                              <h3 className="font-semibold text-lg">{getCategoryLabel(category as HelpCategory)}</h3>
                              <Badge variant="secondary">{categoryFAQs.length}</Badge>
                            </div>
                            <Accordion type="single" collapsible className="space-y-2">
                              {categoryFAQs.map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                                  <AccordionTrigger className="hover:no-underline py-4">
                                    <span className="text-left font-medium">{faq.question}</span>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-4">
                                    <div className="space-y-4">
                                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                      
                                      {faq.relatedVideos && faq.relatedVideos.length > 0 && (
                                        <div className="pt-3 border-t">
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <VideoCamera size={16} />
                                            Related Videos
                                          </p>
                                          <div className="flex gap-2 flex-wrap">
                                            {faq.relatedVideos.map((videoId) => {
                                              const video = videoTutorials.find(v => v.id === videoId)
                                              return video ? (
                                                <Button
                                                  key={videoId}
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => setSelectedVideo(video)}
                                                  className="gap-2"
                                                >
                                                  <Play size={14} weight="fill" />
                                                  {video.title}
                                                </Button>
                                              ) : null
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {faq.relatedFAQs && faq.relatedFAQs.length > 0 && (
                                        <div className="pt-3 border-t">
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Question size={16} />
                                            Related Questions
                                          </p>
                                          <div className="space-y-1">
                                            {faq.relatedFAQs.map((relatedId) => {
                                              const relatedFAQ = faqs.find(f => f.id === relatedId)
                                              return relatedFAQ ? (
                                                <button
                                                  key={relatedId}
                                                  onClick={() => {
                                                    const element = document.getElementById(relatedId)
                                                    element?.scrollIntoView({ behavior: 'smooth' })
                                                  }}
                                                  className="text-sm text-accent hover:underline block text-left"
                                                >
                                                  → {relatedFAQ.question}
                                                </button>
                                              ) : null
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="videos" className="flex-1 overflow-hidden mt-0">
                  <ScrollArea className="h-full pr-4">
                    {filteredVideos.length === 0 ? (
                      <div className="text-center py-12">
                        <VideoCamera size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedVideos).map(([category, categoryVideos]) => (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-3">
                              {getCategoryIcon(helpCategories.find(c => c.id === category)?.icon || 'file')}
                              <h3 className="font-semibold text-lg">{getCategoryLabel(category as HelpCategory)}</h3>
                              <Badge variant="secondary">{categoryVideos.length}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {categoryVideos.map((video) => (
                                <Card 
                                  key={video.id} 
                                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <div className="relative aspect-video bg-muted">
                                    <img 
                                      src={video.thumbnail} 
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                        <Play size={28} weight="fill" className="text-primary ml-1" />
                                      </div>
                                    </div>
                                    <Badge className="absolute top-2 right-2 gap-1">
                                      <ClockClockwise size={14} />
                                      {video.duration}
                                    </Badge>
                                  </div>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-base line-clamp-1">{video.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">
                                      {video.description}
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <VideoCamera size={24} weight="bold" className="text-accent" />
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedVideo?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Play size={64} weight="fill" className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Video player demo</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {selectedVideo.duration}
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Play size={18} weight="fill" />
                    Play Tutorial
                  </Button>
                </div>
              </div>

              {selectedVideo.transcript && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <File size={18} />
                    Transcript
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedVideo.transcript}
                  </p>
                </div>
              )}

              {selectedVideo.relatedFAQs && selectedVideo.relatedFAQs.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Question size={18} />
                    Related FAQs
                  </h4>
                  <div className="space-y-2">
                    {selectedVideo.relatedFAQs.map((faqId) => {
                      const faq = faqs.find(f => f.id === faqId)
                      return faq ? (
                        <button
                          key={faqId}
                          onClick={() => {
                            setSelectedVideo(null)
                            setActiveTab('faqs')
                            setTimeout(() => {
                              const element = document.getElementById(faqId)
                              element?.scrollIntoView({ behavior: 'smooth' })
                            }, 100)
                          }}
                          className="text-sm text-accent hover:underline block text-left w-full"
                        >
                          → {faq.question}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function HelpCenterTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="default"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <BookOpen size={20} />
        Help Center
      </Button>
      <HelpCenter open={open} onOpenChange={setOpen} />
    </>
  )
}
