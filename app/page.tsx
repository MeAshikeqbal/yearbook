import { Header } from "@/components/header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { WhoItsFor } from "@/components/home/who-its-for"
import { FlipbookCTA } from "@/components/flipbook-cta"
import { PrivacySection } from "@/components/home/privacy-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhoItsFor />
        <FlipbookCTA />
        <PrivacySection />
      </main>
      <Footer />
    </>
  )
}
