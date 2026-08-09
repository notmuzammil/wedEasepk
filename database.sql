-- ============================================================
-- WedEase — Wedding Venue Booking Platform
-- Canonical Supabase schema (wedease.com.pk)
--
-- Run this whole file in the Supabase SQL Editor.
--
-- It is written to be idempotent and non-destructive: it creates
-- what is missing and leaves existing tables and rows alone, so it
-- is safe to run against a database that already has data.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ============================================================
-- 1. PROFILES  (one row per auth.users entry)
-- ============================================================

create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '',
  phone       text,
  role        text        not null default 'customer',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Older builds of this project shipped a `phone_number` column. Carry any
-- values across to `phone`, which is what the application reads.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone_number'
  ) then
    alter table public.profiles add column if not exists phone text;
    update public.profiles set phone = phone_number where phone is null;
    alter table public.profiles drop column phone_number;
  end if;
end $$;

alter table public.profiles add column if not exists phone      text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles alter column full_name set default '';

-- Role vocabulary
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add  constraint profiles_role_check
  check (role in ('customer', 'vendor', 'admin'));


-- ============================================================
-- 2. VENUES
-- ============================================================

create table if not exists public.venues (
  id              uuid        primary key default gen_random_uuid(),
  vendor_id       uuid        not null references public.profiles (id) on delete cascade,
  name            text        not null,
  type            text        not null default 'hall',
  description     text,
  address         text,
  city            text        not null default 'Karachi',
  area            text,
  capacity_min    int,
  capacity_max    int         not null default 100,
  capacity        int,                          -- legacy mirror of capacity_max
  price_per_day   numeric,                      -- primary pricing model (PKR)
  price_per_plate numeric,                      -- optional per-head pricing (PKR)
  min_spending    numeric,
  amenities       text[]      not null default '{}'::text[],
  images          text[]      not null default '{}'::text[],
  status          text        not null default 'pending_approval',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Bring older venue tables up to the current shape.
alter table public.venues add column if not exists type            text;
alter table public.venues add column if not exists area            text;
alter table public.venues add column if not exists city            text;
alter table public.venues add column if not exists capacity_min    int;
alter table public.venues add column if not exists capacity_max    int;
alter table public.venues add column if not exists capacity        int;
alter table public.venues add column if not exists price_per_day   numeric;
alter table public.venues add column if not exists price_per_plate numeric;
alter table public.venues add column if not exists min_spending    numeric;
alter table public.venues add column if not exists images          text[] not null default '{}'::text[];
alter table public.venues add column if not exists amenities       text[] not null default '{}'::text[];
alter table public.venues add column if not exists updated_at      timestamptz not null default now();

update public.venues set type         = coalesce(type, 'hall');
update public.venues set city         = coalesce(city, area, 'Karachi');
update public.venues set capacity_max = coalesce(capacity_max, capacity, 100);
update public.venues set capacity     = coalesce(capacity, capacity_max);

alter table public.venues drop constraint if exists venues_type_check;
alter table public.venues add  constraint venues_type_check
  check (type in ('hall', 'marquee', 'banquet', 'lawn'));

-- Status vocabulary. 'pending'/'approved'/'rejected' are the legacy values and
-- are still accepted so existing rows stay valid; new writes use the
-- draft → pending_approval → live → suspended lifecycle.
alter table public.venues drop constraint if exists venues_status_check;
alter table public.venues add  constraint venues_status_check
  check (status in ('draft', 'pending_approval', 'live', 'suspended',
                    'pending', 'approved', 'rejected'));

alter table public.venues drop constraint if exists venues_capacity_check;
alter table public.venues add  constraint venues_capacity_check
  check (capacity_min is null or capacity_max is null or capacity_min <= capacity_max);

create index if not exists venues_vendor_id_idx on public.venues (vendor_id);
create index if not exists venues_status_idx    on public.venues (status);
create index if not exists venues_city_idx      on public.venues (city);


-- ============================================================
-- 3. VENUE IMAGES
-- ============================================================

create table if not exists public.venue_images (
  id            uuid    primary key default gen_random_uuid(),
  venue_id      uuid    not null references public.venues (id) on delete cascade,
  storage_path  text    not null,
  is_cover      boolean not null default false,
  display_order int     not null default 0
);

create index if not exists venue_images_venue_id_idx on public.venue_images (venue_id);


-- ============================================================
-- 4. BOOKINGS
-- ============================================================

create table if not exists public.bookings (
  id               uuid        primary key default gen_random_uuid(),
  venue_id         uuid        not null references public.venues (id)   on delete cascade,
  customer_id      uuid        not null references public.profiles (id) on delete cascade,
  booking_date     date        not null,
  event_end_date   date,
  slot             text        not null default 'evening',
  number_of_guests int         not null default 50,
  total_price      numeric     not null default 0,
  notes            text,
  status           text        not null default 'pending_approval',
  payment_status   text        not null default 'unpaid',
  receipt_url      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Older builds named these columns differently; migrate rather than recreate.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'event_date'
  ) then
    alter table public.bookings add column if not exists booking_date date;
    update public.bookings set booking_date = event_date where booking_date is null;
    alter table public.bookings drop column event_date;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'guests'
  ) then
    alter table public.bookings add column if not exists number_of_guests int;
    update public.bookings set number_of_guests = guests where number_of_guests is null;
    alter table public.bookings drop column guests;
  end if;
