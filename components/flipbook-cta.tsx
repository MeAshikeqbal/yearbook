import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function FlipbookCTA() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-20">
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-secondary to-secondary/80 border-0 overflow-hidden relative">
        <CardContent className="pt-12 pb-12 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            New Feature
          </div>

          <h3 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
            Experience it like a real yearbook
          </h3>

          <p className="text-lg text-secondary-foreground/80 max-w-xl mx-auto">
            Turn pages, relive memories, and explore profiles in our immersive flipbook view
          </p>

          <Button
            variant="secondary"
            size="lg"
            className="h-14 px-8 text-lg bg-background hover:bg-background/90"
            asChild
          >
            <Link href="/flipbook-preview">View Flipbook Preview</Link>
          </Button>
        </CardContent>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      </Card>
    </section>
  )
}
