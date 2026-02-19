'use client'

import { List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/hooks/use-workspace-state'

interface TableOfContentsProps {
  sections: Section[]
  activeSection?: string
  onSectionClick?: (sectionId: string) => void
  isOpen?: boolean
  onToggle?: () => void
}

export function TableOfContents({
  sections,
  activeSection,
  onSectionClick,
  isOpen = true,
  onToggle,
}: TableOfContentsProps) {
  if (sections.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <List className="h-4 w-4" />
          Contents
        </h3>
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 px-2 text-xs hover:bg-slate-800"
          >
            {isOpen ? 'Hide' : 'Show'}
          </Button>
        )}
      </div>

      {isOpen && (
        <nav className="space-y-1">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick?.(section.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                activeSection === section.id
                  ? 'bg-cyan-600/20 text-cyan-100 border-l-2 border-cyan-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xs text-muted-foreground mr-2">
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.title}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
