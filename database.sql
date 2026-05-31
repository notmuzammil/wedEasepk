-- Database Schema for ShaadiSpaces (Karachi Wedding Venue Booking Platform)
-- Run this script in the Supabase SQL Editor.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Drop existing triggers and functions if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone_number text not null,
  role text not null check (role in ('customer', 'vendor', 'admin')) default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create public profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone_number, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. VENUES TABLE
create table if not exists public.venues (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('hall', 'marquee', 'banquet', 'lawn')),
  address text not null,
  area text not null, -- Karachi Areas (e.g. Clifton, DHA, Gulshan-e-Iqbal, North Nazimabad, etc.)
  capacity integer not null check (capacity > 0),
  price_per_plate numeric not null check (price_per_plate >= 0),
  min_spending numeric not null check (min_spending >= 0),
  amenities text[] default '{}'::text[] not null,
  description text,
  images text[] default '{}'::text[] not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.venues enable row level security;

-- Venues Policies
drop policy if exists "Approved venues are viewable by everyone" on public.venues;
create policy "Approved venues are viewable by everyone" on public.venues
  for select using (status = 'approved' or auth.uid() = vendor_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

drop policy if exists "Vendors can insert their own venues" on public.venues;
create policy "Vendors can insert their own venues" on public.venues
  for insert with check (auth.uid() = vendor_id and exists (
    select 1 from public.profiles where id = auth.uid() and role = 'vendor'
  ));

drop policy if exists "Vendors can update their own venues" on public.venues;
create policy "Vendors can update their own venues" on public.venues
  for update using (auth.uid() = vendor_id);

drop policy if exists "Admins can update any venue status" on public.venues;
create policy "Admins can update any venue status" on public.venues
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- 3. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  venue_id uuid references public.venues(id) on delete cascade not null,
  booking_date date not null,
  slot text not null check (slot in ('afternoon', 'evening', 'full_day')),
  number_of_guests integer not null check (number_of_guests > 0),
  total_price numeric not null check (total_price >= 0),
  status text not null check (status in ('pending_approval', 'approved', 'paid', 'cancelled')) default 'pending_approval',
  payment_status text not null check (payment_status in ('unpaid', 'pending_verification', 'paid')) default 'unpaid',
  receipt_url text, -- uploaded receipt file path/url
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (venue_id, booking_date, slot) -- Prevents double booking on same slot
);

alter table public.bookings enable row level security;

-- Bookings Policies
drop policy if exists "Users can view their own bookings" on public.bookings;
create policy "Users can view their own bookings" on public.bookings
  for select using (
    auth.uid() = customer_id or 
    exists (select 1 from public.venues where id = venue_id and vendor_id = auth.uid()) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Customers can insert bookings" on public.bookings;
create policy "Customers can insert bookings" on public.bookings
  for insert with check (
    auth.uid() = customer_id and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'customer')
  );

drop policy if exists "Customers can update their booking receipt" on public.bookings;
create policy "Customers can update their booking receipt" on public.bookings
  for update using (auth.uid() = customer_id);

drop policy if exists "Vendors can update their bookings (approve/cancel)" on public.bookings;
create policy "Vendors can update their bookings (approve/cancel)" on public.bookings
  for update using (
    exists (select 1 from public.venues where id = bookings.venue_id and vendor_id = auth.uid())
  );

drop policy if exists "Admins can update all bookings" on public.bookings;
create policy "Admins can update all bookings" on public.bookings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  venue_id uuid references public.venues(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

-- Reviews Policies
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews
  for select using (true);

drop policy if exists "Customers can insert reviews" on public.reviews;
create policy "Customers can insert reviews" on public.reviews
  for insert with check (auth.uid() = customer_id);
