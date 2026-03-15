import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Brain,
  Database,
  BarChart3,
  Eye,
  Zap,
  CheckCircle2,
  TrendingUp,
  Shield,
  Linkedin,
  Github,
  Globe,
  Activity,
} from "lucide-react";

const pipelineSteps = [
  {
    icon: Database,
    title: "Pull data",
    desc: "Prices, fundamentals, and social sentiment from Finnhub, StockTwits, and AI-estimated sources for Reddit and X.",
    tags: ["Finnhub API", "StockTwits", "AI-estimated social"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI analysis",
    desc: "Google Gemini scores news headlines, evaluates positions against 14-day sentiment trends, and generates structured PICK / SKIP / SELL / WATCH / HOLD signals.",
    tags: ["Gemini 2.5 Flash Lite", "Multi-source blend", "Sell evaluator"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Eye,
    title: "Human review",
    desc: "Every signal is checked for hallucinations, bias, and missed context. Confidence scores can be overridden, and the week can be skipped entirely.",
    tags: ["Override capability", "Audit trail", "Final call"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Publish & track",
    desc: "Signals go live with confidence scores, rationale, and ELI5 explanations. Performance is tracked over time with win/loss metrics.",
    tags: ["Confidence scores", "Win/loss tracking", "ELI5 summaries"],
    color: "from-emerald-500 to-green-500",
  },
];

const sentimentWeights = [
  { source: "AI Analysis", weight: "30%", desc: "LLM analysis of news headlines" },
  { source: "Finnhub News", weight: "20%", desc: "Finnhub news sentiment score" },
  { source: "Reddit", weight: "15%", desc: "Social mentions + sentiment" },
  { source: "X (Twitter)", weight: "15%", desc: "Social mentions + sentiment" },
  { source: "StockTwits", weight: "20%", desc: "Real-time trader sentiment" },
];

const techStack = [
  { label: "Frontend", value: "React 18 · TypeScript · Tailwind CSS · shadcn/ui" },
  { label: "Backend", value: "Lovable Cloud (Edge Functions + PostgreSQL)" },
  { label: "AI", value: "Google Gemini 2.5 Flash Lite via AI Gateway" },
  { label: "Data", value: "Finnhub API · StockTwits API · AI-estimated sentiment" },
  { label: "Scheduling", value: "pg_cron + pg_net → weekly triggers" },
  { label: "State", value: "TanStack React Query + Supabase Realtime" },
  { label: "Charts", value: "Recharts" },
  { label: "Build", value: "Vite" },
];

const About = () => {
  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-4xl">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            Two picks a week. <span className="text-primary">Full transparency.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            StockPulse pulls market data from 5 sources, runs it through AI, and delivers
            actionable signals — <strong className="text-foreground">PICK, SKIP, SELL, WATCH, HOLD</strong> —
            with confidence scores and plain-English reasoning for every decision.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Not a trading bot. Not financial advice. A demonstration of real data + AI reasoning + human judgment, shipped as a production-quality product.
          </p>
        </div>

        {/* What makes it different */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Brain, label: "AI-powered signals", desc: "Gemini analyzes headlines, scores sentiment, evaluates sell conditions, and generates structured recommendations with confidence levels" },
            { icon: Activity, label: "5 data sources", desc: "Reddit, X, StockTwits, Finnhub news, and AI analysis — blended with custom weights. Smart fallbacks when APIs fail" },
            { icon: Shield, label: "Nothing hidden", desc: "Every signal has a confidence %, rationale, ELI5 summary, and risk flags. The full decision history is searchable" },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">How it works</h2>
            <p className="text-sm text-muted-foreground mt-1">Four steps, every week, mostly automated</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {pipelineSteps.map((step, i) => (
              <div key={step.title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">0{i + 1}</span>
                      <h3 className="font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {step.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Scoring */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Sentiment scoring
          </h2>
          <p className="text-sm text-muted-foreground">
            Each ticker's score is a weighted blend of five sources, tuned to favor AI analysis for consistency while giving real social data meaningful weight.
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-semibold text-foreground">Source</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-foreground">Weight</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-foreground hidden sm:table-cell">Captures</th>
                </tr>
              </thead>
              <tbody>
                {sentimentWeights.map((row, i) => (
                  <tr key={row.source} className={i !== sentimentWeights.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-2.5 font-medium text-foreground">{row.source}</td>
                    <td className="px-4 py-2.5 font-mono text-primary font-bold">{row.weight}</td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Tech stack</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {techStack.map((row, i) => (
                  <tr key={row.label} className={i !== techStack.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 font-semibold text-foreground w-24 sm:w-32">{row.label}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Author + Disclaimer */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 text-center space-y-4">
          <TrendingUp className="w-7 h-7 text-primary mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Built by Phalguni Vatsa</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            End-to-end — data engineering, AI integration, product design, and deployment. If you're hiring someone who thinks about the problem before writing code, let's talk.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://weekly-stock-ace.lovable.app" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Globe className="w-4 h-4" /> Live App
            </a>
            <a href="https://www.linkedin.com/in/phalgunivatsa/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity border border-border">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a href="https://github.com/pvatsa0903" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity border border-border">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border mt-4">
            <strong className="text-foreground">Disclaimer:</strong> Portfolio project, not financial advice. Picks are for demonstration purposes only.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default About;
