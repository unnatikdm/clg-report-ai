# Quick Start - Gemini Integration

## ✅ Setup Complete

Your Gemini API key is configured and ready to use.

## 🚀 How to Use

### In Your Components

```typescript
import { useGeminiAPI } from '@/hooks/use-gemini-api'

function MyComponent() {
  const { generate, isLoading, error } = useGeminiAPI()

  const handleClick = async () => {
    const result = await generate({
      userMessage: 'Your request',
      sampleDocument: sampleText,
      contentDocument: contentText,
      constraints: ['constraint1', 'constraint2'],
    })
    console.log(result.content)
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      Generate
    </button>
  )
}
```

### Or Use Direct API Call

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'Your message',
    sampleDocument: 'Sample text',
    contentDocument: 'Content to format',
    constraints: [],
  }),
})
const { content, usage } = await response.json()
```

## 📁 Key Files

- **`lib/gemini.ts`** - Gemini service functions
- **`app/api/generate/route.ts`** - API endpoint
- **`hooks/use-gemini-api.ts`** - React hook
- **`.env.local`** - Your API key (secret, not in git)
- **`GEMINI_INTEGRATION.md`** - Full documentation

## 🔑 API Key

✅ Stored in `.env.local`
✅ Protected in `.gitignore`
✅ Never exposed to client
✅ Loaded at runtime from environment

## 🧪 Test It

```bash
pnpm dev
# Visit http://localhost:3000
# Upload files → Go to workspace → Send a message
```

## 📊 What's Happening

When you send a message:
1. Message goes to `/api/generate` endpoint
2. Server securely calls Gemini API
3. AI generates response with context
4. Response appears in conversation
5. Document preview updates

## 🛡️ Security

- API key in environment variable only
- No key in code or version control
- All API calls through your server
- Never exposed to browser

## 📚 Learn More

- [GEMINI_INTEGRATION.md](GEMINI_INTEGRATION.md) - Full guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was done

## ⚡ Features Available

- 📝 Document formatting
- 🔄 Conversation history
- 🎯 Constraint application
- 💾 Live preview
- ⚠️ Error handling
- 📊 Token tracking

---

Everything is set up and ready to go! Start your dev server and test it out.
