import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FilePreviewProps {
  fileName: string
  content: string
  onRemove: () => void
}

export function FilePreview({ fileName, content, onRemove }: FilePreviewProps) {
  // Truncate content to first 300 characters for preview
  const previewContent = content.length > 300 ? content.substring(0, 300) + '...' : content

  return (
    <Card className="border-slate-700 bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-700 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            {content.length.toLocaleString()} characters
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-48">
        <div className="p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground/90 font-mono">
            {previewContent}
          </p>
        </div>
      </ScrollArea>
    </Card>
  )
}
