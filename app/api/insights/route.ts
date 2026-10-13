import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFigureById } from '@/lib/figures-data';
import { generateHistoryInsights } from '@/lib/gemini';

const insightsRequestSchema = z.object({
  figureId: z.string().min(1, 'Figure ID is required'),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .min(1, 'At least one message is required to generate insights'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = insightsRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { figureId, messages } = parseResult.data;

    const figure = getFigureById(figureId);
    if (!figure) {
      return NextResponse.json(
        { error: `Historical figure with ID "${figureId}" not found.` },
        { status: 404 }
      );
    }

    const insights = await generateHistoryInsights(figure, messages);

    return NextResponse.json({
      success: true,
      insights,
      figureName: figure.name,
    });
  } catch (error: any) {
    console.error('API /api/insights error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate historical insights' },
      { status: 500 }
    );
  }
}
