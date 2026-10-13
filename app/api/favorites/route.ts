import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const favoriteSchema = z.object({
  figureId: z.string().min(1, 'Figure ID is required'),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, favorites: [] });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: true, favorites: [] });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('historical_figure_id')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const favoriteIds = (data || []).map((f: any) => f.historical_figure_id);
    return NextResponse.json({ success: true, favorites: favoriteIds });
  } catch (err: any) {
    console.error('Error in GET /api/favorites:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = favoriteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { figureId } = parsed.data;
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check existing
        const { data: existing } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('historical_figure_id', figureId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);
          return NextResponse.json({ success: true, isFavorite: false, figureId });
        } else {
          await supabase
            .from('favorites')
            .insert({ user_id: user.id, historical_figure_id: figureId });
          return NextResponse.json({ success: true, isFavorite: true, figureId });
        }
      }
    }

    // Guest response
    return NextResponse.json({ success: true, message: 'Local storage toggled' });
  } catch (err: any) {
    console.error('Error in POST /api/favorites:', err);
    return NextResponse.json({ error: err?.message || 'Failed to toggle favorite' }, { status: 500 });
  }
}
