-- ============================================================
-- ShaadiSpaces — Supabase SQL Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users (one row per auth user)
-- ============================================================

create table if not exists public.profiles (
  id          uuid        not null references auth.users (id) on delete cascade,
  full_name   text        not null,
  phone       text,
  role        text        not null default 'customer'
                          check (role in ('customer', 'vendor', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now(),

  constraint profiles_pkey primary key (id)
);

comment on table public.profiles is
  'Public user profiles — one row per auth.users entry, role controls platform access.';


-- ============================================================
-- TABLE: venues
-- ============================================================

create table if not exists public.venues (
  id              uuid        not null default gen_random_uuid(),
  vendor_id       uuid        not null references public.profiles (id) on delete cascade,
  name            text        not null,
  description     text,
  city            text        not null,
  address         text,
  capacity_min    int,
  capacity_max    int         not null,
  price_per_day   int         not null, -- stored in PKR
  status          text        not null default 'draft'
                              check (status in ('draft', 'pending_approval', 'live', 'suspended')),
  amenities       text[]      not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint venues_pkey primary key (id),
  constraint venues_capacity_check check (
    capacity_min is null or capacity_min <= capacity_max
  )
);

comment on table public.venues is
  'Wedding halls, marquees, lawns and banquet spaces listed by vendors.';

comment on column public.venues.price_per_day is
  'Full-day price in Pakistani Rupees (PKR).';


-- ============================================================
-- TABLE: venue_images
-- ============================================================

create table if not exists public.venue_images (
  id              uuid    not null default gen_random_uuid(),
  venue_id        uuid    not null references public.venues (id) on delete cascade,
  storage_path    text    not null,
  is_cover        boolean not null default false,
  display_order   int     not null default 0,

  constraint venue_images_pkey primary key (id)
);

comment on table public.venue_images is
  'Photos uploaded for a venue, stored in the venue-images Storage bucket.';

comment on column public.venue_images.storage_path is
  'Relative path within the venue-images Storage bucket.';


-- ============================================================
-- TABLE: bookings
-- ============================================================

create table if not exists public.bookings (
  id            uuid        not null default gen_random_uuid(),
  venue_id      uuid        not null references public.venues (id) on delete restrict,
  customer_id   uuid        not null references public.profiles (id) on delete restrict,
  event_date    date        not null,
  event_end_date date,
  guests        int,
  status        text        not null default 'pending'
                            check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint bookings_pkey primary key (id),
  constraint bookings_dates_check check (
    event_end_date is null or event_end_date >= event_date
  )
);

comment on table public.bookings is
  'Customer reservation requests against a venue for a specific event date range.';


-- ============================================================
-- TABLE: reviews
-- ============================================================

create table if not exists public.reviews (
  id            uuid        not null default gen_random_uuid(),
  venue_id      uuid        not null references public.venues (id) on delete cascade,
  customer_id   uuid        not null references public.profiles (id) on delete cascade,
  booking_id    uuid        not null references public.bookings (id) on delete cascade,
  rating        int         not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),

  constraint reviews_pkey  primary key (id),
  constraint reviews_booking_unique unique (booking_id) -- one review per booking
);

comment on table public.reviews is
  'Customer ratings and comments, each tied to exactly one confirmed booking.';


-- ============================================================
-- AUTO-UPDATE updated_at HELPER
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

create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();


-- ============================================================
-- TRIGGER: auto-create profile on auth signup
-- Fires after a new row is inserted into auth.users and
-- creates a matching public.profiles row with role = 'customer'
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer          -- runs with superuser privileges to bypass RLS
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.email               -- fallback so full_name is never null
    ),
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$;

-- Drop first in case schema is re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.venues       enable row level security;
alter table public.venue_images enable row level security;
alter table public.bookings     enable row level security;
alter table public.reviews      enable row level security;


-- ------------------------------------------------------------
-- HELPER: reusable inline function to check the caller's role
-- Uses security definer so it bypasses RLS when reading profiles
-- ------------------------------------------------------------

create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

-- Anyone can read any profile (needed to display vendor info publicly)
create policy "profiles: public read"
  on public.profiles
  for select
  using (true);

