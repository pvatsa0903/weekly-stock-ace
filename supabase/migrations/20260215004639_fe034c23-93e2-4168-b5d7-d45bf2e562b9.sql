
-- Daily aggregated sentiment scores per ticker
CREATE TABLE public.daily_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  ticker TEXT NOT NULL,
  
  -- Reddit metrics
  reddit_mentions INT NOT NULL DEFAULT 0,
  reddit_engagement NUMERIC NOT NULL DEFAULT 0,
  reddit_velocity NUMERIC DEFAULT 0,
  reddit_sentiment_score NUMERIC DEFAULT 0,
  
  -- X/Twitter metrics
  x_mentions INT NOT NULL DEFAULT 0,
  x_engagement NUMERIC NOT NULL DEFAULT 0,
  x_velocity NUMERIC DEFAULT 0,
  x_sentiment_score NUMERIC DEFAULT 0,
  
  -- Combined
  sentiment_score NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0,
  reddit_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  x_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(date, ticker)
);

-- Enable RLS with public read
ALTER TABLE public.daily_sentiment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON public.daily_sentiment
  FOR SELECT
  USING (true);

-- Index for fast lookups
CREATE INDEX idx_daily_sentiment_date ON public.daily_sentiment(date DESC);
CREATE INDEX idx_daily_sentiment_ticker ON public.daily_sentiment(ticker);
CREATE INDEX idx_daily_sentiment_score ON public.daily_sentiment(sentiment_score DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_sentiment;
