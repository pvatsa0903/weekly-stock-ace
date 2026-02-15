import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto flex-1">
          {children}
        </div>
        <footer className="p-4 lg:p-6 text-center text-xs text-muted-foreground border-t border-border">
          This is not financial advice. It's for educational purpose only.
        </footer>
      </main>
    </div>
  );
};
