import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getFigureById } from '@/lib/figures-data';

const createConversationSchema = z.object({
  figureId: z.string().min(1, 'Figure ID is required'),
  title: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        conversations: [],
        mode: 'guest_fallback',
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        conversations: [],
        mode: 'guest',
      });
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const hydrated = (data || []).map((conv: any) => ({
      ...conv,
      figure: getFigureById(conv.historical_figure_id),
      message_count: conv.messages?.[0]?.count || 0,
    }));

    return NextResponse.json({
      success: true,
      conversations: hydrated,
    });
  } catch (err: any) {
    console.error('Error in GET /api/conversations:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createConversationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { figureId, title } = parsed.data;
    const figure = getFigureById(figureId);
    if (!figure) {
      return NextResponse.json({ error: `Figure "${figureId}" not found` }, { status: 404 });
    }

    const supabase = createServerSupabaseClient();
    const newConvId = crypto.randomUUID();
    const now = new Date().toISOString();
    const convTitle = title || `Dialogue with ${figure.name}`;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            id: newConvId,
            user_id: user.id,
            historical_figure_id: figureId,
            title: convTitle,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          conversation: { ...data, figure },
        });
      }
    }

    // Guest response
    return NextResponse.json({
      success: true,
      conversation: {
        id: newConvId,
        user_id: null,
        historical_figure_id: figureId,
        title: convTitle,
        created_at: now,
        updated_at: now,
        figure,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/conversations:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create conversation' }, { status: 500 });
  }
}
