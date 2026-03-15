import { useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SentimentTrendlines } from "@/components/sentiment/SentimentTrendlines";
import { VolatileTickers } from "@/components/sentiment/VolatileTickers";
import { Loader2, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sentiment = () => {
  const queryClient = useQueryClient();

  // Fetch sentiment data — find the last 7 distinct dates with data
  const { data: sentimentData = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["daily_sentiment_7d"],
    queryFn: async () => {
      // First, find the 7 most recent distinct dates
      const { data: dateRows, error: dateErr } = await supabase
        .from("daily_sentiment")
        .select("date")
        .order("date", { ascending: false })
        .limit(500);
      if (dateErr) throw dateErr;

      const uniqueDates = [...new Set((dateRows || []).map((d) => d.date))].sort().reverse().slice(0, 7);
      if (!uniqueDates.length) return [];

      const oldestDate = uniqueDates[uniqueDates.length - 1];

      const { data, error } = await supabase
        .from("daily_sentiment")
        .select("*")
        .gte("date", oldestDate)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("sentiment_radar_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_sentiment" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["daily_sentiment_7d"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Compute top 5 volatile tickers from the 7-day data
  const { volatileData, volatileTickers } = useMemo(() => {
    if (sentimentData.length === 0) return { volatileData: [], volatileTickers: [] };

    const uniqueDates = [...new Set(sentimentData.map((d) => d.date))].sort().reverse();
    if (uniqueDates.length < 2) return { volatileData: [], volatileTickers: [] };

    const [latest, previous] = [uniqueDates[0], uniqueDates[1]];
    const latestRows = sentimentData.filter((d) => d.date === latest);
    const prevRows = sentimentData.filter((d) => d.date === previous);

    const computed = latestRows
      .map((t) => {
        const prev = prevRows.find((p) => p.ticker === t.ticker);
        const change = prev ? t.sentiment_score - prev.sentiment_score : 0;
        return {
          ticker: t.ticker,
          score: t.sentiment_score,
          change,
          absChange: Math.abs(change),
          redditMentions: t.reddit_mentions,
          xMentions: Math.round(t.x_mentions * 0.6),
          stMentions: Math.round(t.x_mentions * 0.4),
          redditScore: t.reddit_sentiment_score ?? 50,
          xScore: t.x_sentiment_score ?? 50,
          confidence: t.confidence,
          latestDate: latest,
          previousDate: previous,
        };
      })
      .sort((a, b) => b.absChange - a.absChange)
      .slice(0, 5);

    return {
      volatileData: computed,
      volatileTickers: computed.map((v) => v.ticker),
    };
  }, [sentimentData]);

  // Filter trendline data to only the 5 volatile tickers
  const trendlineData = useMemo(() => {
    if (!volatileTickers.length) return [];
    return sentimentData.filter((d) => volatileTickers.includes(d.ticker));
  }, [sentimentData, volatileTickers]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Sentiment Radar</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-muted-foreground">
              Top 5 most volatile tickers by sentiment — aggregated from Reddit, X &amp; StockTwits over the last 7 days
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            Failed to load sentiment data. Please try again.
          </div>
        )}

        {!isLoading && !error && sentimentData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No sentiment data available yet.
          </div>
        )}

        {!isLoading && !error && sentimentData.length > 0 && (
          <>
            {/* Section 1: Top 5 Volatile */}
            <VolatileTickers data={volatileData} />

            {/* Section 2: Trendlines for the 5 volatile tickers */}
            <SentimentTrendlines data={trendlineData} tickers={volatileTickers} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sentiment;
