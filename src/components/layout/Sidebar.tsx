import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Table2, LineChart, Settings, TrendingUp, Menu, X, Activity, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/decisions", icon: Table2, label: "Weekly Decisions" },
  { to: "/sentiment", icon: Activity, label: "Sentiment Radar" },
  { to: "/ticker", icon: LineChart, label: "Ticker Detail" },
  { to: "/about", icon: Info, label: "About" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">2-Stock Shortlist</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">2-Stock Shortlist</h1>
              <p className="text-xs text-muted-foreground">Weekly Picks</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn("sidebar-nav-item", isActive && "active")}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground">
              <p>Week of {(() => {
                const now = new Date();
                const day = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
                return monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              })()}</p>
              <p className="mt-1">Updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
