create table if not exists public.contact_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.contact_settings (key, value)
values ('notification_email', 'contact@coredxi.com')
on conflict (key) do nothing;

alter table public.contact_settings enable row level security;
