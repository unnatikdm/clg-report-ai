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
import { useWorkspaceState, Message, Section } from '@/hooks/use-workspace-state'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from 'sonner'
import { parseSections } from '@/lib/doc-parser'
import { applyDocumentPatch, DocumentPatch } from '@/lib/document-reducer'

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

      const lowerContent = content.toLowerCase()
      if (lowerContent.includes('generate') || lowerContent.includes('create')) {
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


  const handleStartGenerating = async () => {
    const userPrompt = 'Perform targeted injection: update the required slots using the new content and apply constraints.'
    addMessage({
      role: 'user',
      content: userPrompt,
    })

    setIsLoading(true)
    setIsSaved(false)

    try {
      // Step 1: Establish Skeleton if it doesn't exist
      let currentSections = state.reportContent.sections
      if (currentSections.length === 0 && state.newContent) {
        currentSections = parseSections(state.newContent.content).map((sec) => ({
          ...sec,
          codeBlocks: []
        }))
        updateReportContent({ sections: currentSections })
      }

      // Mark all as updating for a nice UI effect while waiting
      updateReportContent({
        sections: currentSections.map(s => ({ ...s, isUpdating: true }))
      })

      const currentTreeContext = JSON.stringify(
        currentSections.map(s => ({
          id: s.id,
          title: s.title,
        }))
      )

      // Step 2: Request the Patches
      const response = await fetch('/api/generate/patch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userPrompt,
          sampleDocument: state.sampleDocument?.content || '',
          contentDocument: state.newContent?.content || '',
          constraints: state.constraints,
          currentTreeContext,
          previousMessages: state.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate patch')
      }

      const { patches } = await response.json() as { patches: DocumentPatch[] }

      // Step 3: Apply Patches via Reducer
      const updatedSections = applyDocumentPatch(
        currentSections,
        patches
      )

      updateReportContent({ sections: updatedSections as Section[] })

      const summaryMessage = patches.length > 0
        ? `I have surgically injected ${patches.length} updated slot(s): ${patches.map(p => p.blockId).join(', ')}.`
        : "No sections required updating."

      addMessage({
        role: 'assistant',
        content: summaryMessage,
      })

      setIsSaved(true)
    } catch (error) {
      console.error('Patching error:', error)
      toast.error('Failed to patch generation')

      // Remove loading state on error
      updateReportContent({
        sections: state.reportContent.sections.map(s => ({ ...s, isUpdating: false }))
      })

      addMessage({
        role: 'assistant',
        content: `I encountered an error while patching. Please try again.`,
      })
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
        onStartGenerating={handleStartGenerating}
        isGenerating={isLoading}
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