end $$;

alter table public.bookings add column if not exists event_end_date   date;
alter table public.bookings add column if not exists slot             text    not null default 'evening';
alter table public.bookings add column if not exists number_of_guests int     not null default 50;
alter table public.bookings add column if not exists total_price      numeric not null default 0;
alter table public.bookings add column if not exists notes            text;
alter table public.bookings add column if not exists payment_status   text    not null default 'unpaid';
alter table public.bookings add column if not exists receipt_url      text;
alter table public.bookings add column if not exists updated_at       timestamptz not null default now();

alter table public.bookings drop constraint if exists bookings_slot_check;
alter table public.bookings add  constraint bookings_slot_check
  check (slot in ('afternoon', 'evening', 'full_day'));

-- 'pending'/'confirmed' are legacy values kept for existing rows.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add  constraint bookings_status_check
  check (status in ('pending_approval', 'approved', 'rejected', 'paid', 'cancelled',
                    'pending', 'confirmed'));

alter table public.bookings drop constraint if exists bookings_payment_status_check;
alter table public.bookings add  constraint bookings_payment_status_check
  check (payment_status in ('unpaid', 'pending_verification', 'paid'));

alter table public.bookings drop constraint if exists bookings_dates_check;
alter table public.bookings add  constraint bookings_dates_check
  check (event_end_date is null or event_end_date >= booking_date);

create index if not exists bookings_venue_id_idx    on public.bookings (venue_id);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);

-- Stop two live bookings from claiming the same venue, date and slot.
-- Partial, so cancelled/rejected requests free the slot up again.
drop index if exists public.bookings_no_double_booking;
create unique index bookings_no_double_booking
  on public.bookings (venue_id, booking_date, slot)
  where status in ('pending_approval', 'approved', 'paid', 'pending', 'confirmed');


-- ============================================================
-- 5. REVIEWS
-- ============================================================

create table if not exists public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  venue_id    uuid        not null references public.venues (id)    on delete cascade,
  customer_id uuid        not null references public.profiles (id)  on delete cascade,
  booking_id  uuid        references public.bookings (id)           on delete cascade,
  rating      int         not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

alter table public.reviews add column if not exists booking_id uuid references public.bookings (id) on delete cascade;

create index if not exists reviews_venue_id_idx on public.reviews (venue_id);


-- ============================================================
-- 6. TRIGGERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists venues_set_updated_at on public.venues;
create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();


-- Creates the profile row on signup, reading the metadata the client sends
-- with supabase.auth.signUp(). The client cannot insert this row itself
-- (there is no session yet at that point), which is why it happens here.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('customer', 'vendor')
        then new.raw_user_meta_data ->> 'role'
      else 'customer'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Remove the trigger/function from the older schema, if present.
drop function if exists public.handle_new_user() cascade;


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.venues       enable row level security;
alter table public.venue_images enable row level security;
alter table public.bookings     enable row level security;
alter table public.reviews      enable row level security;

-- Reads profiles without recursing through profiles' own RLS policies.
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ── profiles ───────────────────────────────────────────────
drop policy if exists "profiles: public read"   on public.profiles;
drop policy if exists "profiles: owner update"  on public.profiles;
drop policy if exists "profiles: owner insert"  on public.profiles;
drop policy if exists "profiles: admin update"  on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update their own profile"       on public.profiles;

create policy "profiles: public read"
  on public.profiles for select using (true);

-- Needed so a signed-in user whose trigger row is missing can self-heal.
create policy "profiles: owner insert"
  on public.profiles for insert with check (id = auth.uid());

create policy "profiles: owner update"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Admins manage roles (suspend / reactivate vendors).
create policy "profiles: admin update"
  on public.profiles for update
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');


-- ── venues ─────────────────────────────────────────────────
drop policy if exists "venues: public read live"       on public.venues;
drop policy if exists "venues: vendor insert"          on public.venues;
drop policy if exists "venues: vendor/admin update"    on public.venues;
drop policy if exists "venues: vendor/admin delete"    on public.venues;
drop policy if exists "Approved venues are viewable by everyone" on public.venues;
drop policy if exists "Vendors can insert their own venues"      on public.venues;
drop policy if exists "Vendors can update their own venues"      on public.venues;
drop policy if exists "Admins can update any venue status"       on public.venues;

create policy "venues: public read live"
  on public.venues for select
  using (
    status in ('live', 'approved')
    or vendor_id = auth.uid()
    or public.get_my_role() = 'admin'
  );

