import { Card, CardContent } from "@/components/ui/card"
import { Lock, Shield, Eye } from "lucide-react"

const privacyPoints = [
  {
    icon: Lock,
    title: "Your Control",
    description: "Only information you choose to share is visible",
  },
  {
    icon: Shield,
    title: "No ERP Access",
    description: "We don't access any institutional systems",
  },
  {
    icon: Eye,
    title: "No Facial Recognition",
    description: "Your photos stay private and unscanned",
  },
]

export function PrivacySection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Your Privacy Matters</h2>
          <p className="text-lg text-muted-foreground">Built with transparency and your security in mind</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {privacyPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <Card key={index} className="border-2">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="rounded-xl bg-primary/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{point.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{point.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
