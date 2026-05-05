-- File: typing_status_table.sql
-- Run this in your Supabase SQL editor to create the typing_status table

create table if not exists public.typing_status (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(conversation_id, user_id)
);

-- Index for faster lookups by conversation_id
create index if not exists idx_typing_status_conversation_id on typing_status(conversation_id);