import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <footer className="p-4 lg:p-6 text-center text-xs text-muted-foreground border-t border-border">
        This is not financial advice. It's for educational purpose only.
      </footer>
    </div>
  );
};
