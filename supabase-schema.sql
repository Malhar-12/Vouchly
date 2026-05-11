create table if not exists vouchly_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table vouchly_workspaces enable row level security;

drop policy if exists "users read own vouchly workspace" on vouchly_workspaces;
create policy "users read own vouchly workspace"
on vouchly_workspaces for select
using (auth.uid() = user_id);

drop policy if exists "users write own vouchly workspace" on vouchly_workspaces;
create policy "users write own vouchly workspace"
on vouchly_workspaces for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
