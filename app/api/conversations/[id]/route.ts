import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getFigureById } from '@/lib/figures-data';

const patchSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(150, 'Title too long'),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch conversation verifying ownership
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (convError || !conv) {
          return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
        }

        // Fetch messages
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (msgError) {
          return NextResponse.json({ error: msgError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          conversation: {
            ...conv,
            figure: getFigureById(conv.historical_figure_id),
          },
          messages: messages || [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Local guest mode active',
    });
  } catch (err: any) {
    console.error('Error in GET /api/conversations/[id]:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid title', details: parsed.error.format() }, { status: 400 });
    }

    const { title } = parsed.data;
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, conversation: data });
      }
    }

    return NextResponse.json({ success: true, id, title });
  } catch (err: any) {
    console.error('Error in PATCH /api/conversations/[id]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to rename' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error in DELETE /api/conversations/[id]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete' }, { status: 500 });
  }
}
