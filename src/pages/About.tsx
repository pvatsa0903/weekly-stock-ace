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
  Cpu
} from "lucide-react";

const pipelineSteps = [
  {
    icon: Database,
    title: "Data Ingestion",
    description: "Market data, fundamentals, and social sentiment are pulled from multiple sources daily.",
    details: ["Price & volume data", "Revenue, margins, P/E ratios", "Reddit & X sentiment scores"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Analysis Engine",
    description: "A large language model processes all data points with a custom-engineered prompt to evaluate each stock.",
    details: ["Multi-factor scoring model", "Sentiment-aware reasoning", "ELI5 explanations generated"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Eye,
    title: "Human-in-the-Loop Review",
    description: "Every AI recommendation is reviewed by a human analyst before publication — ensuring quality and accountability.",
    details: ["Override capability", "Bias & hallucination checks", "Final PICK / SKIP decision"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Weekly Publication",
    description: "The final two picks are published to the dashboard with confidence scores, rationale, and plain-English summaries.",
    details: ["Automated dashboard update", "Performance tracking begins", "Historical audit trail"],
    color: "from-emerald-500 to-green-500",
  },
];

const techStack = [
  { label: "Frontend", value: "React + TypeScript + Tailwind CSS" },
  { label: "Backend", value: "Lovable Cloud (Edge Functions + PostgreSQL)" },
  { label: "AI Model", value: "LLM via AI Gateway (custom prompt engineering)" },
  { label: "Data Pipeline", value: "Scheduled cron → Edge Function → Database" },
  { label: "Visualization", value: "Recharts + custom sentiment heatmaps" },
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
              AI-Powered Prototype
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
              An AI-Driven Stock<br />
              Recommendation Engine
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              This prototype demonstrates an end-to-end{" "}
              <span className="text-foreground font-semibold">machine learning pipeline</span>{" "}
              that ingests market data, processes it through a large language model, 
              and surfaces actionable stock picks — with a{" "}
              <span className="text-foreground font-semibold">human-in-the-loop</span>{" "}
              review step to ensure quality and accountability.
            </p>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Brain, label: "AI-First", desc: "LLM-powered analysis with custom prompt engineering" },
            { icon: Users, label: "Human Oversight", desc: "Every pick reviewed before publication" },
            { icon: Shield, label: "Transparent", desc: "Full audit trail with confidence scores" },
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
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-5">
                    {/* Step number + icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          0{i + 1}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
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

                    {/* Arrow connector */}
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

        {/* Human-in-the-Loop Deep Dive */}
        <div className="bg-card border border-border rounded-xl p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Human-in-the-Loop: Why It Matters</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Pure AI systems can hallucinate, overfit to recent trends, or miss qualitative 
            context that a human analyst would catch. This prototype implements a deliberate 
            review gate where:
          </p>
          <ul className="space-y-2">
            {[
              "The AI generates candidate picks with rationale and confidence scores",
              "A human analyst reviews for bias, factual accuracy, and market context",
              "The analyst can override, adjust confidence, or reject picks entirely",
              "All decisions (human and AI) are logged for transparency and backtesting",
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
                    <td className="px-5 py-3.5 font-semibold text-foreground w-40">{row.label}</td>
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prompt Engineering Note */}
        <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Prompt Engineering</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The AI model is guided by a carefully crafted system prompt that includes 
            multi-factor scoring criteria covering fundamentals (P/E, revenue growth, margins), 
            technical momentum, and social sentiment signals. The prompt instructs the model 
            to produce structured JSON output with ticker symbols, PICK/SKIP decisions, 
            confidence percentages, and plain-English ELI5 summaries — ensuring the output 
            is both machine-parseable and human-readable.
          </p>
        </div>

        {/* CTA / Contact */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 lg:p-8 text-center space-y-3">
          <TrendingUp className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Built as a Portfolio Prototype</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            This project showcases end-to-end product thinking: data engineering, 
            AI integration, full-stack development, and responsible ML deployment — 
            all in a polished, production-quality interface.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default About;
