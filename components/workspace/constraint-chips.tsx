import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface ConstraintChipsProps {
  constraints: string[]
  onAddConstraint: (constraint: string) => void
  onRemoveConstraint: (constraint: string) => void
  disabled?: boolean
}

export function ConstraintChips({
  constraints,
  onAddConstraint,
  onRemoveConstraint,
  disabled,
}: ConstraintChipsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddConstraint(inputValue.trim())
      setInputValue('')
      setIsAdding(false)
    }
  }

  const predefinedConstraints = [
    'Academic Tone',
    'Technical Focus',
    'Concise',
    'Detailed',
    'Code Examples',
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Constraints
        </label>
        <span className="text-xs text-muted-foreground">{constraints.length} applied</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {constraints.map((constraint) => (
          <div
            key={constraint}
            className="inline-flex items-center gap-1 rounded-full bg-cyan-600/20 px-3 py-1 border border-cyan-500/30 text-sm text-cyan-100"
          >
            <span>{constraint}</span>
            <button
              onClick={() => onRemoveConstraint(constraint)}
              disabled={disabled}
              className="ml-1 hover:text-cyan-50 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex gap-1 items-center">
            <Input
              autoFocus
              placeholder="New constraint..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setInputValue('')
                }
              }}
              className="h-8 w-32 text-sm border-slate-700 bg-slate-800"
              disabled={disabled}
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!inputValue.trim() || disabled}
              className="h-8 bg-cyan-600 hover:bg-cyan-700"
            >
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={disabled}
            className="h-7 border-dashed border-slate-700 hover:bg-slate-800 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Constraint
          </Button>
        )}
      </div>

      {!isAdding && constraints.length === 0 && (
        <div className="text-xs text-muted-foreground space-y-2">
          <p>Try these:</p>
          <div className="flex flex-wrap gap-1">
            {predefinedConstraints.map((constraint) => (
              <button
                key={constraint}
                onClick={() => {
                  onAddConstraint(constraint)
                }}
                disabled={disabled}
                className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50 underline text-xs"
              >
                {constraint}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
