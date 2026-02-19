import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * Configuration & Environment Checks
 */
// The Vercel AI SDK expects GOOGLE_GENERATIVE_AI_API_KEY for google() function
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

// Ensure the SDK uses our API key
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
}

// Using Gemini 2.0 Flash (latest stable model as of Feb 2026)
const MODEL_ID = 'gemini-2.5-flash-lite';

export interface DocumentContext {
  sampleDocument: string;
  contentDocument: string;
  constraints: string[];
}

/**
 * Generates a formatted document based on a sample style and specific content.
 */
export async function generateDocumentWithAI(
  userMessage: string,
  context: DocumentContext,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  const contextMessage = `
## SAMPLE DOCUMENT (Format Reference):
${context.sampleDocument}

## CONTENT TO REFORMAT:
${context.contentDocument}

## SPECIFIC CONSTRAINTS:
${context.constraints.length > 0 
    ? context.constraints.map((c) => `- ${c}`).join('\n') 
    : '- Maintain professional tone and standard markdown.'}
`;

  try {
    const { text, usage } = await generateText({
      model: google(MODEL_ID),
      system: `You are an expert document formatter and content specialist. 
Your primary goal is to take the "Content to Reformat" and apply the exact structural, stylistic, and formatting patterns found in the "Sample Document". 
Always output high-quality Markdown. Explain your formatting decisions briefly at the end of the response.`,
      messages: [
        ...previousMessages,
        {
          role: 'user',
          content: `${contextMessage}\n\nUser Request: ${userMessage}`,
        },
      ],
      temperature: 0.7,
    });

    return {
      content: text,
      usage: {
        inputTokens: usage?.inputTokens || 0,
        outputTokens: usage?.outputTokens || 0,
      },
    };
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown generation error';
    throw new Error(`[ReportGen AI] Generation Failed: ${errorMessage}`);
  }
}

/**
 * Analyzes a document to extract its structural "DNA" for future use.
 */
export async function analyzeDocument(documentContent: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google(MODEL_ID),
      system: `You are a document analysis expert. Break down the provided document into its core components: 
1. Structural hierarchy (Headings, sections)
2. Formatting style (Bold usage, list styles, tables)
3. Tone and vocabulary level.`,
      prompt: `Analyze the structure and formatting of this document:\n\n${documentContent}`,
      temperature: 0.4, // Lower temperature for more consistent, analytical output
    });

    return text;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown analysis error';
    throw new Error(`[ReportGen AI] Analysis Failed: ${errorMessage}`);
  }
}