import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Render the hero section for the yearbook landing area.
 *
 * Includes a badge for "Class of 2026", a prominent title with a colored emphasis on "Our Story",
 * a descriptive paragraph, primary action buttons linking to `/join` and `/browse`, and decorative
 * background elements which are hidden on small screens.
 *
 * @returns The JSX element representing the hero section markup.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-background via-primary/5 to-accent/10 min-h-svh">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-6 md:space-y-8">
          <div className="inline-block">
            <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              🎓 Class of 2026
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-balance leading-tight">
            Our Yearbook,
            <br />
            <span className="text-primary">Our Story</span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed px-4">
            A student-run digital yearbook to capture memories, people, and the moments that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 md:pt-6 px-4">
            <Button size="lg" className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto" asChild>
              <Link href="/join">Join the Yearbook</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto bg-background"
              asChild
            >
              <Link href="/browse">Browse Profiles</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
      <div className="hidden md:block absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
    </section>
  )
}