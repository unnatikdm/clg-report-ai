'use client'

import { useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface CodeBlock {
  id: string
  language: string
  code: string
  title?: string
}

export interface Section {
  id: string
  title: string
  content: string
  codeBlocks: string[] // IDs of code blocks
}

export interface ReportContent {
  sections: Section[]
  codeBlocks: CodeBlock[]
  formattingMetadata: Record<string, unknown>
}

export interface WorkspaceState {
  id: string
  sampleDocument: {
    name: string
    content: string
  } | null
  newContent: {
    name: string
    content: string
  } | null
  constraints: string[]
  messages: Message[]
  reportContent: ReportContent
  metadata: {
    createdAt: Date
    lastModified: Date
    status: 'draft' | 'generated' | 'finalized'
  }
}

export function useWorkspaceState(initialState?: Partial<WorkspaceState>) {
  const defaultState: WorkspaceState = {
    id: Math.random().toString(36).substring(7),
    sampleDocument: null,
    newContent: null,
    constraints: [],
    messages: [],
    reportContent: {
      sections: [],
      codeBlocks: [],
      formattingMetadata: {},
    },
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'draft',
    },
    ...initialState,
  }

  const [state, setState] = useState<WorkspaceState>(defaultState)

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        },
      ],
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
      },
    }))
  }, [])

  const updateReportContent = useCallback((content: Partial<ReportContent>) => {
    setState((prev) => ({
      ...prev,
      reportContent: {
        ...prev.reportContent,
        ...content,
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
      },
    }))
  }, [])

  const addConstraint = useCallback((constraint: string) => {
    setState((prev) => ({
      ...prev,
      constraints: [...new Set([...prev.constraints, constraint])],
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
      },
    }))
  }, [])

  const removeConstraint = useCallback((constraint: string) => {
    setState((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((c) => c !== constraint),
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
      },
    }))
  }, [])

  const setSampleDocument = useCallback(
    (doc: { name: string; content: string } | null) => {
      setState((prev) => ({
        ...prev,
        sampleDocument: doc,
        metadata: {
          ...prev.metadata,
          lastModified: new Date(),
        },
      }))
    },
    []
  )

  const setNewContent = useCallback(
    (doc: { name: string; content: string } | null) => {
      setState((prev) => ({
        ...prev,
        newContent: doc,
        metadata: {
          ...prev.metadata,
          lastModified: new Date(),
        },
      }))
    },
    []
  )

  const updateStatus = useCallback(
    (status: WorkspaceState['metadata']['status']) => {
      setState((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          status,
          lastModified: new Date(),
        },
      }))
    },
    []
  )

  const reset = useCallback(() => {
    setState(defaultState)
  }, [defaultState])

  return {
    state,
    addMessage,
    updateReportContent,
    addConstraint,
    removeConstraint,
    setSampleDocument,
    setNewContent,
    updateStatus,
    reset,
  }
}
