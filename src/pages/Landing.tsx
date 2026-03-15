import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSellSignals } from "@/hooks/useSellSignals";
import {
  TrendingUp,
  Target,
  ShieldAlert,
  ArrowRight,
  BarChart3,
  Brain,
  Zap,
  Eye,
} from "lucide-react";

const Landing = () => {
  const { data: sellSignals = [] } = useSellSignals(true);
  const { data: stats } = useQuery({
    queryKey: ["pick_stats_landing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pick_performance").select("*");
      if (error) throw error;
      const total = data.length;
      const wins = data.filter((d) => d.is_win).length;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      const avgReturn = total > 0 ? (data.reduce((sum, d) => sum + Number(d.return_pct), 0) / total).toFixed(1) : "0.0";
      return { winRate, avgReturn: Number(avgReturn), total };
    },
  });

  const { data: latestPick } = useQuery({
    queryKey: ["latest_pick_landing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("pick1, pick2, decision")
        .order("week_ending", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const sellCount = sellSignals.filter((s) => s.signal === "SELL").length;
  const watchCount = sellSignals.filter((s) => s.signal === "WATCH").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">StockPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about">
              <Button variant="ghost" size="sm">About</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered · Updated Weekly
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
              Two stock picks a week.
              <br />
              <span className="text-primary">Zero noise.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              StockPulse pulls data from 5 sources, runs it through Google Gemini,
              and tells you what to <strong className="text-foreground">buy</strong>,
              what to <strong className="text-foreground">watch</strong>,
              and when to <strong className="text-foreground">sell</strong> —
              with full transparency on every decision.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Explore the Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: Target,
                label: "Win Rate",
                value: stats ? `${stats.winRate}%` : "—",
                sub: `${stats?.total ?? 0} picks tracked`,
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: TrendingUp,
                label: "Avg Return",
                value: stats ? `+${stats.avgReturn}%` : "—",
                sub: "Per pick, all time",
                color: "text-cyan-500 bg-cyan-500/10",
              },
              {
                icon: ShieldAlert,
                label: "Active Signals",
                value: sellSignals.length || "—",
                sub: `${sellCount} sell · ${watchCount} watch`,
                color: "text-rose-500 bg-rose-500/10",
              },
              {
                icon: BarChart3,
                label: "This Week",
                value: latestPick?.decision === "PICK"
                  ? [latestPick.pick1, latestPick.pick2].filter(Boolean).join(" & ")
                  : latestPick?.decision ?? "—",
                sub: latestPick?.decision === "PICK" ? "Current picks" : "No picks this week",
                color: "text-violet-500 bg-violet-500/10",
              },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <div>
                  <p className="text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four steps, every week, mostly automated
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BarChart3, step: "01", title: "Pull data", desc: "Prices, fundamentals, and social sentiment from Finnhub, StockTwits, and AI-estimated sources", color: "from-blue-500 to-cyan-500" },
            { icon: Brain, step: "02", title: "AI analysis", desc: "Google Gemini scores sentiment, evaluates positions, and generates structured recommendations", color: "from-violet-500 to-purple-500" },
            { icon: Eye, step: "03", title: "Human review", desc: "Every signal is reviewed for hallucinations, bias, and missed context before going live", color: "from-amber-500 to-orange-500" },
            { icon: Zap, step: "04", title: "Publish", desc: "5 signal types go live — PICK, SKIP, SELL, WATCH, HOLD — with confidence scores and ELI5 summaries", color: "from-emerald-500 to-green-500" },
          ].map((s) => (
            <div key={s.step} className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/30 transition-colors">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-mono text-muted-foreground">{s.step}</span>
                <h3 className="text-lg font-bold text-foreground mt-1">{s.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            See what the AI picked this week
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No signup required. Explore every decision, signal, and data point — fully transparent.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-base px-10">
              Open Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>StockPulse · Built by Phalguni Vatsa · Not financial advice</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/alerts" className="hover:text-foreground transition-colors">Alerts</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
