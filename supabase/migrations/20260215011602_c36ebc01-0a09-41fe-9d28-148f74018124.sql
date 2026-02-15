
-- Track actual performance of each pick
CREATE TABLE public.pick_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_ending DATE NOT NULL,
  ticker TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  return_pct NUMERIC GENERATED ALWAYS AS (ROUND(((exit_price - entry_price) / entry_price) * 100, 2)) STORED,
  is_win BOOLEAN GENERATED ALWAYS AS (exit_price > entry_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pick_performance ENABLE ROW LEVEL SECURITY;

-- Public read access (same pattern as other tables)
CREATE POLICY "Public read access" ON public.pick_performance
  FOR SELECT USING (true);
