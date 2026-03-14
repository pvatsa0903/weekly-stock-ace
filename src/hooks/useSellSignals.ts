import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface SellSignal {
  id: string;
  ticker: string;
  signal: "SELL" | "WATCH" | "HOLD";
  confidence: number;
  reasoning: string;
  sentiment_score: number | null;
  sentiment_change: number | null;
  fundamental_flags: string | null;
  price_at_signal: number | null;
  is_active: boolean;
  created_at: string;
  resolved_at: string | null;
}

export function useSellSignals(activeOnly = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("sell_signals_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sell_signals" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sell_signals"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["sell_signals", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("sell_signals")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SellSignal[];
    },
  });
}

export function useSellSignalForTicker(ticker: string | null) {
  return useQuery({
    queryKey: ["sell_signal_ticker", ticker],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sell_signals")
        .select("*")
        .eq("ticker", ticker!)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SellSignal | null;
    },
    enabled: !!ticker,
  });
}
