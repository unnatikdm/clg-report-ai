'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Download, Play, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaveIndicator } from './save-indicator'

interface NavigationProps {
  title?: string
  isSaved?: boolean
  onDownload?: () => void
  showBackButton?: boolean
  onStartGenerating?: () => void
  isGenerating?: boolean
}

export function Navigation({
  title = 'ClgReportAI',
  isSaved,
  onDownload,
  showBackButton = true,
  onStartGenerating,
  isGenerating
}: NavigationProps) {
  const router = useRouter()

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0 hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500" />
              <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaved !== undefined && <SaveIndicator isSaved={isSaved} />}

            {onStartGenerating && (
              <Button
                variant="default"
                size="sm"
                onClick={onStartGenerating}
                disabled={isGenerating}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    Start Generating
                  </>
                )}
              </Button>
            )}

            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="border-slate-700 hover:bg-slate-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
