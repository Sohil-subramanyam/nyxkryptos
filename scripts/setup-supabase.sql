-- Create users table extension
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  photo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create vaults table
create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  vault_name text not null,
  description text,
  encrypted_data text not null,
  encryption_method text not null default 'AES-256-GCM',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create vault_shares table for sharing
create table if not exists public.vault_shares (
  id uuid primary key default gen_random_uuid(),
  vault_id uuid not null references public.vaults(id) on delete cascade,
  shared_with_user_id uuid not null references public.user_profiles(id) on delete cascade,
  permission text not null default 'view',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.vaults enable row level security;
alter table public.vault_shares enable row level security;

-- Policies for user_profiles
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Policies for vaults
create policy "Users can view their own vaults" on public.vaults
  for select using (auth.uid() = user_id);

create policy "Users can create vaults" on public.vaults
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own vaults" on public.vaults
  for update using (auth.uid() = user_id);

create policy "Users can delete their own vaults" on public.vaults
  for delete using (auth.uid() = user_id);

-- Policies for vault_shares
create policy "Users can view vault shares for their vaults" on public.vault_shares
  for select using (
    exists (
      select 1 from public.vaults
      where vaults.id = vault_shares.vault_id
      and vaults.user_id = auth.uid()
    )
  );

create policy "Vault owners can create shares" on public.vault_shares
  for insert with check (
    exists (
      select 1 from public.vaults
      where vaults.id = vault_shares.vault_id
      and vaults.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index idx_vaults_user_id on public.vaults(user_id);
create index idx_vault_shares_vault_id on public.vault_shares(vault_id);
create index idx_vault_shares_user_id on public.vault_shares(shared_with_user_id);
