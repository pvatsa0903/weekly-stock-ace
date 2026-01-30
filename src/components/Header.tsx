import { TrendingUp, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">Shortlist</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#picks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              This Week
            </a>
            <a href="#track-record" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Track Record
            </a>
            <a href="#methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Methodology
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Button variant="gold" size="sm">
              Subscribe Free
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-2">
              <a href="#picks" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                This Week
              </a>
              <a href="#track-record" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Track Record
              </a>
              <a href="#methodology" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Methodology
              </a>
              <div className="pt-2">
                <Button variant="gold" className="w-full">
                  Subscribe Free
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
