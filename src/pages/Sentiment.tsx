import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SentimentHeatmap } from "@/components/sentiment/SentimentHeatmap";
import { SentimentTrendlines } from "@/components/sentiment/SentimentTrendlines";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Sentiment = () => {
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30">("14");

  const { data: sentimentData = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["daily_sentiment", timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      const dateStr = daysAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_sentiment")
        .select("*")
        .gte("date", dateStr)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Get latest day's data for heatmap
  const latestDate = useMemo(() => {
    if (sentimentData.length === 0) return null;
    return sentimentData.reduce((max, d) => (d.date > max ? d.date : max), sentimentData[0].date);
  }, [sentimentData]);

  const todayData = useMemo(
    () => sentimentData.filter((d) => d.date === latestDate),
    [sentimentData, latestDate]
  );

  // Get unique tickers
  const tickers = useMemo(() => {
    const set = new Set(sentimentData.map((d) => d.ticker));
    return Array.from(set).sort();
  }, [sentimentData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sentiment Radar</h1>
            <p className="text-muted-foreground">
              Daily sentiment scores from Reddit &amp; X across top tickers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "7" | "14" | "30")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
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
            {/* Heatmap */}
            <SentimentHeatmap data={todayData} date={latestDate!} />

            {/* Trendlines */}
            <SentimentTrendlines data={sentimentData} tickers={tickers} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sentiment;
