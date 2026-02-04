-- 1. Create a table for Leads (Cart Abandonment)
create table leads (
  id uuid default uuid_generate_v4() primary key,
  email text,
  name text,
  source text default 'landing_page',
  status text default 'captured', -- captured, converted, abandoned
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create a table for Students (Users)
-- Note: Supabase handles Auth users separately, but we'll keep a public profile table for your CRM view
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  name text,
  stripe_customer_id text,
  access_level text default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create a table for Activity Logs (Debugging/Tracking)
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  event_type text, -- 'lead_captured', 'purchase_success', 'login'
  description text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Make it secure (Row Level Security) - Optional but recommended standard
alter table leads enable row level security;
alter table profiles enable row level security;
alter table activity_logs enable row level security;

-- Create policies that allow the Anon Key (Server) to Insert/Select
-- For simplicity in this Agent setup, we essentially allow "Server" full access
create policy "Enable all access for service role" on leads for all using (true);
create policy "Enable all access for service role" on profiles for all using (true);
create policy "Enable all access for service role" on activity_logs for all using (true);
