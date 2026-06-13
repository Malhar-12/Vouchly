create table if not exists vouchly_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table vouchly_workspaces is
  'One private Vouchly workspace per authenticated owner. Protected by forced Row Level Security.';

comment on column vouchly_workspaces.state is
  'Frontend-visible workspace JSON. Do not store service_role keys, Razorpay secrets, WhatsApp provider tokens, SMS keys, email keys, or admin passwords here.';

create index if not exists vouchly_workspaces_updated_at_idx
on vouchly_workspaces (updated_at desc);

alter table vouchly_workspaces enable row level security;
alter table vouchly_workspaces force row level security;

revoke all on table vouchly_workspaces from anon;
grant select, insert, update, delete on table vouchly_workspaces to authenticated;

drop policy if exists "users read own vouchly workspace" on vouchly_workspaces;
create policy "users read own vouchly workspace"
on vouchly_workspaces for select
using (auth.uid() = user_id);

drop policy if exists "users insert own vouchly workspace" on vouchly_workspaces;
create policy "users insert own vouchly workspace"
on vouchly_workspaces for insert
with check (auth.uid() = user_id);

drop policy if exists "users update own vouchly workspace" on vouchly_workspaces;
create policy "users update own vouchly workspace"
on vouchly_workspaces for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own vouchly workspace" on vouchly_workspaces;
create policy "users delete own vouchly workspace"
on vouchly_workspaces for delete
using (auth.uid() = user_id);

drop policy if exists "users write own vouchly workspace" on vouchly_workspaces;

drop trigger if exists set_vouchly_workspace_updated_at on vouchly_workspaces;
drop function if exists update_vouchly_workspace_updated_at();

create function update_vouchly_workspace_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_vouchly_workspace_updated_at
before update on vouchly_workspaces
for each row
execute function update_vouchly_workspace_updated_at();
