import Navbar from "@/components/layout/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import DeviceCategoriesSection from "@/components/landing/DeviceCategoriesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import DataProtectionSection from "@/components/landing/DataProtectionSection"
import DeviceLifecycleSection from "@/components/landing/DeviceLifecycleSection"
import ReuseRecyclingSection from "@/components/landing/ReuseRecyclingSection"
import StatsSection from "@/components/landing/StatsSection"
import Footer from "@/components/layout/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-warm-brown-body antialiased flex flex-col selection:bg-terracotta/20 selection:text-warm-brown">
      {/* Sticky Premium Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero with Primary & Secondary CTAs */}
        <HeroSection />

        {/* 2. Device Categories (10 standard categories) */}
        <DeviceCategoriesSection />

        {/* 3. How ReTech Works (4-step editorial process) */}
        <HowItWorksSection />

        {/* 4. Data Protection & NIST SP 800-88 Sanitization */}
        <DataProtectionSection />

        {/* 5. Device Lifecycle & Classification Visualization */}
        <DeviceLifecycleSection />

        {/* 6. Reuse & Responsible Recycling */}
        <ReuseRecyclingSection />

        {/* 7. Platform Statistics (Demo & Sample Metrics) */}
        <StatsSection />
      </main>

      {/* Premium Dark Editorial Footer */}
      <Footer />
    </div>
  )
}

