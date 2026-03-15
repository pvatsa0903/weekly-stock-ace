import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockData } from "@/hooks/useStockData";
import { TickerHeader } from "@/components/ticker/TickerHeader";
import { SellSignalCard } from "@/components/ticker/SellSignalCard";
import { useSellSignalForTicker } from "@/hooks/useSellSignals";
import { SentimentCard } from "@/components/ticker/SentimentCard";
import { FundamentalsCard } from "@/components/ticker/FundamentalsCard";
import { NewsCard } from "@/components/ticker/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const TickerDetail = () => {
  const [searchParams] = useSearchParams();
  const [inputTicker, setInputTicker] = useState(searchParams.get("symbol") || "NVDA");
  const [activeTicker, setActiveTicker] = useState(searchParams.get("symbol") || "NVDA");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useStockData(activeTicker);
  const { data: sellSignal } = useSellSignalForTicker(activeTicker);

  // Fetch all tickers for autocomplete
  const { data: allTickers = [] } = useQuery({
    queryKey: ["all_tickers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickers")
        .select("ticker, company_name")
        .order("ticker");
      if (error) throw error;
      return data;
    },
  });

  const filteredTickers = inputTicker.length > 0
    ? allTickers.filter(
        (t) =>
          t.ticker.includes(inputTicker.toUpperCase()) ||
          t.company_name.toLowerCase().includes(inputTicker.toLowerCase())
      ).slice(0, 8)
    : allTickers.slice(0, 8);

  const handleSearch = () => {
    if (inputTicker.trim()) {
      setActiveTicker(inputTicker.toUpperCase());
      setShowSuggestions(false);
    }
  };

  const handleSelect = (ticker: string) => {
    setInputTicker(ticker);
    setActiveTicker(ticker);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Sticky search bar */}
        <div className="sticky top-0 lg:top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex flex-col gap-1 mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ticker Detail</h1>
            <p className="text-sm text-muted-foreground">Look up any tracked stock to see live price, fundamentals, and recent news</p>
          </div>
          <div className="relative max-w-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search ticker or company name…"
                  value={inputTicker}
                  onChange={(e) => {
                    setInputTicker(e.target.value.toUpperCase());
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 font-mono"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Loading…" : "Go"}
              </Button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && filteredTickers.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-12 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-40"
              >
                {filteredTickers.map((t) => (
                  <button
                    key={t.ticker}
                    onClick={() => handleSelect(t.ticker)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 min-h-[44px] text-left hover:bg-muted/50 transition-colors",
                      t.ticker === activeTicker && "bg-primary/5"
                    )}
                  >
                    <span className="ticker-badge text-xs">{t.ticker}</span>
                    <span className="text-sm text-muted-foreground truncate">{t.company_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
            {sellSignal && <SellSignalCard signal={sellSignal} />}
            <FundamentalsCard fundamentals={data.fundamentals} />
            <NewsCard news={data.recentNews} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TickerDetail;
