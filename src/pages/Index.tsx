import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeeklyBanner } from "@/components/dashboard/WeeklyBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPicks } from "@/components/dashboard/RecentPicks";
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

        {/* This Week's Banner - Stock 1 */}
        <div className="grid lg:grid-cols-2 gap-4">
          <WeeklyBanner
            ticker="NVDA"
            decision="PICK"
            confidence={87}
            eli5="NVIDIA is like the company that makes the best gaming graphics cards, but now everyone wants them for AI robots and smart computers. They're selling so many that they can't make them fast enough!"
          />
          <WeeklyBanner
            ticker="TSLA"
            decision="SKIP"
            confidence={72}
            eli5="Tesla makes cool electric cars, but right now they're having a tough time. Other companies are making similar cars, and people are buying fewer expensive things. It's like when too many ice cream shops open on the same street."
          />
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

        {/* Recent Picks */}
        <RecentPicks />
      </div>
    </DashboardLayout>
  );
};

export default Index;
