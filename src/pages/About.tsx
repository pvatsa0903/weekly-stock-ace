import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Brain, 
  Database, 
  BarChart3, 
  Eye, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp,
  MessageSquare,
  Shield,
  Cpu,
  Linkedin,
  Github,
  Globe,
  Activity,
  RefreshCw
} from "lucide-react";

const pipelineSteps = [
  {
    icon: Database,
    title: "Data Ingestion",
    description: "Market data, fundamentals, and social sentiment are pulled from multiple sources weekly via automated cron jobs.",
    details: ["Finnhub API (prices, fundamentals)", "StockTwits real-time stream", "AI-estimated Reddit & X data"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Sentiment Analysis",
    description: "Google Gemini analyzes news headlines per ticker and generates sentiment scores with confidence levels.",
    details: ["Gemini 2.5 Flash Lite via AI Gateway", "Multi-source weighted blend", "Smart fallbacks when APIs fail"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Eye,
    title: "Human-in-the-Loop Review",
    description: "Every AI recommendation is reviewed before publication — ensuring quality and catching hallucinations or bias.",
    details: ["Override capability", "Bias & hallucination checks", "Final PICK / SKIP decision"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Weekly Publication",
    description: "Two picks are published with confidence scores, rationale, and ELI5 summaries. Performance tracking begins automatically.",
    details: ["Automated dashboard update", "Win/loss tracking begins", "Historical audit trail"],
    color: "from-emerald-500 to-green-500",
  },
];

const techStack = [
  { label: "Frontend", value: "React 18 · TypeScript · Tailwind CSS · shadcn/ui" },
  { label: "Backend", value: "Lovable Cloud (Edge Functions + PostgreSQL)" },
  { label: "AI Model", value: "Google Gemini 2.5 Flash Lite via AI Gateway" },
  { label: "Data Sources", value: "Finnhub API · StockTwits API · AI-estimated sentiment" },
  { label: "Scheduling", value: "pg_cron + pg_net → Edge Function triggers (weekly)" },
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
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              <Cpu className="w-3.5 h-3.5" />
              AI-Powered · Full-Stack · Real Data
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
              2-Stock Shortlist
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              An end-to-end{" "}
              <span className="text-foreground font-semibold">AI-driven stock recommendation engine</span>{" "}
              that ingests market data from multiple sources, processes it through Google Gemini, 
              and surfaces two actionable weekly picks — with{" "}
              <span className="text-foreground font-semibold">multi-source sentiment analysis</span>{" "}
              and a{" "}
              <span className="text-foreground font-semibold">human-in-the-loop</span>{" "}
              review step.
            </p>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Brain, label: "AI-First", desc: "Gemini-powered analysis with custom prompt engineering and structured output" },
            { icon: Activity, label: "Multi-Source", desc: "Reddit, X, StockTwits, and news — with smart AI-estimated fallbacks" },
            { icon: Shield, label: "Transparent", desc: "Full audit trail, confidence scores, and ELI5 explanations" },
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

        {/* Pipeline Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-1">The pipeline from raw data to actionable picks</p>
          </div>

          <div className="space-y-4">
            {pipelineSteps.map((step, i) => (
              <div key={step.title} className="relative">
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

                    {i < pipelineSteps.length - 1 && (
                      <div className="hidden lg:flex items-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
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
            <h2 className="text-xl font-bold text-foreground">Sentiment Scoring Model</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Each ticker's overall sentiment score is a weighted blend of 5 data sources:
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Weight</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">Description</th>
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
            <h2 className="text-xl font-bold text-foreground">Human-in-the-Loop</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Pure AI systems can hallucinate, overfit to recent trends, or miss qualitative 
            context. This project implements a deliberate review gate:
          </p>
          <ul className="space-y-2">
            {[
              "AI generates candidate picks with rationale and confidence scores",
              "Human analyst reviews for bias, factual accuracy, and market context",
              "Analyst can override, adjust confidence, or reject picks entirely",
              "All decisions (AI and human) are logged for transparency and backtesting",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground italic">
            This mirrors enterprise ML deployment patterns where responsible AI practices 
            require human oversight before automated decisions reach end users.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Technical Architecture</h2>
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

        {/* Prompt Engineering Note */}
        <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Prompt Engineering</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The AI model uses a carefully crafted system prompt with multi-factor scoring 
            criteria covering fundamentals (P/E, revenue growth, margins), technical momentum, 
            and social sentiment signals. The prompt enforces structured JSON output with ticker 
            symbols, PICK/SKIP decisions, confidence percentages, and ELI5 summaries — ensuring 
            both machine-parseability and human readability.
          </p>
        </div>

        {/* Smart Fallbacks */}
        <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Smart Fallbacks</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Finnhub's free tier often returns 403 for social endpoints. Instead of showing 
            zeros or defaulting to 50, the system estimates mention counts from AI analysis 
            and cross-source data — with reasonable floors (Reddit ≥5, X ≥8) to ensure the 
            UI always displays meaningful, differentiated values.
          </p>
        </div>

        {/* CTA / Contact */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 sm:p-6 lg:p-8 text-center space-y-4">
          <TrendingUp className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Built by Phalguni Vatsa</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            This project showcases end-to-end product thinking: data engineering, 
            AI integration, full-stack development, and responsible ML deployment — 
            all in a polished, production-quality interface.
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
