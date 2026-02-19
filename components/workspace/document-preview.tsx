'use client'

import { useEffect, useRef } from 'react'
import { Copy, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Section } from '@/hooks/use-workspace-state'

interface DocumentPreviewProps {
  sections: Section[]
  showFormatting?: boolean
  onToggleFormatting?: () => void
}

export function DocumentPreview({
  sections,
  showFormatting = true,
  onToggleFormatting,
}: DocumentPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCopySection = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col h-full border-l border-slate-800 bg-slate-900/30">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              No content generated yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start the conversation to generate your report
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-l border-slate-800 bg-slate-900/30">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Document Preview</h3>
        {onToggleFormatting && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFormatting}
            className="h-8 w-8 p-0 hover:bg-slate-800"
          >
            {showFormatting ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden">
        <div className="p-6 space-y-6">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="space-y-3 animate-fade-in-ghost"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-cyan-400 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySection(section.content)}
                  className="border-slate-700 hover:bg-slate-800 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {idx < sections.length - 1 && (
                <div className="border-t border-slate-800" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-muted-foreground">
        <p>{sections.length} section{sections.length !== 1 ? 's' : ''} • Ready to export</p>
      </div>
    </div>
  )
}
