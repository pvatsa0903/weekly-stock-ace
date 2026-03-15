import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
  open: number;
  decision: "PICK" | "SKIP";
  confidence: number;
  eli5: string;
  sentiment: {
    overall: number;
    social: number;
    news: number;
    analyst: number;
  };
  fundamentals: {
    peRatio: string;
    marketCap: string;
    eps: string;
    dividend: string;
    beta: string;
    high52w: string;
    low52w: string;
  };
  recentNews: {
    title: string;
    summary: string;
    sentiment: "positive" | "negative" | "neutral";
    date: string;
    url: string;
    source: string;
  }[];
  logo?: string;
  industry?: string;
  candles?: { date: string; close: number }[];
}

async function fetchStockData(symbol: string): Promise<StockData> {
  const { data, error } = await supabase.functions.invoke("stock-data", {
    body: { symbol },
  });

  if (error) {
    console.error("Error fetching stock data:", error);
    throw new Error(error.message || "Failed to fetch stock data");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export function useStockData(symbol: string | null) {
  return useQuery({
    queryKey: ["stock", symbol],
    queryFn: () => fetchStockData(symbol!),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useMultipleStocks(symbols: string[]) {
  return useQuery({
    queryKey: ["stocks", symbols.join(",")],
    queryFn: async () => {
      const results = await Promise.allSettled(
        symbols.map((symbol) => fetchStockData(symbol))
      );
      return results.map((result, index) => ({
        symbol: symbols[index],
        data: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason.message : null,
      }));
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
