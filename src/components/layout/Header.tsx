import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, Radar, Search, BookOpen, TrendingUp, Menu, X, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/signals", icon: Radio, label: "Signals" },
  { to: "/sentiment", icon: Activity, label: "Sentiment" },
  { to: "/ticker", icon: Search, label: "Ticker" },
  { to: "/about", icon: BookOpen, label: "About" },
];

export const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ background: "linear-gradient(135deg, hsl(var(--header-bg)), hsl(var(--header-bg-end)))" }}>
      {/* Top accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[hsl(var(--header-accent))] via-[hsl(152,69%,60%)] to-transparent" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--header-accent))] to-[hsl(152,69%,35%)] flex items-center justify-center shadow-lg shadow-[hsl(var(--header-accent))]/20 group-hover:shadow-[hsl(var(--header-accent))]/40 transition-shadow">
              <TrendingUp className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight">StockPulse</span>
              <span className="text-[10px] text-white/40 leading-tight hidden sm:block">AI-Powered Picks</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/[0.12] text-white shadow-sm backdrop-blur-sm"
                      : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "text-[hsl(var(--header-accent))]")} />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[hsl(var(--header-accent))]" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-[58px] bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden absolute top-[58px] left-0 right-0 border-t border-white/5 shadow-2xl z-50" style={{ background: "linear-gradient(180deg, hsl(var(--header-bg)), hsl(var(--header-bg-end)))" }}>
            <nav className="max-w-7xl mx-auto px-3 py-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.12] text-white"
                        : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-[hsl(var(--header-accent))]" : "")} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};
