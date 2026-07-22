import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TrustIndicators } from '@/components/TrustIndicators';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      <TrustIndicators />
    </main>
  );
}
