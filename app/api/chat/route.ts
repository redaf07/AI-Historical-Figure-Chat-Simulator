import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFigureById } from '@/lib/figures-data';
import { generateFigureResponse } from '@/lib/gemini';

const chatRequestSchema = z.object({
  figureId: z.string().min(1, 'Figure ID is required'),
  message: z.string().min(1, 'Message cannot be empty').max(3000, 'Message is too long (max 3000 chars)'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
  responseLength: z.enum(['concise', 'detailed']).optional().default('concise'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = chatRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { figureId, message, history, responseLength } = parseResult.data;

    const figure = getFigureById(figureId);
    if (!figure) {
      return NextResponse.json(
        { error: `Historical figure with ID "${figureId}" not found.` },
        { status: 404 }
      );
    }

    const aiResponse = await generateFigureResponse({
      figure,
      history,
      message,
      responseLength,
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      figure: {
        id: figure.id,
        name: figure.name,
        lifespan: figure.lifespan,
        era: figure.era,
      },
    });
  } catch (error: any) {
    console.error('API /api/chat error:', error);

    const isRateLimit = error?.message?.includes('rate limit') || error?.status === 429;
    const statusCode = isRateLimit ? 429 : 500;

    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate historical response',
        isRateLimit,
      },
      { status: statusCode }
    );
  }
}
