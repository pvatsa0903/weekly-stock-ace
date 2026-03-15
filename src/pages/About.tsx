import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Brain, 
  Database, 
  BarChart3, 
  Eye, 
  Users, 
  Zap, 
  CheckCircle2, 
  TrendingUp,
  MessageSquare,
  Shield,
  Linkedin,
  Github,
  Globe,
  Activity,
  RefreshCw,
  Target,
  Lightbulb,
  AlertTriangle
} from "lucide-react";

const pipelineSteps = [
  {
    icon: Database,
    title: "Pull the data",
    description: "Every week, the system grabs prices, fundamentals, and social chatter from multiple APIs — Finnhub for the hard numbers, StockTwits for what traders are actually saying, and AI-estimated data for Reddit and X when those APIs don't cooperate.",
    details: ["Finnhub API", "StockTwits stream", "AI-estimated social data"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "Let the AI think",
    description: "Google Gemini reads through news headlines for each ticker and scores them — not just positive/negative, but with a confidence level. It also evaluates existing positions for sell, watch, or hold signals based on 14-day sentiment trends and fundamental deterioration.",
    details: ["Gemini 2.5 Flash Lite", "Weighted multi-source blend", "Sell signal evaluator"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Eye,
    title: "I review everything",
    description: "Every recommendation gets reviewed before it goes live. I check for hallucinations, bias, and whether the AI missed something obvious. The system generates five signal types — PICK, SKIP, SELL, WATCH, and HOLD — each with reasoning and confidence scores.",
    details: ["Override capability", "5 signal types", "Final decision call"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Publish & track",
    description: "Signals go live with confidence scores, rationale, and plain-English ELI5 explanations. The dashboard consolidates everything — weekly picks alongside active sell/watch/hold alerts grouped by priority — with performance tracking and a sentiment-driven \"Vibe Check\" meme that reflects the week's market mood.",
    details: ["Grouped alerts by signal type", "Win/loss tracking", "Vibe Check memes"],
    color: "from-emerald-500 to-green-500",
  },
];

const techStack = [
  { label: "Frontend", value: "React 18 · TypeScript · Tailwind CSS · shadcn/ui" },
  { label: "Backend", value: "Lovable Cloud (Edge Functions + PostgreSQL)" },
  { label: "AI Model", value: "Google Gemini 2.5 Flash Lite via AI Gateway" },
  { label: "Data Sources", value: "Finnhub API · StockTwits API · AI-estimated sentiment" },
  { label: "Scheduling", value: "pg_cron + pg_net → weekly Edge Function triggers" },
  { label: "State", value: "TanStack React Query + Supabase Realtime" },
  { label: "Charts", value: "Recharts (trendlines, heatmaps)" },
  { label: "Build", value: "Vite" },
];

const sentimentWeights = [
  { source: "AI Analysis", weight: "30%", desc: "LLM analysis of news headlines" },
  { source: "Finnhub News", weight: "20%", desc: "Finnhub news sentiment score" },
  { source: "Reddit", weight: "15%", desc: "Social mentions + sentiment" },
  { source: "X (Twitter)", weight: "15%", desc: "Social mentions + sentiment" },
  { source: "StockTwits", weight: "20%", desc: "Real-time trader sentiment" },
];

const About = () => {
  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-4xl">
        {/* Hero — the pitch */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
              What if you only had to look at <span className="text-primary">two stocks</span> a week — and know when to <span className="text-primary">sell</span>?
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              That's the idea behind this project. I built a system that pulls market data from 
              multiple sources, runs it through Google Gemini for AI-powered analysis, and delivers 
              five types of signals — <strong>PICK, SKIP, SELL, WATCH, and HOLD</strong> — with full 
              transparency on <em>why</em> each decision was made.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              It's not a trading bot. It's not financial advice. It's a{" "}
              <span className="text-foreground font-semibold">demonstration of what happens when you 
              combine real data, AI reasoning, and human judgment</span> into a single pipeline — and 
              ship it as a polished, production-quality product.
            </p>
          </div>
        </div>

        {/* The problem */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">The Problem I Wanted to Solve</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Stock tips are everywhere — Reddit, Twitter, Discord, YouTube. Most of them are noise: 
            pump-and-dump schemes, confirmation bias dressed up as research, or just vibes. 
            I wanted to build something that actually <em>thinks</em> about the data before 
            giving you a name. And I wanted it to be honest about its confidence level — 
            no "this is definitely going to moon" energy.
          </p>
        </div>

        {/* What makes it different */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">What makes this different</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Brain, label: "AI does the heavy lifting", desc: "Gemini analyzes news, scores sentiment, evaluates sell signals, and generates structured recommendations across PICK, SKIP, SELL, WATCH, and HOLD categories" },
              { icon: Activity, label: "5 data sources, not 1", desc: "Reddit, X, StockTwits, Finnhub news, and AI analysis — blended with custom weights. When APIs fail, smart fallbacks kick in" },
              { icon: Shield, label: "Nothing is hidden", desc: "Every signal has a confidence %, a rationale, an ELI5 explanation, risk flags, and a full audit trail. The entire decision history is searchable" },
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
        </div>

        {/* Pipeline */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">How it actually works</h2>
            <p className="text-muted-foreground mt-1">Four steps, every week, mostly automated</p>
          </div>

          <div className="space-y-4">
            {pipelineSteps.map((step, i) => (
              <div key={step.title}>
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">0{i + 1}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.details.map((detail) => (
                          <span
                            key={detail}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Scoring */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">How sentiment scores work</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Each ticker's score isn't pulled from one place — it's a weighted blend of five sources. 
            I tuned the weights to favor AI analysis (it's the most consistent) while still giving 
            real social data a meaningful voice:
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Weight</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">What it captures</th>
                </tr>
              </thead>
              <tbody>
                {sentimentWeights.map((row, i) => (
                  <tr key={row.source} className={i !== sentimentWeights.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.source}</td>
                    <td className="px-4 py-3 font-mono text-primary font-bold">{row.weight}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Human-in-the-Loop */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Why I don't let the AI publish alone</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            I've seen AI confidently recommend a stock that was literally being delisted the next 
            day. LLMs are powerful, but they hallucinate, overfit to recent trends, and miss context 
            that any human would catch. So every single pick goes through me first:
          </p>
          <ul className="space-y-2">
            {[
              "The AI generates candidates with scores and rationale — I didn't just ask it to \"pick stocks,\" I gave it a structured scoring framework",
              "I review for bias, factual accuracy, and things the AI can't see (lawsuits, earnings timing, macro context)",
              "I can override confidence scores, swap picks, or skip the week entirely if nothing looks good",
              "Everything — the AI's original output and my final decision — is logged, so there's a full audit trail",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Lessons / Smart Fallbacks */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Prompt engineering is real engineering</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Getting Gemini to output consistent, structured JSON with reliable confidence 
              scores took dozens of iterations. The prompt covers fundamentals (P/E, revenue 
              growth, margins), technical momentum, and social signals — and it enforces 
              machine-parseable output with ELI5 summaries baked in.
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Free APIs break constantly</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Finnhub's free tier returns 403 for social endpoints half the time. Instead of 
              showing zeros or hiding the data, I built smart fallbacks that estimate reasonable 
              values from AI analysis and cross-source data — with floors (Reddit ≥5, X ≥8) 
              so the UI always shows differentiated, meaningful numbers.
            </p>
          </div>
        </div>

        {/* What this demonstrates */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">What this project demonstrates</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This isn't just a dashboard — it's an end-to-end system that I designed, built, 
            and operate. Here's what it touches:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Database, text: "Data engineering — multi-source ingestion, cron-scheduled pipelines, schema design" },
              { icon: Brain, text: "AI integration — prompt engineering, structured output parsing, sell signal evaluation, fallback logic" },
              { icon: Lightbulb, text: "Product thinking — unified dashboard across 5 signal types, prioritized alerts, ticker-specific news filtering" },
              { icon: Shield, text: "Responsible ML — human oversight, audit trails, transparent confidence scores, full decision history" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Under the hood</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {techStack.map((row, i) => (
                  <tr key={row.label} className={i !== techStack.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 sm:px-5 py-3.5 font-semibold text-foreground w-28 sm:w-40">{row.label}</td>
                    <td className="px-4 sm:px-5 py-3.5 text-muted-foreground font-mono text-xs">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            <strong className="text-foreground">Disclaimer:</strong> This is a portfolio project, not financial advice. 
            The picks are generated for demonstration purposes and should not be used as the basis for 
            any investment decisions. Always do your own research.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 sm:p-6 lg:p-8 text-center space-y-4">
          <TrendingUp className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Built by Phalguni Vatsa</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            I build things that work. If you're hiring someone who thinks about the problem 
            before writing the code — let's talk.
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 flex-wrap">
            <a
              href="https://weekly-stock-ace.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Globe className="w-4 h-4" />
              Live App
            </a>
            <a
              href="https://www.linkedin.com/in/phalgunivatsa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity border border-border"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="https://github.com/pvatsa0903"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity border border-border"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default About;
