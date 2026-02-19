'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  label: string
}

export function FileUpload({ onFileSelect, disabled, label }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-all duration-200',
        isDragging
          ? 'border-cyan-400 bg-cyan-500/5'
          : 'border-slate-700 hover:border-slate-600 bg-slate-900/30',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full px-6 py-12 flex flex-col items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
      >
        <Upload className={cn(
          'h-10 w-10 transition-colors',
          isDragging ? 'text-cyan-400' : 'text-slate-400'
        )} />
        
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            or drag and drop your file here
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          PDF, DOCX, or TXT (Max 10MB)
        </p>
      </button>
    </div>
  )
}
