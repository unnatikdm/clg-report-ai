'use client'

import { useEffect, useRef } from 'react'
import { Copy, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Section } from '@/hooks/use-workspace-state'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'

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
  const [editMode, setEditMode] = useState(false)

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="border-slate-700 hover:bg-slate-800 h-8"
          >
            {editMode ? 'Preview Mode' : 'Edit Mode'}
          </Button>
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
      </div>

      {/* Content */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-950 p-6">
        <div className="max-w-[850px] mx-auto bg-white dark:bg-slate-900 shadow-xl min-h-[1100px] border border-slate-300 dark:border-slate-800">
          <div className="p-12 md:p-20 space-y-6">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className="space-y-3 animate-fade-in-ghost relative group"
              >
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySection(section.content)}
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {editMode ? (
                  <textarea
                    defaultValue={section.content}
                    className="w-full h-full min-h-[200px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono text-sm text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-900 dark:text-slate-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content}
                    </ReactMarkdown>
                  </div>
                )}

                {idx < sections.length - 1 && !editMode && (
                  <div className="my-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-muted-foreground">
        <p>{sections.length} section{sections.length !== 1 ? 's' : ''} • Ready to export</p>
      </div>
    </div>
  )
}
