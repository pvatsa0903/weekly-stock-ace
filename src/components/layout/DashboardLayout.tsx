import { Header } from "./Header";
import { Info } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showDisclaimer?: boolean;
}

export const DashboardLayout = ({ children, showDisclaimer }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {showDisclaimer && (
            <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-muted/50 border border-border text-[11px] sm:text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>This is not financial advice. All picks and signals are for <strong className="text-foreground">educational purposes only</strong>.</span>
            </div>
          )}
          {children}
        </div>
      </main>
      <footer className="p-4 lg:p-6 text-center text-xs text-muted-foreground border-t border-border">
        This is not financial advice. It's for educational purpose only.
      </footer>
    </div>
  );
};
