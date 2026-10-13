export interface HistoricalFigure {
  id: string;
  name: string;
  lifespan: string;
  era: string;
  region: string;
  expertise: string;
  biography: string;
  portrait_url: string;
  system_instruction: string;
  featured?: boolean;
  starter_questions: string[];
  created_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  historical_figure_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  figure?: HistoricalFigure;
  message_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface FactComparison {
  documentedFact: string;
  creativeContext: string;
}

export interface HistoricalInsight {
  id?: string;
  conversation_id: string;
  summary: string;
  facts: string[];
  takeaways: string[];
  timeline: TimelineEvent[];
  followUpQuestions: string[];
  factVsInterpretation: FactComparison[];
  created_at?: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  historical_figure_id: string;
  created_at: string;
}
