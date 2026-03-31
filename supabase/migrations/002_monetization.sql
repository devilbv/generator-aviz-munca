-- ===================================================
-- Monetizare: planuri, credite, abonamente
-- ===================================================

-- Profiluri utilizatori (credite + plan)
create table if not exists public.user_profiles (
  id                  uuid primary key references auth.users on delete cascade,
  plan                text not null default 'free' check (plan in ('free','basic','pro','business')),
  free_credits        int  not null default 3,
  credits             int  not null default 0,
  docs_this_month     int  not null default 0,
  month_reset_at      date not null default date_trunc('month', now())::date,
  stripe_customer_id  text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Abonamente active
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users not null,
  stripe_subscription_id text unique,
  stripe_price_id       text,
  plan                  text not null,
  billing_period        text not null default 'monthly' check (billing_period in ('monthly','yearly')),
  status                text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  created_at            timestamptz default now()
);

-- Tranzactii credite (cumparari + utilizari)
create table if not exists public.credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  amount      int  not null,  -- pozitiv = cumparare, negativ = utilizare
  type        text not null check (type in ('purchase','usage','bonus','refund')),
  description text,
  stripe_payment_intent_id text,
  created_at  timestamptz default now()
);

-- RLS
alter table public.user_profiles      enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.credit_transactions enable row level security;

create policy "profiles_select" on public.user_profiles      for select using (auth.uid() = id);
create policy "profiles_update" on public.user_profiles      for update using (auth.uid() = id);
create policy "subs_select"    on public.subscriptions       for select using (auth.uid() = user_id);
create policy "credits_select" on public.credit_transactions for select using (auth.uid() = user_id);

-- Trigger: creeaza profil automat la inregistrare
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, plan, free_credits, credits)
  values (new.id, 'free', 3, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Functie: reseteaza documentele lunare
create or replace function public.reset_monthly_docs()
returns void language plpgsql security definer as $$
begin
  update public.user_profiles
  set docs_this_month = 0,
      month_reset_at  = date_trunc('month', now())::date
  where month_reset_at < date_trunc('month', now())::date;
end;
$$;

-- Date facturare
alter table public.user_profiles
  add column if not exists billing_company text,
  add column if not exists billing_cif     text,
  add column if not exists billing_address text;

-- Index
create index if not exists user_profiles_stripe_idx on public.user_profiles(stripe_customer_id);
create index if not exists subs_user_idx            on public.subscriptions(user_id);
create index if not exists credits_user_idx         on public.credit_transactions(user_id);