-- A user can only update their own profile row
create policy "profiles: owner update"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- ============================================================
-- RLS POLICIES: venues
-- ============================================================

-- Public read: only LIVE venues are visible without auth
create policy "venues: public read live"
  on public.venues
  for select
  using (
    status = 'live'
    or vendor_id = auth.uid()
    or public.get_my_role() = 'admin'
  );

-- Vendors can insert venues (must be their own vendor_id)
create policy "venues: vendor insert"
  on public.venues
  for insert
  with check (
    vendor_id = auth.uid()
    and public.get_my_role() = 'vendor'
  );

-- Vendors can update their own venues; admins can update any
create policy "venues: vendor/admin update"
  on public.venues
  for update
  using (
    vendor_id = auth.uid()
    or public.get_my_role() = 'admin'
  )
  with check (
    vendor_id = auth.uid()
    or public.get_my_role() = 'admin'
  );

-- Vendors can delete their own draft/pending venues; admins can delete any
create policy "venues: vendor/admin delete"
  on public.venues
  for delete
  using (
    vendor_id = auth.uid()
    or public.get_my_role() = 'admin'
  );


-- ============================================================
-- RLS POLICIES: venue_images
-- ============================================================

-- Public read (images accompany public venue listings)
create policy "venue_images: public read"
  on public.venue_images
  for select
  using (true);

-- Vendor can insert images only for their own venues
create policy "venue_images: vendor insert"
  on public.venue_images
  for insert
  with check (
    exists (
      select 1 from public.venues v
      where v.id = venue_id
        and v.vendor_id = auth.uid()
    )
  );

-- Vendor can update/delete images of their own venues
create policy "venue_images: vendor update"
  on public.venue_images
  for update
  using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id
        and v.vendor_id = auth.uid()
    )
  );

create policy "venue_images: vendor delete"
  on public.venue_images
  for delete
  using (
    exists (
      select 1 from public.venues v
      where v.id = venue_id
        and v.vendor_id = auth.uid()
    )
  );


-- ============================================================
-- RLS POLICIES: bookings
-- ============================================================

-- Customers see their own bookings
-- Vendors see bookings for any of their venues
-- Admins see all
create policy "bookings: role-based read"
  on public.bookings
  for select
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.venues v
      where v.id = venue_id
        and v.vendor_id = auth.uid()
    )
    or public.get_my_role() = 'admin'
  );

-- Only customers can create bookings (for themselves)
create policy "bookings: customer insert"
  on public.bookings
  for insert
  with check (
    customer_id = auth.uid()
    and public.get_my_role() = 'customer'
  );

-- Customers can cancel their own pending bookings
-- Vendors can confirm/reject bookings on their venues
-- Admins can update anything
create policy "bookings: role-based update"
  on public.bookings
  for update
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.venues v
      where v.id = venue_id
        and v.vendor_id = auth.uid()
    )
    or public.get_my_role() = 'admin'
  );


-- ============================================================
-- RLS POLICIES: reviews
-- ============================================================

-- Anyone can read reviews
create policy "reviews: public read"
  on public.reviews
  for select
  using (true);

-- Customer can only insert a review if:
--   1. They are the customer on the linked booking
--   2. The booking status is 'confirmed'
--   3. The booking_id is unique (enforced by unique constraint)
create policy "reviews: customer insert on confirmed booking"
  on public.reviews
  for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id     = booking_id
        and b.customer_id = auth.uid()
        and b.status  = 'confirmed'
    )
  );


-- ============================================================
-- STORAGE BUCKET: venue-images
--
-- Run the INSERT below; if the bucket already exists it will
-- do nothing (ON CONFLICT DO NOTHING).
--
-- public = true  → anyone can GET objects (read photos)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('venue-images', 'venue-images', true)
on conflict (id) do nothing;

-- Allow authenticated vendors to upload into their own folder
-- Convention: <vendor_id>/<venue_id>/<filename>
create policy "venue-images: vendor upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'venue-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow vendors to delete their own images
create policy "venue-images: vendor delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'venue-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for all objects in the bucket
create policy "venue-images: public read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'venue-images');


-- ============================================================
-- END OF SCHEMA
-- ============================================================
