import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentPatchWithAI } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            userMessage,
            sampleDocument,
            contentDocument,
            constraints,
            previousMessages,
            currentTreeContext
        } = body;

        if (!userMessage) {
            return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
        }

        if (!sampleDocument || !contentDocument) {
            return NextResponse.json(
                { error: 'sampleDocument and contentDocument are required' },
                { status: 400 }
            );
        }

        const patches = await generateDocumentPatchWithAI(
            userMessage,
            {
                sampleDocument,
                contentDocument,
                constraints: constraints || [],
            },
            currentTreeContext || '[]',
            previousMessages || []
        );

        return NextResponse.json({ patches });
    } catch (error) {
        console.error('API patch error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to process patch request',
            },
            { status: 500 }
        );
    }
}
