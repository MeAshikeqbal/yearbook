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

export function FeaturesSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What You Can Do Here</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to create lasting memories with your classmates
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
