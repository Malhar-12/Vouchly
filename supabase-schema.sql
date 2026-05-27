create table if not exists vouchly_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

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
