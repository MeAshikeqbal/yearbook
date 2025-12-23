import { Header } from "@/components/header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { WhoItsFor } from "@/components/home/who-its-for"
import { FlipbookCTA } from "@/components/flipbook-cta"
import { PrivacySection } from "@/components/home/privacy-section"
import { Footer } from "@/components/footer"

/**
 * Top-level home page component that composes header, main content sections, and footer.
 *
 * Renders Header, a <main> element containing HeroSection, FeaturesSection, WhoItsFor, FlipbookCTA,
 * and PrivacySection, followed by Footer.
 *
 * @returns The page's JSX element containing the header, main content sections, and footer.
 */
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