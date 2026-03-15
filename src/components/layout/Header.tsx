import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, Search, BookOpen, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/signals", icon: Radio, label: "Signals" },
  { to: "/sentiment", icon: Activity, label: "Sentiments" },
  { to: "/ticker", icon: Search, label: "Ticker" },
  { to: "/about", icon: BookOpen, label: "About" },
];

export const Header = () => {
  const location = useLocation();

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

          {/* Desktop Nav — labels + icons */}
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

          {/* Mobile Nav — icon-only, always visible */}
          <nav className="flex md:hidden items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/[0.12] text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                  )}
                  title={item.label}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-[hsl(var(--header-accent))]")} />
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[hsl(var(--header-accent))]" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
