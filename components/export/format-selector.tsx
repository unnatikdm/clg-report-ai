'use client'

import { FileText, Download, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FormatOption {
  id: 'word' | 'pdf' | 'html'
  name: string
  description: string
  icon: React.ReactNode
  extension: string
}

interface FormatSelectorProps {
  selected: 'word' | 'pdf' | 'html'
  onSelect: (format: 'word' | 'pdf' | 'html') => void
  onExport: () => void
  isLoading?: boolean
}

export function FormatSelector({
  selected,
  onSelect,
  onExport,
  isLoading,
}: FormatSelectorProps) {
  const formats: FormatOption[] = [
    {
      id: 'word',
      name: 'Microsoft Word',
      description: 'Editable .docx format with full formatting',
      icon: <FileText className="h-8 w-8" />,
      extension: '.docx',
    },
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional .pdf format, perfect for sharing',
      icon: <Download className="h-8 w-8" />,
      extension: '.pdf',
    },
    {
      id: 'html',
      name: 'HTML File',
      description: 'Web-ready .html format for online publishing',
      icon: <Code className="h-8 w-8" />,
      extension: '.html',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Choose Export Format
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {formats.map((format) => (
            <Card
              key={format.id}
              className={`p-6 cursor-pointer transition-all border-2 ${
                selected === format.id
                  ? 'border-cyan-500 bg-cyan-500/5'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
              }`}
              onClick={() => onSelect(format.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`p-3 rounded-lg ${
                    selected === format.id
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {format.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">{format.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format.description}
                  </p>
                </div>

                <span className="text-sm font-mono text-cyan-400">
                  {format.extension}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onExport}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 neon-cyan-glow"
        >
          {isLoading ? 'Exporting...' : `Export as ${selected.toUpperCase()}`}
        </Button>
      </div>
    </div>
  )
}
