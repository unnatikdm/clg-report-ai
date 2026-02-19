'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface FileUploadResult {
  name: string
  content: string
  size: number
  type: string
}

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF, DOCX, and TXT files are supported'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }, [])

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          resolve(content)
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    }

    // For PDF and DOCX, we'll return a placeholder message
    // In production, you'd use libraries like pdfjs and docx
    return `[File: ${file.name} - ${file.type === 'application/pdf' ? 'PDF' : 'DOCX'} document]
            
Note: Text extraction for PDF/DOCX requires additional libraries.
For now, please copy-paste the text content directly.`
  }, [])

  const uploadFile = useCallback(
    async (file: File): Promise<FileUploadResult | null> => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return null
      }

      setIsLoading(true)
      try {
        const content = await extractTextFromFile(file)
        const result: FileUploadResult = {
          name: file.name,
          content,
          size: file.size,
          type: file.type,
        }
        toast.success(`File "${file.name}" uploaded successfully`)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to read file'
        toast.error(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [validateFile, extractTextFromFile]
  )

  return {
    uploadFile,
    isLoading,
    validateFile,
  }
}
