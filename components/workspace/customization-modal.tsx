'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Section } from '@/hooks/use-workspace-state'

interface CustomizationModalProps {
  isOpen: boolean
  sections: Section[]
  onClose: () => void
  onApply: (sectionId: string, prompt: string) => void
  isLoading?: boolean
}

export function CustomizationModal({
  isOpen,
  sections,
  onClose,
  onApply,
  isLoading,
}: CustomizationModalProps) {
  const [selectedSection, setSelectedSection] = useState<string>(
    sections[0]?.id || ''
  )
  const [prompt, setPrompt] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const currentSection = sections.find((s) => s.id === selectedSection)

  const handleApply = () => {
    if (!selectedSection || !prompt.trim()) {
      toast.error('Please select a section and enter a prompt')
      return
    }

    onApply(selectedSection, prompt)
    setPrompt('')
    onClose()
  }

  const handleCancel = () => {
    setPrompt('')
    setShowPreview(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl border-slate-700 bg-slate-900">
        <DialogHeader>
          <DialogTitle>Customize Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Select Section
            </label>
            <Select
              value={selectedSection}
              onValueChange={setSelectedSection}
              disabled={isLoading}
            >
              <SelectTrigger className="border-slate-700 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800">
                {sections.map((section) => (
                  <SelectItem
                    key={section.id}
                    value={section.id}
                    className="bg-slate-800"
                  >
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Section Preview */}
          {currentSection && (
            <div className="space-y-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showPreview ? 'Hide' : 'Show'} Current Version
              </button>

              {showPreview && (
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {currentSection.content}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Edit Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              What would you like to change?
            </label>
            <Textarea
              placeholder="E.g., Make this more technical, Add code examples, Simplify the language..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="min-h-24 border-slate-700 bg-slate-800 text-foreground placeholder:text-muted-foreground focus:border-cyan-500"
            />
            <p className="text-xs text-muted-foreground">
              Describe the specific changes you want for this section
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Make it more technical',
                'Simplify the language',
                'Add examples',
                'Make it shorter',
                'Add code snippets',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded px-2 py-1 text-cyan-400 hover:text-cyan-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-slate-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedSection || !prompt.trim() || isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white neon-cyan-glow"
            >
              {isLoading ? 'Applying Changes...' : 'Apply Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
