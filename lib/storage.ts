import { Conversation, ChatMessage, HistoricalInsight } from '@/types';
import { createClient } from './supabase/client';
import { getFigureById } from './figures-data';

const STORAGE_KEYS = {
  CONVERSATIONS: 'timetalk_conversations',
  MESSAGES: 'timetalk_messages',
  FAVORITES: 'timetalk_favorites',
  INSIGHTS: 'timetalk_insights',
};

export class StorageService {
  /**
   * Fetch all conversations for current user or guest
   */
  static async getConversations(): Promise<Conversation[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .order('updated_at', { ascending: false });

          if (!error && data) {
            return data.map((conv: any) => ({
              ...conv,
              figure: getFigureById(conv.historical_figure_id),
            }));
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage', err);
      }
    }

    // LocalStorage fallback
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const list: Conversation[] = stored ? JSON.parse(stored) : [];
      return list.map((c) => ({
        ...c,
        figure: getFigureById(c.historical_figure_id),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch messages for a specific conversation
   */
  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (!error && data) {
            return data as ChatMessage[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetch messages failed, falling back to local', err);
      }
    }

    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save or update conversation and new message
   */
  static async saveMessage(
    conversationId: string,
    figureId: string,
    message: ChatMessage,
    conversationTitle?: string
  ): Promise<void> {
    const supabase = createClient();
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if conversation exists
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .single();

          if (!existing) {
            await supabase.from('conversations').insert({
              id: conversationId,
              user_id: user.id,
              historical_figure_id: figureId,
              title: conversationTitle || `Chat with ${getFigureById(figureId)?.name || 'Historical Figure'}`,
              created_at: now,
              updated_at: now,
            });
          } else {
            await supabase
              .from('conversations')
              .update({ updated_at: now })
              .eq('id', conversationId);
          }

          // Insert message
          await supabase.from('messages').insert({
            id: message.id,
            conversation_id: conversationId,
            role: message.role,
            content: message.content,
            created_at: message.created_at || now,
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase save failed, saving to local storage', err);
      }
    }

    // Local storage persistence
    if (typeof window === 'undefined') return;
    try {
      // 1. Update conversations list
      const convs = await this.getConversations();
      const existingIndex = convs.findIndex((c) => c.id === conversationId);
      const figure = getFigureById(figureId);

      if (existingIndex >= 0) {
        convs[existingIndex].updated_at = now;
        if (conversationTitle) convs[existingIndex].title = conversationTitle;
      } else {
        convs.unshift({
          id: conversationId,
          user_id: null,
          historical_figure_id: figureId,
          title: conversationTitle || `Conversation with ${figure?.name || 'Figure'}`,
          created_at: now,
          updated_at: now,
          figure: figure,
        });
      }
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));

      // 2. Append message
      const messages = await this.getMessages(conversationId);
      messages.push(message);
      localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`, JSON.stringify(messages));
    } catch (err) {
      console.error('LocalStorage write failed:', err);
    }
  }

  /**
   * Rename a conversation
   */
  static async renameConversation(id: string, newTitle: string): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('conversations').update({ title: newTitle }).eq('id', id);
          return;
        }
      } catch (err) {
        console.warn('Supabase rename failed', err);
      }
    }

    if (typeof window === 'undefined') return;
    const convs = await this.getConversations();
    const target = convs.find((c) => c.id === id);
    if (target) {
      target.title = newTitle;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    }
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(id: string): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('conversations').delete().eq('id', id);
          return;
        }
      } catch (err) {
        console.warn('Supabase delete failed', err);
      }
    }

    if (typeof window === 'undefined') return;
    const convs = (await this.getConversations()).filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    localStorage.removeItem(`${STORAGE_KEYS.MESSAGES}_${id}`);
    localStorage.removeItem(`${STORAGE_KEYS.INSIGHTS}_${id}`);
  }

  /**
   * Favorite figures handling
   */
  static async getFavorites(): Promise<string[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('favorites').select('historical_figure_id');
          if (data) return data.map((f: any) => f.historical_figure_id);
        }
      } catch (err) {
        console.warn('Supabase favorites fetch failed', err);
      }
    }

    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ['albert-einstein', 'marie-curie'];
    } catch {
      return ['albert-einstein', 'marie-curie'];
    }
  }

  static async toggleFavorite(figureId: string): Promise<boolean> {
    const current = await this.getFavorites();
    const isFav = current.includes(figureId);
    const updated = isFav ? current.filter((id) => id !== figureId) : [...current, figureId];

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (isFav) {
            await supabase.from('favorites').delete().eq('historical_figure_id', figureId);
          } else {
            await supabase.from('favorites').insert({
              user_id: user.id,
              historical_figure_id: figureId,
            });
          }
          return !isFav;
        }
      } catch (err) {
        console.warn('Supabase favorite toggle failed', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    }
    return !isFav;
  }

  /**
   * Save and get insights
   */
  static async saveInsights(conversationId: string, insight: HistoricalInsight): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('insights').insert({
            conversation_id: conversationId,
            insight_type: 'historical_summary',
            content: insight,
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase insights save failed', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEYS.INSIGHTS}_${conversationId}`, JSON.stringify(insight));
    }
  }

  static async getInsights(conversationId: string): Promise<HistoricalInsight | null> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('insights')
            .select('content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data?.content) return data.content as HistoricalInsight;
        }
      } catch (err) {
        console.warn('Supabase insights fetch failed', err);
      }
    }

    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`${STORAGE_KEYS.INSIGHTS}_${conversationId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Export conversation formatting
   */
  static formatExport(
    figureName: string,
    title: string,
    createdAt: string,
    messages: ChatMessage[],
    format: 'txt' | 'md'
  ): string {
    const dateFormatted = new Date(createdAt || Date.now()).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (format === 'md') {
      let md = `# TimeTalk AI — Dialogue with ${figureName}\n\n`;
      md += `**Conversation Title:** ${title}\n`;
      md += `**Date:** ${dateFormatted}\n`;
      md += `**Educational Simulator:** Powered by Google Gemini API\n\n`;
      md += `> *Note: This transcript is an educational simulation based on documented historical records and writings of ${figureName}. Generated dialogue is not an authentic historical quotation.*\n\n`;
      md += `---\n\n`;

      messages.forEach((msg) => {
        const speaker = msg.role === 'user' ? '👤 **You**' : `🏛️ **${figureName}**`;
        md += `### ${speaker}\n\n${msg.content}\n\n`;
      });

      return md;
    } else {
      let txt = `=======================================================\n`;
      txt += `TIMETALK AI — CONVERSATION WITH ${figureName.toUpperCase()}\n`;
      txt += `=======================================================\n`;
      txt += `Title: ${title}\n`;
      txt += `Date: ${dateFormatted}\n`;
      txt += `Educational Simulator: Powered by Google Gemini API\n`;
      txt += `-------------------------------------------------------\n\n`;

      messages.forEach((msg) => {
        const speaker = msg.role === 'user' ? 'YOU' : figureName.toUpperCase();
        txt += `[${speaker}]:\n${msg.content}\n\n`;
      });

      txt += `-------------------------------------------------------\n`;
      txt += `Notice: Generated responses are educational simulations based on historical records.\n`;
      return txt;
    }
  }
}
