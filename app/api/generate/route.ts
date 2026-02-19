import { NextRequest, NextResponse } from 'next/server'
import { generateDocumentWithAI } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userMessage,
      sampleDocument,
      contentDocument,
      constraints,
      previousMessages,
    } = body

    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400 })
    }

    if (!sampleDocument || !contentDocument) {
      return NextResponse.json(
        { error: 'sampleDocument and contentDocument are required' },
        { status: 400 }
      )
    }

    const response = await generateDocumentWithAI(
      userMessage,
      {
        sampleDocument,
        contentDocument,
        constraints: constraints || [],
      },
      previousMessages || []
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process request',
      },
      { status: 500 }
    )
  }
}
