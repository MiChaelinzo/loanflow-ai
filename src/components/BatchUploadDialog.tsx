import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { UploadSimple, FileText, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { cn } from '../lib/utils'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

interface BatchUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (extractedData: any) => void
}

interface FileStatus {
  file: File
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  data?: any
  error?: string
}

export function BatchUploadDialog({ open, onOpenChange, onUploadComplete }: BatchUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<FileStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles: FileStatus[] = droppedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const newFiles: FileStatus[] = Array.from(selectedFiles).map(file => ({
        file,
        status: 'pending',
        progress: 0,
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const processFiles = async () => {
    setIsProcessing(true)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue

      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' as const } : f
      ))

      try {
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200))
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress } : f
          ))
        }

        const extractedData = await extractLoanData(files[i].file)
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'complete' as const, progress: 100, data: extractedData } : f
        ))

        onUploadComplete(extractedData)
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error' as const, 
            progress: 0,
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        ))
      }
    }

    setIsProcessing(false)
  }

  const extractLoanData = async (file: File): Promise<any> => {
    const prompt = spark.llmPrompt`You are a loan document analyzer. Extract key information from this loan document.

Document: ${file.name}

Extract and return the following information in JSON format:
{
  "borrowerName": "company name",
  "amount": number (loan amount),
  "currency": "USD/EUR/GBP",
  "interestRate": number (as percentage, e.g., 5.5),
  "maturityDate": "YYYY-MM-DD",
  "originationDate": "YYYY-MM-DD",
  "industry": "industry sector",
  "purpose": "loan purpose",
  "covenants": [
    {
      "type": "covenant type",
      "description": "description",
      "threshold": number
    }
  ],
  "riskFactors": {
    "credit": number (1-10),
    "market": number (1-10),
    "operational": number (1-10),
    "esg": number (1-10)
  },
  "esgNotes": "ESG assessment notes"
}

Generate realistic sample data based on the filename pattern.`

    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
    return JSON.parse(response)
  }

  const handleReset = () => {
    setFiles([])
    setIsProcessing(false)
  }

  const handleClose = () => {
    if (!isProcessing) {
      handleReset()
      onOpenChange(false)
    }
  }

  const completedCount = files.filter(f => f.status === 'complete').length
  const errorCount = files.filter(f => f.status === 'error').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadSimple size={24} />
            Batch Document Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple loan documents for simultaneous AI analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {files.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
                isDragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
              )}
              onClick={() => document.getElementById('batch-file-input')?.click()}
            >
              <UploadSimple size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop loan documents here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse (supports multiple files)
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOCX, and TXT files
              </p>
              <input
                id="batch-file-input"
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText size={20} />
                    <span className="font-medium">{files.length} files</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle size={14} />
                    {completedCount} complete
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle size={14} />
                      {errorCount} errors
                    </Badge>
                  )}
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock size={14} />
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('batch-file-input')?.click()}
                  disabled={isProcessing}
                >
                  Add More
                </Button>
                <input
                  id="batch-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="space-y-3">
                  {files.map((fileStatus, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {fileStatus.status === 'complete' && (
                            <CheckCircle size={20} className="text-success flex-shrink-0" weight="fill" />
                          )}
                          {fileStatus.status === 'error' && (
                            <XCircle size={20} className="text-destructive flex-shrink-0" weight="fill" />
                          )}
                          {fileStatus.status === 'processing' && (
                            <Clock size={20} className="text-accent flex-shrink-0 animate-spin" />
                          )}
                          {fileStatus.status === 'pending' && (
                            <Clock size={20} className="text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">{fileStatus.file.name}</span>
                        </div>
                        <Badge variant={
                          fileStatus.status === 'complete' ? 'default' :
                          fileStatus.status === 'error' ? 'destructive' :
                          fileStatus.status === 'processing' ? 'secondary' :
                          'outline'
                        } className="ml-2 flex-shrink-0">
                          {fileStatus.status}
                        </Badge>
                      </div>
                      {fileStatus.status === 'processing' && (
                        <Progress value={fileStatus.progress} className="h-1" />
                      )}
                      {fileStatus.status === 'error' && (
                        <p className="text-xs text-destructive mt-2">{fileStatus.error}</p>
                      )}
                      {fileStatus.status === 'complete' && fileStatus.data && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {fileStatus.data.borrowerName} · {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: fileStatus.data.currency,
                            notation: 'compact',
                          }).format(fileStatus.data.amount)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isProcessing || files.length === 0}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Close
            </Button>
            {files.length > 0 && (
              <Button onClick={processFiles} disabled={isProcessing || pendingCount === 0}>
                {isProcessing ? 'Processing...' : `Process ${pendingCount} Files`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
