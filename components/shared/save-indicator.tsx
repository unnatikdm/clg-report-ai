import { Check, Clock } from 'lucide-react'

interface SaveIndicatorProps {
  isSaved: boolean
}

export function SaveIndicator({ isSaved }: SaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isSaved ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Saved</span>
        </>
      ) : (
        <>
          <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          <span className="text-amber-500">Saving...</span>
        </>
      )}
    </div>
  )
}
