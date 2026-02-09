-- Add CRM fields to the existing leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS pain_point text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone default now();

-- Update status check to allow CRM stages
-- (If there was a constraint, we'd drop it. Assuming text field based on previous schema)
-- We will use 'status' for the Kanban column: 'new', 'convo', 'qualifying', 'booked'
