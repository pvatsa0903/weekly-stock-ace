
-- Create decision enum
CREATE TYPE public.decision_type AS ENUM ('PICK', 'SKIP');

-- Table A: weekly_decisions
CREATE TABLE public.weekly_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_ending DATE NOT NULL,
  decision public.decision_type NOT NULL,
  pick1 TEXT,
  pick2 TEXT,
  eli5_summary TEXT NOT NULL,
  why_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table B: tickers
CREATE TABLE public.tickers (
  ticker TEXT NOT NULL PRIMARY KEY,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  market_cap NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  avg_dollar_volume NUMERIC NOT NULL
);

-- Table C: sentiment_items
CREATE TABLE public.sentiment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_ending DATE NOT NULL,
  platform TEXT NOT NULL,
  ticker TEXT NOT NULL,
  url TEXT NOT NULL,
  engagement NUMERIC NOT NULL DEFAULT 0,
  velocity NUMERIC,
  sentiment_label TEXT NOT NULL,
  snippet TEXT NOT NULL
);

-- Table D: fundamentals_snapshot
CREATE TABLE public.fundamentals_snapshot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_ending DATE NOT NULL,
  ticker TEXT NOT NULL,
  rev_cagr_3y NUMERIC,
  rev_yoy NUMERIC,
  op_margin NUMERIC,
  net_margin NUMERIC,
  fcf NUMERIC,
  cash NUMERIC,
  debt NUMERIC,
  pe NUMERIC,
  ev_sales NUMERIC,
  risk_flags TEXT
);

-- Enable RLS on all tables (public read-only access)
ALTER TABLE public.weekly_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundamentals_snapshot ENABLE ROW LEVEL SECURITY;

-- Public read policies (no auth required)
CREATE POLICY "Public read access" ON public.weekly_decisions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.tickers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.sentiment_items FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.fundamentals_snapshot FOR SELECT USING (true);
