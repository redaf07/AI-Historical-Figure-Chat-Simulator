-- ==============================================================================
-- TimeTalk AI — Supabase Database Migration
-- Version: 001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Historical Figures Table
create table if not exists public.historical_figures (
  id text primary key, -- Stable string identifier e.g., 'albert-einstein'
  name text not null,
  lifespan text not null,
  era text not null,
  region text not null,
  expertise text not null,
  biography text not null,
  portrait_url text not null,
  system_instruction text not null,
  featured boolean default false,
  starter_questions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Conversations Table
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade, -- nullable for guest persistence/demo
  historical_figure_id text references public.historical_figures(id) on delete cascade not null,
  title text not null default 'New Conversation',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Messages Table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Favorites Table
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  historical_figure_id text references public.historical_figures(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, historical_figure_id)
);

-- 6. Insights Table
create table if not exists public.insights (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  insight_type text not null default 'historical_summary',
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_figure_id on public.conversations(historical_figure_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_insights_conversation_id on public.insights(conversation_id);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.historical_figures enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.insights enable row level security;

-- RLS Policies

-- Public read for historical figures
create policy "Historical figures are readable by all" on public.historical_figures
  for select using (true);

-- User profile access
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Conversations access
create policy "Users can view own conversations" on public.conversations
  for select using (auth.uid() = user_id or user_id is null);
create policy "Users can insert own conversations" on public.conversations
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can update own conversations" on public.conversations
  for update using (auth.uid() = user_id);
create policy "Users can delete own conversations" on public.conversations
  for delete using (auth.uid() = user_id);

-- Messages access
create policy "Users can view messages in accessible conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c 
      where c.id = messages.conversation_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );
create policy "Users can insert messages into accessible conversations" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c 
      where c.id = messages.conversation_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

-- Favorites access
create policy "Users can manage favorites" on public.favorites
  for all using (auth.uid() = user_id);

-- Insights access
create policy "Users can manage insights" on public.insights
  for all using (
    exists (
      select 1 from public.conversations c 
      where c.id = insights.conversation_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );
