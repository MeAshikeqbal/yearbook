import { Header } from "@/components/header"
import { HeroSection } from "@/components/home/hero-section"
import { Footer } from "@/components/footer"

/**
 * Top-level home page component that composes header, main minimalist content sections, and footer.
 *
 * Renders Header, a <main> element containing HeroSection, followed by Footer.
 *
 * @returns The page's JSX element containing the header, main content sections, and footer.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  )
}