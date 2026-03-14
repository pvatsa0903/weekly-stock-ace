import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LiveWeeklyBanner } from "@/components/dashboard/LiveWeeklyBanner";
import { SellAlertsBanner } from "@/components/dashboard/SellAlertsBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveRecentPicks } from "@/components/dashboard/LiveRecentPicks";
import { SentimentMovers } from "@/components/dashboard/SentimentMovers";
import { Target, TrendingUp, BarChart3, Calendar, Bot, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Weekly Overview</h1>
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

        {/* This Week's Picks - Live Data */}
        {weeklyPicks?.pick1 && weeklyPicks?.pick2 && (() => {
          const eli5Parts = weeklyPicks.eli5_summary?.split(" | ") || [];
          const whyParts = weeklyPicks.why_summary?.split(" | ") || [];
          return (
            <div className="grid md:grid-cols-2 gap-4">
              <LiveWeeklyBanner
                ticker={weeklyPicks.pick1}
                aiDecision={weeklyPicks.decision}
                aiConfidence={weeklyPicks.pick1_confidence ?? undefined}
                aiEli5={eli5Parts[0]}
                aiWhy={whyParts[0] || weeklyPicks.why_summary}
              />
              <LiveWeeklyBanner
                ticker={weeklyPicks.pick2}
                aiDecision={weeklyPicks.decision}
                aiConfidence={weeklyPicks.pick2_confidence ?? undefined}
                aiEli5={eli5Parts[1]}
                aiWhy={whyParts[1] || weeklyPicks.why_summary}
              />
            </div>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            title="Total Picks"
            value={stats?.total ?? "—"}
            subtitle="All time"
            icon={BarChart3}
            tooltip="Total number of stocks the AI has recommended since launch"
          />
          <StatCard
            title="Next Update"
            value={nextUpdate.value}
            subtitle={nextUpdate.label}
            icon={Calendar}
            tooltip="New picks are generated every week after fresh data is pulled"
          />
        </div>

        {/* Sentiment Movers + Market Watch */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SentimentMovers />
          <div className="md:col-span-1 lg:col-span-2">
            <LiveRecentPicks />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
