-- Enable required extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add unique constraint on week_ending for upsert support
ALTER TABLE public.weekly_decisions ADD CONSTRAINT weekly_decisions_week_ending_key UNIQUE (week_ending);