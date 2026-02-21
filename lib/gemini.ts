import { google } from '@ai-sdk/google';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';

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
 * Streams a formatted document based on a sample style and specific content.
 */
export async function streamDocumentWithAI(
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
    const stream = await streamText({
      model: google(MODEL_ID),
      system: `You are an expert document formatter and content specialist. 
Your primary goal is to take the "Content to Reformat" and apply the exact structural, stylistic, and formatting patterns found in the "Sample Document". 
Always output high-quality Markdown. Make sure it looks like a clean A4 document when rendered. Do NOT output a JSON object or code dump. Make sure headers, bold text, and code blocks match the sample's aesthetic.`,
      messages: [
        ...previousMessages,
        {
          role: 'user',
          content: `${contextMessage}\n\nUser Request: ${userMessage}`,
        },
      ],
      temperature: 0.7,
    });

    return stream;
  } catch (error) {
    console.error('Gemini Stream Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown stream error';
    throw new Error(`[ReportGen AI] Stream Failed: ${errorMessage}`);
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

/**
 * Generates a targeted JSON patch for a specific document tree.
 * Prevents full document regeneration by returning block-level updates.
 */
export async function generateDocumentPatchWithAI(
  userMessage: string,
  context: DocumentContext,
  currentTreeContext: string,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  const contextMessage = `
## TARGET DOCUMENT SKELETON (Doc 2 Sections - Patch these specific blockIds):
${currentTreeContext}

## CURRENT CONTENT SOURCES (Doc 2 Original text):
${context.contentDocument}

## STYLE & STRUCTURE REFERENCE (Doc 1 - Learn layout from this, DO NOT patch this):
${context.sampleDocument}

## CONSTRAINTS:
${context.constraints.length > 0
      ? context.constraints.map((c) => `- ${c}`).join('\n')
      : 'Maintain standard markdown.'}
`;

  try {
    const { object } = await generateObject({
      model: google(MODEL_ID),
      system: `You are an expert Document State Manager. Your goal is to apply "Targeted Injection" (Surgical Mapping) to a Document Tree.
1. Use the 'STYLE & STRUCTURE REFERENCE' strictly to learn formatting and layout. Do NOT edit it.
2. Analyze the 'TARGET DOCUMENT SKELETON'. Identify the IDs of the blocks that need updating or transforming based on the user's request and the learned layout.
3. Read the 'CURRENT CONTENT SOURCES' to get the original unformatted content that belongs in the target block(s).
4. Return an array of Patch objects. Each patch must contain the 'blockId' (exactly matching an ID from the skeleton) and the 'newContent' (formatted as clean markdown).
Only generate patches for blocks that actually change. Avoid touching blocks outside the scope of the request. Ensure the content matches the tone and structural layout learned from the reference document.`,
      messages: [
        ...previousMessages,
        {
          role: 'user',
          content: `${contextMessage}\n\nUser Request: ${userMessage}`,
        },
      ],
      schema: z.object({
        patches: z.array(
          z.object({
            blockId: z.string().describe("The ID of the block to patch, exactly as it appears in the Skeleton."),
            newContent: z.string().describe("The new markdown content for this specific block."),
          })
        ).describe("Array of delta updates to apply to the document."),
      }),
      temperature: 0.3, // Lower temperature for structured JSON mapping
    });

    return object.patches;
  } catch (error) {
    console.error('Gemini Patch Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown patching error';
    throw new Error(`[ReportGen AI] Patch Failed: ${errorMessage}`);
  }
}