create policy "venues: vendor insert"
  on public.venues for insert
  with check (vendor_id = auth.uid() and public.get_my_role() = 'vendor');

create policy "venues: vendor/admin update"
  on public.venues for update
  using (vendor_id = auth.uid() or public.get_my_role() = 'admin')
  with check (vendor_id = auth.uid() or public.get_my_role() = 'admin');

create policy "venues: vendor/admin delete"
  on public.venues for delete
  using (vendor_id = auth.uid() or public.get_my_role() = 'admin');


-- ── venue_images ───────────────────────────────────────────
drop policy if exists "venue_images: public read"    on public.venue_images;
drop policy if exists "venue_images: vendor insert"  on public.venue_images;
drop policy if exists "venue_images: vendor update"  on public.venue_images;
drop policy if exists "venue_images: vendor delete"  on public.venue_images;

create policy "venue_images: public read"
  on public.venue_images for select using (true);

create policy "venue_images: vendor insert"
  on public.venue_images for insert
  with check (exists (
    select 1 from public.venues v
    where v.id = venue_id and (v.vendor_id = auth.uid() or public.get_my_role() = 'admin')
  ));

create policy "venue_images: vendor update"
  on public.venue_images for update
  using (exists (
    select 1 from public.venues v
    where v.id = venue_id and (v.vendor_id = auth.uid() or public.get_my_role() = 'admin')
  ));

create policy "venue_images: vendor delete"
  on public.venue_images for delete
  using (exists (
    select 1 from public.venues v
    where v.id = venue_id and (v.vendor_id = auth.uid() or public.get_my_role() = 'admin')
  ));


-- ── bookings ───────────────────────────────────────────────
drop policy if exists "bookings: role-based read"   on public.bookings;
drop policy if exists "bookings: customer insert"   on public.bookings;
drop policy if exists "bookings: role-based update" on public.bookings;
drop policy if exists "Users can view their own bookings"                on public.bookings;
drop policy if exists "Customers can insert bookings"                    on public.bookings;
drop policy if exists "Customers can update their booking receipt"       on public.bookings;
drop policy if exists "Vendors can update their bookings (approve/cancel)" on public.bookings;
drop policy if exists "Admins can update all bookings"                   on public.bookings;

create policy "bookings: role-based read"
  on public.bookings for select
  using (
    customer_id = auth.uid()
    or exists (select 1 from public.venues v where v.id = venue_id and v.vendor_id = auth.uid())
    or public.get_my_role() = 'admin'
  );

create policy "bookings: customer insert"
  on public.bookings for insert
  with check (customer_id = auth.uid() and public.get_my_role() = 'customer');

create policy "bookings: role-based update"
  on public.bookings for update
  using (
    customer_id = auth.uid()
    or exists (select 1 from public.venues v where v.id = venue_id and v.vendor_id = auth.uid())
    or public.get_my_role() = 'admin'
  );


-- ── reviews ────────────────────────────────────────────────
drop policy if exists "reviews: public read"     on public.reviews;
drop policy if exists "reviews: customer insert" on public.reviews;
drop policy if exists "reviews: customer insert on confirmed booking" on public.reviews;
drop policy if exists "Reviews are public"         on public.reviews;
drop policy if exists "Customers can insert reviews" on public.reviews;

create policy "reviews: public read"
  on public.reviews for select using (true);

-- A review must be backed by one of the customer's own completed bookings.
create policy "reviews: customer insert"
  on public.reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.customer_id = auth.uid()
        and b.status in ('approved', 'paid', 'confirmed')
    )
  );


-- ============================================================
-- 8. STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('venue-images', 'venue-images', true)
on conflict (id) do nothing;

-- Payment receipts are private: only the uploader, the venue's vendor and
-- admins should ever read them, so this bucket is not public.
insert into storage.buckets (id, name, public)
values ('bookings', 'bookings', false)
on conflict (id) do nothing;

drop policy if exists "venue-images: vendor upload" on storage.objects;
drop policy if exists "venue-images: vendor delete" on storage.objects;
drop policy if exists "venue-images: public read"   on storage.objects;
drop policy if exists "bookings: customer upload"   on storage.objects;
drop policy if exists "bookings: authenticated read" on storage.objects;

-- Convention: venue-photos/<vendor_id>/<file>
create policy "venue-images: vendor upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'venue-images' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "venue-images: vendor delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'venue-images' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "venue-images: public read"
  on storage.objects for select to public
  using (bucket_id = 'venue-images');

-- Convention: receipts/<customer_id>/<file>
create policy "bookings: customer upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bookings' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "bookings: authenticated read"
  on storage.objects for select to authenticated
  using (bucket_id = 'bookings');


-- ============================================================
-- 9. PROMOTING AN ADMIN
--
-- Roles are locked down, so the first admin has to be set by hand.
-- Register the account through the app, then run:
--
--   update public.profiles
--      set role = 'admin'
--    where id = (select id from auth.users where email = 'you@example.com');
-- ============================================================
