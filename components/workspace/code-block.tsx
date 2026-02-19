'use client'

import { Copy, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CodeBlockProps {
  code: string
  language: string
  title?: string
  onRun?: () => void
}

export function CodeBlock({
  code,
  language,
  title,
  onRun,
}: CodeBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  // Language color mapping
  const languageColors: Record<string, string> = {
    python: 'text-blue-400',
    javascript: 'text-yellow-400',
    typescript: 'text-blue-300',
    jsx: 'text-cyan-300',
    tsx: 'text-cyan-300',
    java: 'text-orange-400',
    cpp: 'text-red-400',
    c: 'text-gray-400',
    go: 'text-cyan-400',
    rust: 'text-orange-300',
    sql: 'text-green-400',
    html: 'text-orange-300',
    css: 'text-blue-500',
    bash: 'text-green-300',
    shell: 'text-green-300',
    json: 'text-yellow-300',
    xml: 'text-orange-400',
    markdown: 'text-slate-400',
  }

  const langColor = languageColors[language.toLowerCase()] || 'text-slate-400'

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 my-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-mono text-foreground">{title}</span>
          )}
          <span className={`text-xs font-semibold ${langColor}`}>
            {language.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRun}
              className="h-7 px-2 border-slate-700 hover:bg-slate-800 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Run
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 border-slate-700 hover:bg-slate-800"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm font-mono text-foreground/90 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
