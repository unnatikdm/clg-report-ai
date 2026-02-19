# Gemini API Integration

This project integrates Google's Gemini AI API for intelligent document formatting and content generation.

## Setup

### 1. Environment Variables

Your Gemini API key is stored in `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

This file is in `.gitignore` and will never be committed to version control.

### 2. How It Works

The integration consists of three main parts:

#### A. API Service (`lib/gemini.ts`)
- **`generateDocumentWithAI()`**: Main function that sends requests to Gemini
  - Takes user message, sample document, content document, and constraints
  - Returns AI-generated content with token usage information
  - Includes conversation history for context-aware responses

- **`analyzeDocument()`**: Analyzes document structure and formatting
  - Describes the document's structure, formatting, and characteristics

#### B. API Route (`app/api/generate/route.ts`)
- Next.js API endpoint (`POST /api/generate`)
- Validates incoming requests
- Calls Gemini service
- Returns formatted JSON response
- Handles errors gracefully

#### C. React Hook (`hooks/use-gemini-api.ts`)
- `useGeminiAPI()`: Custom hook for easy integration in components
- Manages loading state, errors, and API calls
- Provides `generate()` function for making requests

### 3. Integration in Workspace

The workspace page (`app/workspace/page.tsx`) uses the Gemini API in the `handleSendMessage()` function:

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    userMessage: content,
    sampleDocument: state.sampleDocument?.content,
    contentDocument: state.newContent?.content,
    constraints: state.constraints,
    previousMessages: state.messages.map(...),
  }),
})
```

When users send messages in the conversation panel:
1. User message is added to the conversation
2. Request is sent to Gemini API with context
3. AI-generated response is received and displayed
4. Report content is updated if "generate" is mentioned

## Features

### Context-Aware Generation
- **Sample Document Reference**: AI understands the desired formatting
- **Content Analysis**: AI processes the content to be formatted
- **Constraint Respect**: User-specified constraints are applied
- **Conversation History**: Previous messages provide context

### Document Formatting
The AI helps with:
- Reformatting content to match sample document style
- Applying custom constraints
- Generating new sections
- Improving document structure
- Maintaining consistency

## API Details

### Request Format
```json
{
  "userMessage": "Your request here",
  "sampleDocument": "Sample document content for reference",
  "contentDocument": "Content to be formatted",
  "constraints": ["constraint1", "constraint2"],
  "previousMessages": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

### Response Format
```json
{
  "content": "Generated content here",
  "usage": {
    "inputTokens": 150,
    "outputTokens": 200
  }
}
```

## Error Handling

- Missing API key triggers environment check error
- API failures return descriptive error messages
- Client-side errors show toast notifications
- All errors are logged to console for debugging

## Model Used

- **Model**: `google:gemini-1.5-flash`
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 4096
- **Context**: Full conversation history maintained

## Usage Example

### Using the Hook
```typescript
import { useGeminiAPI } from '@/hooks/use-gemini-api'

function MyComponent() {
  const { generate, isLoading, error } = useGeminiAPI()

  const handleGenerate = async () => {
    try {
      const result = await generate({
        userMessage: 'Generate a conclusion',
        sampleDocument: sampleText,
        contentDocument: contentText,
        constraints: ['formal tone', 'max 500 words'],
      })
      console.log(result.content)
    } catch (err) {
      console.error('Generation failed:', err)
    }
  }

  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      Generate
    </button>
  )
}
```

### Direct API Call
```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'Your message',
    sampleDocument: 'Sample text',
    contentDocument: 'Content text',
    constraints: [],
  }),
})
const data = await response.json()
```

## Troubleshooting

### "GEMINI_API_KEY is not set"
- Ensure `.env.local` exists in project root
- Check the API key is not expired or revoked
- Verify key is in correct format

### Slow Responses
- Check your internet connection
- Gemini API latency depends on request complexity
- Large documents may take longer to process

### Token Limit Exceeded
- Reduce document size
- Shorten constraint descriptions
- Limit conversation history sent to API

## Security Notes

⚠️ **Never commit API keys to version control**
- `.env.local` is in `.gitignore`
- All API calls go through your Next.js server (safe)
- Keys are not exposed to client-side code

## Next Steps

Consider extending this integration with:
- Document parsing and semantic chunking
- Response caching for repeated requests
- Custom system prompts per document type
- Token usage analytics
- Rate limiting and quota management
