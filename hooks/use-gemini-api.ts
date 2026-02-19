import { useState, useCallback } from 'react'

export interface GenerateOptions {
  userMessage: string
  sampleDocument: string
  contentDocument: string
  constraints: string[]
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export function useGeminiAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (options: GenerateOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    generate,
    isLoading,
    error,
    clearError,
  }
}
