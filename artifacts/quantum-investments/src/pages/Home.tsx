import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TrustIndicators } from '@/components/TrustIndicators';
import { AboutSection } from '@/components/AboutSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { InvestmentPlans } from '@/components/InvestmentPlans';
import { HowItWorks } from '@/components/HowItWorks';
import { CompanyStats } from '@/components/CompanyStats';
import { Testimonials } from '@/components/Testimonials';
import { FaqSection } from '@/components/FaqSection';
import { SiteFooter } from '@/components/SiteFooter';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      <TrustIndicators />
      <AboutSection />
      <WhyChooseUs />
      <InvestmentPlans />
      <HowItWorks />
      <CompanyStats />
      <Testimonials />
      <FaqSection />
      <SiteFooter />
    </main>
  );
}
