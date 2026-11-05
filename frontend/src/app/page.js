import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ValueProps from "@/components/landing/ValueProps";
import Steps from "@/components/landing/Steps";
import VaultShowcase from "@/components/landing/VaultShowcase";
import Circles from "@/components/landing/Circles";
import Rewards from "@/components/landing/Rewards";
import Security from "@/components/landing/Security";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-[#041711] text-[#d2e8dd] antialiased overflow-x-hidden">
      <Header />
      <main className="pt-[72px]">
        <Hero />
        <ValueProps />
        <Steps />
        <VaultShowcase />
        <Circles />
        <Rewards />
        <Security />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
