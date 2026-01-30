import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};
