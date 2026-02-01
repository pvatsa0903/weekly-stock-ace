import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LiveWeeklyBanner } from "@/components/dashboard/LiveWeeklyBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveRecentPicks } from "@/components/dashboard/LiveRecentPicks";
import { Target, TrendingUp, BarChart3, Calendar } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Overview</h1>
          <p className="text-muted-foreground">Week of January 27, 2025</p>
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
            value="5 days"
            subtitle="Sunday, Feb 2"
            icon={Calendar}
          />
        </div>

        {/* Market Watch - Live Data */}
        <LiveRecentPicks />
      </div>
    </DashboardLayout>
  );
};

export default Index;
