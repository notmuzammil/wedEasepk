# WedEase — wedease.com.pk

A double-sided marketplace for booking wedding venues (halls, marquees, lawns
and banquet spaces) across Pakistan. Customers browse and request dates,
vendors list and manage their spaces, and admins review listings.

Built with React + Vite, Tailwind CSS, TanStack Query, Zustand and Supabase.

## Getting started

```bash
npm install
npm run dev
```

### 1. Environment

Create a `.env` in the project root (it is git-ignored):

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. Database

Run `database.sql` in the Supabase SQL Editor. It is the single source of
truth for the schema and is idempotent, so it is safe to re-run.

It creates the tables, row-level security policies, the signup trigger, and
the two storage buckets (`venue-images`, public; `bookings`, private — payment
receipts are served through signed URLs).

### 3. Create an admin

Roles are locked down by RLS, so the first admin has to be promoted by hand.
Register through the app, then run in the SQL Editor:

```sql
update public.profiles
   set role = 'admin'
 where id = (select id from auth.users where email = 'you@example.com');
```

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the dev server              |
| `npm run build`   | Production build to `dist/`       |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Lint the project                  |

## Roles

- **Customer** — browse venues, request bookings, upload payment receipts,
  manage their profile.
- **Vendor** — list venues (each listing is reviewed before going live),
  accept or decline booking requests.
- **Admin** — approve, suspend and reactivate listings; manage vendor and
  customer accounts; verify payments.

## Venue lifecycle

`draft` → `pending_approval` → `live` → `suspended`

Only `live` venues appear in public browse and search. Editing a live listing
sends it back to `pending_approval`.

## Project layout

```
src/
  components/   ui/ (design system), shared/, layout/
  hooks/        useAuth, useVenues, useBookings
  pages/        public/, customer/, vendor/, admin/
  routes/       AppRouter + auth and role guards
  services/     Supabase data access
  store/        Zustand stores (auth, ui)
  utils/        constants, formatters, validators
```
