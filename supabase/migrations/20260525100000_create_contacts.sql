create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  type text not null,
  message text not null,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

create index if not exists contacts_status_created_at_idx
  on public.contacts (status, created_at desc);

alter table public.contacts enable row level security;
-- service_role 키는 RLS를 우회하므로 Server Action insert 가능
-- anon/authenticated 직접 insert는 허용하지 않음 (폼은 Server Action 경유)
