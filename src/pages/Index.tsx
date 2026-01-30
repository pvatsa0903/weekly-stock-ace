import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WeeklyPicks } from "@/components/WeeklyPicks";
import { PastPicks } from "@/components/PastPicks";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <WeeklyPicks />
        <PastPicks />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
