-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Photographer Profiles
create table if not exists photographer_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default '',
  location text not null default '',
  specialties text[] not null default '{}',
  style_tags text[] not null default '{}',
  portfolio_links text[] not null default '{}',
  bio text not null default '',
  created_at timestamp with time zone default now() not null
);

-- Gear Items
create table if not exists gear_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('camera', 'lens', 'flash', 'modifier', 'support')),
  brand text not null default '',
  model text not null default '',
  focal_range text,
  max_aperture text,
  notes text,
  created_at timestamp with time zone default now() not null
);

-- Session Plans
create table if not exists session_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Session',
  session_type text not null check (session_type in ('wedding', 'family', 'street', 'real_estate', 'event', 'portrait')),
  location_type text not null check (location_type in ('indoor', 'outdoor', 'mixed')),
  time_of_day text not null check (time_of_day in ('morning', 'midday', 'golden_hour', 'night')),
  constraints text,
  goals text,
  created_at timestamp with time zone default now() not null
);

-- Row Level Security
alter table photographer_profiles enable row level security;
alter table gear_items enable row level security;
alter table session_plans enable row level security;

-- Policies for photographer_profiles
create policy "Users can view own profile" on photographer_profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on photographer_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on photographer_profiles
  for update using (auth.uid() = user_id);

-- Policies for gear_items
create policy "Users can view own gear" on gear_items
  for select using (auth.uid() = user_id);
create policy "Users can insert own gear" on gear_items
  for insert with check (auth.uid() = user_id);
create policy "Users can update own gear" on gear_items
  for update using (auth.uid() = user_id);
create policy "Users can delete own gear" on gear_items
  for delete using (auth.uid() = user_id);

-- Policies for session_plans
create policy "Users can view own sessions" on session_plans
  for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on session_plans
  for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on session_plans
  for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on session_plans
  for delete using (auth.uid() = user_id);
