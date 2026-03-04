import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockData } from "@/hooks/useStockData";
import { TickerHeader } from "@/components/ticker/TickerHeader";
import { SentimentCard } from "@/components/ticker/SentimentCard";
import { FundamentalsCard } from "@/components/ticker/FundamentalsCard";
import { NewsCard } from "@/components/ticker/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";

const TickerDetail = () => {
  const [searchParams] = useSearchParams();
  const [inputTicker, setInputTicker] = useState(searchParams.get("symbol") || "NVDA");
  const [activeTicker, setActiveTicker] = useState(searchParams.get("symbol") || "NVDA");

  const { data, isLoading, error, refetch } = useStockData(activeTicker);

  const handleSearch = () => {
    if (inputTicker.trim()) {
      setActiveTicker(inputTicker.toUpperCase());
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search */}
        <div className="flex gap-3 max-w-md">
          <Input
            placeholder="Enter ticker (e.g., NVDA, AAPL)"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Loading..." : "Search"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to load ticker data"}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {data && !isLoading && (
          <>
            <TickerHeader data={data} />

            <FundamentalsCard fundamentals={data.fundamentals} />

            <NewsCard news={data.recentNews} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TickerDetail;
