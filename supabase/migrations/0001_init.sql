-- ============================================================================
-- NutriPair — Supabase schema (auth + structured DB)
-- Apply via Supabase Dashboard → SQL Editor, or `supabase db push`, or the
-- Supabase MCP apply_migration once it has access to project ywnrldatynuubugkgxil.
--
-- Differences from the original spec (intentional fixes):
--   * Table 6 reconstructed as `nutrition_data (item_id TEXT PRIMARY KEY, ...)`
--     (the spec's CREATE statement was mangled).
--   * meal_plans gains `type` + `time` columns so the mobile UI keeps its
--     per-slot accent colours and time labels.
--   * Added a `handle_new_user()` trigger on auth.users that auto-provisions a
--     household + profile on signup (so registration works without the Worker
--     needing elevated privileges or a session).
--   * Added `auth_household_id()` SECURITY DEFINER helper to express household
--     isolation without recursive RLS on `profiles`.
--   * Added the RLS policies the spec omitted (households, invitations) and a
--     household-wide profiles SELECT policy so partners can see each other.
-- ============================================================================

-- 1. Households (create BEFORE profiles — FK dependency)
create table if not exists households (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

-- 2. Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  household_id uuid references households(id),
  lang         text default 'fr'  check (lang in ('fr','en','ro')),
  currency     text default 'RON' check (currency in ('RON','EUR','USD')),
  created_at   timestamptz default now()
);

-- 3. Invitations
create table if not exists invitations (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,
  household_id uuid not null references households(id),
  created_by   uuid not null references profiles(id),
  expires_at   timestamptz not null,
  used         boolean default false,
  created_at   timestamptz default now()
);

-- 4. Recipes (moved out of KV)
create table if not exists recipes (
  id           text primary key,
  household_id uuid not null references households(id),
  name         text not null,
  emoji        text,
  photo_url    text,
  servings     integer default 2,
  ingredients  jsonb default '[]',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 5. Meal plans (moved out of KV; +type/+time vs spec to preserve mobile UI)
create table if not exists meal_plans (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id),
  week_key     text not null,
  day          text not null,
  slot         text not null,
  name         text,
  detail       text,
  type         text,
  time         text,
  recipe_id    text references recipes(id) on delete set null,
  updated_at   timestamptz default now(),
  unique (household_id, week_key, day, slot)
);

-- 6. Nutrition data (per-100g macros for the catalogue items) — reconstructed
create table if not exists nutrition_data (
  item_id       text primary key,
  protein_g     decimal default 0,
  carbs_g       decimal default 0,
  fat_g         decimal default 0,
  kcal_per_100g decimal default 0,
  updated_at    timestamptz default now()
);

-- 7. Shopping history (analytics + Budget view)
create table if not exists shopping_history (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id),
  reset_at      timestamptz not null,
  items_checked integer,
  items_total   integer,
  total_spent   decimal,
  currency      text default 'RON',
  snapshot      jsonb,
  created_at    timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Auto-provision household + profile on signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare hid uuid;
begin
  insert into public.households default values returning id into hid;
  insert into public.profiles (id, name, household_id)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name',''), 'Membre'), hid);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS helper — current user's household_id without recursive policy evaluation
-- ----------------------------------------------------------------------------
create or replace function public.auth_household_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- Enable Row Level Security on every table
-- ----------------------------------------------------------------------------
alter table households       enable row level security;
alter table profiles         enable row level security;
alter table invitations      enable row level security;
alter table recipes          enable row level security;
alter table meal_plans       enable row level security;
alter table nutrition_data   enable row level security;
alter table shopping_history enable row level security;

-- ----------------------------------------------------------------------------
-- RLS policies — household isolation
-- ----------------------------------------------------------------------------
-- profiles: members of the same household can see each other; you update only your own row
create policy profiles_select on profiles for select using (household_id = auth_household_id());
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- households: members can read their own household
create policy households_select on households for select using (id = auth_household_id());

-- recipes / meal_plans / shopping_history: full household isolation (read + write)
create policy recipes_rw on recipes for all
  using (household_id = auth_household_id()) with check (household_id = auth_household_id());
create policy meal_plans_rw on meal_plans for all
  using (household_id = auth_household_id()) with check (household_id = auth_household_id());
create policy shopping_history_rw on shopping_history for all
  using (household_id = auth_household_id()) with check (household_id = auth_household_id());

-- invitations: creator's household creates them; an invitee (not yet in the household)
-- can read by token and mark it used on accept. The token itself is the secret.
create policy invitations_select on invitations for select using (true);
create policy invitations_insert on invitations for insert
  with check (household_id = auth_household_id() and created_by = auth.uid());
create policy invitations_update on invitations for update using (true) with check (true);

-- nutrition_data: public read (no household scope)
create policy nutrition_public_read on nutrition_data for select using (true);

-- ----------------------------------------------------------------------------
-- Seed nutrition_data from the catalogue (rough per-100g estimates; refine later)
-- ----------------------------------------------------------------------------
insert into nutrition_data (item_id, protein_g, carbs_g, fat_g, kcal_per_100g) values
  ('g1',13,1,11,155),('g2',27,0,14,239),('g3',20,0,13,208),('g4',19,0,25,305),
  ('g5',25,0,11,208),('g6',26,0,1,116),('g7',10,4,5,97),('g8',3,4,1,41),
  ('g9',12,4,5,98),('g10',3,5,2,55),('g11',14,4,21,264),('g12',1,0,81,717),
  ('g16',1,4,0,18),('g20',2,20,0,86),('g25',1,23,0,89),('g26',0,14,0,52),
  ('g28',2,9,15,160),('g30',9,20,0,116),('g31',9,25,1,139),('g32',9,27,3,164),
  ('g33',3,23,1,111),('g34',17,66,7,389),('g35',9,49,3,247),('g36',15,14,65,654),
  ('g37',21,22,49,579),('g38',0,0,100,884),('g39',25,20,50,588),('g40',17,42,31,486),
  ('g42',8,46,43,600),('g43',0,82,0,304),('g45',11,3,20,230),('g46',22,2,25,321),
  ('g47',3,5,4,64),('g54',13,75,2,371),('g55',13,72,2,376),('g56',21,22,49,579),
  ('g57',10,76,1,364)
on conflict (item_id) do nothing;
