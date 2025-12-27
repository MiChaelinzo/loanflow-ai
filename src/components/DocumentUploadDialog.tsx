import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UploadSimple, FileText, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (extractedData: any) => void
}

export function DocumentUploadDialog({ open, onOpenChange, onUploadComplete }: DocumentUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    setFileName(file.name)
    setIsProcessing(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    await new Promise(resolve => setTimeout(resolve, 2000))

    clearInterval(progressInterval)
    setProgress(100)
    setIsComplete(true)

    setTimeout(() => {
      const mockExtractedData = {
        borrowerName: 'Sample Corporation',
        amount: 5000000,
        currency: 'USD',
        interestRate: 5.25,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        originationDate: new Date().toISOString(),
      }
      
      onUploadComplete(mockExtractedData)
      
      setTimeout(() => {
        resetDialog()
        onOpenChange(false)
      }, 1000)
    }, 1000)
  }

  const resetDialog = () => {
    setFileName(null)
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upload Loan Document</DialogTitle>
          <DialogDescription>
            Upload a loan agreement PDF or Word document for AI-powered analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isProcessing && !isComplete && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
                isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadSimple size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop your document here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground">Supported: PDF, DOCX (max 50MB)</p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4 py-8">
              <div className="flex items-center gap-3 text-center justify-center">
                <FileText size={32} className="text-accent" />
                <div className="text-left">
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {isComplete ? 'Analysis complete!' : 'Analyzing document...'}
                  </p>
                </div>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && 'Reading document structure...'}
                {progress >= 30 && progress < 60 && 'Extracting loan terms...'}
                {progress >= 60 && progress < 90 && 'Identifying covenants...'}
                {progress >= 90 && progress < 100 && 'Calculating risk scores...'}
                {progress === 100 && (
                  <div className="flex items-center justify-center gap-2 text-success">
                    <CheckCircle size={20} weight="fill" />
                    <span className="font-medium">Complete!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
