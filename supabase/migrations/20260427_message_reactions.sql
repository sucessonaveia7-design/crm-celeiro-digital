-- Message Reactions
-- Run this migration in the Supabase SQL editor

create table if not exists public.message_reactions (
  id         uuid        primary key default gen_random_uuid(),
  message_id uuid        not null references public.messages(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  emoji      text        not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(message_id, user_id)
);

create index if not exists idx_message_reactions_message_id on public.message_reactions(message_id);
create index if not exists idx_message_reactions_user_id    on public.message_reactions(user_id);

-- RLS
alter table public.message_reactions enable row level security;

create policy "Users can view reactions from their church"
on public.message_reactions for select
using (
  exists (
    select 1 from public.messages m
    join public.conversations c on c.id = m.conversation_id
    join public.profiles p on p.church_id = c.church_id
    where m.id = message_reactions.message_id and p.id = auth.uid()
  )
);

create policy "Users can insert reactions from their church"
on public.message_reactions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.messages m
    join public.conversations c on c.id = m.conversation_id
    join public.profiles p on p.church_id = c.church_id
    where m.id = message_reactions.message_id and p.id = auth.uid()
  )
);

create policy "Users can update their own reactions"
on public.message_reactions for update
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own reactions"
on public.message_reactions for delete
using (user_id = auth.uid());

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists set_message_reactions_updated_at on public.message_reactions;
create trigger set_message_reactions_updated_at
before update on public.message_reactions
for each row execute function public.set_updated_at();
