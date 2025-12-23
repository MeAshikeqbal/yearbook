import { Card, CardContent } from "@/components/ui/card"
import { Camera, Edit3, BookOpen } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Share Memories",
    description: "Upload photos and moments from your college journey. Create a visual story of your time together.",
  },
  {
    icon: Edit3,
    title: "Sign Yearbooks",
    description: "Leave heartfelt messages on your friends' profiles. Connect and celebrate friendships.",
  },
  {
    icon: BookOpen,
    title: "Relive It All",
    description: "Browse profiles or experience the full yearbook in an interactive flipbook format.",
  },
]

/**
 * Render the features section with a header, subtitle, and a responsive grid of feature cards.
 *
 * Each card displays an icon, title, and description and adapts across breakpoints from two to three columns.
 *
 * @returns A JSX element containing the section with header, subtitle, and responsive grid of feature cards.
 */
export function FeaturesSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20 lg:py-28">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 px-4">
          What You Can Do Here
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Everything you need to create lasting memories with your classmates
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg group"
            >
              <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 text-center space-y-3 md:space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-primary/10 p-3 md:p-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}