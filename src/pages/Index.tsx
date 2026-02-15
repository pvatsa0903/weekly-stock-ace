import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LiveWeeklyBanner } from "@/components/dashboard/LiveWeeklyBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveRecentPicks } from "@/components/dashboard/LiveRecentPicks";
import { SentimentMovers } from "@/components/dashboard/SentimentMovers";
import { Target, TrendingUp, BarChart3, Calendar } from "lucide-react";

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday as start
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Overview</h1>
          <p className="text-muted-foreground">Week of {getWeekStart()}</p>
        </div>

        {/* This Week's Picks - Live Data */}
        <div className="grid lg:grid-cols-2 gap-4">
          <LiveWeeklyBanner ticker="NVDA" />
          <LiveWeeklyBanner ticker="TSLA" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Win Rate"
            value="73%"
            subtitle="Last 12 weeks"
            icon={Target}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Avg Return"
            value="+12.4%"
            subtitle="Per pick"
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatCard
            title="Total Picks"
            value="48"
            subtitle="This year"
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
