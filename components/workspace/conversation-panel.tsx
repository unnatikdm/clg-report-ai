'use client'

import { useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from '@/hooks/use-workspace-state'

interface ConversationPanelProps {
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (content: string) => void
}

export function ConversationPanel({
  messages,
  isLoading,
  onSendMessage,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Auto-scroll to latest message
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [messages])

  const handleSend = () => {
    const content = textareaRef.current?.value.trim()
    if (content) {
      onSendMessage(content)
      if (textareaRef.current) {
        textareaRef.current.value = ''
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-full border-r border-slate-800 bg-slate-900/30">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No messages yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Start by describing what you'd like to change about your report
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in-ghost ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                    message.role === 'user'
                      ? 'bg-cyan-600/30 text-cyan-100 border border-cyan-500/30'
                      : 'bg-slate-800 text-foreground border border-slate-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="rounded-lg px-4 py-2 bg-slate-800 text-foreground border border-slate-700">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse animation-delay-100" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse animation-delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/50 p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Describe what you'd like to change... (⌘+Enter to send)"
            className="min-h-10 resize-none border-slate-700 bg-slate-800 text-foreground placeholder:text-muted-foreground focus:border-cyan-500"
            onKeyDown={handleKeyDown}
            onChange={handleTextareaChange}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white self-end neon-cyan-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: Use constraints and custom edits to fine-tune your report
        </p>
      </div>
    </div>
  )
}
