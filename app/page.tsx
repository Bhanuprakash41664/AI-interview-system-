import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from "@/components/landing/landing-sections";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
