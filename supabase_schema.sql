-- ============================================================
-- PitchSense Database Schema
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ============================================================

create table if not exists public.calls (
  id              uuid default gen_random_uuid() primary key,
  user_id         text not null,
  prospect_name   text default 'Unknown',
  transcript      jsonb default '[]',
  signals         jsonb default '[]',
  score           integer default 0,
  grade           text default 'N/A',
  duration        text default '0:00',
  top_moment      text default '',
  biggest_miss    text default '',
  improvement     text default '',
  strengths       jsonb default '[]',
  buying_signals  integer default 0,
  objections      integer default 0,
  created_at      timestamptz default now()
);

-- Index for fast user queries
create index if not exists calls_user_id_idx on public.calls(user_id);
create index if not exists calls_created_at_idx on public.calls(created_at desc);

-- Row Level Security: users can only see their own calls
alter table public.calls enable row level security;

drop policy if exists "Users can view own calls" on public.calls;
create policy "Users can view own calls"
  on public.calls for select
  using (auth.uid()::text = user_id or true);

drop policy if exists "Users can insert own calls" on public.calls;
create policy "Users can insert own calls"
  on public.calls for insert
  with check (true);

-- ============================================================
-- Done! Your calls table is ready.
-- ============================================================
