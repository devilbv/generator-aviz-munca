-- ===================================================
-- Generator Dosare Aviz de Munca - Schema initiala
-- Ruleaza in Supabase Dashboard > SQL Editor
-- ===================================================

-- Tabelul companies (date firme salvate per utilizator)
create table if not exists public.companies (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users not null,
  company_name                text not null,
  cui                         text not null,
  registry_number             text,
  company_address             text,
  administrator_name          text,
  ajofm_certificate_number1   text,
  ajofm_certificate_number2   text,
  representative_name         text,
  representative_cnp          text,
  representative_address      text,
  representative_id_series    text,
  representative_id_number    text,
  representative_id_issued_by text,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- Tabelul work_permits (dosare generate)
create table if not exists public.work_permits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users not null,
  company_id        uuid references public.companies(id) on delete set null,
  company_snapshot  jsonb,
  employees         jsonb,
  document_types    text[],
  status            text default 'generated' check (status in ('generated', 'pending', 'error', 'failed')),
  notes             text,
  generated_at      timestamptz default now()
);

-- ===================================================
-- Row Level Security (RLS) - fiecare user vede doar datele lui
-- ===================================================

alter table public.companies   enable row level security;
alter table public.work_permits enable row level security;

-- Politici companies
create policy "companies_select" on public.companies for select using (auth.uid() = user_id);
create policy "companies_insert" on public.companies for insert with check (auth.uid() = user_id);
create policy "companies_update" on public.companies for update using (auth.uid() = user_id);
create policy "companies_delete" on public.companies for delete using (auth.uid() = user_id);

-- Politici work_permits
create policy "permits_select" on public.work_permits for select using (auth.uid() = user_id);
create policy "permits_insert" on public.work_permits for insert with check (auth.uid() = user_id);
create policy "permits_delete" on public.work_permits for delete using (auth.uid() = user_id);

-- Index pentru cautare rapida
create index if not exists companies_user_id_idx   on public.companies(user_id);
create index if not exists permits_user_id_idx     on public.work_permits(user_id);
create index if not exists permits_generated_at_idx on public.work_permits(generated_at desc);

-- ===================================================
-- Storage bucket pentru template-uri DOCX
-- ===================================================
insert into storage.buckets (id, name, public)
values ('document-templates', 'document-templates', false)
on conflict (id) do nothing;

-- Politica storage: doar service role poate scrie, utilizatorii autentificati pot citi
create policy "templates_read" on storage.objects for select
  using (bucket_id = 'document-templates' and auth.role() = 'authenticated');
