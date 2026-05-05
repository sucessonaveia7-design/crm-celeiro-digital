-- ─── Kanban automation schema improvements ───────────────────
-- Run in Supabase SQL editor

-- 1. Add new columns to kanban_cards
alter table public.kanban_cards
  add column if not exists conversation_id      uuid        references public.conversations(id)  on delete cascade,
  add column if not exists automation_status    text        not null default 'normal',
  add column if not exists last_interaction_at  timestamptz,
  add column if not exists next_follow_up_at    timestamptz,
  add column if not exists is_archived          boolean     not null default false,
  add column if not exists channel              text        not null default 'whatsapp',
  add column if not exists note                 text,
  add column if not exists tags                 text[]      not null default '{}';

create index if not exists idx_kanban_cards_conversation_id  on public.kanban_cards(conversation_id);
create index if not exists idx_kanban_cards_automation_status on public.kanban_cards(automation_status);
create index if not exists idx_kanban_cards_is_archived       on public.kanban_cards(is_archived);

-- 2. Automation rules table
create table if not exists public.kanban_automation_rules (
  id           uuid        primary key default gen_random_uuid(),
  church_id    uuid        not null references public.churches(id) on delete cascade,
  board_id     uuid        references public.kanban_boards(id) on delete cascade,
  name         text        not null,
  trigger_type text        not null,   -- keyword | inactivity | new_conversation | status_change
  condition    jsonb       not null default '{}'::jsonb,
  action       jsonb       not null default '{}'::jsonb,
  is_active    boolean     not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_kanban_automation_rules_church_id on public.kanban_automation_rules(church_id);

-- 3. Automation history log
create table if not exists public.kanban_automation_logs (
  id          uuid        primary key default gen_random_uuid(),
  church_id   uuid        not null references public.churches(id) on delete cascade,
  rule_id     uuid        references public.kanban_automation_rules(id) on delete set null,
  card_id     uuid        references public.kanban_cards(id) on delete cascade,
  action_type text        not null,
  details     jsonb       not null default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_kanban_automation_logs_card_id on public.kanban_automation_logs(card_id);
create index if not exists idx_kanban_automation_logs_rule_id on public.kanban_automation_logs(rule_id);

-- 4. updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists set_kanban_rules_updated_at on public.kanban_automation_rules;
create trigger set_kanban_rules_updated_at
  before update on public.kanban_automation_rules
  for each row execute function public.set_updated_at();

-- 5. Auto-create kanban card when conversation is created
create or replace function public.create_kanban_card_from_conversation()
returns trigger as $$
declare
  v_board_id  uuid;
  v_column_id uuid;
begin
  select id into v_board_id
  from public.kanban_boards
  where church_id = new.church_id and is_default = true
  limit 1;

  select id into v_column_id
  from public.kanban_columns
  where church_id = new.church_id
    and board_id = v_board_id
    and lower(name) in ('novo contato', 'novo visitante')
  order by position asc
  limit 1;

  if v_board_id is not null and v_column_id is not null then
    insert into public.kanban_cards (
      church_id, board_id, column_id, contact_id, conversation_id,
      assigned_user_id, last_interaction_at
    )
    values (
      new.church_id, v_board_id, v_column_id, new.contact_id, new.id,
      new.assigned_user_id, coalesce(new.last_message_at, now())
    )
    on conflict (board_id, contact_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_create_kanban_card_from_conversation on public.conversations;
create trigger trigger_create_kanban_card_from_conversation
  after insert on public.conversations
  for each row execute function public.create_kanban_card_from_conversation();

-- 6. Auto-update card when message is received
create or replace function public.update_kanban_card_from_message()
returns trigger as $$
begin
  update public.kanban_cards
  set
    last_interaction_at = new.created_at,
    updated_at = now(),
    automation_status = case
      when new.sender_type = 'contact' then 'nova_mensagem'
      else 'em_atendimento'
    end
  where conversation_id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_update_kanban_card_from_message on public.messages;
create trigger trigger_update_kanban_card_from_message
  after insert on public.messages
  for each row execute function public.update_kanban_card_from_message();

-- 7. RLS for automation rules
alter table public.kanban_automation_rules enable row level security;
alter table public.kanban_automation_logs  enable row level security;

create policy "Church members can manage their automation rules"
on public.kanban_automation_rules for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.church_id = church_id
  )
);

create policy "Church members can view automation logs"
on public.kanban_automation_logs for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.church_id = church_id
  )
);
