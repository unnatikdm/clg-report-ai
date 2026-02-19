'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from 'react-resizable-panels'
import { Navigation } from '@/components/shared/navigation'
import { ConversationPanel } from '@/components/workspace/conversation-panel'
import { DocumentPreview } from '@/components/workspace/document-preview'
import { ConstraintChips } from '@/components/workspace/constraint-chips'
import { ContextIndicator } from '@/components/workspace/context-indicator'
import { useWorkspaceState, Message } from '@/hooks/use-workspace-state'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from 'sonner'

export default function WorkspacePage() {
  const router = useRouter()
  const {
    state,
    addMessage,
    addConstraint,
    removeConstraint,
    updateReportContent,
    setSampleDocument,
    setNewContent,
  } = useWorkspaceState()

  const [, , isHydrated] = useLocalStorage('clg-sample-file', null)
  const [isSaved, setIsSaved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data from landing page
  useEffect(() => {
    if (!isHydrated) return

    const initialData = localStorage.getItem('clg-workspace-initial')
    if (initialData) {
      try {
        const { sampleDocument, newContent } = JSON.parse(initialData)
        setSampleDocument(sampleDocument)
        setNewContent(newContent)
        localStorage.removeItem('clg-workspace-initial')

        // Add initial system message
        addMessage({
          role: 'assistant',
          content: `I've loaded your documents and analyzed the formatting from "${sampleDocument.name}". 
          
Ready to generate your report using "${newContent.name}". You can:
• Describe changes you want to make
• Add constraints to guide the generation
• View the live preview as we build your report

What would you like to focus on first?`,
        })
      } catch (error) {
        console.error('Failed to load initial data:', error)
        toast.error('Failed to load documents')
        router.push('/')
      }
    }
  }, [isHydrated, setSampleDocument, setNewContent, addMessage, router])

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content,
    })

    // Set loading state
    setIsLoading(true)
    setIsSaved(false)

    try {
      // Call Gemini API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: content,
          sampleDocument: state.sampleDocument?.content || '',
          contentDocument: state.newContent?.content || '',
          constraints: state.constraints,
          previousMessages: state.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const result = await response.json()

      // Add AI response
      addMessage({
        role: 'assistant',
        content: result.content,
      })

      // Parse response to update report content if needed
      const lowerContent = content.toLowerCase()
      if (lowerContent.includes('generate') || lowerContent.includes('create')) {
        // Extract sections from AI response (basic parsing)
        // In production, you'd have more sophisticated parsing
        const sections = state.reportContent.sections.length === 0
          ? [
              {
                id: '1',
                title: 'Generated Content',
                content: result.content,
                codeBlocks: [],
              },
            ]
          : state.reportContent.sections

        updateReportContent({ sections })
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Failed to generate content'}. Please try again.`,
      })

      toast.error(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated || !state.sampleDocument) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navigation
        title="ClgReportAI Workspace"
        isSaved={isSaved}
        showBackButton={true}
      />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Conversation */}
          <Panel defaultSize={50} minSize={25}>
            <div className="h-full flex flex-col overflow-hidden">
              {/* Constraints and Context */}
              <div className="border-b border-slate-800 bg-slate-900/50 p-4 space-y-4 overflow-y-auto">
                <ContextIndicator
                  sampleDocumentName={state.sampleDocument?.name}
                  isIndexed={true}
                />

                <ConstraintChips
                  constraints={state.constraints}
                  onAddConstraint={addConstraint}
                  onRemoveConstraint={removeConstraint}
                  disabled={isLoading}
                />
              </div>

              {/* Conversation */}
              <ConversationPanel
                messages={state.messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-1 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 hover:via-cyan-500/30 transition-colors" />

          {/* Right Panel - Document Preview */}
          <Panel defaultSize={50} minSize={25}>
            <DocumentPreview
              sections={state.reportContent.sections}
              showFormatting={true}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
