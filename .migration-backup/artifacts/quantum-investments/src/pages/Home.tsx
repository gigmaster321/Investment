import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TrustIndicators } from '@/components/TrustIndicators';
import { InvestmentPlans } from '@/components/InvestmentPlans';
import { AboutSection } from '@/components/AboutSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { HowItWorks } from '@/components/HowItWorks';
import { CompanyStats } from '@/components/CompanyStats';
import { Testimonials } from '@/components/Testimonials';
import { FaqSection } from '@/components/FaqSection';
import { CtaSection } from '@/components/CtaSection';
import { SiteFooter } from '@/components/SiteFooter';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      <TrustIndicators />
      <InvestmentPlans />
      <AboutSection />
      <WhyChooseUs />
      <HowItWorks />
      <CompanyStats />
      <Testimonials />
      <FaqSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}