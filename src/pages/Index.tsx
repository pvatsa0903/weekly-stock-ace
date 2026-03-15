import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuggestionCard, type SuggestionType } from "@/components/dashboard/SuggestionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveRecentPicks } from "@/components/dashboard/LiveRecentPicks";
import { SentimentMovers } from "@/components/dashboard/SentimentMovers";
import { SentimentMeme } from "@/components/dashboard/SentimentMeme";
import { Target, TrendingUp, Bot, RefreshCw, ShieldAlert, Calendar, BarChart3 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useSellSignals } from "@/hooks/useSellSignals";

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const getNextSunday = () => {
  const now = new Date();
  const day = now.getDay();
  const daysUntil = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntil);
  const label = sunday.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  if (daysUntil === 0) return { value: "Today", label };
  if (daysUntil === 1) return { value: "Tomorrow", label };
  return { value: `${daysUntil} days`, label };
};

interface Suggestion {
  ticker: string;
  type: SuggestionType;
  confidence?: number;
  why?: string;
  eli5?: string;
  priority: number; // lower = higher priority
}

const Index = () => {
  const nextUpdate = getNextSunday();
  const queryClient = useQueryClient();
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runAIPicker = async () => {
    setIsRunningAI(true);
    toast.info("Running AI Stock Picker…");
    try {
      const { data, error } = await supabase.functions.invoke("ai-stock-picker");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`AI Picker done — ${data.decision}: ${[data.pick1, data.pick2].filter(Boolean).join(", ") || "No picks"}`);
      queryClient.invalidateQueries({ queryKey: ["weekly_picks"] });
    } catch (err: any) {
      toast.error(err.message || "AI Picker failed");
    } finally {
      setIsRunningAI(false);
    }
  };

  const runDataRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing market data in batches…");
    try {
      let totalTickers = 0, totalSentiment = 0;
      for (let offset = 0; offset < 60; offset += 10) {
        const { data, error } = await supabase.functions.invoke("refresh-data", {
          body: { offset, limit: 10, skipDiscovery: offset > 0 },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        totalTickers += data.tickers || 0;
        totalSentiment += data.sentiment || 0;
      }
      toast.success(`Refreshed ${totalTickers} tickers, ${totalSentiment} sentiment records`);
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Data refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch weekly decisions
  const { data: weeklyPicks } = useQuery({
    queryKey: ["weekly_picks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("pick1, pick2, decision, eli5_summary, why_summary, pick1_confidence, pick2_confidence")
        .order("week_ending", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch sell signals
  const { data: sellSignals = [] } = useSellSignals(true);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["pick_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pick_performance")
        .select("*");
      if (error) throw error;

      const total = data.length;
      const wins = data.filter((d) => d.is_win).length;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      const avgReturn = total > 0
        ? (data.reduce((sum, d) => sum + Number(d.return_pct), 0) / total).toFixed(1)
        : "0.0";

      return { winRate, avgReturn: Number(avgReturn), total };
    },
  });

  // Build unified suggestions ranked by priority
  // Priority: SELL (1) > PICK (2) > WATCH (3) > HOLD (4) > SKIP (5)
  const sellEli5Templates = [
    (t: string) => `Uh oh — ${t} is not looking so great right now! 🚨 The grown-ups who watch money stuff are worried, so we think it's time to say bye-bye and sell it before it gets worse! 👋💸`,
    (t: string) => `${t} is like a sandcastle that's starting to wash away 🏖️🌊 — we had fun, but it's time to pack up and go home before the tide takes everything!`,
    (t: string) => `Yikes! ${t} is acting like a balloon slowly losing air 🎈💨 — the smart thing to do is let go before it goes totally flat!`,
  ];
  const watchEli5Templates = [
    (t: string) => `Hmm, ${t} is being a little sneaky 👀 — we're not sure if it's gonna be good or bad yet! We're watching it super carefully, like a cat watching a fish tank 🐱🐟`,
    (t: string) => `${t} is like a mystery box 🎁❓ — could be awesome, could be meh. We're peeking through the keyhole to figure it out before we open it!`,
    (t: string) => `${t} is sitting on the fence right now 🤔🧐 — not jumping left or right. We'll keep an eye on it like a lifeguard at the pool! 🏊`,
  ];
  const holdEli5Templates = [
    (t: string) => `${t} is doing okay — like getting a B+ on a test! 📚✨ Not amazing, not terrible. We're holding onto it like your favorite stuffed animal! 🧸`,
    (t: string) => `${t} is cruising along nicely, like a bike ride on a flat road 🚲😎 — no hills, no bumps, just keep pedaling!`,
    (t: string) => `${t} is like a plant that's growing steady 🌱☀️ — we just need to keep watering it and be patient. No need to pull it out of the ground!`,
  ];

  const pickTemplate = (templates: ((t: string) => string)[], ticker: string) => {
    // Use ticker charCode sum as a stable seed so each ticker always gets the same message
    const seed = ticker.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return templates[seed % templates.length](ticker);
  };

  const suggestions: Suggestion[] = [];

  // Add sell/watch/hold signals
  sellSignals.forEach((s) => {
    const priorityMap: Record<string, number> = { SELL: 1, WATCH: 3, HOLD: 4 };
    const eli5 = s.signal === "SELL"
      ? pickTemplate(sellEli5Templates, s.ticker)
      : s.signal === "WATCH"
      ? pickTemplate(watchEli5Templates, s.ticker)
      : pickTemplate(holdEli5Templates, s.ticker);
    suggestions.push({
      ticker: s.ticker,
      type: s.signal as SuggestionType,
      confidence: s.confidence,
      why: s.reasoning,
      eli5,
      priority: priorityMap[s.signal] ?? 5,
    });
  });

  // Add weekly picks
  if (weeklyPicks) {
    const eli5Parts = weeklyPicks.eli5_summary?.split(" | ") || [];
    const whyParts = weeklyPicks.why_summary?.split(" | ") || [];
    const decision = weeklyPicks.decision as SuggestionType;

    if (weeklyPicks.pick1) {
      suggestions.push({
        ticker: weeklyPicks.pick1,
        type: decision,
        confidence: weeklyPicks.pick1_confidence ?? undefined,
        why: whyParts[0] || weeklyPicks.why_summary,
        eli5: eli5Parts[0],
        priority: decision === "PICK" ? 2 : 5,
      });
    }
    if (weeklyPicks.pick2) {
      suggestions.push({
        ticker: weeklyPicks.pick2,
        type: decision,
        confidence: weeklyPicks.pick2_confidence ?? undefined,
        why: whyParts[1] || weeklyPicks.why_summary,
        eli5: eli5Parts[1],
        priority: decision === "PICK" ? 2 : 5,
      });
    }
  }

  // Sort by priority, dedupe by ticker (keep highest priority), take top 2
  const seen = new Set<string>();
  const topSuggestions = suggestions
    .sort((a, b) => a.priority - b.priority)
    .filter((s) => {
      if (seen.has(s.ticker)) return false;
      seen.add(s.ticker);
      return true;
    })
    .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Week of {getWeekStart()}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={runDataRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing…" : "Refresh Data"}
            </Button>
            <Button
              size="sm"
              onClick={runAIPicker}
              disabled={isRunningAI}
            >
              <Bot className={`h-4 w-4 mr-2 ${isRunningAI ? "animate-pulse" : ""}`} />
              {isRunningAI ? "Running…" : "Run AI Picker"}
            </Button>
          </div>
        </div>

        {/* Top 2 Suggestions */}
        {topSuggestions.length > 0 && (
          <div className={`grid gap-4 ${topSuggestions.length === 2 ? "md:grid-cols-2" : ""}`}>
            {topSuggestions.map((s) => (
              <SuggestionCard
                key={s.ticker}
                ticker={s.ticker}
                type={s.type}
                confidence={s.confidence}
                why={s.why}
                eli5={s.eli5}
              />
            ))}
          </div>
        )}

        {/* Performance Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Performance Snapshot</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Signals"
              value={sellSignals.length || "—"}
              subtitle={`${sellSignals.filter(s => s.signal === "SELL").length} sell · ${sellSignals.filter(s => s.signal === "WATCH").length} watch · ${sellSignals.filter(s => s.signal === "HOLD").length} hold`}
              icon={ShieldAlert}
              tooltip="Total active sell, watch, and hold signals being tracked"
            />
            <StatCard
              title="Win Rate"
              value={stats ? `${stats.winRate}%` : "—"}
              subtitle="All time"
              icon={Target}
              tooltip="Percentage of AI picks that ended higher than their entry price"
              trend={stats && stats.winRate >= 50 ? { value: stats.winRate - 50, isPositive: true } : undefined}
            />
            <StatCard
              title="Avg Return"
              value={stats ? `${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn}%` : "—"}
              subtitle="Per pick"
              icon={TrendingUp}
              tooltip="Average price change from entry to exit across all picks"
              trend={stats ? { value: Math.abs(stats.avgReturn), isPositive: stats.avgReturn >= 0 } : undefined}
            />
            <StatCard
              title="Next Update"
              value={nextUpdate.value}
              subtitle={nextUpdate.label}
              icon={Calendar}
              tooltip="New picks and signals are generated every week after fresh data is pulled"
            />
          </div>
        </div>

        {/* Vibe Check — compact accent between stats and data */}
        <SentimentMeme />

        {/* Sentiment Movers + Market Watch */}
        <div className="grid md:grid-cols-2 gap-4">
          <SentimentMovers />
          <LiveRecentPicks />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
