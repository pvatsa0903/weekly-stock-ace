import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-gold" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Picks <span className="text-gradient-gold">Every Sunday</span>
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join 5,000+ investors who receive our weekly stock picks straight to their inbox. No spam, just alpha.
            </p>

            {isSubmitted ? (
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gain/10 border border-gain/20">
                <Check className="w-5 h-5 text-gain" />
                <span className="text-gain font-medium">You're in! Check your inbox for confirmation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  required
                />
                <Button type="submit" variant="gold" size="lg" className="h-12">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Free forever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
