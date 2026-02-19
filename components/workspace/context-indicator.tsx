import { Check, AlertCircle } from 'lucide-react'

interface ContextIndicatorProps {
  sampleDocumentName?: string | null
  isIndexed?: boolean
}

export function ContextIndicator({
  sampleDocumentName,
  isIndexed = false,
}: ContextIndicatorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Context</label>
      
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
        {sampleDocumentName ? (
          <>
            <div className="flex items-start gap-2">
              <div
                className={`h-3 w-3 rounded-full flex-shrink-0 mt-0.5 ${
                  isIndexed
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {sampleDocumentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isIndexed ? 'Format indexed' : 'Indexing format...'}
                </p>
              </div>
            </div>
            
            {isIndexed && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded px-2 py-1 border border-green-500/20">
                <Check className="h-3 w-3 flex-shrink-0" />
                <span>Ready to generate</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>No sample document</span>
          </div>
        )}
      </div>
    </div>
  )
}
