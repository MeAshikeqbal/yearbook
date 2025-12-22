import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-block">
            <span className="inline-block bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🎓 Class of 2026
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance">
            Our Yearbook,
            <br />
            <span className="text-primary">Our Story</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            A student-run digital yearbook to capture memories, people, and the moments that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" className="text-lg h-14 px-8" asChild>
              <Link href="/join">Join the Yearbook</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 bg-background" asChild>
              <Link href="/browse">Browse Profiles</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
    </section>
  )
}
