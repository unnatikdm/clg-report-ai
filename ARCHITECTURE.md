# Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │   Workspace Page (app/workspace/page.tsx)           │       │
│  │                                                      │       │
│  │  ┌──────────────────────────────────────────┐      │       │
│  │  │  Conversation Panel                      │      │       │
│  │  │  - Displays messages                     │      │       │
│  │  │  - User input textarea                   │      │       │
│  │  │  - Send button                           │      │       │
│  │  └──────────────────────────────────────────┘      │       │
│  │                                                      │       │
│  │  onSendMessage(userMessage) ─────────────┐         │       │
│  │                                           │         │       │
│  └──────────────────────────────────────────┼─────────┘       │
│                                             │                   │
│                    ┌──────────────────┐    │                   │
│                    │ Use Gemini Hook  │◄───┘                   │
│                    │ useGeminiAPI()   │                        │
│                    └──────────────────┘                        │
│                            │                                    │
│                       HTTP POST                                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  API Route: /api/generate (POST)                      │   │
│  │  app/api/generate/route.ts                            │   │
│  │                                                        │   │
│  │  1. Receive request with:                             │   │
│  │     - userMessage                                     │   │
│  │     - sampleDocument                                  │   │
│  │     - contentDocument                                 │   │
│  │     - constraints                                     │   │
│  │     - previousMessages                                │   │
│  │                                                        │   │
│  │  2. Validate input                                    │   │
│  │  3. Call Gemini service                               │   │
│  │  4. Return response                                   │   │
│  │  5. Handle errors                                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  Gemini Service (lib/gemini.ts)                         │  │
│  │                                                          │  │
│  │  generateDocumentWithAI()                              │  │
│  │  - Build system prompt                                 │  │
│  │  - Combine with sample doc, content, constraints      │  │
│  │  - Include conversation history                        │  │
│  │  - Make API call                                       │  │
│  │  - Parse response                                      │  │
│  │  - Track token usage                                  │  │
│  │                                                          │  │
│  │  analyzeDocument()                                     │  │
│  │  - Analyze doc structure                              │  │
│  │  - Describe formatting                                │  │
│  │                                                          │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                   │
│              Load GEMINI_API_KEY from:                         │
│              process.env.GEMINI_API_KEY                        │
│                             │                                   │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                    HTTP REST API Call
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│   GOOGLE GEMINI API          │                                 │
│   https://generativelanguage │                                 │
│   .googleapis.com             │                                 │
├──────────────────────────────┼─────────────────────────────────┤
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  /v1beta/models/gemini-1.5-flash:generateContent    │    │
│  │                                                      │    │
│  │  Input:                                              │    │
│  │  - headers: { x-goog-api-key: YOUR_API_KEY }       │    │
│  │  - body: {                                           │    │
│  │      contents: [{                                   │    │
│  │        role: 'user'                                 │    │
│  │        parts: [{ text: full_prompt }]               │    │
│  │      }]                                              │    │
│  │      generationConfig: {                            │    │
│  │        temperature: 0.7                             │    │
│  │        maxOutputTokens: 4096                        │    │
│  │      }                                               │    │
│  │    }                                                 │    │
│  │                                                      │    │
│  │  Output:                                             │    │
│  │  {                                                   │    │
│  │    candidates: [{                                   │    │
│  │      content: {                                     │    │
│  │        parts: [{ text: 'Generated content...' }]   │    │
│  │      }                                               │    │
│  │    }]                                                │    │
│  │    usageMetadata: {                                 │    │
│  │      inputTokens: X                                 │    │
│  │      outputTokens: Y                                │    │
│  │    }                                                 │    │
│  │  }                                                   │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Request Path
```
User Input
    ↓
handleSendMessage()
    ↓
fetch('/api/generate')
    ↓
API Route validates
    ↓
generateDocumentWithAI()
    ↓
Fetch Gemini API
    ↓
Parse Response
    ↓
Return {content, usage}
    ↓
Add to Messages
    ↓
Display in UI
    ↓
Update Document Preview
```

## State Management

```
WorkspaceState
├── sampleDocument
│   ├── name: string
│   └── content: string
│
├── newContent
│   ├── name: string
│   └── content: string
│
├── constraints: string[]
│
├── messages: Message[]
│   ├── id: string
│   ├── role: 'user' | 'assistant'
│   ├── content: string
│   └── timestamp: Date
│
├── reportContent: ReportContent
│   ├── sections: Section[]
│   ├── codeBlocks: CodeBlock[]
│   └── formattingMetadata: Record
│
└── metadata
    ├── createdAt: Date
    ├── lastModified: Date
    └── status: 'draft' | 'generated' | 'finalized'
```

## Component Hierarchy

```
App
└── Layout
    └── Workspace Page
        ├── Navigation
        ├── PanelGroup (Horizontal)
        │   ├── Panel (Left - Conversation)
        │   │   ├── ContextIndicator
        │   │   ├── ConstraintChips
        │   │   └── ConversationPanel
        │   │       └── ScrollArea
        │   │           └── Messages
        │   │
        │   ├── PanelResizeHandle
        │   │
        │   └── Panel (Right - Preview)
        │       └── DocumentPreview
        │           └── Sections
        │
        └── Background & Styling
```

## Security Architecture

```
┌─────────────────┐
│   .env.local    │ ← API Key stored here
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ process.env         │ ← Loaded at runtime
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ lib/gemini.ts       │ ← Server-side only
│ (Node.js server)    │
└────────┬─────────────┘
         │
         ▼ (API Key included in headers)
         │
         ▼
┌──────────────────────┐
│ Google Gemini API    │
│ (HTTPS encrypted)    │
└──────────────────────┘

✗ Key never reaches browser
✗ Key never in version control
✓ Secure server-to-server communication
```

## Error Handling Flow

```
API Request
    ├─ Missing API Key
    │   └─ Error: "GEMINI_API_KEY not set"
    │
    ├─ Network Error
    │   └─ Error: "Gemini API error"
    │
    ├─ Invalid Response
    │   └─ Error: "Invalid response format"
    │
    └─ Success
        └─ Parse & Return Content
            ├─ Add to Messages
            ├─ Show in UI
            ├─ Update Preview
            └─ Display Success Toast
```

## Performance Characteristics

- **API Response Time**: ~1-3 seconds depending on prompt complexity
- **Token Limit**: 4096 max output tokens
- **Model**: Gemini 1.5 Flash (fast, cost-effective)
- **Temperature**: 0.7 (balanced creativity)
- **Caching**: Conversation history provides context

---

This architecture provides:
- ✅ Security (API key protected)
- ✅ Scalability (Next.js server-side)
- ✅ Responsiveness (React state management)
- ✅ Reliability (Error handling)
- ✅ Maintainability (Modular design)
