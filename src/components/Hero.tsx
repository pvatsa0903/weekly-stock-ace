import { ArrowRight, TrendingUp, Shield, Clock } from "lucide-react";
import { Button } from "./ui/button";

export const Hero = () => {
  return (
    <section className="relative pt-20 pb-16 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">Updated Every Sunday</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your Weekly
            <br />
            <span className="text-gradient-gold">2-Stock</span> Shortlist
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Cut through the noise. Every week, we analyze hundreds of stocks to bring you just two high-conviction picks with the best risk-reward potential.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl">
              See This Week's Picks
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              How It Works
            </Button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">68% Hit Rate</p>
              <p className="text-xs text-muted-foreground">12-month track record</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Risk Analyzed</p>
              <p className="text-xs text-muted-foreground">Downside protection focus</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">5-Min Read</p>
              <p className="text-xs text-muted-foreground">Clear, actionable insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
