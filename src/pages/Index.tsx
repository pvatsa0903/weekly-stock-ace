import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LiveWeeklyBanner } from "@/components/dashboard/LiveWeeklyBanner";
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
    toast.info("Refreshing market data…");
    try {
      const { data, error } = await supabase.functions.invoke("refresh-data");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Refreshed ${data.tickers} tickers, ${data.sentiment} sentiment, ${data.discovered || 0} discovered`);
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
        .select("pick1, pick2, decision, eli5_summary, why_summary")
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Overview</h1>
          <p className="text-muted-foreground">Week of {getWeekStart()}</p>
        </div>

        {/* This Week's Picks - Live Data */}
        {weeklyPicks?.pick1 && weeklyPicks?.pick2 && (() => {
          const eli5Parts = weeklyPicks.eli5_summary?.split(" | ") || [];
          return (
            <div className="grid lg:grid-cols-2 gap-4">
              <LiveWeeklyBanner
                ticker={weeklyPicks.pick1}
                aiDecision={weeklyPicks.decision}
                aiConfidence={undefined}
                aiEli5={eli5Parts[0]}
              />
              <LiveWeeklyBanner
                ticker={weeklyPicks.pick2}
                aiDecision={weeklyPicks.decision}
                aiConfidence={undefined}
                aiEli5={eli5Parts[1]}
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
            trend={stats && stats.winRate >= 50 ? { value: stats.winRate - 50, isPositive: true } : undefined}
          />
          <StatCard
            title="Avg Return"
            value={stats ? `${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn}%` : "—"}
            subtitle="Per pick"
            icon={TrendingUp}
            trend={stats ? { value: Math.abs(stats.avgReturn), isPositive: stats.avgReturn >= 0 } : undefined}
          />
          <StatCard
            title="Total Picks"
            value={stats?.total ?? "—"}
            subtitle="All time"
            icon={BarChart3}
          />
          <StatCard
            title="Next Update"
            value={nextUpdate.value}
            subtitle={nextUpdate.label}
            icon={Calendar}
          />
        </div>

        {/* Sentiment Movers + Market Watch */}
        <div className="grid lg:grid-cols-3 gap-4">
          <SentimentMovers />
          <div className="lg:col-span-2">
            <LiveRecentPicks />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
