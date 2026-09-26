import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { CapabilityStrip } from "@/components/capability-strip";
import { StatsSection } from "@/components/stats-section";
import { Workflow } from "@/components/workflow";
import { EvidenceSection } from "@/components/evidence-section";
import { UseCases } from "@/components/use-cases";
import { ProductPreview } from "@/components/product-preview";
import { Features } from "@/components/features";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 1. Hero */}
        <Hero />
        {/* 2. Capabilities / trust strip */}
        <CapabilityStrip />
        {/* 3. Stats / system capabilities */}
        <StatsSection />
        {/* 4. How It Works */}
        <Workflow />
        {/* 5. More Than a Prediction / A Forensic Explanation */}
        <EvidenceSection />
        {/* 6. Trusted Across Domains */}
        <UseCases />
        {/* 7. See PIXENTRA in Action */}
        <ProductPreview />
        {/* 8. Remaining features */}
        <Features />
        {/* 9. Final CTA */}
        <CTA />
      </main>
      <Footer />
    </>
  );
}
