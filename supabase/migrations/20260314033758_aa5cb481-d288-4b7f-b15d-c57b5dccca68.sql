
-- Create sell signal type enum
CREATE TYPE public.sell_signal_type AS ENUM ('SELL', 'HOLD', 'WATCH');

-- Create sell_signals table
CREATE TABLE public.sell_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  signal sell_signal_type NOT NULL DEFAULT 'WATCH',
  confidence integer NOT NULL DEFAULT 50,
  reasoning text NOT NULL,
  sentiment_score numeric,
  sentiment_change numeric,
  fundamental_flags text,
  price_at_signal numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS
ALTER TABLE public.sell_signals ENABLE ROW LEVEL SECURITY;

-- Public read access (same pattern as other tables)
CREATE POLICY "Public read access" ON public.sell_signals
  FOR SELECT TO public USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sell_signals;
